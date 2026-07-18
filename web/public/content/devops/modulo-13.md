# Módulo 13: Proyecto integrador — pipeline CI/CD completo

## Sílabo

**Objetivo general**

Integrar en un único proyecto end-to-end todo lo aprendido en el track DevOps: desde un commit de código hasta un despliegue verificado en Kubernetes, pasando por CI con escaneo de seguridad, construcción y publicación de imagen, despliegue con Helm, observabilidad activa, y un procedimiento de rollback documentado y probado.

**Objetivos específicos**

1. Diseñar un pipeline CI/CD completo que encadene todas las etapas: commit, CI (test + escaneo), build, push, despliegue, verificación.
2. Integrar el escaneo de vulnerabilidades (Módulo 11) como un gate bloqueante dentro del pipeline de CI (Módulo 4).
3. Desplegar la aplicación a Kubernetes usando Helm (Módulo 7) con autoscaling configurado.
4. Conectar el despliegue con observabilidad activa: métricas en Grafana y al menos una alerta real (Módulo 9).
5. Documentar y probar un procedimiento de rollback (Módulo 5) ante un despliegue fallido simulado.
6. Producir un runbook de incidentes que cierre la checklist de producción del Módulo 12.

**Contenido**

- El pipeline completo: de commit a producción verificada.
- Uniendo cada módulo del track en un solo flujo.
- Cierre del track: checklist final y reflexión.

**Evaluación**

Un proyecto integrador que implementa (o documenta con evidencia detallada de diseño) el pipeline completo descrito, más tres ejercicios de evaluación sobre diseño de pipeline, diagnóstico de fallos, y diseño de rollback.

---

## Contenido teórico

### Tema 1: El pipeline completo — de commit a producción verificada

**Conceptos clave:** flujo end-to-end, etapas encadenadas, gates bloqueantes, verificación post-despliegue.

Este proyecto integrador construye, en un único flujo continuo, el pipeline que representa la síntesis de todo el track: un desarrollador hace `git push` de un commit (Módulo 1); esto dispara automáticamente un pipeline de CI (Módulo 4) que ejecuta tests automatizados y, como gate bloqueante, un escaneo de vulnerabilidades con Trivy sobre la imagen construida (Módulo 11); si el escaneo encuentra una vulnerabilidad crítica sin resolver, el pipeline se detiene ahí mismo y no avanza, exactamente como se practicó en el laboratorio del Módulo 11. Si el escaneo pasa, la imagen se etiqueta y se publica en un registry (Módulo 2), y el pipeline continúa hacia la etapa de despliegue.

La etapa de despliegue usa Helm (Módulo 7) para aplicar el chart actualizado con la nueva versión de la imagen contra un clúster de Kubernetes, aprovechando el `Deployment` con estrategia de `RollingUpdate` (Módulo 6) para una transición sin caída de servicio, con los `livenessProbe` y `readinessProbe` configurados (Módulo 7) asegurando que Kubernetes solo enruta tráfico hacia los Pods nuevos una vez que están efectivamente listos para recibirlo. El `HorizontalPodAutoscaler` (Módulo 7) queda activo para ajustar automáticamente la cantidad de réplicas según la carga real observada.

Inmediatamente después del despliegue, la etapa de verificación consulta las métricas expuestas a Prometheus (Módulo 9) —tasa de peticiones, tasa de error, latencia p95— comparando su comportamiento inmediatamente después del despliegue contra la línea base previa; si la tasa de error se eleva de forma anómala tras el despliegue, esto debería disparar automáticamente (o alertar para disparar manualmente) el procedimiento de rollback (Módulo 5), revirtiendo la implementación de Kubernetes al `ReplicaSet` anterior de forma prácticamente instantánea.

Todo este flujo, de principio a fin, es exactamente lo que un pipeline de CI/CD maduro en una organización real ejecuta de forma rutinaria decenas o cientos de veces al día, y cada etapa individual de este flujo es, precisamente, uno de los módulos que ya dominaste de forma aislada en este track; este proyecto integrador es la oportunidad de verlos operar juntos, como un sistema coherente, en vez de como piezas independientes estudiadas por separado.

**Analogía:** un pipeline CI/CD completo es como una línea de ensamblaje de una fábrica de automóviles moderna, donde cada estación de la línea (soldadura, pintura, control de calidad, ensamblaje final, prueba de manejo) corresponde a una etapa específica del pipeline, y ningún vehículo avanza a la siguiente estación hasta que pasa satisfactoriamente el control de calidad de la estación anterior —igual que ningún despliegue avanza hasta pasar el gate de escaneo de seguridad.

**¿Por qué es importante?** Ver el pipeline completo operar de principio a fin, con cada gate y cada verificación realmente funcionando, es la validación final de que el conocimiento adquirido módulo a módulo en este track se combina en un sistema coherente y realmente operativo, no solo en una colección de técnicas aisladas.

**Diagrama:**

```
git push ──▶ CI: tests ──▶ CI: escaneo Trivy ──▶ [¿crítica? ──▶ STOP]
                                    │ (pasa)
                                    ▼
                        build + push a registry
                                    │
                                    ▼
                    Helm upgrade (Deployment RollingUpdate,
                    liveness/readinessProbe, HPA activo)
                                    │
                                    ▼
                verificación: métricas Prometheus/Grafana
                                    │
                    ┌───────────────┴───────────────┐
              normal: fin exitoso          anómalo: rollback (Helm/kubectl)
```

### Tema 2: Uniendo cada módulo del track en un solo flujo

**Conceptos clave:** integración horizontal, dependencias entre etapas, trazabilidad end-to-end.

Construir el proyecto integrador no es simplemente ejecutar cada módulo del track por separado en secuencia, sino diseñar deliberadamente las conexiones entre ellos: la salida de una etapa se convierte en la entrada de la siguiente, y el estado de una etapa determina si la siguiente se ejecuta en absoluto. Por ejemplo, el resultado del escaneo Trivy del Módulo 11 (¿aprobado o rechazado?) determina directamente si la etapa de build/push del Módulo 2 se ejecuta; el resultado de la verificación post-despliegue del Módulo 9 (¿métricas normales o anómalas?) determina si se ejecuta el rollback del Módulo 5.

Esta integración horizontal también implica trazabilidad: dado un incidente en producción, debe ser posible recorrer hacia atrás la cadena completa —¿qué versión de la imagen está corriendo?, ¿de qué commit se construyó?, ¿pasó el escaneo de seguridad y con qué resultado exacto?, ¿qué pipeline lo desplegó y cuándo?— sin lagunas de información entre etapas. Etiquetar las imágenes con el hash del commit (no solo con `latest`, un antipatrón mencionado en el Módulo 2), y registrar logs correlacionables con un `correlation ID` (Módulo 10) en cada etapa, son las dos prácticas concretas que hacen posible esta trazabilidad completa de punta a punta.

Diseñar el proyecto integrador también obliga a resolver decisiones de orden que en los módulos individuales quedaban implícitas: ¿el escaneo de seguridad ocurre antes o después del build de la imagen final? (Después, típicamente, escaneando la imagen ya construida, aunque algunas organizaciones también escanean dependencias antes del build). ¿La verificación post-despliegue espera un tiempo fijo o monitorea continuamente durante una ventana? (Una ventana de monitoreo continuo, típicamente varios minutos, detecta mejor problemas que tardan en manifestarse que una verificación puntual inmediata).

Completar honestamente este ejercicio de integración —no solo enumerar qué módulos se conectan, sino realmente trazar cómo fluye la información y las decisiones entre ellos— es lo que distingue a alguien que "conoce Docker, Kubernetes, Terraform y Prometheus por separado" de alguien que "sabe operar un sistema DevOps completo", que es precisamente el objetivo de este track y de este proyecto final.

**Analogía:** conocer cada módulo por separado es como conocer cada instrumento de una orquesta individualmente; integrarlos en un pipeline completo es como dirigir la orquesta entera tocando junta, donde el valor real no está en cada instrumento aislado sino en cómo se coordinan entre sí en el tiempo correcto.

**¿Por qué es importante?** La mayoría del valor real de un pipeline CI/CD maduro está precisamente en las conexiones entre etapas (gates, verificaciones, rollback automático), no en cada etapa aislada; un pipeline que ejecuta las mismas etapas pero sin gates reales que realmente bloqueen, o sin verificación real que dispare rollback real, ofrece mucha menos protección real que uno donde esas conexiones están genuinamente implementadas y probadas.

**Diagrama:**

```
Commit (hash) ──▶ Imagen etiquetada con ese hash (no "latest")
      │                              │
      └── trazable hacia atrás ──────┘
                    │
         logs con correlation ID
         en CADA etapa del pipeline
                    │
      permite reconstruir, ante un incidente:
      ¿qué commit → qué imagen → pasó qué escaneo →
      lo desplegó qué pipeline → cuándo?
```

### Tema 3: Cierre del track — checklist final y reflexión

**Conceptos clave:** consolidación, checklist de dominio del track, próximos pasos de aprendizaje.

Al completar este proyecto integrador, vale la pena hacer una pausa deliberada de consolidación, revisando explícitamente los catorce módulos de este track como un cuerpo de conocimiento coherente en vez de una lista de temas independientes: desde los fundamentos de Linux y Git (Módulos 0-1), pasando por Docker y su orquestación local (Módulos 2-3), CI y CD (Módulos 4-5), Kubernetes y su ecosistema (Módulos 6-7), infraestructura como código (Módulo 8), observabilidad y logging (Módulos 9-10), seguridad DevSecOps (Módulo 11), la transición a producción real (Módulo 12), hasta este proyecto integrador final (Módulo 13) que los conecta todos.

Una forma útil de verificar honestamente ese dominio es aplicar la misma disciplina de checklist del Módulo 12 al propio aprendizaje: ¿puedes explicar, sin consultar notas, la diferencia entre un `Deployment` y un `StatefulSet`? ¿Puedes razonar por qué GitOps reduce la superficie de exposición de credenciales frente al CD tradicional? ¿Puedes diseñar, desde cero, una estrategia de despliegue canary con un umbral de rollback automático razonable? Si alguna de estas preguntas genera duda, revisar el módulo correspondiente antes de considerar el track completamente consolidado es una inversión de tiempo bien empleada.

Este track conecta directamente con el track Cloud (donde practicaste directamente contra servicios de AWS/Azure/GCP emulados), y las prácticas de este track —CI/CD, contenedores, Kubernetes, IaC, observabilidad, seguridad— son exactamente las que un equipo de ingeniería real aplica sobre la infraestructura cloud que ese otro track enseña a construir; dominar ambos tracks en conjunto es sustancialmente más valioso que dominar cada uno de forma aislada, porque reflejan cómo trabajan juntos en la práctica real de la industria.

Como paso siguiente natural después de este track, profundizar en cualquiera de sus módulos de forma individual —por ejemplo, explorando Service Mesh en mayor detalle, o profundizando en Chaos Engineering como práctica avanzada de resiliencia— es un camino razonable, así como aplicar directamente este pipeline completo a un proyecto personal real, que es, en última instancia, la mejor forma de consolidar de forma duradera todo lo aprendido en este track.

**Analogía:** completar este proyecto integrador es como terminar de construir el motor completo de un automóvil después de haber estudiado cada pieza por separado (pistones, válvulas, sistema de encendido); ver el motor completo arrancar y funcionar coherentemente es la prueba final de que cada pieza individual fue realmente comprendida, no solo memorizada de forma aislada.

**¿Por qué es importante?** La reflexión final de consolidación no es un paso opcional decorativo: es lo que convierte catorce módulos de conocimiento técnico específico en un modelo mental coherente y duradero de cómo opera un sistema DevOps real de principio a fin, que es, en definitiva, el objetivo genuino de todo el track.

**Diagrama:**

```
Módulos 0-1: fundamentos (Linux, Git)
Módulos 2-3: contenedores (Docker, Compose)
Módulos 4-5: CI/CD (pipelines, estrategias de despliegue)
Módulos 6-7: Kubernetes (fundamentos, Helm/Ingress)
Módulo 8: IaC (Terraform)
Módulos 9-10: observabilidad (métricas, logs)
Módulo 11: seguridad (DevSecOps)
Módulo 12: producción real (secretos, GitOps, IDPs)
Módulo 13: ESTE proyecto — todo integrado en un solo flujo
```

---

## Proyecto transversal RutaFlow: Entrega operable

RutaFlow conecta este track con una plataforma completa de paquetería. La implementación de referencia está en `examples/rutaflow/devops/deployment.yaml`; se estudia como punto de partida pequeño, no como sistema terminado.

### Capacidad y fundamento

El manifiesto fija imagen por digest, ejecuta non-root, elimina capacidades, usa filesystem de solo lectura y declara recursos. Readiness decide tráfico; liveness solo reinicia bloqueo real. Dos réplicas no garantizan disponibilidad si comparten nodo, zona, base o configuración defectuosa.

### Implementación guiada

1. Copia el contrato y escribe primero casos normales, límite, inválidos y duplicados.
2. Ejecuta la referencia, provoca un fallo y explica el mensaje antes de modificarla.
3. Implementa una mejora pequeña manteniendo nombres de dominio, efectos visibles y errores tipados.
4. Integra con el contrato del track anterior sin compartir tablas, estado mutable ni detalles de framework.
5. Registra la decisión en el README y etiqueta el hito de RutaFlow correspondiente.

### Verificación profesional

Añade Service, PodDisruptionBudget, topology spread, NetworkPolicy y autoscaling basado en una señal defendible. Valida schema/policies, firma, SBOM y provenance en CI. Ejecuta rollback y game day de pérdida de pod/nodo observando el SLO de confirmación.

El capítulo se completa cuando la evidencia permite a otra persona reproducir el flujo y explicar qué garantías ofrece y cuáles todavía no.

## Criterio transversal de calidad del código

Aplica estas decisiones en todos los ejemplos y en tu entrega:

- usa nombres que expresen intención, dominio y unidades; evita `data`, `temp`, `manager` o `process` cuando exista un término preciso;
- mantén funciones, componentes, clases, consultas y módulos cohesionados alrededor de una responsabilidad comprobable;
- haz visibles las dependencias y los efectos de red, tiempo, archivos, estado y base de datos;
- valida entradas en la frontera y representa errores con contexto, sin ocultar la causa ni registrar secretos;
- elimina duplicación de reglas, no toda repetición textual; una abstracción incorrecta cuesta más que dos líneas parecidas;
- escribe primero la solución más simple que satisface el requisito y refactoriza con pruebas verdes;
- aplica SOLID únicamente cuando exista una necesidad real de cambio, extensión, sustitución o aislamiento.

**SOLID con criterio:** responsabilidad única significa una razón coherente de cambio, no una clase por función. Abierto/cerrado justifica estrategias cuando hay variantes reales. Sustitución exige respetar contratos. Segregación evita obligar a consumidores a depender de operaciones que no usan. Inversión de dependencias protege el dominio frente a detalles externos; no exige crear interfaces para cada objeto.

**Comprobación antes de continuar:** ¿otra persona puede entender los nombres y el flujo?, ¿los casos de error son observables?, ¿una prueba demuestra la regla principal?, ¿cada abstracción aporta más claridad de la que cuesta? Registra una decisión de refactorización y una decisión consciente de *no abstraer*.

## Laboratorio práctico

**Objetivo del laboratorio:** implementar (o documentar con diseño detallado y evidencia de cada etapa) un pipeline CI/CD completo end-to-end, aplicando en conjunto los Módulos 1 a 12 de este track.

**Requisitos previos:** una aplicación de ejemplo con Dockerfile (Módulo 2), un repositorio Git (Módulo 1), acceso a un runner de CI (GitHub Actions es suficiente, Módulo 4), y, idealmente, acceso a un clúster de Kubernetes (Minikube/Kind es suficiente, Módulos 6-7); si no dispones de clúster real, documenta el diseño completo del manifiesto/chart de Helm sin ejecutarlo.

| Paso | Acción | Comando/Configuración | Explicación |
|---|---|---|---|
| 1 | Definir el pipeline de CI con gate de seguridad | Workflow YAML con jobs: `test` → `build` → `scan` (Trivy, `exit-code: 1` en críticas) → `push` | Aplica los Módulos 4 y 11: el escaneo debe poder bloquear el pipeline realmente |
| 2 | Etiquetar la imagen con el hash del commit | `docker build -t registry/app:${{ github.sha }} .` | Aplica el Tema 2: trazabilidad, nunca solo `latest` |
| 3 | Desplegar con Helm a Kubernetes | `helm upgrade --install app ./chart --set image.tag=${{ github.sha }}` | Aplica el Módulo 7: chart parametrizado con el tag exacto de esta versión |
| 4 | Configurar verificación post-despliegue | Consulta PromQL de tasa de error tras el despliegue, comparada contra la línea base de los 10 minutos previos | Aplica el Módulo 9 |
| 5 | Simular un despliegue fallido y ejecutar rollback | Desplegar una versión con un bug deliberado (por ejemplo, que responda 500 en una ruta); ejecutar `helm rollback app` | Aplica el Módulo 5: prueba REAL de que el rollback funciona, no solo documentado |
| 6 | Escribir el runbook de incidentes | Documento breve: síntoma → diagnóstico → escalación → rollback manual si el automático falla | Cierra la checklist del Módulo 12 |

**Verificación:** el proyecto se considera completo si el gate de seguridad del paso 1 efectivamente detiene el pipeline ante una vulnerabilidad crítica simulada (puedes usar una imagen base antigua deliberadamente para provocarla), y si el rollback del paso 5 fue ejecutado y verificado realmente, no solo descrito en teoría.

**Errores comunes y soluciones**

- **El escaneo de seguridad se ejecuta pero no bloquea nada realmente ante una vulnerabilidad crítica.** Verifica que el `exit-code` de Trivy esté configurado para fallar el job (no solo imprimir un reporte informativo), y que el job de escaneo sea una dependencia explícita (`needs:`) del job de push.
- **El rollback nunca se prueba realmente, solo se documenta.** Ejecuta deliberadamente el escenario de fallo del paso 5; un procedimiento de rollback no probado tiene un riesgo real de no funcionar exactamente cuando más se necesita.
- **Las imágenes se etiquetan con `latest`, perdiendo trazabilidad.** Etiqueta siempre con el hash del commit (o un número de versión semántico), reservando `latest` únicamente como una etiqueta adicional de conveniencia, nunca como la única referencia usada para el despliegue.

---

## Ejercicios de evaluación

### Ejercicio 1: Diseñar el orden correcto de un pipeline

**Enunciado:** ordena correctamente estas etapas de un pipeline CI/CD y justifica por qué ese orden (y no otro) es el correcto: (a) escaneo de vulnerabilidades con Trivy, (b) tests unitarios, (c) build de la imagen Docker, (d) push al registry, (e) despliegue con Helm, (f) verificación de métricas post-despliegue.

**Solución esperada:** el orden correcto es: (b) tests unitarios → (c) build de la imagen → (a) escaneo de vulnerabilidades sobre la imagen ya construida → (d) push al registry (solo si el escaneo pasa) → (e) despliegue con Helm → (f) verificación de métricas post-despliegue. Los tests unitarios van primero porque son la verificación más rápida y barata, fallando rápido antes de invertir tiempo en construir una imagen; el escaneo ocurre después del build porque necesita la imagen ya construida para analizarla; el push solo ocurre si el escaneo pasa, como gate bloqueante; la verificación post-despliegue es la última etapa porque solo tiene sentido una vez que el despliegue ya ocurrió.

**Criterios de éxito:**
- El orden propuesto es correcto: tests → build → escaneo → push → despliegue → verificación.
- La justificación explica por qué los tests van primero (fallar rápido y barato) y por qué el escaneo es un gate antes del push.

### Ejercicio 2: Diagnosticar un despliegue fallido sin rollback

**Enunciado:** un pipeline desplegó una nueva versión hace 20 minutos; las métricas de Grafana muestran que la tasa de error subió del 0.1% al 15% inmediatamente después del despliegue, pero no se disparó ningún rollback automático. Enumera, en orden, qué revisarías para diagnosticar por qué el rollback automático no se activó.

**Solución esperada:** una secuencia razonable de diagnóstico: (1) ¿existe realmente una regla de alerta configurada en Prometheus/Alertmanager sobre la tasa de error, o solo un dashboard visual sin alerta activa? (Módulo 9); (2) si existe la alerta, ¿su umbral y su duración (`for`) son apropiados, o el umbral es demasiado alto para haberse disparado con un 15% de error? (3) si la alerta se disparó, ¿está realmente conectada a una acción automatizada de rollback, o solo notifica a un humano que aún no ha respondido? (4) revisar los logs del propio pipeline o del agente GitOps (si aplica, Módulo 12) para ver si el rollback se intentó y falló silenciosamente.

**Criterios de éxito:**
- Verifica primero si la alerta existe y está correctamente configurada, antes de asumir un fallo del mecanismo de rollback en sí.
- Distingue entre "la alerta notifica a un humano" y "la alerta dispara un rollback automatizado", dos niveles distintos de automatización.

### Ejercicio 3: Diseñar un runbook mínimo

**Enunciado:** escribe un runbook mínimo (4-6 líneas) para el escenario "la tasa de error del servicio X superó el 10% durante más de 5 minutos", que alguien de guardia sin contexto previo del sistema pueda seguir.

**Solución esperada:** un runbook razonable incluye: (1) síntoma: alerta de tasa de error >10% sostenida 5+ minutos en el servicio X; (2) primer diagnóstico: revisar el dashboard de Grafana del servicio para identificar si el error se concentra en una ruta específica o es generalizado; (3) verificar si hubo un despliegue reciente (últimos 30 minutos) mediante el historial de Helm (`helm history`); (4) si hubo un despliegue reciente, ejecutar `helm rollback` inmediatamente; (5) si no hubo despliegue reciente, escalar a la persona responsable del servicio X, adjuntando el enlace al dashboard; (6) verificar que la tasa de error vuelve a la línea base tras cualquier acción tomada.

**Criterios de éxito:**
- El runbook es accionable paso a paso, no una descripción teórica general.
- Distingue explícitamente el camino de acción según haya habido o no un despliegue reciente, e incluye un criterio claro de escalación.

---

## Rúbrica del proyecto

Esta rúbrica evalúa el laboratorio y los ejercicios como evidencia de dominio, no la mera finalización de pasos.

| Criterio | Peso | Evidencia esperada |
|---|---:|---|
| Comprensión conceptual | 20% | Explica el mecanismo, sus límites y por qué la solución funciona. |
| Implementación funcional | 30% | El artefacto satisface requisitos normales, límite y de error. |
| Verificación | 20% | Incluye pruebas, mediciones o inspecciones reproducibles. |
| Diseño y calidad | 15% | Nombres, estructura, seguridad y mantenibilidad son deliberados. |
| Comunicación profesional | 15% | README, decisiones, comandos y resultados permiten repetir el trabajo. |

Se alcanza competencia con 70/100 y sin cero en implementación o verificación. El nivel experto exige comparar alternativas, justificar trade-offs y reconocer condiciones donde la solución dejaría de ser válida.

## Bibliografía y fundamento académico

Estas fuentes sustentan los conceptos y deben consultarse para verificar detalles que cambian entre versiones:

- CNCF, documentación oficial de Kubernetes, Prometheus y OpenTelemetry.
- HashiCorp, *Terraform Documentation*.
- Beyer et al., *Site Reliability Engineering*; Forsgren et al., *Accelerate*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- El pipeline completo encadena commit, CI con gate de seguridad bloqueante, build/push, despliegue con Helm, y verificación post-despliegue con posible rollback automático.
- La integración real entre etapas —no solo su ejecución secuencial— es donde reside la mayor parte del valor de protección de un pipeline maduro.
- La trazabilidad end-to-end (etiquetado por commit, logs correlacionables) permite reconstruir la cadena completa ante cualquier incidente.
- Este proyecto integrador conecta los catorce módulos del track DevOps en un único sistema coherente y operativo.
- El track DevOps completo conecta directamente con el track Cloud: uno enseña a construir infraestructura cloud, el otro enseña a operarla con disciplina de ingeniería.

**Conceptos aprendidos**

- Diseño end-to-end de un pipeline CI/CD con gates de seguridad reales.
- Trazabilidad completa desde un commit hasta un despliegue en producción.
- Verificación post-despliegue basada en métricas reales, con rollback probado (no solo documentado).
- Runbooks de incidentes accionables para quien responde sin contexto previo.
- Consolidación reflexiva de los catorce módulos del track DevOps como un cuerpo de conocimiento coherente.

**Próximos pasos**

Con el track DevOps completo, el siguiente paso natural es aplicar este pipeline a un proyecto personal real, o profundizar en el track Cloud (fundamentos o avanzado) para fortalecer el conocimiento de la infraestructura que este pipeline despliega y opera.

**Recursos adicionales**

- Documentación oficial de GitHub Actions, Trivy, Helm y Prometheus/Alertmanager (ya referenciadas en los módulos anteriores).
- El libro "Accelerate" (Forsgren, Humble, Kim) sobre las métricas DORA y la relación entre prácticas DevOps y desempeño organizacional.
- El sitio web de la Cloud Native Computing Foundation (cncf.io) como mapa de referencia del ecosistema completo cubierto en este track.
