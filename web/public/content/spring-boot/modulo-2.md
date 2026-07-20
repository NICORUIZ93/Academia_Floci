# Módulo 2: REST APIs con Spring Web


## Aprende construyendo

### Tema 1: Por qué DTOs en vez de entidades directamente

**Conceptos clave:** desacoplar el contrato HTTP de la persistencia, evitar filtrar detalles internos.

`@RestController @RequestMapping("/api/tareas") public class TareaController { @PostMapping public ResponseEntity<TareaDTO> crear(@Valid @RequestBody CrearTareaRequest request) {...} }` recibe y devuelve DTOs (Data Transfer Objects) específicamente diseñados para el contrato HTTP, en vez de exponer directamente las entidades JPA (Módulo 3) que representan el modelo de persistencia interno: exponer entidades directamente filtraría detalles internos de la capa de persistencia hacia el contrato público de la API (campos que existen únicamente por razones de mapeo relacional, o relaciones internas que no deberían ser visibles ni modificables desde fuera), y además puede producir errores de serialización concretos con relaciones marcadas como `lazy` (Módulo 3), donde Jackson (Módulo 6 del track de Java) podría intentar serializar una relación que Hibernate todavía no cargó, produciendo una excepción en tiempo de ejecución.

Los DTOs actúan como una capa de traducción explícita entre el modelo interno de persistencia y el contrato público que la API expone, permitiendo que ambos evolucionen de forma independiente: renombrar un campo interno de la entidad, o reestructurar cómo se modela una relación internamente, no rompe necesariamente el contrato público de la API si el DTO correspondiente permanece estable, absorbiendo esa traducción internamente sin que los consumidores externos de la API se vean afectados por ese cambio interno.

**Analogía:** exponer entidades directamente es como mostrar a un cliente externo el inventario interno completo de un almacén, con sus códigos internos de ubicación y detalles de organización que no le conciernen ni debería poder modificar; un DTO es como un catálogo de cara al público, diseñado específicamente para comunicarse con clientes externos, que puede reorganizarse internamente el almacén sin que el catálogo público necesite cambiar en absoluto.

**¿Por qué es importante?** Los DTOs evitan filtrar detalles internos de persistencia hacia el contrato público de la API, previenen errores de serialización con relaciones lazy, y permiten que el modelo interno y el contrato público evolucionen de forma independiente.

**Código del ejemplo:**

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

### Tema 2: Validación con Bean Validation y ResponseEntity

**Conceptos clave:** anotaciones declarativas de validación, códigos de estado explícitos.

`public record CrearTareaRequest(@NotBlank String titulo, @Min(1) int prioridad) {}` declara restricciones de validación directamente sobre los campos del DTO de entrada mediante anotaciones de Bean Validation (`@NotBlank`, `@Min`, y otras similares como `@Size`, `@Email`), verificadas automáticamente por Spring cuando el parámetro correspondiente del controller se marca con `@Valid`, sin necesidad de escribir manualmente código de validación imperativo repetido en cada endpoint: si la validación falla, Spring lanza automáticamente una `MethodArgumentNotValidException` antes de que el código del método del controller siquiera se ejecute, deteniendo la petición inválida en ese punto.

`ResponseEntity` permite controlar explícitamente el código de estado HTTP devuelto según el resultado real de la operación, en vez de que Spring infiera automáticamente un único código genérico para todos los casos: `ResponseEntity.status(HttpStatus.CREATED).body(...)` (201, apropiado específicamente para una creación exitosa), o un 404 si el recurso solicitado no existe, comunicando con precisión semántica el resultado real de cada operación según las convenciones estándar de códigos de estado HTTP, en vez de devolver siempre 200 sin importar el resultado real, una práctica que dificultaría a los clientes de la API distinguir programáticamente entre distintos resultados posibles de una misma operación.

**Analogía:** Bean Validation es como un formulario que rechaza automáticamente cualquier entrada que no cumpla ciertas reglas declaradas explícitamente, sin que un revisor humano tenga que verificar manualmente cada regla en cada envío; usar el código de estado HTTP correcto es como usar el sello oficial preciso correspondiente a cada resultado específico de un trámite (aprobado, rechazado, no encontrado), en vez de un único sello genérico para cualquier resultado posible.

**¿Por qué es importante?** Bean Validation automatiza la verificación de restricciones de entrada sin código imperativo repetido; usar el código de estado HTTP correcto comunica con precisión semántica el resultado real de cada operación a los clientes de la API.

**Código del ejemplo:**

```java
public record CrearTareaRequest(
    @NotBlank String titulo,
    @Min(1) int prioridad
) {}
```

### Tema 3: Manejo centralizado de errores con @ControllerAdvice

**Conceptos clave:** `@ExceptionHandler`, formato de error consistente, sin try/catch repetido.

`@RestControllerAdvice public class GlobalExceptionHandler { @ExceptionHandler(MethodArgumentNotValidException.class) public ResponseEntity<ErrorResponse> manejarValidacion(...) {...} @ExceptionHandler(RecursoNoEncontradoException.class) public ResponseEntity<ErrorResponse> manejarNoEncontrado(...) {...} }` centraliza en una única clase el manejo de excepciones específicas que pueden ocurrir en cualquier controller de la aplicación, mapeando cada tipo de excepción a una respuesta HTTP consistente y con un formato de error uniforme, en vez de que cada método individual de cada controller tenga que envolver su propia lógica en bloques `try`/`catch` repetidos que traducen manualmente cada excepción a su respuesta HTTP correspondiente.

Este enfoque centralizado garantiza que absolutamente todos los controllers de la aplicación compartan exactamente el mismo formato de respuesta de error (el mismo `ErrorResponse` con la misma estructura de campos), un beneficio directo para cualquier cliente que consuma la API, que puede confiar en un formato de error predecible y consistente sin importar qué endpoint específico produjo el error, además de reducir significativamente la duplicación de lógica de manejo de errores repetida en cada controller individual, reflejando el mismo principio de manejo centralizado de errores estudiado para interceptores en el Módulo 7 del track de Angular, aquí aplicado específicamente al lado del servidor.

**Analogía:** `@ControllerAdvice` es como un departamento central de atención de reclamos que procesa de forma consistente cualquier tipo de problema reportado desde cualquier sucursal de una empresa, en vez de que cada sucursal individual tenga que improvisar su propio procedimiento particular de manejo de reclamos, potencialmente inconsistente entre sucursales distintas.

**¿Por qué es importante?** `@ControllerAdvice` centraliza el manejo de errores en un único lugar, garantizando un formato de respuesta de error consistente en toda la API sin duplicar lógica de manejo en cada controller individual.

**Código del ejemplo:**

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

---


## Laboratorio práctico

**Objetivo del laboratorio:** construir una API REST con validación de entrada y manejo centralizado de errores.

**Requisitos previos:** Módulos 0-1 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Crear GET/POST `/tareas` con DTOs | Ver Tema 1 | No expone la entidad directamente |
| 2 | Agregar validación con `@Valid` | Ver Tema 2 | `@NotBlank`, `@Min` en el DTO |
| 3 | Devolver `ResponseEntity` con códigos correctos | Ver Tema 2 | 201 al crear, 404 si no existe |
| 4 | Crear un `@ControllerAdvice` con `@ExceptionHandler` | Ver Tema 3 | Captura una excepción de negocio, devuelve 400 |
| 5 | Probar con curl un body inválido | — | Verifica el mensaje de error estructurado |

**Verificación:** el laboratorio se considera exitoso si ningún endpoint expone la entidad JPA directamente, y si una entrada inválida produce un error 400 con un mensaje estructurado consistente, sin ningún try/catch repetido en el controller.

**Errores comunes y soluciones**

- **Exponer la entidad JPA directamente en la respuesta HTTP.** Usa siempre un DTO específico para el contrato de la API.
- **Olvidar `@Valid` en el parámetro del controller.** Sin él, las anotaciones de Bean Validation en el DTO no se verifican.
- **Repetir try/catch en cada controller para el mismo tipo de error.** Centraliza ese manejo en un `@ControllerAdvice`.

---
