# Módulo 2: Sistema de archivos y streams


## Aprende construyendo

### Tema 1: fs/promises frente a callbacks

**Conceptos clave:** tres estilos de API de archivos, evolución histórica de Node.

Node ofrece tres estilos distintos para operaciones del sistema de archivos, reflejando la evolución histórica del propio lenguaje y del runtime. El estilo síncrono (`fs.readFileSync`) bloquea el hilo único de JavaScript hasta que la operación completa, siendo apropiado únicamente para scripts de configuración ejecutados una sola vez al inicio de un proceso (antes de que el servidor empiece a atender tráfico), nunca dentro del camino crítico de una petición HTTP activa, como se discutió en el Módulo 0. El estilo de callbacks clásico (`fs.readFile(ruta, callback)`) fue la forma original y predominante de Node antes de que las Promesas se estandarizaran en el propio lenguaje JavaScript, y sigue presente en gran cantidad de código legado y en ciertas APIs internas de Node que aún no tienen equivalente moderno.

`fs/promises` (importado como `import { readFile } from "node:fs/promises";`) es la interfaz moderna y recomendada para código nuevo, devolviendo Promesas en vez de requerir callbacks, permitiendo el uso directo de `async`/`await` (estudiado en profundidad en el Módulo 6 del track de JavaScript) para escribir código de manejo de archivos que se lee de forma secuencial y con manejo de errores mediante `try`/`catch` normal, en vez del patrón "error-first callback" (`(err, data) => {...}`) característico del estilo clásico de callbacks de Node, donde el primer argumento del callback está reservado convencionalmente para un posible error, y el desarrollador debe verificarlo explícitamente en cada callback antes de proceder a usar el resultado.

Elegir `fs/promises` para código nuevo no es solo una preferencia estilística: código basado en Promesas se compone naturalmente con `Promise.all` (Módulo 5 del track de JavaScript) para operaciones paralelas, con `try`/`catch` para manejo de errores unificado, y con el resto del ecosistema moderno de JavaScript que asume Promesas como el mecanismo estándar de asincronía, mientras que mezclar estilos de callback clásico con código moderno basado en `async`/`await` introduce fricción de composición y aumenta el riesgo de errores de manejo de errores olvidados (un callback de error no verificado explícitamente falla silenciosamente, mientras que una Promesa rechazada sin manejar produce al menos una advertencia visible de "unhandled rejection").

Reconocer y poder leer las tres formas es, sin embargo, necesario en la práctica real: código legado de Node con años de antigüedad frecuentemente usa el estilo de callbacks clásico, y comprender su patrón (incluyendo la convención "error-first") es indispensable para mantener y depurar ese código existente, incluso cuando código nuevo debería preferir consistentemente `fs/promises`.

**Analogía:** las tres formas de la API de archivos son como tres formas distintas de encargar un trabajo externo: la versión síncrona es esperar de pie, sin hacer nada más, hasta que el trabajo termine completamente; la versión de callback clásico es dejar un número de contacto para que te avisen cuando termine, revisando manualmente si hubo algún problema en ese aviso; la versión de Promesas es recibir un recibo formal con garantías claras sobre cómo se comunicará tanto el éxito como cualquier fallo, integrado naturalmente con el resto de tus herramientas de seguimiento modernas.

**¿Por qué es importante?** `fs/promises` es la interfaz recomendada para código nuevo por su composición natural con `async`/`await` y el manejo de errores unificado, pero reconocer el estilo de callbacks clásico sigue siendo necesario para trabajar con código legado ampliamente presente en el ecosistema Node.

**Código del ejemplo:**

```js
// Síncrono: bloquea el hilo, solo para scripts de configuración inicial
const datos = fs.readFileSync("config.json", "utf-8");

// Callback clásico: error-first, código legado común
fs.readFile("config.json", "utf-8", (err, datos) => { /* verificar err primero */ });

// fs/promises: moderno, recomendado, compone con async/await
const datos2 = await readFile("config.json", "utf-8");
```

### Tema 2: Streams legibles, escribibles y transform

**Conceptos clave:** procesamiento por chunks, `Readable`, `Writable`, `Transform`.

Un stream procesa datos en fragmentos pequeños (chunks) a medida que están disponibles, en vez de esperar a que el conjunto completo de datos esté disponible en memoria antes de empezar a procesarlo, una diferencia fundamental que hace posible trabajar con archivos o flujos de datos de tamaño arbitrariamente grande (incluso mayor que la memoria RAM disponible del sistema) sin agotar los recursos del proceso. Node modela tres tipos principales de streams según su rol: un `Readable` produce datos (por ejemplo, `fs.createReadStream` lee un archivo del disco en chunks sucesivos, en vez de cargarlo completo de una sola vez con `readFile`); un `Writable` consume datos (`fs.createWriteStream` escribe chunks recibidos progresivamente a un archivo de destino); y un `Transform` hace ambas cosas simultáneamente, recibiendo datos de entrada, transformándolos de alguna forma específica, y produciendo datos de salida, actuando como un eslabón intermedio en una cadena de procesamiento.

Un `Transform` personalizado se implementa extendiendo la clase base e implementando el método `_transform(chunk, encoding, callback)`, que recibe cada chunk de entrada, realiza la transformación deseada (por ejemplo, convertir una línea de texto CSV a un objeto JSON serializado), e invoca `callback(error, resultadoTransformado)` para indicar que ese chunk específico terminó de procesarse y puede pasar al siguiente eslabón de la cadena (o señalar un error si la transformación de ese chunk específico falló). Este patrón permite construir pipelines de procesamiento de datos completamente personalizados, componiendo transformaciones específicas y reutilizables en cadenas más complejas según las necesidades exactas de cada caso de uso.

Trabajar directamente con streams requiere un cambio de mentalidad respecto a procesar datos completos en memoria: en vez de pensar "tengo el archivo CSV completo como un string, y ahora lo proceso todo de una vez", se piensa "cada línea (o chunk) llega, la proceso individualmente, y la envío hacia adelante", un modelo de procesamiento incremental que es, en esencia, el mismo principio detrás de la programación funcional con `map`/`filter` (Módulo 4 del track de JavaScript), pero aplicado a datos que fluyen progresivamente en el tiempo, en vez de a una colección ya completamente disponible en memoria de antemano.

Este modelo de streams no es exclusivo del manejo de archivos: subyace también a la comunicación de red en Node (una petición HTTP entrante, estudiada en el Módulo 3, es en sí misma un stream legible de la que se leen los datos del cuerpo de la petición progresivamente a medida que llegan por la red, no como un objeto ya completamente parseado desde el inicio), haciendo que dominar streams sea una habilidad transversal aplicable a múltiples contextos distintos dentro del ecosistema de Node.

**Analogía:** procesar un archivo completo en memoria es como intentar tragar un pastel entero de una sola vez; procesarlo con streams es como comerlo en bocados manejables, uno tras otro, permitiendo disfrutar (procesar) un pastel de cualquier tamaño sin importar cuán grande sea, sin necesidad de que quepa completo de una sola vez en la boca (la memoria RAM disponible).

**¿Por qué es importante?** Los streams son el patrón fundamental que hace posible que Node procese archivos y datos de red de tamaño arbitrariamente grande con un uso de memoria acotado y predecible, un mecanismo que subyace a gran parte de la API core de Node, incluyendo el manejo de peticiones HTTP.

**Código del ejemplo:**

```js
import { createReadStream, createWriteStream } from "node:fs";
import { Transform } from "node:stream";

const csvALinea = new Transform({
  transform(chunk, _enc, callback) {
    const json = csvLineaAJson(chunk.toString());
    callback(null, json + "\n");
  },
});
// lectura (Readable) → transformación (Transform) → escritura (Writable)
```

### Tema 3: Backpressure

**Conceptos clave:** autorregulación de flujo, productor más rápido que el consumidor.

Backpressure es el mecanismo mediante el cual un stream automáticamente pausa la producción de nuevos datos cuando el consumidor (el destino, como un archivo en disco, una conexión de red, o un stream de transformación siguiente en la cadena) no puede procesarlos con la misma rapidez con la que la fuente los produce. Sin este mecanismo, un archivo de lectura extremadamente rápida (por ejemplo, desde un disco SSD veloz) conectado a un destino de escritura mucho más lento (por ejemplo, una conexión de red congestionada, o un disco mecánico lento) acumularía datos en un búfer en memoria de forma indefinidamente creciente, eventualmente agotando la memoria disponible del proceso si el archivo fuera suficientemente grande, precisamente el mismo problema que los streams están diseñados para evitar en primer lugar.

Con backpressure activo, cuando el búfer interno de un stream escribible alcanza un límite configurado, el stream señala explícitamente (mediante el valor de retorno de `write()`, que devuelve `false` en ese caso) que está saturado, y el código responsable de leer del stream de origen debe pausar la lectura hasta recibir el evento `drain` (que indica que el búfer ya se vació lo suficiente para reanudar), coordinando así la velocidad de producción con la velocidad real de consumo, sin necesitar que el desarrollador calcule manualmente ningún límite de tamaño de búfer específico.

Gestionar backpressure manualmente, verificando explícitamente el valor de retorno de `write()` y escuchando el evento `drain` en cada punto de la cadena, es propenso a errores sutiles si se implementa incorrectamente; por esta razón, `pipeline()` (Tema 4) es fuertemente preferible a conectar streams manualmente uno por uno, porque gestiona correctamente el backpressure de forma automática y transparente a través de toda la cadena completa de streams conectados, sin requerir que el desarrollador implemente esa coordinación manualmente en cada punto de conexión entre streams.

Provocar backpressure deliberadamente en un entorno de laboratorio (por ejemplo, conectando una lectura rápida a una escritura artificialmente ralentizada) y observar cómo el stream de lectura se pausa automáticamente es un ejercicio revelador: demuestra que el mecanismo de backpressure no es simplemente una característica opcional de optimización, sino la razón fundamental por la que los streams pueden procesar archivos de tamaño arbitrario sin jamás agotar la memoria del proceso, sin importar cuán desbalanceadas sean las velocidades relativas de producción y consumo en cualquier caso de uso real.

**Analogía:** backpressure es como un sistema de tráfico inteligente en una autopista que automáticamente reduce el flujo de vehículos que ingresan cuando detecta congestión más adelante, evitando que la autopista se sature completamente más allá de su capacidad real, en vez de dejar que los vehículos sigan entrando sin control hasta que el sistema colapse por sobrecarga.

**¿Por qué es importante?** Backpressure es el mecanismo concreto que garantiza que procesar un archivo de cualquier tamaño con streams nunca agote la memoria del proceso, sin importar cuán desbalanceadas sean las velocidades relativas de la fuente y el destino en cualquier caso de uso real.

**Diagrama:**

```
Lectura rápida (SSD) ──chunks──▶ Escritura lenta (red congestionada)
        │                                    │
        │   escritura satura su búfer interno │
        │◄──── señal: pausar lectura ─────────┘
        │   (espera el evento "drain")
        └──── reanuda al recibir "drain" ─────▶
```

### Tema 4: pipeline() para componer streams de forma segura

**Conceptos clave:** composición segura, propagación de errores, cierre correcto de recursos.

Conectar streams manualmente encadenando el método `.pipe()` (por ejemplo, `lectura.pipe(transformacion).pipe(escritura)`) funciona para el caso feliz donde ningún stream falla, pero tiene un problema serio de manejo de errores: si cualquier stream intermedio de la cadena emite un error, `.pipe()` encadenado manualmente no propaga ni maneja ese error de forma automática hacia los demás streams de la cadena, dejando potencialmente streams sin cerrar correctamente (una fuga de recursos del sistema operativo, como descriptores de archivo abiertos indefinidamente) y requiriendo que el desarrollador añada manualmente listeners de error en cada stream individual de la cadena para gestionar correctamente cualquier fallo parcial.

`pipeline()`, disponible tanto en su forma de callback (`stream.pipeline`) como en su forma de Promesa (`stream/promises`, permitiendo `await pipeline(...)` directamente con `async`/`await`), resuelve este problema conectando múltiples streams en una cadena mientras gestiona automáticamente tanto la propagación de errores (si cualquier stream de la cadena falla, `pipeline()` se asegura de que todos los demás streams de la cadena se cierren correctamente, liberando sus recursos subyacentes) como el backpressure a través de toda la cadena completa, sin requerir que el desarrollador implemente manualmente ninguna de estas dos responsabilidades en cada punto de conexión.

Esta es la razón concreta por la que la documentación oficial de Node recomienda `pipeline()` sobre encadenar `.pipe()` manualmente para prácticamente cualquier composición de streams no trivial: la diferencia no es solo de conveniencia sintáctica, sino de corrección real ante fallos parciales, que son considerablemente más probables en cadenas de procesamiento de datos del mundo real (un archivo corrupto a mitad de lectura, una conexión de red que se interrumpe durante la escritura) que en el escenario ideal donde todo funciona sin ningún fallo en ningún punto de la cadena.

Usar `await pipeline(lectura, transformacion, escritura)` dentro de una función `async` con manejo de errores mediante `try`/`catch` combina naturalmente el patrón de streams con el patrón de manejo de errores asíncrono estudiado en el Módulo 6 del track de JavaScript, produciendo código que se lee de forma secuencial y clara sobre una composición de streams, mientras internamente `pipeline()` gestiona correctamente toda la complejidad de propagación de errores y backpressure entre los streams conectados.

**Analogía:** encadenar `.pipe()` manualmente es como conectar varias mangueras de agua una tras otra sin ningún mecanismo de seguridad: si una manguera intermedia revienta, el agua sigue fluyendo descontroladamente por las demás sin que nada se detenga automáticamente. `pipeline()` es como un sistema de mangueras con válvulas de seguridad automáticas en cada conexión, que cierran instantáneamente todo el sistema completo si cualquier punto falla, evitando derrames descontrolados en cualquier parte de la cadena.

**¿Por qué es importante?** `pipeline()` es la forma correcta y recomendada de componer streams en Node, gestionando automáticamente tanto la propagación de errores como el backpressure a través de toda la cadena, evitando fugas de recursos que `.pipe()` encadenado manualmente no previene de forma segura.

**Código del ejemplo:**

```js
import { pipeline } from "node:stream/promises";

try {
  await pipeline(
    createReadStream("entrada.csv"),
    csvALinea,
    createWriteStream("salida.jsonl")
  );
  console.log("Transformación completa");
} catch (error) {
  console.error("Falló en algún punto de la cadena:", error);
  // pipeline() ya cerró correctamente todos los streams involucrados
}
```

---


## Laboratorio práctico

**Objetivo del laboratorio:** transformar un archivo CSV grande a formato JSON usando streams compuestos con `pipeline()`, sin cargarlo completo en memoria, y observar backpressure de forma experimental.

**Requisitos previos:** Node.js instalado, Módulos 0-1 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Comparar las tres formas de leer un archivo | `readFileSync`, callback clásico, `fs/promises` | Compara sintaxis y manejo de errores de cada una |
| 2 | Generar un CSV de 500k líneas | Script generador simple | Mide memoria usada al leerlo completo con `readFileSync` |
| 3 | Leer el mismo archivo con un stream | `fs.createReadStream` | Procesa línea por línea sin cargarlo completo en memoria |
| 4 | Implementar un `Transform` CSV→JSON | Ver Tema 2 | Convierte cada línea a un objeto JSON serializado |
| 5 | Componer los tres streams con `pipeline()` | Ver Tema 4 | Verifica manejo correcto de errores si el archivo está corrupto |
| 6 | Provocar backpressure intencionalmente | Escritura artificialmente ralentizada | Observa que la lectura se autorregula, pausándose |

**Verificación:** el laboratorio se considera exitoso si el uso de memoria al procesar el archivo con streams permanece acotado y bajo (no crece proporcionalmente al tamaño del archivo), a diferencia de `readFileSync` del paso 2, y si `pipeline()` maneja correctamente un fallo intencional (archivo corrupto) cerrando todos los streams sin dejar recursos abiertos.

**Errores comunes y soluciones**

- **Usar `readFileSync` en un archivo de tamaño desconocido o potencialmente grande.** Usa streams para cualquier archivo cuyo tamaño no esté acotado y controlado de antemano.
- **Encadenar `.pipe()` manualmente sin manejo de errores en cada stream individual.** Usa `pipeline()` en su lugar, que gestiona la propagación de errores automáticamente.
- **Olvidar invocar el `callback` dentro de `_transform` de un stream personalizado.** Sin invocarlo, el stream se queda colgado indefinidamente esperando esa señal de que el chunk terminó de procesarse.

---
