# Módulo 6: I/O, NIO.2 y serialización


## Aprende construyendo

### Tema 1: NIO.2 — Path y Files

#### Paso 1 · Objetivo y preparación
Al finalizar podrás aplicar este tema Java desde cero. Prerrequisitos: JDK 21, Maven/Gradle y editor. Verifica java --version y mvn --version.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, esta capacidad debe producir código mantenible, pruebas reproducibles y diagnósticos útiles en producción.

#### Paso 3 · Teoría, modelo mental y analogía
Define el contrato, las entradas, las salidas y los límites del tema. La analogía es una estación de trabajo: cada operación tiene insumos, controles, resultado y procedimiento ante fallo.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-java-avanzado
cd ejemplo-java-avanzado
mkdir -p src/main/java/com/example
printf "demo\n" > README.md
javac --version
```
Crea src/main/java/com/example/Main.java con el ejemplo mínimo; compila con javac -d out y ejecuta con java -cp out com.example.Main.

#### Paso 5 · Práctica guiada
Pista: modifica deliberadamente una precondición para provocar un fallo deliberado de compilación, test o ejecución; lee el diagnóstico y corrígelo. Resultado esperado: salida reproducible.

#### Paso 6 · Práctica independiente
Añade un caso normal, uno límite y uno inválido; incorpora una prueba automatizada y documenta la decisión de diseño.

#### Paso 7 · Cierre y evidencia
Guarda código, comandos, salida, diagnóstico y prueba; como siguiente paso intégralo con Maven o Gradle. Errores comunes: ejecutar desde ruta equivocada, ocultar excepciones, depender de versiones flotantes y probar solo el caso feliz. Fuentes oficiales: https://dev.java/learn/ y https://docs.oracle.com/en/java/javase/21/.
**¿Por qué es importante?** Porque la comprensión se demuestra al ejecutar, fallar, diagnosticar y corregir.
**Evidencia de aprendizaje:** entrega proyecto aislado, resultado, fallo, corrección y test.
#### Paso 1 · Objetivo y preparación
Al finalizar podrás leer y escribir datos de forma segura desde cero. Prerrequisitos: JDK 21, Maven y un editor. Comprueba java --version y mvn --version.

#### Paso 2 · Contexto y caso real
En un caso real, una plataforma procesa comprobantes y configuraciones sin permitir rutas arbitrarias ni cargar archivos grandes completos en memoria.

#### Paso 3 · Teoría, modelo mental y analogía
Path representa una ubicación y Files ofrece operaciones explícitas; validar normalización evita traversal. Jackson convierte JSON, pero los datos externos deben validarse. Streams permiten procesar archivos grandes y classpath empaqueta recursos de solo lectura. La analogía es un archivador con permisos: conocer el nombre no autoriza abrir cualquier cajón.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-java-m6
cd ejemplo-java-m6
mkdir -p src/main/java/com/example
```
Crea src/main/java/com/example/Main.java que use Path.resolve dentro de un directorio permitido y try-with-resources; compila con javac -d out y ejecuta.

#### Paso 5 · Práctica guiada
Pista: pasa deliberadamente una ruta con .. para provocar un fallo deliberado de validación; observa el diagnóstico y corrígela. Resultado esperado: solo se lee dentro del directorio permitido.

#### Paso 6 · Práctica independiente
Añade lectura línea a línea, un DTO JSON con Jackson y una prueba de archivo ausente; mide memoria con un archivo grande.

#### Paso 7 · Cierre y evidencia
Guarda árbol de archivos, salida y medición; como siguiente paso estudia persistencia. Errores comunes: concatenar rutas, confiar en extensión, cerrar streams manualmente y leer todo con readAllBytes sin límite. Fuentes oficiales: https://dev.java/learn/java-io/file-system/ y https://github.com/FasterXML/jackson-docs.
**¿Por qué es importante?** Porque el manejo de archivos combina seguridad, rendimiento y corrección de recursos.
**Evidencia de aprendizaje:** entrega código, prueba de traversal, archivo JSON y medición.
**Conceptos clave:** API moderna frente a la clase File legada, operaciones expresivas.

`Path ruta = Path.of("datos.txt"); String contenido = Files.readString(ruta);` representa la API moderna de manejo de archivos introducida en Java 7 (NIO.2), reemplazando gradualmente a la antigua clase `File` (presente desde las primeras versiones de Java), que tenía limitaciones notables: métodos que devolvían simplemente `false` ante un error sin indicar la causa específica (en vez de lanzar una excepción descriptiva), y una API considerablemente menos expresiva para operaciones comunes como copiar, mover, o recorrer directorios recursivamente.

`Files` ofrece métodos de alto nivel considerablemente más convenientes que sus equivalentes con `File`: `Files.exists(ruta)` (verificar existencia), `Files.copy(origen, destino)` (copiar), `Files.walk(directorio)` (recorrer recursivamente un árbol de directorios como un stream, Módulo 4, en vez de una API recursiva manual más verbosa), y `Files.writeString(ruta, "nuevo contenido")` para escribir directamente sin necesidad de gestionar manualmente un `Writer` o `OutputStream` para el caso simple de escribir contenido de texto completo de una sola vez.

**Analogía:** la antigua clase `File` es como un mapa antiguo y básico que solo indica si un camino existe o no, sin más detalle; NIO.2 con `Path`/`Files` es como un sistema de navegación moderno que no solo confirma la existencia de un camino, sino que ofrece rutas alternativas expresivas y detalles específicos sobre cualquier problema encontrado en el trayecto.

**¿Por qué es importante?** NIO.2 ofrece una API más expresiva y con mejor manejo de errores que la antigua clase `File`, simplificando operaciones comunes de archivos que antes requerían código considerablemente más verboso.

**Código del ejemplo:**

```java
Path ruta = Path.of("datos.txt");
String contenido = Files.readString(ruta);
Files.writeString(ruta, "nuevo contenido");
```

#### Construcción RutaFlow: bandeja de importación segura

Crea `src/main/java/academia/entregas/BandejaImportacion.java`. Recibe un directorio `datos/entrada`, créalo con `Files.createDirectories`, escribe `guias.csv` y muévelo a `datos/procesados/guias.csv` con `Files.move`. Compila y ejecuta la clase desde la raíz; el resultado esperado es que el archivo deje de existir en entrada y aparezca en procesados.

Ejecuta una segunda vez sin política de reemplazo y diagnostica `FileAlreadyExistsException`. Decide explícitamente si rechazar duplicados, versionarlos o usar `REPLACE_EXISTING`; no lo añadas por reflejo. Como modificación, recorre solo archivos `.csv` con `Files.list` dentro de try-with-resources y evita seguir enlaces simbólicos sin necesidad. Esta bandeja será la entrada por lotes de RutaFlow y debe impedir sobrescrituras silenciosas.

### Tema 2: Serialización con Jackson

#### Paso 1 · Objetivo y preparación
Al finalizar podrás aplicar este tema Java desde cero. Prerrequisitos: JDK 21, Maven/Gradle y editor. Verifica java --version y mvn --version.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, esta capacidad debe producir código mantenible, pruebas reproducibles y diagnósticos útiles en producción.

#### Paso 3 · Teoría, modelo mental y analogía
Define el contrato, las entradas, las salidas y los límites del tema. La analogía es una estación de trabajo: cada operación tiene insumos, controles, resultado y procedimiento ante fallo.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-java-avanzado
cd ejemplo-java-avanzado
mkdir -p src/main/java/com/example
printf "demo\n" > README.md
javac --version
```
Crea src/main/java/com/example/Main.java con el ejemplo mínimo; compila con javac -d out y ejecuta con java -cp out com.example.Main.

#### Paso 5 · Práctica guiada
Pista: modifica deliberadamente una precondición para provocar un fallo deliberado de compilación, test o ejecución; lee el diagnóstico y corrígelo. Resultado esperado: salida reproducible.

#### Paso 6 · Práctica independiente
Añade un caso normal, uno límite y uno inválido; incorpora una prueba automatizada y documenta la decisión de diseño.

#### Paso 7 · Cierre y evidencia
Guarda código, comandos, salida, diagnóstico y prueba; como siguiente paso intégralo con Maven o Gradle. Errores comunes: ejecutar desde ruta equivocada, ocultar excepciones, depender de versiones flotantes y probar solo el caso feliz. Fuentes oficiales: https://dev.java/learn/ y https://docs.oracle.com/en/java/javase/21/.
**¿Por qué es importante?** Porque la comprensión se demuestra al ejecutar, fallar, diagnosticar y corregir.
**Evidencia de aprendizaje:** entrega proyecto aislado, resultado, fallo, corrección y test.
#### Paso 1 · Objetivo y preparación
Al finalizar podrás leer y escribir datos de forma segura desde cero. Prerrequisitos: JDK 21, Maven y un editor. Comprueba java --version y mvn --version.

#### Paso 2 · Contexto y caso real
En un caso real, una plataforma procesa comprobantes y configuraciones sin permitir rutas arbitrarias ni cargar archivos grandes completos en memoria.

#### Paso 3 · Teoría, modelo mental y analogía
Path representa una ubicación y Files ofrece operaciones explícitas; validar normalización evita traversal. Jackson convierte JSON, pero los datos externos deben validarse. Streams permiten procesar archivos grandes y classpath empaqueta recursos de solo lectura. La analogía es un archivador con permisos: conocer el nombre no autoriza abrir cualquier cajón.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-java-m6
cd ejemplo-java-m6
mkdir -p src/main/java/com/example
```
Crea src/main/java/com/example/Main.java que use Path.resolve dentro de un directorio permitido y try-with-resources; compila con javac -d out y ejecuta.

#### Paso 5 · Práctica guiada
Pista: pasa deliberadamente una ruta con .. para provocar un fallo deliberado de validación; observa el diagnóstico y corrígela. Resultado esperado: solo se lee dentro del directorio permitido.

#### Paso 6 · Práctica independiente
Añade lectura línea a línea, un DTO JSON con Jackson y una prueba de archivo ausente; mide memoria con un archivo grande.

#### Paso 7 · Cierre y evidencia
Guarda árbol de archivos, salida y medición; como siguiente paso estudia persistencia. Errores comunes: concatenar rutas, confiar en extensión, cerrar streams manualmente y leer todo con readAllBytes sin límite. Fuentes oficiales: https://dev.java/learn/java-io/file-system/ y https://github.com/FasterXML/jackson-docs.
**¿Por qué es importante?** Porque el manejo de archivos combina seguridad, rendimiento y corrección de recursos.
**Evidencia de aprendizaje:** entrega código, prueba de traversal, archivo JSON y medición.
**Conceptos clave:** `ObjectMapper`, serializar/deserializar, records como modelos de datos.

Jackson es la librería estándar de facto para convertir objetos Java a JSON y viceversa: `ObjectMapper mapper = new ObjectMapper(); String json = mapper.writeValueAsString(new Persona("Ana", 28));` serializa un objeto Java (aquí, un `record Persona(String nombre, int edad) {}`, Módulo 7) a su representación JSON equivalente, mientras `mapper.readValue(json, Persona.class)` realiza la operación inversa, reconstruyendo un objeto Java a partir de una cadena JSON, inspeccionando por reflexión la estructura de la clase de destino para determinar cómo mapear cada campo del JSON a su propiedad correspondiente.

Usar records (Módulo 7) como modelos de datos serializables con Jackson es una combinación particularmente natural: los records ya proporcionan constructores, getters y `equals`/`hashCode` generados automáticamente sin boilerplate manual, y Jackson los soporta de forma nativa desde versiones recientes, reconociendo automáticamente los componentes del record como las propiedades a serializar/deserializar, sin necesidad de anotaciones adicionales en el caso simple donde los nombres de los campos JSON coinciden directamente con los nombres de los componentes del record.

**Analogía:** Jackson es como un traductor bidireccional especializado entre dos idiomas (objetos Java y JSON), capaz de traducir automáticamente en ambas direcciones basándose en la estructura conocida de cada objeto, sin que el desarrollador tenga que escribir manualmente las reglas de traducción para cada campo individual.

**¿Por qué es importante?** Jackson automatiza la conversión entre objetos Java y JSON basándose en la estructura de la clase, eliminando la necesidad de escribir manualmente lógica de parsing y serialización campo por campo.

**Código del ejemplo:**

```java
record Persona(String nombre, int edad) {}

ObjectMapper mapper = new ObjectMapper();
String json = mapper.writeValueAsString(new Persona("Ana", 28));
Persona persona = mapper.readValue(json, Persona.class);
```

#### Construcción RutaFlow: contrato JSON verificable

Añade Jackson al `build.gradle.kts` y crea `src/main/java/academia/entregas/GuiaJson.java` con un `record GuiaDto(String numero, BigDecimal pesoKg)`. Serializa una instancia, deserialízala y compara con `equals`. Ejecuta `./gradlew run`; la salida esperada muestra el JSON y `roundTrip=true`.

Elimina `pesoKg` del JSON y decide si es obligatorio: configura validación después de deserializar o un constructor compacto que rechace `null`. Añade un campo desconocido y observa la política configurada; documenta si RutaFlow debe ser tolerante al recibir versiones futuras. Como modificación, separa `GuiaDto` de `Guia` y crea un mapper explícito para que el formato externo no controle las invariantes del dominio. No deserialices tipos polimórficos arbitrarios provenientes de usuarios.

### Tema 3: Archivos grandes y recursos del classpath

#### Paso 1 · Objetivo y preparación
Al finalizar podrás aplicar este tema Java desde cero. Prerrequisitos: JDK 21, Maven/Gradle y editor. Verifica java --version y mvn --version.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, esta capacidad debe producir código mantenible, pruebas reproducibles y diagnósticos útiles en producción.

#### Paso 3 · Teoría, modelo mental y analogía
Define el contrato, las entradas, las salidas y los límites del tema. La analogía es una estación de trabajo: cada operación tiene insumos, controles, resultado y procedimiento ante fallo.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-java-avanzado
cd ejemplo-java-avanzado
mkdir -p src/main/java/com/example
printf "demo\n" > README.md
javac --version
```
Crea src/main/java/com/example/Main.java con el ejemplo mínimo; compila con javac -d out y ejecuta con java -cp out com.example.Main.

#### Paso 5 · Práctica guiada
Pista: modifica deliberadamente una precondición para provocar un fallo deliberado de compilación, test o ejecución; lee el diagnóstico y corrígelo. Resultado esperado: salida reproducible.

#### Paso 6 · Práctica independiente
Añade un caso normal, uno límite y uno inválido; incorpora una prueba automatizada y documenta la decisión de diseño.

#### Paso 7 · Cierre y evidencia
Guarda código, comandos, salida, diagnóstico y prueba; como siguiente paso intégralo con Maven o Gradle. Errores comunes: ejecutar desde ruta equivocada, ocultar excepciones, depender de versiones flotantes y probar solo el caso feliz. Fuentes oficiales: https://dev.java/learn/ y https://docs.oracle.com/en/java/javase/21/.
**¿Por qué es importante?** Porque la comprensión se demuestra al ejecutar, fallar, diagnosticar y corregir.
**Evidencia de aprendizaje:** entrega proyecto aislado, resultado, fallo, corrección y test.
#### Paso 1 · Objetivo y preparación
Al finalizar podrás leer y escribir datos de forma segura desde cero. Prerrequisitos: JDK 21, Maven y un editor. Comprueba java --version y mvn --version.

#### Paso 2 · Contexto y caso real
En un caso real, una plataforma procesa comprobantes y configuraciones sin permitir rutas arbitrarias ni cargar archivos grandes completos en memoria.

#### Paso 3 · Teoría, modelo mental y analogía
Path representa una ubicación y Files ofrece operaciones explícitas; validar normalización evita traversal. Jackson convierte JSON, pero los datos externos deben validarse. Streams permiten procesar archivos grandes y classpath empaqueta recursos de solo lectura. La analogía es un archivador con permisos: conocer el nombre no autoriza abrir cualquier cajón.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-java-m6
cd ejemplo-java-m6
mkdir -p src/main/java/com/example
```
Crea src/main/java/com/example/Main.java que use Path.resolve dentro de un directorio permitido y try-with-resources; compila con javac -d out y ejecuta.

#### Paso 5 · Práctica guiada
Pista: pasa deliberadamente una ruta con .. para provocar un fallo deliberado de validación; observa el diagnóstico y corrígela. Resultado esperado: solo se lee dentro del directorio permitido.

#### Paso 6 · Práctica independiente
Añade lectura línea a línea, un DTO JSON con Jackson y una prueba de archivo ausente; mide memoria con un archivo grande.

#### Paso 7 · Cierre y evidencia
Guarda árbol de archivos, salida y medición; como siguiente paso estudia persistencia. Errores comunes: concatenar rutas, confiar en extensión, cerrar streams manualmente y leer todo con readAllBytes sin límite. Fuentes oficiales: https://dev.java/learn/java-io/file-system/ y https://github.com/FasterXML/jackson-docs.
**¿Por qué es importante?** Porque el manejo de archivos combina seguridad, rendimiento y corrección de recursos.
**Evidencia de aprendizaje:** entrega código, prueba de traversal, archivo JSON y medición.
**Conceptos clave:** procesamiento línea por línea, evitar cargar todo en memoria, `getResourceAsStream`.

Leer un archivo grande completo de una sola vez (con `Files.readAllBytes` o `Files.readString`, apropiados para archivos pequeños) carga necesariamente el contenido completo en memoria simultáneamente, un enfoque que se vuelve problemático o directamente inviable para archivos cuyo tamaño se acerca o supera la memoria disponible; `try (BufferedReader reader = Files.newBufferedReader(rutaGrande)) { String linea; while ((linea = reader.readLine()) != null) { procesar(linea); } }` procesa el archivo línea por línea, manteniendo en memoria en cualquier momento dado únicamente la línea actual (más el buffer interno de lectura), sin importar cuán grande sea el archivo completo en su totalidad.

`getResourceAsStream("/config.json")` carga un archivo empaquetado dentro del propio JAR de la aplicación (típicamente ubicado en `src/main/resources` durante el desarrollo, y empaquetado dentro del JAR final en producción), a diferencia de `Files`, que opera sobre el sistema de archivos real del sistema operativo donde la aplicación se ejecuta: los recursos del classpath viajan empaquetados junto con el propio código compilado de la aplicación, garantizando que estén disponibles sin importar en qué máquina o entorno específico se despliegue esa aplicación, mientras que un archivo en el sistema de archivos real depende de que exista físicamente en esa ubicación específica del sistema donde la aplicación se ejecuta en ese momento.

**Analogía:** leer un archivo completo de una sola vez es como intentar cargar un libro entero en la memoria de una sola mirada; leerlo línea por línea con un buffer es como leerlo página por página, recordando solo la página actual sin necesidad de mantener el libro completo abierto simultáneamente en la mente. Un recurso del classpath es como un anexo que viaja empaquetado junto con el manual de instrucciones mismo, disponible en cualquier lugar donde ese manual se distribuya, a diferencia de un archivo suelto que depende de existir físicamente en un lugar específico del destino.

**¿Por qué es importante?** Leer un archivo grande línea por línea con un buffer evita problemas de memoria que cargar el archivo completo (`readAllBytes`) no evita; los recursos del classpath garantizan disponibilidad empaquetada junto con el código, sin depender de la ubicación específica del sistema de archivos del entorno de destino.

**Código del ejemplo:**

```java
try (BufferedReader reader = Files.newBufferedReader(rutaGrande)) {
    String linea;
    while ((linea = reader.readLine()) != null) {
        procesar(linea); // procesa línea por línea, sin cargar el archivo completo en memoria
    }
}

try (InputStream in = getClass().getResourceAsStream("/config.json")) {
    String config = new String(in.readAllBytes());
}
```

#### Construcción RutaFlow: procesar un millón sin cargarlo

Crea `src/main/java/academia/entregas/ProcesadorCsv.java` y procesa `datos/guias-grande.csv` línea por línea, contando registros válidos e inválidos. Ejecuta `java -Xmx64m -cp out academia.entregas.ProcesadorCsv datos/guias-grande.csv`; el resultado debe mostrar ambos contadores sin depender del tamaño total en memoria.

Sustituye temporalmente el bucle por `Files.readAllLines` con un archivo suficientemente grande y observa `OutOfMemoryError` bajo el límite de memoria; vuelve al procesamiento incremental. Para el recurso `src/main/resources/reglas.json`, valida que `getResourceAsStream` no devuelva `null` antes de leer; un recurso empaquetado no es una ruta de disco modificable. Como modificación, informa número de línea en cada error. RutaFlow podrá reanudar y diagnosticar lotes sin ocultar cuál registro falló.

---


## Construcción guiada del capítulo

**Objetivo del laboratorio:** construir una utilidad que lea/escriba JSON desde y hacia disco con manejo robusto de errores.

**Requisitos previos:** Módulos 0-3 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Leer y escribir un archivo de texto con NIO.2 | Ver Tema 1 | `Files.readString`/`writeString` |
| 2 | Serializar y deserializar un objeto con Jackson | Ver Tema 2 | Verifica que los datos coinciden tras el ciclo completo |
| 3 | Leer un archivo grande línea por línea | Ver Tema 3 | Sin cargarlo completo en memoria |
| 4 | Cargar un recurso desde el classpath | Ver Tema 3 | `getResourceAsStream` |
| 5 | Manejar el caso de archivo inexistente | Ver Módulo 3 | Mensaje de error claro, sin catch vacío |

**Verificación:** el laboratorio se considera exitoso si la serialización y deserialización con Jackson preserva exactamente los datos originales, y si la lectura de un archivo grande no consume memoria proporcional al tamaño completo del archivo.

**Errores comunes y soluciones**

- **Usar `Files.readAllBytes` para archivos potencialmente muy grandes.** Usa un `BufferedReader` línea por línea para archivos grandes.
- **Confundir un recurso del classpath con un archivo del sistema de archivos.** Usa `getResourceAsStream` para recursos empaquetados en el JAR, `Files` para archivos externos reales.
- **No manejar el caso de archivo inexistente con un mensaje claro.** Captura la excepción específica y proporciona contexto útil, sin un catch vacío (Módulo 3).

---
