# EC2

**Protocolo:** Consulta EC2 (XML) — `POST http://localhost:4566/` con parámetro `Action=`

## Modelo de ejecución de instancia

`RunInstances` lanza un **contenedor Docker real** para cada instancia. De forma predeterminada, el contenedor se mantiene activo con `tail -f /dev/null`, por lo que cualquier imagen base funciona independientemente de su CMD predeterminado. Las entradas del catálogo que optan por el tiempo de ejecución invitado `systemd` inician `/sbin/init`, con los montajes Docker necesarios para un invitado de imagen en la nube basado en systemd.

| Estado EC2 | Funcionamiento Docker |
|---|---|
| `pending → running` | Contenedor creado e iniciado |
| `running → stopping → stopped` | `docker stop` (tiempo de espera de 30 s, luego SIGKILL) |
| `stopped → pending → running` | `docker start` |
| `running → shutting-down → terminated` | `docker rm -f` |
| Reiniciar | `docker restart` |

Las instancias terminadas permanecen consultables durante 1 hora (que coinciden con el comportamiento real del desecho EC2) antes de ser eliminadas.

## Mapeo de imágenes de AMI a Docker

Floci resuelve los ID de AMI en imágenes Docker del catálogo de imágenes EC2 en
`src/main/resources/ec2/image-catalog.yaml`. El mismo catálogo almacena el
imagen alternativa Docker, asignaciones de imágenes Docker por AMI y `DescribeImages`
metadatos.

| ID AMI | Alias ​​| Imagen Docker |
|---|---|---|
| `ami-0abcdef1234567890` | `ami-amazonlinux2` | `public.ecr.aws/amazonlinux/amazonlinux:2` |
| `ami-0abcdef1234567891` | `ami-amazonlinux2023` | `public.ecr.aws/amazonlinux/amazonlinux:2023` |
| `ami-0abcdef1234567892` | `ami-ubuntu2004` | `public.ecr.aws/docker/library/ubuntu:20.04` |
| `ami-ubuntu2204` | | `public.ecr.aws/docker/library/ubuntu:22.04` |
| `ami-ubuntu2404-arm64` | `ami-ubuntu2404` | `public.ecr.aws/docker/library/ubuntu:24.04` |
| `ami-ubuntu2404-amd64` | | `public.ecr.aws/docker/library/ubuntu:24.04` |
| `ami-ubuntu2404-cloud-arm64` | `ami-ubuntu2404-cloud` | `floci/ami-ubuntu:24.04-arm64` |
| `ami-debian12` | | `public.ecr.aws/docker/library/debian:12` |
| `ami-alpine` | | `public.ecr.aws/docker/library/alpine:latest` |
| `ami-0abcdef1234567893` | | `public.ecr.aws/amazonlinux/amazonlinux:2023` |

Cualquier ID de AMI no reconocido (incluidos los ID de AMI AWS reales como `ami-0abc12345678`) vuelve al catálogo `defaultDockerImage` (`public.ecr.aws/amazonlinux/amazonlinux:2023` de forma predeterminada).

### Invitados AMI derivados de imágenes en la nube

La entrada `ami-ubuntu2404-cloud` es una imagen invitada experimental de Ubuntu 24.04 creada a partir de artefactos de imágenes de nube de Canonical, no de la imagen `ubuntu:24.04` de la biblioteca Docker. Está destinado a flujos de trabajo EC2 que necesitan paquetes como `systemd` y `cloud-init` para coincidir más estrechamente con una imagen real de la nube de Ubuntu.

Este modo se activa mediante la selección de AMI, no mediante un interruptor de configuración global.
Las entradas de catálogo existentes, incluido `ami-ubuntu2404`, mantienen su estado actual.
Mapeo de imágenes de biblioteca Docker y contenedor `tail -f /dev/null` predeterminado
ciclo de vida. La entrada derivada de la imagen de la nube es un ID y un alias de AMI separados, por lo que
`DescribeImages` puede anunciarlo mientras las personas que llaman continúan obteniendo el
comportamiento anterior a menos que elijan `ami-ubuntu2404-cloud-arm64` o el
Alias `ami-ubuntu2404-cloud`.

El generador basado en metadatos Java se encuentra en `io.github.hectorvent.floci.tools.ami.AmiImageTool`. Su receta está registrada en `docker/ec2/ami-images/image-build-metadata.yaml` y el contexto/procedencia generado es predeterminado en `target/ami-images/<image-id>/`.

```bash
./mvnw -q -DskipTests compile exec:java \
  -Dexec.mainClass=io.github.hectorvent.floci.tools.ami.AmiImageTool \
  -Dexec.args="plan --image-id ubuntu-24.04-arm64"

./mvnw -q -DskipTests compile exec:java \
  -Dexec.mainClass=io.github.hectorvent.floci.tools.ami.AmiImageTool \
  -Dexec.args="generate --image-id ubuntu-24.04-arm64"

./mvnw -q -DskipTests compile exec:java \
  -Dexec.mainClass=io.github.hectorvent.floci.tools.ami.AmiImageTool \
  -Dexec.args="build --image-id ubuntu-24.04-arm64"

./mvnw -q -DskipTests compile exec:java \
  -Dexec.mainClass=io.github.hectorvent.floci.tools.ami.AmiImageTool \
  -Dexec.args="smoke --image-id ubuntu-24.04-arm64"
```

## Inyección de clave SSH

Si se especifica `KeyName` en el inicio, Floci busca el material de clave pública del par de claves almacenado (configurado a través de `ImportKeyPair`) y lo copia en `/root/.ssh/authorized_keys` dentro del contenedor en el inicio. Luego intenta iniciar `sshd` si está presente. El puerto SSH (puerto de contenedor 22) está asignado a un puerto de host del rango configurado (predeterminado 2200–2299).

Los pares de claves creados con `CreateKeyPair` contienen material de clave privada ficticia. Importe un par de claves reales con `ImportKeyPair` para permitir el acceso SSH funcional.

## Publicación de puertos del grupo de seguridad

Cuando los grupos de seguridad de una instancia abren un puerto TCP a una fuente CIDR, Floci publica ese puerto en el host para que pueda acceder a la aplicación desde `localhost`. Para cada puerto abierto, Floci inicia un pequeño contenedor sidecar `alpine/socat` que vincula un puerto de host asignado (rango predeterminado 30000–30999) y lo reenvía a la IP del contenedor de instancia. Esto funciona tanto para las reglas presentes en el lanzamiento como para las reglas agregadas posteriormente con `authorize-security-group-ingress`; revocar la regla elimina al delantero. La asignación (`app port -> host port`) se escribe en los registros:

```
Published EC2 instance i-0abc... app port 80 on host port 30000 (socat -> 172.17.0.3:80)
```

Notas y limitaciones:

- La aplicación dentro de la instancia debe escuchar en `0.0.0.0` (no en `127.0.0.1`) para que el reenviado llegue a ella.
- Solo se publican reglas TCP obtenidas con CIDR. Un puerto abierto solo para un grupo de seguridad al que se hace referencia (o mediante una lista de prefijos) no se publica y coincide con AWS: estos otorgan accesibilidad desde las IP privadas del grupo al que se hace referencia, no desde el host. El valor CIDR de origen en sí no se aplica, por lo que se puede acceder a un puerto de origen CIDR independientemente de que la regla sea `0.0.0.0/0` o más estrecha.
- Los puertos se agregan en todos los grupos de seguridad de la instancia, SSH (22) nunca se reenvía y cualquier regla cuyo intervalo de puerto exceda `max-published-ports-per-instance` (predeterminado 20) se omite, por lo que un rango de permitir todo no puede generar miles de sidecars. El total publicado por instancia tiene un límite igual.
- Detener una instancia derriba sus delanteros; iniciarlo de nuevo no los restaura automáticamente (vuelva a ejecutar `authorize-security-group-ingress` o vuelva a crear la instancia).
- Configure `publish-security-group-ports: false` (`FLOCI_SERVICES_EC2_PUBLISH_SECURITY_GROUP_PORTS=false`) para mantener los grupos de seguridad solo como metadatos.

## UserData

`UserData` debe estar codificado en base64 en la solicitud (que coincida con el formato de cable AWS). Floci lo decodifica, copia el script en `/tmp/user-data.sh` dentro del contenedor y ejecuta el script directamente después de la inyección de la clave SSH para que el script seleccione al intérprete. La salida se captura y registra.

Los contenedores EC2 reciben llamadas de servicio `AWS_EC2_METADATA_SERVICE_ENDPOINT` para IMDS y `AWS_ENDPOINT_URL` para AWS y API a Floci.

## Servicio de metadatos de instancia (IMDS)

Floci ejecuta un servidor HTTP compatible con IMDS en el puerto `9169` del host. Cada contenedor lanzado recibe la variable de entorno `AWS_EC2_METADATA_SERVICE_ENDPOINT` que apunta a este servidor.

Se admiten flujos IMDSv1 (sin token) e IMDSv2 (basados ​​en token):

```bash
# IMDSv2 — get a token first
TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" \
  -H "x-aws-ec2-metadata-token-ttl-seconds: 21600")

# Then use the token for metadata requests
curl -s -H "x-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/meta-data/instance-id
```

### Puntos finales IMDS compatibles

| Punto final | Devoluciones |
|---|---|
| `GET /latest/meta-data/instance-id` | ID de instancia |
| `GET /latest/meta-data/ami-id` | Identificación de imagen |
| `GET /latest/meta-data/instance-type` | Tipo de instancia |
| `GET /latest/meta-data/local-ipv4` | IP privada |
| `GET /latest/meta-data/public-ipv4` | IP pública (`127.0.0.1`) |
| `GET /latest/meta-data/public-hostname` | Nombre de host público |
| `GET /latest/meta-data/local-hostname` | Nombre DNS privado |
| `GET /latest/meta-data/hostname` | Nombre DNS privado |
| `GET /latest/meta-data/mac` | Dirección MAC del primer ENI |
| `GET /latest/meta-data/security-groups` | Nombres de grupos de seguridad |
| `GET /latest/meta-data/placement/availability-zone` | AZ |
| `GET /latest/meta-data/placement/region` | Región |
| `GET /latest/meta-data/iam/info` | Información del perfil de instancia IAM |
| `GET /latest/meta-data/iam/security-credentials/` | Lista de nombres de roles |
| `GET /latest/meta-data/iam/security-credentials/{role}` | Credenciales temporales |
| `GET /latest/user-data` | Script UserData |
| `GET /latest/dynamic/instance-identity/document` | Documento de identidad JSON |

Las credenciales IAM se entregan cuando la instancia tiene un `IamInstanceProfile.Arn` configurado en el lanzamiento. Luego, el contenedor puede llamar a otros servicios Floci con validación SigV4 completa utilizando la cadena de credenciales estándar AWS SDK.

## Recursos predeterminados de

Floci genera los siguientes recursos en el primer uso en cada región para que los clientes Terraform, AWS CLI y SDK funcionen de inmediato sin ninguna configuración:

| Recurso | identificación | Detalles |
|---|---|---|
| VPC predeterminada | `vpc-default` | CIDR `172.31.0.0/16` |
| Subred predeterminada (AZ a) | `subnet-default-a` | CIDR `172.31.0.0/20` |
| Subred predeterminada (AZ b) | `subnet-default-b` | CIDR `172.31.16.0/20` |
| Subred predeterminada (AZ c) | `subnet-default-c` | CIDR `172.31.32.0/20` |
| Grupo de seguridad predeterminado | `sg-default` | `groupName=default`, salida para todo tráfico |
| Puerta de enlace de Internet predeterminada | `igw-default` | Adjunto a la VPC predeterminada |
| Tabla de ruta principal | `rtb-default` | Asociado con la VPC predeterminada |
| ACL de red predeterminada | `acl-default` | Permitir todo, asociado con las subredes predeterminadas |

## Acciones admitidas

### Instancias

| Acción | Descripción |
|--------|-------------|
| RunInstances | Crea una o más instancias locales de EC2, iniciando el tiempo de ejecución respaldado por Docker cuando no está en modo simulado. |
| DescribeInstances | Enumera o devuelve instancias EC2 almacenadas. |
| TerminateInstances | Finaliza instancias y actualiza su estado de ciclo de vida almacenado. |
| StartInstances | Inicia instancias detenidas y su tiempo de ejecución local cuando corresponda. |
| StopInstances | Detiene la ejecución de instancias y actualiza su estado de ciclo de vida almacenado. |
| RebootInstances | Reinicia instancias a través del modelo de servicio local EC2. |
| DescribeInstanceStatus | Devuelve registros de estado para instancias almacenadas. |
| DescribeInstanceAttribute | Devuelve un atributo admitido para una instancia. |
| ModifyInstanceAttribute | Las actualizaciones admitieron atributos mutables para una instancia. |

### VPC

| Acción | Descripción |
|--------|-------------|
| CreateVpc | Crea una VPC con el bloque CIDR solicitado. |
| DescribeVpcs | Enumera o devuelve las VPC almacenadas. |
| DeleteVpc | Elimina una VPC del almacén local EC2. |
| ModifyVpcAttribute | Actualizaciones de atributos de VPC compatibles. |
| DescribeVpcAttribute | Devuelve un atributo de VPC admitido. |
| DescribeVpcEndpointServices | Devuelve un catálogo de servicios de punto final de VPC local vacío. |
| CreateVpcEndpoint | Crea un registro de punto final de VPC. |
| DescribeVpcEndpoints | Enumera o devuelve puntos finales de VPC almacenados. |
| DeleteVpcEndpoints | Elimina registros de puntos de enlace de VPC. |
| CreateDefaultVpc | Crea o devuelve la VPC predeterminada para la región. |
| AssociateVpcCidrBlock | Agrega una asociación de bloque CIDR secundaria a una VPC. |
| DisassociateVpcCidrBlock | Elimina una asociación de bloque CIDR secundaria de una VPC. |

### Subredes

| Acción | Descripción |
|--------|-------------|
| CreateSubnet | Crea una subred en una VPC. |
| DescribeSubnets | Enumera o devuelve subredes almacenadas. |
| DeleteSubnet | Elimina una subred del almacén local EC2. |
| ModifySubnetAttribute | Actualiza los atributos de subred admitidos. |

### Grupos de seguridad

| Acción | Descripción |
|--------|-------------|
| CreateSecurityGroup | Crea un grupo de seguridad en una VPC. |
| DescribeSecurityGroups | Enumera o devuelve grupos de seguridad almacenados. |
| DeleteSecurityGroup | Elimina un grupo de seguridad del almacén local EC2. |
| AuthorizeSecurityGroupIngress | Agrega permisos entrantes a un grupo de seguridad. |
| AuthorizeSecurityGroupEgress | Agrega permisos de salida a un grupo de seguridad. |
| RevokeSecurityGroupIngress | Elimina los permisos entrantes de un grupo de seguridad. |
| RevokeSecurityGroupEgress | Elimina los permisos salientes de un grupo de seguridad. |
| DescribeSecurityGroupRules | Enumera las reglas almacenadas del grupo de seguridad. |
| ModifySecurityGroupRules | Actualiza los campos admitidos en las reglas del grupo de seguridad. |
| UpdateSecurityGroupRuleDescriptionsIngress | Actualiza las descripciones sobre la coincidencia de reglas de grupos de seguridad entrantes. |
| UpdateSecurityGroupRuleDescriptionsEgress | Actualiza las descripciones sobre la coincidencia de reglas de grupos de seguridad salientes. |

### Pares de claves

| Acción | Descripción |
|--------|-------------|
| CreateKeyPair | Crea y almacena un par de claves locales. |
| DescribeKeyPairs | Enumera o devuelve pares de claves almacenados. |
| DeleteKeyPair | Elimina un par de claves del almacén local EC2. |
| ImportKeyPair | Importa una clave pública como un par de claves local. |

### AMI

| Acción | Descripción |
|--------|-------------|
| DescribeImages | Devuelve metadatos de AMI conocidos por el servicio EC2 local. |

### Etiquetas

| Acción | Descripción |
|--------|-------------|
| CreateTags | Agrega etiquetas a los recursos EC2 compatibles. |
| DeleteTags | Elimina etiquetas de los recursos EC2 compatibles. |
| DescribeTags | Enumera las etiquetas almacenadas para los recursos EC2. |

### Pasarelas de Internet

| Acción | Descripción |
|--------|-------------|
| CreateInternetGateway | Crea una puerta de enlace a Internet. |
| DescribeInternetGateways | Enumera o devuelve puertas de enlace de Internet almacenadas. |
| DeleteInternetGateway | Elimina una puerta de enlace de Internet. |
| AttachInternetGateway | Adjunta una puerta de enlace de Internet a una VPC. |
| DetachInternetGateway | Desconecta una puerta de enlace de Internet de una VPC. |

### Tablas de ruta

| Acción | Descripción |
|--------|-------------|
| CreateRouteTable | Crea una tabla de rutas en una VPC. |
| DescribeRouteTables | Enumera o devuelve tablas de rutas almacenadas. |
| DeleteRouteTable | Elimina una tabla de rutas del almacén local EC2. |
| AssociateRouteTable | Asocia una tabla de rutas con una subred. |
| DisassociateRouteTable | Elimina una asociación de tabla de rutas. |
| CreateRoute | Agrega una ruta a una tabla de rutas. |
| DeleteRoute | Elimina una ruta de una tabla de rutas. |

### ACL de red

| Acción | Descripción |
|--------|-------------|
| CreateNetworkAcl | Crea una ACL de red en una VPC. |
| DescribeNetworkAcls | Enumera o devuelve las ACL de red almacenadas. |
| DeleteNetworkAcl | Elimina una ACL de red del almacén local EC2. |
| CreateNetworkAclEntry | Agrega una entrada a una ACL de red. |
| ReplaceNetworkAclEntry | Reemplaza una entrada en una ACL de red. |
| DeleteNetworkAclEntry | Elimina una entrada de una ACL de red. |
| ReplaceNetworkAclAssociation | Reemplaza la ACL de red asociada con una subred. |

### Listas de prefijos

| Acción | Descripción |
|--------|-------------|
| DescribePrefixLists | Devuelve listas de prefijos conocidos por el servicio EC2 local. |

### Puertas de enlace NAT

| Acción | Descripción |
|--------|-------------|
| CreateNatGateway | Crea un registro de puerta de enlace NAT. |
| DescribeNatGateways | Enumera o devuelve puertas de enlace NAT almacenadas. |
| DeleteNatGateway | Elimina un registro de puerta de enlace NAT. |

### IP elásticas

| Acción | Descripción |
|--------|-------------|
| AllocateAddress | Asigna un registro de dirección IP elástica. |
| DescribeAddresses | Enumera o devuelve registros de direcciones IP elásticas almacenados. |
| DescribeAddressesAttribute | Devuelve el ID de asignación y los atributos de IP pública para direcciones IP elásticas. |
| AssociateAddress | Asocia una dirección IP elástica con un recurso. |
| DisassociateAddress | Elimina una asociación de dirección IP elástica. |
| ReleaseAddress | Libera un registro de dirección IP elástica. |

### Zonas y regiones de disponibilidad

| Acción | Descripción |
|--------|-------------|
| DescribeAvailabilityZones | Devuelve las zonas de disponibilidad local configuradas. |
| DescribeRegions | Devuelve las regiones conocidas por el servicio EC2 local. |
| DescribeAccountAttributes | Devuelve atributos EC2 a nivel de cuenta local. |

### Tipos de instancia

| Acción | Descripción |
|--------|-------------|
| DescribeInstanceTypes | Devuelve metadatos del tipo de instancia conocidos por el servicio EC2 local. |
| DescribeInstanceTypeOfferings | Devuelve ofertas de tipo de instancia para los filtros de ubicación solicitados. |

### Plantillas de lanzamiento de

| Acción | Descripción |
|--------|-------------|
| CreateLaunchTemplate | Crea una plantilla de lanzamiento con una versión inicial. |
| CreateLaunchTemplateVersion | Crea una nueva versión de la plantilla de lanzamiento, opcionalmente a partir de una versión fuente. |
| DescribeLaunchTemplates | Enumera o devuelve plantillas de lanzamiento almacenadas. |
| DescribeLaunchTemplateVersions | Enumera las versiones almacenadas para una plantilla de lanzamiento. |
| ModifyLaunchTemplate | Las actualizaciones inician metadatos de la plantilla, como la versión predeterminada. |
| DeleteLaunchTemplate | Elimina una plantilla de lanzamiento y sus versiones. |

Las plantillas de lanzamiento almacenan datos de lanzamiento versionados. Se pueden crear nuevas versiones de plantilla a partir de una versión fuente existente, y `ModifyLaunchTemplate` actualiza la versión predeterminada utilizada en lanzamientos posteriores.

### Perfiles de instancia IAM

| Acción | Descripción |
|--------|-------------|
| DescribeIamInstanceProfileAssociations | Enumera las asociaciones de perfiles de instancia IAM conocidas por el servicio EC2 local. |

### Interfaces de red

| Acción | Descripción |
|--------|-------------|
| DescribeNetworkInterfaces | Enumera las interfaces de red conocidas por el servicio local EC2. |

### Volúmenes

| Acción | Descripción |
|--------|-------------|
| CreateVolume | Crea un registro de volumen de EBS. |
| DescribeVolumes | Enumera o devuelve registros de volumen de EBS almacenados. |
| DeleteVolume | Elimina un registro de volumen de EBS. |

## Configuración

| Variable de entorno | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_EC2_IMDS_PORT` | `9169` | Puerto host para el servidor IMDS |
| `FLOCI_SERVICES_EC2_SSH_PORT_RANGE_START` | `2200` | Inicio del rango de puertos del host SSH |
| `FLOCI_SERVICES_EC2_SSH_PORT_RANGE_END` | `2299` | Fin del rango de puertos del host SSH |
| `FLOCI_SERVICES_EC2_PUBLISH_SECURITY_GROUP_PORTS` | `true` | Publicar puertos de entrada del grupo de seguridad TCP en el host mediante sidecars socat |
| `FLOCI_SERVICES_EC2_APP_PORT_RANGE_START` | `30000` | Inicio del rango de puertos de host para puertos de aplicaciones publicadas |
| `FLOCI_SERVICES_EC2_APP_PORT_RANGE_END` | `30999` | Fin del rango de puertos de host para puertos de aplicaciones publicadas |
| `FLOCI_SERVICES_EC2_MAX_PUBLISHED_PORTS_PER_INSTANCE` | `20` | Puertos máximos publicados por instancia; también el rango de regla única más amplio publicado |
| `FLOCI_SERVICES_EC2_SOCAT_IMAGE` | `alpine/socat` | Imagen utilizada para el sidecar de reenvío de puertos |
| `FLOCI_SERVICES_EC2_MOCK` | `false` | Omitir Docker; instancias saltan directamente al estado final (útil para pruebas) |

## Requisitos de

EC2 requiere que se pueda acceder al socket Docker (igual que Lambda, ECS y otros servicios de contenedor):

```yaml
services:
  floci:
    image: floci/floci:latest
    ports:
      - "4566:4566"
      - "9169:9169"   # IMDS — expose if containers need to reach it externally
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
```

El puerto IMDS (`9169`) solo debe publicarse si ejecuta contenedores EC2 fuera de la red puente predeterminada Docker.

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Import an SSH key pair for injection at launch
aws ec2 import-key-pair \
  --key-name my-key \
  --public-key-material fileb://~/.ssh/id_rsa.pub \
  --endpoint-url $AWS_ENDPOINT_URL

# Launch a real Docker container instance with UserData
aws ec2 run-instances \
  --image-id ami-amazonlinux2023 \
  --instance-type t2.micro \
  --min-count 1 \
  --max-count 1 \
  --key-name my-key \
  --user-data '#!/bin/bash
yum install -y nginx
systemctl start nginx' \
  --endpoint-url $AWS_ENDPOINT_URL

# Launch with an IAM instance profile (credentials served via IMDS)
aws ec2 run-instances \
  --image-id ami-amazonlinux2023 \
  --instance-type t2.micro \
  --min-count 1 \
  --max-count 1 \
  --iam-instance-profile Arn=arn:aws:iam::000000000000:instance-profile/my-app-role \
  --endpoint-url $AWS_ENDPOINT_URL

# Describe running instances
aws ec2 describe-instances \
  --filters "Name=instance-state-name,Values=running" \
  --endpoint-url $AWS_ENDPOINT_URL

# Stop and start an instance
aws ec2 stop-instances --instance-ids i-XXXXX --endpoint-url $AWS_ENDPOINT_URL
aws ec2 start-instances --instance-ids i-XXXXX --endpoint-url $AWS_ENDPOINT_URL

# Terminate an instance
aws ec2 terminate-instances --instance-ids i-XXXXX --endpoint-url $AWS_ENDPOINT_URL

# Create a VPC and subnet
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --endpoint-url $AWS_ENDPOINT_URL
aws ec2 create-subnet --vpc-id vpc-XXXXX --cidr-block 10.0.1.0/24 --endpoint-url $AWS_ENDPOINT_URL

# Create and configure a security group
aws ec2 create-security-group \
  --group-name my-sg \
  --description "My security group" \
  --vpc-id vpc-XXXXX \
  --endpoint-url $AWS_ENDPOINT_URL

aws ec2 authorize-security-group-ingress \
  --group-id sg-XXXXX \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0 \
  --endpoint-url $AWS_ENDPOINT_URL

# Allocate and associate an Elastic IP
aws ec2 allocate-address --domain vpc --endpoint-url $AWS_ENDPOINT_URL
aws ec2 associate-address \
  --allocation-id eipalloc-XXXXX \
  --instance-id i-XXXXX \
  --endpoint-url $AWS_ENDPOINT_URL
```

## Notas sobre

- `DescribeImages` devuelve AMI del catálogo de imágenes EC2, incluidas AMI comunes y ID de AMI nativas de Floci.
- El material clave devuelto por `CreateKeyPair` es un PEM RSA ficticio, que no se puede utilizar para SSH real. Utilice `ImportKeyPair` para trabajar con acceso SSH.
- Las reglas del grupo de seguridad no se aplican como firewall (la red de puente Docker maneja el enrutamiento), pero las reglas de ingreso TCP abiertas a una fuente CIDR se publican en el host a través de sidecars socat para que se pueda acceder a la aplicación de la instancia desde `localhost`; consulte [Publicación de puertos del grupo de seguridad] (#security-group-port-publishing).
- El servidor IMDS identifica qué instancia está llamando a través de tokens IMDSv2 (asignados en el momento de la emisión del token) o mediante la IP del puente del contenedor para IMDSv1.
