const MAX_PASSWORD_BYTES = 72;

export function passwordPolicyError(password: string): string | null {
  if (password.length < 9) return 'La contraseña debe tener más de 8 caracteres.';
  if (new TextEncoder().encode(password).length > MAX_PASSWORD_BYTES) {
    return 'La contraseña no puede superar 72 bytes.';
  }
  if (/\s/.test(password)) return 'La contraseña no puede contener espacios.';
  if (!/[a-z]/.test(password)) return 'Agrega al menos una letra minúscula.';
  if (!/[A-Z]/.test(password)) return 'Agrega al menos una letra mayúscula.';
  if (!/\d/.test(password)) return 'Agrega al menos un número.';
  if (!/[^A-Za-z0-9\s]/.test(password)) return 'Agrega al menos un carácter especial.';
  return null;
}
