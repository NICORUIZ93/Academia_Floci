# Módulo 13: TypeScript, contratos e integraciones confiables

Una API puede compilar, pasar pruebas y aun romper consumidores o duplicar cobros. La red entrega bytes, no objetos TypeScript; los clientes reintentan cuando desconocen el resultado; una publicación puede separarse accidentalmente del cambio en base. Este módulo convierte esas incertidumbres en contratos e invariantes comprobables.


## Aprende construyendo

### Tema 1: Tipos estáticos dentro, datos desconocidos en la frontera

#### Paso 1 · Objetivo y preparación
Al finalizar podrás aplicar este concepto desde cero. Prerrequisitos: Node.js LTS, npm, TypeScript y un editor. Verifica node --version y npm --version.

#### Paso 2 · Contexto y caso real
En un caso real de una plataforma de entregas, esta técnica protege pedidos, pagos y notificaciones frente a datos inválidos o fallos de red. Define primero la entrada y el resultado que deben observarse.

#### Paso 3 · Teoría, modelo mental y analogía
El concepto separa una frontera externa de un dominio confiable. La analogía es una bodega: cada paquete se inspecciona antes de entrar y cada salida se registra. Considera seguridad, concurrencia, reintentos, compatibilidad y observabilidad; una prueba feliz no demuestra recuperación.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-node-m13
cd ejemplo-node-m13
npm init -y
npm install -D typescript tsx @types/node
mkdir src
```
Crea src/index.ts:
```ts
const input: unknown = { id: 'd-1', status: 'ready' };
if (typeof input !== 'object' || input === null) throw new Error('entrada inválida');
console.log({ ok: true, input });
```
El ejemplo valida la frontera, ejecuta el camino mínimo y deja una salida reproducible.

#### Paso 5 · Práctica guiada
Pista: ejecuta npx tsx src/index.ts, cambia la entrada para provocar un fallo deliberado, observa el diagnóstico y restáurala. Resultado esperado: aparece ok: true únicamente con datos válidos.

#### Paso 6 · Práctica independiente
Crea src/solution.ts para representar un pedido y añade una prueba válida, una inválida y una repetida. Explica qué invariante protege cada comprobación.

#### Paso 7 · Cierre y evidencia
Guarda código, comandos, salida y captura; como siguiente paso automatiza la prueba en CI. Errores comunes: usar any, confiar en un cast, no fijar dependencias, ocultar excepciones y no probar concurrencia. Fuentes oficiales: https://nodejs.org/en/learn/ y https://www.typescriptlang.org/docs/.

**¿Por qué es importante?** Porque convierte datos inciertos en decisiones verificables y evita fallos silenciosos en producción.
**Conceptos clave:** TypeScript, strict, unknown, any, narrowing, discriminated union, branded type, Result, exhaustividad, validación runtime, DTO, dominio y frontera.

TypeScript comprueba el programa durante desarrollo y luego se elimina. Un cast `body as CreateTask` no transforma ni valida el JSON: solo ordena al compilador confiar. Los datos de HTTP, variables de entorno, base sin tipar y colas empiezan como `unknown` y deben cruzar un parser explícito.

```typescript
import { z } from 'zod';

const CreateTaskInput = z.object({
  title: z.string().trim().min(1).max(120),
  dueAt: z.string().datetime({ offset: true }).optional(),
}).strict();

type CreateTaskInput = z.infer<typeof CreateTaskInput>;

function parseCreateTask(value: unknown): CreateTaskInput {
  return CreateTaskInput.parse(value);
}
```

Validar forma no completa reglas de dominio. “Título requerido” pertenece a entrada; “no crear más de N tareas activas para el plan” requiere estado y vive en un caso de uso. Separa DTO, comando de dominio y entidad persistente para no acoplar cada capa a Prisma.

Uniones discriminadas modelan resultados esperables sin usar excepciones para todo:

```typescript
type CreateResult =
  | { kind: 'created'; task: Task }
  | { kind: 'quota-exceeded'; limit: number }
  | { kind: 'duplicate'; task: Task };

function toHttp(result: CreateResult): HttpResponse {
  switch (result.kind) {
    case 'created': return { status: 201, body: result.task };
    case 'quota-exceeded': return { status: 409, body: { limit: result.limit } };
    case 'duplicate': return { status: 200, body: result.task };
    default: return assertNever(result);
  }
}
```

La exhaustividad hace visible un nuevo estado al compilar. Tipos de marca pueden impedir mezclar `TaskId` y `UserId`, pero deben crearse tras validar. Evita `any`, `!` y casts amplios: silencian precisamente la evidencia buscada.

**Analogía:** TypeScript revisa el plano dentro de la fábrica. El muelle de recepción aún necesita inspeccionar cada cargamento; una etiqueta escrita por el proveedor no garantiza su contenido.

**¿Por qué es importante?** porque muchas APIs “tipadas” fallan con datos reales al confiar en JSON, configuración o respuestas externas que el compilador nunca observó.

**Casos de uso reales:** body HTTP, claims JWT, configuración, eventos antiguos, respuesta de proveedor, migración de esquema y campos opcionales.

**Diagrama:**

```text
bytes/JSON -> unknown -> schema runtime -> DTO válido -> caso de uso -> dominio
                         error 400                         resultado exhaustivo
TypeScript protege dentro de la frontera; el parser protege la frontera
```

### Tema 2: Un contrato HTTP es comportamiento, no solo documentación

#### Paso 1 · Objetivo y preparación
Al finalizar podrás aplicar este concepto desde cero. Prerrequisitos: Node.js LTS, npm, TypeScript y un editor. Verifica node --version y npm --version.

#### Paso 2 · Contexto y caso real
En un caso real de una plataforma de entregas, esta técnica protege pedidos, pagos y notificaciones frente a datos inválidos o fallos de red. Define primero la entrada y el resultado que deben observarse.

#### Paso 3 · Teoría, modelo mental y analogía
El concepto separa una frontera externa de un dominio confiable. La analogía es una bodega: cada paquete se inspecciona antes de entrar y cada salida se registra. Considera seguridad, concurrencia, reintentos, compatibilidad y observabilidad; una prueba feliz no demuestra recuperación.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-node-m13
cd ejemplo-node-m13
npm init -y
npm install -D typescript tsx @types/node
mkdir src
```
Crea src/index.ts:
```ts
const input: unknown = { id: 'd-1', status: 'ready' };
if (typeof input !== 'object' || input === null) throw new Error('entrada inválida');
console.log({ ok: true, input });
```
El ejemplo valida la frontera, ejecuta el camino mínimo y deja una salida reproducible.

#### Paso 5 · Práctica guiada
Pista: ejecuta npx tsx src/index.ts, cambia la entrada para provocar un fallo deliberado, observa el diagnóstico y restáurala. Resultado esperado: aparece ok: true únicamente con datos válidos.

#### Paso 6 · Práctica independiente
Crea src/solution.ts para representar un pedido y añade una prueba válida, una inválida y una repetida. Explica qué invariante protege cada comprobación.

#### Paso 7 · Cierre y evidencia
Guarda código, comandos, salida y captura; como siguiente paso automatiza la prueba en CI. Errores comunes: usar any, confiar en un cast, no fijar dependencias, ocultar excepciones y no probar concurrencia. Fuentes oficiales: https://nodejs.org/en/learn/ y https://www.typescriptlang.org/docs/.

**¿Por qué es importante?** Porque convierte datos inciertos en decisiones verificables y evita fallos silenciosos en producción.
**Conceptos clave:** OpenAPI, schema, operación, status, content type, Problem Details, versionado, compatibilidad hacia atrás, consumer, provider, contract test, deprecación y sunset.

OpenAPI describe rutas, parámetros, seguridad, cuerpos y respuestas. Puede escribirse primero o generarse desde una fuente común, pero debe verificarse contra la aplicación. Un documento desactualizado es más peligroso que no tenerlo porque induce confianza falsa.

Define cada respuesta relevante, incluidos errores. RFC Problem Details ofrece una forma consistente sin exponer stack:

```yaml
/tasks:
  post:
    operationId: createTask
    requestBody:
      required: true
      content:
        application/json:
          schema: { $ref: '#/components/schemas/CreateTask' }
    responses:
      '201': { description: Creada }
      '400':
        description: Entrada inválida
        content:
          application/problem+json:
            schema: { $ref: '#/components/schemas/Problem' }
```

Agregar un campo opcional suele ser compatible, pero no siempre: un consumidor con parser estricto puede rechazarlo. Cambiar orden, precisión, significado o enum puede romper sin cambiar tipo. La compatibilidad es propiedad observada entre proveedor y consumidores, no una lista universal.

Las pruebas del proveedor verifican que sus respuestas cumplen OpenAPI. Las pruebas dirigidas por consumidor registran ejemplos mínimos que cada consumidor necesita y el proveedor los ejecuta en CI. Ninguna sustituye pruebas funcionales ni conversación sobre semántica.

Versiona solo ante cambios incompatibles justificados. Primero intenta evolución aditiva, período de deprecación, telemetría de uso y comunicación. Nunca reutilices un campo con significado nuevo. Publica fecha de retiro y alternativa, y comprueba que los clientes migraron.

**Analogía:** el contrato de un enchufe especifica forma y voltaje. Un dibujo bonito que no coincide con la pared no ayuda; cambiar voltaje sin cambiar forma es aún peor porque parece compatible.

**¿Por qué es importante?** porque equipos despliegan independientemente. Sin contrato ejecutable, un cambio local “verde” puede romper aplicaciones que no están en el mismo repositorio.

**Casos de uso reales:** SDK generado, app móvil con versiones antiguas, API pública, integración interna, gateway, deprecación de campo y formato uniforme de errores.

**Diagrama:**

```text
OpenAPI -> valida request/response del proveedor
    |
    `-> genera ejemplos/cliente
consumidor -> expectativas mínimas -> contract tests -> CI proveedor
telemetría de uso -> deprecación -> sunset comprobado
```

### Tema 3: Reintentar sin duplicar el efecto

#### Paso 1 · Objetivo y preparación
Al finalizar podrás aplicar este concepto desde cero. Prerrequisitos: Node.js LTS, npm, TypeScript y un editor. Verifica node --version y npm --version.

#### Paso 2 · Contexto y caso real
En un caso real de una plataforma de entregas, esta técnica protege pedidos, pagos y notificaciones frente a datos inválidos o fallos de red. Define primero la entrada y el resultado que deben observarse.

#### Paso 3 · Teoría, modelo mental y analogía
El concepto separa una frontera externa de un dominio confiable. La analogía es una bodega: cada paquete se inspecciona antes de entrar y cada salida se registra. Considera seguridad, concurrencia, reintentos, compatibilidad y observabilidad; una prueba feliz no demuestra recuperación.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-node-m13
cd ejemplo-node-m13
npm init -y
npm install -D typescript tsx @types/node
mkdir src
```
Crea src/index.ts:
```ts
const input: unknown = { id: 'd-1', status: 'ready' };
if (typeof input !== 'object' || input === null) throw new Error('entrada inválida');
console.log({ ok: true, input });
```
El ejemplo valida la frontera, ejecuta el camino mínimo y deja una salida reproducible.

#### Paso 5 · Práctica guiada
Pista: ejecuta npx tsx src/index.ts, cambia la entrada para provocar un fallo deliberado, observa el diagnóstico y restáurala. Resultado esperado: aparece ok: true únicamente con datos válidos.

#### Paso 6 · Práctica independiente
Crea src/solution.ts para representar un pedido y añade una prueba válida, una inválida y una repetida. Explica qué invariante protege cada comprobación.

#### Paso 7 · Cierre y evidencia
Guarda código, comandos, salida y captura; como siguiente paso automatiza la prueba en CI. Errores comunes: usar any, confiar en un cast, no fijar dependencias, ocultar excepciones y no probar concurrencia. Fuentes oficiales: https://nodejs.org/en/learn/ y https://www.typescriptlang.org/docs/.

**¿Por qué es importante?** Porque convierte datos inciertos en decisiones verificables y evita fallos silenciosos en producción.
**Conceptos clave:** timeout, resultado ambiguo, idempotency key, unicidad, transacción, lock, atomicidad, deduplicación, outbox, relay, at-least-once e invariante.

Si el servidor confirma en PostgreSQL y la respuesta se pierde, el cliente ve timeout. Repetir una creación normal produce otra tarea. Una clave de idempotencia identifica la **misma intención** a través de reintentos. Debe vincularse al actor, operación y hash del payload; reutilizarla con datos distintos devuelve conflicto.

La comprobación y el efecto deben ser atómicos. “Buscar clave, luego insertar” tiene carrera entre requests. Usa restricción única y transacción:

```sql
BEGIN;
INSERT INTO idempotency_keys(owner_id, operation, key, request_hash, status)
VALUES ($1, 'create-task', $2, $3, 'processing')
ON CONFLICT DO NOTHING;
-- solo el propietario que insertó ejecuta el cambio
INSERT INTO tasks(id, owner_id, title) VALUES ($4, $1, $5);
UPDATE idempotency_keys
SET status = 'completed', response_status = 201, resource_id = $4
WHERE owner_id = $1 AND operation = 'create-task' AND key = $2;
COMMIT;
```

Una implementación real debe distinguir quién insertó, esperar o responder `409/425` a una operación en progreso y devolver la respuesta registrada al completar. Define expiración según ventana de reintento sin borrar evidencia demasiado pronto.

Actualizar base y publicar evento en pasos independientes crea doble escritura. Transactional outbox guarda evento y tarea en la misma transacción. Un relay publica pendientes y puede caer antes de marcarlos; por eso entrega al menos una vez. El consumidor guarda `event_id` junto a su efecto en otra transacción y convierte duplicación en el mismo resultado observable.

“Exactly once” del broker suele cubrir una frontera limitada. La garantía útil es: para cada identificador aceptado, el invariante de negocio cambia una vez. Demuéstralo con requests paralelos, caída tras commit y reejecución del relay.

**Analogía:** una transferencia tiene número de operación. Si la pantalla se congela, consultar o repetir ese número recupera el resultado; crear otro número ordena una segunda transferencia.

**¿Por qué es importante?** porque timeout y reentrega son normales. Sin identidad y atomicidad, las técnicas de recuperación producen corrupción precisamente durante fallos.

**Casos de uso reales:** pagos, creación de pedidos, imports, consumo de colas, jobs reintentados, comandos móviles y publicación de eventos.

**Diagrama:**

```text
POST + key K -> transacción [dedupe K + tarea + outbox E]
                                      |
                                  relay publica E (quizá dos veces)
                                      |
                         consumidor [dedupe E + efecto]
```

### Tema 4: Webhooks verificables y recuperación por reconciliación

#### Paso 1 · Objetivo y preparación
Al finalizar podrás aplicar este concepto desde cero. Prerrequisitos: Node.js LTS, npm, TypeScript y un editor. Verifica node --version y npm --version.

#### Paso 2 · Contexto y caso real
En un caso real de una plataforma de entregas, esta técnica protege pedidos, pagos y notificaciones frente a datos inválidos o fallos de red. Define primero la entrada y el resultado que deben observarse.

#### Paso 3 · Teoría, modelo mental y analogía
El concepto separa una frontera externa de un dominio confiable. La analogía es una bodega: cada paquete se inspecciona antes de entrar y cada salida se registra. Considera seguridad, concurrencia, reintentos, compatibilidad y observabilidad; una prueba feliz no demuestra recuperación.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-node-m13
cd ejemplo-node-m13
npm init -y
npm install -D typescript tsx @types/node
mkdir src
```
Crea src/index.ts:
```ts
const input: unknown = { id: 'd-1', status: 'ready' };
if (typeof input !== 'object' || input === null) throw new Error('entrada inválida');
console.log({ ok: true, input });
```
El ejemplo valida la frontera, ejecuta el camino mínimo y deja una salida reproducible.

#### Paso 5 · Práctica guiada
Pista: ejecuta npx tsx src/index.ts, cambia la entrada para provocar un fallo deliberado, observa el diagnóstico y restáurala. Resultado esperado: aparece ok: true únicamente con datos válidos.

#### Paso 6 · Práctica independiente
Crea src/solution.ts para representar un pedido y añade una prueba válida, una inválida y una repetida. Explica qué invariante protege cada comprobación.

#### Paso 7 · Cierre y evidencia
Guarda código, comandos, salida y captura; como siguiente paso automatiza la prueba en CI. Errores comunes: usar any, confiar en un cast, no fijar dependencias, ocultar excepciones y no probar concurrencia. Fuentes oficiales: https://nodejs.org/en/learn/ y https://www.typescriptlang.org/docs/.

**¿Por qué es importante?** Porque convierte datos inciertos en decisiones verificables y evita fallos silenciosos en producción.
**Conceptos clave:** webhook, firma HMAC, secreto, timestamp, replay, payload crudo, delivery ID, retry, backoff, jitter, DLQ, circuit breaker, reconciliación y estado fuente.

Un webhook es una petición saliente que cruza otra organización y fallará. El receptor necesita comprobar autenticidad sobre los bytes exactos antes de parsear. Firma versión, timestamp y cuerpo con HMAC y compara en tiempo constante. Rechaza timestamps fuera de ventana y delivery IDs ya procesados.

```typescript
import { createHmac, timingSafeEqual } from 'node:crypto';

function validSignature(raw: Buffer, timestamp: string, receivedHex: string, secret: string) {
  const expected = createHmac('sha256', secret)
    .update(`v1.${timestamp}.`)
    .update(raw)
    .digest();
  const received = Buffer.from(receivedHex, 'hex');
  return received.length === expected.length && timingSafeEqual(received, expected);
}
```

No compares JSON reserializado: espacios y orden pueden cambiar. Rota secretos aceptando temporalmente versión actual y anterior; identifica la versión sin enviar el secreto. TLS sigue siendo obligatorio: la firma autentica contenido, no oculta datos.

El emisor registra cada delivery, respuesta y próximo intento. Reintenta errores transitorios y 429 respetando `Retry-After`, con backoff y jitter; no reintenta indefinidamente un 400. Limita concurrencia por destino para evitar amplificar una caída. El receptor responde rápido después de persistir y procesa en background de forma idempotente.

Los reintentos no bastan. Una tarea periódica de reconciliación compara la fuente de verdad con proyecciones o entregas y repara ausencias. Proporciona endpoint para consultar recurso y replay administrativo auditado. La DLQ requiere dueño, alerta y runbook; acumular eventos no es recuperación.

**Analogía:** la entrega certificada tiene sello verificable, número, intentos registrados y un libro maestro para comprobar después qué destinatarios no recibieron. El mensajero no improvisa una entrega infinita.

**¿Por qué es importante?** porque las integraciones viven fuera de tu despliegue y control. Una garantía profesional incluye autenticidad, duplicación, retraso, caída prolongada y reparación posterior.

**Casos de uso reales:** proveedor de pagos, GitHub webhooks, notificaciones de pedidos, sincronización CRM, callbacks de procesamiento y exportaciones.

**Diagrama:**

```text
outbox -> delivery persistido -> HTTP firmado -> receptor dedupe + ACK
              | fallo             |
              `-> retry/jitter ----´
reconciliador compara fuente/proyección -> replay auditado
```

## Revisión oficial de plataforma — julio de 2026

### Línea LTS, línea Current y APIs del runtime

Producción debe partir de **Node.js 24 LTS** mientras **Node.js 26** se evalúa como línea Current. Node 26 habilita `Temporal` por defecto y actualiza V8, Undici y deprecaciones; eso no justifica migrar sin probar dependencias, imágenes, rendimiento y observabilidad. Distingue API estable, experimental y retirada leyendo notas de la versión mayor y cada release de seguridad. El soporte nativo de TypeScript no reemplaza comprobación de tipos ni todas las transformaciones de un compilador.

**Aplicación al proyecto:** ejecuta contratos y benchmarks en una matriz 24/26, prueba fechas con Temporal, convierte deprecaciones en fallo controlado de CI y conserva Node 24 como runtime de despliegue hasta aprobar la evidencia.


## Laboratorio práctico

### Proyecto: API contractual con efectos recuperables

Evoluciona una vertical del proyecto final —crear tarea y notificarla— sin reescribir todo simultáneamente.

1. Activa `strict`, `noUncheckedIndexedAccess` y `exactOptionalPropertyTypes`. Elimina `any`, `@ts-ignore` y non-null assertions de la vertical.
2. Valida configuración y cada entrada externa como `unknown`. Separa schema HTTP, comando y entidad.
3. Escribe OpenAPI con éxito, validaciones, auth, rate limit y Problem Details.
4. Añade middleware o prueba que contraste requests y responses reales con el contrato.
5. Genera un cliente de prueba y conserva una prueba de consumidor en CI.
6. Implementa `Idempotency-Key` asociada a usuario, operación y hash de request.
7. Lanza 20 requests paralelos con la misma clave y demuestra una sola tarea y respuesta estable.
8. Escribe tarea y evento outbox en una transacción. Mata el relay después de publicar y antes de marcar; demuestra deduplicación.
9. Implementa delivery de webhook con cuerpo crudo, timestamp, firma versionada y secreto rotatable.
10. Simula 429, 400, timeout y caída de una hora; verifica política, límites y DLQ operable.
11. Crea reconciliador y replay administrativo con autorización y audit log.
12. Documenta invariantes, estados, secuencias, métricas y runbook de recuperación.

**Verificación:** CI ejecuta typecheck, lint, tests, contrato, migraciones y escenarios concurrentes. Conserva consultas que prueben unicidad, evento no perdido y efecto único. Otra persona debe reproducir fallos y recuperación desde un clon limpio sin credenciales reales.

**Errores comunes y soluciones**

- Usar `as Tipo` sobre `req.body`: parsea `unknown`; el cast no genera validación.
- Generar OpenAPI sin verificarlo: contrasta tráfico real en CI y rompe el build ante divergencia.
- Guardar clave después del efecto: clave, cambio y respuesta se coordinan en una transacción.
- Publicar directamente después del commit: registra outbox dentro del commit y publica recuperablemente.
- Firmar JSON reserializado: conserva bytes crudos y orden canónico de componentes firmados.
- Reintentar cada 4xx: clasifica permanente, rate limit y transitorio; respeta presupuesto.
- DLQ sin procedimiento: alerta, inspecciona, corrige y reproduce con auditoría.




## Ampliación: contratos con OpenAPI

### Tema 5: OpenAPI como contrato ejecutable

#### Paso 1 · Objetivo y preparación
Al finalizar podrás validar un contrato OpenAPI desde cero. Prerrequisitos: Node.js LTS, npm y un editor.

#### Paso 2 · Contexto y caso real
En un caso real, una aplicación móvil y un socio externo deben interpretar la misma respuesta de entregas sin romperse entre despliegues.

#### Paso 3 · Teoría, modelo mental y analogía
OpenAPI es un contrato ejecutable: describe entradas, salidas y errores para personas, validadores y clientes. La analogía es un plano firmado que el inspector compara con el edificio.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-node-m13-t5 && cd ejemplo-node-m13-t5
npm init -y
npm install -D @redocly/cli
mkdir src
```
Crea `src/openapi.yaml` con una operación GET y ejecuta `npx redocly lint src/openapi.yaml`.

#### Paso 5 · Práctica guiada
Pista: elimina un campo requerido para provocar un fallo deliberado, lee el diagnóstico y restáuralo. Resultado esperado: el lint termina sin errores.

#### Paso 6 · Práctica independiente
Añade POST, respuesta Problem Details y un ejemplo de consumidor; comprueba compatibilidad al agregar un campo opcional.

#### Paso 7 · Cierre y evidencia
Conserva el contrato, el log y una captura; como siguiente paso conecta el lint al CI. Errores comunes: documentación desactualizada, tipos incompatibles, omitir errores y cambiar campos sin deprecación. Fuentes oficiales: https://spec.openapis.org/oas/latest.html y https://redocly.com/docs/cli/.

**Objetivo:** describir la API de entregas de RutaFlow en OpenAPI y comprobar automáticamente que ejemplos, solicitudes y respuestas coinciden con la implementación.

**¿Por qué es importante?** Una documentación escrita a mano envejece cuando cambia el código. OpenAPI modela operaciones, parámetros, cuerpos, respuestas y errores en un formato que pueden usar personas y herramientas. El archivo solo se vuelve confiable cuando CI lo valida y las pruebas comparan el contrato con tráfico real.

**Contexto RutaFlow:** web, Flutter y socios externos consumen `POST /deliveries`. Cambiar silenciosamente `trackingCode` por `tracking_code` puede romper varios clientes. Un contrato versionado permite discutir compatibilidad antes de desplegar.

**Analogía:** OpenAPI es el plano firmado de un edificio. Swagger UI es una vista cómoda del plano, pero el inspector —lint y contract tests— verifica que la construcción real lo respete.

**Conceptos clave**

| Concepto | Función | Riesgo si se omite |
|---|---|---|
| `operationId` | Identidad estable para una operación | SDKs difíciles de mantener |
| `schema` | Forma y restricciones de los datos | Clientes interpretan respuestas de forma distinta |
| respuestas de error | Contrato de fallos esperados | Cada consumidor improvisa |
| compatibilidad | Evolución sin retirar campos requeridos | Rupturas en producción |

**Demostración guiada:** crea `rutaflow-api/packages/api/openapi.yaml`.

```yaml
openapi: 3.1.0
info:
  title: RutaFlow Delivery API
  version: 1.0.0
paths:
  /deliveries/{id}:
    get:
      operationId: getDelivery
      parameters:
        - in: path
          name: id
          required: true
          schema: { type: string, format: uuid }
      responses:
        '200':
          description: Entrega encontrada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Delivery'
        '404':
          description: Entrega inexistente
components:
  schemas:
    Delivery:
      type: object
      additionalProperties: false
      required: [id, trackingCode, status]
      properties:
        id: { type: string, format: uuid }
        trackingCode: { type: string, minLength: 6 }
        status:
          type: string
          enum: [created, assigned, in_transit, delivered]
```

Valida desde `rutaflow-api/packages/api`:

```bash
npx @redocly/cli lint openapi.yaml
npm test -- contract
```

**Resultado esperado:** el lint termina sin errores y la prueba confirma un `200` válido y un `404` documentado. Si la API devuelve una propiedad interna no permitida o elimina `trackingCode`, el contract test debe fallar antes del despliegue.

**Práctica guiada:** añade un ejemplo de respuesta y un test con Supertest que valide el JSON real contra `Delivery`. Rompe intencionalmente el nombre de una propiedad, observa el fallo y restáuralo.

**Pista:** TypeScript comprueba código en compilación, pero el JSON recibido por red sigue siendo `unknown`. Usa un validador compatible con JSON Schema en la frontera.

**Práctica independiente:** documenta `POST /deliveries`, incluidos `400`, `409` y la cabecera `Idempotency-Key`. Clasifica un cambio compatible y uno incompatible, y agrega una regla de CI que impida el segundo sin una nueva versión.

**Errores comunes**

1. Publicar Swagger UI sin validar el documento ni la implementación.
2. Documentar solo respuestas exitosas y dejar los errores a interpretación del cliente.
3. Confundir tipos TypeScript con validación de datos externos.
4. Exponer columnas internas porque el esquema usa directamente la entidad de persistencia.

**Cierre:** el contrato ya es documentación, prueba y frontera de colaboración. El siguiente paso combina OpenAPI, idempotencia y outbox para evolucionar integraciones sin duplicar efectos. Recurso oficial: [OpenAPI Specification 3.1](https://spec.openapis.org/oas/v3.1.0.html).

<!-- OFFICIAL-TOPIC-ATLAS:START -->
## Atlas completo de temas oficiales

Derivado de la [documentación oficial](https://nodejs.org/api/), sus referencias, migraciones y guías de operación. Inventariar no equivale a dominar: cada selección se demuestra con código, prueba, medición y explicación. **Cobertura: 46 temas.**

| Área | Temas que deben poder explicarse y aplicarse | Evidencia práctica |
|---|---|---|
| Runtime | `event loop` · `timers` · `microtasks` · `EventEmitter` · `buffers` · `streams` · `backpressure` · `ESM y CommonJS` | API |
| Sistema | `filesystem` · `paths y URLs` · `procesos` · `señales` · `child_process` · `worker_threads` · `cluster` · `permission model` | API |
| Red | `HTTP/HTTPS` · `HTTP/2` · `DNS` · `TCP/UDP` · `TLS` · `proxies` · `timeouts` · `Web APIs compatibles` | API |
| Datos | `SQLite` · `serialización` · `compresión` · `crypto` · `blobs` · `variables de entorno` · `configuración validada` | API |
| Calidad | `node:test` · `mocks` · `coverage` · `benchmarks` · `diagnostics_channel` · `AsyncLocalStorage` · `inspector` · `heap snapshots` | API |
| Producción | `TypeScript` · `package exports` · `semver` · `seguridad de dependencias` · `graceful shutdown` · `observabilidad` · `idempotencia` | API |

### Método de estudio y proyecto de ampliación

Para cada tema responde qué problema resuelve, cuál es su modelo mental, cómo falla, cómo se verifica y cuándo no conviene. Elige uno por área e intégralos en un proyecto propio de ampliación. Entrega diagrama, ADR, pruebas de éxito y fallo, una medición, una amenaza y el enlace oficial con versión y fecha. Una API preview se aísla en laboratorio y nunca se presenta como base estable.
<!-- OFFICIAL-TOPIC-ATLAS:END -->

