# Módulo 6: Testing en Spring Boot


## Aprende construyendo

### Tema 1: Slices de testing — @WebMvcTest

**Conceptos clave:** contexto parcial, más rápido que el contexto completo.

`@WebMvcTest(TareaController.class)` levanta únicamente el contexto de Spring necesario para probar la capa web (el controller, sus filtros, y la infraestructura de serialización JSON), mockeando automáticamente cualquier otra capa (como el servicio inyectado, marcado con `@MockBean`), en vez de levantar la aplicación completa con todas sus capas reales, incluyendo persistencia y configuración completa: `@Autowired MockMvc mockMvc; @MockBean TareaService servicio;` permite probar exactamente cómo el controller maneja una petición HTTP (el mapeo de rutas, la serialización de la respuesta, el manejo de validación) sin depender de que el servicio real ni la base de datos real estén disponibles ni configurados para la prueba.

Esta carga parcial del contexto (un "slice" específico, en la terminología de Spring Boot Test) es considerablemente más rápida de arrancar que el contexto completo de la aplicación, dado que evita inicializar componentes no relevantes para lo que específicamente se está probando en esa prueba (la capa web), permitiendo que la suite de tests de slice se ejecute con una velocidad mucho mayor que si cada prueba individual levantara la aplicación completa, un factor considerable cuando la suite crece a cientos o miles de pruebas.

**Analogía:** `@WebMvcTest` es como poner a prueba únicamente la recepción de un edificio (verificando que recibe correctamente a los visitantes y los dirige apropiadamente) sin necesidad de que el resto del edificio completo (los departamentos internos reales) esté operativo, usando actores de reparto (mocks) en lugar del personal real de esos departamentos para esa prueba específica y aislada.

**¿Por qué es importante?** `@WebMvcTest` levanta únicamente el contexto necesario para probar la capa web, considerablemente más rápido que levantar la aplicación completa, permitiendo una suite de pruebas de controller ágil y enfocada.

**Código del ejemplo:**

```java
@WebMvcTest(TareaController.class) // solo levanta la capa web, mockea el resto
class TareaControllerTest {
    @Autowired MockMvc mockMvc;
    @MockBean TareaService servicio;

    @Test
    void creaUnaTarea() throws Exception {
        mockMvc.perform(post("/api/tareas").contentType(APPLICATION_JSON).content("{\"titulo\":\"Test\"}"))
            .andExpect(status().isCreated());
    }
}
```

### Tema 2: @DataJpaTest con Testcontainers

**Conceptos clave:** base de datos real desechable, comportamiento fiel frente a H2 en memoria.

`@DataJpaTest @Testcontainers class TareaRepositoryTest { @Container static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16"); @DynamicPropertySource static void propiedades(DynamicPropertyRegistry registry) { registry.add("spring.datasource.url", postgres::getJdbcUrl); } }` levanta un contenedor Docker real de PostgreSQL específicamente para la duración de esta suite de pruebas, configurando dinámicamente la URL de conexión de la aplicación bajo prueba para apuntar hacia ese contenedor efímero, descartado automáticamente al finalizar la suite completa de pruebas.

Esta aproximación es preferible a usar una base de datos H2 en memoria (una alternativa históricamente común por su velocidad y simplicidad de configuración, sin necesidad de infraestructura externa), dado que H2 puede comportarse de forma sutilmente distinta a PostgreSQL en aspectos específicos del dialecto SQL, tipos de datos particulares, o comportamiento de ciertas funciones específicas de la base de datos, produciendo pruebas que pasan contra H2 pero que podrían fallar contra la base de datos real efectivamente usada en producción; Testcontainers elimina esa discrepancia usando la misma tecnología de base de datos real (PostgreSQL) tanto en pruebas como en producción, a costa de un tiempo de arranque de la prueba algo mayor que el de H2 en memoria (dado que requiere levantar un contenedor Docker real, no solo inicializar un motor en memoria).

**Analogía:** usar H2 en memoria para probar contra un código diseñado para PostgreSQL es como ensayar una obra de teatro en un escenario con dimensiones y acústica distintas a las del teatro real donde efectivamente se presentará; Testcontainers es como ensayar directamente en una réplica exacta y desechable del teatro real, garantizando que el comportamiento observado durante el ensayo efectivamente se replique en la presentación real.

**¿Por qué es importante?** Testcontainers proporciona una base de datos real (no una aproximación como H2) durante los tests, evitando discrepancias de comportamiento entre lo probado y lo efectivamente desplegado en producción.

**Código del ejemplo:**

```java
@DataJpaTest
@Testcontainers
class TareaRepositoryTest {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");

    @DynamicPropertySource
    static void propiedades(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
    }
}
```

### Tema 3: @SpringBootTest completo y estrategia de pirámide de tests

**Conceptos clave:** contexto completo, muchos unitarios/pocos de integración completa.

`@SpringBootTest` levanta absolutamente todo el contexto de la aplicación, incluyendo todas las capas reales configuradas exactamente como estarían en producción, apropiado para tests end-to-end que verifican un flujo completo de principio a fin a través de múltiples capas reales interactuando entre sí, pero siendo el nivel de test más lento de arrancar de los tres niveles disponibles (tests unitarios con Mockito puro, slices como `@WebMvcTest`/`@DataJpaTest`, y `@SpringBootTest` completo), dado que inicializa absolutamente todos los componentes de la aplicación, no solo los relevantes para una capa específica.

La estrategia recomendada balancea estos tres niveles según su costo relativo: muchos tests unitarios rápidos con Mockito puro (sin ningún contexto de Spring involucrado, Módulo 9 del track de Java) verificando la lógica de negocio aislada de sus dependencias; algunos tests de slice verificando la integración correcta de una capa específica con su infraestructura relevante (el controller con MockMvc, el repositorio con una base de datos real vía Testcontainers); y pocos tests de `@SpringBootTest` completo reservados específicamente para verificar los flujos más críticos de principio a fin, donde vale la pena el costo adicional de arrancar el contexto completo para tener la confianza de que todas las piezas reales efectivamente funcionan juntas correctamente.

**Analogía:** esta estrategia de pirámide de tests es como un proceso de control de calidad con muchas verificaciones rápidas e individuales de piezas sueltas (tests unitarios), algunas verificaciones de subsistemas completos (slices), y pocas pero exhaustivas pruebas del producto ensamblado completo (`@SpringBootTest`), balanceando la velocidad de retroalimentación con la confianza real que cada nivel de verificación puede ofrecer.

**¿Por qué es importante?** Balancear muchos tests unitarios rápidos, algunos de slice, y pocos de `@SpringBootTest` completo optimiza el costo total de la suite de pruebas frente a la confianza real que cada nivel aporta.

**Diagrama:**

```
Muchos: tests unitarios con Mockito puro (sin contexto Spring) — rápidos
Algunos: tests de slice (@WebMvcTest, @DataJpaTest) — contexto parcial
Pocos: @SpringBootTest completo — contexto total, para flujos end-to-end críticos
```

---


## Laboratorio práctico

**Objetivo del laboratorio:** construir una suite de tests de integración con Testcontainers contra PostgreSQL real, balanceando los tres niveles de testing.

**Requisitos previos:** Módulos 0-5 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Escribir un test unitario con Mockito puro | Módulo 9 del track de Java | Sin contexto de Spring |
| 2 | Escribir un test de slice con `@WebMvcTest` | Ver Tema 1 | Mockea el servicio inyectado |
| 3 | Usar `MockMvc` para simular una petición completa | Ver Tema 1 | Verifica código de estado y JSON |
| 4 | Configurar Testcontainers con `@DataJpaTest` | Ver Tema 2 | Contra PostgreSQL real |
| 5 | Escribir un test con `@SpringBootTest` end-to-end | Ver Tema 3 | Para el flujo más crítico |

**Verificación:** el laboratorio se considera exitoso si la suite completa refleja la pirámide de tests (muchos unitarios, algunos slices, pocos `@SpringBootTest`), y si los tests de repositorio contra Testcontainers verifican comportamiento fiel a PostgreSQL real, no aproximado por H2.

**Errores comunes y soluciones**

- **Usar `@SpringBootTest` para todo, incluso pruebas simples de lógica de negocio.** Prefiere tests unitarios con Mockito puro para lógica aislada.
- **Confiar en H2 en memoria para verificar comportamiento específico de PostgreSQL.** Usa Testcontainers para fidelidad real con la base de datos de producción.
- **No mockear el servicio en un test de `@WebMvcTest`.** Sin `@MockBean`, Spring intentará resolver la dependencia real, fallando si no está disponible en ese contexto parcial.

---
