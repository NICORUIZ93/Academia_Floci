export const strategies = {
  fastest: ({ routes }) => routes.toSorted((a, b) => a.minutes - b.minutes)[0],
  lowBattery: ({ routes }) => routes.toSorted((a, b) => a.energy - b.energy)[0],
};
export function planRoute(delivery, strategy) {
  // El planificador depende del contrato función, no de estrategias concretas.
  if (typeof strategy !== 'function') throw new TypeError('Strategy requerida');
  return strategy(delivery);
}
