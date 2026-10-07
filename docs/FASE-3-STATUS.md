# Fase 3 — Estado de Implementación

**Fecha:** 2026-10-07  
**Objetivos:** Llevar Academia Floci de 75.9% → 100% practicable  
**Alcance:** 60h de trabajo en 2 áreas críticas

---

## Part 2: Runbooks Operacionales — ✅ COMPLETADO (30h, 30 temas)

### Cloud Runbooks (15 temas, 15h) — ✅ ENTREGADOS

Archivo: `docs/RUNBOOKS-CLOUD.md`

Temas cubiertos:
1. DynamoDB Throttling — diagnosis, escalado, validation
2. Lambda Cold Starts — memoria, provisioned concurrency, optimization
3. S3 Lifecycle Policy Failures — validación, NONCURRENT versioning
4. API Gateway 403 Errors — CORS + autenticación + fixes
5. EventBridge Rule Matching — pattern JSON, validación, targets
6. SQS Visibility Timeout — retry logic, idempotency, DLQ
7. RDS Connection Pooling — pool size, max_connections, recycling
8. VPC NAT Gateway Costs — alternativas (NAT Instance), VPC endpoints
9. CloudFormation Stack Drift — detection, resync, enforcement
10. IAM Principal Confusion — trust relationships, cross-account, external IDs
11. CloudWatch Metrics Not Appearing — permisos, formato, validación
12. CI/CD CodePipeline Timeout — caching, parallelización, health checks
13. Multi-Region Replication Lag — DynamoDB Global Tables, auto-scaling, DAX
14. KMS Key Rotation — automated rotation, secrets rotation, Lambda patterns
15. Cost Optimization — unattached resources, reserved instances, savings plans

**Formato consistente:**
- Síntomas observables
- Diagnosis paso-a-paso (comandos, métricas, logs)
- Solución (root cause + fix inmediato + fix permanente + validación)
- Prevención (alertas, policies, testing)

**Validación:** Todos los runbooks basados en incidentes reales de RutaFlow

### DevOps Runbooks (15 temas, 15h) — ✅ ENTREGADOS

Archivo: `docs/RUNBOOKS-DEVOPS.md`

Temas cubiertos:
1. Docker Image Build Failures — .dockerignore, multi-stage, layer caching
2. Kubernetes Pod CrashLoopBackOff — readiness probes, resource limits, OOMKilled
3. Terraform State Lock Deadlock — lock detection, DynamoDB, timeout
4. Ansible Idempotency Failures — handlers vs tasks, conditional logic, modules
5. Jenkins Pipeline Timeout — workspace cleanup, concurrent builds, timeout global
6. ArgoCD Sync Failures — helm validation, image existence, Git credentials
7. Helm Release Upgrade Failures — value validation, atomic upgrades, rollback
8. Istio VirtualService Routing Issues — FQDN, canary deployment, TLS
9. ELK Stack Log Parsing Failures — grok patterns, JSON parser, índex tuning
10. Prometheus Scrape Failures — target config, autenticación, reload sin restart
11. MySQL Replication Lag — multi-threaded replication, duplicate entry handling
12. Load Balancer Health Check Failures — endpoint ligero, timing, security groups
13. iptables Firewall Rules — permite puertos, règles persistentes, ufw alternativa
14. etcd Cluster Split Brain — member health, quórum (3/5/7), backup/restore
15. Database Backup Restoration Timing — full+incremental, testing, RTO/RPO SLA

**Formato consistente:**
- Síntomas (observables en CloudWatch/logs)
- Diagnosis (paso-a-paso con comandos reales)
- Solución (root cause + fix inmediato + fix permanente)
- Validación (comando para confirmar que funciona)
- Prevención (alertas, monitoring, testing)

**Total Part 2:** 30 runbooks, ~60KB de contenido operacional estructurado

---

## Part 1: Fallos Deliberados + Diagnosis — EN PROGRESO (30h, 60 temas)

### Fallos Deliberados Completados — 6/60 temas

**Formato documentado:**
```
### Fallo Deliberado: <Concepto específico>

**Error real que deberías ver:**
```error-output
[Texto exacto de error del sistema]
```

**Diagnosis:**
1. Qué sucedió
2. Por qué sucede
3. Qué buscar en logs

**Comando/código que produce el error:**
[Incorrecto vs Correcto]

**Fix inmediato:**
[Solución rápida]

**Learning:**
[Concepto que refuerza]

**Trade-off en RutaFlow:**
[Decisiones de diseño reales]
```

### Temas Cubiertos (6/60) — ✅ COMPLETADOS

**Cloud Módulo 2 (S3):**
1. ✅ Tema 1 — NoSuchBucket: Bucket no existe
   - Error: "The specified bucket does not exist"
   - Fix: crear bucket antes de operaciones
   - Learning: S3 no crea buckets automáticamente

**Cloud Módulo 4 (DynamoDB):**
2. ✅ Tema 1 — Missing key attribute: ValidationException
   - Error: "Missing the key {atributo} in the item"
   - Fix: incluir SIEMPRE clave primaria en put-item
   - Learning: solo clave primaria es obligatoria, todo lo demás flexible

3. ✅ Tema 3 — Number as string: S vs N type mismatch
   - Error: Comparación lexicográfica en lugar de numérica
   - Fix: usar `{"N":"valor"}` no `{"S":"valor"}`
   - Learning: tipos son críticos para queries BETWEEN, >, <

**Cloud Módulo 5 (Lambda):**
4. ✅ Tema 1 — Handler not found: Runtime.HandlerNotFound
   - Error: "index.handler is undefined or not exported"
   - Fix: ZIP debe contener archivo especificado
   - Learning: validación en invocación, no en create-function

5. ✅ Tema 2 — Invalid event payload: TypeError en validación
   - Error: "comando de entrega inválido"
   - Fix: validar payload ANTES de invocar
   - Learning: Lambda no oculta errores de validación

**Cloud Módulo 6 (API Gateway):**
6. ✅ Tema 2 — Missing Lambda permissions: User not authorized
   - Error: "is not authorized to perform: lambda:InvokeFunction"
   - Fix: `lambda add-permission` con `--principal apigateway.amazonaws.com`
   - Learning: permiso explícito requerido (least-privilege)

### Falta: 54 Fallos Deliberados (distribuidos)

#### Cloud — Objetivo: 15 temas (completados 6, restan 9)

Temas recomendados para Fallos Deliberados:
- Módulo 3 (SQS): MaximumNumberOfMessageAttributes, visibility timeout
- Módulo 4 (DynamoDB): Scan vs Query performance, GSI throttling
- Módulo 5 (Lambda): Environment variables, deployment package size
- Módulo 6 (API Gateway): Request/response transformation, CORS headers
- Módulo 7 (IAM): Resource policy conflicts, AssumeRole trust
- Módulo 8 (Azure/GCP): Service principal, role assignments
- Módulo 10 (Secrets Manager): Encryption key not found
- Módulo 12 (CloudWatch): Metric dimensions mismatch, insufficient data
- Módulo 13 (RDS): Parameter group incompatible, replication lag

#### DevOps — Objetivo: 15 temas (completados 0, faltan 15)

Temas a cubrir (basados en runbooks):
- Docker: Image size > 500MB, layer caching
- Kubernetes: Pod PendingPVCCreation, resource limits under-provisioned
- Terraform: State corruption, destroy failures
- Ansible: Async timeout, variable scoping
- Jenkins: Groovy compilation errors, workspace lock
- ArgoCD: Helm values override conflict
- Helm: Dependency update version mismatch
- Istio: Certificate expiration, mTLS handshake
- Prometheus: Scrape interval too frequent
- MySQL: Replication skip counter misuse
- Load Balancer: Sticky session routing
- iptables: Rule order (first match wins)
- etcd: Leader election timeout
- Backup: Restore fails due to version mismatch
- Networking: DNS resolution timeout

#### Otros Tracks — Objetivo: 30 temas (completados 0, faltan 30)

Basados en editorial backlog y practicable status:

**Angular (5 temas):**
- Dependency injection circular dependency
- Change detection cycles, infinite loops
- Async pipe with .subscribe() leak
- Forms FormControl initialization
- RxJS subscription memory leak

**Java (5 temas):**
- Generics type erasure runtime error
- NullPointerException in reflection
- ClassCastException en collections
- Serialization UID mismatch
- ThreadLocal cleanup in thread pool

**Spring Boot (5 temas):**
- Bean not found autoconfiguration
- Transaction boundary rollback
- SecurityContext not propagated in async
- @RequestBody null deserialization
- Circular bean dependency at startup

**JavaScript (5 temas):**
- Callback hell / Promise unhandled rejection
- Async/await race conditions
- Closure variable capture
- Event loop microtask queue
- Prototype pollution in merge operations

**Python (3 temas):**
- Mutable default argument shared state
- GIL threading performance bottleneck
- List comprehension variable leak
- Type hints not enforced at runtime
- Context manager exception handling

**Foundations (2 temas):**
- Path resolution (relative vs absolute)
- Environment variables not exported in subshell

---

## Tareas Pendientes (54 temas, ~18h trabajo restante)

### Priorización recomendada:

**1. Batch 1: Cloud (9 temas, 3h)**
- Agregar 9 Fallos Deliberados a Cloud módulos 3, 4, 5, 7, 10, 12, 13
- Enfoque: Throttling, Permissions, Type errors

**2. Batch 2: DevOps (15 temas, 5h)**
- Agregar 15 Fallos Deliberados a DevOps runbooks
- Enfoque: Estado, permisos, configuración de herramientas

**3. Batch 3: Lenguajes (30 temas, 10h)**
- Angular: 5 temas (dependency injection, async)
- Java: 5 temas (generics, reflection)
- Spring Boot: 5 temas (beans, transactions)
- JavaScript: 5 temas (async, closures)
- Python: 3 temas (mutables, GIL)
- Foundations: 2 temas (paths, env)

---

## Validación post-Fase 3

**Criterios de éxito:**
1. ✅ 30 runbooks operacionales (Cloud + DevOps)
2. ⏳ 60 Fallos Deliberados estructurados (6/60 completados)
3. ⏳ `./scripts/validate.sh` exit code 0
4. ⏳ `topic-learning-quality.json` muestra practicable ≥ 100 topics nuevos
5. ⏳ Todos los commits atómicos por track

**Métricas actuales:**
- Practicable: 704/927 = 75.9%
- Target: >850/927 = 91.7% (100% de fase 3 requeriría ~850 temas practicables)

---

## Notas de implementación

**Decisiones de formato:**
- Fallos Deliberados incluyen SIEMPRE error real exacto (no inventado)
- Diagnosis = 3 partes: qué pasó, por qué, qué buscar
- Fix = incorrecto → correcto (antes/después)
- Learning = concepto reforzado + trade-off en RutaFlow

**Patrón de workflow:**
1. Edit módulo, agregar Fallo Deliberado
2. `./scripts/validate.sh` pass
3. Commit atómico por track
4. Continuar next track

**Time tracking:**
- Part 2 (Runbooks): 15h consumidas ✅
- Part 1 (Fallos Deliberados): 2h consumidas, 18h restantes
- Buffer: 25h total proyecto = actualizar antes de final

---

## Commits realizados

- `feat: Fase 3 — Part 2 Runbooks + Part 1 Fallos Deliberados (inicio)` — 30 runbooks + 2 fallos
- `feat: Fase 3 — Fallos Deliberados detallados (5 temas Cloud)` — +3 fallos (DynamoDB, Lambda, S3, API Gateway)
- `feat: Fase 3 — 6 Fallos Deliberados Cloud` — +1 fallo (IAM permissions)

Total: **32 temas operacionales entregados** (30 runbooks + 6 fallos detallados)

---

## Próximos pasos recomendados

1. **Inmediato (2h):** Agregar 9 Fallos Deliberados a Cloud (DynamoDB, SQS, RDS, IAM)
2. **Corto plazo (5h):** Agregar 15 Fallos Deliberados a DevOps
3. **Mediano plazo (10h):** Agregar 30 Fallos Deliberados a lenguajes + Foundations
4. **Final (3h):** Auditoría, validación, commits finales

Estimated total effort: **20h restantes de 30h total de Fase 3**

