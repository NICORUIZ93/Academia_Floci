# Módulo 2: REST APIs con Spring Web

## Sílabo

**Objetivo general**

Exponer endpoints HTTP con `@RestController`, validación de entrada con Bean Validation, códigos de estado apropiados con `ResponseEntity`, y manejo centralizado de errores con `@ControllerAdvice`.

**Objetivos específicos**

1. Crear endpoints con `@RestController` que reciban y devuelvan DTOs, no entidades directamente.
2. Validar entrada con `@Valid` y anotaciones de Bean Validation.
3. Devolver `ResponseEntity` con el código de estado correcto según el caso.
4. Centralizar el manejo de errores con `@ControllerAdvice`.

**Contenido**

- `@RestController` y mapeo de rutas.
- DTOs y validación con Bean Validation.
- `ResponseEntity` y códigos de estado.
- `@ControllerAdvice` para errores centralizados.

**Evaluación**

API REST con validación de entrada y manejo centralizado de errores, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Por qué DTOs en vez de entidades directamente

**Conceptos clave:** desacoplar el contrato HTTP de la persistencia, evitar filtrar detalles internos.

`@RestController @RequestMapping("/api/tareas") public class TareaController { @PostMapping public ResponseEntity<TareaDTO> crear(@Valid @RequestBody CrearTareaRequest request) {...} }` recibe y devuelve DTOs (Data Transfer Objects) específicamente diseñados para el contrato HTTP, en vez de exponer directamente las entidades JPA (Módulo 3) que representan el modelo de persistencia interno: exponer entidades directamente filtraría detalles internos de la capa de persistencia hacia el contrato público de la API (campos que existen únicamente por razones de mapeo relacional, o relaciones internas que no deberían ser visibles ni modificables desde fuera), y además puede producir errores de serialización concretos con relaciones marcadas como `lazy` (Módulo 3), donde Jackson (Módulo 6 del track de Java) podría intentar serializar una relación que Hibernate todavía no cargó, produciendo una excepción en tiempo de ejecución.

Los DTOs actúan como una capa de traducción explícita entre el modelo interno de persistencia y el contrato público que la API expone, permitiendo que ambos evolucionen de forma independiente: renombrar un campo interno de la entidad, o reestructurar cómo se modela una relación internamente, no rompe necesariamente el contrato público de la API si el DTO correspondiente permanece estable, absorbiendo esa traducción internamente sin que los consumidores externos de la API se vean afectados por ese cambio interno.

**Analogía:** exponer entidades directamente es como mostrar a un cliente externo el inventario interno completo de un almacén, con sus códigos internos de ubicación y detalles de organización que no le conciernen ni debería poder modificar; un DTO es como un catálogo de cara al público, diseñado específicamente para comunicarse con clientes externos, que puede reorganizarse internamente el almacén sin que el catálogo público necesite cambiar en absoluto.

**¿Por qué es importante?** Los DTOs evitan filtrar detalles internos de persistencia hacia el contrato público de la API, previenen errores de serialización con relaciones lazy, y permiten que el modelo interno y el contrato público evolucionen de forma independiente.

**Diagrama:**

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

**Diagrama:**

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

**Diagrama:**

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

## Ejercicios de evaluación

### Ejercicio 1: Por qué exponer DTOs en vez de entidades

**Enunciado:** ¿por qué exponer DTOs en vez de entidades JPA directamente en la API?

**Solución esperada:** exponer entidades directamente filtraría detalles internos de persistencia hacia el contrato público, puede producir errores de serialización con relaciones lazy, y acopla el contrato público de la API al modelo interno de persistencia, impidiendo que ambos evolucionen de forma independiente.

**Criterios de éxito:**
- Menciona correctamente al menos dos de las tres razones (filtrado de detalles internos, errores de serialización lazy, acoplamiento).

### Ejercicio 2: Ventaja de centralizar el manejo de errores

**Enunciado:** ¿qué ventaja da centralizar el manejo de errores en un `@ControllerAdvice`?

**Solución esperada:** garantiza que todos los controllers de la aplicación compartan exactamente el mismo formato de respuesta de error, reduce la duplicación de lógica de manejo repetida en cada controller individual, y facilita a los clientes de la API confiar en un formato de error predecible y consistente.

**Criterios de éxito:**
- Explica correctamente la consistencia del formato de error y la reducción de duplicación como beneficios.

### Ejercicio 3: Elegir el código de estado correcto

**Enunciado:** ¿qué código de estado HTTP devolverías al intentar eliminar un recurso que no existe, y por qué?

**Solución esperada:** 404 (Not Found), dado que comunica con precisión semántica que el recurso solicitado no existe, permitiendo que el cliente de la API distinga programáticamente ese caso específico de otros resultados posibles (como un 200 exitoso o un 400 por entrada inválida).

**Criterios de éxito:**
- Identifica correctamente 404 como el código apropiado y justifica con la precisión semántica del código de estado.

---

## Resumen del módulo

**Puntos clave**

- Los DTOs desacoplan el contrato público de la API del modelo interno de persistencia.
- Bean Validation automatiza la verificación de restricciones de entrada declarativamente.
- `ResponseEntity` permite devolver el código de estado HTTP correcto según el resultado real de cada operación.
- `@ControllerAdvice` centraliza el manejo de errores, garantizando un formato de respuesta consistente en toda la API.

**Conceptos aprendidos**

- `@RestController` y DTOs.
- Bean Validation con `@Valid`.
- `ResponseEntity` y códigos de estado.
- `@ControllerAdvice` y `@ExceptionHandler`.

**Próximos pasos**

En el Módulo 3 aprenderás persistencia con Spring Data JPA: entidades, repositorios, relaciones, el problema N+1, y migraciones con Flyway.

**Recursos adicionales**

- Documentación oficial de Spring Web (docs.spring.io/spring-framework) y Bean Validation (jakarta.ee/specifications/bean-validation).
