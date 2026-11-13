export function animalPhotoSource(value: string): string {
  return value.startsWith('data:image/') ? value : `data:image/jpeg;base64,${value}`;
}
