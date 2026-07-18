# Módulo 10: Logging centralizado

## Sílabo

**Objetivo general**

Centralizar logs de múltiples servicios para poder buscarlos y correlacionarlos en segundos, en vez de horas, mediante logging estructurado, un pipeline de recolección centralizada, y propagación de un correlation ID a través de servicios distintos.

**Objetivos específicos**

1. Configurar una aplicación para loguear en formato JSON estructurado en vez de texto libre.
2. Levantar un pipeline de logging centralizado (Loki + Grafana, o ELK/EFK) con Docker Compose.
3. Buscar y filtrar logs centralizados por campo estructurado específico.
4. Propagar un correlation ID entre servicios que se comunican entre sí, y usarlo para reconstruir el flujo completo de una petición.
5. Explicar la diferencia de arquitectura entre Loki y Elasticsearch, y cuándo preferir cada uno.

**Contenido**

- Logging estructurado (JSON).
- Pipeline ELK/EFK.
- Loki + Grafana como alternativa ligera.
- Correlation ID a través de servicios.

**Evaluación**

Un laboratorio que centraliza logs de al menos dos servicios y los correlaciona con un ID compartido, y tres ejercicios de evaluación sobre logging estructurado, elección entre Loki y Elasticsearch, y diseño de correlation ID.

---

## Contenido teórico

### Tema 1: Logging estructurado (JSON)

**Conceptos clave:** log de texto libre, log estructurado, campo indexable, nivel de log.

Un log de texto libre tradicional —una línea de texto humano-legible como `Error conectando a la base de datos a las 14:32`— es fácil de leer para una persona en el momento en que ocurre, pero extremadamente limitado para búsqueda y análisis automatizado a escala: solo se puede buscar por coincidencia de subcadena de texto (buscar la palabra "Error", por ejemplo), sin ninguna forma confiable de filtrar específicamente "todos los errores del servicio de pagos ocurridos en la última hora" sin depender de que el formato de texto libre incluya, de manera consistente y en una posición predecible, cada uno de esos datos.

Un log estructurado, en cambio, se emite directamente como un objeto con campos explícitos y bien definidos —típicamente en formato JSON, como `{"level":"error","service":"api","correlationId":"abc-123","msg":"timeout conectando a db"}`—, donde cada campo (`level`, `service`, `correlationId`, `msg`) es independientemente consultable y filtrable por cualquier sistema de agregación de logs, sin depender de coincidencias de texto frágiles. Esto convierte una pregunta como "todos los errores del servicio de pagos en la última hora" en una consulta estructurada directa (`level=error AND service=pagos AND timestamp > hace 1 hora`), en vez de una búsqueda de texto aproximada y potencialmente imprecisa.

El nivel de log (`level`: `debug`, `info`, `warn`, `error`, entre otros) es uno de los campos estructurados más importantes y universales, permitiendo filtrar rápidamente por severidad sin necesidad de inspeccionar el contenido textual del mensaje en sí. Establecer una convención consistente de niveles de log en toda una organización —qué situaciones justifican cada nivel específico— es una decisión de diseño operativo importante: un servicio que loguea la mayoría de sus eventos como `error` cuando en realidad son situaciones normales y esperadas genera ruido que dificulta identificar problemas reales entre el volumen de falsos positivos, mientras que un servicio que nunca usa el nivel `error` incluso ante fallos reales retrasa la detección de problemas genuinos.

Adoptar logging estructurado desde el inicio de un proyecto es significativamente más simple que migrar retroactivamente un sistema con años de logs de texto libre acumulados y con múltiples formatos inconsistentes entre distintos servicios; la mayoría de las bibliotecas de logging modernas en cualquier lenguaje soportan logging estructurado de forma nativa o con una configuración mínima adicional, haciendo que esta sea una decisión de bajo coste de adoptar tempranamente y de alto coste de retrasar indefinidamente.

**Analogía:** un log de texto libre es como una nota escrita a mano en un cuaderno común: legible por una persona que la lee directamente, pero imposible de buscar y filtrar eficientemente entre miles de notas similares sin leerlas todas una por una. Un log estructurado es como llenar un formulario con campos específicos bien etiquetados (fecha, categoría, severidad, descripción): cualquier sistema puede filtrar y ordenar miles de esos formularios instantáneamente por cualquier campo específico, sin tener que leer el contenido completo de cada uno.

**¿Por qué es importante?** A cualquier escala más allá de un sistema trivial con un único servicio y volumen mínimo de logs, el logging de texto libre se vuelve rápidamente inviable de consultar eficientemente durante un incidente real, precisamente cuando la velocidad de diagnóstico importa más; el logging estructurado es la base indispensable sobre la que se construye cualquier sistema de logging centralizado útil, que es el tema del resto de este módulo.

**Diagrama:**

```
Texto libre:                                Estructurado (JSON):
"Error conectando a la BD a las 14:32"       {"level":"error",
                                                "service":"api",
Solo buscable por coincidencia de texto         "timestamp":"14:32",
("Error", "conectando")                          "msg":"timeout conectando a db"}

                                              Filtrable por CADA campo
                                              independientemente
```

### Tema 2: Pipeline ELK/EFK

**Conceptos clave:** recolección (Filebeat/Fluentd), almacenamiento e indexación (Elasticsearch), visualización (Kibana), pipeline en tres etapas.

El pipeline conocido como ELK (Elasticsearch, Logstash, Kibana) o su variante EFK (sustituyendo Logstash por Fluentd, o combinándolo con Filebeat como agente ligero de recolección) sigue una arquitectura en tres etapas claramente diferenciadas. La primera etapa, recolección, corre un agente ligero (Filebeat o Fluentd) en cada máquina o contenedor que genera logs, cuya única responsabilidad es leer esos logs (típicamente desde archivos o desde la salida estándar de contenedores Docker) y enviarlos hacia la siguiente etapa, sin realizar transformación pesada en este punto.

La segunda etapa, almacenamiento e indexación, es responsabilidad de Elasticsearch: un motor de búsqueda y almacenamiento distribuido que indexa el contenido completo de cada log recibido, permitiendo búsquedas de texto completo extremadamente rápidas y flexibles sobre volúmenes masivos de datos, además de agregaciones y análisis estadístico sobre los campos estructurados de esos logs. Esta indexación completa del contenido es lo que hace posible buscar prácticamente cualquier término o combinación de términos en segundos, incluso sobre volúmenes de logs de terabytes acumulados, pero tiene un coste directo de infraestructura proporcional al volumen de datos indexados: cuanto más completa la indexación, más recursos de cómputo y almacenamiento requiere Elasticsearch para mantenerla.

La tercera etapa, visualización, corresponde a Kibana, la interfaz que permite a las personas construir búsquedas, dashboards y visualizaciones sobre los datos almacenados en Elasticsearch, de forma conceptualmente similar a cómo Grafana visualiza datos de Prometheus, aunque Kibana está diseñado específicamente en torno al modelo de datos y las capacidades de búsqueda de Elasticsearch.

Este pipeline de tres etapas —recolectar, almacenar/indexar, visualizar— es un patrón arquitectónico que reaparece, con distintas herramientas específicas, en prácticamente cualquier sistema serio de observabilidad centralizada, y entender esta separación de responsabilidades es más importante que memorizar los nombres específicos de las herramientas de una pila concreta, precisamente porque el mismo patrón se repite con Loki en vez de Elasticsearch (Tema 3), o con distintas combinaciones de herramientas según las preferencias y necesidades específicas de cada organización.

**Analogía:** el pipeline ELK/EFK es como el proceso completo de una biblioteca moderna: bibliotecarios auxiliares recorren distintas secciones recolectando y catalogando libros nuevos que llegan (recolección), un sistema central de catalogación indexa cada libro por título, autor, tema y hasta contenido completo de texto para búsquedas exhaustivas (almacenamiento e indexación en Elasticsearch), y un mostrador de consulta permite a cualquier visitante buscar y explorar ese catálogo de forma visual e intuitiva (visualización en Kibana).

**¿Por qué es importante?** Entender la arquitectura en tres etapas de un pipeline de logging centralizado es lo que permite razonar sobre dónde optimizar o dónde reside un cuello de botella específico cuando algo no funciona como se espera (¿el problema está en que el agente de recolección no está enviando logs, en que Elasticsearch no puede indexar el volumen recibido a tiempo, o en que Kibana no refleja correctamente lo que sí está almacenado?).

**Diagrama:**

```
App (genera logs JSON)
   │
   ▼
Filebeat/Fluentd (recolecta, en cada máquina/contenedor)
   │
   ▼
Elasticsearch (almacena e indexa contenido completo)
   │
   ▼
Kibana (búsqueda y visualización)
```

### Tema 3: Loki + Grafana como alternativa ligera

**Conceptos clave:** indexación solo de metadata (labels), coste operativo reducido, integración nativa con Grafana.

Loki toma una decisión de diseño deliberadamente distinta a la de Elasticsearch: en vez de indexar el contenido textual completo de cada línea de log (una operación costosa en recursos de cómputo y almacenamiento, especialmente a gran volumen), Loki solo indexa los labels (metadata como `service`, `nivel`, `entorno`) asociados a cada flujo de logs, almacenando el contenido textual completo de forma comprimida pero sin indexación de texto completo. Las búsquedas por label son extremadamente rápidas (porque el índice sobre labels es pequeño y eficiente), mientras que las búsquedas de texto libre dentro del contenido de los logs son más lentas que en Elasticsearch (porque requieren escanear el contenido comprimido de los logs que coinciden con los labels filtrados, en vez de consultar un índice de texto completo ya preconstruido).

Esta diferencia de diseño se traduce directamente en un coste operativo significativamente menor para Loki comparado con Elasticsearch a volúmenes de log similares, precisamente porque evita el coste de mantener un índice de texto completo sobre todo el contenido. El compromiso es que las consultas de Loki funcionan mejor cuando primero filtras por labels específicos (reduciendo drásticamente el volumen de logs que necesitan escanearse) y luego, opcionalmente, buscas texto libre dentro de ese subconjunto ya acotado, en vez de intentar una búsqueda de texto libre sin ningún filtro de labels sobre el volumen completo de logs almacenados, que sería comparativamente lenta.

Loki se integra nativamente con Grafana (de hecho, es desarrollado por la misma organización, Grafana Labs), usando el mismo lenguaje de consulta conceptualmente similar a PromQL (llamado LogQL) y la misma interfaz de Grafana que ya usaste para métricas en el módulo anterior de este track. Esto permite tener métricas (Prometheus) y logs (Loki) visualizados en el mismo dashboard de Grafana, correlacionando visualmente un pico de errores observado en una métrica con los logs específicos que ocurrieron exactamente en esa misma ventana de tiempo, sin necesidad de saltar entre dos herramientas completamente distintas.

La elección entre Loki y Elasticsearch (o el pipeline ELK/EFK completo) depende del contexto: si el equipo ya usa Grafana para métricas y valora la simplicidad operativa y el menor coste, Loki es frecuentemente la elección preferida para volúmenes moderados de logs. Si el caso de uso requiere búsquedas de texto completo muy sofisticadas y frecuentes sobre volúmenes masivos de datos (análisis forense detallado, búsquedas complejas por contenido no estructurado), Elasticsearch, con su indexación completa, puede seguir siendo la opción más apropiada a pesar de su mayor coste operativo.

**Analogía:** Elasticsearch es como una biblioteca que cataloga meticulosamente cada palabra de cada libro para poder buscar cualquier frase exacta en cualquier parte de cualquier libro instantáneamente, a costa de un enorme esfuerzo de catalogación previo. Loki es como una biblioteca que solo cataloga el título, autor y tema de cada libro (los labels), permitiendo encontrar rápidamente la sección correcta del estante, pero requiriendo hojear manualmente los libros de esa sección específica si necesitas encontrar una frase textual concreta dentro de ellos.

**¿Por qué es importante?** Elegir Loki sobre Elasticsearch (o viceversa) es una decisión de arquitectura de observabilidad con implicaciones reales de coste operativo y de patrones de consulta; entender el compromiso explícito entre ambos —velocidad de búsqueda de texto completo frente a coste operativo— permite tomar esa decisión de forma informada según las necesidades reales del proyecto, en vez de adoptar una u otra por popularidad sin entender el trade-off.

**Diagrama:**

```
Elasticsearch:                          Loki:
Indexa TODO el contenido completo         Indexa SOLO los labels (metadata)
de cada log                                (service, nivel, entorno)
   │                                          │
   ▼                                          ▼
Búsqueda de texto libre: RÁPIDA             Búsqueda de texto libre: más lenta
Coste operativo: ALTO                       (requiere filtrar por labels primero)
                                             Coste operativo: BAJO
```

### Tema 4: Correlation ID a través de servicios

**Conceptos clave:** correlation ID, propagación entre servicios, cabecera HTTP, reconstrucción de flujo distribuido.

Un correlation ID es un identificador único generado al inicio del procesamiento de una petición (o reutilizado si ya viene de un llamador anterior), que se incluye explícitamente en cada línea de log relacionada con esa petición específica, y que se propaga activamente a cualquier servicio adicional que esa petición original termine invocando durante su procesamiento. En código, esto típicamente se implementa leyendo una cabecera HTTP existente si la petición ya la trae (`req.headers['x-correlation-id']`), o generando una nueva si es el punto de entrada original de esa petición al sistema (`randomUUID()`), y propagando explícitamente esa misma cabecera en cualquier llamada saliente subsiguiente hacia otros servicios.

Sin este mecanismo, correlacionar manualmente los logs de múltiples servicios distintos que participaron en el procesamiento de una única petición de usuario requiere intentar alinear eventos por proximidad de marca de tiempo entre los logs de cada servicio individual, un proceso lento, propenso a error, y que se vuelve rápidamente inviable bajo cualquier volumen de tráfico concurrente real, donde múltiples peticiones distintas de usuarios diferentes generan logs entremezclados por marca de tiempo similar en cada servicio individual, sin ninguna forma confiable de distinguir cuáles pertenecen exactamente a la misma petición original.

Con el correlation ID propagado consistentemente, reconstruir el flujo completo de una petición específica a través de todos los servicios que participaron en su procesamiento se convierte en una simple búsqueda de ese único identificador en el sistema de logging centralizado (Elasticsearch o Loki), devolviendo instantáneamente todas las líneas de log relevantes de todos los servicios involucrados, ordenadas naturalmente por marca de tiempo, mostrando el camino completo y exacto que esa petición específica recorrió y cuánto tiempo se consumió en cada etapa individual de ese recorrido.

Este mismo concepto de correlation ID, cuando se combina con la medición explícita del tiempo consumido en cada etapa del recorrido, es esencialmente el mismo problema que resuelven las trazas distribuidas de OpenTelemetry que se mencionaron en el módulo anterior de este track; un correlation ID propagado manualmente en logs es, en cierto sentido, una versión más simple y artesanal del mismo concepto que las trazas distribuidas formalizan de manera más completa y estandarizada, incluyendo automáticamente la duración exacta de cada etapa sin necesidad de calcularla manualmente a partir de marcas de tiempo de logs individuales.

**Analogía:** un correlation ID es como el número de seguimiento único de un paquete que atraviesa múltiples centros de distribución distintos durante su envío: cada centro de distribución registra ese mismo número en su propio sistema interno de logs cuando el paquete pasa por ahí, y buscar ese único número de seguimiento en el sistema completo de la empresa de envíos reconstruye instantáneamente el recorrido completo del paquete a través de todos los centros, sin tener que llamar individualmente a cada centro de distribución y tratar de adivinar, por hora aproximada, cuál de sus muchos paquetes procesados ese día corresponde al tuyo.

**¿Por qué es importante?** Sin correlation ID, diagnosticar un problema que involucra múltiples servicios en una arquitectura distribuida es extremadamente lento y propenso a conclusiones incorrectas; con él, una búsqueda de segundos reconstruye exactamente qué ocurrió, en qué orden, y cuánto tardó cada etapa, siendo una de las prácticas de menor coste de implementación y mayor impacto en la capacidad real de diagnóstico de cualquier arquitectura con más de un servicio.

**Diagrama:**

```
Petición del usuario ──▶ Servicio A (correlationId: abc-123, genera nuevo)
                              │  propaga la cabecera x-correlation-id
                              ▼
                         Servicio B (correlationId: abc-123, mismo ID)
                              │  propaga la cabecera
                              ▼
                         Servicio C (correlationId: abc-123, mismo ID)

Buscar "abc-123" en el sistema centralizado
   ──▶ reconstruye el flujo completo: A ──▶ B ──▶ C, con tiempos de cada etapa
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

**Objetivo del laboratorio:** configurar logging estructurado en dos servicios propios que se comunican entre sí, levantar Loki + Grafana con Docker Compose, y propagar un correlation ID entre ambos servicios para reconstruir el flujo completo de una petición.

**Requisitos previos:** dos servicios propios simples (pueden ser dos endpoints distintos, o dos aplicaciones separadas donde una llama a la otra), Docker Compose (Módulo 3 de este track).

| Paso | Acción | Configuración | Explicación | Resultado esperado |
|---|---|---|---|---|
| 1 | Configurar logging JSON estructurado | En ambos servicios, configura la biblioteca de logging para emitir logs en formato JSON con al menos `level`, `service`, `msg` y `correlationId` | Aplica el Tema 1 en tu propio código | Los logs de ambos servicios aparecen como JSON válido en su salida estándar |
| 2 | Levantar Loki y Grafana | Añade servicios `loki` y `grafana` a tu `docker-compose.yml`, junto con `promtail` (el agente de recolección de Loki) configurado para leer los logs de tus dos servicios | Prepara la infraestructura de logging centralizado | `docker compose up -d` levanta los tres servicios adicionales correctamente |
| 3 | Conectar Grafana a Loki como fuente de datos | Configura la fuente de datos Loki en Grafana, apuntando a la URL interna del servicio `loki` (aprovechando el descubrimiento de nombres del Módulo 3) | Habilita consultar logs desde la interfaz de Grafana | Grafana confirma la conexión exitosa a la fuente de datos |
| 4 | Implementar la propagación del correlation ID | En el servicio A (el que recibe la petición inicial del usuario), genera un correlation ID si no viene ya en la petición; propágalo como cabecera HTTP en la llamada que A hace hacia el servicio B | Aplica el Tema 4 | Ambos servicios incluyen el mismo `correlationId` en sus logs para una misma petición de prueba |
| 5 | Generar una petición de prueba | Invoca el servicio A de forma que dispare internamente una llamada al servicio B | Genera datos reales para correlacionar | Ambos servicios generan logs relacionados con esta petición específica |
| 6 | Buscar por correlation ID en Grafana | Usando LogQL en el explorador de Grafana, filtra por el `correlationId` específico de la petición de prueba | Reconstruye el flujo completo de esa petición a través de ambos servicios | Aparecen, en orden cronológico, los logs de A seguidos de los logs de B relacionados con esa misma petición |
| 7 | Filtrar por nivel de log | Ejecuta una consulta LogQL que filtre solo por `level="error"` en todo el sistema | Verifica el filtrado eficiente por metadata (label) que Loki ofrece | Solo aparecen los logs de nivel error, sin necesidad de revisar el contenido completo de todos los demás logs |

**Verificación:** el laboratorio se considera exitoso si la búsqueda por correlation ID del paso 6 muestra correctamente los logs de ambos servicios relacionados con esa petición específica, en el orden cronológico correcto, confirmando que la propagación del correlation ID entre servicios funciona de extremo a extremo.

**Errores comunes y soluciones**

- **Promtail no envía ningún log a Loki.** Verifica la configuración de rutas de Promtail (qué archivos o qué salida de contenedores está configurado para leer), y confirma que apunta correctamente a la URL interna del servicio `loki` dentro de la red de Docker Compose.
- **Los logs aparecen en Loki pero sin los labels esperados (`service`, `level`).** Revisa la configuración de Promtail sobre cómo extrae labels de tus logs JSON; Promtail necesita configuración explícita para promover ciertos campos del JSON a labels indexables, no lo hace automáticamente sin esa configuración.
- **El correlation ID no coincide entre el servicio A y el servicio B.** Verifica que el servicio A efectivamente propaga la cabecera en la llamada saliente hacia B (un error común es generar el correlation ID correctamente en A, pero olvidar incluirlo en la petición HTTP hacia B), y que el servicio B lee esa misma cabecera entrante en vez de generar su propio ID nuevo independientemente.
- **Las consultas LogQL de texto libre son muy lentas.** Recuerda el compromiso del Tema 3: siempre filtra primero por labels específicos (`{service="api"}`) antes de añadir un filtro de texto libre adicional, en vez de intentar una búsqueda de texto libre sin ningún filtro de labels sobre el volumen completo de logs almacenados.

---

## Ejercicios de evaluación

### Ejercicio 1: Explicar la ventaja de buscar en logs centralizados

**Enunciado:** explica, en tus propias palabras, por qué buscar en un sistema de logs centralizado es mucho más rápido que entrar individualmente a cada contenedor con `docker logs` para revisar sus logs por separado, especialmente en un sistema con más de 5 servicios distintos.

**Solución esperada:** con `docker logs` sobre cada contenedor individual, tendrías que ejecutar el comando por separado en cada uno de los 5 o más servicios, revisar manualmente el contenido de cada uno, y tratar de correlacionar eventos relacionados entre ellos por proximidad de marca de tiempo, un proceso lento y propenso a error. Un sistema de logs centralizado permite una única búsqueda (por ejemplo, por correlation ID o por nivel de log) que devuelve instantáneamente los resultados relevantes de todos los servicios a la vez, ya correlacionados y ordenados cronológicamente, sin necesidad de revisar servicio por servicio de forma manual y separada.

**Criterios de éxito:**
- Explica que sin centralización, hay que revisar cada servicio individualmente y correlacionar manualmente por marca de tiempo.
- Explica que la centralización permite una búsqueda única que devuelve resultados ya correlacionados de todos los servicios relevantes.

### Ejercicio 2: Elegir entre Loki y Elasticsearch

**Enunciado:** tu equipo ya usa Grafana extensamente para métricas con Prometheus, tiene un presupuesto de infraestructura ajustado, y sus necesidades de búsqueda en logs son principalmente filtrar por servicio y nivel de error, con ocasionales búsquedas de texto libre dentro de un subconjunto ya filtrado. ¿Recomendarías Loki o Elasticsearch? Justifica tu respuesta.

**Solución esperada:** Loki, porque el equipo ya usa Grafana (integración nativa), tiene un presupuesto ajustado (Loki tiene menor coste operativo al no indexar contenido completo), y su patrón de uso principal —filtrar por labels como servicio y nivel, con búsquedas de texto libre ocasionales sobre un subconjunto ya acotado— es exactamente el caso de uso para el que Loki está optimizado, en contraste con necesitar búsquedas de texto libre extensas y frecuentes sobre volúmenes completos sin filtrar, que favorecerían a Elasticsearch a pesar de su mayor coste.

**Criterios de éxito:**
- Recomienda Loki, no Elasticsearch.
- La justificación menciona al menos dos de los tres factores relevantes: integración con Grafana existente, presupuesto ajustado, y patrón de consulta principalmente basado en labels.

### Ejercicio 3: Diseñar la propagación de un correlation ID

**Enunciado:** tu sistema tiene un API Gateway (punto de entrada) que llama a un servicio de autenticación, que a su vez, si la autenticación es exitosa, llama a un servicio de procesamiento de pedidos. Describe, paso a paso, cómo se generaría y propagaría el correlation ID a través de esta cadena de tres servicios.

**Solución esperada:** el API Gateway, al recibir la petición original del usuario (que no trae ningún correlation ID previo), genera un correlation ID nuevo y lo incluye en su propio log; al llamar al servicio de autenticación, propaga ese mismo correlation ID como cabecera HTTP. El servicio de autenticación lee ese correlation ID de la cabecera entrante (no genera uno nuevo, porque ya viene de un llamador anterior), lo incluye en sus propios logs, y si la autenticación es exitosa y necesita llamar al servicio de procesamiento de pedidos, propaga ese mismo correlation ID sin modificarlo. El servicio de procesamiento de pedidos hace exactamente lo mismo: lee el correlation ID entrante, lo usa en sus propios logs, sin generar uno nuevo.

**Criterios de éxito:**
- Explica correctamente que solo el primer servicio (el punto de entrada, sin un correlation ID previo) genera uno nuevo; los siguientes servicios de la cadena reutilizan el que ya reciben.
- Describe correctamente la propagación consistente del mismo ID a través de los tres servicios de la cadena.

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

<!-- REQUESTED-PRACTICAL-EXAMPLES:START -->
## Ejemplos guiados de los temas solicitados

Estos ejemplos acompañan la ampliación académica. No son código para copiar sin contexto: ejecuta, modifica, provoca un fallo y conserva la evidencia.

### Ejemplo guiado: Infraestructura como código (Pulumi)

**Qué demuestra:** convierte el concepto en una evidencia pequeña, explícita y verificable dentro de RutaFlow. El ejemplo separa la decisión del framework para poder probarla y cambiarla.

```yaml
capability: "Infraestructura como código (Pulumi)"
service: rutaflow-delivery
verification:
  success: "deployment_health == 1"
  failure: "rollback_completed == 1"
  evidence: [logs, metrics, trace_id]
```

**Práctica:** reemplaza el resultado exitoso por un fallo realista, agrega una aserción automatizada y registra qué señal permitiría diagnosticarlo en producción.
### Ejemplo guiado: Arquitectura de microservicios (patrones)

**Qué demuestra:** convierte el concepto en una evidencia pequeña, explícita y verificable dentro de RutaFlow. El ejemplo separa la decisión del framework para poder probarla y cambiarla.

```yaml
capability: "Arquitectura de microservicios (patrones)"
service: rutaflow-delivery
verification:
  success: "deployment_health == 1"
  failure: "rollback_completed == 1"
  evidence: [logs, metrics, trace_id]
```

**Práctica:** reemplaza el resultado exitoso por un fallo realista, agrega una aserción automatizada y registra qué señal permitiría diagnosticarlo en producción.

<!-- REQUESTED-PRACTICAL-EXAMPLES:END -->

## Resumen del módulo

**Puntos clave**

- El logging estructurado (JSON) hace que cada campo sea independientemente filtrable y consultable, a diferencia del texto libre que solo permite búsqueda por coincidencia de subcadena.
- Un pipeline ELK/EFK sigue una arquitectura de tres etapas: recolección (Filebeat/Fluentd), almacenamiento e indexación (Elasticsearch), y visualización (Kibana).
- Loki indexa solo metadata (labels), no el contenido completo, siendo significativamente más barato de operar que Elasticsearch a costa de búsquedas de texto libre algo más lentas; se integra nativamente con Grafana.
- Un correlation ID propagado consistentemente entre servicios convierte la reconstrucción del flujo completo de una petición distribuida en una búsqueda de segundos, en vez de una correlación manual lenta y propensa a error por proximidad de marca de tiempo.

**Conceptos aprendidos**

- Logging estructurado (JSON) frente a logging de texto libre.
- La arquitectura en tres etapas de un pipeline ELK/EFK.
- Loki como alternativa ligera a Elasticsearch, y su integración nativa con Grafana.
- Correlation ID y su propagación consistente a través de servicios distintos.

**Próximos pasos**

En el Módulo 11 vas a integrar seguridad en cada etapa del pipeline (DevSecOps): gestión de secretos, escaneo de imágenes y dependencias, y el principio de menor privilegio aplicado a CI/CD.

**Recursos adicionales**

- Documentación oficial de Grafana Loki: arquitectura, LogQL, y su integración con Promtail.
- Documentación oficial del stack Elastic (Elasticsearch, Logstash, Kibana) como referencia del enfoque de indexación completa.
- Guías de la industria sobre propagación de contexto de trazado (correlation ID, trace context) en sistemas distribuidos.
