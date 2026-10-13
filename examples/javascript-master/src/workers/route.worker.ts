// route.worker.ts: el cálculo pesado ocurre fuera del hilo de la interfaz.
self.onmessage = (event: MessageEvent<unknown>) => {
  const data = event.data;
  if (typeof data !== "object" || data === null ||
      !("segments" in data) || !Array.isArray(data.segments) ||
      !data.segments.every((value) => typeof value === "number")) {
    self.postMessage({ kind: "error", message: "Segmentos inválidos" });
    return;
  }
  const total = data.segments.reduce((distance, segment) => distance + segment, 0);
  self.postMessage({ kind: "success", total });
};
