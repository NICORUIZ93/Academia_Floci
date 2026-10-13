export function formatDeliveryInstant(iso, timeZone, locale = 'es-CO') {
  const instant = new Date(iso);
  // Date + Intl constituye el fallback estable del contrato de presentación.
  if (Number.isNaN(instant.getTime())) throw new TypeError('Instante inválido');
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short', timeZone }).format(instant);
}

export const supportsTemporal = () => typeof globalThis.Temporal !== 'undefined';
