# Servicio OpenSearch

**Protocolo:** REST JSON  
**Punto final:** `http://localhost:4566/2021-01-01/...`  
**Alcance de la credencial:** `es`

## Modos de implementación de

OpenSearch admite dos modos controlados por `FLOCI_SERVICES_OPENSEARCH_MOCK`.

### Modo simulado (`mock: true`)

Los metadatos del dominio se almacenan durante el proceso. No se inicia ningún contenedor Docker. Los dominios aparecen `Created: true` y `Processing: false` inmediatamente. Úselo en CI o cuando solo necesite la forma de administración API, no un clúster de búsqueda real.

### Modo real (`mock: false`, predeterminado)

Floci inicia un contenedor **OpenSearch** Docker por dominio, eligiendo la imagen en función del `EngineVersion` solicitado (por ejemplo, `OpenSearch_3.6` → `opensearchproject/opensearch:3.6.0`, `Elasticsearch_7.10` → `docker.elastic.co/elasticsearch/elasticsearch-oss:7.10.2`). El contenedor está expuesto en un puerto de host del rango configurado (`9400–9499`). Una vez que `/_cluster/health` devuelve `green` o `yellow`, el dominio pasa a `Created: true` y el campo `Endpoint` se completa con la dirección del contenedor.

OpenSearch 2.12+ requiere una contraseña de administrador inicial incluso cuando el complemento de seguridad está deshabilitado; Floci configura `OPENSEARCH_INITIAL_ADMIN_PASSWORD=FlociAdmin1!` automáticamente para esas versiones. El complemento de seguridad permanece deshabilitado.

!!! nota "Se requiere enchufe Docker"
    El modo real inicia los contenedores Docker. Monte el zócalo Docker y configure la red Docker para que los contenedores puedan comunicarse entre sí. Para la autenticación de registro privado y otras configuraciones de Docker, consulte [Configuración de Docker](../configuration/docker.md).

```yaml
services:
  floci:
    image: floci/floci:latest
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    ports:
      - "4566:4566"
    environment:
      FLOCI_SERVICES_DOCKER_NETWORK: my_project_default
```

## Operaciones compatibles

### Ciclo de vida del dominio

| Operación | Método + Ruta | Descripción |
|---|---|---|
| `CreateDomain` | `POST /2021-01-01/opensearch/domain` | Crear un nuevo dominio |
| `DescribeDomain` | `GET /2021-01-01/opensearch/domain/{name}` | Obtener detalles del dominio |
| `DescribeDomains` | `POST /2021-01-01/opensearch/domain-info` | Lote describe dominios |
| `DescribeDomainConfig` | `GET /2021-01-01/opensearch/domain/{name}/config` | Obtener configuración de dominio |
| `UpdateDomainConfig` | `POST /2021-01-01/opensearch/domain/{name}/config` | Actualizar configuración del clúster, opciones de EBS, versión del motor |
| `DeleteDomain` | `DELETE /2021-01-01/opensearch/domain/{name}` | Eliminar un dominio |
| `ListDomainNames` | `GET /2021-01-01/domain` | Listar todos los dominios (admite el filtro `?engineType=`) |

### Etiquetas

| Operación | Método + Ruta | Descripción |
|---|---|---|
| `AddTags` | `POST /2021-01-01/tags` | Agregar etiquetas a un dominio por ARN |
| `ListTags` | `GET /2021-01-01/tags/?arn=` | Listar etiquetas para un dominio |
| `RemoveTags` | `POST /2021-01-01/tags-removal` | Eliminar claves de etiquetas de un dominio |

### Versiones y tipos de instancias de

| Operación | Método + Ruta | Descripción |
|---|---|---|
| `ListVersions` | `GET /2021-01-01/opensearch/versions` | Lista de versiones de motor compatibles |
| `GetCompatibleVersions` | `GET /2021-01-01/opensearch/compatibleVersions` | Listar rutas de actualización válidas |
| `ListInstanceTypeDetails` | `GET /2021-01-01/opensearch/instanceTypeDetails/{version}` | Listar tipos de instancias disponibles |
| `DescribeInstanceTypeLimits` | `GET /2021-01-01/opensearch/instanceTypeLimits/{version}/{type}` | Obtener límites para un tipo de instancia |

### Talones (respuestas no operativas compatibles con SDK)

| Operación | Notas |
|---|---|
| `DescribeDomainChangeProgress` | Devuelve vacío `ChangeProgressStatus` |
| `DescribeDomainAutoTunes` | Devuelve la lista `AutoTunes` vacía |
| `DescribeDryRunProgress` | Devuelve vacío `DryRunProgressStatus` |
| `DescribeDomainHealth` | Devuelve `ClusterHealth: Green` |
| `GetUpgradeHistory` | Devuelve una lista vacía |
| `GetUpgradeStatus` | Devuelve `StepStatus: SUCCEEDED` |
| `UpgradeDomain` | Almacena la nueva versión del motor, regresa inmediatamente con un `UpgradeId` |
| `CancelDomainConfigChange` | Devuelve vacío `CancelledChangeIds` |
| `StartServiceSoftwareUpdate` | Devuelve sin operación `ServiceSoftwareOptions` |
| `CancelServiceSoftwareUpdate` | Devuelve sin operación `ServiceSoftwareOptions` |

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_OPENSEARCH_ENABLED` | `true` | Activar/desactivar el servicio |
| `FLOCI_SERVICES_OPENSEARCH_MOCK` | `false` | `true` = solo metadatos (no Docker) |
| `FLOCI_SERVICES_OPENSEARCH_DEFAULT_IMAGE` | *(desarmado)* | Imagen fija opcional utilizada para cada dominio independientemente de `EngineVersion`. Útil para espejos de registro privados. Cuando no están configuradas, las imágenes se resuelven por versión desde el mapa de versiones integrado. |
| `FLOCI_SERVICES_OPENSEARCH_PROXY_BASE_PORT` | `9400` | Inicio del rango de puertos para modo real |
| `FLOCI_SERVICES_OPENSEARCH_PROXY_MAX_PORT` | `9499` | Fin del rango de puertos para modo real |
| `FLOCI_SERVICES_OPENSEARCH_KEEP_RUNNING_ON_SHUTDOWN` | `false` | Deje los contenedores en funcionamiento después de que se detenga Floci |
| `FLOCI_SERVICES_DOCKER_NETWORK` | *(desarmado)* | Red Docker compartida para todos los servicios basados ​​en contenedores, incluido OpenSearch |
| `FLOCI_STORAGE_SERVICES_OPENSEARCH_FLUSH_INTERVAL_MS` | `5000` | Intervalo de descarga (ms) |

### Modo simulado (CI/pruebas)

Utilice `FLOCI_SERVICES_OPENSEARCH_MOCK=true` cuando solo necesite la forma API:

```yaml
# docker-compose.yml — CI / test environment
services:
  floci:
    image: floci/floci:latest
    environment:
      FLOCI_SERVICES_OPENSEARCH_MOCK: "true"
```

## Comportamiento de emulación

- **Validación de nombre de dominio:** 3 a 28 caracteres, debe comenzar con una letra minúscula, solo letras minúsculas, dígitos y guiones.
- **Formato ARN:** `arn:aws:es:{region}:{accountId}:domain/{domainName}`
- **Formato de ID de dominio:** `{accountId}/{domainName}`
- **Indicador `Created`:** `true` inmediatamente en modo simulado; establecido en `true` por el sondeador de preparación en modo real una vez que `/_cluster/health` informa `green` o `yellow`.
- **Indicador `Processing`:** `false` inmediatamente en modo simulado; `true` hasta que el contenedor esté listo en modo real.
- **Versión predeterminada del motor:** `OpenSearch_2.19`
- **Versiones de motor compatibles:** `OpenSearch_3.6`, `OpenSearch_3.5`, `OpenSearch_3.4`, `OpenSearch_3.3`, `OpenSearch_3.2`, `OpenSearch_3.1`, `OpenSearch_3.0`, `OpenSearch_2.19`, `OpenSearch_2.17`, `OpenSearch_2.15`, `OpenSearch_2.13`, `OpenSearch_2.11`, `OpenSearch_2.9`, `OpenSearch_2.7`, `OpenSearch_2.5`, `OpenSearch_2.3`, `OpenSearch_1.3`, `OpenSearch_1.2`, `Elasticsearch_7.10`, `Elasticsearch_7.9`, `Elasticsearch_7.8`
- **Validación de versión:** `CreateDomain`, `UpdateDomainConfig` y `UpgradeDomain` rechazan versiones de motor desconocido con `ValidationException`. `UpgradeDomain` también rechaza objetivos a los que no se puede acceder desde la versión actual según la matriz de actualización documentada de AWS.
- **Valores predeterminados del clúster:** `m5.large.search`, 1 instancia, EBS habilitado con 10 volúmenes GiB `gp2`.
- **Familias de tipos de instancias:** `t3.*` / `m5/m6g/m7g.*` / `r5/r6g/r7g.*` / `c5/c6g/c7g.*` están respaldados por EBS (3584 GiB máx.). `i3.*` son almacenes de instancias NVMe locales. `or1.*` tiene respaldo de S3 y presenta un techo de volumen mucho mayor en `DescribeInstanceTypeLimits` (8–36 TiB según el tamaño). Floci todavía arranca un contenedor Docker por dominio independientemente de la familia: la fidelidad de los metadatos es importante para los clientes SDK que realizan introspección, no para la ubicación de los datos en tiempo de ejecución.
- **Almacenamiento en contenedor:** cada dominio obtiene un volumen Docker con nombre (`floci-opensearch-{volumeId}`) creado automáticamente. En el modo de memoria, el volumen se elimina al eliminar el dominio; en modos persistentes se conserva a menos que `FLOCI_STORAGE_PRUNE_VOLUMES_ON_DELETE=true`.

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test

# Create a domain
aws opensearch create-domain \
  --domain-name my-search \
  --engine-version "OpenSearch_2.11" \
  --cluster-config InstanceType=m5.large.search,InstanceCount=1 \
  --ebs-options EBSEnabled=true,VolumeType=gp2,VolumeSize=10

# Describe the domain
aws opensearch describe-domain --domain-name my-search

# List all domains
aws opensearch list-domain-names

# Update cluster config
aws opensearch update-domain-config \
  --domain-name my-search \
  --cluster-config InstanceCount=3

# Add tags
aws opensearch add-tags \
  --arn arn:aws:es:us-east-1:000000000000:domain/my-search \
  --tag-list Key=env,Value=dev

# List tags
aws opensearch list-tags \
  --arn arn:aws:es:us-east-1:000000000000:domain/my-search

# Delete domain
aws opensearch delete-domain --domain-name my-search
```

## SDK Ejemplo (Java)

```java
OpenSearchClient os = OpenSearchClient.builder()
    .endpointOverride(URI.create("http://localhost:4566"))
    .region(Region.US_EAST_1)
    .credentialsProvider(StaticCredentialsProvider.create(
        AwsBasicCredentials.create("test", "test")))
    .build();

// Create a domain
CreateDomainResponse created = os.createDomain(req -> req
    .domainName("my-search")
    .engineVersion("OpenSearch_2.11")
    .clusterConfig(c -> c
        .instanceType(OpenSearchPartitionInstanceType.M5_LARGE_SEARCH)
        .instanceCount(1))
    .ebsOptions(e -> e
        .ebsEnabled(true)
        .volumeType(VolumeType.GP2)
        .volumeSize(10)));

System.out.println("ARN: " + created.domainStatus().arn());

// Wait for domain to be ready (real mode)
// created.domainStatus().created() == true when ready

// Describe the domain
DescribeDomainResponse desc = os.describeDomain(req -> req
    .domainName("my-search"));

System.out.println("Version: " + desc.domainStatus().engineVersion());
System.out.println("Endpoint: " + desc.domainStatus().endpoint());

// List domains
os.listDomainNames(req -> req.build())
    .domainNames()
    .forEach(d -> System.out.println(d.domainName()));

// Delete
os.deleteDomain(req -> req.domainName("my-search"));
```

## SDK Ejemplo (Python)

```python
import boto3

os_client = boto3.client(
    "opensearch",
    endpoint_url="http://localhost:4566",
    region_name="us-east-1",
    aws_access_key_id="test",
    aws_secret_access_key="test"
)

# Create a domain
response = os_client.create_domain(
    DomainName="my-search",
    EngineVersion="OpenSearch_2.11",
    ClusterConfig={"InstanceType": "m5.large.search", "InstanceCount": 1},
    EBSOptions={"EBSEnabled": True, "VolumeType": "gp2", "VolumeSize": 10}
)
print(response["DomainStatus"]["ARN"])

# List domains
domains = os_client.list_domain_names()
for d in domains["DomainNames"]:
    print(d["DomainName"])

# Delete
os_client.delete_domain(DomainName="my-search")
```

## Limitaciones de

- En el modo simulado, no se atienden puntos finales del plano de datos (`/_search`, `/_index`, etc.); solo se emula el API de administración.
- No hay puntos finales de administración compatibles con Elasticsearch (`/2015-01-01/es/domain/...`).
- `VPCOptions`, `AdvancedSecurityOptions`, `EncryptionAtRestOptions`, `NodeToNodeEncryptionOptions` y `DomainEndpointOptions` de ida y vuelta en `CreateDomain` / `UpdateDomainConfig` / `DescribeDomain` / `DescribeDomainConfig`, pero no los aplica el contenedor en ejecución: Floci sirve el dominio a través de HTTP simple con el complemento de seguridad deshabilitado independientemente. El viaje de ida y vuelta es suficiente para que los clientes SDK (Terraform, CDK, Pulumi) detecten la deriva correctamente.
- Las contraseñas maestras para `AdvancedSecurityOptions.MasterUserOptions` se aceptan pero nunca se repiten, lo que coincide con el comportamiento de AWS.
- Las conexiones entre clústeres, los puntos finales de la VPC, los paquetes, las aplicaciones y las fuentes de datos no son compatibles y devuelven `UnsupportedOperationException`.
