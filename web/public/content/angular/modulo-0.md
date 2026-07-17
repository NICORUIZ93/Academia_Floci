# Módulo 0: Fundamentos y Angular CLI

## Sílabo

**Objetivo general**

Arrancar con la versión moderna de Angular (standalone por defecto) entendiendo exactamente qué genera el CLI antes de tocar código, y reforzar el TypeScript necesario para ser productivo desde el primer módulo.

**Objetivos específicos**

1. Usar `ng new` y `ng generate` para crear un proyecto y sus artefactos (componentes, servicios).
2. Explicar por qué un proyecto generado hoy no contiene ningún `NgModule`.
3. Distinguir interpolación de property binding y elegir correctamente entre ambos.
4. Diferenciar `unknown`, `any` y `never`, y usar utility types (`Partial`, `Pick`, `Omit`, `Record`).
5. Explicar la diferencia entre el compilador AOT y JIT.

**Contenido**

- `ng new`, `ng generate` y estructura de proyecto.
- Standalone components por defecto (desde Angular 17+).
- Interpolación y property binding.
- Ciclo de build y dev server.
- TypeScript a fondo: `unknown` vs `any` vs `never`, uniones/intersecciones, utility types.
- `ng generate component/service/directive/pipe/guard/interceptor`.
- Compilador AOT vs JIT.

**Evaluación**

Un proyecto Angular nuevo con un componente propio renderizando datos dinámicos, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: El CLI ya no genera NgModules

**Conceptos clave:** standalone por defecto, `ng new`, `ng generate`.

Desde Angular 17, `ng new mi-app` genera un proyecto completamente standalone por defecto: no existe ningún `AppModule`, ni ningún archivo `declarations`/`imports` de módulo tradicional. Cada componente declara directamente, en su propio decorador `@Component`, qué otras piezas (otros componentes, directivas, pipes) necesita importar para funcionar, eliminando por completo la capa intermedia de organización que los `NgModule` representaban durante los primeros años de vida del framework. Esta es, posiblemente, la diferencia más visible e inmediata para cualquiera que haya aprendido Angular antes de esta transición y vuelva a un proyecto generado hoy: la estructura de carpetas es más simple, y no hay que rastrear en qué módulo está declarado un componente para entender si es utilizable en cierto contexto.

`ng generate component tarjeta` (o su forma abreviada `ng g c tarjeta`) crea un componente standalone, con su archivo de plantilla, sus estilos, y (según la configuración) un archivo de pruebas asociado, sin generar ni modificar ningún módulo. El CLI ofrece generadores equivalentes para las demás piezas fundamentales de Angular: `ng generate service`, `directive`, `pipe`, `guard` e `interceptor`, cada uno produciendo el andamiaje mínimo correcto y siguiendo las convenciones de nombrado y estructura recomendadas por el propio equipo de Angular, evitando que cada desarrollador tenga que recordar manualmente la sintaxis exacta de cada decorador y sus opciones desde cero.

Recorrer la estructura generada por `ng new` —`src/app` con el componente raíz, `angular.json` con la configuración de build y de herramientas del proyecto, `tsconfig.json` con la configuración del compilador de TypeScript— antes de escribir cualquier código propio es un paso de orientación valioso: entender qué generó el CLI automáticamente (y por qué) evita la sensación de "magia" al trabajar con el framework, y facilita saber exactamente dónde buscar o modificar cada aspecto de la configuración del proyecto cuando sea necesario más adelante.

**Analogía:** un proyecto Angular generado hoy es como una casa moderna de planta abierta, donde cada habitación (componente) tiene acceso directo a lo que necesita sin pasar por un pasillo central obligatorio (el antiguo `NgModule`); un proyecto Angular antiguo era como una casa con habitaciones organizadas estrictamente por ala, donde cada ala (módulo) debía declarar explícitamente qué habitaciones contenía antes de que fueran accesibles desde fuera de esa ala.

**¿Por qué es importante?** Entender que los proyectos Angular modernos no usan `NgModule` es el punto de partida indispensable para todo lo demás en este track: gran parte de la complejidad organizativa que Angular tenía fama de requerir en el pasado ya no aplica al Angular que se enseña y se usa hoy.

**Diagrama:**

```bash
ng new mi-app
ng generate component tarjeta   # standalone, sin tocar ningún módulo
ng serve                         # dev server con hot-reload
```
```ts
@Component({ selector: 'app-tarjeta', template: `<h2>{{ titulo }}</h2>` })
export class Tarjeta { titulo = 'Hola Angular'; }
```

### Tema 2: Interpolación y property binding

**Conceptos clave:** `{{ }}` frente a `[propiedad]`, texto frente a propiedad del DOM real.

La interpolación (`{{ expresion }}`) siempre produce texto: Angular evalúa la expresión y la inserta como contenido textual en el lugar donde aparece dentro de la plantilla, apropiada para mostrar valores dentro del contenido visible de un elemento. El property binding (`[propiedad]="expresion"`) es conceptualmente distinto: enlaza directamente con una propiedad real del objeto DOM subyacente (no con un atributo HTML del marcado), una distinción que en la mayoría de casos simples es invisible pero que importa concretamente en casos como `[disabled]` o `[value]` de un input, donde la propiedad del DOM y el atributo HTML original pueden desincronizarse en tiempo de ejecución (por ejemplo, el atributo HTML `value` refleja el valor inicial con el que se cargó la página, mientras que la propiedad `value` del DOM refleja el valor actual real, que puede haber cambiado desde entonces por interacción del usuario).

Usar `[disabled]="cargando"` en vez de simplemente escribir el atributo `disabled` de forma estática permite que ese estado cambie dinámicamente según el valor de la expresión `cargando` evaluada en cada ciclo de detección de cambios, mientras que escribir literalmente el atributo `disabled` en el HTML (sin corchetes) lo dejaría siempre presente e inmutable, sin ninguna posibilidad de alternarlo dinámicamente según el estado del componente.

Elegir correctamente entre interpolación y property binding no es una cuestión de preferencia estilística: interpolación es la herramienta correcta para mostrar contenido textual dentro del cuerpo de un elemento; property binding es la herramienta correcta para controlar dinámicamente cualquier propiedad del elemento (atributos booleanos, URLs de imágenes, clases, estilos, o cualquier propiedad específica del DOM), y confundir ambos (por ejemplo, intentar interpolar dentro de un atributo que requiere binding real) produce comportamientos incorrectos o simplemente no funciona según lo esperado.

**Analogía:** la interpolación es como escribir directamente un cartel de texto visible; el property binding es como ajustar un control eléctrico real del propio dispositivo (como el interruptor de encendido/apagado), no simplemente escribir la palabra "encendido" en una etiqueta decorativa sin ninguna conexión real al estado funcional del dispositivo.

**¿Por qué es importante?** Distinguir correctamente cuándo usar interpolación frente a property binding evita errores sutiles al intentar controlar dinámicamente propiedades del DOM (como `disabled` o `value`) usando la herramienta equivocada.

**Diagrama:**

```html
<h2>{{ titulo }}</h2>              <!-- interpolación: texto -->
<img [src]="urlImagen" />           <!-- property binding: propiedad real del DOM -->
<button [disabled]="cargando">Enviar</button>
```

### Tema 3: TypeScript a fondo — unknown, any, never y utility types

**Conceptos clave:** `unknown` frente a `any`, `never` como tipo vacío, tipos utilitarios integrados.

`any` (estudiado ya como antipatrón en el Módulo 11 del track de JavaScript) desactiva completamente la verificación de tipos sobre un valor; `unknown` es la alternativa segura para representar un valor cuyo tipo genuinamente no se conoce de antemano (por ejemplo, el resultado de `JSON.parse()`, cuyo tipo real depende del contenido del string parseado): a diferencia de `any`, TypeScript exige realizar narrowing explícito (verificar el tipo real con `typeof`, `instanceof`, o un type guard personalizado, como se estudió en el Módulo 11 del track de JavaScript) antes de permitir cualquier operación específica sobre un valor de tipo `unknown`, preservando así la seguridad de tipos incluso para valores genuinamente inciertos en su origen.

`never` representa un tipo que nunca tiene ningún valor posible: es el tipo de retorno de una función que siempre lanza una excepción o que nunca termina (un bucle infinito deliberado), y aparece también como resultado de un narrowing exhaustivo que descarta todos los casos posibles de una unión (útil para que el compilador verifique, mediante una función auxiliar que solo acepta `never` como parámetro, que un `switch` sobre una unión de tipos maneja verdaderamente todos los casos posibles, generando un error de compilación si se añade un nuevo caso a la unión sin actualizar el `switch` correspondiente).

Los utility types integrados en TypeScript transforman tipos existentes sin necesidad de redeclararlos manualmente: `Partial<T>` convierte todas las propiedades de `T` en opcionales (útil para representar una actualización parcial de un objeto); `Pick<T, K>` selecciona solo un subconjunto específico de propiedades de `T`; `Omit<T, K>` hace lo contrario, excluyendo propiedades específicas; y `Record<K, V>` construye un tipo de objeto con un conjunto de claves de tipo `K`, cada una asociada a un valor de tipo `V`, útil para tipar diccionarios o mapeos donde las claves provienen de un conjunto conocido de valores literales.

**Analogía:** `any` es como aceptar cualquier paquete sin revisar su contenido en absoluto; `unknown` es como aceptar un paquete cerrado que debes abrir y verificar explícitamente su contenido antes de poder usarlo para cualquier propósito específico; `never` es como una casilla que, por diseño, nunca puede contener nada, útil precisamente para verificar que ningún caso inesperado quedó sin cubrir en una lista de posibilidades.

**¿Por qué es importante?** `unknown` preserva seguridad de tipos donde `any` la sacrifica completamente; `never` permite verificaciones exhaustivas verificadas por el compilador; los utility types evitan redeclarar manualmente variantes de un mismo tipo base, patrones que aparecerán constantemente en el código Angular idiomático de los módulos siguientes.

**Diagrama:**

```ts
function procesar(valor: unknown) {
  if (typeof valor === "string") valor.toUpperCase(); // narrowing exigido
}
type TareaParcial = Partial<Tarea>;       // todas las props opcionales
type SoloTitulo = Pick<Tarea, "titulo">;   // solo esa propiedad
type ContadorPorEstado = Record<"pendiente"|"hecha", number>;
```

### Tema 4: Compilador AOT frente a JIT

**Conceptos clave:** Ahead-of-Time frente a Just-in-Time, compilación de plantillas.

Angular compila las plantillas HTML de los componentes (con su sintaxis específica de interpolación, bindings y control de flujo) hacia código JavaScript ejecutable, y este proceso de compilación puede ocurrir en dos momentos distintos. AOT (Ahead-of-Time) compila las plantillas durante el proceso de build, antes de que la aplicación se despliegue, produciendo un bundle que ya contiene JavaScript puro listo para ejecutarse directamente en el navegador sin ningún paso adicional de compilación en tiempo de ejecución. JIT (Just-in-Time), el modo histórico y ahora prácticamente en desuso para producción, compilaba las plantillas directamente en el navegador del usuario, en el momento en que la aplicación arrancaba, añadiendo el compilador completo de Angular al bundle final y un coste de tiempo de arranque adicional en cada carga de la aplicación.

AOT es el modo por defecto y recomendado para producción desde hace ya varias versiones mayores de Angular, y ofrece ventajas concretas y medibles: bundles más pequeños (el compilador de plantillas no necesita incluirse en el bundle de producción, solo el resultado ya compilado), arranque más rápido (no hay ningún trabajo de compilación de plantillas que realizar en el navegador del usuario), y detección más temprana de errores de plantilla (errores de sintaxis o de tipos en un binding se detectan durante el build, no en tiempo de ejecución tras haberse desplegado ya a usuarios reales).

`ng build` usa AOT por defecto; `ng serve` durante desarrollo también usa AOT en las versiones modernas del CLI (a diferencia de versiones muy antiguas de Angular, donde el modo de desarrollo usaba JIT por su compilación incremental más rápida), reflejando la madurez actual de las herramientas de build de Angular, que logran tiempos de compilación AOT suficientemente rápidos incluso para el ciclo de desarrollo iterativo cotidiano, eliminando la necesidad práctica de mantener JIT como una alternativa relevante salvo en escenarios muy específicos y poco comunes.

**Analogía:** AOT es como traducir completamente un libro a otro idioma antes de imprimirlo y distribuirlo, entregando a cada lector un libro ya listo para leer directamente; JIT sería como entregar el libro en su idioma original junto con un traductor humano que debe traducir cada página en tiempo real mientras el lector espera, un proceso evidentemente más lento en el momento del consumo real.

**¿Por qué es importante?** AOT produce bundles más pequeños, arranque más rápido, y detección más temprana de errores de plantilla, siendo el modo estándar y por defecto de Angular moderno tanto en desarrollo como en producción.

**Diagrama:**

```
JIT (histórico): plantillas compiladas EN el navegador del usuario, en cada arranque
AOT (moderno, por defecto): plantillas compiladas durante el build,
                             el navegador recibe JavaScript puro listo para ejecutar
```

---

## Laboratorio práctico

**Objetivo del laboratorio:** crear un proyecto Angular nuevo, generar un componente propio, y renderizar datos dinámicos usando interpolación y property binding correctamente.

**Requisitos previos:** Node.js instalado, Angular CLI instalado globalmente (`npm install -g @angular/cli`).

| Paso | Acción | Comando/Código | Explicación |
|---|---|---|---|
| 1 | Crear el proyecto | `ng new mi-app` | Recorre `src/app`, `angular.json`, `tsconfig.json` |
| 2 | Generar un componente | `ng generate component tarjeta` | Verifica que NO se crea ningún `NgModule` |
| 3 | Interpolar y hacer property binding | `{{ titulo }}` y `[disabled]="cargando"` | Verifica la diferencia observando el DOM real |
| 4 | Levantar el dev server | `ng serve` | Modifica el componente y observa el hot-reload |
| 5 | Ejecutar el build de producción | `ng build` | Identifica el bundle principal en `dist/` |

**Verificación:** el laboratorio se considera exitoso si el componente `tarjeta` renderiza correctamente datos dinámicos mediante interpolación y controla al menos una propiedad del DOM mediante property binding, con el dev server reflejando cambios en vivo.

**Errores comunes y soluciones**

- **Esperar encontrar un `AppModule` en un proyecto generado hoy.** Los proyectos modernos son standalone por defecto; no hay ningún módulo que buscar.
- **Confundir interpolación con property binding para un atributo booleano como `disabled`.** Usa siempre `[disabled]="expresion"`, nunca interpolación, para controlar propiedades dinámicamente.
- **Usar `any` en vez de `unknown` para un valor de tipo genuinamente incierto.** Prefiere `unknown` y narrowing explícito para preservar seguridad de tipos.

---

## Ejercicios de evaluación

### Ejercicio 1: Qué eliminó el Angular moderno

**Enunciado:** explica qué generaba `ng new` hace algunos años que ya no forma parte de un proyecto Angular generado hoy, y qué reemplaza esa funcionalidad.

**Solución esperada:** generaba un `AppModule` (y NgModules en general) que declaraba explícitamente qué componentes, directivas y pipes pertenecían a cada módulo, y qué módulos importaba cada uno; hoy cada componente standalone declara directamente sus propias dependencias en su propio `@Component({imports: [...]})`, eliminando la capa intermedia de organización por módulos.

**Criterios de éxito:**
- Identifica correctamente los NgModules como lo eliminado.
- Explica que cada componente ahora declara sus propias dependencias directamente.

### Ejercicio 2: Interpolación frente a property binding

**Enunciado:** explica por qué `<button disabled="{{ cargando }}">` no funciona como se espera, y cómo corregirlo.

**Solución esperada:** la interpolación siempre produce texto, así que `disabled="{{ cargando }}"` establecería el atributo `disabled` a la representación textual del valor (por ejemplo, el string `"false"`), y en HTML la sola presencia del atributo `disabled` (independientemente de su valor textual) deshabilita el botón, incluso si el texto dice "false". La corrección correcta es usar property binding: `[disabled]="cargando"`, que enlaza directamente con la propiedad booleana real del DOM.

**Criterios de éxito:**
- Explica correctamente por qué la interpolación produce el bug (presencia del atributo, no su valor textual).
- Propone la corrección con `[disabled]`.

### Ejercicio 3: unknown frente a any

**Enunciado:** dado `const datos: unknown = JSON.parse(texto);`, explica por qué TypeScript no permite `datos.nombre` directamente, y qué se necesita para acceder a esa propiedad de forma segura.

**Solución esperada:** TypeScript no permite acceder a propiedades de un valor `unknown` sin antes realizar narrowing explícito, porque el tipo real del valor no se conoce de antemano; se necesita verificar explícitamente la forma esperada (por ejemplo, con un type guard que confirme que `datos` es un objeto con una propiedad `nombre` de tipo `string`) antes de que TypeScript permita el acceso de forma segura.

**Criterios de éxito:**
- Explica correctamente que `unknown` exige narrowing antes de cualquier operación específica.
- Propone un mecanismo válido de narrowing (type guard, verificación de forma).

---

## Resumen del módulo

**Puntos clave**

- Los proyectos Angular modernos son standalone por defecto: no hay `NgModule`, cada componente declara sus propias dependencias.
- La interpolación siempre produce texto; el property binding enlaza directamente con una propiedad real del DOM.
- `unknown` preserva seguridad de tipos exigiendo narrowing explícito, a diferencia de `any`; los utility types (`Partial`, `Pick`, `Omit`, `Record`) transforman tipos existentes sin redeclararlos.
- AOT compila las plantillas durante el build, produciendo bundles más pequeños y arranque más rápido que el históricamente usado JIT.

**Conceptos aprendidos**

- Estructura de un proyecto Angular moderno y los generadores del CLI.
- Diferencia entre interpolación y property binding.
- TypeScript avanzado: `unknown`, `never` y utility types.
- Compilación AOT frente a JIT.

**Próximos pasos**

En el Módulo 1 profundizarás en componentes, plantillas y data binding: inputs/outputs basados en signals, control de flujo nativo (`@if`/`@for`), content projection y el ciclo de vida completo de un componente.

**Recursos adicionales**

- Documentación oficial de Angular (angular.dev), sección "Essentials".
- TypeScript Handbook: "Utility Types".
- Ejemplos de código ejecutables de este track, en TypeScript: carpeta [`examples/tracks/angular/`](https://github.com/NICORUIZ93/Academia_Floci/tree/main/examples/tracks/angular) del repositorio — `signals-counter.ts` (Módulo 2), `di-service.ts` (Módulo 3), `routing-guard.ts` (Módulo 4), `reactive-form.ts` (Módulo 5), `http-interceptor.ts` (Módulo 7).
