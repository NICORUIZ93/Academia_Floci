# Módulo 17: JDBC, DAO y transacciones

## Aprende construyendo

Este módulo construye una capa JDBC pequeña y verificable. El objetivo es entender lo que un ORM automatiza y qué garantías siguen siendo responsabilidad del programa.

### Dos ejemplos: primero visible, luego real

- **Ejemplo sencillo:** busca una referencia con `PreparedStatement`, inserta una fila y comprueba encontrado/ausente en H2.
- **Caso RutaFlow:** liquida un envío bajo una clave de idempotencia. En una sola transacción inserta el movimiento, cambia el estado y registra `operation_id` con restricción `UNIQUE`; dos solicitudes concurrentes con la misma clave deben producir un solo cobro.

No confundas seguridad SQL con consistencia: parametrizar evita que el valor se interprete como SQL; la transacción y la clave única protegen invariantes de negocio y reintentos. Compara ambos niveles en pruebas separadas.

### Tema 1: JDBC, PreparedStatement y DAO

#### Paso 1 · Objetivo y preparación

Al finalizar podrás consultar e insertar registros usando `DataSource`, `PreparedStatement` y un DAO con responsabilidades acotadas. Requiere JDK 21+ y Maven. Crea un proyecto Java con JDBC y H2 como dependencias.

#### Paso 2 · Contexto y caso real

Un proceso importa referencias de envíos que contienen caracteres introducidos por usuarios. Concatenar la referencia dentro del SQL puede alterar la consulta; además, repetir SQL y mapeo en servicios distintos produce lógica inconsistente. **¿Por qué es importante?** JDBC directo permite consultas precisas sin sacrificar seguridad, prueba ni separación de responsabilidades.

#### Paso 3 · Teoría y modelo mental

JDBC es la API estándar para ejecutar SQL desde Java. `DataSource` abstrae la obtención de conexiones y normalmente usa un pool; `PreparedStatement` separa el SQL de sus valores y permite enlazarlos como parámetros. El DAO encapsula SQL y mapeo para que el servicio no conozca `ResultSet`.

Un parámetro preparado protege valores, no nombres dinámicos de tabla u ordenamiento. Para ordenar por una columna elegida por el usuario, usa una lista permitida explícita.

#### Paso 4 · Demostración guiada

En `src/main/java/academia/envios/EnvioDao.java`:

```java
package academia.envios;

import javax.sql.DataSource;
import java.sql.*;
import java.util.Optional;

public final class EnvioDao {
    private final DataSource dataSource;

    public EnvioDao(DataSource dataSource) { this.dataSource = dataSource; }

    public Optional<String> buscarEstado(String referencia) throws SQLException {
        String sql = "select estado from envio where referencia = ?";
        try (Connection connection = dataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, referencia);
            try (ResultSet result = statement.executeQuery()) {
                return result.next()
                    ? Optional.of(result.getString("estado"))
                    : Optional.empty();
            }
        }
    }
}
```

Inicializa H2 con `create table envio(referencia varchar(40) primary key, estado varchar(20))` y un `JdbcDataSource` de test. Ejecuta `./mvnw test`.

**Resultado esperado:** encuentra `EN_PREPARACION` para la referencia existente y `Optional.empty()` para una ausente. **Fallo deliberado:** sustituye el `?` por concatenación y prueba una referencia como `' OR '1'='1`; el test debe exhibir por qué no se interpolan datos. Restaura `PreparedStatement` y comprueba que una referencia maliciosa se trata como valor literal.

#### Paso 5 · Práctica guiada

Agrega `crear(referencia, estado)` con `executeUpdate()` y comprueba el número de filas afectadas. Extrae el mapeo de filas a un método privado solo cuando haya más de una consulta que realmente lo comparta.

#### Paso 6 · Práctica independiente

Implementa un DAO con búsqueda paginada y ordenamiento por `fecha_creacion`. El tamaño de página debe tener límite y la columna de orden debe salir de una allowlist (`fecha_creacion`, `referencia`), no del SQL proporcionado por el usuario.

#### Paso 7 · Cierre y evidencia

Entrega el DAO, el `DataSource` de test y casos para hallado, ausente e input hostil como parte del proyecto integrador de RutaFlow, por ejemplo, para consultar reportes especializados. **Cuándo no usarlo:** no crees un DAO genérico que oculte consultas distintas detrás de operaciones vagas; para CRUD estándar, Spring Data puede reducir código repetitivo. **Evidencia:** test ejecutado con H2 y parámetros enlazados.

### Tema 2: Transacciones, ACID y aislamiento

#### Paso 1 · Objetivo y preparación

Al finalizar podrás hacer que dos escrituras relacionadas se confirmen juntas o se reviertan juntas. Necesitas el DAO anterior y una base de datos H2 o PostgreSQL.

#### Paso 2 · Contexto y caso real

Al liquidar un envío se registra un cobro y se actualiza su estado. Si el proceso cae después del cobro pero antes del cambio de estado, el sistema queda inconsistente. **¿Por qué es importante?** Las transacciones convierten varias escrituras en una sola unidad de negocio recuperable.

#### Paso 3 · Teoría y modelo mental

Una transacción agrupa operaciones bajo propiedades ACID: atomicidad, consistencia, aislamiento y durabilidad. JDBC comienza en autocommit normalmente; `setAutoCommit(false)`, `commit()` y `rollback()` permiten delimitar el trabajo. El aislamiento define qué cambios concurrentes se pueden observar; no asumas que `SERIALIZABLE` es siempre necesario ni gratuito.

La transacción es como una sola operación de caja: o se registran todas las líneas del recibo o se cancela el recibo entero.

#### Paso 4 · Demostración guiada

Implementa en `src/main/java/academia/envios/LiquidacionDao.java` una operación que inserta un cobro y actualiza el envío usando **la misma conexión**:

```java
try (Connection connection = dataSource.getConnection()) {
    connection.setAutoCommit(false);
    try {
        insertarCobro(connection, referencia, importe);
        actualizarEstado(connection, referencia, "LIQUIDADO");
        connection.commit();
    } catch (SQLException error) {
        connection.rollback();
        throw error;
    }
}
```

Ejecuta `./mvnw test -Dtest=LiquidacionDaoTest`. **Resultado esperado:** cobro y estado se guardan juntos. **Fallo deliberado:** lanza una excepción después de insertar el cobro y antes de actualizar el envío. Verifica que no queda ningún cobro parcial tras el rollback.

#### Paso 5 · Práctica guiada

Prueba dos operaciones concurrentes que actualizan el mismo saldo. Reproduce una actualización perdida y corrígela con bloqueo optimista (`version`) o con una operación atómica SQL. Compara `READ_COMMITTED` con el aislamiento predeterminado de tu base.

#### Paso 6 · Práctica independiente

Construye un caso de transferencia entre dos cuentas: valida importe positivo, descuenta una y acredita la otra de forma atómica. Añade pruebas para saldo insuficiente, cuenta inexistente y fallo entre las dos escrituras. Documenta qué invariantes protege la transacción.

#### Paso 7 · Cierre y evidencia

Entrega la prueba del rollback, el test concurrente y una explicación del aislamiento elegido para el proyecto integrador de RutaFlow: una liquidación no debe actualizar el estado sin registrar su movimiento. **Cuándo no usarlo:** no mantengas una transacción abierta mientras haces llamadas HTTP; coordinar una transacción local con otros servicios requiere patrones como outbox o saga. **Evidencia:** test donde el fallo intermedio deja la base sin escrituras parciales.
