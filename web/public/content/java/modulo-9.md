## JUnit 5 básico

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

## Mockito: aislar dependencias

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

Mockear el repositorio aísla la prueba: no necesitas una base de datos real para probar la lógica de negocio del servicio.

## Tests parametrizados

```java
@ParameterizedTest
@ValueSource(ints = {1, 2, 3, 5, 8})
void esFibonacci(int numero) {
    assertTrue(esFibonacci(numero));
}
```

## Cobertura con JaCoCo

```bash
mvn test jacoco:report   # genera un reporte HTML con líneas/ramas cubiertas
```
