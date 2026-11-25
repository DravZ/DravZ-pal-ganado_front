import { useMemo, useState } from 'react';
import { ExternalLink, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from '../Step3LocationGenealogy/Step3LocationGenealogy.module.css';
import { useFarmScope } from '../../../../../context/FarmScopeContext';
import useNotification from '../../../../../hooks/useNotification';
import { queueHatoWrite } from '../../../../../services/hatoDataService';

export interface LotOption {
  id: string;
  name: string;
  currentPaddockId: string;
}

interface FarmLocationFieldsProps {
  lotId: string;
  paddockId: string;
  onLotChange: (id: string) => void;
  onPaddockChange: (id: string) => void;
  lots: LotOption[];
  lotsLoading: boolean;
  lotsError: string | null;
  paddocks: { id: string; name: string }[];
  paddocksLoading: boolean;
  paddocksError: string | null;
}

/**
 * Ubicación del animal dentro de la finca.
 *
 * El flujo es finca → potrero → lote: primero se elige el potrero y después el lote, mostrando
 * únicamente los lotes que hoy están en ese potrero. La ubicación efectiva del animal se deriva del
 * potrero actual de su lote, por lo que el potrero aquí solo filtra los lotes disponibles.
 */
export default function FarmLocationFields({
  lotId,
  paddockId,
  onLotChange,
  onPaddockChange,
  lots,
  lotsLoading,
  lotsError,
  paddocks,
  paddocksLoading,
  paddocksError,
}: FarmLocationFieldsProps) {
  const { scope } = useFarmScope();
  const { showNotification } = useNotification();
  const [creatingLot, setCreatingLot] = useState(false);
  const [lotName, setLotName] = useState('');
  const [confirmingLot, setConfirmingLot] = useState(false);
  const [lotError, setLotError] = useState<string | null>(null);
  const [isSavingLot, setIsSavingLot] = useState(false);

  const selectedPaddock = paddocks.find((paddock) => paddock.id === paddockId);
  const lotsInPaddock = useMemo(
    () => (paddockId ? lots.filter((lot) => lot.currentPaddockId === paddockId) : []),
    [lots, paddockId],
  );

  const handlePaddockChange = (nextPaddockId: string) => {
    onPaddockChange(nextPaddockId);
    // Si el lote elegido no pertenece al potrero nuevo, se limpia para no dejar una ubicación
    // inconsistente (un lote solo puede estar en un potrero a la vez).
    const currentLot = lots.find((lot) => lot.id === lotId);
    if (currentLot && currentLot.currentPaddockId !== nextPaddockId) {
      onLotChange('');
    }
    setCreatingLot(false);
    setConfirmingLot(false);
    setLotError(null);
  };

  const resetCreateLot = () => {
    setCreatingLot(false);
    setConfirmingLot(false);
    setLotName('');
    setLotError(null);
  };

  const handleCreateLot = async () => {
    if (!scope) {
      setLotError('Selecciona una finca autorizada antes de crear un lote.');
      return;
    }
    if (!paddockId) {
      setLotError('Selecciona el potrero donde quedará el lote.');
      return;
    }
    if (!lotName.trim()) {
      setLotError('Escribe un nombre para el lote.');
      return;
    }

    setIsSavingLot(true);
    setLotError(null);
    try {
      const result = await queueHatoWrite(scope, 'lots', 'CREATE', {
        farm_id: scope.farmId,
        name: lotName.trim(),
        current_paddock_id: paddockId,
        status: 'active',
      });
      onLotChange(result.recordId);
      resetCreateLot();
      showNotification({
        type: result.pending ? 'alert' : 'success',
        title: result.pending ? 'Lote guardado para sincronizar' : 'Lote creado',
        message: result.pending
          ? 'El lote está disponible localmente y se sincronizará al recuperar la conexión.'
          : 'El lote se creó en el potrero y quedó seleccionado para el animal.',
      });
    } catch (cause: unknown) {
      const message = cause instanceof Error ? cause.message : 'No se pudo crear el lote.';
      setLotError(message);
      showNotification({ type: 'error', title: 'No se pudo crear el lote', message });
    } finally {
      setIsSavingLot(false);
    }
  };

  return (
    <>
      <div className="col-12 col-md-6">
        <label className={styles.formLabel} htmlFor="animal-paddock">Potrero</label>
        <select
          id="animal-paddock"
          className={styles.formControl}
          value={paddockId}
          onChange={(event) => handlePaddockChange(event.target.value)}
        >
          <option value="">Sin potrero asignado</option>
          {paddocks.map((paddock) => (
            <option key={paddock.id} value={paddock.id}>{paddock.name}</option>
          ))}
        </select>
        {paddocksLoading && <div className={styles.fieldHint}>Cargando potreros de esta finca…</div>}
        {paddocksError && <div className={styles.fieldError} role="alert">{paddocksError}</div>}
        {!paddocksLoading && !paddocksError && paddocks.length === 0 && (
          <div className={styles.emptyHint}>
            Aún no hay potreros registrados. Créalo desde Administración &gt; Potreros.
          </div>
        )}
        <Link to="/admin/estructura" className={styles.actionLink}>
          <ExternalLink size={14} className="me-1" />
          Ver y crear potreros
        </Link>
      </div>

      <div className="col-12 col-md-6">
        <label className={styles.formLabel} htmlFor="animal-lot">Lote</label>
        <select
          id="animal-lot"
          className={styles.formControl}
          value={lotId}
          disabled={!paddockId}
          onChange={(event) => onLotChange(event.target.value)}
        >
          <option value="">Sin lote asignado</option>
          {lotsInPaddock.map((lot) => <option key={lot.id} value={lot.id}>{lot.name}</option>)}
        </select>
        {!paddockId && (
          <div className={styles.fieldHint}>Elige un potrero para ver los lotes que están en él.</div>
        )}
        {paddockId && lotsLoading && <div className={styles.fieldHint}>Cargando lotes de esta finca…</div>}
        {paddockId && lotsError && <div className={styles.fieldError} role="alert">{lotsError}</div>}
        {paddockId && !lotsLoading && !lotsError && lotsInPaddock.length === 0 && (
          <div className={styles.emptyHint}>Este potrero aún no tiene lotes. Crea uno aquí mismo.</div>
        )}

        {paddockId && !confirmingLot && (
          <button
            type="button"
            className={styles.actionLink}
            onClick={() => {
              setCreatingLot((visible) => !visible);
              setLotError(null);
            }}
          >
            <Plus size={14} className="me-1" />
            {creatingLot ? 'Cancelar nuevo lote' : 'Crear lote en este potrero'}
          </button>
        )}

        {creatingLot && !confirmingLot && (
          <div className={styles.inlineCreateForm}>
            <input
              type="text"
              className={styles.inlineCreateInput}
              value={lotName}
              onChange={(event) => setLotName(event.target.value)}
              placeholder="Nombre del lote"
              aria-label="Nombre del nuevo lote"
              maxLength={150}
              required
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  if (lotName.trim()) setConfirmingLot(true);
                }
              }}
            />
            <button
              type="button"
              className={styles.inlineCreateButton}
              disabled={!lotName.trim()}
              onClick={() => setConfirmingLot(true)}
            >
              Guardar
            </button>
          </div>
        )}

        {confirmingLot && (
          <div className={styles.inlineCreateConfirm}>
            <p className={styles.inlineCreateConfirmText}>
              Se creará el lote <strong>{lotName.trim()}</strong> en el potrero{' '}
              <strong>{selectedPaddock?.name ?? 'seleccionado'}</strong>. ¿Confirmas?
            </p>
            <div className={styles.inlineCreateConfirmActions}>
              <button
                type="button"
                className={styles.inlineCreateButtonSecondary}
                onClick={resetCreateLot}
                disabled={isSavingLot}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.inlineCreateButton}
                onClick={() => void handleCreateLot()}
                disabled={isSavingLot}
              >
                {isSavingLot ? 'Guardando…' : 'Sí, crear lote'}
              </button>
            </div>
          </div>
        )}

        {lotError && <div className={styles.fieldError} role="alert">{lotError}</div>}
      </div>
    </>
  );
}
