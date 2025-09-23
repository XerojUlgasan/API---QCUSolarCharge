function getDayRange() {
  const now = new Date();

  // Start of the day (00:00:00.000)
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  // End of the day (23:59:59.999)
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  return { startOfDay, endOfDay };
}

module.exports = getDayRange