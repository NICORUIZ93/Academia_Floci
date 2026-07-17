# Módulo 11: TypeScript esencial para devs de JavaScript

## Sílabo

**Objetivo general**

Adquirir el TypeScript esencial y suficiente para ser productivo desde el primer día en Angular, React con tipos o Node tipado, entendiendo tanto el poder como los límites reales del sistema de tipos.

**Objetivos específicos**

1. Definir tipos básicos, interfaces y type aliases.
2. Escribir funciones genéricas reutilizables para múltiples tipos.
3. Aplicar narrowing para manejar valores de tipo unión de forma segura.
4. Configurar `tsconfig.json` en modo estricto y entender sus implicaciones.
5. Explicar por qué TypeScript no protege contra datos mal formados que llegan en runtime.

**Contenido**

- Tipos básicos, interfaces y type aliases.
- Generics.
- Narrowing y union types.
- `tsconfig` esencial y modo strict.

**Evaluación**

Una migración de un módulo JavaScript existente a TypeScript estricto sin usar `any`, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Tipos básicos, interfaces y type aliases

**Conceptos clave:** anotaciones de tipo, `interface`, `type`, tipos opcionales y unión.

TypeScript añade un sistema de tipos estático sobre JavaScript, verificado en tiempo de compilación (no en tiempo de ejecución), permitiendo declarar explícitamente qué forma de datos espera y produce cada función, variable y estructura. Una `interface` describe la forma esperada de un objeto: qué propiedades tiene, de qué tipo es cada una, y cuáles son opcionales (marcadas con `?`, como `rol?: "admin" | "lector"`, indicando que la propiedad puede estar ausente sin que eso sea un error de tipo). Un `type alias` (`type EstadoPedido = "pendiente" | "enviado" | "entregado";`) da un nombre reutilizable a cualquier tipo, incluyendo tipos unión (donde el valor debe ser exactamente uno de un conjunto específico de valores literales posibles, no cualquier string arbitrario).

La diferencia práctica entre `interface` y `type` es sutil pero relevante en casos avanzados: una `interface` puede extenderse posteriormente en declaraciones separadas (declaration merging) y es la forma tradicionalmente preferida para describir la forma de objetos y clases; un `type` es más flexible para expresar uniones, intersecciones y tipos que no son simplemente formas de objeto (como el tipo unión `EstadoPedido` del ejemplo, que no tendría sentido expresar como `interface`). En la práctica cotidiana, muchos equipos adoptan la convención de usar `interface` para formas de objetos y `type` para todo lo demás (uniones, tipos primitivos con nombre, tipos de función), aunque ambas herramientas se solapan considerablemente y la elección entre ellas para casos simples es, en gran medida, una cuestión de convención de equipo más que de una diferencia técnica decisiva.

Anotar el tipo de retorno de una función explícitamente (`function saludar(usuario: Usuario): string {...}`) no es estrictamente necesario en la mayoría de casos, porque TypeScript infiere automáticamente el tipo de retorno a partir del cuerpo de la función; sin embargo, anotarlo explícitamente en funciones públicas o exportadas es una práctica recomendada, porque actúa como documentación verificada por el compilador y como una salvaguarda que detecta inmediatamente si una modificación futura del cuerpo de la función cambia accidentalmente su tipo de retorno de forma incompatible con su uso en el resto del código.

Definir tipos precisos para las estructuras de datos centrales de una aplicación desde el principio (en vez de posponerlo o usar tipos genéricos vagos) paga dividendos considerables a medida que el proyecto crece: cada uso incorrecto de esa estructura en cualquier parte del código se detecta inmediatamente en tiempo de compilación, mucho antes de que ese error llegue a manifestarse como un bug real en producción observado por un usuario final.

**Analogía:** una `interface` es como el plano arquitectónico formal de un edificio, especificando exactamente qué habitaciones existen y de qué tipo es cada una (algunas opcionales, como un sótano que puede o no estar presente); un `type alias` con unión es como una lista cerrada y explícita de códigos postales válidos para una zona de entrega, donde cualquier valor fuera de esa lista específica se rechaza de inmediato como inválido.

**¿Por qué es importante?** Definir tipos precisos convierte errores que de otro modo se descubrirían en producción (accediendo a una propiedad que no existe, pasando un tipo incorrecto a una función) en errores detectados inmediatamente en tiempo de compilación, antes de que el código llegue siquiera a ejecutarse.

**Diagrama:**

```ts
interface Usuario {
  id: number;
  nombre: string;
  rol?: "admin" | "lector"; // opcional, union type
}
type EstadoPedido = "pendiente" | "enviado" | "entregado";
function saludar(usuario: Usuario): string {
  return `Hola, ${usuario.nombre}`;
}
```

### Tema 2: Generics

**Conceptos clave:** funciones y tipos parametrizados, inferencia automática de tipo genérico.

Los generics permiten escribir funciones, interfaces y clases que funcionan con cualquier tipo, sin sacrificar la seguridad de tipos específica de cada uso concreto: `function primero<T>(lista: T[]): T | undefined { return lista[0]; }` define una función que acepta un array de cualquier tipo `T` (un parámetro de tipo, no un valor), y devuelve un valor de ese mismo tipo `T` (o `undefined` si el array está vacío), preservando la relación de tipo entre la entrada y la salida: invocar `primero([1, 2, 3])` produce un resultado tipado como `number | undefined`, mientras que invocar `primero(["a", "b"])` produce un resultado tipado como `string | undefined`, sin necesidad de escribir una versión separada de la función para cada tipo posible de array.

En la mayoría de los casos, no es necesario especificar explícitamente el tipo genérico al invocar una función genérica (`primero<number>([1,2,3])`); TypeScript infiere automáticamente `T` a partir de los argumentos proporcionados en la llamada, y solo es necesario especificarlo explícitamente en casos donde la inferencia automática sería ambigua o insuficiente para determinar el tipo con precisión (por ejemplo, al invocar una función genérica sin ningún argumento cuyo tipo dependa de `T`, donde no hay ninguna pista disponible en la llamada para inferir el tipo automáticamente).

Sin generics, la alternativa sería usar `any` (renunciando a toda verificación de tipo, perdiendo por completo la seguridad que TypeScript ofrece) o escribir una versión separada y duplicada de la función para cada tipo específico necesario (una violación directa del principio de no repetir código, y una carga de mantenimiento creciente a medida que se necesitan más tipos). Los generics resuelven exactamente esta tensión: preservan la reutilización de código genérico sin sacrificar ninguna precisión de tipo específica para cada uso concreto de esa función genérica.

Los generics se extienden más allá de funciones simples a interfaces y clases completas (`interface Caja<T> { contenido: T; }`), y son la base sobre la que se construyen tipos utilitarios extremadamente comunes en código TypeScript real, como `Array<T>` (la propia notación genérica de array), `Promise<T>` (una promesa que resuelve con un valor de tipo `T` específico), y `Map<K, V>` (con tipos de clave y valor genéricos independientes), todos ejemplos de tipos genéricos ya integrados en el propio lenguaje que se usan constantemente sin necesariamente notar explícitamente que son, en efecto, generics.

**Analogía:** una función genérica es como una plantilla de contrato legal con espacios en blanco marcados consistentemente (`[NOMBRE]`, `[NOMBRE]` de nuevo en otra cláusula), donde rellenar todos los espacios con el mismo valor específico (por ejemplo, "Juan Pérez") en cada uso concreto del contrato mantiene la consistencia interna del documento, sin necesidad de redactar un contrato completamente distinto para cada persona que lo firme.

**¿Por qué es importante?** Los generics permiten escribir código verdaderamente reutilizable sin sacrificar seguridad de tipos, y son omnipresentes en TypeScript real (incluyendo tipos integrados del lenguaje como `Array`, `Promise` y `Map`), haciendo indispensable entenderlos para leer y escribir TypeScript idiomático con fluidez.

**Diagrama:**

```ts
function primero<T>(lista: T[]): T | undefined {
  return lista[0];
}
primero([1, 2, 3]);   // T inferido como number → resultado: number | undefined
primero(["a", "b"]);  // T inferido como string → resultado: string | undefined
```

### Tema 3: Narrowing y union types

**Conceptos clave:** restricción progresiva de tipo posible, `typeof`, `instanceof`, `in`.

Un tipo unión (`string | number`) indica que un valor puede ser de cualquiera de los tipos listados, pero dentro del cuerpo de una función, TypeScript no permite usar directamente métodos específicos de un solo tipo (como `.toFixed()`, exclusivo de `number`) sobre un valor cuyo tipo declarado es una unión, precisamente porque el valor real podría ser del otro tipo de la unión en ese momento específico, y aplicar un método incompatible causaría un error real en tiempo de ejecución. El narrowing es el proceso mediante el cual, dentro de una rama condicional específica del código, TypeScript reduce progresivamente el conjunto de tipos posibles de una variable según las comprobaciones explícitas realizadas en el código (verificaciones que el propio desarrollador ya necesitaría hacer en JavaScript puro para manejar el valor correctamente, pero que en TypeScript además informan al compilador sobre el tipo específico dentro de esa rama).

`typeof valor === "number"` es la forma más común de narrowing para tipos primitivos: dentro del bloque `if` correspondiente, TypeScript automáticamente reduce (narrows) el tipo de `valor` a `number` específicamente para ese bloque, permitiendo usar `.toFixed()` con seguridad total sin ningún error de tipo, mientras que en la rama `else` correspondiente, TypeScript sabe automáticamente que el tipo restante debe ser `string` (el otro miembro de la unión original), permitiendo usar `.toUpperCase()` con la misma seguridad garantizada por el compilador.

`instanceof` cumple un papel de narrowing equivalente para tipos de clase (`valor instanceof Error` reduce el tipo dentro de esa rama a la clase específica `Error`, permitiendo acceder con seguridad a sus propiedades y métodos específicos como `.message`), y el operador `in` permite narrowing basado en la presencia de una propiedad específica (`"volar" in animal` reduce el tipo a la variante de una unión de tipos de objeto que efectivamente incluye esa propiedad `volar`, distinguiendo entre distintas formas posibles de un objeto dentro de una unión de tipos de estructura).

El narrowing es lo que hace que trabajar con tipos unión en TypeScript sea seguro y ergonómico simultáneamente: en vez de forzar una conversión explícita insegura (`as number`, que el desarrollador podría escribir incorrectamente sin ninguna verificación real), el narrowing exige (y aprovecha) verificaciones explícitas del tipo real del valor antes de permitir operaciones específicas de ese tipo, garantizando en tiempo de compilación que esas operaciones nunca se aplicarán accidentalmente al tipo incorrecto de la unión.

**Analogía:** el narrowing es como un guardia de seguridad en la entrada de dos salas distintas de un evento (una para adultos, otra para menores) que, tras verificar la identificación de cada visitante en la puerta compartida de entrada, dirige a cada persona hacia la sala correspondiente exacta; una vez dentro de una sala específica, el personal de esa sala puede confiar con seguridad total en que todos los presentes cumplen exactamente el criterio verificado en la puerta, sin necesidad de volver a comprobarlo.

**¿Por qué es importante?** El narrowing permite trabajar con tipos unión de forma completamente segura, sin conversiones de tipo forzadas e inseguras, garantizando en tiempo de compilación que operaciones específicas de un tipo nunca se aplican accidentalmente al otro tipo de la unión.

**Diagrama:**

```ts
function formatear(valor: string | number): string {
  if (typeof valor === "number") {
    return valor.toFixed(2); // aquí TS sabe con certeza que valor es number
  }
  return valor.toUpperCase(); // aquí TS sabe con certeza que valor es string
}
```

### Tema 4: tsconfig esencial y modo strict

**Conceptos clave:** `strict`, `noImplicitAny`, `noUncheckedIndexedAccess`, límites de TypeScript en runtime.

`tsconfig.json` configura el comportamiento del compilador de TypeScript para un proyecto, y la opción más importante de todas es `"strict": true`, que activa simultáneamente un conjunto completo de verificaciones más rigurosas (incluyendo `noImplicitAny`, `strictNullChecks`, y varias otras), en vez de tener que activarlas manualmente una por una. Adoptar `strict` desde el inicio de un proyecto nuevo es la práctica ampliamente recomendada por la comunidad de TypeScript, porque migrar un proyecto grande existente hacia el modo estricto después de haberlo desarrollado sin él suele revelar una cantidad considerable de errores de tipo previamente ocultos, un esfuerzo de corrección que crece proporcionalmente con el tamaño acumulado del proyecto.

`noImplicitAny`, incluida dentro de `strict`, exige que cada parámetro y variable tenga un tipo explícito o inferible; sin esta opción, TypeScript permitiría silenciosamente que una variable sin anotación de tipo explícita se trate implícitamente como `any` (el tipo que desactiva completamente la verificación de tipos, aceptando cualquier valor y cualquier operación sobre él sin ninguna comprobación), socavando silenciosamente gran parte del valor real que TypeScript ofrece. `strictNullChecks`, otra verificación clave incluida en `strict`, obliga a manejar explícitamente los casos donde un valor podría ser `null` o `undefined`, en vez de asumir implícitamente (y con frecuencia incorrectamente) que un valor siempre está presente, una fuente extremadamente común de errores en tiempo de ejecución en JavaScript puro sin esta protección adicional del compilador.

`noUncheckedIndexedAccess`, una opción adicional recomendada más allá del propio `strict`, hace que acceder a un array o a un objeto mediante un índice (`array[i]`) devuelva un tipo que incluye explícitamente `undefined` en su unión, reflejando con precisión la realidad de que ese índice específico podría estar fuera de rango, en vez de asumir optimistamente (y de forma potencialmente incorrecta) que el acceso siempre produce un valor válido del tipo esperado del array.

Es fundamental entender un límite real e importante de TypeScript, incluso en su configuración más estricta posible: todas estas verificaciones ocurren exclusivamente en tiempo de compilación, sobre el código fuente tal como está escrito; TypeScript no tiene ninguna forma de verificar en tiempo de ejecución que datos provenientes de una fuente externa (como la respuesta JSON de una API, vista en el Módulo 6) realmente cumplen la forma declarada por una `interface`. Si una API cambia su formato de respuesta sin que el código TypeScript se actualice para reflejarlo, TypeScript confiará ciegamente en la anotación de tipo declarada (`interface Usuario`), sin verificar en absoluto que los datos reales recibidos en tiempo de ejecución realmente tengan esa forma exacta, un desajuste que solo una biblioteca de validación en tiempo de ejecución (como Zod) puede detectar de forma efectiva, verificando explícitamente la forma real de los datos externos en el momento en que se reciben, más allá de lo que TypeScript puede garantizar únicamente en tiempo de compilación.

**Analogía:** el modo `strict` de TypeScript es como un inspector de calidad extremadamente meticuloso que revisa cada pieza de un producto antes de que salga de la fábrica (tiempo de compilación); pero ese inspector nunca puede garantizar que un proveedor externo de materia prima (una API externa) siga entregando exactamente la especificación acordada en cada envío futuro, sin un control de calidad adicional específico verificando cada envío real a su llegada.

**¿Por qué es importante?** El modo estricto maximiza las garantías que TypeScript puede ofrecer en tiempo de compilación, pero entender que esas garantías no se extienden a datos externos verificados únicamente en tiempo de ejecución es esencial para diseñar aplicaciones robustas frente a APIs externas que puedan cambiar o comportarse de forma inesperada.

**Diagrama:**

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noUncheckedIndexedAccess": true
  }
}
```
```
TypeScript garantiza: el código FUENTE respeta los tipos declarados (compilación)
TypeScript NO garantiza: los datos EXTERNOS en runtime cumplen esos tipos
  (requiere validación adicional en runtime, ej. con Zod, para esa garantía)
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

**Objetivo del laboratorio:** migrar un módulo JavaScript existente (la biblioteca de funciones del Módulo 1) a TypeScript estricto, sin usar `any` en ningún punto.

**Requisitos previos:** Módulos 0-10 completados, TypeScript instalado (`npm install -D typescript`).

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Renombrar un archivo `.js` a `.ts` | Activa `strict: true` en `tsconfig.json` | Corrige todos los errores que aparezcan |
| 2 | Definir `interface Usuario` y `type EstadoPedido` | Ver Tema 1 | Úsalos en al menos una función real |
| 3 | Escribir una función genérica `primero<T>` | Ver Tema 2 | Verifica que funciona para arrays de cualquier tipo |
| 4 | Aplicar narrowing sobre un parámetro `string | number` | Ver Tema 3 | Usa `typeof` para manejar ambos casos con seguridad |
| 5 | Tipar la respuesta de un `fetch` con una interface | Combina con el Módulo 6 | Añade un type guard que valide la forma real en runtime |
| 6 | Activar `noImplicitAny` y corregir cada `any` implícito | Revisa el código del Módulo 1 migrado | Ningún `any`, ni implícito ni explícito, debe quedar |

**Verificación:** el laboratorio se considera exitoso si `tsc --noEmit` (o el comando equivalente de verificación de tipos) no reporta ningún error sobre el módulo migrado, y si una búsqueda explícita de la palabra `any` en el código migrado no encuentra ninguna ocurrencia.

**Errores comunes y soluciones**

- **Usar `as any` para silenciar un error de tipo en vez de resolverlo correctamente.** Esto anula completamente la verificación de tipos en ese punto; busca la anotación de tipo correcta en su lugar, o usa un type guard apropiado.
- **Asumir que tipar la respuesta de una API con una `interface` garantiza que los datos reales cumplen esa forma.** Recuerda que TypeScript no verifica datos externos en runtime; añade validación explícita si la fuente externa no es completamente confiable.
- **Olvidar manejar el caso `undefined` al indexar un array con `noUncheckedIndexedAccess` activado.** Verifica explícitamente antes de usar el valor, en vez de asumir que siempre existe.

---

## Ejercicios de evaluación

### Ejercicio 1: any frente a tipado correcto

**Enunciado:** explica qué pierdes realmente, en términos concretos y verificables por el compilador, si usas `any` en vez de tipar correctamente un parámetro de función.

**Solución esperada:** con `any`, el compilador no verifica ninguna operación realizada sobre ese valor: se puede invocar cualquier método, acceder a cualquier propiedad, o pasarlo a cualquier función, sin ningún error de compilación, incluso si esas operaciones son incorrectas para el valor real en tiempo de ejecución. Se pierde toda la verificación estática que TypeScript ofrece específicamente para ese valor, además de perder el autocompletado preciso del editor y cualquier documentación implícita que un tipo correcto proporcionaría a otros desarrolladores que lean o usen esa función después.

**Criterios de éxito:**
- Explica que `any` desactiva completamente la verificación de tipos para ese valor específico.
- Menciona al menos una consecuencia práctica adicional (pérdida de autocompletado, documentación implícita perdida).

### Ejercicio 2: interface frente a type

**Enunciado:** ¿en qué situación usarías un `type alias` en vez de una `interface`, dando un ejemplo concreto?

**Solución esperada:** un `type alias` es necesario (no solo preferible) para expresar tipos unión (`type Estado = "activo" | "inactivo";`), tipos de función independientes, o combinaciones de tipos mediante intersección, casos que una `interface` no puede expresar directamente por sí sola. Una `interface`, en cambio, es la convención más común para describir la forma de un objeto o de una clase, especialmente cuando se anticipa la necesidad de extenderla posteriormente en declaraciones separadas.

**Criterios de éxito:**
- Da un ejemplo correcto de un caso donde `type` es necesario (típicamente una unión).
- Explica correctamente por qué ese caso específico no se puede expresar de la misma forma con `interface`.

### Ejercicio 3: Los límites de TypeScript en runtime

**Enunciado:** explica por qué TypeScript no puede proteger contra un caso en el que una API externa cambia el formato de su respuesta JSON sin previo aviso, y qué se necesitaría adicionalmente para detectar ese cambio de forma confiable.

**Solución esperada:** TypeScript verifica los tipos únicamente en tiempo de compilación, sobre el código fuente; no tiene ningún mecanismo para inspeccionar en tiempo de ejecución si los datos reales recibidos de una API externa efectivamente cumplen la forma declarada por una `interface`. Si la API cambia su formato sin que el código se actualice, TypeScript seguirá confiando ciegamente en la anotación de tipo declarada, sin detectar la discrepancia. Se necesitaría una biblioteca de validación en tiempo de ejecución (como Zod) que verifique explícitamente, en el momento de recibir la respuesta, que su forma real coincide con lo esperado, lanzando un error detectable si no coincide.

**Criterios de éxito:**
- Explica correctamente que TypeScript solo verifica en tiempo de compilación, no en runtime.
- Propone una solución concreta (validación en runtime con una biblioteca como Zod, o un type guard manual).

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

- ECMA International, *ECMAScript Language Specification*.
- MDN Web Docs, guías de JavaScript y Web APIs.
- WHATWG, *HTML Living Standard* y *Fetch Standard*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- `interface` y `type` describen formas de datos; `type` es necesario para uniones, `interface` es la convención para objetos extensibles.
- Los generics permiten funciones reutilizables sin sacrificar seguridad de tipos, preservando la relación entre tipos de entrada y salida.
- El narrowing reduce progresivamente el tipo posible de una variable dentro de ramas condicionales, permitiendo trabajar con uniones de forma segura.
- El modo `strict` (con `noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`) maximiza las garantías del compilador.
- TypeScript verifica tipos solo en tiempo de compilación; no protege contra datos externos mal formados que llegan en tiempo de ejecución sin validación adicional.

**Conceptos aprendidos**

- Tipos básicos, interfaces y type aliases.
- Funciones genéricas y su inferencia automática de tipo.
- Narrowing con `typeof`, `instanceof` e `in`.
- Configuración esencial de `tsconfig` en modo estricto.
- Los límites reales de TypeScript frente a datos externos en runtime.

**Próximos pasos**

En el Módulo 12, el proyecto final de este track, construirás una SPA completa sin ningún framework, aplicando routing manual, un store propio y consumo real de una API, demostrando que entiendes los fundamentos que un framework automatiza.

**Recursos adicionales**

- Documentación oficial de TypeScript (typescriptlang.org), especialmente el "TypeScript Handbook".
- Documentación de Zod (zod.dev) para validación de datos en tiempo de ejecución.
