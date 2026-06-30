## Controller con DTOs

```java
@RestController
@RequestMapping("/api/tareas")
public class TareaController {
    @PostMapping
    public ResponseEntity<TareaDTO> crear(@Valid @RequestBody CrearTareaRequest request) {
        Tarea tarea = servicio.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(TareaDTO.from(tarea));
    }
}
```

Exponer DTOs (no entidades JPA directamente) evita filtrar detalles de persistencia en el contrato HTTP y previene problemas de serialización con relaciones lazy.

## Validación con Bean Validation

```java
public record CrearTareaRequest(
    @NotBlank String titulo,
    @Min(1) int prioridad
) {}
```

## Manejo centralizado de errores

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> manejarValidacion(MethodArgumentNotValidException ex) {
        return ResponseEntity.badRequest().body(new ErrorResponse(ex.getMessage()));
    }

    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<ErrorResponse> manejarNoEncontrado(RecursoNoEncontradoException ex) {
        return ResponseEntity.status(404).body(new ErrorResponse(ex.getMessage()));
    }
}
```

Todos los controllers comparten el mismo formato de error sin repetir try/catch en cada endpoint.
