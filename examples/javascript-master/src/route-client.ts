export function startRoute(onMessage: (message: string) => void) {
  const worker = new Worker(new URL('./workers/route.worker.ts', import.meta.url), { type: 'module' });
  worker.onmessage = ({ data }) => onMessage(data.kind === 'success'
    ? `Distancia planificada: ${data.total} km` : data.message);
  worker.postMessage({ segments: [2.4, 3.1, 1.5] });
  return { destroy: () => worker.terminate(), send: (value: unknown) => worker.postMessage(value) };
}
