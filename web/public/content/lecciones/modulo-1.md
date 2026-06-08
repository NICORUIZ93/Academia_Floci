# Módulo 1 · Almacenamiento de objetos: S3, Azure Blob y GCP Cloud Storage

## ¿Qué es el almacenamiento de objetos?

Los tres grandes proveedores tienen un servicio para guardar archivos sin gestionar discos ni servidores. El concepto es el mismo en los tres — solo cambia el nombre:

| AWS | Azure | GCP |
|-----|-------|-----|
| Amazon S3 | Azure Blob Storage | Google Cloud Storage |
| Bucket | Container | Bucket |
| Object | Blob | Object |
| Key | Blob name | Object name |
| Puerto Floci: 4566 | Puerto Floci-az: 4577 | Puerto Floci-gcp: 4588 |

Un **objeto** es cualquier archivo (imagen, CSV, JSON, video) + sus metadatos. No tiene estructura interna — el sistema no sabe si es texto o binario.

---

## Prepara el entorno

```bash
# Configura AWS (Floci)
eval $(floci env)

# Configura Azure (Floci-az)
eval $(floci az env)

# Configura GCP (Floci-gcp)
export STORAGE_EMULATOR_HOST=http://localhost:4588
export CLOUDSDK_CORE_PROJECT=floci-local

# Crea un archivo de prueba
echo "Hola Floci - cloud storage test" > hola.txt
```

---

## AWS S3 con Floci

### Crear un bucket
```bash
aws s3 mb s3://mi-bucket
```

> **Naming rules**: todo minúscula, entre 3 y 63 caracteres, sin puntos al principio ni al final.

### Subir un archivo
```bash
aws s3 cp hola.txt s3://mi-bucket/hola.txt
```

### Listar objetos
```bash
aws s3 ls s3://mi-bucket
```

### Descargar un archivo
```bash
aws s3 cp s3://mi-bucket/hola.txt descargado.txt
cat descargado.txt
```

### Subir a una "carpeta" (prefijo)
En S3 no existen carpetas reales — son prefijos en el nombre del objeto (la key):

```bash
aws s3 cp hola.txt s3://mi-bucket/2024/enero/hola.txt
aws s3 ls s3://mi-bucket/2024/enero/
```

### Eliminar un objeto
```bash
aws s3 rm s3://mi-bucket/hola.txt
```

### Versionado — sube dos versiones del mismo archivo
```bash
# Habilita versionado
aws s3api put-bucket-versioning \
  --bucket mi-bucket \
  --versioning-configuration Status=Enabled

# Sube la versión 1
echo "versión 1" > documento.txt
aws s3 cp documento.txt s3://mi-bucket/documento.txt

# Sube la versión 2
echo "versión 2 - modificada" > documento.txt
aws s3 cp documento.txt s3://mi-bucket/documento.txt

# Lista las versiones
aws s3api list-object-versions --bucket mi-bucket

# Descarga la versión anterior (usa el VersionId de la respuesta anterior)
aws s3api get-object \
  --bucket mi-bucket \
  --key documento.txt \
  --version-id <VersionId> \
  version1.txt
```

### API de bajo nivel (s3api) vs alto nivel (s3)
```bash
# Alto nivel — más simple
aws s3 cp archivo.txt s3://mi-bucket/

# Bajo nivel — más control (metadatos, versiones, ACLs)
aws s3api put-object \
  --bucket mi-bucket \
  --key archivo.txt \
  --body archivo.txt \
  --metadata '{"autor":"alice","proyecto":"floci"}'

# Leer metadatos
aws s3api head-object --bucket mi-bucket --key archivo.txt
```

---

## Azure Blob Storage con Floci-az

### Configura la connection string
```bash
eval $(floci az env)
echo $AZURE_STORAGE_CONNECTION_STRING
```

### Crear un container (equivalente a bucket)
```bash
az storage container create \
  --name mi-contenedor \
  --connection-string "$AZURE_STORAGE_CONNECTION_STRING"
```

### Subir un blob
```bash
az storage blob upload \
  --container-name mi-contenedor \
  --name hola.txt \
  --file hola.txt \
  --connection-string "$AZURE_STORAGE_CONNECTION_STRING"
```

### Listar blobs
```bash
az storage blob list \
  --container-name mi-contenedor \
  --connection-string "$AZURE_STORAGE_CONNECTION_STRING" \
  --output table
```

### Descargar un blob
```bash
az storage blob download \
  --container-name mi-contenedor \
  --name hola.txt \
  --file descargado-azure.txt \
  --connection-string "$AZURE_STORAGE_CONNECTION_STRING"
```

### Desde Python (SDK de Azure)
```python
from azure.storage.blob import BlobServiceClient

conn_str = "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBI+LGos6/1==;BlobEndpoint=http://localhost:4577/devstoreaccount1;"

client = BlobServiceClient.from_connection_string(conn_str)
container = client.get_container_client("mi-contenedor")

# Sube
with open("hola.txt", "rb") as f:
    container.upload_blob("hola.txt", f, overwrite=True)

# Descarga
blob = container.download_blob("hola.txt")
print(blob.readall().decode())
```

---

## GCP Cloud Storage con Floci-gcp

### Configura el entorno
```bash
export STORAGE_EMULATOR_HOST=http://localhost:4588
export CLOUDSDK_API_ENDPOINT_OVERRIDES_STORAGE=http://localhost:4588/
export CLOUDSDK_CORE_PROJECT=floci-local
```

### Crear un bucket
```bash
gcloud storage buckets create gs://mi-bucket-gcp
```

### Subir un objeto
```bash
gcloud storage cp hola.txt gs://mi-bucket-gcp/hola.txt
```

### Listar objetos
```bash
gcloud storage ls gs://mi-bucket-gcp
```

### Descargar un objeto
```bash
gcloud storage cp gs://mi-bucket-gcp/hola.txt descargado-gcp.txt
```

### Desde Python (SDK de GCP)
```python
import os
from google.cloud import storage

os.environ["STORAGE_EMULATOR_HOST"] = "http://localhost:4588"

client = storage.Client(project="floci-local")

# Crear bucket
bucket = client.create_bucket("mi-bucket-gcp")

# Subir
blob = bucket.blob("hola.txt")
blob.upload_from_string("Hola desde GCP Cloud Storage con Floci!")

# Descargar
print(blob.download_as_text())

# Listar
for b in bucket.list_blobs():
    print(b.name)
```

### Desde Node.js (SDK de GCP)
```javascript
const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
  projectId: 'floci-local',
  apiEndpoint: 'http://localhost:4588',
});

async function main() {
  const [bucket] = await storage.createBucket('mi-bucket-node');
  const file = bucket.file('hola.txt');
  await file.save('Hola desde Node.js!');
  const [contents] = await file.download();
  console.log(contents.toString());
}
main();
```

---

## Comparación de los tres

| Operación | AWS CLI | Azure CLI | GCP CLI |
|-----------|---------|-----------|---------|
| Crear contenedor | `aws s3 mb s3://bucket` | `az storage container create` | `gcloud storage buckets create gs://bucket` |
| Subir | `aws s3 cp archivo s3://` | `az storage blob upload` | `gcloud storage cp archivo gs://` |
| Descargar | `aws s3 cp s3:// archivo` | `az storage blob download` | `gcloud storage cp gs:// archivo` |
| Listar | `aws s3 ls s3://` | `az storage blob list` | `gcloud storage ls gs://` |
| Borrar | `aws s3 rm s3://archivo` | `az storage blob delete` | `gcloud storage rm gs://archivo` |

**El concepto es idéntico.** La diferencia está en la CLI y el SDK — no en cómo funciona.

---

## Reto del módulo

Escribe un script en Python o Bash que:
1. Suba el mismo archivo `hola.txt` a S3 (Floci), Azure Blob (Floci-az) y GCP Cloud Storage (Floci-gcp)
2. Descargue el archivo de cada uno y verifique que el contenido es idéntico
3. Imprima "✓ AWS", "✓ Azure", "✓ GCP" al verificar cada uno

---

## Preguntas de salida

Antes de avanzar, debes poder responder sin consultar:
1. ¿Por qué se llama "bucket" en S3 y "container" en Azure si hacen lo mismo?
2. ¿Qué pasa si subes dos archivos con la misma key/nombre sin habilitar versionado?
3. ¿Qué diferencia hay entre `aws s3` (alto nivel) y `aws s3api` (bajo nivel)?
4. ¿Por qué en S3 no existen "carpetas" reales?
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

