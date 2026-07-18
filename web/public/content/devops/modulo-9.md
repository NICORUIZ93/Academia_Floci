# Módulo 9: Observabilidad con Prometheus y Grafana

## Sílabo

**Objetivo general**

Instrumentar una aplicación con métricas de series temporales, consultarlas con PromQL, visualizarlas en dashboards, y configurar alertas que avisen antes de que un incidente afecte a los usuarios, usando SLI/SLO como lenguaje compartido de fiabilidad.

**Objetivos específicos**

1. Diferenciar counter, gauge e histogram, y elegir el tipo correcto para una métrica dada.
2. Escribir consultas PromQL esenciales, incluyendo tasas y ratios de error.
3. Construir un dashboard en Grafana que visualice métricas propias en tiempo real.
4. Configurar una regla de alerta con Alertmanager basada en un umbral sostenido.
5. Definir un SLO propio y diferenciarlo de un SLI y un SLA.
6. Explicar el propósito de OpenTelemetry y de las métricas DORA.

**Contenido**

- Modelo de métricas de Prometheus (counter, gauge, histogram).
- PromQL esencial.
- Dashboards en Grafana.
- Alertmanager y reglas de alerta.
- SLI/SLO/SLA.
- OpenTelemetry como estándar de instrumentación.
- Métricas DORA: Lead Time, Deployment Frequency, MTTR, Change Failure Rate.

**Evaluación**

Un laboratorio que expone una métrica propia, la consulta con PromQL, la visualiza en Grafana y configura una alerta, y tres ejercicios de evaluación sobre elección de tipo de métrica, diseño de SLO, y valor de negocio de las métricas DORA.

---

## Contenido teórico

### Tema 1: Modelo de métricas de Prometheus — counter, gauge, histogram

**Conceptos clave:** counter (monótono creciente), gauge (sube y baja), histogram (distribución en buckets), serie temporal.

Prometheus modela todo lo que observa como series temporales: una secuencia de valores numéricos asociados a marcas de tiempo, identificados por un nombre de métrica y un conjunto de etiquetas (labels) que permiten dimensionar esa métrica (por ejemplo, `http_requests_total{status="200", method="GET"}` es una serie distinta de `http_requests_total{status="500", method="GET"}`, aunque compartan el mismo nombre de métrica base). Sobre este modelo de series temporales, Prometheus define tres tipos fundamentales de métrica, cada uno apropiado para un patrón de comportamiento distinto.

Un counter es una métrica que solo puede incrementarse (o reiniciarse a cero si el proceso se reinicia), nunca disminuir de otra forma: el total acumulado de peticiones HTTP recibidas, el total acumulado de errores procesados, el total de bytes transferidos. Un counter nunca debería usarse para representar un valor que legítimamente puede subir y bajar (como el número de conexiones activas en un momento dado), porque su semántica asume monotonía creciente, y las funciones de PromQL diseñadas para trabajar con counters (como `rate()`, que verás en el Tema 2) asumen específicamente ese comportamiento para calcular correctamente tasas de cambio a partir de valores acumulados.

Un gauge, en cambio, representa un valor que puede subir y bajar libremente en cualquier momento: la memoria actualmente en uso, el número de conexiones activas ahora mismo, la temperatura de un componente, o el número de items pendientes en una cola. A diferencia de un counter, un gauge se puede leer directamente como el valor actual sin necesidad de calcular una tasa de cambio, aunque también se pueden aplicar funciones de agregación o de tendencia sobre una serie de valores de gauge a lo largo del tiempo si es útil para el análisis.

Un histogram observa la distribución de valores de una métrica continua, típicamente latencias o tamaños, agrupándolos en "buckets" (rangos predefinidos, como "menos de 100ms", "menos de 500ms", "menos de 1 segundo") y contando cuántas observaciones cayeron en cada rango acumulado. Esto permite calcular después, mediante PromQL, percentiles aproximados (por ejemplo, "el percentil 95 de latencia fue de 340ms"), una información mucho más rica y honesta sobre el comportamiento real del sistema que un simple promedio, que puede ocultar fácilmente que una fracción significativa de peticiones tardó mucho más de lo que el promedio sugiere.

**Analogía:** un counter es como el odómetro de un vehículo: solo aumenta con el uso, nunca retrocede por sí solo (salvo un reinicio completo del vehículo, análogo al reinicio de un proceso). Un gauge es como el velocímetro: refleja la velocidad actual, que sube y baja constantemente según la conducción. Un histogram es como un registro detallado de cuántos viajes de un conductor cayeron en cada rango de duración ("menos de 10 minutos", "menos de 30 minutos", "menos de 1 hora"), permitiendo después analizar la distribución completa de sus tiempos de viaje, no solo el promedio.

**¿Por qué es importante?** Elegir el tipo de métrica equivocado —típicamente, usar un gauge para algo que debería ser un counter, o viceversa— produce resultados incorrectos o sin sentido al aplicar las funciones de PromQL diseñadas específicamente para cada tipo, siendo uno de los primeros errores comunes al instrumentar una aplicación con Prometheus por primera vez.

**Diagrama:**

```
Counter (http_requests_total)      Gauge (conexiones_activas)      Histogram (latencia)
   ▲                                    ▲                             buckets:
   │         ╱‾‾‾╱‾‾                    │    ╱╲    ╱╲                  ≤100ms: 850
   │      ╱‾‾                            │   ╱  ╲  ╱  ╲                 ≤500ms: 980
   │   ╱‾‾                                │  ╱    ╲╱    ╲               ≤1s:    995
   └──────────▶ tiempo                    └──────────▶ tiempo           (acumulado)
   (solo sube)                            (sube y baja)
```

### Tema 2: PromQL esencial

**Conceptos clave:** `rate()`, agregación (`sum`, `avg`), filtrado por etiquetas, ventana de tiempo.

`rate(http_requests_total[5m])` es, posiblemente, la consulta más común en cualquier dashboard de Prometheus: calcula la tasa de incremento por segundo de un counter, promediada sobre la ventana de tiempo especificada (en este caso, los últimos 5 minutos). Esto convierte un valor acumulado poco intuitivo por sí solo (el counter podría llevar semanas acumulando, mostrando un número absoluto enorme) en una tasa interpretable directamente ("estamos recibiendo aproximadamente 42 peticiones por segundo en promedio durante los últimos 5 minutos"), que es la forma natural en que normalmente se quiere visualizar y razonar sobre el tráfico de un sistema.

Combinar `rate()` con filtrado por etiquetas y funciones de agregación permite construir consultas más específicas y útiles: `sum(rate(http_requests_total{status="500"}[5m])) / sum(rate(http_requests_total[5m]))` calcula la tasa de error como una proporción, dividiendo la tasa de peticiones con código de estado 500 entre la tasa total de peticiones de todos los códigos de estado, produciendo directamente un ratio (por ejemplo, 0.02, interpretable como "2% de tasa de error") que es exactamente el tipo de valor que normalmente se compara contra un umbral en una regla de alerta (Tema 4 de este módulo).

El filtrado por etiquetas dentro de las llaves (`{status="500"}`) permite acotar una consulta a exactamente la dimensión que interesa, aprovechando las etiquetas que se asignaron a la métrica al momento de instrumentarla en el código de la aplicación; diseñar bien qué etiquetas incluir en cada métrica desde el principio (código de estado HTTP, método, ruta, entre otras dimensiones relevantes del negocio) es lo que después permite escribir consultas PromQL específicas y útiles, mientras que instrumentar métricas sin etiquetas suficientemente ricas limita severamente qué preguntas se pueden responder después sin tener que reinstrumentar el código.

Las funciones de agregación (`sum`, `avg`, `max`, `min`, entre otras) son necesarias porque, en un sistema con múltiples réplicas de un mismo servicio (como las 3 réplicas de un Deployment que estudiaste en el módulo de Kubernetes de este track), la misma métrica existe como series separadas por cada instancia; `sum(rate(...))` combina esas series individuales en un único valor agregado que representa el comportamiento del servicio completo, en vez de tener que revisar cada réplica individual por separado.

**Analogía:** un counter acumulado sin `rate()` es como mirar el odómetro total de un vehículo y tratar de deducir qué tan rápido está yendo ahora mismo solo con ese número absoluto, sin contexto de tiempo. `rate()` es como calcular la velocidad real dividiendo la distancia recorrida entre el tiempo transcurrido en una ventana reciente específica, dando un número mucho más útil e interpretable de inmediato. Filtrar por etiquetas es como preguntar específicamente "¿cuál fue mi velocidad promedio solo en las secciones de autopista, no en toda la ruta completa?".

**¿Por qué es importante?** PromQL es el lenguaje mediante el cual conviertes datos crudos de métricas en información accionable —tasas, ratios, comparaciones contra umbrales—; dominar sus construcciones esenciales (`rate`, agregación, filtrado por etiquetas) es indispensable tanto para construir dashboards útiles como para definir correctamente las condiciones de las reglas de alerta.

**Diagrama:**

```
http_requests_total (counter, acumulado, poco interpretable directamente)
        │
   rate(...[5m])  ──▶  peticiones por segundo (interpretable directamente)
        │
   sum(rate(...{status="500"}[5m])) / sum(rate(...[5m]))
        │
   ──▶  tasa de error como proporción (ej. 0.02 = 2%)
```

### Tema 3: Dashboards en Grafana

**Conceptos clave:** panel, fuente de datos (data source), consulta visualizada, dashboard compartido.

Grafana es la herramienta de visualización más asociada a Prometheus en el ecosistema de observabilidad, aunque soporta múltiples fuentes de datos distintas más allá de Prometheus. Un dashboard se compone de uno o varios paneles, cada uno mostrando el resultado de una o más consultas (típicamente PromQL, cuando la fuente de datos es Prometheus) en una visualización específica: un gráfico de líneas a lo largo del tiempo, un valor único destacado, una tabla, un mapa de calor, entre muchos otros tipos de visualización disponibles.

Configurar un panel requiere, como mínimo, seleccionar la fuente de datos correcta, escribir la consulta que produce los valores a visualizar, y elegir el tipo de visualización más apropiado para esos datos: una tasa de peticiones por segundo a lo largo del tiempo se visualiza naturalmente como un gráfico de líneas, mientras que un único valor de resumen (como la tasa de error actual) puede visualizarse más efectivamente como un número destacado con un color que cambia según si está dentro o fuera de un rango aceptable.

Un dashboard bien diseñado no es simplemente una colección de todas las métricas posibles disponibles: debería organizarse en torno a las preguntas reales que el equipo necesita responder rápidamente durante la operación normal o durante un incidente ("¿cuál es la tasa de error ahora mismo?", "¿la latencia se ha degradado recientemente?", "¿cuántas réplicas están sanas?"), evitando la sobrecarga de información que hace que un dashboard con demasiados paneles termine siendo, en la práctica, tan difícil de interpretar rápidamente como no tener ningún dashboard en absoluto.

Grafana también permite compartir dashboards entre miembros de un equipo (o publicarlos como plantillas reutilizables para otros proyectos similares), y admite variables de plantilla que permiten que un mismo dashboard se adapte dinámicamente según un parámetro seleccionado (por ejemplo, un desplegable que permite elegir entre distintos servicios o distintos entornos, reutilizando la misma estructura de panel con una consulta parametrizada según la selección actual), evitando la necesidad de duplicar dashboards casi idénticos para cada servicio o entorno distinto.

**Analogía:** un dashboard de Grafana es como el panel de instrumentos de la cabina de un piloto: no muestra literalmente cada sensor individual del avión completo, sino una selección cuidadosamente diseñada de los indicadores más críticos para responder rápidamente a las preguntas operativas más importantes en cada momento (altitud, velocidad, combustible), organizados de forma que el piloto pueda interpretarlos de un vistazo, no revisando manualmente cientos de sensores individuales sin ninguna priorización.

**¿Por qué es importante?** Un buen dashboard reduce el tiempo que un equipo necesita para entender el estado real de un sistema, especialmente crítico durante un incidente donde cada minuto de diagnóstico cuenta; diseñarlo en torno a preguntas operativas reales, no simplemente exponiendo todas las métricas disponibles, es lo que determina si un dashboard es realmente útil en la práctica o solo ruido visual adicional.

**Diagrama:**

```
Dashboard "Estado del servicio"
├── Panel: tasa de peticiones/segundo (gráfico de líneas)
├── Panel: tasa de error actual (valor destacado, rojo si > 5%)
├── Panel: latencia p95 (gráfico de líneas)
└── Panel: réplicas sanas / réplicas totales (valor destacado)
```

### Tema 4: Alertmanager y reglas de alerta

**Conceptos clave:** regla de alerta, `expr`, `for` (duración sostenida), Alertmanager, enrutamiento de notificaciones.

Una regla de alerta en Prometheus define una condición de PromQL (`expr`) que, si se cumple durante un periodo sostenido de tiempo (`for`), dispara una alerta. Por ejemplo, una regla con `expr: tasa_error > 0.05` y `for: 2m` solo dispara la alerta si la tasa de error se mantiene por encima del 5% de forma continua durante al menos 2 minutos, no ante un pico momentáneo y aislado que se normaliza rápidamente por sí solo; este requisito de duración sostenida (`for`) es lo que distingue una alerta útil de un sistema que generaría ruido constante ante cualquier fluctuación normal y momentánea de las métricas, un concepto directamente relacionado con el diseño de umbrales de rollback automático que estudiaste en el Módulo 5 de este track.

Prometheus, al evaluar continuamente sus reglas de alerta, no envía directamente las notificaciones finales (correos, mensajes a un canal de chat, llamadas telefónicas de guardia); en su lugar, envía las alertas disparadas a Alertmanager, un componente separado especializado precisamente en gestionar el ciclo de vida de esas notificaciones: agrupar alertas relacionadas para evitar enviar decenas de notificaciones separadas por un mismo incidente subyacente, silenciar temporalmente alertas conocidas durante una ventana de mantenimiento planificada, y enrutar cada alerta al canal y a la persona de guardia correctos según reglas de enrutamiento configuradas (por ejemplo, alertas de un servicio específico van al equipo responsable de ese servicio, no a todo el equipo de ingeniería indiscriminadamente).

Diseñar bien el conjunto de reglas de alerta de un sistema es un equilibrio deliberado: demasiadas alertas, o alertas mal calibradas que disparan con frecuencia sin representar un problema real, producen fatiga de alertas (alert fatigue), donde el equipo empieza a ignorar o silenciar notificaciones habitualmente, precisamente el resultado opuesto al que un sistema de alertas debería lograr. Muy pocas alertas, o umbrales demasiado laxos, dejan al equipo sin aviso oportuno ante problemas reales que sí deberían haber disparado una notificación a tiempo.

Una buena práctica extendida es alertar directamente sobre síntomas observables por el usuario (tasa de error elevada, latencia degradada) en vez de alertar exclusivamente sobre causas internas específicas (uso de CPU elevado en un servidor concreto), porque una alerta sobre un síntoma real de usuario es siempre accionable y relevante, mientras que una alerta sobre una causa interna específica puede no representar ningún problema real percibido por los usuarios si el sistema sigue funcionando correctamente a pesar de ese valor interno elevado.

**Analogía:** una regla de alerta es como un guardia de seguridad instruido para avisar solo si una puerta permanece abierta durante más de 2 minutos continuos, no ante cualquier apertura momentánea normal (como alguien entrando y cerrando rápidamente detrás de sí). Alertmanager es como la central de comunicaciones que recibe esos avisos de múltiples guardias, agrupa avisos relacionados del mismo incidente en una sola notificación consolidada, y dirige cada aviso al equipo de respuesta correcto según de qué zona específica del edificio provenga.

**¿Por qué es importante?** Un sistema de alertas mal calibrado —ya sea por exceso (fatiga de alertas) o por defecto (problemas reales sin detección oportuna)— es tan perjudicial para la fiabilidad operativa real como no tener ningún sistema de alertas en absoluto; diseñar reglas basadas en síntomas de usuario, con duraciones sostenidas apropiadas, es la práctica que produce alertas verdaderamente accionables.

**Diagrama:**

```
Prometheus evalúa continuamente: expr > umbral, sostenido durante "for"
        │
   ¿condición cumplida durante todo el periodo "for"?
        │
       Sí ──▶ envía alerta disparada a Alertmanager
                    │
              agrupa, silencia si aplica, enruta
                    │
              notifica al canal/persona correcta
```

### Tema 5: SLI, SLO, SLA

**Conceptos clave:** Service Level Indicator, Service Level Objective, Service Level Agreement, presupuesto de error (error budget).

Un SLI (indicador de nivel de servicio) es una métrica real y medible del comportamiento del sistema desde la perspectiva de lo que realmente importa a los usuarios: por ejemplo, "el porcentaje de peticiones HTTP que responden en menos de 200 milisegundos" o "el porcentaje de peticiones que no devuelven un error 5xx". Un SLI es, ante todo, un número observado, calculado directamente a partir de las métricas reales del sistema (típicamente mediante las mismas consultas PromQL que estudiaste en el Tema 2).

Un SLO (objetivo de nivel de servicio) es la meta interna que el equipo se propone alcanzar sobre ese SLI, expresada como un umbral específico durante un periodo de tiempo determinado: "99% de las peticiones deben responder en menos de 200 milisegundos, medido sobre una ventana móvil de 30 días". El SLO da un lenguaje objetivo y compartido entre equipos (desarrollo, operaciones, producto, negocio) para decidir cuándo el sistema está funcionando "lo suficientemente bien", reemplazando discusiones subjetivas ("se siente lento hoy") por un criterio numérico explícito y acordado de antemano.

Un SLA (acuerdo de nivel de servicio) va un paso más allá del SLO: es un compromiso formal y externo, típicamente con consecuencias contractuales explícitas (créditos de servicio, penalizaciones económicas) si no se cumple, normalmente pactado con clientes externos o socios comerciales. Es importante notar que el SLO interno de un equipo suele ser deliberadamente más estricto que el SLA externo comprometido: si el SLA promete 99% de disponibilidad a los clientes, el equipo internamente podría fijar su SLO en 99.5%, dándose un margen de seguridad interno antes de siquiera acercarse a incumplir el compromiso externo formal.

El concepto de presupuesto de error (error budget), derivado directamente de un SLO, formaliza cuánta falla es aceptable sin considerar el sistema como "roto": si el SLO es 99.9% de disponibilidad mensual, el presupuesto de error es el 0.1% restante —una cantidad concreta y calculable de minutos de indisponibilidad tolerable ese mes— que el equipo puede "gastar" deliberadamente en despliegues arriesgados, experimentos, o mantenimiento planificado, sin que eso se considere una falla del sistema, siempre que no se agote ese presupuesto específico antes de terminar el periodo de medición.

**Analogía:** un SLI es como el tiempo real que un restaurante tarda en servir un plato, medido con un cronómetro. Un SLO es la meta interna que el restaurante se propone ("el 95% de los platos deben servirse en menos de 15 minutos"), usada internamente para decidir si el servicio de cocina necesita ajustes. Un SLA es el compromiso formal que el restaurante hace públicamente a sus clientes de un servicio de banquetes corporativo ("garantizamos servicio en menos de 20 minutos, o el evento es gratis"), con una consecuencia económica explícita si se incumple, típicamente con un margen más laxo que la meta interna real del equipo de cocina.

**¿Por qué es importante?** Los SLI/SLO dan a los equipos de ingeniería un lenguaje objetivo y cuantificable para decidir cuándo priorizar estabilidad sobre velocidad de nuevas funcionalidades (cuando el presupuesto de error se está agotando) y cuándo hay margen legítimo para asumir más riesgo operativo (cuando el presupuesto de error todavía tiene margen amplio), reemplazando decisiones basadas en percepciones subjetivas por un criterio compartido y medible.

**Diagrama:**

```
SLI (medido):     99.4% de peticiones bajo 200ms este mes
SLO (objetivo):   99.5% de peticiones bajo 200ms  ← meta interna del equipo
SLA (compromiso): 99% de peticiones bajo 200ms    ← promesa externa a clientes,
                                                       con penalización si se incumple

Presupuesto de error del SLO: 0.5% del tiempo puede "fallar" sin romper la meta interna
```

### Tema 6: OpenTelemetry como estándar de instrumentación

**Conceptos clave:** OpenTelemetry, instrumentación estándar, independencia de backend de observabilidad, trazas distribuidas.

Antes de estándares como OpenTelemetry, instrumentar una aplicación para observabilidad (generar métricas, logs y trazas) normalmente acoplaba el código de la aplicación directamente a las bibliotecas específicas de un backend de observabilidad concreto (una biblioteca específica de Prometheus, otra distinta si el equipo decidía migrar a un backend de observabilidad diferente en el futuro), obligando a reescribir la instrumentación del código si la organización decidía cambiar de herramienta de observabilidad más adelante.

OpenTelemetry resuelve esto proporcionando una API y un conjunto de convenciones estándar, independientes de cualquier backend específico, para instrumentar código con métricas, logs y trazas distribuidas. La aplicación se instrumenta una única vez usando las bibliotecas de OpenTelemetry, y un componente separado (el Collector de OpenTelemetry) se encarga de exportar esos datos recolectados hacia el backend de observabilidad específico que la organización elija en ese momento —Prometheus para métricas, cualquier sistema compatible para trazas—, desacoplando la instrumentación del código de la elección específica de herramienta de backend, de forma que cambiar de backend de observabilidad en el futuro no requiere reinstrumentar ni modificar el código de la aplicación en absoluto.

Las trazas distribuidas, uno de los tres pilares que OpenTelemetry estandariza junto con métricas y logs, resuelven un problema específico de sistemas con múltiples servicios que se comunican entre sí (como una arquitectura de microservicios, o el propio Sistema de Gestión de Tareas del proyecto final del track Cloud): permiten seguir el recorrido completo de una única petición a través de múltiples servicios distintos, viendo exactamente cuánto tiempo se consumió en cada servicio individual dentro de esa cadena de llamadas, mucho más rico que revisar logs separados e inconexos de cada servicio individual por separado sin ninguna correlación explícita entre ellos, retomando y formalizando la misma idea de correlation ID que ya se mencionó al hablar de logging estructurado (un módulo posterior de este mismo track).

Adoptar OpenTelemetry como estándar de instrumentación es, cada vez más, la práctica recomendada por defecto para proyectos nuevos, precisamente por esta independencia de backend: protege la inversión de instrumentar cuidadosamente el código de la aplicación frente a decisiones futuras de cambio de herramienta de observabilidad, que de otra forma requerirían repetir ese trabajo de instrumentación completo.

**Analogía:** instrumentar directamente contra las bibliotecas específicas de un backend de observabilidad es como escribir toda la documentación interna de una empresa en un formato propietario específico de un único proveedor de software, de forma que migrar a otro proveedor en el futuro requiere convertir manualmente toda esa documentación existente. OpenTelemetry es como escribir esa misma documentación en un formato estándar y ampliamente soportado, que cualquier proveedor de software puede leer e importar directamente, sin necesidad de conversión si la empresa decide cambiar de proveedor más adelante.

**¿Por qué es importante?** OpenTelemetry reduce significativamente el coste de cambiar de herramienta de observabilidad en el futuro, y sus trazas distribuidas son, cada vez más, indispensables para diagnosticar problemas de rendimiento en arquitecturas de microservicios donde una única petición de usuario atraviesa múltiples servicios distintos antes de completarse.

**Diagrama:**

```
Código de la aplicación
   │  instrumentado UNA VEZ con la API de OpenTelemetry
   ▼
OpenTelemetry Collector
   │
   ├──▶ exporta métricas a Prometheus
   ├──▶ exporta trazas a un backend de trazas compatible
   └──▶ (cambiar de backend en el futuro no requiere reinstrumentar el código)
```

### Tema 7: Métricas DORA — Lead Time, Deployment Frequency, MTTR, Change Failure Rate

**Conceptos clave:** DORA (DevOps Research and Assessment), las cuatro métricas clave, madurez del equipo de entrega de software.

Las métricas DORA, originadas en la investigación del equipo DORA (DevOps Research and Assessment) sobre qué distingue a los equipos de alto rendimiento en la entrega de software, condensan la madurez operativa de un equipo en cuatro indicadores medibles. Lead Time for Changes mide cuánto tiempo transcurre desde que se hace un commit de código hasta que ese cambio efectivamente corre en producción; equipos de alto rendimiento suelen medir esto en horas o menos, mientras que equipos de menor madurez pueden tardar semanas o meses en ese mismo ciclo.

Deployment Frequency mide con qué frecuencia un equipo despliega cambios a producción; equipos de alto rendimiento despliegan múltiples veces al día, aprovechando precisamente el tipo de pipeline de CI/CD automatizado y las estrategias de despliegue seguro (blue-green, canary, feature flags) que estudiaste en los módulos anteriores de este mismo track, mientras que equipos de menor madurez pueden desplegar solo semanal o mensualmente, frecuentemente en lotes grandes de cambios acumulados que son, en sí mismos, más arriesgados de desplegar que cambios pequeños y frecuentes.

MTTR (Mean Time to Restore, o Mean Time to Recovery) mide cuánto tiempo, en promedio, tarda un equipo en restaurar el servicio después de un incidente en producción; esta métrica está directamente relacionada con la capacidad de rollback rápido (blue-green, Módulo 5) y la calidad de la observabilidad y alertas (este mismo módulo) que permiten detectar y diagnosticar un problema rápidamente. Change Failure Rate mide qué porcentaje de los cambios desplegados a producción terminan requiriendo una corrección de emergencia, un rollback, o causando un incidente; una tasa alta sugiere problemas en la calidad del proceso de validación previo al despliegue (pruebas insuficientes, revisión de código débil), no necesariamente en la velocidad de despliegue en sí misma.

Un hallazgo importante y contraintuitivo de la investigación original de DORA es que estas cuatro métricas no están en tensión entre sí de la forma que la intuición tradicional sugeriría (más velocidad de despliegue = más riesgo de fallos): los equipos de más alto rendimiento consistentemente muestran simultáneamente alta frecuencia de despliegue, bajo lead time, bajo MTTR, y baja tasa de fallo de cambios, sugiriendo que la inversión en las prácticas de este track completo (CI/CD robusto, estrategias de despliegue seguro, observabilidad, infraestructura como código) mejora la velocidad y la estabilidad simultáneamente, en vez de forzar una elección entre una u otra.

**Analogía:** las métricas DORA son como los cuatro indicadores clave que un equipo médico de emergencias usaría para evaluar su propio desempeño operativo: qué tan rápido puede movilizar un tratamiento nuevo aprobado (lead time), con qué frecuencia atiende y trata pacientes exitosamente (deployment frequency), qué tan rápido logra estabilizar a un paciente si algo sale mal durante un procedimiento (MTTR), y qué porcentaje de procedimientos requieren una intervención de corrección adicional no planeada (change failure rate). Un equipo verdaderamente excelente no sacrifica ninguno de estos cuatro aspectos por mejorar otro: los mejores equipos son simultáneamente rápidos, frecuentes, y seguros.

**¿Por qué es importante?** Las métricas DORA proporcionan un lenguaje común, respaldado por investigación empírica extensa, para evaluar objetivamente la madurez operativa de un equipo de entrega de software, más allá de percepciones subjetivas, y conectan directamente cada práctica individual de este track (CI, CD, Kubernetes, Terraform, observabilidad) con su impacto medible en estos cuatro indicadores agregados de desempeño real.

**Diagrama:**

```
┌─────────────────────────────────────────────────────┐
│                  Las cuatro métricas DORA                 │
├─────────────────────────────────────────────────────┤
│ Lead Time for Changes    (commit ──▶ producción)            │
│ Deployment Frequency     (¿cuántas veces al día/semana?)     │
│ MTTR                     (incidente ──▶ servicio restaurado)  │
│ Change Failure Rate      (% de cambios que requieren fix)     │
└─────────────────────────────────────────────────────┘
   Los equipos de alto rendimiento mejoran las CUATRO a la vez,
   no sacrifican estabilidad por velocidad ni viceversa.
```

---

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

**Objetivo del laboratorio:** exponer una métrica counter desde una API propia, consultarla con PromQL, visualizarla en un dashboard de Grafana, y configurar una alerta basada en un umbral sostenido.

**Requisitos previos:** una API propia simple, Prometheus y Grafana corriendo (pueden levantarse fácilmente con Docker Compose, aplicando lo aprendido en el Módulo 3 de este track).

| Paso | Acción | Configuración | Explicación | Resultado esperado |
|---|---|---|---|---|
| 1 | Instrumentar un counter en tu API | Añade una biblioteca cliente de Prometheus para tu lenguaje, y define un counter `http_requests_total` que se incrementa en cada petición atendida | Expone la métrica en un endpoint `/metrics` que Prometheus puede consultar | El endpoint `/metrics` responde con texto en formato Prometheus |
| 2 | Configurar Prometheus para scrapear tu API | Añade tu API como `scrape_config` en `prometheus.yml`, apuntando al endpoint `/metrics` | Prometheus consulta periódicamente ese endpoint y almacena los valores como series temporales | Prometheus muestra tu servicio como `UP` en su propia interfaz de targets |
| 3 | Consultar con PromQL | En la interfaz de Prometheus, ejecuta `rate(http_requests_total[5m])` | Calcula la tasa de peticiones por segundo | Se muestra un valor numérico (o un gráfico) con la tasa calculada |
| 4 | Crear un dashboard en Grafana | Conecta Grafana a tu instancia de Prometheus como fuente de datos, y crea un panel con la misma consulta del paso 3 | Visualiza la métrica en tiempo real | El panel muestra un gráfico de líneas actualizándose con el tráfico real hacia tu API |
| 5 | Generar tráfico de prueba con algunos errores intencionales | Añade una ruta en tu API que responda intencionalmente con código 500 en ciertas condiciones, y genera tráfico de prueba que la invoque junto con rutas normales | Prepara datos realistas para calcular una tasa de error significativa | Tu métrica `http_requests_total` ahora incluye valores con `status="500"` |
| 6 | Calcular la tasa de error con PromQL | `sum(rate(http_requests_total{status="500"}[5m])) / sum(rate(http_requests_total[5m]))` | Aplica la consulta del Tema 2 sobre tus propios datos reales | Un valor entre 0 y 1 representando la proporción de errores |
| 7 | Configurar una regla de alerta | Define una regla con esa misma expresión, un umbral (por ejemplo, `> 0.05`), y `for: 2m` | Aplica el patrón del Tema 4 | La regla aparece correctamente cargada en la configuración de Prometheus/Alertmanager |
| 8 | Definir un SLO propio | Documenta un SLO razonable para tu API (por ejemplo, "99% de peticiones deben responder en menos de 200ms, medido sobre 30 días") y describe cómo lo medirías con PromQL | Aplica el razonamiento del Tema 5 | Un documento claro con el SLO definido y la consulta PromQL correspondiente |

**Verificación:** el laboratorio se considera exitoso si el dashboard de Grafana refleja en tiempo real el tráfico real generado contra tu API, si la consulta de tasa de error del paso 6 produce un valor coherente con la proporción real de errores generados intencionalmente, y si la regla de alerta del paso 7 está correctamente configurada con la expresión y el `for` especificados.

**Errores comunes y soluciones**

- **Prometheus muestra tu servicio como `DOWN` en su lista de targets.** Verifica que el endpoint `/metrics` de tu aplicación responde correctamente (pruébalo directamente con `curl`), y que la dirección y puerto configurados en `scrape_config` coinciden exactamente con dónde realmente corre tu aplicación (especialmente relevante si ambos corren en contenedores Docker distintos, donde el descubrimiento de nombres del Módulo 3 de este track aplica directamente).
- **`rate()` devuelve valores extraños o vacíos.** Confirma que la métrica es efectivamente un counter (monótono creciente) y no un gauge; `rate()` está diseñada específicamente para counters y produce resultados sin sentido si se aplica sobre un gauge que sube y baja libremente.
- **El panel de Grafana no muestra ningún dato.** Verifica que la fuente de datos de Prometheus está correctamente configurada en Grafana (con la URL correcta accesible desde el contenedor de Grafana), y que el rango de tiempo seleccionado en el dashboard cubre el periodo en que realmente generaste tráfico de prueba.
- **La alerta nunca se dispara aunque forzaste una tasa de error alta.** Revisa que efectivamente sostuviste la condición durante todo el periodo especificado en `for`; si el problema de prueba fue muy breve y se resolvió antes de completar esa ventana de tiempo, la alerta correctamente no se dispara, siguiendo exactamente el comportamiento esperado del mecanismo `for`.

---

## Ejercicios de evaluación

### Ejercicio 1: Elegir el tipo de métrica correcto

**Enunciado:** para cada una de estas cuatro métricas, indica si usarías un counter, un gauge o un histogram: (a) el número total de usuarios registrados históricamente en la aplicación; (b) el número de trabajos actualmente en proceso en una cola; (c) la distribución de tiempos de respuesta de una API; (d) el número total de bytes descargados acumulados por un servicio de archivos.

**Solución esperada:** (a) counter (solo crece con el tiempo, nunca decrece); (b) gauge (sube y baja según se añaden y completan trabajos); (c) histogram (necesitas la distribución completa, no solo un promedio, para calcular percentiles); (d) counter (los bytes acumulados descargados solo crecen con el tiempo).

**Criterios de éxito:**
- Las cuatro asignaciones coinciden con la solución esperada.
- Puede justificar (b) explicando por qué un counter sería incorrecto para un valor que legítimamente decrece.

### Ejercicio 2: Diseñar un SLO razonable

**Enunciado:** tu equipo mide que, actualmente, el 99.7% de las peticiones de su API responden en menos de 300ms, medido sobre los últimos 30 días. Alguien propone fijar el SLO en "99.9% de peticiones bajo 300ms" para "forzar al equipo a mejorar". Explica por qué esta propuesta puede ser problemática, y qué considerarías en su lugar.

**Solución esperada:** fijar un SLO más estricto que el rendimiento actual observado (99.9% cuando el sistema real está en 99.7%) garantiza que el equipo estará permanentemente "incumpliendo" su propio objetivo desde el primer día, incluso sin que nada haya empeorado realmente, lo que socava el propósito del SLO como lenguaje objetivo de si el sistema está funcionando bien; un SLO debería fijarse considerando tanto las expectativas reales del negocio y los usuarios como la capacidad actual demostrada del sistema, estableciendo quizás un objetivo ligeramente por debajo del rendimiento actual observado (por ejemplo, 99.5%) como un objetivo alcanzable con margen, y planificando mejoras incrementales documentadas hacia un objetivo más ambicioso en el futuro, en vez de fijar de entrada una meta que el sistema actual no puede cumplir.

**Criterios de éxito:**
- Explica correctamente que fijar un SLO por encima del rendimiento actual real garantiza incumplimiento permanente desde el inicio.
- Propone considerar el rendimiento actual demostrado al fijar el SLO, con mejoras incrementales planificadas en vez de un salto brusco poco realista.

### Ejercicio 3: Conectar una práctica de DevOps con una métrica DORA

**Enunciado:** explica cómo la adopción de feature flags (Módulo 5 de este track) y de un pipeline de CI robusto (Módulo 4) podría mejorar específicamente el Change Failure Rate y el Lead Time for Changes de un equipo, dos de las cuatro métricas DORA.

**Solución esperada:** un pipeline de CI robusto reduce el Change Failure Rate al detectar automáticamente errores antes de que lleguen a producción, y reduce el Lead Time al automatizar la validación (en vez de depender de revisión manual lenta) permitiendo que cambios validados lleguen a producción más rápido. Los feature flags reducen el Change Failure Rate al permitir desplegar código nuevo "apagado" sin exponerlo a usuarios reales hasta estar seguros de que funciona, y reducen efectivamente el riesgo percibido de cada despliegue individual, lo que en la práctica anima a los equipos a desplegar con más frecuencia y en lotes más pequeños (mejorando también el Lead Time y la Deployment Frequency), porque cada despliegue individual es menos arriesgado.

**Criterios de éxito:**
- Explica correctamente cómo CI reduce tanto Change Failure Rate como Lead Time.
- Explica correctamente cómo los feature flags reducen el riesgo percibido de cada despliegue, conectándolo con Change Failure Rate.

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

- Prometheus modela observaciones como series temporales de tres tipos: counter (solo sube), gauge (sube y baja), histogram (distribución en buckets).
- `rate()` convierte un counter acumulado en una tasa interpretable; combinado con agregación y filtrado por etiquetas, permite calcular ratios como la tasa de error.
- Un dashboard de Grafana debería organizarse en torno a preguntas operativas reales, no exponer indiscriminadamente todas las métricas disponibles.
- Una regla de alerta combina una expresión PromQL con una duración sostenida (`for`) para evitar disparar ante fluctuaciones momentáneas normales; Alertmanager gestiona agrupación, silencios y enrutamiento de esas alertas.
- SLI es lo medido, SLO es la meta interna, SLA es el compromiso externo con consecuencias contractuales; el presupuesto de error formaliza cuánta falla es aceptable sin incumplir el SLO.
- OpenTelemetry desacopla la instrumentación del código de la elección específica de backend de observabilidad, y estandariza trazas distribuidas para sistemas multi-servicio.
- Las cuatro métricas DORA (Lead Time, Deployment Frequency, MTTR, Change Failure Rate) mejoran conjuntamente en equipos de alto rendimiento, sin la tensión velocidad-vs-estabilidad que la intuición tradicional sugeriría.

**Conceptos aprendidos**

- Los tres tipos de métrica de Prometheus y cuándo usar cada uno.
- PromQL esencial: `rate()`, agregación, y filtrado por etiquetas.
- Diseño de dashboards en Grafana centrados en preguntas operativas.
- Reglas de alerta y el rol de Alertmanager.
- SLI, SLO, SLA y presupuesto de error.
- OpenTelemetry como estándar de instrumentación independiente de backend.
- Las cuatro métricas DORA y su relación con las prácticas de este track.

**Próximos pasos**

En el Módulo 10 vas a centralizar logs de múltiples servicios con un pipeline de logging estructurado, correlacionando peticiones a través de servicios distintos con un correlation ID.

**Recursos adicionales**

- Documentación oficial de Prometheus: modelo de datos, tipos de métrica y PromQL.
- Documentación oficial de Grafana sobre construcción de dashboards y fuentes de datos.
- El libro "Site Reliability Engineering" de Google, referencia original sobre SLI/SLO/SLA y presupuestos de error.
- Documentación oficial de OpenTelemetry y el informe anual "State of DevOps" del equipo DORA.
