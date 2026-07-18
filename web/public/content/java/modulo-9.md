# Módulo 9: Testing con JUnit 5 y Mockito

## Sílabo

**Objetivo general**

Probar lógica de negocio aislada de sus dependencias externas usando JUnit 5 y Mockito, incluyendo tests parametrizados y medición de cobertura con JaCoCo.

**Objetivos específicos**

1. Escribir un test básico con `@Test` y aserciones.
2. Usar `@BeforeEach` para inicializar estado compartido.
3. Mockear una dependencia externa con Mockito y verificar interacciones con `verify()`.
4. Escribir tests parametrizados con `@ParameterizedTest`.
5. Configurar JaCoCo y analizar un reporte de cobertura.

**Contenido**

- JUnit 5: anotaciones y ciclo de vida.
- Mockito: mocks, stubs y verify.
- Tests parametrizados.
- Cobertura con JaCoCo.
- `@CsvSource`, `@MethodSource` y `@TestFactory`.
- AssertJ y Hamcrest como librerías de aserciones fluidas.

**Evaluación**

Suite de pruebas unitarias con mocks para un servicio con dependencias externas, más tres ejercicios de evaluación.

---

## Aprende construyendo

### Tema 1: JUnit 5 — anotaciones y ciclo de vida

**Conceptos clave:** `@Test`, `@BeforeEach`, aserciones.

`@Test` marca un método como un caso de prueba ejecutable independientemente por el runner de JUnit 5, dentro del cual las aserciones (`assertEquals(5, new Calculadora().sumar(2, 3))`) verifican que el resultado real coincide con el resultado esperado, fallando la prueba con un mensaje descriptivo si no coinciden; `@BeforeEach` marca un método que se ejecuta automáticamente antes de cada prueba individual de la clase, apropiado para inicializar objetos compartidos en un estado conocido y limpio antes de cada prueba, evitando que el estado dejado por una prueba anterior afecte accidentalmente el resultado de la siguiente (cada prueba debe ser independiente y capaz de ejecutarse en cualquier orden sin afectar ni verse afectada por otras).

Este ciclo de vida (`@BeforeEach` antes de cada prueba, con `@AfterEach` como su contraparte de limpieza posterior, y `@BeforeAll`/`@AfterAll` para configuración costosa que solo debe ejecutarse una única vez para toda la clase de pruebas, no repetida en cada prueba individual) estructura de forma predecible cuándo exactamente se ejecuta cada pieza de configuración o limpieza en relación con las pruebas efectivas, garantizando aislamiento entre pruebas sucesivas.

**Analogía:** `@BeforeEach` es como reiniciar completamente un escenario de laboratorio a su estado inicial conocido antes de cada experimento individual, garantizando que los resultados de un experimento no contaminen accidentalmente el siguiente experimento realizado en el mismo espacio.

**¿Por qué es importante?** El ciclo de vida de JUnit 5 garantiza aislamiento entre pruebas sucesivas, ejecutando configuración y limpieza en momentos predecibles relativos a cada prueba individual.

**Código del ejemplo:**

```java
class CalculadoraTest {
    @Test
    void sumaDosNumeros() {
        assertEquals(5, new Calculadora().sumar(2, 3));
    }
    @BeforeEach
    void setUp() { /* se ejecuta antes de cada test */ }
}
```

### Tema 2: Mockito — aislar dependencias

**Conceptos clave:** `@Mock`, `@InjectMocks`, `when`/`verify`.

Mockito permite reemplazar las dependencias reales de la clase bajo prueba por objetos simulados (mocks) cuyo comportamiento se controla completamente desde la propia prueba: `@Mock RepositorioPedidos repositorio; @InjectMocks ServicioPedidos servicio;` crea un mock de `RepositorioPedidos` y lo inyecta automáticamente en una instancia real de `ServicioPedidos`, permitiendo probar la lógica de negocio de `ServicioPedidos` de forma completamente aislada, sin depender de una base de datos real ni de ninguna otra infraestructura externa que `RepositorioPedidos` normalmente requeriría en producción.

`when(repositorio.guardar(any())).thenReturn(new Pedido(1))` configura el comportamiento simulado del mock (stub): cuando se invoque `guardar` con cualquier argumento, devolver ese `Pedido` específico, permitiendo controlar exactamente qué "respuesta" simulada recibe el servicio bajo prueba sin necesidad de una implementación real de persistencia. `verify(repositorio).guardar(any())`, en cambio, no configura comportamiento sino que verifica una interacción ya ocurrida: confirma que el servicio efectivamente invocó ese método del mock durante la ejecución de la prueba, una aserción sobre comportamiento (que cierta interacción ocurrió) en vez de sobre un valor de retorno, útil para verificar que el servicio realmente delega correctamente en su dependencia, no solo que produce el resultado correcto por alguna otra vía inesperada.

**Analogía:** un mock es como un actor de reparto que sigue exactamente el guion que se le indica para esta representación específica (el `when`), permitiendo ensayar la actuación del protagonista (el servicio bajo prueba) sin necesidad de que el elenco de reparto completo real esté disponible; `verify` es como confirmar después de la representación que el protagonista efectivamente interactuó con ese actor de reparto en el momento esperado del guion, no solo que la obra terminó bien por alguna otra razón.

**¿Por qué es importante?** Mockear dependencias externas aísla la prueba de infraestructura real (bases de datos, servicios externos), haciendo la prueba más rápida, determinista y confiable, sin depender de la disponibilidad o el estado de sistemas externos.

**Código del ejemplo:**

```java
@ExtendWith(MockitoExtension.class)
class ServicioPedidosTest {
    @Mock RepositorioPedidos repositorio;
    @InjectMocks ServicioPedidos servicio;

    @Test
    void creaUnPedido() {
        when(repositorio.guardar(any())).thenReturn(new Pedido(1));
        Pedido resultado = servicio.crear(new Pedido(null));
        assertEquals(1, resultado.id());
        verify(repositorio).guardar(any()); // confirma que se llamó al repositorio
    }
}
```

### Tema 3: Tests parametrizados y cobertura

**Conceptos clave:** una única prueba con múltiples conjuntos de datos, `@CsvSource`/`@MethodSource`, cobertura de líneas/ramas.

`@ParameterizedTest @ValueSource(ints = {1, 2, 3, 5, 8}) void esFibonacci(int numero) { assertTrue(esFibonacci(numero)); }` ejecuta la misma lógica de prueba una vez por cada valor proporcionado en la fuente de datos, evitando duplicar manualmente el mismo cuerpo de prueba una vez por cada caso individual que se desea verificar; `@CsvSource` permite proporcionar conjuntos de valores múltiples por ejecución (para probar métodos con más de un parámetro), y `@MethodSource` permite generar la fuente de datos mediante un método propio cuando los valores necesarios son demasiado complejos para expresarse directamente como una anotación simple; `@TestFactory` habilita la generación dinámica y programática de un conjunto variable de pruebas en tiempo de ejecución, para casos donde ni siquiera el número de pruebas necesarias se conoce de antemano de forma estática.

JaCoCo mide cobertura de código: qué porcentaje de líneas (y opcionalmente de ramas condicionales específicas, como cada lado de un `if`) del código de producción efectivamente se ejecutó durante la suite de pruebas completa, generado con `mvn test jacoco:report` como un reporte HTML navegable que resalta visualmente qué líneas específicas del código nunca se ejecutaron durante ninguna prueba, señalando directamente qué partes del código carecen de cobertura de pruebas y podrían albergar bugs no detectados por la suite actual; AssertJ (`assertThat(resultado).isEqualTo(5)`) y Hamcrest son librerías de aserciones fluidas alternativas a las aserciones básicas de JUnit, ofreciendo mensajes de fallo más descriptivos y una sintaxis más legible encadenada para verificaciones complejas.

**Analogía:** un test parametrizado es como verificar la misma receta de cocina con distintos ingredientes de entrada, confirmando que produce el resultado esperado en cada caso sin tener que reescribir el procedimiento completo de verificación para cada ingrediente distinto; un reporte de cobertura es como un mapa de calor que señala exactamente qué áreas de una ciudad nunca han sido patrulladas por ninguna ronda de inspección, indicando dónde podrían existir problemas no detectados simplemente porque nadie ha verificado esa zona específica todavía.

**¿Por qué es importante?** Los tests parametrizados evitan duplicar el mismo cuerpo de prueba para múltiples casos de datos; JaCoCo identifica visualmente qué partes del código de producción carecen de cobertura de pruebas, señalando riesgos potenciales no verificados.

**Código del ejemplo:**

```java
@ParameterizedTest
@ValueSource(ints = {1, 2, 3, 5, 8})
void esFibonacci(int numero) {
    assertTrue(esFibonacci(numero));
}
```
```bash
mvn test jacoco:report   # genera un reporte HTML con líneas/ramas cubiertas
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

**Objetivo del laboratorio:** construir una suite de pruebas unitarias con mocks para un servicio con dependencias externas, incluyendo tests parametrizados y cobertura.

**Requisitos previos:** Módulos 0-8 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Escribir un test básico con `@Test` | Ver Tema 1 | Con una aserción simple |
| 2 | Usar `@BeforeEach` para estado compartido | Ver Tema 1 | Verifica el aislamiento entre pruebas |
| 3 | Mockear una dependencia con Mockito | Ver Tema 2 | `when` + `verify` |
| 4 | Escribir un test parametrizado con 5 casos | Ver Tema 3 | `@ParameterizedTest` |
| 5 | Generar un reporte de cobertura con JaCoCo | Ver Tema 3 | Identifica una rama sin probar |

**Verificación:** el laboratorio se considera exitoso si la suite de pruebas se ejecuta sin depender de ninguna infraestructura externa real, y si el reporte de JaCoCo identifica al menos una rama de código específica que carece de cobertura, corregida posteriormente con una prueba adicional.

**Errores comunes y soluciones**

- **Compartir estado mutable entre pruebas sin `@BeforeEach`.** Reinicia el estado compartido antes de cada prueba individual.
- **Confundir un stub (`when`) con una verificación (`verify`).** `when` configura comportamiento simulado; `verify` confirma que una interacción efectivamente ocurrió.
- **Duplicar el mismo cuerpo de prueba para múltiples casos de datos.** Usa `@ParameterizedTest` para evitar esa duplicación.

---



## Bibliografía y fundamento académico

Estas fuentes sustentan los conceptos y deben consultarse para verificar detalles que cambian entre versiones:

- Oracle, *Java Language Specification* y *Java Virtual Machine Specification*.
- OpenJDK, documentación de Java SE, JFR y JMH.
- Bloch, J., *Effective Java*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- El ciclo de vida de JUnit 5 (`@BeforeEach`, etc.) garantiza aislamiento entre pruebas sucesivas.
- Mockito permite aislar la lógica bajo prueba de sus dependencias externas mediante mocks configurables con `when` y verificables con `verify`.
- Los tests parametrizados evitan duplicar el mismo cuerpo de prueba para múltiples conjuntos de datos.
- JaCoCo identifica visualmente qué partes del código carecen de cobertura de pruebas.

**Conceptos aprendidos**

- JUnit 5: anotaciones y ciclo de vida.
- Mockito: mocks, stubs y verify.
- Tests parametrizados.
- Cobertura con JaCoCo.

**Próximos pasos**

En el Módulo 10 aprenderás módulos (JPMS) y proyectos grandes: `module-info.java`, encapsulación fuerte, y migración incremental.

**Recursos adicionales**

- Documentación oficial de JUnit 5 (junit.org/junit5) y Mockito (site.mockito.org).
