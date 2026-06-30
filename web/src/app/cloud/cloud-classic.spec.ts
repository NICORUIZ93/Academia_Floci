import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../app.routes';

describe('Cloud routes', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('/curso/cloud renders the guided course reader', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/curso/cloud');
    harness.detectChanges();
    const text = harness.routeNativeElement?.textContent ?? '';
    expect(text).toContain('Instalación y primeros pasos con Floci');
    expect(text).toContain('Método aplicado a este módulo');
    expect(text).toContain('Lee, ejecuta, rompe, explica y enseña');
  });

  it('/laboratorio/floci keeps the classic interactive lab available', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/laboratorio/floci');
    harness.detectChanges();
    const text = harness.routeNativeElement?.textContent ?? '';
    expect(text).toContain('Domina la nube');
    expect(text).toContain('AWS · Azure · GCP');
  });
});
