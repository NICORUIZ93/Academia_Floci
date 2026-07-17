# Módulo 6: Persistencia compartida con SQLDelight

## Sílabo

**Objetivo general**

Persistir datos localmente con SQL tipado y verificado en tiempo de compilación usando SQLDelight, incluyendo drivers específicos por plataforma y migraciones de esquema.

**Objetivos específicos**

1. Definir un esquema `.sq` con una tabla y queries básicas.
2. Generar y usar el código Kotlin tipado a partir del esquema.
3. Configurar drivers de SQLDelight específicos por plataforma con `expect`/`actual`.
4. Agregar una migración de esquema sin perder datos existentes.

**Contenido**

- Esquemas SQLDelight y generación de código.
- Queries tipadas.
- Migraciones de base de datos.
- Drivers por plataforma.

**Evaluación**

Capa de persistencia compartida con al menos una migración de esquema, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Esquemas SQLDelight y queries tipadas

**Conceptos clave:** SQL verificado en compilación, código Kotlin generado automáticamente.

```sql
-- Tarea.sq
CREATE TABLE Tarea (
    id TEXT NOT NULL PRIMARY KEY,
    titulo TEXT NOT NULL,
    completada INTEGER NOT NULL DEFAULT 0
);
selectTodas:
SELECT * FROM Tarea;
insertar:
INSERT INTO Tarea(id, titulo, completada) VALUES (?, ?, ?);
```

Un archivo `.sq` de SQLDelight declara tanto el esquema de la tabla como las queries específicas que la aplicación necesita ejecutar contra ella, escritas en SQL real (no en un lenguaje de consulta propietario de un ORM), a partir del cual SQLDelight genera automáticamente código Kotlin fuertemente tipado correspondiente a cada query declarada (`database.tareaQueries.selectTodas().executeAsList()` devuelve directamente `List<Tarea>`, con el tipo `Tarea` generado también automáticamente a partir de la definición de la tabla).

La diferencia crucial frente a un ORM dinámico tradicional (que construye y valida sus queries en tiempo de ejecución) es que SQLDelight verifica la validez del SQL completo (nombres de columnas, tipos, sintaxis) en tiempo de compilación: si se escribe mal el nombre de una columna en cualquier query del archivo `.sq`, el proyecto simplemente no compila, señalando el error exactamente en el punto donde ocurrió, en vez de que ese mismo error se manifieste como un crash en tiempo de ejecución únicamente cuando esa query específica efectivamente se ejecute en producción con datos reales.

**Analogía:** SQLDelight es como un corrector ortográfico y gramatical que revisa un documento completo antes de publicarlo, señalando cualquier error de redacción antes de que el documento llegue a manos de un lector real; un ORM dinámico sin esa verificación previa es como publicar el documento directamente y descubrir los errores de redacción solo cuando un lector específico se topa con ellos al leer esa sección particular.

**¿Por qué es importante?** SQLDelight detecta errores de SQL (nombres de columnas incorrectos, tipos inválidos) en tiempo de compilación, mientras que un ORM dinámico solo los detectaría en tiempo de ejecución, potencialmente en producción con datos reales.

**Casos de uso reales:**
- Caché local de la lista de tareas obtenida por red (Módulo 5), consultable sin conexión.
- Historial de búsquedas recientes persistido localmente en ambas plataformas con las mismas queries.
- Cola de acciones pendientes de sincronizar (`pendienteDeEnvio: INTEGER`) cuando el dispositivo recupera conexión.

**Diagrama:**

```sql
-- Tarea.sq
CREATE TABLE Tarea (
    id TEXT NOT NULL PRIMARY KEY,
    titulo TEXT NOT NULL,
    completada INTEGER NOT NULL DEFAULT 0
);
selectTodas:
SELECT * FROM Tarea;
```
```kotlin
val tareas: List<Tarea> = database.tareaQueries.selectTodas().executeAsList()
```

### Tema 2: Drivers por plataforma

**Conceptos clave:** queries compartidas, motor de ejecución específico por plataforma.

`actual fun crearDriver(): SqlDriver = AndroidSqliteDriver(Database.Schema, context, "app.db")` (en `androidMain`) y `actual fun crearDriver(): SqlDriver = NativeSqliteDriver(Database.Schema, "app.db")` (en `iosMain`) demuestran un caso típico y directo de `expect`/`actual` (Módulo 3): las queries declaradas en los archivos `.sq` compartidos en `commonMain` son idénticas para ambas plataformas, pero el driver concreto que efectivamente ejecuta esas queries contra el motor SQLite subyacente del sistema operativo es necesariamente distinto en cada plataforma, dado que Android e iOS exponen el acceso a SQLite a través de mecanismos nativos completamente diferentes entre sí.

Esta separación entre queries compartidas (código de alto nivel, expresando qué se quiere consultar) y el driver específico de plataforma (código de bajo nivel, expresando cómo efectivamente ejecutar esa consulta contra el SQLite nativo específico del sistema operativo) es exactamente el mismo patrón arquitectónico general de KMP estudiado en el Módulo 3: maximizar el código compartido (las queries), aislando en `expect`/`actual` únicamente el fragmento mínimo que genuinamente necesita interactuar con una API nativa distinta por plataforma.

**Analogía:** las queries compartidas son como una lista de compras escrita en un idioma universal comprensible por cualquier tienda; el driver específico de plataforma es como el empleado local de cada tienda particular que efectivamente sabe cómo localizar físicamente cada artículo en los estantes específicos de esa tienda concreta, aunque la lista de compras en sí sea exactamente la misma para ambas tiendas.

**¿Por qué es importante?** Aunque las queries sean compartidas, el driver que las ejecuta contra SQLite es necesariamente específico de cada plataforma, dado que Android e iOS exponen SQLite mediante mecanismos nativos distintos entre sí.

**Casos de uso reales:**
- Registrar el driver de Android en `Application.onCreate()` y el de iOS al arrancar la app SwiftUI, ambos apuntando al mismo esquema `.sq`.
- Usar un driver en memoria (`inMemoryDriver`) en tests de `commonTest` (Módulo 9) para no tocar disco en cada test.
- Depurar un problema de datos corruptos abriendo el mismo archivo `app.db` con herramientas nativas distintas por plataforma.

**Diagrama:**

```kotlin
// androidMain
actual fun crearDriver(): SqlDriver = AndroidSqliteDriver(Database.Schema, context, "app.db")
// iosMain
actual fun crearDriver(): SqlDriver = NativeSqliteDriver(Database.Schema, "app.db")
```

### Tema 3: Migraciones de esquema

**Conceptos clave:** cambios versionados, aplicación automática según la versión detectada.

`-- 2.sqm: ALTER TABLE Tarea ADD COLUMN prioridad INTEGER NOT NULL DEFAULT 0;` declara un cambio de esquema versionado (una migración, nombrada según su número de versión secuencial), permitiendo evolucionar la estructura de la base de datos con el tiempo (agregando una nueva columna a una tabla existente, en este caso) sin perder los datos ya almacenados en dispositivos de usuarios que ya tienen instalada una versión anterior de la aplicación con el esquema previo a esta migración.

SQLDelight aplica estas migraciones en orden secuencial estricto según la versión de esquema efectivamente detectada en el dispositivo específico del usuario en el momento de abrir la aplicación (comparando la versión almacenada en el dispositivo contra la versión más reciente conocida por el código actual de la aplicación), aplicando únicamente las migraciones intermedias pendientes necesarias para llevar ese dispositivo específico desde su versión actual hasta la versión más reciente, de forma similar en espíritu a las migraciones versionadas de Flyway estudiadas en el Módulo 3 del track de Spring Boot, aquí aplicadas al contexto de una base de datos local en el dispositivo del usuario en vez de una base de datos de servidor centralizada.

**Analogía:** una migración de esquema es como una instrucción de actualización incremental de un manual impreso ya distribuido: en vez de reemplazar el manual completo de cada persona que ya tiene una versión anterior, se distribuye únicamente el suplemento específico de actualización necesario, aplicado en el orden correcto según qué versión específica del manual cada persona ya posee.

**¿Por qué es importante?** Las migraciones versionadas de SQLDelight permiten evolucionar el esquema local de la base de datos sin perder datos existentes en dispositivos de usuarios con versiones anteriores de la aplicación ya instaladas.

**Casos de uso reales:**
- Agregar una columna `prioridad` a `Tarea` en una nueva versión de la app sin borrar las tareas que el usuario ya tenía guardadas.
- Renombrar o dividir una tabla existente conservando los datos históricos del usuario tras actualizar.
- Probar que las migraciones aplican correctamente desde cualquier versión antigua hasta la más reciente, como parte del test suite (Módulo 9).

**Diagrama:**

```sql
-- 2.sqm
ALTER TABLE Tarea ADD COLUMN prioridad INTEGER NOT NULL DEFAULT 0;
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

**Objetivo del laboratorio:** construir una capa de persistencia compartida con al menos una migración de esquema.

**Requisitos previos:** Módulos 0-5 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Definir el esquema `.sq` con una tabla y queries básicas | Ver Tema 1 | Insertar, listar, actualizar |
| 2 | Generar y usar el código Kotlin tipado | Ver Tema 1 | Desde `commonMain` |
| 3 | Configurar el driver por plataforma | Ver Tema 2 | `expect`/`actual` |
| 4 | Agregar una migración `.sqm` | Ver Tema 3 | Sin perder datos existentes |

**Verificación:** el laboratorio se considera exitoso si escribir mal el nombre de una columna en una query produce un error de compilación (no un crash en runtime), y si la migración agrega la nueva columna preservando los datos existentes de un esquema anterior simulado.

**Errores comunes y soluciones**

- **Confiar en un ORM dinámico sin verificación de tipos en compilación.** SQLDelight detecta errores de SQL en compilación, aprovecha esa ventaja.
- **Compartir el driver de SQLite entre plataformas.** El driver debe ser específico por plataforma vía `expect`/`actual`; las queries sí son compartidas.
- **Modificar el esquema directamente sin una migración versionada.** Usa archivos `.sqm` para cambios incrementales sin perder datos existentes.

---

## Ejercicios de evaluación

### Ejercicio 1: Error detectado en compilación por SQLDelight

**Enunciado:** ¿qué error detecta SQLDelight en tiempo de COMPILACIÓN que un ORM dinámico solo detectaría en runtime?

**Solución esperada:** un nombre de columna mal escrito, un tipo incompatible, o un error de sintaxis SQL en cualquier query declarada en un archivo `.sq`; SQLDelight verifica la validez completa del SQL en tiempo de compilación, mientras que un ORM dinámico construiría y validaría esa misma query solo en tiempo de ejecución, cuando efectivamente se invoque.

**Criterios de éxito:**
- Menciona correctamente errores de SQL (columnas, tipos, sintaxis) como lo detectado en compilación por SQLDelight.

### Ejercicio 2: Por qué se necesita un driver distinto por plataforma

**Enunciado:** ¿por qué necesitas un driver distinto por plataforma aunque las queries sean compartidas?

**Solución esperada:** las queries son código de alto nivel compartido, expresando qué se quiere consultar; el driver es el mecanismo de bajo nivel que efectivamente ejecuta esas queries contra el motor SQLite nativo, y Android e iOS exponen el acceso a SQLite mediante mecanismos nativos completamente distintos entre sí, requiriendo una implementación `actual` específica para cada uno.

**Criterios de éxito:**
- Explica correctamente la diferencia entre queries de alto nivel (compartidas) y el mecanismo de ejecución nativo (específico por plataforma).

### Ejercicio 3: Aplicación de migraciones según versión

**Enunciado:** ¿cómo determina SQLDelight qué migraciones aplicar en el dispositivo de un usuario específico?

**Solución esperada:** SQLDelight compara la versión de esquema almacenada en el dispositivo del usuario contra la versión más reciente conocida por el código actual de la aplicación, aplicando en orden secuencial únicamente las migraciones intermedias pendientes necesarias para llevar ese dispositivo específico desde su versión actual hasta la más reciente.

**Criterios de éxito:**
- Explica correctamente la comparación de versiones y la aplicación secuencial de migraciones pendientes.

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

- JetBrains, documentación oficial de *Kotlin Multiplatform* y Kotlin Coroutines.
- Google, *Android Developers Documentation*; Apple, *Developer Documentation*.
- Kotlin Foundation, especificación y pautas de compatibilidad de Kotlin.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- SQLDelight genera código Kotlin tipado a partir de esquemas SQL reales, verificados en tiempo de compilación.
- Las queries son compartidas en `commonMain`, pero el driver que las ejecuta es específico por plataforma vía `expect`/`actual`.
- Las migraciones versionadas evolucionan el esquema local sin perder datos existentes en dispositivos ya instalados.

**Conceptos aprendidos**

- Esquemas SQLDelight y queries tipadas.
- Drivers por plataforma.
- Migraciones de base de datos.

**Próximos pasos**

En el Módulo 7 aprenderás Compose Multiplatform: UI compartida entre Android, iOS y desktop.

**Recursos adicionales**

- Documentación oficial de SQLDelight (cashapp.github.io/sqldelight).
