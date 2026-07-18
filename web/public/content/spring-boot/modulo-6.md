# Módulo 6: Testing en Spring Boot

## Sílabo

**Objetivo general**

Probar una aplicación Spring Boot desde unit tests completamente aislados hasta tests de integración contra una base de datos real, eligiendo el nivel de test apropiado según el costo/beneficio de cada uno.

**Objetivos específicos**

1. Escribir un test unitario con Mockito sin levantar el contexto de Spring.
2. Escribir un test de slice con `@WebMvcTest` que pruebe solo el controller.
3. Usar `MockMvc` para simular peticiones HTTP completas.
4. Configurar Testcontainers para tests de integración con una base de datos real.
5. Explicar cuándo usar `@SpringBootTest` completo frente a un slice.

**Contenido**

- `@SpringBootTest` vs slices (`@WebMvcTest`, `@DataJpaTest`).
- MockMvc para probar controllers.
- Testcontainers para bases de datos reales en CI.
- Mockito en el ecosistema Spring.
- `@MockBean`, `@SpyBean` y `TestRestTemplate`.
- ArgumentCaptor y AssertJ.

**Evaluación**

Suite de tests de integración con Testcontainers contra PostgreSQL real, más tres ejercicios de evaluación.

---

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

- `@WebMvcTest` levanta solo el contexto de la capa web, considerablemente más rápido que el contexto completo.
- Testcontainers proporciona una base de datos real desechable durante los tests, evitando discrepancias de comportamiento frente a H2 en memoria.
- `@SpringBootTest` levanta el contexto completo, apropiado para pocos tests end-to-end de los flujos más críticos.
- La estrategia recomendada balancea muchos tests unitarios, algunos de slice, y pocos de `@SpringBootTest` completo.

**Conceptos aprendidos**

- Slices de testing (`@WebMvcTest`, `@DataJpaTest`).
- MockMvc y Testcontainers.
- `@SpringBootTest` completo y la pirámide de tests.

**Próximos pasos**

En el Módulo 7 aprenderás observabilidad con Actuator: endpoints clave, métricas custom con Micrometer, y health checks personalizados.

**Recursos adicionales**

- Documentación oficial de Spring Boot Testing (docs.spring.io/spring-boot) y Testcontainers (testcontainers.com).
