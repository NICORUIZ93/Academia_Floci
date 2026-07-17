# Módulo 0: Introducción y preparación

## Sílabo

**Objetivo general**

Comprender qué es Floci, por qué existe, qué servicios de AWS, Azure y GCP emula, y dejar el entorno de trabajo completamente instalado y verificado antes de escribir el primer comando real de nube en el Módulo 1.

**Objetivos específicos**

1. Explicar con tus propias palabras qué es un emulador de nube local y en qué se diferencia de una cuenta cloud real.
2. Comparar Floci con LocalStack e identificar qué resuelven ambos y dónde se diferencian.
3. Enumerar los servicios de AWS, Azure y GCP que vas a practicar a lo largo del curso.
4. Instalar y verificar Docker, AWS CLI, Python 3 y Node.js.
5. Configurar las variables de entorno necesarias para que la AWS CLI hable con Floci en vez de con AWS real.

**Contenido**

- Qué vas a aprender y cómo está estructurado el curso.
- Qué es Floci: definición, propósito y comparativa con LocalStack.
- Servicios que emula Floci: AWS, Azure y GCP.
- Ventajas y limitaciones de practicar con un emulador local.
- Metodología de estudio: teoría, laboratorio y evaluación en cada módulo.

**Evaluación**

Un laboratorio de instalación y verificación de herramientas (sin código de aplicación todavía) y dos ejercicios cortos de reflexión sobre qué esperas de un emulador de nube local frente a una cuenta real. No hay proyecto de código en este módulo: es la base sobre la que se apoyan los nueve módulos siguientes.

---

## Contenido teórico

### Tema 1: Qué vas a aprender y cómo está estructurado el curso

**Conceptos clave:** ruta de aprendizaje, módulo, nivel de dificultad progresivo, entregable.

El curso está organizado en diez módulos numerados del 0 al 9, y cada uno se apoya en el anterior. Empiezas por la preparación del entorno (este módulo), sigues con los fundamentos de contenedores (Módulo 1), y a partir de ahí cada módulo introduce un servicio de nube distinto: almacenamiento de archivos, colas de mensajes, bases de datos NoSQL, funciones serverless, APIs HTTP, gestión de identidad, y finalmente una comparación con otros proveedores de nube. El Módulo 9 no introduce un servicio nuevo: integra todos los anteriores en un solo proyecto.

Esta progresión no es arbitraria. Cada módulo nuevo reutiliza al menos un servicio de un módulo previo. El Módulo 5 (Lambda) asume que ya sabes crear una tabla en DynamoDB (Módulo 4) y subir un archivo a S3 (Módulo 2), porque una función Lambda real casi nunca vive sola: lee de una base de datos, guarda un archivo, o dispara un mensaje en una cola. Si saltas un módulo, es probable que te falte una pieza que el siguiente da por sentada.

Cada módulo comparte la misma estructura interna: primero la teoría de los conceptos nuevos, después un laboratorio práctico con comandos reales que puedes ejecutar contra Floci, y por último ejercicios de evaluación que comprueban si puedes aplicar lo aprendido sin que te den el comando exacto. Esta estructura imita el ritmo real de aprender una tecnología de nube en el trabajo: primero entiendes el concepto, después lo usas guiado, y finalmente lo usas solo.

El nivel de dificultad también progresa. Los módulos 0 y 1 están etiquetados como "Fundamentos", los módulos 2 a 4 como "Aplicación", los módulos 5 a 7 como "Integración", y los módulos 8 y 9 como "Experto". Esta etiqueta no mide cuánto contenido tiene el módulo, sino cuánto de lo anterior necesitas dominar para aprovecharlo. Un módulo de "Integración" combina dos o tres servicios que ya viste por separado.

**Analogía:** piensa en el curso como aprender a cocinar en una escuela de gastronomía. No empiezas preparando un menú de cinco platos: primero aprendes a afilar un cuchillo y a manejar el fuego (Módulo 0 y 1), después dominas técnicas sueltas —cortar, saltear, hornear— (Módulos 2 a 4), luego combinas dos técnicas en un plato (Módulos 5 a 7), y al final preparas el menú completo (Módulos 8 y 9) usando todo lo anterior a la vez.

**¿Por qué es importante?** Entender la estructura del curso antes de empezar evita dos errores comunes: saltarte módulos porque "ya sabes" el servicio superficialmente, o frustrarte en un módulo avanzado sin darte cuenta de que te falta una base de un módulo anterior. Saber que el curso está diseñado para acumularse te da permiso para ir despacio en los primeros módulos: el tiempo que inviertas en Docker y AWS CLI en este módulo lo vas a recuperar con creces en todos los que siguen.

**Diagrama:**

```
Módulo 0 ──▶ Módulo 1 ──▶ Módulo 2 ──▶ Módulo 3 ──▶ Módulo 4
(Prepara)    (Docker)     (S3)         (SQS)        (DynamoDB)
                                                         │
   ┌─────────────────────────────────────────────────────┘
   ▼
Módulo 5 ──▶ Módulo 6 ──▶ Módulo 7 ──▶ Módulo 8 ──▶ Módulo 9
(Lambda)     (API GW)     (IAM)        (Azure/GCP)  (Proyecto final:
                                                      integra 2-8)
```

### Tema 2: Qué es Floci — definición, propósito y comparativa con LocalStack

**Conceptos clave:** emulador de nube, API-compatible, LocalStack, entorno local, coste cero.

Floci es un emulador de servicios de nube que corre en tu propia máquina, dentro de un contenedor Docker, y que responde a los mismos comandos y llamadas de API que usarías contra una cuenta real de AWS, Azure o GCP. Cuando ejecutas `aws s3 mb s3://mi-bucket --endpoint-url http://localhost:4566`, Floci recibe esa petición, la procesa como si fuera el servicio S3 real, y te devuelve una respuesta con el mismo formato que devolvería AWS. La única diferencia visible es el `--endpoint-url`: en vez de apuntar a los servidores de Amazon, apunta a un puerto de tu propio ordenador.

Esta idea no es nueva: Floci sigue el mismo enfoque que herramientas como LocalStack, que lleva años siendo el emulador de referencia para AWS en local. La diferencia principal entre Floci y LocalStack para este curso es que Floci empaqueta, en una sola imagen o en un pequeño conjunto de contenedores, emuladores para los tres grandes proveedores —AWS, Azure y GCP— con la misma filosofía de "mismo comando, mismo endpoint local", mientras que replicar esa cobertura multi-nube con otras herramientas normalmente implica combinar varios proyectos distintos (uno por proveedor).

Es fundamental entender qué hace Floci por dentro para no tratarlo como magia: dentro del contenedor corre una implementación que entiende el protocolo HTTP y los formatos de petición/respuesta de cada servicio (S3, SQS, DynamoDB, Lambda, API Gateway, IAM, y sus equivalentes en Azure y GCP), guarda el estado en memoria o en disco local, y expone todo por un puerto TCP. No hay facturación, no hay límites de cuenta gratuita, no hay riesgo de dejarte un recurso encendido y recibir una factura sorpresa a fin de mes.

Esto tiene una consecuencia práctica muy importante para cómo vas a trabajar en este curso: vas a usar las mismas herramientas de línea de comandos que usarías en un trabajo real —AWS CLI, `boto3` en Python, el SDK de Node.js— sin necesidad de crear una cuenta, sin tarjeta de crédito, y sin miedo a romper nada, porque todo lo que hagas vive dentro de un contenedor que puedes borrar y volver a levantar en segundos.

Además del contenedor en sí, el proyecto ofrece dos herramientas oficiales que vas a usar a lo largo del curso: `floci-cli`, una interfaz de línea de comandos (`floci start`, `floci env`, `floci doctor`) que instalarás en el Módulo 1 y que simplifica levantar, verificar y detener Floci sin recordar flags largos de `docker run`; y `floci-ui`, un panel visual (accesible en `http://localhost:4500` tras `docker compose up`) para explorar tus buckets S3, tablas DynamoDB, colas SQS y logs de Lambda desde el navegador en vez de solo desde la terminal — útil cuando quieres confirmar de un vistazo el estado de varios recursos a la vez.

**Analogía:** Floci es como un simulador de vuelo para pilotos. Un simulador no es un avión real, pero replica fielmente la cabina, los instrumentos y las respuestas del avión ante cada acción del piloto. Un piloto que aprende en el simulador transfiere casi toda esa habilidad al avión real, porque los controles y las reacciones son los mismos; lo único que cambia es que estrellar el simulador no tiene consecuencias. Floci hace lo mismo con la nube: los comandos, las respuestas y los conceptos son los reales, pero equivocarte no cuesta dinero ni compromete una cuenta de producción.

**¿Por qué es importante?** Sin un emulador local, aprender servicios cloud reales tiene dos barreras: el coste (muchos servicios cobran por uso incluso en pruebas) y el riesgo (una mala configuración de IAM o un bucket público mal configurado en una cuenta real puede tener consecuencias serias). Floci elimina ambas barreras para la fase de aprendizaje, y como usa los mismos comandos que la nube real, todo lo que practiques aquí es transferible: el día que uses una cuenta de AWS real, cambias el endpoint y usas exactamente lo mismo que aprendiste.

**Diagrama:**

```
   Tu terminal                     Con endpoint real:            Con Floci:
┌──────────────────┐         ┌─────────────────────┐      ┌──────────────────────┐
│ aws s3 mb s3://x  │  ──▶    │ api.aws.amazon.com  │  ó   │ localhost:4566        │
│ --endpoint-url... │         │ (cuenta real, cobra) │      │ (contenedor Floci,    │
└──────────────────┘         └─────────────────────┘      │  gratis, local)       │
                                                             └──────────────────────┘
```

### Tema 3: Servicios que emula Floci — AWS, Azure y GCP

**Conceptos clave:** floci (AWS), floci-az (Azure), floci-gcp (GCP), catálogo de servicios, endpoint por proveedor.

Floci no es un único contenedor: es una familia de tres imágenes, una por proveedor de nube, pensadas para usarse de forma independiente o en conjunto según lo que necesites practicar. La imagen principal, a la que llamamos simplemente Floci, emula servicios de AWS: S3 (almacenamiento de objetos), SQS (colas de mensajes), DynamoDB (base de datos NoSQL), Lambda (funciones serverless), API Gateway (APIs HTTP) e IAM (identidad y acceso), además de los servicios avanzados que verás en módulos posteriores al proyecto final, como Secrets Manager, SNS, EventBridge, CloudWatch, RDS, ECR/ECS y otros.

La segunda imagen, floci-az, emula el equivalente en Azure de esos mismos patrones: Blob Storage en vez de S3, Queue Storage en vez de SQS, Cosmos DB en vez de DynamoDB, y Azure Functions en vez de Lambda. La tercera, floci-gcp, hace lo propio para Google Cloud: Cloud Storage, Pub/Sub, Firestore y Cloud Functions. Vas a conocer estas dos últimas en profundidad en el Módulo 8, pero es importante que sepas desde ahora que existen, porque el objetivo final del curso no es que memorices comandos de AWS, sino que entiendas patrones de nube que se repiten con nombres distintos en cada proveedor.

Cada imagen expone sus servicios en puertos distintos para que puedas tener varias corriendo a la vez sin que choquen entre sí. Floci (AWS) usa por convención el puerto 4566 para casi todos sus servicios (el mismo patrón que usa LocalStack), mientras que floci-az y floci-gcp usan sus propios rangos de puertos que verás documentados cuando llegues al Módulo 8. Por ahora, en los Módulos 1 a 7, vas a trabajar exclusivamente con la imagen de AWS.

Entender esta separación por proveedor desde el principio evita una confusión típica de quien empieza en cloud: pensar que "aprender la nube" es aprender AWS. En realidad estás aprendiendo conceptos —almacenamiento de objetos, colas, bases de datos NoSQL, cómputo sin servidor— que cada proveedor implementa con su propio nombre y su propia API, pero que comparten la misma lógica subyacente. Ese es exactamente el ejercicio que vas a hacer en el Módulo 8: el mismo caso de uso, resuelto en los tres proveedores.

**Analogía:** los tres contenedores de Floci son como tres traductores distintos que hablan idiomas distintos (AWS, Azure, GCP) pero que traducen los mismos conceptos: "guardar un archivo", "enviar un mensaje a una cola", "guardar un registro en una base de datos sin esquema fijo". Aprender los tres no es aprender tres cosas nuevas, es aprender un vocabulario nuevo para las mismas ideas que ya conoces.

**¿Por qué es importante?** Las empresas no siempre usan un solo proveedor de nube, y muchos roles de ingeniería exigen soltura con más de uno, o al menos la capacidad de entender rápido un proveedor nuevo si ya conoces otro. Empezar a distinguir "el servicio" de "el nombre que le pone el proveedor" desde el Módulo 0 te prepara mejor para ese escenario que aprender AWS de memoria sin esa perspectiva.

**Diagrama:**

```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│    Floci     │   │  floci-az   │   │  floci-gcp  │
│    (AWS)     │   │  (Azure)    │   │   (GCP)     │
├─────────────┤   ├─────────────┤   ├─────────────┤
│ S3           │   │ Blob Storage│   │ Cloud Storage│
│ SQS          │   │ Queue Storage│  │ Pub/Sub     │
│ DynamoDB     │   │ Cosmos DB   │   │ Firestore   │
│ Lambda       │   │ Functions   │   │ Cloud Functions│
│ API Gateway  │   │             │   │             │
│ IAM          │   │             │   │             │
└─────────────┘   └─────────────┘   └─────────────┘
   Módulos 1-7          Módulo 8         Módulo 8
```

**Diagrama interactivo — arquitectura de Floci corriendo en local:**

```mermaid
flowchart TB
  Dev["Tu máquina (Docker Compose)"]
  Dev --> AWS["Floci — AWS local :4566\nS3 · SQS · DynamoDB · Lambda · API Gateway · IAM"]
  Dev --> Azure["floci-az — Azure local :4577\nBlob Storage · Queue Storage · Cosmos DB · Functions"]
  Dev --> GCP["floci-gcp — GCP local :4588\nCloud Storage · Pub/Sub · Firestore · Cloud Functions"]
  AWS --> Tools["AWS CLI / SDKs apuntando a --endpoint-url local"]
  Azure --> Tools2["az CLI / SDKs apuntando al emulador local"]
  GCP --> Tools3["gcloud CLI / SDKs apuntando al emulador local"]
```

### Tema 4: Ventajas y limitaciones de practicar con un emulador local

**Conceptos clave:** paridad de comportamiento, fidelidad parcial, límites del emulador, transferencia de conocimiento.

Ningún emulador es una copia perfecta del servicio real, y es importante que empieces el curso con expectativas correctas sobre esto. Floci reproduce con fidelidad alta el comportamiento funcional de cada servicio: la forma de los comandos, las respuestas, los códigos de error más comunes, y el flujo de trabajo típico. Eso es suficiente para aprender el 90% de lo que necesitas para usar estos servicios en el mundo real. Lo que un emulador no reproduce, y no puede reproducir, es el comportamiento a gran escala: cómo se comporta DynamoDB con mil millones de items, cómo escala Lambda ante diez mil invocaciones simultáneas, o los tiempos de latencia reales entre regiones geográficas distintas.

Tampoco reproduce, salvo excepciones, las integraciones más avanzadas o específicas de cada proveedor que dependen de infraestructura propietaria compleja —ciertas características de seguridad de nivel de red, algunos servicios de machine learning gestionado, o comportamientos de facturación—. Para el objetivo de este curso, que es que entiendas los conceptos y sepas operar cada servicio con confianza, estas limitaciones no son un obstáculo: nadie aprende a programar entendiendo primero cómo escala un sistema a nivel de datacenter.

La ventaja más grande, más allá del coste cero, es la velocidad de iteración. Levantar y destruir un bucket S3, una tabla DynamoDB o una función Lambda en Floci toma segundos. Hacerlo en una cuenta real de AWS también es rápido, pero cada error tiene un coste de contexto: si rompes algo en una cuenta compartida de un equipo real, puedes afectar a otras personas. En Floci, tu única "cuenta" es tu contenedor local: si algo sale mal, lo destruyes con `docker compose down` y lo vuelves a levantar limpio en un minuto.

La otra ventaja, menos obvia pero igual de importante, es que aprender contra un emulador te obliga a leer y entender los mensajes de error reales de cada servicio, en vez de depender de una interfaz gráfica que oculta los detalles. Vas a trabajar principalmente por línea de comandos a lo largo del curso, y eso construye una habilidad que se transfiere directamente a cualquier entorno de producción real, donde gran parte del trabajo serio se hace igual: por CLI, por API, o por infraestructura como código.

**Analogía:** un emulador de nube es como una piscina de entrenamiento para nadadores olímpicos: tiene el mismo agua, los mismos carriles, la misma resistencia física que una piscina de competición, pero no replica el ruido de miles de espectadores ni la presión de una final olímpica. Entrenar en la piscina te prepara para nadar; la experiencia de competir a gran escala se construye después, con el tiempo, no antes.

**¿Por qué es importante?** Saber qué SÍ vas a aprender bien aquí (comandos, conceptos, flujos de trabajo, errores comunes) y qué NO vas a experimentar (escala masiva, latencia de red real, facturación) te evita dos errores: subestimar lo que aprendes por pensar que "no es lo real", o sobreestimar tu preparación pensando que ya sabes operar estos servicios en producción a gran escala solo por haber terminado el curso.

**Diagrama:**

```
                    Lo que Floci SÍ te da           Lo que Floci NO te da
                 ┌────────────────────────┐      ┌────────────────────────┐
                 │ Comandos reales         │      │ Comportamiento a escala │
                 │ Flujos de trabajo reales│      │ Latencia de red real    │
                 │ Errores reales          │      │ Facturación real        │
                 │ Coste: $0               │      │ Alta disponibilidad real│
                 └────────────────────────┘      └────────────────────────┘
```

### Tema 5: Metodología de estudio — teoría, laboratorio y evaluación en cada módulo

**Conceptos clave:** ciclo teoría-práctica-evaluación, entregable verificable, autoevaluación con criterios de éxito.

Cada uno de los diez módulos de este curso sigue el mismo ciclo de tres fases. La primera fase es la teoría: para cada tema del módulo encontrarás una explicación de los conceptos, una analogía que conecta la idea con algo cotidiano, una justificación de por qué ese concepto importa en el mundo real, y una representación visual simplificada. Esta fase no tiene comandos que ejecutar: es para construir el modelo mental antes de tocar el teclado.

La segunda fase es el laboratorio práctico. Aquí cada paso especifica una acción, el comando exacto que debes ejecutar, una explicación de qué hace ese comando, y la salida esperada para que puedas comparar lo que ves en tu terminal con lo que deberías ver. El laboratorio también incluye una sección de verificación al final —una forma concreta de comprobar que el resultado es correcto— y una lista de errores comunes con sus soluciones, para que si algo falla no te quedes bloqueado.

La tercera fase son los ejercicios de evaluación. A diferencia del laboratorio, aquí no se te da el comando exacto: se te da un enunciado (una tarea a resolver), y tú decides qué comandos usar. Cada ejercicio incluye una solución esperada como referencia y una lista de criterios de éxito para que puedas autoevaluarte objetivamente, sin depender de que alguien más corrija tu trabajo. Esta fase es la que realmente demuestra si dominas el concepto: cualquiera puede copiar un comando de un laboratorio, pero resolver un ejercicio nuevo con esos mismos conceptos requiere haberlos entendido.

Al final de cada módulo hay un resumen que recoge los puntos clave, lista explícitamente los conceptos que deberías haber aprendido, sugiere próximos pasos, y enlaza recursos adicionales para quien quiera profundizar más allá del alcance del curso. Este resumen no es un simple recordatorio: úsalo como checklist antes de avanzar al siguiente módulo. Si no puedes explicar con tus propias palabras cada punto clave del resumen, vale la pena repasar el módulo antes de continuar.

**Analogía:** esta metodología es la misma que usan las escuelas de vuelo, de cirugía o de oficios técnicos: primero la clase teórica (por qué funciona así), después la práctica supervisada con instrucciones exactas (así se hace, paso a paso), y por último la evaluación sin ayuda (hazlo tú, y compruébalo tú mismo con una lista de criterios). Ningún piloto pasa directo de la teoría a volar solo sin la fase intermedia de práctica guiada.

**¿Por qué es importante?** Saber de antemano cómo está construido cada módulo te permite dosificar tu tiempo: si vas con prisa, la teoría te da el mínimo para no perderte; si tienes tiempo, el laboratorio te da práctica guiada; y los ejercicios de evaluación son innegociables si quieres saber, con evidencia real, si aprendiste algo o solo copiaste comandos.

**Diagrama:**

```
┌───────────┐      ┌─────────────┐      ┌──────────────┐      ┌──────────┐
│  Teoría    │ ──▶  │ Laboratorio  │ ──▶  │  Ejercicios   │ ──▶  │ Resumen  │
│ (entender) │      │ (paso a paso)│      │ (sin ayuda,   │      │ (checklist│
│            │      │ + verificación│     │  autoevaluado)│      │  final)  │
└───────────┘      └─────────────┘      └──────────────┘      └──────────┘
```

---

## Laboratorio práctico

**Objetivo del laboratorio:** dejar instalado y verificado todo el software que vas a necesitar desde el Módulo 1 en adelante: Docker, AWS CLI, Python 3 y Node.js, además de las variables de entorno que le indican a la AWS CLI que hable con Floci en vez de con AWS real.

**Requisitos previos:** un ordenador con Windows, macOS o Linux, con al menos 4 GB de RAM libres y conexión a internet para descargar el software. No se requiere experiencia previa con la línea de comandos, pero si nunca has abierto una terminal, dedica unos minutos a familiarizarte con abrirla y escribir comandos simples como `pwd` o `cd`.

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Instalar Docker | Descarga Docker Desktop (Windows/Mac) desde el sitio oficial de Docker, o Docker Engine (Linux) con el gestor de paquetes de tu distribución | Docker es el motor de contenedores que va a ejecutar Floci; sin Docker no puedes levantar ningún emulador de este curso | El instalador termina sin errores y Docker Desktop (o el daemon en Linux) queda corriendo |
| 2 | Verificar Docker | `docker --version` | Confirma que el binario de Docker está en tu PATH y responde | Una línea como `Docker version 27.x.x, build xxxxxxx` |
| 3 | Probar que Docker funciona de extremo a extremo | `docker run hello-world` | Descarga una imagen mínima de prueba y la ejecuta en un contenedor | Un mensaje de texto que empieza con "Hello from Docker!" |
| 4 | Instalar AWS CLI | Descarga el instalador de AWS CLI v2 desde la documentación oficial de AWS para tu sistema operativo | La AWS CLI es la herramienta de línea de comandos que vas a usar en casi todos los módulos para hablar con Floci | El instalador termina sin errores |
| 5 | Verificar AWS CLI | `aws --version` | Confirma que el binario está instalado y en tu PATH | Una línea como `aws-cli/2.x.x Python/3.x.x ...` |
| 6 | Instalar Python 3 | Descarga Python 3 desde python.org o usa el gestor de paquetes de tu sistema | Vas a usar Python (con la librería boto3) en varios laboratorios para hablar con Floci desde código, no solo desde la CLI | El instalador termina sin errores |
| 7 | Verificar Python | `python3 --version` | Confirma la versión instalada | Una línea como `Python 3.11.x` (cualquier versión 3.9 o superior sirve) |
| 8 | Instalar Node.js | Descarga Node.js LTS desde nodejs.org o usa un gestor de versiones como nvm | Vas a escribir funciones Lambda en Node.js en el Módulo 5 | El instalador termina sin errores |
| 9 | Verificar Node.js | `node --version` | Confirma la versión instalada | Una línea como `v20.x.x` o superior |
| 10 | Configurar variables de entorno de AWS CLI | En Linux/macOS: `export AWS_ACCESS_KEY_ID=test`<br>`export AWS_SECRET_ACCESS_KEY=test`<br>`export AWS_DEFAULT_REGION=us-east-1`<br><br>En Windows (PowerShell): `$Env:AWS_ACCESS_KEY_ID="test"`<br>`$Env:AWS_SECRET_ACCESS_KEY="test"`<br>`$Env:AWS_DEFAULT_REGION="us-east-1"` | Floci no valida credenciales reales, pero la AWS CLI exige que existan unas credenciales con formato válido antes de dejarte ejecutar cualquier comando | Los comandos se ejecutan sin mostrar ningún error |
| 11 | Confirmar que las variables quedaron activas | `echo $AWS_ACCESS_KEY_ID` (Linux/macOS) o `echo $Env:AWS_ACCESS_KEY_ID` (PowerShell) | Verifica que el valor se guardó correctamente en la sesión actual de la terminal | Se imprime `test` |

**Verificación:** al finalizar, ejecuta los cuatro comandos de versión (`docker --version`, `aws --version`, `python3 --version`, `node --version`) en una sola sesión de terminal y confirma que los cuatro responden sin error. Si los cuatro comandos devuelven una versión, el entorno está listo para el Módulo 1.

**Errores comunes y soluciones**

- **`docker: command not found` después de instalar Docker Desktop.** En macOS y Windows, cierra y vuelve a abrir la terminal después de instalar; el instalador actualiza el PATH pero las terminales ya abiertas no lo recargan automáticamente.
- **`Cannot connect to the Docker daemon` al ejecutar `docker run hello-world`.** Docker Desktop debe estar abierto y completamente iniciado (el ícono de la ballena en la barra de tareas debe indicar que está corriendo, no "starting"). En Linux, verifica que el servicio esté activo con `sudo systemctl status docker` y arráncalo con `sudo systemctl start docker` si no lo está.
- **Las variables de entorno desaparecen al cerrar la terminal.** Esto es esperado: las variables exportadas con `export` (o `$Env:` en PowerShell) solo viven en la sesión actual. Si quieres que persistan, añádelas a tu archivo de configuración de shell (`.bashrc`, `.zshrc`) o crea un perfil de AWS CLI dedicado con `aws configure --profile floci`, que verás en detalle en el Módulo 1.
- **`aws: command not found` en Windows tras instalar.** Asegúrate de haber reiniciado la terminal (o la sesión de Windows) después de la instalación; el instalador de AWS CLI v2 en Windows requiere reiniciar la consola para actualizar el PATH del sistema.

---

## Ejercicios de evaluación

### Ejercicio 1: Diferenciar emulador de cuenta real

**Enunciado:** en tus propias palabras, escribe un párrafo de al menos cuatro líneas explicando la diferencia entre ejecutar `aws s3 ls` contra una cuenta real de AWS y ejecutar `aws s3 ls --endpoint-url http://localhost:4566` contra Floci. Menciona explícitamente qué cambia y qué se mantiene igual.

**Solución esperada:** una respuesta correcta debe mencionar que el comando (`aws s3 ls`), el formato de la petición y el formato de la respuesta se mantienen iguales; lo que cambia es el destino de la petición: en la cuenta real viaja por internet hasta los servidores de AWS y puede generar coste o afectar recursos reales, mientras que contra Floci la petición se queda en tu propia máquina, la procesa un contenedor Docker local, no genera coste, y cualquier bucket o archivo que crees solo existe mientras el contenedor esté corriendo (o hasta que reinicies su estado).

**Criterios de éxito:**
- Menciona que el comando y su sintaxis son idénticos en ambos casos.
- Identifica el `--endpoint-url` como el mecanismo que redirige la petición a Floci.
- Explica al menos una consecuencia práctica de la diferencia (coste, persistencia, o riesgo).

### Ejercicio 2: Mapear servicios a proveedores

**Enunciado:** completa la siguiente tabla escribiendo, para cada servicio de AWS, su equivalente aproximado en Azure y en GCP, usando lo que leíste en el Tema 3 de este módulo:

| Servicio AWS | Equivalente Azure | Equivalente GCP |
|---|---|---|
| S3 | ? | ? |
| SQS | ? | ? |
| DynamoDB | ? | ? |
| Lambda | ? | ? |

**Solución esperada:**

| Servicio AWS | Equivalente Azure | Equivalente GCP |
|---|---|---|
| S3 | Blob Storage | Cloud Storage |
| SQS | Queue Storage | Pub/Sub |
| DynamoDB | Cosmos DB | Firestore |
| Lambda | Azure Functions | Cloud Functions |

**Criterios de éxito:**
- Las cuatro filas de Azure y las cuatro de GCP coinciden con la tabla de solución.
- Puedes explicar, sin mirar la tabla, qué tienen en común S3, Blob Storage y Cloud Storage (los tres son almacenamiento de objetos).

### Ejercicio 3: Checklist de entorno

**Enunciado:** sin volver a mirar el laboratorio de este módulo, escribe de memoria la lista de las cuatro herramientas que debes tener instaladas antes del Módulo 1, y el comando de verificación de cada una.

**Solución esperada:** Docker (`docker --version`), AWS CLI (`aws --version`), Python 3 (`python3 --version`) y Node.js (`node --version`).

**Criterios de éxito:**
- Las cuatro herramientas están completas y correctas.
- Los cuatro comandos de verificación son correctos.
- Ejecutaste realmente los cuatro comandos en tu propia terminal y los cuatro respondieron sin error, no solo los recordaste de memoria.

---

## Resumen del módulo

**Puntos clave**

- Floci es un emulador de nube local, API-compatible con AWS, Azure y GCP, en la misma línea que herramientas como LocalStack.
- Usar Floci en vez de una cuenta real elimina el coste y el riesgo durante la fase de aprendizaje, sin sacrificar la fidelidad de los comandos y flujos de trabajo reales.
- El curso cubre AWS en los Módulos 1 a 7, y Azure/GCP en el Módulo 8, antes de integrarlo todo en el proyecto final del Módulo 9.
- Cada módulo sigue el mismo ciclo: teoría, laboratorio guiado con verificación, y ejercicios de evaluación sin ayuda.

**Conceptos aprendidos**

- Qué es un emulador de nube y cómo se diferencia de una cuenta real.
- Floci frente a LocalStack.
- El catálogo de servicios de Floci, floci-az y floci-gcp.
- Ventajas (coste, velocidad de iteración, aprendizaje de errores reales) y limitaciones (sin escala real, sin latencia de red real) de un emulador.
- La metodología de teoría → laboratorio → evaluación que vas a repetir en cada módulo.

**Próximos pasos**

En el Módulo 1 vas a profundizar en Docker —el motor que hace posible que Floci exista— antes de levantarlo por primera vez con `docker run` y verificarlo con una petición HTTP real a su endpoint de salud.

**Recursos adicionales**

- Documentación oficial de Docker: conceptos de imágenes y contenedores.
- Documentación oficial de la AWS CLI v2: instalación y configuración.
- Repositorio de LocalStack (referencia del enfoque de emulación que Floci sigue para AWS).
