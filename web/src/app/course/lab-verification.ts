// Motor genérico de verificación de laboratorios: funciona sobre CUALQUIER lección
// de CUALQUIER track sin necesidad de contenido específico, porque se apoya en la
// convención ya presente en casi todos los módulos (185 de 185 archivos generados
// con esta plantilla): una sección "## Laboratorio práctico" que termina con un
// párrafo "**Verificación:** ..." describiendo la condición de éxito, y opcionalmente
// una lista de "Errores comunes" justo después.
//
// Estrategia: extrae del párrafo de Verificación las palabras clave más específicas
// (fragmentos de código entre backticks y números de 2+ dígitos), y compara cuántas
// aparecen en la evidencia que el estudiante pega desde su propia terminal.

const MIN_KEYWORDS = 2;
const MIN_EVIDENCE_LENGTH = 15;
const MATCH_THRESHOLD = 0.5;
const FALLBACK_STOP_WORDS = new Set([
  'verificacion', 'laboratorio', 'considera', 'exitoso', 'resultado', 'esperado',
  'debe', 'deben', 'puede', 'para', 'como', 'cuando', 'donde', 'desde', 'entre',
  'mediante', 'ninguna', 'ningun', 'correcto', 'salida', 'terminal', 'muestra',
]);

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

function extractKeywords(verificationParagraph: HTMLElement): string[] {
  const fromCode = Array.from(verificationParagraph.querySelectorAll('code'))
    .map(el => el.textContent?.trim() ?? '')
    .filter(text => text.length >= 2);

  const plainText = verificationParagraph.textContent ?? '';
  const numbers = plainText.match(/\b\d{2,5}\b/g) ?? [];
  const fallbackTerms = normalize(plainText)
    .match(/\b[a-z][a-z0-9_-]{4,}\b/g)
    ?.filter(term => !FALLBACK_STOP_WORDS.has(term)) ?? [];

  // Muchos resultados de UI no contienen números ni fragmentos de terminal.
  // En ese caso se usan términos observables del criterio editorial, evitando
  // que un laboratorio real desaparezca del progreso como si no existiera.
  const keywords = [...new Set([...fromCode, ...numbers, ...fallbackTerms])];
  return keywords.slice(0, 8);
}

function findHint(labSection: HTMLElement[]): string | null {
  for (const el of labSection) {
    if (el.tagName === 'P' && /errores comunes/i.test(el.textContent ?? '')) {
      const list = el.nextElementSibling;
      if (list && list.tagName === 'UL') {
        const firstItem = list.querySelector('li');
        const text = firstItem?.textContent?.trim();
        if (text) return text.length > 220 ? text.slice(0, 217) + '…' : text;
      }
    }
  }
  return null;
}

function buildWidget(keywords: string[], hint: string | null, onVerified?: () => void): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'lab-verify';

  const heading = document.createElement('h4');
  heading.textContent = 'Verifica tu laboratorio';
  wrapper.appendChild(heading);

  const label = document.createElement('label');
  const textareaId = `lab-verify-${Math.random().toString(36).slice(2, 9)}`;
  label.setAttribute('for', textareaId);
  label.textContent = 'Pega o describe la evidencia observable de tu ejecución';
  wrapper.appendChild(label);

  const textarea = document.createElement('textarea');
  textarea.id = textareaId;
  textarea.rows = 4;
  textarea.placeholder = 'Salida de terminal o prueba, comportamiento visible en la interfaz y condición que verificaste…';
  wrapper.appendChild(textarea);

  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Verificar';
  wrapper.appendChild(button);

  const feedback = document.createElement('p');
  feedback.className = 'lab-verify-feedback';
  feedback.setAttribute('aria-live', 'polite');
  wrapper.appendChild(feedback);

  button.addEventListener('click', () => {
    const evidence = textarea.value.trim();
    feedback.classList.remove('ok', 'fail');

    if (evidence.length < MIN_EVIDENCE_LENGTH) {
      feedback.classList.add('fail');
      feedback.textContent = '❌ Evidencia insuficiente: incluye la salida o comportamiento real y explica qué condición verificaste.';
      return;
    }

    const normalizedEvidence = normalize(evidence);
    const matched = keywords.filter(keyword => normalizedEvidence.includes(normalize(keyword)));
    const ratio = matched.length / keywords.length;

    if (ratio >= MATCH_THRESHOLD) {
      feedback.classList.add('ok');
      feedback.textContent = '✅ Correcto: tu evidencia coincide con el resultado esperado del laboratorio.';
      onVerified?.();
    } else {
      feedback.classList.add('fail');
      const missing = keywords.filter(k => !matched.includes(k));
      const pista = hint ?? `Revisa que tu salida incluya: ${missing.join(', ')}.`;
      feedback.textContent = `❌ Incorrecto: tu evidencia no coincide con lo esperado. Pista: ${pista}`;
    }
  });

  return wrapper;
}

/** Recorre el HTML ya renderizado de una lección e inserta un widget de verificación
 *  después del párrafo "Verificación:" de cada sección "## Laboratorio práctico". */
export function applyLabVerification(container: HTMLElement, onVerified?: (labIndex: number) => void): number {
  const headings = Array.from(container.querySelectorAll('h2')).filter(h2 =>
    /laboratorio/i.test(h2.textContent ?? ''),
  );

  let widgets = 0;
  for (const heading of headings) {
    const sectionElements: HTMLElement[] = [];
    let node = heading.nextElementSibling;
    while (node && node.tagName !== 'H2') {
      sectionElements.push(node as HTMLElement);
      node = node.nextElementSibling;
    }

    const verificationParagraph = sectionElements.find(el => {
      if (el.tagName !== 'P') return false;
      const label = el.querySelector('strong')?.textContent?.trim() || el.textContent?.trim() || '';
      return /^(?:(?:La\s+)?(?:Verificación|Definición de terminado|Criterio de aceptación|Resultado esperado)|La entrega (?:incluye|contiene)|Entrega código)/i.test(label);
    });
    if (!verificationParagraph) continue;

    const keywords = extractKeywords(verificationParagraph);
    if (keywords.length < MIN_KEYWORDS) continue;

    const hint = findHint(sectionElements);
    const labIndex = widgets;
    const widget = buildWidget(keywords, hint, () => onVerified?.(labIndex));
    verificationParagraph.insertAdjacentElement('afterend', widget);
    widgets += 1;
  }
  return widgets;
}
