# Revisión de los temas de los 14 stacks

Fecha: 11 de octubre de 2026. Base revisada: `9a6d02410deea1fc09911727a550bb6ff76fef81`.

El temario tiene amplitud suficiente para sostener las rutas, pero todavía no permite afirmar que todos los temas sean laboratorios reproducibles. Hay errores conceptuales, instrucciones que no crean el proyecto necesario, ejemplos desconectados de sus pruebas y recomendaciones de seguridad desactualizadas. La prioridad es corregir esas fallas antes de añadir más temas.

## Alcance y evidencia

Se inventariaron automáticamente **224 módulos y 931 temas de 14 rutas**, incluyendo sus criterios editoriales, lenguajes de los bloques y ubicación. Se revisaron manualmente ejemplos seleccionados de **cada ruta**, con énfasis en instalación, integración y módulos avanzados. Se contrastaron las API y recomendaciones indicadas abajo con documentación oficial. Esto es una revisión transversal con inventario completo; **no es una lectura técnica exhaustiva ni una certificación de ejecución de los 931 temas**.

El [inventario por tema](revision-stacks-inventario-2026-10-11.json) contiene las 931 entradas, las señales metodológicas pendientes, candidatos de JSON inválido y referencias locales ausentes. Una señal automática es una tarea de inspección, no un error confirmado. `runtimeVerified: false` significa que no se ejecutó el laboratorio completo de ese tema en esta revisión.

Comprobaciones realizadas ahora:

- `audit_topic_learning_quality.py --check --require-practicable`: 931/931 cumplen presencia editorial.
- `audit_seven_step_methodology.py --check`: 493/931 cumplen su heurística completa; 438 requieren inspección. Esta cifra no mide corrección técnica.
- Extracción y análisis JSON de los bloques etiquetados `json`: 7 candidatos inválidos; varios son fragmentos y deben distinguirse de archivos completos.
- Referencias entre backticks a `examples/`: 21 menciones de rutas inexistentes. Algunas son instrucciones para crear archivos, por lo que no deben contarse todas como enlaces rotos.
- Reproducción aislada de JavaScript M14 T1/T2 y Foundations M4 T2. Resultados en [reproducciones](revision-stacks-reproducciones-2026-10-11.json).
- Recálculo en memoria del recorrido estudiantil: 931 temas. El informe guardado conserva 913 y está desactualizado.

No se ejecutaron aplicaciones Android/iOS, todos los proyectos de los frameworks, despliegues cloud ni los 931 laboratorios. Los resultados anteriores del build y pruebas de la academia no acreditan esos ejemplos.

## Resumen por stack

La columna «heurística» cuenta temas que satisfacen los 16 patrones del auditor de siete pasos. No es una nota de calidad: JavaScript obtiene 83/83 y aun así tiene bloqueos reproducidos.

| Stack | Módulos | Temas | Heurística | Prioridad concreta |
|---|---:|---:|---:|---|
| Foundations | 12 | 50 | 5/50 | Repetición de laboratorios SQL y dependencias entre temas |
| Cloud | 35 | 154 | 30/154 | Demostraciones reales desde el primer módulo y mapa actualizado |
| DevOps | 16 | 92 | 78/92 | Compose funcional desde una instalación limpia |
| JavaScript | 15 | 83 | 83/83 | Bootstrap, scripts, dependencias y rutas de los laboratorios Master |
| Node | 15 | 72 | 57/72 | Requisito exacto de TypeScript nativo y Federation ejecutable |
| Angular | 16 | 63 | 60/63 | Corregir el modelo mental de interpolación |
| React | 15 | 55 | 2/55 | Baseline RSC seguro y proyecto Next completo |
| Java | 16 | 64 | 21/64 | Compatibilidad JDK/Gradle y fallo de Maven reproducible |
| Spring Boot | 16 | 62 | 58/62 | API SSRF correcta y prueba que realmente compruebe bloqueo |
| Kotlin Multiplatform | 14 | 54 | 32/54 | Contrato de errores Kotlin–Swift y ejemplo bilateral |
| Android | 15 | 50 | 49/50 | Alinear Compose, pruebas y source sets |
| iOS | 15 | 51 | 3/51 | Artefactos existentes y cancelación determinista |
| Flutter | 16 | 57 | 9/57 | ARB válido y pruebas asíncronas controladas |
| RutaFlow | 8 | 24 | 6/24 | Integridad y ejecución del laboratorio de conciliación |

## Hallazgos y acciones por ruta

P1: impide completar una práctica central o enseña una garantía incorrecta de seguridad/corrección. P2: problema de repetibilidad, precisión o progresión. Las prioridades describen material educativo; no afirman que la aplicación Angular desplegada tenga estas vulnerabilidades.

### Foundations

Cobertura: entorno, programación, algoritmos, web, SQL, pruebas, seguridad, arquitectura, sistemas operativos, matemáticas y distribuidos. La amplitud es buena, pero debe diferenciar núcleo obligatorio y especializaciones para no exigir dominio de todo antes de elegir stack.

**F01 · P2 · SQL no se puede repetir siguiendo la corrección.** [M4 T2](../web/public/content/foundations/modulo-4.md#L147) crea tablas e inserta fixtures cada vez. Primera ejecución comprobada: devuelve los resultados esperados del ejemplo de inyección. Segunda ejecución: `sqlite3.OperationalError: table categorias already exists`, antes de llegar a la función que el alumno debe corregir. Hace falta una base temporal nueva por ejecución o separar explícitamente preparación, ejecución y reinicio de datos de laboratorio.

M4 T3/T4 dependen expresamente de la base de temas anteriores. Esto es razonable para aprendizaje acumulativo, pero contradice la regla global del auditor que afirma que ninguna lección depende de un proyecto acumulativo. Resolver el contrato, no añadir frases para satisfacer la expresión regular. Cierre recomendado: ejercicio independiente con esquema, consulta parametrizada, rollback y evidencia de una segunda ejecución limpia.

### Cloud

Cobertura: fundamentos, Docker, servicios AWS/Azure/GCP, infraestructura, observabilidad y proyectos. Los 35 módulos superan la descripción de 32 del inicio.

**F02 · P1 · La primera demostración HTTP no construye el servidor.** [M0 T2](../web/public/content/cloud/modulo-0.md#L85) pide `src/main.js`, pero el bloque solo crea una carpeta y consulta versiones de curl/Node. Después exige puerto incorrecto, respuesta válida y 404 sin haber enseñado el servidor que debe responder. Añadir un servidor mínimo completo, arranque, peticiones y cierre del proceso.

**F03 · P2 · Mapa curricular obsoleto.** [M0 T3](../web/public/content/cloud/modulo-0.md#L154) dice 32 módulos, del 0 al 31; existen del 0 al 34. Explicar la relación de los módulos adicionales con la ruta principal. Separar cada servicio emulado de sus límites concretos y de cualquier paso que requiera una cuenta real; el catálogo de servicios por sí solo no demuestra paridad operativa.

### DevOps

Cobertura: Linux, Git, Docker, CI/CD, Kubernetes, Terraform, observabilidad, seguridad, GitOps y operación. Conviene fijar una ruta principal y dejar las alternativas de herramientas como comparativas.

**F04 · P1 · Compose no inicializa PostgreSQL desde cero.** [M15 T1](../web/public/content/devops/modulo-15.md#L16) usa `postgres:16` sin configuración de contraseña ni usuario, y comprueba `pg_isready -U rutaflow`. El servicio API usa `build: .` sin aportar aquí Dockerfile/contexto. La promesa de demostración desde cero no se cumple: preparar configuración local explícita y proyecto API, después demostrar la espera por salud. La imagen oficial requiere configurar autenticación al inicializar una base vacía; ver [documentación de la imagen PostgreSQL](https://github.com/docker-library/docs/blob/master/postgres/README.md).

La prueba de aceptación debe arrancar con datos nuevos, observar API/DB y repetir tras reinicio. Kubernetes 1.36 puede seguir siendo una baseline válida: la documentación consultada lo incluye entre las ramas mantenidas junto a 1.37 y 1.35; no es necesario actualizar por novedad sin motivo. [Releases de Kubernetes](https://kubernetes.io/releases/).

### JavaScript

Cobertura: lenguaje, asincronía, DOM, módulos, pruebas, TypeScript, SPA y plataforma web avanzada. Web3/ML/WASM deben explicitarse como extensiones, con resultados acordes a la profundidad enseñada.

**F05 · P1 · El bootstrap Master falla.** [M14 T1](../web/public/content/javascript/modulo-14.md#L40) solo ejecuta `npm init -y` y crea `src`; no instala TypeScript ni crea `tsconfig.json`, pero exige `npx tsc --noEmit`. Aun usando el compilador local ya instalado, se reprodujo salida de ayuda y código 1 por ausencia de proyecto/archivo. [T2](../web/public/content/javascript/modulo-14.md#L140) invoca `npm run dev` sin definir ese script: fallo reproducido `Missing script: "dev"`. T3 y otros temas repiten la preparación insuficiente.

Además, se crean carpetas `ejemplo-js-modulo-14-tema-*` pero las instrucciones escriben en `academia-web/src/...`, mientras los comandos ejecutan `src/...`. Unificar raíz, incluir manifiesto, dependencias y punto de entrada. La aceptación debe copiar literalmente cada laboratorio a una carpeta temporal, instalar versiones fijadas y comprobar el resultado descrito. El 83/83 del auditor no detectó estos bloqueos.

### Node

Cobertura: runtime, paquetes, I/O, HTTP, frameworks, datos, auth, pruebas, observabilidad, seguridad y servicios avanzados.

**F06 · P2 · Node 22+ no expresa el mínimo necesario.** [M14 T1](../web/public/content/node/modulo-14.md#L6) promete `node archivo.ts` sin flags con Node 22+. En la línea 22, la eliminación de tipos se habilitó por defecto en 22.18.0. Fijar al menos esa versión para ese camino, o usar la baseline 24 declarada por la ruta. [Documentación oficial de Node](https://nodejs.org/download/release/v22.21.0/docs/api/typescript.html).

**F07 · P1 · Federation solo aporta fragmentos de esquema.** M14 T2 declara entidades, pero no proporciona `Query.pedido`, resolvers, servidores de subgrafos ni gateway. La consulta prometida no es ejecutable con los archivos mostrados. Completar un workspace pequeño con puertos y comandos, fixture compartido por ID y prueba de una referencia inexistente. En M1 también hay bloques `json` con comentarios; distinguir anotaciones de los archivos que el alumno puede copiar.

### Angular

Cobertura: bases de plantillas/TypeScript, componentes, estado, formularios, routing, HTTP, pruebas y producción.

**F08 · P1 · Interpolación descrita como estática.** [M0 T2](../web/public/content/angular/modulo-0.md#L183), y nuevamente el cierre en L322, afirman que la interpolación solo produce texto estático. Angular la documenta como enlace dinámico: también se actualiza cuando cambia el estado. El contraste debe ser conversión a texto frente a asignación de valores a propiedades, con especial cuidado en booleanos. Añadir un test que cambie la misma señal y observe ambos enlaces. [Bindings de Angular](https://angular.dev/guide/templates/interpolation).

La academia usa Angular 21.2 y el currículo menciona 22. Son productos distintos; eso no es un bug por sí mismo. Sí hace falta fijar CLI/Node/TypeScript de los ejemplos de Angular 22: su matriz documenta TypeScript 6.0.x. No ejecutar esos ejemplos asumiendo las dependencias 5.9.x del portal. [Compatibilidad oficial](https://angular.dev/reference/versions).

### React

Cobertura: componentes, estado, hooks, datos, routing, pruebas, rendimiento, TypeScript, Server Components y Next. Hace falta una transición explícita del proyecto SPA al proyecto Next.

**F09 · P1 · Baseline de seguridad RSC desactualizada.** [M13, revisión de plataforma](../web/public/content/react/modulo-13.md#L386) y `docs/official-sources.json` consideran suficiente 19.2.1 o posterior. El aviso oficial actualizado el 26 de enero de 2026 incluye 19.2.1–19.2.3 entre las versiones afectadas de los paquetes `react-server-dom-*` y registra correcciones en 19.0.4, 19.1.5 y 19.2.4. Reescribir el mínimo por paquete/framework y enlazar el aviso vigente; “o posterior” a una versión vulnerable permite instalar otra vulnerable. Esto no implica que el portal Angular esté afectado. [Aviso oficial React](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components).

**F10 · P1 · El ejemplo de streaming no tiene sus dependencias.** [M14 T1](../web/public/content/react/modulo-14.md#L6) usa `obtenerEnvios`, `ListaEnvios` e `HistorialEnvio`, sin sus implementaciones en el ejemplo; además, `envios[0].id` presupone una lista no vacía. Los siguientes temas parten de ese proyecto. Proporcionar fixtures, componentes lento/rápido, estado vacío y comandos completos. Las correcciones previas de autorización e ISR deben conservarse, pero no completan el proyecto base.

### Java

Cobertura: lenguaje, colecciones, errores, streams, concurrencia, I/O, tipos modernos, builds, pruebas y JVM.

**F11 · P1 · Combinación de herramientas incompatible.** [M15 T2](../web/public/content/java/modulo-15.md#L61) exige JDK 25, crea wrapper Gradle 8.10 y selecciona toolchain 21, sin explicar un JDK diferente para ejecutar Gradle. El soporte oficial para ejecutar Gradle con Java 25 comienza en 9.1.0. Fijar una combinación soportada y distinguir JVM de Gradle de toolchain. [Gradle 9.1](https://docs.gradle.org/9.1.0/release-notes.html).

**F12 · P2 · El fallo de Maven no está construido.** [M15 T1](../web/public/content/java/modulo-15.md#L25) declara Jackson diferente en dos módulos pero no configura un árbol de dependencias convergente que fuerce el conflicto. `dependencyConvergence` comprueba caminos del árbol de un proyecto; tener dos hermanos independientes con versiones distintas no basta para prometer el fallo. También se invoca `./mvnw` sin crearlo y se propone `[22,)` como versión incompatible cuando el prerrequisito es JDK 25. Aportar POMs completos y un caso de conflicto determinista. [Maven Enforcer](https://maven.apache.org/enforcer/enforcer-rules/dependencyConvergence.html).

### Spring Boot

Cobertura: backend, persistencia, seguridad, configuración, integración, pruebas y producción. El foco debe pasar de fragmentos a tests de comportamiento completos.

**F13 · P1 · API SSRF incorrecta y prueba insuficiente.** [M4 T4](../web/public/content/spring-boot/modulo-4.md#L558) llama `InetAddressFilter.allowPublicAddressesOnly()`, que no aparece en la API oficial 4.1 consultada; esta expone, entre otros, `externalAddresses()`. Revisar también las fábricas HTTP usadas y compilar contra el BOM elegido. [API oficial](https://docs.spring.io/spring-boot/4.1/api/java/org/springframework/boot/http/client/InetAddressFilter.html).

El controller convierte cualquier `ResourceAccessException` en “URL no permitida”, y el test solo espera 400. Una conexión fallida sin filtro podría dar el mismo resultado: el test no acredita que se bloqueó antes de conectar. Usar transporte controlado o servidor local de laboratorio, confirmar la causa concreta y cero conexiones al destino rechazado. No usar metadatos reales como demostración de fallo. Cierre: filtro activado bloquea; filtro retirado alcanza exclusivamente el servidor de prueba y hace fallar la aserción.

### Kotlin Multiplatform

Cobertura: Kotlin compartido, datos, concurrencia, UI, interoperabilidad y distribución. Requiere una matriz explícita de Kotlin/Gradle/Xcode y de plataformas realmente probadas.

**F14 · P1 · El contrato Kotlin–Swift omite la exportación de errores.** [M8 T3](../web/public/content/kotlin-multiplatform/modulo-8.md#L134) promete resultado o error por callback y pide simular un error, pero no proporciona la función Kotlin con `@Throws`. Sin esa declaración, las funciones suspend solo propagan `CancellationException` como NSError; otras excepciones no controladas pueden terminar el proceso. Añadir ambos lados, tipo de retorno no nulo y error declarado; no basta con cambiar la continuation de Swift. Swift 5.5+ también permite llamar funciones suspend exportadas como async, por lo que conviene explicar ambos caminos. [Interop oficial](https://kotlinlang.org/docs/native-objc-interop.html), [contrato Throws](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-throws/).

Kotlin 2.4 existe y hay documentación de 2.4.20; precisar el parche de los laboratorios y su compatibilidad, sin convertir cada novedad en requisito de entrada. [Kotlin 2.4.20](https://kotlinlang.org/docs/whatsnew2420.html).

### Android

Cobertura: Kotlin, ciclo de vida, Compose, navegación, estado, red, Room, DI, tareas de fondo, pruebas y publicación.

**F15 · P1 · La prueba no corresponde al componente del curso.** [M14 T1](../web/public/content/android/modulo-14.md#L64) busca `Contador: 0`, botón `Incrementar` y `Contador: 1`. La implementación de `PantallaContador` en [M2](../web/public/content/android/modulo-2.md#L277) solo muestra `Volátil: ...` y `Persistente: ...`, sin botón. La prueba no puede pasar contra ese componente. Definir la pantalla exacta y enlazarla desde el tema.

**F16 · P1 · Se mezclan pruebas instrumentadas y locales.** M14 coloca el archivo en `src/androidTest` y después promete ejecutarlo con `testDebugUnitTest`/Robolectric. Este último requiere el source set local correspondiente y configuración adicional; agregar una dependencia no mueve el archivo. Además, separar el filtrado del runner instrumentado de `--tests` usado en tareas unitarias. Dar instrucciones completas para cada modalidad. [Pruebas Android desde CLI](https://developer.android.com/studio/test/command-line).

### iOS

Cobertura: Swift, SwiftUI, estado, navegación, concurrencia, red, SwiftData, Combine, arquitectura, pruebas y distribución.

**F17 · P1 · El proyecto que se cita no está en el repositorio.** [M14 T1](../web/public/content/ios/modulo-14.md#L49) afirma que `EnviosViewModel.cargar()` vive en `examples/rutaflow/ios/RutaFlowApp/ViewModels/EnviosViewModel.swift`; esa ruta no existe. Otras referencias a servicios/modelos bajo RutaFlowApp tampoco existen. Entregar un proyecto compilable o marcar claramente los archivos como trabajo a crear y aportar su implementación.

**F18 · P2 · La prueba no demuestra cancelación a mitad de carga.** M14 T1 crea una Task y la cancela inmediatamente, sin sincronización con el inicio de la operación. El test puede cubrir cancelación antes de comenzar, no la respuesta tardía que promete. Usar fake controlado con señal de inicio, cancelar después y liberar la respuesta verificando que no cambia el estado. El título dice XCTest pero el código usa `@Test`/`#expect` de Swift Testing; incluir `import Testing` y ajustar el nombre. [Swift Testing en Swift 6](https://www.swift.org/blog/announcing-swift-6/).

### Flutter

Cobertura: Dart, widgets, layout, navegación, estado, red, persistencia, plataformas, animación, pruebas, publicación y entregas.

**F19 · P1 · Archivos ARB copiados literalmente no son JSON válido.** [M15 T5](../web/public/content/flutter/modulo-15.md#L204) introduce comentarios `// lib/l10n/...` dentro de ambos bloques JSON. Se comprobó el fallo del parser. Sacar las rutas fuera del bloque e incluir configuración de generación, delegates y locales en un ejemplo completo.

**F20 · P2 · pumpAndSettle se presenta como espera general del resultado.** [M15 T2](../web/public/content/flutter/modulo-15.md#L58) promete que esperar frames elimina la intermitencia de la búsqueda. La API bombea hasta que no quedan frames programados; no garantiza que cualquier Future externo haya terminado y una animación infinita provoca timeout. Implementar el repositorio fake descrito, controlar su respuesta y mostrar dos casos separados: fin de animación y fin de operación. [API oficial](https://api.flutter.dev/flutter/flutter_test/WidgetController/pumpAndSettle.html).

Los cambios previos de firma Android aportan pasos concretos; falta validarlos construyendo el artefacto en el toolchain elegido. No se ejecutó esa construcción en esta revisión.

### RutaFlow

Cobertura: dominio, datos, backend, web, móvil, geografía, conciliación y operación. Es una buena ruta transversal, pero debe distinguir implementaciones disponibles de arquitectura propuesta.

**F21 · P1 · La conciliación no enlaza con el fixture.** [M6 T2](../web/public/content/rutaflow/modulo-6.md#L209) crea una tabla BIGSERIAL e inserta el primer recaudo; el Java siguiente fija ID `501L`. En una base nueva el primer ID es 1, por lo que ejecutar el ajuste impreso con referencia 501 viola la clave foránea. Capturar `INSERT ... RETURNING id` y pasarlo al caso de uso. Además, Java concatena `envioId` en SQL: usar parámetros al convertirlo en persistencia real.

La tabla se denomina append-only, pero el DDL por sí mismo no prohíbe UPDATE/DELETE ni obliga a que todo ajuste tenga referencia no nula. Decidir qué garantiza el esquema, qué garantiza el rol de aplicación y qué queda como convención. Aceptación: recaudo y ajuste reales, vínculo válido, permisos verificados y repetición sin duplicar el ajuste. Esto no afecta a la corrección previa del script de backup, que es un laboratorio diferente.

## Problemas transversales de evaluación

**F22 · P1 · Los nombres de los estados exceden lo que se verifica.** `runCommand` acepta palabras como `node`, incluso en prosa; `code` acepta cualquier fence no Mermaid. Un tema puede marcarse practicable aunque solo compruebe una versión. El propio JavaScript M14 demuestra que también se puede obtener 16/16 sin proyecto ejecutable. Separar «estructura presente», «revisión técnica», «ejemplo ejecutado» y «prueba de aprendizaje verificada» con evidencias distintas.

**F23 · P2 · Informes inconsistentes y falsos negativos.** El informe de recorrido guardado enumera 913 temas; el inventario actual contiene 931. Su regex de prerrequisitos no acepta todas las formulaciones de las lecciones y la de fallo no reconoce todas las variantes. El auditor de siete pasos exige empezar de cero incluso en temas acumulativos y favorece terminal sobre Xcode. No usar sus porcentajes para ordenar calidad sin inspección manual. Conservar una única identidad de tema y declarar si el ejemplo es independiente o acumulativo.

El informe de código/visuales registra 216 diagramas ASCII y 648 coincidencias con su lista de fuentes oficiales. ASCII no significa error didáctico y una fuente que no coincide con la lista no significa ausencia de fuente. Priorizar diagramas ilegibles y afirmaciones sin respaldo, antes de convertir todo por formato.

## Versiones y fuentes

El registro declara revisión de julio de 2026. Su vigencia temporal no verifica que la API escrita exista ni que el parche mínimo siga siendo seguro. La revisión encontró un problema concreto en RSC y otro en la combinación Java/Gradle. Angular 22, Kotlin 2.4 y Flutter 3.44 tienen documentación oficial consultable; su existencia no acredita cada ejemplo del curso. [Flutter 3.44](https://docs.flutter.dev/release/release-notes/release-notes-3.44.0).

No se certificó cada versión de todos los SDK y proveedores. El acceso a OpenJDK 27 respondió 403 y la especificación completa ECMA-262 excedió el límite del lector; quedan pendientes de contraste puntual. Para Cloud, revisar compatibilidad por operación/servicio del emulador, no usar una fecha global como sustituto. Para iOS y Android, fijar también Xcode/SDK, deployment target/minSdk y dispositivo de validación.

## Orden de corrección propuesto

1. Corregir garantías equivocadas: RSC, SSRF, Kotlin–Swift, interpolación y conciliación.
2. Desbloquear prácticas: bootstrap JS/Next, Gradle/JDK, Compose, pruebas Android, proyecto iOS y ARB.
3. Hacer cada práctica repetible: fixtures, limpieza limitada al laboratorio, respuestas controladas, comandos y salida real.
4. Revisar los 438 temas con señales metodológicas pendientes usando el inventario, aceptando dependencias entre temas cuando estén declaradas. No rellenar apartados con frases genéricas.
5. Añadir cobertura de ejecución por stack: un proyecto mínimo versionado y CI adecuado, y progresivamente cada laboratorio. Los tests del portal deben seguir siendo una comprobación distinta.

Un tema queda cerrado cuando sus requisitos son precisos, el código coincide con la explicación, los pasos producen el resultado, el fallo deliberado se reproduce, la corrección lo resuelve y el alumno puede repetirlo con datos de laboratorio. Esta revisión deja los hallazgos documentados; no modifica las lecciones ni considera resueltas estas incidencias.
