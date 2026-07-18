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

## Comienza desde cero: prepara este capítulo

Este recorrido parte de una carpeta vacía. Al finalizar tendrás **Dos laboratorios prácticos (levantar Floci y configurar la AWS CLI contra él) y tres ejercicios de evaluación que comprueban que entiendes la diferencia entre imagen y contenedor, que sabes leer el estado de contenedores en ejecución, y que puedes levantar y destruir el entorno de Floci sin ayuda.** No avances ejecutando comandos que no comprendes: primero identifica la entrada, la transformación y la evidencia que comprobará el resultado.

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
│  └─ module-1/
├─ tests/
├─ docs/decisions/
├─ evidence/module-1/
└─ README.md
```

| Tema | Archivo o decisión | Evidencia mínima |
|---|---|---|
| 1. Virtualización vs contenedores | `infra/module-1/topic-1-virtualizacion-vs-contenedores.tf` | prueba + salida observable |
| 2. Imágenes y capas | `infra/module-1/topic-2-imagenes-y-capas.tf` | prueba + salida observable |
| 3. Registros de contenedores (Docker Hub) | `infra/module-1/topic-3-registros-de-contenedores-docker-hub.tf` | prueba + salida observable |
| 4. Comandos esenciales de Docker | `infra/module-1/topic-4-comandos-esenciales-de-docker.tf` | prueba + salida observable |
| 5. Docker Compose — servicios, redes y volúmenes | `infra/module-1/topic-5-docker-compose-servicios-redes-y-volumenes.tf` | prueba + salida observable |

Un ejemplo técnico vive en el archivo indicado y debe tener una prueba. Un tema conceptual vive en `docs/decisions/`: compara opciones usando restricciones medibles; no escribas código decorativo solo para llenar espacio.

### 4. Ejecuta una línea base

Desde `academia-labs/cloud`:

```bash
terraform -chdir=infra validate
```

**Resultado esperado:** el comando reconoce el proyecto y termina sin errores antes de introducir el cambio del capítulo. Después del incremento, la evidencia debe demostrar: **Dos laboratorios prácticos (levantar Floci y configurar la AWS CLI contra él) y tres ejercicios de evaluación que comprueban que entiendes la diferencia entre imagen y contenedor, que sabes leer el estado de contenedores en ejecución, y que puedes levantar y destruir el entorno de Floci sin ayuda.**

Si falla la línea base, no continúes. Localiza el primer mensaje que indique archivo, línea o dependencia; formula una causa y compruébala con un cambio pequeño.

### 5. Provoca un fallo y recupérate

Cambia un endpoint, permiso o identificador por un valor inválido; inspecciona la respuesta del emulador antes de corregir. Guarda en `evidence/module-1/` el comando, la salida relevante, tu hipótesis y la corrección. Revierte únicamente el cambio deliberado; no borres todo el proyecto para ocultar la causa.

### 6. Conecta el capítulo con RutaFlow

Aplica el aprendizaje de **Fundamentos de Docker y contenedores** a un incremento vertical de RutaFlow. Define qué componente produce el dato, qué contrato lo transporta, quién lo consume y cómo observarás un fallo. La entrega final incluye archivo o decisión, prueba, salida, error corregido y una limitación que todavía validarías en producción.

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

**¿Por qué es importante?** En el laboratorio de este módulo vas a usar `floci-cli` como flujo principal, pero Docker Compose sigue siendo la herramienta correcta en cuanto necesites correr Floci junto a otros servicios de tu propia aplicación —como probablemente hagas en el proyecto final del Módulo 9— o correr AWS, Azure y GCP local a la vez. Escribir un `docker-compose.yml` correcto es una habilidad que se usa a diario en el desarrollo de software moderno, con o sin Floci de por medio.

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

**Objetivo del laboratorio:** ejecutar los comandos esenciales de Docker sobre una imagen de prueba, instalar `floci-cli` —la herramienta oficial recomendada para gestionar Floci— y levantarlo por primera vez con la AWS CLI ya configurada para hablar con él.

**Requisitos previos:** Docker instalado y verificado (Módulo 0), AWS CLI instalada y verificada (Módulo 0).

### Laboratorio 1.1 — Comandos esenciales con una imagen de prueba

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Descargar imagen de prueba | `docker pull hello-world` | Descarga la imagen sin ejecutarla todavía | Líneas de descarga terminando en `Status: Downloaded newer image for hello-world:latest` |
| 2 | Ejecutarla | `docker run hello-world` | Crea y arranca un contenedor a partir de esa imagen | Texto que empieza con `Hello from Docker!` |
| 3 | Ver contenedores detenidos | `docker ps -a` | El contenedor de `hello-world` termina su trabajo y se detiene solo; `-a` lo muestra aunque ya no esté corriendo | Una fila con `hello-world` y estado `Exited (0)` |
| 4 | Ver imágenes descargadas | `docker images` | Lista las imágenes locales, incluyendo `hello-world` | Una fila `hello-world latest ...` |
| 5 | Eliminar el contenedor detenido | `docker rm <id-del-contenedor>` (el ID sale de `docker ps -a`) | Libera el contenedor detenido; la imagen sigue en disco | No hay salida (o se imprime el ID eliminado) |

### Laboratorio 1.2 — Instalar floci-cli y levantar Floci

A partir de aquí, este curso usa `floci-cli` —la CLI oficial del proyecto— como flujo principal para levantar, verificar y detener Floci. Gestiona el contenedor por ti (incluyendo el montaje del socket de Docker) y expone comandos memorables en vez de flags largos de `docker run`.

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Instalar floci-cli (macOS/Linux) | `curl -fsSL https://floci.io/install.sh \| sh` | Descarga e instala el binario nativo de la CLI; en Windows usa `iwr https://floci.io/install.ps1 \| iex` en PowerShell, o `brew install floci-io/floci/floci` con Homebrew | Mensaje `Floci CLI ... installed to ...` |
| 2 | Levantar Floci (AWS) | `floci start` | Descarga la imagen si hace falta, arranca el contenedor y espera a que esté listo — sin que tengas que escribir `-p 4566:4566` ni montar el socket de Docker a mano | Un mensaje confirmando que Floci está corriendo en el puerto 4566 |
| 3 | Diagnosticar el entorno | `floci doctor` | Verifica Docker, el socket, la conectividad y la versión de la imagen en un solo comando | Una lista de chequeos, todos en verde/OK |
| 4 | Cargar las variables de entorno de AWS | `eval $(floci env)` | Exporta `AWS_ENDPOINT_URL`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` y `AWS_DEFAULT_REGION` en tu sesión actual, apuntando a Floci — a partir de aquí, el resto del curso asume que ejecutaste este paso, así que los comandos de `aws` ya no necesitan repetir `--endpoint-url` | Sin salida visible (las variables quedan exportadas en tu shell) |
| 5 | Confirmar el estado | `floci status` | Detecta automáticamente el puerto y consulta la salud del servidor | Estado `running` con el detalle de servicios habilitados |

### Laboratorio 1.3 — Probar la AWS CLI contra Floci

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Listar buckets S3 (debería estar vacío) | `aws s3 ls` | Con `eval $(floci env)` ya cargado, la CLI habla con Floci sin necesidad de ningún flag adicional | Ninguna línea de salida (todavía no hay buckets) |
| 2 | Ver los logs de arranque | `floci logs --tail 50` | Floci imprime en sus logs qué servicios ha inicializado correctamente | Líneas indicando que S3, SQS, DynamoDB, Lambda, API Gateway e IAM están listos |
| 3 | Detener Floci al terminar | `floci stop` | Detiene el contenedor de forma ordenada; usa `floci stop --remove` si además quieres eliminarlo | Confirmación de que el contenedor se detuvo |

**Alternativa: Docker Compose.** Si prefieres orquestar Floci junto a otros servicios (o necesitas correr AWS, Azure y GCP local a la vez, como en los Módulos 8 y 31), el `docker-compose.yml` de la raíz del proyecto sigue siendo válido:

```yaml
services:
  floci:
    image: floci/floci:latest
    ports:
      - "4566:4566"
```

```bash
docker compose up -d
# equivalente manual a `eval $(floci env)`:
export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test AWS_DEFAULT_REGION=us-east-1
```

### Laboratorio 1.4 — Usar StackPort y Floci UI

La academia ya incluye **StackPort** en su `docker-compose.yml`. Levántalo junto con Floci y abre `http://localhost:8080`:

```bash
docker compose up -d aws-local stackport
```

StackPort es útil como explorador AWS ligero y arranca en la misma red del laboratorio. También puedes usar Floci UI durante el curso; no son alternativas excluyentes.

Floci UI es un proyecto oficial separado porque incluye su propio frontend, API proxy y configuración de runtimes. No intentes iniciarlo con `docker run floci/floci-ui:latest`: clona el repositorio y usa su Docker Compose, que mantiene coordinados todos sus servicios.

```bash
git clone https://github.com/floci-io/floci-ui.git
cd floci-ui
docker compose up -d
docker compose ps
```

**Evita el conflicto del puerto 4566:** el Compose de Floci UI incluye por defecto su propio runtime Floci, igual que la academia. Para probar su stack completo, detén primero el Compose de la academia con `docker compose down` desde la carpeta de Academia_Floci. Para mantener StackPort y Floci UI abiertos simultáneamente y viendo exactamente los mismos recursos, configura la API de Floci UI con `FLOCI_ENDPOINT` apuntando al runtime ya existente y no levantes el segundo servicio Floci; sigue el Compose y `.env.example` de la versión de Floci UI que hayas clonado.

Abre `http://localhost:4500`. Debes ver **Console Home**, el estado del runtime AWS y el acceso a **Cloud Explorer**. Para levantar también runtimes Azure y GCP usa `docker compose --profile multicloud up -d`. Los puertos predeterminados son UI `4500`, API `4501` y Floci AWS `4566`.

Realiza una primera comprobación de extremo a extremo:

```bash
aws --endpoint-url=http://localhost:4566 s3 mb s3://mi-primer-bucket-visual
```

Repite la comprobación visual primero en StackPort y después en Floci UI, o en ambas simultáneamente si las configuraste contra el mismo runtime. Localiza `mi-primer-bucket-visual`, confirma proveedor, región y tipo, elimínalo desde CLI y comprueba que desaparece. Así aprendes las fortalezas de ambas interfaces sin confundir dos runtimes independientes.

**Mapa de disponibilidad actual:** Storage es la superficie multi-cloud más completa; AWS Compute, Networking, EKS y Serverless tienen flujos reales; Secrets Manager conserva una página AWS dedicada. Queue, IAM y otros servicios todavía pueden mostrarse como placeholders. La interfaz declara estas limitaciones deliberadamente y no inventa recursos de demostración. Cuando una operación no esté conectada, usa CLI/SDK como fuente de verdad.

**Verificación:** el laboratorio se considera exitoso si `floci status` reporta el servidor corriendo, `aws s3 ls` funciona con el endpoint local y el bucket creado por CLI aparece al menos en una consola visual configurada —idealmente en StackPort y Floci UI— antes de desaparecer tras su eliminación.

**Errores comunes y soluciones**

- **`floci start` falla con un error de Docker.** Docker Desktop debe estar abierto y corriendo; `floci doctor` te dice exactamente qué chequeo falló (Docker no instalado, socket no accesible, daemon no iniciado).
- **`aws s3 ls` responde `Unable to locate credentials` o intenta conectar a AWS real.** Se te olvidó ejecutar `eval $(floci env)` en la sesión actual de terminal, o abriste una pestaña nueva donde esas variables no están exportadas — las variables de entorno no persisten entre sesiones de shell.
- **Puerto ya en uso al ejecutar `floci start`.** Otro proceso (quizá una instancia previa de Floci o de LocalStack) ya usa el puerto 4566. Usa `floci start --port 4599` para un puerto alternativo, o detén el proceso anterior con `floci stop`.
- **`floci doctor` reporta el socket de Docker inaccesible en Podman o un daemon remoto.** Exporta `DOCKER_HOST` apuntando a tu socket o daemon (`unix:///run/user/1000/podman/podman.sock` para Podman rootless, por ejemplo); `floci start` lo detecta automáticamente sin flags adicionales.

---

## Ejercicios de evaluación

### Ejercicio 1: Imagen vs contenedor

**Enunciado:** ejecuta `docker images` y `docker ps -a` en tu terminal, y explica con tus propias palabras, usando la salida real de ambos comandos, la diferencia entre una imagen y un contenedor.

**Solución esperada:** `docker images` debe mostrar al menos las imágenes `hello-world` y `floci/floci`, con su tamaño en disco; `docker ps -a` debe mostrar contenedores (instancias) creados a partir de esas imágenes, cada uno con su propio ID y estado (`Up` o `Exited`). La explicación correcta identifica que una misma imagen puede dar lugar a múltiples contenedores distintos.

**Criterios de éxito:**
- Ejecutaste realmente ambos comandos y usaste su salida real, no una genérica.
- La explicación distingue correctamente imagen (plantilla) de contenedor (instancia en ejecución).

### Ejercicio 2: Diagnosticar con logs

**Enunciado:** detén Floci con `floci stop --remove`, vuelve a levantarlo en un puerto distinto con `floci start --port 4599`, e intenta ejecutar `aws s3 ls` usando las variables de entorno cargadas con `eval $(floci env)` de un paso anterior (que todavía apuntan al puerto 4566). Diagnostica el problema con `floci status` y `floci doctor`, corrige el problema, y vuelve a verificar.

**Solución esperada:** `aws s3 ls` falla con un error de conexión porque `AWS_ENDPOINT_URL` sigue apuntando a `http://localhost.floci.io:4566`, pero Floci ahora escucha en el 4599. `floci status` (que autodetecta el puerto del contenedor) muestra el puerto real; la corrección es volver a ejecutar `eval $(floci env)` para que recoja el nuevo puerto, o relanzar Floci en el puerto por defecto.

**Criterios de éxito:**
- Identificaste el problema usando `floci status`/`floci doctor`, no solo por ensayo y error.
- Corregiste las variables de entorno y verificaste que `aws s3 ls` vuelve a responder correctamente.

### Ejercicio 3: Levantar y destruir el entorno completo

**Enunciado:** partiendo de un estado limpio (`floci stop --remove`), levanta Floci de nuevo con `floci start`, crea un bucket con `aws s3 mb s3://prueba-modulo-1`, confírmalo con `aws s3 ls`, y después destruye completamente el entorno con `floci stop --remove`. Vuelve a levantarlo y comprueba si el bucket sigue existiendo.

**Solución esperada:** sin `--persist` configurado, el bucket desaparece al destruir y recrear el contenedor, porque el estado de Floci vivía únicamente dentro de la capa efímera del contenedor eliminado. `aws s3 ls` después de recrearlo debe devolver una lista vacía.

**Criterios de éxito:**
- Confirmaste explícitamente, con el comando `aws s3 ls`, que el bucket ya no existe tras recrear el contenedor.
- Puedes explicar por qué desapareció (falta de `floci start --persist ./data`) relacionándolo con el Tema 5 de este módulo.

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

<!-- REQUESTED-PRACTICAL-EXAMPLES:START -->
## Ejemplos guiados de los temas solicitados

Estos ejemplos acompañan la ampliación académica. No son código para copiar sin contexto: ejecuta, modifica, provoca un fallo y conserva la evidencia.

### Ejemplo guiado: Recuperación ante desastres (DR)

**Qué demuestra:** convierte el concepto en una evidencia pequeña, explícita y verificable dentro de RutaFlow. El ejemplo separa la decisión del framework para poder probarla y cambiarla.

```hcl
locals {
  capability = "Recuperación ante desastres (DR)"
  tags = { system = "rutaflow", owner = "platform", managed_by = "terraform" }
}

output "recuperacion_ante_desastres_dr_evidence" { value = local.tags }
```

**Práctica:** reemplaza el resultado exitoso por un fallo realista, agrega una aserción automatizada y registra qué señal permitiría diagnosticarlo en producción.

<!-- REQUESTED-PRACTICAL-EXAMPLES:END -->

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
