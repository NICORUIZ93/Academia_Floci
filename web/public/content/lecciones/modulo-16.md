# Módulo 16 · IA en la nube: Bedrock, Textract y Transcribe

## IA como servicio — sin entrenar modelos

Antes de Bedrock, usar IA en producción requería: recolectar datos, entrenar modelos, gestionar GPUs, desplegar inferencia. Ahora puedes llamar a modelos entrenados por Amazon, Anthropic, Meta y otros con una sola llamada API.

**Floci soporta estos servicios de IA:**
- **Bedrock Runtime** — modelos de lenguaje (Claude, Llama, Titan)
- **Textract** — extrae texto y tablas de documentos e imágenes
- **Transcribe** — convierte audio a texto

---

## Amazon Bedrock Runtime

Bedrock te da acceso a múltiples modelos de IA a través de una API unificada.

```bash
eval $(floci env)

# Lista los modelos disponibles
aws bedrock list-foundation-models \
  --query "modelSummaries[*].[modelId,providerName]" \
  --output table
```

### Invoca Claude (Anthropic) desde la CLI

```bash
# Invoca el modelo Claude con la API Messages
aws bedrock-runtime invoke-model \
  --model-id anthropic.claude-3-haiku-20240307-v1:0 \
  --body '{
    "anthropic_version": "bedrock-2023-05-31",
    "max_tokens": 1000,
    "messages": [
      {
        "role": "user",
        "content": "Explica en 2 oraciones qué es DynamoDB."
      }
    ]
  }' \
  --cli-binary-format raw-in-base64-out \
  respuesta.json

cat respuesta.json | jq '.content[0].text'
```

### Python con Bedrock

```python
import boto3
import json

bedrock = boto3.client("bedrock-runtime",
    endpoint_url="http://localhost:4566",
    region_name="us-east-1",
    aws_access_key_id="test",
    aws_secret_access_key="test"
)

def preguntar_claude(pregunta, max_tokens=1000):
    resp = bedrock.invoke_model(
        modelId="anthropic.claude-3-haiku-20240307-v1:0",
        body=json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": max_tokens,
            "messages": [{"role": "user", "content": pregunta}]
        })
    )
    resultado = json.loads(resp["body"].read())
    return resultado["content"][0]["text"]

# Uso simple
respuesta = preguntar_claude("¿Cuándo usarías SQS en lugar de SNS?")
print(respuesta)
```

### Streaming de respuestas (para UX en tiempo real)

```python
def preguntar_streaming(pregunta):
    resp = bedrock.invoke_model_with_response_stream(
        modelId="anthropic.claude-3-haiku-20240307-v1:0",
        body=json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 2000,
            "messages": [{"role": "user", "content": pregunta}]
        })
    )

    stream = resp.get("body")
    for event in stream:
        chunk = event.get("chunk")
        if chunk:
            datos = json.loads(chunk.get("bytes", b"{}"))
            if datos.get("type") == "content_block_delta":
                texto = datos.get("delta", {}).get("text", "")
                print(texto, end="", flush=True)
    print()

preguntar_streaming("Explica paso a paso cómo funciona DynamoDB Query.")
```

### Llama (Meta) con Bedrock

```python
def preguntar_llama(pregunta):
    resp = bedrock.invoke_model(
        modelId="meta.llama3-8b-instruct-v1:0",
        body=json.dumps({
            "prompt": f"<|begin_of_text|><|user|>{pregunta}<|assistant|>",
            "max_gen_len": 512,
            "temperature": 0.7
        })
    )
    resultado = json.loads(resp["body"].read())
    return resultado["generation"]
```

### Titan Embeddings — búsqueda semántica

```python
def generar_embedding(texto):
    resp = bedrock.invoke_model(
        modelId="amazon.titan-embed-text-v1",
        body=json.dumps({"inputText": texto})
    )
    resultado = json.loads(resp["body"].read())
    return resultado["embedding"]

# Similaridad coseno para búsqueda semántica
import numpy as np

def similitud(v1, v2):
    return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))

# Ejemplo: encuentra el documento más similar a la pregunta
documentos = [
    "DynamoDB es una base de datos NoSQL de AWS",
    "S3 almacena objetos como archivos e imágenes",
    "Lambda ejecuta funciones sin gestionar servidores"
]

pregunta = "¿Cómo guardo archivos en AWS?"

emb_pregunta = generar_embedding(pregunta)
emb_docs = [generar_embedding(doc) for doc in documentos]

scores = [(similitud(emb_pregunta, emb), doc) for emb, doc in zip(emb_docs, documentos)]
scores.sort(reverse=True)
print(f"Más relevante: {scores[0][1]}")
```

---

## Amazon Textract — extrae texto de documentos

```bash
# Sube un PDF o imagen a S3
aws s3 cp factura.pdf s3://mi-bucket/documentos/factura.pdf

# Extrae texto sincrónicamente (documentos simples)
aws textract detect-document-text \
  --document '{"S3Object":{"Bucket":"mi-bucket","Name":"documentos/factura.pdf"}}' \
  --query "Blocks[?BlockType=='LINE'].Text" \
  --output text

# Extrae formularios y tablas
aws textract analyze-document \
  --document '{"S3Object":{"Bucket":"mi-bucket","Name":"documentos/factura.pdf"}}' \
  --feature-types FORMS TABLES
```

```python
import boto3

textract = boto3.client("textract",
    endpoint_url="http://localhost:4566",
    region_name="us-east-1",
    aws_access_key_id="test",
    aws_secret_access_key="test"
)

def extraer_texto_de_imagen(bucket, key):
    resp = textract.detect_document_text(
        Document={"S3Object": {"Bucket": bucket, "Name": key}}
    )

    líneas = [block["Text"] for block in resp["Blocks"] if block["BlockType"] == "LINE"]
    return "\n".join(líneas)

# Extrae pares clave-valor de formularios
def extraer_formulario(bucket, key):
    resp = textract.analyze_document(
        Document={"S3Object": {"Bucket": bucket, "Name": key}},
        FeatureTypes=["FORMS"]
    )
    campos = {}
    for block in resp["Blocks"]:
        if block["BlockType"] == "KEY_VALUE_SET" and "KEY" in block.get("EntityTypes", []):
            # Simplificado — en producción necesitas seguir los IDs de relaciones
            if block.get("Relationships"):
                campos[block["Id"]] = block
    return campos
```

---

## Amazon Transcribe — audio a texto

```bash
# Sube un archivo de audio
aws s3 cp entrevista.mp3 s3://mi-bucket/audio/entrevista.mp3

# Inicia la transcripción
aws transcribe start-transcription-job \
  --transcription-job-name mi-transcripcion-001 \
  --media '{"MediaFileUri":"s3://mi-bucket/audio/entrevista.mp3"}' \
  --media-format mp3 \
  --language-code es-ES \
  --output-bucket-name mi-bucket

# Monitorea el estado
aws transcribe get-transcription-job \
  --transcription-job-name mi-transcripcion-001 \
  --query TranscriptionJob.TranscriptionJobStatus
```

```python
import boto3, time, json

transcribe = boto3.client("transcribe",
    endpoint_url="http://localhost:4566",
    region_name="us-east-1",
    aws_access_key_id="test",
    aws_secret_access_key="test"
)

s3 = boto3.client("s3",
    endpoint_url="http://localhost:4566",
    region_name="us-east-1",
    aws_access_key_id="test",
    aws_secret_access_key="test"
)

def transcribir_audio(audio_bucket, audio_key, output_bucket):
    job_name = f"job-{int(time.time())}"

    transcribe.start_transcription_job(
        TranscriptionJobName=job_name,
        Media={"MediaFileUri": f"s3://{audio_bucket}/{audio_key}"},
        MediaFormat="mp3",
        LanguageCode="es-ES",
        OutputBucketName=output_bucket
    )

    # Espera a que termine
    while True:
        job = transcribe.get_transcription_job(TranscriptionJobName=job_name)
        estado = job["TranscriptionJob"]["TranscriptionJobStatus"]
        if estado in ["COMPLETED", "FAILED"]:
            break
        time.sleep(5)

    if estado == "FAILED":
        raise Exception(f"Transcripción falló: {job['TranscriptionJob']['FailureReason']}")

    # Lee el resultado de S3
    resultado_key = f"{job_name}.json"
    obj = s3.get_object(Bucket=output_bucket, Key=resultado_key)
    resultado = json.loads(obj["Body"].read())

    return resultado["results"]["transcripts"][0]["transcript"]
```

---

## Caso de uso integrado: procesar facturas con IA

```python
import boto3, json

s3 = boto3.client("s3", endpoint_url="http://localhost:4566", region_name="us-east-1",
    aws_access_key_id="test", aws_secret_access_key="test")
textract = boto3.client("textract", endpoint_url="http://localhost:4566", region_name="us-east-1",
    aws_access_key_id="test", aws_secret_access_key="test")
bedrock = boto3.client("bedrock-runtime", endpoint_url="http://localhost:4566", region_name="us-east-1",
    aws_access_key_id="test", aws_secret_access_key="test")

def procesar_factura(bucket, key):
    # 1. Extrae texto con Textract
    texto = textract.detect_document_text(
        Document={"S3Object": {"Bucket": bucket, "Name": key}}
    )
    líneas = [b["Text"] for b in texto["Blocks"] if b["BlockType"] == "LINE"]
    texto_plano = "\n".join(líneas)

    # 2. Clasifica y extrae datos con Claude
    prompt = f"""Analiza este texto de una factura y devuelve un JSON con:
- numero_factura
- fecha
- total
- proveedor
- items (lista con descripcion y precio)

Texto de la factura:
{texto_plano}

Responde SOLO con el JSON, sin texto adicional."""

    resp = bedrock.invoke_model(
        modelId="anthropic.claude-3-haiku-20240307-v1:0",
        body=json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 500,
            "messages": [{"role": "user", "content": prompt}]
        })
    )

    json_str = json.loads(resp["body"].read())["content"][0]["text"]
    return json.loads(json_str)

# Uso
datos = procesar_factura("mi-bucket", "documentos/factura.pdf")
print(f"Factura #{datos['numero_factura']} - Total: {datos['total']}")
```

---

## Reto del módulo

1. Usa Bedrock para preguntarle a Claude "¿Qué es una Dead Letter Queue en SQS?" y muestra la respuesta
2. Implementa la función de embeddings y encuentra el documento más similar a "base de datos clave-valor"
3. Usa Textract para extraer texto de cualquier imagen subida a S3
4. Conecta Textract + Bedrock: sube una imagen con texto, extráelo con Textract y resume con Claude

## Preguntas de salida

1. ¿Cuándo usarías Bedrock en lugar de entrenar tu propio modelo?
2. ¿Qué son los embeddings y para qué sirven?
3. ¿Qué diferencia hay entre Textract y un OCR simple?
4. ¿En qué idiomas funciona Transcribe para audio en español?
## Verificación del aprendizaje

Antes de marcar este módulo como completado, confirma esto con evidencia propia:

1. **Lo puedo explicar en una frase.** Escribe qué problema resuelve este módulo y para qué lo usarías en una aplicación real.
2. **Lo ejecuté, no solo lo leí.** Guarda el comando principal que corriste y una salida real de tu terminal.
3. **Lo puedo verificar.** Consulta el recurso con AWS CLI, Azure CLI, GCP CLI o StackPort cuando aplique. La evidencia debe mostrar nombre, estado o contenido del recurso.
4. **Entiendo un fallo común.** Provoca o identifica un error sencillo, copia el mensaje completo y explica cómo lo diagnosticaste.
5. **Sé cuándo avanzar.** Avanza solo si puedes repetir el laboratorio desde una carpeta limpia sin depender de copiar a ciegas.

Evidencia mínima sugerida:

```text
Comando ejecutado:
Salida obtenida:
Qué significa la salida:
Error o duda encontrada:
Cómo la resolví:
```
