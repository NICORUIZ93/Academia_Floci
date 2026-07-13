# Módulo 4: CI — pipelines automatizados

## Sílabo

**Objetivo general**

Diseñar pipelines de integración continua que construyan, prueben y validen automáticamente cada cambio de código, usando matrices de build, caché de dependencias y artifacts, con CI obligatorio como norma técnica, no social.

**Objetivos específicos**

1. Crear un workflow de CI que ejecute lint y tests en cada pull request.
2. Configurar caché de dependencias y medir su impacto en la velocidad del pipeline.
3. Configurar una matriz de build que ejecute pruebas en múltiples versiones de runtime.
4. Publicar artifacts (como reportes de cobertura) desde una ejecución de pipeline.
5. Configurar el repositorio para que CI sea obligatorio antes de fusionar un pull request.

**Contenido**

- Jobs, steps y matrices de build.
- Caché de dependencias en CI.
- Artifacts y reportes de cobertura.
- Pipelines como código (GitHub Actions/GitLab CI).

**Evaluación**

Un laboratorio que construye un pipeline de CI completo con matriz, caché y artifacts, y tres ejercicios de evaluación sobre diseño de jobs, diagnóstico de caché ineficaz, y política de CI obligatorio.

---

## Contenido teórico

### Tema 1: Jobs, steps y matrices de build

**Conceptos clave:** job, step, ejecución paralela, `strategy.matrix`, runner.

Un pipeline de CI se organiza en jobs, cada uno ejecutándose en su propio runner (una máquina virtual o contenedor aislado provisto por la plataforma de CI), y cada job se compone de una secuencia de steps que se ejecutan en orden dentro de ese mismo runner. Por defecto, distintos jobs dentro de un mismo workflow se ejecutan en paralelo entre sí (a menos que se declare explícitamente una dependencia entre ellos), mientras que los steps dentro de un mismo job se ejecutan siempre de forma secuencial, cada uno dependiendo de que el anterior haya terminado (y, típicamente, de que haya tenido éxito).

Una matriz de build (`strategy.matrix` en GitHub Actions) permite ejecutar el mismo job múltiples veces, una vez por cada combinación de valores especificados, sin duplicar la definición del job manualmente para cada variante. Por ejemplo, definir una matriz con `node-version: [20, 22]` ejecuta automáticamente dos instancias paralelas del mismo job de pruebas, una con cada versión de Node.js especificada, verificando que el código funciona correctamente en ambos entornos sin necesidad de escribir dos jobs casi idénticos por separado. Una matriz puede combinar múltiples dimensiones a la vez (por ejemplo, versión de runtime y sistema operativo), generando automáticamente el producto cartesiano de todas las combinaciones especificadas.

Este paralelismo —tanto entre jobs distintos como entre las distintas combinaciones de una matriz— es lo que permite que un pipeline de CI bien diseñado reporte resultados en minutos en vez de en el tiempo acumulado de ejecutar cada verificación secuencialmente una tras otra. Diseñar bien la separación de jobs (por ejemplo, un job de lint independiente de un job de tests, ejecutándose en paralelo) es una decisión de diseño de pipeline que afecta directamente cuánto tiempo espera un desarrollador desde que abre un pull request hasta obtener retroalimentación completa sobre si su cambio es correcto.

Un detalle práctico importante es que, aunque los jobs corren en paralelo por defecto, es común que algunos jobs necesiten depender explícitamente de que otro haya terminado con éxito antes de ejecutarse (por ejemplo, un job de despliegue que solo debe correr después de que el job de tests haya pasado); esto se declara explícitamente con una cláusula de dependencia entre jobs, convirtiendo el pipeline en un grafo dirigido de dependencias en vez de una simple lista paralela.

**Analogía:** los jobs de un pipeline son como distintos equipos de inspección trabajando en paralelo sobre un mismo producto (uno revisa el estilo de la caja, otro prueba su funcionamiento, otro mide su peso), cada uno pudiendo terminar en un tiempo distinto sin esperar a los demás salvo que uno dependa explícitamente del resultado de otro. Una matriz de build es como pedirle al mismo equipo de pruebas de funcionamiento que repita exactamente la misma prueba sobre varias versiones distintas del producto (una con batería A, otra con batería B), automáticamente y en paralelo, sin tener que redactar instrucciones de prueba separadas para cada batería.

**¿Por qué es importante?** Diseñar bien la estructura de jobs, steps y matrices de un pipeline es lo que determina si CI se siente como una herramienta rápida que da confianza inmediata sobre cada cambio, o como un obstáculo lento que el equipo empieza a evitar o ignorar por la frustración de esperar demasiado por retroalimentación.

**Diagrama:**

```
Workflow CI
├── Job "lint"                    (corre en paralelo con "test")
│    └── steps: checkout, instalar deps, ejecutar linter
└── Job "test" (matriz: node 20, node 22)
     ├── Instancia node-20: checkout, instalar deps, correr tests
     └── Instancia node-22: checkout, instalar deps, correr tests
          (ambas instancias corren en paralelo entre sí también)
```

### Tema 2: Caché de dependencias en CI

**Conceptos clave:** caché de `node_modules` (o equivalente), clave de caché basada en el lockfile, invalidación de caché.

Instalar dependencias desde cero (`npm ci`, `pip install`, o el equivalente de cualquier ecosistema) en cada ejecución de un pipeline de CI puede consumir una porción significativa del tiempo total del pipeline, especialmente en proyectos con muchas dependencias. El caché de dependencias en CI resuelve esto guardando el resultado de esa instalación (por ejemplo, la carpeta `node_modules` completa) entre ejecuciones, asociado a una clave de caché derivada típicamente del contenido del archivo de lock de dependencias (`package-lock.json`, `poetry.lock`, o equivalente).

Mientras ese archivo de lock no cambie entre una ejecución y la siguiente, la plataforma de CI puede restaurar directamente la caché guardada en vez de reinstalar todo desde cero, ahorrando ese tiempo en cada ejecución posterior. En cuanto el archivo de lock cambia (porque se añadió, actualizó o eliminó una dependencia), la clave de caché derivada de su contenido también cambia, lo que automáticamente invalida la caché anterior y fuerza una instalación completa nueva, exactamente el comportamiento correcto: quieres reutilizar caché cuando las dependencias son idénticas, pero necesitas una instalación real y actualizada cuando cambiaron.

Este mismo principio de "clave de caché derivada del contenido de lo que se está cacheando" es conceptualmente el mismo mecanismo de invalidación de capas que estudiaste con Docker en el Módulo 2 de este track: en ambos casos, el sistema detecta automáticamente cuándo el contenido relevante cambió y solo entonces paga el coste de recalcular, reutilizando el resultado anterior en cualquier otro caso donde el contenido de entrada sea idéntico.

Configurar caché de dependencias correctamente (por ejemplo, con `cache: 'npm'` como opción directa de la acción `setup-node` en GitHub Actions, que gestiona automáticamente tanto la clave de caché como su restauración) es una de las optimizaciones de pipeline más simples de implementar y con mayor impacto proporcional en la velocidad total del pipeline, especialmente en proyectos donde la instalación de dependencias representa una fracción significativa del tiempo total de cada ejecución.

**Analogía:** el caché de dependencias en CI es como no tener que volver a comprar y desempacar todas las herramientas de un taller cada vez que empiezas un nuevo trabajo, siempre que la lista de herramientas necesarias (el lockfile) no haya cambiado desde la última vez: simplemente reutilizas el mismo juego de herramientas ya organizado. Si la lista de herramientas cambia (añades una herramienta nueva a tu inventario), entonces sí necesitas actualizar el juego completo antes de empezar a trabajar.

**¿Por qué es importante?** En pipelines que se ejecutan docenas o cientos de veces al día en un equipo activo, incluso un ahorro de un minuto por ejecución gracias al caché de dependencias se traduce en un ahorro acumulado sustancial de tiempo de espera para todo el equipo, además de reducir el consumo de recursos de cómputo del propio sistema de CI.

**Diagrama:**

```
Ejecución 1 (lockfile: hash-A)          Ejecución 2 (lockfile: hash-A, sin cambios)
   │                                        │
   ▼                                        ▼
npm ci (instalación completa)          restaura caché con clave "hash-A"
   │                                        │
   ▼                                        ▼
guarda caché con clave "hash-A"        salta la instalación completa (rápido)

Ejecución 3 (lockfile: hash-B, cambió)
   │
   ▼
clave "hash-B" no existe en caché ──▶ npm ci (instalación completa de nuevo)
```

### Tema 3: Artifacts y reportes de cobertura

**Conceptos clave:** artifact, reporte de cobertura, retención de artifacts, trazabilidad de una ejecución.

Un artifact es cualquier archivo o conjunto de archivos generado durante la ejecución de un pipeline que se sube y queda disponible para descarga directamente desde la página de esa ejecución específica, sin necesidad de publicarlo en ningún otro sistema externo. Los casos de uso más comunes incluyen reportes de cobertura de pruebas (generados por herramientas de testing con la opción `--coverage`), binarios compilados, o logs detallados de una ejecución que se quiere conservar más allá de lo que la interfaz estándar de logs del pipeline muestra.

Subir un reporte de cobertura como artifact permite a cualquier persona del equipo revisar exactamente qué líneas de código quedaron o no cubiertas por pruebas en esa ejecución específica, sin tener que reproducir la ejecución de pruebas localmente en su propia máquina. Esto es especialmente valioso al revisar un pull request: un revisor puede consultar directamente el reporte de cobertura de esa ejecución concreta para confirmar que el código nuevo introducido efectivamente está cubierto por pruebas, en vez de depender únicamente de la palabra del autor del cambio.

Los artifacts tienen, típicamente, un periodo de retención configurable (por ejemplo, 30, 60 o 90 días) después del cual la plataforma de CI los elimina automáticamente para no acumular almacenamiento indefinidamente; esto es adecuado para artifacts de diagnóstico o revisión temporal, pero no debe confundirse con almacenamiento permanente: cualquier artifact que necesite conservarse indefinidamente (como una versión de release oficial) debe publicarse en un lugar de almacenamiento duradero y explícitamente diseñado para eso, como un registry de contenedores (Módulo 2) o un sistema de gestión de releases dedicado.

Más allá de la cobertura de pruebas, los artifacts también son el mecanismo típico para pasar el resultado construido de un job a otro job posterior dentro del mismo pipeline (por ejemplo, un job de "build" que compila la aplicación y sube el binario resultante como artifact, para que un job posterior de "deploy" lo descargue y lo despliegue), permitiendo que jobs distintos —que corren en runners aislados y no comparten sistema de archivos entre sí— compartan resultados de forma explícita y trazable.

**Analogía:** un artifact es como el expediente de evidencia que queda archivado y disponible para consulta después de una inspección, en vez de que el inspector simplemente diga verbalmente "todo está bien" sin dejar ningún registro consultable de los detalles específicos que revisó. Cualquiera que necesite verificar los detalles después puede pedir ese expediente concreto, en vez de tener que repetir la inspección completa desde cero.

**¿Por qué es importante?** Los artifacts hacen que el proceso de CI sea trazable y auditable: cualquier decisión sobre si un cambio está listo (¿la cobertura es suficiente? ¿el binario compilado es el correcto?) puede verificarse consultando la evidencia concreta de esa ejecución específica, en vez de depender de confianza ciega en que "el pipeline pasó".

**Diagrama:**

```
Job "test"                                     Job "deploy" (posterior)
┌────────────────────────┐                   ┌────────────────────────┐
│ ejecuta tests con --coverage │                │ descarga el artifact      │
│ sube "coverage/" como           │  ────────▶   │ "binario-compilado"       │
│ artifact                          │                │ generado por el job        │
└────────────────────────┘                   │ "build" anterior              │
                                                └────────────────────────┘
```

### Tema 4: Pipelines como código (GitHub Actions/GitLab CI)

**Conceptos clave:** pipeline declarativo en YAML, versionado del propio pipeline, disparadores (`on`).

Un pipeline como código significa que la definición completa del proceso de CI/CD —qué jobs existen, qué steps ejecuta cada uno, bajo qué condiciones se disparan— vive en un archivo de texto (típicamente YAML) versionado junto al resto del código del proyecto, en vez de configurarse manualmente a través de una interfaz gráfica de administración separada del repositorio. Esto significa que cualquier cambio al proceso de CI/CD pasa por el mismo flujo de revisión (pull request, historial de cambios, posibilidad de revertir) que cualquier otro cambio de código del proyecto.

GitHub Actions y GitLab CI son dos de las plataformas más usadas para implementar este enfoque, cada una con su propia sintaxis específica de YAML pero compartiendo los mismos conceptos fundamentales de jobs, steps, y disparadores. Un disparador (la clave `on` en GitHub Actions) especifica bajo qué evento del repositorio se ejecuta el workflow: en cada `pull_request`, en cada push a una rama específica, en un horario programado (usando sintaxis cron, la misma que estudiaste en el Módulo 0 de este track), o manualmente bajo demanda.

Versionar el pipeline como código junto al proyecto tiene una consecuencia práctica importante: si necesitas reproducir exactamente cómo se construía y probaba una versión específica del proyecto hace seis meses, el archivo de definición del pipeline de esa época está disponible en el historial de Git de esa misma versión del código, en vez de haber sido sobrescrito silenciosamente por cambios posteriores en una configuración externa no versionada. Esto también permite experimentar con cambios al pipeline en una rama de funcionalidad, probándolos de forma aislada antes de fusionarlos a la rama principal, exactamente igual que cualquier otro cambio de código.

Esta filosofía de "todo como código, todo versionado" que aplicas aquí al pipeline de CI/CD es la misma filosofía que vas a aplicar, con su propia herramienta específica, a la infraestructura completa en el Módulo 8 de este track con Terraform: tratar la configuración operativa (ya sea un pipeline o infraestructura de servidores) con el mismo rigor de control de versiones que el código de aplicación en sí.

**Analogía:** un pipeline como código es como tener la receta completa de un plato escrita y archivada junto con el resto de la documentación del restaurante, versionada y con historial de cambios, en vez de que la receta viva únicamente en la memoria de un cocinero específico o en una pizarra que se borra y reescribe sin dejar rastro de cómo era antes.

**¿Por qué es importante?** Tratar el pipeline de CI/CD como código versionado, en vez de configuración manual en una interfaz separada, aplica al proceso de entrega de software la misma disciplina de trazabilidad, revisión y reversibilidad que ya das por sentada para el código de la aplicación, cerrando una brecha común entre "cómo se ve el código" y "cómo realmente se construye y despliega ese código en la práctica".

**Diagrama:**

```
.github/workflows/ci.yml   (versionado en el repositorio, junto al código)
   │
   │  cambios al pipeline pasan por pull request,
   │  revisión, y quedan en el historial de Git
   ▼
on: [pull_request]  ──▶  dispara el workflow en cada PR
on: schedule (cron)  ──▶  dispara el workflow en un horario programado
```

---

## Laboratorio práctico

**Objetivo del laboratorio:** crear un workflow de GitHub Actions que ejecute lint y tests en cada pull request, con caché de dependencias, una matriz de dos versiones de runtime, y publicación de un reporte de cobertura como artifact.

**Requisitos previos:** un repositorio en GitHub con un proyecto Node.js simple (o el lenguaje de tu preferencia, adaptando los comandos), con scripts de `lint` y `test` ya configurados en su `package.json`.

| Paso | Acción | Configuración | Explicación | Resultado esperado |
|---|---|---|---|---|
| 1 | Crear el archivo del workflow | Crea `.github/workflows/ci.yml` con `name: CI` y `on: [pull_request]` | Define cuándo se dispara el pipeline | El archivo existe en la ruta correcta que GitHub Actions reconoce automáticamente |
| 2 | Definir el job con matriz | Añade un job `test` con `strategy: matrix: node-version: [20, 22]` y `runs-on: ubuntu-latest` | Ejecutará el job dos veces, una por cada versión de Node especificada | La definición del job incluye la matriz correctamente |
| 3 | Añadir los steps de checkout y setup con caché | `uses: actions/checkout@v4`, seguido de `uses: actions/setup-node@v4` con `node-version: '${{ matrix.node-version }}'` y `cache: 'npm'` | Descarga el código y configura el runtime con caché automático de dependencias | Ambos steps se definen sin errores de sintaxis YAML |
| 4 | Añadir los steps de instalación, lint y test | `run: npm ci`, `run: npm run lint`, `run: npm test -- --coverage` | Instala dependencias (aprovechando caché si aplica) y ejecuta las validaciones | Los tres steps se definen en orden secuencial correcto |
| 5 | Añadir la publicación del artifact de cobertura | `uses: actions/upload-artifact@v4` con `name: coverage` y `path: coverage/` | Sube el reporte de cobertura generado por el step anterior | El artifact queda definido para subirse tras una ejecución exitosa de tests |
| 6 | Abrir un pull request de prueba | Crea una rama, haz un cambio menor, y abre un PR contra la rama principal | Dispara el workflow recién configurado | GitHub muestra el workflow ejecutándose en la página del PR |
| 7 | Verificar la ejecución en paralelo de la matriz | Observa la página de la ejecución del workflow | Deberías ver dos instancias del job `test`, una por cada versión de Node | Ambas instancias aparecen ejecutándose (o habiendo terminado) de forma independiente |
| 8 | Descargar el artifact de cobertura | Desde la página de la ejecución completada, descarga el artifact `coverage` | Confirma que el reporte de cobertura quedó disponible como se esperaba | El archivo descargado contiene el reporte de cobertura generado durante la ejecución |
| 9 | Provocar un fallo intencional | Rompe deliberadamente un test y haz push del cambio al mismo PR | Verifica que el pipeline efectivamente detecta y reporta el fallo | El workflow reporta estado fallido, visible directamente en la página del PR |

**Verificación:** el laboratorio se considera exitoso si el workflow se ejecuta automáticamente al abrir el PR, si la matriz efectivamente ejecuta dos instancias paralelas (una por versión de Node), si el artifact de cobertura queda disponible para descarga, y si romper un test intencionalmente hace que el pipeline reporte fallo de forma visible en el PR.

**Errores comunes y soluciones**

- **El workflow no se dispara al abrir el pull request.** Verifica que el archivo está exactamente en la ruta `.github/workflows/` (con ese nombre de carpeta exacto) y que el YAML no tiene errores de sintaxis que impidan a GitHub Actions siquiera reconocerlo como un workflow válido.
- **`cache: 'npm'` no parece acelerar ejecuciones sucesivas.** Confirma que tu proyecto tiene un `package-lock.json` (u otro lockfile equivalente) versionado en el repositorio; la caché de `setup-node` deriva su clave del contenido de ese archivo, y sin él, no tiene una base estable para determinar cuándo reutilizar la caché.
- **El artifact de cobertura aparece vacío o no se genera.** Verifica que el comando de test realmente genera el reporte en la ruta `coverage/` especificada en `path`, y que el step de test se ejecutó exitosamente antes del step de subida (si el test falla, el step de subida de artifact podría no ejecutarse, dependiendo de la configuración de condición del step).
- **La matriz ejecuta las combinaciones de forma secuencial en vez de paralela.** Esto normalmente indica un límite de runners concurrentes disponibles en tu cuenta o plan de GitHub Actions, no un error de configuración; revisa los límites de concurrencia de tu plan si esto es un problema recurrente.

---

## Ejercicios de evaluación

### Ejercicio 1: Diseñar la separación de jobs

**Enunciado:** estás diseñando un pipeline para un proyecto que necesita ejecutar linting (rápido, unos 10 segundos), pruebas unitarias (moderado, 2 minutos) y pruebas de integración contra una base de datos real (lento, 8 minutos). ¿Los pondrías todos en un único job secuencial, o los separarías en jobs distintos? Justifica tu respuesta.

**Solución esperada:** separarlos en jobs distintos que corran en paralelo (linting, pruebas unitarias, y pruebas de integración cada uno como su propio job), en vez de un único job secuencial. Esto permite que el linting rápido reporte su resultado casi inmediatamente sin esperar a que termine el job más lento de pruebas de integración, dando retroalimentación más rápida sobre los problemas más simples de detectar, mientras las verificaciones más costosas siguen corriendo en paralelo sin bloquear esa retroalimentación temprana.

**Criterios de éxito:**
- Recomienda separar en jobs paralelos, no un único job secuencial.
- La justificación menciona la retroalimentación más rápida sobre problemas simples (lint) sin esperar a las verificaciones más lentas.

### Ejercicio 2: Diagnosticar caché ineficaz

**Enunciado:** un compañero configuró `cache: 'npm'` en su workflow, pero reporta que cada ejecución sigue tardando lo mismo que sin caché, como si nunca se estuviera reutilizando. Menciona al menos una causa probable, relacionada con el Tema 2.

**Solución esperada:** una causa probable es que el proyecto no tiene un `package-lock.json` versionado (o lo tiene, pero cambia en cada ejecución por alguna razón, como generarse dinámicamente en un step previo), lo que le impide a la caché tener una clave estable derivada de su contenido; sin un lockfile estable, la clave de caché cambia en cada ejecución, forzando efectivamente una instalación completa cada vez, como si no hubiera caché en absoluto.

**Criterios de éxito:**
- Identifica la ausencia (o inestabilidad) del lockfile como causa probable de la caché ineficaz.
- Conecta explícitamente esto con el mecanismo de clave de caché derivada del contenido del lockfile, del Tema 2.

### Ejercicio 3: Justificar CI obligatorio

**Enunciado:** un miembro del equipo argumenta que "confiamos en que cada desarrollador corra los tests localmente antes de hacer push, así que no necesitamos bloquear técnicamente los merges sin CI en verde". Explica por qué esta política, basada solo en confianza social, es más frágil que hacer CI obligatorio a nivel técnico del repositorio.

**Solución esperada:** depender de que cada persona recuerde y efectivamente ejecute las pruebas localmente antes de cada push es una norma social, no una garantía técnica: basta con que una sola persona lo olvide una sola vez (por prisa, distracción, o simplemente asumir que "seguro está bien") para que código roto llegue a la rama principal sin que nadie lo detecte a tiempo. Configurar el repositorio para bloquear técnicamente cualquier fusión de pull request mientras el pipeline de CI no reporte éxito convierte esa protección en una regla imposible de saltarse por accidente u olvido, independientemente de la disciplina individual de cada persona en un momento dado.

**Criterios de éxito:**
- Explica que una norma social depende de que nadie la olvide nunca, mientras que una regla técnica no depende de la memoria o disciplina individual.
- Menciona explícitamente el riesgo de que basta un solo descuido para que código roto llegue a la rama principal bajo el enfoque solo social.

---

## Resumen del módulo

**Puntos clave**

- Los jobs de un pipeline corren en paralelo por defecto; los steps dentro de un job son secuenciales; las matrices ejecutan el mismo job múltiples veces con combinaciones distintas de parámetros.
- El caché de dependencias, con una clave derivada del contenido del lockfile, evita reinstalar dependencias en cada ejecución mientras estas no cambien.
- Los artifacts hacen que los resultados de una ejecución (reportes de cobertura, binarios) queden disponibles para consulta y para pasar información entre jobs distintos.
- Tratar el pipeline como código versionado, junto al proyecto, aplica al proceso de CI/CD la misma trazabilidad y revisión que ya se aplica al código de aplicación.
- Hacer CI obligatorio a nivel técnico del repositorio convierte "no romper la rama principal" en una regla imposible de saltarse, en vez de depender de la disciplina individual de cada persona.

**Conceptos aprendidos**

- Jobs, steps, ejecución paralela y matrices de build.
- Caché de dependencias y su mecanismo de invalidación basado en el lockfile.
- Artifacts como mecanismo de trazabilidad y de paso de información entre jobs.
- Pipelines como código versionado, con GitHub Actions y GitLab CI como ejemplos concretos.

**Próximos pasos**

En el Módulo 5 vas a diseñar estrategias de despliegue (CD) que lleven código validado por CI a producción sin downtime, con capacidad de revertir en segundos si algo sale mal.

**Recursos adicionales**

- Documentación oficial de GitHub Actions: sintaxis completa de workflows, matrices, caché y artifacts.
- Documentación oficial de GitLab CI/CD como alternativa comparable.
- Guías de buenas prácticas de diseño de pipelines publicadas por ambas plataformas.
