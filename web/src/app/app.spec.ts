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
    expect(harness.routeNativeElement?.textContent).toContain('De cero a profesional master');
    expect(harness.routeNativeElement?.textContent).toContain('JavaScript de cero a master');
    expect(harness.routeNativeElement?.textContent).toContain('Objetivos de aprendizaje');
    expect(harness.routeNativeElement?.textContent).toContain('Variables');
  });
});
