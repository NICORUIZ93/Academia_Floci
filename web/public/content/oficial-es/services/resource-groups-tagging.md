# Grupos de recursos Etiquetado API

**Protocolo:** JSON 1.1
**Encabezado:** `X-Amz-Target: ResourceGroupsTaggingAPI_20170126.<Action>`
**Prefijo de punto final:** `tagging`

Floci emula los grupos de recursos AWS que etiquetan API para pruebas locales que necesitan
Descubrimiento de etiquetas centralizado en ARN con forma de AWS. El servicio acepta arbitraria.
ARN de recursos, almacena sus etiquetas en proceso y admite el filtrado por ARN, etiqueta
filtros y filtros de tipo de recurso.

## Operaciones compatibles

| Operación | Notas |
|-----------|---------------|
| `TagResources` | Agrega o actualiza etiquetas para uno o más ARN de recursos |
| `UntagResources` | Elimina claves de etiquetas de uno o más ARN de recursos |
| `GetResources` | Enumera los recursos etiquetados, con ARN, etiquetas, tipos de recursos y filtros de paginación |
| `GetTagKeys` | Enumera distintas claves de etiquetas para la región actual |
| `GetTagValues` | Enumera valores distintos para una clave de etiqueta solicitada en la región actual |

`TagResources` y `UntagResources` devuelven un `FailedResourcesMap` vacío en
éxito. `GetResources`, `GetTagKeys` y `GetTagValues` admiten paginación
tokens para respuestas de varias páginas.

## Filtrado

`GetResources` admite los filtros comunes de etiquetado de grupos de recursos:

| Filtro | Comportamiento |
|--------|----------|
| `ResourceARNList` | Restringe los resultados a los ARN solicitados |
| `TagFilters` | Coincide con los recursos que tienen cada clave solicitada; los valores son opcionales |
| `ResourceTypeFilters` | Coincide con `service` o `service:resourceType`, como `lambda` o `ec2:instance` |
| `ResourcesPerPage` + `PaginationToken` | Páginas a través de asignaciones de recursos coincidentes |

El filtrado de regiones sigue la región ARN cuando está presente. ARN globales, como S3
Los ARN del depósito son visibles en todas las regiones porque su segmento de región ARN es
vacío.

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_TAGGING_ENABLED` | `true` | Habilite o deshabilite el servicio de etiquetado de grupos de recursos API |

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test

aws resourcegroupstaggingapi tag-resources \
  --resource-arn-list arn:aws:ec2:us-east-1:000000000000:instance/i-abc123 \
  --tags Environment=dev Team=platform

aws resourcegroupstaggingapi get-resources \
  --tag-filters Key=Environment,Values=dev

aws resourcegroupstaggingapi get-tag-keys

aws resourcegroupstaggingapi get-tag-values --key Environment

aws resourcegroupstaggingapi untag-resources \
  --resource-arn-list arn:aws:ec2:us-east-1:000000000000:instance/i-abc123 \
  --tag-keys Team
```

```python
import boto3

tagging = boto3.client(
    "resourcegroupstaggingapi",
    endpoint_url="http://localhost:4566",
    region_name="us-east-1",
)

arn = "arn:aws:lambda:us-east-1:000000000000:function/my-func"

tagging.tag_resources(
    ResourceARNList=[arn],
    Tags={"Environment": "dev", "Team": "platform"},
)

resources = tagging.get_resources(
    TagFilters=[{"Key": "Environment", "Values": ["dev"]}],
)
print(resources["ResourceTagMappingList"])
```

## Fuera de alcance

- Validación de que ya existe un ARN en otro servicio emulado.
- AWS Las organizaciones etiquetan la aplicación de políticas.
- Almacenamiento de etiquetas persistente durante los reinicios del proceso.
