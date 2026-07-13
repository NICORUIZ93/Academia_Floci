# Módulo 1: Fundamentos de Docker y contenedores

## Sílabo

**Objetivo general**

Entender qué es un contenedor, por qué se volvió el estándar para empaquetar software, dominar los comandos esenciales de Docker y Docker Compose, y levantar Floci por primera vez, dejándolo verificado y listo para los ocho módulos siguientes.

**Objetivos específicos**

1. Explicar la diferencia entre virtualización tradicional y contenedores.
2. Describir qué es una imagen Docker, cómo se compone en capas, y de dónde se descargan.
3. Ejecutar los comandos esenciales de Docker: `pull`, `run`, `ps`, `stop`, `rm`, `images`, `exec`, `logs`.
4. Escribir y levantar un `docker-compose.yml` con al menos un servicio.
5. Levantar Floci con Docker y verificar que responde correctamente en su endpoint de salud.

**Contenido**

- Virtualización vs contenedores.
- Imágenes y capas.
- Registros de contenedores (Docker Hub).
- Comandos esenciales: `docker pull/run/ps/stop/rm/images/exec/logs`.
- Docker Compose: servicios, redes y volúmenes.
- Levantar Floci con Docker (AWS, Azure y GCP).

**Evaluación**

Dos laboratorios prácticos (levantar Floci y configurar la AWS CLI contra él) y tres ejercicios de evaluación que comprueban que entiendes la diferencia entre imagen y contenedor, que sabes leer el estado de contenedores en ejecución, y que puedes levantar y destruir el entorno de Floci sin ayuda.

---

## Contenido teórico

### Tema 1: Virtualización vs contenedores

**Conceptos clave:** hipervisor, máquina virtual, kernel compartido, aislamiento de procesos, sobrecarga de recursos.

La virtualización tradicional funciona instalando un hipervisor sobre tu sistema operativo (o directamente sobre el hardware), que crea máquinas virtuales completas: cada una con su propio kernel, su propio sistema operativo instalado desde cero, y sus propios recursos de CPU y memoria reservados. Si quieres correr tres aplicaciones aisladas con máquinas virtuales, estás cargando tres sistemas operativos completos, cada uno con su propio consumo de arranque, de memoria y de disco, incluso si las tres aplicaciones son ligeras.

Los contenedores resuelven el mismo problema —aislar aplicaciones para que no interfieran entre sí— de una forma radicalmente más ligera: en vez de virtualizar hardware completo, aíslan procesos dentro del mismo kernel del sistema operativo anfitrión. Un contenedor no arranca un sistema operativo nuevo; arranca un proceso (o varios) que cree estar solo en su propio sistema de archivos, su propia red y su propio espacio de procesos, pero en realidad comparte el kernel de Linux (o de Windows) con el resto de contenedores y con el propio host. Esto es posible gracias a mecanismos del kernel como los namespaces (que aíslan qué ve cada proceso) y los cgroups (que limitan cuánta CPU y memoria puede usar).

La consecuencia práctica es enorme: un contenedor típico arranca en menos de un segundo, mientras que una máquina virtual puede tardar decenas de segundos o minutos en arrancar su sistema operativo completo. Un contenedor pesa, en muchos casos, decenas de megabytes; una máquina virtual con su sistema operativo completo puede pesar varios gigabytes. Esto es exactamente lo que hace posible que en este curso levantes y destruyas Floci en segundos, tantas veces como quieras, sin esperar minutos cada vez.

Esto no significa que los contenedores reemplacen completamente a las máquinas virtuales: las máquinas virtuales siguen siendo necesarias cuando se necesita aislar kernels distintos (por ejemplo, correr Windows y Linux en la misma máquina física), o cuando se necesita el aislamiento de seguridad más fuerte posible entre cargas de trabajo que no confían entre sí. De hecho, Docker Desktop en macOS y Windows internamente usa una máquina virtina ligera de Linux para poder ejecutar contenedores Linux sobre esos sistemas operativos, porque los contenedores Linux necesitan un kernel Linux por debajo.

**Analogía:** una máquina virtual es como construir un edificio completo nuevo —con su propia estructura, tuberías y sistema eléctrico— cada vez que quieres alquilar una oficina. Un contenedor es como alquilar una oficina dentro de un edificio ya construido: compartes la estructura, las tuberías y la electricidad del edificio (el kernel), pero tu oficina está completamente separada y con llave propia de las demás.

**¿Por qué es importante?** Docker, y por extensión los contenedores, se convirtieron en el estándar de la industria para empaquetar y distribuir software precisamente por esta ligereza: te permite correr docenas de servicios aislados en un portátil normal, algo impensable con máquinas virtuales completas. Todo el ecosistema de nube moderno —incluyendo cómo se distribuyen y ejecutan Floci, tus propias aplicaciones, y servicios como ECS o Kubernetes que verás en módulos avanzados— se construye sobre esta idea.

**Diagrama:**

```
   VIRTUALIZACIÓN TRADICIONAL              CONTENEDORES
┌─────────────────────────────┐    ┌─────────────────────────────┐
│  App A  │  App B  │  App C  │    │  App A  │  App B  │  App C  │
│  ─────  │  ─────  │  ─────  │    │  ─────  │  ─────  │  ─────  │
│  SO A   │  SO B   │  SO C   │    │        Docker Engine        │
├─────────────────────────────┤    ├─────────────────────────────┤
│         Hipervisor          │    │    Kernel del host (Linux)   │
├─────────────────────────────┤    ├─────────────────────────────┤
│      Hardware físico         │    │      Hardware físico         │
└─────────────────────────────┘    └─────────────────────────────┘
   3 SO completos, más pesado         1 kernel compartido, más ligero
```

### Tema 2: Imágenes y capas

**Conceptos clave:** imagen, capa (layer), Dockerfile, caché de construcción, inmutabilidad.

Una imagen Docker es un paquete inmutable que contiene todo lo necesario para ejecutar una aplicación: el código, las dependencias, las librerías del sistema, las variables de entorno por defecto, y el comando que se ejecuta al arrancar. Un contenedor, en cambio, es una instancia en ejecución de una imagen: puedes crear diez contenedores distintos a partir de la misma imagen, cada uno con su propio estado en memoria y en disco, igual que puedes crear varios documentos distintos a partir de la misma plantilla.

Las imágenes se construyen en capas. Cada instrucción de un Dockerfile —el archivo de texto que describe cómo se construye una imagen— genera una capa nueva que se apila sobre la anterior. Si la primera capa instala el sistema operativo base, la segunda instala las dependencias, y la tercera copia el código de la aplicación, Docker guarda cada una de esas capas por separado, y las reutiliza como caché si vuelves a construir la imagen y esa capa no cambió. Esto acelera enormemente las reconstrucciones: si solo cambias tu código de aplicación (la última capa), Docker no vuelve a instalar el sistema operativo ni las dependencias, solo reconstruye la capa que cambió.

Este diseño en capas también explica por qué las imágenes se pueden compartir eficientemente: si dos imágenes distintas comparten las mismas primeras capas (por ejemplo, ambas se basan en la misma imagen de Node.js), Docker solo necesita descargar esas capas una vez y las reutiliza para ambas imágenes. Es exactamente lo que ocurre cuando descargas la imagen de Floci: Docker descarga cada capa que compone esa imagen, y si en el futuro descargas otra imagen que comparte alguna de esas capas base, no las vuelve a descargar.

La inmutabilidad de las imágenes es una propiedad de diseño deliberada: una vez construida, una imagen no cambia. Si necesitas una versión distinta de tu aplicación, construyes una imagen nueva (normalmente con una etiqueta de versión distinta, como `mi-app:1.1` en vez de `mi-app:1.0`), en vez de modificar la imagen existente. Esto es lo que hace que los despliegues con contenedores sean predecibles: la imagen que probaste en tu máquina es exactamente la misma que se ejecuta en cualquier otro entorno, byte por byte.

**Analogía:** una imagen es como la receta impresa de un pastel, con cada paso (capa) numerado y guardado por separado: la masa base, el relleno, la cobertura. Si cambias solo la cobertura, no necesitas rehacer la masa ni el relleno desde cero; reutilizas esos pasos ya hechos. Un contenedor es el pastel horneado a partir de esa receta: puedes hornear varios pasteles idénticos (contenedores) a partir de la misma receta (imagen), y cada uno existe de forma independiente una vez servido.

**¿Por qué es importante?** Entender la diferencia entre imagen y contenedor es la base para entender casi cualquier comando de Docker que vas a usar en este módulo: `docker images` lista las recetas que tienes descargadas, `docker ps` lista los pasteles (contenedores) que están actualmente en el horno (ejecutándose). Confundir estos dos conceptos es el error más común de quien empieza con Docker.

**Diagrama:**

```
Dockerfile:                     Imagen (capas apiladas):
FROM node:20        ──▶         ┌─────────────────────┐
RUN npm install      ──▶        │ Capa 3: código app    │
COPY . .             ──▶        │ Capa 2: dependencias  │
CMD ["node","app.js"]           │ Capa 1: node:20 base  │
                                 └─────────────────────┘
                                          │
                            docker run    ▼
                                 ┌─────────────────────┐
                                 │ Contenedor (instancia │
                                 │ en ejecución, con su   │
                                 │ propio estado)         │
                                 └─────────────────────┘
```

### Tema 3: Registros de contenedores (Docker Hub)

**Conceptos clave:** registro (registry), repositorio, etiqueta (tag), imagen pública vs privada.

Un registro de contenedores es un servidor que almacena y distribuye imágenes Docker, de forma parecida a como un repositorio de Git almacena y distribuye código fuente. Docker Hub es el registro público más usado del mundo: cuando ejecutas `docker pull floci/floci:latest`, Docker contacta con Docker Hub, localiza el repositorio `floci/floci`, descarga la imagen etiquetada como `latest`, y la guarda localmente para que puedas usarla con `docker run`.

Cada imagen en un registro vive dentro de un repositorio, identificado normalmente como `usuario-u-organización/nombre-imagen`, y cada repositorio puede tener múltiples versiones distinguidas por etiquetas (tags). La etiqueta `latest` es una convención —no una regla técnica— que casi todos los proyectos usan para señalar la versión más reciente estable, pero en proyectos serios es buena práctica fijar una versión explícita (como `floci/floci:2.3.0`) en vez de depender de `latest`, precisamente porque `latest` puede cambiar de contenido con el tiempo y romper algo que funcionaba antes sin previo aviso.

Además de Docker Hub, existen registros privados (para imágenes internas de una empresa que no deben ser públicas) y registros gestionados por proveedores de nube, como Amazon ECR, que vas a conocer en un módulo avanzado más adelante en este mismo track. El flujo de trabajo es siempre el mismo independientemente del registro: construyes una imagen localmente, la etiquetas con el nombre del registro de destino, y la subes (`push`) para que otras personas o sistemas puedan descargarla (`pull`).

Para este módulo, lo único que necesitas hacer es descargar (`pull`) imágenes ya publicadas —la de prueba `hello-world` y la de Floci—, sin necesidad de publicar nada tú mismo todavía. Publicar tus propias imágenes es algo que verás en el módulo avanzado de ECR/ECS, cuando empaquetes tu propia aplicación del proyecto final.

**Analogía:** Docker Hub es como una tienda de aplicaciones (App Store o Play Store) pero para contenedores: buscas por nombre, ves las versiones disponibles (como las versiones de una app), y descargas (`pull`) la que necesitas. La diferencia es que cualquiera puede publicar sus propias "aplicaciones" (imágenes) sin pasar por un proceso de revisión tan estricto como el de esas tiendas.

**¿Por qué es importante?** Sin un registro central, cada persona tendría que construir cada imagen desde cero en su propia máquina, incluyendo imágenes complejas como la de Floci, que empaqueta múltiples emuladores de servicios de nube. El registro es lo que hace posible que en el siguiente laboratorio simplemente ejecutes un comando de `pull` y tengas Floci funcionando en minutos, en vez de construirlo tú mismo desde su código fuente.

**Diagrama:**

```
┌──────────────┐   docker push    ┌──────────────────┐   docker pull   ┌──────────────┐
│  Tu máquina   │ ───────────────▶ │   Docker Hub       │ ──────────────▶│  Tu máquina   │
│ (construyes)  │                  │ floci/floci:latest │                │ (descargas)   │
└──────────────┘                  └──────────────────┘                └──────────────┘
```

### Tema 4: Comandos esenciales de Docker

**Conceptos clave:** `pull`, `run`, `ps`, `stop`, `rm`, `images`, `exec`, `logs`.

Estos ocho comandos cubren el ciclo de vida completo de un contenedor y son, con diferencia, los que más vas a usar en todo el curso. `docker pull <imagen>` descarga una imagen desde un registro sin ejecutarla todavía. `docker run <imagen>` crea y arranca un contenedor nuevo a partir de una imagen (descargándola primero si no la tienes localmente); con la opción `-d` lo ejecuta en segundo plano (modo *detached*), y con `-p host:contenedor` mapea un puerto de tu máquina a un puerto dentro del contenedor, que es exactamente lo que vas a usar para exponer Floci en el puerto 4566.

`docker ps` lista los contenedores que están actualmente en ejecución, mostrando su ID, la imagen de la que provienen, cuánto tiempo llevan corriendo, y los puertos mapeados; añadiendo `-a` muestra también los contenedores detenidos, no solo los activos. `docker stop <id>` detiene un contenedor en ejecución de forma ordenada, enviándole una señal que le da tiempo a cerrar limpiamente antes de forzarlo. `docker rm <id>` elimina un contenedor ya detenido (no se puede eliminar uno en ejecución sin forzarlo con `-f`); esto libera el nombre y el espacio que ocupaba, pero no borra la imagen de la que provenía.

`docker images` lista las imágenes que tienes descargadas localmente, con su repositorio, etiqueta, ID y tamaño en disco; es el comando análogo a `docker ps` pero para imágenes en vez de contenedores en ejecución. `docker exec -it <id> <comando>` ejecuta un comando dentro de un contenedor que ya está corriendo, sin necesidad de detenerlo; el uso más común es abrir una terminal interactiva dentro del contenedor con `docker exec -it <id> /bin/sh` o `/bin/bash`, muy útil para inspeccionar el estado interno de Floci si algo no funciona como esperas.

`docker logs <id>` muestra la salida estándar (y de error) que ha generado un contenedor desde que arrancó; con la opción `-f` sigue mostrando nuevas líneas en tiempo real, similar a `tail -f` sobre un archivo de log. Este comando es tu primera herramienta de diagnóstico cuando algo en Floci no responde como esperas: casi siempre el motivo está explicado en sus logs.

**Analogía:** si piensas en un contenedor como un electrodoméstico, `docker pull` es comprarlo (llega a tu casa pero no está enchufado), `docker run` es enchufarlo y encenderlo, `docker ps` es mirar qué electrodomésticos están encendidos ahora mismo, `docker stop` es apagarlo con el botón (de forma ordenada), `docker rm` es sacarlo de la habitación una vez apagado, `docker exec` es abrir una trampilla de servicio para revisar su interior mientras sigue encendido, y `docker logs` es leer el panel de diagnóstico que muestra lo que ha estado haciendo.

**¿Por qué es importante?** Estos ocho comandos son, con diferencia, la interacción diaria más común con Docker en cualquier trabajo real que use contenedores. Vas a usarlos constantemente a lo largo de todo el curso, empezando por el laboratorio de este mismo módulo, así que vale la pena que los practiques hasta que los escribas sin pensar.

**Diagrama:**

```
docker pull ──▶ (imagen en disco) ──▶ docker run ──▶ (contenedor corriendo)
                                                          │
                          ┌───────────────┬───────────────┼───────────────┐
                          ▼               ▼               ▼               ▼
                     docker ps      docker logs      docker exec      docker stop
                  (ver si corre)   (ver su salida)  (entrar dentro)   (apagarlo)
                                                                          │
                                                                          ▼
                                                                     docker rm
                                                                  (eliminarlo)
```

### Tema 5: Docker Compose — servicios, redes y volúmenes

**Conceptos clave:** `docker-compose.yml`, servicio, red por defecto, volumen, `docker compose up/down`.

Docker Compose resuelve un problema que aparece en cuanto necesitas más de un contenedor trabajando juntos: en vez de escribir un comando `docker run` largo y repetirlo cada vez (con todos sus puertos, variables de entorno y volúmenes), describes toda la configuración una sola vez en un archivo de texto llamado `docker-compose.yml`, y Docker Compose se encarga de levantar (o destruir) todos los contenedores descritos con un solo comando.

Cada bloque bajo la clave `services` en ese archivo describe un servicio: qué imagen usa, qué puertos expone, qué variables de entorno necesita, y qué volúmenes monta. Cuando ejecutas `docker compose up`, Compose crea automáticamente una red virtual compartida entre todos los servicios definidos en ese archivo, de forma que cada servicio puede llamar a los demás usando su nombre de servicio como si fuera un nombre de host (por ejemplo, un servicio `backend` puede conectarse a un servicio `db` simplemente usando `db` como dirección, sin necesidad de conocer una IP).

Los volúmenes resuelven el problema de la persistencia: por defecto, todo lo que un contenedor escribe en su sistema de archivos desaparece cuando el contenedor se elimina, porque esos datos viven dentro de la capa superior (efímera) del contenedor. Un volumen monta un directorio del host (o un volumen gestionado por Docker) dentro del contenedor, de forma que los datos escritos ahí sobreviven aunque el contenedor se destruya y se vuelva a crear. Esto es relevante para Floci: si quieres que el estado de tus buckets S3 o tus tablas DynamoDB sobreviva a un reinicio del contenedor, necesitas montar un volumen para la carpeta donde Floci guarda su estado.

`docker compose up -d` levanta todos los servicios definidos en segundo plano; `docker compose down` los detiene y elimina (pero no borra los volúmenes con nombre, a menos que añadas la opción `-v`); `docker compose ps` lista el estado de los servicios definidos en el archivo actual; y `docker compose logs -f` muestra los logs combinados de todos los servicios en tiempo real. Este conjunto de comandos reemplaza, con mucha más comodidad, a levantar cada contenedor manualmente con `docker run`.

**Analogía:** si `docker run` es encender un electrodoméstico a la vez, Docker Compose es el interruptor general de una casa inteligente: con un solo comando enciendes (o apagas) todos los dispositivos configurados, cada uno con su propia configuración ya guardada, y todos conectados entre sí por la misma red doméstica sin que tengas que configurar esa conexión cada vez.

**¿Por qué es importante?** Vas a usar Docker Compose para levantar Floci en el laboratorio de este módulo, y probablemente lo uses también en el proyecto final del Módulo 9, donde puede que necesites correr Floci junto a otros servicios de tu propia aplicación. Escribir un `docker-compose.yml` correcto es una habilidad que se usa a diario en el desarrollo de software moderno.

**Diagrama:**

```
docker-compose.yml
┌───────────────────────────────┐
│ services:                       │
│   floci:                        │      docker compose up
│     image: floci/floci:latest   │  ────────────────────────▶
│     ports: ["4566:4566"]        │
│     volumes: ["./data:/state"]  │      Red compartida "compose_default"
└───────────────────────────────┘      ┌─────────────────────────┐
                                        │  Contenedor: floci        │
                                        │  Puerto 4566 expuesto      │
                                        │  Volumen ./data ↔ /state   │
                                        └─────────────────────────┘
```

---

## Laboratorio práctico

**Objetivo del laboratorio:** ejecutar los comandos esenciales de Docker sobre una imagen de prueba, escribir tu primer `docker-compose.yml`, y levantar Floci (AWS) por primera vez, dejándolo verificado y con la AWS CLI configurada para hablar con él.

**Requisitos previos:** Docker instalado y verificado (Módulo 0), AWS CLI instalada y verificada (Módulo 0), variables de entorno `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` y `AWS_DEFAULT_REGION` configuradas en tu sesión de terminal.

### Laboratorio 1.1 — Comandos esenciales con una imagen de prueba

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Descargar imagen de prueba | `docker pull hello-world` | Descarga la imagen sin ejecutarla todavía | Líneas de descarga terminando en `Status: Downloaded newer image for hello-world:latest` |
| 2 | Ejecutarla | `docker run hello-world` | Crea y arranca un contenedor a partir de esa imagen | Texto que empieza con `Hello from Docker!` |
| 3 | Ver contenedores detenidos | `docker ps -a` | El contenedor de `hello-world` termina su trabajo y se detiene solo; `-a` lo muestra aunque ya no esté corriendo | Una fila con `hello-world` y estado `Exited (0)` |
| 4 | Ver imágenes descargadas | `docker images` | Lista las imágenes locales, incluyendo `hello-world` | Una fila `hello-world latest ...` |
| 5 | Eliminar el contenedor detenido | `docker rm <id-del-contenedor>` (el ID sale de `docker ps -a`) | Libera el contenedor detenido; la imagen sigue en disco | No hay salida (o se imprime el ID eliminado) |

### Laboratorio 1.2 — Levantar Floci con Docker Compose

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Crear un archivo `docker-compose.yml` con este contenido:<br>`services:`<br>`  floci:`<br>`    image: floci/floci:latest`<br>`    ports:`<br>`      - "4566:4566"`<br>`    environment:`<br>`      - SERVICES=s3,sqs,dynamodb,lambda,apigateway,iam` | — | Define un único servicio llamado `floci`, expone el puerto 4566 de tu máquina hacia el 4566 del contenedor, y activa solo los servicios que vas a usar en este track | El archivo se guarda sin errores de sintaxis |
| 2 | Levantar el servicio | `docker compose up -d` | Descarga la imagen si no la tienes y arranca el contenedor en segundo plano | Una línea `Container ..._floci_1  Started` (o similar) |
| 3 | Confirmar que está corriendo | `docker ps` | Debe aparecer el contenedor `floci` con el puerto `4566` mapeado | Una fila con la imagen `floci/floci:latest` y `0.0.0.0:4566->4566/tcp` |
| 4 | Ver los logs de arranque | `docker compose logs -f floci` | Floci imprime en sus logs qué servicios ha inicializado correctamente | Líneas indicando que S3, SQS, DynamoDB, Lambda, API Gateway e IAM están listos (`Ready.`) |
| 5 | Verificar el endpoint de salud | `curl http://localhost:4566/_localstack/health` | Floci expone un endpoint de salud compatible con el de LocalStack que reporta el estado de cada servicio emulado | Un JSON con cada servicio en estado `"available"` o `"running"` |

### Laboratorio 1.3 — Configurar y probar la AWS CLI contra Floci

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Listar buckets S3 (debería estar vacío) | `aws s3 ls --endpoint-url=http://localhost:4566` | Prueba de extremo a extremo: la CLI habla con Floci en vez de con AWS real | Ninguna línea de salida (todavía no hay buckets) |
| 2 | Crear un perfil dedicado (opcional pero recomendado) | `aws configure set aws_access_key_id test --profile floci`<br>`aws configure set aws_secret_access_key test --profile floci`<br>`aws configure set region us-east-1 --profile floci` | Evita depender de variables de entorno de sesión; el perfil `floci` queda guardado permanentemente | No hay salida (los valores quedan guardados en `~/.aws/credentials` y `~/.aws/config`) |
| 3 | Repetir el listado usando el perfil | `aws s3 ls --endpoint-url=http://localhost:4566 --profile floci` | Confirma que el perfil dedicado funciona igual que las variables de entorno | Ninguna línea de salida, sin errores |

**Verificación:** el laboratorio se considera exitoso si `docker ps` muestra el contenedor `floci` corriendo con el puerto 4566 mapeado, `curl http://localhost:4566/_localstack/health` responde con un JSON de servicios disponibles, y `aws s3 ls --endpoint-url=http://localhost:4566` se ejecuta sin errores de conexión o de credenciales.

**Errores comunes y soluciones**

- **`Error response from daemon: port is already allocated`.** Otro proceso (quizá un LocalStack anterior, o una instancia previa de Floci) ya está usando el puerto 4566. Detén ese contenedor con `docker ps` + `docker stop <id>`, o cambia el mapeo de puertos en tu `docker-compose.yml` a, por ejemplo, `"4567:4566"` y usa ese puerto en tus comandos.
- **`Could not connect to the endpoint URL` al ejecutar comandos de AWS CLI.** El contenedor de Floci no está corriendo, o todavía está inicializando. Ejecuta `docker ps` para confirmar que está `Up`, y revisa `docker compose logs -f floci` hasta ver que los servicios reportan estar listos antes de volver a intentar.
- **`Unable to locate credentials` al ejecutar un comando de AWS CLI.** Las variables de entorno del Módulo 0 no están activas en la sesión actual de terminal (se pierden al cerrarla), o no creaste el perfil `floci`. Vuelve a exportarlas, o usa `--profile floci` si ya lo configuraste.
- **El endpoint de salud responde pero un servicio aparece como `"disabled"`.** Revisa la variable de entorno `SERVICES` en tu `docker-compose.yml`: si un servicio no está listado ahí, Floci no lo inicializa. Añádelo a la lista separada por comas y vuelve a levantar el contenedor con `docker compose up -d`.

---

## Ejercicios de evaluación

### Ejercicio 1: Imagen vs contenedor

**Enunciado:** ejecuta `docker images` y `docker ps -a` en tu terminal, y explica con tus propias palabras, usando la salida real de ambos comandos, la diferencia entre una imagen y un contenedor.

**Solución esperada:** `docker images` debe mostrar al menos las imágenes `hello-world` y `floci/floci`, con su tamaño en disco; `docker ps -a` debe mostrar contenedores (instancias) creados a partir de esas imágenes, cada uno con su propio ID y estado (`Up` o `Exited`). La explicación correcta identifica que una misma imagen puede dar lugar a múltiples contenedores distintos.

**Criterios de éxito:**
- Ejecutaste realmente ambos comandos y usaste su salida real, no una genérica.
- La explicación distingue correctamente imagen (plantilla) de contenedor (instancia en ejecución).

### Ejercicio 2: Diagnosticar con logs

**Enunciado:** detén el contenedor de Floci con `docker compose down`, cambia intencionalmente el puerto del `docker-compose.yml` de `"4566:4566"` a `"4566:4567"` (un mapeo incorrecto para este ejercicio), vuelve a levantarlo, e intenta ejecutar `curl http://localhost:4566/_localstack/health`. Diagnostica el problema usando `docker logs` o `docker ps`, corrige el archivo, y vuelve a verificar que el endpoint responde.

**Solución esperada:** con el mapeo `"4566:4567"`, el contenedor expone el puerto 4567 interno, pero Floci en realidad escucha en el 4566 interno, así que la petición a `localhost:4566` no llega a nada válido. `docker ps` muestra el mapeo de puertos incorrecto directamente en su salida, lo que permite detectar el error sin necesidad de revisar logs. La corrección es volver el mapeo a `"4566:4566"`.

**Criterios de éxito:**
- Identificaste el problema usando herramientas de diagnóstico de Docker (`docker ps` o `docker logs`), no solo por ensayo y error.
- Corregiste el archivo y verificaste que el endpoint de salud vuelve a responder correctamente.

### Ejercicio 3: Levantar y destruir el entorno completo

**Enunciado:** partiendo de un estado limpio (`docker compose down`), levanta Floci de nuevo, crea un bucket con `aws s3 mb s3://prueba-modulo-1 --endpoint-url=http://localhost:4566`, confírmalo con `aws s3 ls`, y después destruye completamente el entorno con `docker compose down`. Vuelve a levantarlo y comprueba si el bucket sigue existiendo.

**Solución esperada:** sin un volumen persistente configurado, el bucket desaparece al destruir y recrear el contenedor, porque el estado de Floci vivía únicamente dentro de la capa efímera del contenedor eliminado. `aws s3 ls` después de recrearlo debe devolver una lista vacía.

**Criterios de éxito:**
- Confirmaste explícitamente, con el comando `aws s3 ls`, que el bucket ya no existe tras recrear el contenedor.
- Puedes explicar por qué desapareció (falta de volumen persistente) relacionándolo con el Tema 5 de este módulo.

---

## Resumen del módulo

**Puntos clave**

- Los contenedores comparten el kernel del sistema anfitrión, lo que los hace mucho más ligeros y rápidos de arrancar que las máquinas virtuales tradicionales.
- Una imagen es una plantilla inmutable construida en capas; un contenedor es una instancia en ejecución de esa imagen.
- Docker Hub (y otros registros) permiten descargar y distribuir imágenes ya construidas, como la de Floci.
- Los ocho comandos esenciales de Docker (`pull`, `run`, `ps`, `stop`, `rm`, `images`, `exec`, `logs`) cubren el ciclo de vida completo de un contenedor.
- Docker Compose describe uno o varios servicios en un archivo de texto, y crea automáticamente una red compartida entre ellos; los volúmenes son necesarios si quieres que el estado sobreviva a la destrucción del contenedor.
- Floci corre como un contenedor Docker normal, expuesto en el puerto 4566, y se verifica con su endpoint de salud compatible con LocalStack.

**Conceptos aprendidos**

- Virtualización vs contenedores y por qué los contenedores son más eficientes.
- Imágenes, capas y su reutilización como caché.
- Registros de contenedores y el flujo `pull`/`push`.
- Los ocho comandos esenciales de Docker.
- Docker Compose: servicios, red compartida y volúmenes.
- Cómo levantar y verificar Floci con Docker Compose y la AWS CLI.

**Próximos pasos**

Con Floci corriendo y verificado, en el Módulo 2 vas a usar tu primer servicio real: S3, empezando por el concepto de objeto, bucket, y las operaciones básicas de subir, listar, descargar y eliminar archivos.

**Recursos adicionales**

- Documentación oficial de Docker: "Get Started" y referencia de comandos de la CLI.
- Documentación oficial de Docker Compose: referencia del formato `docker-compose.yml`.
- Documentación de LocalStack sobre el endpoint `/_localstack/health`, en el que se basa el de Floci.
