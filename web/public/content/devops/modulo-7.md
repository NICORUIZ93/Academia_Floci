# Módulo 7: Kubernetes avanzado — Helm e Ingress


## Aprende construyendo

### Tema 1: Helm charts y values

#### Paso 1 · Objetivo y preparación

Al finalizar podrás empaquetar manifiestos de Kubernetes como un Helm chart parametrizable, desplegando el mismo chart en distintos entornos con valores distintos.

**Conocimiento previo:** Módulo 6 completo de este track (Deployment, Service); Helm instalado.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Este es un caso real de crecimiento de complejidad: a medida que una aplicación acumula múltiples Deployments, Services, ConfigMaps e Ingress relacionados, gestionarlos como archivos YAML sueltos entre múltiples entornos se vuelve rápidamente inmanejable.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** chart, `values.yaml`, plantillas con sintaxis Go template, `helm install`/`upgrade`.

Un Helm chart empaqueta un conjunto completo de manifiestos como unidad reutilizable, con plantillas Go template (`{{ .Values.replicaCount }}`) rellenadas dinámicamente desde `values.yaml`. El mismo chart se despliega en desarrollo con `replicaCount: 1` y en producción con `replicaCount: 5` sin duplicar manifiestos. `helm install` crea un "release"; `helm upgrade` lo actualiza manteniendo historial, permitiendo `helm rollback`.

**Analogía:** manifiestos YAML sueltos son como escribir una carta nueva completa cada vez. Un Helm chart es una plantilla de carta con campos marcados (`[NOMBRE]`, `[FECHA]`) que rellenas por destinatario, mientras la estructura permanece consistente.

**Diagrama:**

```
┌── mi-chart/ ──────────────────────────┐
│ Chart.yaml            (metadatos)                   │
│ values.yaml            (replicaCount: 3, image.tag: "1.0") │
│ templates/deployment.yaml  (usa {{ .Values.replicaCount }})  │
└─────────────────────────────────────┘
helm install mi-api ./mi-chart --set replicaCount=5
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea un chart mínimo en `academia-devops/src/modulo7/helm-chart`:

```bash
mkdir -p academia-devops/src/modulo7/helm-chart/templates
cd academia-devops/src/modulo7/helm-chart
cat > Chart.yaml <<'EOF'
apiVersion: v2
name: mi-api
version: 0.1.0
EOF
cat > values.yaml <<'EOF'
replicaCount: 1
image: node:22-alpine
EOF
cat > templates/deployment.yaml <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mi-api
spec:
  replicas: {{ .Values.replicaCount }}
  selector: { matchLabels: { app: mi-api } }
  template:
    metadata: { labels: { app: mi-api } }
    spec:
      containers:
        - name: mi-api
          image: {{ .Values.image }}
          command: ["node", "-e", "require('http').createServer((q,r)=>r.end('ok')).listen(3000)"]
EOF
helm template mi-api . | grep -A1 "kind: Deployment"
```

**Explicación línea por línea:** `{{ .Values.replicaCount }}` y `{{ .Values.image }}` se rellenan con los valores de `values.yaml`; `helm template` renderiza el YAML final localmente sin instalarlo, útil para verificar antes de aplicar al clúster.

Instala el chart con un valor sobrescrito en la línea de comandos, y confirma el número real de réplicas:

```bash
kind create cluster --name helm-demo 2>/dev/null || true
helm install mi-api . --set replicaCount=3
kubectl get deployment mi-api -o jsonpath='{.spec.replicas}'
echo
helm upgrade mi-api . --set replicaCount=5
kubectl get deployment mi-api -o jsonpath='{.spec.replicas}'
```

**Resultado esperado:** tras `helm install --set replicaCount=3`, el Deployment reporta `3`; tras `helm upgrade --set replicaCount=5`, reporta `5`, demostrando que el mismo chart parametriza el número de réplicas sin editar manifiestos directamente.

**Fallo deliberado:** rompe la sintaxis de la plantilla (cambia `{{ .Values.replicaCount }}` por `{{ .Values.replicaCont }}`, con una errata) y ejecuta `helm template mi-api .`. El resultado renderiza `replicas:` vacío o con `<no value>` en vez de un número — diagnostica que Helm no valida que la clave referenciada exista en `values.yaml`, solo sustituye lo que encuentra.

#### Construcción RutaFlow: un chart por servicio del proyecto

`mi-chart` es la base del chart real que empaquetará cada servicio de RutaFlow; cada entorno (desarrollo, staging) tendrá su propio archivo `values-<entorno>.yaml` aplicado con `helm upgrade -f values-staging.yaml`.

#### Paso 5 · Práctica guiada

Crea un segundo archivo `values-produccion.yaml` con `replicaCount: 10`, e instala usando `helm upgrade mi-api . -f values-produccion.yaml` en vez de `--set`. **Pista:** `-f` acepta un archivo completo de valores, útil cuando son muchos parámetros distintos por entorno.

#### Paso 6 · Práctica independiente

Ejecuta `helm history mi-api` para ver el historial de revisiones generado por los `install`/`upgrade` anteriores, y usa `helm rollback mi-api 1` para volver a la primera revisión; confirma con `kubectl get deployment` que las réplicas volvieron al valor original.

#### Paso 7 · Cierre y evidencia

Ya parametrizas el mismo conjunto de manifiestos para múltiples entornos sin duplicarlos. El siguiente tema expone múltiples servicios detrás de un único punto de entrada HTTP. **Evidencia:** entrega los valores de réplicas antes y después del `upgrade`, y explica el resultado de la plantilla con la clave mal escrita. Fuente oficial: [Helm — Charts](https://helm.sh/docs/topics/charts/).

**Errores comunes:** referenciar una clave de `values.yaml` con un nombre distinto al real, fallando silenciosamente en vez de con un error explícito; instalar directamente sin `helm template` primero, perdiendo la oportunidad de revisar el YAML renderizado antes de aplicarlo.

**Cuándo no usarlo:** para un único manifiesto simple sin variación real entre entornos, empaquetarlo como chart añade complejidad de plantillas sin beneficio; el límite es cuando de verdad necesitas parametrización reutilizable entre múltiples despliegues.

### Tema 2: Ingress Controllers y reglas de enrutamiento

#### Paso 1 · Objetivo y preparación

Al finalizar podrás exponer múltiples Services por dominio o ruta detrás de un único Ingress Controller, sin necesitar un LoadBalancer separado por servicio.

**Conocimiento previo:** Tema 1 de este módulo; Módulo 6 (Service, LoadBalancer).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Este es un caso real de eficiencia de costos: el Ingress permite exponer múltiples servicios HTTP compartiendo un único punto de entrada externo, en vez de aprovisionar un balanceador de carga independiente y costoso para cada servicio.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** Ingress (regla de enrutamiento), Ingress Controller (implementación), host-based routing, path-based routing.

Un objeto Ingress define reglas de enrutamiento HTTP/HTTPS según dominio y/o ruta. Por sí solo es solo una declaración: necesita un Ingress Controller corriendo (NGINX Ingress Controller, Traefik) que efectivamente lea esas reglas y enrute el tráfico. Centralizar el enrutamiento facilita TLS, redirecciones y rate limiting en un solo lugar.

**Analogía:** un Ingress es el directorio de un edificio que dice "la empresa A está en el piso 3". El Ingress Controller es el guardia de seguridad que efectivamente lee ese directorio y dirige a cada visitante al piso correcto.

**Diagrama:**

```
Internet
   ▼
┌── Ingress Controller (único punto de entrada externo) ──┐
│ host: api.miapp.com    ──▶ Service "mi-api"                  │
│ host: admin.miapp.com  ──▶ Service "mi-admin"                  │
│ path: /docs             ──▶ Service "documentacion"              │
└─────────────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `academia-devops/src/modulo7/ingress` con dos servicios enrutados por dominio distinto:

```bash
mkdir -p academia-devops/src/modulo7/ingress && cd academia-devops/src/modulo7/ingress
kubectl create deployment api --image=node:22-alpine -- node -e "require('http').createServer((q,r)=>r.end('soy la API')).listen(3000)"
kubectl expose deployment api --port=80 --target-port=3000
kubectl create deployment admin --image=node:22-alpine -- node -e "require('http').createServer((q,r)=>r.end('soy ADMIN')).listen(3000)"
kubectl expose deployment admin --port=80 --target-port=3000
cat > ingress.yaml <<'EOF'
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mi-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
    - host: api.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend: { service: { name: api, port: { number: 80 } } }
    - host: admin.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend: { service: { name: admin, port: { number: 80 } } }
EOF
kubectl apply -f ingress.yaml
kubectl get ingress mi-ingress
```

**Explicación línea por línea:** cada entrada bajo `rules` asocia un `host` distinto (`api.local`, `admin.local`) con un Service interno distinto; sin un Ingress Controller instalado y corriendo, este objeto queda definido pero no enruta ningún tráfico real todavía.

Verifica las reglas definidas y qué Service resolvería cada dominio:

```bash
kubectl describe ingress mi-ingress | grep -A6 Rules
```

**Resultado esperado:** la sección `Rules` muestra `api.local` asociado al backend `api:80` y `admin.local` asociado a `admin:80`, confirmando que las reglas de enrutamiento están correctamente definidas según el host.

**Fallo deliberado:** define una tercera regla con `host: api.local` (duplicado) apuntando a un backend distinto, y aplica de nuevo. El comportamiento resultante depende del Ingress Controller específico, pero típicamente solo una de las dos reglas para el mismo host toma efecto — diagnostica revisando `kubectl describe ingress` para confirmar cuál regla quedó activa y por qué duplicar un host sin distinguir por `path` genera ambigüedad.

#### Construcción RutaFlow: un solo punto de entrada para todos los servicios

`mi-ingress` es el patrón que RutaFlow usará para exponer su API y su panel de administración bajo dominios distintos compartiendo la misma IP externa del clúster, en vez de un `LoadBalancer` independiente por servicio.

#### Paso 5 · Práctica guiada

Agrega una tercera regla con `path: /docs` bajo el mismo host `api.local`, enrutando hacia un tercer Service `documentacion`. **Pista:** puedes combinar host-based y path-based routing en las mismas reglas de un único objeto Ingress.

#### Paso 6 · Práctica independiente

Investiga (documentando sin necesariamente configurarlo) qué anotación de tu Ingress Controller específico habilitarías para terminar TLS automáticamente con un certificado, y qué recurso adicional (como un `Secret` de tipo `kubernetes.io/tls`) necesitarías referenciar.

#### Paso 7 · Cierre y evidencia

Ya enrutas múltiples servicios HTTP compartiendo un único punto de entrada externo. El siguiente tema escala automáticamente las réplicas detrás de estos Services según demanda real. **Evidencia:** entrega la salida de `kubectl describe ingress` mostrando ambas reglas correctamente asociadas, y explica el resultado de la ambigüedad con el host duplicado. Fuente oficial: [Kubernetes — Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/).

**Errores comunes:** crear un objeto Ingress sin tener un Ingress Controller instalado, esperando que enrute tráfico igualmente; duplicar un host sin distinguir por path, generando reglas ambiguas.

**Cuándo no usarlo:** para un único servicio sin necesidad de compartir punto de entrada con otros, un `LoadBalancer` directo (Módulo 6) puede ser más simple que introducir un Ingress Controller completo; el beneficio del Ingress aparece con múltiples servicios HTTP.

### Tema 3: HorizontalPodAutoscaler

#### Paso 1 · Objetivo y preparación

Al finalizar podrás configurar un HorizontalPodAutoscaler que ajusta automáticamente el número de réplicas según el uso real de CPU, con límites mínimo y máximo explícitos.

**Conocimiento previo:** Temas 1 y 2 de este módulo; Módulo 6 (Deployment).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Este es un caso real de tráfico variable: el HPA permite que un servicio responda automáticamente a fluctuaciones de demanda sin intervención manual constante, un requisito prácticamente indispensable para tráfico impredecible.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** HorizontalPodAutoscaler (HPA), métrica objetivo, escalado automático de réplicas, mínimo y máximo.

Un HPA ajusta el número de réplicas de un Deployment según una métrica observada, típicamente CPU. `kubectl autoscale deployment mi-api --cpu-percent=70 --min=2 --max=10` mantiene el uso promedio alrededor del 70%, incrementando réplicas si se supera (hasta 10) y reduciendo si cae por debajo (hasta un mínimo de 2). Depende de `metrics-server` instalado en el clúster; sin él, el HPA no tiene datos para decidir.

**Analogía:** un HPA es como un sistema automático de contratación temporal para un restaurante: si el número de comensales supera cierto umbral, contrata más meseros hasta un máximo razonable; si se vacía, reduce personal hasta un mínimo que garantiza atención básica.

**Diagrama:**

```
┌── HorizontalPodAutoscaler (objetivo: 70% CPU, min:2, max:10) ──┐
│ observa uso real de CPU de las réplicas actuales                   │
│ ¿uso > 70%? Sí ──▶ incrementa réplicas (hasta 10)                    │
│             No, uso bajo ──▶ reduce réplicas (hasta el mínimo de 2)   │
└─────────────────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `academia-devops/src/modulo7/hpa` con un Deployment que consume CPU deliberadamente bajo carga:

```bash
mkdir -p academia-devops/src/modulo7/hpa && cd academia-devops/src/modulo7/hpa
kubectl create deployment carga-cpu --image=vish/stress -- -cpus 1
kubectl set resources deployment carga-cpu --requests=cpu=100m --limits=cpu=200m
kubectl autoscale deployment carga-cpu --cpu-percent=50 --min=1 --max=4
kubectl get hpa carga-cpu
```

**Explicación línea por línea:** `--requests=cpu=100m` es imprescindible: el HPA calcula el porcentaje de uso relativo a lo solicitado, y sin una solicitud de CPU definida no tiene una base contra la cual medir el porcentaje.

Observa el escalado en respuesta a la carga simulada durante unos minutos:

```bash
kubectl get hpa carga-cpu --watch &
sleep 60
kill %1
kubectl get hpa carga-cpu
```

**Resultado esperado:** la columna `TARGETS` de `kubectl get hpa` muestra un porcentaje de uso creciente por encima del 50% configurado, y la columna `REPLICAS` aumenta gradualmente desde 1 hacia el máximo de 4 a medida que el HPA reacciona a la carga sostenida.

**Fallo deliberado:** elimina el `metrics-server` del clúster (o simula su ausencia consultando `kubectl top pods` en un clúster sin él instalado). `kubectl get hpa` muestra `<unknown>` en la columna de métricas actuales — diagnostica que sin un servidor de métricas funcionando, el HPA no tiene datos sobre los cuales basar ninguna decisión de escalado, independientemente de su configuración.

#### Construcción RutaFlow: escalado automático del backend bajo demanda

Documenta en `academia-devops/README.md` los límites `min`/`max` que usará el HPA real de RutaFlow, justificando el máximo según el presupuesto de infraestructura aceptable ante un pico de tráfico inesperado.

#### Paso 5 · Práctica guiada

Detén la carga de CPU (`kubectl scale deployment carga-cpu --replicas=0` y vuelve a `1` sin el proceso de estrés) y observa cómo el HPA reduce gradualmente las réplicas de vuelta hacia el mínimo configurado. **Pista:** la reducción suele ser más lenta que el incremento, por diseño, para evitar oscilaciones bruscas.

#### Paso 6 · Práctica independiente

Cambia `--max=4` a `--max=2` mientras el HPA ya había escalado a 4 réplicas, y confirma que Kubernetes reduce automáticamente hasta respetar el nuevo máximo, incluso si la métrica de CPU seguiría justificando más réplicas.

#### Paso 7 · Cierre y evidencia

Ya escalas automáticamente según demanda real, con límites explícitos que evitan tanto capacidad insuficiente como coste descontrolado. El siguiente tema verifica que cada réplica esté realmente sana antes de recibir tráfico o de considerarse viva. **Evidencia:** entrega la progresión de réplicas observada en `kubectl get hpa --watch` y el resultado de `<unknown>` sin metrics-server. Fuente oficial: [Kubernetes — HorizontalPodAutoscaler](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/).

**Errores comunes:** configurar un HPA sin definir `requests.cpu` en el Deployment, dejando sin base de cálculo el porcentaje objetivo; establecer un máximo sin considerar el coste de infraestructura ante un consumo anómalo sostenido (por ejemplo, un bug, no tráfico legítimo).

**Cuándo no usarlo:** para una carga de trabajo con estado que no puede simplemente añadir réplicas intercambiables (una base de datos con un único líder de escritura), un HPA horizontal no aplica de la misma forma; ahí el escalado requiere una estrategia específica del propio sistema con estado.

### Tema 4: Probes de liveness y readiness

#### Paso 1 · Objetivo y preparación

Al finalizar podrás configurar liveness y readiness probes distintas para el mismo contenedor, entendiendo que una dispara un reinicio y la otra solo excluye tráfico temporalmente.

**Conocimiento previo:** Temas 1 a 3 de este módulo; Módulo 3 (healthchecks de Docker Compose).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Este es un caso real muy común: usar una liveness probe demasiado agresiva para verificar una dependencia externa temporalmente caída provoca reinicios innecesarios de un contenedor que en realidad está perfectamente sano internamente.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** liveness probe, readiness probe, `startupProbe`, reinicio vs exclusión de tráfico.

Una liveness probe verifica si el contenedor sigue funcionando; si falla repetidamente, Kubernetes lo reinicia. Una readiness probe determina si está listo para recibir tráfico; si falla, Kubernetes deja de enrutarle tráfico sin reiniciarlo, el mismo concepto que `condition: service_healthy` de Docker Compose (Módulo 3) pero continuo durante toda la vida del Pod. `startupProbe` da un periodo de gracia inicial antes de evaluar las otras dos, evitando reinicios prematuros durante un arranque lento.

**Analogía:** una liveness probe es comprobar si el corazón de un paciente late: si se detiene, requiere reanimación (reinicio). Una readiness probe es comprobar si puede recibir visitas ahora mismo: puede estar vivo pero temporalmente no disponible, sin necesitar ninguna intervención de emergencia.

**Diagrama:**

```
livenessProbe falla repetidamente  ──▶  Kubernetes REINICIA el contenedor
readinessProbe falla                ──▶  Kubernetes deja de enrutar tráfico (NO reinicia)
startupProbe (gracia inicial)       ──▶  liveness/readiness no se evalúan aún
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `academia-devops/src/modulo7/probes` con un backend que expone rutas de salud distintas para cada probe:

```bash
mkdir -p academia-devops/src/modulo7/probes && cd academia-devops/src/modulo7/probes
cat > app.js <<'EOF'
const http = require('node:http');
let listo = false;
setTimeout(() => { listo = true; }, 5000);
http.createServer((req, res) => {
  if (req.url === '/live') { res.end('vivo'); return; }
  if (req.url === '/ready') {
    if (listo) { res.end('listo'); } else { res.writeHead(503).end('todavia no'); }
    return;
  }
  res.end('app');
}).listen(3000);
EOF
kubectl create configmap app-probes-src --from-file=app.js
cat > pod.yaml <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: con-probes
spec:
  containers:
    - name: app
      image: node:22-alpine
      command: ["node", "/app/app.js"]
      volumeMounts: [{ name: src, mountPath: /app }]
      livenessProbe:
        httpGet: { path: /live, port: 3000 }
        initialDelaySeconds: 2
        periodSeconds: 5
      readinessProbe:
        httpGet: { path: /ready, port: 3000 }
        periodSeconds: 2
  volumes:
    - name: src
      configMap: { name: app-probes-src }
EOF
kubectl apply -f pod.yaml
```

**Explicación línea por línea:** `/live` siempre responde `200` (el proceso está vivo); `/ready` responde `503` durante los primeros 5 segundos, simulando una inicialización lenta, y solo después reporta listo — exactamente el escenario donde `readinessProbe` debe excluir tráfico sin que `livenessProbe` reinicie nada.

Observa la transición de no-listo a listo sin ningún reinicio:

```bash
sleep 1 && kubectl get pod con-probes -o jsonpath='{.status.containerStatuses[0].ready}'
echo
sleep 8 && kubectl get pod con-probes -o jsonpath='{.status.containerStatuses[0].ready}'
echo
kubectl get pod con-probes -o jsonpath='{.status.containerStatuses[0].restartCount}'
```

**Resultado esperado:** el primer chequeo (a 1 segundo) reporta `false` (no listo todavía); el segundo (a 9 segundos) reporta `true`; el conteo de reinicios (`restartCount`) permanece en `0` durante toda la transición, confirmando que la readiness probe excluyó tráfico sin disparar ningún reinicio.

**Fallo deliberado:** cambia `livenessProbe` para que apunte también a `/ready` en vez de `/live` (una configuración incorrecta común). Durante los primeros 5 segundos, la liveness probe también falla, y tras varios reintentos Kubernetes reinicia el contenedor innecesariamente — diagnostica con `kubectl describe pod con-probes` revisando el evento de reinicio, y confirma que el problema es haber usado la ruta equivocada para la probe equivocada.

#### Construcción RutaFlow: arranque robusto sin reinicios innecesarios

Documenta en `academia-devops/README.md` que cada servicio de RutaFlow expone rutas `/live` y `/ready` diferenciadas, precisamente para evitar el error de configuración demostrado en el fallo deliberado de este tema.

#### Paso 5 · Práctica guiada

Agrega un `startupProbe` con `failureThreshold: 30` y `periodSeconds: 1` apuntando también a `/live`, dando hasta 30 segundos de gracia antes de que la liveness probe normal empiece a evaluarse. **Pista:** mientras el `startupProbe` no reporte éxito, ni liveness ni readiness se evalúan todavía.

#### Paso 6 · Práctica independiente

Modifica `app.js` para que `/live` falle permanentemente después de 20 segundos (simulando un bloqueo real irrecuperable), y confirma que en ese caso sí ocurre un reinicio automático, a diferencia del escenario de solo-no-listo del Paso 4.

#### Paso 7 · Cierre y evidencia

Ya distingues cuándo un problema requiere reiniciar un contenedor y cuándo solo requiere dejar de enrutarle tráfico temporalmente. El siguiente tema aplica mínimo privilegio a las identidades que operan dentro del clúster. **Evidencia:** entrega los valores de `ready` en ambos momentos y el `restartCount` confirmando cero reinicios durante la transición normal, y el resultado del fallo con la probe mal configurada. Fuente oficial: [Kubernetes — Configure Liveness, Readiness Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/).

**Errores comunes:** apuntar la liveness probe a una ruta que verifica dependencias externas fluctuantes; olvidar un `startupProbe` en aplicaciones con arranque lento, causando reinicios prematuros durante la inicialización legítima.

**Cuándo no usarlo:** para un Job que debe terminar (Módulo 6, Tema 6), las probes de liveness/readiness no aplican de la misma forma, ya que el contenedor no está pensado para vivir indefinidamente esperando tráfico.

### Tema 5: RBAC en Kubernetes

#### Paso 1 · Objetivo y preparación

Al finalizar podrás crear un Role limitado a un namespace, vincularlo a una ServiceAccount con un RoleBinding, y confirmar que un Pod con esa identidad solo puede hacer exactamente lo permitido.

**Conocimiento previo:** Temas 1 a 4 de este módulo; IAM del track Cloud (principio de mínimo privilegio).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Este es un caso real de seguridad: sin RBAC configurado deliberadamente, es común que las cargas de trabajo terminen con permisos mucho más amplios de los que realmente necesitan, replicando el mismo riesgo que las políticas IAM demasiado permisivas.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** Role, ClusterRole, RoleBinding, cuenta de servicio (ServiceAccount), mínimo privilegio aplicado a Kubernetes.

Un Role define permisos limitados a un namespace específico; un ClusterRole aplica a nivel de clúster completo. Un RoleBinding conecta un Role con una identidad (usuario, grupo o ServiceAccount); sin binding explícito, un Role no concede nada. Una ServiceAccount es la identidad que usan los Pods (no personas) para autenticarse contra la API de Kubernetes.

**Analogía:** un Role es una descripción de puesto de trabajo limitada a un departamento. Un ClusterRole es esa misma descripción aplicable a toda la empresa. Un RoleBinding es la carta de asignación formal que pone a alguien (o a un sistema automatizado) en ese puesto con esos permisos exactos.

**Diagrama:**

```
┌── Role "lector-pods" (namespace: desarrollo) ──┐
│ permisos: get, list sobre Pods (solo lectura)      │
└──────────────┬──────────────────┘
               │ RoleBinding conecta el Role con...
               ▼
ServiceAccount "mi-app-sa" ──▶ Pod que usa esta cuenta
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `academia-devops/src/modulo7/rbac` y confirma que una ServiceAccount sin permisos no puede listar Pods:

```bash
mkdir -p academia-devops/src/modulo7/rbac && cd academia-devops/src/modulo7/rbac
kubectl create serviceaccount lector-limitado
kubectl auth can-i list pods --as=system:serviceaccount:default:lector-limitado
```

**Explicación línea por línea:** `kubectl auth can-i ... --as=<cuenta>` simula la pregunta "¿esta identidad puede hacer esto?" sin necesitar realmente ejecutar la acción, ideal para verificar permisos antes de conceder o denegar acceso real.

Otorga permisos explícitos mínimos y confirma que ahora sí puede, pero solo eso:

```bash
cat > rbac.yaml <<'EOF'
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: lector-pods
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: lector-pods-binding
subjects:
  - kind: ServiceAccount
    name: lector-limitado
    namespace: default
roleRef:
  kind: Role
  name: lector-pods
  apiGroup: rbac.authorization.k8s.io
EOF
kubectl apply -f rbac.yaml
kubectl auth can-i list pods --as=system:serviceaccount:default:lector-limitado
kubectl auth can-i delete pods --as=system:serviceaccount:default:lector-limitado
```

**Resultado esperado:** antes del `Role`/`RoleBinding`, `can-i list pods` responde `no`; después, responde `yes`; pero `can-i delete pods` con la misma cuenta sigue respondiendo `no`, confirmando que solo tiene exactamente los verbos (`get`, `list`) que el Role le otorgó explícitamente.

**Fallo deliberado:** cambia `resources: ["pods"]` a `resources: ["secrets"]` en el Role sin cambiar el nombre, y vuelve a aplicar. `can-i list pods` con esa misma cuenta ahora responde `no` de nuevo — diagnostica revisando `kubectl describe role lector-pods` para confirmar que el recurso al que aplica el permiso cambió, no que el binding se rompió.

#### Construcción RutaFlow: permisos mínimos por componente

Documenta en `academia-devops/README.md` que cada componente de RutaFlow que necesita hablar con la API de Kubernetes (por ejemplo, un operador de despliegue propio) recibe su propia ServiceAccount con un Role específico, nunca la cuenta de servicio por defecto con permisos amplios.

#### Paso 5 · Práctica guiada

Crea un segundo Role que permita `create` sobre `pods` (no solo lectura) y un segundo RoleBinding para una nueva ServiceAccount `creador-pods`; confirma con `kubectl auth can-i create pods --as=system:serviceaccount:default:creador-pods` que solo esa cuenta específica tiene ese permiso adicional. **Pista:** cada RoleBinding es independiente; una ServiceAccount solo tiene la unión de los permisos de todos sus bindings.

#### Paso 6 · Práctica independiente

Investiga la diferencia entre un `Role` y un `ClusterRole` ejecutando `kubectl auth can-i list nodes --as=system:serviceaccount:default:lector-limitado` (los Nodes no son específicos de ningún namespace) y explica por qué un `Role` namespaced nunca podría otorgar ese permiso, sin importar cómo se configure.

#### Paso 7 · Cierre y evidencia

Ya aplicas mínimo privilegio real a las identidades que operan dentro del clúster, verificando con `can-i` antes de asumir qué puede hacer cada una. El siguiente tema centraliza seguridad y observabilidad de la comunicación entre servicios. **Evidencia:** entrega las tres respuestas de `can-i` (antes del binding, después con `list` permitido, y `delete` denegado), y explica el resultado del recurso cambiado en el fallo deliberado. Fuente oficial: [Kubernetes — RBAC](https://kubernetes.io/docs/reference/access-control/rbac/).

**Errores comunes:** usar la ServiceAccount por defecto con permisos amplios en vez de crear una específica y mínima por carga de trabajo; olvidar que un Role sin un RoleBinding no concede ningún acceso, exactamente igual que una política IAM sin adjuntar.

**Cuándo no usarlo:** para un permiso que debe aplicar a nivel de clúster completo (no limitado a un namespace), un `Role` no basta; ahí un `ClusterRole` con su correspondiente `ClusterRoleBinding` es el objeto correcto.

### Tema 6: Service Mesh — Istio, Linkerd, Envoy y mTLS

#### Paso 1 · Objetivo y preparación

Al finalizar podrás explicar cómo un proxy sidecar centraliza mTLS, reintentos y observabilidad entre servicios sin que el código de la aplicación las implemente directamente.

**Conocimiento previo:** Temas 1 a 5 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Este es un caso real de arquitecturas con muchos microservicios: gestionar seguridad, resiliencia y observabilidad de la comunicación interna dentro del código de cada aplicación individual se vuelve progresivamente inmanejable a medida que crece el número de servicios.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** service mesh, sidecar proxy, mTLS, observabilidad de tráfico entre servicios.

Un service mesh gestiona la comunicación entre servicios inyectando un proxy sidecar (comúnmente Envoy) junto a cada Pod; todo el tráfico entrante y saliente pasa por ese proxy. Esto centraliza cifrado, reintentos, circuit breakers y observabilidad sin implementarlos en el código de cada aplicación. mTLS hace que ambas partes de una comunicación (no solo el servidor) verifiquen certificados mutuamente, cifrando el tráfico interno de forma transparente.

**Analogía:** un service mesh es como instalar un sistema de seguridad y comunicación estandarizado en cada oficina de un complejo empresarial: en vez de que cada oficina implemente su propio sistema de verificación, uno centralizado gestiona automáticamente la identidad mutua y el registro de comunicaciones entre oficinas.

**Diagrama:**

```
┌── Pod A ──────────┐         ┌── Pod B ──────────┐
│ Contenedor app A       │         │ Contenedor app B       │
│ Proxy sidecar (Envoy)   │◀─ mTLS cifrado ─▶│ Proxy sidecar (Envoy)   │
└──────────────┘         └──────────────┘
   (la app no gestiona directamente el cifrado; el sidecar lo hace)
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `academia-devops/src/modulo7/service-mesh` y simula el patrón de sidecar con dos contenedores dentro del mismo Pod, uno como proxy delante del otro (sin instalar Istio completo, para ilustrar el mecanismo básico):

```bash
mkdir -p academia-devops/src/modulo7/service-mesh/nginx && cd academia-devops/src/modulo7/service-mesh
cat > nginx/sidecar.conf <<'EOF'
server {
    listen 8443 ssl;
    ssl_certificate /etc/ssl/certs/demo.crt;
    ssl_certificate_key /etc/ssl/private/demo.key;
    location / { proxy_pass http://localhost:3000; }
}
EOF
cat > pod-sidecar.yaml <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: con-sidecar
  labels: { app: con-sidecar }
spec:
  containers:
    - name: app
      image: node:22-alpine
      command: ["node", "-e", "require('http').createServer((q,r)=>r.end('app real, solo accesible via sidecar')).listen(3000)"]
    - name: sidecar-proxy
      image: nginx:1.27-alpine
      ports: [{ containerPort: 8443 }]
EOF
kubectl apply -f pod-sidecar.yaml
kubectl get pod con-sidecar -o jsonpath='{.spec.containers[*].name}'
echo
```

**Explicación línea por línea:** el Pod tiene dos contenedores (`app` y `sidecar-proxy`) que comparten red por definición de Pod (Módulo 6, Tema 1); en un service mesh real, este patrón se automatiza inyectando el sidecar en cada Pod del mesh sin que el desarrollador lo defina manualmente cada vez, como sí se hizo aquí de forma explícita para ilustrarlo.

**Resultado esperado:** `kubectl get pod con-sidecar -o jsonpath='{.spec.containers[*].name}'` imprime `app sidecar-proxy`, confirmando que ambos contenedores comparten el mismo Pod y por tanto la misma red interna, la base estructural sobre la que un service mesh real construye mTLS automático.

**Fallo deliberado:** intenta acceder directamente al contenedor `app` en el puerto 3000 desde fuera del Pod (sin pasar por el sidecar), simulando qué pasaría si alguien intentara saltarse el proxy. Sin un Service que exponga específicamente ese puerto, no hay forma externa de alcanzarlo directamente — diagnostica confirmando que el diseño de service mesh depende de que TODO el tráfico entre/salga exclusivamente a través del sidecar, nunca directamente al contenedor de aplicación.

#### Construcción RutaFlow: decisión de adopción de service mesh

Documenta en `academia-devops/README.md` que RutaFlow, con su número limitado de servicios para fines del curso, NO adopta un service mesh completo (Istio/Linkerd) todavía, mientras el beneficio no supere la complejidad operativa adicional real de gestionar uno.

#### Paso 5 · Práctica guiada

Investiga (documentando, sin instalarlo completo en este laboratorio) los pasos de `istioctl install` o `linkerd install` para un clúster `kind`, y qué comando usarías para confirmar que el sidecar se inyectó automáticamente en un namespace etiquetado para el mesh. **Pista:** ambos usan una etiqueta de namespace (`istio-injection=enabled` en Istio) para decidir dónde inyectar el sidecar automáticamente.

#### Paso 6 · Práctica independiente

Compara en un documento propio el coste operativo (un componente más que entender y depurar) contra el beneficio (mTLS automático, observabilidad centralizada) para una arquitectura hipotética de 3 microservicios frente a una de 30 microservicios, concluyendo en qué punto la adopción se justifica.

#### Paso 7 · Cierre y evidencia

Ya entiendes el mecanismo estructural de un service mesh (sidecar compartiendo red con la app) y cuándo su complejidad adicional se justifica. Esto cierra el módulo de Kubernetes avanzado; el siguiente módulo cubre infraestructura como código con Terraform. **Evidencia:** entrega la salida confirmando ambos contenedores en el mismo Pod, y tu conclusión documentada sobre cuándo adoptar un service mesh. Fuente oficial: [Istio — What is Istio](https://istio.io/latest/docs/overview/what-is-istio/).

**Errores comunes:** adoptar un service mesh completo antes de tener suficientes microservicios comunicándose entre sí para justificar su complejidad operativa; asumir que un sidecar se configura solo, sin entender que requiere instalación y configuración explícita del plano de control del mesh.

**Cuándo no usarlo:** para una arquitectura con pocos servicios y comunicación interna limitada, un service mesh completo añade una capa operativa entera sin beneficio proporcional; el límite es cuando el número de servicios y la necesidad de mTLS/observabilidad centralizada realmente lo justifican.

---


## Laboratorio práctico

**Objetivo del laboratorio:** convertir los manifiestos del Módulo 6 en un Helm chart parametrizable, instalar un Ingress Controller y exponer la aplicación por dominio, configurar autoscaling, y añadir probes de liveness y readiness.

**Requisitos previos:** el clúster local y la aplicación desplegada del Módulo 6 de este track, Helm instalado.

| Paso | Acción | Comando/Configuración | Explicación | Resultado esperado |
|---|---|---|---|---|
| 1 | Crear la estructura de un Helm chart | `helm create mi-chart` | Genera estructura base con plantillas de ejemplo | Se crea `mi-chart/` con `Chart.yaml`, `values.yaml`, `templates/` |
| 2 | Adaptar las plantillas | Usa `{{ .Values.* }}` para réplicas, imagen, tag | Convierte manifiestos estáticos en reutilizables | Los archivos usan correctamente Go template |
| 3 | Definir valores por defecto | `replicaCount: 3` en `values.yaml` | Establece configuración por defecto | El archivo se guarda correctamente |
| 4 | Instalar el chart | `helm install mi-api ./mi-chart` | Despliega usando el chart parametrizado | `kubectl get pods` muestra los Pods desplegados |
| 5 | Instalar un Ingress Controller | Sigue la documentación oficial para tu clúster local | Habilita enrutamiento HTTP | El controller corre (`kubectl get pods -n <namespace>`) |
| 6 | Crear una regla de Ingress | `host: mi-api.local` enrutando al Service | Expone la app por dominio | `kubectl get ingress` muestra el objeto |
| 7 | Configurar el HPA | `kubectl autoscale deployment mi-api --cpu-percent=70 --min=2 --max=10` | Habilita escalado automático | `kubectl get hpa` muestra el autoscaler |
| 8 | Añadir probes | `livenessProbe`/`readinessProbe` en la plantilla, `helm upgrade` | Aplica robustez de arranque | `kubectl describe pod` muestra ambas probes pasando |

**Verificación:** el laboratorio se considera exitoso si `helm upgrade` con un cambio de valores refleja el nuevo número de réplicas sin editar YAML directamente, y si HPA y probes aparecen configurados y saludables.

**Errores comunes y soluciones**

- **`helm install` falla con error de sintaxis.** Usa `helm template ./mi-chart` para renderizar localmente antes de instalar.
- **El Ingress no enruta tráfico.** Verifica que el `host` resuelve hacia la IP del Ingress Controller (en local, vía tu archivo `hosts`).
- **El HPA muestra `<unknown>`.** Instala `metrics-server` si no viene por defecto en tu distribución.
- **El Pod nunca llega a `Ready` tras añadir probes.** Verifica que las rutas configuradas realmente existen y responden en tu aplicación.

---
