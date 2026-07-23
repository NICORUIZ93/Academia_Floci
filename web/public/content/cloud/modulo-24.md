# Módulo 24: CI/CD nativo de AWS con CodeBuild y CodeDeploy


## Aprende construyendo

### Tema 1: CodeBuild — compilaciones reales dentro de contenedores Docker

#### Paso 1 · Objetivo y preparación
Al finalizar podrás ejecutar un build reproducible desde cero. Prerrequisitos: Docker y Node.js; verifica `node --version`.
#### Paso 2 · Contexto y caso real
Cada cambio de una API necesita compilarse y producir un artefacto trazable.
#### Paso 3 · Teoría, modelo mental y analogía
El build es una línea de ensamblaje con entradas, fases y salida sellada.
#### Paso 4 · Demostración guiada
Crea `buildspec.yml` desde una carpeta vacía.
```bash
mkdir ejemplo-build
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: rompe una fase para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Genera artefacto y checksum.
#### Paso 7 · Cierre y evidencia
Entrega buildspec, salida, fallo y corrección; explica el resultado. Siguiente paso: artefactos. Errores comunes: dependencias flotantes y builds no reproducibles. Fuente oficial: https://docs.aws.amazon.com/codebuild/latest/userguide/welcome.html.
**Conceptos clave:** `StartBuild`, fases de compilación, Docker-in-Docker, `docker cp`.

Cuando llamas a `StartBuild`, Floci no simula una compilación exitosa: extrae la imagen Docker configurada en el proyecto, inicia un contenedor real, inyecta tus archivos fuente dentro con `docker cp`, y ejecuta las fases de tu `buildspec.yml` —`install`, `pre_build`, `build`, `post_build`— de forma secuencial mediante `docker exec`, transmitiendo la salida en tiempo real a CloudWatch Logs bajo `/aws/codebuild/<proyecto>`. Al terminar, extrae los archivos de artefactos definidos y, si el proyecto está configurado con `artifacts.type=S3`, los sube automáticamente al bucket indicado.

Este mecanismo de inyección y extracción vía API de copia de archivos de Docker —en vez de montajes de volumen (bind mounts)— es una decisión de diseño deliberada: funciona correctamente incluso cuando el propio Floci corre dentro de un contenedor Docker (un escenario Docker-in-Docker), algo que un simple bind mount no podría lograr de forma confiable porque el path del host no sería visible dentro del contenedor de Floci.

**Analogía:** CodeBuild en Floci es como un taller de ensamblaje real que recibe tus piezas por mensajería (`docker cp` de entrada), las ensambla siguiendo tus instrucciones exactas (las fases del buildspec), y te devuelve el producto terminado también por mensajería (`docker cp` de salida) — no es una maqueta de cómo se vería el ensamblaje, es el ensamblaje real.

**¿Por qué es importante?** Que la compilación sea real —no un `SUCCEEDED` fabricado— significa que un `buildspec.yml` que funciona en Floci tiene altísima probabilidad de funcionar igual en CodeBuild real: estás practicando con el mismo motor de ejecución, solo que en tu máquina.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-24/tema-1-codebuild-real.sh — ejecutar con: bash tema-1-codebuild-real.sh
aws s3 mb s3://demo-artefactos
aws codebuild create-project --name demo-build --source type=NO_SOURCE \
  --artifacts type=S3,location=demo-artefactos \
  --environment type=LINUX_CONTAINER,image=public.ecr.aws/docker/library/alpine:latest,computeType=BUILD_GENERAL1_SMALL \
  --service-role arn:aws:iam::000000000000:role/codebuild-role
ID=$(aws codebuild start-build --project-name demo-build \
  --buildspec-override 'version: 0.2
phases:
  build:
    commands:
      - echo hola desde Floci > salida.txt
artifacts:
  files:
    - salida.txt' --query 'build.id' --output text)
aws codebuild batch-get-builds --ids "$ID" --query 'builds[0].buildStatus'
```

`--source type=NO_SOURCE` le dice al proyecto que no traiga código de ningún repositorio (para este ejercicio aislado, el código llega directo en el buildspec); `--artifacts type=S3,location=...` es dónde CodeBuild sube el resultado; `--environment` describe el contenedor donde corre el build — su imagen Docker y cuánto cómputo asignarle; `--service-role` es el rol de IAM con el que CodeBuild opera. Al arrancar el build, `--project-name` elige qué proyecto ejecutar y `--buildspec-override` reemplaza, solo para esta ejecución, el `buildspec.yml` del proyecto por el texto que le pasás inline. Para consultar el resultado, `--ids` identifica qué compilación mirar. En resumen: `--source` es la bandera que fija de dónde viene el código, `--artifacts` es la bandera que fija dónde se sube el resultado, `--buildspec-override` es la bandera que reemplaza el buildspec para esa corrida, e `--ids` es la bandera que elige qué compilación consultar.

**Resultado esperado:** tras sondear unos segundos, `buildStatus` pasa a `SUCCEEDED` y `aws s3 ls s3://demo-artefactos/` muestra `salida.txt` — la prueba de que un contenedor Alpine real ejecutó la fase `build`, no que Floci fabricó el resultado.

**Modifica esto:** cambia el comando de la fase `build` para que falle deliberadamente (`exit 1`) y confirma que `buildStatus` pasa a `FAILED` en vez de `SUCCEEDED` — así verificas que Floci reporta fallos reales del contenedor, no solo éxitos.

**Cuándo no usarlo:** no uses `NO_SOURCE` para un proyecto real con código versionado; ese tipo de origen solo sirve para practicar el buildspec en aislamiento, como en este ejercicio.

**Cómo crece tu proyecto:** este pipeline compila el servicio de seguimiento y sube el artefacto listo para desplegar en los temas siguientes de este módulo.

### Tema 2: buildspec.yml — fases y artefactos

#### Paso 1 · Objetivo y preparación
Al finalizar podrás definir fases y artefactos desde cero. Prerrequisitos: Docker y Node.js; verifica `node --version`.
#### Paso 2 · Contexto y caso real
El pipeline debe saber qué ejecutar y qué entregar.
#### Paso 3 · Teoría, modelo mental y analogía
Phases son estaciones; artifacts son paquetes listos para transportar.
#### Paso 4 · Demostración guiada
Crea `buildspec.yml` y `src/app.js` desde una carpeta vacía.
```bash
mkdir ejemplo-buildspec
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: apunta a una carpeta de artefactos inexistente para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Publica logs y artefacto.
#### Paso 7 · Cierre y evidencia
Entrega YAML, salida, fallo y corrección; explica el resultado. Siguiente paso: despliegue. Errores comunes: incluir archivos secretos y rutas relativas incorrectas. Fuente oficial: https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html.
**Conceptos clave:** `phases`, `artifacts.files`, `artifacts.base-directory`, `buildspecOverride`.

Un `buildspec.yml` (o su equivalente enviado como `buildspecOverride` en la propia llamada a `StartBuild`) define listas de comandos para cada fase: `install` para dependencias del entorno, `pre_build` para pasos previos (login a un registro, por ejemplo), `build` para el comando de compilación principal, y `post_build` para pasos finales como empaquetar o notificar. La sección `artifacts.files` especifica qué archivos recolectar al terminar —soporta patrones glob como `**/*` o nombres específicos—, y `artifacts.base-directory` indica desde qué carpeta son relativas esas rutas, por defecto `$CODEBUILD_SRC_DIR`.

Cuando el tipo de artefactos es `S3`, el bucket destino debe existir de antemano —Floci no lo crea automáticamente—, y las rutas de los archivos subidos preservan la estructura relativa al directorio base configurado, exactamente como en AWS real.

**Analogía:** las fases de un buildspec son como las etapas de una receta de cocina escritas explícitamente: primero reunir ingredientes (`install`), luego prepararlos (`pre_build`), cocinar (`build`), y finalmente emplatar (`post_build`) — cada fase asume que la anterior se completó correctamente.

**¿Por qué es importante?** Separar explícitamente las fases de un pipeline de build es lo que permite diagnosticar rápidamente en cuál de ellas falló una compilación, en vez de tener que revisar un script monolítico de principio a fin.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-24/tema-2-fases.sh — ejecutar con: bash tema-2-fases.sh
aws codebuild start-build --project-name demo-build \
  --buildspec-override 'version: 0.2
phases:
  install:
    commands:
      - echo "instalando dependencias"
  pre_build:
    commands:
      - echo "paso previo"
  build:
    commands:
      - echo "compilando" > build.log
  post_build:
    commands:
      - echo "empaquetando" >> build.log
artifacts:
  files:
    - build.log'
```

**Resultado esperado:** los logs de CloudWatch bajo `/aws/codebuild/demo-build` muestran las cuatro fases ejecutadas en orden (`install`, `pre_build`, `build`, `post_build`); `build.log` sube a S3 con las dos líneas escritas por `build` y `post_build`.

**Modifica esto:** haz que `pre_build` falle (`exit 1`) y confirma que `build` y `post_build` nunca se ejecutan — las fases son secuenciales y una falla detiene el pipeline.

**Cuándo no usarlo:** no metas lógica de negocio compleja directamente en el buildspec; para pipelines grandes, invoca scripts versionados en tu repositorio desde cada fase en vez de inline.

**Cómo crece tu proyecto:** estas cuatro fases son las que compilan, prueban y empaquetan cada servicio antes de que CodeDeploy lo despliegue.

### Tema 3: CodeDeploy — aplicaciones, grupos y configuraciones predefinidas

#### Paso 1 · Objetivo y preparación
Al finalizar podrás configurar una estrategia de despliegue desde cero. Prerrequisitos: Docker y Node.js; verifica `node --version`.
#### Paso 2 · Contexto y caso real
Una API necesita actualizar instancias sin interrumpir tráfico.
#### Paso 3 · Teoría, modelo mental y analogía
El deployment group es la flota y la configuración decide cómo reemplazarla.
#### Paso 4 · Demostración guiada
Crea `appspec.yml` desde una carpeta vacía.
```bash
mkdir ejemplo-deploy-group
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: elige plataforma incompatible para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Compara in-place y blue/green.
#### Paso 7 · Cierre y evidencia
Entrega configuración, salida, fallo y corrección; explica el resultado. Siguiente paso: hooks. Errores comunes: grupo sin healthcheck y ventanas de mantenimiento ausentes. Fuente oficial: https://docs.aws.amazon.com/codedeploy/latest/userguide/deployments.html.
**Conceptos clave:** `computePlatform`, grupo de implementación, configuración de despliegue, las 17 configuraciones integradas.

CodeDeploy organiza el trabajo en dos niveles: una aplicación (`CreateApplication`) define la plataforma de cómputo objetivo —`Server`, `Lambda` o `ECS`—, y un grupo de implementación (`CreateDeploymentGroup`) dentro de esa aplicación define la configuración concreta del despliegue: qué configuración de despliegue usar, y para ECS específicamente, a qué servicio y grupos objetivo de balanceador apunta. AWS —y Floci, fielmente— provee 17 configuraciones de despliegue predefinidas que no puedes eliminar: desde `AllAtOnce` (todo de una vez) hasta variantes canary y lineales con distintos porcentajes y ventanas de tiempo, tanto para Lambda como para ECS.

Elegir entre estas configuraciones predefinidas es una decisión de riesgo: `AllAtOnce` es la más rápida pero la más arriesgada si el nuevo código tiene un bug, mientras que una estrategia canary (por ejemplo, `LambdaCanary10Percent5Minutes`) envía solo el 10% del tráfico a la versión nueva durante 5 minutos antes de decidir si continuar, limitando el impacto de un despliegue defectuoso a una fracción pequeña de usuarios durante poco tiempo.

**Analogía:** las configuraciones de despliegue predefinidas son como los ajustes de velocidad de una cinta transportadora en una fábrica: puedes elegir "máxima velocidad, todo de una vez" o "arranque lento, verificando calidad en cada tramo antes de acelerar" — la decisión depende de cuánto te puedes permitir arriesgar si algo sale mal.

**¿Por qué es importante?** La elección de estrategia de despliegue es una de las decisiones de ingeniería con mayor impacto directo en la disponibilidad de un sistema en producción; entender las opciones disponibles —no solo memorizar el comando para crear un despliegue— es la habilidad real que se evalúa aquí.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-24/tema-3-aplicacion-y-grupo.sh — ejecutar con: bash tema-3-aplicacion-y-grupo.sh
aws deploy create-application --application-name demo-app --compute-platform Lambda
aws deploy create-deployment-group --application-name demo-app --deployment-group-name demo-grupo \
  --deployment-config-name CodeDeployDefault.LambdaCanary10Percent5Minutes \
  --service-role-arn arn:aws:iam::000000000000:role/codedeploy-role \
  --deployment-style deploymentType=BLUE_GREEN,deploymentOption=WITH_TRAFFIC_CONTROL
aws deploy list-deployment-configs --query "deploymentConfigsList" --output text | wc -w
```

`--application-name` nombra la aplicación; `--compute-platform` fija dónde despliega (`Lambda`, `Server` o `ECS`). Al crear el grupo, `--deployment-group-name` lo nombra; `--deployment-config-name` elige cuál de las 17 estrategias predefinidas usar; `--service-role-arn` es el rol de IAM con el que CodeDeploy opera; `--deployment-style` fija el tipo de despliegue (acá, `BLUE_GREEN` con control de tráfico, en vez de reemplazar todo de una vez in-place). En resumen: `--application-name` es la bandera que nombra la aplicación, `--compute-platform` es la bandera que fija dónde despliega, y `--deployment-group-name` es la bandera que nombra el grupo de despliegue.

**Resultado esperado:** `create-application` y `create-deployment-group` devuelven confirmación con sus IDs; `list-deployment-configs` lista las 17 configuraciones predefinidas, incluida `LambdaCanary10Percent5Minutes` que acabas de usar.

**Modifica esto:** crea un segundo grupo usando `CodeDeployDefault.LambdaAllAtOnce` en vez de canary, y compara en la documentación qué diferencia de riesgo implica frente al que acabas de crear.

**Cuándo no usarlo:** no elijas `AllAtOnce` para una función crítica sin un plan de rollback probado; resérvalo para funciones de bajo impacto o entornos donde un rollback rápido no es crítico.

**Cómo crece tu proyecto:** `demo-app` es la aplicación CodeDeploy que gestionará todos los despliegues canary de las funciones Lambda del proyecto integrador.

### Tema 4: Despliegue Blue/Green de Lambda — cambio de tráfico por alias

#### Paso 1 · Objetivo y preparación
Al finalizar podrás desplegar Lambda gradualmente desde cero. Prerrequisitos: Docker y Node.js; verifica `node --version`.
#### Paso 2 · Contexto y caso real
Una nueva versión debe recibir tráfico progresivamente y poder revertirse.
#### Paso 3 · Teoría, modelo mental y analogía
El alias es puntero; hooks son controles antes y después del cambio.
#### Paso 4 · Demostración guiada
Crea `src/canary.js` desde una carpeta vacía.
```bash
mkdir ejemplo-canary
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: fuerza error en hook para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Simula 10/90 y rollback.
#### Paso 7 · Cierre y evidencia
Entrega routing, salida, fallo y corrección; explica el resultado. Siguiente paso: ECS. Errores comunes: no validar métricas y rollback manual tardío. Fuente oficial: https://docs.aws.amazon.com/codedeploy/latest/userguide/deployments-lambda.html.
**Conceptos clave:** alias Lambda, `RoutingConfig`, lifecycle hook `BeforeAllowTraffic`/`AfterAllowTraffic`, reversión automática.

Para `computePlatform: Lambda`, `CreateDeployment` ejecuta un cambio de tráfico real sobre el alias de tu función: lee la estrategia configurada en el grupo de implementación (todo a la vez, canary o lineal), y si es canary o lineal, actualiza gradualmente el `RoutingConfig` del alias para enrutar un porcentaje del tráfico hacia la nueva versión, espera el intervalo configurado, y luego completa el cambio al 100%. Si configuraste lifecycle hooks —funciones Lambda adicionales que se invocan en puntos específicos del despliegue, como `BeforeAllowTraffic` o `AfterAllowTraffic`—, CodeDeploy las invoca y espera a que reporten éxito vía `PutLifecycleEventHookExecutionStatus` antes de continuar.

El detalle más importante de este flujo es la reversión automática: si cualquier lifecycle hook reporta `Failed`, CodeDeploy revierte automáticamente el alias a la versión anterior y marca el despliegue completo como `Failed` — sin que tengas que intervenir manualmente para deshacer un despliegue problemático. Este es exactamente el tipo de red de seguridad que justifica usar una herramienta de despliegue dedicada en vez de cambiar el alias manualmente con un script propio.

**Analogía:** un lifecycle hook que valida el despliegue es como un catador que prueba cada lote antes de que salga a la venta: si algo sale mal, ese lote específico se retira automáticamente antes de que llegue a más clientes, en vez de esperar a que se quejen después.

**¿Por qué es importante?** La combinación de cambio de tráfico gradual más validación automática con reversión es el patrón de despliegue de más bajo riesgo que existe para funciones serverless; dominarlo aquí te prepara directamente para operar Lambda en producción con confianza.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-24/tema-4-canary-lambda.sh — ejecutar con: bash tema-4-canary-lambda.sh
ID=$(aws deploy create-deployment --application-name demo-app --deployment-group-name demo-grupo \
  --revision 'revisionType=AppSpecContent,appSpecContent={content="{\"version\":0.0,\"Resources\":[{\"miFuncion\":{\"Type\":\"AWS::Lambda::Function\",\"Properties\":{\"Name\":\"demo-tracking\",\"Alias\":\"live\",\"CurrentVersion\":\"1\",\"TargetVersion\":\"2\"}}}]}"}' \
  --query 'deploymentId' --output text)
aws deploy get-deployment --deployment-id "$ID" --query 'deploymentInfo.status'
```

`--revision` es el contenido que describe qué desplegar — acá, un AppSpec inline que dice qué alias mover de la versión 1 a la versión 2; `--deployment-id` (usado después con `get-deployment`) identifica ese despliegue puntual para consultar su estado. En resumen: `--deployment-id` es la bandera que identifica ese despliegue específico.

**Resultado esperado:** el estado empieza en `InProgress` mientras el 10% del tráfico se enruta a la versión 2 durante la ventana de 5 minutos configurada, y termina en `Succeeded` con el alias `live` apuntando al 100% a la versión nueva.

**Modifica esto:** simula un lifecycle hook fallido devolviendo `Failed` con `put-lifecycle-event-hook-execution-status` y confirma que CodeDeploy revierte automáticamente el alias a la versión 1, sin que tú hagas el rollback manualmente.

**Cuándo no usarlo:** no uses una ventana canary de 5 minutos para una función con tráfico muy bajo; si recibe pocas invocaciones, esos 5 minutos podrían no acumular suficiente señal para detectar un problema real antes de completar el despliegue.

**Cómo crece tu proyecto:** este es el despliegue exacto que promueve una nueva versión del servicio de seguimiento sin interrumpir a los repartidores que ya están usando la versión anterior.

### Tema 5: Despliegue Blue/Green de ECS — cambio de tráfico por listener ELB

#### Paso 1 · Objetivo y preparación
Al finalizar podrás hacer blue/green en contenedores desde cero. Prerrequisitos: Docker y Node.js; verifica `node --version`.
#### Paso 2 · Contexto y caso real
El servicio nuevo debe probarse antes de recibir todas las solicitudes.
#### Paso 3 · Teoría, modelo mental y analogía
Blue/green es mantener dos flotas y cambiar el letrero cuando la nueva está lista.
#### Paso 4 · Demostración guiada
Crea `appspec.yml` desde una carpeta vacía.
```bash
mkdir ejemplo-ecs-bluegreen
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: falla el target verde para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Promueve, observa y revierte.
#### Paso 7 · Cierre y evidencia
Entrega AppSpec, salida, fallo y corrección; explica el resultado. Siguiente paso: observabilidad. Errores comunes: targets mezclados y rollback sin datos. Fuente oficial: https://docs.aws.amazon.com/codedeploy/latest/userguide/deployments-ecs.html.
**Conceptos clave:** conjunto de tareas verde, `TargetService`, promoción a PRIMARY, AppSpec.

Para `computePlatform: ECS`, el despliegue Blue/Green es más elaborado: CodeDeploy analiza un AppSpec en formato JSON que describe la nueva definición de tarea, crea un "conjunto de tareas verde" en tu servicio ECS apuntando a esa nueva definición, ejecuta los lifecycle hooks configurados, y luego cambia atómicamente la regla de reenvío por defecto del listener ELB v2 para dirigir tráfico hacia el grupo objetivo verde —de forma inmediata (`AllAtOnce`), gradual por pasos (`Canary`) o en incrementos lineales (`Linear`), según la configuración elegida. Al finalizar exitosamente, el conjunto de tareas verde se promueve a `PRIMARY` y el conjunto azul original se elimina.

Este flujo asume que tu servicio ECS fue creado con `deploymentController.type: EXTERNAL` —delegando el control del despliegue a CodeDeploy en vez de al mecanismo de actualización continua nativo de ECS— y que ya tienes un listener ELB v2 con grupos objetivo azul y verde configurados, lo que conecta directamente con lo que practicaste en el Módulo 22.

**Analogía:** un despliegue Blue/Green de ECS es como preparar un segundo turno completo de personal (verde) entrenado y listo antes de rotar la asignación de clientes hacia ellos, en vez de reemplazar al personal actual (azul) uno por uno mientras siguen atendiendo — si algo sale mal con el turno nuevo, el turno anterior sigue disponible para retomar sin fricción.

**¿Por qué es importante?** Blue/Green es la estrategia de despliegue con menor riesgo de tiempo de inactividad porque el entorno anterior sigue existiendo intacto durante todo el proceso, listo para recibir tráfico de vuelta si algo falla — la diferencia entre esto y un despliegue in-place es central para entender por qué las arquitecturas críticas prefieren Blue/Green.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-24/tema-5-blue-green-ecs.sh — ejecutar con: bash tema-5-blue-green-ecs.sh
# El listener se recupera por nombre del ALB del Módulo 22 — no hace falta
# haber conservado ninguna variable de esa sesión de terminal.
LB_ARN=$(aws elbv2 describe-load-balancers --names demo-alb --query 'LoadBalancers[0].LoadBalancerArn' --output text)
LISTENER_ARN=$(aws elbv2 describe-listeners --load-balancer-arn "$LB_ARN" --query 'Listeners[0].ListenerArn' --output text)

aws deploy create-application --application-name demo-app-ecs --compute-platform ECS
aws deploy create-deployment-group --application-name demo-app-ecs --deployment-group-name demo-grupo-ecs \
  --deployment-config-name CodeDeployDefault.ECSAllAtOnce \
  --service-role-arn arn:aws:iam::000000000000:role/codedeploy-role \
  --ecs-services serviceName=demo-service,clusterName=demo-cluster \
  --load-balancer-info targetGroupPairInfoList='[{prodTrafficRoute={listenerArns=["'"$LISTENER_ARN"'"]},targetGroups=[{name=demo-objetivos-azul},{name=demo-objetivos-verde}]}]'
```

`--ecs-services` identifica qué servicio y cluster de ECS gestiona este grupo de implementación; `--load-balancer-info` describe la pareja de grupos objetivo (azul y verde) y el listener del ALB entre los que CodeDeploy va a mover el tráfico — la misma infraestructura que creaste en el Módulo 22. En resumen: `--ecs-services` es la bandera que identifica servicio y cluster, y `--load-balancer-info` es la bandera que describe los grupos objetivo azul/verde y el listener.

**Resultado esperado:** el grupo de implementación queda creado con `deploymentType=BLUE_GREEN`; al iniciar un despliegue real sobre este grupo, `describe-services` en ECS mostraría temporalmente dos conjuntos de tareas (azul y verde) hasta que el verde se promueve a `PRIMARY`.

**Modifica esto:** cambia `CodeDeployDefault.ECSAllAtOnce` por `CodeDeployDefault.ECSLinear10PercentEvery1Minutes` y compara cuánto tarda en completarse un despliegue de prueba con cada configuración.

**Cuándo no usarlo:** no configures Blue/Green en un servicio ECS que sigue usando `deploymentController.type` nativo (`ECS` en vez de `EXTERNAL`); CodeDeploy no puede tomar control de un servicio que no delegó su despliegue explícitamente.

**Cómo crece tu proyecto:** este grupo Blue/Green es el que usará el servicio ECS en producción para desplegar sin interrumpir el tráfico del ALB creado en el Módulo 22.

---


## Laboratorio práctico

> Este laboratorio asume que ya ejecutaste `floci start` y `eval $(floci env)` (Módulo 1) en tu sesión de terminal, así que los comandos de `aws` no repiten `--endpoint-url`.

**Objetivo del laboratorio:** ejecutar una compilación real con CodeBuild que produce un artefacto en S3, y luego configurar un despliegue canary de Lambda con CodeDeploy, observando el cambio gradual de tráfico.

**Requisitos previos:** el socket Docker montado en Floci, un bucket S3 existente para artefactos, y una función Lambda con un alias (`live`) apuntando a una versión publicada, de los Módulos 5 y 21.

### Laboratorio 24.1 — Compilación real con CodeBuild

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Crea el bucket de artefactos | `aws s3 mb s3://mis-artefactos` | CodeBuild no crea el bucket automáticamente | Confirmación de creación |
| 2 | Crea el proyecto | `aws codebuild create-project --name mi-build --source type=NO_SOURCE --artifacts type=S3,location=mis-artefactos --environment type=LINUX_CONTAINER,image=public.ecr.aws/docker/library/alpine:latest,computeType=BUILD_GENERAL1_SMALL --service-role arn:aws:iam::000000000000:role/codebuild-role` | Registra el proyecto con la imagen Docker que se usará para compilar | Confirmación con el ARN del proyecto |
| 3 | Inicia una compilación con buildspec inline | `aws codebuild start-build --project-name mi-build --buildspec-override 'version: 0.2\nphases:\n build:\n commands:\n - echo hola desde Floci > salida.txt\nartifacts:\n files:\n - salida.txt'` | Lanza un contenedor Alpine real y ejecuta la fase `build` | Un `id` de compilación con estado `IN_PROGRESS` |
| 4 | Sondea hasta que termine | `aws codebuild batch-get-builds --ids <id>` | Repite hasta que `buildComplete` sea `true` | `buildStatus: SUCCEEDED` |
| 5 | Verifica el artefacto en S3 | `aws s3 ls s3://mis-artefactos/` | Confirma que `salida.txt` se subió automáticamente | Una fila con `salida.txt` |

### Laboratorio 24.2 — Despliegue canary de Lambda con CodeDeploy

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Crea la aplicación CodeDeploy | `aws deploy create-application --application-name mi-app-lambda --compute-platform Lambda` | Registra la aplicación para despliegues de Lambda | Confirmación con el `applicationId` |
| 2 | Crea el grupo con estrategia canary | `aws deploy create-deployment-group --application-name mi-app-lambda --deployment-group-name mi-grupo --deployment-config-name CodeDeployDefault.LambdaCanary10Percent5Minutes --service-role-arn arn:aws:iam::000000000000:role/codedeploy-role --deployment-style deploymentType=BLUE_GREEN,deploymentOption=WITH_TRAFFIC_CONTROL` | El 10% del tráfico va a la versión nueva durante 5 minutos antes de completar | Confirmación con el `deploymentGroupId` |
| 3 | Inicia el despliegue | `aws deploy create-deployment --application-name mi-app-lambda --deployment-group-name mi-grupo --revision 'revisionType=AppSpecContent,appSpecContent={content="{\"version\":0.0,\"Resources\":[{\"miFuncion\":{\"Type\":\"AWS::Lambda::Function\",\"Properties\":{\"Name\":\"mi-funcion\",\"Alias\":\"live\",\"CurrentVersion\":\"1\",\"TargetVersion\":\"2\"}}}]}"}'` | Comienza el cambio gradual de tráfico del alias `live` | Un `deploymentId` con estado `InProgress` |
| 4 | Sondea el estado | `aws deploy get-deployment --deployment-id <id>` | Repite hasta ver `status: Succeeded` | El despliegue completa tras el intervalo canary |

**Verificación:** el laboratorio se considera exitoso si `batch-get-builds` reporta `buildStatus: SUCCEEDED` y el archivo `salida.txt` existe realmente en el bucket S3, y si `get-deployment` reporta `status: Succeeded` para el despliegue Lambda, confirmando que el alias `live` terminó apuntando al 100% a la versión 2.

**Errores comunes y soluciones**

- **`StartBuild` falla al no encontrar la imagen.** Verifica que la imagen especificada en `environment.image` sea accesible (una imagen pública de ECR o Docker Hub); revisa los logs de CodeBuild en CloudWatch bajo `/aws/codebuild/<proyecto>` para el error exacto.
- **El artefacto no aparece en S3.** Confirma que el bucket existe antes de iniciar la compilación — CodeBuild no lo crea automáticamente — y que `artifacts.files` en tu buildspec realmente coincide con el nombre del archivo generado.
- **El despliegue Lambda se queda en `InProgress` más tiempo del esperado.** Es el comportamiento correcto de una estrategia canary con ventana de 5 minutos: el emulador respeta intervalos reales aunque acortados respecto a AWS, así que espera el tiempo configurado antes de sondear de nuevo.
- **`CreateDeploymentGroup` para ECS falla sin `loadBalancerInfo`.** Un grupo de implementación Blue/Green para ECS requiere `ecsServices` y `loadBalancerInfo` con los grupos objetivo azul/verde del Módulo 22 ya creados.

---
