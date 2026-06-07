# CloudFront

Emulación del plano de gestión CloudFront. Admite el ciclo de vida de distribución, políticas de caché, políticas de solicitud de origen, políticas de encabezados de respuesta, controles de acceso de origen, identidades de acceso de origen, funciones CloudFront, invalidaciones y etiquetado. La entrega de contenido real no se emula; se trata de una implementación únicamente del plano de gestión.

**Protocolo:** REST XML  
**Versión API:** `2020-05-31`  
**Prefijo de punto final:** `cloudfront`  
**Espacio de nombres:** `http://cloudfront.amazonaws.com/doc/2020-05-31/`  
**Servicio global**: los ARN no contienen ningún segmento de región.

## Operaciones compatibles

### Distribuciones

| Operación | Método | Camino |
|---|---|---|
| `CreateDistribution` | PUBLICAR | `/2020-05-31/distribution` |
| `CreateDistributionWithTags` | PUBLICAR | `/2020-05-31/distribution?WithTags` |
| `GetDistribution` | OBTENER | `/2020-05-31/distribution/{Id}` |
| `GetDistributionConfig` | OBTENER | `/2020-05-31/distribution/{Id}/config` |
| `UpdateDistribution` | PONER | `/2020-05-31/distribution/{Id}/config` |
| `DeleteDistribution` | BORRAR | `/2020-05-31/distribution/{Id}` |
| `ListDistributions` | OBTENER | `/2020-05-31/distribution` |
| `AssociateAlias` | PONER | `/2020-05-31/distribution/{TargetDistributionId}/associate-alias` |

### Invalidaciones

| Operación | Método | Camino |
|---|---|---|
| `CreateInvalidation` | PUBLICAR | `/2020-05-31/distribution/{Id}/invalidation` |
| `GetInvalidation` | OBTENER | `/2020-05-31/distribution/{Id}/invalidation/{InvId}` |
| `ListInvalidations` | OBTENER | `/2020-05-31/distribution/{Id}/invalidation` |

### Políticas de caché

| Operación | Método | Camino |
|---|---|---|
| `CreateCachePolicy` | PUBLICAR | `/2020-05-31/cache-policy` |
| `GetCachePolicy` | OBTENER | `/2020-05-31/cache-policy/{Id}` |
| `GetCachePolicyConfig` | OBTENER | `/2020-05-31/cache-policy/{Id}/config` |
| `UpdateCachePolicy` | PONER | `/2020-05-31/cache-policy/{Id}` |
| `DeleteCachePolicy` | BORRAR | `/2020-05-31/cache-policy/{Id}` |
| `ListCachePolicies` | OBTENER | `/2020-05-31/cache-policy` |

### Políticas de solicitud de origen

| Operación | Método | Camino |
|---|---|---|
| `CreateOriginRequestPolicy` | PUBLICAR | `/2020-05-31/origin-request-policy` |
| `GetOriginRequestPolicy` | OBTENER | `/2020-05-31/origin-request-policy/{Id}` |
| `GetOriginRequestPolicyConfig` | OBTENER | `/2020-05-31/origin-request-policy/{Id}/config` |
| `UpdateOriginRequestPolicy` | PONER | `/2020-05-31/origin-request-policy/{Id}` |
| `DeleteOriginRequestPolicy` | BORRAR | `/2020-05-31/origin-request-policy/{Id}` |
| `ListOriginRequestPolicies` | OBTENER | `/2020-05-31/origin-request-policy` |

### Políticas de encabezados de respuesta

| Operación | Método | Camino |
|---|---|---|
| `CreateResponseHeadersPolicy` | PUBLICAR | `/2020-05-31/response-headers-policy` |
| `GetResponseHeadersPolicy` | OBTENER | `/2020-05-31/response-headers-policy/{Id}` |
| `GetResponseHeadersPolicyConfig` | OBTENER | `/2020-05-31/response-headers-policy/{Id}/config` |
| `UpdateResponseHeadersPolicy` | PONER | `/2020-05-31/response-headers-policy/{Id}` |
| `DeleteResponseHeadersPolicy` | BORRAR | `/2020-05-31/response-headers-policy/{Id}` |
| `ListResponseHeadersPolicies` | OBTENER | `/2020-05-31/response-headers-policy` |

### Control de acceso de origen (OAC)

| Operación | Método | Camino |
|---|---|---|
| `CreateOriginAccessControl` | PUBLICAR | `/2020-05-31/origin-access-control` |
| `GetOriginAccessControl` | OBTENER | `/2020-05-31/origin-access-control/{Id}` |
| `GetOriginAccessControlConfig` | OBTENER | `/2020-05-31/origin-access-control/{Id}/config` |
| `UpdateOriginAccessControl` | PONER | `/2020-05-31/origin-access-control/{Id}` |
| `DeleteOriginAccessControl` | BORRAR | `/2020-05-31/origin-access-control/{Id}` |
| `ListOriginAccessControls` | OBTENER | `/2020-05-31/origin-access-control` |

### Identidad de acceso al origen (OAI: heredada)

| Operación | Método | Camino |
|---|---|---|
| `CreateCloudFrontOriginAccessIdentity` | PUBLICAR | `/2020-05-31/origin-access-identity/cloudfront` |
| `GetCloudFrontOriginAccessIdentity` | OBTENER | `/2020-05-31/origin-access-identity/cloudfront/{Id}` |
| `GetCloudFrontOriginAccessIdentityConfig` | OBTENER | `/2020-05-31/origin-access-identity/cloudfront/{Id}/config` |
| `UpdateCloudFrontOriginAccessIdentity` | PONER | `/2020-05-31/origin-access-identity/cloudfront/{Id}/config` |
| `DeleteCloudFrontOriginAccessIdentity` | BORRAR | `/2020-05-31/origin-access-identity/cloudfront/{Id}` |
| `ListCloudFrontOriginAccessIdentities` | OBTENER | `/2020-05-31/origin-access-identity/cloudfront` |

### Funciones de CloudFront

| Operación | Método | Camino |
|---|---|---|
| `CreateFunction` | PUBLICAR | `/2020-05-31/function` |
| `DescribeFunction` | OBTENER | `/2020-05-31/function/{Name}` |
| `UpdateFunction` | PONER | `/2020-05-31/function/{Name}` |
| `PublishFunction` | PUBLICAR | `/2020-05-31/function/{Name}/publish` |
| `DeleteFunction` | BORRAR | `/2020-05-31/function/{Name}` |
| `ListFunctions` | OBTENER | `/2020-05-31/function` |

### Etiquetado

| Operación | Método | Camino |
|---|---|---|
| `ListTagsForResource` | OBTENER | `/2020-05-31/tagging?Resource={arn}` |
| `TagResource` | PUBLICAR | `/2020-05-31/tagging?Operation=Tag&Resource={arn}` |
| `UntagResource` | PUBLICAR | `/2020-05-31/tagging?Operation=Untag&Resource={arn}` |

## Comportamiento de

- Todas las distribuciones se establecen inmediatamente en el estado `Deployed` (sin demora asincrónica de `InProgress`).
- Los ID de distribución tienen 14 caracteres alfanuméricos en mayúsculas que comienzan con `E` (por ejemplo, `E1Z2X3C4V5B6N7`).
- Los nombres de dominio de distribución siguen el patrón `{id}.cloudfront.net`.
- Los ARN son globales, sin segmento de región: `arn:aws:cloudfront::{accountId}:distribution/{id}`.
- Las invalidaciones se marcan inmediatamente como `Completed`.
- `DeleteDistribution` devuelve `DistributionNotDisabled` (409) si `Enabled` es `true` en la configuración.
- Todas las operaciones de mutación (`PUT`, `DELETE`) requieren un encabezado `If-Match` que contenga el `ETag` actual. Un `ETag` faltante o incorrecto devuelve `InvalidIfMatchVersion` (400).
- Todas las respuestas `GET` y `POST` (crear) incluyen un encabezado de respuesta `ETag`.
- Todos los subelementos de tipo lista en XML siguen el patrón contenedor `<Quantity>N</Quantity><Items>...</Items>` de CloudFront.
- Se aplica la unicidad de OAI `CallerReference`: los valores duplicados de `CallerReference` devuelven `CloudFrontOriginAccessIdentityAlreadyExists` (409).
- `AssociateAlias` adjunta un alias CNAME a la configuración de la distribución de destino.

## Configuración

| Propiedad | Var. ambiente | Predeterminado | Descripción |
|---|---|---|---|
| `floci.services.cloudfront.enabled` | `FLOCI_SERVICES_CLOUDFRONT_ENABLED` | `true` | Activar o desactivar el servicio |
| `floci.services.cloudfront.domain-suffix` | `FLOCI_SERVICES_CLOUDFRONT_DOMAIN_SUFFIX` | `cloudfront.net` | Sufijo de dominio para nombres de dominio de distribución generados |

## Ejemplos de CLI

```bash
export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test

# Create a distribution with an S3 origin
aws cloudfront create-distribution --distribution-config '{
  "CallerReference": "ref-1",
  "Enabled": true,
  "Comment": "my distribution",
  "Origins": {
    "Quantity": 1,
    "Items": [{
      "Id": "my-origin",
      "DomainName": "mybucket.s3.amazonaws.com",
      "S3OriginConfig": {"OriginAccessIdentity": ""}
    }]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "my-origin",
    "ViewerProtocolPolicy": "redirect-to-https",
    "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6",
    "AllowedMethods": {"Quantity": 2, "Items": ["GET","HEAD"]},
    "Compress": true
  }
}'

# Get a distribution
aws cloudfront get-distribution --id E1Z2X3C4V5B6N7

# List distributions
aws cloudfront list-distributions

# Create a cache invalidation
aws cloudfront create-invalidation \
  --distribution-id E1Z2X3C4V5B6N7 \
  --invalidation-batch '{
    "CallerReference": "inv-1",
    "Paths": {"Quantity": 1, "Items": ["/*"]}
  }'

# Create an OAI (Origin Access Identity)
aws cloudfront create-cloud-front-origin-access-identity \
  --cloud-front-origin-access-identity-config \
  "CallerReference=oai-1,Comment=my-oai"

# Create an OAC (Origin Access Control)
aws cloudfront create-origin-access-control \
  --origin-access-control-config '{
    "Name": "my-oac",
    "Description": "",
    "OriginAccessControlOriginType": "s3",
    "SigningBehavior": "always",
    "SigningProtocol": "sigv4"
  }'

# Create a cache policy
aws cloudfront create-cache-policy --cache-policy-config '{
  "Name": "my-cache-policy",
  "DefaultTTL": 86400,
  "MinTTL": 0,
  "MaxTTL": 31536000,
  "ParametersInCacheKeyAndForwardedToOrigin": {
    "EnableAcceptEncodingGzip": true,
    "EnableAcceptEncodingBrotli": true,
    "HeadersConfig": {"HeaderBehavior": "none"},
    "CookiesConfig": {"CookieBehavior": "none"},
    "QueryStringsConfig": {"QueryStringBehavior": "none"}
  }
}'

# Disable and delete a distribution
ETAG=$(aws cloudfront get-distribution --id E1Z2X3C4V5B6N7 \
  --query 'ETag' --output text)
aws cloudfront update-distribution --id E1Z2X3C4V5B6N7 \
  --if-match "$ETAG" \
  --distribution-config '...(config with Enabled: false)...'
ETAG=$(aws cloudfront get-distribution --id E1Z2X3C4V5B6N7 \
  --query 'ETag' --output text)
aws cloudfront delete-distribution --id E1Z2X3C4V5B6N7 --if-match "$ETAG"
```

## No compatible (Fase 2)

- Políticas de despliegue continuo (`CreateContinuousDeploymentPolicy`, etc.)
- `CopyDistribution` (distribuciones provisionales)
- Configuraciones de registro en tiempo real (`CreateRealtimeLogConfig`, etc.)
- Cifrado a nivel de campo (`CreateFieldLevelEncryptionConfig`, etc.)
- Claves públicas y grupos de claves (`CreatePublicKey`, `CreateKeyGroup`, etc.)
- Ejecución de `TestFunction` (la función se almacena, no se ejecuta)
- Distribuciones de streaming (RTMP, obsoletas por AWS)
- Orígenes de VPC, listas de IP Anycast, almacenes de valores clave
- Seguimiento de suscripciones.
- Entrega y almacenamiento en caché de contenido CDN real
