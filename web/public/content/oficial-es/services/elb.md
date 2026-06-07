# Equilibrio de carga elástico v2

**Protocolo:** Consulta (XML) — `POST http://localhost:4566/` con parámetro `Action=`

Floci admite balanceadores de carga de aplicaciones (ALB) y balanceadores de carga de red (NLB) a través de la administración ELBv2 API. Esta es una implementación de Fase 1: el plano de control CRUD completo está disponible y es compatible con AWS SDK / CLI / Terraform. El reenvío de tráfico del plano de datos (puertos de escucha TCP reales) está previsto para la Fase 2.

## Acciones admitidas

### Equilibradores de carga
`CreateLoadBalancer` · `DescribeLoadBalancers` · `DeleteLoadBalancer` · `ModifyLoadBalancerAttributes` · `DescribeLoadBalancerAttributes` · `SetSecurityGroups` · `SetSubnets` · `SetIpAddressType`

### Grupos objetivo de
`CreateTargetGroup` · `DescribeTargetGroups` · `ModifyTargetGroup` · `DeleteTargetGroup` · `ModifyTargetGroupAttributes` · `DescribeTargetGroupAttributes`

### Objetivos
`RegisterTargets` · `DeregisterTargets` · `DescribeTargetHealth`

### Oyentes
`CreateListener` · `DescribeListeners` · `ModifyListener` · `DeleteListener` · `AddListenerCertificates` · `RemoveListenerCertificates` · `DescribeListenerCertificates`

### Reglas de
`CreateRule` · `DescribeRules` · `ModifyRule` · `DeleteRule` · `SetRulePriorities`

### Etiquetas
`AddTags` · `RemoveTags` · `DescribeTags`

### Metadatos
`DescribeSSLPolicies` · `DescribeAccountLimits`

## Notas de comportamiento de

- Los balanceadores de carga se crean en el estado `provisioning` y pasan a `active` inmediatamente en descripciones posteriores.
- El estado del objetivo siempre devuelve el estado `initial` con el motivo `Elb.RegistrationInProgress`: las comprobaciones de estado del plano de datos no se realizan en la Fase 1.
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

## Fase 2 (Planificada)

La fase 2 vinculará los puertos de escucha TCP reales en el host para que el tráfico enviado a un puerto de escucha se reenvíe a los objetivos registrados. Esto requiere exponer un rango de puertos (por ejemplo, `8300-8399`) en la configuración de composición Docker, similar a cómo funcionan los puertos proxy ElastiCache y RDS en la actualidad.
