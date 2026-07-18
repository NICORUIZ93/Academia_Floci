# Módulo 13: JavaScript en producción — seguridad, memoria y compatibilidad

Una aplicación no está terminada cuando muestra datos. En producción recibe entradas hostiles, permanece abierta durante horas, corre en dispositivos diferentes y debe explicar qué falló sin filtrar información privada. En este módulo endurecerás la SPA del módulo 12 mediante evidencia reproducible.

## Sílabo

1. Fronteras de confianza, XSS, CSP y cadena de suministro.
2. Garbage collection, retención y fugas de memoria.
3. Errores, telemetría, source maps y privacidad.
4. Compatibilidad, mejora progresiva, internacionalización y tiempo.
5. Proyecto: auditoría y endurecimiento de la SPA sin framework.

## Aprende construyendo

### Tema 1: Datos no confiables y seguridad en el navegador

**Conceptos clave:** activo, actor, frontera de confianza, entrada no confiable, XSS, contexto HTML, atributo, URL, DOM sink, CSP, nonce, Trusted Types, CSRF, CORS, dependencia y prototype pollution.

Todo dato externo conserva condición de no confiable aunque venga de “tu API”: pudo almacenarse antes, ser manipulado en tránsito fuera de TLS o provenir de otro usuario. XSS ocurre cuando datos se interpretan como código ejecutable. El remedio depende del contexto. Texto, atributo, URL, CSS y JavaScript tienen reglas distintas; una función casera que reemplaza `<` no constituye una defensa general.

Prefiere APIs que mantienen texto como texto:

```javascript
const title = document.createElement('h2');
title.textContent = product.name;
card.replaceChildren(title);
```

`innerHTML` interpreta markup y solo debe recibir plantillas controladas o contenido procesado por una biblioteca mantenida y adecuada al contexto. `setAttribute('href', value)` tampoco vuelve segura una URL: valida protocolo y construye con `new URL`. Nunca pases texto externo a `eval`, `Function`, `setTimeout` como string ni handlers inline.

Content Security Policy agrega defensa en profundidad al limitar fuentes ejecutables. Empieza en modo report-only, observa violaciones, elimina scripts inline y despliega una política explícita con nonces o hashes cuando sean necesarios. CSP no corrige el render inseguro y permitir `unsafe-inline` reduce gran parte de su valor. Trusted Types puede impedir que sinks peligrosos acepten strings sin una política declarada.

CORS controla qué orígenes pueden leer una respuesta desde el navegador; no autentica usuarios ni impide que una petición llegue. CSRF afecta credenciales enviadas automáticamente, como cookies, y se mitiga con SameSite apropiado, tokens y validación de origen según el diseño. Los tokens en `localStorage` quedan expuestos ante XSS.

Las dependencias ejecutan código con privilegios del build o página. Reduce paquetes, fija lockfile, revisa scripts de instalación, actualiza con pruebas y analiza procedencia. Fusionar objetos externos con claves como `__proto__` puede contaminar prototipos; selecciona campos esperados en vez de copiar indiscriminadamente.

**Analogía:** recibir JSON es como recibir un paquete en recepción. La etiqueta “interno” no autoriza a conectarlo directamente al sistema eléctrico; primero se valida su contenido y destino.

**¿Por qué es importante?** porque el navegador combina datos, identidad y ejecución en el dispositivo del usuario. Una sola inserción insegura puede robar sesión, modificar operaciones o leer información visible.

**Casos de uso reales:** comentarios almacenados con scripts, enlaces `javascript:`, dependencias comprometidas, configuración inyectada, formularios con cookie de sesión y merge de preferencias.

**Diagrama:**

```text
URL/API/storage -> dato no confiable -> validar estructura
                                      -> textContent (texto)
                                      -> URL allowlist (enlace)
                                      -> sanitizador mantenido (HTML permitido)
                         CSP/Trusted Types = defensa adicional
```

### Tema 2: Memoria administrada no significa memoria infinita

**Conceptos clave:** heap, raíz, alcance, reachability, garbage collector, retención, closure, listener, timer, detached DOM, WeakMap, heap snapshot y allocation timeline.

El recolector libera objetos que ya no son alcanzables desde raíces como el objeto global, stacks activos o callbacks registrados. No necesita que el programa llame a `free`, pero no puede saber que un objeto alcanzable ya no es útil. Una fuga en JavaScript es retención accidental.

Una vista puede registrar un listener global en cada navegación. Aunque sus nodos se retiren del DOM, el callback conserva mediante closure el estado y quizá el árbol completo. Timers, observers, suscripciones, caches sin límite y promesas pendientes crean patrones similares.

```javascript
export function mountSearch(root, store) {
  const controller = new AbortController();
  const onKeydown = event => {
    if (event.key === '/') root.querySelector('input')?.focus();
  };
  window.addEventListener('keydown', onKeydown, { signal: controller.signal });
  const unsubscribe = store.subscribe(render);

  return function unmount() {
    controller.abort();
    unsubscribe();
    root.replaceChildren();
  };
}
```

Diseña cada montaje con desmontaje simétrico. `AbortSignal` permite cancelar listeners y fetch; `clearInterval`, `disconnect` y funciones unsubscribe liberan otras fuentes. WeakMap sirve cuando la vida de un valor debe seguir a una clave objeto, pero no reemplaza límites de cache ni una arquitectura clara.

Para demostrar una fuga: fija un escenario, fuerza varias navegaciones, toma snapshots comparables, busca detached nodes y rutas de retención. Una subida temporal no prueba fuga porque el GC puede no haberse ejecutado. Repite después de recolección y observa crecimiento monotónico de objetos que deberían desaparecer.

**Analogía:** el garbage collector retira cajas sin ninguna cuerda conectada a la casa. Si olvidaste una cuerda en una ventana global, la caja parece todavía necesaria aunque nadie la use.

**¿Por qué es importante?** porque una SPA vive mucho tiempo. Retenciones pequeñas por navegación degradan móviles, disparan pausas y terminan en cierres que las pruebas cortas no revelan.

**Casos de uso reales:** listeners duplicados, observers sin desconectar, historial conservando vistas, cache de imágenes ilimitada, Web Workers activos y closures con respuestas grandes.

**Diagrama:**

```text
window (raíz) -> listener -> closure -> vista removida -> 10 000 nodos
unmount -> abort/remove -> sin ruta desde raíz -> GC puede liberar
```

### Tema 3: Errores útiles sin convertir usuarios en sensores involuntarios

**Conceptos clave:** excepción, rechazo, error operacional, defecto de programación, Error.cause, stack trace, frontera de error, unhandledrejection, correlation ID, telemetry, source map, sampling y redacción.

No todos los fallos se manejan igual. Una entrada inválida es esperable y debe producir feedback; una invariancia rota es un defecto y no debe transformarse silenciosamente en datos vacíos. Captura donde puedas añadir contexto o recuperar. Un `catch` que solo imprime y continúa crea estado corrupto.

```javascript
async function loadProduct(id, { signal, traceId }) {
  try {
    const response = await fetch(`/api/products/${encodeURIComponent(id)}`, {
      signal,
      headers: { 'x-correlation-id': traceId },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause;
    throw new Error(`No fue posible cargar producto ${id}`, { cause });
  }
}
```

Una frontera de UI traduce el fallo a un estado recuperable sin revelar stack ni detalles internos. Registra versión, ruta lógica, tipo, duración y correlation ID. No envíes tokens, cuerpos completos, email, texto escrito ni parámetros sensibles. Define retención y acceso.

`error` y `unhandledrejection` son últimas redes de observación, no estrategia principal. Deduplica, aplica sampling y prueba que la telemetría también puede fallar sin crear un bucle. Los source maps traducen stacks minificados a fuentes, pero publicarlos abiertamente puede revelar código y rutas; almacénalos en el servicio de errores o controla acceso.

**Analogía:** una caja negra conserva instrumentos relevantes para reconstruir un evento, no una grabación indiscriminada de toda conversación del pasajero.

**¿Por qué es importante?** porque “algo salió mal” no permite corregir, mientras registrar todo vulnera privacidad. La observabilidad necesita propósito y minimización.

**Casos de uso reales:** rechazo no esperado, chunk que no carga después de despliegue, API 503, source map de bundle, error offline y fallo específico de una versión.

**Diagrama:**

```text
fallo -> capa puede recuperar? -> sí: estado explícito + retry controlado
                         `-> no: añade causa -> frontera UI
                                           -> evento mínimo correlacionado
                                           -> source map privado
```

### Tema 4: Compatibilidad, idioma y tiempo son requisitos de datos

**Conceptos clave:** feature detection, progressive enhancement, polyfill, transpilation, browserslist, capability, locale, Intl, Unicode, zona horaria, instante, fecha civil, accesibilidad y reduced motion.

Detecta capacidades, no nombres de navegador. `if ('IntersectionObserver' in window)` expresa la dependencia; analizar user-agent es frágil. Diseña una función básica que opere con HTML y navegación normal y mejora cuando JavaScript o una API está disponible. Un polyfill implementa una API ausente; transpilar cambia sintaxis. Ninguno corrige APIs ni comportamientos que no se incluyeron deliberadamente.

```javascript
const money = new Intl.NumberFormat(locale, {
  style: 'currency',
  currency: product.currency,
}).format(product.price);

const date = new Intl.DateTimeFormat(locale, {
  dateStyle: 'long',
  timeZone: userTimeZone,
}).format(new Date(product.updatedAt));
```

No construyas moneda concatenando símbolos ni fechas separando strings. Locale define convenciones; moneda y zona horaria son datos distintos y obligatorios. Un instante UTC representa un punto temporal; “9:00 del 3 de marzo en Bogotá” es fecha civil más zona. Horarios de verano producen horas repetidas o inexistentes. Conserva instantes para eventos ocurridos y modela zona/regla para eventos futuros.

Unicode significa que longitud de código no siempre equivale a caracteres percibidos. No cortes nombres con `slice(0, 10)` asumiendo diez glifos. Usa `Intl.Segmenter` cuando la experiencia lo requiera. Ordenar texto con `<` tampoco sigue reglas lingüísticas; usa `Intl.Collator`.

La compatibilidad incluye preferencias y dispositivos: teclado, lectores, contraste, `prefers-reduced-motion`, touch y conexiones lentas. Presupuesto de bundle y carga progresiva son parte funcional para quien no puede descargar varios megabytes.

**Analogía:** traducir solo etiquetas es como cambiar los letreros de una estación sin adaptar horarios, moneda, orden alfabético ni accesos.

**¿Por qué es importante?** porque supuestos locales producen precios engañosos, fechas desplazadas y funciones inaccesibles aunque el código “pase” en la máquina del equipo.

**Casos de uso reales:** catálogo multimoneda, agenda internacional, navegador sin observer, usuario con movimiento reducido, nombres Unicode y conexión móvil lenta.

**Diagrama:**

```text
HTML funcional -> detectar capacidad -> mejora opcional
datos: instante + zona | cantidad + moneda | texto + locale
                    -> Intl -> presentación del usuario
```

## Revisión oficial de plataforma — julio de 2026

### ECMAScript vivo, propuestas y fechas modernas

La referencia estable del curso es **ECMAScript 2026**. La especificación viva de TC39 ya incorpora propuestas terminadas para la siguiente edición, pero una propuesta solo se enseña como parte del lenguaje cuando alcanza **Stage 4**; etapas anteriores se estudian como experimentos y nunca como requisito de producción. `Temporal` resuelve fechas, horas, zonas y duraciones con tipos explícitos, evitando mutaciones y ambigüedades habituales de `Date`. Antes de usarlo verifica soporte del runtime o selecciona un polyfill mantenido, mide su coste y prueba cambios de zona y horario de verano.

**Aplicación al proyecto:** reemplaza una fecha logística modelada como string por `Temporal.Instant` más zona de presentación; prueba un cambio de horario y documenta fallback. Revisa también ECMA-402 para internacionalización y registra la edición consultada en el README.

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

### Proyecto de endurecimiento de la SPA

Trabaja sobre el proyecto del módulo 12 y conserva una rama o tag previo para comparar.

1. Dibuja flujo de datos y fronteras de confianza. Prioriza al menos cuatro amenazas.
2. Introduce de forma controlada un nombre de producto con `<img src=x onerror=...>` y demuestra la vulnerabilidad en un entorno aislado sin datos reales.
3. Sustituye sinks inseguros por construcción DOM contextual y añade una prueba de regresión que verifique texto, no ejecución.
4. Despliega CSP primero report-only y luego aplicada. Documenta cada directiva y elimina `unsafe-inline`.
5. Ejecuta auditoría de dependencias, elimina paquetes innecesarios y revisa cambios del lockfile.
6. Automatiza 100 ciclos de navegación. Toma snapshots y corrige listeners, timers, observers o caches retenidos.
7. Añade fronteras de error para carga, render y routing; correlaciona logs sin datos sensibles.
8. Genera build con source maps separados y demuestra que un stack minificado puede simbolizarse.
9. Formatea moneda, cantidades, orden y fechas para `es-CO`, `en-US` y otra locale; prueba dos zonas con cambio de día.
10. Desactiva una API moderna mediante stub y verifica fallback. Audita teclado, reduced motion y carga lenta.

**Verificación:** entrega threat model, payload de prueba inocuo, headers CSP, suite de seguridad, inventario de dependencias, snapshots antes/después, evento de error redactado, stack simbolizado y matriz de locale/zona/capacidad. Ninguna evidencia debe contener credenciales ni información personal.

**Errores comunes y soluciones**

- “Arreglar” XSS con regex: conserva texto como texto o usa sanitización mantenida para un subconjunto HTML explícito.
- CSP demasiado permisiva: comienza observando y elimina causas, no añadas comodines hasta silenciar reportes.
- Concluir fuga por un snapshot: repite escenario, fuerza condiciones comparables y analiza rutas de retención.
- Capturar y continuar: recupera solo si puedes restaurar un estado válido; de lo contrario propaga con causa.
- Publicar source maps junto al bundle: separa carga de producción del almacenamiento de diagnóstico.
- Guardar fechas sin semántica: decide si es instante ocurrido o fecha civil futura y conserva zona cuando corresponda.



## Bibliografía y fundamento académico

- ECMA-262 y MDN Web Docs: semántica del lenguaje y APIs web.
- OWASP, *Cross Site Scripting Prevention Cheat Sheet* y *Content Security Policy Cheat Sheet*.
- W3C, Content Security Policy y Trusted Types; Unicode Consortium, CLDR.
- Chrome DevTools, documentación de análisis de memoria y rendimiento.
- ACM/IEEE-CS CS2023: Security, Human-Computer Interaction, Software Development Fundamentals y Society, Ethics, and the Profession.
- SWEBOK V4: Software Security, Construction, Testing, Quality y Professional Practice.

Los resultados observables son neutralizar un payload según contexto, demostrar eliminación de una retención, reconstruir un error minificado sin exponer datos y mantener función correcta entre locales, zonas y capacidades.

<!-- OFFICIAL-TOPIC-ATLAS:START -->
## Atlas completo de temas oficiales

Derivado de la [documentación oficial](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide), sus referencias, migraciones y guías de operación. Inventariar no equivale a dominar: cada selección se demuestra con código, prueba, medición y explicación. **Cobertura: 42 temas.**

| Área | Temas que deben poder explicarse y aplicarse | Evidencia práctica |
|---|---|---|
| Lenguaje | `gramática y tipos` · `coerción e igualdad` · `alcance y closures` · `prototipos` · `clases y campos privados` · `símbolos` · `Proxy y Reflect` | widget web RutaFlow |
| Datos | `arrays inmutables` · `Map y Set` · `WeakMap y WeakSet` · `typed arrays` · `ArrayBuffer y DataView` · `Temporal` · `Intl y Unicode` | widget web RutaFlow |
| Asincronía | `errores y causas` · `promesas` · `async/await` · `iteradores` · `generadores` · `iteradores asíncronos` · `AbortController` | widget web RutaFlow |
| Módulos | `ES modules` · `import dinámico` · `top-level await` · `ciclos` · `import maps` · `using y await using` · `DisposableStack` | widget web RutaFlow |
| Web | `DOM y eventos` · `formularios` · `Fetch y streams` · `WebSocket` · `workers` · `IndexedDB` · `service workers y PWA` | widget web RutaFlow |
| Calidad | `testing` · `profiling` · `memoria y GC` · `accesibilidad` · `XSS y CSP` · `compatibilidad` · `supply chain` | widget web RutaFlow |

### Método de estudio y proyecto de ampliación

Para cada tema responde qué problema resuelve, cuál es su modelo mental, cómo falla, cómo se verifica y cuándo no conviene. Elige uno por área e intégralos en una vertical RutaFlow. Entrega diagrama, ADR, pruebas de éxito y fallo, una medición, una amenaza y el enlace oficial con versión y fecha. Una API preview se aísla en laboratorio y nunca se presenta como base estable.
<!-- OFFICIAL-TOPIC-ATLAS:END -->

## Resumen del módulo

- Todo dato externo cruza una frontera de confianza; valida estructura y codifica según el destino.
- CSP y Trusted Types agregan defensa, pero no sustituyen APIs de render seguras.
- El GC libera objetos inalcanzables; listeners y closures pueden retener estado inútil indefinidamente.
- Los errores necesitan recuperación explícita, causas y telemetría mínima con privacidad.
- Feature detection y mejora progresiva resisten capacidades diferentes.
- Locale, moneda, Unicode y zona horaria son datos del dominio, no detalles cosméticos.
