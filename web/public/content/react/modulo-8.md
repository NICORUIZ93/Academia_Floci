# Módulo 8: Testing en React


## Aprende construyendo

### Tema 1: Queries por rol, no por clase CSS

#### Paso 1 · Objetivo y preparación
Al finalizar podrás probar React como usuario desde cero. Prerrequisitos: Node.js LTS, npm, editor y Vite. Verifica npm --version.

#### Paso 2 · Contexto y caso real
En un caso real, una pantalla de entregas debe conservar comportamiento visible aunque cambie su implementación interna y debe simular red sin backend real.

#### Paso 3 · Teoría, modelo mental y analogía
Testing Library consulta por rol y nombre accesible; MSW intercepta red en el borde; hooks se prueban mediante un componente consumidor. La analogía es una inspección de calidad: se verifica la puerta que usa la persona, no el color interno de la bisagra.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-react-m8
cd ejemplo-react-m8
npm create vite@latest app -- --template react-ts
cd app
npm install -D vitest @testing-library/react @testing-library/jest-dom msw
npm run test
```
Crea src/components/DeliveryStatus.test.tsx con una consulta por role y un handler MSW; documenta setup y respuesta.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente el role o respuesta para provocar un fallo deliberado de test; lee el diagnóstico y corrígelo. Resultado esperado: prueba verde y mensaje accesible.

#### Paso 6 · Práctica independiente
Añade caso 500, loading, hook personalizado y prueba de teclado; evita selectores de clase y esperas arbitrarias.

#### Paso 7 · Cierre y evidencia
Guarda suite, logs y captura; como siguiente paso estudia CI. Errores comunes: testear implementación, MSW sin reset, assertions demasiado amplias y ocultar errores de accesibilidad. Fuentes oficiales: https://testing-library.com/docs/react-testing-library/intro/ y https://mswjs.io/docs/.
**¿Por qué es importante?** Porque las pruebas orientadas al usuario sobreviven refactors y detectan regresiones reales.
**Evidencia de aprendizaje:** entrega test normal, test de error, handler y fallo corregido.
**Conceptos clave:** `getByRole`, `getByText`, resiliencia a refactors.

React Testing Library promueve deliberadamente consultar el DOM renderizado de la misma forma en que un usuario real (o una tecnología asistiva como un lector de pantalla) identificaría un elemento: por su rol semántico de accesibilidad (`screen.getByRole('button', { name: /enviar/i })`) o por el texto visible que muestra (`screen.getByText(/enviado con éxito/i)`), evitando deliberadamente consultas basadas en detalles internos de implementación como nombres de clases CSS o la estructura exacta del árbol DOM interno (`getByClassName`, deliberadamente no ofrecido como API principal por la librería), un principio de diseño idéntico al estudiado para Angular Testing Library en el Módulo 10 del track de Angular.

Esta elección deliberada produce pruebas que sobreviven a refactors internos del componente que no cambian su comportamiento observable: si se reorganiza el HTML interno de un componente, o se renombra una clase CSS puramente por razones cosméticas, una prueba que consulta por rol/texto sigue pasando sin cambios, mientras que una prueba que dependiera de un selector CSS interno específico se rompería inmediatamente ante ese mismo cambio cosmético, aunque el comportamiento real del componente permanezca completamente intacto.

**Analogía:** consultar por rol/texto es como identificar a alguien por su función visible en una obra de teatro (el actor que hace de rey) en vez de por el número de camerino que ocupa detrás del escenario: si cambia de camerino (un detalle interno irrelevante), sigue siendo identificable de la misma forma por su rol visible en la obra.

**¿Por qué es importante?** Consultar por rol/texto en vez de por selectores de implementación hace que las pruebas sobrevivan a refactors internos cosméticos que no afectan el comportamiento real observable del componente.

**Código del ejemplo:**

```jsx
render(<Formulario />);
const boton = screen.getByRole('button', { name: /enviar/i }); // como lo "vería" un usuario/lector de pantalla
await userEvent.click(boton);
expect(screen.getByText(/enviado con éxito/i)).toBeInTheDocument();
```

### Tema 2: Mock Service Worker (MSW)

#### Paso 1 · Objetivo y preparación
Al finalizar podrás probar React como usuario desde cero. Prerrequisitos: Node.js LTS, npm, editor y Vite. Verifica npm --version.

#### Paso 2 · Contexto y caso real
En un caso real, una pantalla de entregas debe conservar comportamiento visible aunque cambie su implementación interna y debe simular red sin backend real.

#### Paso 3 · Teoría, modelo mental y analogía
Testing Library consulta por rol y nombre accesible; MSW intercepta red en el borde; hooks se prueban mediante un componente consumidor. La analogía es una inspección de calidad: se verifica la puerta que usa la persona, no el color interno de la bisagra.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-react-m8
cd ejemplo-react-m8
npm create vite@latest app -- --template react-ts
cd app
npm install -D vitest @testing-library/react @testing-library/jest-dom msw
npm run test
```
Crea src/components/DeliveryStatus.test.tsx con una consulta por role y un handler MSW; documenta setup y respuesta.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente el role o respuesta para provocar un fallo deliberado de test; lee el diagnóstico y corrígelo. Resultado esperado: prueba verde y mensaje accesible.

#### Paso 6 · Práctica independiente
Añade caso 500, loading, hook personalizado y prueba de teclado; evita selectores de clase y esperas arbitrarias.

#### Paso 7 · Cierre y evidencia
Guarda suite, logs y captura; como siguiente paso estudia CI. Errores comunes: testear implementación, MSW sin reset, assertions demasiado amplias y ocultar errores de accesibilidad. Fuentes oficiales: https://testing-library.com/docs/react-testing-library/intro/ y https://mswjs.io/docs/.
**¿Por qué es importante?** Porque las pruebas orientadas al usuario sobreviven refactors y detectan regresiones reales.
**Evidencia de aprendizaje:** entrega test normal, test de error, handler y fallo corregido.
**Conceptos clave:** interceptación a nivel de red, sin conocimiento del código de producción.

MSW intercepta peticiones HTTP a nivel de red (registrando un service worker o, en entornos de prueba, interceptando directamente las llamadas de red del entorno de ejecución) en vez de parchear directamente la función `fetch` global del código de la aplicación (`vi.fn()` o un mock manual de `fetch`, un enfoque alternativo pero más frágil, dado que requiere que el mock replique exactamente la forma en que el código de producción invoca `fetch`); con MSW, el código de producción realiza sus peticiones exactamente igual que en producción real, sin ninguna modificación ni conocimiento de que está siendo interceptado, siendo el propio MSW el que intercepta esas peticiones a nivel de red antes de que lleguen a un servidor real.

`setupServer(http.get('/api/usuarios', () => HttpResponse.json([{ id: 1, nombre: 'Ana' }])))` define un manejador que responde a peticiones GET hacia esa ruta específica con datos simulados; `server.listen()` activa la interceptación antes de que las pruebas corran, `server.resetHandlers()` restaura los manejadores por defecto entre pruebas individuales (evitando que un manejador personalizado definido en una prueba específica afecte accidentalmente a pruebas posteriores), y `server.close()` detiene la interceptación al finalizar toda la suite.

**Analogía:** MSW es como un servidor de pruebas que se hace pasar de forma completamente transparente por el servidor real en una red aislada, de modo que el código bajo prueba nunca se entera de que está hablando con un impostor, en vez de reemplazar directamente la línea telefónica del código bajo prueba con un cable falso que requiere modificar el propio código para usarlo.

**¿Por qué es importante?** MSW intercepta a nivel de red, permitiendo que el código de producción se pruebe exactamente como se ejecutaría en producción real, sin necesidad de modificarlo ni de mockear directamente `fetch` de forma frágil.

**Código del ejemplo:**

```js
const server = setupServer(
  http.get('/api/usuarios', () => HttpResponse.json([{ id: 1, nombre: 'Ana' }]))
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Tema 3: Testing de hooks personalizados

#### Paso 1 · Objetivo y preparación
Al finalizar podrás probar React como usuario desde cero. Prerrequisitos: Node.js LTS, npm, editor y Vite. Verifica npm --version.

#### Paso 2 · Contexto y caso real
En un caso real, una pantalla de entregas debe conservar comportamiento visible aunque cambie su implementación interna y debe simular red sin backend real.

#### Paso 3 · Teoría, modelo mental y analogía
Testing Library consulta por rol y nombre accesible; MSW intercepta red en el borde; hooks se prueban mediante un componente consumidor. La analogía es una inspección de calidad: se verifica la puerta que usa la persona, no el color interno de la bisagra.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-react-m8
cd ejemplo-react-m8
npm create vite@latest app -- --template react-ts
cd app
npm install -D vitest @testing-library/react @testing-library/jest-dom msw
npm run test
```
Crea src/components/DeliveryStatus.test.tsx con una consulta por role y un handler MSW; documenta setup y respuesta.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente el role o respuesta para provocar un fallo deliberado de test; lee el diagnóstico y corrígelo. Resultado esperado: prueba verde y mensaje accesible.

#### Paso 6 · Práctica independiente
Añade caso 500, loading, hook personalizado y prueba de teclado; evita selectores de clase y esperas arbitrarias.

#### Paso 7 · Cierre y evidencia
Guarda suite, logs y captura; como siguiente paso estudia CI. Errores comunes: testear implementación, MSW sin reset, assertions demasiado amplias y ocultar errores de accesibilidad. Fuentes oficiales: https://testing-library.com/docs/react-testing-library/intro/ y https://mswjs.io/docs/.
**¿Por qué es importante?** Porque las pruebas orientadas al usuario sobreviven refactors y detectan regresiones reales.
**Evidencia de aprendizaje:** entrega test normal, test de error, handler y fallo corregido.
**Conceptos clave:** `renderHook`, `act`, aislar la lógica del hook de un componente visual.

`renderHook(() => useContador())` permite probar un hook personalizado de forma aislada, sin necesidad de crear un componente de prueba dedicado únicamente para invocar ese hook y exponer indirectamente su resultado; el `result` devuelto expone `.current` con el valor actual retornado por el hook, actualizándose automáticamente entre renders sucesivos provocados dentro de la prueba. `act(() => result.current.incrementar())` envuelve cualquier interacción que dispare una actualización de estado dentro del hook, garantizando que React procese completamente esa actualización (incluyendo cualquier efecto asociado) antes de que la aserción siguiente se ejecute, de forma análoga en propósito a `await fixture.whenStable()` en las pruebas de Angular (Módulo 10 del track de Angular).

Probar hooks personalizados de forma aislada, sin envolverlos en un componente visual completo, mantiene la prueba enfocada específicamente en la lógica del hook (sus transiciones de estado, sus efectos), sin acoplar esa prueba a detalles de renderizado visual que no tienen relación real con la lógica que efectivamente se está verificando.

**Analogía:** probar un hook con `renderHook` es como probar el motor de un vehículo en un banco de pruebas aislado, verificando su comportamiento sin necesidad de montar la carrocería completa del vehículo únicamente para poder encenderlo.

**¿Por qué es importante?** `renderHook` aísla la prueba de un hook personalizado de cualquier componente visual innecesario, manteniendo la prueba enfocada específicamente en la lógica de estado y efectos del hook.

**Código del ejemplo:**

```jsx
const { result } = renderHook(() => useContador());
act(() => result.current.incrementar());
expect(result.current.valor).toBe(1);
```

---


## Laboratorio práctico

**Objetivo del laboratorio:** escribir una suite de pruebas completa de un flujo de formulario con fetching mockeado.

**Requisitos previos:** Módulos 0-7 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Renderizar un componente y consultarlo por rol | Ver Tema 1 | No uses `getByClassName` |
| 2 | Simular un clic con `userEvent` | Ver Tema 1 | Verifica el resultado visible |
| 3 | Configurar MSW para interceptar una llamada | Ver Tema 2 | Sin red real |
| 4 | Probar el flujo completo: formulario + envío + éxito | Ver Tema 2 | Verifica el mensaje final tras la respuesta mockeada |
| 5 | Probar un hook personalizado con `renderHook` | Ver Tema 3 | Con `act` para las actualizaciones |

**Verificación:** el laboratorio se considera exitoso si todas las pruebas consultan el DOM por rol/texto, si ninguna prueba depende de una petición de red real, y si el hook personalizado se prueba de forma aislada sin un componente visual innecesario.

**Errores comunes y soluciones**

- **Consultar por clase CSS en vez de por rol/texto.** Usa `getByRole`/`getByText` para pruebas resilientes a refactors.
- **Olvidar `server.resetHandlers()` entre pruebas.** Sin él, un manejador personalizado de una prueba puede afectar a las siguientes.
- **No envolver actualizaciones de estado del hook en `act`.** Sin `act`, la aserción puede ejecutarse antes de que React procese la actualización.

---
