# Módulo 16: Orquestación de flujos con Step Functions


## Aprende construyendo

### Tema 1: State machine y Task states

#### Paso 1 · Objetivo y preparación
Al finalizar podrás modelar un flujo desde cero. Prerrequisitos: Node.js y AWS CLI; verifica `node --version`.
#### Paso 2 · Contexto y caso real
Una entrega pasa por estados que deben reintentarse y auditarse.
#### Paso 3 · Teoría, modelo mental y analogía
Un workflow es un tablero de estados con transiciones visibles.
#### Paso 4 · Demostración guiada
Crea `src/workflow.js` desde una carpeta vacía.
```bash
mkdir ejemplo-workflow
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: omite un estado para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Añade timeout y reintento.
#### Paso 7 · Cierre y evidencia
Entrega definición, salida, fallo y corrección; explica el resultado. Siguiente paso: errores. Errores comunes: estados sin timeout y efectos duplicados. Fuente oficial: https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html.
**Conceptos clave:** flujo declarado explícitamente como una secuencia de estados, no código imperativo disperso.

```bash
aws stepfunctions create-state-machine --name FlujoTareas --definition file://maquina.json --role-arn arn:aws:iam::000000000000:role/sfn-role
aws stepfunctions start-execution --state-machine-arn arn:aws:states:us-east-1:000000000000:stateMachine:FlujoTareas --input '{"tarea":"001"}'
```

Una state machine define un flujo de trabajo completo como una secuencia explícita de estados declarados en JSON/YAML (`ValidarTarea → GuardarEnDynamoDB → EnviarNotificacion`), cada uno típicamente un Task state que invoca un servicio específico (una Lambda, una operación directa sobre DynamoDB o SNS mediante integraciones de servicio nativas); esto contrasta con la alternativa de coordinar la misma secuencia mediante código imperativo dentro de una única función Lambda que llama secuencialmente a cada servicio, un enfoque donde la lógica de orquestación (qué paso sigue a cuál, qué pasa si uno falla) queda implícita y dispersa dentro del código en vez de ser explícita y visualizable como un diagrama de flujo declarado.

Observar una ejecución específica con `describe-execution` muestra exactamente en qué estado se encuentra (o se detuvo) una invocación particular del flujo, con el historial completo de transiciones entre estados, una visibilidad operativa que sería considerablemente más difícil de reconstruir a partir únicamente de logs dispersos de una función Lambda monolítica que coordinara la misma lógica de forma imperativa.

**Analogía:** una state machine es como un diagrama de flujo formal y visual que documenta explícitamente cada paso de un proceso y sus transiciones, en vez de una descripción narrativa en prosa de esos mismos pasos incrustada dentro del código de una única función, donde la estructura del proceso completo es más difícil de visualizar de un vistazo.

**¿Por qué es importante?** Una state machine declara explícitamente la secuencia y lógica de un flujo de trabajo, ofreciendo visibilidad operativa clara sobre en qué estado se encuentra cada ejecución, en contraste con coordinar la misma lógica de forma imperativa dentro de una única función donde esa estructura queda implícita.

**Configuración del ejemplo:**

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

#### Paso 1 · Objetivo y preparación
Al finalizar podrás controlar ramas desde cero. Prerrequisitos: Node.js y AWS CLI; verifica `node --version`.
#### Paso 2 · Contexto y caso real
Una entrega fallida debe ir a recuperación sin ocultar la causa.
#### Paso 3 · Teoría, modelo mental y analogía
Choice y Catch son señales y salidas de emergencia del flujo.
#### Paso 4 · Demostración guiada
Crea `src/branches.js` desde una carpeta vacía.
```bash
mkdir ejemplo-branches
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: envía una entrada sin rama para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Añade ruta de compensación.
#### Paso 7 · Cierre y evidencia
Entrega definición, salida, fallo y corrección; explica el resultado. Siguiente paso: elección de servicio. Errores comunes: Catch demasiado amplio y reintentos infinitos. Fuente oficial: https://docs.aws.amazon.com/step-functions/latest/dg/concepts-error-handling.html.
**Conceptos clave:** lógica condicional y manejo de errores declarados, no anidados en código imperativo.

Un Choice state enruta la ejecución hacia distintos estados siguientes según una condición evaluada sobre el input actual (por ejemplo, distinguir entre una tarea "urgente" y una "normal", dirigiendo cada una hacia una rama distinta del flujo con distinto tratamiento), expresando lógica condicional de forma declarativa dentro de la definición de la state machine misma, en vez de anidar esa lógica condicional dentro del código imperativo de una función coordinadora.

```json
"Retry": [{"ErrorEquals": ["States.TaskFailed"], "IntervalSeconds": 2, "MaxAttempts": 3, "BackoffRate": 2}]
"Catch": [{"ErrorEquals": ["States.ALL"], "Next": "EstadoDeError"}]
```

`Retry` declara reintentos automáticos ante un tipo específico de error, con backoff exponencial configurable (esperando progresivamente más tiempo entre reintentos sucesivos, el mismo patrón de resiliencia estudiado en Swift, Módulo 5 del track de iOS), sin que el desarrollador escriba manualmente ningún bucle de reintento imperativo; `Catch` declara hacia qué estado transicionar si un error específico (o cualquier error, con `States.ALL`) ocurre durante un Task state, permitiendo manejar fallos de forma explícita y visible directamente en la definición del flujo, en vez de depender de manejo de excepciones disperso e implícito dentro del código de cada función individual invocada por el flujo.

**Analogía:** un Choice state es como una bifurcación claramente señalizada en un mapa de proceso que indica exactamente qué condición dirige hacia cada camino posible; `Retry`/`Catch` declarados en la state machine son como protocolos de contingencia predefinidos y visibles en el manual de operaciones de un proceso, en vez de reglas de manejo de excepciones dispersas e implícitas que cada operador individual debe recordar aplicar por su cuenta.

**¿Por qué es importante?** `Choice` expresa lógica condicional de forma declarativa y visible en la definición del flujo; `Retry`/`Catch` declaran manejo de errores explícito (con backoff automático) sin código imperativo disperso, haciendo el comportamiento ante fallos parte visible de la definición del flujo mismo.

**Configuración del ejemplo:**

```json
"Retry": [{"ErrorEquals": ["States.TaskFailed"], "IntervalSeconds": 2, "MaxAttempts": 3, "BackoffRate": 2}],
"Catch": [{"ErrorEquals": ["States.ALL"], "Next": "EstadoDeError"}]
```

### Tema 3: Express vs Standard, y cuándo EventBridge Pipes es suficiente

#### Paso 1 · Objetivo y preparación
Al finalizar podrás elegir orquestación desde cero. Prerrequisitos: Node.js y AWS CLI; verifica `node --version`.
#### Paso 2 · Contexto y caso real
No todo proceso necesita un workflow distribuido.
#### Paso 3 · Teoría, modelo mental y analogía
Elegir es comparar una lista de tareas con una central de control.
#### Paso 4 · Demostración guiada
Crea `src/orchestration-choice.js` desde una carpeta vacía.
```bash
mkdir ejemplo-orquestacion
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: usa una herramienta sobredimensionada para provocar un fallo deliberado de coste y corrígelo.
#### Paso 6 · Práctica independiente
Construye una matriz de duración, frecuencia y complejidad.
#### Paso 7 · Cierre y evidencia
Entrega decisión, salida, fallo y corrección; explica el resultado. Siguiente paso: eventos. Errores comunes: orquestar todo y no medir latencia. Fuente oficial: https://aws.amazon.com/step-functions/.
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

> Este laboratorio asume que ya ejecutaste `floci start` y `eval $(floci env)` (Módulo 1) en tu sesión de terminal, así que los comandos de `aws` no repiten `--endpoint-url`.

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
