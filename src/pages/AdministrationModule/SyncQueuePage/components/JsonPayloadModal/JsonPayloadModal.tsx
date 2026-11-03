import React from 'react';
import { X } from 'lucide-react';
import styles from './JsonPayloadModal.module.css';

interface JsonPayloadModalProps {
  payload: Record<string, unknown>;
  onClose: () => void;
}

export const JsonPayloadModal: React.FC<JsonPayloadModalProps> = ({
  payload,
  onClose
}) => (
  <div className={styles.overlay} onClick={onClose}>
    <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
      <div className={styles.modalHeader}>
        <h3 className={styles.modalTitle}>Payload de la Operación (JSON)</h3>
        <button type="button" className={styles.closeBtn} onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      <div className={styles.modalBody}>
        <pre className={styles.jsonViewer}>
          {JSON.stringify(payload, null, 2)}
        </pre>
      </div>
    </div>
  </div>
);

export default JsonPayloadModal;