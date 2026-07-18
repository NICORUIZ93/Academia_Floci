import { Injectable } from '@angular/core';
import { marked } from 'marked';

// marked renderiza los bloques ```mermaid como <pre><code class="language-mermaid">.
// mermaid.run() (ver lesson-viewer.ts) busca <pre class="mermaid">, así que se
// reempaqueta la etiqueta después del parseo en vez de escribir un renderer custom.
const MERMAID_BLOCK = /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g;
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
      const withoutRepeatedTitle = raw.replace(/^#{1,2}\s+[^\n]*\n+/, '');
      const html = marked.parse(withoutRepeatedTitle, { async: false }) as string;
      return html.replace(MERMAID_BLOCK, '<pre class="mermaid">$1</pre>');
    } catch {
      return null;
    }
  }
}
