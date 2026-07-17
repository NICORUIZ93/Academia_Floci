# Configuración de Docker

Floci genera contenedores Docker reales para servicios que los necesitan: Lambda, RDS, ElastiCache, OpenSearch, MSK y ECS. Todos estos comparten la misma configuración de cliente Docker, controlada bajo `floci.docker`.

## Docker Zócalo de demonio

De forma predeterminada, Floci se conecta al demonio local Docker a través del socket Unix. Anúlelo con `docker-host` cuando sea necesario (por ejemplo, un host Docker remoto o una ruta de socket no estándar):

```yaml
floci:
  docker:
    docker-host: unix:///var/run/docker.sock
```

Variable de entorno: `FLOCI_DOCKER_DOCKER_HOST`

Cuando ejecute Floci dentro de Docker Compose, monte el socket del host:

```yaml
services:
  floci:
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
```

## Autenticación de registro privado

Cualquier servicio que extraiga una imagen de contenedor de un registro privado (funciones de imagen Lambda, imágenes OpenSearch personalizadas, imágenes privadas de Postgres, etc.) necesita credenciales Docker. Se admiten dos enfoques que se pueden combinar.

### Montar la configuración del host Docker

Reutiliza sesiones `docker login` existentes y asistentes de credenciales de la máquina host. Monte el directorio del host `~/.docker` y apunte Floci hacia él:

```yaml
services:
  floci:
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ~/.docker:/root/.docker:ro
    environment:
      FLOCI_DOCKER_DOCKER_CONFIG_PATH: /root/.docker
```

O en `application.yml`:

```yaml
floci:
  docker:
    docker-config-path: /root/.docker
```

Esto funciona con cualquier asistente de credencial configurado en el host (`docker-credential-desktop`, `ecr-credential-helper`, etc.) siempre que el binario auxiliar también esté disponible dentro del contenedor Floci.

### Credenciales explícitas por registro

Para entornos de CI o configuraciones aisladas donde montar el sistema de archivos host no es práctico:

```yaml
services:
  floci:
    environment:
      FLOCI_DOCKER_REGISTRY_CREDENTIALS_0__SERVER: myregistry.example.com
      FLOCI_DOCKER_REGISTRY_CREDENTIALS_0__USERNAME: myuser
      FLOCI_DOCKER_REGISTRY_CREDENTIALS_0__PASSWORD: mypassword
      # Add more registries by incrementing the index:
      # FLOCI_DOCKER_REGISTRY_CREDENTIALS_1__SERVER: other.registry.io
      # FLOCI_DOCKER_REGISTRY_CREDENTIALS_1__USERNAME: ...
      # FLOCI_DOCKER_REGISTRY_CREDENTIALS_1__PASSWORD: ...
```

O en `application.yml`:

```yaml
floci:
  docker:
    registry-credentials:
      - server: myregistry.example.com
        username: myuser
        password: mypassword
      - server: other.registry.io
        username: otheruser
        password: otherpassword
```

El campo `server` debe coincidir con el nombre de host del registro exactamente como aparece en el URI de la imagen (por ejemplo, `myregistry.example.com` para `myregistry.example.com/repo:tag`). Las imágenes del concentrador Docker (por ejemplo, `ubuntu:22.04`) tienen un nombre de host vacío y no coinciden con ninguna entrada de credencial explícita; utilice el método de montaje de configuración Docker para la autenticación del concentrador Docker.

### Precedencia

Las credenciales explícitas tienen prioridad para los registros que cubren. Para todo lo demás, Floci recurre al archivo de configuración Docker (si está configurado `docker-config-path`) y luego a una extracción anónima.

## Configuración de registro del contenedor

Configure la rotación de registros para todos los contenedores generados por Floci:

```yaml
floci:
  docker:
    log-max-size: "10m"   # Max size per log file before rotation (Docker json-file format)
    log-max-file: "3"     # Number of rotated log files to retain per container
```

## Red Docker

Los contenedores generados por Floci (Lambda, RDS, ElastiCache, OpenSearch, MSK, ECS) deben estar en la misma red Docker para comunicarse entre sí y con el propio Floci.

Cuando el propio Floci se ejecuta dentro de Docker y no hay ninguna red configurada, detecta automáticamente la red Docker del contenedor actual y la utiliza para los contenedores generados. Sólo necesitas configurar esto manualmente cuando quieras forzar una red específica.

Configure la red compartida en el nivel superior:

```yaml
floci:
  services:
    docker-network: my-project_default
```

Variable de entorno: `FLOCI_SERVICES_DOCKER_NETWORK`

Los servicios individuales pueden anular la red con su propia configuración `docker-network` (por ejemplo, `floci.services.lambda.docker-network`).

!!! propina
    En Docker Compose, el nombre de red predeterminado es `<project-name>_default`. Si su archivo de redacción está en un directorio llamado `myapp`, la red es `myapp_default`.

## ejecutándose en Podman (sin raíz)

Floci se ejecuta bajo Podman sin raíz, pero la topología de red de Podman necesita algunos
configuraciones explícitas que Docker maneja automáticamente. La siguiente configuración
se sabe que funciona:

```bash
podman network create floci-net

podman run -d --name floci \
  --network floci-net \
  -p 4566:4566 \
  -v /run/user/$(id -u)/podman/podman.sock:/var/run/docker.sock:z \
  -e FLOCI_SERVICES_LAMBDA_DOCKER_NETWORK=floci-net \
  -e FLOCI_HOSTNAME=floci \
  floci/floci
```

Qué hace cada configuración y por qué es necesaria:

- **Red con nombre (`floci-net`)**: el puente predeterminado sin raíz no asigna
  IP accesibles entre contenedores, por lo que los contenedores Lambda generados no pueden alcanzar
  Floci. Cree una red con nombre y coloque en ella tanto Floci como sus contenedores Lambda.
- **`FLOCI_SERVICES_LAMBDA_DOCKER_NETWORK=floci-net`** — hace que Floci conecte el
  Los contenedores Lambda se generan en la misma red con el mismo nombre.
- **`FLOCI_HOSTNAME=floci`**: le da a Floci un nombre estable que los contenedores Lambda
  resolver al volver a llamar al tiempo de ejecución API.
- **`:z` en el soporte del zócalo**: vuelve a etiquetar el zócalo Podman para SELinux. sin
  Al hacerlo, Floci no puede comunicarse con el socket Podman: creación de contenedor Lambda/ECR
  errores con `java.io.IOException: Broken pipe` y el sidecar **Floci UI**
  no se inicia con `java.net.BindException: Permission denied`. Utilice el
  `:z` en minúsculas (nueva etiqueta compartida) en lugar de `:Z`: el zócalo Podman API está
  compartido con el servicio Podman, y `:Z` aplica un SELinux privado de contenedor
  etiqueta que puede impedir el acceso. Si `:z` aún no es suficiente en su host, caiga
  volver a `--security-opt label=disable`.

!!! consejo "Cuando aún no se puede acceder a la dirección Runtime API"
    En algunas topologías de red Podman, la dirección Runtime API detectada automáticamente
    (el host/IP que los contenedores Lambda usan para volver a llamar a Floci) sigue siendo incorrecto,
    y las invocaciones fallan con `connect ECONNREFUSED <ip>:9200`. Establecer la dirección
    explícitamente para evitar la detección automática:

    ```bash
    FLOCI_SERVICES_LAMBDA_DOCKER_HOST_OVERRIDE=floci
    ```

    Esto obliga a cada contenedor Lambda generado a alcanzar el tiempo de ejecución API en el
    host dado (aquí el valor `FLOCI_HOSTNAME`), omitiendo el valor de Floci
    detección automática por completo. Consulte los [documentos Lambda](../services/lambda.md#configuration)
    para más detalles.

## Referencia completa

| Variable de entorno | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_DOCKER_DOCKER_HOST` | `unix:///var/run/docker.sock` | Zócalo de demonio Docker |
| `FLOCI_DOCKER_DOCKER_CONFIG_PATH` | _(desarmado)_ | Ruta al directorio que contiene `config.json` de Docker |
| `FLOCI_DOCKER_REGISTRY_CREDENTIALS_0__SERVER` | _(desarmado)_ | Nombre de host del registro para la entrada de credenciales 0 |
| `FLOCI_DOCKER_REGISTRY_CREDENTIALS_0__USERNAME` | _(desarmado)_ | Nombre de usuario para la entrada de credenciales 0 |
| `FLOCI_DOCKER_REGISTRY_CREDENTIALS_0__PASSWORD` | _(desarmado)_ | Contraseña para entrada de credenciales 0 |
| `FLOCI_DOCKER_LOG_MAX_SIZE` | `10m` | Tamaño máximo del archivo de registro del contenedor antes de la rotación |
| `FLOCI_DOCKER_LOG_MAX_FILE` | `3` | Número de archivos de registro rotados que se conservarán |
| `FLOCI_SERVICES_DOCKER_NETWORK` | _(desarmado)_ | Red Docker compartida para todos los servicios basados ​​en contenedores |
