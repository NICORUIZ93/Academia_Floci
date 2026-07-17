# Módulo 10: Testing en Angular

## Sílabo

**Objetivo general**

Escribir pruebas unitarias efectivas para componentes y servicios Angular usando `TestBed`, Angular Testing Library y mocking de `HttpClient`.

**Objetivos específicos**

1. Configurar y usar `TestBed` para probar componentes standalone.
2. Usar `fixture.componentRef.setInput()` para probar componentes con signals de entrada.
3. Escribir pruebas orientadas al usuario con Angular Testing Library.
4. Mockear peticiones HTTP con `HttpTestingController`.
5. Explicar la migración de Karma/Jasmine hacia Vitest.

**Contenido**

- `TestBed` básico y `componentRef.setInput`.
- Angular Testing Library: `render`, `screen`, `userEvent`.
- `HttpTestingController` para mockear HTTP.
- El nuevo builder de pruebas basado en Vitest.

**Evaluación**

Suite de pruebas para un componente con input signal y un servicio que consume HTTP, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: TestBed y componentes standalone

**Conceptos clave:** `TestBed.configureTestingModule`, `createComponent`, `componentRef.setInput`.

`TestBed` es el entorno de pruebas de Angular que permite crear una instancia real y renderizada de un componente dentro de un entorno controlado y aislado para pruebas, sin necesidad de arrancar la aplicación completa. `TestBed.configureTestingModule({ imports: [Tarjeta] })` declara qué componente (u otras dependencias) estarán disponibles en ese entorno de prueba específico; al tratarse de un componente standalone (Módulo 0), simplemente se importa directamente, sin necesidad de declarar un `NgModule` de pruebas dedicado como se requería en versiones anteriores de Angular.

`TestBed.createComponent(Tarjeta)` instancia realmente el componente dentro del entorno de prueba, devolviendo un `fixture` que da acceso tanto a la instancia del componente como a su elemento DOM real renderizado (`fixture.nativeElement`), permitiendo verificar tanto el estado interno del componente como lo que efectivamente se renderiza visualmente en el DOM, siendo esta verificación del DOM renderizado generalmente preferible a inspeccionar directamente propiedades internas del componente, dado que refleja más fielmente lo que un usuario real experimentaría.

`fixture.componentRef.setInput('titulo', 'Hola')` es la forma correcta y soportada de asignar un valor a un `input()` signal (Módulo 1) desde una prueba: dado que los inputs signal son de solo lectura desde la perspectiva del propio componente, no pueden asignarse directamente como una propiedad normal del componente; `setInput` pasa por el mecanismo interno correcto que Angular usa en producción para propagar valores de binding hacia inputs, siendo necesario además llamar `await fixture.whenStable()` después, para esperar a que la detección de cambios y cualquier efecto asociado (Módulo 2) se hayan estabilizado antes de hacer las aserciones.

**Analogía:** `TestBed` es como un laboratorio controlado donde se puede montar una réplica exacta de un componente para experimentar con él de forma aislada, sin afectar ni depender del resto de la aplicación; `setInput` es como ajustar un dial de entrada del experimento exactamente de la misma forma en que se ajustaría en el mundo real, en vez de forzar internamente un valor que el experimento nunca aceptaría normalmente.

**¿Por qué es importante?** `setInput` respeta el mecanismo real de propagación de inputs signal que Angular usa en producción, haciendo que la prueba verifique el comportamiento genuino del componente en vez de un atajo que podría no reflejar el comportamiento real.

**Diagrama:**

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

**Conceptos clave:** consultas orientadas al usuario, `render`, `screen`, `userEvent`.

Angular Testing Library es una capa sobre `TestBed` que promueve un estilo de prueba centrado deliberadamente en cómo un usuario real interactúa con la interfaz, en vez de en detalles internos de implementación: en lugar de acceder a elementos del DOM mediante selectores CSS internos (`fixture.nativeElement.querySelector('.boton-interno')`, que se rompe si el nombre de una clase CSS cambia por razones puramente visuales sin afectar el comportamiento real), se consulta el DOM por texto visible o por rol semántico de accesibilidad (`screen.getByRole('button', { name: /ver más/i })`), exactamente la misma información que un usuario (o una tecnología asistiva como un lector de pantalla) usaría para identificar ese elemento.

`render(Tarjeta, { inputs: { titulo: 'Hola' }, on: { seleccionar } })` renderiza el componente pasando directamente los valores de inputs y los manejadores de outputs (Módulo 1) como opciones declarativas, evitando gran parte de la ceremonia manual de `TestBed.configureTestingModule`/`createComponent`/`setInput` del Tema 1 para el caso común de simplemente montar un componente con ciertos valores iniciales. `userEvent.click(screen.getByRole('button', {...}))` simula una interacción de usuario real (incluyendo los eventos intermedios que un clic real dispara en un navegador, no solo el evento `click` final), disparando después la aserción sobre el manejador de output esperado (`expect(seleccionar).toHaveBeenCalled()`).

Este enfoque produce pruebas que sobreviven refactors internos de implementación (cambiar la estructura interna del HTML, renombrar clases CSS, reorganizar el árbol de componentes internos) siempre que el comportamiento observable desde la perspectiva del usuario permanezca igual, a diferencia de pruebas acopladas a selectores CSS internos, que se rompen ante cualquier cambio puramente cosmético sin relación real con el comportamiento probado.

**Analogía:** probar por selector CSS interno es como verificar que un cajero automático funciona revisando el color exacto de un cable interno específico; probar con Testing Library es como verificar que, al presionar el botón correcto en la pantalla (lo que cualquier usuario real haría), el dinero efectivamente sale — sin que importe qué cable interno específico haya cambiado de color entretanto.

**¿Por qué es importante?** Consultar el DOM como lo haría un usuario real (por texto, por rol) hace que las pruebas sobrevivan a refactors internos de implementación que no cambian el comportamiento observable de la aplicación.

**Diagrama:**

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

**Conceptos clave:** `HttpTestingController`, aislamiento de pruebas del backend real, migración de Karma a Vitest.

`HttpTestingController` es el mecanismo de Angular para interceptar peticiones HTTP realizadas durante una prueba sin que lleguen a un servidor real: `httpMock.expectOne('/api/usuarios')` verifica que exactamente una petición a esa URL fue realizada por el código bajo prueba, devolviendo un objeto `req` sobre el que se puede llamar `req.flush([{ id: 1, nombre: 'Ana' }])` para simular la respuesta exacta del servidor que la prueba necesita, permitiendo probar cómo el servicio o componente maneja esa respuesta específica (incluyendo casos de error simulados con `req.flush(null, { status: 500, statusText: 'Error' })`) sin ninguna dependencia de un backend real disponible ni de datos reales impredecibles.

Históricamente, las pruebas de Angular se ejecutaban con Karma (un ejecutor de pruebas que abre un navegador real, típicamente Chrome, para ejecutar las pruebas dentro de él) combinado con Jasmine como framework de aserciones; el nuevo builder de pruebas de Angular (`@angular/build:unit-test`) reemplaza esta combinación usando Vitest por debajo, un ejecutor de pruebas considerablemente más rápido para arrancar y para el modo watch de desarrollo (re-ejecutar automáticamente solo las pruebas afectadas por un cambio de archivo), dado que Vitest puede ejecutar pruebas en un entorno simulado de DOM sin necesidad de abrir un navegador real completo para cada ejecución, aunque sigue siendo posible ejecutar contra un navegador real cuando es necesario verificar comportamiento específico de un motor de renderizado particular.

**Analogía:** `HttpTestingController` es como un actor que se hace pasar por el servidor real durante un ensayo teatral, respondiendo exactamente las líneas que el guion de la prueba requiere, sin necesidad de que el servidor real (y todos sus datos reales impredecibles) esté presente en el ensayo; migrar de Karma a Vitest es como reemplazar un ensayo que requiere montar el escenario físico completo cada vez por uno que puede simularse rápidamente en una sala más simple, llegando al mismo resultado con mucha menor fricción de configuración.

**¿Por qué es importante?** `HttpTestingController` aísla completamente las pruebas de un backend real, haciendo que sean deterministas y ejecutables sin red; el builder basado en Vitest reduce significativamente el tiempo de arranque y de iteración durante el desarrollo con pruebas.

**Diagrama:**

```ts
const httpMock = TestBed.inject(HttpTestingController);
servicio.cargarUsuarios().subscribe();
const req = httpMock.expectOne('/api/usuarios');
req.flush([{ id: 1, nombre: 'Ana' }]);
```

---

## Criterio transversal de calidad del código

Aplica estas decisiones en todos los ejemplos y en tu entrega:

- usa nombres que expresen intención, dominio y unidades; evita `data`, `temp`, `manager` o `process` cuando exista un término preciso;
- mantén funciones, componentes, clases, consultas y módulos cohesionados alrededor de una responsabilidad comprobable;
- haz visibles las dependencias y los efectos de red, tiempo, archivos, estado y base de datos;
- valida entradas en la frontera y representa errores con contexto, sin ocultar la causa ni registrar secretos;
- elimina duplicación de reglas, no toda repetición textual; una abstracción incorrecta cuesta más que dos líneas parecidas;
- escribe primero la solución más simple que satisface el requisito y refactoriza con pruebas verdes;
- aplica SOLID únicamente cuando exista una necesidad real de cambio, extensión, sustitución o aislamiento.

**SOLID con criterio:** responsabilidad única significa una razón coherente de cambio, no una clase por función. Abierto/cerrado justifica estrategias cuando hay variantes reales. Sustitución exige respetar contratos. Segregación evita obligar a consumidores a depender de operaciones que no usan. Inversión de dependencias protege el dominio frente a detalles externos; no exige crear interfaces para cada objeto.

**Comprobación antes de continuar:** ¿otra persona puede entender los nombres y el flujo?, ¿los casos de error son observables?, ¿una prueba demuestra la regla principal?, ¿cada abstracción aporta más claridad de la que cuesta? Registra una decisión de refactorización y una decisión consciente de *no abstraer*.

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

## Ejercicios de evaluación

### Ejercicio 1: setInput frente a asignación directa

**Enunciado:** explica por qué no se puede simplemente hacer `fixture.componentInstance.titulo = 'Hola'` para asignar un input signal en una prueba.

**Solución esperada:** los inputs creados con `input()` son signals de solo lectura desde la perspectiva del propio componente; Angular los actualiza internamente mediante su propio mecanismo de binding, no mediante una asignación directa de propiedad. `fixture.componentRef.setInput(...)` pasa por ese mismo mecanismo interno correcto que Angular usa en producción, mientras que una asignación directa fallaría o no reflejaría el comportamiento real.

**Criterios de éxito:**
- Explica correctamente que los inputs signal requieren `setInput` para respetar el mecanismo real de Angular.

### Ejercicio 2: Consultas orientadas al usuario

**Enunciado:** ¿por qué `screen.getByRole('button', { name: /ver más/i })` es preferible a `fixture.nativeElement.querySelector('.btn-ver-mas')`?

**Solución esperada:** consultar por rol y texto visible refleja cómo un usuario real (o una tecnología asistiva) identifica ese elemento, haciendo que la prueba sobreviva a refactors cosméticos internos (cambiar nombres de clases CSS, reorganizar el HTML interno) que no afectan el comportamiento observable; un selector CSS interno se rompe ante cualquiera de esos cambios, aunque el comportamiento real siga siendo idéntico.

**Criterios de éxito:**
- Explica correctamente la resiliencia a refactors de las consultas orientadas al usuario frente a los selectores CSS internos.

### Ejercicio 3: Aislamiento de pruebas HTTP

**Enunciado:** ¿qué problema evita usar `HttpTestingController` en vez de dejar que las pruebas hagan peticiones HTTP reales contra un backend?

**Solución esperada:** las peticiones reales harían las pruebas no deterministas (dependientes de la disponibilidad y el estado real de un backend externo), lentas, y difíciles de usar para simular casos de error específicos; `HttpTestingController` intercepta las peticiones y permite simular exactamente la respuesta (exitosa o de error) que la prueba necesita, de forma rápida y determinista.

**Criterios de éxito:**
- Explica correctamente los problemas de determinismo y velocidad que `HttpTestingController` resuelve.

---

## Rúbrica del proyecto

Esta rúbrica evalúa el laboratorio y los ejercicios como evidencia de dominio, no la mera finalización de pasos.

| Criterio | Peso | Evidencia esperada |
|---|---:|---|
| Comprensión conceptual | 20% | Explica el mecanismo, sus límites y por qué la solución funciona. |
| Implementación funcional | 30% | El artefacto satisface requisitos normales, límite y de error. |
| Verificación | 20% | Incluye pruebas, mediciones o inspecciones reproducibles. |
| Diseño y calidad | 15% | Nombres, estructura, seguridad y mantenibilidad son deliberados. |
| Comunicación profesional | 15% | README, decisiones, comandos y resultados permiten repetir el trabajo. |

Se alcanza competencia con 70/100 y sin cero en implementación o verificación. El nivel experto exige comparar alternativas, justificar trade-offs y reconocer condiciones donde la solución dejaría de ser válida.

## Bibliografía y fundamento académico

Estas fuentes sustentan los conceptos y deben consultarse para verificar detalles que cambian entre versiones:

- Google, *Angular Documentation* y guías oficiales de accesibilidad, seguridad y rendimiento.
- ReactiveX, *RxJS Documentation*.
- W3C, *Web Content Accessibility Guidelines (WCAG)*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- `TestBed` y `setInput` prueban componentes standalone respetando el mecanismo real de inputs signal.
- Angular Testing Library promueve consultas orientadas al usuario, resilientes a refactors internos.
- `HttpTestingController` aísla las pruebas de un backend real de forma determinista.
- El builder basado en Vitest reemplaza a Karma/Jasmine con arranque e iteración más rápidos.

**Conceptos aprendidos**

- `TestBed`, `fixture` y `componentRef.setInput`.
- Angular Testing Library: `render`, `screen`, `userEvent`.
- Mocking de HTTP con `HttpTestingController`.
- Migración de Karma/Jasmine a Vitest.

**Próximos pasos**

En el Módulo 11 aprenderás performance, SSR y zoneless: renderizado del lado del servidor, hidratación, `@defer` y ejecución sin Zone.js.

**Recursos adicionales**

- Documentación oficial de Angular: "Testing" y Testing Library Angular (testing-library.com/docs/angular-testing-library/intro).
