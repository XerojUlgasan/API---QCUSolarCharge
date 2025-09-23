function getMonthRange() {
  const now = new Date();

  // Start of the month (1st day, 00:00:00)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);

  // End of the month (last day, 23:59:59.999)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);

  return { startOfMonth, endOfMonth };
}

module.exports = getMonthRange