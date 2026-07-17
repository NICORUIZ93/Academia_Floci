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
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(markdown, { status: 200 }));

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
      expect(text).toContain('Objetivo');
      expect(text).toContain('Demostración');
      expect(text).toContain('Tarea');
      expect(text).toContain('Rúbrica del proyecto');
      expect(text).toContain('Bibliografía y fundamento académico');
      expect(page.querySelector('.lesson-markdown')).toBeTruthy();
      expect(page.querySelector('.build-method')).toBeTruthy();
    } finally {
      fetchSpy.mockRestore();
    }
  });
});
