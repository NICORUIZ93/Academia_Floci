import { applyLabVerification } from './lab-verification';

describe('applyLabVerification', () => {
  it('creates a verifier for visual labs without code literals or numbers', () => {
    const container = document.createElement('main');
    container.innerHTML = `
      <h2>Laboratorio práctico</h2>
      <p><strong>Verificación:</strong> la lista renderizada mantiene el estado correcto al reordenar y usa composición sin herencia.</p>
      <p><strong>Errores comunes y soluciones</strong></p>
      <ul><li>Usa identificadores estables para conservar el estado.</li></ul>
      <h2>Resumen</h2>`;

    expect(applyLabVerification(container)).toBe(1);
    expect(container.querySelector('.lab-verify')).toBeTruthy();
    expect(container.querySelector('.lab-verify-feedback')?.getAttribute('aria-live')).toBe('polite');
  });

  it('does not invent a verifier when the chapter has no editorial success criterion', () => {
    const container = document.createElement('main');
    container.innerHTML = '<h2>Laboratorio práctico</h2><p>Construye algo.</p>';

    expect(applyLabVerification(container)).toBe(0);
    expect(container.querySelector('.lab-verify')).toBeFalsy();
  });

  it('recognizes a definition of done as an editorial success criterion', () => {
    const container = document.createElement('main');
    container.innerHTML = `
      <h2>Laboratorio práctico</h2>
      <p><strong>Definición de terminado:</strong> otra persona clona, ejecuta la prueba y observa el fallo controlado.</p>`;

    expect(applyLabVerification(container)).toBe(1);
  });
});
