import { Camera } from 'lucide-react';
import basicStyles from '../Step1BasicData/Step1BasicData.module.css';
import { AnimalPhotoField } from '../AnimalPhotoField/AnimalPhotoField';

interface Step4AnimalPhotoProps {
  value: string;
  onChange: (value: string) => void;
}

export function Step4AnimalPhoto({ value, onChange }: Step4AnimalPhotoProps) {
  return (
    <div className={basicStyles.stepContainer}>
      <div className={basicStyles.stepHeaderGroup}>
        <div className={basicStyles.stepIconBadge}>
          <Camera size={22} strokeWidth={2.2} />
        </div>
        <div>
          <h2 className={basicStyles.stepTitle}>Fotografía del animal</h2>
          <p className={basicStyles.stepSubtitle}>
            Toma una foto o selecciona una imagen para identificar al animal.
          </p>
        </div>
      </div>
      <AnimalPhotoField value={value} required onChange={onChange} />
    </div>
  );
}
