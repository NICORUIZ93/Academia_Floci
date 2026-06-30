## Slices de testing

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

`@WebMvcTest` arranca solo el contexto necesario para probar controllers — mucho más rápido que `@SpringBootTest` completo.

## @DataJpaTest con Testcontainers

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

Testcontainers da una base de datos real (no H2 en memoria, que puede comportarse distinto a PostgreSQL en producción) durante los tests, descartada automáticamente al terminar.

## @SpringBootTest completo

Levanta TODO el contexto de la aplicación — útil para tests end-to-end, pero el más lento de los tres niveles. La estrategia recomendada: muchos tests unitarios rápidos, algunos de slice, pocos de `@SpringBootTest` completo.
