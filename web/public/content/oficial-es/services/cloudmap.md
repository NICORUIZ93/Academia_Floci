# AWS Mapa de la nube

**Protocolo:** JSON 1.1
**Encabezado:** `X-Amz-Target: Route53AutoNaming_v20170314.<Action>`
**Prefijo de punto final:** `servicediscovery`

Floci emula el plano de control de AWS Cloud Map (descubrimiento de servicios) en proceso:
Los espacios de nombres, los servicios y las instancias registradas se almacenan como conscientes de la cuenta.
objetos de dominio y las consultas de descubrimiento se resuelven en función de ese estado en memoria.

Operaciones asíncronas (`CreateHttpNamespace`, `CreatePublicDnsNamespace`,
`CreatePrivateDnsNamespace`, `DeleteNamespace`, `RegisterInstance`,
`DeregisterInstance`) aplican su efecto de forma sincrónica y devuelven una operación
identificación La operación llega inmediatamente a `SUCCESS` de forma predeterminada, por lo que se debe realizar un seguimiento.
La llamada `GetOperation` devuelve una operación completa sin sondeo. Sin DNS real
Se crean registros o zonas alojadas de Route 53: DNS público y privado.
A los espacios de nombres se les asigna un `HostedZoneId` sintético para que los clientes SDK y CLI puedan
ejercer el flujo de control completo de Cloud Map localmente.

## Operaciones compatibles

| Operación | Notas |
|-----------|-------|
| `CreateHttpNamespace` | Crea un espacio de nombres `HTTP`; devuelve una identificación de operación |
| `CreatePublicDnsNamespace` | Crea un espacio de nombres `DNS_PUBLIC` con un `HostedZoneId` sintético |
| `CreatePrivateDnsNamespace` | Crea un espacio de nombres `DNS_PRIVATE`; requiere `Vpc`, asigna un `HostedZoneId` |
| `GetNamespace` | Devuelve un espacio de nombres por `Id` |
| `ListNamespaces` | Muestra espacios de nombres en la región actual |
| `DeleteNamespace` | Elimina un espacio de nombres vacío; falla con `ResourceInUse` si aún tiene servicios |
| `CreateService` | Crea un servicio (opcionalmente bajo un espacio de nombres), rastrea la revisión y el recuento de instancias |
| `GetService` | Devuelve un servicio por `Id` |
| `ListServices` | Enumera los servicios, opcionalmente filtrados por `NamespaceId` |
| `DeleteService` | Elimina un servicio sin instancias; falla con `ResourceInUse` en caso contrario |
| `RegisterInstance` | Registra una instancia bajo un servicio; requiere `InstanceId` y `Attributes`, revisión del servicio de topes |
| `DeregisterInstance` | Elimina una instancia registrada y modifica la revisión del servicio |
| `GetInstance` | Devuelve una instancia registrada por `ServiceId` y `InstanceId` |
| `ListInstances` | Enumera instancias registradas bajo un servicio |
| `GetInstancesHealthStatus` | Devuelve el estado de salud codificado por ID de instancia, con filtro `Instances` opcional |
| `DiscoverInstances` | Resuelve instancias por `NamespaceName` + `ServiceName`, con filtrado `HealthStatus` y `QueryParameters` |
| `DiscoverInstancesRevision` | Devuelve la revisión actual de un servicio descubierto |
| `GetOperation` | Devuelve una operación de `Id` |
| `ListOperations` | Enumera operaciones con filtros opcionales `STATUS`, `TYPE`, `NAMESPACE_ID` y `SERVICE_ID` |
| `TagResource` | Agrega etiquetas a un espacio de nombres o servicio ARN |
| `UntagResource` | Elimina claves de etiquetas de un espacio de nombres o servicio ARN |
| `ListTagsForResource` | Enumera etiquetas para un espacio de nombres o servicio ARN |

`DiscoverInstances` es compatible con `HEALTHY`, `UNHEALTHY`, `HEALTHY_OR_ELSE_ALL`,
y filtros de salud `ALL`, y coincide con instancias cuyos atributos contienen todos
par clave/valor suministrado en `QueryParameters`.

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_CLOUDMAP_ENABLED` | `true` | Activar o desactivar el servicio |
| `FLOCI_SERVICES_CLOUDMAP_OPERATION_COMPLETION_DELAY_SECONDS` | `0` | Retraso antes de que una operación asíncrona pase de `PENDING` a `SUCCESS`; `0` se completa inmediatamente |

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test

aws servicediscovery create-http-namespace --name floci-demo

aws servicediscovery list-namespaces

aws servicediscovery create-service \
  --name backend \
  --namespace-id ns-xxxxxxxxxxxxxxxxxxxx

aws servicediscovery register-instance \
  --service-id srv-xxxxxxxxxxxxxxxxxxxx \
  --instance-id i-0123456789 \
  --attributes AWS_INSTANCE_IPV4=10.0.0.10

aws servicediscovery discover-instances \
  --namespace-name floci-demo \
  --service-name backend
```

```python
import boto3

client = boto3.client(
    "servicediscovery",
    endpoint_url="http://localhost:4566",
    region_name="us-east-1",
)

ns = client.create_http_namespace(Name="floci-demo")
client.get_operation(OperationId=ns["OperationId"])  # Status == "SUCCESS"

namespace_id = client.list_namespaces()["Namespaces"][0]["Id"]
service = client.create_service(Name="backend", NamespaceId=namespace_id)

client.register_instance(
    ServiceId=service["Service"]["Id"],
    InstanceId="i-0123456789",
    Attributes={"AWS_INSTANCE_IPV4": "10.0.0.10"},
)

found = client.discover_instances(NamespaceName="floci-demo", ServiceName="backend")
print(found["Instances"])
```

## Documentos relacionados

- [Descripción general de servicios](index.md)
- [Route53](route53.md)
- [Configuración de AWS CLI y SDK](../getting-started/aws-setup.md)
- [Variables de entorno](../configuration/environment-variables.md)

## Fuera de alcance

- Resolución DNS real o creación de conjunto de registros/zona alojada de Route 53.
- Verificaciones de estado de Route 53 que respaldan `HealthCheckConfig` (el estado de salud personalizado se almacena, no se prueba activamente).
- Descubrimiento de servicios y espacios de nombres entre regiones.
