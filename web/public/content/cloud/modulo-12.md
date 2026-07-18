# Módulo 12: Observabilidad con CloudWatch: logs, métricas y alarmas

## Sílabo

**Objetivo general**

Centralizar logs, crear métricas derivadas de ellos, y configurar alarmas que avisen de un problema antes de que los usuarios lo noten, entendiendo que sin observabilidad estructurada diagnosticar un fallo en producción se reduce a adivinar sin evidencia.

**Objetivos específicos**

1. Crear un log group y enviar logs estructurados con un correlation ID.
2. Filtrar logs para extraer patrones específicos.
3. Crear un metric filter que derive una métrica numérica a partir de logs.
4. Configurar una alarma que se dispare ante un umbral de esa métrica.

**Contenido**

- Log group.
- Log stream.
- Metric filter.
- Alarm.
- Correlation ID.
- Dashboard.
- X-Ray trace.

**Evaluación**

Dashboard de CloudWatch con logs, métricas de errores y alarma configurada, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Log groups, log streams y correlation ID

**Conceptos clave:** logs centralizados y correlacionables entre servicios distintos.

```bash
aws logs create-log-group --log-group-name /mi-app/backend
aws logs create-log-stream --log-group-name /mi-app/backend --log-stream-name app-001
aws logs put-log-events --log-group-name /mi-app/backend --log-stream-name app-001 --log-events '[{"timestamp":...,"message":"ERROR request_id=abc tarea_id=001 msg=fallo"}]'
```

Un log group centraliza los logs de un componente lógico de la aplicación (por ejemplo, todos los logs de un servicio backend específico), organizado internamente en log streams (típicamente uno por instancia o invocación en ejecución); centralizar logs en CloudWatch en vez de dejarlos dispersos en archivos locales de cada instancia individual permite consultar y correlacionar logs de múltiples instancias simultáneamente desde un único lugar, esencial en cualquier arquitectura distribuida donde un problema puede manifestarse a través de múltiples componentes ejecutándose en paralelo.

```python
import uuid
correlation_id = str(uuid.uuid4())
logging.info(f"correlation_id={correlation_id} accion=procesar_tarea")
```

Un correlation ID es un identificador único generado al inicio de una solicitud (o transacción) que se propaga consistentemente a través de cada log emitido durante el procesamiento de esa solicitud específica, incluso si esa solicitud atraviesa múltiples servicios o funciones distintas; sin un correlation ID, diagnosticar un problema reportado por un usuario específico requiere intentar correlacionar manualmente logs dispersos basándose en timestamps aproximados o suposiciones, un proceso lento y propenso a error, mientras que con un correlation ID consistente, filtrar todos los logs relacionados con esa transacción específica es una simple búsqueda directa por ese identificador exacto.

**Analogía:** un log group centralizado es como un archivo único de la empresa donde todos los departamentos registran sus actividades en un formato consistente, en vez de que cada departamento mantenga su propio archivo local aislado; un correlation ID es como un número de expediente único que acompaña a un trámite a través de cada departamento por el que pasa, permitiendo reconstruir el recorrido completo de ese trámite específico buscando simplemente ese número, sin tener que adivinar qué actividades en cada departamento corresponden a ese trámite en particular.

**¿Por qué es importante?** El correlation ID es esencial para diagnosticar problemas porque permite filtrar todos los logs relacionados con una transacción específica que atraviesa múltiples servicios mediante una búsqueda directa, en vez de correlacionar manualmente logs dispersos basándose en suposiciones de timing.

**Código del ejemplo:**

```python
correlation_id = str(uuid.uuid4())
logging.info(f"correlation_id={correlation_id} accion=procesar_tarea")
# El mismo correlation_id se propaga a través de CADA servicio que procesa esta solicitud
```

### Tema 2: Metric filters y alarmas

**Conceptos clave:** convertir patrones de texto en logs a métricas numéricas monitoreables, más económico que métricas custom manuales.

```bash
aws logs put-metric-filter --log-group-name /mi-app/backend --filter-name ContarErrores --filter-pattern "ERROR" --metric-transformations metricName=Errores,metricNamespace=MiApp,metricValue=1
aws cloudwatch put-metric-alarm --alarm-name MuchosErrores --metric-name Errores --namespace MiApp --statistic Sum --period 60 --threshold 5 --comparison-operator GreaterThanThreshold --evaluation-periods 1
```

Un metric filter examina continuamente los logs entrantes de un log group buscando un patrón específico (`"ERROR"`), incrementando una métrica numérica cada vez que ese patrón aparece, sin que la aplicación necesite emitir explícitamente una métrica custom por separado además del log de error mismo: la métrica se deriva automáticamente del log ya existente, aprovechando información que la aplicación ya está registrando de todas formas por razones de depuración, en vez de duplicar ese esfuerzo instrumentando manualmente un contador de métricas custom adicional para el mismo propósito, lo que hace a los metric filters considerablemente más económicos en esfuerzo de instrumentación que las métricas custom manuales.

Una alarma configurada sobre esa métrica derivada (`threshold=5`, `evaluation-periods=1`) dispara una notificación automáticamente cuando el conteo de errores supera el umbral definido dentro del período configurado, permitiendo que el equipo de desarrollo se entere de un problema de producción de forma proactiva (antes de que múltiples usuarios reporten el mismo problema por otros canales), cerrando el ciclo completo desde "el código registra un error" hasta "el equipo responsable recibe una notificación automática accionable".

**Analogía:** un metric filter es como un sistema de conteo automático que registra cuántas veces aparece una palabra clave específica en los reportes diarios ya existentes de una oficina, sin requerir un formulario de conteo separado adicional; una alarma es como una campana automática que suena cuando ese conteo supera un umbral preocupante dentro de un período específico, alertando al supervisor antes de que el problema se vuelva evidente por sus consecuencias visibles.

**¿Por qué es importante?** Un metric filter es más barato que una métrica custom porque deriva la métrica automáticamente de logs que la aplicación ya emite, sin instrumentación manual adicional; las alarmas permiten detectar problemas proactivamente antes de que los usuarios los reporten por otros canales.

**Diagrama:**

```
Log "ERROR ..." emitido → metric filter cuenta ocurrencias → métrica "Errores" incrementa
métrica "Errores" > 5 en 60s → alarma se dispara → notificación automática al equipo
```

### Tema 3: Diagnóstico sistemático y X-Ray

**Conceptos clave:** encontrar la causa raíz con evidencia, no adivinando.

Encontrar la causa de un error sin adivinar requiere un proceso sistemático que combina las herramientas anteriores: filtrar logs por el patrón de error específico (`filter-log-events --filter-pattern "ERROR"`) para identificar cuándo y con qué frecuencia ocurre, extraer el correlation ID de las ocurrencias específicas para reconstruir el recorrido completo de las transacciones afectadas a través de todos los servicios involucrados, y consultar un dashboard con las métricas clave de la API (latencia, tasa de error, throughput) para entender el contexto general del sistema en el momento del incidente, en vez de depender de conjeturas basadas en la memoria de qué cambió recientemente sin evidencia concreta que lo respalde.

X-Ray (un servicio de tracing distribuido, mencionado como complemento a estas herramientas) permite visualizar el recorrido completo de una solicitud a través de múltiples servicios como un trace único con tiempos de latencia por cada segmento, complementando los logs y métricas con una vista temporal explícita de dónde específicamente se consumió el tiempo de una solicitud lenta, información que ni los logs ni las métricas agregadas por sí solos pueden mostrar con la misma granularidad de segmento por segmento.

**Analogía:** diagnosticar sistemáticamente con logs, métricas y traces es como una investigación forense que reconstruye los hechos a partir de evidencia concreta y verificable (registros, mediciones, un mapa detallado del recorrido) en vez de depender de testimonios vagos sobre lo que "probablemente" ocurrió sin ninguna evidencia que lo respalde directamente.

**¿Por qué es importante?** Combinar logs filtrados, correlation IDs para reconstruir transacciones completas, y métricas de contexto general permite encontrar la causa raíz de un error con evidencia concreta, en vez de depender de conjeturas sin respaldo verificable.

**Diagrama:**

```
1. Filtrar logs por patrón de error → ¿cuándo y con qué frecuencia?
2. Extraer correlation ID → reconstruir el recorrido completo de la transacción afectada
3. Consultar dashboard de métricas → contexto general del sistema en ese momento
4. X-Ray trace → latencia exacta por segmento de la solicitud
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

> Este laboratorio asume que ya ejecutaste `floci start` y `eval $(floci env)` (Módulo 1) en tu sesión de terminal, así que los comandos de `aws` no repiten `--endpoint-url`.

**Objetivo del laboratorio:** construir un dashboard de CloudWatch con logs, métricas de errores y alarma configurada.

**Requisitos previos:** Módulo 11 completado.

| Paso | Acción | Comando | Explicación |
|---|---|---|---|
| 1 | Crear un log group y enviar logs con correlation ID | Ver Tema 1 | Con `uuid` propagado |
| 2 | Filtrar logs por patrón de error | `aws logs filter-log-events --filter-pattern "ERROR"` | Extraer ocurrencias |
| 3 | Crear un metric filter que cuente errores | `aws logs put-metric-filter` | Derivado de logs existentes |
| 4 | Crear una alarma sobre esa métrica | `aws cloudwatch put-metric-alarm` | Umbral de 5 errores |
| 5 | Crear un Dashboard con métricas clave | Consola/CLI de CloudWatch | Latencia, errores, throughput |

**Verificación:** el laboratorio se considera exitoso si la alarma se dispara correctamente al superar el umbral de errores configurado, y si es posible reconstruir el recorrido completo de una transacción específica filtrando por su correlation ID.

**Errores comunes y soluciones**

- **Emitir logs sin ningún correlation ID consistente.** Dificulta correlacionar logs de una misma transacción entre distintos servicios; propágalo desde el inicio de cada solicitud.
- **Instrumentar una métrica custom manual cuando un metric filter derivado de logs existentes sería suficiente.** Usa metric filters para reducir el esfuerzo de instrumentación.
- **Diagnosticar problemas basándose en conjeturas sin evidencia de logs, métricas o traces.** Sigue el proceso sistemático de filtrar, correlacionar y contextualizar con las herramientas disponibles.

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

- AWS, Microsoft Azure y Google Cloud, marcos oficiales de arquitectura bien diseñada.
- NIST, *Cloud Computing Standards Roadmap* y *Secure Software Development Framework*.
- Beyer et al., *Site Reliability Engineering*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- Centralizar logs en log groups permite correlacionar información de múltiples instancias distribuidas desde un único lugar.
- Un correlation ID propagado consistentemente permite reconstruir el recorrido completo de una transacción a través de múltiples servicios.
- Los metric filters derivan métricas automáticamente de logs existentes, más económicos que métricas custom manuales.
- Diagnosticar sistemáticamente con logs, métricas y traces (X-Ray) encuentra la causa raíz con evidencia, no con conjeturas.

**Conceptos aprendidos**

- Log group.
- Log stream.
- Metric filter.
- Alarm.
- Correlation ID.
- Dashboard.
- X-Ray trace.

**Próximos pasos**

En el Módulo 13 aprenderás bases de datos relacionales con RDS, corriendo PostgreSQL real, y cuándo elegir SQL sobre NoSQL.

**Recursos adicionales**

- Documentación oficial de Amazon CloudWatch (docs.aws.amazon.com/cloudwatch).
