# Módulo 24: CI/CD nativo de AWS con CodeBuild y CodeDeploy

## Sílabo

**Objetivo general**

Dominar los dos servicios que AWS ofrece para compilar y desplegar código sin salir de su ecosistema: CodeBuild, que ejecuta compilaciones reales dentro de contenedores Docker, y CodeDeploy, que orquesta despliegues Blue/Green reales de Lambda y ECS con cambio de tráfico gradual y reversión automática ante fallos.

**Objetivos específicos**

1. Crear un proyecto CodeBuild y ejecutar una compilación real a partir de un `buildspec.yml`.
2. Recolectar artefactos de una compilación y subirlos automáticamente a S3.
3. Configurar un despliegue Blue/Green de Lambda con CodeDeploy usando una estrategia canary.
4. Explicar el rol de los lifecycle hooks en un despliegue y cómo provocan una reversión automática.

**Contenido**

- CodeBuild: modelo de ejecución real en Docker, fases de `buildspec.yml`, artefactos.
- CodeDeploy: aplicaciones, grupos de despliegue y configuraciones predefinidas.
- Despliegue Blue/Green de Lambda: cambio de tráfico por alias.
- Despliegue Blue/Green de ECS: cambio de tráfico por reglas de listener ELB.
- Lifecycle hooks y reversión automática ante fallos.

**Evaluación**

Dos laboratorios prácticos (una compilación real con CodeBuild, y un despliegue canary de Lambda con CodeDeploy) y tres ejercicios de evaluación.

---

## Aprende construyendo

### Tema 1: CodeBuild — compilaciones reales dentro de contenedores Docker

**Conceptos clave:** `StartBuild`, fases de compilación, Docker-in-Docker, `docker cp`.

Cuando llamas a `StartBuild`, Floci no simula una compilación exitosa: extrae la imagen Docker configurada en el proyecto, inicia un contenedor real, inyecta tus archivos fuente dentro con `docker cp`, y ejecuta las fases de tu `buildspec.yml` —`install`, `pre_build`, `build`, `post_build`— de forma secuencial mediante `docker exec`, transmitiendo la salida en tiempo real a CloudWatch Logs bajo `/aws/codebuild/<proyecto>`. Al terminar, extrae los archivos de artefactos definidos y, si el proyecto está configurado con `artifacts.type=S3`, los sube automáticamente al bucket indicado.

Este mecanismo de inyección y extracción vía API de copia de archivos de Docker —en vez de montajes de volumen (bind mounts)— es una decisión de diseño deliberada: funciona correctamente incluso cuando el propio Floci corre dentro de un contenedor Docker (un escenario Docker-in-Docker), algo que un simple bind mount no podría lograr de forma confiable porque el path del host no sería visible dentro del contenedor de Floci.

**Analogía:** CodeBuild en Floci es como un taller de ensamblaje real que recibe tus piezas por mensajería (`docker cp` de entrada), las ensambla siguiendo tus instrucciones exactas (las fases del buildspec), y te devuelve el producto terminado también por mensajería (`docker cp` de salida) — no es una maqueta de cómo se vería el ensamblaje, es el ensamblaje real.

**¿Por qué es importante?** Que la compilación sea real —no un `SUCCEEDED` fabricado— significa que un `buildspec.yml` que funciona en Floci tiene altísima probabilidad de funcionar igual en CodeBuild real: estás practicando con el mismo motor de ejecución, solo que en tu máquina.

### Tema 2: buildspec.yml — fases y artefactos

**Conceptos clave:** `phases`, `artifacts.files`, `artifacts.base-directory`, `buildspecOverride`.

Un `buildspec.yml` (o su equivalente enviado como `buildspecOverride` en la propia llamada a `StartBuild`) define listas de comandos para cada fase: `install` para dependencias del entorno, `pre_build` para pasos previos (login a un registro, por ejemplo), `build` para el comando de compilación principal, y `post_build` para pasos finales como empaquetar o notificar. La sección `artifacts.files` especifica qué archivos recolectar al terminar —soporta patrones glob como `**/*` o nombres específicos—, y `artifacts.base-directory` indica desde qué carpeta son relativas esas rutas, por defecto `$CODEBUILD_SRC_DIR`.

Cuando el tipo de artefactos es `S3`, el bucket destino debe existir de antemano —Floci no lo crea automáticamente—, y las rutas de los archivos subidos preservan la estructura relativa al directorio base configurado, exactamente como en AWS real.

**Analogía:** las fases de un buildspec son como las etapas de una receta de cocina escritas explícitamente: primero reunir ingredientes (`install`), luego prepararlos (`pre_build`), cocinar (`build`), y finalmente emplatar (`post_build`) — cada fase asume que la anterior se completó correctamente.

**¿Por qué es importante?** Separar explícitamente las fases de un pipeline de build es lo que permite diagnosticar rápidamente en cuál de ellas falló una compilación, en vez de tener que revisar un script monolítico de principio a fin.

### Tema 3: CodeDeploy — aplicaciones, grupos y configuraciones predefinidas

**Conceptos clave:** `computePlatform`, grupo de implementación, configuración de despliegue, las 17 configuraciones integradas.

CodeDeploy organiza el trabajo en dos niveles: una aplicación (`CreateApplication`) define la plataforma de cómputo objetivo —`Server`, `Lambda` o `ECS`—, y un grupo de implementación (`CreateDeploymentGroup`) dentro de esa aplicación define la configuración concreta del despliegue: qué configuración de despliegue usar, y para ECS específicamente, a qué servicio y grupos objetivo de balanceador apunta. AWS —y Floci, fielmente— provee 17 configuraciones de despliegue predefinidas que no puedes eliminar: desde `AllAtOnce` (todo de una vez) hasta variantes canary y lineales con distintos porcentajes y ventanas de tiempo, tanto para Lambda como para ECS.

Elegir entre estas configuraciones predefinidas es una decisión de riesgo: `AllAtOnce` es la más rápida pero la más arriesgada si el nuevo código tiene un bug, mientras que una estrategia canary (por ejemplo, `LambdaCanary10Percent5Minutes`) envía solo el 10% del tráfico a la versión nueva durante 5 minutos antes de decidir si continuar, limitando el impacto de un despliegue defectuoso a una fracción pequeña de usuarios durante poco tiempo.

**Analogía:** las configuraciones de despliegue predefinidas son como los ajustes de velocidad de una cinta transportadora en una fábrica: puedes elegir "máxima velocidad, todo de una vez" o "arranque lento, verificando calidad en cada tramo antes de acelerar" — la decisión depende de cuánto te puedes permitir arriesgar si algo sale mal.

**¿Por qué es importante?** La elección de estrategia de despliegue es una de las decisiones de ingeniería con mayor impacto directo en la disponibilidad de un sistema en producción; entender las opciones disponibles —no solo memorizar el comando para crear un despliegue— es la habilidad real que se evalúa aquí.

### Tema 4: Despliegue Blue/Green de Lambda — cambio de tráfico por alias

**Conceptos clave:** alias Lambda, `RoutingConfig`, lifecycle hook `BeforeAllowTraffic`/`AfterAllowTraffic`, reversión automática.

Para `computePlatform: Lambda`, `CreateDeployment` ejecuta un cambio de tráfico real sobre el alias de tu función: lee la estrategia configurada en el grupo de implementación (todo a la vez, canary o lineal), y si es canary o lineal, actualiza gradualmente el `RoutingConfig` del alias para enrutar un porcentaje del tráfico hacia la nueva versión, espera el intervalo configurado, y luego completa el cambio al 100%. Si configuraste lifecycle hooks —funciones Lambda adicionales que se invocan en puntos específicos del despliegue, como `BeforeAllowTraffic` o `AfterAllowTraffic`—, CodeDeploy las invoca y espera a que reporten éxito vía `PutLifecycleEventHookExecutionStatus` antes de continuar.

El detalle más importante de este flujo es la reversión automática: si cualquier lifecycle hook reporta `Failed`, CodeDeploy revierte automáticamente el alias a la versión anterior y marca el despliegue completo como `Failed` — sin que tengas que intervenir manualmente para deshacer un despliegue problemático. Este es exactamente el tipo de red de seguridad que justifica usar una herramienta de despliegue dedicada en vez de cambiar el alias manualmente con un script propio.

**Analogía:** un lifecycle hook que valida el despliegue es como un catador que prueba cada lote antes de que salga a la venta: si algo sale mal, ese lote específico se retira automáticamente antes de que llegue a más clientes, en vez de esperar a que se quejen después.

**¿Por qué es importante?** La combinación de cambio de tráfico gradual más validación automática con reversión es el patrón de despliegue de más bajo riesgo que existe para funciones serverless; dominarlo aquí te prepara directamente para operar Lambda en producción con confianza.

### Tema 5: Despliegue Blue/Green de ECS — cambio de tráfico por listener ELB

**Conceptos clave:** conjunto de tareas verde, `TargetService`, promoción a PRIMARY, AppSpec.

Para `computePlatform: ECS`, el despliegue Blue/Green es más elaborado: CodeDeploy analiza un AppSpec en formato JSON que describe la nueva definición de tarea, crea un "conjunto de tareas verde" en tu servicio ECS apuntando a esa nueva definición, ejecuta los lifecycle hooks configurados, y luego cambia atómicamente la regla de reenvío por defecto del listener ELB v2 para dirigir tráfico hacia el grupo objetivo verde —de forma inmediata (`AllAtOnce`), gradual por pasos (`Canary`) o en incrementos lineales (`Linear`), según la configuración elegida. Al finalizar exitosamente, el conjunto de tareas verde se promueve a `PRIMARY` y el conjunto azul original se elimina.

Este flujo asume que tu servicio ECS fue creado con `deploymentController.type: EXTERNAL` —delegando el control del despliegue a CodeDeploy en vez de al mecanismo de actualización continua nativo de ECS— y que ya tienes un listener ELB v2 con grupos objetivo azul y verde configurados, lo que conecta directamente con lo que practicaste en el Módulo 22.

**Analogía:** un despliegue Blue/Green de ECS es como preparar un segundo turno completo de personal (verde) entrenado y listo antes de rotar la asignación de clientes hacia ellos, en vez de reemplazar al personal actual (azul) uno por uno mientras siguen atendiendo — si algo sale mal con el turno nuevo, el turno anterior sigue disponible para retomar sin fricción.

**¿Por qué es importante?** Blue/Green es la estrategia de despliegue con menor riesgo de tiempo de inactividad porque el entorno anterior sigue existiendo intacto durante todo el proceso, listo para recibir tráfico de vuelta si algo falla — la diferencia entre esto y un despliegue in-place es central para entender por qué las arquitecturas críticas prefieren Blue/Green.

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



## Bibliografía y fundamento académico

Estas fuentes sustentan los conceptos y deben consultarse para verificar detalles que cambian entre versiones:

- AWS, Microsoft Azure y Google Cloud, marcos oficiales de arquitectura bien diseñada.
- NIST, *Cloud Computing Standards Roadmap* y *Secure Software Development Framework*.
- Beyer et al., *Site Reliability Engineering*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

```yaml
version: 0.2
phases:
  install:
    commands: ["npm ci"]
  build:
    commands: ["npm test", "npm run build"]
artifacts:
  files: ["dist/**/*"]
```

El pipeline se detiene ante una prueba fallida y publica únicamente artefactos construidos de manera reproducible.

En este módulo usaste CodeBuild para ejecutar compilaciones reales dentro de contenedores Docker —no simulaciones—, entendiendo el flujo completo de fases de un `buildspec.yml` y la recolección automática de artefactos hacia S3. Con CodeDeploy, configuraste un despliegue Blue/Green real de Lambda con cambio de tráfico canary por alias, y estudiaste cómo el mismo patrón se extiende a ECS mediante conjuntos de tareas azul/verde y reglas de listener ELB. El concepto central que atraviesa ambos servicios es la reducción de riesgo en el proceso de entrega: compilaciones reproducibles y despliegues graduales con reversión automática ante fallos son las piedras angulares de un pipeline de CI/CD confiable en producción.
