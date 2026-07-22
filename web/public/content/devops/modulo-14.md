# Módulo 14: SRE y plataforma — confiabilidad, incidentes y supply chain

Automatizar despliegues es el comienzo, no el final. Un sistema profesional define qué significa estar sano, limita el riesgo de cambio, conserva procedencia de artefactos y aprende de incidentes. Este módulo conecta DevOps, SRE, seguridad de cadena de suministro y platform engineering mediante evidencia operativa.


## Aprende construyendo

### Tema 1: Confiabilidad es una expectativa cuantificada

#### Paso 1 · Objetivo y preparación
Al finalizar podrás aplicar este tema desde cero. Prerrequisitos: instala las herramientas oficiales indicadas y verifica sus versiones.

#### Paso 2 · Contexto y caso real
En un caso real de software, esta práctica protege, automatiza u opera una API de entregas con cambios trazables y recuperación ante fallos.

#### Paso 3 · Teoría, modelo mental y analogía
Define el contrato, el flujo, los límites y la métrica que demuestra éxito. La analogía es una cadena de producción: cada etapa valida una propiedad y deja evidencia para la siguiente.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-operacion
cd ejemplo-operacion
printf "configuracion\n" > README.md
git init
docker --version
git status
```
Crea src/example.config o el archivo principal del tema y ejecuta la herramienta real; documenta ruta, comandos y salida.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente una configuración para provocar un fallo deliberado; lee el diagnóstico, corrígelo y vuelve a ejecutar. Resultado esperado: verificación verde y evidencia reproducible.

#### Paso 6 · Práctica independiente
Añade un caso normal, uno límite y uno inválido; automatiza una comprobación y documenta rollback, seguridad y observabilidad.

#### Paso 7 · Cierre y evidencia
Guarda código, comandos, logs, captura y decisión; como siguiente paso intégralo en CI/CD. Errores comunes: versiones flotantes, secretos en repositorio, probar solo el camino feliz y no definir responsable de la alerta. Fuentes oficiales: https://12factor.net/ y https://sre.google/sre-book/.
**¿Por qué es importante?** Porque operar un sistema exige evidencia, límites y recuperación, no solo una ejecución exitosa.
**Evidencia de aprendizaje:** entrega proyecto aislado, resultado, fallo, corrección, prueba y medición.
**Conceptos clave:** user journey, SLI, SLO, SLA, error budget, availability, latency, correctness, window, burn rate y toil.

Empieza por una experiencia: “crear una tarea y verla confirmada”. Un SLI es una proporción medible de eventos buenos sobre válidos; un SLO fija el objetivo durante una ventana. Un SLA es compromiso contractual y no debe confundirse con el objetivo interno. 100% suele ser económicamente imposible e incluso frena cambios que mejorarían el producto.

```promql
sum(rate(http_requests_total{route="/tasks",code=~"2.."}[5m]))
/
sum(rate(http_requests_total{route="/tasks"}[5m]))
```

Define eventos válidos y exclusiones antes de mirar el resultado. Para 99.9% mensual, el 0.1% restante es presupuesto de error. Si se consume rápido, reduce cambios riesgosos y prioriza confiabilidad; si permanece saludable, existe espacio para evolucionar. Usa burn rate en ventanas corta y larga para detectar consumo rápido sin alertar por cada error aislado.

**Analogía:** el presupuesto de error es combustible para cambiar con velocidad controlada, no permiso para ignorar fallos.

**¿Por qué es importante?** porque alinea ingeniería y producto con una regla observable en vez de discutir si “parece estable”.

**Casos de uso reales:** API disponible pero incorrecta, dependencia excluida artificialmente, SLO imposible, freeze de cambios y latencia que afecta conversión.

**Diagrama:**

```text
viaje de usuario -> SLI -> SLO/ventana -> presupuesto
                                      -> sano: innovar
                                      -> agotado: estabilizar
```

### Tema 2: Una alerta debe conducir a una acción

#### Paso 1 · Objetivo y preparación
Al finalizar podrás aplicar este tema desde cero. Prerrequisitos: instala las herramientas oficiales indicadas y verifica sus versiones.

#### Paso 2 · Contexto y caso real
En un caso real de software, esta práctica protege, automatiza u opera una API de entregas con cambios trazables y recuperación ante fallos.

#### Paso 3 · Teoría, modelo mental y analogía
Define el contrato, el flujo, los límites y la métrica que demuestra éxito. La analogía es una cadena de producción: cada etapa valida una propiedad y deja evidencia para la siguiente.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-operacion
cd ejemplo-operacion
printf "configuracion\n" > README.md
git init
docker --version
git status
```
Crea src/example.config o el archivo principal del tema y ejecuta la herramienta real; documenta ruta, comandos y salida.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente una configuración para provocar un fallo deliberado; lee el diagnóstico, corrígelo y vuelve a ejecutar. Resultado esperado: verificación verde y evidencia reproducible.

#### Paso 6 · Práctica independiente
Añade un caso normal, uno límite y uno inválido; automatiza una comprobación y documenta rollback, seguridad y observabilidad.

#### Paso 7 · Cierre y evidencia
Guarda código, comandos, logs, captura y decisión; como siguiente paso intégralo en CI/CD. Errores comunes: versiones flotantes, secretos en repositorio, probar solo el camino feliz y no definir responsable de la alerta. Fuentes oficiales: https://12factor.net/ y https://sre.google/sre-book/.
**¿Por qué es importante?** Porque operar un sistema exige evidencia, límites y recuperación, no solo una ejecución exitosa.
**Evidencia de aprendizaje:** entrega proyecto aislado, resultado, fallo, corrección, prueba y medición.
**Conceptos clave:** symptom, cause, page, ticket, runbook, incident commander, severity, timeline, mitigation, recovery, game day y blameless postmortem.

Alerta por síntomas de usuario y consumo de presupuesto; usa métricas causales para diagnóstico. Una página despierta a una persona solo si exige acción inmediata. Cada alerta tiene propietario, severidad, enlace a dashboard y runbook con verificación y contención segura.

En esta regla, `labels` y `annotations` son metadatos con responsabilidades diferentes. Los **labels** tienen valores pequeños y estables que participan en agrupación, enrutamiento y silencios (`severity`, `team`, `service`); cambiar un label puede crear una serie distinta y alterar a quién se notifica. Las **annotations** transportan contexto humano que no identifica la alerta, como resumen, descripción y enlace al runbook. No coloques identificadores de petición, mensajes completos de error ni valores de alta cardinalidad en labels: multiplican series y elevan memoria, almacenamiento y coste de consulta.

Para leer el flujo: Prometheus evalúa `expr`; si permanece verdadera durante `for`, crea la alerta con sus labels y annotations; Alertmanager agrupa y enruta principalmente por labels; la persona abre el runbook indicado en annotations. Este modelo permite verificar cada frontera por separado en vez de tratar el YAML como configuración “mágica”.

```yaml
- alert: FastErrorBudgetBurn
  expr: job:slo_errors_per_request:ratio_rate5m > (14.4 * 0.001)
  for: 2m
  labels: { severity: page }
  annotations:
    summary: "La API consume rápidamente su presupuesto de error"
    runbook: "https://runbooks.example/tasks-api/high-burn"
```

Durante incidente separa coordinación, operaciones y comunicación. Mitiga primero, investiga después. Conserva timeline factual. El postmortem evita culpa individual y busca condiciones del sistema: controles faltantes, acoplamiento, documentación o carga. Las acciones tienen dueño y fecha. Un game day introduce un fallo acotado para verificar detección, autoridad, rollback y comunicación.

**Analogía:** una alarma de incendio útil indica zona y procedimiento; una sirena constante termina ignorada.

**¿Por qué es importante?** porque detectar sin responder solo transforma fallos técnicos en fatiga humana.

**Casos de uso reales:** alerta ruidosa sin runbook, rollback sin permisos, dependencia caída, certificado vencido y postmortem con acciones olvidadas.

**Diagrama:**

```text
detectar -> declarar -> roles -> contener -> recuperar
                                      -> timeline -> aprender -> acciones
```

### Tema 3: Construir una imagen no demuestra de dónde proviene

#### Paso 1 · Objetivo y preparación
Al finalizar podrás aplicar este tema desde cero. Prerrequisitos: instala las herramientas oficiales indicadas y verifica sus versiones.

#### Paso 2 · Contexto y caso real
En un caso real de software, esta práctica protege, automatiza u opera una API de entregas con cambios trazables y recuperación ante fallos.

#### Paso 3 · Teoría, modelo mental y analogía
Define el contrato, el flujo, los límites y la métrica que demuestra éxito. La analogía es una cadena de producción: cada etapa valida una propiedad y deja evidencia para la siguiente.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-operacion
cd ejemplo-operacion
printf "configuracion\n" > README.md
git init
docker --version
git status
```
Crea src/example.config o el archivo principal del tema y ejecuta la herramienta real; documenta ruta, comandos y salida.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente una configuración para provocar un fallo deliberado; lee el diagnóstico, corrígelo y vuelve a ejecutar. Resultado esperado: verificación verde y evidencia reproducible.

#### Paso 6 · Práctica independiente
Añade un caso normal, uno límite y uno inválido; automatiza una comprobación y documenta rollback, seguridad y observabilidad.

#### Paso 7 · Cierre y evidencia
Guarda código, comandos, logs, captura y decisión; como siguiente paso intégralo en CI/CD. Errores comunes: versiones flotantes, secretos en repositorio, probar solo el camino feliz y no definir responsable de la alerta. Fuentes oficiales: https://12factor.net/ y https://sre.google/sre-book/.
**¿Por qué es importante?** Porque operar un sistema exige evidencia, límites y recuperación, no solo una ejecución exitosa.
**Evidencia de aprendizaje:** entrega proyecto aislado, resultado, fallo, corrección, prueba y medición.
**Conceptos clave:** dependency graph, SBOM, provenance, digest, signature, attestation, trusted builder, least privilege, OIDC, admission policy, SLSA y reproducibility.

Fija dependencias y acciones por versión/digest, reduce permisos y usa credenciales efímeras mediante identidad federada. Un SBOM inventaría componentes; no afirma que sean seguros. Un escáner compara hallazgos conocidos; tampoco prueba ausencia de vulnerabilidad. La procedencia describe quién y cómo construyó. Una firma vincula identidad con digest; solo es útil si el consumidor verifica política y protege la identidad firmante.

```bash
syft packages registry.example/tasks@sha256:ABC -o cyclonedx-json > sbom.json
cosign verify \
  --certificate-identity-regexp='github.com/example/tasks/' \
  --certificate-oidc-issuer='https://token.actions.githubusercontent.com' \
  registry.example/tasks@sha256:ABC
```

Promueve exactamente el mismo digest entre ambientes. Nunca reconstruyas “la misma versión” para producción. Conserva attestations y bloquea en admisión imágenes sin procedencia permitida. Las excepciones de vulnerabilidad requieren alcance, justificación, compensación y vencimiento.

**Analogía:** el SBOM es la lista de ingredientes; la firma sella el paquete; la procedencia registra la cocina. Ninguno sustituye inspección y política.

**¿Por qué es importante?** porque el pipeline y sus dependencias son parte del producto desplegado.

**Casos de uso reales:** action comprometida, tag mutable, paquete transitivo vulnerable, imagen reconstruida y firma válida de identidad no autorizada.

**Diagrama:**

```text
source -> builder confiable -> digest + SBOM + provenance + signature
                                              -> policy/admission -> runtime
```

### Tema 4: Una plataforma interna es un producto con límites

#### Paso 1 · Objetivo y preparación
Al finalizar podrás aplicar este tema desde cero. Prerrequisitos: instala las herramientas oficiales indicadas y verifica sus versiones.

#### Paso 2 · Contexto y caso real
En un caso real de software, esta práctica protege, automatiza u opera una API de entregas con cambios trazables y recuperación ante fallos.

#### Paso 3 · Teoría, modelo mental y analogía
Define el contrato, el flujo, los límites y la métrica que demuestra éxito. La analogía es una cadena de producción: cada etapa valida una propiedad y deja evidencia para la siguiente.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-operacion
cd ejemplo-operacion
printf "configuracion\n" > README.md
git init
docker --version
git status
```
Crea src/example.config o el archivo principal del tema y ejecuta la herramienta real; documenta ruta, comandos y salida.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente una configuración para provocar un fallo deliberado; lee el diagnóstico, corrígelo y vuelve a ejecutar. Resultado esperado: verificación verde y evidencia reproducible.

#### Paso 6 · Práctica independiente
Añade un caso normal, uno límite y uno inválido; automatiza una comprobación y documenta rollback, seguridad y observabilidad.

#### Paso 7 · Cierre y evidencia
Guarda código, comandos, logs, captura y decisión; como siguiente paso intégralo en CI/CD. Errores comunes: versiones flotantes, secretos en repositorio, probar solo el camino feliz y no definir responsable de la alerta. Fuentes oficiales: https://12factor.net/ y https://sre.google/sre-book/.
**¿Por qué es importante?** Porque operar un sistema exige evidencia, límites y recuperación, no solo una ejecución exitosa.
**Evidencia de aprendizaje:** entrega proyecto aislado, resultado, fallo, corrección, prueba y medición.
**Conceptos clave:** GitOps, reconciliation, drift, pull model, policy as code, golden path, self-service, platform API, tenancy, guardrail, developer experience y product metrics.

GitOps declara estado versionado y un reconciler converge el entorno. El repositorio no debe guardar secretos en claro; usa referencias o cifrado con gestión de claves. Separa promoción de configuración, controla quién aprueba y evita cambios manuales permanentes. Drift debe reconciliarse o documentarse, no normalizarse.

Policy as code aplica límites antes y durante despliegue: imágenes firmadas, recursos, namespaces, red y privilegios. Prueba políticas como software y ofrece mensajes reparables. Un golden path proporciona plantilla, pipeline, telemetría, documentación y soporte para el caso común, permitiendo escape consciente cuando el dominio lo requiere.

```rego
package kubernetes.admission

deny[msg] {
  input.kind.kind == "Pod"
  c := input.spec.containers[_]
  not c.securityContext.runAsNonRoot
  msg := sprintf("%s debe ejecutar como non-root", [c.name])
}
```

Mide la plataforma como producto: tiempo hasta primer deploy, éxito de pipelines, adopción, tickets, satisfacción y carga cognitiva. Centralizar sin escuchar crea otro cuello de botella. Define ownership, compatibilidad y deprecación de la API de plataforma.

**Analogía:** un golden path es una carretera bien señalizada con barreras; no obliga a todos los vehículos a ser iguales, pero hace seguro el viaje común.

**¿Por qué es importante?** porque estandarizar solo YAML no reduce la carga cognitiva ni crea una experiencia operable.

**Casos de uso reales:** drift manual, secreto en Git, política incomprensible, plantilla abandonada y plataforma que aumenta tickets.

**Diagrama:**

```text
equipo -> API/golden path -> Git -> reconciler -> cluster
             | políticas/tests       | drift
             + métricas/feedback <----+
```

## Revisión oficial de plataforma — julio de 2026

### Kubernetes 1.36, OpenTelemetry 1.59 y herramientas con ciclo propio

La revisión usa **Kubernetes 1.36** y **OpenTelemetry 1.59** como referencias, pero clusters gestionados, `kubectl`, APIs y add-ons no avanzan necesariamente juntos. Revisa deprecaciones y APIs removidas antes de subir una versión menor. OpenTelemetry define señales, SDK, OTLP y convenciones; no es el backend. **Terraform** y sus providers tienen ciclos separados: fija restricciones, lockfile y prueba el plan con cada actualización.

**Aplicación al proyecto:** escanea manifiestos por APIs obsoletas, prueba skew soportado de kubectl, valida Collector/configuración y semantic conventions, y ejecuta plan más pruebas de política antes de actualizar provider o core.


## Laboratorio práctico

1. Define dos viajes críticos, SLIs, SLOs, ventana y presupuesto. Construye dashboard y burn-rate alert.
2. Escribe runbook y ejecuta un game day: rompe una dependencia, declara, contiene, recupera y redacta postmortem.
3. Genera SBOM y procedencia, firma por digest con identidad OIDC y verifica antes del despliegue.
4. Configura reconciliación GitOps local y una política que rechace imagen sin digest o contenedor privilegiado.
5. Publica un golden path mínimo con plantilla, documentación, escape y métricas de adopción.

La entrega incluye repositorio reproducible, consultas, alertas, timeline, evidencias criptográficas, pruebas de política y decisión arquitectónica.

<!-- OFFICIAL-TOPIC-ATLAS:START -->
## Atlas completo de temas oficiales

Derivado de la [documentación oficial](https://kubernetes.io/docs/concepts/), sus referencias, migraciones y guías de operación. Inventariar no equivale a dominar: cada selección se demuestra con código, prueba, medición y explicación. **Cobertura: 60 temas.**

| Área | Temas que deben poder explicarse y aplicarse | Evidencia práctica |
|---|---|---|
| Sistemas | `Linux` · `processes` · `signals` · `permissions` · `systemd` · `networks` · `DNS` · `TLS` · `storage` · `troubleshooting` · `scripting` | plataforma |
| Contenedores | `OCI` · `image layers` · `BuildKit` · `rootless` · `Compose` · `registries` · `scanning` · `SBOM` · `signatures` · `runtime security` | plataforma |
| CI/CD | `pipelines` · `quality gates` · `immutable artifacts` · `environments` · `promotion` · `progressive delivery` · `rollback` · `GitOps` | plataforma |
| Kubernetes | `architecture` · `Pods` · `workloads` · `Services` · `Gateway API` · `storage` · `secrets` · `RBAC` · `policies` · `scheduling` · `autoscaling` · `operators` | plataforma |
| IaC | `Terraform language` · `modules` · `remote state y locking` · `providers` · `import` · `testing` · `policy as code` · `drift` · `secrets` | plataforma |
| Operación | `OpenTelemetry` · `logs metrics traces` · `SLI y SLO` · `burn-rate alerts` · `incidents` · `capacity` · `chaos` · `restore` · `FinOps` · `platform engineering` | plataforma |

### Método de estudio y proyecto de ampliación

Para cada tema responde qué problema resuelve, cuál es su modelo mental, cómo falla, cómo se verifica y cuándo no conviene. Elige uno por área e intégralos en un proyecto propio de ampliación. Entrega diagrama, ADR, pruebas de éxito y fallo, una medición, una amenaza y el enlace oficial con versión y fecha. Una API preview se aísla en laboratorio y nunca se presenta como base estable.
<!-- OFFICIAL-TOPIC-ATLAS:END -->

