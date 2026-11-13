import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useBlocker, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import styles from './FormExitGuardContext.module.css';

type FieldValue = string | string[];

interface DraftField {
  value: FieldValue;
  checked?: boolean;
}

interface TrackedForm {
  key: string;
  storageKey: string;
  element: HTMLElement;
  baseline: Record<string, DraftField>;
  current: Record<string, DraftField>;
  dirty: boolean;
  restoredFieldKeys: Set<string>;
}

interface StoredDraft {
  fields: Record<string, DraftField>;
}

interface PendingFormExit {
  formKey: string;
  target: HTMLElement;
}

interface FormExitGuardValue {
  markCurrentFormsSaved: (root?: Element) => void;
}

const FormExitGuardContext = createContext<FormExitGuardValue | null>(null);
const STORAGE_PREFIX = 'pala-vaca:form-draft:';

function isEditableControl(element: Element): element is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
  if (element instanceof HTMLInputElement) {
    return !element.disabled
      && !element.readOnly
      && !['button', 'submit', 'reset', 'hidden', 'password', 'file'].includes(element.type);
  }
  return (element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement)
    && !element.disabled
    && !(element instanceof HTMLTextAreaElement && element.readOnly);
}

function controlsFor(root: HTMLElement): Array<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {
  return Array.from(root.querySelectorAll('input, textarea, select')).filter(isEditableControl);
}

function fieldKey(
  control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  index: number,
  root?: HTMLElement,
): string {
  const step = control.closest<HTMLElement>('[data-draft-step]');
  const stepIndex = step ? controlsFor(step).indexOf(control) : index;
  const field = control.dataset.draftField || control.name || control.id || `field-${stepIndex}`;
  const stepPrefix = step && root?.contains(step) ? `${step.dataset.draftStep}:` : '';
  return `${stepPrefix}${field}:${stepIndex}`;
}

function readControl(control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): DraftField {
  if (control instanceof HTMLInputElement && ['checkbox', 'radio'].includes(control.type)) {
    return { value: control.value, checked: control.checked };
  }
  if (control instanceof HTMLSelectElement && control.multiple) {
    return { value: Array.from(control.selectedOptions, (option) => option.value) };
  }
  return { value: control.value };
}

function readForm(root: HTMLElement): Record<string, DraftField> {
  return Object.fromEntries(controlsFor(root).map((control, index) => [
    fieldKey(control, index, root),
    readControl(control),
  ]));
}

function valuesEqual(left: Record<string, DraftField>, right: Record<string, DraftField>): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function restoreDraftFields(
  tracked: TrackedForm,
  root: HTMLElement,
  fields: Record<string, DraftField>,
  restoring: Set<string>,
): void {
  const pendingFields = controlsFor(root).flatMap((control, index) => {
    const key = fieldKey(control, index, root);
    const saved = fields[key];
    return saved && !tracked.restoredFieldKeys.has(key) ? [{ control, key, saved }] : [];
  });
  if (pendingFields.length === 0) return;

  restoring.add(tracked.key);
  pendingFields.forEach(({ control, key, saved }) => {
    tracked.restoredFieldKeys.add(key);
    setControlValue(control, saved);
  });
  queueMicrotask(() => restoring.delete(tracked.key));
}

function setControlValue(
  control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  field: DraftField,
): void {
  if (control instanceof HTMLInputElement && ['checkbox', 'radio'].includes(control.type)) {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'checked')?.set;
    setter?.call(control, Boolean(field.checked));
    control.dispatchEvent(new Event('change', { bubbles: true }));
    return;
  }
  if (control instanceof HTMLSelectElement && control.multiple && Array.isArray(field.value)) {
    Array.from(control.options).forEach((option) => {
      option.selected = field.value.includes(option.value);
    });
    control.dispatchEvent(new Event('change', { bubbles: true }));
    return;
  }

  const prototype = control instanceof HTMLInputElement
    ? HTMLInputElement.prototype
    : control instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLSelectElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, 'value')?.set?.call(control, String(field.value));
  control.dispatchEvent(new Event('input', { bubbles: true }));
  control.dispatchEvent(new Event('change', { bubbles: true }));
}

function canGuardPath(pathname: string): boolean {
  return !['/', '/login', '/register', '/forgot-password'].includes(pathname);
}

function FormExitGuardModal({
  onStay,
  onSave,
  onDiscard,
  error,
}: {
  onStay: () => void;
  onSave: () => void;
  onDiscard: () => void;
  error: string | null;
}) {
  return (
    <div className={styles.overlay}>
      <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="form-exit-title">
        <div className={styles.icon} aria-hidden="true">!</div>
        <span className={styles.kicker}>CAMBIOS SIN GUARDAR</span>
        <h2 id="form-exit-title" className={styles.title}>¿Quieres guardar el progreso?</h2>
        <p className={styles.message}>
          Puedes guardar un borrador en este dispositivo para continuar después, salir descartando los cambios o seguir editando.
        </p>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <div className={styles.actions}>
          <button type="button" className={styles.stayButton} onClick={onStay}>
            Seguir editando
          </button>
          <button type="button" className={styles.discardButton} onClick={onDiscard}>
            Salir sin guardar
          </button>
          <button type="button" className={styles.saveButton} onClick={onSave}>
            Guardar borrador y salir
          </button>
        </div>
      </section>
    </div>
  );
}

export function FormExitGuardProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { user } = useAuth();
  const formsRef = useRef(new Map<string, TrackedForm>());
  const restoredFormsRef = useRef(new Set<string>());
  const restoringRef = useRef(new Set<string>());
  const [hasDirtyForms, setHasDirtyForms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingFormExit, setPendingFormExit] = useState<PendingFormExit | null>(null);
  const allowModalExitRef = useRef(false);
  const blocker = useBlocker(({ currentLocation, nextLocation }) =>
    Array.from(formsRef.current.values()).some((form) => form.dirty)
    && (
      currentLocation.pathname !== nextLocation.pathname
      || currentLocation.search !== nextLocation.search
      || currentLocation.hash !== nextLocation.hash
    )
    && canGuardPath(currentLocation.pathname),
  );
  const userKey = user?.id ?? 'anonymous';

  const publish = useCallback(() => {
    setHasDirtyForms(Array.from(formsRef.current.values()).some((form) => form.dirty));
  }, []);

  const getRootKey = useCallback((root: HTMLElement): string => {
    if (root.dataset.unsavedForm) return `${location.pathname}:${root.dataset.unsavedForm}`;
    if (root.id) return `${location.pathname}:${root.id}`;
    const forms = Array.from(document.querySelectorAll('form'));
    const index = forms.indexOf(root as HTMLFormElement);
    return `${location.pathname}:form-${index >= 0 ? index : 0}`;
  }, [location.pathname]);

  const ensureTracked = useCallback((root: HTMLElement): TrackedForm => {
    const key = getRootKey(root);
    const existing = formsRef.current.get(key);
    if (existing) {
      const elementChanged = existing.element !== root;
      if (elementChanged) {
        existing.element = root;
        existing.restoredFieldKeys.clear();
        const fields = readForm(root);
        if (!existing.dirty) {
          existing.baseline = fields;
          existing.current = fields;
        }
      }
      existing.element = root;
      const hasUnrestoredFields = elementChanged || controlsFor(root).some((control, index) =>
        !existing.restoredFieldKeys.has(fieldKey(control, index, root)),
      );
      if (hasUnrestoredFields) {
        try {
          const stored = localStorage.getItem(existing.storageKey);
          if (stored) {
            const draft = JSON.parse(stored) as StoredDraft;
            if (elementChanged) {
              existing.baseline = { ...readForm(root), ...draft.fields };
              existing.current = { ...existing.baseline };
            }
            restoreDraftFields(existing, root, draft.fields, restoringRef.current);
          }
        } catch {
          setError('No se pudo restaurar el borrador guardado en este dispositivo.');
        }
      }
      return existing;
    }

    const storageKey = `${STORAGE_PREFIX}${userKey}:${key}`;
    const fields = readForm(root);
    const tracked: TrackedForm = {
      key,
      storageKey,
      element: root,
      baseline: fields,
      current: fields,
      dirty: false,
      restoredFieldKeys: new Set<string>(),
    };
    formsRef.current.set(key, tracked);

    if (!restoredFormsRef.current.has(key)) {
      restoredFormsRef.current.add(key);
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const draft = JSON.parse(stored) as StoredDraft;
          tracked.baseline = { ...fields, ...draft.fields };
          tracked.current = { ...tracked.baseline };
          restoreDraftFields(tracked, root, draft.fields, restoringRef.current);
        }
      } catch {
        setError('No se pudo restaurar el borrador guardado en este dispositivo.');
      }
    }
    return tracked;
  }, [getRootKey, userKey]);

  const scanForms = useCallback(() => {
    if (!canGuardPath(location.pathname)) return;
    document.querySelectorAll<HTMLElement>('form, [data-unsaved-form]').forEach((root) => {
      if (root.closest('[data-unsaved-form]') !== root && root.matches('form')) return;
      ensureTracked(root);
    });
  }, [ensureTracked, location.pathname]);

  useEffect(() => {
    formsRef.current.clear();
    restoredFormsRef.current.clear();
    restoringRef.current.clear();
    const handleChange = (event: Event) => {
      if (!(event.target instanceof Element) || !isEditableControl(event.target)) return;
      const root = event.target.closest<HTMLElement>('[data-unsaved-form], form');
      if (!root || !canGuardPath(location.pathname)) return;
      const form = ensureTracked(root);
      form.current = { ...form.current, ...readForm(root) };
      form.dirty = !valuesEqual(form.baseline, form.current);
      if (!restoringRef.current.has(form.key)) publish();
    };

    const handleModalExit = (event: MouseEvent) => {
      if (allowModalExitRef.current) {
        allowModalExitRef.current = false;
        return;
      }
      if (!(event.target instanceof Element)) return;
      const eventTarget = event.target;
      const closeButton = eventTarget.closest('button');
      const buttonClasses = typeof closeButton?.className === 'string'
        ? closeButton.className.toLowerCase()
        : '';
      const isCloseButton = buttonClasses.includes('close') || buttonClasses.includes('cancel');
      const overlay = eventTarget.closest<HTMLElement>('[class*="overlay" i], [class*="backdrop" i]');
      if (!overlay || (eventTarget !== overlay && !isCloseButton)) return;
      const form = overlay.querySelector<HTMLFormElement>('form');
      if (!form) return;
      const tracked = ensureTracked(form);
      if (!tracked.dirty) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      setError(null);
      setPendingFormExit({
        formKey: tracked.key,
        target: closeButton ?? eventTarget as HTMLElement,
      });
    };

    document.addEventListener('input', handleChange, true);
    document.addEventListener('change', handleChange, true);
    document.addEventListener('click', handleModalExit, true);
    scanForms();
    const observer = new MutationObserver(scanForms);
    observer.observe(document.body, { childList: true, subtree: true });
    queueMicrotask(() => setHasDirtyForms(
      Array.from(formsRef.current.values()).some((form) => form.dirty),
    ));
    return () => {
      observer.disconnect();
      document.removeEventListener('input', handleChange, true);
      document.removeEventListener('change', handleChange, true);
      document.removeEventListener('click', handleModalExit, true);
    };
  }, [ensureTracked, location.pathname, publish, scanForms]);

  useEffect(() => {
    if (!hasDirtyForms) return undefined;
    const preventUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', preventUnload);
    return () => window.removeEventListener('beforeunload', preventUnload);
  }, [hasDirtyForms]);

  const saveAndLeave = () => {
    try {
      const formsToSave = pendingFormExit
        ? [formsRef.current.get(pendingFormExit.formKey)].filter((form): form is TrackedForm => Boolean(form))
        : Array.from(formsRef.current.values()).filter((form) => form.dirty);
      for (const form of formsToSave) {
        const fields = readForm(form.element);
        form.current = { ...form.current, ...fields };
        localStorage.setItem(form.storageKey, JSON.stringify({ fields: form.current } satisfies StoredDraft));
        form.baseline = form.current;
        form.dirty = false;
      }
      publish();
      setError(null);
      if (blocker.state === 'blocked') {
        blocker.proceed?.();
      } else if (pendingFormExit) {
        allowModalExitRef.current = true;
        setPendingFormExit(null);
        pendingFormExit.target.click();
      }
    } catch {
      setError('No se pudo guardar el borrador. Libera espacio en el dispositivo e inténtalo de nuevo.');
    }
  };

  const discardAndLeave = () => {
    try {
      const formsToDiscard = pendingFormExit
        ? [formsRef.current.get(pendingFormExit.formKey)].filter((form): form is TrackedForm => Boolean(form))
        : Array.from(formsRef.current.values());
      for (const form of formsToDiscard) {
        localStorage.removeItem(form.storageKey);
        form.dirty = false;
      }
      publish();
      setError(null);
      if (blocker.state === 'blocked') {
        blocker.proceed?.();
      } else if (pendingFormExit) {
        allowModalExitRef.current = true;
        setPendingFormExit(null);
        pendingFormExit.target.click();
      }
    } catch {
      setError('No se pudo eliminar el borrador local.');
    }
  };

  const markCurrentFormsSaved = useCallback((root?: Element) => {
    for (const form of formsRef.current.values()) {
      if (root && root !== form.element && !root.contains(form.element) && !form.element.contains(root)) {
        continue;
      }
      localStorage.removeItem(form.storageKey);
      form.baseline = readForm(form.element);
      form.current = form.baseline;
      form.dirty = false;
    }
    publish();
  }, [publish]);

  const contextValue = useMemo(() => ({ markCurrentFormsSaved }), [markCurrentFormsSaved]);
  return (
    <FormExitGuardContext.Provider value={contextValue}>
      {children}
      {(blocker.state === 'blocked' || pendingFormExit) && (
        <FormExitGuardModal
          onStay={() => {
            setError(null);
            setPendingFormExit(null);
            if (blocker.state === 'blocked') blocker.reset?.();
          }}
          onSave={saveAndLeave}
          onDiscard={discardAndLeave}
          error={error}
        />
      )}
    </FormExitGuardContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFormExitGuard(): FormExitGuardValue {
  const context = useContext(FormExitGuardContext);
  if (!context) throw new Error('useFormExitGuard debe usarse dentro de FormExitGuardProvider');
  return context;
}
