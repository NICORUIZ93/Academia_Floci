# CodeBuild

Floci implementa CodeBuild API: administración de estado almacenado más ejecución de compilación real dentro de contenedores Docker.

**Protocolo:** JSON 1.1 — `POST /` con `X-Amz-Target: CodeBuild_20161006.<Action>`

**Formatos ARN:**

- `arn:aws:codebuild:<region>:<account>:project/<name>`
- `arn:aws:codebuild:<region>:<account>:report-group/<name>`
- `arn:aws:codebuild:<region>:<account>:token/<type>-<uuid>`
- `arn:aws:codebuild:<region>:<account>:build/<project>:<uuid>`

## Operaciones admitidas (20 en total)

### Proyectos

| Operación | Notas |
|---|---|
| `CreateProject` | Almacena la configuración del proyecto; requiere `name`, `source.type`, `artifacts.type`, `environment`, `serviceRole` |
| `UpdateProject` | Actualización parcial: solo se modifican los campos proporcionados |
| `DeleteProject` | Elimina proyecto por nombre |
| `BatchGetProjects` | Devuelve proyectos encontrados y una lista `projectsNotFound` |
| `ListProjects` | Devuelve todos los nombres de proyectos en la región |

### Ejecución de compilación

| Operación | Notas |
|---|---|
| `StartBuild` | Lanza un contenedor Docker real utilizando la imagen del proyecto; ejecuta fases de especificación de compilación (`INSTALL`, `PRE_BUILD`, `BUILD`, `POST_BUILD`); regresa inmediatamente con el estado `IN_PROGRESS` |
| `BatchGetBuilds` | Devuelve el estado de construcción actual; encuesta hasta que `buildComplete` sea `true` |
| `ListBuilds` | Devuelve todos los ID de compilación de la región, el más reciente primero |
| `ListBuildsForProject` | Devuelve ID de compilación para un proyecto específico |
| `StopBuild` | Señala una construcción en ejecución para que se detenga; construir transiciones a `STOPPED` |
| `RetryBuild` | Inicia una nueva compilación usando la misma configuración que una compilación completa; devuelve un nuevo registro de compilación |

### Grupos de informes

| Operación | Notas |
|---|---|
| `CreateReportGroup` | Almacena la configuración del grupo de informes |
| `UpdateReportGroup` | Actualización parcial por ARN |
| `DeleteReportGroup` | Elimina el grupo de informes de ARN |
| `BatchGetReportGroups` | Devuelve grupos de informes encontrados y una lista `reportGroupsNotFound` |
| `ListReportGroups` | Devuelve todos los ARN de los grupos de informes de la región |

### Credenciales de origen

| Operación | Notas |
|---|---|
| `ImportSourceCredentials` | Almacena el tipo de servidor y el tipo de autenticación; deduplicado por `serverType+authType`; token se acepta pero no se devuelve |
| `ListSourceCredentials` | Devuelve metadatos de credenciales almacenados (sin tokens) |
| `DeleteSourceCredentials` | Elimina las credenciales de origen mediante ARN |

### Imágenes

| Operación | Notas |
|---|---|
| `ListCuratedEnvironmentImages` | Devuelve una lista estática de imágenes estándar CodeBuild para AL2 y Ubuntu |

## Modelo de ejecución de compilación

Cada llamada `StartBuild`:

1. Extrae la imagen Docker del proyecto (por ejemplo, `public.ecr.aws/docker/library/alpine:latest`).
2. Inicia un contenedor con los directorios de trabajo creados previamente.
3. Inyecta archivos fuente en el contenedor a través de `docker cp` (las compilaciones `NO_SOURCE` omiten este paso)
4. Ejecuta las fases de compilación de forma secuencial dentro del contenedor a través de `docker exec`.
5. Transmite la salida de fase a los registros CloudWatch en `/aws/codebuild/<project>`
6. Extrae archivos de artefactos del contenedor a través de `docker cp` y los carga en S3 si es `artifacts.type=S3`.
7. Marca la compilación completa con `SUCCEEDED`, `FAILED` o `STOPPED`.

La inyección de código fuente y la extracción de artefactos utilizan los puntos finales de copia de archivo de Docker API; no se requieren montajes de enlace. Esto funciona correctamente cuando el propio Floci se ejecuta dentro de un contenedor Docker (Docker-in-Docker).

## Soporte de especificaciones de compilación

Floci analiza el `buildspec.yml` integrado en el proyecto o proporcionado a través de `buildspecOverride`. Campos admitidos:

- Listas de comandos `phases` — `install`, `pre_build`, `build`, `post_build`
- `artifacts.files` — lista de patrones de archivos para recopilar; admite globos `**/*`, nombres de archivos específicos y patrones de ruta
- `artifacts.base-directory`: directorio base para la colección de artefactos (predeterminado: `$CODEBUILD_SRC_DIR`)

## Carga de artefacto

Cuando `artifacts.type=S3`, los archivos recopilados se cargan en el depósito S3 configurado. El depósito debe existir (creado mediante `CreateBucket`). Las rutas de archivo en S3 coinciden con la ruta relativa del directorio base del artefacto.

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_CODEBUILD_ENABLED` | `true` | Activar o desactivar el servicio |

## Ejemplos de CLI

```bash
# Create a project with S3 artifacts
aws --endpoint-url http://localhost:4566 codebuild create-project \
  --name my-project \
  --source type=NO_SOURCE \
  --artifacts type=S3,location=my-bucket \
  --environment type=LINUX_CONTAINER,image=public.ecr.aws/docker/library/alpine:latest,computeType=BUILD_GENERAL1_SMALL \
  --service-role arn:aws:iam::000000000000:role/codebuild-role

# Start a build with inline buildspec
aws --endpoint-url http://localhost:4566 codebuild start-build \
  --project-name my-project \
  --buildspec-override 'version: 0.2
phases:
  build:
    commands:
      - echo hello > output.txt
artifacts:
  files:
    - output.txt'

# Poll until complete
aws --endpoint-url http://localhost:4566 codebuild batch-get-builds --ids <build-id>

# List all builds
aws --endpoint-url http://localhost:4566 codebuild list-builds

# List curated images
aws --endpoint-url http://localhost:4566 codebuild list-curated-environment-images
```
