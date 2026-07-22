import { Injectable } from '@angular/core';
import { marked } from 'marked';

// marked renderiza los bloques ```mermaid como <pre><code class="language-mermaid">.
// mermaid.run() (ver lesson-viewer.ts) busca <pre class="mermaid">, así que se
// reempaqueta la etiqueta después del parseo en vez de escribir un renderer custom.
const MERMAID_BLOCK = /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g;
@Injectable({ providedIn: 'root' })
export class ContentService {
  /** Una lección registrada debe existir. Propagar el error evita presentar como
   * contenido válido una descarga fallida o un Markdown ausente. */
  async loadLessonHtml(trackId: string, moduleId: number): Promise<string> {
    const contentUrl = new URL(`content/${trackId}/modulo-${moduleId}.md`, document.baseURI);
    const response = await fetch(contentUrl);
    if (!response.ok) throw new Error(`No se pudo cargar ${contentUrl.pathname} (${response.status}).`);
    const raw = await response.text();
    const withoutRepeatedTitle = raw.replace(/^#{1,2}\s+[^\n]*\n+/, '');
    const html = marked.parse(withoutRepeatedTitle, { async: false }) as string;
    return html.replace(MERMAID_BLOCK, '<pre class="mermaid">$1</pre>');
  }
}
