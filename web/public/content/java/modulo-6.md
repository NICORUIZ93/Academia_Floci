## NIO.2: Path y Files

```java
Path ruta = Path.of("datos.txt");
String contenido = Files.readString(ruta);
Files.writeString(ruta, "nuevo contenido");
```

API moderna que reemplaza la antigua clase `File`, con mejor manejo de errores y operaciones más expresivas (`Files.exists`, `Files.copy`, `Files.walk` para recorrer directorios).

## Serialización con Jackson

```java
record Persona(String nombre, int edad) {}

ObjectMapper mapper = new ObjectMapper();
String json = mapper.writeValueAsString(new Persona("Ana", 28));
Persona persona = mapper.readValue(json, Persona.class);
```

## Archivos grandes con buffer

```java
try (BufferedReader reader = Files.newBufferedReader(rutaGrande)) {
    String linea;
    while ((linea = reader.readLine()) != null) {
        procesar(linea); // procesa línea por línea, sin cargar el archivo completo en memoria
    }
}
```

## Recursos en el classpath

```java
try (InputStream in = getClass().getResourceAsStream("/config.json")) {
    String config = new String(in.readAllBytes());
}
```

Lee archivos empaquetados dentro del propio JAR, no del sistema de archivos del usuario.
