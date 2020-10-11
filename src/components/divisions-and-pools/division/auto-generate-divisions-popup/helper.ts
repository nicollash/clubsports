export const getAllDatesFromInterval = (startDate: number, endDate: number) => {
  const allDates = [];
  for(let i = startDate; i <= endDate; i++) {
    allDates.push(String(i));
  }
  return allDates;
};