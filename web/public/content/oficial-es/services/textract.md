#Textract

**Protocolo:** JSON 1.1
**Encabezado:** `X-Amz-Target: Textract.<Action>`

Floci emula el AWS Textract API con un código auxiliar de respuesta ficticio. La forma de respuesta coincide con los contratos reales AWS Textract, por lo que los clientes AWS SDK y CLI aceptan la respuesta sin errores. No se realiza ningún OCR real ni análisis de documentos: cada llamada devuelve un conjunto fijo de objetos `Block` con metadatos sintéticos.

## Operaciones compatibles

| Operación | Notas |
|-----------|---------------|
| `DetectDocumentText` | Devuelve bloques PÁGINA + LÍNEA + PALABRA |
| `AnalyzeDocument` | Devuelve bloques de trozos; `FeatureTypes` aceptado pero ignorado |
| `StartDocumentTextDetection` | Devuelve un `JobId`; el trabajo es EXITOSO inmediatamente |
| `GetDocumentTextDetection` | Devuelve bloques de trozos `SUCCEEDED` + para un `JobId` |
| `StartDocumentAnalysis` | Devuelve un `JobId`; el trabajo es EXITOSO inmediatamente |
| `GetDocumentAnalysis` | Devuelve bloques de trozos `SUCCEEDED` + para un `JobId` |

Las entradas `Document` y `DocumentLocation` (bytes o referencias S3) se aceptan pero no se analizan.

### Forma de bloque

Cada respuesta incluye una jerarquía de 3 bloques que coincide con la [forma del bloque AWS API](https://docs.aws.amazon.com/textract/latest/dg/API_Block.html):

| BlockType | Texto | Relaciones |
|-----------|------|---------------|
| `PAGE` | *(ninguno)* | NIÑO → LÍNEA |
| `LINE` | `"Floci"` | NIÑO → PALABRA |
| `WORD` | `"Floci"` | *(ninguno)* |

Cada bloque incluye: `Id` (UUID), `Confidence` (99.9), `Page` (1) y un `Geometry` con `BoundingBox` + `Polygon` de 4 puntos.

### Ciclo de vida del trabajo asíncrono

Las operaciones `Start*` almacenan un ID de trabajo en la memoria y lo devuelven inmediatamente. Las llamadas a `Get*` con un ID de trabajo válido siempre devuelven `JobStatus: SUCCEEDED`. Los ID de trabajo no persisten durante los reinicios. El uso de un ID de trabajo `GetDocumentTextDetection` en `GetDocumentAnalysis` (o viceversa) devuelve `InvalidJobIdException`.

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_TEXTRACT_ENABLED` | `true` | Activar o desactivar el servicio |

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test

# DetectDocumentText
aws textract detect-document-text \
  --document '{"S3Object":{"Bucket":"my-bucket","Name":"test.pdf"}}'

# AnalyzeDocument
aws textract analyze-document \
  --document '{"S3Object":{"Bucket":"my-bucket","Name":"test.pdf"}}' \
  --feature-types TABLES FORMS

# Async: start + poll
JOB_ID=$(aws textract start-document-text-detection \
  --document-location '{"S3Object":{"Bucket":"my-bucket","Name":"test.pdf"}}' \
  --query JobId --output text)

aws textract get-document-text-detection --job-id "$JOB_ID"
```

```python
import boto3

client = boto3.client("textract", endpoint_url="http://localhost:4566")

# Sync
resp = client.detect_document_text(
    Document={"S3Object": {"Bucket": "my-bucket", "Name": "test.pdf"}}
)
for block in resp["Blocks"]:
    print(block["BlockType"], block.get("Text", ""))

# Async
job = client.start_document_text_detection(
    DocumentLocation={"S3Object": {"Bucket": "my-bucket", "Name": "test.pdf"}}
)
result = client.get_document_text_detection(JobId=job["JobId"])
print(result["JobStatus"])  # SUCCEEDED
```

## Fuera de alcance

- OCR real o análisis de documentos (siempre devuelve una lista de bloques de código fijo).
- `AnalyzeExpense`, `AnalyzeID`, `AnalyzeLendingDocument` y otras operaciones de análisis especializadas.
- `GetAdapterVersion`, `CreateAdapter`, `ListAdapters` (Gestión de adaptadores API).
- Paginación `GetDocumentTextDetection` / `GetDocumentAnalysis` vía `NextToken`.
- Almacenamiento de trabajos persistente durante los reinicios.

