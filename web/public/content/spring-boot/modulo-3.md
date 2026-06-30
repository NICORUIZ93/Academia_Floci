## Entidad y repositorio

```java
@Entity
public class Tarea {
    @Id @GeneratedValue
    private Long id;
    private String titulo;
    private boolean completada;
}

public interface TareaRepository extends JpaRepository<Tarea, Long> {
    List<Tarea> findByCompletadaFalse(); // Spring genera la query a partir del nombre del método
}
```

## El problema N+1

```java
@OneToMany(mappedBy = "usuario")
private List<Tarea> tareas;
```

```java
// por cada usuario, Hibernate ejecuta una query SEPARADA para cargar sus tareas: N+1 queries
for (Usuario u : usuarioRepository.findAll()) {
    u.getTareas().size(); // dispara una query lazy por cada usuario
}
```

```java
@Query("SELECT u FROM Usuario u JOIN FETCH u.tareas") // una sola query con JOIN
List<Usuario> buscarConTareas();
```

## Migraciones con Flyway

```sql
-- V1__crear_tabla_tareas.sql
CREATE TABLE tarea (id BIGSERIAL PRIMARY KEY, titulo VARCHAR(255), completada BOOLEAN DEFAULT false);
```

A diferencia de `hibernate.ddl-auto=update` (cómodo en desarrollo pero impredecible en producción), las migraciones de Flyway son versionadas, revisables en code review, y se aplican de forma idéntica en cada entorno.
