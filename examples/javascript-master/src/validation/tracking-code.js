const TRACKING_CODE = /^(?<country>[A-Z]{2})-(?<year>\d{4})-(?<sequence>\d{6})$/u;
export function parseTrackingCode(value) {
  // Las anclas obligan a que toda la entrada cumpla la gramática.
  const match = TRACKING_CODE.exec(value.normalize('NFC'));
  if (!match?.groups) throw new TypeError('Código esperado: CO-2026-000123');
  return { ...match.groups, year: Number(match.groups.year) };
}
