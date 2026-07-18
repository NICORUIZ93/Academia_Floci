# Módulo 27: APIs GraphQL con AppSync y correo transaccional con SES

## Sílabo

**Objetivo general**

Sumar dos superficies de comunicación distintas a tu caja de herramientas: AppSync para exponer una API GraphQL gestionada con resolvers conectados a tus propios datos, y SES para enviar y probar correo transaccional de forma determinista, incluyendo el simulador de eventos de entrega, rebote y queja que AWS provee para pruebas sin enviar correo real.

**Objetivos específicos**

1. Crear una API GraphQL con AppSync, definir un esquema y un resolver básico.
2. Explicar el modelo de eliminación en cascada de AppSync y por qué existe.
3. Verificar una identidad de correo en SES y enviar un email de prueba.
4. Usar las direcciones del simulador de buzones de correo para probar de forma determinista los flujos de entrega, rebote y queja de tu aplicación.

**Contenido**

- AppSync: APIs GraphQL, esquemas, fuentes de datos y resolvers.
- Claves API y control de acceso en AppSync.
- SES: identidades, envío de correo, plantillas.
- El simulador de buzones de correo y el punto de inspección local.

**Evaluación**

Dos laboratorios prácticos (una API GraphQL básica con AppSync, y pruebas de entrega/rebote con el simulador de SES) y tres ejercicios de evaluación.

---

## Comienza desde cero: prepara este capítulo

Este recorrido parte de una carpeta vacía. Al finalizar tendrás **Dos laboratorios prácticos (una API GraphQL básica con AppSync, y pruebas de entrega/rebote con el simulador de SES) y tres ejercicios de evaluación.** No avances ejecutando comandos que no comprendes: primero identifica la entrada, la transformación y la evidencia que comprobará el resultado.

### 1. Comprueba las herramientas

Los comandos funcionan en macOS, Linux y WSL. En PowerShell usa el equivalente indicado por la herramienta.

```bash
docker --version
aws --version
terraform version
```

Si un comando no existe, detente e instala esa herramienta desde su sitio oficial. Cierra y abre la terminal después de modificar `PATH`. Las versiones deben ser compatibles entre sí antes de crear archivos.

### 2. Crea o recupera el proyecto del track

```bash
mkdir -p academia-labs/cloud/{infra,tests,evidence}
cd academia-labs/cloud
git init
docker compose up -d
```

Trabaja dentro de `academia-labs/cloud`. Si ya existe, no lo vuelvas a generar: entra en la carpeta, confirma `git status` y continúa sobre una rama propia.

### 3. Ubica cada tema antes de escribir

```text
academia-labs/cloud/
├─ infra/
│  └─ module-27/
├─ tests/
├─ docs/decisions/
├─ evidence/module-27/
└─ README.md
```

| Tema | Archivo o decisión | Evidencia mínima |
|---|---|---|
| 1. AppSync — APIs GraphQL gestionadas | `docs/decisions/module-27-topic-1.md` | contexto + alternativas + decisión + consecuencias |
| 2. Fuentes de datos y resolvers | `docs/decisions/module-27-topic-2.md` | contexto + alternativas + decisión + consecuencias |
| 3. SES — identidades, envío y plantillas | `docs/decisions/module-27-topic-3.md` | contexto + alternativas + decisión + consecuencias |
| 4. El simulador de buzones y el punto de inspección local | `docs/decisions/module-27-topic-4.md` | contexto + alternativas + decisión + consecuencias |

Un ejemplo técnico vive en el archivo indicado y debe tener una prueba. Un tema conceptual vive en `docs/decisions/`: compara opciones usando restricciones medibles; no escribas código decorativo solo para llenar espacio.

### 4. Ejecuta una línea base

Desde `academia-labs/cloud`:

```bash
terraform -chdir=infra validate
```

**Resultado esperado:** el comando reconoce el proyecto y termina sin errores antes de introducir el cambio del capítulo. Después del incremento, la evidencia debe demostrar: **Dos laboratorios prácticos (una API GraphQL básica con AppSync, y pruebas de entrega/rebote con el simulador de SES) y tres ejercicios de evaluación.**

Si falla la línea base, no continúes. Localiza el primer mensaje que indique archivo, línea o dependencia; formula una causa y compruébala con un cambio pequeño.

### 5. Provoca un fallo y recupérate

Cambia un endpoint, permiso o identificador por un valor inválido; inspecciona la respuesta del emulador antes de corregir. Guarda en `evidence/module-27/` el comando, la salida relevante, tu hipótesis y la corrección. Revierte únicamente el cambio deliberado; no borres todo el proyecto para ocultar la causa.

### 6. Conecta el capítulo con RutaFlow

Aplica el aprendizaje de **APIs GraphQL con AppSync y correo transaccional con SES** a un incremento vertical de RutaFlow. Define qué componente produce el dato, qué contrato lo transporta, quién lo consume y cómo observarás un fallo. La entrega final incluye archivo o decisión, prueba, salida, error corregido y una limitación que todavía validarías en producción.

---

## Contenido teórico

### Tema 1: AppSync — APIs GraphQL gestionadas

**Conceptos clave:** `CreateGraphqlApi`, esquema GraphQL, tipo de autenticación.

AppSync resuelve el mismo problema de fondo que API Gateway del Módulo 6 —exponer una API a tus clientes—, pero con GraphQL en vez de REST: en lugar de múltiples endpoints donde cada uno devuelve una forma fija de datos, GraphQL expone un único endpoint donde el cliente especifica exactamente qué campos necesita en cada consulta, evitando tanto la sobre-obtención (recibir campos que no usas) como la sub-obtención (tener que hacer varias llamadas para juntar los datos que necesitas). Crear una API con `CreateGraphqlApi` requiere elegir un tipo de autenticación —`API_KEY` es el más simple para empezar— y luego definir el esquema con `StartSchemaCreation`, que en Floci es siempre síncrono: no hay espera de procesamiento como en otros servicios.

Una vez definido el esquema, cada campo de tipo `Query`, `Mutation` o `Subscription` necesita un resolver que le diga a AppSync de dónde sacar los datos. Este desacoplamiento entre "qué forma tienen mis datos" (esquema) y "de dónde vienen realmente" (resolvers) es lo que hace GraphQL flexible para evolucionar sin romper a los clientes existentes.

**Analogía:** una API REST es como un menú de restaurante con platos fijos predefinidos; una API GraphQL es como pedirle al chef exactamente los ingredientes que quieres en tu plato, ni más ni menos, en un solo pedido.

**¿Por qué es importante?** Elegir GraphQL sobre REST no es gratis —añade la complejidad de definir un esquema y resolvers—, así que reconocer cuándo el problema real es "mis clientes necesitan formas de datos muy variables" (donde GraphQL brilla) frente a "necesito operaciones CRUD simples y predecibles" (donde REST suele ser más simple) es la decisión de diseño central de este tema.

### Tema 2: Fuentes de datos y resolvers

**Conceptos clave:** fuente de datos tipo `NONE`, resolvers locales, función.

Un resolver conecta un campo del esquema con una fuente de datos (`CreateDataSource`): puede ser DynamoDB, Lambda, o el tipo especial `NONE`, que permite resolvers completamente locales sin backend externo — útiles para prototipar rápidamente antes de conectar un origen de datos real, exactamente lo que vas a practicar en el laboratorio de este módulo. Los resolvers se pueden crear directamente sobre un campo (`CreateResolver`) o como funciones reutilizables (`CreateFunction`) que varios resolvers pueden compartir, evitando duplicar lógica cuando varios campos necesitan un patrón de acceso a datos similar.

Un detalle de comportamiento importante para gestionar el ciclo de vida de tu API: eliminar una API GraphQL con `DeleteGraphqlApi` elimina en cascada absolutamente todo lo que depende de ella —esquema, fuentes de datos, resolvers, funciones, tipos y claves API—, replicando fielmente el comportamiento de AWS real, donde no hay forma de eliminar una API "a medias" dejando huérfanos sus recursos hijos.

**Analogía:** una fuente de datos tipo `NONE` es como un mesero que puede confirmar tu pedido y darte una respuesta inmediata sin tener que ir a la cocina — útil cuando la "cocina" (backend real) todavía no existe pero necesitas probar el flujo completo de todos modos.

**¿Por qué es importante?** Empezar con resolvers `NONE` te permite validar el diseño de tu esquema GraphQL con clientes reales antes de invertir tiempo conectando fuentes de datos definitivas — un patrón de "maqueta funcional primero" útil en cualquier desarrollo de API.

### Tema 3: SES — identidades, envío y plantillas

**Conceptos clave:** `VerifyEmailIdentity`, `SendEmail`, plantilla de correo, SES v1 vs v2.

Enviar correo transaccional desde una aplicación —confirmaciones de pedido, restablecimiento de contraseña, notificaciones— requiere primero verificar la identidad remitente: en AWS real, esto implica probar que controlas esa dirección o dominio (mediante un enlace de confirmación o un registro DNS); en Floci, `VerifyEmailIdentity` y `VerifyDomainIdentity` marcan la identidad como verificada de inmediato, sin ese flujo de validación real, para que puedas iterar rápido en desarrollo. A partir de ahí, `SendEmail` envía un correo estructurado con asunto y cuerpo de texto o HTML, `SendRawEmail` acepta un mensaje MIME completo para casos con adjuntos o estructura compleja, y `SendTemplatedEmail` resuelve una plantilla previamente creada con `CreateTemplate` contra los datos que le pases, útil cuando el mismo tipo de correo se envía con distintos valores miles de veces.

SES existe en dos versiones de API en Floci: la consulta clásica v1 (la que usan los comandos `aws ses ...`) y la REST JSON v2 (`aws sesv2 ...`), pero comparten el mismo estado subyacente — una identidad o plantilla creada con v1 es completamente visible y utilizable desde v2, y viceversa, así que puedes mezclar ambas superficies según lo que tu SDK o código existente use.

**Analogía:** verificar una identidad de correo es como validar tu remitente en un servicio postal antes de que acepten enviar cartas en tu nombre: en Floci ese trámite se aprueba al instante para que puedas concentrarte en probar el contenido y el flujo de tus correos, no el papeleo de verificación.

**¿Por qué es importante?** Practicar plantillas y envío estructurado desde el principio —en vez de concatenar strings de HTML manualmente en cada llamada— es el hábito que evita correos inconsistentes o rotos cuando tu aplicación crece y empieza a enviar decenas de tipos distintos de notificación.

### Tema 4: El simulador de buzones y el punto de inspección local

**Conceptos clave:** direcciones del simulador (`success@`, `bounce@`, `complaint@`), punto de inspección `/_aws/ses`, eventos deterministas.

Probar cómo reacciona tu aplicación ante un correo que rebota (bounce) o genera una queja (complaint) es difícil contra un proveedor de correo real: no puedes forzar esos eventos a voluntad de forma confiable. AWS resuelve esto con direcciones de simulador de buzones de correo especiales —`success@simulator.amazonses.com`, `bounce@simulator.amazonses.com`, `complaint@simulator.amazonses.com`, `suppressionlist@simulator.amazonses.com`— que generan de forma determinista el evento correspondiente cada vez que envías un correo a esa dirección, sin enviar correo real a nadie. Floci reconoce estas mismas direcciones especiales e implementa la misma emisión determinista de eventos, así que puedes escribir pruebas automatizadas de tu manejador de rebotes o quejas sin depender de infraestructura de correo real ni de comportamiento aleatorio.

Además, cada correo enviado —simulador o no— queda almacenado en un buzón de inspección local accesible en `GET /_aws/ses`, donde puedes consultar exactamente qué se envió, a quién y con qué contenido, o borrar el buzón capturado con `DELETE /_aws/ses` entre pruebas para empezar limpio.

**Analogía:** las direcciones del simulador son como un maniquí de entrenamiento de primeros auxilios que reacciona de forma predecible a cada procedimiento que practiques, en vez de tener que esperar una emergencia real para poder entrenar la respuesta correcta.

**¿Por qué es importante?** Un sistema de notificaciones por correo que nunca fue probado contra un rebote o una queja real fallará silenciosamente en producción la primera vez que ocurra uno; el simulador te permite escribir esa prueba desde el primer día, sin excusas.

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

**Objetivo del laboratorio:** crear una API GraphQL básica en AppSync con un resolver local, y luego verificar una identidad SES y probar los tres flujos deterministas del simulador de buzones (éxito, rebote, queja).

**Requisitos previos:** ninguno adicional a Floci corriendo.

### Laboratorio 27.1 — API GraphQL con resolver local

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Crea la API | `aws appsync create-graphql-api --name mi-api --authentication-type API_KEY` | Registra la API con autenticación por clave | Un `apiId` |
| 2 | Define el esquema | `aws appsync start-schema-creation --api-id <api-id> --definition 'type Query { saludo: String }'` | Crea el esquema de forma síncrona | Confirmación inmediata |
| 3 | Crea la fuente de datos local | `aws appsync create-data-source --api-id <api-id> --name origen-local --type NONE` | Sin backend externo, útil para prototipar | Confirmación de la fuente |
| 4 | Crea el resolver | `aws appsync create-resolver --api-id <api-id> --type-name Query --field-name saludo --data-source-name origen-local` | Conecta el campo `saludo` con la fuente local | Confirmación del resolver |
| 5 | Crea una clave API para probar | `aws appsync create-api-key --api-id <api-id> --description "clave de prueba"` | Genera credenciales para consultar la API | Una clave API |

### Laboratorio 27.2 — Simulador de entrega, rebote y queja con SES

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Verifica tu identidad remitente | `aws ses verify-email-identity --email-address remitente@example.com` | Marca la identidad como verificada de inmediato | Confirmación |
| 2 | Envía a la dirección de éxito | `aws ses send-email --from remitente@example.com --destination ToAddresses=success@simulator.amazonses.com --message "Subject={Data=Prueba exito},Body={Text={Data=Hola}}"` | Genera un evento `Delivery` determinista | Un `MessageId` |
| 3 | Envía a la dirección de rebote | `aws ses send-email --from remitente@example.com --destination ToAddresses=bounce@simulator.amazonses.com --message "Subject={Data=Prueba rebote},Body={Text={Data=Hola}}"` | Genera un evento `Bounce` determinista | Un `MessageId` |
| 4 | Envía a la dirección de queja | `aws ses send-email --from remitente@example.com --destination ToAddresses=complaint@simulator.amazonses.com --message "Subject={Data=Prueba queja},Body={Text={Data=Hola}}"` | Genera un evento `Complaint` determinista | Un `MessageId` |
| 5 | Inspecciona el buzón local | `curl http://localhost:4566/_aws/ses` | Confirma los tres correos capturados | Una lista con los tres mensajes enviados |

**Verificación:** el laboratorio se considera exitoso si `create-resolver` conecta correctamente el campo `saludo` con la fuente de datos local sin errores, y si el buzón de inspección `GET /_aws/ses` muestra los tres correos enviados a las direcciones del simulador, confirmando que cada uno llegó al almacenamiento local independientemente del tipo de evento que representa.

**Errores comunes y soluciones**

- **`CreateResolver` falla porque el campo no existe en el esquema.** El nombre de campo y tipo (`Query`/`Mutation`) debe coincidir exactamente con lo definido en `StartSchemaCreation`; revisa el esquema con `GetIntrospectionSchema` si tienes dudas.
- **`DeleteGraphqlApi` deja recursos "huérfanos" en tu script de limpieza.** No debería pasar: la eliminación en cascada es automática. Si tu script falla al intentar eliminar un resolver después de eliminar la API, es que el orden de eliminación está invertido — elimina la API primero, no al final.
- **Los correos al simulador no generan el evento esperado.** Verifica que la dirección de destino sea exactamente una de las cuatro reconocidas (`success@`, `bounce@`, `complaint@`, `suppressionlist@simulator.amazonses.com`); cualquier otra dirección solo emite el evento `Send` genérico.
- **El buzón de inspección parece acumular correos de pruebas anteriores.** Usa `DELETE /_aws/ses` al inicio de tu suite de pruebas para partir de un estado limpio y evitar falsos positivos por mensajes de ejecuciones previas.

---

## Ejercicios de evaluación

### Ejercicio 1: Diseña un esquema GraphQL para el proyecto del curso

**Enunciado:** diseña (sin necesariamente implementarlo) un esquema GraphQL con un tipo `Tarea` y una query `tareas` que devuelva una lista, pensando en el Sistema de Gestión de Tareas del Módulo 9. Explica qué ventaja tendría un cliente móvil al consumir esta API GraphQL frente a la API REST que ya construiste con API Gateway.

**Solución esperada:** un esquema con `type Tarea { id: ID!, titulo: String!, estado: String! }` y `type Query { tareas: [Tarea] }`. La ventaja para un cliente móvil es poder pedir solo los campos que la pantalla actual necesita mostrar (por ejemplo, solo `titulo` y `estado` en una lista, pero todos los campos en el detalle), reduciendo el tamaño de la respuesta en conexiones móviles lentas, algo que una API REST fija no permite sin crear endpoints adicionales.

**Criterios de éxito:**
- El esquema propuesto es sintácticamente válido en GraphQL.
- La justificación de la ventaja se basa en la selección de campos por el cliente, no en una ventaja genérica sin fundamento técnico.

### Ejercicio 2: Prueba automatizada de manejo de rebotes

**Enunciado:** escribe (en pseudocódigo o en tu lenguaje preferido) una prueba automatizada que envíe un correo a `bounce@simulator.amazonses.com`, y verifique que tu aplicación marca correctamente esa dirección como "no entregable" en tu base de datos, sin depender de infraestructura de correo real.

**Solución esperada:** la prueba llama a `SendEmail` con destino la dirección de rebote del simulador, luego consulta el buzón de inspección o el mecanismo de notificación configurado (por ejemplo, un tema SNS asociado) para confirmar que se emitió el evento `Bounce`, y verifica que la lógica de la aplicación que escucha ese evento efectivamente actualizó el estado de la dirección en la base de datos.

**Criterios de éxito:**
- La prueba usa la dirección determinista del simulador, no intenta provocar un rebote real de forma indirecta.
- Verifica el efecto de negocio completo (actualización en base de datos), no solo que el correo se envió.

### Ejercicio 3: SES v1 vs v2 — mismo estado, dos superficies

**Enunciado:** crea una plantilla de correo con `CreateTemplate` (API v1), y luego consúltala con `GetEmailTemplate` (API v2). Documenta el resultado y explica qué implica para un equipo que está migrando gradualmente su código de v1 a v2.

**Solución esperada:** la plantilla creada con v1 es completamente visible y utilizable desde v2, porque ambas APIs comparten el mismo estado subyacente en Floci. Esto significa que un equipo puede migrar su código gradualmente, servicio por servicio o incluso llamada por llamada, sin tener que migrar todo de una vez ni mantener dos copias sincronizadas del mismo recurso.

**Criterios de éxito:**
- Confirmaste con evidencia real (la consulta v2 exitosa) que el estado se comparte, no solo lo asumiste.
- La explicación de la implicación para migración gradual es coherente con el comportamiento observado.

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

```graphql
query DeliveryStatus($id: ID!) {
  delivery(id: $id) {
    id
    status
    estimatedArrival
  }
}
```

Prueba una entrega existente, una inexistente y una consulta sin autorización; registra el error GraphQL completo.

En este módulo sumaste dos superficies de comunicación al curso: AppSync para APIs GraphQL gestionadas, donde practicaste el desacoplamiento entre esquema y resolvers —incluyendo el tipo especial `NONE` para prototipar sin backend real— y el comportamiento de eliminación en cascada; y SES para correo transaccional, donde el punto más valioso fue el simulador de buzones de correo: direcciones deterministas que te permiten probar automáticamente cómo reacciona tu aplicación ante entregas, rebotes y quejas sin depender de infraestructura de correo real ni de comportamiento impredecible.
