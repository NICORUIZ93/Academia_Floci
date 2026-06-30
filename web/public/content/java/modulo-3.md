## Checked vs unchecked

```java
// checked: el compilador OBLIGA a manejarla o declararla con throws
void leerArchivo() throws IOException { ... }

// unchecked (RuntimeException): no es obligatorio manejarla, suele indicar un bug
int x = lista.get(100); // IndexOutOfBoundsException si la lista tiene menos elementos
```

## try-with-resources

```java
try (BufferedReader reader = Files.newBufferedReader(ruta)) {
    String linea = reader.readLine();
} // reader.close() se llama automáticamente, incluso si hay una excepción
```

Cualquier clase que implemente `AutoCloseable` puede usarse aquí — el cierre del recurso está garantizado sin un `finally` manual.

## Excepciones personalizadas

```java
class SaldoInsuficienteException extends RuntimeException {
    SaldoInsuficienteException(String mensaje) { super(mensaje); }
}

if (saldo < monto) throw new SaldoInsuficienteException("Saldo: " + saldo);
```

## No tragues excepciones

```java
// MAL: oculta el error, hace el bug invisible
try { operacionRiesgosa(); } catch (Exception e) { }

// BIEN: al menos registra el error antes de decidir qué hacer
try { operacionRiesgosa(); } catch (Exception e) {
    log.error("Falló la operación", e);
    throw e; // o maneja explícitamente
}
```
