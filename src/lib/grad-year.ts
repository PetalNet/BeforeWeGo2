export function getGradYear(date: Date): number {
  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth();

  return currentYear + (currentMonth >= 6 ? 1 : 0);
}
