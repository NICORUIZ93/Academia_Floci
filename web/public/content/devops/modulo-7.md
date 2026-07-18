# Módulo 7: Kubernetes avanzado — Helm e Ingress

## Sílabo

**Objetivo general**

Empaquetar manifiestos de Kubernetes como charts de Helm reutilizables y parametrizables, exponer un clúster a internet de forma controlada con Ingress, configurar autoscaling automático, y aplicar probes y RBAC para robustez y seguridad.

**Objetivos específicos**

1. Convertir manifiestos YAML sueltos en un Helm chart parametrizable con `values.yaml`.
2. Instalar un Ingress Controller y enrutar un dominio hacia un Service interno.
3. Configurar un HorizontalPodAutoscaler basado en uso de CPU.
4. Diferenciar liveness probes de readiness probes y su efecto respectivo.
5. Crear un Role y un RoleBinding que limiten el acceso de una cuenta de servicio.
6. Explicar a nivel conceptual qué resuelve un service mesh y el propósito de mTLS.

**Contenido**

- Helm charts y `values`.
- Ingress Controllers y reglas de enrutamiento.
- HorizontalPodAutoscaler.
- Probes de liveness y readiness.
- RBAC en Kubernetes.
- Service Mesh: Istio, Linkerd, Envoy y mTLS.
- `startupProbe` y estrategias Recreate vs RollingUpdate.

**Evaluación**

Un laboratorio que empaqueta una aplicación como Helm chart, expone con Ingress, configura autoscaling y probes, y tres ejercicios de evaluación sobre Helm vs YAML suelto, liveness vs readiness, y diseño de RBAC.

---

## Contenido teórico

### Tema 1: Helm charts y values

**Conceptos clave:** chart, `values.yaml`, plantillas con sintaxis Go template, `helm install`/`upgrade`.

Un Helm chart empaqueta un conjunto completo de manifiestos de Kubernetes —Deployments, Services, ConfigMaps, y cualquier otro objeto necesario— como una unidad reutilizable y versionable, con puntos de parametrización explícitos definidos en un archivo `values.yaml`. En vez de mantener manifiestos YAML estáticos donde cualquier diferencia entre entornos (número de réplicas, tag de imagen, límites de recursos) requiere archivos separados casi idénticos o ediciones manuales propensas a error, un chart usa plantillas con sintaxis de Go template (`{{ .Values.replicaCount }}`) que se rellenan dinámicamente con los valores de `values.yaml` en el momento de instalar o actualizar el chart.

Esto significa que el mismo chart puede desplegarse en desarrollo con `replicaCount: 1` y en producción con `replicaCount: 5`, simplemente proporcionando un archivo de `values` distinto para cada entorno (o sobrescribiendo valores puntuales directamente en la línea de comandos con `--set replicaCount=5`), sin duplicar ni mantener manifiestos YAML completos separados para cada entorno. El chart en sí —su estructura, su lógica de plantillas— se mantiene idéntico entre entornos; solo cambian los valores concretos que lo parametrizan.

`helm install <nombre> <ruta-del-chart>` instala un chart por primera vez, creando lo que Helm llama un "release": una instancia nombrada y versionada de ese chart desplegada en el clúster. `helm upgrade <nombre> <ruta-del-chart>` actualiza un release existente con una nueva versión del chart o nuevos valores, y Helm mantiene un historial de revisiones de cada release, permitiendo revertir a una revisión anterior con `helm rollback` de forma similar en espíritu al rollback de versiones que ya viste con Deployments en el módulo anterior de este track, pero operando ahora sobre el conjunto completo de manifiestos que el chart representa, no sobre un único Deployment aislado.

Helm también resuelve el problema de compartir configuración y lógica común entre múltiples charts mediante subcharts y bibliotecas de plantillas reutilizables, y el ecosistema de Helm incluye repositorios públicos de charts ya construidos para software de terceros ampliamente usado (bases de datos, herramientas de observabilidad, controladores de infraestructura), permitiendo instalar software complejo de terceros dentro de tu clúster con una configuración mínima propia, en vez de escribir manifiestos completos desde cero para cada pieza de software externo que necesites desplegar.

**Analogía:** un conjunto de manifiestos YAML sueltos es como escribir una carta completa nueva cada vez que necesitas comunicar algo similar a alguien distinto, copiando y ajustando manualmente cada vez. Un Helm chart es como una plantilla de carta con campos marcados claramente (`[NOMBRE]`, `[FECHA]`) que rellenas con los datos específicos de cada destinatario, mientras la estructura y el contenido general de la carta permanecen consistentes y se mantienen en un único lugar.

**¿Por qué es importante?** A medida que una aplicación crece en complejidad de manifiestos (múltiples Deployments, Services, ConfigMaps, Ingress, HorizontalPodAutoscaler, todos relacionados entre sí), gestionarlos como archivos YAML sueltos se vuelve rápidamente inmanejable entre múltiples entornos; Helm es, con diferencia, la herramienta más adoptada de la industria para resolver ese problema de empaquetado y parametrización a escala.

**Diagrama:**

```
mi-chart/
├── Chart.yaml           (metadatos del chart)
├── values.yaml           (valores por defecto: replicaCount: 3, image.tag: "1.0")
└── templates/
     ├── deployment.yaml   (usa {{ .Values.replicaCount }}, {{ .Values.image.tag }})
     └── service.yaml

helm install mi-api ./mi-chart --set replicaCount=5
     └──▶ genera los manifiestos finales con replicaCount=5, los aplica al clúster
```

### Tema 2: Ingress Controllers y reglas de enrutamiento

**Conceptos clave:** Ingress (regla de enrutamiento), Ingress Controller (implementación), host-based routing, path-based routing.

Un objeto Ingress define reglas de enrutamiento HTTP/HTTPS desde el exterior del clúster hacia Services internos específicos, basándose en el dominio (host) y/o la ruta (path) de la petición entrante. Por ejemplo, una regla de Ingress puede especificar que las peticiones dirigidas al dominio `api.miapp.com` se enruten hacia el Service `mi-api`, mientras que peticiones a `admin.miapp.com` se enruten hacia un Service completamente distinto, todo compartiendo la misma dirección IP externa de entrada al clúster, en vez de necesitar un `LoadBalancer` (Módulo 6, Tema 2) separado y con su propia IP externa dedicada para cada servicio individual que necesites exponer.

Es importante entender que un objeto Ingress, por sí solo, es solo una declaración de intención: define las reglas deseadas, pero no implementa ningún comportamiento real sin un Ingress Controller corriendo en el clúster que efectivamente lea esas reglas y las aplique. Un Ingress Controller (implementaciones comunes incluyen NGINX Ingress Controller, Traefik, o soluciones nativas de proveedores de nube específicos) es el componente que realmente escucha tráfico entrante, consulta las reglas de Ingress definidas en el clúster, y enruta cada petición al Service interno correcto según esas reglas. Sin un Ingress Controller instalado y corriendo, crear objetos Ingress no tiene ningún efecto observable, de forma similar a cómo definir recursos y métodos en API Gateway (que estudiaste en el track Cloud) no tiene efecto hasta desplegarlos a un stage.

Concentrar el enrutamiento de múltiples servicios detrás de un único punto de entrada (el Ingress Controller) también facilita centralizar preocupaciones transversales como terminación TLS/SSL (gestionar los certificados HTTPS en un único lugar, en vez de en cada servicio individual), redirecciones, y políticas de limitación de tasa (rate limiting), sin tener que implementar esas mismas preocupaciones repetidamente dentro de cada aplicación individual desplegada en el clúster.

El enrutamiento basado en host (host-based routing) dirige tráfico según el dominio de la petición (`api.miapp.com` vs `admin.miapp.com`), mientras que el enrutamiento basado en ruta (path-based routing) dirige tráfico según la ruta dentro del mismo dominio (`miapp.com/api` vs `miapp.com/admin`); un mismo objeto Ingress puede combinar ambos tipos de reglas simultáneamente según las necesidades específicas de la aplicación.

**Analogía:** un Ingress es como el directorio de un edificio de oficinas que especifica "la empresa A está en el piso 3, la empresa B está en el piso 5", pero ese directorio por sí solo no dirige físicamente a nadie a ningún lado. El Ingress Controller es como el guardia de seguridad en la entrada principal del edificio que efectivamente lee ese directorio y dirige a cada visitante hacia el piso correcto según a quién busque, siendo el único punto de entrada físico compartido por todas las empresas del edificio.

**¿Por qué es importante?** El Ingress es el mecanismo estándar para exponer múltiples servicios HTTP dentro de un clúster de Kubernetes de forma eficiente en costos (compartiendo un único punto de entrada externo) y centralizada (gestionando TLS y otras preocupaciones transversales en un solo lugar), en vez de aprovisionar un balanceador de carga externo independiente y costoso para cada servicio individual.

**Diagrama:**

```
Internet
   │
   ▼
Ingress Controller (único punto de entrada externo)
   │
   ├── host: api.miapp.com    ──▶ Service "mi-api"
   ├── host: admin.miapp.com  ──▶ Service "mi-admin"
   └── path: /docs             ──▶ Service "documentacion"
```

### Tema 3: HorizontalPodAutoscaler

**Conceptos clave:** HorizontalPodAutoscaler (HPA), métrica objetivo, escalado automático de réplicas, mínimo y máximo.

Un HorizontalPodAutoscaler ajusta automáticamente el número de réplicas de un Deployment (u otro objeto escalable equivalente) en función de una métrica observada, típicamente el uso de CPU o memoria, aunque también puede configurarse contra métricas personalizadas más específicas del negocio (como el número de mensajes pendientes en una cola, si se integra con un sistema de métricas adicional). Al configurar un HPA con `kubectl autoscale deployment mi-api --cpu-percent=70 --min=2 --max=10`, le indicas a Kubernetes que mantenga automáticamente el uso promedio de CPU de las réplicas alrededor del 70%, incrementando el número de réplicas si el uso supera ese objetivo (hasta un máximo de 10), y reduciéndolo si el uso cae significativamente por debajo (hasta un mínimo de 2, nunca menos, para mantener disponibilidad básica incluso con tráfico mínimo).

Este escalado automático horizontal (añadir o quitar réplicas completas) es distinto del escalado vertical (dar más CPU o memoria a una réplica individual existente): el HPA por defecto opera horizontalmente, siguiendo la filosofía de que, en aplicaciones sin estado bien diseñadas, es generalmente más simple y más resiliente escalar añadiendo más instancias intercambiables que intentar hacer una instancia individual progresivamente más grande y potente, un principio que conecta directamente con por qué las aplicaciones sin estado (Módulo 6, Tema 6) son el caso ideal para este tipo de escalado automático horizontal.

Configurar correctamente los límites mínimo y máximo de réplicas es una decisión de diseño importante: un mínimo demasiado bajo puede dejar el servicio con capacidad insuficiente durante picos súbitos de tráfico mientras el HPA reacciona (el escalado no es instantáneo, toma cierto tiempo observar la métrica y crear los Pods adicionales), mientras que un máximo demasiado bajo limita artificialmente cuánto puede crecer el servicio incluso ante demanda legítima sostenida, y un máximo sin ningún límite razonable puede exponer al equipo a un coste de infraestructura descontrolado si, por ejemplo, un bug provoca un consumo anómalo y sostenido de CPU que el HPA interpretaría erróneamente como demanda legítima de más réplicas.

El HPA depende de que el clúster tenga habilitado un servidor de métricas (metrics-server, en la configuración más común) que le proporcione datos actualizados de uso de recursos; sin esa pieza de infraestructura adicional funcionando correctamente, el HPA no tiene datos sobre los cuales basar sus decisiones de escalado, y simplemente no actuará, independientemente de cómo esté configurado.

**Analogía:** un HorizontalPodAutoscaler es como un sistema automático de contratación temporal para un restaurante: si el número de comensales (la métrica de carga) supera cierto umbral, el sistema contrata automáticamente más meseros (réplicas) hasta un máximo razonable; si el restaurante se vacía, reduce automáticamente el personal activo hasta un mínimo que garantiza que siempre haya alguien atendiendo, sin llegar nunca a cero.

**¿Por qué es importante?** El HPA es lo que permite que una aplicación desplegada en Kubernetes responda automáticamente a fluctuaciones reales de demanda sin intervención manual constante, un requisito prácticamente indispensable para cualquier servicio con tráfico variable a lo largo del día o con picos de demanda impredecibles.

**Diagrama:**

```
HorizontalPodAutoscaler (objetivo: 70% CPU, min:2, max:10)
        │
   observa uso real de CPU de las réplicas actuales
        │
   ¿uso > 70%? ──▶ Sí ──▶ incrementa réplicas (hasta el máximo de 10)
        │
        └────────▶ No, uso << 70% ──▶ reduce réplicas (hasta el mínimo de 2)
```

### Tema 4: Probes de liveness y readiness

**Conceptos clave:** liveness probe, readiness probe, `startupProbe`, reinicio vs exclusión de tráfico.

Una liveness probe verifica periódicamente si un contenedor sigue funcionando correctamente desde una perspectiva interna; si falla repetidamente (según el número de reintentos configurado), Kubernetes concluye que el contenedor está en un estado irrecuperable (por ejemplo, atascado en un bloqueo interno del que nunca se recuperaría por sí solo) y lo reinicia automáticamente, exactamente el mismo Pod pero con un contenedor nuevo arrancado desde cero. Es el mecanismo de auto-reparación a nivel de proceso individual, complementario a la reconciliación de réplicas que ya viste con ReplicaSet en el módulo anterior de este track.

Una readiness probe, en cambio, no dispara ningún reinicio: determina si el contenedor está actualmente listo para recibir tráfico de usuarios, y si la probe falla, Kubernetes simplemente deja de enrutar tráfico hacia ese Pod específico a través de cualquier Service que lo referencie (Módulo 6, Tema 2), sin reiniciarlo ni tomar ninguna otra acción destructiva. Esto es exactamente el mismo concepto que estudiaste con los healthchecks de Docker Compose en el Módulo 3 de este track (`condition: service_healthy`), pero aplicado de forma continua durante toda la vida del Pod, no solo en el momento del arranque inicial: un Pod que estuvo sano durante horas puede volverse temporalmente no-listo (por ejemplo, si pierde conexión temporal con una base de datos externa) sin que eso signifique que el proceso en sí está roto y necesite reiniciarse.

La diferencia práctica entre ambas es crucial y con consecuencias muy distintas si se configuran mal: usar solo una liveness probe demasiado agresiva para verificar dependencias externas (por ejemplo, hacer que la liveness probe falle si la conexión a una base de datos externa está temporalmente caída) puede provocar reinicios innecesarios y repetidos de un contenedor que en realidad está perfectamente sano internamente, simplemente esperando a que una dependencia externa se recupere; ese escenario es exactamente el caso de uso correcto para una readiness probe (dejar de recibir tráfico temporalmente sin reiniciar nada), no para una liveness probe.

`startupProbe` resuelve un problema adicional específico de aplicaciones con tiempos de arranque lentos o variables: da un periodo de gracia inicial durante el cual ni la liveness ni la readiness probe se evalúan todavía, evitando que Kubernetes reinicie prematuramente un contenedor que simplemente todavía está en proceso legítimo de arranque (cargando datos iniciales, estableciendo conexiones) y aún no ha llegado al punto de poder responder correctamente a las probes normales.

**Analogía:** una liveness probe es como comprobar si el corazón de un paciente sigue latiendo: si deja de latir, se requiere una intervención de emergencia (reanimación, en este caso el reinicio del contenedor). Una readiness probe es como comprobar si el paciente está en condiciones de recibir visitas en este momento específico: puede estar perfectamente vivo y estable, pero temporalmente no disponible para recibir visitas (por ejemplo, durmiendo), sin que eso requiera ninguna intervención médica de emergencia, solo esperar y dejar de dirigir visitantes hacia esa habitación por ahora.

**¿Por qué es importante?** Confundir el propósito de liveness y readiness (o configurar la liveness probe para verificar dependencias externas que fluctúan de forma normal y temporal) es una de las causas más comunes de reinicios innecesarios y disrupción en clústeres de Kubernetes reales, precisamente porque el efecto de un reinicio (liveness) es mucho más disruptivo que simplemente dejar de recibir tráfico temporalmente (readiness).

**Diagrama:**

```
livenessProbe falla repetidamente  ──▶  Kubernetes REINICIA el contenedor
readinessProbe falla                ──▶  Kubernetes deja de enrutar tráfico
                                          (NO reinicia, el contenedor sigue vivo)
startupProbe (periodo de gracia inicial) ──▶ liveness/readiness no se evalúan
                                              todavía mientras arranca
```

### Tema 5: RBAC en Kubernetes

**Conceptos clave:** Role, ClusterRole, RoleBinding, cuenta de servicio (ServiceAccount), mínimo privilegio aplicado a Kubernetes.

RBAC (control de acceso basado en roles) en Kubernetes aplica el mismo principio de mínimo privilegio que ya estudiaste en profundidad con IAM en el track Cloud, pero a nivel del propio clúster de Kubernetes: define exactamente qué acciones (verbos como `get`, `list`, `create`, `delete`) puede realizar una identidad sobre qué recursos (Pods, Services, Secrets) y en qué alcance (un namespace específico, o el clúster completo).

Un Role define un conjunto de permisos limitado a un namespace específico (por ejemplo, "puede leer Pods y Services, pero no puede eliminarlos, dentro del namespace `desarrollo`"), mientras que un ClusterRole define permisos que aplican a nivel de clúster completo, sin restricción a un namespace específico (necesario, por ejemplo, para permisos sobre recursos que no son específicos de ningún namespace en particular, como los propios Nodes del clúster). Un RoleBinding conecta un Role con una identidad específica (un usuario, un grupo, o una cuenta de servicio), otorgándole efectivamente esos permisos; sin un binding explícito, definir un Role por sí solo no concede ningún acceso a nadie, exactamente igual que una política IAM sin adjuntar a ningún usuario o rol no tiene ningún efecto práctico.

Una cuenta de servicio (ServiceAccount) es la identidad que usan los propios Pods (no personas humanas) para autenticarse contra la API de Kubernetes cuando necesitan realizar acciones dentro del clúster (por ejemplo, un Pod que necesita consultar el estado de otros Pods, o crear nuevos recursos dinámicamente). Por defecto, cada Pod usa una cuenta de servicio implícita con permisos muy limitados; para operaciones más específicas, se crea una ServiceAccount dedicada, se le asigna un Role con exactamente los permisos que esa carga de trabajo específica necesita mediante un RoleBinding, y se asigna esa ServiceAccount al Pod correspondiente, en vez de otorgar permisos amplios innecesarios por comodidad.

Este mismo patrón conceptual de mínimo privilegio aplicado a cargas de trabajo, y no solo a personas —definir permisos específicos por función y adjuntarlos explícitamente a la identidad que realmente los necesita, sin conceder acceso amplio "por si acaso"— es exactamente el mismo principio que aplicaste al diseñar roles IAM específicos por función Lambda en el proyecto final del track Cloud, ahora trasladado al contexto de las cargas de trabajo dentro de un clúster de Kubernetes.

**Analogía:** un Role es como una descripción de puesto de trabajo que especifica exactamente qué tareas puede realizar alguien en ese puesto ("puede consultar el inventario, pero no puede modificar precios"), limitada a un departamento específico de la empresa. Un ClusterRole es esa misma descripción pero aplicable a través de toda la empresa, no limitada a un departamento. Un RoleBinding es la carta de asignación formal que efectivamente pone a una persona específica (o a un sistema automatizado específico, en el caso de una ServiceAccount) en ese puesto de trabajo con esos permisos exactos, sin la cual la descripción del puesto por sí sola no habilita a nadie a hacer nada.

**¿Por qué es importante?** Sin RBAC configurado deliberadamente, es común que las cargas de trabajo dentro de un clúster terminen con permisos mucho más amplios de los que realmente necesitan (por usar cuentas de servicio con permisos por defecto demasiado generosos, o por pereza de definir Roles específicos), replicando exactamente el mismo riesgo de seguridad que ya estudiaste con políticas IAM demasiado permisivas en el track Cloud, ahora a nivel del propio clúster de Kubernetes.

**Diagrama:**

```
Role "lector-pods" (namespace: desarrollo)
   permisos: get, list sobre Pods           ← solo lectura, sin eliminar ni crear
        │
        │  RoleBinding conecta el Role con...
        ▼
ServiceAccount "mi-app-sa"  ──▶  Pod que usa esta cuenta de servicio
   (hereda exactamente esos permisos limitados, ni más ni menos)
```

### Tema 6: Service Mesh — Istio, Linkerd, Envoy y mTLS

**Conceptos clave:** service mesh, sidecar proxy, mTLS, observabilidad de tráfico entre servicios.

Un service mesh es una capa de infraestructura dedicada a gestionar la comunicación entre servicios dentro de un clúster, típicamente implementada inyectando un proxy sidecar (comúnmente Envoy, un proxy de alto rendimiento de propósito general) junto a cada Pod, de forma que todo el tráfico de red entrante y saliente de ese Pod pasa a través de su proxy sidecar antes de llegar (o después de salir) del contenedor de la aplicación en sí. Istio y Linkerd son las dos implementaciones de service mesh más adoptadas, cada una gestionando esta red de proxies sidecar de forma centralizada con un plano de control.

Esta arquitectura permite implementar preocupaciones transversales de comunicación entre servicios —cifrado de tráfico, reintentos automáticos, disyuntores de circuito (circuit breakers), enrutamiento avanzado por porcentaje (habilitando patrones de canary release, del Módulo 5 de este track, pero implementados a nivel de comunicación entre microservicios internos, no solo entre versiones de un mismo servicio expuesto externamente), y observabilidad detallada de cada llamada entre servicios— sin necesidad de implementar cada una de esas capacidades individualmente dentro del código de cada aplicación, centralizándolas en su lugar en la infraestructura del proxy sidecar compartido por todos los servicios del mesh.

mTLS (mutual TLS, o TLS mutuo) es una de las capacidades más valiosas que un service mesh habilita de forma centralizada: en TLS tradicional (el que protege, por ejemplo, las conexiones HTTPS normales), solo el servidor demuestra su identidad al cliente mediante un certificado; en mTLS, ambas partes de la comunicación —tanto el llamador como el receptor— presentan y verifican certificados mutuamente, garantizando que ambos extremos de cada comunicación interna dentro del clúster son quienes dicen ser, y cifrando el tráfico entre ellos automáticamente. Sin un service mesh, implementar mTLS entre todos los pares de servicios de una arquitectura de microservicios requeriría gestionar certificados y lógica de verificación dentro del código de cada aplicación individual; con un service mesh, esto se habilita de forma transparente y centralizada para todo el tráfico interno del clúster, sin que el código de la aplicación necesite saber nada al respecto.

Adoptar un service mesh introduce complejidad operativa adicional real (un componente más que entender, operar y depurar), por lo que su adopción suele justificarse en arquitecturas con un número considerable de microservicios que se comunican intensamente entre sí, donde el beneficio de centralizar estas preocupaciones transversales supera claramente el coste operativo adicional; para arquitecturas más simples, con pocos servicios o comunicación interna limitada, esa complejidad adicional puede no estar justificada todavía.

**Analogía:** un service mesh es como instalar un sistema de seguridad y comunicación estandarizado en cada oficina de un complejo empresarial de múltiples edificios: en vez de que cada oficina individual implemente su propio sistema de verificación de identidad de visitantes y su propio registro de comunicaciones, un sistema centralizado y transparente gestiona automáticamente la verificación de identidad mutua (mTLS) y el registro de todas las comunicaciones entre oficinas, sin que cada oficina individual tenga que preocuparse por implementar eso por su cuenta.

**¿Por qué es importante?** A medida que una arquitectura crece en número de microservicios que se comunican entre sí, gestionar la seguridad, resiliencia y observabilidad de esa comunicación interna se vuelve progresivamente más complejo de mantener dentro del código de cada aplicación individual; un service mesh centraliza esas preocupaciones de forma consistente en toda la arquitectura, a costa de la complejidad operativa adicional de gestionar el propio mesh.

**Diagrama:**

```
Pod A                              Pod B
┌──────────────┐                ┌──────────────┐
│ Contenedor app A  │              │ Contenedor app B  │
│      │              │              │      │              │
│ Proxy sidecar    │◀── mTLS ───▶│ Proxy sidecar    │
│ (Envoy)            │  cifrado    │ (Envoy)            │
└──────────────┘                └──────────────┘
   (la app en sí no gestiona directamente el cifrado
    ni la verificación de identidad; el sidecar lo hace)
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

**Objetivo del laboratorio:** convertir los manifiestos del Módulo 6 en un Helm chart parametrizable, instalar un Ingress Controller y exponer la aplicación por dominio, configurar autoscaling, y añadir probes de liveness y readiness.

**Requisitos previos:** el clúster local y la aplicación desplegada del Módulo 6 de este track, Helm instalado.

| Paso | Acción | Comando/Configuración | Explicación | Resultado esperado |
|---|---|---|---|---|
| 1 | Crear la estructura de un Helm chart | `helm create mi-chart` | Genera una estructura base de chart con plantillas de ejemplo | Se crea la carpeta `mi-chart/` con `Chart.yaml`, `values.yaml` y `templates/` |
| 2 | Adaptar las plantillas a tu Deployment y Service | Reemplaza el contenido de `templates/deployment.yaml` y `templates/service.yaml` con la configuración de tu aplicación del Módulo 6, usando `{{ .Values.* }}` para los valores parametrizables (réplicas, imagen, tag) | Convierte los manifiestos estáticos en plantillas reutilizables | Los archivos usan correctamente la sintaxis de Go template |
| 3 | Definir valores por defecto | Edita `values.yaml` con `replicaCount: 3` y los valores de imagen correspondientes | Establece la configuración por defecto del chart | El archivo se guarda correctamente |
| 4 | Instalar el chart | `helm install mi-api ./mi-chart` | Despliega la aplicación usando el chart parametrizado | `kubectl get pods` muestra los Pods desplegados vía Helm |
| 5 | Instalar un Ingress Controller | Instala NGINX Ingress Controller siguiendo su documentación oficial para tu tipo de clúster local | Habilita el enrutamiento HTTP hacia Services internos | El Ingress Controller aparece corriendo con `kubectl get pods -n <su-namespace>` |
| 6 | Crear una regla de Ingress | Define un objeto Ingress con `host: mi-api.local` enrutando hacia tu Service, y aplícalo | Expone la aplicación por nombre de dominio a través del Ingress Controller | El objeto Ingress se crea correctamente (`kubectl get ingress`) |
| 7 | Configurar el HorizontalPodAutoscaler | `kubectl autoscale deployment mi-api --cpu-percent=70 --min=2 --max=10` | Habilita escalado automático según uso de CPU | `kubectl get hpa` muestra el autoscaler configurado |
| 8 | Añadir probes de liveness y readiness | Añade `livenessProbe` y `readinessProbe` a la plantilla del Deployment, apuntando a rutas de verificación de tu aplicación (por ejemplo, `/health` y `/ready`), y actualiza el release con `helm upgrade mi-api ./mi-chart` | Aplica robustez de arranque y disponibilidad al Deployment | `kubectl describe pod` muestra ambas probes configuradas y pasando exitosamente |

**Verificación:** el laboratorio se considera exitoso si `helm upgrade` con un cambio de valores (por ejemplo, cambiar `replicaCount` en `values.yaml` y volver a ejecutar `helm upgrade`) refleja correctamente el nuevo número de réplicas sin necesidad de editar manifiestos YAML directamente, y si el HPA y las probes aparecen correctamente configurados y en estado saludable.

**Errores comunes y soluciones**

- **`helm install` falla con un error de sintaxis en las plantillas.** Usa `helm template ./mi-chart` para renderizar las plantillas localmente sin instalarlas, revisando el YAML resultante antes de intentar aplicarlo al clúster; esto ayuda a aislar si el problema está en la sintaxis de la plantilla o en el manifiesto resultante en sí.
- **El Ingress no enruta tráfico, aunque el Ingress Controller está corriendo.** Verifica que el `host` configurado en el objeto Ingress se resuelve correctamente hacia la IP del Ingress Controller (en un clúster local, esto normalmente requiere una entrada manual en tu archivo `hosts` local apuntando ese dominio a `127.0.0.1` o a la IP correspondiente del clúster local).
- **El HPA muestra `<unknown>` en la columna de métricas actuales.** Esto casi siempre indica que el clúster no tiene `metrics-server` instalado o funcionando correctamente; instálalo explícitamente si tu distribución de Kubernetes local no lo incluye por defecto.
- **El Pod nunca llega a estado `Ready` tras añadir las probes.** Revisa que las rutas configuradas en las probes (`/health`, `/ready`) realmente existen y responden correctamente en tu aplicación; una probe apuntando a una ruta inexistente falla indefinidamente, impidiendo que el Pod se considere listo.

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

- Helm empaqueta manifiestos de Kubernetes como charts parametrizables, evitando la duplicación de YAML entre entornos y facilitando actualizaciones y rollback coordinados.
- Un Ingress define reglas de enrutamiento HTTP, pero requiere un Ingress Controller corriendo en el clúster para tener efecto real.
- Un HorizontalPodAutoscaler ajusta automáticamente el número de réplicas según una métrica observada, dentro de límites mínimo y máximo configurados.
- Las liveness probes disparan reinicios ante fallos internos irrecuperables; las readiness probes solo excluyen temporalmente al Pod de recibir tráfico, sin reiniciarlo; `startupProbe` da un periodo de gracia para arranques lentos.
- RBAC aplica mínimo privilegio a nivel de clúster mediante Roles, ClusterRoles, RoleBindings y ServiceAccounts, el mismo principio que IAM aplica en la nube.
- Un service mesh centraliza preocupaciones transversales de comunicación entre servicios (mTLS, reintentos, observabilidad) mediante proxies sidecar, a costa de complejidad operativa adicional.

**Conceptos aprendidos**

- Helm charts, `values.yaml`, y el flujo `install`/`upgrade`/`rollback`.
- Ingress e Ingress Controllers, y enrutamiento por host o por ruta.
- HorizontalPodAutoscaler y su dependencia de un servidor de métricas.
- Liveness, readiness y startup probes, y sus efectos respectivos distintos.
- RBAC: Role, ClusterRole, RoleBinding y ServiceAccount.
- Service mesh, proxies sidecar, y mTLS.

**Próximos pasos**

En el Módulo 8 vas a describir infraestructura completa como código con Terraform, gestionando estado remoto, módulos reutilizables, y complementando con Ansible y Pulumi como alternativas relacionadas.

**Recursos adicionales**

- Documentación oficial de Helm: estructura de charts, plantillas y el ciclo `install`/`upgrade`/`rollback`.
- Documentación oficial de Kubernetes sobre Ingress, HorizontalPodAutoscaler, probes y RBAC.
- Documentación oficial de Istio y Linkerd como referencias de implementaciones de service mesh.
