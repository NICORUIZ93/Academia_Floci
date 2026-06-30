## module-info.java

```java
// core/src/main/java/module-info.java
module com.miapp.core {
    exports com.miapp.core.dominio; // solo este paquete es visible para otros módulos
}

// app/src/main/java/module-info.java
module com.miapp.app {
    requires com.miapp.core;
}
```

## Encapsulación fuerte

Antes de JPMS, marcar una clase como `public` la hacía accesible desde CUALQUIER otro código en el classpath. Con módulos, un paquete que no esté en `exports` permanece inaccesible fuera del módulo, incluso si sus clases son `public` — encapsulación real a nivel de módulo, no solo de clase.

## Migración incremental

1. Empieza por los módulos de "hoja" (sin dependencias internas) agregando su `module-info.java`.
2. Sube en el árbol de dependencias agregando módulos hasta cubrir todo el proyecto.
3. Usa `requires transitive` cuando un módulo expone tipos de otro módulo en su propia API pública.

## Cuándo JPMS aporta valor

Para bibliotecas grandes y de larga vida (como el propio JDK) o sistemas con muchos equipos compartiendo un mismo código base, JPMS da límites arquitectónicos verificados por el compilador. Para un proyecto pequeño o un microservicio independiente, suele ser complejidad sin beneficio proporcional.
