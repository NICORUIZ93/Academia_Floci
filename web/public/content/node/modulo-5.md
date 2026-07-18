# Módulo 5: Bases de datos — drivers y ORMs

## Sílabo

**Objetivo general**

Conectar una API Node a una base de datos real, aprendiendo cuándo un ORM como Prisma ayuda y cuándo estorba, dominando pools de conexiones y transacciones para prevenir condiciones de carrera.

**Objetivos específicos**

1. Conectar a PostgreSQL con el driver `pg` puro.
2. Definir un modelo con Prisma y ejecutar migraciones versionadas.
3. Explicar por qué un pool de conexiones es necesario frente a abrir una conexión por petición.
4. Usar transacciones para prevenir condiciones de carrera al modificar datos compartidos.
5. Comparar SQL crudo, un driver puro y un ORM para la misma consulta.

**Contenido**

- PostgreSQL/MongoDB desde Node.
- Prisma: schema, migraciones y queries tipadas.
- Pool de conexiones.
- Transacciones.
- Mongoose: Schemas, Models y population.
- Sequelize y TypeORM como alternativas a Prisma.

**Evaluación**

Una API con persistencia real en PostgreSQL usando Prisma y migraciones versionadas, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: PostgreSQL desde Node con el driver puro

**Conceptos clave:** consultas parametrizadas, driver `pg`, SQL directo.

Conectar directamente a PostgreSQL usando el driver `pg` (sin ningún ORM intermedio) expone la interacción más cercana posible al motor de base de datos real: se escriben consultas SQL directamente como strings, y el driver las ejecuta devolviendo los resultados en un formato estructurado de filas y columnas. Esta cercanía tiene ventajas concretas: control total sobre exactamente qué SQL se ejecuta (relevante para optimizar consultas complejas donde la abstracción de un ORM podría generar SQL subóptimo), y ausencia de cualquier capa adicional de traducción entre el modelo de objetos de la aplicación y las tablas relacionales de la base de datos.

Es crítico usar siempre consultas parametrizadas (`pool.query("SELECT * FROM usuarios WHERE email = $1", [email])`, donde `$1` es un marcador de posición que el driver sustituye de forma segura) en vez de concatenar directamente valores de entrada del usuario dentro del string SQL, precisamente porque la concatenación directa abre la puerta a inyección SQL (un ataque donde un valor de entrada malicioso altera la estructura misma de la consulta SQL ejecutada, tema que se profundizará en el Módulo 10). El driver `pg` escapa automáticamente los valores pasados como parámetros, neutralizando este riesgo sin que el desarrollador necesite implementar manualmente ningún escape de caracteres especiales.

Trabajar con el driver puro es apropiado cuando se necesita control preciso sobre consultas complejas, cuando el equipo tiene fuerte experiencia en SQL, o en contextos de rendimiento extremadamente crítico donde cualquier overhead de abstracción de un ORM es indeseable; para la mayoría de aplicaciones con operaciones CRUD relativamente estándar, un ORM como Prisma (Tema 2) reduce considerablemente la cantidad de código repetitivo necesario, a cambio de renunciar a parte de ese control directo sobre el SQL exacto generado.

**Analogía:** usar el driver `pg` puro es como cocinar directamente con ingredientes crudos siguiendo tu propia receta exacta, con control total sobre cada paso; usar un ORM es como usar un robot de cocina programable que automatiza los pasos más comunes según instrucciones de alto nivel, a cambio de menos control directo sobre cada detalle específico del proceso.

**¿Por qué es importante?** Entender el driver puro y las consultas parametrizadas es la base indispensable para entender qué hace un ORM automáticamente por debajo, y las consultas parametrizadas son la defensa fundamental contra inyección SQL, sin importar si finalmente se usa un ORM o el driver directamente.

**Código del ejemplo:**

```js
import pg from "pg";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
// SEGURO: parámetros, el driver escapa automáticamente
const { rows } = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
// PELIGROSO: concatenación directa, vulnerable a inyección SQL
```

### Tema 2: Prisma — schema, migraciones y queries tipadas

**Conceptos clave:** `schema.prisma`, migraciones versionadas, cliente generado y tipado.

#### Cómo leer `@id`, `@default`, `@relation` y `@@index`

En el lenguaje de esquema de Prisma, `@` introduce un **atributo de campo**: modifica el contrato del campo escrito inmediatamente a su izquierda. `id Int @id @default(autoincrement())` declara que `id` forma la clave primaria y que su valor predeterminado lo genera la base de datos. `@relation(fields: [usuarioId], references: [id])` conecta el campo de relación de Prisma con la clave foránea escalar `usuarioId` y con la columna referenciada del otro modelo.

`@@` introduce un **atributo de bloque** y afecta al modelo completo. Por ejemplo, `@@index([usuarioId, completada])` solicita un índice compuesto y `@@unique([transportadoraId, numeroGuia])` expresa una unicidad de negocio entre varios campos. No son decoradores de TypeScript ni código que Node ejecute: el motor de Prisma analiza el schema, la migración traduce esos contratos a SQL y el cliente generado refleja después el modelo resultante.

**Límite:** un atributo no sustituye el diseño de datos. Añadir índices a todas las columnas aumenta almacenamiento y coste de escritura; una relación sin una política explícita de borrado puede producir registros huérfanos o eliminaciones inesperadas. Antes de migrar, revisa el SQL generado y prueba tanto la inserción válida como la violación de clave o unicidad.

Prisma es un ORM moderno para Node y TypeScript que centraliza la definición del modelo de datos en un único archivo declarativo (`schema.prisma`), describiendo cada tabla como un modelo con sus campos, tipos y relaciones (`model Tarea { id Int @id @default(autoincrement()) titulo String usuario Usuario @relation(...) }`), a partir del cual Prisma genera automáticamente tanto las migraciones SQL necesarias para crear o modificar las tablas reales en la base de datos, como un cliente JavaScript/TypeScript completamente tipado que refleja exactamente esa estructura de datos declarada.

`prisma migrate dev --name descripcion` genera un archivo de migración SQL versionado (committeado al control de versiones junto con el resto del código) que captura exactamente qué cambios de esquema se aplicaron y en qué orden, y aplica esa migración inmediatamente contra la base de datos de desarrollo configurada. Este enfoque de migraciones versionadas resuelve un problema real de coordinación en equipo: cualquier colaborador que aplique las migraciones en el mismo orden reproducirá exactamente la misma estructura de base de datos, sin depender de que cada persona modifique manualmente y de forma no sincronizada la estructura de tablas de forma directa e independiente.

El cliente generado por Prisma expone métodos tipados como `prisma.tarea.create({data: {...}})` y `prisma.tarea.findMany({where: {...}, include: {usuario: true}})`, donde el propio compilador de TypeScript verifica en tiempo de compilación que los campos usados en `data` o `where` efectivamente existen en el modelo `Tarea` declarado en el schema, capturando errores de tipeo o de campos inexistentes antes de que el código siquiera se ejecute, una ventaja considerable de seguridad de tipos que el SQL crudo del Tema 1 no ofrece de forma nativa (donde un error de nombre de columna solo se descubre al ejecutar la consulta y recibir un error de la base de datos).

**Analogía:** Prisma es como un arquitecto que, a partir de un único plano central del edificio (`schema.prisma`), genera automáticamente tanto las órdenes de construcción exactas para los contratistas (las migraciones SQL) como un manual de uso preciso y verificado del edificio terminado (el cliente tipado), garantizando que ambos siempre reflejen exactamente la misma estructura declarada en el plano original.

**¿Por qué es importante?** Prisma reduce considerablemente el código repetitivo de acceso a datos y aporta seguridad de tipos verificada en tiempo de compilación, a cambio de una capa de abstracción que, en casos de consultas extremadamente complejas u optimización crítica, puede requerir recurrir a SQL crudo complementario.

**Configuración del ejemplo:**

```prisma
model Tarea {
  id         Int      @id @default(autoincrement())
  titulo     String
  completada Boolean  @default(false)
  usuario    Usuario  @relation(fields: [usuarioId], references: [id])
  usuarioId  Int
}
```
```bash
npx prisma migrate dev --name agregar_tareas
```
```js
const tarea = await prisma.tarea.create({ data: { titulo: "Aprender Prisma", usuarioId: 1 } });
```

### Tema 3: Pool de conexiones y transacciones

**Conceptos clave:** reutilización de conexiones, atomicidad, `$transaction`.

Abrir una nueva conexión de red hacia PostgreSQL para cada petición HTTP individual es costoso (el proceso de establecer una conexión de base de datos, incluyendo autenticación, tiene una latencia no despreciable) y no escala: un servidor con suficiente tráfico concurrente rápidamente agotaría el número máximo de conexiones simultáneas que PostgreSQL permite, un límite configurado explícitamente en el propio servidor de base de datos por razones de estabilidad y de gestión de recursos del servidor. Un pool de conexiones mantiene un número fijo y limitado de conexiones ya establecidas y reutilizables, entregando una conexión disponible del pool a cada consulta entrante y devolviéndola al pool (en vez de cerrarla) una vez que la consulta termina, amortizando el coste de establecer conexiones entre muchas peticiones sucesivas.

Tanto el driver `pg` puro como Prisma gestionan un pool de conexiones automáticamente por debajo, sin que el desarrollador necesite implementar manualmente la lógica de gestión del pool; sin embargo, entender que existe y que tiene un límite configurable de tamaño es relevante para dimensionar correctamente una aplicación bajo carga real (un pool demasiado pequeño para el volumen de tráfico real crea un cuello de botella donde las peticiones esperan a que se libere una conexión disponible del pool).

Una transacción agrupa múltiples operaciones de base de datos en una unidad atómica: o todas las operaciones dentro de la transacción se aplican exitosamente, o ninguna se aplica en absoluto (si cualquier paso falla, todo se revierte automáticamente), previniendo estados inconsistentes de datos. El ejemplo clásico es descontar stock de un producto al crear un pedido: sin una transacción, dos peticiones concurrentes podrían ambas leer el mismo stock disponible antes de que ninguna lo actualice, resultando en que ambas descuenten stock exitosamente aunque el stock combinado descontado exceda lo realmente disponible, una condición de carrera con consecuencias reales de negocio. `prisma.$transaction(async (tx) => {...})` agrupa las operaciones internas (usando `tx` en vez de `prisma` directamente para cada operación dentro del bloque) de forma que, si cualquier paso lanza un error (por ejemplo, verificando explícitamente que el stock disponible es suficiente antes de descontarlo), toda la transacción completa se revierte automáticamente, evitando el estado inconsistente.

**Analogía:** un pool de conexiones es como una flota compartida de vehículos de una empresa: en vez de que cada empleado compre y mantenga su propio vehículo (abrir una conexión nueva cada vez), todos comparten un número fijo de vehículos disponibles, tomando uno prestado cuando lo necesitan y devolviéndolo al finalizar. Una transacción es como una operación bancaria de transferencia entre dos cuentas: o el dinero sale de una cuenta Y entra en la otra completamente, o la operación entera se cancela sin ningún cambio parcial, nunca dejando el dinero "a medio camino" entre ambas cuentas.

**¿Por qué es importante?** El pool de conexiones es indispensable para que una aplicación escale bajo tráfico real sin agotar los límites de conexión de la base de datos; las transacciones son la herramienta correcta y necesaria para prevenir condiciones de carrera al modificar datos compartidos concurrentemente.

**Código del ejemplo:**

```js
await prisma.$transaction(async (tx) => {
  const producto = await tx.producto.findUnique({ where: { id } });
  if (producto.stock < 1) throw new Error("Sin stock"); // revierte TODO si falla
  await tx.producto.update({ where: { id }, data: { stock: producto.stock - 1 } });
  await tx.pedido.create({ data: { productoId: id } });
});
```

### Tema 4: MongoDB con Mongoose y otras alternativas de ORM

**Conceptos clave:** documentos frente a tablas relacionales, Schemas de Mongoose, population.

MongoDB, una base de datos orientada a documentos (en contraste con el modelo relacional de tablas de PostgreSQL), almacena datos como documentos JSON flexibles en vez de filas con un esquema rígido predefinido de columnas. Mongoose es la biblioteca predominante para trabajar con MongoDB desde Node, permitiendo definir Schemas que, a diferencia de la flexibilidad nativa de MongoDB, imponen una estructura y validación consistente sobre los documentos de una colección desde el lado de la aplicación, junto con Models (la representación de una colección específica con su Schema aplicado) que exponen métodos similares en espíritu a los de Prisma para crear, consultar y actualizar documentos.

"Population" en Mongoose resuelve el equivalente a una relación entre tablas en el mundo de documentos: cuando un documento almacena solo la referencia (id) a otro documento relacionado (en vez de anidarlo completo), `population` reemplaza automáticamente esa referencia por el documento completo correspondiente al consultar, de forma similar en espíritu al `include` de Prisma visto en el Tema 2, aunque con consideraciones de rendimiento distintas propias del modelo de documentos de MongoDB frente al modelo relacional.

Sequelize y TypeORM son alternativas de ORM para bases de datos relacionales que preceden a Prisma en adopción histórica, ambas con un enfoque más tradicional basado en clases de modelo (más cercano al patrón Active Record de otros ecosistemas) en vez del enfoque de schema declarativo centralizado y generación de cliente que caracteriza a Prisma. La elección entre estas alternativas, en la práctica actual de proyectos nuevos, favorece considerablemente a Prisma por su experiencia de desarrollo con tipos verificados y su tooling de migraciones, aunque proyectos legados existentes con Sequelize o TypeORM ya establecidos raramente justifican una migración completa solo para adoptar la alternativa más reciente.

**Analogía:** una base de datos relacional (PostgreSQL) es como un archivador con formularios idénticos y estructurados para cada categoría de información, donde cada campo tiene un lugar fijo predefinido; una base de datos de documentos (MongoDB) es como una colección de notas individuales, cada una potencialmente con una estructura ligeramente distinta, agrupadas por tema pero sin exigir uniformidad estricta entre ellas salvo que se imponga explícitamente (como hace un Schema de Mongoose).

**¿Por qué es importante?** Elegir entre un modelo relacional y uno de documentos depende de la naturaleza de los datos y las consultas de la aplicación; conocer Mongoose y las alternativas de ORM relacional amplía el panorama de herramientas disponibles más allá de Prisma para tomar esa decisión con criterio informado.

**Código del ejemplo:**

```js
const tareaSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
});
const Tarea = mongoose.model("Tarea", tareaSchema);
const tareas = await Tarea.find().populate("usuario"); // reemplaza la referencia por el documento completo
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

**Objetivo del laboratorio:** conectar una API Express a PostgreSQL usando Prisma, con migraciones versionadas, y demostrar la necesidad de transacciones ante una condición de carrera real.

**Requisitos previos:** Docker instalado, Módulos 0-4 completados.

| Paso | Acción | Comando/Código | Explicación |
|---|---|---|---|
| 1 | Levantar PostgreSQL en Docker | `docker run -d -e POSTGRES_PASSWORD=... postgres` | Conecta con el driver `pg` puro y ejecuta `SELECT 1` |
| 2 | Instalar Prisma y definir un modelo | Ver Tema 2 | `npx prisma migrate dev` para crear la tabla |
| 3 | Usar el cliente generado desde Express | Crear, listar, actualizar tareas | Conecta con las rutas del Módulo 4 |
| 4 | Provocar una condición de carrera intencional | Dos requests simultáneas descontando el mismo stock | Sin transacción, observa el stock final incorrecto |
| 5 | Corregir con `$transaction` | Ver Tema 3 | Verifica que el stock final ahora es correcto |
| 6 | Comparar la misma consulta en tres formas | SQL crudo, driver `pg`, Prisma | Compara legibilidad y seguridad de tipos |

**Verificación:** el laboratorio se considera exitoso si la condición de carrera del paso 4 se reproduce de forma medible sin transacción, y si la corrección del paso 5 elimina completamente el estado inconsistente, verificado con múltiples ejecuciones concurrentes reales.

**Errores comunes y soluciones**

- **Concatenar directamente valores de entrada en SQL crudo.** Usa siempre consultas parametrizadas (`$1`, `$2`), nunca concatenación directa de strings de entrada del usuario.
- **Olvidar committear los archivos de migración generados por Prisma.** Las migraciones deben versionarse junto con el código para que el equipo completo reproduzca la misma estructura de base de datos.
- **Modificar datos compartidos sin transacción cuando hay concurrencia real.** Si dos operaciones pueden competir por el mismo recurso, envuélvelas en una transacción explícita.

---

## Ejercicios de evaluación

### Ejercicio 1: Cuándo un ORM ayuda y cuándo estorba

**Enunciado:** describe un escenario donde un ORM como Prisma claramente ahorra tiempo, y otro donde recurrir a SQL crudo sería preferible.

**Solución esperada:** un ORM ahorra tiempo en operaciones CRUD estándar con relaciones simples (crear, listar, actualizar registros con validación de tipos automática); SQL crudo es preferible para consultas analíticas complejas con múltiples agregaciones y joins optimizados manualmente, donde la abstracción del ORM podría generar SQL subóptimo o donde se necesita aprovechar características muy específicas del motor de base de datos no expuestas directamente por el ORM.

**Criterios de éxito:**
- Da un ejemplo correcto de ventaja de un ORM.
- Da un ejemplo correcto de un caso donde SQL crudo sería preferible.

### Ejercicio 2: Por qué un pool de conexiones

**Enunciado:** explica por qué abrir una conexión nueva a PostgreSQL en cada petición HTTP no escala, incluso si el servidor de base de datos tiene suficientes recursos técnicamente disponibles.

**Solución esperada:** establecer una conexión tiene una latencia no despreciable (afectando el tiempo de respuesta de cada petición) y PostgreSQL impone un límite máximo configurado de conexiones simultáneas; bajo tráfico concurrente alto, abrir una conexión nueva por petición agotaría rápidamente ese límite máximo, rechazando nuevas conexiones aunque el servidor tenga capacidad de cómputo de sobra para procesarlas.

**Criterios de éxito:**
- Explica correctamente la latencia de establecer conexiones y el límite máximo de conexiones simultáneas.

### Ejercicio 3: Diseñar una transacción

**Enunciado:** describe qué operaciones agruparías en una transacción para el caso de "transferir dinero entre dos cuentas bancarias", y qué pasaría si no se usara una transacción.

**Solución esperada:** agruparía en una transacción: verificar que la cuenta origen tiene saldo suficiente, descontar el monto de la cuenta origen, y añadir el monto a la cuenta destino. Sin transacción, un fallo entre el descuento de la cuenta origen y la adición a la cuenta destino (por ejemplo, una caída del servidor a mitad de proceso) dejaría el dinero "perdido": descontado de una cuenta sin haberse acreditado en la otra, un estado inconsistente grave.

**Criterios de éxito:**
- Identifica correctamente las tres operaciones que deben agruparse atómicamente.
- Explica el estado inconsistente específico que ocurriría sin la transacción.

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

- OpenJS Foundation, *Node.js Documentation*.
- IETF, especificaciones HTTP Semantics, OAuth 2.0 y JSON.
- OWASP Foundation, *Application Security Verification Standard*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- El driver `pg` puro requiere siempre consultas parametrizadas para prevenir inyección SQL.
- Prisma centraliza el modelo de datos en un schema declarativo, generando migraciones versionadas y un cliente tipado.
- Un pool de conexiones reutiliza conexiones existentes, evitando el coste y el límite de abrir una nueva por petición.
- Las transacciones agrupan operaciones en una unidad atómica, previniendo condiciones de carrera al modificar datos compartidos.
- Mongoose (MongoDB) y Sequelize/TypeORM son alternativas con enfoques distintos según el modelo de datos y las preferencias del equipo.

**Conceptos aprendidos**

- Conexión directa a PostgreSQL con consultas parametrizadas.
- Definición de modelos, migraciones versionadas y queries tipadas con Prisma.
- Pools de conexiones y su necesidad para escalar.
- Transacciones para prevenir condiciones de carrera.
- Panorama de ORMs alternativos (Mongoose, Sequelize, TypeORM).

**Próximos pasos**

En el Módulo 6 implementarás autenticación y autorización seguras: hashing de contraseñas, JWT con access y refresh tokens, y control de acceso basado en roles.

**Recursos adicionales**

- Documentación oficial de Prisma (prisma.io) y de node-postgres (node-postgres.com).
- Documentación oficial de Mongoose (mongoosejs.com).
