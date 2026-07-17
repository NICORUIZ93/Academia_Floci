# Módulo 4: Arrays y estructuras de datos funcionales

## Sílabo

**Objetivo general**

Transformar colecciones de datos usando el estilo funcional de JavaScript (`map`, `filter`, `reduce`) en vez de loops manuales, y elegir la estructura de datos correcta (`Array`, `Object`, `Set`, `Map`) según el problema.

**Objetivos específicos**

1. Usar `map`, `filter`, `reduce`, `find`, `some`/`every` para transformar y consultar colecciones.
2. Elegir entre `Set`/`Map` y `Array`/`Object` según el caso de uso.
3. Actualizar estructuras anidadas sin mutar el original.
4. Usar `WeakMap`/`WeakSet` para prevenir fugas de memoria.
5. Aplicar los métodos inmutables modernos (`toSorted`, `toReversed`, `with`).

**Contenido**

- `map`, `filter`, `reduce`, `find`, `some`/`every`.
- `Set` y `Map` frente a `Array` y `Object`.
- Inmutabilidad y spread para actualizar datos.
- Estructuras anidadas y normalización.
- `WeakMap` y `WeakSet`.
- Métodos inmutables modernos.

**Evaluación**

Un pipeline de transformación de datos (CSV a JSON agregado) usando solo métodos funcionales, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: map, filter, reduce, find, some/every

**Conceptos clave:** transformación (map), selección (filter), acumulación (reduce), búsqueda y comprobación booleana.

`map`, `filter` y `reduce` son los tres métodos funcionales fundamentales sobre arrays, y cada uno resuelve una intención distinta y bien delimitada. `map` transforma cada elemento de un array en otro valor, produciendo un array nuevo de la misma longitud; su uso correcto implica que la función pasada siempre devuelve un valor (si no se necesita un valor de retorno, probablemente no se necesita `map`, sino `forEach`). `filter` selecciona un subconjunto de elementos que cumplen una condición booleana, produciendo un array potencialmente más corto; `reduce` acumula todos los elementos de un array en un único valor final (que puede ser un número, un objeto, otro array, o cualquier estructura), siendo la herramienta más general y potente de las tres, capaz de expresar tanto `map` como `filter` si fuera necesario, aunque usar la herramienta más específica disponible produce código más legible.

Encadenar estos métodos (`array.filter(...).map(...)`) es un patrón extremadamente común que expresa un pipeline de transformación de datos de forma declarativa: primero seleccionar los elementos relevantes, luego transformarlos, en una única expresión legible de izquierda a derecha, en vez de un bucle imperativo con variables intermedias mutables. Es importante notar el coste de rendimiento de encadenar múltiples métodos: cada uno recorre el array completo de forma independiente, produciendo un array intermedio nuevo en cada paso; para arrays extremadamente grandes donde el rendimiento es crítico, un único `reduce` que haga todo el trabajo en una sola pasada puede ser preferible, aunque a costa de menor legibilidad.

`find` devuelve el primer elemento que cumple una condición (o `undefined` si ninguno la cumple), útil cuando se busca un único elemento específico en vez de una colección completa. `some` devuelve `true` si al menos un elemento cumple la condición; `every` devuelve `true` solo si todos los elementos la cumplen. Estos dos últimos son particularmente útiles para validaciones: `usuarios.every(u => u.activo)` responde directamente a la pregunta "¿están todos los usuarios activos?" sin necesidad de un bucle explícito con una bandera booleana manual.

Dominar cuándo usar cada uno de estos métodos frente a un bucle `for` tradicional es una señal de madurez en JavaScript funcional: los métodos funcionales comunican la intención directamente en el nombre del método (transformar, filtrar, acumular, buscar, comprobar), mientras que un bucle `for` genérico requiere leer el cuerpo completo para inferir qué se está haciendo realmente con los datos.

**Analogía:** `map` es como una línea de producción que transforma cada pieza que pasa por ella según una regla fija, produciendo una pieza nueva por cada una que entra; `filter` es un control de calidad que descarta las piezas que no cumplen un estándar; `reduce` es una prensa que combina todas las piezas que sobrevivieron en un único producto final consolidado.

**¿Por qué es importante?** Estos métodos son el vocabulario básico y omnipresente de cualquier código JavaScript moderno que manipule colecciones de datos, y son la base directa de operadores equivalentes en RxJS (Angular) y de patrones de transformación de estado en React.

**Diagrama:**

```
pedidos.filter(p => p.monto > 50)   // selecciona
       .map(p => p.cliente)         // transforma
// vs un único reduce que hace ambos pasos en una sola pasada:
pedidos.reduce((acc, p) => p.monto > 50 ? [...acc, p.cliente] : acc, [])
```

### Tema 2: Set y Map frente a Array y Object

**Conceptos clave:** valores únicos (`Set`), claves de cualquier tipo (`Map`), orden de inserción garantizado.

`Set` almacena una colección de valores únicos, rechazando automáticamente duplicados en el momento de la inserción; convertir un array con duplicados a `Set` y de vuelta a array (`[...new Set(array)]`) es la forma idiomática y más concisa de eliminar duplicados en JavaScript moderno, reemplazando patrones anteriores más verbosos basados en `filter` combinado con `indexOf`. `Map` es una colección de pares clave-valor que, a diferencia de un objeto literal plano, acepta claves de cualquier tipo (no solo strings o symbols: un objeto, una función, o cualquier valor puede ser una clave de `Map`), y garantiza mantener el orden de inserción de forma predecible y bien especificada por el lenguaje.

La elección entre `Map` y un objeto plano para almacenar pares clave-valor depende del contexto: un objeto plano es apropiado cuando las claves son conocidas de antemano y fijas (representando la forma de un registro estructurado, como `{nombre, edad}`); `Map` es preferible cuando las claves son dinámicas y determinadas en tiempo de ejecución (por ejemplo, contando ocurrencias de palabras de un texto arbitrario), porque `Map` no tiene el riesgo de colisión con propiedades heredadas del prototipo de `Object` (como `toString` o `constructor`, que técnicamente podrían coincidir accidentalmente con una clave dinámica si se usara un objeto plano sin cuidado adicional).

`Map` también expone directamente su tamaño mediante la propiedad `size` (mientras que un objeto plano requiere `Object.keys(obj).length`, una operación adicional), y es directamente iterable con `for...of`, produciendo pares `[clave, valor]` en cada iteración sin necesidad de convertirlo primero a un array de entradas como se requeriría con `Object.entries()`. Estas diferencias, aunque parecen menores, tienen impacto real en la legibilidad y en la ausencia de casos límite inesperados al trabajar con datos verdaderamente dinámicos.

`Set` y `Map` no reemplazan a `Array` y `Object` de forma universal; cada estructura tiene su lugar según la naturaleza del problema: `Array` para colecciones ordenadas donde el índice numérico importa y puede haber duplicados, `Object` para registros con forma fija y conocida, `Set` para colecciones donde la unicidad es la propiedad central, y `Map` para diccionarios verdaderamente dinámicos donde las claves no se conocen de antemano.

**Analogía:** un objeto plano es como un formulario impreso con campos fijos predefinidos (nombre, edad, dirección); un `Map` es como una libreta en blanco donde puedes escribir cualquier tipo de etiqueta en cualquier página sin restricción previa de formato; un `Set` es como una lista de invitados que automáticamente rechaza cualquier nombre que ya esté escrito, garantizando que nadie aparezca dos veces.

**¿Por qué es importante?** Elegir la estructura de datos correcta según el problema (en vez de usar siempre un array u objeto plano por defecto) produce código más claro, más eficiente y con menos casos límite inesperados relacionados con duplicados o colisiones de claves.

**Diagrama:**

```
Set: [1,2,2,3,3,3] → new Set(...) → {1,2,3} (únicos, orden de inserción)
Map: claves de CUALQUIER tipo, size directo, iterable con for...of
     const m = new Map(); m.set(objetoComoClave, "valor");
```

### Tema 3: Inmutabilidad y actualización de estructuras anidadas

**Conceptos clave:** inmutabilidad, spread anidado, normalización de datos.

Actualizar datos sin mutar el original —crear una nueva copia con el cambio aplicado, en vez de modificar directamente la estructura existente— es una práctica central del JavaScript moderno, especialmente en el contexto de frameworks como React (que detectan cambios comparando referencias de objetos, un mecanismo que depende directamente de la inmutabilidad para funcionar correctamente y de forma eficiente). El operador spread permite esta actualización inmutable de forma concisa: `{...usuario, edad: 30}` crea un objeto nuevo con todas las propiedades de `usuario` copiadas superficialmente, sobreescribiendo solo `edad`, sin modificar el objeto `usuario` original en absoluto.

El caso de estructuras anidadas requiere spread en cada nivel de anidamiento que se quiera actualizar de forma inmutable, porque el spread es superficial (shallow): `{...usuario, direccion: {...usuario.direccion, ciudad: "Bogotá"}}` es necesario para actualizar `ciudad` sin mutar `usuario.direccion` original, porque un simple `{...usuario, direccion: {ciudad: "Bogotá"}}` reemplazaría todo el objeto `direccion` completo, perdiendo cualquier otra propiedad que tuviera (como `pais` o `codigoPostal`) que no se mencionó explícitamente en el nuevo literal.

Este requisito de "spread en cada nivel" es, precisamente, la razón por la que estructuras de datos profundamente anidadas se vuelven progresivamente más incómodas de actualizar de forma inmutable con spread manual, y por la que existen bibliotecas especializadas (como Immer, ampliamente usada en el ecosistema React) que permiten escribir código que parece mutar directamente el estado, mientras internamente producen una nueva copia inmutable de forma transparente. Independientemente de si se usa spread manual o una biblioteca, el principio subyacente —el estado anterior nunca se modifica directamente— facilita enormemente comparar versiones de un estado (por referencia, extremadamente rápido) y depurar bugs (el estado anterior sigue intacto para inspeccionar y comparar).

La normalización de datos es una técnica relacionada: en vez de anidar profundamente datos relacionados (por ejemplo, un array de pedidos donde cada uno contiene un objeto completo de cliente duplicado), normalizar significa almacenar cada entidad una sola vez (indexada por su id, típicamente en un `Map` u objeto), y referenciar esa entidad por su id desde otras estructuras, evitando duplicación de datos y facilitando actualizaciones consistentes cuando una entidad compartida cambia.

**Analogía:** actualizar sin mutar es como fotocopiar un documento completo, corregir solo la línea necesaria en la fotocopia, y conservar el original intacto en el archivo; mutar directamente sería como escribir la corrección directamente sobre el documento original con tinta, perdiendo para siempre la posibilidad de comparar la versión anterior con la nueva.

**¿Por qué es importante?** La inmutabilidad facilita la detección eficiente de cambios (comparación por referencia), simplifica la depuración (el estado anterior sigue disponible para comparar), y es un requisito de diseño fundamental en frameworks reactivos modernos como React.

**Diagrama:**

```
const usuario = { nombre: "Ana", direccion: { ciudad: "Lima", pais: "Perú" } };
// INCORRECTO (pierde "pais"):
{...usuario, direccion: { ciudad: "Bogotá" }}
// CORRECTO (spread en cada nivel):
{...usuario, direccion: {...usuario.direccion, ciudad: "Bogotá"}}
```

### Tema 4: WeakMap y WeakSet

**Conceptos clave:** referencias débiles, prevención de fugas de memoria, claves no enumerables.

`WeakMap` y `WeakSet` son variantes de `Map` y `Set` con una diferencia crucial: mantienen referencias "débiles" a sus claves (en el caso de `WeakMap`) o a sus valores (en el caso de `WeakSet`), lo que significa que si no existe ninguna otra referencia activa a un objeto usado como clave, el recolector de basura puede liberar la memoria de ese objeto, y su entrada correspondiente en el `WeakMap`/`WeakSet` desaparece automáticamente, sin necesidad de eliminarla manualmente. Un `Map` normal, en cambio, mantiene una referencia "fuerte" a sus claves, impidiendo que el recolector de basura las libere mientras el `Map` siga existiendo, incluso si ninguna otra parte del programa las necesita ya.

Esta diferencia tiene una aplicación práctica concreta: asociar metadatos adicionales a objetos (por ejemplo, datos de caché o de seguimiento) sin impedir que esos objetos se liberen de memoria cuando ya no se necesiten en ningún otro lugar del programa. Usar un `Map` normal para este propósito crearía una fuga de memoria silenciosa: los objetos nunca se liberarían mientras el `Map` exista, aunque el resto del programa ya no tenga ninguna otra referencia a ellos, porque el propio `Map` los mantendría vivos artificialmente.

Una limitación importante de `WeakMap` y `WeakSet` es que no son iterables y no exponen un método para conocer su tamaño (`size`): precisamente porque sus contenidos pueden desaparecer automáticamente en cualquier momento (cuando el recolector de basura decide liberar una clave sin otras referencias), permitir iterar sobre ellos o consultar su tamaño produciría un comportamiento no determinista e impredecible, así que el lenguaje deliberadamente no expone esas capacidades para estas estructuras.

En la práctica cotidiana, `WeakMap` y `WeakSet` son herramientas de uso relativamente especializado (frameworks y bibliotecas internas los usan con frecuencia para asociar metadatos a objetos DOM sin impedir su recolección cuando se eliminan de la página), pero entender su existencia y su propósito específico —prevenir fugas de memoria en asociaciones de metadatos— es valioso incluso si su uso directo en código de aplicación cotidiano es menos frecuente que `Map` y `Set` normales.

**Analogía:** un `Map` normal es como una lista de invitados a un evento que, una vez escrita, obliga a mantener reservado el lugar de cada invitado indefinidamente aunque cancelen su asistencia; un `WeakMap` es como una lista que automáticamente borra el nombre de un invitado en cuanto esa persona deja de existir en cualquier otro registro del sistema, liberando su lugar sin intervención manual.

**¿Por qué es importante?** `WeakMap`/`WeakSet` resuelven un problema específico y real de gestión de memoria (asociar datos a objetos sin impedir su liberación), relevante especialmente al construir bibliotecas o herramientas que manejan un volumen grande de objetos de vida corta.

**Diagrama:**

```
Map normal: mantiene la clave viva indefinidamente (fuga de memoria potencial)
WeakMap: si no hay otras referencias a la clave, se libera automáticamente
  const cache = new WeakMap();
  cache.set(elementoDOM, metadatos);
  // si elementoDOM se elimina del DOM y no hay otra referencia,
  // su entrada en cache desaparece automáticamente
```

### Tema 5: Métodos inmutables modernos

**Conceptos clave:** `toSorted`, `toReversed`, `toSpliced`, `with`, inmutabilidad nativa de array.

Los métodos tradicionales `sort()`, `reverse()` y `splice()` de `Array` mutan el array original directamente, un comportamiento que ha causado bugs sutiles durante décadas cuando un desarrollador asume incorrectamente que estos métodos, como `map` o `filter`, producen un array nuevo sin afectar al original. Versiones relativamente recientes del lenguaje introdujeron contrapartes inmutables explícitas: `toSorted()`, `toReversed()` y `toSpliced()` realizan exactamente la misma operación que sus contrapartes mutables, pero devuelven un array completamente nuevo, dejando el original completamente intacto.

El método `with(indice, valorNuevo)` resuelve otro patrón común de forma inmutable: reemplazar el elemento en una posición específica de un array sin mutar el original, algo que anteriormente requería una combinación algo verbosa de spread y slicing manual (`[...arr.slice(0, i), nuevoValor, ...arr.slice(i+1)]`). Con `with`, la misma operación se expresa de forma directa y legible: `arr.with(2, "nuevo")` devuelve un array nuevo con el elemento en el índice 2 reemplazado, sin tocar `arr` en absoluto.

La introducción de estos métodos refleja una tendencia deliberada en la evolución reciente del lenguaje: proporcionar alternativas inmutables nativas para las operaciones de array más comunes que tradicionalmente solo tenían contrapartes mutables, reduciendo la necesidad de recordar manualmente "cuáles métodos mutan y cuáles no" (una fuente histórica de confusión, dado que `map`/`filter` no mutan pero `sort`/`reverse`/`splice` sí, sin ninguna señal sintáctica que distinga unos de otros salvo memorizar la documentación).

Adoptar estos métodos modernos en código nuevo, cuando el entorno de ejecución los soporta (verificar la compatibilidad del entorno objetivo, especialmente si se necesita soportar navegadores más antiguos), simplifica el razonamiento sobre inmutabilidad: si el objetivo es no mutar nunca los arrays originales, usar consistentemente los métodos con prefijo `to` (o `with`) elimina el riesgo de invocar accidentalmente su contraparte mutante y producir un bug sutil de estado compartido inesperado.

**Analogía:** los métodos mutables tradicionales son como escribir directamente sobre un documento original con un bolígrafo permanente; los nuevos métodos inmutables son como usar siempre una fotocopiadora que produce automáticamente una copia nueva con el cambio aplicado, dejando el documento original archivado sin ninguna marca.

**¿Por qué es importante?** Estos métodos modernos reducen una fuente histórica de bugs (confundir métodos mutables e inmutables) proporcionando una alternativa inmutable explícita y nombrada de forma consistente para cada operación común de array.

**Diagrama:**

```
arr.sort()        → muta arr, devuelve la MISMA referencia ordenada
arr.toSorted()    → NO muta arr, devuelve un array NUEVO ordenado
arr.with(2, "x")  → NO muta arr, devuelve un array NUEVO con esa posición reemplazada
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

**Objetivo del laboratorio:** construir un pipeline de transformación de datos completo (CSV en string → JSON agregado) usando exclusivamente métodos funcionales inmutables.

**Requisitos previos:** Módulos 0-3 completados, Node.js o consola del navegador.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Agrupar pedidos por cliente con `reduce` | Ver Tema 1 | Verifica el total agregado por cada cliente |
| 2 | Filtrar y transformar en una sola expresión | `filter(...).map(...)` | Obtén solo nombres de clientes con monto > 100 |
| 3 | Eliminar duplicados con `Set` | `[...new Set(array)]` | Compáralo con la alternativa `filter` + `indexOf` |
| 4 | Contar palabras con `Map` | Ver Tema 2 | Explica por qué `Map` es preferible a un objeto plano aquí |
| 5 | Actualizar un objeto anidado sin mutar | Ver Tema 3 | Verifica que el original permanece intacto tras la actualización |
| 6 | Construir el pipeline CSV→JSON completo | string → `split` → `map` a objetos → `filter` → `reduce` a resumen | Verifica el resultado final agregado |

**Verificación:** el laboratorio se considera exitoso si el pipeline CSV→JSON produce el resumen agregado correcto, y si se verifica explícitamente (comparando referencias con `===`) que ninguna estructura original fue mutada durante el proceso.

**Errores comunes y soluciones**

- **Usar `sort()` o `reverse()` esperando que no muten el array original.** Estas mutan; usa `toSorted()`/`toReversed()`, o `[...arr].sort()` como alternativa compatible con entornos más antiguos.
- **Actualizar un objeto anidado con spread superficial en un solo nivel.** Verifica que se aplica spread en cada nivel de anidamiento que se modifica, o el resto de propiedades de ese nivel se perderá.
- **Usar un objeto plano para contar ocurrencias dinámicas y toparse con colisiones de nombres con métodos heredados.** Usa `Map` en su lugar para claves verdaderamente dinámicas y arbitrarias.

---

## Ejercicios de evaluación

### Ejercicio 1: reduce frente a exceso de ingeniería

**Enunciado:** explica cuándo usar `reduce` es la herramienta correcta y cuándo es "exceso de ingeniería" frente a encadenar `filter` + `map` por separado, usando un ejemplo concreto de cada caso.

**Solución esperada:** `reduce` es apropiado cuando se necesita producir un único valor acumulado que combina información de todos los elementos (una suma, un objeto de agrupación); es exceso de ingeniería cuando se usa para simplemente filtrar y transformar (lo que `filter().map()` expresa de forma más legible y directa), forzando esa lógica dentro de una función acumuladora innecesariamente compleja de leer.

**Criterios de éxito:**
- Da un ejemplo correcto de uso apropiado de `reduce` (agregación real).
- Da un ejemplo correcto de uso inapropiado (donde `filter`/`map` serían más legibles).

### Ejercicio 2: Elegir la estructura correcta

**Enunciado:** dado el requisito "contar cuántas veces aparece cada producto en una lista de 10,000 ventas, donde el nombre del producto es arbitrario y no se conoce de antemano", justifica si usarías un objeto plano o un `Map`.

**Solución esperada:** `Map`, porque las claves (nombres de producto) son verdaderamente dinámicas y no se conocen de antemano, evitando el riesgo de colisión con propiedades heredadas del prototipo de `Object`, y porque `Map` expone `size` directamente y es iterable de forma nativa con `for...of`, sin pasos adicionales de conversión.

**Criterios de éxito:**
- Elige `Map` y justifica correctamente con al menos una de las razones mencionadas (colisión de prototipo, `size`, iterabilidad directa).

### Ejercicio 3: Actualizar sin mutar en profundidad

**Enunciado:** dado `const config = { usuario: { preferencias: { tema: "claro", idioma: "es" } } }`, escribe la expresión que actualiza `tema` a `"oscuro"` sin mutar `config` en ningún nivel.

**Solución esperada:**
```js
const nuevaConfig = {
  ...config,
  usuario: {
    ...config.usuario,
    preferencias: { ...config.usuario.preferencias, tema: "oscuro" },
  },
};
```

**Criterios de éxito:**
- Aplica spread en los tres niveles de anidamiento relevantes.
- Verifica (o explica cómo verificaría) que `config` original permanece completamente intacto.

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

- `map`, `filter` y `reduce` cubren transformación, selección y acumulación respectivamente; `find`/`some`/`every` cubren búsqueda y comprobación booleana.
- `Set` garantiza unicidad; `Map` permite claves de cualquier tipo con orden de inserción garantizado y sin riesgo de colisión con el prototipo.
- Actualizar estructuras anidadas sin mutar requiere spread en cada nivel de anidamiento relevante.
- `WeakMap`/`WeakSet` previenen fugas de memoria al asociar metadatos a objetos que deben poder liberarse.
- Los métodos modernos (`toSorted`, `with`) ofrecen alternativas inmutables explícitas a operaciones tradicionalmente mutables.

**Conceptos aprendidos**

- Los métodos funcionales fundamentales de array y cuándo usar cada uno.
- Elección informada entre `Array`/`Object` y `Set`/`Map`.
- Actualización inmutable de estructuras anidadas.
- Referencias débiles y prevención de fugas de memoria.
- Métodos inmutables modernos de array.

**Próximos pasos**

En el Módulo 5 profundizarás en el modelo de concurrencia de JavaScript: el Event Loop, microtasks frente a macrotasks, y las Promesas como mecanismo central de asincronía.

**Recursos adicionales**

- MDN Web Docs: "Array", "Map", "Set", "WeakMap".
- Documentación de TC39 sobre los métodos de array inmutables recientes (`Array.prototype.with`, `toSorted`).
