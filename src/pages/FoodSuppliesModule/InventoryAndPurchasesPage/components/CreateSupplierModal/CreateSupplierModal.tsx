import React, { useRef, useState } from 'react';
import styles from '../CreateProductModal/CreateProductModal.module.css';
import { X, WifiOff, Check, Trash2 } from 'lucide-react';
import { useFarmScope } from '../../../../../context/FarmScopeContext';
import { useFormExitGuard } from '../../../../../context/FormExitGuardContext';
import { queueHatoWrite } from '../../../../../services/hatoDataService';
import useNotification from '../../../../../hooks/useNotification';

interface CreateSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  /** Si se informa, el modal edita el proveedor en lugar de crear uno nuevo. */
  supplier?: Record<string, unknown> | null;
}

function textValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export const CreateSupplierModal: React.FC<CreateSupplierModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  supplier,
}) => {
  const { scope } = useFarmScope();
  const { markCurrentFormsSaved } = useFormExitGuard();
  const { showNotification } = useNotification();
  const formRef = useRef<HTMLFormElement>(null);
  const isEdit = Boolean(supplier?.id);
  const [name, setName] = useState(textValue(supplier?.name));
  const [contactName, setContactName] = useState(textValue(supplier?.contact_name));
  const [taxId, setTaxId] = useState(textValue(supplier?.tax_id));
  const [phone, setPhone] = useState(textValue(supplier?.phone));
  const [email, setEmail] = useState(textValue(supplier?.email));
  const [address, setAddress] = useState(textValue(supplier?.address));
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    if (!scope) {
      setSubmitError('No hay una finca autorizada seleccionada.');
      return;
    }
    setIsSaving(true);
    setSubmitError(null);
    try {
      const payload = {
        name: name.trim(),
        contact_name: contactName.trim(),
        tax_id: taxId.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
      };
      const result = isEdit
        ? await queueHatoWrite(scope, 'suppliers', 'UPDATE', payload, String(supplier?.id))
        : await queueHatoWrite(scope, 'suppliers', 'CREATE', {
          organization_id: scope.organizationId,
          ...payload,
        });
      markCurrentFormsSaved(formElement);
      showNotification({
        type: result.pending ? 'alert' : 'success',
        title: result.pending
          ? `Proveedor ${isEdit ? 'actualizado' : 'registrado'} pendiente de sincronización`
          : `Proveedor ${isEdit ? 'actualizado' : 'registrado'}`,
        message: result.lastError ?? (result.pending
          ? 'El proveedor quedó guardado localmente y se sincronizará al recuperar la conexión.'
          : 'El proveedor se guardó correctamente.'),
      });
      onSuccess?.();
      onClose();
    } catch (cause) {
      const message = cause instanceof Error
        ? cause.message
        : `No se pudo ${isEdit ? 'actualizar' : 'registrar'} el proveedor.`;
      setSubmitError(message);
      showNotification({ type: 'error', title: 'No se pudo guardar', message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!scope || !supplier?.id) return;
    setIsDeleting(true);
    setSubmitError(null);
    try {
      const result = await queueHatoWrite(scope, 'suppliers', 'DELETE', {}, String(supplier.id));
      markCurrentFormsSaved(formRef.current ?? undefined);
      showNotification({
        type: result.pending ? 'alert' : 'success',
        title: result.pending ? 'Proveedor eliminado pendiente de sincronización' : 'Proveedor eliminado',
        message: result.lastError ?? (result.pending
          ? 'La eliminación se enviará al recuperar la conexión.'
          : 'El proveedor se eliminó correctamente.'),
      });
      onSuccess?.();
      onClose();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'No se pudo eliminar el proveedor.';
      setSubmitError(message);
      showNotification({ type: 'error', title: 'No se pudo eliminar', message });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <span className={styles.dbLabel}>SUPPLIERS · CATÁLOGO</span>
            <h2 className={styles.title}>{isEdit ? 'Editar proveedor' : 'Nuevo proveedor'}</h2>
            <p className={styles.subtitle}>
              {isEdit
                ? 'Actualiza los datos de contacto del proveedor.'
                : 'Registra los datos de contacto del proveedor.'}
            </p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className={styles.body}>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className={styles.label}>Nombre</label>
              <input
                type="text"
                placeholder="Nombre o razón social"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>Contacto</label>
              <input
                type="text"
                placeholder="Nombre del contacto"
                className={styles.input}
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>RUC / Identificación</label>
              <input
                type="text"
                className={styles.input}
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>Teléfono</label>
              <input
                type="tel"
                className={styles.input}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>Correo electrónico</label>
              <input
                type="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>Dirección</label>
              <input
                type="text"
                className={styles.input}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.offlineBanner}>
            <WifiOff size={18} className={styles.offlineIcon} />
            <div>
              <div className={styles.offlineTitle}>Disponible sin conexión</div>
              <div className={styles.offlineSubtitle}>
                Si no hay señal, se guardará en la cola local de sincronización.
              </div>
            </div>
          </div>

          {confirmDelete && (
            <div className={styles.deleteWarning}>
              <Trash2 size={18} className={styles.deleteWarningIcon} />
              <div>
                <div className={styles.deleteWarningTitle}>¿Eliminar este proveedor?</div>
                <div className={styles.deleteWarningSubtitle}>
                  Se quitará de la organización. Esta acción no se puede deshacer.
                </div>
              </div>
            </div>
          )}

          {submitError && <p role="alert" className="text-danger">{submitError}</p>}

          <div className={styles.footer}>
            <div className={styles.footerStart}>
              {isEdit && (confirmDelete ? (
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setConfirmDelete(false)}
                    disabled={isDeleting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className={styles.dangerBtn}
                    onClick={handleDelete}
                    disabled={isDeleting || !scope}
                  >
                    <Trash2 size={16} />
                    <span>{isDeleting ? 'Eliminando…' : 'Sí, eliminar'}</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.dangerOutlineBtn}
                  onClick={() => setConfirmDelete(true)}
                  disabled={isSaving}
                >
                  <Trash2 size={16} />
                  <span>Eliminar</span>
                </button>
              ))}
            </div>
            <div className="d-flex gap-2">
              <button type="button" className={styles.cancelBtn} onClick={onClose}>
                Cerrar
              </button>
              <button type="submit" className={styles.saveBtn} disabled={isSaving || isDeleting}>
                {isEdit && <Check size={18} />}
                <span>{isSaving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Guardar proveedor'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSupplierModal;
