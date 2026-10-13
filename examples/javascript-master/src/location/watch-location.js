export function iniciarUbicacion({ onPosition, onError }) {
  if (!('geolocation' in navigator)) throw new Error('Geolocalización no disponible');
  const id = navigator.geolocation.watchPosition(
    ({ coords, timestamp }) => onPosition({
      // Precisión y captura viajan con la coordenada; no son metadatos opcionales.
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracyMeters: coords.accuracy,
      capturedAt: new Date(timestamp).toISOString(),
    }),
    onError,
    { enableHighAccuracy: true, timeout: 10_000, maximumAge: 5_000 },
  );
  return () => navigator.geolocation.clearWatch(id);
}
