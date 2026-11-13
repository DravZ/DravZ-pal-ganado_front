import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Camera, ImageUp } from 'lucide-react';
import { animalPhotoSource } from './animalPhotoUtils';
import styles from './AnimalPhotoField.module.css';

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1280;

interface AnimalPhotoFieldProps {
  value: string;
  required?: boolean;
  onChange: (value: string) => void;
}

function resizePhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    void createImageBitmap(file).then((bitmap) => {
      const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext('2d');
      if (!context) {
        bitmap.close();
        reject(new Error('No se pudo procesar la imagen.'));
        return;
      }

      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('No se pudo comprimir la imagen.'));
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') resolve(reader.result);
          else reject(new Error('No se pudo leer la imagen.'));
        };
        reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.82);
    }).catch(() => reject(new Error('No se pudo abrir la imagen seleccionada.')));
  });
}

export function AnimalPhotoField({
  value,
  required = false,
  onChange,
}: AnimalPhotoFieldProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const draftInputRef = useRef<HTMLTextAreaElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (value) {
      draftInputRef.current?.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }, [value]);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Selecciona un archivo de imagen.');
      input.value = '';
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('La imagen debe pesar menos de 20 MB.');
      input.value = '';
      return;
    }

    setIsProcessing(true);
    try {
      onChange(await resizePhoto(file));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo procesar la imagen.');
    } finally {
      setIsProcessing(false);
      input.value = '';
    }
  };

  return (
    <div className={styles.photoField}>
      <textarea
        ref={draftInputRef}
        className={styles.draftValue}
        data-draft-field="photoBase64"
        aria-hidden="true"
        tabIndex={-1}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {value ? (
        <div className={styles.previewFrame}>
          <img
            className={styles.previewImage}
            src={animalPhotoSource(value)}
            alt="Vista previa de la fotografía del animal"
          />
        </div>
      ) : (
        <div className={styles.emptyPreview} aria-hidden="true">
          <Camera size={32} />
          <span>Sin fotografía</span>
        </div>
      )}

      <div className={styles.photoActions}>
        <button
          type="button"
          className={styles.photoButton}
          onClick={() => cameraInputRef.current?.click()}
          disabled={isProcessing}
        >
          <Camera size={18} />
          Tomar fotografía
        </button>
        <button
          type="button"
          className={styles.uploadButton}
          onClick={() => uploadInputRef.current?.click()}
          disabled={isProcessing}
        >
          <ImageUp size={18} />
          Subir archivo
        </button>
      </div>

      <input
        ref={cameraInputRef}
        className={styles.fileInput}
        type="file"
        accept="image/*"
        capture="environment"
        aria-label="Tomar fotografía del animal"
        onChange={handleFile}
      />
      <input
        ref={uploadInputRef}
        className={styles.fileInput}
        type="file"
        accept="image/*"
        aria-label="Subir una fotografía del animal"
        onChange={handleFile}
      />
      <p className={styles.helpText}>
        {required ? 'La fotografía es obligatoria. ' : ''}
        Se optimiza antes de guardarse; puedes tomarla con la cámara o elegir un archivo.
      </p>
      {isProcessing && <p className={styles.helpText} role="status">Procesando fotografía…</p>}
      {error && <p className={styles.errorText} role="alert">{error}</p>}
    </div>
  );
}
