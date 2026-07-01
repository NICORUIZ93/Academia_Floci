import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { routes } from './app.routes';
import { StudyPageComponent } from './study/study-page';

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

  it('renders the clean study page at the root route', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/', StudyPageComponent);
    harness.detectChanges();
    const text = harness.routeNativeElement?.textContent ?? '';
    expect(text).toContain('Academia Cloud Local');
    expect(text).toContain('Aprende cloud local con orden, práctica y evidencia');
    expect(text).toContain('Clase 1: Qué es Docker y por qué lo necesitas');
    expect(text).toContain('Siguiente clase');
    expect(text).toContain('Progreso cercano');
    expect(harness.routeNativeElement?.querySelectorAll('.player-aside button').length).toBe(5);
  });
});
