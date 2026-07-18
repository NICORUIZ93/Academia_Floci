# Módulo 0: JSX, componentes y props

## Sílabo

**Objetivo general**

Comprender React como un modelo declarativo que describe la interfaz como una función del estado, dominar JSX como azúcar sintáctica sobre `createElement`, y construir componentes reutilizables mediante composición.

**Objetivos específicos**

1. Explicar qué transforma realmente JSX por debajo.
2. Renderizar listas con `key` estable y explicar por qué el índice es riesgoso.
3. Componer componentes pequeños usando `children` en vez de herencia.
4. Aplicar renderizado condicional con `&&` y el operador ternario, sabiendo cuándo usar cada uno.
5. Explicar la diferencia entre React describiendo la UI declarativamente y la manipulación imperativa del DOM.

**Contenido**

- JSX: expresiones embebidas y listas con `key`.
- Componentes de función y props.
- Composición frente a herencia.
- Renderizado condicional.
- Fragments (`<> </>`) y `children`.
- Estilos: CSS Modules, Styled Components y Tailwind.

**Evaluación**

Set de componentes de presentación reutilizables (botón, tarjeta, lista), más tres ejercicios de evaluación.

---

## Comienza desde cero: prepara este capítulo

Este recorrido parte de una carpeta vacía. Al finalizar tendrás **Set de componentes de presentación reutilizables (botón, tarjeta, lista), más tres ejercicios de evaluación.** No avances ejecutando comandos que no comprendes: primero identifica la entrada, la transformación y la evidencia que comprobará el resultado.

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
npm create vite@latest academia-labs/react-app -- --template react-ts
cd academia-labs/react-app
npm install
git init
```

Trabaja dentro de `academia-labs/react-app`. Si ya existe, no lo vuelvas a generar: entra en la carpeta, confirma `git status` y continúa sobre una rama propia.

### 3. Ubica cada tema antes de escribir

```text
academia-labs/react-app/
├─ src/features/
│  └─ module-0/
├─ tests/
├─ docs/decisions/
├─ evidence/module-0/
└─ README.md
```

| Tema | Archivo o decisión | Evidencia mínima |
|---|---|---|
| 1. JSX es azúcar sintáctica sobre createElement | `src/features/module-0/topic-1-jsx-es-azucar-sintactica-sobre-createelement.tsx` | prueba + salida observable |
| 2. Listas con key estable | `src/features/module-0/topic-2-listas-con-key-estable.tsx` | prueba + salida observable |
| 3. Composición sobre herencia, y Fragments | `src/features/module-0/topic-3-composicion-sobre-herencia-y-fragments.tsx` | prueba + salida observable |
| 4. Renderizado condicional y estilos | `src/features/module-0/topic-4-renderizado-condicional-y-estilos.tsx` | prueba + salida observable |

Un ejemplo técnico vive en el archivo indicado y debe tener una prueba. Un tema conceptual vive en `docs/decisions/`: compara opciones usando restricciones medibles; no escribas código decorativo solo para llenar espacio.

### 4. Ejecuta una línea base

Desde `academia-labs/react-app`:

```bash
npm test -- --run && npm run dev
```

**Resultado esperado:** el comando reconoce el proyecto y termina sin errores antes de introducir el cambio del capítulo. Después del incremento, la evidencia debe demostrar: **Set de componentes de presentación reutilizables (botón, tarjeta, lista), más tres ejercicios de evaluación.**

Si falla la línea base, no continúes. Localiza el primer mensaje que indique archivo, línea o dependencia; formula una causa y compruébala con un cambio pequeño.

### 5. Provoca un fallo y recupérate

Cambia una prop o respuesta a un caso vacío o erróneo; observa el estado visual y corrige desde la primera causa. Guarda en `evidence/module-0/` el comando, la salida relevante, tu hipótesis y la corrección. Revierte únicamente el cambio deliberado; no borres todo el proyecto para ocultar la causa.

### 6. Conecta el capítulo con RutaFlow

Aplica el aprendizaje de **JSX, componentes y props** a un incremento vertical de RutaFlow. Define qué componente produce el dato, qué contrato lo transporta, quién lo consume y cómo observarás un fallo. La entrega final incluye archivo o decisión, prueba, salida, error corregido y una limitación que todavía validarías en producción.

---

## Antes de comenzar: instala el entorno

React se estudia en el navegador, pero sus herramientas se ejecutan con Node.js. Instala **Node.js LTS**, **Git**, **Visual Studio Code** y un navegador moderno (Chrome, Edge o Firefox). No necesitas instalar React globalmente.

| Sistema | Instalación recomendada | Verificación |
|---|---|---|
| Windows | Instaladores oficiales de Node.js, Git y VS Code | `node -v`, `npm -v`, `git --version` en PowerShell |
| macOS | `brew install node git` después de instalar Homebrew | Los mismos tres comandos en Terminal |
| Ubuntu/Debian | Git con `apt`; Node LTS con `nvm` o NodeSource; VS Code desde su sitio oficial | Los mismos comandos en la terminal de VS Code |

### Crea tu primera aplicación

```bash
npm create vite@latest mi-react -- --template react
cd mi-react
npm install
npm run dev
```

Abre la dirección que muestra la terminal, normalmente `http://localhost:5173`. Edita `src/App.jsx`, guarda y confirma que el navegador cambia sin reiniciar el servidor. `npm install` descarga dependencias; `npm run dev` inicia el entorno de desarrollo; `Ctrl+C` lo detiene. Si aparece un error de permisos, no uses `sudo npm`: instala Node mediante `nvm` y vuelve a intentarlo.

## Contenido teórico

### Tema 1: JSX es azúcar sintáctica sobre createElement

**Conceptos clave:** `createElement`, expresiones embebidas, JSX no es HTML.

JSX es una extensión de sintaxis de JavaScript que permite escribir marcado similar a HTML directamente dentro de código JavaScript (`<button onClick={onClick}>{texto}</button>`), pero JSX no es HTML ni un lenguaje de plantillas propio: es transformado en tiempo de compilación (por Babel o el compilador integrado en el toolchain del proyecto) a llamadas planas de `React.createElement(tipo, props, ...hijos)`, que a su vez producen objetos JavaScript planos que describen qué debe renderizarse, no el elemento DOM real todavía. Esta transformación explica por qué las llaves `{}` dentro de JSX embeben cualquier expresión JavaScript válida (no solo texto): `{texto}` no es una plantilla de texto especial, es literalmente un argumento pasado a `createElement`, y por lo tanto puede ser cualquier expresión: una variable, una llamada a función, una expresión ternaria, o incluso otro elemento JSX anidado.

Comprender que JSX se convierte en llamadas a función explica comportamientos que de otro modo parecerían mágicos: por qué un componente debe devolver un único elemento raíz (porque `createElement` devuelve un único objeto, no una lista suelta de objetos, de ahí la necesidad de Fragments, Tema 3), por qué los atributos usan `className` en vez de `class` (`class` es una palabra reservada en JavaScript, por lo que no puede usarse como nombre de prop), y por qué JSX permite mezclar libremente lógica JavaScript y marcado, algo que un motor de plantillas tradicional (como los estudiados en frameworks basados en archivos `.html` separados) no permite con la misma naturalidad.

**Analogía:** JSX es como una notación taquigráfica para escribir instrucciones detalladas de ensamblaje: no es el objeto ensamblado en sí, sino una forma más legible de escribir exactamente las mismas instrucciones (`createElement(...)`) que, de escribirse literalmente, serían mucho más verbosas y difíciles de leer a simple vista.

**¿Por qué es importante?** Entender que JSX es azúcar sintáctica sobre `createElement` explica por qué las llaves embeben cualquier expresión JavaScript, por qué un componente devuelve un único elemento raíz, y por qué se usa `className` en vez de `class`.

**Diagrama:**

```jsx
function Boton({ texto, onClick }) {
  return <button onClick={onClick}>{texto}</button>;
}
// Se transforma en:
// React.createElement('button', { onClick }, texto)
```

### Tema 2: Listas con key estable

**Conceptos clave:** identidad de elementos entre renders, riesgo del índice como key.

Cuando React renderiza una lista de elementos generada dinámicamente (típicamente con `.map()`), necesita una forma de identificar de forma estable qué elemento de una nueva lista corresponde a cuál elemento de la lista anterior, para decidir eficientemente qué debe actualizar, cuál debe reordenar, y cuál debe crear o eliminar del DOM real, en vez de descartar y recrear la lista completa en cada cambio; la prop especial `key` (`<li key={tarea.id}>{tarea.titulo}</li>`) es exactamente esa identidad estable que React usa para esa comparación entre renders sucesivos.

Usar el índice del array como `key` (`key={indice}`) parece funcionar en casos simples, pero se vuelve problemático en cuanto la lista se reordena, se filtra, o se inserta un elemento en medio: dado que el índice de un elemento cambia cuando la lista cambia de orden o de longitud, React puede terminar asociando el estado interno o las referencias del DOM del elemento equivocado a la posición equivocada (por ejemplo, si un input controlado con estado propio está dentro de cada fila, y la fila se reordena, el valor tecleado en el input puede aparecer asociado a la fila incorrecta tras el reordenamiento, porque React identificó las filas por posición, no por identidad real). Usar un identificador estable e inherente al dato (`tarea.id`, no su posición circunstancial en el array actual) evita completamente este problema, porque esa identidad no cambia sin importar cómo se reordene o filtre la lista.

**Analogía:** usar el índice como key es como identificar a las personas de una fila por su posición ("la tercera persona") en vez de por su nombre: si la fila se reordena, "la tercera persona" pasa a ser alguien completamente distinto, aunque la persona original que ocupaba esa posición siga siendo la misma persona en otra posición nueva de la fila.

**¿Por qué es importante?** Una `key` estable e inherente al dato (no la posición circunstancial) evita que React asocie estado o referencias del DOM al elemento equivocado cuando una lista se reordena, filtra, o modifica.

**Diagrama:**

```jsx
{tareas.map(tarea => <li key={tarea.id}>{tarea.titulo}</li>)}
// key={tarea.id}: estable sin importar el orden
// key={indice}: riesgoso si la lista se reordena o filtra
```

### Tema 3: Composición sobre herencia, y Fragments

**Conceptos clave:** `children`, composición de componentes pequeños, `<> </>`.

React favorece deliberadamente la composición de componentes pequeños sobre la herencia de clases como mecanismo de reutilización de UI: en vez de crear una jerarquía de clases donde un componente "TarjetaEspecial" hereda de un componente "Tarjeta" base y sobreescribe cierto comportamiento (el patrón típico de programación orientada a objetos tradicional), React resuelve el mismo problema componiendo componentes pequeños e independientes entre sí, pasando contenido a través de la prop especial `children` (`function Tarjeta({ children }) { return <div className="tarjeta">{children}</div>; }`, usado como `<Tarjeta><Avatar /><Nombre texto="Ana" /></Tarjeta>`), donde `Tarjeta` no necesita saber nada específico sobre qué contenido recibirá, simplemente lo envuelve en su propio marcado estructural.

Este enfoque de composición evita los problemas clásicos de jerarquías de herencia profundas y rígidas (donde cambiar el comportamiento de una clase base afecta impredeciblemente a todas sus subclases, un problema estudiado de forma más general en el Módulo 4 del track de JavaScript sobre composición frente a herencia), permitiendo en cambio ensamblar interfaces complejas a partir de piezas pequeñas, independientes y fácilmente reemplazables, cada una con una única responsabilidad clara.

Los Fragments (`<> </>`, o explícitamente `<React.Fragment>`) resuelven la restricción de que un componente debe devolver un único elemento raíz (Tema 1) sin necesidad de envolver el contenido en un `<div>` adicional puramente estructural que no tiene ningún propósito semántico ni visual real, evitando anidar el DOM con contenedores vacíos innecesarios que no aportan nada más que cumplir la restricción técnica de un único elemento raíz.

**Analogía:** la composición es como construir con bloques de Lego pequeños e intercambiables, cada uno con una función clara, ensamblados según se necesite; la herencia profunda es como fabricar una pieza única y rígida hecha a medida para un caso específico, difícil de adaptar o reutilizar para un caso ligeramente distinto.

**¿Por qué es importante?** Componer componentes pequeños con `children` produce piezas de UI más reutilizables e independientes entre sí que una jerarquía de herencia rígida; los Fragments evitan contenedores DOM innecesarios que la restricción de un único elemento raíz de otro modo forzaría.

**Diagrama:**

```jsx
function Tarjeta({ children }) {
  return <div className="tarjeta">{children}</div>;
}

<Tarjeta><Avatar /><Nombre texto="Ana" /></Tarjeta>
// Composición: Tarjeta no sabe qué contenido recibirá, solo lo envuelve
```

### Tema 4: Renderizado condicional y estilos

**Conceptos clave:** `&&` frente a ternario, CSS Modules, Styled Components, Tailwind.

El renderizado condicional en JSX aprovecha directamente el comportamiento de cortocircuito de JavaScript: `{cargando && <Spinner />}` renderiza `<Spinner />` únicamente si `cargando` es verdadero (y no renderiza nada, ni siquiera un elemento vacío, si es falso, gracias al cortocircuito del operador `&&`), apropiado cuando existen solo dos posibilidades: mostrar algo, o no mostrar nada en absoluto. El operador ternario (`{usuario ? <Perfil usuario={usuario} /> : <BotonLogin />}`) es apropiado en cambio cuando existen genuinamente dos alternativas de contenido a mostrar, cada una con su propio elemento, no simplemente "algo o nada".

Angular resuelve este mismo problema con `@if`/`@else` como sintaxis dedicada de plantilla (Módulo 1 del track de Angular); React, al no tener un lenguaje de plantillas separado (JSX es simplemente JavaScript, Tema 1), reutiliza directamente los operadores lógicos y condicionales nativos del lenguaje para expresar la misma idea, sin necesidad de sintaxis adicional dedicada.

En cuanto a estilos, CSS Modules generan nombres de clase únicos automáticamente por archivo (evitando colisiones globales de nombres de clase entre componentes distintos), Styled Components permite escribir CSS directamente dentro de JavaScript usando template literals etiquetados, generando componentes con estilos encapsulados, y Tailwind aplica utilidades CSS predefinidas directamente como clases en el marcado (`className="flex items-center gap-2"`), cada enfoque con un balance distinto entre localidad del estilo, curva de aprendizaje, y velocidad de desarrollo.

**Analogía:** `&&` es como una puerta que solo se abre si la condición se cumple, sin alternativa; el ternario es como una bifurcación de caminos donde ambas ramas llevan a algún destino concreto, no a la nada.

**¿Por qué es importante?** Elegir entre `&&` y el ternario según si existe una única alternativa condicional o dos alternativas de contenido reales produce código de renderizado condicional más claro y predecible.

**Diagrama:**

```jsx
{cargando && <Spinner />}                              // algo o nada
{usuario ? <Perfil usuario={usuario} /> : <BotonLogin />}  // dos alternativas reales
```

---

## Ruta de proyecto progresivo desde carpeta vacía

No crees un proyecto desechable por módulo. Conserva un único repositorio que evoluciona durante todo el track y etiqueta cada hito (`git tag modulo-N`). Empieza con `npm create vite@latest academia-react -- --template react-ts && cd academia-react && git init`. Ejecuta el comando paso a paso, inspecciona los archivos generados y registra versiones y precondiciones en el README.

| Hito | Evolución acumulativa | Evidencia antes de avanzar |
|---|---|---|
| Base | componentes y estado. | Arranque reproducible, commit limpio y prueba mínima. |
| Aplicación | rutas, formularios y datos. | Casos normales, límite y error automatizados. |
| Integración | Conecta capas y reemplaza dobles por infraestructura controlada. | Diagrama, contratos y prueba de integración. |
| Experto | arquitectura, accesibilidad y producción. | Perfil o threat model, telemetría y runbook de recuperación. |

Al iniciar cada laboratorio crea una rama `modulo-N`, implementa el incremento, verifica el criterio de éxito y fusiona solo con pruebas verdes. Si un módulo necesita un experimento aislado, colócalo en `experiments/modulo-N/`; el producto acumulativo permanece ejecutable. Al terminar, otra persona debe poder clonar el repositorio y reproducir el último hito siguiendo únicamente el README.

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

**Objetivo del laboratorio:** construir un set de componentes de presentación reutilizables (botón, tarjeta, lista) con JSX, composición y renderizado condicional.

**Requisitos previos:** conocimientos de JavaScript ES6+ (Módulos del track de JavaScript).

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Crear `Boton` con props `texto`/`onClick` | Ver Tema 1 | Componente de función simple |
| 2 | Renderizar una lista con `key` estable | Ver Tema 2 | Usa `tarea.id`, no el índice |
| 3 | Crear `Tarjeta` con `children` | Ver Tema 3 | Composición sin herencia |
| 4 | Implementar renderizado condicional | Ver Tema 4 | `&&` y ternario según el caso |
| 5 | Componer `Avatar`, `Nombre` y `Tarjeta` en `Usuario` | Ver Tema 3 | Sin usar herencia |

**Verificación:** el laboratorio se considera exitoso si la lista renderizada mantiene el estado correcto de cada fila al reordenar (verificable con un input controlado por fila), y si los componentes se ensamblan mediante composición, sin ninguna clase que herede de otra.

**Errores comunes y soluciones**

- **Usar el índice del array como key.** Usa siempre un identificador estable inherente al dato (`item.id`).
- **Olvidar que un componente debe devolver un único elemento raíz.** Envuelve en un Fragment (`<>`) si no necesitas un `<div>` real.
- **Confundir `class` con `className`.** JSX usa `className` porque `class` es palabra reservada en JavaScript.

---

## Ejercicios de evaluación

### Ejercicio 1: Por qué el índice como key es riesgoso

**Enunciado:** explica con un ejemplo concreto por qué usar el índice del array como `key` puede causar bugs sutiles al reordenar una lista con inputs controlados por fila.

**Solución esperada:** si cada fila tiene un input con estado propio, y la lista se reordena, React identifica las filas por su posición (el índice), no por su identidad real; al reordenarse, la fila que antes ocupaba la posición 2 ahora puede ocupar la posición 0, pero React, guiándose por el índice como key, puede reutilizar el DOM (y el estado del input) de la posición 0 anterior para el nuevo contenido en esa posición, haciendo que el valor tecleado aparezca asociado a la fila incorrecta.

**Criterios de éxito:**
- Explica correctamente que el índice cambia con el reordenamiento mientras la identidad real del dato no cambia, y las consecuencias de esa discrepancia.

### Ejercicio 2: JSX y createElement

**Enunciado:** explica qué transforma realmente el compilador cuando procesa `<button onClick={onClick}>{texto}</button>`.

**Solución esperada:** el compilador transforma esa expresión JSX en una llamada `React.createElement('button', { onClick }, texto)`, que devuelve un objeto JavaScript plano que describe el elemento a renderizar, no un elemento DOM real todavía.

**Criterios de éxito:**
- Explica correctamente la transformación a `createElement` y que el resultado es un objeto descriptivo, no el DOM real.

### Ejercicio 3: && frente a ternario

**Enunciado:** ¿cuándo usarías `{condicion && <Componente />}` en vez de `{condicion ? <A /> : <B />}`?

**Solución esperada:** `&&` es apropiado cuando existen solo dos posibilidades: mostrar el componente, o no mostrar nada en absoluto; el ternario es apropiado cuando existen dos alternativas de contenido reales que mostrar, cada una con su propio elemento concreto.

**Criterios de éxito:**
- Distingue correctamente el caso de "algo o nada" del caso de "dos alternativas reales".

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

- Meta Open Source, *React Documentation*.
- WHATWG, estándares de DOM, HTML y Fetch.
- W3C, *Web Content Accessibility Guidelines (WCAG)*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- JSX es azúcar sintáctica sobre `createElement`, no un lenguaje de plantillas separado.
- Una `key` estable e inherente al dato evita bugs sutiles al reordenar listas.
- React favorece composición de componentes pequeños con `children` sobre herencia de clases.
- El renderizado condicional reutiliza operadores nativos de JavaScript (`&&`, ternario).

**Conceptos aprendidos**

- JSX y su transformación a `createElement`.
- Listas con `key` estable.
- Composición sobre herencia y Fragments.
- Renderizado condicional y opciones de estilado.

**Próximos pasos**

En el Módulo 1 aprenderás estado local y el ciclo de render: `useState`, actualizaciones funcionales, render vs commit, y batching.

**Recursos adicionales**

- Documentación oficial de React (react.dev): "Writing Markup with JSX" y "Rendering Lists".
- Ejemplos de código ejecutables de este track, en JSX: carpeta [`examples/tracks/react/`](https://github.com/NICORUIZ93/Academia_Floci/tree/main/examples/tracks/react) del repositorio — `hooks-state.jsx` (Módulos 1-2), `custom-hook.jsx` (Módulo 2), `context-provider.jsx` (Módulo 4), `router-setup.jsx` (Módulo 5), `data-fetching.jsx` (Módulo 6).
