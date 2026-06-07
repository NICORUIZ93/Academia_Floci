# Tiempo de ejecución de Bedrock

**Protocolo:** REST JSON
**Punto final:** `POST http://localhost:4566/model/{modelId}/...`

Floci emula el plano de datos de tiempo de ejecución AWS Bedrock API con un código auxiliar de respuesta ficticio. La forma de respuesta coincide con los contratos reales AWS Converse y InvokeModel, por lo que los clientes AWS SDK y CLI aceptan la respuesta sin errores. No se realiza ninguna inferencia del modelo real: cada llamada devuelve un turno de asistente fijo más metadatos de uso de token sintético.

El plano de gestión Bedrock (`aws bedrock ...`: `ListFoundationModels`, `GetFoundationModel`, personalización) aún no está emulado.

## Operaciones compatibles

| Operación | Punto final | Notas |
|-----------|----------|-------|
| `Converse` | `POST /model/{modelId}/converse` | Devuelve un mensaje de asistente estático |
| `InvokeModel` | `POST /model/{modelId}/invoke` | Devuelve Cuerpo de forma antrópica para identificaciones de modelos `anthropic.*` y `*.anthropic.*`; forma genérica `{"outputs": [...]}` de lo contrario |
| `ConverseStream` | `POST /model/{modelId}/converse-stream` | Devuelve 501 `UnsupportedOperationException` |
| `InvokeModelWithResponseStream` | `POST /model/{modelId}/invoke-with-response-stream` | Devuelve 501 `UnsupportedOperationException` |

`modelId` está decodificado mediante URL mediante JAX-RS y se repite palabra por palabra. Se aceptan identificadores de modelo simples (por ejemplo, `anthropic.claude-3-haiku-20240307-v1:0`), identificadores de perfil de inferencia (por ejemplo, `us.anthropic.claude-3-5-sonnet-20241022-v2:0`) y ARN completos que contienen barras (por ejemplo, `arn:aws:bedrock:us-east-1:123456789012:inference-profile/us.anthropic.claude-3-5-sonnet-20241022-v2:0`).

Converse acepta los campos `messages`, `system`, `inferenceConfig` y `toolConfig`. Solo se valida `messages` (matriz no vacía). Otros campos se aceptan e ignoran. No se implementa el viaje de ida y vuelta en el uso de herramientas.

Los cuerpos InvokeModel se pasan como bytes opacos; el código auxiliar no analiza las cargas útiles de la solicitud.

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_BEDROCKRUNTIME_ENABLED` | `true` | Activar o desactivar el servicio |

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test

# Converse
aws bedrock-runtime converse \
  --model-id anthropic.claude-3-haiku-20240307-v1:0 \
  --messages '[{"role":"user","content":[{"text":"hi"}]}]'

# InvokeModel (Anthropic Claude)
aws bedrock-runtime invoke-model \
  --model-id anthropic.claude-3-haiku-20240307-v1:0 \
  --body '{"anthropic_version":"bedrock-2023-05-31","max_tokens":100,"messages":[{"role":"user","content":"hi"}]}' \
  --cli-binary-format raw-in-base64-out \
  /tmp/response.json
cat /tmp/response.json
```

```python
import boto3
client = boto3.client("bedrock-runtime", endpoint_url="http://localhost:4566")
resp = client.converse(
    modelId="anthropic.claude-3-haiku-20240307-v1:0",
    messages=[{"role": "user", "content": [{"text": "hi"}]}],
)
print(resp["output"]["message"]["content"][0]["text"])
```

## Fuera de alcance

- Inferencia del modelo real (siempre devuelve una cadena fija).
- Transmisión (`ConverseStream`, `InvokeModelWithResponseStream`) devuelve 501.
- Plano de gestión Bedrock (`ListFoundationModels`, `GetFoundationModel`, personalización de modelos).
- Agentes Bedrock, Bases de conocimiento, Guardrails, rendimiento aprovisionado.
- Uso de herramientas de ida y vuelta en Converse.
