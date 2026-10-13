import 'server-only';
export type Envio = { id: string; estado: string };
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export async function obtenerEnvios(empty = false): Promise<Envio[]> {
  await delay(50);
  return empty ? [] : [{ id: 'RF-4471', estado: 'En tránsito' }];
}
export async function obtenerHistorial(id: string): Promise<string[]> {
  await delay(1200);
  return [`${id}: Asignado`, `${id}: Recogido`];
}
