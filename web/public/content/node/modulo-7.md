# Módulo 7: Testing e integración continua

## Sílabo

**Objetivo general**

Probar endpoints HTTP reales de una API Node, no solo funciones aisladas, usando Supertest para peticiones reales y Testcontainers para bases de datos de prueba efímeras, integrando todo en un pipeline de CI.

**Objetivos específicos**

1. Escribir pruebas de integración HTTP reales con Vitest y Supertest.
2. Levantar una base de datos real y efímera con Testcontainers para pruebas.
3. Mockear servicios externos para que las pruebas no dependan de conectividad real a internet.
4. Configurar un pipeline de CI que instale dependencias, levante la base de prueba y ejecute los tests.

**Contenido**

- Vitest + Supertest.
- Bases de datos de prueba (Testcontainers).
- Mocks de servicios externos.
- Pipeline de CI para una API Node.
- Jest, Mocha, Chai y Sinon como alternativas.
- Debugging con `--inspect` y Chrome DevTools.

**Evaluación**

Una suite de pruebas de integración que levanta la API contra una base de datos real en Docker, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Vitest y Supertest — pruebas de integración HTTP reales

**Conceptos clave:** petición HTTP real sin puerto abierto, verificación de código de estado y body.

Una prueba unitaria (estudiada en profundidad en el Módulo 9 del track de JavaScript) verifica una función aislada; una prueba de integración HTTP verifica el comportamiento real de un endpoint completo, incluyendo el routing, los middleware, y la lógica de negocio, todos operando juntos exactamente como lo harían en producción. Supertest permite realizar peticiones HTTP reales directamente contra la instancia de la aplicación Express (`request(app).get("/tareas")`) sin necesidad de que la aplicación esté escuchando activamente en un puerto de red real, interceptando la petición a nivel de la propia aplicación Node en memoria, lo que hace estas pruebas considerablemente más rápidas que levantar un servidor de red real y hacer peticiones HTTP genuinas contra él.

Estas pruebas verifican tanto el código de estado HTTP devuelto (`expect(respuesta.status).toBe(200)`) como la estructura y contenido del cuerpo de la respuesta (`expect(Array.isArray(respuesta.body)).toBe(true)`), dando mucha más confianza que una prueba unitaria aislada de que el sistema completo —routing, middleware, parsing, lógica de negocio— funciona correctamente en conjunto, precisamente porque ejercita la misma cadena completa de procesamiento que una petición real de un cliente atravesaría en producción, en vez de verificar cada pieza de forma aislada y asumir que su composición funcionará correctamente sin verificación adicional.

Probar tanto el camino feliz (una petición válida que produce el resultado esperado) como los caminos de error (una petición con datos inválidos que debería producir un `400` con el mensaje de error esperado, estudiado en el Módulo 4) es igualmente importante: una suite de pruebas que solo verifica el camino feliz deja sin cubrir precisamente los escenarios donde bugs de manejo de errores son más probables y más costosos de descubrir tardíamente en producción real.

**Analogía:** una prueba unitaria es como probar individualmente cada engranaje de un reloj por separado; una prueba de integración con Supertest es como dar cuerda al reloj completo ya ensamblado y verificar que efectivamente marca la hora correcta, la única forma de confirmar que todos los engranajes trabajan correctamente juntos como un sistema completo.

**¿Por qué es importante?** Las pruebas de integración con Supertest verifican el comportamiento real de un endpoint completo (routing, middleware, lógica de negocio operando juntos), dando una confianza sustancialmente mayor que pruebas unitarias aisladas de cada pieza por separado.

**Diagrama:**

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

**Conceptos clave:** contenedor efímero por corrida, aislamiento completo entre ejecuciones.

Probar contra una base de datos real (en vez de mockearla completamente) da mayor confianza de que el código de acceso a datos funciona correctamente con el motor de base de datos real, incluyendo comportamientos específicos de ese motor (restricciones de integridad, tipos de datos, comportamiento exacto de transacciones) que un mock nunca replicaría con total fidelidad. Sin embargo, apuntar las pruebas contra una base de datos "compartida de pruebas" persistente introduce sus propios problemas: pruebas ejecutándose en paralelo (o en distintas máquinas de CI) podrían interferir entre sí modificando los mismos datos compartidos, y el estado de esa base de pruebas compartida podría ensuciarse progresivamente con el tiempo, haciendo las pruebas cada vez menos confiables y predecibles.

Testcontainers resuelve este problema levantando un contenedor Docker real y completamente efímero (por ejemplo, de PostgreSQL) específicamente para la duración de una corrida de pruebas, típicamente en un hook `beforeAll` que se ejecuta antes de cualquier prueba de la suite, y destruyendo ese contenedor completamente al finalizar (`afterAll`), garantizando que cada ejecución completa de la suite de pruebas parte de un estado de base de datos limpio y completamente aislado de cualquier otra ejecución, sin ningún riesgo de interferencia entre pruebas paralelas o entre ejecuciones sucesivas de CI.

Esta combinación —base de datos real (no mockeada) pero completamente efímera y aislada por corrida— ofrece lo mejor de ambos mundos: la confianza de probar contra el motor de base de datos real, sin los problemas de compartir estado entre ejecuciones que una base de pruebas persistente y compartida introduciría. El único costo real es el tiempo adicional necesario para levantar el contenedor al inicio de cada corrida de pruebas, un costo generalmente aceptable dado el beneficio de confianza y aislamiento que proporciona, especialmente en un pipeline de CI (Tema 3) donde levantar un contenedor efímero adicional es una operación estándar y bien soportada.

**Analogía:** Testcontainers es como construir una réplica completa y temporal de un laboratorio de pruebas específicamente para un único experimento, y desmontarla completamente al terminar, en vez de compartir un laboratorio permanente con otros equipos que podrían dejarlo en un estado inesperado o interferir con el experimento en curso.

**¿Por qué es importante?** Testcontainers combina la confianza de probar contra un motor de base de datos real con el aislamiento completo entre ejecuciones que una base de datos compartida de pruebas persistente no puede garantizar de forma confiable.

**Diagrama:**

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

**Conceptos clave:** aislar dependencias externas no controladas, pipeline de CI reproducible.

Mockear servicios externos (un proveedor de envío de email, una pasarela de pago, una API de terceros) es necesario en pruebas automatizadas por razones tanto prácticas como de correctitud: depender de conectividad real a internet y de la disponibilidad de un servicio externo real haría las pruebas lentas, no deterministas (dependientes de la latencia y disponibilidad variable de ese servicio externo), y potencialmente costosas (si el servicio externo cobra por cada uso real, como enviar un email o procesar un pago real cada vez que se ejecuta la suite de pruebas). Mockear la llamada a ese servicio externo (con `vi.spyOn` o similar, estudiado en el Módulo 9 del track de JavaScript) aísla completamente las pruebas de esa dependencia externa no controlada, mientras sigue verificando que el código propio invoca correctamente esa dependencia con los parámetros esperados.

Un pipeline de CI para una API Node típicamente ejecuta, en cada push o pull request: instalación reproducible de dependencias (`npm ci`, estudiado en el Módulo 1), levantamiento de la base de datos de prueba efímera con Testcontainers, y ejecución de la suite completa de pruebas (unitarias y de integración) contra esa base de datos real y aislada, fallando el pipeline completo (y, típicamente, bloqueando el merge del cambio) si cualquier prueba falla. Esta combinación de `npm ci` (instalación exacta y reproducible) con Testcontainers (base de datos real y aislada por ejecución) produce un pipeline de CI que reproduce con alta fidelidad las condiciones reales de ejecución de la aplicación, sin depender de infraestructura compartida frágil ni de configuración manual previa del entorno de CI.

Combinar esta estrategia de testing con el pipeline CI/CD completo estudiado en el Módulo 13 del track DevOps cierra el ciclo completo: cada cambio de código pasa automáticamente por pruebas reales contra una base de datos real antes de considerarse apto para desplegar, la misma disciplina de verificación automatizada que ese track completo enseña aplicada específicamente al contexto de una API Node con persistencia real.

**Analogía:** mockear un servicio externo en pruebas es como practicar un discurso importante frente a un actor que interpreta al cliente real con reacciones controladas, en vez de practicar directamente frente al cliente real cada vez, donde cada ensayo tendría un coste real irreversible; un pipeline de CI con Testcontainers es como un ensayo general completo con todo el elenco real (excepto el actor sustituto para el cliente externo), verificando que la producción entera funciona correctamente antes de la función real ante el público.

**¿Por qué es importante?** Mockear servicios externos hace las pruebas rápidas, deterministas y libres de costes reales de terceros; un pipeline de CI con `npm ci` y Testcontainers reproduce con alta fidelidad las condiciones reales de producción sin depender de infraestructura compartida frágil.

**Diagrama:**

```yaml
# .github/workflows/ci.yml
- run: npm ci                    # instalación exacta y reproducible
- run: npm test                  # levanta Testcontainers internamente y corre la suite
```

### Tema 4: Alternativas de testing y debugging

**Conceptos clave:** panorama de frameworks de testing, `--inspect`, Chrome DevTools para Node.

Jest, Mocha combinado con Chai (para aserciones) y Sinon (para mocks/spies), son alternativas ampliamente adoptadas a Vitest en el ecosistema Node, cada una con su propia sintaxis y filosofía de diseño, aunque conceptualmente cubriendo las mismas necesidades fundamentales de testing (organización de pruebas, aserciones, mocks). Jest, en particular, dominó el ecosistema de testing de JavaScript durante buena parte de la década pasada y sigue siendo ampliamente usado en proyectos existentes, especialmente en el ecosistema React (estudiado en su propio track); Vitest, por su integración natural con Vite (Módulo 7 del track de JavaScript) y su API deliberadamente compatible con la de Jest, ha ganado adopción considerable en proyectos nuevos por su velocidad y configuración más simple.

Mocha, más antiguo y minimalista que Jest o Vitest, se centra exclusivamente en la organización y ejecución de pruebas, delegando explícitamente las aserciones a una biblioteca separada como Chai (que ofrece una sintaxis de aserciones expresiva, como `expect(resultado).to.equal(esperado)`) y los mocks/spies a una biblioteca separada como Sinon, en vez de incluir todo integrado en un único paquete como hacen Jest y Vitest, una diferencia de filosofía de diseño (todo integrado frente a piezas componibles independientes) que refleja preferencias distintas de los equipos que adoptan cada enfoque.

El flag `--inspect` (`node --inspect script.js`) habilita el protocolo de depuración de Node, permitiendo conectar las Chrome DevTools (navegando a `chrome://inspect` en Chrome) directamente a un proceso Node en ejecución, con las mismas capacidades familiares de depuración del navegador (breakpoints, inspección de variables, step-through de ejecución) aplicadas ahora a código de servidor, una herramienta de diagnóstico considerablemente más potente que depurar exclusivamente con `console.log` disperso por el código, especialmente útil para diagnosticar comportamientos asíncronos complejos o bugs de lógica difíciles de reproducir con solo inspección de logs.

**Analogía:** Jest, Mocha+Chai+Sinon y Vitest son como distintas cajas de herramientas para el mismo oficio: algunas vienen completamente integradas de fábrica (Jest, Vitest), otras te permiten elegir y combinar piezas específicas de distintos fabricantes según tu preferencia (Mocha con Chai y Sinon por separado). `--inspect` con Chrome DevTools es como tener acceso a un microscopio de precisión para examinar el funcionamiento interno exacto de un proceso en ejecución, en vez de solo observar sus síntomas externos a través de mensajes de log.

**¿Por qué es importante?** Conocer el panorama de alternativas de testing (Jest, Mocha/Chai/Sinon) es útil para trabajar con proyectos existentes que ya las adoptaron, y `--inspect` con Chrome DevTools proporciona una capacidad de depuración considerablemente más potente que `console.log` disperso para diagnosticar bugs complejos en código de servidor.

**Diagrama:**

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

## Ejercicios de evaluación

### Ejercicio 1: Confianza de un test de integración con base real

**Enunciado:** explica por qué un test de integración con una base de datos real (efímera) da más confianza que uno que mockea completamente la base de datos.

**Solución esperada:** un mock de la base de datos asume un comportamiento simplificado que podría no reflejar fielmente el comportamiento real del motor (restricciones de integridad, tipos, comportamiento exacto de transacciones); un test contra una base real (aunque efímera) verifica el comportamiento genuino del sistema completo, incluyendo interacciones reales con el motor de base de datos que un mock simplificado no capturaría.

**Criterios de éxito:**
- Explica correctamente que un mock puede no reflejar fielmente el comportamiento real del motor de base de datos.

### Ejercicio 2: Ventaja de Testcontainers sobre una base compartida

**Enunciado:** ¿qué ventaja concreta ofrece Testcontainers sobre apuntar las pruebas a una base de datos compartida de "test" persistente?

**Solución esperada:** Testcontainers garantiza aislamiento completo entre ejecuciones (cada corrida parte de un estado limpio, sin riesgo de interferencia de pruebas paralelas o de ejecuciones anteriores que dejaron datos residuales), mientras que una base compartida persistente puede ensuciarse progresivamente y producir resultados de pruebas inconsistentes o dependientes del orden de ejecución.

**Criterios de éxito:**
- Explica correctamente el aislamiento completo entre ejecuciones como la ventaja clave.

### Ejercicio 3: Qué mockear siempre

**Enunciado:** ¿qué tipo de dependencia deberías mockear siempre en un test, sin excepción, y por qué?

**Solución esperada:** cualquier servicio externo de terceros fuera del control del propio proyecto (proveedores de email, pasarelas de pago, APIs externas), porque depender de su disponibilidad y conectividad real haría las pruebas lentas, no deterministas, y potencialmente costosas si el servicio cobra por uso real.

**Criterios de éxito:**
- Identifica correctamente los servicios externos de terceros como la categoría a mockear siempre.
- Justifica con al menos una de las razones (lentitud, no determinismo, costo).

---

## Resumen del módulo

**Puntos clave**

- Supertest permite pruebas de integración HTTP reales contra una aplicación Express, sin necesidad de un puerto de red real abierto.
- Testcontainers levanta una base de datos real y efímera por corrida de pruebas, combinando confianza real con aislamiento completo.
- Los servicios externos de terceros deben mockearse siempre para pruebas rápidas, deterministas y libres de costes reales.
- Un pipeline de CI con `npm ci` y Testcontainers reproduce con alta fidelidad las condiciones reales sin depender de infraestructura compartida frágil.
- Jest, Mocha/Chai/Sinon son alternativas de testing; `--inspect` con Chrome DevTools ofrece depuración avanzada de código Node.

**Conceptos aprendidos**

- Pruebas de integración HTTP con Vitest y Supertest.
- Bases de datos de prueba reales y efímeras con Testcontainers.
- Mockeo de servicios externos y diseño de pipelines de CI.
- Panorama de alternativas de testing y debugging avanzado de Node.

**Próximos pasos**

En el Módulo 8 aprenderás patrones asíncronos avanzados: Worker Threads para trabajo CPU-bound, el módulo cluster, y colas de trabajo con BullMQ para procesamiento en background.

**Recursos adicionales**

- Documentación oficial de Supertest y de Testcontainers (testcontainers.com).
- Documentación oficial de Vitest, Jest y Mocha.
