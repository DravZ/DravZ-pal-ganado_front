export interface AnimalFormData {
  name: string;
  sex: string;
  species: string;
  breed: string;
  birthDate: string;
  birthWeight: string;
  acquisitionDate: string;
  acquisitionCost: string;
  identifierType: string;
  identifierCode: string;
  isOfficial: boolean;
  isCurrent: boolean;
  loteId: string;
  potreroId: string;
  sireId: string;
  damId: string;
  currentWeight: string;
  currentWeightDate: string;
  measurementMethod: string;
  notes: string;
  photoBase64: string;
}

export type AnimalFormChange = <K extends keyof AnimalFormData>(
  field: K,
  value: AnimalFormData[K],
) => void;
