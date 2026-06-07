# EC2

**Protocolo:** Consulta EC2 (XML) — `POST http://localhost:4566/` con parámetro `Action=`

## Modelo de ejecución de instancia

`RunInstances` lanza un **contenedor Docker real** para cada instancia. El contenedor se mantiene activo con `tail -f /dev/null` para que cualquier imagen base funcione independientemente de su CMD predeterminado. El ciclo de vida se asigna directamente a Docker:

| Estado EC2 | Funcionamiento Docker |
|---|---|
| `pending → running` | Contenedor creado e iniciado |
| `running → stopping → stopped` | `docker stop` (tiempo de espera de 30 s, luego SIGKILL) |
| `stopped → pending → running` | `docker start` |
| `running → shutting-down → terminated` | `docker rm -f` |
| Reiniciar | `docker restart` |

Las instancias terminadas permanecen consultables durante 1 hora (que coinciden con el comportamiento real del desecho EC2) antes de ser eliminadas.

## Mapeo de imágenes de AMI a Docker

Floci resuelve los ID de AMI en imágenes Docker. Mapeos incorporados:

| ID AMI | Imagen Docker |
|---|---|
| `ami-amazonlinux2023` | `public.ecr.aws/amazonlinux/amazonlinux:2023` |
| `ami-amazonlinux2` | `public.ecr.aws/amazonlinux/amazonlinux:2` |
| `ami-ubuntu2204` | `public.ecr.aws/docker/library/ubuntu:22.04` |
| `ami-ubuntu2004` | `public.ecr.aws/docker/library/ubuntu:20.04` |
| `ami-debian12` | `public.ecr.aws/docker/library/debian:12` |
| `ami-alpine` | `public.ecr.aws/docker/library/alpine:latest` |

Cualquier ID de AMI no reconocida (incluidas las ID de AMI AWS reales como `ami-0abc12345678`) recurre a `public.ecr.aws/amazonlinux/amazonlinux:2023`.

## Inyección de clave SSH

Si se especifica `KeyName` en el inicio, Floci busca el material de clave pública del par de claves almacenado (configurado a través de `ImportKeyPair`) y lo copia en `/root/.ssh/authorized_keys` dentro del contenedor en el arranque. Luego intenta iniciar `sshd` si está presente. El puerto SSH (puerto de contenedor 22) está asignado a un puerto de host del rango configurado (predeterminado 2200–2299).

Los pares de claves creados con `CreateKeyPair` contienen material de clave privada ficticia. Importe un par de claves reales con `ImportKeyPair` para permitir el acceso SSH funcional.

## UserData

`UserData` debe estar codificado en base64 en la solicitud (que coincida con el formato de cable AWS). Floci lo decodifica, copia el script en `/tmp/user-data.sh` dentro del contenedor y lo ejecuta con `sh` después de la inyección de clave SSH. La salida se captura y registra.

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

## Acciones admitidas

### Instancias
`RunInstances` · `DescribeInstances` · `TerminateInstances` · `StartInstances` · `StopInstances` · `RebootInstances` · `DescribeInstanceStatus` · `DescribeInstanceAttribute` · `ModifyInstanceAttribute`

### VPC
`CreateVpc` · `DescribeVpcs` · `DeleteVpc` · `ModifyVpcAttribute` · `DescribeVpcAttribute` · `CreateDefaultVpc` · `AssociateVpcCidrBlock` · `DisassociateVpcCidrBlock`

### Subredes
`CreateSubnet` · `DescribeSubnets` · `DeleteSubnet` · `ModifySubnetAttribute`

### Grupos de seguridad
`CreateSecurityGroup` · `DescribeSecurityGroups` · `DeleteSecurityGroup` · `AuthorizeSecurityGroupIngress` · `AuthorizeSecurityGroupEgress` · `RevokeSecurityGroupIngress` · `RevokeSecurityGroupEgress` · `DescribeSecurityGroupRules` · `ModifySecurityGroupRules` · `UpdateSecurityGroupRuleDescriptionsIngress` · `UpdateSecurityGroupRuleDescriptionsEgress`

### Pares de claves
`CreateKeyPair` · `DescribeKeyPairs` · `DeleteKeyPair` · `ImportKeyPair`

### AMI
`DescribeImages`

### Etiquetas
`CreateTags` · `DeleteTags` · `DescribeTags`

### Pasarelas de Internet
`CreateInternetGateway` · `DescribeInternetGateways` · `DeleteInternetGateway` · `AttachInternetGateway` · `DetachInternetGateway`

### Tablas de ruta
`CreateRouteTable` · `DescribeRouteTables` · `DeleteRouteTable` · `AssociateRouteTable` · `DisassociateRouteTable` · `CreateRoute` · `DeleteRoute`

### IP elásticas
`AllocateAddress` · `DescribeAddresses` · `AssociateAddress` · `DisassociateAddress` · `ReleaseAddress`

### Zonas y regiones de disponibilidad
`DescribeAvailabilityZones` · `DescribeRegions` · `DescribeAccountAttributes`

### Tipos de instancia
`DescribeInstanceTypes`

### Volúmenes
`CreateVolume` · `DescribeVolumes` · `DeleteVolume`

## Configuración

| Variable de entorno | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_EC2_IMDS_PORT` | `9169` | Puerto host para el servidor IMDS |
| `FLOCI_SERVICES_EC2_SSH_PORT_RANGE_START` | `2200` | Inicio del rango de puertos del host SSH |
| `FLOCI_SERVICES_EC2_SSH_PORT_RANGE_END` | `2299` | Fin del rango de puertos del host SSH |
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

- `DescribeImages` devuelve una lista estática de AMI comunes (Amazon Linux 2, Amazon Linux 2023, Ubuntu 20.04, Windows Server 2022) además de todos los ID de AMI nativos de Floci.
- El material clave devuelto por `CreateKeyPair` es un PEM RSA ficticio, que no se puede utilizar para SSH real. Utilice `ImportKeyPair` para trabajar con acceso SSH.
- Las reglas del grupo de seguridad se almacenan y devuelven correctamente, pero no se aplican a nivel de red: la red del puente Docker maneja el enrutamiento.
- El servidor IMDS identifica qué instancia está llamando a través de tokens IMDSv2 (asignados en el momento de la emisión del token) o mediante la IP del puente del contenedor para IMDSv1.
