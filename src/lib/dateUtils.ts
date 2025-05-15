export const getDaysUntil = (
  targetDay: number,
  currentYear: number,
  currentMonth: number,
  currentDay: number
): number => {
  let targetDate = new Date(currentYear, currentMonth - 1, targetDay);
  const today = new Date(currentYear, currentMonth - 1, currentDay);
  if (today.getTime() > targetDate.getTime() || targetDate.getDate() !== targetDay) {
    let tempMonth = currentMonth;
    let tempYear = currentYear;
    if (today.getDate() >= targetDay) {
      tempMonth++;
      if (tempMonth > 12) {
        tempMonth = 1;
        tempYear++;
      }
    }
    targetDate = new Date(tempYear, tempMonth - 1, targetDay);
    while (targetDate.getDate() !== targetDay) {
      tempMonth++;
      if (tempMonth > 12) {
        tempMonth = 1;
        tempYear++;
      }
      targetDate = new Date(tempYear, tempMonth - 1, targetDay);
    }
  }
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays < 0 ? 0 : diffDays;
}; 