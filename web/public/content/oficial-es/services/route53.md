# Route53

Emulación del plano de gestión Route53. Admite zonas alojadas, conjuntos de registros de recursos, comprobaciones de estado, seguimiento de cambios y etiquetado. No se proporciona la resolución DNS real; esta es una implementación solo del plano de administración.

## Operaciones compatibles

| Operación | Método | Camino |
|---|---|---|
| CreateHostedZone | PUBLICAR | `/2013-04-01/hostedzone` |
| GetHostedZone | OBTENER | `/2013-04-01/hostedzone/{Id}` |
| DeleteHostedZone | BORRAR | `/2013-04-01/hostedzone/{Id}` |
| ListHostedZones | OBTENER | `/2013-04-01/hostedzone` |
| ListHostedZonesByName | OBTENER | `/2013-04-01/hostedzonesbyname` |
| GetHostedZoneCount | OBTENER | `/2013-04-01/hostedzonecount` |
| ChangeResourceRecordSets | PUBLICAR | `/2013-04-01/hostedzone/{Id}/rrset` |
| ListResourceRecordSets | OBTENER | `/2013-04-01/hostedzone/{Id}/rrset` |
| GetChange | OBTENER | `/2013-04-01/change/{Id}` |
| CreateHealthCheck | PUBLICAR | `/2013-04-01/healthcheck` |
| GetHealthCheck | OBTENER | `/2013-04-01/healthcheck/{HealthCheckId}` |
| DeleteHealthCheck | BORRAR | `/2013-04-01/healthcheck/{HealthCheckId}` |
| ListHealthChecks | OBTENER | `/2013-04-01/healthcheck` |
| UpdateHealthCheck | PUBLICAR | `/2013-04-01/healthcheck/{HealthCheckId}` |
| ListTagsForResource | OBTENER | `/2013-04-01/tags/{ResourceType}/{ResourceId}` |
| ChangeTagsForResource | PUBLICAR | `/2013-04-01/tags/{ResourceType}/{ResourceId}` |
| GetAccountLimit | OBTENER | `/2013-04-01/accountlimit/{Type}` |

## Comportamiento de

- Todos los cambios devuelven el estado `INSYNC` inmediatamente (sin simulación de propagación asíncrona).
- Cada nueva zona alojada obtiene automáticamente registros SOA y NS en el vértice de la zona. Estos registros no se pueden eliminar.
- `DeleteHostedZone` falla con `HostedZoneNotEmpty` si la zona contiene registros distintos del vértice SOA y NS.
- `ChangeResourceRecordSets` valida todos los cambios de forma atómica antes de aplicar cualquiera.
- Acciones de cambio admitidas: `CREATE`, `UPSERT`, `DELETE`.
- Los ID de zona alojada se devuelven con el prefijo `/hostedzone/` en las respuestas XML (por ejemplo, `/hostedzone/Z1PA6795UKMFR9`). El AWS SDK elimina este prefijo del lado del cliente.
- Los ID de verificación de estado son UUID simples sin prefijo.
- Las etiquetas son compatibles con los tipos de recursos `hostedzone` y `healthcheck`.

## Servidores de nombres predeterminados

Las nuevas zonas utilizan estos servidores de nombres (configurables a través de `floci.services.route53.*`):

```
ns-1.awsdns-01.org
ns-2.awsdns-02.net
ns-3.awsdns-03.com
ns-4.awsdns-04.co.uk
```

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_ROUTE53_ENABLED` | `true` | Activar o desactivar el servicio |
| `FLOCI_SERVICES_ROUTE53_DEFAULT_NAMESERVER1` | `ns-1.awsdns-01.org` | Primer servidor de nombres predeterminado devuelto en conjuntos de delegación |
| `FLOCI_SERVICES_ROUTE53_DEFAULT_NAMESERVER2` | `ns-2.awsdns-02.net` | Segundo servidor de nombres predeterminado |
| `FLOCI_SERVICES_ROUTE53_DEFAULT_NAMESERVER3` | `ns-3.awsdns-03.com` | Tercer servidor de nombres predeterminado |
| `FLOCI_SERVICES_ROUTE53_DEFAULT_NAMESERVER4` | `ns-4.awsdns-04.co.uk` | Cuarto servidor de nombres predeterminado |

## Ejemplos de CLI

```bash
export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test

# Create a hosted zone
aws route53 create-hosted-zone \
  --name example.com \
  --caller-reference "$(date +%s)"

# List hosted zones
aws route53 list-hosted-zones

# Add an A record
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1PA6795UKMFR9 \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "www.example.com.",
        "Type": "A",
        "TTL": 300,
        "ResourceRecords": [{"Value": "1.2.3.4"}]
      }
    }]
  }'

# List records
aws route53 list-resource-record-sets --hosted-zone-id Z1PA6795UKMFR9

# Create a health check
aws route53 create-health-check \
  --caller-reference "hc-$(date +%s)" \
  --health-check-config '{
    "Type": "HTTPS",
    "FullyQualifiedDomainName": "example.com",
    "Port": 443,
    "ResourcePath": "/health"
  }'

# Delete a hosted zone
aws route53 delete-hosted-zone --id Z1PA6795UKMFR9
```

## No compatible (Fase 2)

- Conjuntos de delegación reutilizables
- Políticas de tráfico e instancias de políticas de tráfico.
- Asociación VPC (zonas privadas alojadas)
- Configuraciones de registro de consultas
- DNSSEC (claves de firma de claves, activación/desactivación)
- `TestDNSAnswer`
- Resolución DNS real
