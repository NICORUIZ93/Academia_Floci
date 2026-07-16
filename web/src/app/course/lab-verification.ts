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

  const keywords = [...new Set([...fromCode, ...numbers])];
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

function buildWidget(keywords: string[], hint: string | null): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'lab-verify';

  const heading = document.createElement('h4');
  heading.textContent = 'Verifica tu laboratorio';
  wrapper.appendChild(heading);

  const label = document.createElement('label');
  const textareaId = `lab-verify-${Math.random().toString(36).slice(2, 9)}`;
  label.setAttribute('for', textareaId);
  label.textContent = 'Pega aquí lo que viste en tu terminal al ejecutar el laboratorio';
  wrapper.appendChild(label);

  const textarea = document.createElement('textarea');
  textarea.id = textareaId;
  textarea.rows = 4;
  textarea.placeholder = 'Salida real de tu comando, tal como apareció en tu terminal…';
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
      feedback.textContent = '❌ Incorrecto: pega la salida real que obtuviste, con al menos unas palabras de contexto.';
      return;
    }

    const normalizedEvidence = normalize(evidence);
    const matched = keywords.filter(keyword => normalizedEvidence.includes(normalize(keyword)));
    const ratio = matched.length / keywords.length;

    if (ratio >= MATCH_THRESHOLD) {
      feedback.classList.add('ok');
      feedback.textContent = '✅ Correcto: tu evidencia coincide con el resultado esperado del laboratorio.';
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
export function applyLabVerification(container: HTMLElement): void {
  const headings = Array.from(container.querySelectorAll('h2')).filter(h2 =>
    /laboratorio/i.test(h2.textContent ?? ''),
  );

  for (const heading of headings) {
    const sectionElements: HTMLElement[] = [];
    let node = heading.nextElementSibling;
    while (node && node.tagName !== 'H2') {
      sectionElements.push(node as HTMLElement);
      node = node.nextElementSibling;
    }

    const verificationParagraph = sectionElements.find(
      el => el.tagName === 'P' && el.querySelector('strong')?.textContent?.trim().startsWith('Verificación'),
    );
    if (!verificationParagraph) continue;

    const keywords = extractKeywords(verificationParagraph);
    if (keywords.length < MIN_KEYWORDS) continue;

    const hint = findHint(sectionElements);
    const widget = buildWidget(keywords, hint);
    verificationParagraph.insertAdjacentElement('afterend', widget);
  }
}
