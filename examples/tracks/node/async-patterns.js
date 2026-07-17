// Patrones asíncronos avanzados (Módulo 8): concurrencia controlada y reintentos.

// Promise.all falla rápido: si UNA promesa rechaza, toda la operación rechaza,
// aunque las demás siguieran en curso o hubieran tenido éxito.
async function procesarTodoOTodoFalla(ids) {
  return Promise.all(ids.map((id) => procesarUno(id)));
}

// Promise.allSettled: espera a que TODAS terminen (éxito o fallo) y devuelve
// el resultado de cada una por separado — apropiado cuando un fallo individual
// no debe abortar el resto del lote.
async function procesarLoteTolerante(ids) {
  const resultados = await Promise.allSettled(ids.map((id) => procesarUno(id)));
  const exitosos = resultados.filter((r) => r.status === 'fulfilled').map((r) => r.value);
  const fallidos = resultados.filter((r) => r.status === 'rejected').map((r) => r.reason);
  return { exitosos, fallidos };
}

// Concurrencia limitada: lanzar 1000 promesas simultáneas puede agotar
// conexiones/memoria. Este patrón procesa de a `limite` a la vez.
async function procesarConLimite(items, limite, tarea) {
  const resultados = [];
  for (let i = 0; i < items.length; i += limite) {
    const lote = items.slice(i, i + limite);
    const resultadosLote = await Promise.all(lote.map(tarea));
    resultados.push(...resultadosLote);
  }
  return resultados;
}

// Reintentos con backoff exponencial: espera cada vez más entre intentos, para
// no saturar un servicio que ya está fallando (p. ej. por sobrecarga).
async function conReintentos(fn, maxIntentos = 3) {
  for (let intento = 1; intento <= maxIntentos; intento++) {
    try {
      return await fn();
    } catch (error) {
      if (intento === maxIntentos) throw error;
      const espera = 2 ** intento * 100; // 200ms, 400ms, 800ms...
      await new Promise((resolve) => setTimeout(resolve, espera));
    }
  }
}

async function procesarUno(id) {
  if (Math.random() < 0.2) throw new Error(`Fallo procesando ${id}`);
  return { id, procesado: true };
}

module.exports = { procesarTodoOTodoFalla, procesarLoteTolerante, procesarConLimite, conReintentos };
