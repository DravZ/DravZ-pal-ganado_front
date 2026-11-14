/**
 * Fecha de hoy en formato YYYY-MM-DD usando la zona horaria local.
 * Se usa para acotar campos de fecha que no deberían aceptar valores futuros.
 */
export function todayLocalDate(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}
