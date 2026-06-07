# Precios de (servicio de lista de precios de AWS)

**Protocolo:** JSON 1.1
**Encabezado:** `X-Amz-Target: AWSPriceListService.<Action>`
**Prefijo de punto final:** `api.pricing`

Floci emula el servicio de lista de precios AWS respaldado por una instantánea estática incluida.
Las respuestas coinciden con el formato de cable real AWS, por lo que los clientes AWS SDK y CLI aceptan el
Responder sin modificaciones. La instantánea incluida cubre un mínimo y representativo
conjunto de servicios y regiones; para una cobertura más amplia, apunte Floci a su cuenta
instantánea con `FLOCI_SERVICES_PRICING_SNAPSHOT_PATH`.

## Operaciones compatibles

| Operación | Notas |
|-----------|---------------|
| `DescribeServices` | Enumera los servicios empaquetados y sus nombres de atributos consultables |
| `GetAttributeValues` | Devuelve el conjunto de valores que puede tomar un atributo determinado |
| `GetProducts` | Devuelve `PriceList` como una matriz de cadenas de oferta de producto codificadas con JSON (coincide con el formato AWS) |
| `ListPriceLists` | Muestra los ARN de lista de precios disponibles filtrados por servicio, moneda y región opcional |
| `GetPriceListFileUrl` | Devuelve una URL resguardada de HTTPS; útil para rutas de código que validan la presencia de URL |

La paginación es compatible con todas las operaciones de listas a través de `NextToken` + `MaxResults`.

## Instantánea incluida

La instantánea predeterminada en el classpath cubre:

| ServiceCode | Regiones | Notas |
|-------------|---------|-------|
| `AmazonEC2` | `us-east-1` (Linux/arrendamiento compartido, 3 tipos de instancias) | `t3.micro`, `m5.large`, `c5.large` |
| `AmazonS3` | `us-east-1` (Almacenamiento estándar) | |
| `AWSLambda` | `us-east-1` (Solicitudes) | |

La instantánea es intencionalmente mínima: suficiente para ejercitar el análisis SDK y
Lógica de filtro: no una base de datos de precios completa.

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_PRICING_ENABLED` | `true` | Activar o desactivar el servicio |
| `FLOCI_SERVICES_PRICING_SNAPSHOT_PATH` | *(desarmado)* | Directorio del sistema de archivos que anula la instantánea incluida |

### Diseño del directorio de instantáneas

Cuando se configura `FLOCI_SERVICES_PRICING_SNAPSHOT_PATH`, Floci lee archivos en este
diseño (recurriendo a la entrada de classpath para cualquier archivo que no exista):

```
<path>/
  services.json                              # [ { "ServiceCode": "...", "AttributeNames": [...] } ]
  attribute-values/<ServiceCode>/<Attr>.json # [ { "Value": "..." } ]
  products/<ServiceCode>/<Region>.json       # [ { "product": {...}, "terms": {...}, ... } ]
  price-lists/<ServiceCode>.json             # [ { "PriceListArn": "...", "RegionCode": "...", ... } ]
```

Cada entrada de producto se almacena como un objeto JSON; Floci lo vuelve a serializar en el
La forma de matriz de cadenas JSON devuelve AWS. Introduzca una instantánea completa generada a partir de
la [Lista de precios AWS al por mayor API](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/price-changes.html)
cuando los accesorios incluidos son insuficientes.

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test

aws pricing describe-services --service-code AmazonEC2

aws pricing get-attribute-values \
  --service-code AmazonEC2 --attribute-name instanceType

aws pricing get-products \
  --service-code AmazonEC2 \
  --filters 'Type=TERM_MATCH,Field=instanceType,Value=t3.micro' \
            'Type=TERM_MATCH,Field=regionCode,Value=us-east-1'

aws pricing list-price-lists \
  --service-code AmazonEC2 \
  --effective-date 2026-01-01T00:00:00Z \
  --currency-code USD
```

```python
import boto3

client = boto3.client(
    "pricing",
    endpoint_url="http://localhost:4566",
    region_name="us-east-1",
)

resp = client.get_products(
    ServiceCode="AmazonEC2",
    Filters=[
        {"Type": "TERM_MATCH", "Field": "instanceType", "Value": "t3.micro"},
        {"Type": "TERM_MATCH", "Field": "regionCode",   "Value": "us-east-1"},
    ],
)
for item in resp["PriceList"]:
    # AWS returns PriceList as an array of JSON strings; parse each separately.
    import json
    print(json.loads(item)["product"]["sku"])
```

## Fuera de alcance

- Descarga masiva de listas de precios regionales completas (`GetPriceListFileUrl` devuelve un
  URL de código auxiliar; el archivo no se entrega).
- Descuentos por volumen, planes de ahorro o términos de precios de instancias reservadas más allá
  lo que declara la instantánea incluida.
- Actualización automática de la instantánea desde AWS ascendente.
