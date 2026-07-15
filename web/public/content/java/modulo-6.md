# Módulo 6: I/O, NIO.2 y serialización

## Sílabo

**Objetivo general**

Leer, escribir y serializar datos de forma eficiente usando la API moderna de archivos de Java (NIO.2), Jackson para serialización JSON, y técnicas apropiadas para archivos grandes y recursos empaquetados.

**Objetivos específicos**

1. Leer y escribir archivos de texto con `Files.readString`/`writeString`.
2. Serializar y deserializar objetos Java a JSON con Jackson.
3. Leer un archivo grande línea por línea sin cargarlo completo en memoria.
4. Cargar un recurso desde el classpath.
5. Manejar apropiadamente el caso de un archivo inexistente.

**Contenido**

- `java.nio.file`: Path y Files.
- Serialización con Jackson/Gson.
- Lectura de archivos grandes con buffers.
- Recursos en el classpath.

**Evaluación**

Utilidad que lee/escribe JSON desde y hacia disco con manejo de errores, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: NIO.2 — Path y Files

**Conceptos clave:** API moderna frente a la clase File legada, operaciones expresivas.

`Path ruta = Path.of("datos.txt"); String contenido = Files.readString(ruta);` representa la API moderna de manejo de archivos introducida en Java 7 (NIO.2), reemplazando gradualmente a la antigua clase `File` (presente desde las primeras versiones de Java), que tenía limitaciones notables: métodos que devolvían simplemente `false` ante un error sin indicar la causa específica (en vez de lanzar una excepción descriptiva), y una API considerablemente menos expresiva para operaciones comunes como copiar, mover, o recorrer directorios recursivamente.

`Files` ofrece métodos de alto nivel considerablemente más convenientes que sus equivalentes con `File`: `Files.exists(ruta)` (verificar existencia), `Files.copy(origen, destino)` (copiar), `Files.walk(directorio)` (recorrer recursivamente un árbol de directorios como un stream, Módulo 4, en vez de una API recursiva manual más verbosa), y `Files.writeString(ruta, "nuevo contenido")` para escribir directamente sin necesidad de gestionar manualmente un `Writer` o `OutputStream` para el caso simple de escribir contenido de texto completo de una sola vez.

**Analogía:** la antigua clase `File` es como un mapa antiguo y básico que solo indica si un camino existe o no, sin más detalle; NIO.2 con `Path`/`Files` es como un sistema de navegación moderno que no solo confirma la existencia de un camino, sino que ofrece rutas alternativas expresivas y detalles específicos sobre cualquier problema encontrado en el trayecto.

**¿Por qué es importante?** NIO.2 ofrece una API más expresiva y con mejor manejo de errores que la antigua clase `File`, simplificando operaciones comunes de archivos que antes requerían código considerablemente más verboso.

**Diagrama:**

```java
Path ruta = Path.of("datos.txt");
String contenido = Files.readString(ruta);
Files.writeString(ruta, "nuevo contenido");
```

### Tema 2: Serialización con Jackson

**Conceptos clave:** `ObjectMapper`, serializar/deserializar, records como modelos de datos.

Jackson es la librería estándar de facto para convertir objetos Java a JSON y viceversa: `ObjectMapper mapper = new ObjectMapper(); String json = mapper.writeValueAsString(new Persona("Ana", 28));` serializa un objeto Java (aquí, un `record Persona(String nombre, int edad) {}`, Módulo 7) a su representación JSON equivalente, mientras `mapper.readValue(json, Persona.class)` realiza la operación inversa, reconstruyendo un objeto Java a partir de una cadena JSON, inspeccionando por reflexión la estructura de la clase de destino para determinar cómo mapear cada campo del JSON a su propiedad correspondiente.

Usar records (Módulo 7) como modelos de datos serializables con Jackson es una combinación particularmente natural: los records ya proporcionan constructores, getters y `equals`/`hashCode` generados automáticamente sin boilerplate manual, y Jackson los soporta de forma nativa desde versiones recientes, reconociendo automáticamente los componentes del record como las propiedades a serializar/deserializar, sin necesidad de anotaciones adicionales en el caso simple donde los nombres de los campos JSON coinciden directamente con los nombres de los componentes del record.

**Analogía:** Jackson es como un traductor bidireccional especializado entre dos idiomas (objetos Java y JSON), capaz de traducir automáticamente en ambas direcciones basándose en la estructura conocida de cada objeto, sin que el desarrollador tenga que escribir manualmente las reglas de traducción para cada campo individual.

**¿Por qué es importante?** Jackson automatiza la conversión entre objetos Java y JSON basándose en la estructura de la clase, eliminando la necesidad de escribir manualmente lógica de parsing y serialización campo por campo.

**Diagrama:**

```java
record Persona(String nombre, int edad) {}

ObjectMapper mapper = new ObjectMapper();
String json = mapper.writeValueAsString(new Persona("Ana", 28));
Persona persona = mapper.readValue(json, Persona.class);
```

### Tema 3: Archivos grandes y recursos del classpath

**Conceptos clave:** procesamiento línea por línea, evitar cargar todo en memoria, `getResourceAsStream`.

Leer un archivo grande completo de una sola vez (con `Files.readAllBytes` o `Files.readString`, apropiados para archivos pequeños) carga necesariamente el contenido completo en memoria simultáneamente, un enfoque que se vuelve problemático o directamente inviable para archivos cuyo tamaño se acerca o supera la memoria disponible; `try (BufferedReader reader = Files.newBufferedReader(rutaGrande)) { String linea; while ((linea = reader.readLine()) != null) { procesar(linea); } }` procesa el archivo línea por línea, manteniendo en memoria en cualquier momento dado únicamente la línea actual (más el buffer interno de lectura), sin importar cuán grande sea el archivo completo en su totalidad.

`getResourceAsStream("/config.json")` carga un archivo empaquetado dentro del propio JAR de la aplicación (típicamente ubicado en `src/main/resources` durante el desarrollo, y empaquetado dentro del JAR final en producción), a diferencia de `Files`, que opera sobre el sistema de archivos real del sistema operativo donde la aplicación se ejecuta: los recursos del classpath viajan empaquetados junto con el propio código compilado de la aplicación, garantizando que estén disponibles sin importar en qué máquina o entorno específico se despliegue esa aplicación, mientras que un archivo en el sistema de archivos real depende de que exista físicamente en esa ubicación específica del sistema donde la aplicación se ejecuta en ese momento.

**Analogía:** leer un archivo completo de una sola vez es como intentar cargar un libro entero en la memoria de una sola mirada; leerlo línea por línea con un buffer es como leerlo página por página, recordando solo la página actual sin necesidad de mantener el libro completo abierto simultáneamente en la mente. Un recurso del classpath es como un anexo que viaja empaquetado junto con el manual de instrucciones mismo, disponible en cualquier lugar donde ese manual se distribuya, a diferencia de un archivo suelto que depende de existir físicamente en un lugar específico del destino.

**¿Por qué es importante?** Leer un archivo grande línea por línea con un buffer evita problemas de memoria que cargar el archivo completo (`readAllBytes`) no evita; los recursos del classpath garantizan disponibilidad empaquetada junto con el código, sin depender de la ubicación específica del sistema de archivos del entorno de destino.

**Diagrama:**

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

---

## Laboratorio práctico

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

## Ejercicios de evaluación

### Ejercicio 1: Ventaja de Path sobre File

**Enunciado:** ¿qué ventaja da `java.nio.file.Path` sobre la antigua clase `File`?

**Solución esperada:** `Path`, junto con la clase `Files`, ofrece una API considerablemente más expresiva para operaciones comunes (copiar, mover, recorrer directorios recursivamente como stream) y mejor manejo de errores mediante excepciones descriptivas, en vez de simplemente devolver `false` ante un error sin indicar la causa específica, como hacía frecuentemente la antigua clase `File`.

**Criterios de éxito:**
- Menciona correctamente la mejora en manejo de errores y/o la mayor expresividad de operaciones como ventajas de `Path`/`Files`.

### Ejercicio 2: Por qué leer con buffer evita problemas de memoria

**Enunciado:** ¿por qué leer un archivo grande con buffer evita problemas de memoria que `readAllBytes` no evita?

**Solución esperada:** `readAllBytes` carga el contenido completo del archivo en memoria simultáneamente, un enfoque inviable si el archivo se acerca o supera la memoria disponible; leer con un `BufferedReader` línea por línea mantiene en memoria únicamente la línea actual (más el buffer interno de lectura) en cualquier momento dado, sin importar el tamaño total del archivo completo.

**Criterios de éxito:**
- Explica correctamente la diferencia entre cargar todo el contenido de una vez y procesar incrementalmente.

### Ejercicio 3: Recursos del classpath frente a archivos del sistema

**Enunciado:** ¿por qué usar `getResourceAsStream` en vez de `Files` para cargar un archivo de configuración empaquetado con la aplicación?

**Solución esperada:** un recurso del classpath viaja empaquetado dentro del propio JAR de la aplicación, garantizando su disponibilidad sin importar en qué máquina o entorno se despliegue esa aplicación; un archivo cargado con `Files` depende de que exista físicamente en una ubicación específica del sistema de archivos del entorno donde la aplicación se ejecuta, una dependencia externa que el recurso empaquetado del classpath evita completamente.

**Criterios de éxito:**
- Explica correctamente la garantía de disponibilidad empaquetada del classpath frente a la dependencia de una ubicación externa del sistema de archivos.

---

## Resumen del módulo

**Puntos clave**

- NIO.2 (`Path`/`Files`) ofrece una API moderna y expresiva que reemplaza a la antigua clase `File`.
- Jackson automatiza la conversión entre objetos Java (incluyendo records) y JSON.
- Leer archivos grandes línea por línea con buffer evita cargar el contenido completo en memoria.
- Los recursos del classpath viajan empaquetados con la aplicación, a diferencia de archivos del sistema de archivos real.

**Conceptos aprendidos**

- NIO.2: Path y Files.
- Serialización con Jackson.
- Lectura eficiente de archivos grandes.
- Recursos en el classpath.

**Próximos pasos**

En el Módulo 7 aprenderás las features modernas de Java: records, sealed classes, y pattern matching.

**Recursos adicionales**

- Documentación oficial de Java (docs.oracle.com/en/java): "File I/O (NIO.2)" y documentación de Jackson (github.com/FasterXML/jackson).
