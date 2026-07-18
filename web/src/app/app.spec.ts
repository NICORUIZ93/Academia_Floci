import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { routes } from './app.routes';
import { CourseCatalogComponent } from './catalog/course-catalog';
import { TRACKS } from './course-data';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('renders the library catalog at the root route', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/', CourseCatalogComponent);
    harness.detectChanges();
    const text = harness.routeNativeElement?.textContent ?? '';
    expect(text).toContain('Academia Floci');
    expect(text).toContain('Biblioteca de cursos');
    expect(TRACKS).toHaveLength(14);
    expect(harness.routeNativeElement?.querySelectorAll('.track-card').length).toBeGreaterThanOrEqual(14);
    expect(harness.routeNativeElement?.querySelectorAll('.track-card-icon img').length).toBeGreaterThanOrEqual(12);
    expect(text).toContain('Fundamentos de Ingeniería de Software');
    expect(text).toContain('Cloud Local — AWS, Azure y GCP');
    expect(text).toContain('RutaFlow — Plataforma profesional de entregas');
  });

  it('renders a clean educational lesson with progressive topics', async () => {
    const markdown = `# título repetido

## Aprende construyendo

### Tema 1: Un concepto verificable

**Conceptos clave:** entrada, transformación y salida.

**Analogía:** una receta reproducible.

**¿Por qué es importante?** permite explicar el resultado.

La explicación detallada continúa después del ejemplo ejecutable.

\`\`\`ts
const answer = 42;
\`\`\`

### Tema 2: Una decisión verificable

**Conceptos clave:** contexto, alternativas y consecuencias.

**Analogía:** elegir una ruta con restricciones explícitas.

**¿Por qué es importante?** permite justificar una elección sin inventar código.

## Laboratorio práctico

Construye y verifica el ejemplo.

## Rúbrica del proyecto

| Criterio | Peso |
|---|---:|
| Verificación | 100% |

## Bibliografía y fundamento académico

- Fuente primaria.

## Resumen del módulo

La evidencia demuestra el aprendizaje.`;
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(input => {
      const url = String(input);
      return Promise.resolve(url.includes('topic-index.json')
        ? new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } })
        : new Response(markdown, { status: 200 }));
    });

    try {
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/curso/foundations/0');
      await harness.fixture.whenStable();
      harness.detectChanges();
      await harness.fixture.whenStable();
      harness.detectChanges();

      const page = harness.fixture.nativeElement as HTMLElement;
      const text = page.textContent ?? '';
      expect(fetchSpy).toHaveBeenCalled();
      expect(text).not.toContain('XP');
      expect(text).not.toContain('Racha');
      expect(text).not.toContain('Insignia');
      expect(text).toContain('Rúbrica del proyecto');
      expect(text).toContain('Bibliografía y fundamento académico');
      expect(page.querySelector('.lesson-markdown')).toBeTruthy();
      expect(page.querySelector('.build-method')).toBeFalsy();
      expect(page.querySelectorAll('.implementation-guide')).toHaveLength(0);
      expect(page.querySelector('.learning-contract')).toBeFalsy();
      expect(page.querySelectorAll('.topic-card.expanded')).toHaveLength(1);
      expect(text).toContain('Aprende construyendo');
      expect(text).not.toContain('Contenido teórico');
      expect(page.querySelector('.topic-practice')).toBeFalsy();
      const firstTopicBody = page.querySelector('.topic-card.expanded > .topic-body');
      const firstCode = firstTopicBody?.querySelector('.code-example');
      const detailedExplanation = Array.from(firstTopicBody?.children ?? []).find(element => element.textContent?.includes('explicación detallada'));
      expect(firstCode && detailedExplanation).toBeTruthy();
      expect(Array.from(firstTopicBody?.children ?? []).indexOf(firstCode!)).toBeLessThan(Array.from(firstTopicBody?.children ?? []).indexOf(detailedExplanation!));
      const secondTopicToggle = page.querySelectorAll<HTMLButtonElement>('.topic-toggle')[1];
      expect(secondTopicToggle?.getAttribute('aria-expanded')).toBe('false');
      secondTopicToggle?.click();
      expect(secondTopicToggle?.getAttribute('aria-expanded')).toBe('true');
      expect(text).toContain('Resultado esperado');
      expect(text).toContain('Guía oficial');
      expect(text).toContain('Preparar');
      expect(text).toContain('Llevar a producción');
      expect(page.querySelectorAll('.official-path li')).toHaveLength(5);
      expect(page.querySelector('.lesson-toc')?.textContent).not.toContain('Abrir tema');
      expect(page.querySelector('.lesson-toc')?.textContent).not.toContain('Ocultar tema');
      expect(page.querySelector('.module-checkpoint')).toBeFalsy();
      expect(page.querySelector('.code-example .window-controls')).toBeTruthy();
      expect(page.querySelector('.code-example .code-example-language')).toBeTruthy();
      expect(text).toContain('TypeScript');
      expect(text).toContain('1 línea');
      const wrapCode = page.querySelector<HTMLButtonElement>('[data-wrap-code]');
      expect(wrapCode?.getAttribute('aria-pressed')).toBe('false');
      wrapCode?.click();
      expect(page.querySelector('.code-example.wrap-lines')).toBeTruthy();
      expect(wrapCode?.getAttribute('aria-pressed')).toBe('true');
      expect(text).not.toContain('Práctica opcional');
      expect(text).not.toContain('Ejercicios de evaluación');
      expect(page.querySelector('.exercise-card')).toBeFalsy();
      expect(text).toContain('Desde una carpeta vacía');
      expect(text).toContain('Prepara el proyecto para Cómo funciona tu entorno de desarrollo');
      expect(page.querySelector('.project-bootstrap')).toBeTruthy();
      expect(page.querySelector<HTMLDetailsElement>('.project-bootstrap')?.open).toBe(false);
      const secondarySections = page.querySelectorAll('.secondary-section-body');
      expect(secondarySections.length).toBeGreaterThanOrEqual(3);
      const bibliographyToggle = page.querySelector<HTMLButtonElement>('.section-bibliografia-y-fundamento-academico .secondary-section-toggle');
      expect(bibliographyToggle?.getAttribute('aria-expanded')).toBe('false');
      bibliographyToggle?.click();
      expect(bibliographyToggle?.getAttribute('aria-expanded')).toBe('true');
    } finally {
      fetchSpy.mockRestore();
    }
  });
});
