## TestBed básico

```ts
describe('Tarjeta', () => {
  it('muestra el título', async () => {
    await TestBed.configureTestingModule({ imports: [Tarjeta] }).compileComponents();
    const fixture = TestBed.createComponent(Tarjeta);
    fixture.componentRef.setInput('titulo', 'Hola');
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Hola');
  });
});
```

## Angular Testing Library

```ts
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

it('emite el evento al hacer click', async () => {
  const seleccionar = vi.fn();
  await render(Tarjeta, { inputs: { titulo: 'Hola' }, on: { seleccionar } });
  await userEvent.click(screen.getByRole('button', { name: /ver más/i }));
  expect(seleccionar).toHaveBeenCalled();
});
```

Testing Library empuja a consultar el DOM como lo haría un usuario (por texto, por rol) en vez de por selectores CSS internos — los tests sobreviven refactors de implementación.

## Mockear HttpClient

```ts
const httpMock = TestBed.inject(HttpTestingController);
servicio.cargarUsuarios().subscribe();
const req = httpMock.expectOne('/api/usuarios');
req.flush([{ id: 1, nombre: 'Ana' }]);
```

## Vitest en vez de Karma

El nuevo builder de pruebas de Angular (`@angular/build:unit-test`) usa Vitest por debajo — arranque más rápido y mejor experiencia de watch mode que Karma + Jasmine en navegador real.
