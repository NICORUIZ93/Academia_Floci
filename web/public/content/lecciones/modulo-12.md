# Módulo 12 · Step Functions y flujos de trabajo complejos

## ¿Por qué orquestar?

Imagina un proceso de onboarding: crear cuenta → verificar email → enviar bienvenida → crear perfil → asignar plan. Si haces esto en una sola Lambda:

- ¿Qué pasa si falla el paso 3?
- ¿Cómo reintentamos solo ese paso?
- ¿Cómo visualizamos en qué paso está cada usuario?

**Step Functions** es el servicio de AWS para orquestar flujos de trabajo complejos. Define los pasos en JSON (Amazon States Language), y AWS gestiona la ejecución, reintentos, timeouts y paralelismo.

---

## Amazon States Language — la gramática de Step Functions

```bash
eval $(floci env)

# Define la máquina de estados
cat > flujo-pedido.json << 'EOF'
{
  "Comment": "Flujo de procesamiento de pedido",
  "StartAt": "ValidarPedido",
  "States": {
    "ValidarPedido": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:000000000000:function:validar-pedido",
      "Next": "ReservarInventario",
      "Retry": [
        {
          "ErrorEquals": ["States.TaskFailed"],
          "IntervalSeconds": 2,
          "MaxAttempts": 3,
          "BackoffRate": 2
        }
      ],
      "Catch": [
        {
          "ErrorEquals": ["PedidoInvalido"],
          "Next": "NotificarError",
          "ResultPath": "$.error"
        }
      ]
    },

    "ReservarInventario": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:000000000000:function:reservar-inventario",
      "Next": "ProcesarPago",
      "TimeoutSeconds": 30
    },

    "ProcesarPago": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:000000000000:function:procesar-pago",
      "Next": "NotificacionParalela"
    },

    "NotificacionParalela": {
      "Type": "Parallel",
      "Branches": [
        {
          "StartAt": "EnviarEmail",
          "States": {
            "EnviarEmail": {
              "Type": "Task",
              "Resource": "arn:aws:lambda:us-east-1:000000000000:function:enviar-email",
              "End": true
            }
          }
        },
        {
          "StartAt": "ActualizarInventario",
          "States": {
            "ActualizarInventario": {
              "Type": "Task",
              "Resource": "arn:aws:lambda:us-east-1:000000000000:function:actualizar-inventario",
              "End": true
            }
          }
        }
      ],
      "Next": "PedidoCompletado"
    },

    "PedidoCompletado": {
      "Type": "Succeed"
    },

    "NotificarError": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:000000000000:function:notificar-error",
      "End": true
    }
  }
}
EOF
```

### Despliega y ejecuta

```bash
# Crea la state machine
SFN_ARN=$(aws stepfunctions create-state-machine \
  --name flujo-pedido \
  --definition file://flujo-pedido.json \
  --role-arn arn:aws:iam::000000000000:role/rol-stepfunctions \
  --query stateMachineArn --output text)

echo "State Machine ARN: $SFN_ARN"

# Inicia una ejecución
EXEC_ARN=$(aws stepfunctions start-execution \
  --state-machine-arn $SFN_ARN \
  --name "ejecucion-$(date +%s)" \
  --input '{"pedidoId":"P-001","usuario":"alice","total":59.99,"items":[{"sku":"A1","qty":2}]}' \
  --query executionArn --output text)

echo "Ejecución: $EXEC_ARN"

# Consulta el estado
aws stepfunctions describe-execution --execution-arn $EXEC_ARN

# Ve el historial de eventos
aws stepfunctions get-execution-history --execution-arn $EXEC_ARN

# Lista ejecuciones de la state machine
aws stepfunctions list-executions --state-machine-arn $SFN_ARN
```

---

## Tipos de estados

```json
{
  "MiEspera": {
    "Type": "Wait",
    "Seconds": 10,
    "Next": "SiguientePaso"
  },

  "MiDecision": {
    "Type": "Choice",
    "Choices": [
      {
        "Variable": "$.estado",
        "StringEquals": "aprobado",
        "Next": "Aprobar"
      },
      {
        "Variable": "$.total",
        "NumericGreaterThan": 1000,
        "Next": "RevisionManual"
      }
    ],
    "Default": "Rechazar"
  },

  "MiIteracion": {
    "Type": "Map",
    "ItemsPath": "$.items",
    "MaxConcurrency": 5,
    "Iterator": {
      "StartAt": "ProcesarItem",
      "States": {
        "ProcesarItem": {
          "Type": "Task",
          "Resource": "arn:aws:lambda:us-east-1:000000000000:function:procesar-item",
          "End": true
        }
      }
    },
    "Next": "Finalizar"
  },

  "Finalizar": {
    "Type": "Pass",
    "Result": {"mensaje": "Todos los ítems procesados"},
    "End": true
  }
}
```

---

## Lambda de validación para el flujo

```python
import json

def lambda_handler(event, context):
    pedido_id = event.get("pedidoId")
    total = event.get("total", 0)
    items = event.get("items", [])

    if not pedido_id:
        raise Exception("PedidoInvalido: falta pedidoId")

    if total <= 0:
        raise Exception("PedidoInvalido: total debe ser positivo")

    if not items:
        raise Exception("PedidoInvalido: no hay ítems")

    # Enriquece el input para el siguiente paso
    return {
        **event,
        "validado": True,
        "timestamp_validacion": "2024-01-01T12:00:00Z"
    }
```

---

## Flujo con reintentos y compensación

```json
{
  "Comment": "Saga Pattern — rollback si algo falla",
  "StartAt": "Paso1CrearOrden",
  "States": {
    "Paso1CrearOrden": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:000000000000:function:crear-orden",
      "Next": "Paso2DebitarSaldo",
      "Catch": [{
        "ErrorEquals": ["States.ALL"],
        "Next": "CompensarOrden"
      }]
    },
    "Paso2DebitarSaldo": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:000000000000:function:debitar-saldo",
      "Next": "Exito",
      "Catch": [{
        "ErrorEquals": ["States.ALL"],
        "Next": "CompensarOrden"
      }]
    },
    "Exito": {"Type": "Succeed"},
    "CompensarOrden": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:000000000000:function:cancelar-orden",
      "End": true
    }
  }
}
```

---

## Reto del módulo

1. Crea 3 Lambdas simples: `validar`, `procesar`, `notificar` (cada una loguea su nombre y pasa el input)
2. Define una state machine con esos 3 pasos en secuencia
3. Agrega un estado `Choice` que bifurque: si total > 100 va a `procesar`, si no va a `notificar` directamente
4. Agrega reintentos en el paso `procesar` (3 intentos, backoff exponencial)
5. Ejecuta el flujo con input `{"total": 150}` y con `{"total": 50}` y verifica que toman caminos distintos

## Preguntas de salida

1. ¿Qué problema resuelve Step Functions que una Lambda sola no puede?
2. ¿Cuál es el patrón Saga y cuándo lo usarías?
3. ¿Qué diferencia hay entre `Parallel` y `Map`?
4. ¿Cómo debugueas un flujo que falla en el paso 3 de 5?
