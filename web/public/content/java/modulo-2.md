## List, Set, Map

```java
List<String> lista = new ArrayList<>();   // acceso indexado rápido, inserción al final eficiente
List<String> enlazada = new LinkedList<>(); // inserción/eliminación al inicio eficiente, acceso indexado lento

Set<String> unicos = new HashSet<>();      // sin duplicados, sin orden garantizado
Set<String> ordenado = new TreeSet<>();    // sin duplicados, ordenado automáticamente

Map<String, Integer> edades = new HashMap<>();
edades.put("Ana", 28);
```

## Genéricos

```java
class Caja<T> {
    private T contenido;
    void guardar(T valor) { this.contenido = valor; }
    T obtener() { return contenido; }
}

Caja<String> cajaTexto = new Caja<>();
```

`<T>` permite que `Caja` funcione con cualquier tipo, con seguridad de tipos verificada en tiempo de compilación (sin necesidad de castear al recuperar el valor).

## Comparable vs Comparator

```java
class Persona implements Comparable<Persona> {
    public int compareTo(Persona otra) { return this.edad - otra.edad; } // orden "natural"
}

personas.sort(Comparator.comparing(Persona::getNombre)); // orden alternativo, sin modificar la clase
```

## for-each sobre un Map

```java
for (Map.Entry<String, Integer> entrada : edades.entrySet()) {
    System.out.println(entrada.getKey() + ": " + entrada.getValue());
}
```
