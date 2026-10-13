export function connectTracking(url, { onEvent, onState }) {
  const socket = new WebSocket(url);
  socket.addEventListener('open', () => onState('connected'));
  socket.addEventListener('message', ({ data }) => {
    try {
      const event = JSON.parse(data); // El canal autenticado sigue enviando datos no confiables.
      if (typeof event.id !== 'string' || typeof event.type !== 'string') return;
      onEvent(event);
    } catch { onState('invalid-message'); }
  });
  socket.addEventListener('close', () => onState('disconnected'));
  socket.addEventListener('error', () => socket.close());
  return () => socket.close(1000, 'view-unmounted');
}
