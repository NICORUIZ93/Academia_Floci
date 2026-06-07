# Transcribe

**Protocolo:** JSON 1.1
**Encabezado:** `X-Amz-Target: Transcribe.<Action>`
**Prefijo de punto final:** `transcribe`

Floci emula un pequeño código auxiliar del plano de control de Amazon Transcribe para aplicaciones
que crean, inspeccionan, enumeran y eliminan trabajos de transcripción o personalizados
vocabularios. Los trabajos cambian a `COMPLETED` inmediatamente y los vocabularios
realice la transición a `READY` inmediatamente.

No se realiza ninguna transcripción de audio real. `StartTranscriptionJob` acepta la
URI de medios y devuelve un `TranscriptFileUri` sintético en la respuesta, por lo que AWS SDK
y los clientes CLI pueden ejercer su código de flujo de control Transcribe localmente.

## Operaciones compatibles

| Operación | Notas |
|-----------|---------------|
| `StartTranscriptionJob` | Crea un trabajo en memoria y lo devuelve como `COMPLETED` |
| `GetTranscriptionJob` | Devuelve un trabajo almacenado por `TranscriptionJobName` |
| `ListTranscriptionJobs` | Enumera trabajos con filtros opcionales `Status`, `JobNameContains` y `MaxResults` |
| `DeleteTranscriptionJob` | Elimina un trabajo almacenado |
| `CreateVocabulary` | Crea un vocabulario en memoria y lo devuelve como `READY` |
| `GetVocabulary` | Devuelve un vocabulario almacenado por `VocabularyName` |
| `ListVocabularies` | Enumera vocabularios con filtros `StateEquals`, `NameContains` y `MaxResults` opcionales |
| `DeleteVocabulary` | Elimina un vocabulario almacenado |

`LanguageCode` tiene como valor predeterminado `en-US` y `MediaFormat` tiene como valor predeterminado `mp4` cuando
se omiten en `StartTranscriptionJob`.

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_TRANSCRIBE_ENABLED` | `true` | Activar o desactivar el servicio |

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test

aws transcribe start-transcription-job \
  --transcription-job-name floci-demo \
  --media MediaFileUri=s3://my-bucket/audio.mp3 \
  --language-code en-US \
  --media-format mp3

aws transcribe get-transcription-job \
  --transcription-job-name floci-demo

aws transcribe create-vocabulary \
  --vocabulary-name floci-vocab \
  --language-code en-US

aws transcribe list-vocabularies \
  --name-contains floci
```

```python
import boto3

client = boto3.client(
    "transcribe",
    endpoint_url="http://localhost:4566",
    region_name="us-east-1",
)

client.start_transcription_job(
    TranscriptionJobName="floci-demo",
    Media={"MediaFileUri": "s3://my-bucket/audio.mp3"},
    LanguageCode="en-US",
    MediaFormat="mp3",
)

job = client.get_transcription_job(TranscriptionJobName="floci-demo")
print(job["TranscriptionJob"]["TranscriptionJobStatus"])  # COMPLETED
```

## Documentos relacionados

- [Descripción general de servicios](index.md)
- [Configuración de AWS CLI y SDK](../getting-started/aws-setup.md)
- [Variables de entorno](../configuration/environment-variables.md)

## Fuera de alcance

- Procesamiento real de voz a texto o análisis de archivos de audio.
- Escribir transcripción de objetos JSON en S3.
- Almacenamiento persistente de trabajos o vocabulario durante los reinicios.
- Streaming, transcripción médica, análisis de llamadas y otras API de Transcribe
  más allá de las operaciones enumeradas anteriormente.
