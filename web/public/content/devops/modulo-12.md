# Módulo 12: DevOps y este curso — del laboratorio a la nube

## Sílabo

**Objetivo general**

Conectar explícitamente todo lo aprendido en este track con el track Cloud Local, entendiendo qué cambia realmente al pasar de Floci a un proveedor cloud real, cómo gestionar secretos de forma nativa a la nube, y qué debe verificar una checklist de salida a producción seria.

**Objetivos específicos**

1. Explicar qué cambia (y qué no) al pasar de Terraform contra Floci a Terraform contra un proveedor cloud real.
2. Comparar la gestión de secretos local (`.env`) con los servicios de secretos cloud-native del track Cloud.
3. Construir una checklist de salida a producción propia, cubriendo observabilidad, seguridad, resiliencia, costos y documentación.
4. Explicar el modelo GitOps y diferenciarlo del CD tradicional basado en push.
5. Describir a nivel conceptual qué resuelve una Internal Developer Platform (IDP).

**Contenido**

- De cloud local a un proveedor cloud real.
- Gestión de secretos cloud-native (Secrets Manager/Key Vault).
- IaC multi-nube.
- Checklist de salida a producción.
- GitOps con ArgoCD y FluxCD.
- Platform Engineering: Internal Developer Platforms (IDPs).

**Evaluación**

Un laboratorio que documenta la migración de un módulo Terraform de Floci a un proveedor real y construye una checklist de producción propia, más tres ejercicios de evaluación sobre qué cambia al ir a producción real, GitOps frente a CD tradicional, y diseño de una checklist para un proyecto propio.

---

## Contenido teórico

### Tema 1: De cloud local a un proveedor cloud real

**Conceptos clave:** paridad de API, endpoint personalizado, credenciales reales, transición mínima de configuración.

Todo lo que practicaste en el track Cloud contra Floci usa exactamente las mismas APIs que AWS, Azure o GCP reales exponen: los mismos comandos de AWS CLI, las mismas llamadas de SDK, la misma estructura de peticiones y respuestas. Esta paridad deliberada de API es, precisamente, la razón de ser de un emulador como Floci: todo el conocimiento práctico que construiste —cómo crear un bucket, cómo configurar una política IAM, cómo desplegar una función Lambda— se transfiere directamente a una cuenta real sin necesidad de aprender nada fundamentalmente distinto.

Lo que efectivamente cambia al pasar de Floci a un proveedor real son, en esencia, dos configuraciones puntuales, no la lógica de lo que haces. Primero, el endpoint: en Floci, la AWS CLI o Terraform apuntaban explícitamente a `http://localhost:4566` (o el endpoint específico de floci-az o floci-gcp); contra un proveedor real, simplemente omites ese endpoint personalizado, y las herramientas apuntan por defecto a los servidores reales del proveedor. Segundo, las credenciales: en Floci, usaste credenciales de marcador de posición (`test`/`test`, que Floci no valida realmente); contra un proveedor real, necesitas credenciales IAM reales, generadas y gestionadas con exactamente el mismo cuidado de mínimo privilegio que estudiaste en profundidad en el track Cloud.

Este mismo patrón de "solo cambia el endpoint y las credenciales" aplica igual de bien a la configuración de Terraform: un bloque de provider que en Floci especificaba explícitamente `endpoints = { s3 = "http://localhost:4566" }` simplemente omite ese bloque de endpoints personalizados al apuntar a AWS real, dejando que Terraform se comunique directamente con los servidores de producción del proveedor usando las credenciales reales configuradas en el entorno.

Es importante no confundir esta simplicidad de transición de configuración con una equivalencia total de comportamiento: como ya se discutió en el Módulo 0 del track Cloud, un emulador local no replica comportamiento a gran escala, latencia de red real entre regiones geográficas, ni el coste real de producción. La transición de configuración es simple; la responsabilidad de operar correctamente en un entorno de producción real —con datos reales, usuarios reales, y coste real asociado a cada decisión— es sustancialmente mayor, y es exactamente lo que el resto de los temas de este módulo aborda.

**Analogía:** practicar contra Floci y luego pasar a un proveedor real es como aprender a conducir en un simulador de vuelo (o de conducción) extremadamente fiel, y después subirte al vehículo real: los controles, los procedimientos y las reacciones son idénticos, y el cambio de "simulador a vehículo real" es, mecánicamente, tan simple como sentarte en el asiento correcto; lo que cambia sustancialmente es que ahora las consecuencias de cualquier error son reales, no simuladas.

**¿Por qué es importante?** Entender que la transición técnica de Floci a un proveedor real es deliberadamente simple es lo que justifica todo el enfoque pedagógico del track Cloud: el tiempo invertido practicando contra un emulador no es tiempo "perdido" que haya que volver a aprender de otra forma al llegar a producción real, sino una inversión directamente transferible.

**Diagrama:**

```
Terraform contra Floci (local):          Terraform contra AWS real:
provider "aws" {                          provider "aws" {
  endpoints = {                              region = "us-east-1"
    s3 = "http://localhost:4566"            (sin endpoint personalizado:
  }                                          apunta directo a AWS real)
}                                          }
credenciales: test/test                   credenciales: IAM reales, mínimo privilegio
```

### Tema 2: Gestión de secretos cloud-native

**Conceptos clave:** Secrets Manager/Key Vault en producción, integración con el pipeline de despliegue.

En el Módulo 3 de este track estudiaste la gestión de secretos con un archivo `.env` local, adecuada para desarrollo, y en el Módulo 11 estudiaste Vault y SOPS como herramientas dedicadas de gestión de secretos. En producción sobre un proveedor cloud real, la opción más directa y frecuentemente preferida es usar el servicio de gestión de secretos nativo de ese mismo proveedor —AWS Secrets Manager, Azure Key Vault, GCP Secret Manager—, exactamente los mismos servicios que ya practicaste en profundidad en el Módulo 10 (avanzado) del track Cloud, ahora conectados directamente a tu pipeline de CI/CD para inyectar secretos en el momento exacto del despliegue.

Esta elección tiene una ventaja práctica de integración nativa similar a la que ya viste al comparar registries de contenedores gestionados por el proveedor (Módulo 2 de este track): un pipeline que se ejecuta con un rol IAM apropiado puede leer directamente de Secrets Manager sin gestionar ninguna credencial adicional separada específicamente para acceder al gestor de secretos, aprovechando la misma identidad y el mismo sistema de permisos que ya usa para el resto de sus operaciones contra ese proveedor cloud, evitando la complejidad adicional de gestionar credenciales de acceso a un sistema de secretos completamente externo al ecosistema del proveedor.

El flujo típico en un pipeline de despliegue real es: el pipeline se autentica ante el proveedor cloud (idealmente mediante identidad federada de corta duración, como se mencionó en el Módulo 11 de este track), consulta el secreto necesario directamente desde Secrets Manager (o el equivalente del proveedor) en el momento del despliegue, y lo inyecta como variable de entorno o archivo de configuración en el entorno de ejecución final (una función Lambda, un contenedor en ECS, un Pod de Kubernetes), sin que ese secreto pase nunca por un paso intermedio menos seguro, como quedar almacenado en texto plano en algún artifact del pipeline o en un log.

Elegir entre el servicio nativo del proveedor (Secrets Manager) y una herramienta multi-nube como Vault depende del mismo criterio que ya aplicaste al comparar proveedores de nube en el track Cloud: si tu infraestructura vive completamente dentro de un único proveedor, su servicio nativo suele ser la opción de menor fricción operativa; si operas en múltiples proveedores simultáneamente o necesitas una capa de abstracción común independiente de cualquier proveedor específico, una herramienta como Vault puede justificar su complejidad adicional.

**Analogía:** usar el gestor de secretos nativo del proveedor cloud donde ya vive el resto de tu infraestructura es como usar la caja fuerte integrada de tu propio edificio de oficinas, que ya reconoce automáticamente las credenciales de acceso de tus empleados autorizados, en vez de contratar un servicio de custodia externo completamente independiente que requeriría gestionar un conjunto separado de credenciales de acceso específicamente para esa caja fuerte externa.

**¿Por qué es importante?** La transición de `.env` local (adecuado solo para desarrollo) a un gestor de secretos cloud-native en producción es una de las diferencias operativas más concretas y de mayor impacto de seguridad entre practicar contra Floci y operar realmente en producción, y entender ese camino de migración es directamente relevante para cualquier proyecto real que construyas después de este curso.

**Diagrama:**

```
Desarrollo local (Módulo 3):        Producción real (este módulo):
.env (archivo local,                 AWS Secrets Manager / Azure Key Vault /
 nunca versionado)                    GCP Secret Manager
        │                                    │
   Docker Compose lo lee              Pipeline autenticado (rol IAM)
   directamente                       consulta el secreto en el momento
                                       exacto del despliegue
```

### Tema 3: IaC multi-nube

**Conceptos clave:** módulos por proveedor, abstracción multi-nube, coste de mantener portabilidad.

Como viste en el Módulo 8 de este track, Terraform soporta múltiples providers simultáneamente (AWS, Azure, GCP, entre muchos otros), lo que técnicamente permite describir infraestructura de múltiples proveedores en el mismo proyecto de Terraform. Sin embargo, es importante distinguir entre "Terraform soporta múltiples proveedores" y "mi infraestructura es realmente portable entre proveedores sin cambios": cada provider expone recursos con nombres, estructuras y capacidades específicas de ese proveedor concreto (`aws_s3_bucket` frente a `azurerm_storage_account`, con atributos y comportamientos que no son un simple mapeo uno a uno), de forma que escribir infraestructura verdaderamente abstraída y reutilizable entre proveedores distintos requiere un esfuerzo deliberado de diseño de módulos con esa portabilidad explícitamente en mente, no algo que ocurra automáticamente por el simple hecho de usar Terraform.

Esto conecta directamente con el ejercicio comparativo que hiciste en el Módulo 8 del track Cloud, documentando cómo el mismo caso de uso (guardar un archivo) se resuelve de forma distinta en AWS, Azure y GCP: esas diferencias de modelo entre proveedores, que ya identificaste a nivel de servicios individuales, se trasladan directamente al esfuerzo de diseñar módulos de Terraform verdaderamente multi-nube, donde cada módulo específico por proveedor necesita implementar la misma interfaz funcional (las mismas variables de entrada, los mismos outputs) mientras internamente invoca los recursos específicos y con la sintaxis particular de cada proveedor.

La decisión de invertir en una capa de abstracción multi-nube tiene un coste real de complejidad adicional que solo se justifica en contextos específicos: organizaciones con requisitos regulatorios o de negocio que exigen operar simultáneamente en múltiples proveedores, o que buscan explícitamente evitar la dependencia de un único proveedor (vendor lock-in) por razones estratégicas. Para la gran mayoría de los proyectos, que operan dentro de un único proveedor cloud de forma sostenida, esa inversión adicional en abstracción multi-nube no suele justificarse frente al beneficio más directo de aprovechar plenamente las capacidades y servicios específicos (y frecuentemente más ricos) de un único proveedor bien conocido por el equipo.

El proyecto integrador multi-nube que verás mencionado como contenido avanzado adicional del track Cloud es, precisamente, una oportunidad de experimentar directamente con este esfuerzo de abstracción entre proveedores en un contexto acotado y de aprendizaje, antes de enfrentar esa misma decisión con las implicaciones reales de un proyecto de producción.

**Analogía:** escribir infraestructura verdaderamente portable entre AWS, Azure y GCP es como diseñar un electrodoméstico que funcione indistintamente con los estándares eléctricos de tres países distintos, cada uno con su propio voltaje, frecuencia y forma de enchufe: es técnicamente posible con el diseño adecuado, pero requiere un esfuerzo de ingeniería deliberado y específico para esa portabilidad, muy distinto de simplemente diseñar el electrodoméstico óptimo para un único estándar eléctrico específico y bien conocido.

**¿Por qué es importante?** Entender que "soportar múltiples proveedores técnicamente" y "tener infraestructura realmente portable entre ellos" son cosas distintas, con un coste de diseño explícito para lo segundo, evita la expectativa poco realista de que adoptar Terraform automáticamente resuelve la portabilidad multi-nube sin ningún esfuerzo de diseño adicional específico para ese objetivo.

**Diagrama:**

```
"Terraform soporta múltiples providers"    "Mi infraestructura es realmente portable"
┌─────────────────────────┐              ┌─────────────────────────┐
│ Puedo escribir código         │              │ Requiere módulos diseñados     │
│ para AWS Y Azure en el          │              │ deliberadamente con la MISMA     │
│ mismo proyecto                  │  ≠           │ interfaz (variables/outputs)      │
│ (verdad técnica trivial)          │              │ que internamente implementan       │
│                                    │              │ cada proveedor por separado          │
└─────────────────────────┘              └─────────────────────────┘
```

### Tema 4: Checklist de salida a producción

**Conceptos clave:** verificación pre-lanzamiento, cobertura de observabilidad/seguridad/resiliencia/costos/documentación.

Una checklist de salida a producción formaliza, en una lista explícita y verificable, todas las prácticas que este track completo ha ido construyendo módulo a módulo, asegurando que ninguna se quede fuera por descuido antes de que un sistema nuevo (o un cambio significativo a uno existente) se considere listo para atender tráfico real. Una checklist mínima razonable cubre, como mínimo, cinco categorías: observabilidad (¿hay logs centralizados, métricas expuestas, y al menos una alerta configurada sobre un síntoma real de usuario, como estudiaste en los Módulos 9 y 10?), seguridad (¿los secretos están fuera del código, la imagen fue escaneada sin vulnerabilidades críticas pendientes, y los permisos de las credenciales de despliegue son mínimos, como estudiaste en el Módulo 11?).

La tercera categoría, resiliencia, verifica que existan healthchecks apropiados (Módulo 3 y Módulo 6/7 de este track) y que la estrategia de rollback —ya sea blue-green, canary, o rolling update (Módulo 5)— haya sido efectivamente probada al menos una vez, no solo documentada teóricamente sin verificación práctica real de que funciona como se espera cuando realmente se necesita. La cuarta categoría, costos, verifica que los límites de autoscaling (Módulo 7) sean razonables y no puedan generar un gasto descontrolado ante un pico de tráfico anómalo o un bug, y que los recursos estén correctamente etiquetados para poder atribuir costos a proyectos o equipos específicos en un entorno de nube real con múltiples cargas de trabajo compartiendo la misma cuenta.

La quinta categoría, documentación, verifica que exista al menos un runbook básico —una guía concreta de qué hacer si el sistema falla en un momento inoportuno (la clásica referencia a "las 3 de la madrugada", cuando la persona de guardia puede no tener el contexto completo fresco en la memoria)—, incluyendo cómo diagnosticar el problema más común, a quién escalar si el problema no se resuelve con los pasos documentados, y cómo ejecutar un rollback manual si el automático (si existe) no se dispara correctamente.

Esta checklist no es una lista estática universal aplicable idénticamente a cualquier proyecto: cada organización o equipo debería adaptarla a su contexto específico, añadiendo verificaciones adicionales relevantes a su dominio particular (por ejemplo, verificaciones de cumplimiento normativo específico en industrias reguladas), pero la estructura de cinco categorías —observabilidad, seguridad, resiliencia, costos, documentación— es un punto de partida sólido y ampliamente aplicable, que además mapea directamente, módulo por módulo, a todo lo que este track ha cubierto.

**Analogía:** una checklist de salida a producción es como la lista de verificación previa al despegue que un piloto revisa antes de cada vuelo, sin importar cuántas veces haya volado antes: no es una desconfianza en la experiencia del piloto, sino un reconocimiento de que, bajo presión de tiempo o rutina, es fácil pasar por alto un detalle crítico sin una lista explícita que fuerce la verificación sistemática de cada aspecto esencial, cada vez, sin excepción.

**¿Por qué es importante?** Sin una checklist explícita, es común que un proyecto llegue a producción con alguna de estas categorías incompleta simplemente por presión de tiempo o porque nadie se detuvo explícitamente a verificarla, y el coste de descubrir esa omisión durante un incidente real en producción es sustancialmente mayor que el coste de haberla verificado deliberadamente antes del lanzamiento.

**Diagrama:**

```
┌──────────────────────────────────────────────────┐
│              Checklist de salida a producción             │
├──────────────────────────────────────────────────┤
│ ☐ Observabilidad: logs centralizados, métricas, alerta      │
│ ☐ Seguridad: secretos fuera del código, imagen escaneada,     │
│    permisos mínimos                                            │
│ ☐ Resiliencia: healthchecks, rollback PROBADO                  │
│ ☐ Costos: límites de autoscaling, recursos etiquetados          │
│ ☐ Documentación: runbook de incidentes                           │
└──────────────────────────────────────────────────┘
```

### Tema 5: GitOps con ArgoCD y FluxCD

**Conceptos clave:** GitOps, reconciliación continua desde Git, pull-based deployment, Git como fuente de verdad.

GitOps es un modelo de despliegue continuo donde el estado deseado completo de la infraestructura y las aplicaciones se declara en un repositorio Git (típicamente manifiestos de Kubernetes o charts de Helm, como los que estudiaste en el Módulo 7 de este track), y un agente especializado que corre dentro del propio clúster —ArgoCD o FluxCD son las implementaciones más adoptadas— observa continuamente ese repositorio y reconcilia automáticamente el estado real del clúster para que coincida con lo declarado en Git, sin que ningún sistema externo necesite "empujar" (push) cambios activamente hacia el clúster.

Esto contrasta con el modelo de CD tradicional que construiste en el Módulo 5 de este track, donde un pipeline de CI/CD externo (GitHub Actions, por ejemplo) ejecuta activamente comandos de despliegue (`kubectl apply`, `helm upgrade`) contra el clúster, requiriendo que ese pipeline externo tenga credenciales con permiso de escritura directa sobre el clúster de producción. En GitOps, el agente (ArgoCD/FluxCD) vive dentro del propio clúster y es él quien activamente consulta (pull) el repositorio Git en busca de cambios, en vez de que un sistema externo empuje (push) cambios hacia adentro; esta inversión de dirección elimina la necesidad de exponer credenciales de escritura sobre el clúster hacia sistemas de CI/CD externos, reduciendo la superficie de ataque de exactamente el tipo de credencial sensible que estudiaste en el Módulo 11 de este track.

Un beneficio adicional importante de GitOps es que, al reconciliar continuamente (no solo en el momento puntual de un despliegue), el sistema detecta y corrige automáticamente cualquier deriva (drift) entre el estado real del clúster y lo declarado en Git: si alguien modifica manualmente un recurso directamente en el clúster (por ejemplo, con `kubectl edit`, saltándose el proceso normal), el agente GitOps revertirá automáticamente ese cambio manual no autorizado de vuelta al estado declarado en Git en su siguiente ciclo de reconciliación, reforzando Git como la única fuente de verdad legítima del estado deseado del sistema, no solo en el momento de cada despliegue sino de forma continua y sostenida en el tiempo.

Esta arquitectura también facilita naturalmente el rollback: revertir a un estado anterior del clúster es, literalmente, revertir el commit correspondiente en el repositorio Git (usando exactamente `git revert`, que ya estudiaste en el Módulo 1 de este track), y el agente GitOps reconciliará automáticamente el clúster de vuelta a ese estado anterior sin necesidad de ejecutar ningún comando adicional específico de despliegue.

**Analogía:** el modelo tradicional de CD es como un mensajero que activamente viaja hasta tu casa cada vez que hay un paquete nuevo que entregar, necesitando una llave de tu puerta para poder entrar y dejarlo. GitOps es como tener un sistema de vigilancia dentro de tu propia casa que revisa constantemente un catálogo público compartido de qué debería haber en cada habitación, y reorganiza automáticamente cualquier cosa que no coincida con ese catálogo, sin que nadie externo necesite nunca una llave de tu puerta para entrar.

**¿Por qué es importante?** GitOps reduce la superficie de exposición de credenciales sensibles de despliegue (el agente vive dentro del clúster, no fuera de él necesitando acceso externo), y añade una capa de auto-corrección continua contra cambios manuales no autorizados, dos propiedades de seguridad y consistencia operativa que el modelo tradicional de CD basado en push no ofrece de la misma forma nativa.

**Diagrama:**

```
CD tradicional (push):                   GitOps (pull):
Pipeline CI/CD ──▶ kubectl apply         Repositorio Git (estado deseado)
   (necesita credenciales                       ▲
    de escritura sobre el clúster)               │  el agente CONSULTA continuamente
                                          ArgoCD/FluxCD (dentro del clúster)
                                                  │
                                          reconcilia el clúster real para
                                          que coincida con Git, y revierte
                                          cualquier cambio manual no autorizado
```

### Tema 6: Platform Engineering — Internal Developer Platforms (IDPs)

**Conceptos clave:** plataforma interna de desarrollo, autoservicio para equipos de producto, abstracción de complejidad operativa.

Platform Engineering es una disciplina emergente que reconoce un problema práctico que surge naturalmente a medida que una organización adopta las prácticas de este track completo (Kubernetes, Terraform, CI/CD, observabilidad, seguridad): cada equipo de producto individual que necesita desplegar una aplicación nueva se enfrenta a una complejidad operativa considerable —escribir manifiestos de Kubernetes, configurar pipelines de CI/CD, definir políticas de seguridad, configurar dashboards de observabilidad— que, si cada equipo la resuelve completamente por su cuenta y de forma independiente, produce inconsistencia entre equipos y duplica esfuerzo de aprendizaje que ya fue resuelto correctamente por otro equipo en algún lugar de la misma organización.

Una Internal Developer Platform (IDP) es la solución a este problema: una capa de autoservicio, construida y mantenida por un equipo de plataforma dedicado, que expone a los equipos de producto una interfaz simplificada (por ejemplo, un formulario web, un archivo de configuración mínimo, o un comando de CLI interno específico de la organización) para tareas comunes ("crea un nuevo servicio con esta configuración estándar de CI/CD, observabilidad y seguridad ya preconfiguradas"), sin que cada equipo de producto individual necesite entender ni operar directamente toda la complejidad subyacente de Kubernetes, Terraform, o los pipelines de CI/CD específicos que la plataforma orquesta internamente en su nombre.

Esta capa de abstracción no oculta ni reemplaza el valor de las herramientas que estudiaste en este track completo —Kubernetes, Helm, Terraform, Prometheus, Trivy siguen siendo los componentes reales subyacentes que hacen el trabajo—; una IDP los orquesta y expone de forma coherente y estandarizada a través de toda la organización, encapsulando las decisiones de buenas prácticas (las mismas que estudiaste módulo a módulo en este track: mínimo privilegio, healthchecks apropiados, observabilidad desde el diseño) como el comportamiento por defecto de la plataforma, en vez de dejar que cada equipo de producto individual tenga que redescubrir y aplicar correctamente esas mismas prácticas de forma independiente cada vez.

El rol de "ingeniero de plataforma" (platform engineer) que construye y mantiene estas IDPs es, en esencia, aplicar todo el conocimiento de este track completo no para operar directamente una aplicación de producto específica, sino para construir la infraestructura de autoservicio que permite que muchos otros equipos operen sus propias aplicaciones de forma consistente, segura y eficiente, sin necesitar el mismo nivel de profundidad técnica en cada una de las disciplinas cubiertas por este track.

**Analogía:** sin una IDP, cada equipo de producto es como un cocinero que necesita construir su propia cocina desde cero cada vez que abre un nuevo restaurante: comprar y calibrar cada electrodoméstico, diseñar el sistema eléctrico, decidir la disposición de seguridad, repitiendo ese trabajo completo una y otra vez con resultados inconsistentes entre restaurantes distintos de la misma cadena. Una IDP es como una cocina estandarizada y preconstruida que la cadena entera de restaurantes proporciona a cada nuevo local: el cocinero se concentra en cocinar (el producto), mientras la infraestructura de cocina (los electrodomésticos, la seguridad eléctrica, el sistema de ventilación) ya viene correctamente configurada y consistente en todos los locales de la cadena.

**¿Por qué es importante?** A medida que una organización crece en número de equipos y servicios, Platform Engineering e IDPs son la respuesta a escala al mismo problema fundamental que este track completo aborda a nivel individual: cómo aplicar de forma consistente y sin fricción excesiva las buenas prácticas de CI/CD, seguridad y observabilidad, en vez de dejar que cada equipo las redescubra y las implemente de forma independiente e inconsistente.

**Diagrama:**

```
Sin IDP:                              Con IDP:
Equipo A construye su propio            Equipo A, B y C usan la MISMA
  pipeline de CI/CD desde cero            plataforma de autoservicio
Equipo B construye el suyo,               (que internamente orquesta
  ligeramente distinto                     Kubernetes, Terraform, CI/CD,
Equipo C construye el suyo,                observabilidad, seguridad ya
  con otras inconsistencias                 preconfiguradas correctamente)
   │
   Resultado: inconsistencia,           Resultado: consistencia,
   duplicación de esfuerzo,              menor fricción, buenas
   riesgo de mala configuración           prácticas por defecto
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

**Objetivo del laboratorio:** documentar la migración de un módulo Terraform del track Cloud (Floci) hacia un proveedor cloud real, comparar la gestión de secretos entre ambos contextos, y construir una checklist de salida a producción aplicada a un proyecto propio.

**Requisitos previos:** un módulo Terraform escrito contra Floci (del Módulo 8 de este track, o el proyecto final del track Cloud), acceso conceptual o real a una cuenta de un proveedor cloud real (no es necesario ejecutar cambios reales para este laboratorio si prefieres solo documentar el proceso).

| Paso | Acción | Documentación esperada | Explicación |
|---|---|---|---|
| 1 | Identificar los cambios de configuración necesarios | Documenta exactamente qué líneas de tu configuración Terraform cambiarían (endpoint, credenciales) al pasar de Floci a AWS/Azure/GCP real | Aplica el Tema 1 a tu propio código específico |
| 2 | Comparar la gestión de secretos | Escribe un documento comparando cómo gestionabas secretos localmente (`.env` o variables de entorno) contra cómo los gestionarías con Secrets Manager (o equivalente) en producción real | Aplica el Tema 2 |
| 3 | Construir tu checklist de producción | Escribe una checklist propia de al menos 15 ítems, cubriendo las cinco categorías del Tema 4 (observabilidad, seguridad, resiliencia, costos, documentación) | Aplica el Tema 4 a un nivel de detalle concreto y accionable, no genérico |
| 4 | Aplicar la checklist a un proyecto propio | Toma un proyecto tuyo (de este track o de otro) y marca honestamente qué ítems de tu checklist ya cumple y cuáles no | Convierte la checklist en una herramienta de diagnóstico real, no solo teórica |
| 5 | Documentar qué le falta | Para cada ítem no cumplido, escribe una nota breve de qué se necesitaría para cumplirlo | Convierte los huecos identificados en un plan de acción concreto |

**Verificación:** el laboratorio se considera exitoso si el documento de migración del paso 1 identifica correctamente y con precisión técnica los cambios exactos de endpoint y credenciales, y si la checklist aplicada en el paso 4 a un proyecto real identifica honestamente al menos un ítem no cumplido (una checklist que "pasa todo perfectamente" en el primer intento es, con alta probabilidad, una checklist demasiado superficial o generosa consigo misma).

**Errores comunes y soluciones**

- **La checklist queda demasiado genérica ("tener buena seguridad") en vez de accionable.** Reescribe cada ítem para que sea verificable de forma objetiva y binaria (sí/no), como "el pipeline bloquea el merge si Trivy reporta una vulnerabilidad crítica" en vez de simplemente "seguridad revisada".
- **El documento de comparación de secretos no menciona la integración con el pipeline de despliegue.** Asegúrate de describir explícitamente el flujo completo: cómo el pipeline se autentica, cómo consulta el secreto, y en qué momento exacto se inyecta, no solo "dónde vive" el secreto de forma aislada.
- **Aplicar la checklist al proyecto propio resulta en que "todo cumple perfectamente".** Revisa con más escepticismo cada ítem, especialmente resiliencia (¿el rollback fue realmente PROBADO, no solo documentado teóricamente?) y documentación (¿existe realmente un runbook, o solo la intención de escribirlo algún día?).

---

## Ejercicios de evaluación

### Ejercicio 1: Identificar qué SÍ cambia al ir a producción real

**Enunciado:** más allá del endpoint y las credenciales (que sí cambian de forma directa y simple), menciona al menos dos aspectos operativos que, aunque la configuración técnica de Terraform sea prácticamente idéntica, requieren atención adicional real al desplegar contra un proveedor cloud real que no eran relevantes al practicar contra Floci.

**Solución esperada:** dos respuestas razonables incluyen: (1) el coste real asociado a cada recurso desplegado, que en Floci era inexistente pero en un proveedor real requiere atención a los límites de autoscaling y al etiquetado de recursos para control de gastos (Tema 4); (2) la gestión real de credenciales IAM con mínimo privilegio genuino (en Floci, las credenciales de marcador de posición no representaban ningún riesgo real, mientras que en producción una credencial mal configurada tiene consecuencias de seguridad reales). Otras respuestas válidas podrían mencionar la latencia de red real entre servicios en distintas regiones, o el comportamiento a escala que un emulador local no puede replicar (mencionado en el Módulo 0 del track Cloud).

**Criterios de éxito:**
- Menciona al menos dos aspectos operativos reales más allá de la simple configuración de endpoint/credenciales.
- Conecta esos aspectos con conceptos ya estudiados en el track (coste, mínimo privilegio, escala real).

### Ejercicio 2: GitOps frente a CD tradicional

**Enunciado:** un compañero argumenta que GitOps es "básicamente lo mismo" que el pipeline de CD tradicional del Módulo 5 de este track, solo con otro nombre. Explica la diferencia arquitectónica clave (pull frente a push) y por qué esa diferencia tiene una implicación real de seguridad.

**Solución esperada:** en el CD tradicional, un sistema externo (el pipeline de CI/CD) empuja (push) activamente cambios hacia el clúster, lo que requiere que ese sistema externo tenga credenciales con permiso de escritura directa sobre el clúster de producción. En GitOps, un agente que vive dentro del propio clúster consulta (pull) activamente el repositorio Git en busca de cambios y se autoreconciliar, sin que ningún sistema externo necesite credenciales de escritura sobre el clúster. Esta diferencia (pull en vez de push) elimina la necesidad de exponer credenciales sensibles de escritura sobre el clúster hacia sistemas externos de CI/CD, reduciendo directamente la superficie de ataque de ese tipo específico de credencial sensible.

**Criterios de éxito:**
- Identifica correctamente la diferencia pull (GitOps) frente a push (CD tradicional).
- Explica la implicación de seguridad: GitOps no requiere exponer credenciales de escritura del clúster hacia sistemas externos.

### Ejercicio 3: Diseñar un ítem de checklist accionable

**Enunciado:** convierte este ítem vago de checklist en uno accionable y verificable de forma objetiva: "Tener buena observabilidad".

**Solución esperada:** una versión accionable podría ser: "El servicio expone métricas de tasa de peticiones, tasa de error y latencia p95 a Prometheus; existe al menos un dashboard de Grafana que las visualiza; y existe al menos una regla de alerta configurada sobre la tasa de error, con un umbral y una duración sostenida (`for`) definidos explícitamente, verificada con una prueba real de que efectivamente se dispara ante una condición simulada de error elevado."

**Criterios de éxito:**
- La versión reescrita es verificable objetivamente como sí/no, no una afirmación vaga de intención general.
- Incluye componentes específicos y concretos (métricas específicas, dashboard, alerta con umbral definido).

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

- La transición técnica de Floci a un proveedor cloud real se reduce, en esencia, a cambiar el endpoint y las credenciales; toda la lógica de comandos, APIs y buenas prácticas practicadas se transfiere directamente.
- Los gestores de secretos cloud-native (Secrets Manager, Key Vault) son la evolución natural del `.env` local en un entorno de producción real, integrados directamente con el pipeline de despliegue.
- Terraform soporta técnicamente múltiples proveedores, pero la portabilidad real multi-nube requiere un esfuerzo deliberado de diseño de módulos, que solo se justifica en contextos específicos.
- Una checklist de salida a producción, cubriendo observabilidad, seguridad, resiliencia, costos y documentación, formaliza en verificaciones explícitas todo lo que este track completo enseñó módulo a módulo.
- GitOps invierte el modelo de despliegue de push a pull, con un agente dentro del clúster reconciliando continuamente contra Git, reduciendo la exposición de credenciales de escritura sobre el clúster.
- Platform Engineering y las Internal Developer Platforms escalan las buenas prácticas de este track a través de toda una organización, mediante una capa de autoservicio que encapsula esas prácticas como comportamiento por defecto.

**Conceptos aprendidos**

- Qué cambia (endpoint, credenciales) y qué no cambia (lógica, comandos, APIs) al pasar de Floci a un proveedor real.
- Gestión de secretos cloud-native integrada con el pipeline de despliegue.
- El coste real de diseñar infraestructura verdaderamente portable multi-nube.
- Las cinco categorías de una checklist de salida a producción.
- GitOps: reconciliación continua desde Git, y su ventaja de seguridad frente al modelo push tradicional.
- Platform Engineering e Internal Developer Platforms como respuesta a escala organizacional.

**Próximos pasos**

En el Módulo 13, el proyecto final de este track, vas a construir un pipeline CI/CD completo de punta a punta: commit, build, test, escaneo de seguridad, despliegue a Kubernetes con Helm, y observabilidad con rollback documentado.

**Recursos adicionales**

- Documentación oficial de AWS Secrets Manager, Azure Key Vault y GCP Secret Manager.
- Documentación oficial de ArgoCD y FluxCD como implementaciones de GitOps.
- Recursos de la comunidad de Platform Engineering (platformengineering.org) y el concepto de Internal Developer Platform.
