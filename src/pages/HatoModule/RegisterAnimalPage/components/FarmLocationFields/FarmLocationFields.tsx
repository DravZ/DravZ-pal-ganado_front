import { useState } from 'react';
import { ExternalLink, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from '../Step3LocationGenealogy/Step3LocationGenealogy.module.css';
import { useFarmScope } from '../../../../../context/FarmScopeContext';
import useNotification from '../../../../../hooks/useNotification';
import { queueHatoWrite } from '../../../../../services/hatoDataService';

interface FarmLocationFieldsProps {
  lotId: string;
  paddockId: string;
  onLotChange: (id: string) => void;
  onPaddockChange: (id: string) => void;
  lots: { id: string; name: string }[];
  lotsLoading: boolean;
  lotsError: string | null;
  paddocks: { id: string; name: string }[];
  paddocksLoading: boolean;
  paddocksError: string | null;
}

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
  const [lotError, setLotError] = useState<string | null>(null);
  const [isSavingLot, setIsSavingLot] = useState(false);

  const handleCreateLot = async () => {
    if (!scope) {
      setLotError('Selecciona una finca autorizada antes de crear un lote.');
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
        status: 'active',
      });
      onLotChange(result.recordId);
      setLotName('');
      setCreatingLot(false);
      showNotification({
        type: result.pending ? 'alert' : 'success',
        title: result.pending ? 'Lote guardado para sincronizar' : 'Lote creado',
        message: result.pending
          ? 'El lote está disponible localmente y se sincronizará al recuperar la conexión.'
          : 'El lote se creó y quedó seleccionado para el animal.',
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
        <label className={styles.formLabel} htmlFor="animal-lot">Lote</label>
        <select
          id="animal-lot"
          className={styles.formControl}
          value={lotId}
          onChange={(event) => onLotChange(event.target.value)}
        >
          <option value="">Sin lote asignado</option>
          {lots.map((lot) => <option key={lot.id} value={lot.id}>{lot.name}</option>)}
        </select>
        {lotsLoading && <div className={styles.fieldHint}>Cargando lotes de esta finca…</div>}
        {lotsError && <div className={styles.fieldError} role="alert">{lotsError}</div>}
        {!lotsLoading && !lotsError && lots.length === 0 && (
          <div className={styles.emptyHint}>Aún no hay lotes registrados para esta finca.</div>
        )}
        <button
          type="button"
          className={styles.actionLink}
          onClick={() => {
            setCreatingLot((visible) => !visible);
            setLotError(null);
          }}
        >
          <Plus size={14} className="me-1" />
          {creatingLot ? 'Cancelar nuevo lote' : 'Crear lote'}
        </button>
        {creatingLot && (
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
                  void handleCreateLot();
                }
              }}
            />
            <button
              type="button"
              className={styles.inlineCreateButton}
              disabled={isSavingLot || !lotName.trim()}
              onClick={() => void handleCreateLot()}
            >
              {isSavingLot ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        )}
        {lotError && <div className={styles.fieldError} role="alert">{lotError}</div>}
      </div>

      <div className="col-12 col-md-6">
        <label className={styles.formLabel} htmlFor="animal-paddock">Potrero</label>
        <select
          id="animal-paddock"
          className={styles.formControl}
          value={paddockId}
          onChange={(event) => onPaddockChange(event.target.value)}
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
    </>
  );
}
