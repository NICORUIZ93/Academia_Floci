# Curso interactivo de Floci: de cero a experto

Este es el recorrido principal. La [guía completa](guia-completa.md) funciona
como manual de consulta, no como una lista para copiar. Aquí debes producir las
respuestas, comandos, scripts y código.

## Cómo vas a aprender

Cada lección usa el ciclo **LEE - PREDICE - HAZ - OBSERVA - EXPLICA - REPITE**:

1. **Lee** solamente los conceptos indicados.
2. **Predice** qué respuesta o cambio de estado esperas.
3. **Haz** el reto sin copiar una solución completa.
4. **Observa** salida, logs, archivos y estado.
5. **Explica** por qué ocurrió en tu cuaderno.
6. **Repite** desde cero sin mirar tus comandos.

No se considera aprendido si funciona pero no puedes explicar por qué.

## Política de ayuda

Cuando te bloquees:

1. Lee el error completo.
2. Consulta `--help` del comando.
3. Revisa logs de Floci.
4. Busca el concepto en `guia-completa.md`.
5. Consulta la documentación oficial del servicio.
6. Escribe una hipótesis y prueba una sola modificación.
7. Solo después revisa `examples/` o pide una pista, no la solución.

Tiempo mínimo antes de mirar una referencia: 30 minutos. Un bloqueo documentado
también es aprendizaje.

## Proyecto transversal: Tareas Locales

Construirás una aplicación mínima para crear y completar tareas. Comienza con
una cola y una tabla; termina como una plataforma local observable, orientada a
eventos, desplegable y comprobable.

Objeto principal:

```json
{
  "id": "T-001",
  "titulo": "Estudiar SQS",
  "estado": "PENDIENTE",
  "usuarioId": "U-001",
  "creadaEn": "fecha ISO-8601"
}
```

Reglas:

- Tú eliges Python, Node.js, Java o Go y mantienes el mismo lenguaje.
- Todo endpoint, región y credencial se configura fuera del código.
- Cada recurso se puede recrear mediante un script escrito por ti.
- Cada módulo agrega una capacidad demostrable.
- Nunca uses credenciales AWS reales.
- Mantén `notas/decisiones.md` con decisiones y diferencias frente a AWS.

## Evaluación de cada módulo

Avanza solamente si cumples los cuatro criterios:

- **Construcción:** el reto funciona desde un entorno limpio.
- **Comprensión:** respondes las preguntas sin mirar.
- **Diagnóstico:** puedes provocar y explicar al menos un fallo.
- **Evidencia:** conservas comando, código o prueba y resultado.

## Módulo 0: diagnóstico inicial

**Meta:** saber qué conoces antes de estudiar.

Sin consultar la guía, escribe en `cuaderno-progreso.md`:

1. Qué es un endpoint.
2. Qué diferencia hay entre una imagen y un contenedor.
3. Qué hacen access key, secret key, región y ARN.
4. Qué diferencia hay entre cola, topic, stream y event bus.
5. Qué diferencia hay entre persistencia y memoria.

**Reto:** dibuja cómo crees que una aplicación habla con AWS y luego cómo
hablará con Floci. No corrijas el dibujo todavía.

## Módulo 1: Docker, Floci, endpoint y STS

**Lee:** guía, secciones 1, 4, 5 y 6.

Debes comprender: proceso, puerto, endpoint, región, credenciales ficticias,
plano de control y estado de salud.

**Reto obligatorio:**

1. Inicia Floci con Compose.
2. Comprueba el contenedor sin usar una interfaz gráfica.
3. Configura AWS CLI en tu terminal.
4. Obtén la identidad local con STS.
5. Detén y vuelve a iniciar el servicio.
6. Ejecuta una llamada apuntando deliberadamente a un puerto incorrecto.
7. Explica la diferencia entre error de conexión y error AWS.

**No copies:** descubre los comandos con `docker compose --help`, `docker
compose ps`, `docker compose logs` y `aws sts help`.

**Puerta de salida:** puedes señalar exactamente dónde se cambia el endpoint y
demostrar que ninguna llamada fue a AWS real.

## Módulo 2: S3 y almacenamiento de objetos

**Lee:** ficha S3 y conceptos de bucket, key, body, metadata, versionado,
multipart, path-style y S3 Select.

**Construye:** el bucket `tareas-archivos-<tus-iniciales>`.

Retos:

1. Sube un archivo de texto creado por ti.
2. Lista objetos por prefijo.
3. Descarga y compara el contenido byte por byte.
4. Agrega metadata y tags.
5. Activa versionado y sube dos versiones de la misma key.
6. Recupera la versión anterior.
7. Sube un CSV de tareas y consulta solo las pendientes con S3 Select.
8. Provoca un error usando un bucket inexistente.

**Implementación del proyecto:** guarda adjuntos de cada tarea con una key que
permita encontrarlos sin escanear todo el bucket.

**Preguntas:** ¿bucket y carpeta son lo mismo? ¿Qué hace única a una key? ¿Qué
parte probarías otra vez en AWS real?

## Módulo 3: SQS y trabajo asíncrono

**Lee:** standard, FIFO, visibility timeout, receipt handle, long polling, DLQ,
reintento e idempotencia.

Retos:

1. Crea una cola estándar y envía tres tareas.
2. Recibe sin borrar y observa la invisibilidad temporal.
3. Borra usando el receipt handle correcto.
4. Configura long polling.
5. Crea una cola FIFO y demuestra deduplicación.
6. Configura una DLQ con pocos intentos.
7. Escribe un consumidor que falle a propósito hasta mover un mensaje a DLQ.
8. Reprocesa el mensaje de forma controlada.

**Proyecto:** `tareas-procesar` recibe el ID, no todo el objeto. El consumidor
debe tolerar el mismo mensaje dos veces.

**Fallo obligatorio:** intenta borrar con un receipt handle vencido y explica el
resultado.

## Módulo 4: DynamoDB y Streams

**Lee:** item, tipos, partition key, sort key, Query, Scan, GSI, condition
expression, TTL y Streams.

Retos:

1. Diseña la tabla en papel antes de crearla.
2. Inserta diez tareas de dos usuarios.
3. Consulta tareas de un usuario sin `Scan`.
4. Actualiza estado con una condición que evite sobrescritura accidental.
5. Diseña un GSI para consultar por estado.
6. Habilita TTL en datos temporales.
7. Habilita Streams y observa cambios.
8. Exporta a S3 si la versión soporta tu flujo.

**Proyecto:** tabla `Tareas` con acceso eficiente por usuario y estado.

**Puerta de salida:** justificas tus claves usando patrones de acceso, no
imitando una base relacional.

## Módulo 5: escribe tu primer cliente SDK

**Lee:** guía, sección 7. Elige un lenguaje y no abras `examples/`.

Implementa desde un archivo vacío:

1. Configuración externa de endpoint, región y credenciales.
2. Crear una tarea en DynamoDB.
3. Enviar su ID a SQS.
4. Adjuntar un archivo en S3.
5. Manejar errores sin ocultarlos.
6. Cerrar o reutilizar clientes correctamente.

**Restricción:** ninguna URL ni credencial dentro de la lógica de negocio.

**Prueba manual:** cambia el endpoint a uno inválido y confirma que tu mensaje
de error permite diagnosticarlo.

## Módulo 6: SSM, Secrets Manager, KMS, IAM, STS y Cognito

**Lee:** diferencia entre configuración, secreto, cifrado, identidad,
autenticación y autorización.

Misiones:

1. **SSM:** guarda `/tareas/limite-diario` y léelo desde tu aplicación.
2. **Secrets Manager:** guarda un JSON ficticio de integración y rota versión.
3. **KMS:** crea clave y alias; practica encrypt/decrypt y envelope encryption.
4. **IAM:** crea rol y política mínima; activa enforcement solo cuando entiendas
   cómo recuperar acceso.
5. **STS:** asume el rol y compara la identidad.
6. **Cognito:** crea pool, cliente, usuario, grupo y autentica para obtener JWT.
7. **ACM:** solicita y exporta un certificado local.
8. **AWS Config:** registra una regla y examina su plano de control.
9. **Tagging API:** encuentra recursos del proyecto mediante tags comunes.

**Proyecto:** configuración no sensible en SSM, secreto ficticio en Secrets
Manager, cifrado con KMS y usuarios de la API en Cognito.

**Explica:** por qué cifrar un secreto no reemplaza controlar quién puede leerlo.

## Módulo 7: SNS, EventBridge, Scheduler, Kinesis y Firehose

**Lee:** fan-out, routing por contenido, programación, stream ordenado,
partition key y entrega por lotes.

Misiones:

1. **SNS:** publica `tarea.completada` hacia dos colas.
2. **EventBridge:** enruta eventos por `detail-type` y contenido.
3. **Scheduler:** crea una tarea programada con retry y DLQ.
4. **Kinesis:** publica eventos con dos partition keys y consume shards.
5. **Firehose:** entrega un lote a S3.
6. **MSK:** crea cluster, topic, productor y consumidor con grupo.

**Proyecto:** EventBridge es el bus de dominio; SNS notifica; Scheduler genera
recordatorios; Kinesis o MSK conserva actividad; Firehose archiva en S3.

**Decisión escrita:** cuándo elegirías SQS, SNS, EventBridge, Kinesis o Kafka.

## Módulo 8: Lambda, API Gateway y CloudWatch

**Lee:** handler, evento, contexto, paquete, imagen, variable, timeout, warm
container, integración, deployment, stage, logs y métricas.

Retos:

1. Escribe una Lambda mínima sin plantilla resuelta.
2. Empaqueta y crea la función.
3. Invócala directamente con un evento válido e inválido.
4. Crea `POST /tareas` en API Gateway v1 o v2.
5. Integra, despliega y llama la API.
6. Registra correlation ID y error sin registrar secretos.
7. Publica una métrica de tareas creadas y crea una alarma.
8. Prueba recarga de código por S3 o bind mount.

**Proyecto:** la API valida, persiste, publica evento y devuelve respuesta HTTP
coherente.

**Fallo obligatorio:** rompe el nombre de tabla y encuentra la causa usando solo
respuesta, logs y configuración.

## Módulo 9: Step Functions, Pipes, AppConfig y AppSync

Misiones:

1. **Step Functions:** flujo `validar -> guardar -> notificar` con camino de
   error y consulta del historial.
2. **Pipes:** conecta SQS con Lambda; practica start, stop y update.
3. **AppConfig:** publica una bandera `recordatoriosHabilitados` y recupérala por
   AppConfigData.
4. **AppSync:** crea API, schema, data source y resolver; documenta qué parte del
   data plane puedes verificar en Floci.

**Proyecto:** la bandera controla recordatorios y el workflow coordina la tarea.

## Módulo 10: persistencia, TLS, cuentas, hooks y límites

Retos:

1. Crea datos, reinicia y comprueba persistencia.
2. Cambia a memoria y demuestra la diferencia.
3. Configura dos cuentas locales y prueba aislamiento con el mismo nombre.
4. Activa HTTPS y configura tu cliente para confiar en el certificado.
5. Escribe un hook idempotente que cree recursos mínimos.
6. Configura un servicio deshabilitado y reconoce el error.
7. Ajusta logs y un límite de servicio.
8. Explica qué puertos son proxy y cuáles pertenecen a contenedores laterales.

Ahora sí puedes comparar tu hook con `examples/init/ready.d/10-seed.sh`.

## Módulo 11: CloudFormation, Testcontainers y CI

Retos:

1. **CloudFormation:** expresa una parte del proyecto en template, valida, crea,
   actualiza con change set y elimina.
2. **Testcontainers:** inicia Floci desde una prueba, crea recursos y verifica un
   caso de éxito y uno de fallo.
3. **CI:** ejecuta la prueba en un pipeline con imagen fijada y healthcheck.
4. Guarda logs de Floci cuando falle.
5. Demuestra que dos ejecuciones no comparten estado accidentalmente.

**Restricción:** nada de `sleep 20`; espera una condición observable.

## Módulo 12: bases de datos y búsqueda reales

Estos servicios pueden iniciar contenedores adicionales. Vigila memoria,
puertos, volúmenes y socket Docker.

Misiones:

1. **RDS:** crea PostgreSQL o MySQL, conecta, migra una tabla y persiste datos.
2. **ElastiCache:** crea Valkey/Redis, cachea una tarea y prueba expiración.
3. **Neptune:** crea cluster, agrega vértices y consulta una relación.
4. **OpenSearch:** compara modo mock y real; indexa y busca una tarea.
5. **AWS Backup:** crea vault, plan, selección y observa el job simulado.

**Proyecto:** RDS conserva auditoría relacional, caché acelera lecturas,
OpenSearch permite búsqueda de texto y Neptune relaciona usuarios y etiquetas.

## Módulo 13: contenedores, cómputo y red

Misiones:

1. **ECR:** crea repositorio, login, push y pull de una imagen tuya.
2. **ECS:** registra task definition y ejecuta tarea; compara mock y real.
3. **EKS:** crea cluster k3s, usa `kubectl` y despliega un pod.
4. **EC2:** crea VPC, subnet, security group, key pair e instancia mapeada a una
   imagen; consulta IMDS.
5. **ELB v2:** crea target group, listener y regla por path.
6. **Auto Scaling:** cambia desired capacity y observa reconciliación.
7. **CloudFront:** crea distribución S3 e invalidación.
8. **Route53:** crea zona y registros; explica por qué no implica DNS real.
9. **Transfer Family:** crea servidor, usuario y clave; separa control plane de
   transferencia real.

**Proyecto:** empaqueta el worker, publícalo en ECR y ejecútalo en una de las
plataformas. Las demás misiones son laboratorios comparativos obligatorios.

## Módulo 14: entrega de software

Misiones:

1. **CodeBuild:** proyecto con buildspec y artefacto en S3.
2. **CodeDeploy:** despliegue Lambda y recorrido ECS blue/green.
3. Compara CloudFormation, CodeBuild y CodeDeploy: qué crea, qué compila y qué
   despliega cada uno.

## Módulo 15: datos, documentos, IA y costos

Misiones:

1. **Glue:** catálogo, tabla JSON o Parquet y Schema Registry.
2. **Athena:** consulta datos del proyecto en S3 y recupera resultados.
3. **Textract:** sync y async; demuestra que pruebas contrato, no OCR real.
4. **Transcribe:** crea y consulta job; demuestra que no transcribe audio real.
5. **Bedrock Runtime:** invoca respuesta stub y maneja una capacidad no
   implementada.
6. **Pricing:** filtra productos de la instantánea local.
7. **Cost Explorer:** genera consulta y explica por qué el costo es sintético.
8. **CUR:** emite reporte Parquet y léelo con DuckDB o PyArrow.
9. **BCM Data Exports:** define, ejecuta y consume un export.
10. **SES y SES v2:** verifica identidad, envía texto y MIME, e inspecciona el
    correo capturado sin enviarlo a Internet.

**Proyecto:** Athena genera reporte de tareas; SES produce un resumen; costos e
IA quedan como adaptadores simulados con sus limitaciones documentadas.

## Módulo 16: proyecto final completo

Debes reconstruir Tareas Locales sin seguir una receta línea por línea.

### Entrega funcional mínima

- API autenticada para crear, consultar y completar tareas.
- DynamoDB como estado principal y S3 para adjuntos.
- SQS con consumidor idempotente y DLQ.
- EventBridge y SNS para eventos y notificaciones.
- Scheduler para recordatorios.
- Step Functions para un flujo con éxito y fallo.
- SSM, Secrets Manager y KMS.
- Lambda, API Gateway, logs, métrica y alarma.
- Infraestructura reproducible y pruebas con Testcontainers.
- Pipeline CI.
- Reporte Glue/Athena y correo SES capturado.

### Laboratorios de cobertura

Los servicios que no encajan naturalmente en una aplicación pequeña deben
estar en `laboratorios/<servicio>/` con README, script propio, prueba y limpieza.
Esto incluye RDS, ElastiCache, Neptune, OpenSearch, MSK, ECR, ECS, EKS, EC2,
ELB, Auto Scaling, CloudFront, Route53, Transfer, AppSync, CodeBuild,
CodeDeploy, Backup, Textract, Transcribe, Bedrock y servicios de costos.

No fuerces 52 servicios dentro de una arquitectura absurda. Debes implementar y
comprender cada uno, pero también aprender a decidir cuándo **no** usarlo.

### Definición de terminado

1. Una orden limpia crea el entorno.
2. Una orden ejecuta pruebas.
3. Una orden limpia recursos.
4. El flujo principal funciona dos veces sin duplicar efectos.
5. Un fallo termina en DLQ y se puede reprocesar.
6. Los secretos no aparecen en código ni logs.
7. Puedes señalar cada parte simulada y cada contenedor real.
8. Puedes reconstruir el núcleo sin IA ni soluciones.

## Módulo 17: examen final sin guía

En un directorio vacío y con límite de 120 minutos:

1. Inicia Floci.
2. Crea S3, SQS con DLQ y DynamoDB.
3. Escribe un programa pequeño que guarde, encole y adjunte.
4. Agrega una prueba automatizada.
5. Provoca un fallo y diagnostícalo.
6. Limpia todo.

Después responde oralmente o por escrito:

- ¿Qué probó Floci y qué queda pendiente contra AWS?
- ¿Qué servicio garantiza entrega y cuál enruta eventos?
- ¿Dónde existe estado y cómo se recupera?
- ¿Qué recurso usarías para configuración, secreto y cifrado?
- ¿Qué cambia dentro de Docker respecto a `localhost`?
- ¿Cuándo usarías mock y cuándo un motor real?

Apruebas cuando puedes repetirlo otro día sin mirar tus comandos anteriores.

## Mapa completo de cobertura

Usa esta lista para confirmar que ningún tema quedó fuera:

- Identidad y configuración: SSM, Secrets Manager, IAM, STS, KMS, Cognito, ACM,
  AWS Config y Resource Groups Tagging API.
- Almacenamiento y datos: S3, DynamoDB/Streams, RDS, ElastiCache, Neptune,
  OpenSearch y Backup.
- Mensajería: SQS, SNS, EventBridge, Scheduler, Pipes, Kinesis, Firehose y MSK.
- Cómputo y red: Lambda, API Gateway v1/v2, ECR, ECS, EKS, EC2, ELB v2,
  Auto Scaling, CloudFront, Route53 y Transfer Family.
- Orquestación y DevOps: CloudFormation, Step Functions, AppConfig/Data,
  AppSync, CodeBuild y CodeDeploy.
- Analítica e IA: Glue, Athena, Textract, Transcribe y Bedrock Runtime.
- Costos: Pricing, Cost Explorer, CUR y BCM Data Exports.
- Correo: SES y SES v2.
- Plataforma: Docker, imágenes, puertos, almacenamiento, TLS, hooks, cuentas,
  `application.yml`, migración de LocalStack, Testcontainers, CI, CLI y UI.
