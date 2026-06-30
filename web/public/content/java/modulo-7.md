## record: modelos inmutables sin boilerplate

```java
record Punto(int x, int y) {}
// genera automáticamente: constructor, getters (x(), y()), equals, hashCode y toString

Punto p = new Punto(3, 4);
p.x(); // 3
```

## sealed: jerarquías cerradas

```java
sealed interface Forma permits Circulo, Cuadrado {}
record Circulo(double radio) implements Forma {}
record Cuadrado(double lado) implements Forma {}
```

`sealed` declara explícitamente qué clases pueden implementar la interfaz — el compilador puede entonces verificar exhaustividad en un switch.

## Pattern matching exhaustivo

```java
double area(Forma forma) {
    return switch (forma) {
        case Circulo c -> Math.PI * c.radio() * c.radio();
        case Cuadrado q -> q.lado() * q.lado();
        // sin default: el compilador verifica que cubriste TODOS los casos posibles de Forma
    };
}
```

Si agregas una nueva forma a la lista `permits` y olvidas su caso en el switch, el compilador falla — no un bug silencioso en producción.

## Pattern matching para instanceof

```java
if (obj instanceof Circulo c) {
    System.out.println(c.radio()); // sin casteo manual: c ya es de tipo Circulo aquí
}
```

## Text blocks

```java
String sql = """
    SELECT * FROM usuarios
    WHERE activo = true
    """;
```
