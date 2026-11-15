import React, { useRef, useState } from 'react';
import styles from '../../../../FoodSuppliesModule/InventoryAndPurchasesPage/components/CreateProductModal/CreateProductModal.module.css';
import { X, WifiOff, Check, Trash2 } from 'lucide-react';
import { useFarmScope } from '../../../../../context/FarmScopeContext';
import { useFormExitGuard } from '../../../../../context/FormExitGuardContext';
import { queueHatoWrite } from '../../../../../services/hatoDataService';
import useNotification from '../../../../../hooks/useNotification';

interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  /** Si se informa, el modal edita el cliente en lugar de crear uno nuevo. */
  customer?: Record<string, unknown> | null;
}

function textValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export const CreateCustomerModal: React.FC<CreateCustomerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  customer,
}) => {
  const { scope } = useFarmScope();
  const { markCurrentFormsSaved } = useFormExitGuard();
  const { showNotification } = useNotification();
  const formRef = useRef<HTMLFormElement>(null);
  const isEdit = Boolean(customer?.id);
  const [name, setName] = useState(textValue(customer?.name));
  const [taxId, setTaxId] = useState(textValue(customer?.tax_id));
  const [phone, setPhone] = useState(textValue(customer?.phone));
  const [email, setEmail] = useState(textValue(customer?.email));
  const [address, setAddress] = useState(textValue(customer?.address));
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
        tax_id: taxId.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
      };
      const result = isEdit
        ? await queueHatoWrite(scope, 'customers', 'UPDATE', payload, String(customer?.id))
        : await queueHatoWrite(scope, 'customers', 'CREATE', {
          organization_id: scope.organizationId,
          ...payload,
        });
      markCurrentFormsSaved(formElement);
      showNotification({
        type: result.pending ? 'alert' : 'success',
        title: result.pending
          ? `Cliente ${isEdit ? 'actualizado' : 'registrado'} pendiente de sincronización`
          : `Cliente ${isEdit ? 'actualizado' : 'registrado'}`,
        message: result.lastError ?? (result.pending
          ? 'El cliente quedó guardado localmente y se sincronizará al recuperar la conexión.'
          : 'El cliente se guardó correctamente.'),
      });
      onSuccess?.();
      onClose();
    } catch (cause) {
      const message = cause instanceof Error
        ? cause.message
        : `No se pudo ${isEdit ? 'actualizar' : 'registrar'} el cliente.`;
      setSubmitError(message);
      showNotification({ type: 'error', title: 'No se pudo guardar', message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!scope || !customer?.id) return;
    setIsDeleting(true);
    setSubmitError(null);
    try {
      const result = await queueHatoWrite(scope, 'customers', 'DELETE', {}, String(customer.id));
      markCurrentFormsSaved(formRef.current ?? undefined);
      showNotification({
        type: result.pending ? 'alert' : 'success',
        title: result.pending ? 'Cliente eliminado pendiente de sincronización' : 'Cliente eliminado',
        message: result.lastError ?? (result.pending
          ? 'La eliminación se enviará al recuperar la conexión.'
          : 'El cliente se eliminó correctamente.'),
      });
      onSuccess?.();
      onClose();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'No se pudo eliminar el cliente.';
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
            <span className={styles.dbLabel}>CUSTOMERS · CATÁLOGO</span>
            <h2 className={styles.title}>{isEdit ? 'Editar cliente' : 'Nuevo cliente'}</h2>
            <p className={styles.subtitle}>
              {isEdit
                ? 'Actualiza los datos de contacto del cliente.'
                : 'Registra los datos de contacto del cliente.'}
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

            <div className="col-12">
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
                <div className={styles.deleteWarningTitle}>¿Eliminar este cliente?</div>
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
                <span>{isSaving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Guardar cliente'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCustomerModal;
