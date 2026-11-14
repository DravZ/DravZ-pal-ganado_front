import React from 'react';
import { Scan, Plus, Trash2 } from 'lucide-react';
import styles from './Step2Identifiers.module.css';
import { createIdentifierDraft, IDENTIFIER_TYPES } from '../../identifierDrafts';
import type { AnimalFormChange, AnimalFormData, AnimalIdentifierDraft } from '../../types';

interface Step2Props {
  formData: AnimalFormData;
  onChange: AnimalFormChange;
}

export const Step2Identifiers: React.FC<Step2Props> = ({ formData, onChange }) => {
  const identifiers = formData.identifiers;

  const updateIdentifier = (index: number, changes: Partial<AnimalIdentifierDraft>) => {
    onChange(
      'identifiers',
      identifiers.map((identifier, position) =>
        position === index ? { ...identifier, ...changes } : identifier,
      ),
    );
  };

  // Solo un identificador puede quedar marcado como actual.
  const setCurrentIdentifier = (index: number) => {
    onChange(
      'identifiers',
      identifiers.map((identifier, position) => ({
        ...identifier,
        isCurrent: position === index,
      })),
    );
  };

  const addIdentifier = () => {
    onChange('identifiers', [
      ...identifiers,
      createIdentifierDraft(identifiers.length === 0),
    ]);
  };

  const removeIdentifier = (index: number) => {
    const next = identifiers.filter((_, position) => position !== index);
    if (next.length > 0 && !next.some((identifier) => identifier.isCurrent)) {
      next[0] = { ...next[0], isCurrent: true };
    }
    onChange('identifiers', next);
  };

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeaderGroup}>
        <div className={styles.stepIconBadge}>
          <Scan size={22} strokeWidth={2.2} />
        </div>
        <div>
          <h2 className={styles.stepTitle}>Identificadores</h2>
          <p className={styles.stepSubtitle}>
            Agrega uno o varios aretes, códigos oficiales o microchips.
          </p>
        </div>
      </div>

      {identifiers.map((identifier, index) => (
        <div className={styles.identifierCard} key={identifier.id}>
          <div className={styles.cardTopHeader}>
            <div className={styles.badgeNumber}>{index + 1}</div>
            <div className={styles.cardHeaderText}>
              <h3 className={styles.cardTitle}>Identificador {index + 1}</h3>
              <p className={styles.cardSubtitle}>
                {identifier.isCurrent ? 'Actual' : 'Secundario'}
              </p>
            </div>
            {identifiers.length > 1 && (
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => removeIdentifier(index)}
                aria-label={`Eliminar identificador ${index + 1}`}
                title="Eliminar identificador"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          <div className={styles.cardBody}>
            <div className="row g-3">
              <div className="col-12 col-md-5">
                <label className={styles.formLabel}>
                  Tipo <span className={styles.fieldTag}>(identifier_type)</span>
                </label>
                <select
                  className={styles.formControl}
                  value={identifier.type}
                  onChange={(e) => updateIdentifier(index, { type: e.target.value })}
                >
                  {IDENTIFIER_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-7">
                <label className={styles.formLabel}>
                  Código <span className={styles.fieldTag}>(identifier)</span>
                </label>
                <input
                  type="text"
                  className={styles.formControl}
                  value={identifier.code}
                  onChange={(e) => updateIdentifier(index, { code: e.target.value })}
                  placeholder="BR-"
                />
              </div>
            </div>

            <div className={styles.cardFooterToggles}>
              <label className={styles.toggleLabelGroup}>
                <input
                  type="checkbox"
                  className="form-check-input mt-0"
                  checked={identifier.isOfficial}
                  onChange={(e) => updateIdentifier(index, { isOfficial: e.target.checked })}
                />
                <div>
                  <div className={styles.toggleTextTitle}>Identificador oficial</div>
                  <div className={styles.toggleTextSub}>Emitido por una autoridad</div>
                </div>
              </label>

              {/* El switch de "actual" solo tiene sentido con más de un identificador. */}
              {identifiers.length > 1 && (
                <div className="d-flex align-items-center gap-3">
                  <div className="text-end d-none d-sm-block">
                    <div className={styles.toggleTextTitle}>Identificador actual</div>
                    <div className={styles.toggleTextSub}>Visible como identificación principal</div>
                  </div>
                  <div className="form-check form-switch m-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      checked={identifier.isCurrent}
                      onChange={(e) => e.target.checked && setCurrentIdentifier(index)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      <button type="button" className={styles.addBtn} onClick={addIdentifier}>
        <Plus size={18} strokeWidth={2.5} />
        <span>Agregar otro identificador</span>
      </button>
    </div>
  );
};

export default Step2Identifiers;
