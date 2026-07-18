# Módulo 3: Persistencia con Spring Data JPA

## Sílabo

**Objetivo general**

Persistir entidades sin escribir SQL repetitivo mediante Spring Data JPA, sin perder de vista qué genera Hibernate por debajo, incluyendo el problema N+1 y migraciones versionadas con Flyway.

**Objetivos específicos**

1. Definir entidades JPA y repositorios derivados.
2. Comparar métodos derivados con `@Query` explícito.
3. Modelar relaciones y diagnosticar el problema N+1.
4. Corregir el problema N+1 con `JOIN FETCH` o `@EntityGraph`.
5. Configurar migraciones versionadas con Flyway en vez de `ddl-auto`.

**Contenido**

- Entidades y mapeo JPA.
- Repositorios derivados y `@Query`.
- Relaciones (OneToMany, ManyToMany) y N+1.
- Migraciones con Flyway/Liquibase.
- JPQL, Native Queries, Criteria API y QueryDSL.
- Paginación con Pageable y Page.
- `@Valid`, `@Validated` y Bean Validation.

**Evaluación**

API con persistencia real en PostgreSQL y migraciones versionadas con Flyway, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Entidades y repositorios derivados

**Conceptos clave:** mapeo objeto-relacional, generación de queries a partir del nombre del método.

`@Entity public class Tarea { @Id @GeneratedValue private Long id; private String titulo; private boolean completada; }` mapea una clase Java a una tabla de base de datos, con Hibernate (la implementación de JPA usada por Spring Data JPA) traduciendo automáticamente entre instancias de esta clase y filas de la tabla correspondiente, gestionando la generación de identificadores (`@GeneratedValue`), y sincronizando cambios en memoria con la base de datos según el ciclo de vida gestionado de cada entidad.

`public interface TareaRepository extends JpaRepository<Tarea, Long> { List<Tarea> findByCompletadaFalse(); }` demuestra la capacidad más distintiva de Spring Data: generar automáticamente la implementación de una query a partir únicamente del nombre del método declarado en la interfaz, sin ningún cuerpo de implementación escrito manualmente — Spring Data parsea el nombre del método (`findBy` + `Completada` + `False`) y construye la consulta SQL correspondiente automáticamente, funcionando bien para consultas simples y directas, mientras que consultas más complejas (agregaciones, joins específicos, condiciones difíciles de expresar mediante convención de nombres) requieren `@Query` con JPQL explícito, dando control total sobre la consulta exacta a ejecutar cuando la convención de nombres del método no es suficiente o se vuelve poco legible.

**Analogía:** un método derivado es como pedirle a un asistente que entienda automáticamente qué necesitas a partir de cómo formulas tu pedido en lenguaje natural estructurado ("las tareas no completadas"), sin tener que escribirle instrucciones detalladas paso a paso; `@Query` es como darle al mismo asistente instrucciones explícitas y precisas cuando el pedido es demasiado específico o complejo para que lo infiera automáticamente por sí solo.

**¿Por qué es importante?** Los métodos derivados eliminan la necesidad de escribir SQL repetitivo para consultas simples, generándolo automáticamente a partir del nombre del método; `@Query` da control explícito cuando la consulta necesaria es demasiado compleja para expresarse por convención de nombres.

**Código del ejemplo:**

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

### Tema 2: El problema N+1 y su corrección

**Conceptos clave:** carga perezosa, una query adicional por cada elemento de una colección.

`@OneToMany(mappedBy = "usuario") private List<Tarea> tareas;` mapea una relación uno-a-muchos, típicamente configurada con carga perezosa (lazy) por defecto: la lista de tareas de un usuario no se carga desde la base de datos hasta que efectivamente se accede a ella (`u.getTareas().size()`), un comportamiento generalmente deseable para evitar cargar datos innecesarios que nunca se van a usar, pero que se vuelve problemático cuando se itera sobre una colección de usuarios accediendo a las tareas de cada uno: por cada usuario individual en el bucle, Hibernate ejecuta una query SQL completamente separada para cargar sus tareas correspondientes, resultando en N queries adicionales (una por cada uno de los N usuarios) más la query original que cargó la lista de usuarios, de ahí el nombre "N+1" para este problema de rendimiento.

`@Query("SELECT u FROM Usuario u JOIN FETCH u.tareas") List<Usuario> buscarConTareas();` corrige el problema N+1 usando `JOIN FETCH`, que le indica explícitamente a Hibernate que cargue los usuarios y sus tareas relacionadas en una única query SQL con un JOIN real, en vez de N+1 queries separadas; `@EntityGraph` ofrece una alternativa declarativa a `JOIN FETCH` para lograr el mismo resultado, especificando qué relaciones deben cargarse eagerly (ansiosamente) para una consulta específica, sin necesidad de escribir JPQL explícito para ese propósito.

**Analogía:** el problema N+1 es como enviar un mensajero por separado a buscar cada ingrediente individual de una receta, uno a la vez, en vez de enviar un único mensajero que traiga todos los ingredientes necesarios en un solo viaje coordinado (JOIN FETCH); cada viaje individual del mensajero tiene un costo fijo de traslado que se multiplica innecesariamente por cada ingrediente separado.

**¿Por qué es importante?** El problema N+1 multiplica el número de queries ejecutadas proporcionalmente al tamaño de la colección iterada, un problema de rendimiento que empeora directamente con la escala de datos; `JOIN FETCH`/`@EntityGraph` lo corrigen cargando las relaciones necesarias en una única query.

**Código del ejemplo:**

```java
// por cada usuario, Hibernate ejecuta una query SEPARADA para cargar sus tareas: N+1 queries
for (Usuario u : usuarioRepository.findAll()) {
    u.getTareas().size(); // dispara una query lazy por cada usuario
}
@Query("SELECT u FROM Usuario u JOIN FETCH u.tareas") // una sola query con JOIN
List<Usuario> buscarConTareas();
```

### Tema 3: Migraciones con Flyway

**Conceptos clave:** esquema versionado y revisable, riesgo de `ddl-auto` en producción.

`hibernate.ddl-auto=update` permite que Hibernate genere y actualice automáticamente el esquema de la base de datos basándose en las entidades declaradas en el código, una comodidad conveniente durante desarrollo temprano pero riesgosa en producción: Hibernate podría inferir un cambio de esquema distinto al que el desarrollador realmente pretendía (por ejemplo, ante un cambio de tipo de un campo, podría intentar una migración de columna no siempre segura o predecible), y ese cambio no queda registrado en ningún historial versionado ni revisable en un proceso de code review antes de aplicarse.

`V1__crear_tabla_tareas.sql` (una migración de Flyway, nombrada según su convención de versión secuencial) declara explícitamente y en SQL puro exactamente qué cambio de esquema se aplica, versionado como parte del propio repositorio de código, revisable en un pull request como cualquier otro cambio de código, y aplicado de forma idéntica y predecible en cada entorno donde se despliegue la aplicación (dado que Flyway registra qué migraciones ya se aplicaron en cada base de datos específica, aplicando únicamente las migraciones nuevas pendientes en cada despliegue, en el orden secuencial correcto).

**Analogía:** `ddl-auto=update` es como dejar que un asistente reorganice automáticamente el mobiliario de una casa según sus propias inferencias sobre qué cambios parecen necesarios, sin un plano explícito ni revisión previa; Flyway es como seguir un plano de renovación explícito, versionado y revisado antes de ejecutarse, aplicado exactamente de la misma forma en cada casa idéntica donde se ejecute esa misma renovación.

**¿Por qué es importante?** Confiar en `ddl-auto=update` en producción es riesgoso porque los cambios de esquema no quedan versionados, revisables, ni son completamente predecibles; las migraciones de Flyway son explícitas, revisables en code review, y se aplican de forma idéntica en cada entorno.

**Configuración del ejemplo:**

```sql
-- V1__crear_tabla_tareas.sql
CREATE TABLE tarea (id BIGSERIAL PRIMARY KEY, titulo VARCHAR(255), completada BOOLEAN DEFAULT false);
```

---

## Criterio transversal de calidad del código

Aplica estas decisiones en todos los ejemplos y en tu entrega:

- usa nombres que expresen intención, dominio y unidades; evita `data`, `temp`, `manager` o `process` cuando exista un término preciso;
- mantén funciones, componentes, clases, consultas y módulos cohesionados alrededor de una responsabilidad comprobable;
- haz visibles las dependencias y los efectos de red, tiempo, archivos, estado y base de datos;
- valida entradas en la frontera y representa errores con contexto, sin ocultar la causa ni registrar secretos;
- elimina duplicación de reglas, no toda repetición textual; una abstracción incorrecta cuesta más que dos líneas parecidas;
- escribe primero la solución más simple que satisface el requisito y refactoriza con pruebas verdes;
- aplica SOLID únicamente cuando exista una necesidad real de cambio, extensión, sustitución o aislamiento.

**SOLID con criterio:** responsabilidad única significa una razón coherente de cambio, no una clase por función. Abierto/cerrado justifica estrategias cuando hay variantes reales. Sustitución exige respetar contratos. Segregación evita obligar a consumidores a depender de operaciones que no usan. Inversión de dependencias protege el dominio frente a detalles externos; no exige crear interfaces para cada objeto.

**Comprobación antes de continuar:** ¿otra persona puede entender los nombres y el flujo?, ¿los casos de error son observables?, ¿una prueba demuestra la regla principal?, ¿cada abstracción aporta más claridad de la que cuesta? Registra una decisión de refactorización y una decisión consciente de *no abstraer*.

## Laboratorio práctico

**Objetivo del laboratorio:** construir una API con persistencia real en PostgreSQL y migraciones versionadas con Flyway.

**Requisitos previos:** Módulos 0-2 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Definir `Tarea` con `@Entity` y su repositorio | Ver Tema 1 | Método derivado `findByCompletadaFalse` |
| 2 | Comparar con el equivalente en `@Query` | Ver Tema 1 | Discute cuándo cada enfoque es apropiado |
| 3 | Modelar `@OneToMany` y provocar N+1 | Ver Tema 2 | Cuenta las queries ejecutadas |
| 4 | Corregir con `JOIN FETCH` o `@EntityGraph` | Ver Tema 2 | Mide la diferencia en queries |
| 5 | Configurar Flyway con una migración versionada | Ver Tema 3 | En vez de `ddl-auto` |

**Verificación:** el laboratorio se considera exitoso si la corrección del problema N+1 reduce el número de queries ejecutadas de N+1 a una única query, y si el esquema de la base de datos se gestiona completamente mediante migraciones versionadas de Flyway, no `ddl-auto`.

**Errores comunes y soluciones**

- **Confiar en `ddl-auto=update` en un entorno de producción.** Usa migraciones versionadas con Flyway o Liquibase.
- **No notar el problema N+1 hasta que aparece en producción con datos reales.** Verifica el número de queries ejecutadas durante el desarrollo con datasets de prueba representativos.
- **Sobreusar `@Query` para casos que un método derivado simple resolvería.** Usa métodos derivados para consultas simples y directas.

---


## Rúbrica del proyecto

Esta rúbrica evalúa el laboratorio y los ejercicios como evidencia de dominio, no la mera finalización de pasos.

| Criterio | Peso | Evidencia esperada |
|---|---:|---|
| Comprensión conceptual | 20% | Explica el mecanismo, sus límites y por qué la solución funciona. |
| Implementación funcional | 30% | El artefacto satisface requisitos normales, límite y de error. |
| Verificación | 20% | Incluye pruebas, mediciones o inspecciones reproducibles. |
| Diseño y calidad | 15% | Nombres, estructura, seguridad y mantenibilidad son deliberados. |
| Comunicación profesional | 15% | README, decisiones, comandos y resultados permiten repetir el trabajo. |

Se alcanza competencia con 70/100 y sin cero en implementación o verificación. El nivel experto exige comparar alternativas, justificar trade-offs y reconocer condiciones donde la solución dejaría de ser válida.

## Bibliografía y fundamento académico

Estas fuentes sustentan los conceptos y deben consultarse para verificar detalles que cambian entre versiones:

- VMware/Broadcom, documentación de *Spring Framework* y *Spring Boot*.
- IETF, especificaciones HTTP y OAuth 2.0.
- OWASP Foundation, *Application Security Verification Standard*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- Spring Data JPA genera automáticamente queries a partir del nombre del método para casos simples; `@Query` da control explícito para casos complejos.
- El problema N+1 multiplica queries proporcionalmente al tamaño de una colección iterada con carga perezosa; `JOIN FETCH`/`@EntityGraph` lo corrigen.
- Las migraciones versionadas de Flyway son explícitas, revisables y predecibles, a diferencia de `ddl-auto=update` en producción.

**Conceptos aprendidos**

- Entidades y repositorios derivados.
- El problema N+1 y su corrección.
- Migraciones versionadas con Flyway.

**Próximos pasos**

En el Módulo 4 aprenderás Spring Security: `SecurityFilterChain`, JWT, autorización por roles, y CORS/CSRF.

**Recursos adicionales**

- Documentación oficial de Spring Data JPA (docs.spring.io/spring-data/jpa) y Flyway (flywaydb.org/documentation).
