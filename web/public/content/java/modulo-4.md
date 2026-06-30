## Stream API

```java
List<String> nombresMayores = personas.stream()
    .filter(p -> p.getEdad() >= 18)
    .map(Persona::getNombre)
    .collect(Collectors.toList());

double totalSalarios = empleados.stream()
    .mapToDouble(Empleado::getSalario)
    .sum();
```

## Optional: evitar null explícitamente

```java
Optional<Persona> buscarPorId(int id) {
    return personas.stream().filter(p -> p.getId() == id).findFirst();
}

Persona persona = buscarPorId(5).orElseThrow(() -> new NoSuchElementException("No encontrado"));
```

`Optional` obliga, en el tipo de retorno, a que quien llama la función considere explícitamente el caso "no hay valor" — en vez de descubrirlo en producción con un `NullPointerException`.

## Streams paralelos

```java
long conteo = numeros.parallelStream().filter(this::esPrimo).count();
```

Útil solo para datasets grandes y operaciones CPU-intensivas sin efectos secundarios — para colecciones pequeñas, el overhead de paralelizar supera la ganancia.

## Referencias a métodos

```java
.map(Persona::getNombre)   // equivalente a .map(p -> p.getNombre())
```
