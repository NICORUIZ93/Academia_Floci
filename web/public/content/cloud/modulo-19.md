# Módulo 19: Analítica de datos con Athena y Glue


## Aprende construyendo

### Tema 1: Data lake y Glue Catalog

#### Paso 1 · Objetivo y preparación
Al finalizar podrás consultar datos sin moverlos desde cero. Prerrequisitos: Node.js y AWS CLI; verifica `node --version`.
#### Paso 2 · Contexto y caso real
Los registros de entregas pueden analizarse directamente en objetos almacenados.
#### Paso 3 · Teoría, modelo mental y analogía
Es como consultar un archivo sin trasladarlo a otra oficina; el esquema vive aparte.
#### Paso 4 · Demostración guiada
Crea `src/query-data.js` desde una carpeta vacía.
```bash
mkdir ejemplo-athena
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: declara una columna inexistente para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Consulta datos de prueba y conserva la salida.
#### Paso 7 · Cierre y evidencia
Entrega consulta, salida, fallo y corrección; explica el resultado. Siguiente paso: formato. Errores comunes: esquema desactualizado y permisos excesivos. Fuente oficial: https://docs.aws.amazon.com/athena/latest/ug/what-is.html.
**Conceptos clave:** los datos permanecen en su ubicación original de almacenamiento de objetos, el esquema se define por separado.

```bash
aws glue create-database --database-input '{"Name":"tienda"}'
aws glue create-table --database-name tienda --table-input '{"Name":"pedidos","StorageDescriptor":{...}}'
```

`--database-input` es el JSON que describe la base de datos lógica a crear dentro del catálogo (acá, solo su nombre); `--database-name` indica en cuál de esas bases de datos crear la tabla; `--table-input` es el JSON con la estructura de la tabla (columnas, formato de archivo, ubicación en S3).

Un data lake almacena datos en su formato original (crudo o semi-procesado) directamente en almacenamiento de objetos como S3, sin cargarlos primero hacia una base de datos estructurada tradicional (un data warehouse), difiriendo la definición de esquema hasta el momento de la consulta ("schema-on-read") en vez de exigir un esquema rígido predefinido antes de poder almacenar cualquier dato ("schema-on-write", el modelo tradicional de bases de datos relacionales); esta flexibilidad permite almacenar datos de fuentes y formatos heterogéneos sin necesidad de transformarlos todos hacia un esquema único común de antemano, a costa de requerir herramientas adicionales (como Athena) para consultar esos datos de forma estructurada cuando sea necesario.

Glue Catalog actúa como el catálogo centralizado de metadatos que describe el esquema de los datos almacenados en S3 (qué columnas tiene una tabla lógica, en qué formato están los archivos, dónde exactamente en S3 se ubican), sin mover ni duplicar los datos reales: es simplemente una capa de metadatos que permite a herramientas como Athena saber cómo interpretar los archivos crudos almacenados en S3 como si fueran una tabla estructurada consultable con SQL.

**Analogía:** un data lake es como un gran almacén que acepta mercancía de cualquier tipo y formato sin exigir una clasificación previa estricta al momento de recibirla, difiriendo esa clasificación hasta el momento en que alguien efectivamente necesita buscar algo específico; Glue Catalog es como el índice centralizado de ese almacén que describe dónde está cada tipo de mercancía y cómo interpretarla, sin mover físicamente ningún artículo de su ubicación original.

**¿Por qué es importante?** Un data lake permite almacenar datos heterogéneos sin esquema rígido predefinido de antemano (schema-on-read), difiriendo esa estructuración hasta el momento de la consulta; Glue Catalog provee los metadatos necesarios para que herramientas como Athena consulten esos datos crudos como tablas estructuradas sin moverlos.

**Diagrama:**

```
Data lake (S3, datos crudos, cualquier formato)
        ↑
Glue Catalog (metadatos: esquema, formato, ubicación)
        ↑
Athena (consulta SQL usando esos metadatos, sin mover los datos)
```

### Tema 2: Glue Crawler y Athena

#### Paso 1 · Objetivo y preparación
Al finalizar podrás descubrir un esquema desde cero. Prerrequisitos: Node.js y AWS CLI; verifica `node --version`.
#### Paso 2 · Contexto y caso real
Los archivos cambian y el catálogo debe reflejar sus columnas.
#### Paso 3 · Teoría, modelo mental y analogía
El crawler es un inventario que lee muestras y propone estructura.
#### Paso 4 · Demostración guiada
Crea `src/catalog.js` desde una carpeta vacía.
```bash
mkdir ejemplo-catalogo
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: mezcla formatos para provocar un fallo deliberado de inferencia y corrígelo.
#### Paso 6 · Práctica independiente
Compara esquema automático y declarado.
#### Paso 7 · Cierre y evidencia
Entrega catálogo, salida, fallo y corrección; explica el resultado. Siguiente paso: particiones. Errores comunes: confiar ciegamente en inferencia y no versionar esquema. Fuente oficial: https://docs.aws.amazon.com/glue/latest/dg/catalog-and-crawler.html.
**Conceptos clave:** descubrimiento automático de esquema, consulta SQL directa sobre archivos en S3.

```bash
aws glue create-crawler --name crawler-pedidos --targets '{"S3Targets":[{"Path":"s3://analytics-bucket/pedidos"}]}' --database-name tienda
aws glue start-crawler --name crawler-pedidos
```

`--targets` le dice al crawler dónde buscar archivos (acá, una ruta de S3); el resto de las banderas ya las conocés de Tema 1.

Un Glue Crawler examina automáticamente los archivos almacenados en una ubicación de S3, infiere el esquema (nombres y tipos de columnas) a partir de su contenido real, y registra esa definición de tabla en Glue Catalog sin que un humano tenga que declarar manualmente cada columna y tipo, especialmente valioso cuando el formato exacto de los datos no se conoce de antemano con precisión o cuando evoluciona con el tiempo (agregando nuevas columnas que el crawler puede detectar en ejecuciones sucesivas).

```bash
aws athena start-query-execution --query-string "SELECT cliente, SUM(monto) as total FROM tienda.pedidos GROUP BY cliente ORDER BY total DESC" --result-configuration OutputLocation=s3://analytics-bucket/resultados/
```

`--query-string` es la consulta SQL a ejecutar; `--result-configuration` indica dónde escribir el resultado (Athena no devuelve solo texto en pantalla: siempre guarda el resultado completo como archivo en S3, en la ubicación que indiques con `OutputLocation`).

Athena ejecuta SQL estándar directamente sobre los datos en S3 usando el esquema registrado en Glue Catalog, sin requerir ningún servidor de base de datos persistente corriendo continuamente: cada consulta se ejecuta bajo demanda como un job serverless, escaneando únicamente los archivos relevantes de S3 según el esquema y las particiones definidas, con el resultado de la consulta escrito de vuelta hacia una ubicación de S3 especificada; un Athena Workgroup permite aislar y controlar los costos de consultas de distintos equipos o propósitos (por ejemplo, limitando cuántos bytes puede escanear un workgroup específico por consulta, previniendo consultas descontroladamente costosas).

**Analogía:** un Glue Crawler es como un inspector que examina automáticamente el contenido de cajas sin etiquetar en un almacén y genera una ficha catalográfica describiendo su contenido, sin que un empleado tenga que abrir y catalogar manualmente cada caja una por una; Athena es como un servicio de consulta bajo demanda que responde preguntas específicas sobre el contenido del almacén completo usando esas fichas catalográficas, cobrando únicamente por la cantidad de cajas efectivamente revisadas para responder cada pregunta específica.

**¿Por qué es importante?** El Glue Crawler descubre automáticamente el esquema de datos sin declaración manual, especialmente valioso cuando el formato evoluciona con el tiempo; Athena consulta esos datos con SQL estándar sin servidor persistente, cobrando por consulta según los bytes efectivamente escaneados.

**Prueba en terminal:**

```bash
aws glue start-crawler --name crawler-pedidos
# → descubre esquema automáticamente y lo registra en Glue Catalog

aws athena start-query-execution --query-string "SELECT ... FROM tienda.pedidos ..."
# → consulta SQL directa sobre los archivos en S3, usando ese esquema
```

### Tema 3: Parquet vs CSV, y partition pruning

#### Paso 1 · Objetivo y preparación
Al finalizar podrás optimizar consultas desde cero. Prerrequisitos: Node.js y AWS CLI; verifica `node --version`.
#### Paso 2 · Contexto y caso real
Una consulta que lee todos los archivos puede multiplicar el coste.
#### Paso 3 · Teoría, modelo mental y analogía
Particionar es ordenar un archivo por fecha para abrir solo el cajón necesario.
#### Paso 4 · Demostración guiada
Crea `src/partitions.js` desde una carpeta vacía.
```bash
mkdir ejemplo-particiones
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: consulta sin filtro para provocar un fallo deliberado de coste y corrígelo.
#### Paso 6 · Práctica independiente
Compara CSV y Parquet con métricas.
#### Paso 7 · Cierre y evidencia
Entrega medición, salida, fallo y corrección; explica el resultado. Siguiente paso: analítica. Errores comunes: particiones pequeñas y formato no columnar. Fuente oficial: https://docs.aws.amazon.com/athena/latest/ug/partitions.html.
**Conceptos clave:** el formato de archivo y la organización en particiones determinan drásticamente el costo de cada consulta.

Parquet es un formato de almacenamiento columnar (organiza los datos por columna en vez de por fila, como CSV/JSON) que permite a Athena leer únicamente las columnas efectivamente referenciadas en una consulta específica (en vez de tener que leer el archivo completo fila por fila, extrayendo todas las columnas incluso las no relevantes para esa consulta particular como ocurre inevitablemente con CSV), además de aplicar compresión considerablemente más eficiente gracias a que valores similares del mismo tipo de columna quedan almacenados contiguos entre sí; esta combinación hace que Parquet sea típicamente 10 veces más eficiente en bytes escaneados (y por lo tanto en costo, dado que Athena cobra según bytes escaneados) que CSV para consultas analíticas típicas que solo necesitan un subconjunto de columnas de una tabla ancha.

Particionar los datos por una columna de alta relevancia para el patrón de consulta habitual (por ejemplo, por fecha, organizando los archivos físicamente en carpetas separadas de S3 según el año/mes) permite a Athena aplicar "partition pruning": si una consulta filtra explícitamente por un rango de fechas específico, Athena puede ignorar por completo las particiones (carpetas) que quedan fuera de ese rango sin siquiera necesitar leerlas, reduciendo drásticamente los bytes escaneados y por lo tanto el costo y la latencia de la consulta, comparado con escanear la tabla completa sin ningún criterio de exclusión física previo basado en la organización de los archivos.

**Analogía:** Parquet es como un archivo organizado por categoría temática en vez de por orden cronológico mezclado, permitiendo extraer directamente solo la categoría de interés sin hojear documentos irrelevantes de por medio; particionar por fecha con partition pruning es como tener carpetas físicas separadas por año en un archivo, permitiendo ignorar por completo las carpetas de años no solicitados sin siquiera abrirlas, en vez de revisar cada documento individual del archivo completo para determinar si corresponde al período de interés.

**¿Por qué es importante?** Parquet es hasta 10 veces más eficiente que CSV para analítica porque permite leer solo las columnas relevantes con mejor compresión; las particiones con partition pruning reducen drásticamente los bytes escaneados al ignorar por completo carpetas fuera del rango de filtro de la consulta, reduciendo costo y latencia de forma significativa.

**Diagrama:**

```
Sin particiones: Athena escanea TODOS los archivos de la tabla, filtra después
Con particiones + partition pruning: Athena IGNORA por completo las carpetas fuera del filtro, sin leerlas
```

---


## Laboratorio práctico

> Este laboratorio asume que ya ejecutaste `floci start` y `eval $(floci env)` (Módulo 1) en tu sesión de terminal, así que los comandos de `aws` no repiten `--endpoint-url`.

**Objetivo del laboratorio:** construir una query SQL que analiza 100k registros en S3 y devuelve el top 10 de clientes en menos de 1 segundo.

**Requisitos previos:** Módulo 18 completado.

| Paso | Acción | Comando | Explicación |
|---|---|---|---|
| 1 | Subir datos de prueba a S3 | `aws s3 cp orders.json s3://analytics-bucket/pedidos/2024/01/` | Estructura particionada por fecha |
| 2 | Crear la base de datos y tabla en Glue Catalog | `aws glue create-database` + `create-table` | Con `PartitionKeys` |
| 3 | Ejecutar un Glue Crawler | `aws glue create-crawler` + `start-crawler` | Descubre el esquema |
| 4 | Ejecutar la query con Athena | `aws athena start-query-execution` | Top 10 clientes por monto |
| 5 | Comparar rendimiento JSON vs Parquet, con y sin particiones | Ver Temas 2-3 | Bytes escaneados |

**Verificación:** el laboratorio se considera exitoso si la query devuelve el top 10 de clientes correctamente, y si la comparación demuestra una reducción medible de bytes escaneados al usar Parquet y particiones frente a JSON sin particionar.

**Errores comunes y soluciones**

- **Almacenar datos analíticos en CSV/JSON sin considerar Parquet.** Convierte a Parquet para reducir drásticamente bytes escaneados y costo.
- **No particionar datos consultados frecuentemente por un criterio como fecha.** Particiona por esa columna para habilitar partition pruning.
- **Declarar manualmente el esquema de una tabla con formato de datos desconocido o cambiante.** Usa un Glue Crawler para descubrimiento automático.

---
