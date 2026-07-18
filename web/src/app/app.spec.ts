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

  it('renders a lesson as an educational book with study modes and academic evidence', async () => {
    const markdown = `# título repetido

## Contenido teórico

### Tema 1: Un concepto verificable

**Conceptos clave:** entrada, transformación y salida.

**Analogía:** una receta reproducible.

**¿Por qué es importante?** permite explicar el resultado.

\`\`\`ts
const answer = 42;
\`\`\`

### Tema 2: Una decisión verificable

**Conceptos clave:** contexto, alternativas y consecuencias.

**Analogía:** elegir una ruta con restricciones explícitas.

**¿Por qué es importante?** permite justificar una elección sin inventar código.

## Laboratorio práctico

Construye y verifica el ejemplo.

## Ejercicios de evaluación

### Ejercicio 1: explicar

**Solución esperada:** relaciona entrada y salida.

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
      expect(text).toContain('Aprender');
      expect(text).toContain('Practicar');
      expect(text).toContain('Repasar');
      expect(text).toContain('Rúbrica del proyecto');
      expect(text).toContain('Bibliografía y fundamento académico');
      expect(page.querySelector('.lesson-markdown')).toBeTruthy();
      expect(page.querySelector('.build-method')).toBeFalsy();
      expect(page.querySelectorAll('.implementation-guide')).toHaveLength(2);
      expect(text).toContain('Crea el registro de decisión');
      expect(text).toContain('Provoca y diagnostica un fallo');
      expect(text).toContain('Conecta con el proyecto integrador');
      expect(text).toContain('Demuestra que aprendiste');
      expect(text).toContain('Contrasta con la documentación oficial');
      expect(page.querySelector('.implementation-guide a[href="https://developer.mozilla.org/en-US/curriculum/"]')).toBeTruthy();
      expect(page.querySelector('.learning-contract')).toBeFalsy();
      expect(page.querySelectorAll('.topic-card.expanded')).toHaveLength(1);
      const secondTopicToggle = page.querySelectorAll<HTMLButtonElement>('.topic-toggle')[1];
      expect(secondTopicToggle?.getAttribute('aria-expanded')).toBe('false');
      secondTopicToggle?.click();
      expect(secondTopicToggle?.getAttribute('aria-expanded')).toBe('true');
      expect(text).toContain('Crea el archivo');
      expect(text).toContain('Ejecuta desde la raíz del proyecto');
      expect(text).toContain('Resultado esperado');
      expect(text).toContain('Tu avance');
      expect(text).toContain('XP');
      expect(text).toContain('Racha');
      expect(text).toContain('Insignia');
      expect(text).toContain('Guía oficial');
      expect(text).toContain('Preparar');
      expect(text).toContain('Llevar a producción');
      expect(page.querySelectorAll('.official-path li')).toHaveLength(5);
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
      expect(text).toContain('Practica ahora');
      expect(text).toContain('Ver solución razonada');
      expect(text).toContain('Desde una carpeta vacía');
      expect(text).toContain('Prepara el proyecto para Cómo funciona tu entorno de desarrollo');
      expect(page.querySelector('.project-bootstrap')).toBeTruthy();
      expect(page.querySelector<HTMLDetailsElement>('.project-bootstrap')?.open).toBe(false);
      expect(page.querySelector<HTMLDetailsElement>('.implementation-guide')?.open).toBe(false);
    } finally {
      fetchSpy.mockRestore();
    }
  });
});
