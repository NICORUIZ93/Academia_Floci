# Módulo 9: Testing y calidad de código

## Sílabo

**Objetivo general**

Adoptar el testing automatizado como práctica central del desarrollo, escribiendo pruebas rápidas y confiables con Vitest, usando mocks y spies correctamente, e integrando ESLint y Prettier al flujo de trabajo diario.

**Objetivos específicos**

1. Escribir pruebas unitarias con Vitest siguiendo el patrón arrange-act-assert.
2. Usar mocks, spies y fake timers para aislar la unidad bajo prueba.
3. Mockear `fetch` para probar código que depende de peticiones de red sin hacerlas realmente.
4. Configurar ESLint y Prettier, entendiendo su responsabilidad complementaria.
5. Interpretar un reporte de cobertura de código con criterio, sin sobrevalorarlo.

**Contenido**

- Unit testing con Vitest/Jest.
- Mocks, spies y fakes.
- ESLint y Prettier en el flujo de trabajo.
- Cobertura de código: qué medir y qué ignorar.

**Evaluación**

Una suite de pruebas con cobertura mayor al 80% sobre la biblioteca de funciones del Módulo 1, más tres ejercicios de evaluación.

---

## Aprende construyendo

### Tema 1: Unit testing con Vitest

**Conceptos clave:** `describe`/`it`/`expect`, arrange-act-assert, aserciones.

Una prueba unitaria verifica que una pieza aislada de código (típicamente una única función) se comporta como se espera ante entradas específicas, de forma automatizada y repetible, sin depender de verificación manual humana cada vez que el código cambia. Vitest, una herramienta de testing moderna diseñada para integrarse naturalmente con proyectos basados en Vite (Módulo 7), organiza las pruebas con `describe` (para agrupar pruebas relacionadas bajo un nombre descriptivo común) e `it` (o su alias `test`, para definir un caso de prueba individual con una descripción de qué comportamiento específico verifica), usando `expect(valorObtenido).toBe(valorEsperado)` (y muchas otras aserciones específicas según el tipo de comparación necesaria) para declarar la expectativa concreta que debe cumplirse.

El patrón "arrange-act-assert" (organizar-actuar-afirmar) estructura una prueba en tres fases claramente delimitadas, aunque no siempre marcadas explícitamente con comentarios: primero se prepara el estado y los datos necesarios para la prueba (arrange); luego se ejecuta la acción concreta que se quiere verificar, típicamente invocando la función bajo prueba (act); finalmente se afirma que el resultado obtenido coincide con lo esperado (assert). Seguir esta estructura consistentemente, incluso en pruebas simples de una sola línea donde las tres fases colapsan en una expresión compacta, facilita la legibilidad de una suite de pruebas extensa, donde cada prueba comunica claramente su intención sin necesidad de un contexto adicional externo para entenderla.

Una prueba unitaria bien diseñada debe ser determinista (produce siempre el mismo resultado ante las mismas entradas, sin depender de estado externo compartido entre pruebas, del orden de ejecución, o de fuentes de aleatoriedad no controladas) y rápida (idealmente ejecutándose en milisegundos, permitiendo ejecutar la suite completa frecuentemente durante el desarrollo sin fricción de tiempo). Estas dos propiedades —determinismo y velocidad— son las que hacen viable ejecutar una suite de pruebas constantemente durante el desarrollo (o automáticamente en cada commit mediante CI, como se estudió en el track DevOps), en vez de reservarla únicamente para verificaciones esporádicas y manuales.

Escribir la primera prueba de un proyecto —por trivial que sea, como verificar que `sumar(2,3)` devuelve `5`— establece la infraestructura básica (configuración de Vitest, comando de ejecución) sobre la que se construirán progresivamente pruebas más sofisticadas, y es un paso de valor práctico inmediato incluso antes de alcanzar una cobertura extensa del proyecto completo.

**Analogía:** una prueba unitaria es como un control de calidad automatizado en una línea de producción que verifica, de forma consistente y repetible en cada pieza que pasa, que cumple exactamente la especificación esperada, sin depender de que un inspector humano revise manualmente cada pieza individual cada vez que se fabrica una nueva.

**¿Por qué es importante?** El testing automatizado convierte la verificación de correctitud de "revisar manualmente cada vez que algo cambia" en "ejecutar la suite en segundos y confiar en el resultado", habilitando refactorizaciones y cambios con mucha mayor confianza y velocidad.

**Código del ejemplo:**

```js
import { describe, it, expect } from "vitest";
import { sumar } from "./suma.js";

describe("sumar", () => {
  it("suma dos números positivos", () => {
    expect(sumar(2, 3)).toBe(5); // arrange (implícito) → act → assert
  });
});
```

### Tema 2: Mocks, spies y fakes

**Conceptos clave:** aislar la unidad bajo prueba, `vi.fn()`, fake timers.

Un spy (espía) observa las invocaciones de una función real (o de un método de un objeto) sin alterar su comportamiento subyacente, permitiendo verificar después si fue invocada, cuántas veces, y con qué argumentos exactos, sin necesidad de modificar el código bajo prueba para exponer esa información de otra forma. Un mock reemplaza completamente la implementación real de una función o dependencia por una versión controlada y predecible, útil cuando la dependencia real es costosa, lenta, no determinista, o simplemente inapropiada de ejecutar realmente durante una prueba unitaria (una llamada de red real, una escritura real a una base de datos). Un fake es una implementación alternativa simplificada pero funcionalmente equivalente de una dependencia (por ejemplo, una base de datos en memoria en vez de una conexión real), útil cuando se necesita un comportamiento más elaborado que un simple mock estático, pero sin la complejidad y el coste de la dependencia real completa.

`vi.fn()` crea una función simulada que registra automáticamente cada invocación (sus argumentos, cuántas veces fue llamada, qué devolvió), permitiendo aserciones como `expect(spy).toHaveBeenCalledWith("hola")` para verificar exactamente cómo fue usada. `vi.useFakeTimers()` reemplaza los temporizadores reales del entorno (`setTimeout`, `setInterval`) por versiones controladas manualmente por la prueba: en vez de esperar realmente los milisegundos configurados (lo cual haría la suite de pruebas lenta e impráctica para funciones como `debounce`, visto en el Módulo 1), `vi.advanceTimersByTime(ms)` avanza instantáneamente el reloj simulado, disparando cualquier callback de temporizador que debería haberse ejecutado en ese intervalo simulado, permitiendo probar comportamiento dependiente del tiempo en milisegundos reales de ejecución de la prueba, sin ninguna espera real.

Distinguir con precisión mock, spy y fake evita confusión de vocabulario común entre desarrolladores que aprenden testing: un spy observa sin alterar comportamiento; un mock reemplaza completamente con una versión controlada; un fake es una implementación alternativa funcional pero simplificada. En la práctica, muchas bibliotecas de testing (incluyendo Vitest) usan el término "mock" de forma más amplia para referirse a cualquiera de estos tres conceptos indistintamente en su API pública, así que el contexto específico de uso suele ser más importante que memorizar rígidamente la terminología exacta.

Usar mocks y spies con moderación es importante: sobre-mockear una prueba (reemplazando tantas partes del sistema bajo prueba que la prueba termina verificando principalmente el comportamiento de los mocks en vez del comportamiento real del código) reduce el valor real de la prueba como señal confiable de que el código funciona correctamente en producción, un riesgo real que vale la pena tener presente al diseñar cada prueba.

**Analogía:** un spy es como una cámara de vigilancia que registra todo lo que ocurre en una habitación sin intervenir en absoluto en lo que sucede ahí; un mock es como un actor de reparto que reemplaza completamente a una persona real en un ensayo de teatro, actuando exactamente el guion que se le indica; un fake es como un maniquí de entrenamiento médico que se comporta de forma funcionalmente similar a un paciente real para practicar un procedimiento, sin ser una persona real.

**¿Por qué es importante?** Mocks, spies y fakes permiten aislar la unidad de código realmente bajo prueba de sus dependencias externas costosas o no deterministas, haciendo las pruebas rápidas, deterministas y enfocadas exclusivamente en verificar el comportamiento específico que interesa en cada caso.

**Código del ejemplo:**

```js
vi.useFakeTimers();
const spy = vi.fn();
const conDebounce = debounce(spy, 300);
conDebounce(); conDebounce(); conDebounce(); // 3 llamadas rápidas
vi.advanceTimersByTime(300); // avanza el reloj simulado instantáneamente
expect(spy).toHaveBeenCalledTimes(1); // debounce colapsó las 3 en 1 sola ejecución
```

### Tema 3: Mockear fetch

**Conceptos clave:** aislar código dependiente de red, `vi.spyOn` sobre `global.fetch`.

Probar código que depende de `fetch` (como `fetchConReintentos` del Módulo 6) presenta un desafío particular: ejecutar peticiones de red reales durante las pruebas las hace lentas, no deterministas (dependen de la disponibilidad real de un servidor externo y de la latencia de red variable), y difíciles de configurar para probar casos específicos de error que serían difíciles o imposibles de provocar de forma confiable contra un servidor real (como un timeout exacto, o una respuesta HTTP 500 específica). La solución estándar es mockear `fetch` completamente durante las pruebas, reemplazando la función global real por una versión controlada que devuelve exactamente la respuesta simulada que la prueba necesita para verificar un caso específico.

`vi.spyOn(global, "fetch").mockResolvedValue({...})` reemplaza temporalmente `fetch` con una versión que resuelve inmediatamente (sin ninguna latencia real de red) con el objeto de respuesta simulado especificado, típicamente incluyendo al menos `ok` (booleano) y un método `json()` (que a su vez debe devolver una Promesa, replicando fielmente la interfaz real de un objeto `Response`, para que el código bajo prueba que espera esa interfaz específica funcione exactamente igual con la versión simulada que con una respuesta real).

Este enfoque permite probar de forma determinista y rápida escenarios que serían difíciles de reproducir confiablemente contra un servidor real: una respuesta exitosa, una respuesta con código de error HTTP, un fallo de red completo (`mockRejectedValue` en vez de `mockResolvedValue`), o incluso una secuencia específica de respuestas distintas en llamadas sucesivas (útil para probar exactamente la lógica de `fetchConReintentos`, simulando que las primeras dos llamadas fallan y la tercera finalmente tiene éxito, verificando así que la lógica de reintentos se comporta correctamente ante ese patrón específico).

Es importante restaurar el comportamiento original de `fetch` después de cada prueba (Vitest ofrece mecanismos automáticos para esto, como `vi.restoreAllMocks()` en un hook de limpieza), para evitar que el mock configurado en una prueba contamine accidentalmente el comportamiento de pruebas posteriores que no esperan ese mock específico, un error de aislamiento entre pruebas que puede producir fallos confusos y difíciles de diagnosticar si las pruebas no están apropiadamente aisladas entre sí.

**Analogía:** mockear `fetch` es como practicar un discurso importante frente a un actor que interpreta al público real con reacciones controladas y predecibles, en vez de arriesgarse a practicar directamente frente al público real de la presentación final, donde las reacciones son impredecibles y cada ensayo tendría un coste real irreversible.

**¿Por qué es importante?** Mockear `fetch` es la técnica estándar para probar código dependiente de red de forma rápida, determinista y capaz de simular exactamente los escenarios de error que serían difíciles de provocar confiablemente contra servidores reales.

**Código del ejemplo:**

```js
vi.spyOn(global, "fetch").mockResolvedValue({
  ok: true,
  json: async () => ([{ id: 1, nombre: "Ana" }]),
});
// el código bajo prueba que llama fetch() recibe esta respuesta simulada,
// sin ninguna petición de red real ni latencia
```

### Tema 4: ESLint, Prettier y cobertura de código

**Conceptos clave:** análisis estático de calidad frente a formato visual, cobertura de líneas/ramas, límites de la cobertura como métrica.

ESLint y Prettier resuelven dos problemas complementarios pero distintos, y confundir sus responsabilidades es un error conceptual común. ESLint es un analizador estático que detecta errores de lógica, malas prácticas y patrones potencialmente problemáticos en el código (variables declaradas pero nunca usadas, comparaciones con `==` en vez de `===`, promesas creadas pero nunca manejadas), configurables mediante un conjunto de reglas que el equipo decide adoptar según sus estándares de calidad. Prettier, en cambio, se ocupa exclusivamente del formato visual del código (indentación, longitud de línea, comillas simples frente a dobles), sin ninguna opinión sobre la lógica o corrección del código, aplicando un estilo consistente automáticamente sin necesidad de discusión manual sobre preferencias de formato entre miembros del equipo.

Ejecutar ambas herramientas en conjunto —típicamente ESLint configurado para no incluir reglas de formato (delegando esa responsabilidad completamente a Prettier, evitando conflictos entre ambas herramientas compitiendo por el mismo aspecto del código) y Prettier ejecutándose automáticamente al guardar un archivo o como parte de un hook de pre-commit— es la configuración estándar recomendada en proyectos JavaScript modernos, eliminando tanto errores de lógica detectables estáticamente como discusiones improductivas sobre preferencias personales de estilo visual del código.

La cobertura de código, medida típicamente con `vitest --coverage`, cuantifica qué porcentaje de líneas, ramas condicionales, y funciones del código fuente se ejecutó al menos una vez durante la ejecución completa de la suite de pruebas. Un reporte de cobertura es una herramienta valiosa para identificar código completamente no probado (una función nunca invocada por ninguna prueba, o una rama de un `if` que nunca se ejecuta en ningún escenario probado), señalando dónde podrían existir bugs no descubiertos simplemente porque esa porción de código nunca se ejerció durante ninguna prueba.

Sin embargo, un 100% de cobertura no garantiza en absoluto la ausencia de bugs: cobertura mide únicamente que una línea se ejecutó, no que su resultado fue verificado correctamente con una aserción significativa; es perfectamente posible alcanzar 100% de cobertura con pruebas que ejecutan el código pero nunca afirman nada relevante sobre su comportamiento, o que solo prueban el "camino feliz" sin cubrir casos límite genuinamente importantes que técnicamente pasan por líneas ya cubiertas por otro escenario. Por esta razón, la cobertura debería tratarse como una señal útil de qué áreas carecen de cualquier prueba en absoluto, no como un objetivo numérico a maximizar ciegamente sin considerar la calidad real de las aserciones.

**Analogía:** ESLint es como un corrector de estilo que revisa la lógica y coherencia argumental de un texto; Prettier es como un editor que aplica automáticamente un formato tipográfico consistente (fuente, márgenes, espaciado) sin opinar sobre el contenido; la cobertura de código es como verificar qué porcentaje de las páginas de un libro fueron efectivamente leídas por al menos un revisor, sin garantizar que ese revisor haya entendido o verificado correctamente el contenido de cada página leída.

**¿Por qué es importante?** ESLint y Prettier automatizan dos aspectos distintos y complementarios de calidad de código, eliminando tanto errores de lógica detectables como discusiones de estilo; la cobertura es una señal útil de código no probado, pero nunca una garantía de corrección real del comportamiento verificado.

**Prueba en terminal:**

```bash
npm init @eslint/config@latest    # configura reglas de calidad de lógica
npx prettier --write .            # aplica formato visual consistente
npx vitest --coverage             # reporta qué líneas/ramas se ejecutaron
# 100% cobertura ≠ ausencia de bugs; solo significa "se ejecutó", no "se verificó bien"
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

**Objetivo del laboratorio:** construir una suite de pruebas con cobertura significativa sobre la biblioteca de funciones utilitarias del Módulo 1, integrando ESLint y Prettier al flujo de trabajo.

**Requisitos previos:** Módulos 0-8 completados, Node.js instalado.

| Paso | Acción | Comando/Código | Explicación |
|---|---|---|---|
| 1 | Instalar Vitest y escribir la primera prueba | `npm install -D vitest`, `expect(sumar(2,3)).toBe(5)` | Verifica que la suite ejecuta correctamente |
| 2 | Probar `debounce` con fake timers | Ver Tema 2 | Verifica que colapsa múltiples llamadas rápidas en una sola |
| 3 | Usar `vi.fn()` para verificar un callback | Ver Tema 2 | Verifica argumentos exactos con `toHaveBeenCalledWith` |
| 4 | Mockear `fetch` para probar `fetchConReintentos` | Ver Tema 3 | Simula 2 fallos seguidos de un éxito |
| 5 | Configurar ESLint y Prettier | `npm init @eslint/config@latest`, `npx prettier --write .` | Corrige todos los warnings existentes en el código |
| 6 | Ejecutar el reporte de cobertura | `npx vitest --coverage` | Identifica qué rama de código no está cubierta |

**Verificación:** el laboratorio se considera exitoso si la suite de pruebas alcanza más del 80% de cobertura sobre la biblioteca del Módulo 1, si ESLint no reporta ningún warning pendiente, y si la prueba de `fetchConReintentos` verifica correctamente el escenario de reintentos exitosos tras fallos simulados.

**Errores comunes y soluciones**

- **Escribir pruebas que dependen del orden de ejecución de otras pruebas.** Cada prueba debe ser independiente y determinista por sí sola; usa hooks de configuración/limpieza (`beforeEach`/`afterEach`) para restablecer el estado entre pruebas.
- **Perseguir 100% de cobertura sin verificar la calidad de las aserciones.** Revisa que cada prueba afirme algo genuinamente significativo sobre el comportamiento, no solo que ejecute la línea.
- **Olvidar restaurar un mock de `fetch` después de la prueba.** Usa `vi.restoreAllMocks()` en un hook de limpieza para evitar contaminar pruebas posteriores.

---



## Bibliografía y fundamento académico

Estas fuentes sustentan los conceptos y deben consultarse para verificar detalles que cambian entre versiones:

- ECMA International, *ECMAScript Language Specification*.
- MDN Web Docs, guías de JavaScript y Web APIs.
- WHATWG, *HTML Living Standard* y *Fetch Standard*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- Vitest organiza pruebas con `describe`/`it`/`expect`, siguiendo el patrón arrange-act-assert.
- Mocks reemplazan dependencias completas; spies observan sin alterar; fakes son implementaciones alternativas simplificadas.
- Mockear `fetch` permite probar código dependiente de red de forma rápida y determinista.
- ESLint detecta errores de lógica; Prettier aplica formato visual consistente; ambos son complementarios, no intercambiables.
- La cobertura de código señala qué no está probado en absoluto, pero no garantiza corrección: mide ejecución, no verificación.

**Conceptos aprendidos**

- Estructura y buenas prácticas de pruebas unitarias con Vitest.
- Mocks, spies, fakes y fake timers.
- Técnicas para mockear `fetch` de forma robusta.
- Configuración e integración de ESLint y Prettier.
- Interpretación crítica de reportes de cobertura de código.

**Próximos pasos**

En el Módulo 10 aprenderás patrones avanzados de rendimiento: debounce/throttle en profundidad, memoización, Web Workers, y cómo perfilar y optimizar código lento con evidencia medible.

**Recursos adicionales**

- Documentación oficial de Vitest (vitest.dev).
- Documentación oficial de ESLint y Prettier.
- Martin Fowler: "Mocks Aren't Stubs", para profundizar en las distinciones de terminología de test doubles.
