# Módulo 3: Objetos, prototipos y clases

## Sílabo

**Objetivo general**

Entender que JavaScript es un lenguaje prototipal por debajo de la sintaxis de clases, dominando ambos modelos (prototipos y `class`) y sabiendo cuándo cada uno es la herramienta apropiada.

**Objetivos específicos**

1. Explicar la cadena de prototipos y usar `Object.create` para crear herencia sin clases.
2. Definir clases con `class`, `extends` y `super`, incluyendo herencia de métodos.
3. Implementar encapsulación real con campos privados (`#campo`).
4. Usar getters, setters y propiedades computadas.
5. Aplicar `Object.freeze`, `Object.seal` y destructuring anidado.
6. Explicar qué es realmente `class` en términos del mecanismo prototipal subyacente.

**Contenido**

- Prototype chain y `Object.create`.
- `class`, `extends` y `super`.
- Getters/setters y propiedades computadas.
- Encapsulación con campos privados (`#campo`).
- `Object.freeze`, `Object.seal` y destructuring anidado.
- `Object.groupBy` y `Object.fromEntries`.

**Evaluación**

Una jerarquía de clases con herencia y encapsulación real (campos privados), más tres ejercicios de evaluación sobre prototipos, herencia y encapsulación.

---

## Aprende construyendo

### Tema 1: Prototype chain y Object.create

**Conceptos clave:** prototipo, cadena de prototipos, herencia por delegación, `Object.create`.

Todo objeto en JavaScript tiene un enlace interno (accesible mediante `Object.getPrototypeOf()`, e internamente conocido como `[[Prototype]]`) hacia otro objeto, llamado su prototipo, del cual hereda propiedades y métodos por delegación: cuando se accede a una propiedad que no existe directamente en el objeto, el motor de JavaScript busca automáticamente en su prototipo, y si tampoco está ahí, continúa subiendo por la cadena de prototipos hasta llegar a `Object.prototype` (el prototipo raíz de prácticamente todos los objetos), o hasta encontrar la propiedad, o hasta llegar a `null` (el final de la cadena) sin encontrarla, devolviendo entonces `undefined`.

`Object.create(prototipo)` es la forma más directa y explícita de crear un objeto con un prototipo específico elegido deliberadamente: `Object.create(animalProto)` crea un objeto nuevo cuyo prototipo es exactamente `animalProto`, heredando por delegación cualquier método definido ahí (como `hablar()`), sin necesidad de copiar ese método individualmente a cada instancia. Esta es la diferencia fundamental entre herencia por delegación (JavaScript) y herencia por copia (otros modelos): el método `hablar()` existe en un único lugar (`animalProto`), y cada objeto que lo hereda simplemente delega la búsqueda hacia ese lugar compartido en tiempo de ejecución, en vez de tener su propia copia independiente del método.

Es importante notar que la cadena de prototipos afecta la lectura de propiedades pero no su escritura: asignar una propiedad a un objeto (`perro.nombre = "Rex"`) siempre crea (o sobreescribe) esa propiedad directamente en el objeto mismo, sin modificar el prototipo compartido; solo cuando se lee una propiedad que no existe directamente en el objeto, el motor consulta el prototipo. Esto explica por qué modificar un método en el prototipo compartido (`animalProto.hablar = function() {...}`) afecta instantáneamente a todos los objetos que lo heredan (porque todos delegan a la misma referencia compartida), mientras que asignar una propiedad directamente en una instancia específica no afecta a ninguna otra instancia.

Este modelo de "herencia por delegación" es fundamentalmente distinto del modelo de "herencia por clase" presente en lenguajes como Java o C++, donde una instancia recibe una copia completa de la estructura definida por su clase en el momento de su creación. En JavaScript, incluso cuando se usa la sintaxis de `class` (Tema 2), el mecanismo subyacente sigue siendo exactamente este mismo sistema de prototipos: `class` es, literalmente, una capa de sintaxis más legible construida encima del mismo mecanismo de prototipos que `Object.create` expone directamente.

**Analogía:** la cadena de prototipos es como un sistema de bibliotecas conectadas: si un libro que buscas no está en tu biblioteca local (el objeto), automáticamente se consulta la biblioteca regional conectada (su prototipo), y si tampoco está ahí, se consulta la biblioteca nacional (el prototipo del prototipo), y así sucesivamente, sin que ninguna biblioteca individual necesite tener una copia física de cada libro disponible en el sistema completo.

**¿Por qué es importante?** Entender la cadena de prototipos como delegación (no como copia) es la base conceptual indispensable para entender qué es realmente `class` en JavaScript, y para depurar correctamente comportamientos donde una propiedad "aparece" en un objeto sin haber sido asignada directamente ahí.

**Diagrama:**

```
const animalProto = { hablar() { return `${this.nombre} hace un sonido`; } };
const perro = Object.create(animalProto);
perro.nombre = "Rex";
perro.hablar(); // busca hablar en perro (no está) → sube a animalProto (está) → delega
Object.getPrototypeOf(perro) === animalProto; // true
```

### Tema 2: class, extends y super

**Conceptos clave:** azúcar sintáctica sobre prototipos, herencia con `extends`, `super`.

La sintaxis `class`, introducida en ES6, no crea un mecanismo de herencia nuevo o distinto del sistema de prototipos ya existente: es, precisamente, "azúcar sintáctica" (una forma más legible de escribir algo que ya era posible antes, de forma más verbosa, con funciones constructoras y manipulación manual de `prototype`). Cuando se define `class Animal { constructor(nombre) { this.nombre = nombre; } hablar() {...} }`, el método `hablar` se almacena internamente en `Animal.prototype`, exactamente en el mismo lugar donde se habría colocado manualmente con la sintaxis de funciones constructoras anterior a ES6, y cada instancia creada con `new Animal(...)` hereda ese método por la misma delegación de prototipos descrita en el Tema 1.

`extends` establece la relación de herencia entre clases, configurando internamente que el prototipo de la clase hija apunte a un objeto cuyo prototipo, a su vez, es el prototipo de la clase padre, formando una cadena de prototipos de dos (o más) niveles. `class Perro extends Animal {...}` significa que las instancias de `Perro` heredan tanto los métodos definidos directamente en `Perro` como los heredados de `Animal`, resolviéndose por la misma búsqueda ascendente en la cadena de prototipos.

`super` cumple dos funciones distintas según el contexto donde se usa: dentro del `constructor` de una clase hija, `super(argumentos)` invoca el `constructor` de la clase padre (obligatorio invocarlo antes de usar `this` en el constructor de la hija, una regla estricta impuesta por el lenguaje); dentro de un método normal de la clase hija, `super.metodo()` invoca explícitamente la versión de ese método definida en la clase padre, permitiendo "extender" el comportamiento heredado en vez de reemplazarlo completamente (como se ve en `Perro.hablar()`, que invoca `super.hablar()` y añade contenido adicional al resultado).

Comparar la implementación de una jerarquía `Animal`/`Perro` usando funciones constructoras con `.prototype` (el estilo anterior a ES6) frente a la misma jerarquía usando `class` es un ejercicio revelador: ambas producen exactamente el mismo comportamiento en tiempo de ejecución y la misma estructura de cadena de prototipos, confirmando de forma tangible que `class` es, efectivamente, solo una forma más legible de expresar el mismo mecanismo subyacente, sin introducir ningún modelo de herencia fundamentalmente nuevo.

**Analogía:** `class` es como un formulario estandarizado y con plantilla clara para rellenar una solicitud, mientras que la sintaxis anterior de funciones constructoras y `.prototype` es como rellenar la misma solicitud a mano libre en una hoja en blanco: el contenido final que se procesa (el mecanismo de prototipos) es exactamente el mismo, pero el formulario estandarizado (`class`) es más legible y menos propenso a errores de formato.

**¿Por qué es importante?** Entender que `class` es azúcar sintáctica sobre prototipos, no un mecanismo nuevo, evita concepciones erróneas sobre "clases verdaderas" al estilo Java, y prepara el terreno para entender por qué ciertos comportamientos de JavaScript (como la delegación dinámica de métodos) difieren de lenguajes con clases en sentido más tradicional.

**Diagrama:**

```
class Animal {
  constructor(nombre) { this.nombre = nombre; }
  hablar() { return `${this.nombre} hace un sonido`; }
}
class Perro extends Animal {
  hablar() { return `${super.hablar()} — ¡y ladra!`; }
}
new Perro("Rex").hablar();
// "Rex hace un sonido — ¡y ladra!"
// Perro.prototype.__proto__ === Animal.prototype (cadena de 2 niveles)
```

### Tema 3: Getters, setters y propiedades computadas

**Conceptos clave:** propiedades de acceso, `get`/`set`, claves computadas.

Un getter (`get nombre() {...}`) y un setter (`set nombre(valor) {...}`) definen propiedades que, aunque se acceden con la sintaxis normal de propiedad (`objeto.nombre`, sin paréntesis), en realidad ejecutan una función cada vez que se leen o se asignan respectivamente. Esto permite ejecutar lógica adicional de forma transparente para quien consume el objeto: un getter puede calcular un valor derivado sobre la marcha (en vez de almacenarlo y arriesgarse a que quede desincronizado), y un setter puede validar un valor antes de aceptarlo, como se ve en `CuentaBancaria`, donde el getter `saldo` expone el valor del campo privado `#saldo` de forma controlada, sin permitir asignación directa (no existe un `set saldo`, así que `cuenta.saldo = 1000` simplemente no tendría efecto o lanzaría error en modo estricto).

Las propiedades computadas permiten usar el valor de una variable (o el resultado de una expresión) como el nombre de una clave dentro de un objeto literal, usando la sintaxis de corchetes: `{ [clave]: valor }` crea una propiedad cuyo nombre es el valor de la variable `clave` en el momento de evaluar el literal, no literalmente el texto `"clave"`. Esto es especialmente útil cuando el nombre de una propiedad debe determinarse dinámicamente en tiempo de ejecución, por ejemplo al construir un objeto de conteo donde la clave es una palabra extraída de un texto que no se conoce de antemano.

`Object.groupBy()`, una adición relativamente reciente al lenguaje, resuelve directamente un patrón extremadamente común que antes requería escribir manualmente un `reduce`: agrupar los elementos de un array según el resultado de una función aplicada a cada uno, produciendo un objeto donde cada clave es un valor de agrupación posible y cada valor es un array de los elementos que pertenecen a ese grupo. `Object.fromEntries()` hace la operación inversa a `Object.entries()`: convierte un array de pares `[clave, valor]` de vuelta en un objeto, particularmente útil al combinarse con métodos de array como `map` o `filter` sobre las entradas de un objeto existente, antes de reconstruirlo.

Combinar destructuring anidado con estas herramientas permite extraer directamente valores de estructuras de datos complejas y profundamente anidadas en una sola expresión declarativa, evitando accesos manuales encadenados como `usuario.direccion.ciudad`, y en su lugar escribiendo `const { direccion: { ciudad } } = usuario;`, extrayendo directamente `ciudad` como una variable local independiente.

**Analogía:** un getter es como un cajero automático que, en vez de simplemente entregarte un saldo guardado estáticamente, recalcula ese saldo en tiempo real cada vez que lo consultas, garantizando que nunca esté desincronizado con las transacciones más recientes; una propiedad computada es como escribir una etiqueta para un archivador usando el contenido de un post-it que tienes en la mano, en vez de escribir el texto literal "post-it" en la etiqueta.

**¿Por qué es importante?** Getters/setters permiten exponer una interfaz de propiedad simple mientras se ejecuta lógica de validación o cálculo por detrás, y las propiedades computadas son indispensables para construir objetos dinámicamente a partir de datos cuya estructura no se conoce en tiempo de escritura del código.

**Diagrama:**

```
class CuentaBancaria {
  #saldo = 0;
  get saldo() { return this.#saldo; }        ← lectura controlada
  depositar(m) { if (m>0) this.#saldo += m; } ← única forma de modificar
}
const clave = "total";
const obj = { [clave]: 100 };  // { total: 100 }, no { clave: 100 }
```

### Tema 4: Encapsulación con campos privados (#campo)

**Conceptos clave:** campos privados reales, diferencia con convención `_campo`, encapsulación impuesta por el motor.

Antes de la introducción de campos privados reales (sintaxis `#campo`) en una versión relativamente reciente del lenguaje, la única forma de señalar que una propiedad "debería" tratarse como privada era una convención puramente visual: anteponer un guion bajo (`_saldo`), sin ninguna protección real impuesta por el motor de JavaScript. Cualquier código externo podía acceder o modificar `instancia._saldo` directamente, sin ningún error ni restricción; la convención dependía enteramente de la disciplina voluntaria de quien consumía la clase, sin ninguna garantía técnica real.

Los campos privados con `#` son fundamentalmente distintos: son encapsulación real, impuesta directamente por el motor de JavaScript, no una simple convención de nomenclatura. Intentar acceder a `instancia.#saldo` desde fuera del cuerpo de la clase donde `#saldo` fue declarado no solo falla silenciosamente, sino que produce un `SyntaxError` en tiempo de análisis del código (no siquiera llega a ejecutarse), porque `#saldo` ni siquiera es una propiedad accesible mediante la sintaxis normal de acceso a propiedades fuera del scope léxico de la clase que lo define.

Esta diferencia tiene una implicación de diseño importante: los campos privados solo pueden accederse y modificarse a través de la interfaz pública que la propia clase decide exponer deliberadamente (métodos públicos, getters, setters), lo que fuerza a cualquier consumidor de la clase a pasar por las validaciones y la lógica que esos métodos públicos implementan, en vez de poder saltárselas accediendo directamente a la propiedad interna, como sí era técnicamente posible (aunque desaconsejado) con la convención `_saldo`.

Combinar campos privados con getters (Tema 3) es un patrón extremadamente común y recomendado: el campo permanece completamente inaccesible desde fuera (`#saldo`), mientras que un getter público (`get saldo()`) expone su valor de forma controlada y de solo lectura, sin exponer nunca una forma de asignación directa que evite las validaciones del método `depositar()`, garantizando así que el estado interno de cualquier instancia solo pueda cambiar a través de caminos explícitamente validados por la propia clase.

**Analogía:** la convención `_campo` es como un cartel de "prohibido el paso" colocado sobre una puerta sin cerradura, que cualquiera podría ignorar y cruzar de todas formas; un campo privado `#campo` es una puerta con una cerradura real cuya llave literalmente no existe fuera del edificio donde se definió, haciendo el acceso no autorizado no solo desaconsejado sino técnicamente imposible.

**¿Por qué es importante?** Los campos privados permiten diseñar clases con garantías reales de invariantes internas (por ejemplo, "el saldo nunca puede ser negativo"), algo que una simple convención de nomenclatura nunca pudo garantizar de forma técnica y verificable por el propio lenguaje.

**Diagrama:**

```
class CuentaBancaria {
  #saldo = 0;                    ← privado real, impuesto por el motor
  depositar(m) {
    if (m <= 0) throw new Error("Monto inválido");
    this.#saldo += m;             ← única forma válida de modificarlo
  }
  get saldo() { return this.#saldo; }
}
// cuenta.#saldo;  → SyntaxError fuera de la clase, ni siquiera se ejecuta
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

**Objetivo del laboratorio:** construir una jerarquía de clases con herencia real y encapsulación mediante campos privados, comparándola explícitamente con el modelo de prototipos subyacente.

**Requisitos previos:** Módulos 0-2 completados, entorno con soporte de campos privados (Node.js reciente o navegador moderno).

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Crear herencia con `Object.create` | Ver Tema 1 | Verifica que `hablar()` se hereda, no se copia |
| 2 | Definir `Animal` y `Perro extends Animal` | Ver Tema 2 | `Perro.hablar()` debe invocar `super.hablar()` |
| 3 | Añadir campo privado `#saldo` a `CuentaBancaria` | Ver Tema 4 | Expón un getter `saldo` y un método `depositar()` validado |
| 4 | Recorrer la cadena de prototipos | `Object.getPrototypeOf(instanciaDePerro)` repetidamente hasta `null` | Verifica que llega hasta `Object.prototype` |
| 5 | Crear una propiedad computada | `{ [claveDinamica]: valor }` | Verifica que la clave real es el valor de la variable, no su nombre literal |
| 6 | Comparar el estilo pre-ES6 con `class` | Implementa `Animal`/`Perro` con funciones constructoras y `.prototype` manualmente | Confirma que el comportamiento es idéntico al de `class` |

**Verificación:** el laboratorio se considera exitoso si `new Perro("Rex").hablar()` invoca correctamente el método heredado extendido con `super`, si `cuenta.#saldo` fuera de la clase produce un `SyntaxError`, y si la implementación pre-ES6 con `.prototype` produce exactamente el mismo comportamiento observable que la versión con `class`.

**Errores comunes y soluciones**

- **Olvidar invocar `super()` en el constructor de una clase hija antes de usar `this`.** JavaScript lanza un `ReferenceError` explícito si se intenta usar `this` antes de invocar `super()`; siempre invoca `super(...)` como la primera línea del constructor de la hija.
- **Confundir `_campo` (convención) con `#campo` (privado real) en términos de protección real.** Recuerda que `_campo` es solo una señal visual sin ninguna protección técnica; solo `#campo` es verdaderamente inaccesible desde fuera de la clase.
- **Intentar usar una propiedad computada sin corchetes.** `{ clave: valor }` crea una propiedad literalmente llamada `"clave"`; se necesita `{ [clave]: valor }` para que el nombre real sea el valor de la variable `clave`.

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

- Todo objeto en JavaScript hereda por delegación a través de una cadena de prototipos, no por copia.
- `class` es azúcar sintáctica sobre el mismo mecanismo de prototipos, no un modelo de herencia nuevo.
- `super()` invoca el constructor padre; `super.metodo()` invoca la versión padre de un método sobreescrito.
- Getters/setters permiten exponer propiedades calculadas o validadas de forma transparente.
- Los campos privados (`#campo`) son encapsulación real impuesta por el motor, a diferencia de la convención `_campo`.
- `Object.groupBy` y `Object.fromEntries` resuelven patrones comunes de agrupación y reconstrucción de objetos.

**Conceptos aprendidos**

- Cadena de prototipos y `Object.create`.
- `class`, `extends`, `super` y su relación con el mecanismo de prototipos.
- Getters, setters y propiedades computadas.
- Encapsulación real con campos privados.
- `Object.freeze`/`Object.seal` y destructuring anidado.

**Próximos pasos**

En el Módulo 4 aplicarás estos conceptos a estructuras de datos funcionales: `map`/`filter`/`reduce`, `Set`/`Map`, e inmutabilidad como práctica central de JavaScript moderno.

**Recursos adicionales**

- MDN Web Docs: "Object prototypes", "Classes" y "Private class features".
- El libro "You Don't Know JS: this & Object Prototypes" (Kyle Simpson).
