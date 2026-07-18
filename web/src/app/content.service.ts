import { Injectable } from '@angular/core';
import { marked } from 'marked';

// marked renderiza los bloques ```mermaid como <pre><code class="language-mermaid">.
// mermaid.run() (ver lesson-viewer.ts) busca <pre class="mermaid">, así que se
// reempaqueta la etiqueta después del parseo en vez de escribir un renderer custom.
const MERMAID_BLOCK = /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g;
const EDITORIAL_SCAFFOLD_BLOCKS = [
  'DEFINITIVE-COMPLEMENTS',
  'SUPPLEMENTAL-COMPLEMENTS',
  'REQUESTED-PRACTICAL-EXAMPLES',
] as const;

/**
 * Los inventarios generados conservan temas pedidos y trazabilidad editorial,
 * pero no son lecciones: repiten plantillas y ejemplos que no enseñan el tema.
 * Permanecen en Markdown para que el equipo pueda reescribirlos, mientras el
 * estudiante solo ve contenido específico y revisado.
 */
export function stripEditorialScaffolds(markdown: string): string {
  return EDITORIAL_SCAFFOLD_BLOCKS.reduce((content, marker) => {
    const block = new RegExp(`\\n?<!-- ${marker}:START -->[\\s\\S]*?<!-- ${marker}:END -->\\n?`, 'g');
    return content.replace(block, '\n');
  }, markdown);
}

@Injectable({ providedIn: 'root' })
export class ContentService {
  /** Carga la lección en markdown de un módulo. Devuelve null si todavía no existe
   *  (tracks nuevos cuyo contenido se redacta por etapas) en vez de lanzar un error. */
  async loadLessonHtml(trackId: string, moduleId: number): Promise<string | null> {
    try {
      const contentUrl = new URL(`content/${trackId}/modulo-${moduleId}.md`, document.baseURI);
      const response = await fetch(contentUrl);
      if (!response.ok) return null;
      const raw = await response.text();
      const reviewedContent = stripEditorialScaffolds(raw);
      const withoutRepeatedTitle = reviewedContent.replace(/^#{1,2}\s+[^\n]*\n+/, '');
      const html = marked.parse(withoutRepeatedTitle, { async: false }) as string;
      return html.replace(MERMAID_BLOCK, '<pre class="mermaid">$1</pre>');
    } catch {
      return null;
    }
  }
}
