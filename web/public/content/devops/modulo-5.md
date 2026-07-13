# Módulo 5: CD — estrategias de despliegue

## Sílabo

**Objetivo general**

Diseñar estrategias de despliegue que lleven código ya validado por CI a producción sin downtime perceptible, con capacidad real de revertir en segundos si algo sale mal, combinando blue-green, canary, rolling updates y feature flags según el contexto.

**Objetivos específicos**

1. Diferenciar blue-green, canary y rolling update, y justificar cuándo elegir cada uno.
2. Configurar un pipeline de CD que despliegue automáticamente a un entorno de staging tras pasar CI.
3. Simular un despliegue canary a un subconjunto de instancias.
4. Implementar un feature flag simple que desacople el despliegue de la activación para el usuario.
5. Diseñar (conceptualmente) un mecanismo de rollback automático basado en métricas.

**Contenido**

- Blue-green deployment.
- Canary releases.
- Rolling updates.
- Feature flags vs branches por entorno.
- Rollback automático por métricas.

**Evaluación**

Un laboratorio que configura un pipeline de CD hacia staging con una simulación de canary, y tres ejercicios de evaluación sobre elección de estrategia, feature flags, y diseño de rollback automático.

---

## Contenido teórico

### Tema 1: Blue-green deployment

**Conceptos clave:** entorno blue, entorno green, corte de tráfico instantáneo, rollback inmediato.

Blue-green deployment mantiene dos entornos de producción idénticos en infraestructura, identificados convencionalmente como "blue" (el que actualmente recibe todo el tráfico real) y "green" (donde se despliega la nueva versión, sin recibir tráfico todavía). Una vez que la nueva versión en "green" pasa sus verificaciones (pruebas de humo, chequeos de salud, validación manual si aplica), el balanceador de carga cambia de golpe todo el tráfico de "blue" hacia "green", que pasa a ser efectivamente el nuevo entorno de producción activo.

La ventaja distintiva de este enfoque es la velocidad y simplicidad del rollback: si algo sale mal después de cortar el tráfico hacia "green", revertir consiste simplemente en volver a apuntar el balanceador hacia "blue", que sigue existiendo, intacto, con la versión anterior completamente funcional, sin necesidad de volver a desplegar ni reconstruir nada. Este rollback es prácticamente instantáneo, medido en segundos, precisamente porque el entorno anterior nunca se destruyó durante el proceso.

El coste de esta estrategia es la necesidad de mantener el doble de infraestructura durante el periodo de transición (ambos entornos, "blue" y "green", corriendo simultáneamente, aunque solo uno reciba tráfico real en un momento dado), lo cual tiene un impacto directo en el coste de infraestructura, especialmente notable si los entornos son grandes o si las transiciones son poco frecuentes (pagando por infraestructura duplicada la mayor parte del tiempo, con poco beneficio adicional fuera de las ventanas de despliegue).

Blue-green es particularmente adecuado cuando el riesgo de un despliegue fallido es alto y la velocidad de reversión es más valiosa que el coste adicional de infraestructura duplicada, o cuando el cambio es de naturaleza "todo o nada" (por ejemplo, un cambio de esquema de base de datos incompatible hacia atrás, donde no tiene sentido tener una fracción de tráfico en la versión antigua y otra fracción en la nueva simultáneamente).

**Analogía:** blue-green es como tener dos escenarios idénticos preparados para una obra de teatro: mientras el público (tráfico) está en el escenario "blue" viendo la función actual, el equipo prepara completamente el escenario "green" con la nueva puesta en escena. Cuando todo está listo y verificado, simplemente se apagan las luces de "blue" y se encienden las de "green" de golpe. Si algo sale mal en la nueva puesta, basta con volver a encender las luces de "blue", que nunca se desmontó.

**¿Por qué es importante?** Blue-green da la garantía de reversión más rápida y simple de las tres estrategias de este módulo, a costa del mayor consumo de infraestructura duplicada; entender este compromiso explícito es lo que permite elegir correctamente cuándo ese coste adicional está justificado por el riesgo del cambio en cuestión.

**Diagrama:**

```
Antes del corte:                        Después del corte:
Balanceador ──▶ Blue (v1, recibe 100%)   Balanceador ──▶ Green (v2, recibe 100%)
             ╲─▶ Green (v2, standby)                  ╲─▶ Blue (v1, standby,
                                                              listo para rollback)
```

### Tema 2: Canary releases

**Conceptos clave:** porcentaje de tráfico incremental, monitorización de métricas durante el despliegue, incremento gradual.

Un despliegue canary expone la nueva versión únicamente a una fracción pequeña del tráfico real (por ejemplo, un 5%), mientras el resto del tráfico sigue siendo atendido por la versión anterior, estable y conocida. Durante ese periodo inicial, se monitorean activamente métricas clave —tasa de error, latencia, cualquier indicador relevante del negocio— comparando el comportamiento de ese pequeño porcentaje de tráfico en la nueva versión contra el comportamiento de referencia de la versión anterior. Si las métricas se mantienen dentro de rangos aceptables, el porcentaje de tráfico dirigido a la nueva versión se incrementa gradualmente (10%, 25%, 50%, 100%), repitiendo la observación en cada incremento, hasta que la nueva versión recibe la totalidad del tráfico.

Este enfoque limita el radio de impacto (blast radius) de un problema no detectado durante las pruebas anteriores: si la nueva versión tiene un defecto que solo se manifiesta bajo tráfico real de producción (algo que ninguna prueba automatizada logró anticipar), ese defecto solo afecta a la pequeña fracción de usuarios que cayó en el canary, no a la totalidad de los usuarios del sistema. Esto contrasta con blue-green, donde el corte de tráfico es total e inmediato: si el problema no se detectó antes del corte, afecta al 100% del tráfico desde el primer instante.

El nombre "canary" hace referencia históricamente a los canarios que los mineros llevaban consigo en los pozos de carbón como sistema temprano de alerta ante gases tóxicos: el canario, más sensible que un humano a esos gases, mostraba síntomas de alarma antes de que el peligro afectara a los mineros mismos, dando tiempo de reaccionar. Un despliegue canary aplica exactamente esa misma lógica: expone una porción pequeña y controlada al riesgo potencial, como señal de alerta temprana, antes de comprometer a la totalidad del sistema.

La decisión de cuándo y cuánto incrementar el porcentaje puede hacerse manualmente (una persona revisa las métricas y decide avanzar) o automatizarse completamente con reglas explícitas (si la tasa de error se mantiene bajo cierto umbral durante cierto tiempo, incrementar automáticamente al siguiente escalón), acercándose directamente al concepto de rollback automático por métricas que se cubre en el Tema 5 de este mismo módulo.

**Analogía:** un despliegue canary es como probar una nueva receta en un restaurante sirviéndola primero solo a un pequeño grupo de mesas seleccionadas, observando de cerca sus reacciones, antes de ponerla en el menú completo para todos los comensales del restaurante; si el pequeño grupo reporta un problema, se retira la receta habiendo afectado solo a esas pocas mesas, no a todo el restaurante.

**¿Por qué es importante?** Canary es la estrategia que mejor limita el impacto de problemas que solo se manifiestan bajo condiciones reales de producción —tráfico real, patrones de uso reales, volumen real— que ninguna batería de pruebas automatizadas puede replicar perfectamente de antemano, siendo particularmente valiosa para cambios de riesgo incierto donde el coste de un impacto total (como en blue-green) sería significativo.

**Diagrama:**

```
5% tráfico ──▶ v2 (nueva)     95% tráfico ──▶ v1 (estable)
       │                              
   ¿métricas OK?
       │
      Sí ──▶ incrementa a 25% ──▶ ¿métricas OK? ──▶ Sí ──▶ ... hasta 100%
      No ──▶ revierte a 0% (rollback), v1 sigue atendiendo todo el tráfico
```

### Tema 3: Rolling updates

**Conceptos clave:** reemplazo incremental de instancias, `maxUnavailable`, `maxSurge`, disponibilidad continua durante el despliegue.

Un rolling update reemplaza las instancias de la versión anterior por instancias de la nueva versión de forma incremental y controlada, manteniendo en todo momento un número suficiente de instancias disponibles (de cualquiera de las dos versiones) para seguir atendiendo tráfico sin interrupción. En vez del corte total e instantáneo de blue-green, o el enrutamiento explícito por porcentaje de canary, un rolling update simplemente va apagando instancias antiguas y levantando instancias nuevas de a poco, hasta que todas las instancias corren la nueva versión.

Dos parámetros configuran precisamente cómo de agresivo o conservador es este reemplazo: `maxUnavailable` limita cuántas instancias pueden estar temporalmente fuera de servicio a la vez durante la actualización (por ejemplo, con `maxUnavailable: 1` sobre un conjunto de 5 instancias, nunca hay menos de 4 disponibles simultáneamente), y `maxSurge` permite crear temporalmente instancias adicionales por encima de la cantidad normal antes de retirar las antiguas (por ejemplo, `maxSurge: 1` permite tener temporalmente 6 instancias mientras se completa la transición, antes de estabilizarse de nuevo en 5). Ajustar estos dos valores permite equilibrar la velocidad del despliegue (valores más altos, más agresivo) contra el margen de capacidad disponible durante la transición (valores más bajos, más conservador).

Rolling update es la estrategia por defecto en Kubernetes (que vas a estudiar en profundidad en los Módulos 6 y 7 de este mismo track), precisamente porque no requiere infraestructura duplicada como blue-green, ni la infraestructura de enrutamiento explícito por porcentaje que canary típicamente requiere (aunque Kubernetes, combinado con un service mesh, también puede implementar canary de forma más sofisticada). Es la opción más simple de las tres de implementar de forma nativa en un orquestador de contenedores estándar, sin herramientas adicionales.

A diferencia de canary, un rolling update no expone deliberadamente solo una fracción pequeña y observada del tráfico a la nueva versión antes de comprometerse completamente: simplemente avanza el reemplazo de instancias de forma progresiva, sin una fase explícita de observación y decisión en cada incremento. Esto lo hace más simple de configurar, pero con menos capacidad de detectar y limitar un problema específico de la nueva versión antes de que afecte a una porción creciente del tráfico real.

**Analogía:** un rolling update es como renovar progresivamente la flota de vehículos de una empresa de transporte, reemplazando un vehículo a la vez y manteniendo siempre suficientes vehículos en la carretera para cubrir todas las rutas, en vez de detener toda la flota de golpe para cambiarla completa (blue-green) o probar el vehículo nuevo solo en una ruta específica antes de generalizarlo (canary).

**¿Por qué es importante?** Rolling update es la estrategia de menor complejidad operativa de las tres, sin necesidad de infraestructura duplicada ni de mecanismos explícitos de enrutamiento por porcentaje, siendo la opción por defecto razonable para la mayoría de los despliegues rutinarios sin un riesgo particularmente elevado, dejando canary y blue-green como estrategias más especializadas para escenarios de mayor riesgo o incertidumbre.

**Diagrama:**

```
Instancias:  [v1] [v1] [v1] [v1] [v1]   (estado inicial, 5 instancias v1)
Paso 1:      [v2] [v1] [v1] [v1] [v1]   (maxUnavailable:1 — nunca menos de 4 disponibles)
Paso 2:      [v2] [v2] [v1] [v1] [v1]
Paso 3:      [v2] [v2] [v2] [v1] [v1]
...          (continúa hasta reemplazar todas)
Final:       [v2] [v2] [v2] [v2] [v2]
```

### Tema 4: Feature flags vs branches por entorno

**Conceptos clave:** feature flag, desacoplar deploy de release, activación selectiva, branches por entorno.

Un feature flag es un interruptor de configuración —normalmente una variable booleana consultada en tiempo de ejecución, gestionada por un servicio dedicado o por configuración simple— que activa o desactiva una funcionalidad específica del código sin necesidad de desplegar una versión distinta de la aplicación. El código de la nueva funcionalidad puede desplegarse a producción completamente "apagado" (el flag en `false`), sin ningún efecto visible para los usuarios, y activarse después con un simple cambio de configuración, sin ningún despliegue adicional de código.

Esta capacidad desacopla dos conceptos que a menudo se confunden: el deploy (llevar código nuevo a los servidores de producción) y el release (hacer esa funcionalidad visible y activa para los usuarios finales). Con feature flags, puedes desplegar código con mucha frecuencia (siguiendo, por ejemplo, el enfoque de trunk-based development del Módulo 1 de este track) sin que eso implique que cada funcionalidad nueva se libere inmediatamente al público, dando control fino sobre cuándo y para quién se activa cada funcionalidad, incluso activándola solo para un subconjunto específico de usuarios (por ejemplo, solo empleados internos, o solo un porcentaje pequeño de usuarios reales) antes de generalizarla, un patrón que combina naturalmente con la idea de canary release del Tema 2, pero aplicado a nivel de funcionalidad de negocio en vez de a nivel de infraestructura completa.

La alternativa de usar branches (ramas) distintas por entorno —una rama que representa lo que está en producción, otra que representa lo que está en pruebas, con funcionalidades nuevas viviendo aisladas en ramas separadas hasta que están listas— acopla el deploy y el release directamente al proceso de fusión de ramas: una funcionalidad se "libera" cuando su rama se fusiona y se despliega, no antes. Este enfoque es más simple conceptualmente (no requiere infraestructura de feature flags), pero reintroduce el problema de ramas de larga duración que trunk-based development busca evitar, y dificulta activar una funcionalidad para un subconjunto específico de usuarios sin desplegar una configuración completamente distinta para ese subconjunto.

La práctica moderna, especialmente en equipos que practican trunk-based development de forma disciplinada, tiende a preferir feature flags sobre branches por entorno para funcionalidades en desarrollo activo, reservando ramas separadas principalmente para el control de versiones en sí (por ejemplo, ramas de release para congelar una versión específica antes de publicarla), no como mecanismo principal de activación de funcionalidades de negocio.

**Analogía:** un feature flag es como instalar una luz nueva en una habitación pero dejar el interruptor apagado hasta el día en que decides oficialmente inaugurarla, sin tener que volver a hacer ninguna obra de instalación ese día; simplemente enciendes el interruptor. Usar branches por entorno para lo mismo sería como construir la habitación nueva completa en un edificio aparte, y solo "mudarla" al edificio principal (con toda la obra que eso implica) el día de la inauguración.

**¿Por qué es importante?** Desacoplar deploy de release mediante feature flags da un control mucho más fino sobre cuándo y para quién se activa cada funcionalidad, permite activar código en producción con mucha frecuencia sin exponer trabajo incompleto a los usuarios, y habilita patrones de activación gradual (similar a canary) a nivel de funcionalidad de negocio específica, no solo a nivel de infraestructura completa.

**Diagrama:**

```
Sin feature flag (acoplado):          Con feature flag (desacoplado):
deploy = release                       deploy (código en producción, flag=false)
   │                                        │
   ▼                                   (tiempo después, sin nuevo deploy)
código nuevo visible                        ▼
para TODOS inmediatamente              flag=true ──▶ código nuevo visible
                                        (para todos, o solo un subconjunto)
```

### Tema 5: Rollback automático por métricas

**Conceptos clave:** umbral de error, ventana de observación, reversión automática sin intervención humana.

Un rollback automático por métricas cierra el ciclo entre desplegar y observar: en vez de depender de que una persona esté monitoreando activamente el sistema tras cada despliegue y decida manualmente revertir si algo sale mal, el propio pipeline de CD (o una herramienta de orquestación conectada a él) observa continuamente métricas clave definidas de antemano —tasa de error, latencia, cualquier indicador que el equipo considere crítico— durante una ventana de tiempo específica después del despliegue, y revierte automáticamente al estado anterior si esas métricas superan un umbral configurado, sin esperar a que una persona lo note y actúe manualmente.

Este mecanismo es particularmente valioso combinado con las estrategias de despliegue incremental de este mismo módulo (canary, rolling update): en vez de simplemente notificar a un humano que algo salió mal y esperar su reacción, el sistema puede detener automáticamente el avance de un despliegue canary en curso, o revertir directamente un rolling update ya iniciado, en cuestión de minutos u segundos desde que la métrica cruzó el umbral, mucho más rápido de lo que normalmente tardaría una persona en notar el problema, diagnosticarlo, y decidir actuar manualmente durante, por ejemplo, medianoche de un fin de semana.

Diseñar bien este mecanismo requiere definir con cuidado tanto el umbral (demasiado sensible, y el sistema revierte despliegues legítimos por fluctuaciones normales de tráfico; demasiado laxo, y no detecta problemas reales a tiempo) como la ventana de observación (demasiado corta, y no da tiempo suficiente para que el problema se manifieste claramente en las métricas; demasiado larga, y retrasa innecesariamente la detección de un problema real). Estos parámetros normalmente requieren ajuste iterativo basado en la experiencia real del sistema específico, no un valor universal correcto aplicable a cualquier contexto.

Este concepto conecta directamente con la observabilidad que vas a estudiar en el Módulo 9 de este mismo track (Prometheus y Grafana): sin métricas confiables y accesibles de forma automatizada, no es posible construir ningún mecanismo de rollback automático, porque el sistema necesita poder consultar programáticamente esas métricas para tomar la decisión de revertir, no solo mostrarlas visualmente para que una persona las interprete.

**Analogía:** un rollback automático por métricas es como un sistema de frenado automático de emergencia en un vehículo moderno: en vez de depender exclusivamente de que el conductor humano note el peligro y reaccione a tiempo, el propio vehículo monitorea continuamente sensores relevantes (distancia al vehículo de adelante, velocidad) y frena automáticamente si se cruza un umbral de riesgo, reaccionando más rápido de lo que un humano promedio podría, sin eliminar la necesidad de que el conductor siga atento al resto de la conducción.

**¿Por qué es importante?** El rollback automático por métricas reduce drásticamente el tiempo entre que un despliegue problemático empieza a afectar a usuarios reales y el momento en que se revierte, especialmente en horarios donde la supervisión humana activa es menos probable (noches, fines de semana), siendo una de las prácticas de mayor madurez operativa en la disciplina de entrega continua de software.

**Diagrama:**

```
Despliegue canario en curso (5% del tráfico en v2)
        │
   Monitorea: tasa de error
        │
  ¿tasa de error > umbral durante > X minutos?
        │
       Sí ──▶ ROLLBACK AUTOMÁTICO           No ──▶ continúa el despliegue,
       (revierte a v1, sin intervención             incrementa gradualmente
        humana, en segundos)                         el porcentaje hacia v2
```

---

## Laboratorio práctico

**Objetivo del laboratorio:** configurar un pipeline de CD que despliegue automáticamente a un entorno de staging tras pasar CI, simular un despliegue canary manual, implementar un feature flag simple, y diseñar (sin implementar completo) un rollback automático por métricas.

**Requisitos previos:** el pipeline de CI del Módulo 4 de este track ya configurado y funcionando, acceso a un entorno de despliegue de staging (puede ser simulado con Docker Compose local para este laboratorio).

| Paso | Acción | Configuración | Explicación | Resultado esperado |
|---|---|---|---|---|
| 1 | Documentar las tres estrategias con un diagrama propio | Dibuja (en texto o herramienta visual) la diferencia entre blue-green, canary y rolling update, usando tus propias palabras | Consolida la comprensión conceptual antes de implementar nada | Un diagrama o documento propio que distingue claramente las tres estrategias |
| 2 | Configurar el job de CD hacia staging | Añade un job `deploy-staging` a tu pipeline, con una dependencia explícita de que el job de CI (tests) haya pasado exitosamente | El despliegue solo ocurre si CI valida el cambio primero | El job `deploy-staging` solo se ejecuta tras el éxito del job de tests |
| 3 | Simular un despliegue canary manual | Con dos instancias de tu aplicación corriendo (por ejemplo, con Docker Compose, dos réplicas del mismo servicio), configura un balanceador simple (o `nginx`) para enrutar un pequeño porcentaje del tráfico a la instancia con la versión nueva | Practica manualmente el concepto de canary antes de depender de herramientas automatizadas más sofisticadas | El balanceador efectivamente distribuye el tráfico de forma desigual entre ambas versiones según lo configurado |
| 4 | Implementar un feature flag simple | Añade a tu aplicación una variable de entorno o un archivo de configuración que active/desactive una funcionalidad específica en el código, sin necesidad de recompilar ni redeploy | Aplica el patrón del Tema 4 de forma mínima | Cambiar el valor de la variable activa/desactiva la funcionalidad sin un nuevo despliegue |
| 5 | Diseñar (en documento, sin implementar completo) un rollback automático | Describe qué métrica usarías, qué umbral, qué ventana de observación, y qué acción tomaría el sistema automáticamente si el umbral se cruza | Aplica el razonamiento del Tema 5 sin necesidad de una implementación completa de producción para este laboratorio | Un documento claro que especifica métrica, umbral, ventana, y acción de reversión |

**Verificación:** el laboratorio se considera exitoso si el job de CD hacia staging efectivamente depende del éxito de CI (falla si CI falla), si el balanceador simulado de canary distribuye tráfico de forma verificable entre ambas versiones, y si el feature flag implementado activa/desactiva la funcionalidad sin requerir un nuevo despliegue.

**Errores comunes y soluciones**

- **El job de `deploy-staging` se ejecuta incluso si el job de tests falla.** Revisa la configuración de dependencia entre jobs de tu plataforma de CI/CD (la cláusula `needs` en GitHub Actions, por ejemplo); sin esa dependencia explícita, los jobs corren en paralelo de forma independiente por defecto.
- **El balanceador simulado de canary envía todo el tráfico a una sola instancia, no distribuido según el porcentaje configurado.** Revisa la configuración de pesos (`weight`) de tu balanceador o proxy; la distribución por porcentaje requiere una configuración explícita, no es el comportamiento por defecto de un balanceador simple round-robin.
- **El feature flag requiere reiniciar la aplicación completa para tomar efecto.** Si tu implementación lee la variable de entorno solo al arrancar el proceso, necesitas o bien un mecanismo de recarga de configuración en caliente, o aceptar que este feature flag específico requiere un reinicio (más simple, pero no verdaderamente "sin redeploy" en el sentido más estricto del concepto).
- **No tienes claro qué métrica usar para el diseño del rollback automático del paso 5.** Empieza con la tasa de error HTTP 5xx como métrica de partida razonable para casi cualquier servicio web; es una señal directa y ampliamente aplicable de que algo está fallando, independientemente del dominio específico de la aplicación.

---

## Ejercicios de evaluación

### Ejercicio 1: Elegir entre blue-green y canary

**Enunciado:** tu equipo va a desplegar un cambio de esquema de base de datos incompatible hacia atrás (la versión nueva y la versión anterior de la aplicación no pueden coexistir accediendo a la misma base de datos simultáneamente sin corromper datos). ¿Elegirías blue-green o canary para este despliegue específico? Justifica tu respuesta.

**Solución esperada:** blue-green, porque un cambio de esquema incompatible hacia atrás no permite que una fracción del tráfico use la versión antigua mientras otra fracción usa la versión nueva simultáneamente (que es exactamente lo que canary requeriría durante su periodo de incremento gradual); blue-green permite un corte limpio y total de todo el tráfico de una vez, coordinado con la migración del esquema, sin el periodo de coexistencia parcial entre ambas versiones que canary necesitaría.

**Criterios de éxito:**
- Elige blue-green, no canary.
- La justificación identifica correctamente que un cambio de esquema incompatible impide la coexistencia parcial de ambas versiones que canary requiere.

### Ejercicio 2: Diagnosticar un feature flag mal diseñado

**Enunciado:** un compañero implementó un feature flag que, al desactivarse, deja el código de la funcionalidad nueva completamente desplegado pero también deja expuesta accidentalmente una ruta de API nueva sin protección, aunque la interfaz de usuario que la usaría esté oculta. Explica el riesgo de este diseño y cómo lo corregirías.

**Solución esperada:** el riesgo es que un feature flag mal diseñado que solo oculta la interfaz visual, sin proteger también el backend correspondiente, deja esa funcionalidad accesible para cualquiera que descubra la ruta de API directamente (por ejemplo, inspeccionando el código del frontend, o simplemente probando rutas comunes), aunque nadie vea el botón o la pantalla que la activaría normalmente. La corrección es que el feature flag debe verificarse también en el backend, rechazando explícitamente las peticiones a esa funcionalidad mientras el flag esté desactivado, no solo ocultar su acceso visual en el frontend.

**Criterios de éxito:**
- Identifica correctamente que ocultar solo la interfaz visual no protege el backend correspondiente.
- Propone verificar el flag también del lado del servidor, rechazando la funcionalidad ahí, no solo en la interfaz.

### Ejercicio 3: Diseñar un umbral de rollback automático razonable

**Enunciado:** estás configurando un rollback automático basado en la tasa de error HTTP 5xx de un servicio que normalmente opera con una tasa de error de fondo de aproximadamente 0.1% (errores ocasionales normales de cualquier sistema real). Alguien propone un umbral de "cualquier error 5xx dispara el rollback inmediatamente". Explica por qué ese umbral es probablemente demasiado sensible, y propón una alternativa más razonable.

**Solución esperada:** un umbral de "cualquier error" no distingue entre la tasa de error de fondo normal (0.1%, presente incluso sin ningún despliegue nuevo) y un problema real introducido por el despliegue; con ese umbral, el sistema revertiría despliegues completamente sanos solo por la fluctuación estadística normal del sistema. Una alternativa más razonable sería un umbral significativamente por encima de la tasa de fondo conocida (por ejemplo, tasa de error superior al 2% o 3%, varias veces la tasa normal) sostenido durante una ventana de tiempo mínima (por ejemplo, 5 minutos consecutivos), para distinguir un problema real y sostenido de fluctuaciones normales y momentáneas.

**Criterios de éxito:**
- Explica correctamente que "cualquier error" no distingue la tasa de fondo normal de un problema real.
- Propone un umbral significativamente por encima de la tasa de fondo conocida, sostenido durante una ventana de tiempo mínima, no una reacción instantánea a cualquier error individual.

---

## Resumen del módulo

**Puntos clave**

- Blue-green da el rollback más rápido y simple, a costa de infraestructura duplicada; es ideal para cambios de alto riesgo o incompatibles hacia atrás.
- Canary limita el radio de impacto exponiendo la nueva versión gradualmente a una fracción creciente del tráfico real, observando métricas en cada incremento.
- Rolling update es la estrategia más simple de implementar nativamente en un orquestador como Kubernetes, reemplazando instancias de forma incremental sin infraestructura duplicada.
- Los feature flags desacoplan el deploy (llevar código a producción) del release (activarlo para los usuarios), dando control fino sobre cuándo y para quién se activa cada funcionalidad.
- El rollback automático por métricas cierra el ciclo entre desplegar y reaccionar ante un problema, reduciendo drásticamente el tiempo de detección y reversión frente a depender de supervisión humana manual.

**Conceptos aprendidos**

- Blue-green deployment y su mecanismo de corte de tráfico instantáneo.
- Canary releases y el incremento gradual de tráfico basado en observación de métricas.
- Rolling updates y los parámetros `maxUnavailable`/`maxSurge`.
- Feature flags frente a branches por entorno, y el desacople de deploy y release.
- Rollback automático por métricas: umbral, ventana de observación, y reversión sin intervención humana.

**Próximos pasos**

En el Módulo 6 vas a aprender los fundamentos de Kubernetes, el orquestador de contenedores estándar de la industria, empezando por Pods, ReplicaSets, Deployments y Services.

**Recursos adicionales**

- Documentación oficial de Kubernetes sobre estrategias de despliegue (rolling update y sus parámetros).
- Artículos de referencia de la industria sobre blue-green deployment y canary releases (Martin Fowler, entre otros autores de referencia en la disciplina de entrega continua).
- Documentación de plataformas de feature flags como referencia de implementación (LaunchDarkly, Unleash, u otras alternativas de código abierto).
