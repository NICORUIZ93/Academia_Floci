# Módulo 16: Orquestación de flujos con Step Functions

## Sílabo

**Objetivo general**

Coordinar múltiples servicios en flujos complejos con lógica condicional, reintentos automáticos y manejo de errores declarativo, distinguiendo cuándo Step Functions es necesario frente a alternativas más simples como EventBridge Pipes.

**Objetivos específicos**

1. Escribir una state machine con estados secuenciales que invocan distintos servicios.
2. Iniciar y observar una ejecución.
3. Agregar un Choice state que enrute según una condición.
4. Configurar Retry y Catch para manejo declarativo de errores.

**Contenido**

- State machine.
- Task state.
- Choice state.
- Retry / Catch.
- Express vs Standard.
- Parallel state.

**Evaluación**

Flujo de procesamiento de tareas con validación, guardado, notificación y manejo de errores, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: State machine y Task states

**Conceptos clave:** flujo declarado explícitamente como una secuencia de estados, no código imperativo disperso.

```bash
aws stepfunctions create-state-machine --name FlujoTareas --definition file://maquina.json --role-arn arn:aws:iam::000000000000:role/sfn-role
aws stepfunctions start-execution --state-machine-arn arn:aws:states:us-east-1:000000000000:stateMachine:FlujoTareas --input '{"tarea":"001"}'
```

Una state machine define un flujo de trabajo completo como una secuencia explícita de estados declarados en JSON/YAML (`ValidarTarea → GuardarEnDynamoDB → EnviarNotificacion`), cada uno típicamente un Task state que invoca un servicio específico (una Lambda, una operación directa sobre DynamoDB o SNS mediante integraciones de servicio nativas); esto contrasta con la alternativa de coordinar la misma secuencia mediante código imperativo dentro de una única función Lambda que llama secuencialmente a cada servicio, un enfoque donde la lógica de orquestación (qué paso sigue a cuál, qué pasa si uno falla) queda implícita y dispersa dentro del código en vez de ser explícita y visualizable como un diagrama de flujo declarado.

Observar una ejecución específica con `describe-execution` muestra exactamente en qué estado se encuentra (o se detuvo) una invocación particular del flujo, con el historial completo de transiciones entre estados, una visibilidad operativa que sería considerablemente más difícil de reconstruir a partir únicamente de logs dispersos de una función Lambda monolítica que coordinara la misma lógica de forma imperativa.

**Analogía:** una state machine es como un diagrama de flujo formal y visual que documenta explícitamente cada paso de un proceso y sus transiciones, en vez de una descripción narrativa en prosa de esos mismos pasos incrustada dentro del código de una única función, donde la estructura del proceso completo es más difícil de visualizar de un vistazo.

**¿Por qué es importante?** Una state machine declara explícitamente la secuencia y lógica de un flujo de trabajo, ofreciendo visibilidad operativa clara sobre en qué estado se encuentra cada ejecución, en contraste con coordinar la misma lógica de forma imperativa dentro de una única función donde esa estructura queda implícita.

**Diagrama:**

```json
{
  "StartAt": "ValidarTarea",
  "States": {
    "ValidarTarea": { "Type": "Task", "Resource": "arn:...", "Next": "GuardarEnDynamoDB" },
    "GuardarEnDynamoDB": { "Type": "Task", "Resource": "arn:...", "Next": "EnviarNotificacion" },
    "EnviarNotificacion": { "Type": "Task", "Resource": "arn:...", "End": true }
  }
}
```

### Tema 2: Choice state, Retry y Catch

**Conceptos clave:** lógica condicional y manejo de errores declarados, no anidados en código imperativo.

Un Choice state enruta la ejecución hacia distintos estados siguientes según una condición evaluada sobre el input actual (por ejemplo, distinguir entre una tarea "urgente" y una "normal", dirigiendo cada una hacia una rama distinta del flujo con distinto tratamiento), expresando lógica condicional de forma declarativa dentro de la definición de la state machine misma, en vez de anidar esa lógica condicional dentro del código imperativo de una función coordinadora.

```json
"Retry": [{"ErrorEquals": ["States.TaskFailed"], "IntervalSeconds": 2, "MaxAttempts": 3, "BackoffRate": 2}]
"Catch": [{"ErrorEquals": ["States.ALL"], "Next": "EstadoDeError"}]
```

`Retry` declara reintentos automáticos ante un tipo específico de error, con backoff exponencial configurable (esperando progresivamente más tiempo entre reintentos sucesivos, el mismo patrón de resiliencia estudiado en Swift, Módulo 5 del track de iOS), sin que el desarrollador escriba manualmente ningún bucle de reintento imperativo; `Catch` declara hacia qué estado transicionar si un error específico (o cualquier error, con `States.ALL`) ocurre durante un Task state, permitiendo manejar fallos de forma explícita y visible directamente en la definición del flujo, en vez de depender de manejo de excepciones disperso e implícito dentro del código de cada función individual invocada por el flujo.

**Analogía:** un Choice state es como una bifurcación claramente señalizada en un mapa de proceso que indica exactamente qué condición dirige hacia cada camino posible; `Retry`/`Catch` declarados en la state machine son como protocolos de contingencia predefinidos y visibles en el manual de operaciones de un proceso, en vez de reglas de manejo de excepciones dispersas e implícitas que cada operador individual debe recordar aplicar por su cuenta.

**¿Por qué es importante?** `Choice` expresa lógica condicional de forma declarativa y visible en la definición del flujo; `Retry`/`Catch` declaran manejo de errores explícito (con backoff automático) sin código imperativo disperso, haciendo el comportamiento ante fallos parte visible de la definición del flujo mismo.

**Diagrama:**

```json
"Retry": [{"ErrorEquals": ["States.TaskFailed"], "IntervalSeconds": 2, "MaxAttempts": 3, "BackoffRate": 2}],
"Catch": [{"ErrorEquals": ["States.ALL"], "Next": "EstadoDeError"}]
```

### Tema 3: Express vs Standard, y cuándo EventBridge Pipes es suficiente

**Conceptos clave:** elegir según duración y frecuencia de ejecución, o simplificar si no se necesita orquestación compleja.

Standard workflows están diseñados para flujos de larga duración (hasta un año) con garantía de ejecución exactamente una vez y un historial de ejecución detallado y persistente, apropiado para procesos de negocio críticos donde la trazabilidad completa importa; Express workflows están optimizados para flujos de alto volumen y corta duración (hasta cinco minutos), con un modelo de ejecución "al menos una vez" (potencialmente duplicada en casos raros) y un costo considerablemente menor por ejecución, apropiado para procesar eventos de alta frecuencia donde la trazabilidad exhaustiva de Standard no es tan crítica como el costo y el throughput.

Cuando la necesidad real es simplemente conectar dos servicios de forma directa sin lógica condicional compleja, reintentos elaborados, ni múltiples pasos coordinados (por ejemplo, simplemente enviar cada mensaje de una cola SQS directamente hacia una Lambda sin ninguna transformación u orquestación intermedia), EventBridge Pipes ofrece esa conexión directa de forma considerablemente más simple y económica que definir una state machine completa de Step Functions para un caso que no requiere ese nivel de orquestación; reservar Step Functions específicamente para casos que genuinamente necesitan lógica condicional, reintentos declarativos complejos, o coordinación de múltiples pasos secuenciales o paralelos evita la sobre-ingeniería de introducir una herramienta de orquestación completa donde una conexión simple sería suficiente.

**Analogía:** elegir entre Standard y Express es como elegir entre un proceso administrativo formal con expediente completo archivado (Standard, para trámites críticos que requieren trazabilidad total) y un proceso ágil de alto volumen con menor formalidad de registro (Express, para trámites rutinarios de bajo riesgo); EventBridge Pipes frente a Step Functions es como elegir un cable directo simple entre dos dispositivos en vez de instalar un panel de control completo con lógica programable cuando la necesidad real es simplemente conectar A con B sin ninguna condición intermedia.

**¿Por qué es importante?** Elegir entre Standard (trazabilidad completa, larga duración) y Express (alto volumen, económico) depende de los requisitos específicos del flujo; EventBridge Pipes es suficiente y más simple cuando no se necesita lógica condicional ni coordinación de múltiples pasos, evitando sobre-ingeniería.

**Diagrama:**

```
Standard workflow  → larga duración, ejecución exactamente una vez, trazabilidad completa
Express workflow   → alto volumen, corta duración, al menos una vez, económico
EventBridge Pipes  → conexión directa simple entre dos servicios, sin orquestación compleja
```

---

## Laboratorio práctico

**Objetivo del laboratorio:** construir un flujo de procesamiento de tareas con validación, guardado, notificación y manejo de errores.

**Requisitos previos:** Módulo 15 completado.

| Paso | Acción | Comando | Explicación |
|---|---|---|---|
| 1 | Escribir la state machine con estados secuenciales | Ver Tema 1 | ValidarTarea → Guardar → Notificar |
| 2 | Crear e iniciar una ejecución | `aws stepfunctions create-state-machine` + `start-execution` | Observa con `describe-execution` |
| 3 | Agregar un Choice state | Ver Tema 2 | Enruta según tipo de tarea |
| 4 | Configurar Retry y Catch | Ver Tema 2 | Manejo declarativo de errores |
| 5 | Comparar con EventBridge Pipes | Ver Tema 3 | ¿Cuándo sería suficiente? |

**Verificación:** el laboratorio se considera exitoso si la ejecución completa el flujo correctamente para el caso feliz, y si el manejo de Retry/Catch responde correctamente ante un fallo simulado en uno de los estados.

**Errores comunes y soluciones**

- **Coordinar un flujo complejo con código imperativo disperso en una función monolítica.** Considera declarar el flujo con Step Functions para visibilidad y manejo de errores explícito.
- **Usar Standard workflows para eventos de alto volumen y corta duración.** Considera Express, más económico para ese caso.
- **Introducir Step Functions para una simple conexión directa entre dos servicios sin lógica condicional.** Considera EventBridge Pipes, más simple para ese caso.

---

## Ejercicios de evaluación

### Ejercicio 1: Cuándo usar Step Functions vs EventBridge Pipes

**Enunciado:** ¿cuándo usar Step Functions y cuándo es suficiente con EventBridge Pipes?

**Solución esperada:** Step Functions es apropiado cuando se necesita lógica condicional (Choice), reintentos declarativos complejos, o coordinación de múltiples pasos secuenciales o paralelos; EventBridge Pipes es suficiente y más simple cuando la necesidad real es simplemente conectar dos servicios directamente sin esa complejidad de orquestación adicional.

**Criterios de éxito:**
- Distingue correctamente la necesidad de lógica de orquestación compleja (Step Functions) frente a conexión simple directa (EventBridge Pipes).

### Ejercicio 2: Diferencia entre orquestación y coreografía

**Enunciado:** ¿qué diferencia hay entre orquestación y coreografía de servicios?

**Solución esperada:** en la orquestación (Step Functions), un coordinador central explícito dirige la secuencia completa de pasos y decide qué servicio invocar a continuación; en la coreografía, cada servicio reacciona de forma autónoma a eventos publicados (por ejemplo, vía SNS/EventBridge) sin un coordinador central único que dirija explícitamente el flujo completo.

**Criterios de éxito:**
- Distingue correctamente la presencia de un coordinador central (orquestación) frente a reacción autónoma descentralizada a eventos (coreografía).

### Ejercicio 3: Cuándo usar Express vs Standard

**Enunciado:** ¿cuándo usar Express vs Standard workflows?

**Solución esperada:** Standard es apropiado para flujos de larga duración con garantía de ejecución exactamente una vez y trazabilidad completa, apropiado para procesos críticos; Express es apropiado para flujos de alto volumen y corta duración donde el costo y throughput importan más que la trazabilidad exhaustiva.

**Criterios de éxito:**
- Distingue correctamente el caso de uso de cada uno según duración, volumen y necesidad de trazabilidad.

---

## Resumen del módulo

**Puntos clave**

- Una state machine declara explícitamente la secuencia y lógica de un flujo, con visibilidad operativa clara sobre cada ejecución.
- `Choice` expresa lógica condicional declarativa; `Retry`/`Catch` declaran manejo de errores explícito con backoff automático.
- Standard workflows priorizan trazabilidad completa para procesos críticos; Express prioriza costo y throughput para alto volumen.
- EventBridge Pipes es suficiente para conexiones simples sin necesidad de orquestación compleja, evitando sobre-ingeniería.

**Conceptos aprendidos**

- State machine.
- Task state.
- Choice state.
- Retry / Catch.
- Express vs Standard.
- Parallel state.

**Próximos pasos**

En el Módulo 17 aprenderás streaming con Kinesis y MSK, procesando flujos de millones de eventos por segundo, distinto del modelo de colas de SQS.

**Recursos adicionales**

- Documentación oficial de AWS Step Functions (docs.aws.amazon.com/step-functions).
