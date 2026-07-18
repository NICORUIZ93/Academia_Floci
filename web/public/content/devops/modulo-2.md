# Módulo 2: Docker — imágenes y buenas prácticas

## Sílabo

**Objetivo general**

Empaquetar aplicaciones propias en imágenes Docker reproducibles y optimizadas, dominando Dockerfiles multi-stage, gestión de capas, imágenes base mínimas, y la diferencia entre volúmenes y bind mounts.

**Objetivos específicos**

1. Escribir un Dockerfile de una sola etapa y medir el tamaño de imagen resultante.
2. Reescribirlo como multi-stage y explicar por qué reduce el tamaño final.
3. Ordenar las instrucciones de un Dockerfile para maximizar el aprovechamiento de caché.
4. Elegir una imagen base apropiada (completa, alpine o distroless) según el caso de uso.
5. Diferenciar volúmenes gestionados de bind mounts y saber cuándo usar cada uno.
6. Explicar el propósito de un registry y comparar las opciones más usadas.

**Contenido**

- Dockerfile multi-stage.
- Capas e invalidación de caché.
- Imágenes base distroless/alpine.
- Volúmenes vs bind mounts.
- Redes en Docker.
- Registries: Docker Hub, AWS ECR, Azure Container Registry, Harbor.

**Evaluación**

Un laboratorio que construye, mide y optimiza progresivamente la imagen de una API propia, y tres ejercicios de evaluación sobre orden de capas, elección de imagen base, y volúmenes frente a bind mounts.

---

## Comienza desde cero: prepara este capítulo

Este recorrido parte de una carpeta vacía. Al finalizar tendrás **Un laboratorio que construye, mide y optimiza progresivamente la imagen de una API propia, y tres ejercicios de evaluación sobre orden de capas, elección de imagen base, y volúmenes frente a bind mounts.** No avances ejecutando comandos que no comprendes: primero identifica la entrada, la transformación y la evidencia que comprobará el resultado.

### 1. Comprueba las herramientas

Los comandos funcionan en macOS, Linux y WSL. En PowerShell usa el equivalente indicado por la herramienta.

```bash
git --version
docker --version
bash --version
```

Si un comando no existe, detente e instala esa herramienta desde su sitio oficial. Cierra y abre la terminal después de modificar `PATH`. Las versiones deben ser compatibles entre sí antes de crear archivos.

### 2. Crea o recupera el proyecto del track

```bash
mkdir -p academia-labs/devops/{app,infra,scripts,evidence}
cd academia-labs/devops
git init
```

Trabaja dentro de `academia-labs/devops`. Si ya existe, no lo vuelvas a generar: entra en la carpeta, confirma `git status` y continúa sobre una rama propia.

### 3. Ubica cada tema antes de escribir

```text
academia-labs/devops/
├─ infra/
│  └─ module-2/
├─ tests/
├─ docs/decisions/
├─ evidence/module-2/
└─ README.md
```

| Tema | Archivo o decisión | Evidencia mínima |
|---|---|---|
| 1. Dockerfile multi-stage | `infra/module-2/topic-1-dockerfile-multi-stage.yaml` | prueba + salida observable |
| 2. Capas e invalidación de caché | `infra/module-2/topic-2-capas-e-invalidacion-de-cache.yaml` | prueba + salida observable |
| 3. Imágenes base distroless/alpine | `infra/module-2/topic-3-imagenes-base-distroless-alpine.yaml` | prueba + salida observable |
| 4. Volúmenes vs bind mounts | `infra/module-2/topic-4-volumenes-vs-bind-mounts.yaml` | prueba + salida observable |
| 5. Redes en Docker | `infra/module-2/topic-5-redes-en-docker.yaml` | prueba + salida observable |
| 6. Registries — Docker Hub, AWS ECR, Azure Container Registry, Harbor | `infra/module-2/topic-6-registries-docker-hub-aws-ecr-azure-container-registry.yaml` | prueba + salida observable |

Un ejemplo técnico vive en el archivo indicado y debe tener una prueba. Un tema conceptual vive en `docs/decisions/`: compara opciones usando restricciones medibles; no escribas código decorativo solo para llenar espacio.

### 4. Ejecuta una línea base

Desde `academia-labs/devops`:

```bash
docker compose config
```

**Resultado esperado:** el comando reconoce el proyecto y termina sin errores antes de introducir el cambio del capítulo. Después del incremento, la evidencia debe demostrar: **Un laboratorio que construye, mide y optimiza progresivamente la imagen de una API propia, y tres ejercicios de evaluación sobre orden de capas, elección de imagen base, y volúmenes frente a bind mounts.**

Si falla la línea base, no continúes. Localiza el primer mensaje que indique archivo, línea o dependencia; formula una causa y compruébala con un cambio pequeño.

### 5. Provoca un fallo y recupérate

Rompe una referencia, variable o healthcheck y localiza la causa con la validación o los logs. Guarda en `evidence/module-2/` el comando, la salida relevante, tu hipótesis y la corrección. Revierte únicamente el cambio deliberado; no borres todo el proyecto para ocultar la causa.

### 6. Conecta el capítulo con RutaFlow

Aplica el aprendizaje de **Docker — imágenes y buenas prácticas** a un incremento vertical de RutaFlow. Define qué componente produce el dato, qué contrato lo transporta, quién lo consume y cómo observarás un fallo. La entrega final incluye archivo o decisión, prueba, salida, error corregido y una limitación que todavía validarías en producción.

---

## Contenido teórico

### Tema 1: Dockerfile multi-stage

**Conceptos clave:** etapa de build, etapa final, `COPY --from`, artefactos intermedios descartados.

Un Dockerfile de una sola etapa mezcla, en la misma imagen final, todo lo necesario para construir la aplicación (compiladores, herramientas de build, dependencias de desarrollo) con todo lo necesario únicamente para ejecutarla. El resultado es una imagen innecesariamente grande: cargas en producción herramientas que solo se usaron una vez, durante el proceso de construcción, y que nunca se necesitan durante la ejecución real de la aplicación.

Un Dockerfile multi-stage resuelve esto separando el proceso en etapas nombradas explícitamente con `AS <nombre>`. Una etapa de build (`FROM node:22-alpine AS build`) instala todas las dependencias, incluidas las de desarrollo, y ejecuta el proceso de compilación o empaquetado (`npm run build`, por ejemplo). Una segunda etapa, la final, parte de una imagen base limpia y usa `COPY --from=build <ruta-origen> <ruta-destino>` para copiar únicamente los artefactos ya construidos (el directorio `dist`, por ejemplo) desde la etapa de build, sin arrastrar el resto de las herramientas usadas para producirlos.

El resultado es que la imagen final contiene solo lo estrictamente necesario para ejecutar la aplicación: el código ya compilado y las dependencias de producción, sin compiladores, sin dependencias de desarrollo, sin archivos fuente intermedios. Docker descarta automáticamente el contenido de las etapas intermedias de la imagen final (aunque siguen existiendo temporalmente en la caché de build local, lo que además acelera reconstrucciones posteriores si esas etapas no cambiaron). Puedes tener más de dos etapas si tu proceso de construcción lo requiere (por ejemplo, una etapa que compila el frontend y otra que compila el backend, antes de una etapa final que combina ambos artefactos).

Esta técnica no es opcional en proyectos serios: la diferencia de tamaño entre una imagen de una sola etapa y su equivalente multi-stage puede ser de varias veces el tamaño (a menudo reduciendo cientos de megabytes a decenas), con impacto directo en la velocidad de despliegue, el uso de almacenamiento en registries, y la superficie de ataque de seguridad, ya que cada herramienta o dependencia adicional presente en la imagen final es, potencialmente, una vulnerabilidad más que gestionar.

**Analogía:** un Dockerfile de una sola etapa es como enviar a un cliente, junto con el mueble terminado, todas las herramientas, la madera sobrante y los planos de construcción usados para fabricarlo. Un Dockerfile multi-stage es como fabricar el mueble en el taller (la etapa de build, con todas sus herramientas), y enviar al cliente únicamente el mueble terminado, sin nada del proceso de fabricación.

**¿Por qué es importante?** El tamaño de una imagen Docker afecta directamente cuánto tarda en descargarse en cada despliegue, cuánto espacio consume en tus registries, y cuántas vulnerabilidades potenciales arrastra (cada paquete instalado es una superficie de ataque adicional). Multi-stage builds es, con diferencia, la técnica de mayor impacto y menor esfuerzo para reducir ambos problemas a la vez.

**Diagrama:**

```
FROM node:22-alpine AS build       ← Etapa "build": compiladores, deps de desarrollo
WORKDIR /app                          (se descarta al final, excepto lo copiado)
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine                ← Etapa final: imagen limpia
WORKDIR /app
COPY --from=build /app/dist ./dist    ← solo copia el artefacto ya construido
COPY package*.json ./
RUN npm ci --omit=dev                  (solo deps de producción)
CMD ["node", "dist/index.js"]
```

### Tema 2: Capas e invalidación de caché

**Conceptos clave:** capa por instrucción, caché de build, orden de instrucciones, invalidación en cascada.

Como viste en el track Cloud al estudiar Docker por primera vez, cada instrucción de un Dockerfile genera una capa nueva, y Docker cachea cada una de esas capas para acelerar reconstrucciones posteriores. Lo que se profundiza en este módulo es cómo el orden exacto de esas instrucciones determina qué tan efectivo es ese cacheo en la práctica: Docker invalida la caché de una capa (y de todas las capas siguientes, en cascada) tan pronto detecta que el contenido de esa instrucción cambió respecto al build anterior.

Este comportamiento en cascada es la razón detrás de un patrón que aparece en casi cualquier Dockerfile bien escrito de un proyecto Node.js: copiar primero `package.json` (y el archivo de lock correspondiente) y ejecutar `npm ci` en una capa separada, antes de copiar el resto del código fuente de la aplicación. Si copiaras todo el código de una sola vez y ejecutaras `npm ci` después, cualquier cambio en un solo archivo de código —aunque `package.json` no haya cambiado en absoluto— invalidaría la capa de `COPY` completa, y por cascada, también la capa de `npm ci` siguiente, forzando una reinstalación completa de todas las dependencias en cada build, incluso cuando ninguna dependencia cambió realmente.

Con el orden correcto (`package.json` copiado y sus dependencias instaladas antes que el resto del código), un cambio típico en el código de la aplicación solo invalida la capa de `COPY . .` y las que le siguen, pero la capa costosa de `npm ci` permanece cacheada intacta mientras `package.json` no cambie, ahorrando minutos de reinstalación de dependencias en cada build durante el desarrollo activo del proyecto.

La regla general para ordenar instrucciones en cualquier Dockerfile es: coloca primero las instrucciones que cambian con menor frecuencia (instalación del sistema operativo base, dependencias del proyecto) y deja para el final las que cambian con mayor frecuencia (el código fuente de la aplicación en sí). Esto maximiza la porción del Dockerfile que puede reutilizar caché en la mayoría de los builds del día a día.

**Analogía:** reordenar un Dockerfile para maximizar el caché es como preparar los ingredientes de una receta que rara vez cambian (la base de una salsa, que tarda horas en cocinarse) con anticipación y guardarlos listos, dejando para el último momento solo el ensamblaje final con los ingredientes frescos que sí cambian cada vez. Si mezclaras todo desde el principio cada vez, tendrías que volver a cocinar la base lenta cada vez que cambias un ingrediente fresco, aunque la base en sí no necesitara cambiar.

**¿Por qué es importante?** En proyectos con builds frecuentes (cada commit, en un pipeline de CI), la diferencia entre un Dockerfile bien ordenado y uno mal ordenado puede significar la diferencia entre un build de segundos (reutilizando caché) y un build de varios minutos (reinstalando dependencias desde cero en cada ejecución), con un impacto directo y acumulado en la velocidad de todo el pipeline de CI/CD que vas a construir en los módulos siguientes de este track.

**Diagrama:**

```
Orden CORRECTO (maximiza caché):        Orden INCORRECTO (invalida todo seguido):
COPY package*.json ./   ← cambia poco   COPY . .                ← cambia siempre
RUN npm ci               ← se cachea    RUN npm ci               ← se reinstala siempre,
COPY . .                 ← cambia          aunque package.json      aunque no haya
                            siempre         no haya cambiado         cambiado
```

### Tema 3: Imágenes base distroless/alpine

**Conceptos clave:** imagen base completa, Alpine Linux, distroless, superficie de ataque.

Una imagen base completa (por ejemplo, basada en Ubuntu o Debian estándar) incluye un sistema operativo completo con gestor de paquetes, shell, utilidades de línea de comandos y muchas librerías del sistema que la aplicación probablemente nunca use. Esto simplifica la depuración (puedes entrar con `docker exec -it` y tener disponible un shell completo con herramientas familiares), pero a costa de un tamaño de imagen considerablemente mayor y una superficie de ataque más amplia: cada paquete y utilidad presente en la imagen es, potencialmente, un vector de vulnerabilidad adicional que un atacante podría explotar si logra ejecutar código dentro del contenedor.

Alpine Linux es una distribución minimalista (su imagen base pesa apenas unos pocos megabytes, frente a los cientos de megabytes de una imagen completa de Ubuntu) que incluye un shell y un gestor de paquetes básico, pero prescinde de gran parte de las utilidades y librerías de una distribución completa. Usa una biblioteca C distinta (musl en vez de glibc), lo que en casos poco frecuentes puede causar incompatibilidades sutiles con binarios precompilados que asumen glibc, un detalle a tener en cuenta si tu aplicación depende de dependencias nativas compiladas.

Distroless lleva esta minimización un paso más allá: son imágenes base que contienen únicamente el runtime estrictamente necesario para ejecutar la aplicación (por ejemplo, el runtime de Node.js) y sus dependencias de sistema mínimas, sin shell, sin gestor de paquetes, sin ninguna utilidad adicional. Esto reduce la superficie de ataque al mínimo posible (si un atacante compromete la aplicación, ni siquiera tiene un shell disponible dentro del contenedor para explorar o pivotar), a costa de hacer la depuración más incómoda: no puedes simplemente `docker exec -it` para entrar con una terminal interactiva, porque no existe ningún shell instalado.

La elección entre estas tres opciones depende del contexto: para entornos de desarrollo donde la comodidad de depuración importa más, una imagen completa o Alpine son razonables. Para imágenes destinadas a producción, especialmente en contextos con requisitos de seguridad estrictos, Alpine o distroless son la elección recomendada por la mayoría de las guías de buenas prácticas actuales de la industria, priorizando minimizar la superficie de ataque sobre la comodidad de depuración interactiva directa dentro del contenedor.

**Analogía:** una imagen base completa es como alquilar una casa completamente amueblada con herramientas de todo tipo en el garaje, la mayoría de las cuales nunca vas a usar, pero que están ahí "por si acaso". Alpine es como una casa pequeña y eficiente con solo lo esencial. Distroless es como una habitación de hotel minimalista: tiene exactamente lo que necesitas para tu estancia (dormir), y nada más — ni siquiera una cocina que podrías usar mal.

**¿Por qué es importante?** Minimizar la imagen base es una de las prácticas de seguridad de mayor impacto y menor coste de implementación en cualquier pipeline de contenedores: reduce simultáneamente el tamaño de la imagen (más rápido de desplegar) y la superficie de ataque (menos vulnerabilidades potenciales), sin requerir cambios significativos en el código de la aplicación en sí.

**Diagrama:**

```
Imagen base completa (Ubuntu)    Alpine                  Distroless
┌─────────────────────┐        ┌─────────────┐        ┌─────────────┐
│ Shell, gestor de         │        │ Shell mínimo,  │        │ Solo el runtime │
│ paquetes, cientos de       │        │ gestor de        │        │ necesario,        │
│ utilidades                  │        │ paquetes apk,     │        │ SIN shell,          │
│ ~100-300 MB                  │        │ ~5 MB              │        │ SIN gestor de       │
│                                │        │                     │        │ paquetes              │
└─────────────────────┘        └─────────────┘        └─────────────┘
   Fácil de depurar,              Balance razonable         Mínima superficie
   mayor superficie                                          de ataque, más difícil
   de ataque                                                  de depurar interactivamente
```

### Tema 4: Volúmenes vs bind mounts

**Conceptos clave:** volumen gestionado por Docker, bind mount, persistencia, desarrollo con recarga en vivo.

Un volumen es un mecanismo de almacenamiento persistente gestionado enteramente por Docker: vive en una ubicación administrada por el propio Docker (fuera del sistema de archivos del contenedor), sobrevive a la eliminación del contenedor que lo usaba, y puede compartirse entre múltiples contenedores. Se crean y referencian por nombre (`docker run -v datos_app:/data mi-imagen`), y Docker se encarga de dónde y cómo se almacenan físicamente esos datos, sin que normalmente necesites preocuparte por esa ubicación exacta en el sistema anfitrión.

Un bind mount, en cambio, monta un directorio específico y explícito de tu máquina anfitriona directamente dentro del contenedor (`docker run -v $(pwd)/src:/app/src mi-imagen`), estableciendo un vínculo directo entre una ruta concreta de tu sistema de archivos local y una ruta dentro del contenedor. Cualquier cambio realizado en un lado se refleja inmediatamente en el otro, en ambas direcciones, porque en realidad ambos apuntan al mismo contenido subyacente en disco.

Esta diferencia determina directamente el caso de uso apropiado para cada uno. En desarrollo, un bind mount que vincula tu carpeta de código fuente local a la ruta correspondiente dentro del contenedor permite ver reflejados instantáneamente los cambios que haces en tu editor, sin necesidad de reconstruir la imagen en cada modificación, acelerando enormemente el ciclo de desarrollo iterativo. En producción, un volumen gestionado por Docker es la opción recomendada para persistir datos (como los archivos de una base de datos), precisamente porque no depende de una ruta específica y potencialmente frágil del sistema anfitrión, y Docker puede gestionar su ciclo de vida de forma más predecible y portable entre distintos entornos de despliegue.

Un error común es usar bind mounts en producción de la misma forma que en desarrollo, acoplando innecesariamente el contenedor a una estructura de directorios específica del servidor anfitrión, lo que dificulta portar esa configuración a un servidor distinto o a un entorno de orquestación como Kubernetes, donde el concepto de volumen gestionado (con sus propias abstracciones, como verás en el módulo de Kubernetes de este mismo track) es el patrón estándar y recomendado.

**Analogía:** un volumen gestionado es como guardar tus documentos importantes en una caja fuerte de un banco: el banco gestiona dónde y cómo se almacena físicamente, y tú solo interactúas con ella pidiendo acceso por su identificador, sin preocuparte de la ubicación exacta de la bóveda. Un bind mount es como tener una ventana directa entre tu oficina y una habitación específica de tu propia casa: cualquier cambio en un lado es visible instantáneamente en el otro, pero ambos dependen de que esa habitación específica de tu casa siga existiendo exactamente donde está.

**¿Por qué es importante?** Elegir el mecanismo de persistencia correcto según el contexto (bind mount para iterar rápido en desarrollo, volumen gestionado para persistir datos de forma portable en producción) evita tanto la fricción de reconstruir la imagen en cada cambio de código durante el desarrollo, como el acoplamiento frágil a rutas específicas del servidor en producción.

**Diagrama:**

```
Bind mount (desarrollo):                    Volumen gestionado (producción):
Tu carpeta local ./src                       Docker decide dónde vive
       ↕ (reflejo instantáneo,                       │
          en ambas direcciones)                       ▼
/app/src dentro del contenedor            /data dentro del contenedor
                                            (gestionado por Docker, portable,
                                             sobrevive a docker rm del contenedor)
```

### Tema 5: Redes en Docker

**Conceptos clave:** red bridge por defecto, red definida por el usuario, descubrimiento por nombre de servicio, aislamiento de red.

Por defecto, Docker crea contenedores conectados a una red tipo bridge, que les permite comunicarse con el exterior (a través del host) pero, en la red bridge por defecto, no les da automáticamente la capacidad de resolverse entre sí por nombre: dos contenedores en esa red por defecto solo pueden comunicarse entre ellos usando direcciones IP internas, que además pueden cambiar entre reinicios, haciendo esa comunicación frágil y poco práctica de mantener.

Una red definida explícitamente por el usuario (`docker network create mi-red`, y ejecutando los contenedores relevantes conectados a ella con `--network mi-red`) resuelve este problema: dentro de una red definida por el usuario, Docker provee resolución de nombres automática, permitiendo que un contenedor se comunique con otro simplemente usando su nombre de contenedor (o el nombre de servicio, si usas Docker Compose, que ya viste en el track Cloud) como si fuera un nombre de host, sin necesidad de conocer ni gestionar direcciones IP internas manualmente.

Este mecanismo de descubrimiento por nombre es exactamente lo que hace posible que, en un `docker-compose.yml` con varios servicios, uno pueda conectarse a otro (por ejemplo, una aplicación conectándose a su base de datos) usando el nombre del servicio de base de datos como si fuera una dirección de host normal, sin hardcodear ninguna IP. Docker Compose, de hecho, crea automáticamente una red definida por el usuario para cada proyecto, por eso este comportamiento "simplemente funciona" sin configuración explícita adicional cuando usas Compose.

Las redes en Docker también sirven como mecanismo de aislamiento: contenedores en redes distintas no pueden comunicarse entre sí por defecto, a menos que se conecten explícitamente a una red compartida. Esto permite, en arquitecturas más complejas, aislar grupos de servicios que no deberían tener comunicación directa entre sí (por ejemplo, separar la red de un conjunto de microservicios internos de la red de un servicio expuesto públicamente), aplicando un principio de segmentación de red similar en espíritu al principio de mínimo privilegio que ya viste aplicado a permisos de IAM en el track Cloud.

**Analogía:** la red bridge por defecto de Docker es como un edificio de apartamentos donde cada inquilino tiene una dirección postal, pero no hay directorio de nombres en la entrada: para visitar a otro inquilino necesitas conocer su número exacto de apartamento, que además podría cambiar. Una red definida por el usuario es como ese mismo edificio, pero con un directorio de nombres en la recepción: puedes pedir por el nombre de la persona ("el apartamento de la base de datos") y te dirigen automáticamente, sin memorizar números.

**¿Por qué es importante?** Entender cómo funciona el descubrimiento de nombres en redes Docker es la base directa para entender por qué, en el laboratorio de Docker Compose que ya hiciste en el track Cloud, tu aplicación podía conectarse a Floci (o a cualquier otro servicio) usando su nombre de servicio en vez de una dirección IP, y es un concepto que reaparece, con sus propias particularidades, cuando trabajes con Services de Kubernetes más adelante en este track.

**Diagrama:**

```
Red bridge por defecto:              Red definida por el usuario:
┌──────────────┐                   ┌──────────────┐
│ contenedor A     │                   │ contenedor A     │
│ (solo se comunica  │                   │ puede llamar a "b" │
│  con B por IP,      │                   │ por NOMBRE, Docker  │
│  sin resolución     │                   │ resuelve automática- │
│  de nombres)         │                   │ mente su dirección    │
└──────────────┘                   └──────────────┘
```

### Tema 6: Registries — Docker Hub, AWS ECR, Azure Container Registry, Harbor

**Conceptos clave:** registry público vs privado, registry gestionado por proveedor cloud, Harbor autoalojado.

Como viste al usar Docker Hub para descargar la imagen de Floci en el track Cloud, un registry almacena y distribuye imágenes Docker. Docker Hub es el registry público más usado del mundo, adecuado para imágenes de código abierto o proyectos que no requieren restricciones de acceso, pero para imágenes propietarias de una empresa —el código de tu propia aplicación empaquetado en una imagen— normalmente se prefiere un registry privado, con control explícito sobre quién puede subir (`push`) o descargar (`pull`) cada imagen.

AWS ECR (Elastic Container Registry) y Azure Container Registry son registries privados gestionados por sus respectivos proveedores de nube, integrados de forma nativa con el resto de sus servicios: por ejemplo, un cluster ECS o EKS en AWS puede autenticarse contra ECR usando directamente los roles IAM que ya gestionas para el resto de tu infraestructura (el mismo concepto de IAM que estudiaste en profundidad en el track Cloud), sin necesidad de gestionar credenciales separadas específicamente para el registry. Esta integración nativa con el ecosistema de identidad y permisos del proveedor es, frecuentemente, la razón principal para elegir el registry gestionado de tu mismo proveedor de nube en vez de una alternativa externa.

Harbor es un registry de código abierto que puedes autoalojar en tu propia infraestructura, útil para organizaciones que necesitan mantener control total sobre dónde viven sus imágenes (por requisitos de cumplimiento normativo, aislamiento de red, o simplemente preferencia de no depender de un proveedor externo), a cambio de asumir la responsabilidad operativa de mantener ese registry funcionando, actualizado y respaldado tú mismo, en vez de delegar esa responsabilidad a un proveedor gestionado.

La elección entre estas opciones sigue un patrón similar al que ya viste al comparar proveedores de nube en el track Cloud: si ya trabajas dentro del ecosistema de un proveedor específico, su registry gestionado suele ser la opción de menor fricción operativa por su integración nativa; si necesitas total independencia de cualquier proveedor externo, o tienes requisitos específicos de cumplimiento que lo exigen, un registry autoalojado como Harbor es la alternativa a considerar, asumiendo el coste operativo adicional que eso implica.

**Analogía:** Docker Hub es como una biblioteca pública donde cualquiera puede consultar libros publicados abiertamente. Un registry privado gestionado (ECR, ACR) es como el archivo interno de documentos de una empresa, gestionado por un servicio externo de confianza que además conoce automáticamente quién de la empresa tiene autorización para acceder, sin pedirle una credencial nueva y separada. Harbor autoalojado es como construir y mantener tu propio archivo físico privado dentro de tus propias instalaciones, con control total pero también con la responsabilidad completa de su mantenimiento.

**¿Por qué es importante?** Elegir dónde viven las imágenes de tu aplicación no es un detalle trivial: afecta la velocidad de despliegue (la cercanía de red entre el registry y donde se ejecutan tus contenedores importa), la gestión de permisos de acceso, y el cumplimiento de requisitos normativos específicos de tu organización o industria.

**Diagrama:**

```
Docker Hub          AWS ECR              Azure Container      Harbor
(público, o          Registry            Registry             (autoalojado,
 privado de pago)    (privado, integrado  (privado, integrado   control total,
                      con IAM de AWS)      con Azure AD)         responsabilidad
                                                                  operativa propia)
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

**Objetivo del laboratorio:** construir la imagen de una API propia en una sola etapa, medir su tamaño, reescribirla como multi-stage con una imagen base optimizada, y comparar ambos resultados.

**Requisitos previos:** Docker instalado (Módulo 0 del track Cloud), una aplicación simple propia (puede ser una API mínima en Node.js) con un `package.json` y un punto de entrada ejecutable.

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Escribir un Dockerfile de una sola etapa | Crea un `Dockerfile` que parta de `node:22` (imagen completa), copie todo el código, instale dependencias y ejecute la app | Punto de partida sin optimizar, para comparar después | El archivo se guarda correctamente |
| 2 | Construir la imagen y medir su tamaño | `docker build -t mi-api:v1-sin-optimizar . && docker images mi-api:v1-sin-optimizar` | Registra el tamaño de referencia antes de cualquier optimización | Una imagen de varios cientos de MB (dependiendo de las dependencias) |
| 3 | Reescribir como multi-stage con Alpine | Modifica el Dockerfile con una etapa `build` (instala todo, compila si aplica) y una etapa final basada en `node:22-alpine`, copiando solo lo necesario con `COPY --from=build` | Aplica el patrón del Tema 1 y el Tema 3 combinados | El archivo se guarda con la nueva estructura multi-stage |
| 4 | Reconstruir y comparar tamaño | `docker build -t mi-api:v2-optimizada . && docker images` | Compara el tamaño de ambas versiones lado a lado | La versión optimizada debería ser notablemente más pequeña que la v1 |
| 5 | Reordenar instrucciones para maximizar caché | Asegúrate de que `COPY package*.json ./` y la instalación de dependencias ocurren antes de `COPY . .` en la etapa de build | Aplica el patrón del Tema 2 | Al modificar solo un archivo de código y reconstruir, la capa de instalación de dependencias debería reportarse como cacheada (`CACHED` en la salida de build) |
| 6 | Probar un volumen gestionado | `docker volume create datos-prueba && docker run -v datos-prueba:/data mi-api:v2-optimizada` (con un comando que escriba algo en `/data`) | Verifica persistencia con un volumen gestionado | El contenido escrito en `/data` sobrevive a `docker rm` del contenedor y es visible al montar el mismo volumen en un contenedor nuevo |

**Verificación:** el laboratorio se considera exitoso si la imagen multi-stage optimizada (v2) es significativamente más pequeña que la imagen de una sola etapa (v1), y si reconstruir tras modificar solo el código de la aplicación (sin tocar `package.json`) muestra la capa de instalación de dependencias como `CACHED` en la salida de `docker build`.

**Errores comunes y soluciones**

- **La capa de `npm ci` (o equivalente) nunca aparece como `CACHED`, incluso sin cambiar `package.json`.** Revisa que no estés copiando código fuente completo (`COPY . .`) antes de la instalación de dependencias; cualquier `COPY` que incluya archivos que cambian con frecuencia, colocado antes de la instalación, invalida esa capa en cada build.
- **`COPY --from=build` falla con un error de ruta no encontrada.** Verifica que el nombre de la etapa (`AS build`) coincide exactamente con el que usas en `--from=build`, y que la ruta de origen dentro de esa etapa es correcta (revisa dónde realmente quedó el artefacto construido dentro de la etapa de build).
- **La aplicación falla al ejecutarse en la imagen Alpine, aunque funcionaba en la imagen completa.** Revisa si alguna dependencia nativa compilada de tu proyecto depende de glibc en vez de musl (la librería C de Alpine); en ese caso, puede requerir una imagen Alpine con compatibilidad adicional, o reconsiderar esa dependencia específica.
- **Los datos de un bind mount no se reflejan como esperas.** Verifica que la ruta del host especificada en `-v` es una ruta absoluta correcta (usa `$(pwd)` para referenciar el directorio actual de forma portable), y que la ruta dentro del contenedor coincide con dónde la aplicación realmente busca esos archivos.

---

## Ejercicios de evaluación

### Ejercicio 1: Diagnosticar un Dockerfile mal ordenado

**Enunciado:** un compañero se queja de que cada build de su Dockerfile tarda varios minutos reinstalando dependencias, incluso cuando solo cambió una línea de código de la aplicación. Revisa este fragmento y explica el problema:
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY . .
RUN npm ci
CMD ["node", "index.js"]
```

**Solución esperada:** el problema es que `COPY . .` copia todo el código fuente (incluyendo archivos que cambian con frecuencia) antes de instalar las dependencias con `npm ci`; cualquier cambio en cualquier archivo del proyecto invalida la capa de `COPY . .`, y por cascada, invalida también la capa de `npm ci` siguiente, forzando una reinstalación completa en cada build. La corrección es copiar primero `package.json` y su archivo de lock, ejecutar `npm ci` en una capa separada, y solo después copiar el resto del código con `COPY . .`.

**Criterios de éxito:**
- Identifica correctamente que el orden de las instrucciones invalida el caché de `npm ci` en cada build.
- Propone la corrección de separar la copia de `package.json` y la instalación de dependencias, antes de copiar el resto del código.

### Ejercicio 2: Elegir la imagen base correcta

**Enunciado:** estás preparando la imagen final de producción de un servicio crítico expuesto a internet, donde minimizar la superficie de ataque es una prioridad explícita del equipo de seguridad, y no necesitas depurar interactivamente dentro del contenedor en producción (tienes logging y observabilidad centralizados para eso). ¿Qué tipo de imagen base elegirías: completa, Alpine o distroless? Justifica tu respuesta.

**Solución esperada:** distroless, porque la prioridad explícita es minimizar la superficie de ataque, y la ausencia de shell y gestor de paquetes en distroless elimina herramientas que un atacante podría usar si comprometiera la aplicación; la falta de capacidad de depuración interactiva directa dentro del contenedor no es un problema relevante en este escenario, porque el equipo ya cuenta con observabilidad centralizada como alternativa.

**Criterios de éxito:**
- Elige distroless, no una imagen completa ni Alpine.
- La justificación conecta la elección con la prioridad de seguridad explícita y la disponibilidad de observabilidad como alternativa a la depuración interactiva.

### Ejercicio 3: Volumen o bind mount

**Enunciado:** estás configurando el entorno de desarrollo local de un equipo, donde cada desarrollador necesita ver reflejados instantáneamente los cambios que hace en su editor de código dentro del contenedor en ejecución, sin reconstruir la imagen cada vez. ¿Usarías un volumen gestionado o un bind mount para el código fuente? Justifica tu respuesta.

**Solución esperada:** un bind mount, vinculando la carpeta local de código fuente de cada desarrollador directamente a la ruta correspondiente dentro del contenedor, de forma que cualquier cambio guardado en el editor se refleje inmediatamente sin necesidad de reconstruir la imagen ni el contenedor.

**Criterios de éxito:**
- Elige bind mount, no volumen gestionado.
- La justificación menciona explícitamente la necesidad de reflejo instantáneo de cambios de código durante el desarrollo activo.

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

- CNCF, documentación oficial de Kubernetes, Prometheus y OpenTelemetry.
- HashiCorp, *Terraform Documentation*.
- Beyer et al., *Site Reliability Engineering*; Forsgren et al., *Accelerate*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- Los Dockerfiles multi-stage separan la construcción de la ejecución, dejando en la imagen final solo lo estrictamente necesario para correr la aplicación.
- El orden de las instrucciones determina qué tan efectivamente se reutiliza la caché de capas; las que cambian con menor frecuencia deben ir primero.
- Alpine y distroless reducen drásticamente el tamaño de imagen y la superficie de ataque frente a una imagen base completa, a costa de menor comodidad de depuración interactiva.
- Los volúmenes gestionados son la opción recomendada para persistencia en producción; los bind mounts son ideales para reflejar cambios de código en vivo durante el desarrollo.
- Las redes definidas por el usuario en Docker habilitan descubrimiento de nombres entre contenedores, la base de cómo se comunican los servicios en Docker Compose.
- Los registries (Docker Hub, ECR, ACR, Harbor) distribuyen imágenes, y la elección entre gestionado o autoalojado depende de integración con tu ecosistema y requisitos de control.

**Conceptos aprendidos**

- Dockerfiles multi-stage y cómo reducen el tamaño final de una imagen.
- Capas, caché de build, y el orden de instrucciones que maximiza su reutilización.
- Imágenes base completas, Alpine y distroless, y sus compromisos de seguridad y comodidad.
- Volúmenes gestionados frente a bind mounts.
- Redes Docker y descubrimiento de nombres entre contenedores.
- Registries de contenedores y criterios para elegir entre ellos.

**Próximos pasos**

En el Módulo 3 vas a orquestar localmente arquitecturas completas con Docker Compose, aplicando healthchecks, variables de entorno externalizadas, y perfiles para distintos entornos.

**Recursos adicionales**

- Documentación oficial de Docker sobre multi-stage builds y gestión de caché de build.
- Documentación oficial de Alpine Linux y de los proyectos distroless de Google.
- Documentación oficial de AWS ECR, Azure Container Registry, y del proyecto Harbor.
