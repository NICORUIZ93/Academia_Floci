import { Suspense } from 'react';
import { obtenerEnvios } from './data';
import { ListaEnvios } from './ListaEnvios';
import { HistorialEnvio } from './HistorialEnvio';
export const dynamic = 'force-dynamic';
export default async function EnviosPage({ searchParams }: { searchParams: Promise<{ empty?: string }> }) {
  const { empty } = await searchParams;
  const envios = await obtenerEnvios(empty === '1');
  if (envios.length === 0) return <main><h1>Sin envíos</h1></main>;
  return <main><ListaEnvios envios={envios} />
    <Suspense fallback={<p>Cargando historial…</p>}>
      <HistorialEnvio envioId={envios[0].id} />
    </Suspense>
  </main>;
}
