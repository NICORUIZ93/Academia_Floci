# Módulo 29: FinOps y gobierno de cuenta — Cost Explorer, Pricing, BCM Data Exports, Resource Groups Tagging y STS

## Sílabo

**Objetivo general**

Cerrar el círculo de la operación responsable de una cuenta AWS con las herramientas de FinOps (entender y controlar el costo) y de gobierno transversal (identidad temporal y descubrimiento de recursos por etiqueta) que complementan todo lo que ya construiste en módulos anteriores: Cost Explorer para ver qué está costando tu propio uso de Floci, Pricing para consultar tarifas de referencia, BCM Data Exports para exportar reportes de costo en formato estándar, Resource Groups Tagging API para descubrir recursos por etiqueta sin importar el servicio, y STS para profundizar en credenciales temporales.

**Objetivos específicos**

1. Consultar el costo sintetizado de tus propios recursos Floci con Cost Explorer.
2. Consultar el catálogo de precios estático de Pricing y entender sus límites.
3. Crear una exportación de datos de facturación con BCM Data Exports y explicar su formato de salida.
4. Etiquetar recursos de distintos servicios y descubrirlos todos con una sola consulta de Resource Groups Tagging API.
5. Usar STS para asumir un rol y explicar la cadena de resolución de cuenta que Floci aplica.

**Contenido**

- Cost Explorer: síntesis de costos a partir del estado real de tus recursos.
- Pricing: catálogo de precios estático incluido.
- BCM Data Exports: exportaciones CUR/FOCUS en Parquet.
- Resource Groups Tagging API: descubrimiento centralizado por etiqueta.
- STS: `AssumeRole`, `GetCallerIdentity` y aislamiento multi-cuenta.

**Evaluación**

Dos laboratorios prácticos (consultar costo sintetizado y exportarlo, y descubrir recursos etiquetados entre servicios) y tres ejercicios de evaluación.

---

## Aprende construyendo

### Tema 1: Cost Explorer — costos sintetizados a partir de tu estado real

**Conceptos clave:** `GetCostAndUsage`, enumerador de uso de recursos, agrupación por dimensión.

Cost Explorer en Floci no factura dinero real —obviamente, no hay tarjeta de crédito involucrada—, pero tampoco devuelve números inventados al azar: sintetiza sus respuestas a partir del estado real de tus recursos en Floci, multiplicado por la instantánea de precios incluida del servicio Pricing. Esto significa que si creas una tabla DynamoDB o lanzas una instancia EC2 y luego consultas `GetCostAndUsage`, verás ese recurso reflejado en el desglose de costo — y si lo eliminas, tu próxima consulta lo refleja también. Cada servicio de Floci que quiere participar en este reporte de costos implementa un pequeño componente (`ResourceUsageEnumerator`) que describe qué tiene actualmente en uso; los servicios sin un modelo de precio específico simplemente aparecen en el catálogo con cantidad cero, visibles pero sin costo asociado.

Puedes agrupar y filtrar exactamente como en AWS real: por servicio, por tipo de recurso, por rango de fechas y granularidad (diaria, mensual). Lo que todavía no está implementado son las funcionalidades más avanzadas — previsión de costos futuros, recomendaciones de dimensionamiento, o el cálculo completo de utilización de instancias reservadas y planes de ahorro, que devuelven estructuras vacías o en cero.

**Analogía:** Cost Explorer en Floci es como un contador que revisa exactamente qué máquinas tienes encendidas en tu taller ahora mismo y te dice cuánto costarían según la tarifa de mercado, en vez de mostrarte una factura ficticia desconectada de lo que realmente tienes funcionando.

**¿Por qué es importante?** Practicar la lectura de reportes de costo agrupados por servicio y dimensión —la habilidad central de FinOps— sin el riesgo de generar una factura real mientras aprendes es exactamente el tipo de práctica segura que un emulador local debe ofrecer.

### Tema 2: Pricing — catálogo de tarifas de referencia

**Conceptos clave:** `GetProducts`, `DescribeServices`, instantánea de precios.

El servicio Pricing es el catálogo de tarifas del que Cost Explorer obtiene sus números: `DescribeServices` lista qué servicios tienen precios catalogados y qué atributos puedes consultar sobre ellos (por ejemplo, tipo de instancia o región), y `GetProducts` devuelve las ofertas de producto que coinciden con los filtros que apliques. La instantánea incluida en Floci es intencionalmente mínima —EC2, S3 y Lambda para `us-east-1`, con un puñado de tipos de instancia representativos— suficiente para ejercitar el análisis del formato de respuesta y la lógica de filtrado de tu código, no una base de datos de precios exhaustiva. Si necesitas cobertura más amplia, puedes apuntar Floci a tu propia instantánea de precios con `FLOCI_SERVICES_PRICING_SNAPSHOT_PATH`.

Un detalle de formato importante: AWS devuelve `GetProducts` como un arreglo de strings, donde cada string es en realidad un objeto JSON serializado que tienes que volver a parsear — un patrón algo inusual de la API real que Floci replica fielmente para que tu código de parseo funcione idéntico contra ambos.

**Analogía:** la instantánea de precios incluida es como una lista de precios de referencia de los productos más comunes de una tienda, útil para hacer cálculos aproximados rápidos, sin pretender ser el catálogo completo de cada variante y promoción disponible.

**¿Por qué es importante?** Entender que Pricing es deliberadamente una instantánea mínima —no un espejo completo y actualizado de las tarifas reales de AWS— evita que confíes en sus números para decisiones de presupuesto reales: para eso, siempre consulta la API de Pricing contra AWS real o la consola de precios oficial.

### Tema 3: BCM Data Exports — reportes de costo en formato estándar

**Conceptos clave:** `CreateExport`, formato Parquet, esquema FOCUS, ciclo de vida de ejecución.

BCM Data Exports resuelve la necesidad de sacar tus datos de costo hacia un formato estándar que herramientas de analítica externas puedan consumir directamente: creas una exportación (`CreateExport`) especificando un destino S3 y un formato de salida —Parquet es el único formato de emisión implementado actualmente en Floci—, y el servicio genera archivos siguiendo el esquema FOCUS 1.2 (FinOps Open Cost and Usage Specification), un estándar de la industria para reportes de costo que no es exclusivo de AWS. Cada ejecución exitosa transiciona de `INITIATION_IN_PROCESS` a `DELIVERY_SUCCESS` (o `DELIVERY_FAILURE`), y produce un archivo Parquet real en tu bucket S3 mediante el mismo motor DuckDB sidecar (`floci-duck`) que ya conociste con Athena en el Módulo 19.

Un detalle importante: aunque le pasas una consulta SQL en `DataQuery.QueryStatement`, Floci no evalúa ese SQL —lo almacena fielmente para que tu código de infraestructura funcione sin cambios, pero la forma de salida real está determinada por el esquema FOCUS incluido, no por tu consulta personalizada.

**Analogía:** BCM Data Exports es como pedirle a tu contador que te entregue el reporte financiero siempre en el mismo formato estándar de la industria, en vez de un PDF con formato libre que cada quien interpreta distinto: la estandarización es lo que permite que herramientas externas lo procesen automáticamente sin adaptación caso por caso.

**¿Por qué es importante?** El esquema FOCUS es un estándar cada vez más adoptado en la industria de FinOps precisamente porque permite comparar costos entre proveedores de nube distintos con el mismo formato — practicar su generación aquí te familiariza con un formato que vas a encontrar en herramientas de análisis de costo reales.

### Tema 4: Resource Groups Tagging API — descubrimiento centralizado por etiqueta

**Conceptos clave:** `TagResources`, `GetResources`, filtro de tipo de recurso, ARN arbitrario.

Ya has etiquetado recursos individualmente en varios módulos de este curso — un bucket S3 aquí, una tabla DynamoDB allá. Resource Groups Tagging API resuelve el problema de descubrir todos tus recursos etiquetados de una forma específica, sin importar a qué servicio pertenecen, con una sola consulta: `GetResources` con un filtro como `Key=Environment,Values=dev` te devuelve una lista de ARNs de cualquier servicio —Lambda, EC2, S3, lo que sea— que tenga esa etiqueta, algo que de otra forma requeriría consultar cada servicio por separado y cruzar los resultados tú mismo.

El servicio acepta ARNs de recursos completamente arbitrarios —no valida que el recurso exista realmente en otro servicio emulado antes de aceptar sus etiquetas—, lo que lo hace útil incluso para etiquetar conceptualmente recursos que gestionas fuera de Floci. `GetTagKeys` y `GetTagValues` te permiten además descubrir qué claves y valores de etiqueta existen actualmente en tu cuenta, útil para auditar consistencia de tu esquema de etiquetado (¿todo el mundo usa `Environment` o algunos usan `env`?).

**Analogía:** Resource Groups Tagging API es como un sistema de búsqueda universal en un edificio de oficinas que te permite preguntar "muéstrame todo lo etiquetado como 'urgente'", sin importar si está en el departamento de finanzas, recursos humanos o logística — una sola pregunta que cruza todos los departamentos a la vez.

**¿Por qué es importante?** A medida que una cuenta crece a decenas o cientos de recursos repartidos entre múltiples servicios, tener una forma centralizada de descubrimiento por etiqueta —en vez de recordar consultar cada servicio individualmente— es lo que hace posible auditorías de costo, seguridad o cumplimiento a escala.

### Tema 5: STS en profundidad — identidad temporal y aislamiento multi-cuenta

**Conceptos clave:** `GetCallerIdentity`, `AssumeRole`, resolución de cuenta por AKID de 12 dígitos.

Ya usaste STS de forma implícita en el Módulo 7 al hablar de roles IAM, pero vale la pena profundizar en su rol central: `GetCallerIdentity` es la forma más simple y confiable de verificar que tus credenciales funcionan contra un endpoint —AWS real o Floci— antes de ejecutar lógica más compleja, y por eso es una verificación de humo (smoke test) tan común al inicio de pipelines de CI. `AssumeRole` es el mecanismo central para obtener credenciales temporales con permisos distintos a los tuyos —el patrón que ya usaste para dar permisos a instancias EC2 vía IMDS en el Módulo 21—, y Floci también soporta `AssumeRoleWithWebIdentity` (para flujos OIDC) y `AssumeRoleWithSAML` (para federación empresarial).

Recordarás del Módulo 0 que Floci resuelve el ID de cuenta a partir del `AWS_ACCESS_KEY_ID`: si tiene exactamente 12 dígitos, Floci lo usa directamente como cuenta; de lo contrario, cae al `FLOCI_DEFAULT_ACCOUNT_ID` (`000000000000` por defecto). Lo que quizás no viste en detalle es que las credenciales temporales generadas por `AssumeRole` se resuelven correctamente en esta misma cadena: si asumes un rol en la "cuenta" `222222222222`, los recursos que crees con esas credenciales temporales quedan aislados de los de la cuenta `111111111111`, replicando fielmente el aislamiento multi-cuenta de AWS real — el mismo patrón "assume-role-then-provision" que usarías en una organización AWS real con múltiples cuentas.

**Analogía:** `AssumeRole` es como un guardia de seguridad que te entrega una credencial temporal con un nivel de acceso distinto al tuyo habitual —válida solo por un tiempo limitado— después de verificar que tienes permiso para solicitarla, en vez de darte una llave maestra permanente que tendrías que recordar devolver.

**¿Por qué es importante?** El patrón de credenciales temporales con alcance limitado en vez de credenciales permanentes de amplio alcance es el principio de seguridad más importante de todo este curso, y STS es el servicio que lo hace posible en cada rincón de AWS: desde instancias EC2 hasta pipelines de CI/CD multi-cuenta.

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



## Bibliografía y fundamento académico

Estas fuentes sustentan los conceptos y deben consultarse para verificar detalles que cambian entre versiones:

- AWS, Microsoft Azure y Google Cloud, marcos oficiales de arquitectura bien diseñada.
- NIST, *Cloud Computing Standards Roadmap* y *Secure Software Development Framework*.
- Beyer et al., *Site Reliability Engineering*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

```bash
aws ce get-cost-and-usage --endpoint-url http://localhost:4566 \
  --time-period Start=2026-07-01,End=2026-08-01 \
  --granularity MONTHLY --metrics UnblendedCost
```

Conserva periodo, moneda, filtros y etiquetas junto al resultado para que otra persona pueda reproducir el análisis FinOps.

En este módulo cerraste el círculo de la operación responsable de una cuenta AWS con cinco servicios de FinOps y gobierno transversal: Cost Explorer, que sintetiza costos reales a partir del estado actual de tus recursos; Pricing, el catálogo de tarifas de referencia que alimenta esos cálculos; BCM Data Exports, que estandariza tus reportes de costo en el formato FOCUS de la industria; Resource Groups Tagging API, que te permite descubrir recursos de cualquier servicio con una sola consulta por etiqueta; y STS, que profundizaste como el mecanismo central de identidad temporal y aislamiento multi-cuenta que sostiene la seguridad de todo lo demás que construiste en este curso.
