# Módulo 10: Testing en Angular


## Aprende construyendo

### Tema 1: TestBed y componentes standalone

#### Paso 1 · Objetivo y preparación
Al finalizar podrás probar un componente Angular desde cero. Prerrequisitos: Node.js LTS, npm y Angular CLI. Verifica ng version.

#### Paso 2 · Contexto y caso real
En un caso real, una pantalla de entregas debe probar comportamiento visible, accesibilidad y errores de red sin depender de un backend real.

#### Paso 3 · Teoría, modelo mental y analogía
TestBed configura un entorno Angular aislado; Testing Library prioriza interacción del usuario; Vitest ejecuta pruebas rápidas. Mockear HttpClient controla respuestas y fallos. La analogía es un simulador: sustituye el clima y mide la conducción que realmente importa.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-angular-m10
cd ejemplo-angular-m10
npx -p @angular/cli ng new app --standalone --routing=false --style=css --skip-git
cd app
ng test --watch=false
```
Crea src/app/delivery.component.spec.ts con TestBed, un componente y una aserción sobre texto visible; explica setup, acción y expectativa.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente el texto esperado para provocar un fallo deliberado de prueba, lee el diff y corrígelo. Resultado esperado: suite verde y mensaje accesible.

#### Paso 6 · Práctica independiente
Añade prueba de HttpClientTestingController, estado de error y navegación por teclado; compara una prueba de implementación con una de comportamiento.

#### Paso 7 · Cierre y evidencia
Guarda salida de test, captura y cobertura; como siguiente paso estudia build. Errores comunes: probar detalles privados, mocks que no representan errores, fixtures frágiles y tests con estado compartido. Fuentes oficiales: https://angular.dev/guide/testing y https://testing-library.com/docs/angular-testing-library/intro/.
**¿Por qué es importante?** Porque una prueba debe proteger la experiencia y no solo la estructura interna.
**Evidencia de aprendizaje:** entrega suite verde, fallo, caso de error y prueba de accesibilidad.
**Conceptos clave:** `TestBed.configureTestingModule`, `createComponent`, `componentRef.setInput`.

`TestBed` es el entorno de pruebas de Angular que permite crear una instancia real y renderizada de un componente dentro de un entorno controlado y aislado para pruebas, sin necesidad de arrancar la aplicación completa. `TestBed.configureTestingModule({ imports: [Tarjeta] })` declara qué componente (u otras dependencias) estarán disponibles en ese entorno de prueba específico; al tratarse de un componente standalone (Módulo 0), simplemente se importa directamente, sin necesidad de declarar un `NgModule` de pruebas dedicado como se requería en versiones anteriores de Angular.

`TestBed.createComponent(Tarjeta)` instancia realmente el componente dentro del entorno de prueba, devolviendo un `fixture` que da acceso tanto a la instancia del componente como a su elemento DOM real renderizado (`fixture.nativeElement`), permitiendo verificar tanto el estado interno del componente como lo que efectivamente se renderiza visualmente en el DOM, siendo esta verificación del DOM renderizado generalmente preferible a inspeccionar directamente propiedades internas del componente, dado que refleja más fielmente lo que un usuario real experimentaría.

`fixture.componentRef.setInput('titulo', 'Hola')` es la forma correcta y soportada de asignar un valor a un `input()` signal (Módulo 1) desde una prueba: dado que los inputs signal son de solo lectura desde la perspectiva del propio componente, no pueden asignarse directamente como una propiedad normal del componente; `setInput` pasa por el mecanismo interno correcto que Angular usa en producción para propagar valores de binding hacia inputs, siendo necesario además llamar `await fixture.whenStable()` después, para esperar a que la detección de cambios y cualquier efecto asociado (Módulo 2) se hayan estabilizado antes de hacer las aserciones.

**Analogía:** `TestBed` es como un laboratorio controlado donde se puede montar una réplica exacta de un componente para experimentar con él de forma aislada, sin afectar ni depender del resto de la aplicación; `setInput` es como ajustar un dial de entrada del experimento exactamente de la misma forma en que se ajustaría en el mundo real, en vez de forzar internamente un valor que el experimento nunca aceptaría normalmente.

**¿Por qué es importante?** `setInput` respeta el mecanismo real de propagación de inputs signal que Angular usa en producción, haciendo que la prueba verifique el comportamiento genuino del componente en vez de un atajo que podría no reflejar el comportamiento real.

**Código del ejemplo:**

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

### Tema 2: Angular Testing Library

#### Paso 1 · Objetivo y preparación
Al finalizar podrás probar un componente Angular desde cero. Prerrequisitos: Node.js LTS, npm y Angular CLI. Verifica ng version.

#### Paso 2 · Contexto y caso real
En un caso real, una pantalla de entregas debe probar comportamiento visible, accesibilidad y errores de red sin depender de un backend real.

#### Paso 3 · Teoría, modelo mental y analogía
TestBed configura un entorno Angular aislado; Testing Library prioriza interacción del usuario; Vitest ejecuta pruebas rápidas. Mockear HttpClient controla respuestas y fallos. La analogía es un simulador: sustituye el clima y mide la conducción que realmente importa.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-angular-m10
cd ejemplo-angular-m10
npx -p @angular/cli ng new app --standalone --routing=false --style=css --skip-git
cd app
ng test --watch=false
```
Crea src/app/delivery.component.spec.ts con TestBed, un componente y una aserción sobre texto visible; explica setup, acción y expectativa.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente el texto esperado para provocar un fallo deliberado de prueba, lee el diff y corrígelo. Resultado esperado: suite verde y mensaje accesible.

#### Paso 6 · Práctica independiente
Añade prueba de HttpClientTestingController, estado de error y navegación por teclado; compara una prueba de implementación con una de comportamiento.

#### Paso 7 · Cierre y evidencia
Guarda salida de test, captura y cobertura; como siguiente paso estudia build. Errores comunes: probar detalles privados, mocks que no representan errores, fixtures frágiles y tests con estado compartido. Fuentes oficiales: https://angular.dev/guide/testing y https://testing-library.com/docs/angular-testing-library/intro/.
**¿Por qué es importante?** Porque una prueba debe proteger la experiencia y no solo la estructura interna.
**Evidencia de aprendizaje:** entrega suite verde, fallo, caso de error y prueba de accesibilidad.
**Conceptos clave:** consultas orientadas al usuario, `render`, `screen`, `userEvent`.

Angular Testing Library es una capa sobre `TestBed` que promueve un estilo de prueba centrado deliberadamente en cómo un usuario real interactúa con la interfaz, en vez de en detalles internos de implementación: en lugar de acceder a elementos del DOM mediante selectores CSS internos (`fixture.nativeElement.querySelector('.boton-interno')`, que se rompe si el nombre de una clase CSS cambia por razones puramente visuales sin afectar el comportamiento real), se consulta el DOM por texto visible o por rol semántico de accesibilidad (`screen.getByRole('button', { name: /ver más/i })`), exactamente la misma información que un usuario (o una tecnología asistiva como un lector de pantalla) usaría para identificar ese elemento.

`render(Tarjeta, { inputs: { titulo: 'Hola' }, on: { seleccionar } })` renderiza el componente pasando directamente los valores de inputs y los manejadores de outputs (Módulo 1) como opciones declarativas, evitando gran parte de la ceremonia manual de `TestBed.configureTestingModule`/`createComponent`/`setInput` del Tema 1 para el caso común de simplemente montar un componente con ciertos valores iniciales. `userEvent.click(screen.getByRole('button', {...}))` simula una interacción de usuario real (incluyendo los eventos intermedios que un clic real dispara en un navegador, no solo el evento `click` final), disparando después la aserción sobre el manejador de output esperado (`expect(seleccionar).toHaveBeenCalled()`).

Este enfoque produce pruebas que sobreviven refactors internos de implementación (cambiar la estructura interna del HTML, renombrar clases CSS, reorganizar el árbol de componentes internos) siempre que el comportamiento observable desde la perspectiva del usuario permanezca igual, a diferencia de pruebas acopladas a selectores CSS internos, que se rompen ante cualquier cambio puramente cosmético sin relación real con el comportamiento probado.

**Analogía:** probar por selector CSS interno es como verificar que un cajero automático funciona revisando el color exacto de un cable interno específico; probar con Testing Library es como verificar que, al presionar el botón correcto en la pantalla (lo que cualquier usuario real haría), el dinero efectivamente sale — sin que importe qué cable interno específico haya cambiado de color entretanto.

**¿Por qué es importante?** Consultar el DOM como lo haría un usuario real (por texto, por rol) hace que las pruebas sobrevivan a refactors internos de implementación que no cambian el comportamiento observable de la aplicación.

**Código del ejemplo:**

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

### Tema 3: Mockear HttpClient y el nuevo builder basado en Vitest

#### Paso 1 · Objetivo y preparación
Al finalizar podrás probar un componente Angular desde cero. Prerrequisitos: Node.js LTS, npm y Angular CLI. Verifica ng version.

#### Paso 2 · Contexto y caso real
En un caso real, una pantalla de entregas debe probar comportamiento visible, accesibilidad y errores de red sin depender de un backend real.

#### Paso 3 · Teoría, modelo mental y analogía
TestBed configura un entorno Angular aislado; Testing Library prioriza interacción del usuario; Vitest ejecuta pruebas rápidas. Mockear HttpClient controla respuestas y fallos. La analogía es un simulador: sustituye el clima y mide la conducción que realmente importa.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-angular-m10
cd ejemplo-angular-m10
npx -p @angular/cli ng new app --standalone --routing=false --style=css --skip-git
cd app
ng test --watch=false
```
Crea src/app/delivery.component.spec.ts con TestBed, un componente y una aserción sobre texto visible; explica setup, acción y expectativa.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente el texto esperado para provocar un fallo deliberado de prueba, lee el diff y corrígelo. Resultado esperado: suite verde y mensaje accesible.

#### Paso 6 · Práctica independiente
Añade prueba de HttpClientTestingController, estado de error y navegación por teclado; compara una prueba de implementación con una de comportamiento.

#### Paso 7 · Cierre y evidencia
Guarda salida de test, captura y cobertura; como siguiente paso estudia build. Errores comunes: probar detalles privados, mocks que no representan errores, fixtures frágiles y tests con estado compartido. Fuentes oficiales: https://angular.dev/guide/testing y https://testing-library.com/docs/angular-testing-library/intro/.
**¿Por qué es importante?** Porque una prueba debe proteger la experiencia y no solo la estructura interna.
**Evidencia de aprendizaje:** entrega suite verde, fallo, caso de error y prueba de accesibilidad.
**Conceptos clave:** `HttpTestingController`, aislamiento de pruebas del backend real, migración de Karma a Vitest.

`HttpTestingController` es el mecanismo de Angular para interceptar peticiones HTTP realizadas durante una prueba sin que lleguen a un servidor real: `httpMock.expectOne('/api/usuarios')` verifica que exactamente una petición a esa URL fue realizada por el código bajo prueba, devolviendo un objeto `req` sobre el que se puede llamar `req.flush([{ id: 1, nombre: 'Ana' }])` para simular la respuesta exacta del servidor que la prueba necesita, permitiendo probar cómo el servicio o componente maneja esa respuesta específica (incluyendo casos de error simulados con `req.flush(null, { status: 500, statusText: 'Error' })`) sin ninguna dependencia de un backend real disponible ni de datos reales impredecibles.

Históricamente, las pruebas de Angular se ejecutaban con Karma (un ejecutor de pruebas que abre un navegador real, típicamente Chrome, para ejecutar las pruebas dentro de él) combinado con Jasmine como framework de aserciones; el nuevo builder de pruebas de Angular (`@angular/build:unit-test`) reemplaza esta combinación usando Vitest por debajo, un ejecutor de pruebas considerablemente más rápido para arrancar y para el modo watch de desarrollo (re-ejecutar automáticamente solo las pruebas afectadas por un cambio de archivo), dado que Vitest puede ejecutar pruebas en un entorno simulado de DOM sin necesidad de abrir un navegador real completo para cada ejecución, aunque sigue siendo posible ejecutar contra un navegador real cuando es necesario verificar comportamiento específico de un motor de renderizado particular.

**Analogía:** `HttpTestingController` es como un actor que se hace pasar por el servidor real durante un ensayo teatral, respondiendo exactamente las líneas que el guion de la prueba requiere, sin necesidad de que el servidor real (y todos sus datos reales impredecibles) esté presente en el ensayo; migrar de Karma a Vitest es como reemplazar un ensayo que requiere montar el escenario físico completo cada vez por uno que puede simularse rápidamente en una sala más simple, llegando al mismo resultado con mucha menor fricción de configuración.

**¿Por qué es importante?** `HttpTestingController` aísla completamente las pruebas de un backend real, haciendo que sean deterministas y ejecutables sin red; el builder basado en Vitest reduce significativamente el tiempo de arranque y de iteración durante el desarrollo con pruebas.

**Código del ejemplo:**

```ts
const httpMock = TestBed.inject(HttpTestingController);
servicio.cargarUsuarios().subscribe();
const req = httpMock.expectOne('/api/usuarios');
req.flush([{ id: 1, nombre: 'Ana' }]);
```

---


## Laboratorio práctico

**Objetivo del laboratorio:** escribir una suite de pruebas completa para un componente con input signal y un servicio que consume HTTP.

**Requisitos previos:** Módulos 0-9 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Probar un componente con `TestBed` | Ver Tema 1 | Usa `setInput` para el input signal |
| 2 | Reescribir la misma prueba con Testing Library | Ver Tema 2 | Compara la legibilidad de ambos enfoques |
| 3 | Simular un clic con `userEvent` | Ver Tema 2 | Verifica que el output se emite correctamente |
| 4 | Mockear una petición HTTP | Ver Tema 3 | Usa `HttpTestingController` |
| 5 | Simular un error HTTP | `req.flush(null, {status: 500, ...})` | Verifica el manejo de errores del servicio |

**Verificación:** el laboratorio se considera exitoso si todas las pruebas pasan de forma determinista sin depender de un backend real, y si las pruebas escritas con Testing Library consultan el DOM por rol/texto en vez de por selectores CSS internos.

**Errores comunes y soluciones**

- **Asignar un input signal como propiedad directa en vez de usar `setInput`.** Los inputs signal son de solo lectura desde el componente; usa siempre `fixture.componentRef.setInput(...)`.
- **Olvidar `await fixture.whenStable()` tras `setInput`.** Sin esperar la estabilización, las aserciones pueden ejecutarse antes de que la vista se actualice.
- **Consultar por selector CSS interno en vez de por rol/texto.** Esto hace que la prueba se rompa ante refactors cosméticos sin relación con el comportamiento real.

---
