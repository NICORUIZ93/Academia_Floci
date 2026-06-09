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

### Opción 2: Script de instalación (macOS / Linux / WSL)
```bash
curl -fsSL https://floci.io/install.sh | sh
```

No ejecutes este comando en PowerShell puro: `sh` no existe ahí. En Windows usa WSL, Git Bash o la ruta Docker Compose de este curso.

### Opción 3: Docker Compose del curso (Windows / macOS / Linux)
```bash
docker compose up -d floci stackport
```

Esta es la ruta más clara para la academia porque levanta Floci y StackPort con la misma red Docker.

### Opción 4: Docker manual (solo para el emulador AWS)
```bash
docker run -d --name floci \
  -p 4566:4566 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  floci/floci:latest
```

### Windows (PowerShell / Git Bash / WSL)

Si usas Windows recomendamos WSL2 (distro Ubuntu/Kali) y ejecutar el
comando original desde la terminal de la distro. Alternativamente puedes
usar Git Bash o revisar el script desde PowerShell:

- **WSL (recomendado)**

```bash
wsl --install -d kali-linux
wsl -d kali-linux -e bash -c "curl -fsSL https://floci.io/install.sh | sh"
```

- **Git Bash**

```bash
curl -fsSL https://floci.io/install.sh | bash
```

- **PowerShell / CMD**

```powershell
curl.exe -fsSL https://floci.io/install.sh -o install.sh
notepad install.sh
bash install.sh
```

No uses `sh` directo desde PowerShell sin WSL. Si el instalador detecta
`mingw` o `Unsupported OS: mingw64_nt`, cambia a WSL o usa `docker compose up -d floci stackport`.

### Verificar instalación
```bash
floci --version
```

## Problemas comunes y soluciones

| Error real | Causa | Solución | Verifica |
|------------|-------|----------|----------|
| `sh` no se reconoce | Estás en PowerShell/CMD y ese shell no trae `sh`. | Usa WSL o Git Bash. | `floci --version` |
| `Unsupported OS: mingw64_nt` | Git Bash/MSYS2 fue detectado como sistema no soportado. | Ejecuta desde WSL o usa Docker Compose. | `uname -s && floci --version` |
| `GID 1000 is already in use` | Conflicto de usuario/grupo en WSL. | Reinstala la distro de práctica o crea otro usuario. | `whoami && id` |
| `Bind for 0.0.0.0:4566 failed` | Otro contenedor usa el puerto 4566. | Detén el contenedor que ocupa el puerto. | `docker ps --filter "publish=4566"` |
| `Unable to locate credentials` | No cargaste variables locales de AWS. | Carga `floci env` según tu shell. | `aws sts get-caller-identity` |
| `docker.sock permission denied` | Tu usuario no puede usar Docker. | Agrégalo al grupo docker y reinicia sesión. | `docker info` |
| `Unable to find image floci/floci-ui:latest` | Este curso no depende de una imagen UI oficial. | Usa StackPort con Docker Compose. | `docker compose ps` |

### Windows: instalación recomendada

```bash
wsl --install -d kali-linux
wsl -d kali-linux -e bash -c "curl -fsSL https://floci.io/install.sh | sh"
```

### Git Bash

```bash
curl -fsSL https://floci.io/install.sh | bash
```

Si falla por `mingw64_nt`, no pelees con el instalador: cambia a WSL o usa Docker Compose.

### Puerto 4566 ocupado

```bash
docker ps -a --filter "publish=4566"
docker stop <container-id>
docker rm <container-id>
floci start
```

No borres contenedores sin mirar el nombre: podrías detener otro laboratorio. Si este proyecto levantó Floci con Compose, usa:

```bash
docker compose down
docker compose up -d floci stackport
```

### Credenciales AWS locales

Linux/macOS/WSL:

```bash
eval $(floci env)
```

PowerShell:

```powershell
$env:AWS_ENDPOINT_URL="http://localhost:4566"
$env:AWS_ACCESS_KEY_ID="test"
$env:AWS_SECRET_ACCESS_KEY="test"
$env:AWS_DEFAULT_REGION="us-east-1"
```

### Docker permission denied

```bash
sudo usermod -aG docker $USER
# Cierra sesión y vuelve a entrar
docker info
```

### WSL: GID already in use

Si la distro es solo para practicar, reinstala:

```powershell
wsl --unregister kali-linux
wsl --install -d kali-linux
```

Si tienes trabajo guardado, respalda antes de desregistrar la distro.

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

Puedes tener los tres emuladores y una interfaz visual corriendo simultáneamente. El
`docker-compose.yml` del proyecto ya trae Floci y StackPort integrados:

```yaml
services:
  floci:
    image: floci/floci:1.5.22-compat
    ports:
      - "4566:4566"
    environment:
      FLOCI_STORAGE_MODE: persistent
      FLOCI_STORAGE_PERSISTENT_PATH: /app/data
    volumes:
      - ./data:/app/data
      - /var/run/docker.sock:/var/run/docker.sock

  stackport:
    image: davireis/stackport:latest
    depends_on:
      - floci
    ports:
      - "8080:8080"
    environment:
      AWS_ENDPOINT_URL: http://floci:4566
      AWS_ACCESS_KEY_ID: test
      AWS_SECRET_ACCESS_KEY: test
      AWS_REGION: us-east-1

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
docker compose up -d floci stackport
```

Abre `http://localhost:8080` para explorar los recursos AWS locales con
StackPort. Desde tu terminal sigues usando `http://localhost:4566`; dentro de
Compose, StackPort usa `http://floci:4566` porque ambos contenedores comparten
red.

> Floci se aprende y se automatiza desde la CLI. Para inspección visual en este curso usamos StackPort; no uses una imagen `floci/floci-ui:latest` como paso obligatorio.

---

## Comandos útiles de Floci

```bash
floci start              # Inicia el emulador AWS
floci stop               # Detiene el emulador
floci status             # Muestra el estado
floci logs --follow      # Ver logs en tiempo real
floci doctor             # Diagnóstico de problemas
floci doctor --fix       # Si tu versión lo soporta, intenta corregir problemas comunes
floci cleanup            # Si tu versión lo soporta, limpia recursos/contenedores huérfanos
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
