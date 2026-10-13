import { obtenerHistorial } from './data';
export async function HistorialEnvio({envioId}: {envioId: string}) { const items = await obtenerHistorial(envioId); return <section aria-label="Historial">{items.map((item) => <p key={item}>{item}</p>)}</section>; }
