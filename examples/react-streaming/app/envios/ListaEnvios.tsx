import type { Envio } from './data';
export function ListaEnvios({envios}: {envios: Envio[]}) { return <ul>{envios.map((envio) => <li key={envio.id}>{envio.id}: {envio.estado}</li>)}</ul>; }
