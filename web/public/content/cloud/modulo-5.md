# Módulo 5: Serverless con Lambda

## Sílabo

**Objetivo general**

Entender el modelo de computación serverless, escribir y desplegar tu primera función Lambda, invocarla, actualizarla, y comprender cómo se integra con los servicios que ya conoces (S3, DynamoDB, API Gateway).

**Objetivos específicos**

1. Explicar qué significa "serverless" y qué ventajas y desventajas tiene frente a servidores tradicionales.
2. Describir la estructura mínima de una función Lambda y su contrato de entrada/salida.
3. Desplegar, invocar y actualizar una función Lambda usando la AWS CLI.
4. Explicar el propósito del versionado y los alias en Lambda.
5. Describir cómo Lambda se integra con S3, DynamoDB Streams y API Gateway.

**Contenido**

- Qué es serverless: ventajas y desventajas.
- Estructura de una función Lambda.
- Runtimes: Node.js, Python, Java, Go.
- Payload de entrada y respuesta.
- Versionado y alias.
- Integración con S3, DynamoDB Streams y API Gateway.

**Evaluación**

Dos laboratorios (desplegar/invocar una función, y actualizar su código y configuración) y tres ejercicios de evaluación sobre el contrato de una función, statelessness, y triggers.

---

## Contenido teórico

### Tema 1: Qué es serverless — ventajas y desventajas

**Conceptos clave:** serverless, aprovisionamiente bajo demanda, pago por uso, cold start, sin gestión de servidores.

Serverless no significa que no haya servidores físicos ejecutando tu código —evidentemente los hay—, sino que tú, como desarrollador, no eres responsable de aprovisionarlos, parchearlos, escalarlos ni gestionarlos. Con Lambda, subes tu código (una función), y el proveedor de nube se encarga de todo lo demás: cuándo y dónde ejecutar esa función, cuántas instancias paralelas levantar si llegan muchas peticiones simultáneas, y cuándo apagar esos recursos cuando ya no hay peticiones que atender. Tú no eliges un tamaño de servidor ni decides cuántos servidores necesitas: describes qué debe ejecutarse, y el proveedor decide el resto de la infraestructura subyacente automáticamente.

Esto contrasta directamente con el modelo tradicional (incluso el basado en contenedores gestionados manualmente, como verás en el módulo avanzado de ECS/ECR), donde normalmente reservas capacidad de cómputo de antemano —una cantidad fija de CPU y memoria— que existe y potencialmente genera coste incluso cuando no hay tráfico. Lambda, en cambio, cobra (en una cuenta real) por el número de invocaciones y por el tiempo de ejecución real de cada una, medido en fracciones de segundo; si tu función no se invoca nunca en un periodo, no genera ningún coste de cómputo en ese periodo.

La ventaja más citada de serverless es justamente esa: no pagas por capacidad ociosa, y escalas automáticamente desde cero hasta miles de ejecuciones simultáneas sin ninguna configuración manual de autoescalado. La velocidad de desarrollo también mejora, porque eliminas por completo la gestión de infraestructura (parches de sistema operativo, actualizaciones de runtime, configuración de balanceadores de carga) del código que escribes: te concentras únicamente en la lógica de negocio de la función.

La desventaja más relevante es el "cold start": cuando una función Lambda no se ha invocado recientemente, la primera invocación después de ese periodo de inactividad puede tardar notablemente más (el proveedor necesita aprovisionar un nuevo entorno de ejecución desde cero), mientras que invocaciones sucesivas y cercanas en el tiempo reutilizan un entorno ya "caliente" y responden mucho más rápido. Otras limitaciones incluyen un tiempo máximo de ejecución por invocación (15 minutos en AWS Lambda real), lo que hace inadecuado a Lambda para tareas de procesamiento muy largas o continuas, y la imposibilidad de mantener estado en memoria de forma confiable entre invocaciones distintas, un tema que retomas en detalle en el Tema 2.

**Analogía:** un servidor tradicional es como alquilar un local comercial propio, con su alquiler fijo mensual sin importar cuántos clientes entren ese día. Serverless es como un puesto de venta ambulante que solo aparece exactamente cuando un cliente lo necesita, y del que solo pagas el tiempo real de cada venta individual, sin ningún coste cuando no hay clientes. El "cold start" sería el tiempo que tarda el vendedor en montar el puesto la primera vez que aparece tras un rato sin actividad, comparado con lo rápido que atiende al siguiente cliente si ya está montado y siguen llegando clientes seguidos.

**¿Por qué es importante?** Serverless se ha convertido en el enfoque por defecto para una enorme cantidad de cargas de trabajo modernas —procesamiento de eventos, APIs con tráfico variable, tareas programadas, procesamiento en respuesta a cambios en almacenamiento o bases de datos— precisamente porque elimina la gestión operativa de servidores y alinea el coste directamente con el uso real. Entender también sus limitaciones (cold start, tiempo máximo de ejecución, ausencia de estado) es igual de importante para no aplicarlo a casos de uso donde no encaja bien, como procesos de larga duración continua.

**Diagrama:**

```
Servidor tradicional                    Serverless (Lambda)
┌─────────────────────┐               ┌─────────────────────┐
│ Capacidad reservada    │               │ Sin capacidad reservada│
│ 24/7, coste fijo        │               │ Se aprovisiona por      │
│ aunque no haya tráfico   │              │ invocación, coste solo   │
│                         │               │ mientras se ejecuta      │
└─────────────────────┘               └─────────────────────┘
```

### Tema 2: Estructura de una función Lambda

**Conceptos clave:** handler, `event`, `context`, valor de retorno, statelessness.

Toda función Lambda tiene un punto de entrada llamado handler: una función específica dentro de tu código que el runtime de Lambda invoca cada vez que llega un evento. En Node.js, por convención, esto se escribe como `exports.handler = async (event, context) => { ... }`; en Python, como `def handler(event, context): ...`. El nombre exacto del archivo y de la función handler se especifica al desplegar la función (por ejemplo, `index.handler` significa "la función `handler` exportada desde el archivo `index.js`"), y Lambda usa esa referencia para saber qué código ejecutar cuando llega una invocación.

El primer parámetro, `event`, contiene los datos de entrada de esa invocación específica, en formato JSON. La estructura exacta de `event` varía según qué disparó la invocación: si la función se invoca directamente (como harás en el laboratorio de este módulo), `event` es exactamente el JSON que tú pasaste al invocarla; si la dispara S3 al subirse un archivo, `event` contiene información sobre el bucket y la clave del objeto subido; si la dispara API Gateway, `event` contiene los detalles completos de la petición HTTP (método, cabeceras, cuerpo, parámetros de ruta). Entender que `event` cambia de forma según el origen de la invocación es clave para escribir funciones que procesen correctamente ese contenido.

El segundo parámetro, `context`, proporciona metadatos sobre la propia invocación y el entorno de ejecución: cuánto tiempo de ejecución queda antes del timeout configurado, el ID de la solicitud (útil para correlacionar logs), el nombre y la versión de la función, entre otros datos operativos. A diferencia de `event`, que trae los datos del negocio, `context` trae datos sobre la ejecución en sí misma.

Una propiedad fundamental de cualquier función Lambda, mencionada ya en el tema anterior, es que debe diseñarse sin estado (stateless): no debe depender de que una variable en memoria conserve su valor entre invocaciones distintas, porque Lambda puede (y de hecho lo hace con frecuencia) crear un entorno de ejecución completamente nuevo para invocaciones distintas, especialmente si hay varias invocaciones simultáneas o si ha pasado tiempo desde la última. Cualquier dato que necesite persistir entre invocaciones debe guardarse explícitamente en un servicio externo diseñado para eso —DynamoDB, S3, o cualquier otro almacenamiento duradero— y no en una variable local de la función.

**Analogía:** una función Lambda es como un empleado temporal que contratas para una tarea específica, sin memoria de tareas anteriores: le das las instrucciones completas de qué hacer ahora (el `event`), te informa sobre las condiciones de su turno de trabajo actual (el `context`, como cuánto tiempo le queda de turno), y hace su trabajo sin recordar nada de la vez anterior que lo contrataste, aunque hubiera sido hace apenas un minuto. Si necesitas que recuerde algo de una tarea anterior, tienes que escribirlo en un lugar externo (un archivo, un tablero compartido) que él pueda consultar cada vez, no depender de su memoria personal.

**¿Por qué es importante?** Malinterpretar el ciclo de vida de una función Lambda —asumiendo, por ejemplo, que una variable global va a mantener su valor de forma confiable entre invocaciones— es una fuente común de bugs difíciles de reproducir, porque a veces sí parece "funcionar" (cuando Lambda reutiliza el mismo entorno de ejecución "caliente" entre invocaciones cercanas) y otras veces falla de forma aparentemente aleatoria (cuando Lambda crea un entorno nuevo). Diseñar explícitamente para statelessness desde el principio evita depender de ese comportamiento no garantizado.

**Diagrama:**

```
Invocación de una Lambda
┌──────────────────────────────────────────────┐
│  handler(event, context)                        │
│    event:   datos de negocio de ESTA invocación   │
│    context: metadatos de ESTA ejecución            │
│                                                    │
│  return { ... }  ← se devuelve al invocador        │
│                                                    │
│  (nada garantiza que una variable en memoria        │
│   sobreviva hasta la siguiente invocación)          │
└──────────────────────────────────────────────┘
```

### Tema 3: Runtimes — Node.js, Python, Java, Go

**Conceptos clave:** runtime, lenguaje de programación soportado, empaquetado de dependencias, runtime personalizado.

Un runtime en Lambda es el entorno de ejecución que sabe cómo cargar tu código y traducir el ciclo de vida de una invocación (recibir el evento, ejecutar tu handler, devolver la respuesta) al lenguaje concreto en que escribiste tu función. AWS Lambda ofrece runtimes gestionados oficialmente para varios lenguajes populares, entre ellos Node.js, Python, Java, Go, .NET y Ruby, cada uno con distintas versiones soportadas que se actualizan periódicamente conforme cada lenguaje evoluciona.

La elección de runtime tiene implicaciones prácticas más allá de la simple preferencia de lenguaje. Node.js y Python suelen tener tiempos de arranque en frío (cold start) más rápidos que Java, debido a que la máquina virtual de Java (JVM) requiere más tiempo de inicialización que un intérprete de JavaScript o Python. Go, al compilarse a un binario nativo sin una máquina virtual intermedia, suele tener de los tiempos de arranque en frío más rápidos entre los runtimes gestionados. Esta diferencia puede ser irrelevante para funciones que se invocan con frecuencia (donde el entorno se mantiene "caliente" entre invocaciones), pero puede ser un factor de diseño importante para funciones sensibles a la latencia que se invocan de forma esporádica.

Cada runtime también determina cómo empaquetas tus dependencias externas. En Node.js, empaquetas la carpeta `node_modules` junto a tu código; en Python, empaquetas las librerías instaladas junto a tu script; en Java, normalmente empaquetas un `.jar` con todas las dependencias incluidas (un "fat jar" o "uber jar"). Más allá de un cierto tamaño de dependencias, Lambda también soporta capas (Lambda Layers), que permiten compartir dependencias comunes entre múltiples funciones sin duplicarlas en cada paquete de despliegue individual, aunque ese es un tema que excede el alcance de este módulo introductorio.

Además de los runtimes gestionados oficialmente, Lambda soporta runtimes personalizados mediante la interfaz "Runtime API", que permite ejecutar prácticamente cualquier lenguaje (incluyendo Rust o PHP) implementando una capa fina que traduce entre el protocolo interno de Lambda y ese lenguaje. Este curso, en el laboratorio de este módulo, usa Node.js por su sencillez de empaquetado (sin necesidad de compilación) y por ser uno de los runtimes más comunes en la práctica, pero los mismos conceptos —handler, event, context, statelessness— aplican exactamente igual sin importar el runtime elegido.

**Analogía:** el runtime es como el traductor que necesitas contratar según el idioma en que llega un visitante extranjero a una oficina de atención: si el visitante habla japonés (Node.js), necesitas un traductor de japonés; si habla alemán (Java), necesitas uno de alemán. La oficina en sí (la infraestructura de Lambda, el concepto de evento/contexto/respuesta) funciona igual sin importar el idioma, pero cada traductor (runtime) tiene sus propias particularidades de velocidad y de cómo prepara los documentos (dependencias) que el visitante trae consigo.

**¿Por qué es importante?** Elegir un runtime no es solo una decisión de qué lenguaje prefieres escribir: tiene consecuencias reales de rendimiento (cold start), de cómo empaquetas y mantienes tus dependencias, y de qué librerías del ecosistema de ese lenguaje tienes disponibles. Para equipos que ya tienen experiencia establecida en un lenguaje concreto, normalmente es más pragmático usar ese mismo lenguaje en Lambda que introducir uno nuevo solo por una ventaja marginal de cold start.

**Diagrama:**

```
Tu código (handler + dependencias)
          │
          ▼
┌───────────────────────────────────┐
│  Runtime de Lambda (Node.js/Python/ │
│  Java/Go/...) traduce el evento      │
│  entrante a tu lenguaje, invoca tu    │
│  handler, y traduce tu respuesta       │
│  de vuelta al formato esperado         │
└───────────────────────────────────┘
```

### Tema 4: Payload de entrada y respuesta

**Conceptos clave:** payload, formato JSON, código de estado, respuesta estructurada, límites de tamaño.

El payload de entrada de una función Lambda invocada directamente (como la del laboratorio de este módulo) es simplemente el JSON que tú especificas al invocarla, sin ninguna estructura obligatoria más allá de ser JSON válido: puede ser un objeto simple como `{"nombre": "Ana"}`, un array, o un objeto profundamente anidado, según lo que tu función espere recibir. Lambda entrega ese JSON tal cual como el parámetro `event` a tu handler, sin transformarlo.

La respuesta de tu función también es, típicamente, un valor JSON serializable que devuelves (con `return` en Node.js, o como valor de retorno en Python), y Lambda lo entrega de vuelta al invocador exactamente en esa forma cuando se invoca de manera síncrona (esperando una respuesta). Cuando la invocación es asíncrona (por ejemplo, disparada por un evento de S3, sin que nadie espere una respuesta directa), el valor de retorno no se entrega a ningún invocador esperando, aunque sigue siendo relevante para que Lambda determine si la ejecución tuvo éxito o produjo un error.

Cuando una Lambda se invoca a través de API Gateway con integración proxy —el patrón que vas a construir en el Módulo 6—, la respuesta debe seguir una estructura específica que API Gateway espera para poder traducirla correctamente a una respuesta HTTP real: un objeto con las claves `statusCode` (el código de estado HTTP, como 200 o 404), `headers` (opcional, cabeceras HTTP adicionales), y `body` (el cuerpo de la respuesta, que debe ser una cadena de texto, típicamente JSON serializado con `JSON.stringify` en Node.js, no un objeto JSON directo). Olvidar esta estructura específica —por ejemplo, devolver directamente el objeto de datos sin envolverlo en `statusCode`/`body`— es uno de los errores más comunes al conectar Lambda con API Gateway por primera vez, y lo vas a evitar precisamente por conocerlo desde ahora.

Existen también límites de tamaño que conviene conocer: el payload de entrada y de salida en invocaciones síncronas tiene un límite (6 MB en AWS real), y superarlo produce un error explícito. Para casos que requieren mover datos más grandes, el patrón habitual no es intentar pasarlos directamente como payload de Lambda, sino guardarlos en S3 y pasar únicamente una referencia (el bucket y la clave) como parte del payload, dejando que la función lea el contenido real desde S3 cuando lo necesite.

**Analogía:** el payload de entrada es como el formulario de solicitud que rellenas para pedir un trámite en una oficina: su contenido depende de qué trámite estás pidiendo. La respuesta es como la resolución que te entregan de vuelta. Cuando el trámite pasa por un mostrador de atención al público (API Gateway), ese mostrador exige que la resolución venga en un sobre con un formato específico (número de resolución visible, encabezado, cuerpo del documento) para poder entregártela correctamente; si el funcionario interno (tu función Lambda) simplemente te entrega el documento suelto sin ese sobre, el mostrador no sabe cómo procesarlo para dártelo.

**¿Por qué es importante?** Entender el contrato exacto de entrada y salida de una Lambda —especialmente la estructura obligatoria cuando se integra con API Gateway— es lo que te permite depurar rápidamente por qué una función "funciona" cuando la invocas directamente pero produce errores extraños cuando se accede a través de un endpoint HTTP: casi siempre el problema está en no respetar ese formato de respuesta esperado.

**Diagrama:**

```
Invocación directa:                    Vía API Gateway (proxy):
event = {"nombre": "Ana"}              event = { httpMethod, path,
    │                                            headers, body, ... }
    ▼                                      │
return {"saludo": "Hola Ana"}              ▼
                                        return {
                                          "statusCode": 200,
                                          "headers": {...},
                                          "body": "{\"saludo\":\"Hola Ana\"}"
                                        }
```

### Tema 5: Versionado y alias

**Conceptos clave:** versión ($LATEST vs versión numerada), alias, despliegue gradual (canary/blue-green), inmutabilidad de versión.

Cada vez que publicas una versión de una función Lambda (una operación explícita, distinta de simplemente actualizar el código), Lambda crea una instantánea numerada e inmutable de esa función en ese momento exacto: su código y su configuración quedan fijados para siempre bajo ese número de versión (1, 2, 3, y así sucesivamente), y nunca vuelven a cambiar aunque sigas actualizando el código de la función más adelante. La versión especial `$LATEST` es la única mutable: siempre apunta al código más reciente que hayas desplegado, sin publicar explícitamente una versión numerada.

Un alias es un puntero con nombre (no numérico) que apunta a una versión específica —o incluso puede repartir tráfico entre dos versiones distintas según un porcentaje configurado—. Por ejemplo, podrías tener un alias llamado `produccion` apuntando a la versión 3, y un alias `pruebas` apuntando a la versión 4 más reciente, mientras desarrollas y validas esa versión antes de promoverla a producción. Los sistemas que invocan tu Lambda (API Gateway, un disparador de S3, otro servicio) se configuran para invocar el alias, no directamente `$LATEST` ni un número de versión fijo, precisamente para poder cambiar a qué versión apunta ese alias sin tener que reconfigurar cada sistema que la invoca.

Esta combinación de versiones inmutables y alias móviles es lo que habilita patrones de despliegue seguros y graduales. Un despliegue canario, por ejemplo, consiste en mover el alias `produccion` para que reparta el tráfico entre la versión antigua y la nueva de forma gradual (por ejemplo, 95% a la versión antigua y 5% a la nueva al principio), observando que la nueva versión se comporta correctamente con una fracción pequeña del tráfico real antes de moverla al 100%. Si algo sale mal con la nueva versión, revertir es tan simple como volver a apuntar el alias a la versión anterior, sin necesidad de volver a desplegar código.

Sin este mecanismo de versiones y alias, cada actualización de código sería una operación de todo o nada sobre `$LATEST`, sin ninguna forma sencilla de hacer un despliegue gradual, ni de volver atrás rápidamente a un estado anterior conocido si la actualización introduce un problema, más allá de volver a desplegar manualmente el código antiguo.

**Analogía:** las versiones numeradas de Lambda son como ediciones impresas de un libro, cada una fijada para siempre en el momento de su publicación: la edición 3 nunca cambia, aunque el autor siga escribiendo una edición 4. Un alias es como la etiqueta "edición actual en la librería" en el estante: hoy puede apuntar a la edición 3, y mañana el librero decide moverla para que apunte a la edición 4, sin que eso requiera reimprimir ni renombrar nada de las ediciones anteriores. `$LATEST` sería el manuscrito que el autor sigue editando activamente, todavía sin publicar como una edición fija.

**¿Por qué es importante?** El versionado y los alias son la base de cualquier estrategia de despliegue segura en un sistema serverless real: sin ellos, actualizar el código de una función en producción es una operación arriesgada de todo o nada. Con ellos, puedes validar cambios gradualmente y revertir casi instantáneamente si algo falla, dos propiedades esenciales en cualquier sistema que deba mantenerse disponible de forma confiable.

**Diagrama:**

```
$LATEST (mutable, cambia con cada actualización de código)
   │
   │  publish-version
   ▼
Versión 1 (fija)   Versión 2 (fija)   Versión 3 (fija, la más reciente publicada)
                                             ▲
                            alias "produccion" apunta aquí
                            (se puede mover a otra versión
                             en cualquier momento)
```

### Tema 6: Integración con S3, DynamoDB Streams y API Gateway

**Conceptos clave:** trigger, evento de S3, DynamoDB Streams, integración proxy con API Gateway, invocación síncrona vs asíncrona.

Lambda rara vez funciona de forma aislada: su valor principal viene de reaccionar automáticamente a eventos que ocurren en otros servicios, sin que nadie tenga que invocarla manualmente. Un trigger de S3 configura tu función para que se invoque automáticamente cada vez que ocurre un evento específico sobre un bucket (por ejemplo, cada vez que se sube un archivo nuevo); el `event` que recibe tu función en ese caso incluye el nombre del bucket, la clave del objeto, y detalles del propio evento, permitiéndote, por ejemplo, procesar automáticamente una imagen recién subida (generar una miniatura, extraer metadatos) sin que ningún otro sistema tenga que llamar activamente a tu función.

DynamoDB Streams funciona de forma análoga pero para cambios en una tabla: al activarlo sobre una tabla, cada operación de escritura, actualización o borrado sobre un item genera un registro en el stream, y puedes configurar una Lambda para que se invoque automáticamente con lotes de esos registros de cambio. Esto habilita patrones como mantener sincronizada una tabla derivada, invalidar una caché externa cuando cambian ciertos datos, o disparar notificaciones cuando el estado de un item cambia de una forma específica, todo sin que la aplicación que originalmente modificó el item tenga que saber nada de esos efectos secundarios.

La integración con API Gateway, que vas a construir en detalle en el Módulo 6, es distinta a las dos anteriores en un aspecto importante: mientras que los triggers de S3 y DynamoDB Streams invocan tu Lambda de forma asíncrona (el servicio que originó el evento no espera ni recibe directamente el valor de retorno de tu función), la integración con API Gateway invoca tu Lambda de forma síncrona: quien hizo la petición HTTP espera activamente la respuesta, y por eso el formato de respuesta con `statusCode`/`body` que viste en el Tema 4 es indispensable en este caso concreto.

Entender esta distinción entre invocación síncrona y asíncrona tiene implicaciones prácticas de diseño: en una integración asíncrona, si tu función falla, normalmente existe un mecanismo de reintento automático configurado por el propio servicio (y potencialmente una cola de mensajes fallidos, similar en espíritu a la DLQ que viste en el Módulo 3), sin que el servicio origen quede bloqueado esperando. En una integración síncrona vía API Gateway, si tu función falla o tarda demasiado, quien hizo la petición HTTP recibe directamente ese error o timeout, sin ningún reintento automático transparente de por medio.

**Analogía:** un trigger de S3 o de DynamoDB Streams es como un sistema de notificaciones automáticas: cuando pasa algo (llega un paquete, cambia el estado de un pedido), se dispara una alerta a quien esté suscrito, sin que quien generó el evento original espere nada de vuelta ni sepa siquiera quién reaccionó a esa alerta. La integración con API Gateway es como atender a un cliente en persona en un mostrador: el cliente hace una pregunta y se queda ahí, esperando activamente tu respuesta inmediata, y no se va hasta recibirla.

**¿Por qué es importante?** Casi cualquier arquitectura serverless real combina estos tres tipos de integración: procesar archivos automáticamente al subirlos (S3), reaccionar a cambios de datos (DynamoDB Streams), y exponer funcionalidad como una API HTTP (API Gateway). El proyecto final de este curso, en el Módulo 9, va a usar exactamente esta combinación, así que entender bien estos tres patrones de integración ahora es la base directa de ese proyecto.

**Diagrama:**

```
Trigger S3 (asíncrono)          DynamoDB Streams (asíncrono)     API Gateway (síncrono)
┌───────────────┐              ┌───────────────────┐          ┌──────────────────┐
│ Sube archivo     │             │ Item modificado      │          │ Petición HTTP        │
│      │           │             │      │               │          │      │               │
│      ▼           │             │      ▼               │          │      ▼               │
│ Invoca Lambda     │             │ Invoca Lambda con     │          │ Invoca Lambda,        │
│ (sin esperar        │           │ lote de cambios         │          │ ESPERA la respuesta    │
│  respuesta directa)  │          │ (sin esperar respuesta)  │         │ (statusCode/body)       │
└───────────────┘              └───────────────────┘          └──────────────────┘
```

---

## Laboratorio práctico

**Objetivo del laboratorio:** escribir, empaquetar, desplegar e invocar tu primera función Lambda en Node.js, y después modificarla y actualizar tanto su código como su configuración.

**Requisitos previos:** Floci corriendo con el servicio Lambda activo, AWS CLI configurada contra `http://localhost:4566`, Node.js instalado (Módulo 0), un rol de IAM para la función (Floci acepta un ARN de rol de ejemplo sin validarlo estrictamente contra permisos reales, ya que IAM se estudia en profundidad en el Módulo 7).

### Laboratorio 5.1 — Desplegar e invocar

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Crear el archivo de la función | Crea un archivo `index.js` con:<br>`exports.handler = async (event) => {`<br>`  return { mensaje: "Hola, " + (event.nombre || "mundo") };`<br>`};` | Handler mínimo que devuelve un saludo personalizado usando el `event` de entrada | El archivo se guarda sin errores |
| 2 | Comprimir el código | `zip funcion.zip index.js` | Lambda requiere el código empaquetado en un archivo `.zip` para desplegarlo | Se crea `funcion.zip` en el directorio actual |
| 3 | Crear la función Lambda | `aws lambda create-function --function-name mi-funcion --runtime nodejs20.x --handler index.handler --zip-file fileb://funcion.zip --role arn:aws:iam::000000000000:role/lambda-role --endpoint-url http://localhost:4566` | Despliega el código empaquetado como una función nueva | Un JSON con `FunctionName`, `Runtime` y `State` |
| 4 | Invocar la función | `aws lambda invoke --function-name mi-funcion --payload '{"nombre":"Nicolás"}' --cli-binary-format raw-in-base64-out salida.json --endpoint-url http://localhost:4566` | Ejecuta la función con un payload de entrada específico y guarda la respuesta en un archivo local | Un JSON de metadatos con `StatusCode: 200` |
| 5 | Ver el resultado de la invocación | `cat salida.json` | Muestra lo que la función devolvió realmente | `{"mensaje":"Hola, Nicolás"}` |

### Laboratorio 5.2 — Actualizar código y configuración

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Modificar el código de la función | Edita `index.js` para que devuelva también la hora actual:<br>`exports.handler = async (event) => {`<br>`  return { mensaje: "Hola, " + (event.nombre || "mundo"), hora: new Date().toISOString() };`<br>`};` | Simula una actualización real de la lógica de negocio | El archivo se guarda con el cambio |
| 2 | Volver a comprimir | `zip funcion.zip index.js` | Genera un nuevo paquete con el código actualizado (sobrescribe el zip anterior) | El archivo `funcion.zip` se actualiza |
| 3 | Actualizar el código desplegado | `aws lambda update-function-code --function-name mi-funcion --zip-file fileb://funcion.zip --endpoint-url http://localhost:4566` | Reemplaza el código de `$LATEST` sin crear una función nueva | Un JSON confirmando la actualización, con un nuevo valor de `LastModified` |
| 4 | Invocar de nuevo para confirmar el cambio | `aws lambda invoke --function-name mi-funcion --payload '{"nombre":"Nicolás"}' --cli-binary-format raw-in-base64-out salida2.json --endpoint-url http://localhost:4566 && cat salida2.json` | Verifica que la nueva invocación refleja el código actualizado | `{"mensaje":"Hola, Nicolás","hora":"2026-..."}` |
| 5 | Actualizar la configuración (memoria y variables de entorno) | `aws lambda update-function-configuration --function-name mi-funcion --memory-size 256 --environment "Variables={ENTORNO=desarrollo}" --endpoint-url http://localhost:4566` | Cambia la memoria asignada y añade una variable de entorno, sin tocar el código | Un JSON confirmando `MemorySize: 256` y la variable `ENTORNO` |

**Verificación:** el laboratorio se considera exitoso si `salida.json` (antes de la actualización) contiene solo el `mensaje`, y `salida2.json` (después de actualizar el código) contiene tanto el `mensaje` como el nuevo campo `hora`, confirmando que `update-function-code` reemplazó efectivamente la lógica ejecutada.

**Errores comunes y soluciones**

- **`InvalidParameterValueException` sobre el `Handler`.** El valor debe coincidir exactamente con `archivo.nombreDeLaFuncionExportada` (por ejemplo, `index.handler` si tu archivo es `index.js` y exportas `handler`). Un error tipográfico aquí es una de las causas más comunes de fallo al invocar.
- **La invocación devuelve un error de "cannot find module".** El archivo `.zip` no contiene el código en la raíz del paquete (por ejemplo, quedó dentro de una subcarpeta al comprimir). Verifica con `unzip -l funcion.zip` que `index.js` aparece directamente en la raíz del listado, no dentro de una carpeta.
- **`cat salida.json` muestra un objeto con `errorMessage` en vez del resultado esperado.** Esto indica que tu función lanzó una excepción durante la ejecución; revisa el mensaje de error específico incluido en ese JSON, que normalmente apunta directamente a la línea de código problemática.
- **Los cambios de código no parecen reflejarse tras `update-function-code`.** Confirma que realmente volviste a comprimir el archivo `.zip` después de editar `index.js` (es fácil olvidar este paso y volver a subir el zip antiguo sin darte cuenta).

---

## Ejercicios de evaluación

### Ejercicio 1: Explicar el contrato de una Lambda

**Enunciado:** sin mirar el laboratorio, explica qué recibe exactamente el parámetro `event` de una función Lambda invocada directamente con `aws lambda invoke --payload '{"a":1}'`, y qué diferencia hay con lo que recibiría esa misma función si estuviera conectada a un trigger de S3.

**Solución esperada:** en una invocación directa, `event` es exactamente el JSON pasado en `--payload`, en este caso `{"a":1}`, sin ninguna transformación. Si la misma función estuviera conectada a un trigger de S3, `event` tendría una estructura completamente distinta, definida por AWS, que incluye información sobre el bucket y la clave del objeto que disparó el evento, no el contenido arbitrario que el desarrollador decida pasar.

**Criterios de éxito:**
- Explica correctamente que el payload de una invocación directa es exactamente lo que se pasa, sin transformación.
- Reconoce que el formato de `event` cambia según el origen (invocación directa vs trigger de servicio), no es un formato fijo universal.

### Ejercicio 2: Corregir una función con estado indebido

**Enunciado:** un compañero escribió esta función Lambda en Node.js para contar cuántas veces se ha invocado: `let contador = 0; exports.handler = async () => { contador++; return { contador }; };`. Explica por qué este contador no es confiable en producción, y propón una alternativa correcta.

**Solución esperada:** la variable `contador` vive en memoria del entorno de ejecución de Lambda, que no está garantizado que persista entre invocaciones (Lambda puede crear un entorno nuevo en cualquier momento, especialmente con invocaciones concurrentes, cada una con su propia copia de `contador` empezando en 0). La alternativa correcta es guardar el contador en un almacenamiento externo duradero, como un item de DynamoDB con una operación atómica de incremento (`update-item` con una expresión `ADD`), de forma que el valor persista de forma consistente sin depender de la memoria de un entorno de ejecución específico.

**Criterios de éxito:**
- Identifica correctamente que la variable en memoria no persiste de forma confiable entre invocaciones.
- Propone un almacenamiento externo (DynamoDB u otro servicio duradero) como solución, conectándolo con el concepto de statelessness del Tema 2.

### Ejercicio 3: Elegir el tipo de integración correcto

**Enunciado:** para cada uno de estos dos casos, indica si usarías una integración síncrona (API Gateway) o asíncrona (trigger de S3 o DynamoDB Streams), y justifica tu elección: (a) una función que valida y responde inmediatamente si un formulario de contacto enviado por un usuario es válido; (b) una función que genera automáticamente una miniatura cada vez que se sube una imagen a un bucket.

**Solución esperada:** (a) síncrona vía API Gateway, porque el usuario que envía el formulario necesita una respuesta inmediata (válido/inválido) antes de continuar; (b) asíncrona vía trigger de S3, porque generar la miniatura es un efecto secundario que no requiere que quien subió la imagen espere activamente ese procesamiento para continuar con lo que estaba haciendo.

**Criterios de éxito:**
- Ambas respuestas coinciden con la solución esperada.
- La justificación de cada una se basa en si el invocador original necesita esperar una respuesta inmediata o no, conectándolo con el Tema 6.

---

## Resumen del módulo

**Puntos clave**

- Serverless elimina la gestión manual de servidores, cobrando por invocación y tiempo de ejecución real en vez de por capacidad reservada, a costa del cold start y un tiempo máximo de ejecución.
- Toda función Lambda tiene un handler que recibe `event` (datos de negocio) y `context` (metadatos de la ejecución), y debe diseñarse sin estado entre invocaciones.
- El runtime elegido (Node.js, Python, Java, Go, entre otros) afecta el empaquetado de dependencias y el tiempo de cold start.
- La respuesta de una Lambda conectada a API Gateway debe seguir el formato `statusCode`/`headers`/`body`.
- Las versiones son instantáneas inmutables del código; los alias son punteros móviles a versiones, y juntos habilitan despliegues graduales y reversibles.
- Lambda se integra de forma asíncrona con triggers de S3 y DynamoDB Streams, y de forma síncrona con API Gateway.

**Conceptos aprendidos**

- Qué es serverless y sus ventajas/desventajas frente a servidores tradicionales.
- Estructura de una función Lambda: handler, event, context, y el requisito de statelessness.
- Runtimes disponibles y sus implicaciones prácticas.
- El contrato de payload de entrada y salida, incluyendo el formato exigido por API Gateway.
- Versionado y alias como mecanismo de despliegue seguro.
- Integración de Lambda con S3, DynamoDB Streams y API Gateway, síncrona vs asíncrona.

**Próximos pasos**

En el Módulo 6 vas a exponer esta misma función Lambda como un endpoint HTTP real usando API Gateway, aplicando exactamente el formato de respuesta que viste en el Tema 4.

**Recursos adicionales**

- Documentación oficial de AWS Lambda: modelo de programación y ciclo de vida del entorno de ejecución.
- Documentación oficial sobre versiones y alias de Lambda.
- Documentación oficial sobre triggers de S3 y DynamoDB Streams para Lambda.
