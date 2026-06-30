## Arquitectura del microservicio

```
src/main/java/com/miapp/
  controller/   ← TareaController (DTOs, validación)
  service/      ← TareaService (lógica de negocio)
  repository/   ← TareaRepository (Spring Data JPA)
  security/     ← SecurityFilterChain, JwtFilter
  config/       ← @ConfigurationProperties tipados
db/migration/    ← scripts Flyway versionados
```

## Uniendo los módulos del track

Este proyecto integra: persistencia real con migraciones versionadas (módulo 3), autenticación JWT con autorización por rol (módulo 4), configuración tipada y validada al arranque (módulo 5), Actuator con una métrica de negocio expuesta (módulo 7), y tests de integración con Testcontainers cubriendo el flujo crítico (módulo 6).

```java
@RestController
@RequestMapping("/api/tareas")
public class TareaController {
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<TareaDTO> crear(@Valid @RequestBody CrearTareaRequest req, Authentication auth) {
        Tarea tarea = servicio.crear(req, auth.getName());
        return ResponseEntity.status(201).body(TareaDTO.from(tarea));
    }
}
```

## Cierre del track

Un microservicio Spring Boot "productivo" no es solo el CRUD funcionando: es la combinación de seguridad declarativa, persistencia versionada, observabilidad expuesta desde el día uno, y una suite de tests que da confianza real para desplegar sin temor — exactamente lo que distingue un proyecto de portafolio de uno listo para un equipo de ingeniería real.
