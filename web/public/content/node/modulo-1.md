# Módulo 1: Módulos, npm/pnpm y gestión de dependencias

## Sílabo

**Objetivo general**

Gestionar dependencias de un proyecto Node de forma reproducible, entendiendo exactamente qué instala cada comando, cómo funcionan los lockfiles, y cómo estructurar un monorepo con workspaces.

**Objetivos específicos**

1. Interpretar `package.json` y las reglas de semver (`^`, `~`, versión exacta).
2. Explicar el propósito de un lockfile y la diferencia entre `npm install` y `npm ci`.
3. Configurar un monorepo mínimo con workspaces de npm/pnpm.
4. Usar scripts de ciclo de vida (`postinstall`, entre otros).

**Contenido**

- `package.json` y semver.
- Lockfiles e instalación reproducible.
- Workspaces (monorepo) con npm/pnpm.
- Scripts de ciclo de vida.

**Evaluación**

Un monorepo con dos paquetes propios enlazados vía workspaces, más tres ejercicios de evaluación.

---

## Comienza desde cero: prepara este capítulo

Este recorrido parte de una carpeta vacía. Al finalizar tendrás **Un monorepo con dos paquetes propios enlazados vía workspaces, más tres ejercicios de evaluación.** No avances ejecutando comandos que no comprendes: primero identifica la entrada, la transformación y la evidencia que comprobará el resultado.

### 1. Comprueba las herramientas

Los comandos funcionan en macOS, Linux y WSL. En PowerShell usa el equivalente indicado por la herramienta.

```bash
node --version
npm --version
git --version
```

Si un comando no existe, detente e instala esa herramienta desde su sitio oficial. Cierra y abre la terminal después de modificar `PATH`. Las versiones deben ser compatibles entre sí antes de crear archivos.

### 2. Crea o recupera el proyecto del track

```bash
mkdir -p academia-labs/node-api/src
cd academia-labs/node-api
npm init -y
npm install fastify
npm install -D typescript tsx @types/node
git init
```

Trabaja dentro de `academia-labs/node-api`. Si ya existe, no lo vuelvas a generar: entra en la carpeta, confirma `git status` y continúa sobre una rama propia.

### 3. Ubica cada tema antes de escribir

```text
academia-labs/node-api/
├─ src/
│  └─ module-1/
├─ tests/
├─ docs/decisions/
├─ evidence/module-1/
└─ README.md
```

| Tema | Archivo o decisión | Evidencia mínima |
|---|---|---|
| 1. package.json y semver | `src/module-1/topic-1-package-json-y-semver.ts` | prueba + salida observable |
| 2. Lockfiles e instalación reproducible | `src/module-1/topic-2-lockfiles-e-instalacion-reproducible.ts` | prueba + salida observable |
| 3. Workspaces — monorepos con npm/pnpm | `src/module-1/topic-3-workspaces-monorepos-con-npm-pnpm.ts` | prueba + salida observable |
| 4. Scripts de ciclo de vida | `src/module-1/topic-4-scripts-de-ciclo-de-vida.ts` | prueba + salida observable |

Un ejemplo técnico vive en el archivo indicado y debe tener una prueba. Un tema conceptual vive en `docs/decisions/`: compara opciones usando restricciones medibles; no escribas código decorativo solo para llenar espacio.

### 4. Ejecuta una línea base

Desde `academia-labs/node-api`:

```bash
npm test && npm run dev
```

**Resultado esperado:** el comando reconoce el proyecto y termina sin errores antes de introducir el cambio del capítulo. Después del incremento, la evidencia debe demostrar: **Un monorepo con dos paquetes propios enlazados vía workspaces, más tres ejercicios de evaluación.**

Si falla la línea base, no continúes. Localiza el primer mensaje que indique archivo, línea o dependencia; formula una causa y compruébala con un cambio pequeño.

### 5. Provoca un fallo y recupérate

Envía una entrada inválida o desconecta una dependencia; verifica estado HTTP, cuerpo y log con contexto. Guarda en `evidence/module-1/` el comando, la salida relevante, tu hipótesis y la corrección. Revierte únicamente el cambio deliberado; no borres todo el proyecto para ocultar la causa.

### 6. Conecta el capítulo con RutaFlow

Aplica el aprendizaje de **Módulos, npm/pnpm y gestión de dependencias** a un incremento vertical de RutaFlow. Define qué componente produce el dato, qué contrato lo transporta, quién lo consume y cómo observarás un fallo. La entrega final incluye archivo o decisión, prueba, salida, error corregido y una limitación que todavía validarías en producción.

---

## Contenido teórico

### Tema 1: package.json y semver

**Conceptos clave:** versionado semántico, rangos de versión, `dependencies` frente a `devDependencies`.

`package.json` es el archivo de manifiesto central de cualquier proyecto Node, declarando su nombre, versión, dependencias y scripts. El versionado semántico (semver) estructura los números de versión como `MAYOR.MENOR.PARCHE`, con una convención bien establecida sobre qué tipo de cambio justifica incrementar cada parte: un incremento de versión mayor señala cambios incompatibles con versiones anteriores (breaking changes); un incremento de versión menor señala nueva funcionalidad compatible hacia atrás; un incremento de parche señala correcciones de errores compatibles. Esta convención, aunque depende de que cada autor de paquete la respete honestamente (no hay ninguna verificación automática que garantice que un paquete realmente cumple lo que su número de versión promete), es ampliamente seguida en el ecosistema npm y es la base sobre la que operan los rangos de versión.

Los prefijos en los rangos de versión de `package.json` controlan qué actualizaciones automáticas se permiten al instalar: `^4.19.0` (caret) acepta cualquier actualización menor o de parche mientras el número mayor permanezca en `4` (es decir, `4.x.x` para cualquier `x`, pero nunca `5.0.0`), siendo el prefijo por defecto y más comúnmente usado, bajo la expectativa de que las actualizaciones menores y de parche son seguras según la convención de semver; `~4.19.0` (tilde) es más conservador, aceptando únicamente actualizaciones de parche (`4.19.x`); y una versión exacta sin ningún prefijo (`4.19.0`) fija ese número exacto, sin permitir ninguna actualización automática en absoluto, apropiado cuando se necesita máxima previsibilidad a costa de tener que actualizar manualmente cada vez.

La distinción entre `dependencies` y `devDependencies` en `package.json` comunica una diferencia semántica importante sobre el ciclo de vida del proyecto: `dependencies` lista paquetes necesarios para que la aplicación funcione en producción (como Express, si la aplicación es un servidor web); `devDependencies` lista paquetes necesarios únicamente durante el desarrollo (como Vitest para testing, o ESLint para análisis estático), que no necesitan estar presentes en el entorno de producción final. Esta distinción tiene un efecto práctico directo al construir una imagen de contenedor de producción (como se vio en el Módulo 11 del track DevOps y se verá en el Módulo 11 de este mismo track): instalar únicamente con `npm ci --omit=dev` excluye las `devDependencies`, reduciendo el tamaño final de la imagen y su superficie de dependencias innecesarias en producción.

**Analogía:** semver es como un sistema de semáforos para cambios de software: verde (parche) significa "cambio seguro, sin ninguna acción requerida de tu parte"; amarillo (menor) significa "algo nuevo se añadió, pero nada de lo que ya usabas debería romperse"; rojo (mayor) significa "detente y revisa, algo que dependías podría haber cambiado de forma incompatible".

**¿Por qué es importante?** Entender semver y los rangos de versión permite tomar decisiones informadas sobre cuánta actualización automática aceptar en un proyecto, equilibrando la comodidad de recibir correcciones automáticamente contra el riesgo de una actualización inesperada que rompa algo.

**Diagrama:**

```json
{
  "dependencies": { "express": "^4.19.0" },   // acepta 4.x.x, nunca 5.0.0
  "devDependencies": { "vitest": "^2.0.0" }   // solo necesario en desarrollo
}
```

### Tema 2: Lockfiles e instalación reproducible

**Conceptos clave:** `package-lock.json`, dependencias transitivas, `npm ci` frente a `npm install`.

Un lockfile (`package-lock.json` para npm, `pnpm-lock.yaml` para pnpm) congela el árbol completo y exacto de dependencias que se instaló en un momento dado, incluyendo no solo las dependencias directas declaradas en `package.json`, sino también todas las dependencias transitivas (las dependencias de las dependencias, que pueden extenderse varios niveles de profundidad). Esto resuelve un problema real de reproducibilidad: sin un lockfile, dos instalaciones del mismo `package.json` en momentos distintos podrían resolver rangos de versión (como `^4.19.0`) hacia versiones específicas distintas si el paquete publicó una nueva versión menor o de parche entre ambas instalaciones, potencialmente introduciendo un comportamiento distinto (o incluso un bug) sin que el `package.json` en sí haya cambiado en absoluto.

`npm install` respeta el lockfile existente si está presente y es compatible con el `package.json` actual, pero puede actualizarlo si detecta que necesita resolver algo nuevo (por ejemplo, si se añadió una dependencia nueva a `package.json` desde la última vez que se generó el lockfile). `npm ci` (de "clean install"), en cambio, instala exactamente lo que el lockfile especifica, sin ninguna resolución adicional, y falla explícitamente con un error si el lockfile no está sincronizado con `package.json` (por ejemplo, si alguien añadió una dependencia al `package.json` sin regenerar el lockfile correspondiente), en vez de intentar resolverlo silenciosamente como haría `npm install`.

Esta diferencia hace que `npm ci` sea la elección correcta y recomendada para entornos de integración continua (CI) y de producción: garantiza que exactamente las mismas versiones que un desarrollador probó localmente (y que quedaron registradas en el lockfile committeado al repositorio) son las que se instalan en el pipeline de CI y en el despliegue final, eliminando la categoría de bugs "funciona en mi máquina pero no en producción" causada específicamente por diferencias de versiones de dependencias transitivas entre distintos entornos. Además, `npm ci` es típicamente más rápido que `npm install` en estos contextos, porque omite parte del trabajo de resolución de versiones al confiar completamente en lo que el lockfile ya especifica con precisión.

Committear siempre el lockfile al control de versiones (nunca añadirlo a `.gitignore`) es una práctica fundamental y no negociable para cualquier proyecto que dependa de paquetes externos: sin el lockfile versionado, cada colaborador del equipo, y cada ejecución del pipeline de CI, podría terminar con un árbol de dependencias transitivas ligeramente distinto, sembrando la posibilidad de bugs difíciles de diagnosticar que solo se manifiestan en algunos entornos y no en otros.

**Analogía:** un lockfile es como una lista de ingredientes exacta y detallada (marca específica, lote específico) que un restaurante usó para preparar un plato específico que resultó perfecto; sin esa lista exacta, volver a preparar "el mismo plato" usando solo la receta general (equivalente al `package.json` sin lockfile) podría producir resultados ligeramente distintos si los ingredientes genéricos disponibles cambiaron de proveedor entre una preparación y otra.

**¿Por qué es importante?** El lockfile es la garantía de reproducibilidad exacta entre el entorno de desarrollo, el pipeline de CI y producción; `npm ci` en vez de `npm install` en esos contextos automatizados es la práctica estándar que hace cumplir esa garantía estrictamente, fallando explícitamente ante cualquier desincronización en vez de resolverla silenciosamente.

**Diagrama:**

```bash
npm install   # respeta el lockfile si existe, lo actualiza si hace falta
npm ci        # instala EXACTAMENTE lo que dice el lockfile, falla si no coincide
              # → la opción correcta para CI y producción
```

### Tema 3: Workspaces — monorepos con npm/pnpm

**Conceptos clave:** monorepo, enlace local de paquetes, workspaces.

Un monorepo organiza múltiples paquetes relacionados (por ejemplo, una API backend y una biblioteca compartida de utilidades usada tanto por esa API como por un frontend separado) dentro de un único repositorio Git, en contraste con un modelo de "polyrepo" donde cada paquete vive en su propio repositorio independiente, mencionado ya como consideración arquitectónica en el Módulo 1 del track DevOps. Los workspaces, una funcionalidad integrada tanto en npm como en pnpm (y en Yarn), permiten declarar en el `package.json` raíz del repositorio qué directorios contienen paquetes individuales del monorepo (típicamente mediante un patrón glob como `"workspaces": ["packages/*"]`), y automatizan el enlace entre esos paquetes cuando uno depende de otro.

Cuando un paquete del monorepo (por ejemplo, `packages/api`) declara una dependencia hacia otro paquete del mismo monorepo (`packages/core`), el gestor de paquetes con soporte de workspaces crea automáticamente un enlace simbólico local entre ambos, en vez de intentar descargar `packages/core` desde el registro público de npm (donde, de hecho, ese paquete interno probablemente ni siquiera está publicado). Esto significa que cualquier cambio realizado directamente en el código fuente de `packages/core` está inmediatamente disponible para `packages/api` sin necesidad de publicar una nueva versión a ningún registro intermedio, ni de reinstalar manualmente el paquete después de cada cambio, un flujo de trabajo considerablemente más ágil que gestionar paquetes internos como dependencias externas publicadas por separado.

Instalar dependencias en un monorepo con workspaces configurados típicamente se hace una única vez desde la raíz del repositorio (`npm install` ejecutado en el directorio raíz), y el gestor de paquetes resuelve inteligentemente las dependencias de todos los paquetes del monorepo simultáneamente, incluyendo la deduplicación de dependencias compartidas entre distintos paquetes del monorepo (instalando una única copia compartida de una biblioteca externa usada por múltiples paquetes internos, en vez de una copia redundante separada para cada uno), un beneficio adicional de eficiencia de espacio en disco y de instalación más rápida.

La decisión de adoptar un monorepo con workspaces frente a mantener paquetes completamente separados (como se discutió a nivel conceptual en el Módulo 1 del track DevOps) depende del grado de acoplamiento real entre los paquetes: cuando múltiples paquetes evolucionan conjuntamente con frecuencia y comparten código sustancial, un monorepo con workspaces reduce considerablemente la fricción de mantener esa relación sincronizada; cuando los paquetes son genuinamente independientes con ciclos de vida y equipos separados, un modelo de repositorios separados puede ser más apropiado.

**Analogía:** un monorepo con workspaces es como un campus universitario con múltiples facultades bajo una única administración compartida, donde los recursos comunes (biblioteca, cafetería) se comparten eficientemente entre todas las facultades, y un cambio en un departamento compartido (como una actualización del sistema de matrícula común) está inmediatamente disponible para todas las facultades sin ningún trámite adicional de "publicación" entre ellas.

**¿Por qué es importante?** Los workspaces automatizan el enlace entre paquetes internos relacionados de un monorepo, eliminando la fricción de publicar y reinstalar manualmente paquetes internos en cada cambio, un flujo de trabajo especialmente valioso cuando varios paquetes evolucionan conjuntamente con frecuencia.

**Diagrama:**

```json
// package.json raíz
{ "workspaces": ["packages/*"] }
```
```
mi-monorepo/
  packages/
    core/   (paquete compartido)
    api/    (depende de core)
npm install   # enlaza packages/api → packages/core automáticamente, sin publicar
```

### Tema 4: Scripts de ciclo de vida

**Conceptos clave:** `preinstall`, `postinstall`, `prepare`, ejecución automática en momentos específicos.

npm reconoce un conjunto de nombres de scripts especiales dentro de `package.json` que se ejecutan automáticamente en momentos específicos del ciclo de vida de instalación de un paquete, sin necesidad de invocarlos explícitamente con `npm run`. `postinstall` se ejecuta automáticamente inmediatamente después de que `npm install` (o `npm ci`) termina de instalar las dependencias, siendo útil para tareas de configuración adicional que deben ocurrir tras la instalación, como compilar código nativo específico de la plataforma que algunos paquetes requieren, o generar código a partir de un esquema (como el cliente de Prisma, estudiado en el Módulo 5, que efectivamente usa un mecanismo de este tipo para generar su cliente tipado tras la instalación).

`preinstall` se ejecuta justo antes de que la instalación de dependencias comience, útil para verificaciones previas (como comprobar que se está usando la versión correcta del gestor de paquetes antes de proceder). `prepare` se ejecuta tanto tras `npm install` en desarrollo como antes de que un paquete se empaquete para publicación, siendo el lugar recomendado para pasos de compilación que deben garantizarse tanto en desarrollo local como al preparar el paquete para su distribución.

Aunque estos scripts automáticos son convenientes para automatizar pasos de configuración necesarios, representan también un vector de seguridad real a tener en cuenta: un `postinstall` malicioso dentro de una dependencia (o, más preocupante aún, dentro de una dependencia transitiva profundamente anidada que nunca se revisó directamente) se ejecuta automáticamente durante la instalación sin ninguna confirmación explícita del desarrollador, un vector de ataque real documentado en incidentes de la cadena de suministro de software del ecosistema npm en años recientes. Por esta razón, algunos equipos optan deliberadamente por deshabilitar la ejecución automática de scripts de ciclo de vida en instalaciones de producción o de CI (mediante configuraciones específicas del gestor de paquetes), revisando manualmente y de forma consciente cuándo permitir su ejecución.

Comprender qué scripts se ejecutan automáticamente y en qué momento, además de sus implicaciones de seguridad, es relevante tanto para diseñar correctamente el proceso de instalación de un paquete propio como para evaluar con criterio el riesgo real de instalar dependencias de terceros en un proyecto de producción.

**Analogía:** los scripts de ciclo de vida son como instrucciones automáticas de ensamblaje que se ejecutan sin necesidad de instrucción manual explícita cada vez que se recibe un paquete nuevo (por ejemplo, "desempaquetar y montar automáticamente"); son convenientes cuando el remitente es confiable, pero representan un riesgo real si el remitente resulta ser malicioso y las instrucciones automáticas ocultan una acción no deseada.

**¿Por qué es importante?** Los scripts de ciclo de vida automatizan pasos de configuración necesarios tras la instalación, pero también representan un vector de seguridad real de la cadena de suministro de software que vale la pena entender y mitigar conscientemente en proyectos de producción.

**Diagrama:**

```json
{
  "scripts": {
    "preinstall": "echo 'Verificando versión de node...'",
    "postinstall": "echo 'Dependencias listas, generando cliente...'",
    "prepare": "npm run build"
  }
}
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

**Objetivo del laboratorio:** construir un monorepo mínimo con dos paquetes propios enlazados vía workspaces, y experimentar con semver, lockfiles y scripts de ciclo de vida.

**Requisitos previos:** Node.js y npm instalados, Módulo 0 completado.

| Paso | Acción | Comando | Explicación |
|---|---|---|---|
| 1 | Inicializar un proyecto | `npm init -y` | Observa la estructura mínima generada |
| 2 | Instalar una dependencia normal y una de desarrollo | `npm install express`, `npm install -D vitest` | Compara cómo aparecen en `package.json` |
| 3 | Modificar un rango de versión | Cambia `^` por `~` o una versión exacta | Ejecuta `npm install` y observa el efecto en el lockfile |
| 4 | Comparar `npm install` con `npm ci` | Borra `node_modules`, reinstala con ambos comandos | Verifica la diferencia de comportamiento respecto al lockfile |
| 5 | Crear un monorepo con dos paquetes | `packages/core` y `packages/api` con workspaces | Enlaza uno como dependencia del otro |
| 6 | Agregar un script `postinstall` | Ver Tema 4 | Verifica que corre automáticamente tras `npm install` |

**Verificación:** el laboratorio se considera exitoso si `packages/api` puede importar y usar código de `packages/core` sin haberlo publicado a ningún registro, y si `npm ci` falla explícitamente al desincronizar deliberadamente el lockfile de `package.json`.

**Errores comunes y soluciones**

- **Añadir `package-lock.json` a `.gitignore`.** Nunca hagas esto; el lockfile debe versionarse siempre para garantizar reproducibilidad entre entornos.
- **Usar `npm install` en un pipeline de CI en vez de `npm ci`.** Usa siempre `npm ci` en CI y producción para instalaciones exactas y reproducibles.
- **Esperar que un paquete de workspace se actualice sin reinstalar tras cambios estructurales.** Tras cambios significativos (como añadir un nuevo paquete), vuelve a ejecutar `npm install` desde la raíz del monorepo.

---

## Ejercicios de evaluación

### Ejercicio 1: Interpretar rangos de semver

**Enunciado:** dado `"express": "~4.19.0"`, ¿aceptaría este rango la versión `4.19.5`? ¿Y la versión `4.20.0`? Justifica.

**Solución esperada:** sí aceptaría `4.19.5` (el prefijo `~` permite actualizaciones de parche dentro de `4.19.x`); no aceptaría `4.20.0` (eso sería una actualización de versión menor, que `~` no permite, a diferencia de `^`).

**Criterios de éxito:**
- Responde correctamente ambos casos.
- Justifica correctamente la diferencia entre `~` (solo parches) y lo que permitiría `^` (menores y parches) para contraste.

### Ejercicio 2: Por qué npm ci es más seguro en CI

**Enunciado:** explica por qué `npm ci` es más seguro que `npm install` en un pipeline de CI, con un escenario concreto donde la diferencia importaría.

**Solución esperada:** `npm ci` instala exactamente lo que especifica el lockfile y falla si está desincronizado con `package.json`, garantizando que el pipeline de CI prueba exactamente las mismas versiones que el desarrollador probó localmente. Escenario concreto: un desarrollador añade una dependencia nueva a `package.json` pero olvida regenerar el lockfile antes de hacer commit; `npm install` en CI podría resolver silenciosamente esa dependencia con una versión distinta a la que el desarrollador probó localmente, mientras que `npm ci` fallaría explícitamente, alertando del problema antes de que se propague a producción.

**Criterios de éxito:**
- Explica correctamente que `npm ci` falla ante desincronización, mientras `npm install` la resolvería silenciosamente.
- Da un escenario concreto y realista donde esa diferencia tiene impacto práctico.

### Ejercicio 3: Diseñar un monorepo

**Enunciado:** tienes una biblioteca de validación de datos que necesitan compartir tanto una API backend como un script de procesamiento por lotes, ambos desarrollados por el mismo equipo con cambios frecuentes coordinados entre los tres. ¿Recomendarías un monorepo con workspaces o repositorios separados? Justifica.

**Solución esperada:** un monorepo con workspaces, porque los tres componentes (biblioteca compartida, API, script de procesamiento) evolucionan conjuntamente con frecuencia y son mantenidos por el mismo equipo, haciendo que el enlace automático de workspaces (sin necesidad de publicar y reinstalar la biblioteca compartida en cada cambio) reduzca significativamente la fricción de mantener esa relación sincronizada.

**Criterios de éxito:**
- Recomienda monorepo con workspaces.
- Justifica correctamente en términos de acoplamiento frecuente y mismo equipo, los criterios relevantes para esta decisión.

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

- OpenJS Foundation, *Node.js Documentation*.
- IETF, especificaciones HTTP Semantics, OAuth 2.0 y JSON.
- OWASP Foundation, *Application Security Verification Standard*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- Semver estructura versiones como MAYOR.MENOR.PARCHE; `^` acepta menores y parches, `~` solo parches, sin prefijo fija la versión exacta.
- Un lockfile congela el árbol completo de dependencias, incluyendo transitivas, garantizando instalaciones reproducibles.
- `npm ci` instala exactamente lo que el lockfile especifica y falla ante desincronización; es la opción correcta para CI y producción.
- Los workspaces enlazan automáticamente paquetes internos de un monorepo, sin necesidad de publicarlos a ningún registro.
- Los scripts de ciclo de vida (`postinstall`, entre otros) automatizan pasos de configuración, pero representan un vector de seguridad real de la cadena de suministro.

**Conceptos aprendidos**

- Interpretación de `package.json` y rangos de semver.
- El propósito de los lockfiles y la diferencia entre `npm install` y `npm ci`.
- Configuración de monorepos con workspaces.
- Scripts de ciclo de vida y sus implicaciones de seguridad.

**Próximos pasos**

En el Módulo 2 aprenderás a procesar archivos grandes con streams, sin cargarlos completos en memoria, el patrón que Node usa internamente para prácticamente todo su manejo de I/O.

**Recursos adicionales**

- Documentación oficial de npm: "About semantic versioning" y "package-lock.json".
- Documentación de npm workspaces y de pnpm workspaces.
