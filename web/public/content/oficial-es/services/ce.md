# Explorador de costos (`ce:*`)

**Protocolo:** JSON 1.1
**Encabezado:** `X-Amz-Target: AWSInsightsIndexService.<Action>`
**Prefijo de punto final:** `ce`

Floci sintetiza las respuestas de Cost Explorer a partir de su propio estado de recursos,
multiplicado por la instantánea de precios AWS incluida proporcionada por
[Servicio de precios](pricing.md). Los costos reflejan lo que se está ejecutando en Floci en este momento,
entonces, cualquier prueba que mute recursos (por ejemplo, crea un depósito, ejecuta una instancia)
ve esos cambios en la próxima llamada `GetCostAndUsage`.

## Operaciones compatibles

| Operación | Notas |
|-----------|---------------|
| `GetCostAndUsage` | Soporte completo para `TimePeriod` / `Granularity` / `Filter` / `GroupBy` / `Metrics` |
| `GetCostAndUsageWithResources` | Misma forma que `GetCostAndUsage`; para desglose a nivel de recursos, grupo por `Type=DIMENSION,Key=RESOURCE_ID` |
| `GetDimensionValues` | Devuelve valores de dimensión presentes en el conjunto de datos sintetizados |
| `GetTags` | Devuelve claves/valores de etiquetas en los recursos enumerados |
| `GetReservationCoverage` | Stub: devuelve totales puestos a cero; matemáticas completas de RI aterrizan en un PR de seguimiento |
| `GetReservationUtilization` | Stub: devuelve totales puestos a cero |
| `GetSavingsPlansCoverage` | Stub: devuelve una lista vacía |
| `GetSavingsPlansUtilization` | Stub: devuelve totales puestos a cero |
| `GetCostCategories` | Stub: devuelve una lista vacía (la gestión de categorías de costos aún no se ha emulado) |

## Modelo de síntesis de costos

Cada servicio Floci que desee participar en los informes de costos envía un
{@code @ApplicationScoped} bean implementando `ResourceUsageEnumerator`
(en `core/common/`). Cost Explorer los descubre automáticamente a través de CDI y agrega un nuevo
El servicio con datos de costos no necesita cambios en `CostExplorerService`.

Los enumeradores incluidos cubren:

| Servicio | Unidad de precio | Fuente |
|---------|-------------|--------|
| `AmazonEC2` | `BoxUsage:<instanceType>` × horas | `Ec2Service.describeInstances` |
| `AmazonS3` | `TimedStorage-Standard` × GB-mes | `S3Service.listBuckets` + `listObjects` |
| `AWSLambda` | `AWS-Lambda-Requests` (cantidad cero, solo catálogo) | `LambdaService.listFunctions` |
| Otros servicios Floci (DDB, SQS, SNS, …) | Sólo catálogo, cantidad cero | `UnpricedServicesEnumerator` |

Los servicios sin precio emiten filas de catálogo de cantidad cero para que permanezcan visibles en
Respuestas `GetDimensionValues SERVICE` sin aportar coste facturado.

## Semántica de `RECORD_TYPE`

`GROUP_BY=RECORD_TYPE` distingue:

| Tipo de registro | Cuando se emite |
|-------------|--------------|
| `Usage` | Todas las filas de uso sintetizadas (siempre presentes) |
| `Credit` | Cuando `FLOCI_SERVICES_CE_CREDIT_USD_MONTHLY > 0` (ver más abajo) |
| `Tax` / `Refund` / `DiscountedUsage` / `SavingsPlan*` | Reservado para futuros RP; no emitido actualmente |

### Inyección de crédito sintético

Configure `FLOCI_SERVICES_CE_CREDIT_USD_MONTHLY` (predeterminado `0.0`) para emitir un mensaje mensual
Fila `Credit` que compensa `min(creditUsd, monthly Usage cost)`. Útil para
ejercitar cualquier ruta de código que calcule el costo neto (uso bruto - créditos) sin
tener que construir mecanismos de crédito a mano.

```yaml
floci:
  services:
    ce:
      credit-usd-monthly: 100.0
```

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_CE_ENABLED` | `true` | Activar o desactivar el servicio |
| `FLOCI_SERVICES_CE_CREDIT_USD_MONTHLY` | `0.0` | Crédito mensual sintético, aplicado como una fila `Credit` `RECORD_TYPE` |

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test

aws ce get-cost-and-usage \
  --time-period Start=2026-01-01,End=2026-02-01 \
  --granularity MONTHLY \
  --metrics UnblendedCost \
  --group-by Type=DIMENSION,Key=SERVICE

aws ce get-dimension-values \
  --time-period Start=2026-01-01,End=2026-02-01 \
  --dimension SERVICE
```

```python
import boto3

ce = boto3.client(
    "ce",
    endpoint_url="http://localhost:4566",
    region_name="us-east-1",
)

resp = ce.get_cost_and_usage(
    TimePeriod={"Start": "2026-01-01", "End": "2026-02-01"},
    Granularity="MONTHLY",
    Metrics=["UnblendedCost"],
    GroupBy=[{"Type": "DIMENSION", "Key": "SERVICE"}],
    Filter={
        "Not": {"Dimensions": {"Key": "SERVICE", "Values": ["AmazonRDS"]}}
    },
)
for result in resp["ResultsByTime"]:
    for group in result["Groups"]:
        print(group["Keys"], group["Metrics"]["UnblendedCost"]["Amount"])
```

## Fuera de alcance

- Previsión (`GetCostForecast`, `GetUsageForecast`).
- Recomendaciones de tallaje adecuado (`GetRightsizingRecommendation`).
- Gestión de detección de anomalías (`GetAnomalies`, `*AnomalyMonitor`, `*AnomalySubscription`): relaciones públicas independientes planificadas según el n.º 791.
- Cálculos de utilización de reservas reales/plan de ahorros: talones actualmente en cero.
- Gestión de categorías de costos (`CreateCostCategoryDefinition` / `*Definition` / `ListCostCategoryDefinitions`).
- Granularidad a nivel de recursos más allá de lo que `GetCostAndUsageWithResources` expone hoy.
