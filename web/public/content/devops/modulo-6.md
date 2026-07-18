# Módulo 6: Kubernetes — fundamentos

## Sílabo

**Objetivo general**

Entender Kubernetes, el orquestador de contenedores estándar de la industria, dominando sus objetos fundamentales —Pod, ReplicaSet, Deployment, Service— y el conjunto esencial de comandos de `kubectl` para operar un clúster local.

**Objetivos específicos**

1. Explicar la relación jerárquica entre Pod, ReplicaSet y Deployment.
2. Desplegar una aplicación propia con un Deployment de múltiples réplicas.
3. Exponer un Deployment con un Service y entender los tipos ClusterIP, NodePort y LoadBalancer.
4. Inyectar configuración y secretos mediante ConfigMaps y Secrets.
5. Usar los comandos esenciales de `kubectl` para operar y diagnosticar un clúster.
6. Explicar StatefulSets, DaemonSets, Jobs, CronJobs y almacenamiento persistente a nivel conceptual.

**Contenido**

- Pod, ReplicaSet, Deployment.
- Service (ClusterIP, NodePort, LoadBalancer).
- ConfigMaps y Secrets.
- `kubectl` esencial.
- Namespaces.
- StatefulSets, DaemonSets, Jobs y CronJobs.
- Persistent Volumes, PVCs y StorageClasses.

**Evaluación**

Un laboratorio que despliega una aplicación propia en un clúster local con Deployment, Service, ConfigMap y Secret, y tres ejercicios de evaluación sobre la jerarquía Pod/ReplicaSet/Deployment, tipos de Service, y ConfigMap vs Secret.

---

## Comienza desde cero: prepara este capítulo

Este recorrido parte de una carpeta vacía. Al finalizar tendrás **Un laboratorio que despliega una aplicación propia en un clúster local con Deployment, Service, ConfigMap y Secret, y tres ejercicios de evaluación sobre la jerarquía Pod/ReplicaSet/Deployment, tipos de Service, y ConfigMap vs Secret.** No avances ejecutando comandos que no comprendes: primero identifica la entrada, la transformación y la evidencia que comprobará el resultado.

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
│  └─ module-6/
├─ tests/
├─ docs/decisions/
├─ evidence/module-6/
└─ README.md
```

| Tema | Archivo o decisión | Evidencia mínima |
|---|---|---|
| 1. Pod, ReplicaSet, Deployment | `infra/module-6/topic-1-pod-replicaset-deployment.yaml` | prueba + salida observable |
| 2. Service (ClusterIP, NodePort, LoadBalancer) | `infra/module-6/topic-2-service-clusterip-nodeport-loadbalancer.yaml` | prueba + salida observable |
| 3. ConfigMaps y Secrets | `infra/module-6/topic-3-configmaps-y-secrets.yaml` | prueba + salida observable |
| 4. kubectl esencial | `infra/module-6/topic-4-kubectl-esencial.yaml` | prueba + salida observable |
| 5. Namespaces | `infra/module-6/topic-5-namespaces.yaml` | prueba + salida observable |
| 6. StatefulSets, DaemonSets, Jobs y CronJobs | `infra/module-6/topic-6-statefulsets-daemonsets-jobs-y-cronjobs.yaml` | prueba + salida observable |
| 7. Persistent Volumes, PVCs y StorageClasses | `infra/module-6/topic-7-persistent-volumes-pvcs-y-storageclasses.yaml` | prueba + salida observable |

Un ejemplo técnico vive en el archivo indicado y debe tener una prueba. Un tema conceptual vive en `docs/decisions/`: compara opciones usando restricciones medibles; no escribas código decorativo solo para llenar espacio.

### 4. Ejecuta una línea base

Desde `academia-labs/devops`:

```bash
docker compose config
```

**Resultado esperado:** el comando reconoce el proyecto y termina sin errores antes de introducir el cambio del capítulo. Después del incremento, la evidencia debe demostrar: **Un laboratorio que despliega una aplicación propia en un clúster local con Deployment, Service, ConfigMap y Secret, y tres ejercicios de evaluación sobre la jerarquía Pod/ReplicaSet/Deployment, tipos de Service, y ConfigMap vs Secret.**

Si falla la línea base, no continúes. Localiza el primer mensaje que indique archivo, línea o dependencia; formula una causa y compruébala con un cambio pequeño.

### 5. Provoca un fallo y recupérate

Rompe una referencia, variable o healthcheck y localiza la causa con la validación o los logs. Guarda en `evidence/module-6/` el comando, la salida relevante, tu hipótesis y la corrección. Revierte únicamente el cambio deliberado; no borres todo el proyecto para ocultar la causa.

### 6. Conecta el capítulo con RutaFlow

Aplica el aprendizaje de **Kubernetes — fundamentos** a un incremento vertical de RutaFlow. Define qué componente produce el dato, qué contrato lo transporta, quién lo consume y cómo observarás un fallo. La entrega final incluye archivo o decisión, prueba, salida, error corregido y una limitación que todavía validarías en producción.

---

## Contenido teórico

### Tema 1: Pod, ReplicaSet, Deployment

**Conceptos clave:** Pod (unidad mínima desplegable), ReplicaSet (garantía de réplicas), Deployment (gestión de actualizaciones), reconciliación continua.

Un Pod es la unidad más pequeña que Kubernetes puede desplegar y gestionar: agrupa uno o más contenedores que comparten red y almacenamiento, tratados como una única unidad indivisible desde la perspectiva del clúster. En la inmensa mayoría de los casos prácticos, un Pod contiene un único contenedor principal (el patrón de múltiples contenedores en un mismo Pod, llamado "sidecar", es un caso avanzado que cubren módulos posteriores de este track relacionados con service mesh); lo importante de entender es que Kubernetes nunca gestiona contenedores sueltos directamente, siempre los gestiona envueltos en al menos un Pod.

Un ReplicaSet resuelve un problema específico: garantizar que siempre haya un número exacto de Pods idénticos corriendo en todo momento. Si defines un ReplicaSet con `replicas: 3` y uno de esos Pods falla o es eliminado por cualquier motivo, el ReplicaSet lo detecta automáticamente (mediante un ciclo continuo de reconciliación, comparando el estado deseado —3 réplicas— contra el estado actual observado) y crea un Pod nuevo de reemplazo, sin ninguna intervención manual, hasta volver a tener exactamente el número deseado.

Un Deployment, a su vez, gestiona ReplicaSets, añadiendo la capa que hace posible actualizaciones controladas y reversibles: cuando cambias la imagen de contenedor especificada en un Deployment (por ejemplo, de `mi-api:1.0` a `mi-api:1.1`), Kubernetes no modifica el ReplicaSet existente; crea un ReplicaSet nuevo con la configuración actualizada, y gestiona la transición gradual de Pods del ReplicaSet antiguo al nuevo (por defecto, siguiendo exactamente el patrón de rolling update que estudiaste en el Módulo 5 de este track). El ReplicaSet antiguo no se elimina inmediatamente: se conserva con cero réplicas activas, lo que permite un rollback casi instantáneo a la versión anterior si algo sale mal, simplemente revirtiendo el Deployment a apuntar de nuevo al ReplicaSet anterior.

En la práctica diaria, casi nunca creas o gestionas ReplicaSets directamente: interactúas con Deployments, y Kubernetes gestiona los ReplicaSets subyacentes automáticamente como un detalle de implementación. Entender esta jerarquía completa (Pod dentro de ReplicaSet dentro de Deployment) es, sin embargo, esencial para diagnosticar correctamente el estado de una aplicación desplegada, porque los comandos de diagnóstico de `kubectl` (Tema 4 de este módulo) exponen los tres niveles, y entender cuál consultar para qué pregunta específica ahorra mucho tiempo de depuración confusa.

**Analogía:** un Pod es como una caja individual que contiene un producto (o un producto con su empaque protector, en el caso de múltiples contenedores). Un ReplicaSet es como un supervisor de almacén cuyo único trabajo es asegurarse de que siempre haya exactamente 3 cajas de ese producto específico en el estante, reponiendo automáticamente cualquier caja que se retire o se dañe. Un Deployment es como el gerente que decide cuándo cambiar a un producto con una versión nueva de etiqueta, coordinando con el supervisor de almacén una transición gradual (retirando cajas viejas y añadiendo cajas nuevas de a poco) en vez de vaciar y rellenar todo el estante de golpe, y que conserva el registro de la versión anterior por si necesita revertir rápidamente.

**¿Por qué es importante?** Esta jerarquía de tres niveles es la base absoluta de cómo Kubernetes gestiona aplicaciones sin estado (stateless): sin entenderla, comandos como `kubectl get pods`, `kubectl get replicasets` y `kubectl get deployments` parecen mostrar información redundante o confusa, cuando en realidad cada uno responde a una pregunta distinta y complementaria sobre el estado del sistema.

**Diagrama:**

```
Deployment "mi-api"                (gestiona actualizaciones y rollback)
    │
    ├── ReplicaSet "mi-api-v1" (0 réplicas, conservado para rollback)
    │
    └── ReplicaSet "mi-api-v2" (3 réplicas activas)
            ├── Pod (contenedor mi-api:1.1)
            ├── Pod (contenedor mi-api:1.1)
            └── Pod (contenedor mi-api:1.1)
```

### Tema 2: Service (ClusterIP, NodePort, LoadBalancer)

**Conceptos clave:** Service, selector de etiquetas, IP estable, ClusterIP, NodePort, LoadBalancer.

Los Pods en Kubernetes son efímeros por naturaleza: pueden destruirse y recrearse en cualquier momento (por un fallo, una actualización, un reescalado), y cada vez que esto ocurre, el Pod nuevo recibe una dirección IP interna distinta a la del Pod anterior. Depender directamente de la IP de un Pod específico para comunicarte con él sería, por tanto, frágil e inviable en la práctica. Un Service resuelve esto proporcionando una dirección estable (tanto una IP interna fija como, más importante, un nombre DNS resoluble dentro del clúster) que enruta automáticamente el tráfico hacia cualquiera de los Pods que coincidan con un selector de etiquetas definido, sin importar cuántas veces esos Pods específicos hayan sido reemplazados por debajo.

Existen varios tipos de Service según qué alcance de acceso necesitas. `ClusterIP`, el tipo por defecto, expone el Service únicamente dentro del clúster, accesible por otros Pods internos pero no desde fuera del clúster; es el tipo apropiado para comunicación interna entre servicios (por ejemplo, un backend accediendo a una base de datos, ambos corriendo dentro del mismo clúster). `NodePort` expone el Service en un puerto específico de cada nodo (máquina física o virtual) del clúster, haciendo posible el acceso desde fuera del clúster apuntando directamente a la IP de cualquier nodo en ese puerto, un mecanismo simple pero poco práctico de gestionar a gran escala. `LoadBalancer` aprovisiona automáticamente un balanceador de carga externo (típicamente provisto por el proveedor de nube donde corre el clúster) que dirige tráfico externo hacia el Service, siendo el tipo más común para exponer un servicio directamente a internet en un entorno de nube real.

El selector de etiquetas es el mecanismo que conecta un Service con los Pods correctos: un Service definido con `selector: { app: mi-api }` automáticamente incluye en su enrutamiento a cualquier Pod que tenga la etiqueta `app: mi-api`, sin importar de qué Deployment o ReplicaSet provenga ese Pod específicamente. Esto es lo que permite que, durante un rolling update (Tema 1), el Service siga enrutando correctamente tráfico tanto hacia Pods de la versión antigua como hacia Pods de la versión nueva mientras ambos coexisten temporalmente durante la transición, porque ambos comparten la misma etiqueta que el selector del Service está buscando.

Este mecanismo de Service con selector de etiquetas es, conceptualmente, el mismo problema de descubrimiento de nombres que resolviste con Docker Compose en el Módulo 3 de este track (permitir que un servicio se comunique con otro sin depender de direcciones IP frágiles), pero implementado a la escala y con la robustez adicional que un clúster de producción con Pods efímeros y en constante cambio requiere.

**Analogía:** un Service es como el número de atención al cliente de una empresa que nunca cambia, sin importar qué empleado específico (Pod) atienda la llamada en cada momento, ni cuántas veces ese empleado específico cambie de turno o sea reemplazado. `ClusterIP` es como una línea interna que solo funciona dentro del edificio de la empresa. `NodePort` es como dar el número de teléfono directo de cada sucursal física para que alguien externo llame directamente a cualquiera de ellas. `LoadBalancer` es como contratar un servicio de centralita profesional externo que recibe todas las llamadas externas y las distribuye automáticamente a la sucursal correcta.

**¿Por qué es importante?** Sin un Service, la comunicación confiable entre componentes de una aplicación en Kubernetes sería prácticamente imposible de mantener, dado que los Pods individuales cambian de identidad constantemente. Elegir el tipo correcto de Service según el alcance de acceso necesario (interno vs externo) es una de las primeras decisiones de configuración que cualquier aplicación desplegada en Kubernetes requiere.

**Diagrama:**

```
Service "mi-api" (selector: app=mi-api)
        │
   (enruta automáticamente, sin importar qué Pod específico exista ahora)
        │
   ┌────┼────┬────────┐
   ▼         ▼        ▼
 Pod A     Pod B    Pod C     (todos con la etiqueta app=mi-api,
(v1.1)    (v1.1)   (v1.2, nuevo)  incluso durante un rolling update)
```

### Tema 3: ConfigMaps y Secrets

**Conceptos clave:** ConfigMap, Secret, configuración externalizada, datos codificados (no cifrados) en base64.

Un ConfigMap almacena datos de configuración no sensibles como pares clave-valor, que luego pueden inyectarse en un Pod como variables de entorno o como archivos montados, sin necesidad de hornear esos valores directamente dentro de la imagen de contenedor. Esto sigue exactamente el mismo principio de externalización de configuración que ya viste con archivos `.env` en Docker Compose (Módulo 3 de este track), pero implementado como un objeto de primera clase gestionado por Kubernetes, con su propio ciclo de vida y capacidad de actualizarse independientemente de la imagen de la aplicación.

Un Secret, estructuralmente, es muy similar a un ConfigMap (pares clave-valor inyectables de la misma forma), pero está pensado específicamente para datos sensibles: contraseñas, tokens, claves de API. Es importante entender una limitación real de los Secrets nativos de Kubernetes que sorprende a quien los usa por primera vez: por defecto, los valores de un Secret solo están codificados en base64, no cifrados criptográficamente. La codificación en base64 no es un mecanismo de seguridad —es trivialmente reversible por cualquiera con acceso de lectura al objeto—, así que un Secret de Kubernetes sin configuración adicional de cifrado en reposo a nivel de clúster no ofrece, por sí solo, una protección de seguridad mucho más fuerte que un ConfigMap; lo que sí aporta es una separación semántica clara (marcando explícitamente qué datos son sensibles) y algunas protecciones de acceso adicionales a nivel de API de Kubernetes (por ejemplo, los Secrets no se muestran completos por defecto en la salida de algunos comandos de `kubectl describe`, a diferencia de los ConfigMaps).

Para una protección de seguridad real de secretos en un clúster de producción, la práctica recomendada es combinar Kubernetes con un gestor de secretos externo dedicado —como Vault, que vas a estudiar en el Módulo 11 de este mismo track sobre DevSecOps, o los servicios de gestión de secretos nativos de la nube que ya conociste en el track Cloud (Secrets Manager)— en vez de depender únicamente de los Secrets nativos de Kubernetes sin cifrado en reposo configurado explícitamente a nivel del propio clúster.

Tanto ConfigMaps como Secrets se crean de forma imperativa con `kubectl create configmap`/`kubectl create secret`, especificando valores literales o archivos completos, o de forma declarativa como parte de manifiestos YAML versionados junto al resto de la configuración del clúster (el enfoque preferido en proyectos serios, siguiendo la misma filosofía de "todo como código" que ya viste aplicada a pipelines de CI/CD en el Módulo 4 de este track).

**Analogía:** un ConfigMap es como una nota pública pegada en el tablón de anuncios de la oficina con información operativa general (el horario de atención, la dirección de la sucursal). Un Secret es como un sobre cerrado marcado "confidencial" en ese mismo tablón: la etiqueta indica que su contenido es sensible y debería tratarse con más cuidado, pero si alguien simplemente abre el sobre (decodifica el base64), puede leer el contenido con la misma facilidad que la nota pública, a menos que exista una cerradura adicional real (cifrado en reposo) protegiendo ese sobre específico.

**¿Por qué es importante?** Malinterpretar que un Secret de Kubernetes, por su nombre, ya implica cifrado fuerte automático es un error de seguridad común entre quienes empiezan con Kubernetes; entender esta limitación desde el principio evita depender únicamente de Secrets nativos sin configuración adicional para datos verdaderamente críticos en un entorno de producción real.

**Diagrama:**

```
ConfigMap "config-app"              Secret "db-creds"
┌─────────────────────┐           ┌─────────────────────┐
│ LOG_LEVEL: info          │           │ password: c2VjcmV0bw==   │  ← solo base64,
└─────────────────────┘           └─────────────────────┘     NO cifrado
        │                                    │                   por defecto
        ▼                                    ▼
   Pod (variable de entorno LOG_LEVEL, variable de entorno password)
```

### Tema 4: kubectl esencial

**Conceptos clave:** `kubectl get`, `kubectl describe`, `kubectl logs`, `kubectl exec`, contexto de clúster.

`kubectl` es la herramienta de línea de comandos principal para interactuar con cualquier clúster de Kubernetes, y cuatro comandos cubren la inmensa mayoría del trabajo diario de operación y diagnóstico. `kubectl get <recurso>` (por ejemplo, `kubectl get pods`, `kubectl get deployments`, `kubectl get services`) lista los objetos de un tipo específico, mostrando un resumen conciso de su estado actual: cuántas réplicas están listas, cuánto tiempo llevan corriendo, su estado general.

`kubectl describe <recurso> <nombre>` (por ejemplo, `kubectl describe pod mi-api-xyz`) muestra información mucho más detallada sobre un objeto específico, incluyendo, crucialmente, una sección de eventos recientes relacionados con ese objeto: por qué un Pod no ha podido arrancar, qué error específico produjo un fallo de programación (scheduling), o por qué un healthcheck (que en Kubernetes se llama "probe", como verás en el módulo siguiente de este track) está fallando. Este comando es, con diferencia, la primera herramienta de diagnóstico cuando algo no funciona como se espera, mucho antes de recurrir a revisar logs.

`kubectl logs <nombre-del-pod>` muestra la salida estándar (y de error) del contenedor principal de ese Pod, exactamente análogo en propósito a `docker logs` que ya conoces del track Cloud, pero aplicado a un Pod dentro del clúster; con la opción `-f` sigue mostrando nuevas líneas en tiempo real. `kubectl exec -it <nombre-del-pod> -- <comando>` ejecuta un comando dentro de un contenedor ya en ejecución, típicamente usado para abrir una shell interactiva (`kubectl exec -it mi-api-xyz -- sh`) e inspeccionar el estado interno del contenedor directamente, el mismo propósito que `docker exec -it` cumple para contenedores Docker sueltos.

Un detalle operativo importante es que `kubectl` opera siempre contra un contexto específico (una combinación de clúster, usuario y namespace configurados), y es fácil, especialmente cuando se trabaja con múltiples clústeres (por ejemplo, uno local de pruebas y otro de producción real), ejecutar un comando pensando que apunta a un clúster cuando en realidad apunta a otro; `kubectl config current-context` y `kubectl config get-contexts` son comandos esenciales para verificar contra qué clúster estás operando antes de ejecutar cualquier cambio potencialmente destructivo.

**Analogía:** `kubectl get` es como pedir la lista resumida de huéspedes de un hotel con su estado actual (ocupado, disponible). `kubectl describe` es como pedir el expediente completo de un huésped específico, incluyendo el historial reciente de incidencias relacionadas con su habitación. `kubectl logs` es como revisar el registro de actividad de esa habitación específica. `kubectl exec` es como que el personal de mantenimiento entre físicamente a esa habitación mientras el huésped sigue ahí, para inspeccionar algo directamente sin desalojarlo.

**¿Por qué es importante?** Estos cuatro comandos, junto con la verificación de contexto, son la base absoluta del trabajo diario con cualquier clúster Kubernetes real; dominarlos hasta el punto de usarlos reflexivamente es tan fundamental para trabajar con Kubernetes como dominar `docker ps`/`docker logs`/`docker exec` lo es para trabajar con Docker suelto.

**Diagrama:**

```
kubectl get pods           ──▶ vista resumida de todos los Pods
kubectl describe pod <x>   ──▶ detalle completo + eventos recientes de ese Pod
kubectl logs <x>           ──▶ salida estándar/error de ese Pod
kubectl exec -it <x> -- sh ──▶ shell interactiva dentro de ese Pod
kubectl config current-context ──▶ confirma contra qué clúster estás operando
```

### Tema 5: Namespaces

**Conceptos clave:** namespace, aislamiento lógico, `kubectl -n`, namespace por defecto.

Un namespace divide lógicamente un único clúster físico de Kubernetes en múltiples espacios de nombres virtuales independientes, cada uno pudiendo contener sus propios objetos (Pods, Services, ConfigMaps) sin colisionar con objetos del mismo nombre en otro namespace. Esto permite, por ejemplo, tener un namespace `desarrollo` y otro `staging` dentro del mismo clúster físico, cada uno con su propia versión de una aplicación llamada `mi-api`, sin que ambos entren en conflicto entre sí, a pesar de compartir el nombre.

Si no especificas explícitamente un namespace al crear un objeto o al ejecutar un comando de `kubectl`, Kubernetes usa el namespace `default` de forma implícita. Esto es cómodo para experimentar rápidamente en un clúster local de pruebas, pero en un entorno con múltiples equipos o múltiples entornos compartiendo el mismo clúster físico, omitir el namespace explícitamente es una fuente común de confusión: es fácil, sin darte cuenta, listar o modificar recursos en el namespace equivocado, especialmente si tu contexto actual de `kubectl` tiene un namespace por defecto distinto al que asumes.

Los namespaces también son el punto de aplicación de varias políticas de gobernanza de un clúster compartido: cuotas de recursos (limitar cuánta CPU o memoria puede consumir en total un namespace específico), políticas de red (restringir qué namespaces pueden comunicarse entre sí), y control de acceso basado en roles (RBAC, que verás en el módulo siguiente de este track), que puede otorgar permisos limitados a un usuario o equipo específico solo sobre su propio namespace, sin acceso al resto del clúster.

Es importante notar que un namespace no es un mecanismo de aislamiento tan fuerte como clústeres físicamente separados: por defecto, sin políticas de red adicionales explícitamente configuradas, los Pods de distintos namespaces todavía pueden comunicarse entre sí por red dentro del mismo clúster. El namespace organiza y separa lógicamente los objetos y facilita aplicar políticas específicas, pero el aislamiento de red real requiere configuración adicional explícita si es un requisito de seguridad del contexto.

**Analogía:** los namespaces son como pisos distintos dentro del mismo edificio de oficinas: cada piso puede tener su propia sala llamada "Sala de reuniones A" sin conflicto con la sala del mismo nombre en otro piso, y es posible aplicar reglas específicas por piso (un límite de aforo distinto para cada uno), pero salvo que se instalen controles de acceso adicionales explícitos entre pisos, cualquiera puede tomar el ascensor y moverse libremente de un piso a otro dentro del mismo edificio.

**¿Por qué es importante?** En cualquier clúster real compartido por múltiples equipos o entornos, entender y usar namespaces correctamente evita colisiones de nombres, permite aplicar cuotas y políticas diferenciadas, y reduce el riesgo de operar accidentalmente sobre el entorno equivocado por omitir el namespace en un comando de `kubectl`.

**Diagrama:**

```
Clúster físico único
├── namespace "desarrollo"
│    └── Deployment "mi-api" (versión de desarrollo)
├── namespace "staging"
│    └── Deployment "mi-api" (versión de staging, mismo nombre, sin conflicto)
└── namespace "default"
     └── (lo que crees sin especificar namespace explícitamente)
```

### Tema 6: StatefulSets, DaemonSets, Jobs y CronJobs

**Conceptos clave:** StatefulSet (identidad estable), DaemonSet (un Pod por nodo), Job (tarea que termina), CronJob (Job programado).

Más allá de Deployment (para aplicaciones sin estado, donde cualquier réplica es intercambiable con cualquier otra), Kubernetes ofrece objetos especializados para patrones distintos. Un StatefulSet gestiona Pods que necesitan una identidad estable y persistente a lo largo del tiempo: cada réplica de un StatefulSet recibe un nombre ordinal predecible y estable (`mi-base-0`, `mi-base-1`, `mi-base-2`, no nombres aleatorios como los Pods normales de un Deployment), y, combinado con almacenamiento persistente (Tema 7), cada réplica mantiene su propio volumen de datos asociado consistentemente, incluso si el Pod se reinicia. Esto es exactamente lo que necesita una base de datos distribuida desplegada dentro de Kubernetes, donde cada réplica necesita mantener su propia identidad y sus propios datos de forma consistente, a diferencia de una aplicación sin estado donde cualquier réplica es perfectamente intercambiable con cualquier otra.

Un DaemonSet garantiza que exactamente un Pod de un tipo específico corra en cada nodo del clúster (o en un subconjunto de nodos que cumplan cierto criterio), en vez de un número fijo de réplicas distribuidas sin relación directa con los nodos físicos subyacentes. Es el patrón típico para agentes de infraestructura que necesitan estar presentes en cada máquina del clúster: un agente de recolección de logs, un agente de monitorización de métricas de nodo, o un agente de red específico, cada uno necesitando exactamente una instancia por nodo, ni más ni menos.

Un Job ejecuta una tarea que se espera que termine (a diferencia de un Deployment, pensado para procesos de larga duración continua que nunca deberían terminar por sí solos), y Kubernetes garantiza que esa tarea se complete exitosamente, reintentando automáticamente si el Pod falla antes de completarse. Es el patrón apropiado para tareas puntuales como una migración de base de datos, un procesamiento de datos por lotes, o cualquier tarea con un principio y un fin claramente definidos. Un CronJob añade programación temporal sobre un Job, ejecutándolo automáticamente según una expresión cron (exactamente la misma sintaxis que estudiaste con `cron` de Linux en el Módulo 0 de este track), siendo el equivalente nativo de Kubernetes a programar tareas periódicas, pero gestionado y observable como cualquier otro objeto del clúster.

Elegir el objeto correcto según el patrón de tu carga de trabajo —Deployment para servicios sin estado de larga duración, StatefulSet para servicios con estado que necesitan identidad estable, DaemonSet para agentes de infraestructura por nodo, Job/CronJob para tareas puntuales o programadas— es una decisión de diseño fundamental que determina cómo Kubernetes gestiona el ciclo de vida completo de esos Pods.

**Analogía:** un Deployment es como un equipo de operadores de call center intercambiables, donde cualquier operador disponible puede atender cualquier llamada entrante. Un StatefulSet es como un equipo de gerentes de cuenta, donde cada cliente específico siempre habla con su mismo gerente asignado, que mantiene el historial completo de esa relación específica. Un DaemonSet es como un guardia de seguridad asignado permanentemente a cada entrada del edificio, uno por cada entrada física, ni más ni menos. Un Job es como una tarea de mudanza puntual que se considera completa una vez terminada, no un puesto de trabajo permanente. Un CronJob es esa misma tarea de mudanza, pero programada para repetirse automáticamente cada cierto tiempo.

**¿Por qué es importante?** Usar Deployment para todo, incluyendo cargas de trabajo que en realidad necesitan las garantías específicas de un StatefulSet (como una base de datos) o el patrón de un Job (como una migración puntual), es un error de diseño común entre quienes empiezan con Kubernetes, que puede causar pérdida de datos o comportamiento inesperado precisamente porque Deployment no ofrece las garantías de identidad estable ni de finalización garantizada que esos otros patrones sí ofrecen.

**Diagrama:**

```
Deployment          StatefulSet           DaemonSet            Job / CronJob
(sin estado,        (con estado,          (uno por nodo,       (tarea que termina,
 réplicas            identidad             para agentes de       opcionalmente
 intercambiables)     estable por           infraestructura)      programada)
                      réplica)
```

### Tema 7: Persistent Volumes, PVCs y StorageClasses

**Conceptos clave:** Persistent Volume (PV), Persistent Volume Claim (PVC), StorageClass, aprovisionamiento dinámico.

Un Persistent Volume (PV) representa una porción de almacenamiento físico real disponible en el clúster (un disco de red, un volumen de un proveedor de nube, almacenamiento local de un nodo), existiendo como un recurso del clúster independiente del ciclo de vida de cualquier Pod específico que eventualmente lo use. Un Persistent Volume Claim (PVC) es, en cambio, una solicitud que hace una aplicación (o más específicamente, un Pod) pidiendo almacenamiento con ciertas características (tamaño mínimo, modo de acceso), sin necesitar conocer los detalles concretos de qué PV físico específico va a satisfacer esa solicitud.

Esta separación entre PV (la oferta de almacenamiento real) y PVC (la solicitud de una aplicación) sigue el mismo espíritu de abstracción que ya viste con Services desacoplando a los consumidores de la identidad específica de los Pods que los atienden: una aplicación declara "necesito 10 GB de almacenamiento persistente" mediante un PVC, sin acoplarse a los detalles de infraestructura de almacenamiento subyacente, que puede cambiar entre distintos clústeres o proveedores sin que la definición de la aplicación necesite modificarse.

Una StorageClass automatiza la creación de Persistent Volumes bajo demanda (aprovisionamiento dinámico): en vez de que un administrador del clúster tenga que crear manualmente un PV específico de antemano para cada PVC que una aplicación pueda necesitar, una StorageClass define una plantilla de cómo aprovisionar almacenamiento automáticamente (por ejemplo, "crea un disco SSD de red en el proveedor de nube subyacente") cuando un PVC la referencia, generando el PV correspondiente de forma dinámica y automática en el momento en que se necesita, sin intervención manual previa.

Combinar StatefulSet (Tema 6) con PVCs respaldados por una StorageClass es exactamente el patrón que hace posible desplegar de forma confiable una base de datos dentro de Kubernetes: cada réplica del StatefulSet recibe automáticamente su propio PVC (y por tanto su propio almacenamiento persistente independiente), aprovisionado dinámicamente, y ese almacenamiento específico permanece asociado consistentemente a esa réplica específica del StatefulSet a lo largo de reinicios y actualizaciones, preservando sus datos de forma confiable.

**Analogía:** un Persistent Volume es como un depósito de almacenamiento físico real ya construido en algún lugar de una ciudad de almacenes. Un PVC es como el formulario de solicitud de una empresa pidiendo "necesito 10 metros cúbicos de espacio de almacenamiento", sin necesitar saber ni elegir manualmente en qué depósito físico específico de la ciudad se le va a asignar ese espacio. Una StorageClass es como el sistema automatizado de gestión de la ciudad de almacenes que, cada vez que llega una solicitud nueva, construye o asigna automáticamente el depósito correspondiente sin que un gestor humano tenga que intervenir manualmente en cada solicitud individual.

**¿Por qué es importante?** Este sistema de abstracción de almacenamiento en tres capas (PV, PVC, StorageClass) es lo que permite que aplicaciones con estado —bases de datos, sistemas de archivos compartidos, cualquier carga de trabajo que necesite persistencia real— puedan desplegarse dentro de Kubernetes de forma portable entre distintos entornos de infraestructura subyacente, sin acoplar la definición de la aplicación a los detalles específicos de dónde y cómo se provee físicamente ese almacenamiento en cada clúster particular.

**Diagrama:**

```
StatefulSet "mi-base" (3 réplicas)
    │
    ├── mi-base-0 ──▶ PVC "datos-0" ──▶ (StorageClass aprovisiona) ──▶ PV físico 0
    ├── mi-base-1 ──▶ PVC "datos-1" ──▶ (StorageClass aprovisiona) ──▶ PV físico 1
    └── mi-base-2 ──▶ PVC "datos-2" ──▶ (StorageClass aprovisiona) ──▶ PV físico 2
         (cada réplica mantiene consistentemente SU PROPIO volumen persistente)
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

**Objetivo del laboratorio:** crear un clúster local con `kind` o `minikube`, desplegar una aplicación propia con un Deployment de 3 réplicas, exponerla con un Service, inyectar configuración con ConfigMap y Secret, y observar la auto-reparación de un Pod eliminado manualmente.

**Requisitos previos:** Docker instalado, `kubectl` instalado, y `kind` o `minikube` instalado para crear un clúster local de pruebas.

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Crear un clúster local | `kind create cluster --name mi-cluster` (o `minikube start`) | Levanta un clúster Kubernetes completo dentro de contenedores Docker en tu propia máquina | El comando termina confirmando que el clúster está listo |
| 2 | Verificar el clúster | `kubectl get nodes` | Confirma que `kubectl` puede comunicarse con el clúster recién creado | Al menos un nodo listado con estado `Ready` |
| 3 | Crear el ConfigMap y el Secret | `kubectl create configmap config-app --from-literal=LOG_LEVEL=info`<br>`kubectl create secret generic db-creds --from-literal=password=secreto` | Prepara la configuración que el Deployment va a consumir | Ambos objetos se crean sin error |
| 4 | Definir y aplicar el Deployment | Crea un archivo YAML con un Deployment de 3 réplicas de tu propia imagen, inyectando `LOG_LEVEL` y `password` como variables de entorno desde el ConfigMap y el Secret respectivamente, y aplícalo con `kubectl apply -f deployment.yaml` | Despliega la aplicación con su configuración externalizada | `kubectl get pods` muestra 3 Pods en estado `Running` |
| 5 | Exponer el Deployment con un Service | Crea un archivo YAML con un Service tipo `ClusterIP` con `selector: { app: mi-api }`, y aplícalo | Da una dirección estable de acceso a las 3 réplicas | `kubectl get services` muestra el Service con una IP de clúster asignada |
| 6 | Acceder al Service desde tu máquina | `kubectl port-forward service/mi-api 8080:80` | Redirige temporalmente el puerto del Service a tu máquina local para poder probarlo directamente | Puedes acceder a `http://localhost:8080` y recibir respuesta de la aplicación |
| 7 | Eliminar un Pod manualmente | `kubectl delete pod <nombre-de-uno-de-los-pods>` | Simula un fallo para observar la auto-reparación | El Pod eliminado desaparece de inmediato |
| 8 | Verificar la auto-reparación | `kubectl get pods` (repetido varias veces en los segundos siguientes) | El ReplicaSet detrás del Deployment detecta la discrepancia y crea un Pod nuevo automáticamente | Vuelve a haber exactamente 3 Pods en estado `Running`, uno de ellos con un nombre nuevo y un tiempo de vida (`AGE`) menor que los demás |

**Verificación:** el laboratorio se considera exitoso si, tras eliminar manualmente un Pod, `kubectl get pods` muestra que el número de réplicas vuelve automáticamente a 3 sin ninguna intervención manual adicional, confirmando el comportamiento de reconciliación continua del ReplicaSet gestionado por el Deployment.

**Errores comunes y soluciones**

- **`kubectl get nodes` no muestra ningún nodo, o reporta error de conexión.** Verifica que el clúster local (`kind` o `minikube`) realmente terminó de arrancar, y que tu contexto de `kubectl` (`kubectl config current-context`) apunta al clúster recién creado, no a uno distinto configurado previamente.
- **Los Pods del Deployment quedan en estado `ImagePullBackOff`.** Si tu imagen es local y no está publicada en un registry accesible desde el clúster, `kind` requiere cargarla explícitamente con `kind load docker-image <tu-imagen> --name mi-cluster` antes de que los Pods puedan usarla.
- **El Service no enruta tráfico a ningún Pod (`kubectl describe service` muestra 0 endpoints).** Revisa que el `selector` del Service coincide exactamente con las etiquetas (`labels`) definidas en la plantilla de Pods del Deployment; un desajuste de etiquetas es la causa más común de un Service sin endpoints.
- **El Pod nuevo tras `kubectl delete pod` no aparece, o el conteo de réplicas queda en menos de 3 permanentemente.** Ejecuta `kubectl describe deployment mi-api` y revisa la sección de eventos; frecuentemente indica un problema de recursos insuficientes en el clúster local, o un error persistente en la imagen que impide que el Pod de reemplazo llegue a estado `Running`.

---

## Ejercicios de evaluación

### Ejercicio 1: Explicar la jerarquía Pod/ReplicaSet/Deployment

**Enunciado:** sin mirar el Tema 1, explica con tus propias palabras qué pasaría si, en un clúster con un Deployment de 3 réplicas, eliminas manualmente el ReplicaSet directamente (no un Pod individual, sino el ReplicaSet completo). ¿El Deployment se ve afectado? ¿Los Pods existentes desaparecen inmediatamente?

**Solución esperada:** eliminar el ReplicaSet directamente elimina también, en cascada, los Pods gestionados por ese ReplicaSet (porque el ReplicaSet es su propietario). Sin embargo, el Deployment detecta esta discrepancia (ya no existe el ReplicaSet que debería estar gestionando 3 réplicas) y, siguiendo su propio ciclo de reconciliación continua, crea un ReplicaSet nuevo (idéntico en configuración al eliminado) que a su vez crea 3 Pods nuevos, restaurando el estado deseado automáticamente, sin necesidad de que un humano intervenga para recrear el ReplicaSet manualmente.

**Criterios de éxito:**
- Explica correctamente que eliminar el ReplicaSet elimina también sus Pods en cascada.
- Explica que el Deployment detecta la discrepancia y recrea automáticamente el ReplicaSet (y por tanto los Pods), sin intervención manual.

### Ejercicio 2: Elegir el tipo de Service correcto

**Enunciado:** tienes tres servicios en tu clúster: (a) una base de datos que solo debe ser accesible por otros servicios dentro del mismo clúster; (b) una API que necesitas exponer directamente a internet en un entorno de nube real; (c) un servicio de pruebas rápidas que solo necesitas acceder ocasionalmente desde tu propia máquina apuntando directamente a un nodo del clúster. Asigna el tipo de Service correcto a cada uno.

**Solución esperada:** (a) `ClusterIP`, porque no necesita ningún acceso externo al clúster; (b) `LoadBalancer`, porque necesita exposición directa a internet en un entorno de nube real, aprovisionando automáticamente un balanceador externo; (c) `NodePort`, como una solución simple y directa para acceso ocasional apuntando a un puerto específico de cualquier nodo, sin necesidad de un balanceador externo completo.

**Criterios de éxito:**
- Las tres asignaciones coinciden con la solución esperada.
- Puede justificar cada elección en términos del alcance de acceso necesario (interno, externo permanente, externo ocasional).

### Ejercicio 3: ConfigMap o Secret

**Enunciado:** para cada uno de estos cuatro valores de configuración, indica si lo guardarías en un ConfigMap o en un Secret, y menciona la limitación real de seguridad de los Secrets nativos de Kubernetes que deberías tener presente: (a) el nivel de logging (`info`, `debug`); (b) la contraseña de conexión a una base de datos; (c) la URL base de una API externa; (d) un token de autenticación de un servicio de terceros.

**Solución esperada:** (a) ConfigMap, no es sensible; (b) Secret; (c) ConfigMap, no es sensible; (d) Secret. La limitación real a tener presente es que los Secrets nativos de Kubernetes solo están codificados en base64 por defecto, no cifrados criptográficamente, por lo que para datos verdaderamente críticos en producción conviene combinar Kubernetes con un gestor de secretos externo dedicado (como Vault) o cifrado en reposo configurado explícitamente a nivel de clúster.

**Criterios de éxito:**
- Clasifica correctamente los cuatro valores entre ConfigMap y Secret.
- Menciona explícitamente la limitación de que los Secrets nativos solo están codificados en base64, no cifrados, por defecto.

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

- Un Pod es la unidad mínima desplegable; un ReplicaSet garantiza un número exacto de réplicas; un Deployment gestiona ReplicaSets para habilitar actualizaciones controladas y rollback.
- Un Service da una dirección estable de acceso a un conjunto de Pods mediante selectores de etiquetas, independiente de la identidad efímera de cada Pod individual; ClusterIP, NodePort y LoadBalancer ofrecen distintos alcances de acceso.
- Los ConfigMaps externalizan configuración no sensible; los Secrets están pensados para datos sensibles, pero solo están codificados en base64 por defecto, no cifrados.
- `kubectl get`, `describe`, `logs` y `exec` cubren la mayoría del diagnóstico diario de un clúster.
- Los namespaces dividen lógicamente un clúster físico, útiles para separar entornos o equipos, aunque no implican aislamiento de red fuerte por sí solos.
- StatefulSets, DaemonSets, Jobs y CronJobs cubren patrones de carga de trabajo distintos a los de un Deployment sin estado tradicional.
- Persistent Volumes, PVCs y StorageClasses proveen almacenamiento persistente de forma portable y desacoplada de la infraestructura física subyacente.

**Conceptos aprendidos**

- La jerarquía Pod/ReplicaSet/Deployment y la reconciliación continua.
- Tipos de Service y su alcance de acceso.
- ConfigMaps y Secrets, y la limitación real de seguridad de estos últimos.
- Comandos esenciales de `kubectl` para operar y diagnosticar un clúster.
- Namespaces como mecanismo de organización lógica.
- StatefulSets, DaemonSets, Jobs y CronJobs.
- Persistent Volumes, PVCs y StorageClasses.

**Próximos pasos**

En el Módulo 7 vas a empaquetar tus manifiestos como Helm charts reutilizables, exponer tu clúster a internet con un Ingress Controller, y configurar autoscaling y control de acceso basado en roles (RBAC).

**Recursos adicionales**

- Documentación oficial de Kubernetes: conceptos de Pods, ReplicaSets, Deployments y Services.
- Documentación oficial sobre ConfigMaps, Secrets, y cifrado en reposo de Secrets.
- Documentación oficial de `kind` y `minikube` para clústeres locales de desarrollo.
