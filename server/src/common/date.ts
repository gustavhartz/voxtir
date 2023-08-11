/**
 * Returns the date in the format YYYY-MM-DD
 * @param date
 * @returns
 */
export function getShortDateFormat(date: Date) {
  return date.toISOString().split('T')[0];
}
