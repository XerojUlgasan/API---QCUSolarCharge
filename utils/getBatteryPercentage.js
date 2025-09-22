function getStateOfCharge(voltage) {
  const table = [
    { voltage: 12.60, charge: 100 },
    { voltage: 12.50, charge: 90 },
    { voltage: 12.42, charge: 80 },
    { voltage: 12.32, charge: 70 },
    { voltage: 12.20, charge: 60 },
    { voltage: 12.06, charge: 50 },
    { voltage: 11.90, charge: 40 },
    { voltage: 11.75, charge: 30 },
    { voltage: 11.58, charge: 20 },
    { voltage: 11.31, charge: 10 },
    { voltage: 10.50, charge: 0 },
  ];

  // If above highest voltage → 100%
  if (voltage >= table[0].voltage) return 100;
  // If below lowest voltage → 0%
  if (voltage <= table[table.length - 1].voltage) return 0;

  // Find where the voltage fits
  for (let i = 0; i < table.length - 1; i++) {
    const current = table[i];
    const next = table[i + 1];

    if (voltage <= current.voltage && voltage > next.voltage) {
      // Linear interpolation between the two points
      const ratio =
        (voltage - next.voltage) / (current.voltage - next.voltage);
      return Math.round(next.charge + ratio * (current.charge - next.charge));
    }
  }
}

module.exports = { getStateOfCharge };