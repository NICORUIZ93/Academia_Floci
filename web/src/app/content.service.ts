import { Injectable } from '@angular/core';
import { marked } from 'marked';

@Injectable({ providedIn: 'root' })
export class ContentService {
  /** Carga la lección en markdown de un módulo. Devuelve null si todavía no existe
   *  (tracks nuevos cuyo contenido se redacta por etapas) en vez de lanzar un error. */
  async loadLessonHtml(trackId: string, moduleId: number): Promise<string | null> {
    try {
      const response = await fetch(`/content/${trackId}/modulo-${moduleId}.md`);
      if (!response.ok) return null;
      const raw = await response.text();
      const withoutRepeatedTitle = raw.replace(/^#{1,2}\s+[^\n]*\n+/, '');
      return marked.parse(withoutRepeatedTitle, { async: false }) as string;
    } catch {
      return null;
    }
  }
}
