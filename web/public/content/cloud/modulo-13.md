# Módulo 13: Bases de datos relacionales con RDS (PostgreSQL real)


## Aprende construyendo

### Tema 1: RDS Instance y cuándo elegir SQL sobre NoSQL

#### Paso 1 · Objetivo y preparación
Al finalizar podrás elegir una base relacional desde cero. Prerrequisitos: Node.js y Docker; verifica `node --version`.
#### Paso 2 · Contexto y caso real
Facturación y contabilidad requieren relaciones, transacciones y consultas consistentes.
#### Paso 3 · Teoría, modelo mental y analogía
Una base relacional es un libro contable con referencias y reglas de integridad.
#### Paso 4 · Demostración guiada
Crea `src/relational.js` desde una carpeta vacía.
```bash
mkdir ejemplo-relacional
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: rompe una restricción para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Modela clientes, entregas y pagos.
#### Paso 7 · Cierre y evidencia
Entrega modelo, salida, fallo y corrección; explica el resultado. Siguiente paso: copias. Errores comunes: relaciones implícitas y transacciones incompletas. Fuente oficial: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html.
**Conceptos clave:** relaciones estructuradas y consultas complejas frente a escala horizontal simple.

```bash
aws rds create-db-instance --db-instance-identifier mi-postgres --db-instance-class db.t3.micro --engine postgres --master-username admin --master-user-password admin123 --allocated-storage 20
aws rds wait db-instance-available --db-instance-identifier mi-postgres
```

RDS gestiona una base de datos relacional completa (PostgreSQL, MySQL, entre otros motores) como un servicio administrado: encargándose de parcheo, backups automáticos, y escalado vertical de la instancia subyacente, sin que el desarrollador tenga que gestionar manualmente un servidor de base de datos propio; a diferencia de cloud local corriendo servicios emulados en memoria para muchos otros servicios, al crear una instancia RDS, cloud local efectivamente levanta un PostgreSQL **real** (el mismo motor de base de datos que correría en producción), con la única diferencia práctica siendo el endpoint al que se conecta (local en vez del endpoint de AWS real), una fidelidad de emulación considerablemente mayor que la de servicios simulados con lógica interna propia distinta al servicio real.

Elegir RDS (SQL relacional) sobre DynamoDB (NoSQL, Módulo 4) es apropiado cuando la aplicación necesita relaciones complejas entre entidades (joins entre múltiples tablas), transacciones ACID estrictas que abarcan múltiples filas o tablas simultáneamente, o consultas ad hoc flexibles con predicados complejos no conocidos de antemano al momento de diseñar el esquema; DynamoDB sigue siendo preferible cuando el patrón de acceso a los datos es conocido de antemano y relativamente simple (consultas por clave), y se necesita escala horizontal prácticamente ilimitada sin gestión operativa, una decisión de arquitectura fundamental que determina buena parte del resto del diseño de una aplicación de backend.

**Analogía:** RDS es como contratar un archivo relacional completo con un bibliotecario profesional que gestiona backups y mantenimiento por su cuenta, apropiado cuando se necesitan consultas complejas que cruzan múltiples categorías de información (joins); DynamoDB es como un sistema de casilleros numerados de acceso instantáneo, ideal cuando siempre se sabe exactamente qué casillero específico se necesita consultar, sin necesidad de cruzar información entre casilleros distintos.

**¿Por qué es importante?** Elegir DynamoDB sobre RDS (o viceversa) depende de si la aplicación necesita relaciones complejas y consultas ad hoc flexibles (RDS) o patrones de acceso simples y conocidos con escala horizontal ilimitada (DynamoDB), una decisión arquitectónica fundamental.

**Diagrama:**

```
RDS (SQL)      → relaciones complejas, joins, transacciones ACID multi-fila, consultas ad hoc
DynamoDB (NoSQL) → patrón de acceso conocido y simple, escala horizontal ilimitada
```

### Tema 2: Snapshots y restore

#### Paso 1 · Objetivo y preparación
Al finalizar podrás restaurar una base desde cero. Prerrequisitos: Node.js y Docker; verifica `node --version`.
#### Paso 2 · Contexto y caso real
Un error humano no debe destruir el historial contable.
#### Paso 3 · Teoría, modelo mental y analogía
Un backup es una fotografía fechada que debe probarse restaurando.
#### Paso 4 · Demostración guiada
Crea `src/backup.js` desde una carpeta vacía.
```bash
mkdir ejemplo-backup
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: restaura un punto inexistente para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Define RPO, RTO y una prueba de restauración.
#### Paso 7 · Cierre y evidencia
Entrega plan, salida, fallo y corrección; explica el resultado. Siguiente paso: migraciones. Errores comunes: backup sin restore probado y retención insuficiente. Fuente oficial: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_CommonTasks.BackupRestore.html.
**Conceptos clave:** copias de seguridad puntuales restaurables como una nueva instancia independiente.

```bash
aws rds create-db-snapshot --db-instance-identifier mi-postgres --db-snapshot-identifier snap-001
aws rds restore-db-instance-from-db-snapshot --db-instance-identifier mi-postgres-2 --db-snapshot-identifier snap-001
```

Un snapshot de RDS captura el estado completo de una instancia en un momento específico, permitiendo restaurarlo posteriormente como una instancia **nueva** e independiente (no sobrescribiendo la instancia original), lo que habilita casos de uso valiosos como recuperación ante desastres (restaurar a un punto anterior conocido y correcto tras una corrupción de datos accidental), clonar un entorno de producción hacia un entorno de pruebas con datos realistas sin afectar la instancia productiva original, o simplemente mantener puntos de restauración periódicos como parte de una estrategia de backup regular.

Esta capacidad de restaurar hacia una instancia nueva e independiente (en vez de una operación destructiva sobre la instancia existente) es una característica de diseño deliberada que previene que una restauración accidental o mal ejecutada afecte a un sistema en producción actualmente en uso, dado que la instancia original permanece intacta y disponible durante todo el proceso de restauración de la copia.

**Analogía:** un snapshot de RDS es como una fotografía completa de un archivo físico en un momento específico, que puede usarse posteriormente para reconstruir una copia idéntica completa de ese archivo en una ubicación nueva y separada, sin alterar en absoluto el archivo original que sigue existiendo y en uso durante todo el proceso.

**¿Por qué es importante?** Los snapshots permiten recuperación ante desastres y clonación de entornos hacia instancias nuevas e independientes, sin afectar la instancia original, una característica de diseño que previene que una restauración accidental dañe un sistema productivo en uso.

**Prueba en terminal:**

```bash
aws rds create-db-snapshot --db-instance-identifier mi-postgres --db-snapshot-identifier snap-001
aws rds restore-db-instance-from-db-snapshot --db-instance-identifier mi-postgres-2 --db-snapshot-identifier snap-001
# mi-postgres-2 es una instancia NUEVA e independiente; mi-postgres original permanece intacta
```

### Tema 3: Migrations

#### Paso 1 · Objetivo y preparación
Al finalizar podrás migrar un esquema desde cero. Prerrequisitos: Node.js y Docker; verifica `node --version`.
#### Paso 2 · Contexto y caso real
Una nueva función debe convivir con datos antiguos durante el despliegue.
#### Paso 3 · Teoría, modelo mental y analogía
Una migración es una receta versionada que se puede aplicar y auditar.
#### Paso 4 · Demostración guiada
Crea `src/migration.js` desde una carpeta vacía.
```bash
mkdir ejemplo-migracion
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: ejecuta una migración dos veces para provocar un fallo deliberado y hazla idempotente.
#### Paso 6 · Práctica independiente
Añade rollback y compatibilidad hacia atrás.
#### Paso 7 · Cierre y evidencia
Entrega scripts, salida, fallo y corrección; explica el resultado. Siguiente paso: almacenamiento distribuido. Errores comunes: editar producción manualmente y no respaldar. Fuente oficial: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_BestPractices.html.
**Conceptos clave:** evolución versionada y reproducible del esquema, no cambios manuales ad hoc.

```sql
CREATE TABLE tareas (id SERIAL PRIMARY KEY, titulo TEXT, estado TEXT);
INSERT INTO tareas (titulo, estado) VALUES ('Mi tarea', 'pendiente');
```

Una migration es un cambio de esquema versionado y ejecutado de forma reproducible (típicamente mediante una herramienta de migraciones que rastrea qué cambios ya se aplicaron a una base de datos específica), en vez de ejecutar comandos SQL de modificación de esquema manualmente y de forma ad hoc directamente contra la base de datos de producción; esto es importante porque garantiza que el esquema de la base de datos evolucione de forma consistente y rastreable a través de distintos entornos (desarrollo, pruebas, producción) y a través del tiempo, con un historial claro de qué cambios se aplicaron y en qué orden, permitiendo además revertir un cambio problemático de forma controlada si fuera necesario.

Esta necesidad de gestionar la evolución del esquema de forma versionada es exactamente el mismo principio ya estudiado con Flyway en Spring Boot (Módulo 3 de ese track) y con las migraciones de Room en Android (Módulo 6 de ese track): sin un mecanismo formal de migraciones, cada entorno de despliegue podría terminar con un esquema ligeramente distinto e inconsistente entre sí, dependiendo de qué cambios manuales se aplicaron o se olvidaron aplicar en cada uno de ellos.

**Analogía:** una migration es como una bitácora de construcción versionada que documenta cada modificación estructural realizada a un edificio en un orden específico y verificable, permitiendo reconstruir exactamente el mismo edificio en una ubicación nueva siguiendo esa misma bitácora paso a paso, en vez de intentar replicar modificaciones ad hoc no documentadas de memoria.

**¿Por qué es importante?** Las migrations garantizan que el esquema de la base de datos evolucione de forma consistente y rastreable a través de distintos entornos y en el tiempo, evitando la inconsistencia de aplicar cambios manuales ad hoc no documentados directamente contra producción.

**Diagrama:**

```
V1__crear_tabla_tareas.sql   → aplicado en dev, staging, producción, en ese orden rastreado
V2__agregar_columna_prioridad.sql → aplicado consistentemente después de V1 en cada entorno
```

---


## Laboratorio práctico

> Este laboratorio asume que ya ejecutaste `floci start` y `eval $(floci env)` (Módulo 1) en tu sesión de terminal, así que los comandos de `aws` no repiten `--endpoint-url`.

**Objetivo del laboratorio:** construir una API que usa RDS PostgreSQL como backend, con migraciones de esquema ejecutadas automáticamente.

**Requisitos previos:** Módulo 12 completado.

| Paso | Acción | Comando | Explicación |
|---|---|---|---|
| 1 | Crear una instancia RDS PostgreSQL | `aws rds create-db-instance ...` | Espera con `wait db-instance-available` |
| 2 | Conectarse con `psql` y crear una tabla | Ver Tema 1 | Operaciones SQL básicas |
| 3 | Tomar un snapshot | `aws rds create-db-snapshot` | Copia puntual |
| 4 | Restaurar desde el snapshot | `aws rds restore-db-instance-from-db-snapshot` | Instancia nueva e independiente |
| 5 | Conectarse desde Python con `psycopg2` | Ver Tema 1 | Integración con la aplicación |

**Verificación:** el laboratorio se considera exitoso si la API se conecta correctamente a RDS y ejecuta operaciones CRUD reales sobre PostgreSQL, y si la instancia restaurada desde el snapshot contiene exactamente los datos capturados en el momento de esa captura.

**Errores comunes y soluciones**

- **Elegir DynamoDB para un caso de uso que requiere joins complejos entre entidades.** Prefiere RDS para relaciones complejas y consultas ad hoc.
- **Aplicar cambios de esquema manualmente y sin versionar directamente contra producción.** Usa una herramienta de migraciones para consistencia rastreable entre entornos.
- **Restaurar un snapshot sobrescribiendo la instancia original en vez de crear una nueva.** RDS restaura hacia una instancia nueva e independiente por diseño; aprovecha esa seguridad.

---
