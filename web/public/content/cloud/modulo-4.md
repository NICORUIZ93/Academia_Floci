# Módulo 4: Bases de datos NoSQL con DynamoDB

## Sílabo

**Objetivo general**

Modelar datos en una base de datos NoSQL de clave-valor y documentos, entender los tipos de clave primaria y los índices secundarios, y dominar las operaciones CRUD y de consulta, incluyendo por qué Query es preferible a Scan.

**Objetivos específicos**

1. Explicar qué es NoSQL y en qué escenarios es preferible a una base de datos relacional.
2. Diseñar una tabla con clave primaria simple o compuesta según el caso de uso.
3. Realizar operaciones CRUD completas sobre items de DynamoDB.
4. Diferenciar índices secundarios globales (GSI) de locales (LSI) y saber cuándo usarlos.
5. Explicar por qué Query es más eficiente que Scan y cuándo cada uno es apropiado.

**Contenido**

- Qué es NoSQL y cuándo usarlo.
- Tablas, items y atributos.
- Tipos de datos: S, N, B, BOOL, NULL, L, M.
- Clave primaria simple (HASH) vs compuesta (HASH + RANGE).
- Índices secundarios globales (GSI) y locales (LSI).
- Query vs Scan.

**Evaluación**

Un laboratorio de operaciones CRUD completas y otro de Query vs Scan, más tres ejercicios de evaluación sobre diseño de claves, tipos de datos e índices.

---

## Aprende construyendo

### Tema 1: Qué es NoSQL y cuándo usarlo

**Conceptos clave:** NoSQL, esquema flexible, escalado horizontal, base de datos relacional (SQL) vs no relacional.

NoSQL es un término amplio que agrupa bases de datos que no siguen el modelo relacional tradicional de tablas fijas con esquema rígido y relaciones definidas mediante claves foráneas. DynamoDB, en concreto, es una base de datos de clave-valor y documentos: cada registro (llamado item) se identifica por una clave primaria, y su estructura de atributos no tiene que ser idéntica a la de otros items en la misma tabla, a diferencia de una tabla SQL donde todas las filas comparten exactamente las mismas columnas definidas de antemano.

Esta flexibilidad de esquema tiene una ventaja práctica importante: puedes añadir atributos nuevos a items nuevos sin necesidad de una migración de esquema que afecte a los items existentes. Si hoy tus items de "tarea" tienen los atributos `id`, `titulo` y `estado`, y mañana decides añadir un atributo `prioridad` solo a las tareas nuevas, no necesitas ejecutar ningún `ALTER TABLE` ni actualizar retroactivamente los items antiguos: simplemente empiezas a incluir ese atributo en los items nuevos, y los antiguos siguen funcionando exactamente igual sin ese atributo.

La otra característica definitoria de DynamoDB es su diseño para escalar horizontalmente de forma prácticamente ilimitada: en vez de depender de un único servidor cada vez más potente (escalado vertical, el enfoque típico de muchas bases de datos relacionales tradicionales), DynamoDB distribuye automáticamente los datos de una tabla entre múltiples particiones subyacentes según la clave primaria, de forma que el rendimiento se mantiene consistente incluso cuando el volumen de datos y de peticiones crece varios órdenes de magnitud.

Esto no significa que NoSQL sea "mejor" que SQL de forma general: es una elección de herramienta según el problema. Una base de datos relacional sigue siendo la opción más natural cuando necesitas consultas complejas con múltiples joins entre tablas, transacciones ACID complejas que abarcan muchas entidades relacionadas, o cuando la estructura de tus datos y sus relaciones son estables y bien conocidas de antemano. DynamoDB brilla cuando el patrón de acceso a los datos es predecible y se puede diseñar alrededor de una clave de acceso principal (por ejemplo, "dame todas las tareas de este usuario"), cuando necesitas escalar a un volumen muy grande con latencia predecible, o cuando el esquema de tus datos cambia con frecuencia entre distintos tipos de item.

**Analogía:** una base de datos relacional es como un archivador de oficina con carpetas de formato idéntico y estrictamente numeradas, donde cada carpeta tiene exactamente las mismas pestañas en el mismo orden; añadir una pestaña nueva significa rehacer todas las carpetas existentes. DynamoDB es como una caja de fichas donde cada ficha puede tener información distinta escrita en ella —algunas con más datos, otras con menos—, siempre que todas compartan un identificador único (la clave) que te permite encontrarlas rápidamente.

**¿Por qué es importante?** Elegir entre SQL y NoSQL es una de las decisiones de arquitectura más frecuentes al diseñar un sistema nuevo, y elegir mal puede generar fricción constante más adelante: forzar un esquema NoSQL a comportarse como relacional (haciendo muchos "joins" manuales en el código de aplicación) es tan problemático como forzar una base relacional a comportarse como NoSQL (con columnas genéricas tipo `atributo1`, `atributo2` para simular flexibilidad de esquema).

**Diagrama:**

```
Base de datos relacional (SQL)          DynamoDB (NoSQL)
┌───┬────────┬─────────┐               ┌────────────────────────┐
│id │titulo  │estado   │               │ {id:1, titulo:"A",       │
├───┼────────┼─────────┤               │  estado:"pendiente"}     │
│1  │A       │pendiente│               ├────────────────────────┤
│2  │B       │hecho    │               │ {id:2, titulo:"B",       │
└───┴────────┴─────────┘               │  estado:"hecho",         │
 Esquema fijo, todas las filas          │  prioridad:"alta"}       │  ← atributo extra,
 tienen las mismas columnas             └────────────────────────┘     solo en este item
```

### Tema 2: Tablas, items y atributos

**Conceptos clave:** tabla, item, atributo, capacidad, sin límite de items por tabla.

En DynamoDB, una tabla es el contenedor de nivel superior, similar en concepto a una tabla SQL, pero sin esquema de columnas fijo. Un item es cada registro individual dentro de la tabla, equivalente conceptualmente a una fila en SQL, pero cuya única estructura obligatoria es tener los atributos que forman la clave primaria de la tabla; todos los demás atributos son opcionales y pueden variar libremente entre items distintos de la misma tabla, como viste en el Tema 1. Un atributo es cada par nombre-valor dentro de un item, equivalente conceptualmente a una celda en una fila SQL, aunque el valor de un atributo puede ser, a su vez, una estructura anidada compleja (una lista o un mapa, como verás en el Tema 3).

Una tabla en DynamoDB no tiene un límite práctico de número de items: puede crecer desde unos pocos registros hasta miles de millones, sin que eso requiera un rediseño de la tabla en sí, precisamente porque DynamoDB reparte automáticamente los datos entre particiones internas según la clave primaria a medida que la tabla crece. Esta es una diferencia operativa importante frente a muchas bases de datos relacionales tradicionales, donde el crecimiento masivo de una sola tabla puede eventualmente requerir estrategias manuales de particionado (sharding) diseñadas explícitamente por el equipo de ingeniería.

Cada tabla se define, como mínimo, especificando el nombre de sus atributos de clave primaria y su tipo de dato; no se define de antemano ningún otro atributo. Esto se refleja directamente en el comando de creación de una tabla, que solo requiere especificar el esquema de la clave (`AttributeDefinitions` y `KeySchema`), sin necesidad de declarar ningún otro campo que los items vayan a tener eventualmente.

Un item completo se representa, tanto en la API de DynamoDB como en la AWS CLI, como un objeto JSON donde cada atributo se anota explícitamente con su tipo de dato (por ejemplo, `{"S": "texto"}` para una cadena, `{"N": "42"}` para un número). Esta anotación explícita de tipos —que puede parecer verbosa al principio comparada con JSON puro— es necesaria porque DynamoDB necesita saber, por ejemplo, si `"42"` debe tratarse como el número 42 (para permitir operaciones matemáticas y comparaciones numéricas correctas) o como el texto literal "42".

**Analogía:** si una tabla SQL es como una hoja de cálculo con columnas fijas donde cada fila debe rellenar cada columna (aunque sea con un valor vacío), una tabla DynamoDB es como una carpeta de fichas de contacto donde cada ficha puede tener campos distintos: algunas personas tienen "teléfono de trabajo" anotado, otras no, y eso no rompe nada, mientras todas las fichas compartan al menos el campo obligatorio que usas para ordenarlas y encontrarlas (el nombre, en esta analogía; la clave primaria, en DynamoDB).

**¿Por qué es importante?** Entender que solo la clave primaria es obligatoria, y que todo lo demás es flexible por item, es la base para diseñar correctamente tablas DynamoDB: en vez de pensar "qué columnas necesito", el diseño en DynamoDB empieza por pensar "cómo voy a acceder a estos datos", una diferencia de enfoque que vas a ver reforzada en el Tema 4 (claves) y el Tema 6 (Query vs Scan) de este mismo módulo.

**Diagrama:**

```
Tabla: Tareas (clave primaria: id)
┌──────────────────────────────────────────────┐
│ Item 1: {id: "t-001", titulo: "Comprar leche",  │
│          estado: "pendiente"}                    │
│ Item 2: {id: "t-002", titulo: "Pagar factura",   │
│          estado: "hecho", prioridad: "alta",      │
│          fecha_limite: "2026-08-01"}              │
└──────────────────────────────────────────────┘
   Solo "id" es obligatorio en todos los items;
   el resto de atributos varía libremente.
```

### Tema 3: Tipos de datos — S, N, B, BOOL, NULL, L, M

**Conceptos clave:** tipo escalar, tipo de conjunto, tipo de documento, `S` (string), `N` (number), `B` (binary), `BOOL`, `NULL`, `L` (list), `M` (map).

DynamoDB define un conjunto específico de tipos de datos que cada atributo debe declarar explícitamente. Los tipos escalares representan un único valor: `S` para cadenas de texto (strings), `N` para números (DynamoDB los almacena y transmite como texto para preservar precisión exacta, pero los trata como valores numéricos para comparaciones y operaciones matemáticas), `B` para datos binarios codificados en base64, `BOOL` para valores verdadero/falso, y `NULL` para representar explícitamente la ausencia de un valor (distinto de simplemente omitir el atributo).

Los tipos de documento permiten estructuras anidadas más complejas dentro de un mismo atributo. `L` (lista) es una colección ordenada de valores que pueden ser de tipos distintos entre sí (una lista puede mezclar strings, números y hasta otros mapas), similar a un array en JSON. `M` (mapa) es una colección de pares clave-valor anidados, similar a un objeto JSON anidado; es el tipo que usarías, por ejemplo, para guardar una dirección completa (calle, ciudad, código postal) como un único atributo estructurado dentro de un item, en vez de aplanarla en atributos separados como `direccion_calle`, `direccion_ciudad`.

También existen tipos de conjunto (`SS` para conjunto de strings, `NS` para conjunto de números, `BS` para conjunto de binarios), que representan colecciones de valores únicos del mismo tipo, sin orden garantizado y sin duplicados permitidos —a diferencia de una lista (`L`), que sí permite duplicados y mantiene el orden de inserción—. Un conjunto de strings sería apropiado, por ejemplo, para guardar las etiquetas únicas asociadas a un item, donde no importa el orden y no tiene sentido repetir la misma etiqueta dos veces.

Elegir el tipo correcto no es solo una cuestión de corrección formal: tiene implicaciones prácticas reales. Guardar un número como `S` en vez de `N` (por ejemplo, `{"S": "42"}` en vez de `{"N": "42"}`) impide hacer comparaciones numéricas correctas en consultas posteriores (ordenaría "10" antes que "9", porque compararía los textos carácter por carácter, no los valores numéricos). Del mismo modo, decidir entre aplanar la estructura de un item en atributos escalares separados o anidarla en un mapa (`M`) afecta a cómo de fácil es consultar o actualizar partes específicas de esa estructura más adelante.

**Analogía:** los tipos de datos de DynamoDB son como las distintas casillas de un formulario de papel bien diseñado: una casilla de texto libre (`S`), una casilla numérica que solo acepta cifras y permite sumarlas (`N`), una casilla de sí/no (`BOOL`), y un recuadro más grande donde puedes adjuntar una lista completa de elementos relacionados (`L`) o un sub-formulario anidado con sus propios campos (`M`). Usar la casilla equivocada —escribir un número en la casilla de texto libre— no rompe el formulario visualmente, pero impide procesarlo automáticamente más adelante de forma correcta.

**¿Por qué es importante?** Elegir el tipo de dato correcto desde el primer diseño de la tabla evita errores sutiles que aparecen más adelante, típicamente al intentar ordenar o comparar valores numéricos que fueron guardados incorrectamente como texto. Es un error común entre quien llega a DynamoDB desde una base de datos relacional, donde el tipo de columna se define una única vez a nivel de tabla, no atributo por atributo dentro de cada item.

**Diagrama:**

```
Item con distintos tipos de dato:
{
  "id":         {"S": "t-001"},
  "prioridad":  {"N": "3"},
  "completada": {"BOOL": false},
  "etiquetas":  {"L": [{"S": "urgente"}, {"S": "casa"}]},
  "direccion":  {"M": {"ciudad": {"S": "Bogotá"}, "cp": {"S": "110111"}}}
}
```

### Tema 4: Clave primaria simple (HASH) vs compuesta (HASH + RANGE)

**Conceptos clave:** clave de partición (HASH), clave de ordenación (RANGE), unicidad de la clave primaria, patrón de acceso.

DynamoDB ofrece dos formas de definir la clave primaria de una tabla. La primera es una clave simple, formada únicamente por un atributo de partición (HASH), que debe ser único para cada item en toda la tabla: no puede haber dos items con el mismo valor de clave de partición. Este es el equivalente más cercano a una clave primaria autoincremental de una tabla SQL tradicional: un identificador único por registro.

La segunda es una clave compuesta, formada por un atributo de partición (HASH) más un atributo de ordenación (RANGE). En este esquema, la combinación de ambos valores debe ser única, pero el valor de la clave de partición por sí solo puede repetirse en múltiples items, siempre que cada uno tenga un valor distinto de clave de ordenación. Esto habilita un patrón extremadamente común y potente: agrupar múltiples items relacionados bajo la misma clave de partición, y usar la clave de ordenación para diferenciarlos y, de paso, para consultarlos en un rango ordenado.

Un ejemplo concreto aclara esto: si diseñas una tabla de pedidos con clave de partición `usuario_id` y clave de ordenación `fecha_pedido`, puedes tener múltiples pedidos del mismo usuario (misma clave de partición) cada uno con una fecha distinta (clave de ordenación distinta), y además puedes consultar eficientemente "todos los pedidos del usuario X entre estas dos fechas" aprovechando que la clave de ordenación permite consultas por rango, algo que una clave simple no permitiría de forma nativa y eficiente.

La elección entre clave simple y compuesta depende directamente de tu patrón de acceso principal a los datos, no de una preferencia estética. Si tu caso de uso es "necesito buscar un único registro por su identificador único" (por ejemplo, una tabla de usuarios donde consultas por `usuario_id`), una clave simple es suficiente y más sencilla. Si tu caso de uso incluye "necesito todos los registros relacionados con este identificador, opcionalmente en un rango o en un orden concreto" (por ejemplo, todos los pedidos de un usuario, todos los mensajes de una conversación, todas las versiones de un documento), una clave compuesta es casi siempre la elección correcta, precisamente porque habilita el uso eficiente de Query (que verás en el Tema 6) sobre ese grupo de items relacionados.

**Analogía:** una clave simple es como el número de identificación de una persona en un archivo de ciudadanos: único, sin ambigüedad, y suficiente para encontrar exactamente a esa persona. Una clave compuesta es como el sistema de un archivo de expedientes médicos organizado por paciente (clave de partición) y fecha de consulta (clave de ordenación): puedes tener muchas consultas del mismo paciente, cada una en una fecha distinta, y el sistema te permite pedir eficientemente "todas las consultas de este paciente entre enero y marzo" sin tener que revisar el archivo completo.

**¿Por qué es importante?** La elección de clave primaria es, con diferencia, la decisión de diseño más importante al modelar una tabla DynamoDB, porque no es trivial de cambiar después: cambiar el esquema de clave de una tabla existente con datos reales normalmente implica crear una tabla nueva y migrar todos los items, no una simple modificación in situ. Pensarlo bien desde el principio, basándote en cómo vas a consultar los datos y no solo en cómo vas a guardarlos, evita ese coste de migración más adelante.

**Diagrama:**

```
Clave simple (solo HASH):              Clave compuesta (HASH + RANGE):
Tabla: Usuarios                        Tabla: Pedidos
┌────────────┐                        ┌──────────────┬─────────────┐
│ id (HASH)   │                        │ usuario_id    │ fecha_pedido │
├────────────┤                        │  (HASH)       │  (RANGE)     │
│ u-001        │                        ├──────────────┼─────────────┤
│ u-002        │                        │ u-001         │ 2026-01-05   │
└────────────┘                        │ u-001         │ 2026-02-14   │  ← mismo HASH,
  Cada id es único                     │ u-002         │ 2026-01-20   │     distinto RANGE
                                        └──────────────┴─────────────┘
```

### Tema 5: Índices secundarios globales (GSI) y locales (LSI)

**Conceptos clave:** índice secundario global (GSI), índice secundario local (LSI), clave de partición alternativa, proyección de atributos.

La clave primaria de una tabla define el único camino de acceso directo y eficiente a sus items usando Query, pero en la práctica casi ninguna aplicación necesita consultar sus datos por un único criterio de acceso. Los índices secundarios resuelven este problema, permitiendo consultas eficientes usando un atributo distinto al de la clave primaria original, sin necesidad de recurrir a un Scan completo de la tabla.

Un índice secundario global (GSI) define una clave de partición (y opcionalmente una de ordenación) completamente distinta a la de la tabla base, y se comporta, a efectos prácticos, como una vista alternativa de la tabla, con su propia capacidad de lectura y escritura, que se actualiza automáticamente (de forma asíncrona) cada vez que se modifica un item en la tabla base. Un GSI puede crearse en cualquier momento sobre una tabla existente, y puede usar cualquier atributo de la tabla como su nueva clave de partición, sin ninguna restricción de que ese atributo tenga relación con la clave primaria original.

Un índice secundario local (LSI), en cambio, mantiene la misma clave de partición que la tabla base, pero define una clave de ordenación alternativa distinta a la original. Esto permite, por ejemplo, sobre la tabla de pedidos del Tema 4 (partición `usuario_id`, ordenación `fecha_pedido`), crear un LSI que use la misma partición `usuario_id` pero una ordenación alternativa por `monto_total`, permitiendo consultar eficientemente "los pedidos del usuario X ordenados por monto" sin tener que hacerlo por fecha. Una restricción importante de los LSI, a diferencia de los GSI, es que deben definirse en el momento de crear la tabla, no se pueden añadir después sobre una tabla ya existente.

En la práctica, los GSI son mucho más usados que los LSI en el desarrollo moderno con DynamoDB, precisamente por su flexibilidad (se pueden añadir en cualquier momento, y permiten cambiar completamente la clave de partición, no solo la de ordenación). Los LSI tienen un caso de uso más estrecho: cuando necesitas una consistencia de lectura fuerte sobre la consulta alternativa (los GSI, al actualizarse de forma asíncrona, solo ofrecen consistencia eventual) y estás dispuesto a aceptar la restricción de definirlo desde la creación de la tabla.

**Analogía:** la tabla base con su clave primaria es como el índice principal de un libro, ordenado por número de capítulo. Un GSI es como añadir, en cualquier momento, un índice alfabético por tema al final del libro, que te permite buscar por un criterio completamente distinto sin tener que hojear el libro entero. Un LSI es como un índice secundario dentro de un mismo capítulo, que reordena solo ese capítulo por un criterio distinto (por ejemplo, por fecha en vez de por número de página), pero que debes decidir incluir cuando imprimes el libro por primera vez, no después.

**¿Por qué es importante?** El diseño de índices secundarios es lo que hace posible que una tabla DynamoDB, pese a tener una única clave primaria "principal", soporte en la práctica múltiples patrones de consulta eficientes distintos. Sin índices, cualquier consulta que no coincida exactamente con la clave primaria original requeriría un Scan completo, ineficiente a gran escala, como vas a ver en detalle en el siguiente tema.

**Diagrama:**

```
Tabla base: Pedidos (HASH: usuario_id, RANGE: fecha_pedido)

GSI "por-estado" (HASH: estado, RANGE: fecha_pedido)
   → permite: "todos los pedidos con estado=enviado, por fecha"

LSI "por-monto" (HASH: usuario_id, RANGE: monto_total)
   → permite: "todos los pedidos del usuario X, ordenados por monto"
```

### Tema 6: Query vs Scan

**Conceptos clave:** Query, Scan, coste de lectura, eficiencia de acceso, filtro posterior vs filtro de clave.

Query es la operación de lectura eficiente de DynamoDB: requiere especificar un valor exacto de clave de partición (y, opcionalmente, una condición sobre la clave de ordenación, como un rango o una comparación), y DynamoDB usa internamente su conocimiento de cómo están particionados los datos para ir directamente a la partición correcta y devolver únicamente los items que coinciden, sin necesidad de examinar el resto de la tabla. El coste de una Query (en unidades de capacidad de lectura, y por tanto en tiempo y en dinero en una cuenta real) es proporcional a la cantidad de datos que realmente coinciden con la condición, no al tamaño total de la tabla.

Scan, en cambio, examina absolutamente todos los items de la tabla, uno por uno, sin usar la clave de partición como filtro de acceso. Puedes aplicar un filtro adicional a un Scan (por ejemplo, "solo los items donde `estado` sea `pendiente`"), pero ese filtro se aplica después de leer cada item completo de la tabla, no antes: DynamoDB primero lee (y cobra) por examinar cada item de la tabla entera, y solo después descarta los que no cumplen el filtro. Esto significa que el coste de un Scan es proporcional al tamaño total de la tabla, sin importar cuántos items terminen realmente coincidiendo con tu filtro.

Esta diferencia, que puede parecer poco relevante en una tabla pequeña de laboratorio con unos pocos items, se vuelve crítica a medida que una tabla crece a miles o millones de items en un sistema real: un Scan sobre una tabla de un millón de items para encontrar los diez que cumplen un filtro específico examina —y cobra por— el millón de items completo, mientras que una Query bien diseñada, usando el atributo correcto como clave de partición, accede directamente solo a los items relevantes.

La implicación práctica de esto para el diseño de tablas es directa: el objetivo al diseñar la clave primaria (y los índices secundarios, del Tema 5) de una tabla DynamoDB es anticipar tus patrones de consulta más frecuentes, y modelar la clave de forma que esas consultas frecuentes puedan resolverse con Query, reservando Scan únicamente para operaciones poco frecuentes donde el coste de examinar la tabla completa es aceptable (por ejemplo, una exportación completa ocasional, o una tabla deliberadamente pequeña que sabes que nunca va a crecer significativamente).

**Analogía:** Query es como consultar el índice de un libro para ir directamente a la página del tema que buscas. Scan es como leer el libro completo, página por página, para encontrar las menciones de ese mismo tema, sin usar el índice en absoluto. Ambos métodos encuentran la información correcta, pero uno escala perfectamente con libros de cualquier tamaño, y el otro se vuelve progresivamente más lento cuanto más grueso es el libro.

**¿Por qué es importante?** Depender de Scan como estrategia principal de consulta es uno de los errores de diseño más comunes y más costosos al empezar a trabajar con DynamoDB, especialmente entre quienes vienen de un mundo SQL donde una consulta con `WHERE` sobre cualquier columna es igual de "barata" independientemente de si esa columna es la clave primaria o no. En DynamoDB, esa suposición simplemente no aplica, y diseñar bien la clave primaria y los índices desde el principio es lo que evita depender de Scan más adelante.

**Diagrama:**

```
Query (usuario_id = "u-001")           Scan (filtro: estado = "pendiente")
┌──────────────────────┐             ┌──────────────────────────────┐
│ Va directo a la         │             │ Examina TODOS los items de la │
│ partición de u-001,     │             │ tabla, uno por uno, y descarta │
│ lee solo esos items      │             │ los que no cumplen el filtro    │
│ Coste ∝ items de u-001   │             │ Coste ∝ tamaño total de la tabla│
└──────────────────────┘             └──────────────────────────────┘
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

> Este laboratorio asume que ya ejecutaste `floci start` y `eval $(floci env)` (Módulo 1) en tu sesión de terminal, así que los comandos de `aws` no repiten `--endpoint-url`.

**Objetivo del laboratorio:** crear una tabla de tareas con clave primaria simple, realizar operaciones CRUD completas, y comparar directamente el comportamiento de Query frente a Scan.

**Requisitos previos:** Floci corriendo con el servicio DynamoDB activo, AWS CLI configurada contra `http://localhost:4566`.

### Laboratorio 4.1 — CRUD completo

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Crear la tabla | `aws dynamodb create-table --table-name Tareas --attribute-definitions AttributeName=id,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --billing-mode PAY_PER_REQUEST` | Crea una tabla con clave primaria simple `id` de tipo string | Un JSON con `TableDescription` y `TableStatus: ACTIVE` (o `CREATING`) |
| 2 | Insertar un item | `aws dynamodb put-item --table-name Tareas --item '{"id":{"S":"t-001"},"titulo":{"S":"Comprar leche"},"estado":{"S":"pendiente"}}'` | Crea un item nuevo con tres atributos | Sin salida (comando exitoso) |
| 3 | Obtener el item por su clave | `aws dynamodb get-item --table-name Tareas --key '{"id":{"S":"t-001"}}'` | Recupera el item completo por su clave primaria | Un JSON con `Item` conteniendo los tres atributos |
| 4 | Actualizar un atributo | `aws dynamodb update-item --table-name Tareas --key '{"id":{"S":"t-001"}}' --update-expression "SET estado = :nuevo" --expression-attribute-values '{":nuevo":{"S":"hecho"}}'` | Modifica solo el atributo `estado`, sin tocar los demás | Sin salida (a menos que uses `--return-values ALL_NEW`) |
| 5 | Confirmar la actualización | `aws dynamodb get-item --table-name Tareas --key '{"id":{"S":"t-001"}}'` | Verifica que `estado` cambió a `hecho` | El JSON muestra `"estado":{"S":"hecho"}` |
| 6 | Eliminar el item | `aws dynamodb delete-item --table-name Tareas --key '{"id":{"S":"t-001"}}'` | Elimina el item de la tabla | Sin salida (comando exitoso) |
| 7 | Confirmar que ya no existe | `aws dynamodb get-item --table-name Tareas --key '{"id":{"S":"t-001"}}'` | El item ya no debería existir | Un JSON vacío, sin clave `Item` |

### Laboratorio 4.2 — Query vs Scan

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Insertar varios items de prueba | Repite `put-item` con `id: t-002, t-003, t-004`, variando `estado` entre `pendiente` y `hecho` | Prepara datos suficientes para comparar ambas operaciones | Cuatro items en total en la tabla (incluyendo uno nuevo con `id: t-001` si lo recreaste) |
| 2 | Ejecutar un Scan completo | `aws dynamodb scan --table-name Tareas` | Devuelve todos los items de la tabla, sin usar ninguna clave como filtro de acceso | Un JSON con `Items` conteniendo los cuatro items y `Count: 4` |
| 3 | Ejecutar una Query por clave exacta | `aws dynamodb query --table-name Tareas --key-condition-expression "id = :valor" --expression-attribute-values '{":valor":{"S":"t-002"}}'` | Devuelve únicamente el item cuya clave coincide exactamente | Un JSON con `Items` conteniendo solo el item `t-002` y `Count: 1` |
| 4 | Comparar el campo `ScannedCount` de ambas respuestas | Revisa el campo `ScannedCount` en la salida del Scan del paso 2 frente al de la Query del paso 3 | `ScannedCount` indica cuántos items examinó DynamoDB internamente antes de aplicar cualquier filtro | El Scan reporta `ScannedCount: 4` (examinó toda la tabla); la Query reporta `ScannedCount: 1` (fue directo al item) |

**Comprobación visual:** revisa **Cloud Explorer → Database** para conocer el modelo unificado, pero ten presente que la superficie DynamoDB todavía no está reconstruida en el Cloud Explorer actual. No confundas los flujos visibles de RDS o Cosmos DB con DynamoDB. Para este laboratorio, `get-item`, `query`, `scan` y sus contadores siguen siendo la verificación autoritativa.

**Verificación:** el laboratorio se considera exitoso si, tras el paso 7 del Laboratorio 4.1, `get-item` devuelve un resultado vacío confirmando el borrado, y si, en el Laboratorio 4.2, el `ScannedCount` de la Query es igual al número de items que realmente coinciden, mientras que el del Scan es igual al total de items de la tabla, evidenciando la diferencia de eficiencia entre ambas operaciones. Registra también esta limitación visual como parte del diagnóstico, no como fallo del runtime.

**Errores comunes y soluciones**

- **`ValidationException: One or more parameter values were invalid` en `put-item`.** Casi siempre significa que el JSON del `--item` no anota correctamente los tipos de dato (por ejemplo, escribir `{"titulo":"texto"}` en vez de `{"titulo":{"S":"texto"}}`). Revisa que cada atributo tenga su tipo explícito.
- **`ResourceNotFoundException` al ejecutar cualquier operación sobre la tabla.** La tabla todavía se está creando (el estado `CREATING` puede tardar unos segundos incluso en Floci), o el nombre está mal escrito. Espera con `aws dynamodb wait table-exists --table-name Tareas` antes de operar sobre ella.
- **`update-item` no falla pero el atributo no cambia.** Revisa que el nombre del atributo en `--update-expression` no sea una palabra reservada de DynamoDB (como `status` o `name`); si lo es, debes usar un `ExpressionAttributeNames` para referenciarlo de forma segura en vez de escribirlo directamente en la expresión.
- **Confundir `Count` con `ScannedCount` en la salida de Query o Scan.** `Count` es cuántos items se devolvieron después de aplicar cualquier filtro; `ScannedCount` es cuántos items se examinaron internamente antes del filtro. En una Query sin filtro adicional ambos suelen coincidir; en un Scan con filtro, `ScannedCount` casi siempre será mayor que `Count`, y esa diferencia es precisamente la evidencia del coste oculto de un Scan filtrado.

---



## Bibliografía y fundamento académico

Estas fuentes sustentan los conceptos y deben consultarse para verificar detalles que cambian entre versiones:

- AWS, Microsoft Azure y Google Cloud, marcos oficiales de arquitectura bien diseñada.
- NIST, *Cloud Computing Standards Roadmap* y *Secure Software Development Framework*.
- Beyer et al., *Site Reliability Engineering*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- DynamoDB es una base de datos NoSQL de clave-valor y documentos, con esquema flexible por item y escalado horizontal automático según la clave primaria.
- Una tabla no impone columnas fijas; solo la clave primaria es obligatoria en todos los items.
- Los tipos de datos (`S`, `N`, `B`, `BOOL`, `NULL`, `L`, `M`, y los tipos de conjunto) deben elegirse correctamente para permitir comparaciones y operaciones válidas más adelante.
- La clave primaria puede ser simple (HASH) o compuesta (HASH + RANGE); la compuesta permite agrupar y ordenar items relacionados bajo la misma partición.
- Los índices secundarios (GSI y LSI) habilitan patrones de consulta adicionales más allá de la clave primaria original.
- Query es eficiente porque accede directamente a la partición correcta; Scan examina toda la tabla y debe evitarse como patrón de consulta habitual en tablas grandes.

**Conceptos aprendidos**

- Diferencias entre NoSQL y bases de datos relacionales, y cuándo elegir cada una.
- Tablas, items y atributos, y la flexibilidad de esquema por item.
- Los siete tipos de datos escalares y de documento de DynamoDB.
- Clave primaria simple vs compuesta, y su impacto en el patrón de acceso.
- Índices secundarios globales y locales.
- Query vs Scan y su impacto real en coste y eficiencia.

**Próximos pasos**

En el Módulo 5 vas a escribir tu primera función serverless con Lambda, y vas a conectar conceptualmente ese cómputo sin servidor con los datos que ya sabes guardar en S3 y DynamoDB.

**Recursos adicionales**

- Documentación oficial de Amazon DynamoDB: conceptos básicos y guía de desarrollador.
- Documentación oficial sobre el diseño de claves primarias e índices secundarios en DynamoDB.
- Guía oficial de AWS sobre patrones de modelado de datos NoSQL (single-table design).
- Código ejecutable de cada operación (crear tabla, put, get, update, delete, query, scan) en Node.js, Python y Java: carpeta [`examples/`](https://github.com/NICORUIZ93/Academia_Floci/tree/main/examples) del repositorio, archivos que empiezan por `dynamodb-`/`dynamodb_`/`DynamoDb` (ver [`examples/README.md`](https://github.com/NICORUIZ93/Academia_Floci/blob/main/examples/README.md) para la lista completa).
