# Módulo 22: Balanceo de carga, CDN y DNS — ELB, CloudFront, Route53 y ACM


## Aprende construyendo

### Tema 1: ELB v2 — balanceadores, grupos objetivo y reglas

**Conceptos clave:** Application Load Balancer (ALB), grupo objetivo (target group), listener, regla de enrutamiento, Fase 1 vs Fase 2.

Elastic Load Balancing v2 gestiona balanceadores de carga de aplicaciones (ALB) y de red (NLB) a través de una API de plano de gestión completa: puedes crear balanceadores, grupos objetivo, listeners y reglas de enrutamiento por ruta o por host, exactamente como en AWS real, y todos esos recursos se almacenan y se devuelven correctamente vía SDK, CLI o Terraform. Lo que Floci todavía no hace —está planeado como Fase 2— es abrir puertos de escucha TCP reales que reenvíen tráfico HTTP de verdad a los objetivos registrados; por ahora, `DescribeTargetHealth` siempre devuelve el estado `initial`, y no hay tráfico real fluyendo a través del balanceador.

Esto significa que en este módulo vas a practicar el ciclo de vida completo del plano de control —crear el balanceador, el grupo objetivo, registrar objetivos, crear listeners con reglas de enrutamiento por ruta (`/api/*` hacia un grupo, el resto hacia otro)— que es exactamente la misma superficie de API que usarías con Terraform o el SDK contra un ALB real, aunque el tráfico HTTP en sí no se enruta todavía dentro de Floci. Cada `CreateListener` crea automáticamente una regla por defecto inmutable, y las prioridades de reglas se validan de forma atómica para evitar conflictos.

**Analogía:** el ALB en Floci en este momento es como el plano arquitectónico completo de un edificio de oficinas con los ascensores, pasillos y señalización ya diseñados y aprobados, pero donde todavía no se ha instalado la electricidad que los haría funcionar de verdad: la estructura de decisiones (a dónde va cada solicitud) ya está correctamente definida y es consultable.

**¿Por qué es importante?** Practicar el plano de control de ELB v2 te prepara para el mismo flujo de trabajo con Terraform/CDK que usarías contra AWS real: definir grupos objetivo, listeners y reglas es idéntico: solo cambia que en Floci el tráfico real todavía no atraviesa el balanceador.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-22/tema-1-alb.sh — ejecutar con: bash tema-1-alb.sh
LB_ARN=$(aws elbv2 create-load-balancer --name rutaflow-alb --type application --scheme internet-facing \
  --query 'LoadBalancers[0].LoadBalancerArn' --output text)
TG_ARN=$(aws elbv2 create-target-group --name rutaflow-objetivos --protocol HTTP --port 80 --target-type instance \
  --query 'TargetGroups[0].TargetGroupArn' --output text)
LISTENER_ARN=$(aws elbv2 create-listener --load-balancer-arn "$LB_ARN" --protocol HTTP --port 80 \
  --default-actions Type=forward,TargetGroupArn="$TG_ARN" --query 'Listeners[0].ListenerArn' --output text)
aws elbv2 create-rule --listener-arn "$LISTENER_ARN" --priority 10 \
  --conditions Field=path-pattern,Values='/api/*' --actions Type=forward,TargetGroupArn="$TG_ARN"
```

**Resultado esperado:** cada comando devuelve su ARN (`LoadBalancerArn`, `TargetGroupArn`, `ListenerArn`, `RuleArn`); `aws elbv2 describe-target-health --target-group-arn $TG_ARN` siempre devuelve estado `initial` — recuerda que Floci aún no enruta tráfico real (Fase 2 pendiente).

**Modifica esto:** registra una instancia real del Módulo 21 con `register-targets` y confirma con `describe-target-groups` que aparece asociada, aunque su salud siga `initial`.

**Cuándo no usarlo:** no uses `describe-target-health` de Floci para validar que tu aplicación responde de verdad; eso solo lo confirmas contra un ALB real o probando la instancia directamente.

**Cómo crece RutaFlow:** este ALB es el punto de entrada que balanceará tráfico hacia los nodos de reparto de RutaFlow en cuanto tengas más de una instancia activa.

### Tema 2: ACM — certificados TLS con criptografía real

**Conceptos clave:** emisión automática, criptografía real (RSA/EC), tipos `AMAZON_ISSUED` vs `PRIVATE`.

A diferencia de ELB, ACM en Floci sí es completamente funcional de extremo a extremo: cuando solicitas un certificado con `RequestCertificate`, Floci lo emite inmediatamente con estado `ISSUED` —sin esperar validación real de DNS o correo—, pero genera claves criptográficas reales (RSA de 2048 a 4096 bits, o curvas elípticas P-256/P-384/P-521) y una estructura X.509 válida de verdad, no un certificado de mentira. Puedes recuperar el certificado y su cadena en formato PEM con `GetCertificate`, y si lo solicitaste como tipo `PRIVATE` (indicando una autoridad certificadora), incluso exportarlo junto a su clave privada.

Esta combinación —emisión instantánea, pero con criptografía verdadera— es exactamente lo que necesitas para probar localmente flujos que dependen de tener un certificado TLS válido (por ejemplo, para el listener HTTPS de un ALB, o para la Cosmos DB Java SDK que exige TLS), sin la latencia ni la complejidad de un proceso de validación real que en AWS puede tardar minutos u horas.

**Analogía:** ACM en Floci es como un notario de práctica en una escuela de derecho: emite documentos con formato y firma perfectamente válidos técnicamente, de forma instantánea, sin el proceso de verificación de identidad completo que exigiría un notario real.

**¿Por qué es importante?** Tener certificados reales pero de emisión instantánea te permite practicar arquitecturas HTTPS-first (la única forma correcta de construir en la nube hoy) sin fricción, algo que sería mucho más lento de ensayar contra AWS real cada vez.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-22/tema-2-acm.sh — ejecutar con: bash tema-2-acm.sh
CERT_ARN=$(aws acm request-certificate --domain-name rutaflow.example.com --validation-method DNS \
  --query 'CertificateArn' --output text)
aws acm describe-certificate --certificate-arn "$CERT_ARN" --query 'Certificate.Status' --output text
aws acm get-certificate --certificate-arn "$CERT_ARN"
```

**Resultado esperado:** `describe-certificate` devuelve `ISSUED` de inmediato; `get-certificate` devuelve un PEM real con una cadena X.509 válida — puedes verificarlo pasando el `Certificate` devuelto a `openssl x509 -noout -text`.

**Modifica esto:** repite la solicitud con `--certificate-authority-arn <arn>` (tipo `PRIVATE`) y confirma que ahora sí puedes exportar la clave privada con `export-certificate`, algo que un certificado `AMAZON_ISSUED` no permite.

**Cuándo no usarlo:** no confíes en la emisión instantánea como comportamiento realista de tiempos; en AWS real la validación DNS puede tardar minutos, y tu automatización debe esperar el evento correspondiente, no asumir éxito inmediato.

**Cómo crece RutaFlow:** este certificado es el que adjuntarás al listener HTTPS del ALB de RutaFlow para servir su API de seguimiento por TLS.

### Tema 3: CloudFront — distribución de contenido y control de acceso al origen

**Conceptos clave:** distribución, política de caché, invalidación, control de acceso de origen (OAC).

CloudFront en Floci emula el plano de gestión completo: puedes crear una distribución apuntando a un origen (por ejemplo, un bucket S3), definir políticas de caché con sus TTLs mínimo/por defecto/máximo, configurar políticas de encabezados de respuesta, crear invalidaciones de caché, y proteger el acceso al origen con Control de Acceso de Origen (OAC) o la identidad heredada (OAI). Todas las distribuciones pasan inmediatamente al estado `Deployed` —sin la demora de propagación global que existe en AWS real—, y las invalidaciones se marcan como `Completed` de inmediato. Lo que no está emulado es la entrega real de contenido: no hay una red de distribución sirviendo tus archivos desde ubicaciones cercanas al usuario, esto es una implementación de plano de gestión únicamente.

Un detalle de comportamiento importante: todas las operaciones de mutación (`PUT`, `DELETE`) exigen un encabezado `If-Match` con el `ETag` actual de la distribución — si no lo incluyes o es incorrecto, la petición falla con `InvalidIfMatchVersion`. Este patrón de actualización optimista (leer el ETag, luego escribir con ese ETag) es el mismo que usan muchas APIs REST maduras para evitar que dos actualizaciones concurrentes se pisen entre sí.

**Analogía:** una distribución CloudFront en Floci es como el contrato firmado con una empresa de mensajería para que distribuya tus paquetes desde bodegas cercanas a cada cliente: el contrato (la configuración) es completamente real y consultable, pero en este momento el laboratorio no simula los camiones moviéndose de verdad.

**¿Por qué es importante?** Practicar la configuración de políticas de caché, orígenes y control de acceso es la parte que más se diseña con cuidado en una arquitectura CDN real; el volumen de tráfico que efectivamente sirve CloudFront es una preocupación operativa distinta que se valida contra AWS real.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-22/tema-3-cloudfront.sh — ejecutar con: bash tema-3-cloudfront.sh
DIST_ID=$(aws cloudfront create-distribution --distribution-config \
  '{"CallerReference":"rutaflow-1","Enabled":true,"Origins":{"Quantity":1,"Items":[{"Id":"origen-s3","DomainName":"curso-cloud-local.s3.amazonaws.com","S3OriginConfig":{"OriginAccessIdentity":""}}]},"DefaultCacheBehavior":{"TargetOriginId":"origen-s3","ViewerProtocolPolicy":"redirect-to-https","CachePolicyId":"658327ea-f89d-4fab-a63d-7e88639e58f6"}}' \
  --query 'Distribution.Id' --output text)
aws cloudfront create-invalidation --distribution-id "$DIST_ID" \
  --invalidation-batch '{"Paths":{"Quantity":1,"Items":["/*"]},"CallerReference":"inv-1"}'
```

**Resultado esperado:** `create-distribution` devuelve estado `Deployed` de inmediato y un `DomainName` tipo `{id}.cloudfront.net`; la invalidación se marca `Completed` sin esperar propagación real.

**Modifica esto:** intenta borrar la distribución directamente con `aws cloudfront delete-distribution --id $DIST_ID --if-match <etag>` sin deshabilitarla antes, y observa el error `DistributionNotDisabled` — corrígelo llamando primero a `update-distribution` con `Enabled=false`.

**Cuándo no usarlo:** no midas aquí latencia de entrega de contenido ni comportamiento de caché de borde real; Floci solo emula el plano de gestión, no la red de distribución física.

**Cómo crece RutaFlow:** esta distribución serviría los assets estáticos del panel de seguimiento de RutaFlow, reusando el mismo origen S3 de módulos anteriores.

### Tema 4: Route53 — zonas alojadas y registros de recursos

**Conceptos clave:** zona alojada, registro SOA/NS, `ChangeResourceRecordSets`, comprobación de estado (health check).

Route53 en Floci emula el plano de gestión de DNS: puedes crear una zona alojada, que automáticamente recibe registros SOA y NS en el vértice —no eliminables—, y luego añadir, actualizar o eliminar registros de recursos (A, CNAME, MX, etc.) con `ChangeResourceRecordSets`, validando todos los cambios de forma atómica antes de aplicar cualquiera. Cada cambio devuelve inmediatamente el estado `INSYNC` (sin la propagación asíncrona real de Route53), y puedes crear comprobaciones de estado HTTP/HTTPS que Route53 usaría en producción para enrutamiento basado en salud. Lo que no está emulado es la resolución DNS real: si intentas resolver un dominio que configuraste aquí desde tu navegador, no funcionará — esto es, otra vez, plano de gestión únicamente.

Un detalle útil para depurar: los IDs de zona alojada se devuelven con el prefijo `/hostedzone/` en las respuestas XML crudas, pero el AWS SDK lo elimina automáticamente del lado del cliente, así que normalmente solo verás el ID limpio (por ejemplo `Z1PA6795UKMFR9`).

**Analogía:** una zona alojada en Route53 es como el directorio interno de un edificio de oficinas: dice exactamente en qué piso y oficina está cada empresa (registro), y ese directorio es cien por ciento preciso y consultable, pero no es el sistema de señalización física que efectivamente guía a un visitante hasta la puerta — la resolución DNS real.

**¿Por qué es importante?** El plano de gestión de DNS es donde se cometen la mayoría de los errores de configuración reales (registros mal apuntados, TTLs incorrectos, zonas huérfanas); practicarlo aquí sin miedo a romper resolución de producción es exactamente el tipo de práctica segura que justifica un emulador local.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-22/tema-4-route53.sh — ejecutar con: bash tema-4-route53.sh
ZONE_ID=$(aws route53 create-hosted-zone --name rutaflow.example.com --caller-reference "$(date +%s)" \
  --query 'HostedZone.Id' --output text)
aws route53 change-resource-record-sets --hosted-zone-id "$ZONE_ID" --change-batch \
  '{"Changes":[{"Action":"CREATE","ResourceRecordSet":{"Name":"rutaflow.example.com.","Type":"CNAME","TTL":300,"ResourceRecords":[{"Value":"d111111abcdef8.cloudfront.net"}]}}]}'
aws route53 list-resource-record-sets --hosted-zone-id "$ZONE_ID"
```

**Resultado esperado:** la zona nace con registros `SOA` y `NS` automáticos en el vértice; el cambio del `CNAME` devuelve estado `INSYNC` de inmediato; `list-resource-record-sets` muestra los tres registros juntos.

**Modifica esto:** intenta borrar el registro `SOA` del vértice con `Action: DELETE` y confirma que Route53 lo rechaza — esos registros los gestiona el servicio automáticamente, no tú.

**Cuándo no usarlo:** no resuelvas el dominio desde tu navegador esperando que funcione; Floci guarda y valida la configuración, pero no ejecuta resolución DNS real.

**Cómo crece RutaFlow:** esta zona es la que apuntará `rutaflow.example.com` hacia el ALB o la distribución que sirve el proyecto integrador.

### Tema 5: Cómo se integran los cuatro servicios en una arquitectura de borde real

**Conceptos clave:** cadena ACM → ALB/CloudFront → Route53, alias record, terminación TLS.

En una arquitectura AWS real, estos cuatro servicios casi nunca se usan de forma aislada: el flujo típico es solicitar un certificado con ACM para tu dominio, adjuntarlo a un listener HTTPS de un ALB (o a una distribución CloudFront) para terminación TLS, y finalmente crear un registro alias en Route53 que apunte el nombre de dominio de tu empresa hacia el nombre DNS generado por el ALB o CloudFront. El resultado es que un usuario visita `https://miapp.com`, Route53 resuelve ese nombre hacia el balanceador o la distribución, y la conexión TLS se establece usando el certificado que ACM emitió — con el ALB o CloudFront distribuyendo el tráfico hacia tus instancias EC2 o contenedores reales del Módulo 21.

Reconocer esta cadena de dependencias —certificado, punto de entrada de tráfico, resolución de nombre— es más importante que memorizar los comandos de cada servicio por separado: es el patrón que vas a ver una y otra vez en cualquier arquitectura web en la nube, sea en AWS, Azure o GCP.

**Analogía:** ACM es la credencial de identidad verificada de tu negocio, el ALB o CloudFront es la puerta de entrada física con esa credencial exhibida, y Route53 es la dirección postal que le dice a los clientes hacia dónde caminar para llegar a esa puerta.

**¿Por qué es importante?** Diseñar pensando en esta cadena completa —no solo en un servicio aislado— es lo que separa a alguien que sabe usar comandos de AWS de alguien que sabe diseñar arquitecturas de borde coherentes y seguras.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-22/tema-5-cadena-completa.sh — ejecutar con: bash tema-5-cadena-completa.sh
# Cada ARN se recupera por nombre: este bloque no depende de variables de
# los Temas 1, 2 y 4 — puedes correrlo en una terminal nueva.
LB_ARN=$(aws elbv2 describe-load-balancers --names rutaflow-alb --query 'LoadBalancers[0].LoadBalancerArn' --output text)
LISTENER_ARN=$(aws elbv2 describe-listeners --load-balancer-arn "$LB_ARN" --query 'Listeners[0].ListenerArn' --output text)
CERT_ARN=$(aws acm list-certificates --query "CertificateSummaryList[?DomainName=='rutaflow.example.com'].CertificateArn | [0]" --output text)
ZONE_ID=$(aws route53 list-hosted-zones-by-name --dns-name rutaflow.example.com --query 'HostedZones[0].Id' --output text)

aws acm describe-certificate --certificate-arn "$CERT_ARN" --query 'Certificate.Status'
aws elbv2 modify-listener --listener-arn "$LISTENER_ARN" --protocol HTTPS --port 443 \
  --certificates CertificateArn="$CERT_ARN"
aws route53 list-resource-record-sets --hosted-zone-id "$ZONE_ID" --query "ResourceRecordSets[?Type=='CNAME']"
```

**Resultado esperado:** el certificado sigue `ISSUED`; el listener queda en `HTTPS`/443 con el certificado adjunto; el registro DNS del Tema 4 sigue apuntando al punto de entrada — la cadena completa queda verificable con tres llamadas de solo lectura y una de modificación.

**Modifica esto:** cambia el `CNAME` del Tema 4 para que apunte al `DomainName` del ALB en vez de al de CloudFront, y confirma que `list-resource-record-sets` refleja el nuevo destino.

**Cuándo no usarlo:** no repliques esta cadena completa por cada microservicio de un sistema grande; en arquitecturas reales normalmente compartes un ALB/CloudFront y un certificado wildcard entre varios servicios para reducir piezas a coordinar.

**Cómo crece RutaFlow:** esta es exactamente la cadena (certificado → punto de entrada → DNS) que RutaFlow necesita para exponer su API de seguimiento de forma segura al cierre del track.

---


## Laboratorio práctico

> Este laboratorio asume que ya ejecutaste `floci start` y `eval $(floci env)` (Módulo 1) en tu sesión de terminal, así que los comandos de `aws` no repiten `--endpoint-url`.

**Objetivo del laboratorio:** crear un Application Load Balancer con un grupo objetivo y una regla de enrutamiento por ruta, y luego solicitar un certificado ACM, crear una distribución CloudFront con origen S3 y publicar una zona Route53 con un registro apuntando a ella.

**Requisitos previos:** un bucket S3 existente (puedes reutilizar `curso-cloud-local` de módulos anteriores) y al menos una instancia EC2 del Módulo 21 si quieres registrar un objetivo real en el grupo objetivo.

### Laboratorio 22.1 — Application Load Balancer con enrutamiento por ruta

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Crea el balanceador | `aws elbv2 create-load-balancer --name mi-alb --type application --scheme internet-facing` | Registra un ALB en estado `provisioning`, que pasa a `active` de inmediato | Un `LoadBalancerArn` en la respuesta |
| 2 | Crea el grupo objetivo | `aws elbv2 create-target-group --name mis-objetivos --protocol HTTP --port 80 --target-type instance` | Define dónde se enviaría el tráfico | Un `TargetGroupArn` |
| 3 | Registra un objetivo | `aws elbv2 register-targets --target-group-arn <tg-arn> --targets Id=<instance-id>,Port=8080` | Asocia una instancia EC2 real del Módulo 21 al grupo | Sin salida (éxito silencioso) |
| 4 | Crea el listener | `aws elbv2 create-listener --load-balancer-arn <lb-arn> --protocol HTTP --port 80 --default-actions Type=forward,TargetGroupArn=<tg-arn>` | Crea automáticamente una regla por defecto inmutable | Un `ListenerArn` |
| 5 | Añade una regla por ruta | `aws elbv2 create-rule --listener-arn <listener-arn> --priority 10 --conditions Field=path-pattern,Values='/api/*' --actions Type=forward,TargetGroupArn=<tg-arn>` | Enruta específicamente el tráfico bajo `/api/*` | Un `RuleArn` |

### Laboratorio 22.2 — Certificado, distribución CDN y zona DNS

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Solicita un certificado | `aws acm request-certificate --domain-name miapp.example.com --validation-method DNS` | Emite un certificado real con estado `ISSUED` de inmediato | Un `CertificateArn` |
| 2 | Crea una distribución con origen S3 | `aws cloudfront create-distribution --distribution-config '{"CallerReference":"ref-1","Enabled":true,"Origins":{"Quantity":1,"Items":[{"Id":"origen-s3","DomainName":"curso-cloud-local.s3.amazonaws.com","S3OriginConfig":{"OriginAccessIdentity":""}}]},"DefaultCacheBehavior":{"TargetOriginId":"origen-s3","ViewerProtocolPolicy":"redirect-to-https","CachePolicyId":"658327ea-f89d-4fab-a63d-7e88639e58f6"}}'` | Crea la distribución en estado `Deployed` de inmediato | Un `Id` de 14 caracteres y un `DomainName` tipo `{id}.cloudfront.net` |
| 3 | Crea la zona alojada | `aws route53 create-hosted-zone --name miapp.example.com --caller-reference "$(date +%s)"` | Crea la zona con registros SOA/NS automáticos | Un `Id` de zona (formato `Z...`) |
| 4 | Añade un registro alias hacia CloudFront | `aws route53 change-resource-record-sets --hosted-zone-id <zone-id> --change-batch '{"Changes":[{"Action":"CREATE","ResourceRecordSet":{"Name":"miapp.example.com.","Type":"CNAME","TTL":300,"ResourceRecords":[{"Value":"<distribution-domain>"}]}}]}'` | Conecta el nombre de dominio con la distribución CDN | Estado `INSYNC` inmediato |
| 5 | Verifica el registro | `aws route53 list-resource-record-sets --hosted-zone-id <zone-id>` | Confirma que el registro quedó guardado | El registro CNAME apuntando a tu distribución |

**Verificación:** el laboratorio se considera exitoso si `describe-load-balancers` muestra tu ALB `active` con un listener y una regla por ruta `/api/*`, `acm describe-certificate` muestra el certificado en estado `ISSUED` con claves criptográficas reales, `cloudfront get-distribution` devuelve tu distribución en estado `Deployed`, y `route53 list-resource-record-sets` muestra el registro CNAME apuntando al dominio de CloudFront.

**Errores comunes y soluciones**

- **`CreateListener` falla con conflicto de prioridad.** Cada regla necesita una prioridad única dentro del mismo listener; revisa con `describe-rules` qué prioridades ya están en uso antes de crear una nueva.
- **`DeleteDistribution` falla con `DistributionNotDisabled`.** CloudFront exige que `Enabled` sea `false` antes de poder eliminar la distribución; llama primero a `update-distribution` con el `ETag` correcto para deshabilitarla.
- **`ChangeResourceRecordSets` falla al intentar borrar el registro SOA o NS del vértice.** Esos registros los gestiona Route53 automáticamente y no se pueden eliminar; solo puedes añadir, modificar o quitar registros adicionales.
- **`RequestCertificate` con `CertificateAuthorityArn` falla al exportar.** Solo los certificados de tipo `PRIVATE` se pueden exportar con `ExportCertificate`; los `AMAZON_ISSUED` no admiten exportación de clave privada, igual que en AWS real.

---
