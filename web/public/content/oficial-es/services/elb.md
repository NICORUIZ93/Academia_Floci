# Equilibrio de carga elástico v2

**Protocolo:** Consulta (XML) — `POST http://localhost:4566/` con parámetro `Action=`

Floci admite balanceadores de carga de aplicaciones (ALB) y balanceadores de carga de red (NLB) a través de la administración ELBv2 API. El plano de control es compatible con AWS SDK / CLI / Terraform, y los oyentes de HTTP pueden reenviar a objetivos de instancia registrados utilizando la dirección local accesible del objetivo.

## Acciones admitidas

### Equilibradores de carga

| Acción | Descripción |
|--------|-------------|
| CreateLoadBalancer | Crea un ALB o NLB en estado activo con atributos y etiquetas persistentes. |
| DescribeLoadBalancers | Enumera o devuelve balanceadores de carga almacenados. |
| DeleteLoadBalancer | Elimina un equilibrador de carga y detiene sus sockets de escucha. |
| ModifyLoadBalancerAttributes | Actualiza los atributos del balanceador de carga persistente. |
| DescribeLoadBalancerAttributes | Devuelve atributos almacenados para un equilibrador de carga. |
| DescribeCapacityReservation | Devuelve los campos de reserva de capacidad almacenados para un equilibrador de carga. |
| SetSecurityGroups | Reemplaza los grupos de seguridad asociados con un balanceador de carga. |
| SetSubnets | Reemplaza las subredes asociadas con un balanceador de carga. |
| SetIpAddressType | Actualiza el tipo de dirección IP almacenado para un equilibrador de carga. |

### Grupos objetivo de

| Acción | Descripción |
|--------|-------------|
| CreateTargetGroup | Crea un grupo objetivo con configuración de protocolo, puerto, verificación de estado y tipo de objetivo. |
| DescribeTargetGroups | Enumera o devuelve grupos objetivo almacenados. |
| ModifyTargetGroup | Actualiza la configuración del grupo objetivo mutable. |
| DeleteTargetGroup | Elimina un grupo objetivo no utilizado. |
| ModifyTargetGroupAttributes | Actualiza los atributos persistentes del grupo objetivo. |
| DescribeTargetGroupAttributes | Devuelve atributos almacenados para un grupo objetivo. |

### Objetivos

| Acción | Descripción |
|--------|-------------|
| RegisterTargets | Registra objetivos con un grupo objetivo. |
| DeregisterTargets | Elimina objetivos de un grupo objetivo. |
| DescribeTargetHealth | Devuelve registros de salud de destino mantenidos por Floci. |

### Oyentes

| Acción | Descripción |
|--------|-------------|
| CreateListener | Crea un oyente y su regla predeterminada no eliminable. |
| DescribeListeners | Enumera o devuelve oyentes almacenados. |
| ModifyListener | Actualiza la configuración de un oyente y las acciones predeterminadas. |
| ModifyListenerAttributes | Actualiza los atributos de escucha persistentes. |
| DescribeListenerAttributes | Devuelve atributos almacenados para un oyente. |
| DeleteListener | Elimina un oyente y detiene su socket. |
| AddListenerCertificates | Agrega certificados a un oyente. |
| RemoveListenerCertificates | Elimina certificados de un oyente. |
| DescribeListenerCertificates | Enumera los certificados asociados con un oyente. |

### Reglas de

| Acción | Descripción |
|--------|-------------|
| CreateRule | Crea una regla de escucha no predeterminada con condiciones, acciones y prioridad. |
| DescribeRules | Enumera o devuelve reglas de escucha. |
| ModifyRule | Actualiza las condiciones y acciones de una regla de escucha. |
| DeleteRule | Elimina una regla de escucha no predeterminada. |
| SetRulePriorities | Actualiza atómicamente las prioridades de las reglas después de validar la unicidad. |

### Etiquetas

| Acción | Descripción |
|--------|-------------|
| AddTags | Agrega etiquetas a los recursos ELBv2 compatibles. |
| RemoveTags | Elimina etiquetas de los recursos ELBv2 compatibles. |
| DescribeTags | Devuelve etiquetas para recursos ELBv2 compatibles. |

### Metadatos de

| Acción | Descripción |
|--------|-------------|
| DescribeSSLPolicies | Devuelve la lista de políticas SSL estándar predefinidas de Floci. |
| DescribeAccountLimits | Devuelve los límites de cuenta ELBv2 predeterminados estándar. |

## Notas de comportamiento de

- El estado del balanceador de carga, grupo objetivo, escucha, regla y etiqueta se conserva a través del almacenamiento Floci y se reconstruye al iniciar el servicio.
- Los balanceadores de carga se crean en el estado `active`.
- Los sockets de escucha HTTP se conservan cuando las acciones de escucha cambian y se reinician solo cuando cambian las configuraciones a nivel de socket, como el puerto.
- Los destinos de instancia se resuelven a través de direcciones privadas de instancia EC2 para que el tráfico del balanceador de carga local pueda llegar a los contenedores.
- El estado del objetivo comienza en el estado `initial` con el motivo `Elb.RegistrationInProgress` y lo actualiza el verificador de estado de Floci cuando la supervisión está activa.
- Cada `CreateListener` crea automáticamente una regla predeterminada inmutable (`priority=default`, `isDefault=true`). Esta regla no se puede eliminar; utilice `ModifyListener` para cambiar su acción.
- Las prioridades de las reglas se validan para determinar su unicidad. `SetRulePriorities` es atómico: todas las asignaciones de prioridad se validan antes de confirmar cualquier cambio.
- `DeleteTargetGroup` se rechaza con `ResourceInUse` mientras cualquier oyente o regla hace referencia al grupo objetivo.
- `DeleteRule` se rechaza con `OperationNotPermitted` como regla predeterminada.
- `DescribeSSLPolicies` devuelve una lista predeterminada de políticas SSL estándar AWS (`ELBSecurityPolicy-*`).
- `DescribeAccountLimits` devuelve límites predeterminados estándar (por ejemplo, 50 balanceadores de carga por región, 100 grupos objetivo, etc.).

## Formato ARN

```
arn:aws:elasticloadbalancing:{region}:{account-id}:loadbalancer/app/{name}/{hex16}
arn:aws:elasticloadbalancing:{region}:{account-id}:targetgroup/{name}/{hex16}
arn:aws:elasticloadbalancing:{region}:{account-id}:listener/app/{lb-name}/{lb-id}/{hex16}
arn:aws:elasticloadbalancing:{region}:{account-id}:listener-rule/app/{lb-name}/{lb-id}/{listener-id}/{hex16}
```

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Create a load balancer
aws elbv2 create-load-balancer \
  --name my-alb \
  --type application \
  --scheme internet-facing

# Create a target group
aws elbv2 create-target-group \
  --name my-targets \
  --protocol HTTP \
  --port 80 \
  --target-type instance

# Register targets
aws elbv2 register-targets \
  --target-group-arn arn:aws:elasticloadbalancing:us-east-1:000000000000:targetgroup/my-targets/abc123 \
  --targets Id=i-00000000001,Port=8080

# Create a listener with a default forward action
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:us-east-1:000000000000:loadbalancer/app/my-alb/abc123 \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:us-east-1:000000000000:targetgroup/my-targets/abc123

# Add a path-based routing rule
aws elbv2 create-rule \
  --listener-arn arn:aws:elasticloadbalancing:us-east-1:000000000000:listener/app/my-alb/abc123/def456 \
  --priority 10 \
  --conditions Field=path-pattern,Values='/api/*' \
  --actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:us-east-1:000000000000:targetgroup/my-targets/abc123

# Describe load balancers
aws elbv2 describe-load-balancers

# Describe target health
aws elbv2 describe-target-health \
  --target-group-arn arn:aws:elasticloadbalancing:us-east-1:000000000000:targetgroup/my-targets/abc123

# Tag a resource
aws elbv2 add-tags \
  --resource-arns arn:aws:elasticloadbalancing:us-east-1:000000000000:loadbalancer/app/my-alb/abc123 \
  --tags Key=env,Value=dev

# Clean up
aws elbv2 delete-listener \
  --listener-arn arn:aws:elasticloadbalancing:us-east-1:000000000000:listener/app/my-alb/abc123/def456
aws elbv2 delete-load-balancer \
  --load-balancer-arn arn:aws:elasticloadbalancing:us-east-1:000000000000:loadbalancer/app/my-alb/abc123
aws elbv2 delete-target-group \
  --target-group-arn arn:aws:elasticloadbalancing:us-east-1:000000000000:targetgroup/my-targets/abc123
```

## Configuración

| Variable de entorno | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_ELBV2_ENABLED` | `true` | Activar o desactivar el servicio ELBv2 |

## Puertos de escucha

Los sockets de escucha se vinculan en el host Floci. Exponga los puertos de escucha que necesite en Docker Compose cuando el propio Floci se ejecute en un contenedor, similar a los puertos proxy RDS y ElastiCache.
