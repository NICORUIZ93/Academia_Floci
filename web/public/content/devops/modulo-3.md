# Módulo 3: Docker Compose y orquestación local

## Sílabo

**Objetivo general**

Levantar arquitecturas completas de múltiples servicios con un solo comando, usando healthchecks para coordinar dependencias reales de disponibilidad, variables de entorno externalizadas, y perfiles para distintos escenarios de uso.

**Objetivos específicos**

1. Escribir un `docker-compose.yml` con una aplicación, una base de datos y una caché.
2. Configurar healthchecks y usarlos con `depends_on: condition: service_healthy`.
3. Externalizar configuración sensible en un archivo `.env`.
4. Verificar el descubrimiento de servicios por nombre dentro de la red de Compose.
5. Configurar perfiles para levantar subconjuntos de servicios según el entorno.

**Contenido**

- Servicios, dependencias y healthchecks.
- Variables de entorno y `.env`.
- Redes y descubrimiento por nombre de servicio.
- Perfiles para distintos entornos.

**Evaluación**

Un laboratorio que construye una arquitectura de tres servicios con healthchecks y perfiles, y tres ejercicios de evaluación sobre `depends_on` sin healthcheck, gestión de secretos en `.env`, y diseño de perfiles.

---

## Aprende construyendo

### Tema 1: Servicios, dependencias y healthchecks

**Conceptos clave:** servicio, `depends_on`, healthcheck, `condition: service_healthy`, disponibilidad real vs arranque del proceso.

Un healthcheck es una instrucción que Docker ejecuta periódicamente dentro de un contenedor para determinar si el servicio que corre ahí está realmente listo para recibir tráfico, más allá de simplemente haber arrancado el proceso. Se define con un comando de verificación (`test`), un intervalo entre chequeos (`interval`), y un número de reintentos antes de considerar el servicio como no saludable (`retries`). Por ejemplo, para una base de datos PostgreSQL, `pg_isready -U postgres` es un comando específico que verifica si el servidor ya está aceptando conexiones, no solo si el proceso del contenedor está en ejecución.

`depends_on` en Docker Compose, sin ninguna condición adicional, solo garantiza el orden de arranque de los contenedores (que `db` se inicie antes que `app`), pero no garantiza que `db` ya esté lista para aceptar conexiones en ese momento: muchos servicios, especialmente bases de datos, tardan un tiempo adicional después de arrancar el proceso antes de estar realmente disponibles para recibir peticiones. Sin un healthcheck, es perfectamente posible (y de hecho común) que `app` arranque e intente conectarse a `db` en el instante exacto en que el contenedor de `db` ya existe pero su proceso interno todavía no terminó de inicializarse, provocando errores de conexión intermitentes al inicio.

`depends_on` combinado con `condition: service_healthy` resuelve esto: en vez de simplemente esperar a que el contenedor de `db` exista, Compose espera activamente a que su healthcheck reporte un estado saludable antes de arrancar `app`. Esto convierte una dependencia de "orden de arranque" en una dependencia real de "disponibilidad funcional", eliminando una clase entera de errores intermitentes de arranque que de otra forma requerirían lógica de reintento manual dentro de la propia aplicación para compensar la falta de esa garantía a nivel de orquestación.

Este mismo patrón de healthcheck y espera activa de disponibilidad real reaparece, con su propia implementación específica, en Kubernetes bajo el nombre de "readiness probes", que vas a estudiar en detalle en un módulo posterior de este mismo track: el concepto subyacente —no basta con que un proceso esté corriendo, necesitas verificar activamente que está listo para servir tráfico— es exactamente el mismo, solo que la herramienta de orquestación que lo implementa cambia de Docker Compose (para desarrollo local) a Kubernetes (para producción a escala).

**Analogía:** `depends_on` sin healthcheck es como avisar a un camarero que "la cocina ya está abierta" en el momento exacto en que el cocinero entra a la cocina, sin verificar si ya terminó de encender los fogones y preparar su estación; el camarero podría tomar un pedido y llevarlo a la cocina antes de que esté realmente lista para cocinarlo. Un healthcheck es como esperar a que el cocinero mismo confirme explícitamente "ya estoy listo para recibir pedidos" antes de dejar que el camarero empiece a tomarlos.

**¿Por qué es importante?** Los errores de arranque intermitentes causados por dependencias mal coordinadas son una fuente común y frustrante de fallos "aleatorios" en entornos de desarrollo y CI, que a menudo se diagnostican erróneamente como bugs de la aplicación cuando en realidad son un problema de orquestación de arranque. Configurar healthchecks correctamente elimina esta clase de problemas de raíz.

**Diagrama:**

```
Sin healthcheck:                         Con healthcheck + condition: service_healthy:
db arranca ──▶ app arranca                db arranca ──▶ healthcheck verifica
                    │                                          │
              intenta conectar               ¿pg_isready responde OK?
              (puede fallar si db                    │
               no está lista aún)              Sí ──▶ app arranca
                                                No ──▶ espera y reintenta
```

### Tema 2: Variables de entorno y .env

**Conceptos clave:** archivo `.env`, interpolación de variables, configuración externalizada, secretos fuera del código versionado.

Un archivo `.env` en la raíz de un proyecto con Docker Compose contiene pares clave-valor que Compose carga automáticamente y pone a disposición para interpolar dentro del `docker-compose.yml`, usando la sintaxis `${NOMBRE_VARIABLE}`. Esto permite separar la configuración específica de cada entorno o desarrollador (contraseñas locales, puertos personalizados, rutas específicas) del archivo de definición de servicios en sí, que normalmente sí se versiona en el control de código junto al resto del proyecto.

La práctica estándar es versionar un archivo de ejemplo (comúnmente llamado `.env.example`) con las claves necesarias pero valores de marcador de posición o vacíos, mientras que el archivo `.env` real, con los valores efectivos (incluyendo cualquier secreto), se excluye explícitamente del control de versiones mediante `.gitignore`. Esto permite que cualquier persona que clone el proyecto sepa exactamente qué variables necesita configurar (consultando `.env.example`), sin que ningún secreto real quede expuesto en el historial del repositorio compartido.

Es importante entender que esta externalización de configuración mediante `.env` en Docker Compose es una solución adecuada para entornos de desarrollo local, pero no sustituye a mecanismos de gestión de secretos más robustos en producción, como los que vas a estudiar en el módulo de seguridad DevSecOps de este mismo track (Vault, SOPS) o los servicios de gestión de secretos nativos de la nube que ya viste en el track Cloud (Secrets Manager). Un archivo `.env` en un servidor de producción sigue siendo, en última instancia, un archivo de texto plano con secretos en disco, con todos los riesgos que eso implica si ese servidor se ve comprometido.

La interpolación de variables en Compose también admite valores por defecto con la sintaxis `${VARIABLE:-valor_por_defecto}`, similar en espíritu a la sintaxis de bash que viste en el Módulo 0 de este track, permitiendo que el proyecto funcione razonablemente incluso si alguien olvida configurar una variable opcional, mientras sigue fallando de forma explícita para variables verdaderamente obligatorias sin un valor por defecto sensato.

**Analogía:** un archivo `.env` es como una hoja de configuración personal que cada persona guarda en su propio cajón (nunca la comparte ni la fotocopia para el archivo general de la oficina), mientras que `.env.example` es como una plantilla en blanco compartida con todos, que muestra qué campos hay que rellenar sin revelar los valores reales de nadie.

**¿Por qué es importante?** Filtrar secretos accidentalmente a un repositorio de código —típicamente por versionar un archivo `.env` real en vez de excluirlo correctamente— es uno de los incidentes de seguridad más comunes y más fácilmente evitables en proyectos de software, y establecer la convención `.env`/`.env.example` desde el inicio de un proyecto es una de las medidas preventivas más simples y efectivas contra ese error.

**Diagrama:**

```
.env.example (SÍ se versiona)          .env (NO se versiona, en .gitignore)
┌───────────────────────┐            ┌───────────────────────┐
│ POSTGRES_PASSWORD=          │            │ POSTGRES_PASSWORD=          │
│ API_KEY=                     │            │ API_KEY=sk-real-abc123        │
└───────────────────────┘            └───────────────────────┘
   (plantilla, valores vacíos)            (valores reales, privados)
```

### Tema 3: Redes y descubrimiento por nombre de servicio

**Conceptos clave:** red implícita de Compose, nombre de servicio como hostname, aislamiento entre proyectos.

Como adelantaste en el Módulo 2 de este track al estudiar redes Docker en general, Docker Compose crea automáticamente una red definida por el usuario específica para cada proyecto (identificada normalmente por el nombre de la carpeta del proyecto, salvo que se configure explícitamente otro nombre), y conecta a ella todos los servicios definidos en el `docker-compose.yml` sin ninguna configuración adicional de tu parte. Dentro de esa red, cada servicio puede resolver a cualquier otro servicio del mismo archivo Compose usando su nombre de servicio como si fuera un hostname válido, gracias al DNS interno que Docker provee automáticamente para redes definidas por el usuario.

Esto es lo que hace posible que, en el ejemplo de este módulo, el servicio `app` se conecte a la base de datos simplemente usando `db` como parte de su cadena de conexión (`postgres://db:5432/app`), sin necesidad de conocer ninguna dirección IP interna, que además podría cambiar entre reinicios de los contenedores. Este comportamiento es consistente y predecible precisamente porque Compose gestiona automáticamente esa resolución de nombres como parte de la red que crea para el proyecto, sin que tengas que configurar nada explícitamente para habilitarlo.

Un detalle relevante es que esta red es específica de cada proyecto Compose: si tienes dos proyectos Compose distintos corriendo simultáneamente en tu máquina, sus servicios respectivos viven en redes separadas y aisladas entre sí por defecto, sin poder comunicarse directamente a menos que configures explícitamente una red compartida externa entre ambos proyectos. Este aislamiento por defecto es, en general, el comportamiento deseado: evita colisiones accidentales de nombres de servicio entre proyectos distintos (dos proyectos distintos podrían, cada uno, tener su propio servicio llamado `db` sin ningún conflicto entre ellos).

Entender este mecanismo de red y descubrimiento de nombres es lo que te permite razonar correctamente sobre por qué un servicio puede (o no puede) alcanzar a otro en un `docker-compose.yml`, y es la base conceptual directa sobre la que se construye el mecanismo de Services en Kubernetes, que vas a estudiar más adelante en este mismo track, con un propósito y un patrón de descubrimiento por nombre muy similar en espíritu, aunque con su propia implementación específica a mayor escala.

**Analogía:** cada proyecto Compose es como un edificio de oficinas independiente con su propio directorio telefónico interno: dentro de "tu" edificio, puedes llamar a cualquier otra oficina por su nombre de departamento. Un edificio distinto (otro proyecto Compose) tiene su propio directorio interno separado, y aunque ambos edificios podrían tener, coincidentemente, un departamento llamado "recepción", no hay ninguna confusión entre ellos porque cada directorio es privado de su propio edificio.

**¿Por qué es importante?** Comprender que la resolución de nombres de servicio es automática pero está limitada al alcance de un mismo proyecto Compose evita la confusión común de intentar que dos `docker-compose.yml` independientes se comuniquen entre sí por nombre de servicio sin la configuración de red explícita adicional que eso requeriría.

**Diagrama:**

```
Proyecto Compose "app-principal"        Proyecto Compose "otro-proyecto"
┌─────────────────────────┐            ┌─────────────────────────┐
│ red: app-principal_default   │            │ red: otro-proyecto_default    │
│  app ──▶ db (por nombre)       │            │  web ──▶ db (por nombre)        │
│  app ──▶ cache (por nombre)     │            │  (su PROPIO "db", sin relación   │
└─────────────────────────┘            │   con el "db" del otro proyecto) │
                                          └─────────────────────────┘
   (aislados entre sí por defecto)
```

### Tema 4: Perfiles para distintos entornos

**Conceptos clave:** `profiles`, activación selectiva de servicios, herramientas opcionales de desarrollo.

Un perfil en Docker Compose etiqueta un servicio para que solo se levante cuando ese perfil se activa explícitamente, en vez de levantarse siempre que ejecutas `docker compose up` sin ninguna opción adicional. Esto es útil para servicios que no forman parte del flujo de trabajo diario habitual de todo el equipo, pero que sí son útiles ocasionalmente para casos específicos: una herramienta de administración visual de la base de datos, un servicio de generación de datos de prueba, o un contenedor de depuración con herramientas adicionales instaladas.

Sin perfiles, cualquier servicio adicional definido en el `docker-compose.yml` se levantaría siempre junto con el resto, consumiendo recursos innecesariamente para quien no lo necesita en ese momento, o require mantener archivos Compose separados para distintos escenarios (uno para desarrollo normal, otro para depuración, otro para pruebas de carga), duplicando la definición de los servicios comunes entre esos archivos separados. Con perfiles, un único `docker-compose.yml` puede describir todos los escenarios posibles, y cada persona activa selectivamente solo los servicios que necesita en cada situación específica con `docker compose --profile <nombre> up`.

Un servicio puede pertenecer a ningún perfil (se levanta siempre, por defecto, con cualquier invocación de `docker compose up`), a un perfil específico (solo se levanta si ese perfil se activa explícitamente), o incluso a múltiples perfiles simultáneamente (se levanta si cualquiera de esos perfiles está activo). Esta flexibilidad permite modelar escenarios como "levanta siempre la app y la base de datos, pero la herramienta de administración visual solo si activo el perfil `debug`, y el generador de datos de prueba solo si activo el perfil `seed`", todo desde un único archivo de definición compartido por todo el equipo.

**Analogía:** los perfiles son como las opciones adicionales de un electrodoméstico multifuncional: el modo básico (sin perfil) siempre está disponible con solo encenderlo, pero funciones adicionales específicas (un modo de limpieza profunda, un programa especial) solo se activan si explícitamente seleccionas esa opción, sin que consuman energía ni tiempo cuando simplemente quieres usar el modo estándar.

**¿Por qué es importante?** Los perfiles evitan la duplicación de archivos Compose para distintos escenarios de uso, y evitan que cada desarrollador tenga que levantar manualmente (o comentar/descomentar) servicios opcionales cada vez que cambia de tarea, manteniendo un único archivo de definición compartido y coherente para todo el equipo, con activación selectiva y explícita de lo que cada situación específica requiere.

**Diagrama:**

```
docker-compose.yml
├── app          (sin perfil → siempre se levanta)
├── db           (sin perfil → siempre se levanta)
├── admin-db     (profiles: ["debug"] → solo con --profile debug)
└── generador    (profiles: ["seed"] → solo con --profile seed)

docker compose up                    → app, db
docker compose --profile debug up    → app, db, admin-db
docker compose --profile seed up     → app, db, generador
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

**Objetivo del laboratorio:** construir un `docker-compose.yml` con una aplicación, una base de datos PostgreSQL y una caché Redis, coordinados con healthchecks, configuración externalizada en `.env`, y un perfil opcional de depuración.

**Requisitos previos:** Docker y Docker Compose instalados, conocimientos de los Módulos 0-2 de este track.

| Paso | Acción | Comando/Configuración | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Crear el archivo `.env.example` y `.env` | `.env.example` con `POSTGRES_PASSWORD=` (vacío); `.env` con `POSTGRES_PASSWORD=desarrollo123` | Separa la plantilla versionable del valor real privado | Ambos archivos existen; `.env` está en `.gitignore` |
| 2 | Definir el servicio de base de datos con healthcheck | En `docker-compose.yml`, servicio `db` con imagen `postgres:16`, variable `POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}`, y un healthcheck con `pg_isready -U postgres` | Define la base de datos y su verificación de disponibilidad real | El archivo se guarda sin errores de sintaxis YAML |
| 3 | Definir el servicio de caché | Servicio `cache` con imagen `redis:7`, sin configuración adicional necesaria para este laboratorio | Servicio simple sin dependencias | El archivo incluye el servicio `cache` |
| 4 | Definir el servicio de aplicación con dependencia saludable | Servicio `app` que construye desde tu propio `Dockerfile`, con `depends_on: db: condition: service_healthy`, y una variable de entorno que arma la cadena de conexión usando `db` como hostname | Aplica los Temas 1 y 3 juntos: espera activa por disponibilidad real, y descubrimiento por nombre de servicio | El archivo Compose queda completo con los tres servicios |
| 5 | Añadir un servicio opcional de administración con perfil | Servicio `pgadmin` (o similar) con `profiles: ["debug"]` | Aplica el Tema 4: solo se levanta si se activa explícitamente ese perfil | El servicio existe en el archivo pero no se levanta por defecto |
| 6 | Levantar el stack básico | `docker compose up -d` | Solo deberían levantarse `app`, `db` y `cache`, no `pgadmin` | `docker compose ps` muestra tres servicios corriendo, sin `pgadmin` |
| 7 | Verificar que `app` esperó correctamente a `db` | `docker compose logs app` | Confirma que `app` no reportó errores de conexión al arrancar, gracias al healthcheck | Los logs de `app` no muestran errores de conexión a la base de datos al inicio |
| 8 | Levantar también el perfil de depuración | `docker compose --profile debug up -d` | Ahora sí se levanta también `pgadmin` | `docker compose ps` muestra los tres servicios anteriores más `pgadmin` |
| 9 | Verificar el descubrimiento de nombres | Desde dentro del contenedor de `app` (`docker compose exec app sh`), intenta hacer ping o conectar a `db` usando ese nombre | Confirma que el nombre de servicio se resuelve correctamente dentro de la red de Compose | La conexión a `db:5432` (o el puerto correspondiente) se establece correctamente usando el nombre, no una IP |

**Verificación:** el laboratorio se considera exitoso si `docker compose up -d` (sin perfil) levanta exactamente tres servicios (sin `pgadmin`), si los logs de `app` no muestran errores de conexión prematura a la base de datos, y si activar el perfil `debug` efectivamente añade el cuarto servicio sin necesidad de modificar el archivo `docker-compose.yml`.

**Errores comunes y soluciones**

- **`app` sigue fallando al conectar a la base de datos a pesar del healthcheck configurado.** Verifica que el healthcheck realmente refleja disponibilidad funcional (no solo que el proceso arrancó); para PostgreSQL, confirma que usas `pg_isready` con el usuario correcto, y que `interval` y `retries` dan tiempo suficiente para la inicialización real de la base de datos en tu máquina.
- **Las variables de `.env` no se interpolan en `docker-compose.yml`.** Confirma que el archivo `.env` está en la misma carpeta desde la que ejecutas `docker compose` (por defecto, Compose busca `.env` en el directorio del proyecto), y que la sintaxis de interpolación (`${VARIABLE}`) está escrita correctamente sin errores tipográficos.
- **El perfil `debug` se levanta siempre, incluso sin especificarlo explícitamente.** Revisa que la clave `profiles` esté correctamente indentada dentro de la definición del servicio en el YAML, y no aplicada por error a nivel del archivo completo o de otro servicio.
- **`docker compose exec app sh` falla porque no hay un shell disponible.** Si tu imagen de aplicación usa una base distroless (Módulo 2, Tema 3), no tendrá shell disponible; usa una imagen con Alpine o completa para este paso específico de depuración, o verifica la conectividad por otros medios (como logs de la propia aplicación).

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

- Un healthcheck combinado con `condition: service_healthy` convierte una dependencia de simple orden de arranque en una dependencia real de disponibilidad funcional.
- Un archivo `.env` (nunca versionado) externaliza configuración sensible, con `.env.example` como plantilla compartida sin valores reales.
- Docker Compose crea automáticamente una red por proyecto con descubrimiento de nombres de servicio, aislada de otros proyectos Compose.
- Los perfiles permiten activar selectivamente servicios opcionales sin duplicar archivos Compose para distintos escenarios de uso.

**Conceptos aprendidos**

- Healthchecks y su combinación con `depends_on: condition: service_healthy`.
- Externalización de configuración con `.env`/`.env.example`.
- Redes de Compose y descubrimiento de nombres de servicio.
- Perfiles para activación selectiva de servicios según el escenario.

**Próximos pasos**

En el Módulo 4 vas a automatizar la construcción y prueba de cada cambio de código con pipelines de integración continua (CI), aplicando cache de dependencias y matrices de build.

**Recursos adicionales**

- Documentación oficial de Docker Compose: referencia completa de `healthcheck`, `depends_on`, `.env` y `profiles`.
- Guía oficial de Docker sobre redes en Compose y resolución de nombres de servicio.
