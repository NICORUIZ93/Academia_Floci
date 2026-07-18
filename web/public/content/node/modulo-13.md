# Módulo 13: TypeScript, contratos e integraciones confiables

Una API puede compilar, pasar pruebas y aun romper consumidores o duplicar cobros. La red entrega bytes, no objetos TypeScript; los clientes reintentan cuando desconocen el resultado; una publicación puede separarse accidentalmente del cambio en base. Este módulo convierte esas incertidumbres en contratos e invariantes comprobables.

## Sílabo

1. TypeScript estricto y validación en fronteras.
2. OpenAPI, compatibilidad y pruebas de contrato.
3. Idempotencia, concurrencia y transactional outbox.
4. Webhooks firmados, entrega repetida y reconciliación.
5. Proyecto: evolución confiable de la API integradora.

## Comienza desde cero: prepara este capítulo

Este recorrido parte de una carpeta vacía. Al finalizar tendrás **Un incremento pequeño, probado y reproducible del capítulo.** No avances ejecutando comandos que no comprendes: primero identifica la entrada, la transformación y la evidencia que comprobará el resultado.

### 1. Comprueba las herramientas

Los comandos funcionan en macOS, Linux y WSL. En PowerShell usa el equivalente indicado por la herramienta.

```bash
node --version
npm --version
git --version
```

Si un comando no existe, detente e instala esa herramienta desde su sitio oficial. Cierra y abre la terminal después de modificar `PATH`. Las versiones deben ser compatibles entre sí antes de crear archivos.

### 2. Crea o recupera el proyecto del track

```bash
mkdir -p academia-labs/node-api/src
cd academia-labs/node-api
npm init -y
npm install fastify
npm install -D typescript tsx @types/node
git init
```

Trabaja dentro de `academia-labs/node-api`. Si ya existe, no lo vuelvas a generar: entra en la carpeta, confirma `git status` y continúa sobre una rama propia.

### 3. Ubica cada tema antes de escribir

```text
academia-labs/node-api/
├─ src/
│  └─ module-13/
├─ tests/
├─ docs/decisions/
├─ evidence/module-13/
└─ README.md
```

| Tema | Archivo o decisión | Evidencia mínima |
|---|---|---|
| 1. Tipos estáticos dentro, datos desconocidos en la frontera | `src/module-13/topic-1-tipos-estaticos-dentro-datos-desconocidos-en-la-fronte.ts` | prueba + salida observable |
| 2. Un contrato HTTP es comportamiento, no solo documentación | `src/module-13/topic-2-un-contrato-http-es-comportamiento-no-solo-documentaci.ts` | prueba + salida observable |
| 3. Reintentar sin duplicar el efecto | `src/module-13/topic-3-reintentar-sin-duplicar-el-efecto.ts` | prueba + salida observable |
| 4. Webhooks verificables y recuperación por reconciliación | `src/module-13/topic-4-webhooks-verificables-y-recuperacion-por-reconciliacio.ts` | prueba + salida observable |

Un ejemplo técnico vive en el archivo indicado y debe tener una prueba. Un tema conceptual vive en `docs/decisions/`: compara opciones usando restricciones medibles; no escribas código decorativo solo para llenar espacio.

### 4. Ejecuta una línea base

Desde `academia-labs/node-api`:

```bash
npm test && npm run dev
```

**Resultado esperado:** el comando reconoce el proyecto y termina sin errores antes de introducir el cambio del capítulo. Después del incremento, la evidencia debe demostrar: **Un incremento pequeño, probado y reproducible del capítulo.**

Si falla la línea base, no continúes. Localiza el primer mensaje que indique archivo, línea o dependencia; formula una causa y compruébala con un cambio pequeño.

### 5. Provoca un fallo y recupérate

Envía una entrada inválida o desconecta una dependencia; verifica estado HTTP, cuerpo y log con contexto. Guarda en `evidence/module-13/` el comando, la salida relevante, tu hipótesis y la corrección. Revierte únicamente el cambio deliberado; no borres todo el proyecto para ocultar la causa.

### 6. Conecta el capítulo con RutaFlow

Aplica el aprendizaje de **TypeScript, contratos e integraciones confiables** a un incremento vertical de RutaFlow. Define qué componente produce el dato, qué contrato lo transporta, quién lo consume y cómo observarás un fallo. La entrega final incluye archivo o decisión, prueba, salida, error corregido y una limitación que todavía validarías en producción.

---

## Contenido teórico

### Tema 1: Tipos estáticos dentro, datos desconocidos en la frontera

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

## Ejercicios de evaluación

### Ejercicio 1: ilusión de tipos

¿Por qué `const body = req.body as User` puede compilar y fallar con `body.email.toLowerCase()`?

<details><summary>Solución razonada</summary>

El cast solo cambia la visión del compilador. El cliente puede omitir email o enviar número. Se necesita un parser runtime que produzca `User` únicamente tras comprobar estructura y restricciones.
</details>

### Ejercicio 2: carrera de idempotencia

Dos requests hacen `SELECT key`, no encuentran y crean. ¿Qué propiedad falta?

<details><summary>Solución razonada</summary>

La decisión no es atómica. Una restricción única decide un ganador y la transacción coordina registro, efecto y respuesta. El perdedor observa estado en progreso o completado sin repetir el caso de uso.
</details>

### Ejercicio 3: webhook duplicado

El receptor completó pero perdió su `200`. Describe el comportamiento de ambas partes.

<details><summary>Solución razonada</summary>

El emisor reintenta el mismo delivery ID con firma nueva según timestamp. El receptor verifica firma, reconoce ID ya procesado y devuelve éxito sin repetir efecto. La reconciliación confirma convergencia si persiste duda.
</details>

## Rúbrica del proyecto

| Criterio | Inicial | Competente | Experto |
|---|---|---|---|
| Tipos y fronteras | Casts y any | strict y schemas runtime | Dominio exhaustivo sin acoplamiento a transporte/ORM |
| Contrato | Documento manual | OpenAPI verificado | Compatibilidad y consumidores comprobados en CI |
| Idempotencia | Check-then-act | Clave y unicidad transaccional | Concurrencia, respuesta y expiración justificadas |
| Publicación | Doble escritura | Outbox y dedupe | Caídas críticas e invariantes demostrados |
| Webhooks | POST sin autenticidad | Firma, retries y registros | Rotación, reconciliación, replay y runbook auditados |

## Bibliografía y fundamento académico

- TypeScript Handbook y Node.js Documentation, fuentes oficiales del lenguaje y runtime.
- OpenAPI Specification y RFC 9457, *Problem Details for HTTP APIs*.
- Kleppmann, *Designing Data-Intensive Applications*: transacciones, entrega y sistemas derivados.
- Richardson, *Microservices Patterns*: transactional outbox, consumidores idempotentes y sagas.
- OWASP REST Security y Webhook Security Guidelines aplicables; documentación criptográfica de Node.
- CS2023: Software Development Fundamentals, Software Engineering, Security y Parallel and Distributed Computing.
- SWEBOK V4: Construction, Architecture, Testing, Security, Quality y Engineering Operations.

Los resultados observables son rechazar datos malformados antes del dominio, detectar divergencia de contrato, conservar un efecto ante duplicación concurrente y recuperar una entrega firmada después de una caída.

<!-- OFFICIAL-TOPIC-ATLAS:START -->
## Atlas completo de temas oficiales

Derivado de la [documentación oficial](https://nodejs.org/api/), sus referencias, migraciones y guías de operación. Inventariar no equivale a dominar: cada selección se demuestra con código, prueba, medición y explicación. **Cobertura: 46 temas.**

| Área | Temas que deben poder explicarse y aplicarse | Evidencia práctica |
|---|---|---|
| Runtime | `event loop` · `timers` · `microtasks` · `EventEmitter` · `buffers` · `streams` · `backpressure` · `ESM y CommonJS` | API RutaFlow |
| Sistema | `filesystem` · `paths y URLs` · `procesos` · `señales` · `child_process` · `worker_threads` · `cluster` · `permission model` | API RutaFlow |
| Red | `HTTP/HTTPS` · `HTTP/2` · `DNS` · `TCP/UDP` · `TLS` · `proxies` · `timeouts` · `Web APIs compatibles` | API RutaFlow |
| Datos | `SQLite` · `serialización` · `compresión` · `crypto` · `blobs` · `variables de entorno` · `configuración validada` | API RutaFlow |
| Calidad | `node:test` · `mocks` · `coverage` · `benchmarks` · `diagnostics_channel` · `AsyncLocalStorage` · `inspector` · `heap snapshots` | API RutaFlow |
| Producción | `TypeScript` · `package exports` · `semver` · `seguridad de dependencias` · `graceful shutdown` · `observabilidad` · `idempotencia` | API RutaFlow |

### Método de estudio y proyecto de ampliación

Para cada tema responde qué problema resuelve, cuál es su modelo mental, cómo falla, cómo se verifica y cuándo no conviene. Elige uno por área e intégralos en una vertical RutaFlow. Entrega diagrama, ADR, pruebas de éxito y fallo, una medición, una amenaza y el enlace oficial con versión y fecha. Una API preview se aísla en laboratorio y nunca se presenta como base estable.
<!-- OFFICIAL-TOPIC-ATLAS:END -->

## Resumen del módulo

- TypeScript protege código compilado; datos externos siguen siendo `unknown` hasta validarse.
- OpenAPI aporta valor cuando se contrasta con proveedor y expectativas de consumidores.
- Una clave de idempotencia conserva identidad a través de un resultado remoto ambiguo.
- Restricciones y transacciones evitan carreras que un `SELECT` previo no evita.
- Outbox convierte doble escritura en publicación recuperable con duplicados seguros.
- Webhooks requieren firma sobre bytes, deduplicación, reintentos limitados y reconciliación.
