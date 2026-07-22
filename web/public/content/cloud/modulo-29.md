# Módulo 29: FinOps y gobierno de cuenta — Cost Explorer, Pricing, BCM Data Exports, Resource Groups Tagging y STS


## Aprende construyendo

### Tema 1: Cost Explorer — costos sintetizados a partir de tu estado real

#### Paso 1 · Objetivo y preparación
Al finalizar podrás analizar costes desde cero. Prerrequisitos: Node.js y AWS CLI; verifica `node --version`.
#### Paso 2 · Contexto y caso real
Una plataforma debe conocer cuánto cuesta cada servicio y equipo.
#### Paso 3 · Teoría, modelo mental y analogía
Cost Explorer es libro contable que agrupa consumo por dimensiones.
#### Paso 4 · Demostración guiada
Crea `src/costs.js` desde una carpeta vacía.
```bash
mkdir ejemplo-costos
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: consulta rango inválido para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Agrupa por servicio y tag.
#### Paso 7 · Cierre y evidencia
Entrega consulta, salida, fallo y corrección; explica el resultado. Siguiente paso: precios. Errores comunes: mezclar fechas y no etiquetar recursos. Fuente oficial: https://docs.aws.amazon.com/cost-management/latest/userguide/ce-what-is.html.
**Conceptos clave:** `GetCostAndUsage`, enumerador de uso de recursos, agrupación por dimensión.

Cost Explorer en Floci no factura dinero real —obviamente, no hay tarjeta de crédito involucrada—, pero tampoco devuelve números inventados al azar: sintetiza sus respuestas a partir del estado real de tus recursos en Floci, multiplicado por la instantánea de precios incluida del servicio Pricing. Esto significa que si creas una tabla DynamoDB o lanzas una instancia EC2 y luego consultas `GetCostAndUsage`, verás ese recurso reflejado en el desglose de costo — y si lo eliminas, tu próxima consulta lo refleja también. Cada servicio de Floci que quiere participar en este reporte de costos implementa un pequeño componente (`ResourceUsageEnumerator`) que describe qué tiene actualmente en uso; los servicios sin un modelo de precio específico simplemente aparecen en el catálogo con cantidad cero, visibles pero sin costo asociado.

Puedes agrupar y filtrar exactamente como en AWS real: por servicio, por tipo de recurso, por rango de fechas y granularidad (diaria, mensual). Lo que todavía no está implementado son las funcionalidades más avanzadas — previsión de costos futuros, recomendaciones de dimensionamiento, o el cálculo completo de utilización de instancias reservadas y planes de ahorro, que devuelven estructuras vacías o en cero.

**Analogía:** Cost Explorer en Floci es como un contador que revisa exactamente qué máquinas tienes encendidas en tu taller ahora mismo y te dice cuánto costarían según la tarifa de mercado, en vez de mostrarte una factura ficticia desconectada de lo que realmente tienes funcionando.

**¿Por qué es importante?** Practicar la lectura de reportes de costo agrupados por servicio y dimensión —la habilidad central de FinOps— sin el riesgo de generar una factura real mientras aprendes es exactamente el tipo de práctica segura que un emulador local debe ofrecer.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-29/tema-1-cost-explorer.sh — ejecutar con: bash tema-1-cost-explorer.sh
aws s3 mb s3://demo-costo-antes 2>/dev/null
aws ce get-cost-and-usage --time-period Start=2026-01-01,End=2026-02-01 \
  --granularity MONTHLY --metrics UnblendedCost --group-by Type=DIMENSION,Key=SERVICE
```

**Resultado esperado:** el desglose incluye `S3` con un costo distinto de cero, reflejando el bucket que acabas de crear — la prueba de que Cost Explorer sintetiza sobre tu estado real, no sobre datos inventados.

**Modifica esto:** elimina el bucket con `aws s3 rb s3://demo-costo-antes` y vuelve a consultar `get-cost-and-usage`: confirma que el costo de S3 cambia en la siguiente consulta.

**Cuándo no usarlo:** no uses estos números para decisiones de presupuesto reales; son sintéticos a partir de una instantánea de precios mínima, no una factura real de AWS.

**Cómo crece tu proyecto:** este reporte te permite estimar, mientras desarrollas, cuánto costaría en AWS real la infraestructura que el proyecto va acumulando módulo a módulo.

### Tema 2: Pricing — catálogo de tarifas de referencia

#### Paso 1 · Objetivo y preparación
Al finalizar podrás consultar precios desde cero. Prerrequisitos: Node.js y AWS CLI; verifica `node --version`.
#### Paso 2 · Contexto y caso real
Una decisión técnica necesita precio por región, servicio y configuración.
#### Paso 3 · Teoría, modelo mental y analogía
La API de precios es catálogo con filtros y vigencia.
#### Paso 4 · Demostración guiada
Crea `src/pricing.js` desde una carpeta vacía.
```bash
mkdir ejemplo-precios
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: filtra dimensión inexistente para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Compara dos regiones.
#### Paso 7 · Cierre y evidencia
Entrega filtros, salida, fallo y corrección; explica el resultado. Siguiente paso: exportación. Errores comunes: precio sin unidad y moneda incorrecta. Fuente oficial: https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/price-changes.html.
**Conceptos clave:** `GetProducts`, `DescribeServices`, instantánea de precios.

El servicio Pricing es el catálogo de tarifas del que Cost Explorer obtiene sus números: `DescribeServices` lista qué servicios tienen precios catalogados y qué atributos puedes consultar sobre ellos (por ejemplo, tipo de instancia o región), y `GetProducts` devuelve las ofertas de producto que coinciden con los filtros que apliques. La instantánea incluida en Floci es intencionalmente mínima —EC2, S3 y Lambda para `us-east-1`, con un puñado de tipos de instancia representativos— suficiente para ejercitar el análisis del formato de respuesta y la lógica de filtrado de tu código, no una base de datos de precios exhaustiva. Si necesitas cobertura más amplia, puedes apuntar Floci a tu propia instantánea de precios con `FLOCI_SERVICES_PRICING_SNAPSHOT_PATH`.

Un detalle de formato importante: AWS devuelve `GetProducts` como un arreglo de strings, donde cada string es en realidad un objeto JSON serializado que tienes que volver a parsear — un patrón algo inusual de la API real que Floci replica fielmente para que tu código de parseo funcione idéntico contra ambos.

**Analogía:** la instantánea de precios incluida es como una lista de precios de referencia de los productos más comunes de una tienda, útil para hacer cálculos aproximados rápidos, sin pretender ser el catálogo completo de cada variante y promoción disponible.

**¿Por qué es importante?** Entender que Pricing es deliberadamente una instantánea mínima —no un espejo completo y actualizado de las tarifas reales de AWS— evita que confíes en sus números para decisiones de presupuesto reales: para eso, siempre consulta la API de Pricing contra AWS real o la consola de precios oficial.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-29/tema-2-pricing.sh — ejecutar con: bash tema-2-pricing.sh
aws pricing describe-services --service-code AmazonEC2
aws pricing get-products --service-code AmazonEC2 \
  --filters 'Type=TERM_MATCH,Field=instanceType,Value=t3.micro' 'Type=TERM_MATCH,Field=regionCode,Value=us-east-1' \
  --query 'PriceList[0]' --output text
```

**Resultado esperado:** `describe-services` confirma qué atributos son filtrables para EC2; `get-products` devuelve un string que es en realidad JSON serializado — cópialo y pásalo por `python -m json.tool` para confirmarlo.

**Modifica esto:** repite la consulta cambiando `instanceType` a un valor que no existe en la instantánea (por ejemplo `x9.enorme`) y confirma que `PriceList` vuelve vacío en vez de fallar con error.

**Cuándo no usarlo:** no confíes en este catálogo para cotizar un presupuesto real; solo cubre EC2, S3 y Lambda en `us-east-1` con tipos representativos, no el catálogo completo de AWS.

**Cómo crece tu proyecto:** este catálogo es la fuente que consulta el Tema 1 para sintetizar el costo estimado de la infraestructura del proyecto.

### Tema 3: BCM Data Exports — reportes de costo en formato estándar

#### Paso 1 · Objetivo y preparación
Al finalizar podrás exportar costes desde cero. Prerrequisitos: Node.js y AWS CLI; verifica `node --version`.
#### Paso 2 · Contexto y caso real
Finanzas necesita analizar datos fuera de la consola.
#### Paso 3 · Teoría, modelo mental y analogía
Exportar es preparar un libro contable en formato consultable y versionado.
#### Paso 4 · Demostración guiada
Crea `src/export.js` desde una carpeta vacía.
```bash
mkdir ejemplo-export
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: usa destino sin permiso para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Valida Parquet y esquema.
#### Paso 7 · Cierre y evidencia
Entrega exportación, salida, fallo y corrección; explica el resultado. Siguiente paso: tags. Errores comunes: exportar sin retención y no validar columnas. Fuente oficial: https://docs.aws.amazon.com/cur/latest/userguide/what-is-data-exports.html.
**Conceptos clave:** `CreateExport`, formato Parquet, esquema FOCUS, ciclo de vida de ejecución.

BCM Data Exports resuelve la necesidad de sacar tus datos de costo hacia un formato estándar que herramientas de analítica externas puedan consumir directamente: creas una exportación (`CreateExport`) especificando un destino S3 y un formato de salida —Parquet es el único formato de emisión implementado actualmente en Floci—, y el servicio genera archivos siguiendo el esquema FOCUS 1.2 (FinOps Open Cost and Usage Specification), un estándar de la industria para reportes de costo que no es exclusivo de AWS. Cada ejecución exitosa transiciona de `INITIATION_IN_PROCESS` a `DELIVERY_SUCCESS` (o `DELIVERY_FAILURE`), y produce un archivo Parquet real en tu bucket S3 mediante el mismo motor DuckDB sidecar (`floci-duck`) que ya conociste con Athena en el Módulo 19.

Un detalle importante: aunque le pasas una consulta SQL en `DataQuery.QueryStatement`, Floci no evalúa ese SQL —lo almacena fielmente para que tu código de infraestructura funcione sin cambios, pero la forma de salida real está determinada por el esquema FOCUS incluido, no por tu consulta personalizada.

**Analogía:** BCM Data Exports es como pedirle a tu contador que te entregue el reporte financiero siempre en el mismo formato estándar de la industria, en vez de un PDF con formato libre que cada quien interpreta distinto: la estandarización es lo que permite que herramientas externas lo procesen automáticamente sin adaptación caso por caso.

**¿Por qué es importante?** El esquema FOCUS es un estándar cada vez más adoptado en la industria de FinOps precisamente porque permite comparar costos entre proveedores de nube distintos con el mismo formato — practicar su generación aquí te familiariza con un formato que vas a encontrar en herramientas de análisis de costo reales.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-29/tema-3-bcm-export.sh — ejecutar con: bash tema-3-bcm-export.sh
aws s3 mb s3://demo-facturacion
aws bcm-data-exports create-export --export \
  '{"Name":"demo-reporte","DataQuery":{"QueryStatement":"SELECT * FROM COST_AND_USAGE_REPORT"},"DestinationConfigurations":{"S3Destination":{"S3Bucket":"demo-facturacion","S3Prefix":"focus","S3Region":"us-east-1","S3OutputConfigurations":{"Format":"PARQUET","Compression":"PARQUET","OutputType":"CUSTOM","Overwrite":"OVERWRITE_REPORT"}}},"RefreshCadence":{"Frequency":"SYNCHRONOUS"}}'
aws s3 ls s3://demo-facturacion/focus/ --recursive
```

**Resultado esperado:** `create-export` devuelve un `ExportArn`; `s3 ls` muestra un archivo `.parquet` real generado por el motor DuckDB sidecar, siguiendo el esquema FOCUS 1.2.

**Modifica esto:** cambia `"Format"` a `"CSV"` y confirma que `create-export` falla con `ValidationException` — solo Parquet está implementado en Floci hoy.

**Cuándo no usarlo:** no esperes que el `QueryStatement` que pasaste filtre el contenido del reporte; Floci lo almacena pero no lo evalúa, la salida siempre sigue el esquema FOCUS completo.

**Cómo crece tu proyecto:** este export es el que El proyecto enviaría a una herramienta externa de FinOps para comparar su costo en AWS, Azure y GCP con el mismo formato estándar.

### Tema 4: Resource Groups Tagging API — descubrimiento centralizado por etiqueta

#### Paso 1 · Objetivo y preparación
Al finalizar podrás etiquetar recursos desde cero. Prerrequisitos: Node.js y AWS CLI; verifica `node --version`.
#### Paso 2 · Contexto y caso real
Los costes deben atribuirse a producto, equipo y ambiente.
#### Paso 3 · Teoría, modelo mental y analogía
Un tag es etiqueta contable que conecta recurso y responsable.
#### Paso 4 · Demostración guiada
Crea `src/tags.js` desde una carpeta vacía.
```bash
mkdir ejemplo-tags
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: etiqueta ARN inválido para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Define política obligatoria y excepción.
#### Paso 7 · Cierre y evidencia
Entrega tags, salida, fallo y corrección; explica el resultado. Siguiente paso: identidad. Errores comunes: claves inconsistentes y tags ausentes en recursos nuevos. Fuente oficial: https://docs.aws.amazon.com/resourcegroupstagging/latest/APIReference/Welcome.html.
**Conceptos clave:** `TagResources`, `GetResources`, filtro de tipo de recurso, ARN arbitrario.

Ya has etiquetado recursos individualmente en varios módulos de este curso — un bucket S3 aquí, una tabla DynamoDB allá. Resource Groups Tagging API resuelve el problema de descubrir todos tus recursos etiquetados de una forma específica, sin importar a qué servicio pertenecen, con una sola consulta: `GetResources` con un filtro como `Key=Environment,Values=dev` te devuelve una lista de ARNs de cualquier servicio —Lambda, EC2, S3, lo que sea— que tenga esa etiqueta, algo que de otra forma requeriría consultar cada servicio por separado y cruzar los resultados tú mismo.

El servicio acepta ARNs de recursos completamente arbitrarios —no valida que el recurso exista realmente en otro servicio emulado antes de aceptar sus etiquetas—, lo que lo hace útil incluso para etiquetar conceptualmente recursos que gestionas fuera de Floci. `GetTagKeys` y `GetTagValues` te permiten además descubrir qué claves y valores de etiqueta existen actualmente en tu cuenta, útil para auditar consistencia de tu esquema de etiquetado (¿todo el mundo usa `Environment` o algunos usan `env`?).

**Analogía:** Resource Groups Tagging API es como un sistema de búsqueda universal en un edificio de oficinas que te permite preguntar "muéstrame todo lo etiquetado como 'urgente'", sin importar si está en el departamento de finanzas, recursos humanos o logística — una sola pregunta que cruza todos los departamentos a la vez.

**¿Por qué es importante?** A medida que una cuenta crece a decenas o cientos de recursos repartidos entre múltiples servicios, tener una forma centralizada de descubrimiento por etiqueta —en vez de recordar consultar cada servicio individualmente— es lo que hace posible auditorías de costo, seguridad o cumplimiento a escala.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-29/tema-4-tagging.sh — ejecutar con: bash tema-4-tagging.sh
aws resourcegroupstaggingapi tag-resources \
  --resource-arn-list arn:aws:s3:::demo-facturacion --tags Proyecto=demo
aws resourcegroupstaggingapi tag-resources \
  --resource-arn-list arn:aws:dynamodb:us-east-1:000000000000:table/demo-entregas --tags Proyecto=demo
aws resourcegroupstaggingapi get-resources --tag-filters Key=Proyecto,Values=demo
```

**Resultado esperado:** `get-resources` devuelve ambos ARNs —el del bucket S3 y el de la tabla DynamoDB— en una sola respuesta, aunque pertenecen a servicios completamente distintos.

**Modifica esto:** usa `get-tag-keys` y `get-tag-values` para auditar qué claves y valores de etiqueta existen en tu cuenta, y confirma que `Proyecto`/`demo` aparece en ambos listados.

**Cuándo no usarlo:** no confíes en `tag-resources` para validar que el recurso existe realmente; acepta ARNs arbitrarios sin verificar el servicio referenciado.

**Cómo crece tu proyecto:** esta etiqueta común permite auditar de un vistazo todos los recursos que pertenecen al proyecto integrador, sin importar el servicio.

### Tema 5: STS en profundidad — identidad temporal y aislamiento multi-cuenta

#### Paso 1 · Objetivo y preparación
Al finalizar podrás verificar identidad de cuenta desde cero. Prerrequisitos: Node.js y AWS CLI; verifica `node --version`.
#### Paso 2 · Contexto y caso real
Un despliegue debe confirmar que opera en la cuenta correcta.
#### Paso 3 · Teoría, modelo mental y analogía
GetCallerIdentity es mostrar credencial; AssumeRole es cambiar de pase.
#### Paso 4 · Demostración guiada
Crea `src/account.js` desde una carpeta vacía.
```bash
mkdir ejemplo-cuenta
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: asume rol sin permiso para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Registra cuenta, región y rol activo.
#### Paso 7 · Cierre y evidencia
Entrega identidad, salida, fallo y corrección; explica el resultado. Siguiente paso: gobierno. Errores comunes: operar cuenta equivocada y no validar región. Fuente oficial: https://docs.aws.amazon.com/cli/latest/reference/sts/get-caller-identity.html.
**Conceptos clave:** `GetCallerIdentity`, `AssumeRole`, resolución de cuenta por AKID de 12 dígitos.

Ya usaste STS de forma implícita en el Módulo 7 al hablar de roles IAM, pero vale la pena profundizar en su rol central: `GetCallerIdentity` es la forma más simple y confiable de verificar que tus credenciales funcionan contra un endpoint —AWS real o Floci— antes de ejecutar lógica más compleja, y por eso es una verificación de humo (smoke test) tan común al inicio de pipelines de CI. `AssumeRole` es el mecanismo central para obtener credenciales temporales con permisos distintos a los tuyos —el patrón que ya usaste para dar permisos a instancias EC2 vía IMDS en el Módulo 21—, y Floci también soporta `AssumeRoleWithWebIdentity` (para flujos OIDC) y `AssumeRoleWithSAML` (para federación empresarial).

Recordarás del Módulo 0 que Floci resuelve el ID de cuenta a partir del `AWS_ACCESS_KEY_ID`: si tiene exactamente 12 dígitos, Floci lo usa directamente como cuenta; de lo contrario, cae al `FLOCI_DEFAULT_ACCOUNT_ID` (`000000000000` por defecto). Lo que quizás no viste en detalle es que las credenciales temporales generadas por `AssumeRole` se resuelven correctamente en esta misma cadena: si asumes un rol en la "cuenta" `222222222222`, los recursos que crees con esas credenciales temporales quedan aislados de los de la cuenta `111111111111`, replicando fielmente el aislamiento multi-cuenta de AWS real — el mismo patrón "assume-role-then-provision" que usarías en una organización AWS real con múltiples cuentas.

**Analogía:** `AssumeRole` es como un guardia de seguridad que te entrega una credencial temporal con un nivel de acceso distinto al tuyo habitual —válida solo por un tiempo limitado— después de verificar que tienes permiso para solicitarla, en vez de darte una llave maestra permanente que tendrías que recordar devolver.

**¿Por qué es importante?** El patrón de credenciales temporales con alcance limitado en vez de credenciales permanentes de amplio alcance es el principio de seguridad más importante de todo este curso, y STS es el servicio que lo hace posible en cada rincón de AWS: desde instancias EC2 hasta pipelines de CI/CD multi-cuenta.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-29/tema-5-sts.sh — ejecutar con: bash tema-5-sts.sh
aws sts get-caller-identity
AWS_ACCESS_KEY_ID=222222222222 AWS_SECRET_ACCESS_KEY=test \
  aws sts get-caller-identity --query 'Account' --output text
```

**Resultado esperado:** la primera llamada confirma tu cuenta actual (por defecto `000000000000`); la segunda, con un `AWS_ACCESS_KEY_ID` de 12 dígitos distinto, devuelve `222222222222` — la prueba de que Floci resuelve la cuenta directamente desde ese identificador.

**Modifica esto:** crea un bucket S3 con las credenciales de la cuenta `222222222222` y confirma que no aparece al listar buckets con las credenciales de la cuenta por defecto — el aislamiento multi-cuenta es real, no cosmético.

**Cuándo no usarlo:** no uses `GetCallerIdentity` como sustituto de una prueba de permisos real; confirma que las credenciales son válidas, no que tienen permiso para la acción específica que vas a ejecutar después.

**Cómo crece tu proyecto:** este patrón de aislamiento por cuenta es el que El proyecto usaría para separar completamente el entorno de staging del de producción dentro del mismo Floci.

---


## Laboratorio práctico

> Este laboratorio asume que ya ejecutaste `floci start` y `eval $(floci env)` (Módulo 1) en tu sesión de terminal, así que los comandos de `aws` no repiten `--endpoint-url`.

**Objetivo del laboratorio:** consultar el costo sintetizado de tus recursos actuales en Floci y exportarlo en formato FOCUS/Parquet, y luego etiquetar recursos de al menos dos servicios distintos y descubrirlos todos con una sola consulta de Resource Groups Tagging API.

**Requisitos previos:** al menos un bucket S3 y una tabla DynamoDB de módulos anteriores, y un bucket adicional para recibir la exportación de BCM Data Exports.

### Laboratorio 29.1 — Costo sintetizado y exportación FOCUS

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Consulta el costo agrupado por servicio | `aws ce get-cost-and-usage --time-period Start=2026-01-01,End=2026-02-01 --granularity MONTHLY --metrics UnblendedCost --group-by Type=DIMENSION,Key=SERVICE` | Refleja el costo sintetizado de tus recursos actuales | Un desglose con al menos S3 y DynamoDB si los tienes creados |
| 2 | Consulta el catálogo de precios de EC2 | `aws pricing get-products --service-code AmazonEC2 --filters 'Type=TERM_MATCH,Field=instanceType,Value=t3.micro' 'Type=TERM_MATCH,Field=regionCode,Value=us-east-1'` | Confirma la fuente de tarifas que usa Cost Explorer | Un `PriceList` con al menos una oferta de producto |
| 3 | Crea el bucket de exportación | `aws s3 mb s3://mi-facturacion` | Destino de la exportación FOCUS | Confirmación de creación |
| 4 | Crea la exportación | `aws bcm-data-exports create-export --export '{"Name":"reporte-mensual","DataQuery":{"QueryStatement":"SELECT * FROM COST_AND_USAGE_REPORT"},"DestinationConfigurations":{"S3Destination":{"S3Bucket":"mi-facturacion","S3Prefix":"focus","S3Region":"us-east-1","S3OutputConfigurations":{"Format":"PARQUET","Compression":"PARQUET","OutputType":"CUSTOM","Overwrite":"OVERWRITE_REPORT"}}},"RefreshCadence":{"Frequency":"SYNCHRONOUS"}}'` | Genera el reporte en formato FOCUS/Parquet de inmediato | Un `ExportArn` |
| 5 | Verifica el archivo generado | `aws s3 ls s3://mi-facturacion/focus/ --recursive` | Confirma que el Parquet real se escribió | Un archivo `.parquet` |

### Laboratorio 29.2 — Descubrimiento centralizado por etiqueta

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Etiqueta tu bucket S3 | `aws resourcegroupstaggingapi tag-resources --resource-arn-list arn:aws:s3:::curso-cloud-local --tags Proyecto=academia` | Añade una etiqueta común a un recurso S3 | `FailedResourcesMap` vacío |
| 2 | Etiqueta tu tabla DynamoDB | `aws resourcegroupstaggingapi tag-resources --resource-arn-list arn:aws:dynamodb:us-east-1:000000000000:table/mi-tabla --tags Proyecto=academia` | La misma etiqueta en un servicio completamente distinto | `FailedResourcesMap` vacío |
| 3 | Descubre ambos con una sola consulta | `aws resourcegroupstaggingapi get-resources --tag-filters Key=Proyecto,Values=academia` | Cruza servicios sin consultarlos por separado | Ambos ARNs (S3 y DynamoDB) en la respuesta |
| 4 | Verifica tu identidad de llamada | `aws sts get-caller-identity` | Confirma cuenta, usuario y ARN actuales | Tu `Account`, `UserId` y `Arn` |

**Verificación:** el laboratorio se considera exitoso si `s3 ls` confirma un archivo `.parquet` real generado por la exportación FOCUS, y si `get-resources` con el filtro `Proyecto=academia` devuelve tanto el ARN de tu bucket S3 como el de tu tabla DynamoDB en una sola respuesta, confirmando el descubrimiento cruzado entre servicios.

**Errores comunes y soluciones**

- **`get-cost-and-usage` devuelve costos en cero para un servicio que sí tienes en uso.** Revisa el Tema 1: solo los servicios con un enumerador de precio implementado (EC2, S3, Lambda) generan costo real; el resto aparece en el catálogo con cantidad cero — comportamiento esperado, no un error.
- **`create-export` falla con `ValidationException` en el formato.** Revisa que uses exactamente `"Format": "PARQUET"` y `"Compression": "PARQUET"`; CSV y GZIP todavía no están implementados en Floci.
- **`get-resources` no encuentra un recurso recién etiquetado.** Confirma que el ARN usado en `tag-resources` coincide exactamente —carácter por carácter, incluyendo la región y cuenta— con el que aparecería en `get-resources`; un ARN mal formado se acepta pero no se cruza correctamente.
- **`assume-role` con un AKID que no tiene 12 dígitos no aísla la cuenta esperada.** Revisa el Tema 5: solo un `AWS_ACCESS_KEY_ID` de exactamente 12 dígitos se usa directamente como ID de cuenta; cualquier otro formato cae al `FLOCI_DEFAULT_ACCOUNT_ID`.

---
