# Módulo 7: Módulos modernos y herramientas de build

## Sílabo

**Objetivo general**

Organizar código JavaScript en módulos reales usando ESM, y entender conceptualmente qué hace un bundler moderno (Vite) antes de usarlo como una caja negra.

**Objetivos específicos**

1. Diferenciar ESM (`import`/`export`) de CommonJS (`require`/`module.exports`) en sintaxis y momento de resolución.
2. Explicar tree-shaking y code-splitting, y por qué ESM los habilita mejor que CommonJS.
3. Usar Vite para desarrollo y build de producción, entendiendo la diferencia entre ambos modos.
4. Configurar correctamente `package.json` (`exports`, `type`, `scripts`).
5. Usar `import()` dinámico e `import.meta`.
6. Comparar Webpack, Rollup y Babel/SWC y cuándo cada herramienta es relevante.

**Contenido**

- ESM frente a CommonJS.
- Tree-shaking y code-splitting.
- Vite/esbuild: dev server y build de producción.
- `package.json`: `exports`, `type`, `scripts`.
- `import()` dinámico e `import.meta`.
- Webpack, Rollup y Babel/SWC.

**Evaluación**

Un proyecto multi-módulo construido con Vite, con el bundle final auditado, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: ESM frente a CommonJS

**Conceptos clave:** análisis estático frente a resolución dinámica, `import`/`export`, `require`/`module.exports`.

ESM (ECMAScript Modules, la sintaxis `import`/`export`) es el sistema de módulos estandarizado como parte del propio lenguaje JavaScript desde ES6, y tiene una propiedad fundamental que lo distingue de CommonJS: es estático y analizable en tiempo de build, sin necesidad de ejecutar el código. Las declaraciones `import`/`export` deben aparecer en el nivel superior de un módulo (no dentro de un `if` o una función condicional), lo que permite que una herramienta externa (como un bundler) analice el árbol completo de dependencias del proyecto sin ejecutar ni una sola línea de código, simplemente inspeccionando la estructura sintáctica de los `import`/`export`.

CommonJS (`require`/`module.exports`), el sistema de módulos que Node.js adoptó originalmente (antes de que ESM se estandarizara y Node añadiera soporte para él), resuelve las dependencias de forma dinámica, en tiempo de ejecución: `require(ruta)` puede aparecer condicionalmente dentro de un `if`, con una ruta calculada dinámicamente en tiempo de ejecución, lo cual es imposible de analizar completamente de antemano sin ejecutar el código. Esta flexibilidad dinámica de CommonJS tiene un coste directo: un bundler no puede determinar con certeza absoluta, sin ejecutar el código, exactamente qué se exporta y qué se usa de cada módulo, lo que limita significativamente las optimizaciones de tree-shaking que sí son posibles con ESM.

Determinar si un archivo se interpreta como ESM o como CommonJS depende de la configuración del proyecto: un `package.json` con `"type": "module"` hace que todos los archivos `.js` del proyecto se interpreten por defecto como ESM (permitiendo usar `import`/`export` directamente); sin esa configuración, `.js` se interpreta como CommonJS por defecto en Node, y hay que usar explícitamente la extensión `.mjs` para forzar la interpretación como ESM en un archivo individual, independientemente de la configuración general del proyecto (o `.cjs` para forzar CommonJS explícitamente en un proyecto configurado como ESM por defecto).

Aunque ambos sistemas coexisten en el ecosistema JavaScript actual (gran cantidad de código y bibliotecas legadas siguen usando CommonJS), la dirección clara de la industria y del propio lenguaje es hacia ESM como el sistema de módulos estándar y preferido para código nuevo, en gran parte precisamente por las ventajas de análisis estático que habilita, incluyendo el tree-shaking del Tema 2.

**Analogía:** ESM es como una lista de ingredientes impresa y fija en el envase de un producto, visible y verificable sin necesidad de abrir el paquete ni cocinar nada; CommonJS es como una receta que decide qué ingredientes usar en el momento mismo de cocinar, potencialmente de forma distinta cada vez según condiciones que solo se conocen al momento de la preparación real, imposibilitando verificar de antemano exactamente qué ingredientes se usarán sin ejecutar la receta completa.

**¿Por qué es importante?** Entender la diferencia de análisis estático frente a dinámico entre ESM y CommonJS explica directamente por qué el tree-shaking funciona de forma mucho más confiable con ESM, una consideración práctica relevante al elegir el formato de las propias bibliotecas o al configurar un proyecto nuevo.

**Diagrama:**

```
ESM (estático, analizable sin ejecutar):    CommonJS (dinámico, en tiempo de ejecución):
export function sumar(a,b) { return a+b; }   function sumar(a,b) { return a+b; }
import { sumar } from "./math.mjs";           const { sumar } = require("./math.cjs");
// import/export: nivel superior siempre     // require: puede estar dentro de un if
```

### Tema 2: Tree-shaking y code-splitting

**Conceptos clave:** eliminación de código muerto, división en chunks, carga bajo demanda.

Tree-shaking es el proceso mediante el cual un bundler analiza qué exports de un módulo se usan realmente en algún punto de la aplicación, y elimina del bundle final cualquier código exportado que nunca se importa ni se usa, reduciendo el tamaño total del código entregado al navegador. Este proceso depende directamente del análisis estático que ESM habilita (Tema 1): el bundler necesita poder determinar, sin ejecutar código, exactamente qué se importa de cada módulo, algo que la naturaleza dinámica de CommonJS dificulta considerablemente, siendo la razón práctica principal por la que bibliotecas modernas suelen distribuirse en formato ESM (frecuentemente identificable por el sufijo `-es` en el nombre del paquete, como `lodash-es` frente a `lodash`).

Un ejemplo concreto ilustra el impacto real: importar `import { debounce } from "lodash-es";` permite que el bundler incluya en el bundle final únicamente el código de la función `debounce` y sus dependencias internas directas, excluyendo el resto de las decenas de funciones que la biblioteca completa de Lodash contiene pero que la aplicación nunca usa; importar en cambio `import _ from "lodash";` (la versión CommonJS tradicional) típicamente incluye la biblioteca completa en el bundle, porque el bundler no puede determinar con certeza estática qué subconjunto de sus funciones se usará realmente.

Code-splitting es una técnica complementaria pero conceptualmente distinta: en vez de (o además de) eliminar código no usado, divide el bundle final en múltiples archivos ("chunks") más pequeños, que se cargan bajo demanda solo cuando efectivamente se necesitan, en vez de cargar toda la aplicación de una sola vez al inicio. Un caso típico es dividir el código específico de cada ruta de una aplicación (usando `import()` dinámico, visto en el Tema 5) en su propio chunk, de modo que un usuario que solo visita la página de inicio no descarga el código de páginas que nunca visitó en esa sesión, mejorando directamente el tiempo de carga inicial de la aplicación.

Vite (Tema 3), en su modo de producción, aplica ambas técnicas de forma automática usando Rollup internamente: tree-shaking elimina código verdaderamente no usado, y code-splitting divide el resultado en chunks razonables según los puntos de importación dinámica presentes en el código, sin que el desarrollador necesite configurar manualmente ninguna de las dos técnicas en la mayoría de casos comunes.

**Analogía:** tree-shaking es como empacar una maleta de viaje llevando únicamente la ropa que realmente vas a usar en el viaje específico, en vez de empacar el armario completo "por si acaso"; code-splitting es como dividir el equipaje en varias maletas más pequeñas organizadas por actividad (una para la playa, otra para la ciudad), de modo que solo cargas la maleta correspondiente cuando efectivamente vas a esa actividad específica, no todo el equipaje completo todo el tiempo.

**¿Por qué es importante?** Tree-shaking y code-splitting son las dos técnicas principales por las que aplicaciones web modernas mantienen tiempos de carga razonables a pesar de depender de un volumen creciente de código y bibliotecas de terceros.

**Diagrama:**

```
import { debounce } from "lodash-es";  // SOLO debounce entra al bundle final
import _ from "lodash";                // la biblioteca COMPLETA entra (peor caso)

const Modulo = await import("./ruta-pesada.js"); // code-splitting:
// este código solo se descarga cuando esta línea se ejecuta realmente
```

### Tema 3: Vite y esbuild

**Conceptos clave:** servidor de desarrollo con ESM nativo, esbuild, build de producción con Rollup.

Vite representa un cambio de enfoque significativo frente a bundlers anteriores como Webpack en cómo funciona el servidor de desarrollo: en vez de empaquetar toda la aplicación completa antes de servirla (un proceso que puede tardar considerablemente en proyectos grandes y que debe repetirse en cada cambio de código), Vite sirve los módulos ESM directamente al navegador sin empaquetarlos durante el desarrollo, aprovechando que los navegadores modernos soportan `import`/`export` de forma nativa. Esto permite que el servidor de desarrollo arranque casi instantáneamente, independientemente del tamaño total del proyecto, porque no necesita procesar y empaquetar todo el código de antemano.

Para el código que sí necesita transformación antes de poder ejecutarse en el navegador (TypeScript, JSX), Vite usa esbuild, un compilador escrito en Go extremadamente rápido comparado con transformadores basados en JavaScript puro como Babel, procesando archivos individuales bajo demanda según el navegador los solicita durante el desarrollo, en vez de procesar el proyecto completo de una sola vez por adelantado.

Para el build de producción (`npm run build`), Vite cambia de estrategia y usa Rollup internamente, un bundler especializado en producir bundles optimizados y pequeños mediante tree-shaking agresivo y code-splitting inteligente (Tema 2), aceptando un tiempo de procesamiento mayor que el servidor de desarrollo a cambio de un resultado final más pequeño y eficiente para servir a usuarios reales, una decisión de diseño razonable dado que el build de producción se ejecuta una vez por despliegue, mientras que el servidor de desarrollo se reinicia y recarga constantemente durante la sesión de trabajo diaria de un desarrollador.

Inspeccionar el resultado de `npm run build` —abriendo los archivos generados en la carpeta de salida— revela directamente los efectos de la minificación (eliminación de espacios y renombrado de variables para reducir tamaño) y el hashing de nombres de archivo (incluir un hash del contenido en el nombre del archivo, como `main.a3f8c2.js`, permitiendo cachear agresivamente ese archivo en el navegador del usuario mientras su contenido no cambie, e invalidando automáticamente la caché con un nombre distinto en cuanto el contenido sí cambia en un despliegue posterior).

**Analogía:** el servidor de desarrollo de Vite es como un restaurante que prepara cada plato individual bajo demanda, exactamente cuando el cliente lo pide, permitiendo empezar a servir casi instantáneamente sin preparar el menú completo de antemano; el build de producción con Rollup es como preparar con antelación un banquete completo cuidadosamente optimizado para servir eficientemente a muchos comensales simultáneos, aceptando más tiempo de preparación previa a cambio de una entrega final más eficiente.

**¿Por qué es importante?** Entender esta diferencia de estrategia entre desarrollo (ESM nativo sin empaquetar, esbuild bajo demanda) y producción (Rollup, tree-shaking y code-splitting completos) explica por qué el comportamiento y el rendimiento observado durante el desarrollo puede diferir del comportamiento en producción, y por qué siempre conviene probar el build de producción real antes de desplegar.

**Diagrama:**

```
npm create vite@latest mi-app -- --template vanilla
cd mi-app && npm install
npm run dev     # ESM nativo servido directo, esbuild bajo demanda, arranque instantáneo
npm run build   # Rollup: tree-shaking + code-splitting + minificación + hashing
```

### Tema 4: package.json — exports, type y scripts

**Conceptos clave:** punto de entrada de un paquete, `exports` map, `type`, scripts npm.

El campo `"type"` en `package.json` determina cómo Node.js interpreta por defecto los archivos `.js` del proyecto: `"module"` los interpreta como ESM (`import`/`export` disponibles directamente), mientras que su ausencia (o el valor explícito `"commonjs"`) los interpreta como CommonJS (`require`/`module.exports`). Esta configuración afecta a todo el proyecto salvo excepciones puntuales marcadas explícitamente con la extensión de archivo contraria (`.mjs` fuerza ESM en un proyecto CommonJS; `.cjs` fuerza CommonJS en un proyecto ESM).

El campo `"exports"`, una adición más reciente y más precisa que el tradicional campo `"main"`, permite a un paquete definir explícitamente qué archivos internos son accesibles públicamente al importar el paquete desde fuera, y con qué condiciones (por ejemplo, exponiendo una versión distinta del punto de entrada según si quien importa usa ESM o CommonJS, permitiendo que un mismo paquete publicado sea compatible con ambos sistemas de módulos simultáneamente). Esta capacidad de "exports condicionales" es importante para autores de bibliotecas que necesitan dar soporte tanto a consumidores modernos (ESM) como a proyectos legados que aún dependen de CommonJS.

Los `"scripts"` de `package.json` son comandos con nombre, invocables mediante `npm run <nombre>` (o directamente sin `run` para ciertos nombres convencionales como `start` y `test`), que encapsulan comandos de shell frecuentemente usados durante el desarrollo (`dev`, `build`, `test`, `lint`), evitando que cada desarrollador del equipo necesite recordar o escribir manualmente comandos largos y con opciones específicas cada vez; un nuevo miembro del equipo puede familiarizarse rápidamente con el flujo de trabajo de un proyecto simplemente leyendo la sección `scripts` del `package.json`, sin necesidad de documentación adicional externa para las tareas más comunes.

Entender estos tres campos —`type`, `exports`, `scripts`— es esencial no solo para configurar proyectos propios correctamente, sino también para diagnosticar problemas de compatibilidad al integrar una biblioteca de terceros que, por ejemplo, solo expone un formato de módulo que no coincide con la configuración `type` del proyecto que la consume, un problema de integración sorprendentemente común en el ecosistema JavaScript actual, dada la coexistencia de ESM y CommonJS.

**Analogía:** `"type"` es como el idioma principal en el que se redactan todos los documentos de una organización por defecto; `"exports"` es como el directorio oficial de una empresa que especifica exactamente qué departamentos y personas son de contacto público autorizado desde fuera, y bajo qué protocolo según quién pregunte; `"scripts"` es como un manual de procedimientos estándar con nombres cortos y memorables para las tareas más frecuentes de la organización.

**¿Por qué es importante?** Configurar correctamente estos campos evita problemas de compatibilidad frecuentes al integrar bibliotecas de terceros, y hace que un proyecto sea más fácil de entender y operar para cualquier nuevo colaborador.

**Diagrama:**

```json
{
  "type": "module",
  "exports": { ".": "./dist/index.js" },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest"
  }
}
```

### Tema 5: import() dinámico e import.meta

**Conceptos clave:** importación dinámica, code-splitting basado en `import()`, metadatos del módulo.

`import()` usado como una función (a diferencia de la declaración estática `import ... from ...`) devuelve una Promesa que resuelve con el módulo solicitado, y puede invocarse en cualquier punto del código, incluyendo dentro de condicionales, bucles o en respuesta a un evento del usuario, precisamente porque, a diferencia de la declaración estática, no está limitado al nivel superior del archivo. Esta forma dinámica es la base técnica sobre la que los bundlers implementan code-splitting (Tema 2): cada llamada a `import()` se convierte automáticamente en un punto de división, generando un chunk separado que solo se descarga cuando esa línea específica de código efectivamente se ejecuta.

Un caso de uso extremadamente común es cargar el código de una ruta específica de la aplicación solo cuando el usuario navega hacia ella (`const Modulo = await import("./paginas/detalle.js");`), en vez de incluir el código de todas las rutas posibles en el bundle inicial que se descarga al cargar la aplicación por primera vez, mejorando directamente el tiempo de carga inicial percibido por el usuario, especialmente en aplicaciones con muchas rutas o funcionalidades opcionales poco usadas.

`import.meta` es un objeto especial disponible dentro de cualquier módulo ESM que expone metadatos sobre el propio módulo en tiempo de ejecución; su propiedad más comúnmente usada es `import.meta.url`, que contiene la URL completa del propio archivo del módulo, útil para resolver rutas relativas a recursos (como imágenes o archivos de datos) de forma robusta independientemente de desde dónde se haya importado el módulo. Vite además expone `import.meta.env` con variables de entorno específicas del build (distinguiendo, por ejemplo, entre modo de desarrollo y modo de producción), una convención propia de Vite construida sobre esta capacidad estándar de `import.meta` del lenguaje.

Combinar `import()` dinámico con un framework de routing (como el router manual construido en el Módulo 12, o el router de Angular/React en sus tracks correspondientes) es el patrón estándar de "lazy loading de rutas" en aplicaciones modernas de una sola página, una técnica de optimización de rendimiento ampliamente adoptada en la industria precisamente porque reduce directamente el tamaño del bundle inicial sin sacrificar ninguna funcionalidad de la aplicación completa.

**Analogía:** la declaración estática `import` es como pedir por adelantado, al hacer una reserva de restaurante, absolutamente todos los platos del menú que podrías llegar a querer durante toda la velada; `import()` dinámico es pedir cada plato exactamente en el momento en que decides que lo quieres, sin comprometerte de antemano con nada que quizás nunca termines pidiendo.

**¿Por qué es importante?** `import()` dinámico es la base técnica del lazy loading de rutas y funcionalidades, una de las optimizaciones de rendimiento más directamente impactantes y ampliamente adoptadas en aplicaciones web modernas de cualquier escala no trivial.

**Diagrama:**

```js
boton.addEventListener("click", async () => {
  const { abrirModal } = await import("./modal.js"); // se descarga SOLO al hacer click
  abrirModal();
});

console.log(import.meta.url); // URL completa de este propio archivo módulo
```

### Tema 6: Webpack, Rollup y Babel/SWC

**Conceptos clave:** panorama de herramientas de build, cuándo cada una es apropiada.

Webpack fue, durante buena parte de la década pasada, el bundler dominante del ecosistema JavaScript, con un modelo de configuración extremadamente flexible y potente (capaz de manejar prácticamente cualquier tipo de asset mediante "loaders" configurables), a costa de una configuración inicial considerablemente más compleja y verbosa que las alternativas más modernas como Vite. Webpack sigue siendo ampliamente usado en proyectos existentes de gran escala y en algunos frameworks específicos que lo integran internamente, aunque para proyectos nuevos, Vite (con Rollup para producción) ha ganado adopción significativa precisamente por su configuración considerablemente más simple y su servidor de desarrollo más rápido.

Rollup, el bundler que Vite usa internamente para producción, está optimizado específicamente para producir bundles pequeños mediante tree-shaking de alta calidad, y es particularmente popular como herramienta de build para bibliotecas (en contraste con aplicaciones completas), donde producir un output limpio, pequeño y bien tree-shaken es la prioridad principal por encima de otras capacidades más orientadas a aplicaciones, como el hot module replacement durante desarrollo.

Babel fue, durante años, la herramienta estándar para transformar sintaxis moderna de JavaScript (o JSX, o TypeScript) a una versión compatible con navegadores más antiguos que no soportaban esa sintaxis nativamente, mediante un sistema de plugins altamente configurable escrito en JavaScript puro. SWC (Speedy Web Compiler) y esbuild son alternativas más recientes que realizan transformaciones similares pero escritas en lenguajes compilados (Rust y Go respectivamente), ofreciendo mejoras de velocidad de un orden de magnitud frente a Babel para las transformaciones más comunes, siendo la razón técnica concreta detrás de la velocidad notablemente mayor de herramientas modernas como Vite (que usa esbuild) frente a configuraciones tradicionales basadas puramente en Babel y Webpack.

Elegir entre estas herramientas en un proyecto nuevo, en la práctica actual de la industria, rara vez requiere una decisión completamente manual desde cero: frameworks y herramientas de scaffolding modernas (como `npm create vite@latest`) ya vienen preconfiguradas con una combinación sensata (Vite + esbuild + Rollup para producción) que cubre la gran mayoría de necesidades comunes sin configuración manual adicional, reservando la necesidad de entender estas herramientas individualmente principalmente para diagnosticar problemas específicos o para necesidades de configuración avanzada que excedan lo que la configuración por defecto cubre.

**Analogía:** Webpack es como una fábrica industrial completamente configurable capaz de producir literalmente cualquier cosa con suficiente configuración manual detallada; Rollup es una línea de producción especializada y optimizada específicamente para un tipo de producto (bibliotecas pequeñas y limpias); Babel es un traductor humano experto pero relativamente lento; SWC/esbuild son traductores automáticos ultra rápidos que cubren la gran mayoría de casos comunes con una fracción del tiempo.

**¿Por qué es importante?** Conocer el panorama general de estas herramientas, aunque la configuración por defecto de Vite cubra la mayoría de casos sin intervención manual, es útil para entender por qué un proyecto legado usa Webpack, o para diagnosticar un problema de configuración de build que exceda lo que el scaffolding por defecto resuelve automáticamente.

**Diagrama:**

```
Webpack: máxima flexibilidad, configuración más compleja, dominante en proyectos legados
Rollup: especializado en bundles pequeños y limpios, ideal para bibliotecas
Babel: transformación de sintaxis, escrito en JS, más lento
SWC/esbuild: transformación de sintaxis, escritos en Rust/Go, mucho más rápidos
Vite = esbuild (desarrollo) + Rollup (producción), preconfigurado sensatamente
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

**Objetivo del laboratorio:** construir un proyecto multi-módulo con Vite, comparar ESM con CommonJS, y auditar el bundle de producción resultante.

**Requisitos previos:** Node.js instalado, Módulos 0-6 completados.

| Paso | Acción | Comando/Código | Explicación |
|---|---|---|---|
| 1 | Crear 3 archivos ESM interconectados | `math.mjs`, `format.mjs`, `main.mjs` con exports nombrados y un default | Impórtalos entre sí y verifica que funcionan |
| 2 | Recrear el mismo ejemplo con CommonJS | `require`/`module.exports` | Compara sintaxis y el momento de resolución |
| 3 | Inicializar un proyecto con Vite | `npm create vite@latest` | Observa la estructura generada y `vite.config` |
| 4 | Ejecutar el build de producción | `npm run build` | Abre el bundle final: identifica minificación y hashing |
| 5 | Verificar tree-shaking real | Importa solo una función de `lodash-es` | Confirma con el analizador de bundle que el resto no entra |
| 6 | Configurar un alias de import | `@/utils` en `vite.config` | Úsalo en vez de rutas relativas largas |

**Verificación:** el laboratorio se considera exitoso si el bundle de producción generado en el paso 4 es sustancialmente más pequeño que la suma del código fuente sin procesar, y si el paso 5 confirma visualmente (con un analizador de bundle) que solo la función importada de `lodash-es` entra al resultado final, no la biblioteca completa.

**Errores comunes y soluciones**

- **Mezclar `import`/`export` con `require`/`module.exports` en el mismo archivo sin configurar `type` correctamente.** Verifica el campo `"type"` en `package.json` y usa extensiones `.mjs`/`.cjs` si necesitas forzar un formato específico en un archivo puntual.
- **Importar la biblioteca completa (`import _ from "lodash"`) y esperar tree-shaking.** Usa la versión ESM del paquete (`lodash-es`) e importa solo las funciones específicas necesarias.
- **Confundir el comportamiento del servidor de desarrollo con el del build de producción.** Siempre verifica el comportamiento real con `npm run build` antes de asumir que el rendimiento de desarrollo representa el de producción.

---

## Ejercicios de evaluación

### Ejercicio 1: ESM habilita tree-shaking, CommonJS lo dificulta

**Enunciado:** explica en tus propias palabras por qué ESM permite tree-shaking de forma confiable y CommonJS lo dificulta considerablemente.

**Solución esperada:** ESM requiere que `import`/`export` aparezcan en el nivel superior del módulo, de forma estática y analizable sin ejecutar código, permitiendo que un bundler determine con certeza exactamente qué se usa de cada módulo. CommonJS permite `require` dinámico dentro de condicionales con rutas calculadas en tiempo de ejecución, lo que impide a un bundler determinar con la misma certeza, sin ejecutar el código, qué exports se usan realmente.

**Criterios de éxito:**
- Explica correctamente la diferencia de análisis estático (ESM) frente a dinámico (CommonJS).
- Conecta esa diferencia directamente con la viabilidad del tree-shaking.

### Ejercicio 2: Diseñar lazy loading de una funcionalidad opcional

**Enunciado:** una aplicación tiene una funcionalidad de exportación a PDF que usa una biblioteca pesada, pero solo el 5% de los usuarios la usa alguna vez. Explica cómo aplicarías `import()` dinámico para optimizar el tamaño del bundle inicial en este escenario.

**Solución esperada:** en vez de importar la biblioteca de PDF estáticamente en el nivel superior del archivo (lo que la incluiría en el bundle inicial para el 100% de los usuarios), se importaría dinámicamente solo dentro del manejador del evento que dispara la exportación (`boton.addEventListener("click", async () => { const pdf = await import("libreria-pdf"); ... })`), de modo que el código de esa biblioteca solo se descarga para el subconjunto de usuarios que efectivamente usan esa funcionalidad.

**Criterios de éxito:**
- Propone usar `import()` dinámico dentro del manejador del evento específico, no en el nivel superior del archivo.
- Explica correctamente que esto reduce el bundle inicial para la mayoría de usuarios que nunca usan esa funcionalidad.

### Ejercicio 3: Diagnosticar un problema de exports

**Enunciado:** un proyecto configurado con `"type": "module"` en su `package.json` falla al intentar `require("./utilidad.js")` desde otro archivo del mismo proyecto. Explica por qué falla y cómo corregirlo.

**Solución esperada:** falla porque `"type": "module"` hace que todos los `.js` del proyecto se interpreten como ESM por defecto, y `require` no está disponible de forma nativa en módulos ESM (es una función específica de CommonJS). La corrección es usar `import` en vez de `require` para mantener consistencia con ESM, o renombrar el archivo específico a `.cjs` si genuinamente necesita usar CommonJS dentro de un proyecto configurado como ESM.

**Criterios de éxito:**
- Identifica correctamente que `"type": "module"` hace que `require` no esté disponible por defecto.
- Propone una corrección válida (usar `import`, o usar la extensión `.cjs` para el archivo específico).

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

- ECMA International, *ECMAScript Language Specification*.
- MDN Web Docs, guías de JavaScript y Web APIs.
- WHATWG, *HTML Living Standard* y *Fetch Standard*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- ESM es estático y analizable sin ejecutar código; CommonJS es dinámico y se resuelve en tiempo de ejecución.
- El tree-shaking depende del análisis estático que ESM habilita; code-splitting divide el bundle en chunks cargados bajo demanda.
- Vite sirve ESM nativo sin empaquetar en desarrollo (usando esbuild), y usa Rollup para el build de producción optimizado.
- `package.json` (`type`, `exports`, `scripts`) configura cómo se interpreta y se opera un proyecto o paquete.
- `import()` dinámico habilita code-splitting basado en puntos específicos del código, típicamente para lazy loading de rutas.
- Webpack, Rollup, Babel y SWC/esbuild cubren distintas necesidades del panorama de herramientas de build, aunque Vite preconfigura una combinación sensata para la mayoría de proyectos nuevos.

**Conceptos aprendidos**

- Diferencias estructurales entre ESM y CommonJS.
- Tree-shaking y code-splitting como técnicas de optimización de bundle.
- El modelo de Vite: ESM nativo en desarrollo, Rollup en producción.
- Configuración esencial de `package.json`.
- `import()` dinámico e `import.meta`.
- Panorama comparativo de Webpack, Rollup, Babel y SWC/esbuild.

**Próximos pasos**

En el Módulo 8 aprenderás a manipular el DOM y gestionar eventos del navegador directamente, antes de cualquier framework, entendiendo cómo JavaScript interactúa con una página real.

**Recursos adicionales**

- Documentación oficial de Vite (vitejs.dev).
- Node.js documentation: "Modules: ECMAScript modules" y "Modules: CommonJS modules".
- Documentación de Rollup sobre tree-shaking (rollupjs.org).
