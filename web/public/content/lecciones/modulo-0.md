# Módulo 0 · Instalación y primeros pasos con Floci

## ¿Qué es Floci y para qué sirve?

Floci es un **emulador de nube** que corre en tu computadora. Te permite practicar con servicios reales de AWS, Azure y Google Cloud **sin crear cuentas, sin tarjeta de crédito y sin pagar nada**.

Existen tres emuladores:

| Emulador | Proveedor | Puerto | Servicios |
|----------|-----------|--------|-----------|
| `floci` | AWS | 4566 | 47 servicios (S3, Lambda, DynamoDB, RDS...) |
| `floci-az` | Azure | 4577 | 10 servicios (Blob, Functions, Service Bus...) |
| `floci-gcp` | GCP | 4588 | 7 servicios (Cloud Storage, Pub/Sub, Firestore...) |

> **Floci** arranca en 24ms, usa 13 MiB de memoria y pasa 1.925 tests de compatibilidad con AWS SDK. Cada servicio es funcional — no son mocks.

---

## ¿Por qué necesitas un emulador?

Sin emulador, para practicar con AWS necesitas:
- Crear una cuenta y dar una tarjeta de crédito
- Configurar IAM, billing alerts, etc.
- Arriesgar costos si te equivocas

Con Floci:
- Instalas una CLI y listo
- Ningún límite de recursos
- Los errores no cuestan nada
- Las credenciales son ficticias (`test` / `test`)

---

## Instalación

### Opción 1: Homebrew (macOS / Linux)
```bash
brew install floci-io/floci/floci
```

### Opción 2: Script de instalación
```bash
curl -fsSL https://floci.io/install.sh | sh
```

### Opción 3: Docker (solo para el emulador AWS)
```bash
docker run -d --name floci \
  -p 4566:4566 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  floci/floci:latest
```

### Verificar instalación
```bash
floci --version
```

---

## Levantando el emulador de AWS

```bash
# Inicia el emulador
floci start

# Verifica que está corriendo
floci status

# Carga las variables de entorno en tu terminal
eval $(floci env)
```

`eval $(floci env)` configura automáticamente estas variables:

```bash
AWS_ENDPOINT_URL=http://localhost:4566
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_DEFAULT_REGION=us-east-1
```

### Verifica con STS
```bash
aws sts get-caller-identity
```

Deberías ver algo así:
```json
{
    "UserId": "AKIAIOSFODNN7EXAMPLE",
    "Account": "000000000000",
    "Arn": "arn:aws:iam::000000000000:root"
}
```

Si ves esa respuesta, **estás hablando con Floci, no con AWS real**. Nótalo: el Account ID es `000000000000`, no un número real de AWS.

---

## Levantando el emulador de Azure

```bash
# Inicia Azure
floci az start

# Verifica
floci az status

# Carga las variables de entorno de Azure
eval $(floci az env)
```

Esto configura la connection string de Azure Storage:
```bash
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;...
```

Para ver logs en tiempo real:
```bash
floci az logs --follow
```

---

## Levantando el emulador de GCP

El emulador de GCP se ejecuta con Docker:

```bash
docker run -d --name floci-gcp \
  -p 4588:4588 \
  floci/floci-gcp:latest
```

Configura las variables según el servicio que vayas a usar:

```bash
# Para Cloud Storage
export STORAGE_EMULATOR_HOST=http://localhost:4588
export CLOUDSDK_CORE_PROJECT=floci-local

# Para Pub/Sub
export PUBSUB_EMULATOR_HOST=localhost:4588

# Para Firestore
export FIRESTORE_EMULATOR_HOST=localhost:4588

# Para Secret Manager
export SECRETMANAGER_EMULATOR_HOST=localhost:4588
```

---

## Los tres corriendo al mismo tiempo

Puedes tener los tres emuladores corriendo simultáneamente. Crea este `docker-compose.yml`:

```yaml
version: "3.8"
services:
  floci:
    image: floci/floci:latest
    ports:
      - "4566:4566"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock

  floci-az:
    image: floci/floci-az:latest
    ports:
      - "4577:4577"
      - "5672:5672"   # Event Hubs AMQP
      - "5673:5673"   # Service Bus AMQP

  floci-gcp:
    image: floci/floci-gcp:latest
    ports:
      - "4588:4588"
```

```bash
docker compose up -d
```

---

## Comandos útiles de Floci

```bash
floci start              # Inicia el emulador AWS
floci stop               # Detiene el emulador
floci status             # Muestra el estado
floci logs --follow      # Ver logs en tiempo real
floci doctor             # Diagnóstico de problemas
floci snapshot save v1   # Guarda el estado actual
floci snapshot restore v1 # Restaura un estado guardado

# Con persistencia (los datos sobreviven al reinicio)
floci start --persist ./datos-locales
```

> **Sin persistencia**: cuando detienes Floci, todos los recursos que creaste (buckets, colas, tablas) se borran.  
> **Con `--persist`**: los datos sobreviven al reinicio.

---

## ¿Qué diferencia hay entre Floci y AWS real?

| Aspecto | Floci (local) | AWS (producción) |
|---------|--------------|-----------------|
| Costo | $0 siempre | Por uso |
| Autenticación | Ficticias (`test`/`test`) | IAM real con permisos |
| Account ID | `000000000000` | Tu número de cuenta real |
| Latencia | <2ms (local) | 20-100ms (red) |
| Escalabilidad | Tu computadora | Infinita |
| Datos | Desaparecen al detener (sin `--persist`) | Persisten siempre |

**Floci pasa el 100% de los tests de compatibilidad del SDK de AWS.** El código que escribes con Floci funciona igual en AWS real — solo cambias el endpoint.

---

## Próximo paso

Ahora que tienes los emuladores corriendo, el Módulo 1 te enseña a guardar y recuperar archivos en los tres proveedores usando **almacenamiento de objetos**.
