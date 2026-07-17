# Módulo 8: Testing en React

## Sílabo

**Objetivo general**

Probar componentes React desde la perspectiva de un usuario real, no de los detalles internos de implementación, usando React Testing Library, Mock Service Worker para interceptar peticiones HTTP, y testing de hooks personalizados.

**Objetivos específicos**

1. Consultar el DOM por rol/texto en vez de por clase CSS con React Testing Library.
2. Simular interacciones de usuario con `userEvent`.
3. Interceptar peticiones HTTP en pruebas con MSW.
4. Escribir un test de un flujo completo (formulario + fetching).
5. Probar hooks personalizados con `renderHook`.

**Contenido**

- React Testing Library: queries por rol/texto.
- Mocking de requests HTTP con MSW.
- Testing de hooks personalizados.
- Vitest como runner.

**Evaluación**

Suite de pruebas de un flujo completo (formulario + fetching) con MSW, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Queries por rol, no por clase CSS

**Conceptos clave:** `getByRole`, `getByText`, resiliencia a refactors.

React Testing Library promueve deliberadamente consultar el DOM renderizado de la misma forma en que un usuario real (o una tecnología asistiva como un lector de pantalla) identificaría un elemento: por su rol semántico de accesibilidad (`screen.getByRole('button', { name: /enviar/i })`) o por el texto visible que muestra (`screen.getByText(/enviado con éxito/i)`), evitando deliberadamente consultas basadas en detalles internos de implementación como nombres de clases CSS o la estructura exacta del árbol DOM interno (`getByClassName`, deliberadamente no ofrecido como API principal por la librería), un principio de diseño idéntico al estudiado para Angular Testing Library en el Módulo 10 del track de Angular.

Esta elección deliberada produce pruebas que sobreviven a refactors internos del componente que no cambian su comportamiento observable: si se reorganiza el HTML interno de un componente, o se renombra una clase CSS puramente por razones cosméticas, una prueba que consulta por rol/texto sigue pasando sin cambios, mientras que una prueba que dependiera de un selector CSS interno específico se rompería inmediatamente ante ese mismo cambio cosmético, aunque el comportamiento real del componente permanezca completamente intacto.

**Analogía:** consultar por rol/texto es como identificar a alguien por su función visible en una obra de teatro (el actor que hace de rey) en vez de por el número de camerino que ocupa detrás del escenario: si cambia de camerino (un detalle interno irrelevante), sigue siendo identificable de la misma forma por su rol visible en la obra.

**¿Por qué es importante?** Consultar por rol/texto en vez de por selectores de implementación hace que las pruebas sobrevivan a refactors internos cosméticos que no afectan el comportamiento real observable del componente.

**Diagrama:**

```jsx
render(<Formulario />);
const boton = screen.getByRole('button', { name: /enviar/i }); // como lo "vería" un usuario/lector de pantalla
await userEvent.click(boton);
expect(screen.getByText(/enviado con éxito/i)).toBeInTheDocument();
```

### Tema 2: Mock Service Worker (MSW)

**Conceptos clave:** interceptación a nivel de red, sin conocimiento del código de producción.

MSW intercepta peticiones HTTP a nivel de red (registrando un service worker o, en entornos de prueba, interceptando directamente las llamadas de red del entorno de ejecución) en vez de parchear directamente la función `fetch` global del código de la aplicación (`vi.fn()` o un mock manual de `fetch`, un enfoque alternativo pero más frágil, dado que requiere que el mock replique exactamente la forma en que el código de producción invoca `fetch`); con MSW, el código de producción realiza sus peticiones exactamente igual que en producción real, sin ninguna modificación ni conocimiento de que está siendo interceptado, siendo el propio MSW el que intercepta esas peticiones a nivel de red antes de que lleguen a un servidor real.

`setupServer(http.get('/api/usuarios', () => HttpResponse.json([{ id: 1, nombre: 'Ana' }])))` define un manejador que responde a peticiones GET hacia esa ruta específica con datos simulados; `server.listen()` activa la interceptación antes de que las pruebas corran, `server.resetHandlers()` restaura los manejadores por defecto entre pruebas individuales (evitando que un manejador personalizado definido en una prueba específica afecte accidentalmente a pruebas posteriores), y `server.close()` detiene la interceptación al finalizar toda la suite.

**Analogía:** MSW es como un servidor de pruebas que se hace pasar de forma completamente transparente por el servidor real en una red aislada, de modo que el código bajo prueba nunca se entera de que está hablando con un impostor, en vez de reemplazar directamente la línea telefónica del código bajo prueba con un cable falso que requiere modificar el propio código para usarlo.

**¿Por qué es importante?** MSW intercepta a nivel de red, permitiendo que el código de producción se pruebe exactamente como se ejecutaría en producción real, sin necesidad de modificarlo ni de mockear directamente `fetch` de forma frágil.

**Diagrama:**

```js
const server = setupServer(
  http.get('/api/usuarios', () => HttpResponse.json([{ id: 1, nombre: 'Ana' }]))
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Tema 3: Testing de hooks personalizados

**Conceptos clave:** `renderHook`, `act`, aislar la lógica del hook de un componente visual.

`renderHook(() => useContador())` permite probar un hook personalizado de forma aislada, sin necesidad de crear un componente de prueba dedicado únicamente para invocar ese hook y exponer indirectamente su resultado; el `result` devuelto expone `.current` con el valor actual retornado por el hook, actualizándose automáticamente entre renders sucesivos provocados dentro de la prueba. `act(() => result.current.incrementar())` envuelve cualquier interacción que dispare una actualización de estado dentro del hook, garantizando que React procese completamente esa actualización (incluyendo cualquier efecto asociado) antes de que la aserción siguiente se ejecute, de forma análoga en propósito a `await fixture.whenStable()` en las pruebas de Angular (Módulo 10 del track de Angular).

Probar hooks personalizados de forma aislada, sin envolverlos en un componente visual completo, mantiene la prueba enfocada específicamente en la lógica del hook (sus transiciones de estado, sus efectos), sin acoplar esa prueba a detalles de renderizado visual que no tienen relación real con la lógica que efectivamente se está verificando.

**Analogía:** probar un hook con `renderHook` es como probar el motor de un vehículo en un banco de pruebas aislado, verificando su comportamiento sin necesidad de montar la carrocería completa del vehículo únicamente para poder encenderlo.

**¿Por qué es importante?** `renderHook` aísla la prueba de un hook personalizado de cualquier componente visual innecesario, manteniendo la prueba enfocada específicamente en la lógica de estado y efectos del hook.

**Diagrama:**

```jsx
const { result } = renderHook(() => useContador());
act(() => result.current.incrementar());
expect(result.current.valor).toBe(1);
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

## Ejercicios de evaluación

### Ejercicio 1: Por qué evitar queries por clase CSS

**Enunciado:** explica por qué Testing Library evita deliberadamente queries por clase CSS o estructura del DOM.

**Solución esperada:** consultar por clase CSS o estructura interna acopla la prueba a detalles de implementación que pueden cambiar por razones puramente cosméticas sin afectar el comportamiento real del componente; consultar por rol/texto refleja cómo un usuario real (o una tecnología asistiva) identifica ese elemento, haciendo que la prueba sobreviva a esos refactors cosméticos.

**Criterios de éxito:**
- Explica correctamente el acoplamiento a detalles de implementación evitado por las queries de rol/texto.

### Ejercicio 2: MSW frente a mockear fetch directamente

**Enunciado:** ¿qué ventaja da MSW sobre mockear `fetch` directamente con `vi.fn()`?

**Solución esperada:** MSW intercepta a nivel de red, permitiendo que el código de producción realice sus peticiones exactamente como en producción real, sin ninguna modificación ni conocimiento de que está siendo interceptado; mockear `fetch` directamente requiere que el mock replique exactamente cómo el código invoca `fetch`, un acoplamiento más frágil a los detalles internos de esa invocación específica.

**Criterios de éxito:**
- Explica correctamente la interceptación transparente a nivel de red de MSW frente al acoplamiento de mockear `fetch` directamente.

### Ejercicio 3: Testing de hooks aislado

**Enunciado:** ¿qué ventaja da `renderHook` frente a crear un componente de prueba dedicado únicamente para probar un hook personalizado?

**Solución esperada:** `renderHook` prueba la lógica del hook de forma aislada, sin acoplar la prueba a detalles de renderizado visual de un componente que no tienen relación real con la lógica de estado y efectos que efectivamente se está verificando, manteniendo la prueba más simple y enfocada.

**Criterios de éxito:**
- Explica correctamente el aislamiento de la lógica del hook respecto a detalles visuales innecesarios.

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

- Meta Open Source, *React Documentation*.
- WHATWG, estándares de DOM, HTML y Fetch.
- W3C, *Web Content Accessibility Guidelines (WCAG)*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- React Testing Library consulta por rol/texto, produciendo pruebas resilientes a refactors internos cosméticos.
- MSW intercepta peticiones HTTP a nivel de red, sin requerir modificar el código de producción bajo prueba.
- `renderHook` prueba hooks personalizados de forma aislada, sin un componente visual innecesario.

**Conceptos aprendidos**

- Queries de React Testing Library por rol/texto.
- Mock Service Worker para interceptar peticiones HTTP.
- Testing de hooks personalizados con `renderHook` y `act`.

**Próximos pasos**

En el Módulo 9 aprenderás performance en React: React DevTools Profiler, `memo`/`useMemo`/`useCallback` con criterio, virtualización y `useTransition`.

**Recursos adicionales**

- Documentación de React Testing Library (testing-library.com) y Mock Service Worker (mswjs.io).
