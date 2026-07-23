# Módulo 7: Testing e integración continua


## Aprende construyendo

### Tema 1: Vitest y Supertest — pruebas de integración HTTP reales

#### Paso 1 · Objetivo y preparación

Al finalizar podrás probar una ruta HTTP sin depender de un puerto real. **Prerrequisitos:** Node LTS, npm y HTTP básico; ejemplo independiente desde una carpeta vacía.

#### Paso 2 · Contexto y caso real

Una API de entregas debe comprobar estado, cuerpo y códigos antes de desplegar. Probar solo funciones internas no detecta errores de serialización o middleware.

#### Paso 3 · Teoría y analogía aplicada

Vitest ejecuta aserciones; Supertest habla con la aplicación en memoria. Es como probar una puerta con su cerradura real, pero sin abrir todo el edificio al público.

#### Paso 4 · Demostración guiada desde cero

```bash
mkdir ejemplo-vitest-http
cd ejemplo-vitest-http
npm init -y
npm install express
npm install -D vitest supertest
mkdir src test
```

Crea `src/app.js`:

```js
import express from "express";
export const app = express();
app.get("/health", (_req, res) => res.json({ status: "ok" }));
```

Crea `test/health.test.js`:

```js
import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app.js";
describe("GET /health", () => {
  it("devuelve estado OK", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});
```

Añade `"test": "vitest run"` a `package.json` y ejecuta `npm test`. **Resultado esperado:** una prueba pasa sin abrir un puerto. **Fallo deliberado y diagnóstico:** cambia `status` a `ready`; Vitest muestra la diferencia exacta entre cuerpos.

#### Paso 5 · Práctica guiada

Añade una ruta inexistente y prueba `404`. **Pista:** una prueba debe describir el contrato observable, no detalles privados.

#### Paso 6 · Práctica independiente

Prueba un `POST` con body inválido y entrega salida verde y roja, explicando qué regresión detecta cada caso.

#### Paso 7 · Cierre y conexión

Ya probaste una API realista sin red externa. El siguiente tema aislará una base efímera en otra carpeta.

**Errores comunes:** abrir puertos en cada prueba; compartir estado mutable; aserciones demasiado amplias; no esperar promesas; probar implementación en vez de contrato.

**Fuentes oficiales:** [Vitest](https://vitest.dev/guide/), [Supertest](https://github.com/ladjs/supertest) y [Express testing](https://expressjs.com/en/starter/hello-world.html).

**Evidencia de aprendizaje:** entrega la salida de `npm test` con casos 200 y 404.

**Conceptos clave:** petición HTTP real sin puerto abierto, verificación de código de estado y body.

Una prueba unitaria (estudiada en profundidad en el Módulo 9 del track de JavaScript) verifica una función aislada; una prueba de integración HTTP verifica el comportamiento real de un endpoint completo, incluyendo el routing, los middleware, y la lógica de negocio, todos operando juntos exactamente como lo harían en producción. Supertest permite realizar peticiones HTTP reales directamente contra la instancia de la aplicación Express (`request(app).get("/tareas")`) sin necesidad de que la aplicación esté escuchando activamente en un puerto de red real, interceptando la petición a nivel de la propia aplicación Node en memoria, lo que hace estas pruebas considerablemente más rápidas que levantar un servidor de red real y hacer peticiones HTTP genuinas contra él.

Estas pruebas verifican tanto el código de estado HTTP devuelto (`expect(respuesta.status).toBe(200)`) como la estructura y contenido del cuerpo de la respuesta (`expect(Array.isArray(respuesta.body)).toBe(true)`), dando mucha más confianza que una prueba unitaria aislada de que el sistema completo —routing, middleware, parsing, lógica de negocio— funciona correctamente en conjunto, precisamente porque ejercita la misma cadena completa de procesamiento que una petición real de un cliente atravesaría en producción, en vez de verificar cada pieza de forma aislada y asumir que su composición funcionará correctamente sin verificación adicional.

Probar tanto el camino feliz (una petición válida que produce el resultado esperado) como los caminos de error (una petición con datos inválidos que debería producir un `400` con el mensaje de error esperado, estudiado en el Módulo 4) es igualmente importante: una suite de pruebas que solo verifica el camino feliz deja sin cubrir precisamente los escenarios donde bugs de manejo de errores son más probables y más costosos de descubrir tardíamente en producción real.

**Analogía:** una prueba unitaria es como probar individualmente cada engranaje de un reloj por separado; una prueba de integración con Supertest es como dar cuerda al reloj completo ya ensamblado y verificar que efectivamente marca la hora correcta, la única forma de confirmar que todos los engranajes trabajan correctamente juntos como un sistema completo.

**¿Por qué es importante?** Las pruebas de integración con Supertest verifican el comportamiento real de un endpoint completo (routing, middleware, lógica de negocio operando juntos), dando una confianza sustancialmente mayor que pruebas unitarias aisladas de cada pieza por separado.

**Código del ejemplo:**

```js
import request from "supertest";
import { app } from "./app.js";

it("devuelve 200 y un array", async () => {
  const respuesta = await request(app).get("/tareas"); // sin puerto real abierto
  expect(respuesta.status).toBe(200);
  expect(Array.isArray(respuesta.body)).toBe(true);
});
```

### Tema 2: Testcontainers — bases de datos de prueba reales y efímeras

#### Paso 1 · Objetivo y preparación

Al finalizar podrás levantar una base temporal para una prueba y eliminarla al terminar. **Prerrequisitos:** Node LTS y Docker Desktop; ejemplo independiente desde una carpeta vacía.

#### Paso 2 · Contexto y caso real

Una consulta puede funcionar con un mock y fallar con SQL real. Un contenedor efímero reproduce el motor sin compartir datos de desarrollo.

#### Paso 3 · Teoría y analogía aplicada

Testcontainers crea infraestructura aislada y con ciclo de vida controlado. Es un laboratorio desechable: cada ejecución comienza limpio y no contamina otra prueba.

#### Paso 4 · Demostración guiada desde cero

```bash
mkdir ejemplo-testcontainers
cd ejemplo-testcontainers
npm init -y
npm install -D vitest @testcontainers/postgresql
mkdir test
```

Crea `test/postgres.test.js`:

```js
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
let container;
beforeAll(async () => { container = await new PostgreSqlContainer("postgres:16-alpine").start(); });
afterAll(async () => { await container.stop(); });
describe("base efímera", () => {
  it("expone un puerto y credenciales temporales", () => {
    expect(container.getHost()).toBeTruthy();
    expect(container.getPort()).toBeGreaterThan(0);
  });
});
```

Ejecuta `npx vitest run`. **Resultado esperado:** el contenedor inicia, la prueba pasa y se detiene. **Fallo deliberado y diagnóstico:** usa una imagen inexistente; el error indica que Docker no pudo obtener la imagen, no que la consulta fallara.

#### Paso 5 · Práctica guiada

Añade una tabla y una consulta con el cliente PostgreSQL. **Pista:** usa las credenciales que expone el contenedor, nunca una contraseña fija.

#### Paso 6 · Práctica independiente

Fuerza una violación de unicidad y entrega la aserción del error junto con evidencia de limpieza del contenedor.

#### Paso 7 · Cierre y conexión

Ya distingues infraestructura real de un mock. El siguiente tema enseñará a simular servicios externos sin perder el contrato.

Esta misma técnica es la que usará el pipeline de CI del proyecto integrador (API productiva, Módulo 12) para probar las consultas reales contra PostgreSQL en cada commit, sin depender de una base de datos compartida que otros commits puedan ensuciar.

**Cuándo no usarlo:** levantar un contenedor real en cada corrida añade segundos de arranque; para pruebas unitarias puras de lógica de negocio que no tocan la base de datos, un mock o una función pura sin infraestructura es más rápido y suficiente — reserva Testcontainers para las pruebas de integración que sí necesitan verificar comportamiento real del motor.

**Errores comunes:** dejar contenedores vivos; usar tags `latest`; depender del orden de pruebas; compartir volúmenes; ocultar credenciales en el repositorio.

**Fuentes oficiales:** [Testcontainers Node](https://node.testcontainers.org/), [PostgreSQL image](https://hub.docker.com/_/postgres) y [Vitest setup](https://vitest.dev/api/).

**Evidencia de aprendizaje:** entrega la salida de `npx vitest run`, el puerto temporal y la limpieza confirmada.

**Conceptos clave:** contenedor efímero por corrida, aislamiento completo entre ejecuciones.

Probar contra una base de datos real (en vez de mockearla completamente) da mayor confianza de que el código de acceso a datos funciona correctamente con el motor de base de datos real, incluyendo comportamientos específicos de ese motor (restricciones de integridad, tipos de datos, comportamiento exacto de transacciones) que un mock nunca replicaría con total fidelidad. Sin embargo, apuntar las pruebas contra una base de datos "compartida de pruebas" persistente introduce sus propios problemas: pruebas ejecutándose en paralelo (o en distintas máquinas de CI) podrían interferir entre sí modificando los mismos datos compartidos, y el estado de esa base de pruebas compartida podría ensuciarse progresivamente con el tiempo, haciendo las pruebas cada vez menos confiables y predecibles.

Testcontainers resuelve este problema levantando un contenedor Docker real y completamente efímero (por ejemplo, de PostgreSQL) específicamente para la duración de una corrida de pruebas, típicamente en un hook `beforeAll` que se ejecuta antes de cualquier prueba de la suite, y destruyendo ese contenedor completamente al finalizar (`afterAll`), garantizando que cada ejecución completa de la suite de pruebas parte de un estado de base de datos limpio y completamente aislado de cualquier otra ejecución, sin ningún riesgo de interferencia entre pruebas paralelas o entre ejecuciones sucesivas de CI.

Esta combinación —base de datos real (no mockeada) pero completamente efímera y aislada por corrida— ofrece lo mejor de ambos mundos: la confianza de probar contra el motor de base de datos real, sin los problemas de compartir estado entre ejecuciones que una base de pruebas persistente y compartida introduciría. El único costo real es el tiempo adicional necesario para levantar el contenedor al inicio de cada corrida de pruebas, un costo generalmente aceptable dado el beneficio de confianza y aislamiento que proporciona, especialmente en un pipeline de CI (Tema 3) donde levantar un contenedor efímero adicional es una operación estándar y bien soportada.

**Analogía:** Testcontainers es como construir una réplica completa y temporal de un laboratorio de pruebas específicamente para un único experimento, y desmontarla completamente al terminar, en vez de compartir un laboratorio permanente con otros equipos que podrían dejarlo en un estado inesperado o interferir con el experimento en curso.

**¿Por qué es importante?** Testcontainers combina la confianza de probar contra un motor de base de datos real con el aislamiento completo entre ejecuciones que una base de datos compartida de pruebas persistente no puede garantizar de forma confiable.

**Código del ejemplo:**

```js
import { PostgreSqlContainer } from "@testcontainers/postgresql";

let contenedor;
beforeAll(async () => {
  contenedor = await new PostgreSqlContainer().start(); // real, efímero, aislado
  process.env.DATABASE_URL = contenedor.getConnectionUri();
});
afterAll(() => contenedor.stop()); // destruido completamente al terminar
```

### Tema 3: Mocks de servicios externos y CI

#### Paso 1 · Objetivo y preparación

Al finalizar podrás simular una API externa de forma determinista y separar pruebas unitarias de integración. **Prerrequisitos:** Node LTS y promesas; ejemplo independiente desde una carpeta vacía.

#### Paso 2 · Contexto y caso real

Una API de mapas puede ser lenta, costosa o no estar disponible en CI. El código propio debe probarse sin llamar al proveedor real, pero conservando su contrato.

#### Paso 3 · Teoría y analogía aplicada

Un mock es un doble controlado, no una prueba de que el proveedor funciona. Es un simulador de vuelo: entrenas decisiones conocidas y reservas la prueba real para integración.

#### Paso 4 · Demostración guiada desde cero

```bash
mkdir ejemplo-mocks-ci
cd ejemplo-mocks-ci
npm init -y
npm install -D vitest
mkdir src test
```

Crea `src/rutas.js` y `test/rutas.test.js`:

```js
export async function calcularRuta(cliente, origen, destino) {
  const respuesta = await cliente.route(origen, destino);
  if (!respuesta.ok) throw new Error("Proveedor de rutas no disponible");
  return respuesta.distanceKm;
}
```

```js
import { expect, it, vi } from "vitest";
import { calcularRuta } from "../src/rutas.js";
it("usa el contrato del proveedor", async () => {
  const cliente = { route: vi.fn().mockResolvedValue({ ok: true, distanceKm: 4.2 }) };
  await expect(calcularRuta(cliente, "A", "B")).resolves.toBe(4.2);
  expect(cliente.route).toHaveBeenCalledWith("A", "B");
});
```

Añade `"test": "vitest run"` y ejecuta `npm test`. **Resultado esperado:** prueba verde sin red. **Fallo deliberado y diagnóstico:** devuelve `{ ok: false }`; la prueba debe mostrar el error de proveedor y no ocultarlo con un valor cero.

#### Paso 5 · Práctica guiada

Añade timeout simulado con `vi.fn().mockRejectedValue`. **Pista:** prueba la política de reintento separada del cliente.

#### Paso 6 · Práctica independiente

Escribe un workflow de CI que ejecute `npm ci` y `npm test`, y entrega qué secretos no son necesarios para esta suite.

#### Paso 7 · Cierre y conexión

Ya puedes aislar dependencias externas sin falsificar su contrato. El siguiente tema comparará estrategias de testing y debugging.

**Errores comunes:** mockear la función propia; devolver datos imposibles; no verificar argumentos; llamar red real en unit tests; hacer CI dependiente de secretos.

**Fuentes oficiales:** [Vitest mocks](https://vitest.dev/guide/mocking), [GitHub Actions Node](https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-nodejs) y [principio de contratos](https://martinfowler.com/articles/mocksArentStubs.html).

**Evidencia de aprendizaje:** entrega la salida de la prueba de éxito, el fallo rechazado y el workflow ejecutable.

**Conceptos clave:** aislar dependencias externas no controladas, pipeline de CI reproducible.

Mockear servicios externos (un proveedor de envío de email, una pasarela de pago, una API de terceros) es necesario en pruebas automatizadas por razones tanto prácticas como de correctitud: depender de conectividad real a internet y de la disponibilidad de un servicio externo real haría las pruebas lentas, no deterministas (dependientes de la latencia y disponibilidad variable de ese servicio externo), y potencialmente costosas (si el servicio externo cobra por cada uso real, como enviar un email o procesar un pago real cada vez que se ejecuta la suite de pruebas). Mockear la llamada a ese servicio externo (con `vi.spyOn` o similar, estudiado en el Módulo 9 del track de JavaScript) aísla completamente las pruebas de esa dependencia externa no controlada, mientras sigue verificando que el código propio invoca correctamente esa dependencia con los parámetros esperados.

Un pipeline de CI para una API Node típicamente ejecuta, en cada push o pull request: instalación reproducible de dependencias (`npm ci`, estudiado en el Módulo 1), levantamiento de la base de datos de prueba efímera con Testcontainers, y ejecución de la suite completa de pruebas (unitarias y de integración) contra esa base de datos real y aislada, fallando el pipeline completo (y, típicamente, bloqueando el merge del cambio) si cualquier prueba falla. Esta combinación de `npm ci` (instalación exacta y reproducible) con Testcontainers (base de datos real y aislada por ejecución) produce un pipeline de CI que reproduce con alta fidelidad las condiciones reales de ejecución de la aplicación, sin depender de infraestructura compartida frágil ni de configuración manual previa del entorno de CI.

Combinar esta estrategia de testing con el pipeline CI/CD completo estudiado en el Módulo 13 del track DevOps cierra el ciclo completo: cada cambio de código pasa automáticamente por pruebas reales contra una base de datos real antes de considerarse apto para desplegar, la misma disciplina de verificación automatizada que ese track completo enseña aplicada específicamente al contexto de una API Node con persistencia real.

**Analogía:** mockear un servicio externo en pruebas es como practicar un discurso importante frente a un actor que interpreta al cliente real con reacciones controladas, en vez de practicar directamente frente al cliente real cada vez, donde cada ensayo tendría un coste real irreversible; un pipeline de CI con Testcontainers es como un ensayo general completo con todo el elenco real (excepto el actor sustituto para el cliente externo), verificando que la producción entera funciona correctamente antes de la función real ante el público.

**¿Por qué es importante?** Mockear servicios externos hace las pruebas rápidas, deterministas y libres de costes reales de terceros; un pipeline de CI con `npm ci` y Testcontainers reproduce con alta fidelidad las condiciones reales de producción sin depender de infraestructura compartida frágil.

**Configuración del ejemplo:**

```yaml
# .github/workflows/ci.yml
- run: npm ci                    # instalación exacta y reproducible
- run: npm test                  # levanta Testcontainers internamente y corre la suite
```

### Tema 4: Alternativas de testing y debugging

#### Paso 1 · Objetivo y preparación

Al finalizar podrás elegir entre test unitario, integración, E2E y depuración interactiva. **Prerrequisitos:** Node LTS y una prueba Vitest; ejemplo independiente desde una carpeta vacía.

#### Paso 2 · Contexto y caso real

Un equipo necesita feedback rápido sin renunciar a una prueba que atraviese navegador y API. Cada nivel compra confianza a distinto costo.

#### Paso 3 · Teoría y analogía aplicada

La pirámide coloca muchas pruebas unitarias rápidas, menos integraciones y pocas E2E. El debugger permite observar estado; no reemplaza una aserción repetible. Es revisar una bicicleta con piezas separadas, luego ensamblada y finalmente en carretera.

#### Paso 4 · Demostración guiada desde cero

```bash
mkdir ejemplo-debug-testing
cd ejemplo-debug-testing
npm init -y
npm install -D vitest
mkdir src test
```

Crea `src/sumar.js` y `test/sumar.test.js`:

```js
export function sumar(a, b) { return a + b; }
```

```js
import { expect, it } from "vitest";
import { sumar } from "../src/sumar.js";
it("suma dos valores", () => { debugger; expect(sumar(2, 3)).toBe(5); });
```

Ejecuta `npx vitest run`; para inspeccionar el breakpoint usa `node --inspect-brk ./node_modules/vitest/vitest.mjs run`. **Resultado esperado:** prueba verde y, con inspector, ejecución pausada. **Fallo deliberado y diagnóstico:** espera `6`; Vitest muestra la diferencia y permite inspeccionar variables.

#### Paso 5 · Práctica guiada

Añade un caso límite con números negativos. **Pista:** el debugger explica el estado, pero la expectativa documenta el comportamiento.

#### Paso 6 · Práctica independiente

Clasifica tres casos de tu aplicación como unitarios, integración o E2E y justifica el costo y la confianza de cada uno.

#### Paso 7 · Cierre y conexión

Ya puedes elegir una estrategia proporcional y depurar sin reemplazar pruebas. El siguiente módulo tratará rendimiento desde una carpeta nueva.

**Errores comunes:** usar solo E2E; dejar `debugger` en producción; hacer asserts frágiles; medir cobertura como calidad; depurar sin reproducir.

**Fuentes oficiales:** [Node inspector](https://nodejs.org/en/learn/getting-started/debugging), [Vitest](https://vitest.dev/guide/) y [testing pyramid](https://martinfowler.com/articles/practical-test-pyramid.html).

**Evidencia de aprendizaje:** entrega una prueba verde, una salida de fallo y la clasificación razonada de tres casos.

**Conceptos clave:** panorama de frameworks de testing, `--inspect`, Chrome DevTools para Node.

Jest, Mocha combinado con Chai (para aserciones) y Sinon (para mocks/spies), son alternativas ampliamente adoptadas a Vitest en el ecosistema Node, cada una con su propia sintaxis y filosofía de diseño, aunque conceptualmente cubriendo las mismas necesidades fundamentales de testing (organización de pruebas, aserciones, mocks). Jest, en particular, dominó el ecosistema de testing de JavaScript durante buena parte de la década pasada y sigue siendo ampliamente usado en proyectos existentes, especialmente en el ecosistema React (estudiado en su propio track); Vitest, por su integración natural con Vite (Módulo 7 del track de JavaScript) y su API deliberadamente compatible con la de Jest, ha ganado adopción considerable en proyectos nuevos por su velocidad y configuración más simple.

Mocha, más antiguo y minimalista que Jest o Vitest, se centra exclusivamente en la organización y ejecución de pruebas, delegando explícitamente las aserciones a una biblioteca separada como Chai (que ofrece una sintaxis de aserciones expresiva, como `expect(resultado).to.equal(esperado)`) y los mocks/spies a una biblioteca separada como Sinon, en vez de incluir todo integrado en un único paquete como hacen Jest y Vitest, una diferencia de filosofía de diseño (todo integrado frente a piezas componibles independientes) que refleja preferencias distintas de los equipos que adoptan cada enfoque.

El flag `--inspect` (`node --inspect script.js`) habilita el protocolo de depuración de Node, permitiendo conectar las Chrome DevTools (navegando a `chrome://inspect` en Chrome) directamente a un proceso Node en ejecución, con las mismas capacidades familiares de depuración del navegador (breakpoints, inspección de variables, step-through de ejecución) aplicadas ahora a código de servidor, una herramienta de diagnóstico considerablemente más potente que depurar exclusivamente con `console.log` disperso por el código, especialmente útil para diagnosticar comportamientos asíncronos complejos o bugs de lógica difíciles de reproducir con solo inspección de logs.

**Analogía:** Jest, Mocha+Chai+Sinon y Vitest son como distintas cajas de herramientas para el mismo oficio: algunas vienen completamente integradas de fábrica (Jest, Vitest), otras te permiten elegir y combinar piezas específicas de distintos fabricantes según tu preferencia (Mocha con Chai y Sinon por separado). `--inspect` con Chrome DevTools es como tener acceso a un microscopio de precisión para examinar el funcionamiento interno exacto de un proceso en ejecución, en vez de solo observar sus síntomas externos a través de mensajes de log.

**¿Por qué es importante?** Conocer el panorama de alternativas de testing (Jest, Mocha/Chai/Sinon) es útil para trabajar con proyectos existentes que ya las adoptaron. `--inspect` es la bandera que abre un puerto de depuración en Node, conectable desde Chrome DevTools, una capacidad de depuración considerablemente más potente que `console.log` disperso para diagnosticar bugs complejos en código de servidor.

**Prueba en terminal:**

```bash
node --inspect servidor.js
# luego, en Chrome: chrome://inspect → click en "inspect" bajo el proceso listado
# breakpoints, inspección de variables, step-through, igual que en el navegador
```

---


## Laboratorio práctico

**Objetivo del laboratorio:** construir una suite de pruebas de integración completa con Supertest y Testcontainers, integrada en un pipeline de CI con GitHub Actions.

**Requisitos previos:** Docker instalado, Módulos 0-6 completados.

| Paso | Acción | Código/Comando | Explicación |
|---|---|---|---|
| 1 | Escribir un test GET real con Supertest | Ver Tema 1 | Verifica código de estado y estructura del body |
| 2 | Probar un POST con body inválido | Verifica respuesta 400 con mensaje esperado | Cubre el camino de error, no solo el feliz |
| 3 | Configurar Testcontainers | Ver Tema 2 | Levanta PostgreSQL real y efímero solo durante los tests |
| 4 | Escribir un test de integración completo | Crear, consultar, actualizar una tarea | Verifica el estado final en la base real |
| 5 | Mockear una llamada a un servicio externo | Un proveedor de email simulado | Los tests no dependen de conectividad real |
| 6 | Crear el pipeline de CI | GitHub Actions: `npm ci` + `npm test` | Verifica que corre en cada push |

**Verificación:** el laboratorio se considera exitoso si la suite completa de pruebas de integración pasa consistentemente en ejecuciones sucesivas (sin interferencia entre ellas gracias a Testcontainers), y si el pipeline de CI configurado ejecuta la suite completa automáticamente en cada push.

**Errores comunes y soluciones**

- **Apuntar las pruebas a una base de datos compartida persistente en vez de una efímera.** Usa Testcontainers para garantizar aislamiento completo entre ejecuciones.
- **No mockear servicios externos, haciendo las pruebas dependientes de conectividad real.** Mockea siempre dependencias externas no controladas por el propio proyecto.
- **Probar solo el camino feliz, sin cubrir escenarios de error.** Incluye siempre pruebas para los casos de validación fallida y errores esperados.

---
