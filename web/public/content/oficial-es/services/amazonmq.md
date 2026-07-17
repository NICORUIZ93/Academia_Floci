# Amazon MQ (RabbitMQ)

**Protocolo:** REST-JSON
**Punto final:** `http://localhost:4566/`

Floci emula Amazon MQ orquestando contenedores **RabbitMQ**. Cada corredor es
respaldado por un contenedor `rabbitmq:3-management` real, por lo que los clientes AMQP y el RabbitMQ
La consola de administración funciona con los puntos finales publicados.

Solo se admiten el motor **RabbitMQ** y el modo de implementación `SINGLE_INSTANCE`;
`CreateBroker` rechaza `ACTIVEMQ` y los modos de implementación multi-AZ.

## Acciones admitidas

| Acción | Descripción |
|---|---|
| `CreateBroker` | Aprovisiona un contenedor RabbitMQ y genera el usuario administrador |
| `DescribeBroker` | Obtenga metadatos, estado y puntos finales de conexión del agente |
| `ListBrokers` | Listar todos los brokers emulados |
| `DeleteBroker` | Detiene y retira el contenedor RabbitMQ |
| `RebootBroker` | Reinicia el corredor |

### Gestión de usuarios

Usuario de Amazon MQ API (`CreateUser`, `DescribeUser`, `ListUsers`, `UpdateUser`,
`DeleteUser`) se aplica **solo a los corredores ActiveMQ**. Como en el AWS real, el Floci rechaza estos
operaciones para brokers RabbitMQ con un `BadRequestException`. Administrar usuarios de RabbitMQ
a través de la consola de gestión RabbitMQ. Se proporciona el administrador inicial del corredor.
en la lista `CreateBroker` `Users` (se requiere exactamente un usuario) y se siembra en la
contenedor.

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_AMAZONMQ_ENABLED` | `true` | Activar o desactivar el servicio |
| `FLOCI_SERVICES_AMAZONMQ_MOCK` | `false` | `true` = CRUD de solo metadatos, sin contenedores Docker |
| `FLOCI_SERVICES_AMAZONMQ_DEFAULT_IMAGE` | `rabbitmq:3-management` | Imagen Docker para contenedores de intermediario RabbitMQ |

## Cómo funciona

Cuando `mock` está configurado en `false` (predeterminado), Floci usa Docker API para iniciar un RabbitMQ.
contenedor para cada corredor creado. Para la configuración del socket Docker, registro privado
autenticación y otras configuraciones de Docker, consulte [Configuración de Docker] (../configuration/docker.md).

- **Asignación de puertos**: el puerto AMQP (5672) y la interfaz de usuario de administración (15672) se asignan a
  un puerto de host dinámico. Utilice los puntos finales devueltos por `DescribeBroker` en lugar de un punto fijo
  puerto.
- **Usuario administrador**: el usuario `CreateBroker` se inicializa a través de `RABBITMQ_DEFAULT_USER` /
  `RABBITMQ_DEFAULT_PASS`. A diferencia del usuario integrado `guest` (que RabbitMQ restringe a
  conexiones loopback), este usuario puede autenticarse a través del puerto asignado.
- **Persistencia**: cada corredor obtiene un volumen Docker con nombre. En el modo de memoria el volumen es
  eliminado al eliminar el corredor; en modos persistentes se retiene a menos que
  `FLOCI_STORAGE_PRUNE_VOLUMES_ON_DELETE=true`.
- **Preparación**: el estado del corredor pasa a `RUNNING` una vez que se administra RabbitMQ.
  API responde en su puerto.

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Create a broker (exactly one admin user is required for RabbitMQ)
aws mq create-broker \
  --broker-name my-broker \
  --engine-type RABBITMQ \
  --engine-version "3.13" \
  --deployment-mode SINGLE_INSTANCE \
  --host-instance-type mq.t3.micro \
  --no-publicly-accessible \
  --auto-minor-version-upgrade \
  --users '[{"Username":"admin","Password":"AdminPass123","ConsoleAccess":true}]' \
  --endpoint-url $AWS_ENDPOINT_URL

# Describe a broker (poll until BrokerState is RUNNING)
BROKER_ID=$(aws mq list-brokers --query 'BrokerSummaries[0].BrokerId' --output text --endpoint-url $AWS_ENDPOINT_URL)
aws mq describe-broker --broker-id $BROKER_ID --endpoint-url $AWS_ENDPOINT_URL

# Delete a broker
aws mq delete-broker --broker-id $BROKER_ID --endpoint-url $AWS_ENDPOINT_URL
```
