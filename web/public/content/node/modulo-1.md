# Módulo 1: Módulos, npm/pnpm y gestión de dependencias


## Aprende construyendo

### Tema 1: package.json y semver

**Conceptos clave:** versionado semántico, rangos de versión, `dependencies` frente a `devDependencies`.

`package.json` es el archivo de manifiesto central de cualquier proyecto Node, declarando su nombre, versión, dependencias y scripts. El versionado semántico (semver) estructura los números de versión como `MAYOR.MENOR.PARCHE`, con una convención bien establecida sobre qué tipo de cambio justifica incrementar cada parte: un incremento de versión mayor señala cambios incompatibles con versiones anteriores (breaking changes); un incremento de versión menor señala nueva funcionalidad compatible hacia atrás; un incremento de parche señala correcciones de errores compatibles. Esta convención, aunque depende de que cada autor de paquete la respete honestamente (no hay ninguna verificación automática que garantice que un paquete realmente cumple lo que su número de versión promete), es ampliamente seguida en el ecosistema npm y es la base sobre la que operan los rangos de versión.

Los prefijos en los rangos de versión de `package.json` controlan qué actualizaciones automáticas se permiten al instalar: `^4.19.0` (caret) acepta cualquier actualización menor o de parche mientras el número mayor permanezca en `4` (es decir, `4.x.x` para cualquier `x`, pero nunca `5.0.0`), siendo el prefijo por defecto y más comúnmente usado, bajo la expectativa de que las actualizaciones menores y de parche son seguras según la convención de semver; `~4.19.0` (tilde) es más conservador, aceptando únicamente actualizaciones de parche (`4.19.x`); y una versión exacta sin ningún prefijo (`4.19.0`) fija ese número exacto, sin permitir ninguna actualización automática en absoluto, apropiado cuando se necesita máxima previsibilidad a costa de tener que actualizar manualmente cada vez.

La distinción entre `dependencies` y `devDependencies` en `package.json` comunica una diferencia semántica importante sobre el ciclo de vida del proyecto: `dependencies` lista paquetes necesarios para que la aplicación funcione en producción (como Express, si la aplicación es un servidor web); `devDependencies` lista paquetes necesarios únicamente durante el desarrollo (como Vitest para testing, o ESLint para análisis estático), que no necesitan estar presentes en el entorno de producción final. Esta distinción tiene un efecto práctico directo al construir una imagen de contenedor de producción (como se vio en el Módulo 11 del track DevOps y se verá en el Módulo 11 de este mismo track): instalar únicamente con `npm ci --omit=dev` excluye las `devDependencies`, reduciendo el tamaño final de la imagen y su superficie de dependencias innecesarias en producción.

**Analogía:** semver es como un sistema de semáforos para cambios de software: verde (parche) significa "cambio seguro, sin ninguna acción requerida de tu parte"; amarillo (menor) significa "algo nuevo se añadió, pero nada de lo que ya usabas debería romperse"; rojo (mayor) significa "detente y revisa, algo que dependías podría haber cambiado de forma incompatible".

**¿Por qué es importante?** Entender semver y los rangos de versión permite tomar decisiones informadas sobre cuánta actualización automática aceptar en un proyecto, equilibrando la comodidad de recibir correcciones automáticamente contra el riesgo de una actualización inesperada que rompa algo.

**Configuración del ejemplo:**

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

**Prueba en terminal:**

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

**Configuración del ejemplo:**

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

**Configuración del ejemplo:**

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
