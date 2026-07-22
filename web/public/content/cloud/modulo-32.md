# Módulo 32: Arquitectura cloud resiliente — redes, landing zones y recuperación

Una colección de servicios funcionales todavía puede fallar como sistema. La arquitectura experta hace explícitas las fronteras de red y gobierno, conecta disponibilidad con necesidades del negocio y demuestra recuperación mediante experimentos. El objetivo no es dibujar nubes redundantes, sino justificar y verificar qué ocurre cuando una zona, una identidad o un conjunto de datos deja de estar disponible.


## Aprende construyendo

### Tema 1: Una red segura empieza por flujos, no por subredes

#### Paso 1 · Objetivo y preparación
Al finalizar podrás diseñar una red cloud desde cero. Prerrequisitos: Node.js y Docker; verifica `node --version`.
#### Paso 2 · Contexto y caso real
Una plataforma de entregas necesita separar tráfico público, privado y administrativo.
#### Paso 3 · Teoría, modelo mental y analogía
La red es una ciudad con barrios, rutas, puertas y controles de entrada.
#### Paso 4 · Demostración guiada
Crea `src/network.js` desde una carpeta vacía.
```bash
mkdir ejemplo-network
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: usa CIDR solapado para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Define subnets públicas y privadas, rutas y firewall.
#### Paso 7 · Cierre y evidencia
Entrega diagrama, salida, fallo y corrección; explica el resultado. Siguiente paso: gobierno. Errores comunes: subnets sin rutas y 0.0.0.0/0 innecesario. Fuente oficial: https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html.
**Conceptos clave:** VPC/VNet, CIDR, subnet, route table, availability zone, internet gateway, NAT, private endpoint, security group, firewall, north-south, east-west, DNS y zero trust.

Empieza con actores y comunicaciones necesarias: usuario→edge, edge→API, API→base y operadores→plano de control. Luego asigna zonas, rutas y controles. “Público” significa que existe ruta desde Internet, no que todo tráfico esté permitido. Una base privada necesita retorno, resolución DNS y endpoints para servicios; esconderla en una subred no reemplaza autenticación ni cifrado.

Los security groups son controles de flujo con estado; las ACL y firewalls tienen otros alcances. Usa referencias entre identidades/grupos cuando sea posible y evita rangos amplios. Un NAT permite salida, no convierte mágicamente una carga en privada ni inspecciona intención. Private endpoints reducen tránsito público, pero requieren políticas de recurso y DNS correctos.

```hcl
resource "aws_security_group_rule" "api_to_db" {
  type                     = "ingress"
  security_group_id        = aws_security_group.db.id
  source_security_group_id = aws_security_group.api.id
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  description              = "Solo la API accede a PostgreSQL"
}
```

Registra flow logs y prueba rutas positivas y negativas. Documenta dependencia de DNS, certificados, egress y proveedor de identidad: son puntos de fallo frecuentes que un diagrama de tres capas suele omitir.

**Analogía:** una red es una ciudad; las subredes son barrios, las rutas son carreteras y los controles son accesos. Vivir lejos del centro no sustituye cerrar la puerta.

**¿Por qué es importante?** porque la conectividad excesiva aumenta radio de ataque y la conectividad incompleta causa fallos difíciles de diagnosticar.

**Casos de uso reales:** base con IP pública, regla `0.0.0.0/0`, DNS privado inconsistente, dependencia sin egress y única NAT gateway como punto de fallo.

**Diagrama:**

```text
Internet -> edge/WAF -> balanceador -> API privada -> DB privada
                              |             |
                         logs/metrics   endpoint privado
flujo no declarado --------------------------X
```

### Tema 2: Una landing zone convierte gobierno en una base repetible

#### Paso 1 · Objetivo y preparación
Al finalizar podrás gobernar varias cuentas desde cero. Prerrequisitos: Node.js y Docker; verifica `node --version`.
#### Paso 2 · Contexto y caso real
Una organización necesita separar equipos, límites y auditoría.
#### Paso 3 · Teoría, modelo mental y analogía
La jerarquía es un edificio de oficinas con políticas y responsables.
#### Paso 4 · Demostración guiada
Crea `src/governance.js` desde una carpeta vacía.
```bash
mkdir ejemplo-governance
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: deja una cuenta sin guardrail para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Define logging central, cuotas y break-glass.
#### Paso 7 · Cierre y evidencia
Entrega estructura, salida, fallo y corrección; explica el resultado. Siguiente paso: resiliencia. Errores comunes: cuentas sin dueño y privilegio global. Fuente oficial: https://docs.aws.amazon.com/organizations/latest/userguide/orgs_introduction.html.
**Conceptos clave:** organization, account/project/subscription, management group, folder, identity federation, break-glass, guardrail, policy, centralized logging, audit trail, quota, tagging y blast radius.

Separa producción, no producción, seguridad y logs en cuentas/proyectos cuando el riesgo lo justifique. Esa frontera limita cuotas, facturación, credenciales y efectos de una configuración errónea. Evita usuarios permanentes y access keys personales: federa identidad, usa roles temporales y registra elevación. La cuenta break-glass se prueba y vigila sin convertirla en atajo cotidiano.

Una landing zone instala antes de las cargas: regiones permitidas, prohibición de recursos públicos, cifrado, logs inmutables, contactos, presupuestos y etiquetas. Los controles preventivos bloquean; los detectivos encuentran; los correctivos reparan. Ninguno debe desplegarse sin pruebas y proceso de excepción con dueño y vencimiento.

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Deny",
    "Action": "cloudtrail:StopLogging",
    "Resource": "*",
    "Condition": {"StringNotLike": {"aws:PrincipalArn": "*/SecurityAutomation"}}
  }]
}
```

Centraliza auditoría en un destino que las cuentas de aplicaciones no puedan borrar. Gestiona IaC como producto versionado y prueba cambios en una organización de laboratorio. AWS Organizations/Control Tower, Azure Landing Zones y Google Cloud enterprise foundations expresan patrones equivalentes con semántica diferente.

**Analogía:** la landing zone son cimientos, servicios públicos y normas del barrio antes de construir casas; añadirlos después obliga a mover estructuras habitadas.

**¿Por qué es importante?** porque el gobierno manual diverge y un compromiso de una cuenta no debe controlar toda la organización.

**Casos de uso reales:** logs borrables por administrador de aplicación, credencial compartida, región no aprobada, producción mezclada con sandbox y excepción sin caducidad.

**Diagrama:**

```text
identidad federada -> organización
                      |- seguridad/logs inmutables
                      |- producción
                      |- no producción
                      `- sandbox
políticas centrales -> todas; permisos locales -> mínimo necesario
```

### Tema 3: Disponibilidad y recuperación responden preguntas distintas

#### Paso 1 · Objetivo y preparación
Al finalizar podrás diseñar resiliencia desde cero. Prerrequisitos: Node.js y Docker; verifica `node --version`.
#### Paso 2 · Contexto y caso real
Una caída regional no debe borrar datos ni detener entregas críticas.
#### Paso 3 · Teoría, modelo mental y analogía
Redundancia es tener rutas alternativas con objetivos RTO y RPO explícitos.
#### Paso 4 · Demostración guiada
Crea `src/resilience.js` desde una carpeta vacía.
```bash
mkdir ejemplo-resilience
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: elimina una réplica para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Compara pilot light, warm standby y active-active.
#### Paso 7 · Cierre y evidencia
Entrega estrategia, salida, fallo y corrección; explica el resultado. Siguiente paso: recuperación. Errores comunes: replicar sin probar y confundir RPO con RTO. Fuente oficial: https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html.
**Conceptos clave:** fault domain, multi-AZ, multi-region, redundancy, quorum, graceful degradation, RTO, RPO, backup, replication, pilot light, warm standby, active-active y consistency.

Alta disponibilidad mantiene el servicio ante fallos previstos; disaster recovery restaura después de un desastre. Define por viaje de usuario: RTO es tiempo máximo aceptable para recuperar; RPO es pérdida temporal máxima de datos. “Cero” tiene costos y complejidad enormes. Alinea objetivos con impacto, no con entusiasmo técnico.

Multi-AZ suele reducir fallos de infraestructura dentro de región. Multi-región añade protección, pero también latencia, replicación, conflictos, claves, cuotas y operación. Backup/restore es económico y lento; pilot light conserva núcleo; warm standby mantiene capacidad reducida; active-active ofrece tiempos bajos a cambio de coordinación intensa.

```text
Servicio         RTO       RPO       Estrategia
catálogo         4 h       24 h      reconstruir + backup
pedidos          30 min    5 min     warm standby + réplica
pagos            5 min     ~0        proveedor idempotente + failover ensayado
```

Diseña degradación: si recomendaciones fallan, compra puede continuar; si identidad falla, una sesión válida quizá opere de forma limitada según riesgo. Evita reintentos en cascada mediante deadlines, backoff, jitter y circuit breakers. Prueba capacidad de la región secundaria y dependencias globales.

**Analogía:** el cinturón evita daños en muchos accidentes; el plan de rescate actúa cuando el accidente ya ocurrió. Ambos importan, pero resuelven momentos distintos.

**¿Por qué es importante?** porque redundancia no garantiza datos correctos y replicación puede copiar corrupción inmediatamente.

**Casos de uso reales:** caída de zona, borrado lógico replicado, secundario sin cuota, DNS con TTL excesivo y active-active con escrituras conflictivas.

**Diagrama:**

```text
región A: zonas A/B -> réplica/backup -> región B o almacén aislado
        disponibilidad              recuperación
fallo -> detectar -> contener -> conmutar/restaurar -> validar -> comunicar
```

### Tema 4: Un backup solo existe operativamente después de restaurarlo

#### Paso 1 · Objetivo y preparación
Al finalizar podrás probar recuperación desde cero. Prerrequisitos: Node.js y Docker; verifica `node --version`.
#### Paso 2 · Contexto y caso real
Un backup sin restauración comprobada no es garantía operativa.
#### Paso 3 · Teoría, modelo mental y analogía
Un game day ensaya un incidente con hipótesis, límites y evidencia.
#### Paso 4 · Demostración guiada
Crea `src/restore-test.js` desde una carpeta vacía.
```bash
mkdir ejemplo-restore
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: restaura dependencias en orden incorrecto para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Escribe runbook, condición de aborto y medición.
#### Paso 7 · Cierre y evidencia
Entrega runbook, salida, fallo y corrección; explica el resultado. Siguiente paso: plataforma. Errores comunes: no probar integridad y conservar backups mutables. Fuente oficial: https://sre.google/sre-book/testing-reliability/.
**Conceptos clave:** restore test, immutability, retention, encryption key, integrity, dependency order, runbook, chaos experiment, steady state, hypothesis, abort condition, evidence y game day.

Verifica que el backup contiene datos, que la clave está disponible, que versiones son compatibles y que la aplicación funciona. Restaura en entorno aislado, ejecuta consultas de integridad y un recorrido de usuario. Mide tiempo real y compáralo con RTO/RPO. Conserva copias inmutables o aisladas para ransomware y borrado administrativo.

Un experimento de caos empieza con estado estable y una hipótesis: “si perdemos una instancia/zona, 99% de solicitudes seguirá correcto y la latencia p95 permanecerá bajo 500 ms”. Limita alcance, define abort conditions, confirma observabilidad y autoridad. Empieza en laboratorio y avanza según evidencia; caos no significa romper sin control.

```yaml
experiment:
  hypothesis: "La API conserva su SLO al perder una réplica"
  steady_state: "success_rate >= 0.99 and p95_ms < 500"
  action: "terminar una réplica no líder"
  abort: "error_rate > 0.05 for 2m"
  verify: ["alarm fired", "traffic shifted", "capacity recovered"]
```

El runbook especifica disparador, roles, comandos seguros, comprobaciones, comunicación, rollback y escalamiento. Evita placeholders y pasos destructivos ambiguos. Después del game day registra diferencias entre diseño y realidad y convierte hallazgos en acciones con responsable.

**Analogía:** guardar un paracaídas no demuestra que abre; se inspecciona, se ensaya y se conoce cuándo usarlo.

**¿Por qué es importante?** porque permisos, claves, cuotas y dependencias suelen fallar precisamente durante la recuperación.

**Casos de uso reales:** backup cifrado sin clave, restauración que excede RTO, runbook obsoleto, alarma que no pagina y failover que sobrecarga el secundario.

**Diagrama:**

```text
backup -> restaurar aislado -> integridad -> prueba funcional -> medir RTO/RPO
hipótesis -> limitar -> inyectar fallo -> observar -> abortar/recuperar -> aprender
```

## Revisión oficial de plataforma — julio de 2026

### Nube de evolución continua y vigilancia de retiros

No existe una versión única de AWS, Azure o Google Cloud. La revisión periódica consulta **AWS What's New**, **Azure Updates** y **Google Cloud release notes**, además de avisos de seguridad, cuotas, precios, regiones y retiros. Una novedad en preview no se convierte en arquitectura base; primero se valida disponibilidad regional, SLA, límites, IaC, observabilidad, coste, portabilidad y plan de salida. El laboratorio Floci/StackPort enseña contratos, pero las diferencias con el proveedor real se mantienen documentadas.

**Aplicación al proyecto:** selecciona tres servicios usados, registra fecha/estado/región, identifica un retiro o cambio incompatible, ejecuta pruebas contra emulador y entorno real acotado, y abre una decisión de migración con coste y rollback.


## Laboratorio práctico

1. Dibuja flujos y fronteras de tu proyecto multi-cloud; prueba cinco comunicaciones permitidas y cinco denegadas.
2. Diseña una landing zone equivalente para AWS, Azure y GCP con separación, identidad, logs y políticas.
3. Define RTO/RPO para tres recorridos y elige estrategia justificando costo, consistencia y complejidad.
4. Crea backup, simula pérdida y restaura en entorno aislado. Ejecuta pruebas funcionales y mide tiempos.
5. Ejecuta un experimento de pérdida de instancia/dependencia con hipótesis y abort condition.
6. Entrega runbook, timeline, resultados, brechas y acciones con dueño.

**Verificación:** las diez comunicaciones producen exactamente cinco permisos y cinco denegaciones justificadas; la restauración recupera los tres recorridos dentro de sus RTO/RPO declarados; el experimento se detiene al alcanzar la condición de aborto; y el runbook permite que otra persona repita la pérdida y recuperación. Conserva tiempos medidos, logs, comprobaciones funcionales y diferencias frente al diseño como evidencia.

<!-- OFFICIAL-TOPIC-ATLAS:START -->
## Atlas completo de temas oficiales

Derivado de la [documentación oficial](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html), sus referencias, migraciones y guías de operación. Inventariar no equivale a dominar: cada selección se demuestra con código, prueba, medición y explicación. **Cobertura: 60 temas.**

| Área | Temas que deben poder explicarse y aplicarse | Evidencia práctica |
|---|---|---|
| Fundamentos | `IaaS PaaS SaaS` · `regions and zones` · `shared responsibility` · `identity` · `networks` · `compute` · `storage` · `databases` | arquitectura |
| Arquitecturas | `Well-Architected` · `landing zones` · `multi-account` · `serverless` · `containers` · `event-driven` · `microservices` · `batch` · `edge` | arquitectura |
| Datos | `relational` · `key-value` · `document` · `graph` · `time-series` · `object storage` · `lakehouse` · `streaming` · `governance` · `residency` | arquitectura |
| Seguridad | `IAM and federation` · `zero trust` · `KMS` · `secrets` · `WAF and DDoS` · `posture` · `audit` · `threat detection` · `supply chain` · `compliance` | arquitectura |
| Confiabilidad | `HA` · `quorum` · `retries` · `idempotency` · `queues` · `circuit breaker` · `autoscaling` · `multi-region` · `backup` · `restore` · `RPO RTO` · `chaos` | arquitectura |
| Operación | `observability` · `SLO` · `IaC` · `policy` · `FinOps` · `sustainability` · `performance` · `migration` · `hybrid` · `AI ML governance` · `deprecations` | arquitectura |

### Método de estudio y proyecto de ampliación

Para cada tema responde qué problema resuelve, cuál es su modelo mental, cómo falla, cómo se verifica y cuándo no conviene. Elige uno por área e intégralos en un proyecto propio de ampliación. Entrega diagrama, ADR, pruebas de éxito y fallo, una medición, una amenaza y el enlace oficial con versión y fecha. Una API preview se aísla en laboratorio y nunca se presenta como base estable.
<!-- OFFICIAL-TOPIC-ATLAS:END -->

