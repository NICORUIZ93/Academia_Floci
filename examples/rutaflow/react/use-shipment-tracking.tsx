import { useEffect, useState } from 'react';

type TrackingState =
  | { kind: 'loading' }
  | { kind: 'ready'; status: string; updatedAt: string }
  | { kind: 'error'; message: string };

export function useShipmentTracking(publicCode: string): TrackingState {
  const [state, setState] = useState<TrackingState>({ kind: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    setState({ kind: 'loading' });
    fetch(`/api/public/shipments/${encodeURIComponent(publicCode)}`, {
      signal: controller.signal,
    })
      .then(response => {
        if (!response.ok) throw new Error(`tracking request failed: ${response.status}`);
        return response.json() as Promise<{ status: string; updatedAt: string }>;
      })
      .then(result => setState({ kind: 'ready', ...result }))
      .catch(error => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setState({ kind: 'error', message: 'No pudimos actualizar el envío.' });
      });
    return () => controller.abort();
  }, [publicCode]);

  return state;
}
