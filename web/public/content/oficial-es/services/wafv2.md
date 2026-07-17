# WAFv2

**Protocolo:** JSON 1.1
**Punto final:** `http://localhost:4566/`
**Prefijo de destino:** `X-Amz-Target: AWSWAF_20190729.*`

Floci emula la gestión AWS WAF v2 API. Las ACL web, los conjuntos de IP, los conjuntos de patrones de expresiones regulares, los grupos de reglas, las configuraciones de registro, las políticas de permisos, las etiquetas y las asociaciones de recursos se conservan en el backend de almacenamiento de Floci. Floci no inspecciona ni filtra el tráfico en vivo; esta superficie le permite crear, leer, actualizar y eliminar recursos WAF y validar IaC (CloudFormation/CDK/Terraform) localmente.

## Acciones admitidas

<!-- floci:actions:start -->
| Acción | Descripción |
| --- | --- |
| `CreateWebACL` | Crea una ACL web |
| `GetWebACL` | Devuelve una ACL web por nombre/id/alcance |
| `UpdateWebACL` | Actualiza una ACL web (requiere el `LockToken` actual) |
| `DeleteWebACL` | Elimina una ACL web |
| `ListWebACLs` | Enumera las ACL web para un ámbito |
| `CreateIPSet` | Crea un conjunto de IP |
| `GetIPSet` | Devuelve un conjunto de IP |
| `UpdateIPSet` | Actualiza un conjunto de IP |
| `DeleteIPSet` | Elimina un conjunto de IP |
| `ListIPSets` | Enumera conjuntos de IP para un alcance |
| `CreateRegexPatternSet` | Crea un conjunto de patrones de expresiones regulares |
| `GetRegexPatternSet` | Devuelve un conjunto de patrones de expresiones regulares |
| `UpdateRegexPatternSet` | Actualiza un conjunto de patrones de expresiones regulares |
| `DeleteRegexPatternSet` | Elimina un conjunto de patrones de expresiones regulares |
| `ListRegexPatternSets` | Enumera conjuntos de patrones de expresiones regulares para un ámbito |
| `CreateRuleGroup` | Crea un grupo de reglas |
| `GetRuleGroup` | Devuelve un grupo de reglas |
| `UpdateRuleGroup` | Actualiza un grupo de reglas |
| `DeleteRuleGroup` | Elimina un grupo de reglas |
| `ListRuleGroups` | Enumera grupos de reglas para un ámbito |
| `CheckCapacity` | Devuelve la capacidad de WCU requerida para un conjunto de reglas |
| `AssociateWebACL` | Asocia una ACL web con un recurso |
| `DisassociateWebACL` | Elimina una asociación ACL web de un recurso |
| `GetWebACLForResource` | Devuelve la ACL web asociada a un recurso |
| `ListResourcesForWebACL` | Enumera los recursos asociados con una ACL web |
| `PutLoggingConfiguration` | Establece la configuración de registro para una ACL web |
| `GetLoggingConfiguration` | Devuelve la configuración de registro para una ACL web |
| `DeleteLoggingConfiguration` | Elimina una configuración de registro |
| `ListLoggingConfigurations` | Enumera las configuraciones de registro para un ámbito |
| `PutPermissionPolicy` | Adjunta una política de estilo IAM a un grupo de reglas |
| `GetPermissionPolicy` | Devuelve la política adjunta a un grupo de reglas |
| `DeletePermissionPolicy` | Elimina la política de un grupo de reglas |
| `TagResource` | Agrega etiquetas a un recurso WAF |
| `UntagResource` | Elimina etiquetas de un recurso WAF |
| `ListTagsForResource` | Enumera etiquetas para un recurso WAF |
<!-- floci:actions:end -->

## Alcance

Los recursos WAF v2 están particionados por `Scope`: `REGIONAL` (ALB, API Gateway, AppSync) o `CLOUDFRONT`. Pase `--scope` en cada llamada; Las solicitudes con ámbito de `CLOUDFRONT` deben tener como destino `us-east-1` como en AWS real.

## Ejemplo de

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Create an IP set
aws wafv2 create-ip-set \
  --name blocklist --scope REGIONAL \
  --ip-address-version IPV4 \
  --addresses 192.0.2.0/24

# Create a web ACL that allows by default
aws wafv2 create-web-acl \
  --name demo-acl --scope REGIONAL \
  --default-action Allow={} \
  --visibility-config SampledRequestsEnabled=true,CloudWatchMetricsEnabled=true,MetricName=demo

aws wafv2 list-web-acls --scope REGIONAL
```
