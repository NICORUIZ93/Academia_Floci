## Maven

```xml
<dependencies>
  <dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.17.0</version>
  </dependency>
</dependencies>
```

```bash
mvn clean compile test package   # ciclo de vida: limpia, compila, prueba, empaqueta
```

## Gradle (Kotlin DSL)

```kotlin
dependencies {
    implementation("com.fasterxml.jackson.core:jackson-databind:2.17.0")
    testImplementation("org.junit.jupiter:junit-jupiter:5.10.0")
}
```

```bash
./gradlew build
```

Gradle es más flexible y generalmente más rápido (cache incremental); Maven es más declarativo y predecible. Ambos son válidos — la elección suele depender de la convención del equipo.

## Scopes/configuraciones

`testImplementation` (Gradle) o `<scope>test</scope>` (Maven) asegura que una dependencia como JUnit no se incluya en el artefacto final de producción.

## Multi-módulo

```
proyecto/
  core/        (lógica de dominio)
  api/         (depende de core, expone HTTP)
  build.gradle.kts (raíz, configuración compartida)
```
