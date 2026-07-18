# Módulo 11: Performance, SSR y zoneless

## Sílabo

**Objetivo general**

Mejorar el rendimiento percibido y real de una aplicación Angular mediante Server-Side Rendering, hidratación, carga diferida con `@defer`, y ejecución sin Zone.js.

**Objetivos específicos**

1. Configurar Server-Side Rendering con `ng add @angular/ssr`.
2. Explicar el proceso de hidratación y por qué reutiliza el DOM existente.
3. Usar `@defer` con distintos triggers para reducir el bundle inicial.
4. Explicar cómo el modelo de zoneless depende de que el estado esté modelado con signals.
5. Diagnosticar cuándo un bloque `@defer` es apropiado frente a carga inmediata.

**Contenido**

- Server-Side Rendering.
- Hidratación.
- `@defer`: triggers, placeholder y loading.
- Zoneless.

**Evaluación**

Configuración de SSR con hidratación y un bloque `@defer` con trigger apropiado, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Server-Side Rendering

**Conceptos clave:** `ng add @angular/ssr`, tiempo hasta el primer contenido visible, SEO.

Server-Side Rendering (SSR) traslada la generación inicial del HTML de una aplicación Angular desde el navegador del usuario hacia el servidor: en vez de que el navegador reciba un documento HTML prácticamente vacío que debe ejecutar JavaScript para recién entonces construir y mostrar el contenido real (el enfoque tradicional de una Single Page Application), el servidor ejecuta Angular por su cuenta, genera el HTML completo de la vista inicial con todos sus datos ya presentes, y envía ese HTML ya completo directamente al navegador, que puede mostrarlo inmediatamente sin esperar a que ningún JavaScript se descargue ni se ejecute primero.

`ng add @angular/ssr` configura automáticamente el proyecto para soportar este modo, agregando un punto de entrada de servidor (típicamente ejecutado con Node.js) capaz de renderizar la aplicación Angular en el backend, además de la configuración de build necesaria para producir tanto el bundle de cliente tradicional como el código de renderizado de servidor correspondiente.

Además de mejorar el tiempo hasta que el usuario ve contenido real (particularmente relevante en conexiones lentas o dispositivos poco potentes, donde descargar y ejecutar un bundle de JavaScript completo antes de mostrar nada puede tardar un tiempo perceptible), SSR también beneficia directamente al posicionamiento en buscadores (SEO): los rastreadores de motores de búsqueda que no ejecutan JavaScript de forma completa o confiable pueden indexar directamente el HTML completo generado por el servidor, en vez de encontrarse con un documento vacío que requeriría ejecución de JavaScript para revelar su contenido real.

**Analogía:** una aplicación sin SSR es como entregarle a un comensal una caja de ingredientes crudos junto con una receta, esperando que él mismo cocine el plato antes de poder comerlo; con SSR, el plato ya llega completamente preparado y listo para comer de inmediato, sin que el comensal tenga que hacer ningún trabajo de preparación previo.

**¿Por qué es importante?** SSR reduce el tiempo hasta que el usuario ve contenido real, especialmente en conexiones lentas, y hace que el contenido sea directamente indexable por motores de búsqueda sin depender de la ejecución de JavaScript del lado del cliente.

**Prueba en terminal:**

```bash
ng add @angular/ssr
```
```
Sin SSR: navegador recibe HTML vacío → descarga JS → ejecuta JS → renderiza contenido
Con SSR: servidor renderiza HTML completo → navegador lo muestra inmediatamente
```

### Tema 2: Hidratación

**Conceptos clave:** reutilización del DOM existente, adjuntar listeners sin re-renderizar.

Una vez que el HTML generado por el servidor (Tema 1) llega al navegador y se muestra, la aplicación todavía no es interactiva: los botones no responden a clics, los formularios no reaccionan a la entrada del usuario, porque toda esa lógica vive en el JavaScript de Angular, que todavía no ha tomado control de esa página. La "hidratación" es el proceso mediante el cual Angular, una vez que su JavaScript efectivamente carga en el navegador, "toma posesión" de ese HTML ya existente: adjunta los listeners de eventos necesarios y activa toda la reactividad de signals y detección de cambios correspondiente, pero crucialmente sin destruir y volver a construir ese DOM desde cero, reutilizando directamente los elementos DOM que el servidor ya generó.

Esta reutilización del DOM existente (en vez de descartarlo y volver a renderizar todo desde cero una vez que el JavaScript carga, un enfoque más simple pero considerablemente más costoso, y que además produce un parpadeo visual perceptible cuando el contenido se reemplaza) es lo que hace que la hidratación sea una optimización no trivial: Angular necesita poder emparejar exactamente qué nodo DOM ya existente corresponde a qué parte de la estructura de componentes que está inicializando, un proceso que requiere que la estructura generada por el servidor coincida exactamente con la que Angular esperaría generar por su cuenta en el cliente, o de lo contrario la hidratación puede fallar y forzar un re-renderizado completo de todas formas (perdiendo así el beneficio principal de la técnica).

**Analogía:** la hidratación es como un actor que llega tarde a un escenario ya montado por completo (con decorado, luces, y otros actores ya en posición) y simplemente toma su lugar y comienza a actuar sin necesidad de desmontar y volver a montar todo el escenario desde cero solo porque él llegó después.

**¿Por qué es importante?** La hidratación evita el costo (y el parpadeo visual) de descartar y volver a renderizar completamente un DOM que el servidor ya generó correctamente, activando la interactividad sobre ese mismo DOM existente.

**Diagrama:**

```
1. Servidor genera HTML completo → navegador lo muestra (no interactivo aún)
2. JavaScript de Angular carga
3. Hidratación: Angular reutiliza el DOM existente, adjunta listeners,
   activa reactividad — SIN re-renderizar desde cero
```

### Tema 3: @defer — carga diferida de vistas

**Conceptos clave:** triggers (`on viewport`, `on interaction`, `on idle`), `@placeholder`, `@loading`.

El bloque `@defer` (Módulo 1) marca una porción de la plantilla cuyo código correspondiente se compila en un chunk de JavaScript separado del bundle principal, que solo se descarga y se renderiza cuando se cumple una condición de disparo (trigger) explícita: `on viewport` dispara la carga cuando el bloque entra en el área visible de la pantalla del usuario (apropiado para contenido que está más abajo en la página y que el usuario podría nunca llegar a ver si no hace scroll), `on interaction` dispara ante un clic o teclado del usuario sobre un elemento específico (apropiado para contenido que solo es necesario tras una acción explícita, como abrir un panel), y `on idle` dispara cuando el navegador queda inactivo tras el renderizado inicial (apropiado para contenido de prioridad baja que conviene cargar eventualmente pero sin competir con recursos más urgentes de la carga inicial).

Mientras el contenido diferido todavía no se ha cargado, `@placeholder` define qué mostrar en su lugar (típicamente un esqueleto visual simple), y `@loading` define qué mostrar específicamente durante la ventana de tiempo en la que la descarga del chunk está en curso, con un parámetro `minimum` opcional (`@loading (minimum 200ms)`) que evita mostrar un spinner de carga durante un parpadeo demasiado breve si la descarga resulta ser casi instantánea, evitando el efecto visual molesto de un indicador de carga que aparece y desaparece casi de inmediato.

Reducir el bundle inicial descargado mediante `@defer` mejora directamente el tiempo hasta que la aplicación se vuelve interactiva, un beneficio de rendimiento particularmente relevante para contenido pesado (gráficos complejos, editores de texto enriquecido, mapas) que no es indispensable para la primera impresión de la página, permitiendo que el usuario interactúe con el contenido esencial más rápido, mientras el contenido secundario más pesado se carga en segundo plano o bajo demanda explícita.

**Analogía:** `@defer` es como no llevar contigo todas las herramientas posibles de un taller completo al salir de casa, sino solo las que necesitas de inmediato, yendo a buscar herramientas adicionales específicas únicamente cuando efectivamente las necesitas para una tarea concreta.

**¿Por qué es importante?** `@defer` reduce el bundle inicial descargado, mejorando el tiempo hasta que la aplicación se vuelve interactiva, sin sacrificar la experiencia del usuario gracias a los estados de `@placeholder` y `@loading`.

**Código del ejemplo:**

```html
@defer (on viewport) {
  <app-grafico-pesado [datos]="datos()" />
} @placeholder {
  <div class="skeleton"></div>
} @loading (minimum 200ms) {
  <app-spinner />
}
```

### Tema 4: Zoneless

**Conceptos clave:** detección de cambios sin Zone.js, precisión de signals.

Tradicionalmente, Angular ha dependido de Zone.js para saber cuándo revisar si algo cambió en la aplicación y potencialmente necesita re-renderizar: Zone.js intercepta prácticamente cualquier operación asíncrona del navegador (eventos del DOM, temporizadores, peticiones de red), y tras cada una de ellas, Angular ejecuta una revisión de detección de cambios sobre toda o gran parte del árbol de componentes para determinar qué, si acaso algo, necesita actualizarse visualmente, un enfoque funcional pero inherentemente impreciso: Angular no sabe realmente qué cambió específicamente, solo que "algo pudo haber cambiado" tras cierta operación asíncrona, y por tanto debe revisar más de lo estrictamente necesario para estar seguro.

Cuando el estado de una aplicación está modelado completamente con signals (Módulo 2), Angular ya no necesita esa aproximación imprecisa: dado que cada signal notifica exactamente qué vistas dependen de él cuando cambia (mediante el sistema de suscripción fina que sustenta `computed()` y los templates reactivos), Angular puede saber con precisión exacta qué necesita actualizarse, sin tener que interceptar y reaccionar a cada operación asíncrona del navegador de forma genérica a través de Zone.js. Esto permite ejecutar Angular en modo "zoneless" (sin Zone.js en absoluto), reduciendo el tamaño del bundle (Zone.js es una dependencia con un costo de tamaño no trivial) y evitando el trabajo de detección de cambios innecesario e impreciso que Zone.js provocaba anteriormente.

**Analogía:** Zone.js es como un guardia que revisa cada habitación completa de un edificio después de escuchar cualquier ruido en cualquier parte, sin saber exactamente de dónde vino ni qué cambió realmente; el modelo zoneless con signals es como un sistema de sensores específicos en cada habitación que notifican con precisión exacta cuál habitación específica cambió, sin necesidad de revisar el resto del edificio en absoluto.

**¿Por qué es importante?** El modelo zoneless, habilitado por la precisión de signals, elimina la dependencia de Zone.js y el trabajo de detección de cambios impreciso que este provocaba, mejorando tanto el tamaño del bundle como el rendimiento en tiempo de ejecución.

**Diagrama:**

```
Con Zone.js: cualquier evento asíncrono → revisar TODO el árbol de componentes (impreciso)
Zoneless (con signals): un signal cambia → SOLO se actualizan sus vistas dependientes (preciso)
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

**Objetivo del laboratorio:** configurar SSR con hidratación, y usar `@defer` para diferir contenido pesado.

**Requisitos previos:** Módulos 0-10 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Agregar SSR | `ng add @angular/ssr` | Configura renderizado de servidor |
| 2 | Verificar la hidratación | — | Inspecciona que el DOM inicial no parpadee al cargar el JS |
| 3 | Envolver contenido pesado en `@defer` | Ver Tema 3 | Elige el trigger apropiado |
| 4 | Agregar `@placeholder` y `@loading` | Ver Tema 3 | Con `minimum` para evitar parpadeos |
| 5 | Discutir zoneless | Ver Tema 4 | Explica por qué depende de signals |

**Verificación:** el laboratorio se considera exitoso si la aplicación con SSR muestra contenido inmediatamente sin parpadeo al hidratarse, y si el bloque `@defer` efectivamente reduce el bundle inicial descargado (verificable en la pestaña Network).

**Errores comunes y soluciones**

- **Elegir el trigger incorrecto para `@defer`.** Usa `on viewport` para contenido más abajo en la página, `on interaction` para contenido tras una acción explícita.
- **No usar `minimum` en `@loading`.** Sin él, un spinner puede parpadear molestamente ante descargas casi instantáneas.
- **Asumir que zoneless funciona sin migrar el estado a signals.** El modelo zoneless depende de que el estado relevante esté modelado con signals para tener la precisión necesaria.

---

## Ejercicios de evaluación

### Ejercicio 1: Por qué SSR mejora el SEO

**Enunciado:** explica por qué SSR beneficia directamente al posicionamiento en buscadores.

**Solución esperada:** los rastreadores de motores de búsqueda que no ejecutan JavaScript de forma completa o confiable pueden indexar directamente el HTML completo que el servidor ya generó con SSR, en vez de encontrarse con un documento HTML vacío que requeriría ejecutar JavaScript para revelar su contenido real, algo que muchos rastreadores no hacen de forma confiable.

**Criterios de éxito:**
- Explica correctamente la relación entre HTML ya completo al llegar al rastreador y la indexación confiable.

### Ejercicio 2: Por qué la hidratación reutiliza el DOM

**Enunciado:** ¿qué problema evita la hidratación al reutilizar el DOM existente en vez de descartarlo y volver a renderizar todo desde cero?

**Solución esperada:** descartar y volver a renderizar todo desde cero produciría un parpadeo visual perceptible cuando el contenido generado por el servidor se reemplaza completamente, además de un costo de rendimiento innecesario al reconstruir algo que ya existía correctamente; reutilizar el DOM existente evita ambos problemas.

**Criterios de éxito:**
- Explica correctamente el parpadeo visual y el costo de rendimiento evitados.

### Ejercicio 3: Elegir el trigger de @defer apropiado

**Enunciado:** un panel de comentarios solo debe cargarse cuando el usuario hace clic en un botón "Ver comentarios". ¿Qué trigger de `@defer` usarías y por qué?

**Solución esperada:** `on interaction`, porque el contenido diferido debe cargarse específicamente en respuesta a una acción explícita del usuario (el clic en el botón), no simplemente por entrar en el área visible de la pantalla (`on viewport`) ni por inactividad del navegador (`on idle`).

**Criterios de éxito:**
- Elige correctamente `on interaction` y justifica en términos de acción explícita del usuario.

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

- Google, *Angular Documentation* y guías oficiales de accesibilidad, seguridad y rendimiento.
- ReactiveX, *RxJS Documentation*.
- W3C, *Web Content Accessibility Guidelines (WCAG)*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- SSR genera el HTML inicial en el servidor, mejorando el tiempo hasta contenido visible y el SEO.
- La hidratación reutiliza el DOM existente, evitando parpadeo visual y trabajo redundante.
- `@defer` con triggers apropiados reduce el bundle inicial descargado.
- El modelo zoneless depende de la precisión de signals para saber exactamente qué actualizar.

**Conceptos aprendidos**

- Server-Side Rendering y su beneficio para tiempo de carga y SEO.
- Hidratación y reutilización del DOM.
- `@defer`, triggers, `@placeholder` y `@loading`.
- Zoneless y su dependencia de signals.

**Próximos pasos**

En el Módulo 12 revisarás qué cambió entre versiones mayores de Angular, y cómo interpretar una guía oficial de actualización.

**Recursos adicionales**

- Documentación oficial de Angular: "Server-side rendering", "Hydration", "Deferred loading" y "Zoneless".
