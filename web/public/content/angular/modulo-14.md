# Módulo 14: Angular en producción — accesibilidad, seguridad e internacionalización

El proyecto anterior demuestra integración técnica, pero una aplicación productiva debe funcionar para personas que navegan con teclado o lector, resistir datos hostiles, expresar correctamente idioma y tiempo y actualizarse sin degradar la experiencia. Este módulo convierte esas cualidades en pruebas y presupuestos automatizados.

## Sílabo

1. Accesibilidad de componentes, formularios y navegación SPA.
2. Modelo de seguridad de Angular, CSP y Trusted Types.
3. Internacionalización, ICU, locale, RTL y tiempo.
4. Presupuestos, experiencia real, caché y actualización segura.
5. Proyecto: auditoría de producción de la aplicación standalone.

## Comienza desde cero: prepara este capítulo

Este recorrido parte de una carpeta vacía. Al finalizar tendrás **Un incremento pequeño, probado y reproducible del capítulo.** No avances ejecutando comandos que no comprendes: primero identifica la entrada, la transformación y la evidencia que comprobará el resultado.

### 1. Comprueba las herramientas

Los comandos funcionan en macOS, Linux y WSL. En PowerShell usa el equivalente indicado por la herramienta.

```bash
node --version
npm --version
npx ng version
```

Si un comando no existe, detente e instala esa herramienta desde su sitio oficial. Cierra y abre la terminal después de modificar `PATH`. Las versiones deben ser compatibles entre sí antes de crear archivos.

### 2. Crea o recupera el proyecto del track

```bash
npx @angular/cli@latest new academia-labs/angular-app --standalone --routing --style=scss
cd academia-labs/angular-app
git init
```

Trabaja dentro de `academia-labs/angular-app`. Si ya existe, no lo vuelvas a generar: entra en la carpeta, confirma `git status` y continúa sobre una rama propia.

### 3. Ubica cada tema antes de escribir

```text
academia-labs/angular-app/
├─ src/app/features/
│  └─ module-14/
├─ tests/
├─ docs/decisions/
├─ evidence/module-14/
└─ README.md
```

| Tema | Archivo o decisión | Evidencia mínima |
|---|---|---|
| 1. Accesibilidad es comportamiento, no una puntuación | `src/app/features/module-14/topic-1-accesibilidad-es-comportamiento-no-una-puntuacion.ts` | prueba + salida observable |
| 2. La seguridad automática tiene fronteras explícitas | `src/app/features/module-14/topic-2-la-seguridad-automatica-tiene-fronteras-explicitas.ts` | prueba + salida observable |
| 3. Internacionalizar implica significado, no reemplazo de texto | `src/app/features/module-14/topic-3-internacionalizar-implica-significado-no-reemplazo-de-.ts` | prueba + salida observable |
| 4. Rendimiento y actualización son contratos de experiencia | `src/app/features/module-14/topic-4-rendimiento-y-actualizacion-son-contratos-de-experienc.ts` | prueba + salida observable |

Un ejemplo técnico vive en el archivo indicado y debe tener una prueba. Un tema conceptual vive en `docs/decisions/`: compara opciones usando restricciones medibles; no escribas código decorativo solo para llenar espacio.

### 4. Ejecuta una línea base

Desde `academia-labs/angular-app`:

```bash
npm test -- --watch=false && npm start
```

**Resultado esperado:** el comando reconoce el proyecto y termina sin errores antes de introducir el cambio del capítulo. Después del incremento, la evidencia debe demostrar: **Un incremento pequeño, probado y reproducible del capítulo.**

Si falla la línea base, no continúes. Localiza el primer mensaje que indique archivo, línea o dependencia; formula una causa y compruébala con un cambio pequeño.

### 5. Provoca un fallo y recupérate

Simula un estado vacío o un error HTTP y comprueba que la interfaz muestre recuperación y no una pantalla ambigua. Guarda en `evidence/module-14/` el comando, la salida relevante, tu hipótesis y la corrección. Revierte únicamente el cambio deliberado; no borres todo el proyecto para ocultar la causa.

### 6. Conecta el capítulo con RutaFlow

Aplica el aprendizaje de **Angular en producción — accesibilidad, seguridad e internacionalización** a un incremento vertical de RutaFlow. Define qué componente produce el dato, qué contrato lo transporta, quién lo consume y cómo observarás un fallo. La entrega final incluye archivo o decisión, prueba, salida, error corregido y una limitación que todavía validarías en producción.

---

## Contenido teórico

### Tema 1: Accesibilidad es comportamiento, no una puntuación

**Conceptos clave:** HTML semántico, nombre accesible, rol, estado, teclado, foco, lector de pantalla, landmark, aria-live, contraste, error de formulario, skip link, CDK a11y, Angular Aria y prueba automatizada.

Empieza por controles nativos. Un `<button>` ya participa en tabulación, responde a Enter y Espacio, expone rol y soporta disabled. Un `<div role="button">` exige reconstruir teclado, foco y estado; olvidar una parte crea una imitación. ARIA describe semántica que HTML no ofrece, pero no agrega comportamiento automáticamente.

Cada control necesita nombre accesible. Un icono visual sin texto puede usar `aria-label` traducible; un input debe relacionarse con `<label for>`. El placeholder no reemplaza label: desaparece al escribir y puede tener contraste insuficiente. Los errores deben estar junto al campo, asociados con `aria-describedby` y resumidos cuando el envío falla.

Angular cambia vistas sin recargar documento. Tras navegar, el foco puede permanecer en un enlace que ya no existe y el lector no sabe que cambió el contenido. Define título por ruta, anuncia navegación con moderación y mueve foco a un encabezado principal solo cuando ayuda al flujo. Conserva foco al cerrar un diálogo devolviéndolo al disparador.

```typescript
@Component({
  template: `
    <main>
      <h1 #heading tabindex="-1">{{ title() }}</h1>
      <router-outlet />
    </main>
  `,
})
export class PageShell {
  private readonly heading = viewChild.required<ElementRef<HTMLHeadingElement>>('heading');

  focusPageTitle() {
    this.heading().nativeElement.focus();
  }
}
```

Para patrones complejos como tabs, grid, combobox o árbol, usa primitivas probadas de Angular CDK, Angular Aria o Material en lugar de inventar navegación. Aun así debes comprobar estructura, estilos, texto y lógica propia.

Las herramientas automáticas detectan ausencia de labels, relaciones inválidas y contraste, pero no prueban que el orden de foco sea comprensible ni que una acción tenga sentido. Combina axe/Lighthouse, pruebas de componentes, recorrido solo teclado y verificación con al menos un lector.

**Analogía:** una rampa dibujada en el plano no garantiza acceso si conduce a una puerta cerrada. La conformidad estructural necesita probar el recorrido completo.

**¿Por qué es importante?** porque una SPA puede ser visualmente correcta y quedar inutilizable para personas, además de romper automatización, SEO y dispositivos alternativos.

**Casos de uso reales:** modal con foco atrapado, menú móvil, formulario con errores, tabla interactiva, navegación por rutas y actualización anunciada sin saturar.

**Diagrama:**

```text
semántica nativa -> teclado -> foco visible -> nombre/estado -> feedback
       |                                                   |
       `-> prueba automática + recorrido humano + lector --´
```

### Tema 2: La seguridad automática tiene fronteras explícitas

**Conceptos clave:** XSS, template confiable, binding, sanitización, SecurityContext, DomSanitizer, bypass, ElementRef, CSP, nonce, Trusted Types, AOT, token, cookie, CSRF, SSR y host confiable.

Angular trata valores enlazados como no confiables y escapa o sanitiza según contexto HTML y URL. Las plantillas, en cambio, son código confiable; nunca las construyas concatenando entrada. AOT evita compilar templates dinámicos en el navegador y debe usarse en producción.

```html
<!-- El texto se escapa. La propiedad innerHTML se sanitiza según contexto HTML. -->
<p>{{ comment }}</p>
<section [innerHTML]="formattedComment"></section>
```

La sanitización no cubre uso directo de `document`, `ElementRef.nativeElement`, librerías DOM ni código fuera del template. `bypassSecurityTrustHtml` no “sanitiza mejor”: desactiva protección y afirma que el valor fue revisado. Mantén cualquier bypass cerca de la fuente controlada, con tipo estrecho, comentario de amenaza y prueba; nunca lo uses para silenciar una advertencia sobre contenido de usuario.

CSP limita scripts y estilos ejecutables. Una aplicación Angular moderna puede recibir nonce generado por respuesta mediante configuración soportada (`autoCsp`, `ngCspNonce` o `CSP_NONCE`, según infraestructura). El mismo valor aparece en header y bootstrap; un nonce fijo deja de ser nonce. Trusted Types obliga al navegador a rechazar strings en sinks de script y añade una frontera efectiva incluso si otra librería toca el DOM.

La autenticación del frontend no protege la API. Guards mejoran navegación, pero el servidor autoriza cada operación. Evita tokens duraderos accesibles a JavaScript cuando el modelo permite cookies HttpOnly; diseña SameSite y defensa CSRF. No registres tokens en interceptor ni telemetría.

SSR agrega superficie: HTML generado debe escapar, URLs y headers proxy deben venir de infraestructura confiable y estado transferido no debe contener secretos o datos de otro usuario. Una cache compartida sin clave correcta puede filtrar páginas personalizadas.

**Analogía:** Angular ofrece cinturones de seguridad, pero `bypassSecurityTrust...` los desabrocha. Puede existir una situación controlada para hacerlo; no convierte el choque en seguro.

**¿Por qué es importante?** porque creer que “Angular evita XSS” oculta las rutas que salen de su template, y un frontend comprometido actúa con la sesión del usuario.

**Casos de uso reales:** CMS con HTML permitido, URL `javascript:`, librería de gráficos, nonce SSR, token filtrado, guard usado como autorización y cache de respuesta personalizada.

**Diagrama:**

```text
dato externo -> binding Angular -> sanitización por contexto -> DOM
                    | bypass = revisión excepcional documentada
DOM directo/terceros ---------------------> Trusted Types
scripts/estilos permitidos --------------> CSP con nonce por respuesta
```

### Tema 3: Internacionalizar implica significado, no reemplazo de texto

**Conceptos clave:** i18n, l10n, locale, mensaje, contexto, ID estable, XLIFF, ICU, plural, género, número, moneda, zona horaria, RTL, pseudo-localización y fallback.

Angular reconoce `i18n` en templates, `i18n-*` para atributos y `$localize` en código. Añade significado y descripción para quien traduce; “Save” puede ser verbo o sustantivo. IDs estables ayudan a conservar traducciones durante refactors, pero deben representar el mismo significado.

```html
<h1 i18n="page title|Heading for task list@@tasksTitle">Mis tareas</h1>
<button
  type="button"
  i18n
  i18n-aria-label="remove action|Accessible label@@removeTask"
  aria-label="Eliminar tarea">
  <span aria-hidden="true">×</span>
</button>
```

`ng extract-i18n` genera el catálogo fuente. El pipeline debe detectar mensajes faltantes y construir cada locale declarada. ICU expresa plural y selección sin concatenar fragmentos; el orden gramatical puede cambiar completamente. No compongas “Tienes ” + count + “ tareas”.

Locale guía presentación de fechas, números y moneda, pero la moneda no se deduce siempre del idioma. Zona horaria es otra decisión: una fecha civil, un instante UTC y un horario futuro tienen semánticas diferentes. Prueba cerca de medianoche y cambios estacionales.

RTL no es reflejar toda pantalla. Usa propiedades lógicas CSS (`margin-inline-start`), iconos direccionales correctos y `dir`. Números, fragmentos de código y marcas pueden conservar dirección. Pseudo-localización expande texto y agrega caracteres para encontrar contenedores rígidos antes de pagar traducciones.

La traducción incluye títulos, aria-labels, errores, emails enlazados y metadatos SSR. Define fallback; mostrar ID interno o string vacío es un fallo observable.

**Analogía:** localizar una obra no es reemplazar palabras en el guion: cambian orden, referencias, longitud, dirección y convenciones, pero debe conservarse la intención.

**¿Por qué es importante?** porque concatenación y formato manual producen gramática incorrecta, cifras ambiguas, fechas desplazadas y accesibilidad en un solo idioma.

**Casos de uso reales:** plural cero/uno/muchos, moneda por cuenta, aplicación árabe RTL, fecha de vencimiento, título SSR y etiqueta accesible traducida.

**Diagrama:**

```text
mensaje + significado -> extract-i18n -> catálogo -> traducción revisada
datos + locale + moneda + zona -> pipes/Intl -> presentación
layout lógico + dir -> LTR/RTL probado
```

### Tema 4: Rendimiento y actualización son contratos de experiencia

**Conceptos clave:** bundle budget, lazy route, @defer, SSR, hydration, Core Web Vitals, LCP, INP, CLS, RUM, cache, service worker, app shell, update, rollback y source map.

El build puede imponer límites en `angular.json`. Un presupuesto inicial evita que una dependencia grande entre sin discusión; presupuestos por componente detectan CSS descontrolado. Establece umbrales desde una línea base y objetivo de usuario, no números copiados. Un warning que nadie atiende no es control: para límites críticos usa error en CI.

```json
{
  "type": "initial",
  "maximumWarning": "350kb",
  "maximumError": "450kb"
}
```

El tamaño comprimido no explica todo. LCP, INP y CLS miden carga, respuesta y estabilidad; observa distribución en usuarios reales segmentada por dispositivo y red, sin convertir IDs de usuario en labels de alta cardinalidad. Lighthouse aporta laboratorio reproducible, no sustituye RUM.

Lazy routes y `@defer` disminuyen JavaScript inicial, pero demasiadas divisiones crean cascadas. SSR entrega HTML temprano; hydration reutiliza el DOM y debe evitar diferencias entre servidor y cliente. Mide antes y después sobre un flujo, incluido dispositivo modesto.

Un service worker permite app shell y caché offline, pero introduce versiones simultáneas. No caches respuestas privadas con estrategia pública. Informa actualización disponible, activa en un punto seguro y prueba migración de estado. “Forzar refresh” durante un formulario puede perder trabajo. Conserva despliegue anterior y estrategia de rollback; si el backend cambió de forma incompatible, volver solo frontend puede no bastar.

Source maps ayudan a simbolizar errores. Controla publicación y acceso. Añade versión del frontend a logs y requests para correlacionar una regresión con release.

**Analogía:** un presupuesto de equipaje no garantiza que el viaje sea cómodo, pero evita abordar con peso ilimitado. Las métricas reales indican si el pasajero llegó rápido y pudo moverse.

**¿Por qué es importante?** porque rendimiento y actualización determinan acceso. Un bundle que funciona en fibra puede dejar fuera a quien usa móvil; una cache incorrecta puede servir código o datos incompatibles.

**Casos de uso reales:** dependencia que añade 600 KB, chunk en cascada, hydration mismatch, SW obsoleto, actualización durante edición, regresión solo en móviles y rollback.

**Diagrama:**

```text
commit -> build budgets -> pruebas lab -> despliegue gradual
                                      -> RUM por versión -> SLO
SW: versión nueva -> aviso -> punto seguro -> activar
                                      `-> error -> rollback probado
```

## Revisión oficial de plataforma — julio de 2026

### Angular v22 y adopción según estabilidad

La documentación activa corresponde a **Angular v22**. La ruta moderna prioriza signals, control flow integrado, componentes standalone y operación **zoneless**, pero la migración se ejecuta con `ng update` y la guía oficial, no reescribiendo la aplicación. El roadmap distingue estable, developer preview y experimental. **Web MCP** aparece como experimental: sirve para explorar integración con herramientas, pero no debe convertirse en dependencia crítica ni confundirse con una garantía estable.

**Aplicación al proyecto:** actualiza una copia mediante la guía 21→22, ejecuta migraciones y pruebas, compara detección de cambios zoneless, revisa compatibilidad Node/TypeScript/RxJS y registra APIs experimentales en un ADR con salida reversible.

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

### Proyecto: auditoría integral de la aplicación standalone

Trabaja sobre el proyecto del módulo 13 y conserva una versión desplegable anterior.

1. Elige flujo login/lista/crear/editar. Recorre con teclado y un lector; registra barreras antes de cambiar código.
2. Corrige landmarks, headings, labels, foco, errores y anuncios. Añade skip link y pruebas axe en CI.
3. Sustituye dos controles personalizados por HTML nativo, Angular Aria, CDK o Material justificando la elección.
4. Introduce un payload XSS inocuo en entorno aislado, identifica el contexto y crea prueba de regresión.
5. Busca `bypassSecurityTrust`, `ElementRef`, `innerHTML` y accesos DOM; elimina o documenta cada excepción.
6. Aplica CSP con nonce por respuesta y Trusted Types. Comprueba lazy chunks, estilos y SSR sin `unsafe-inline` general.
7. Marca mensajes y atributos, extrae catálogo y construye `es-CO` y `en-US`; añade pseudo-locale o RTL de prueba.
8. Verifica plurales, moneda explícita, dos zonas horarias, textos largos, teclado y lector en ambos idiomas.
9. Define budgets iniciales y por componente; rompe uno deliberadamente para demostrar el gate.
10. Mide flujo con dispositivo/red limitados, optimiza un cuello y compara LCP/INP/CLS y bundle.
11. Si habilitas service worker, prueba offline, actualización con formulario abierto y rollback. Si no, documenta por qué no aporta al caso.
12. Entrega runbook de release, dashboard por versión y matriz de evidencia.

**Verificación:** CI ejecuta unitarias, integración, a11y automática, build de todos los locales y budgets. La evidencia manual incluye orden de foco, salida resumida del lector, headers CSP, ataque bloqueado, layout RTL y actualización segura. No declares WCAG completa basándote solo en Lighthouse.

**Errores comunes y soluciones**

- Agregar ARIA a todo: usa HTML nativo y ARIA solo para semántica ausente.
- Mover foco en cada cambio de signal: resérvalo para transiciones que el usuario necesita comprender.
- Silenciar sanitización con bypass: corrige origen/contexto o sanitiza con política mantenida.
- Nonce fijo en `index.html`: genéralo por respuesta y alinea header con bootstrap.
- Concatenar mensajes traducidos: utiliza ICU y mensajes completos con contexto.
- Deducir moneda por locale: transporta currency como dato del dominio.
- Medir solo Lighthouse: combina laboratorio con distribución real por versión.
- Activar SW sin plan: prueba datos privados, versiones, actualización y rollback.

## Ejercicios de evaluación

### Ejercicio 1: control falso

Un `<div role="button" (click)="save()">` es visible y clicable. ¿Qué falta y cuál es la mejor corrección?

<details><summary>Solución razonada</summary>

No entra naturalmente en tabulación ni responde a teclado, disabled o semántica completa. La mejor corrección es `<button type="button">`; reconstruir todo con tabindex y key handlers aumenta riesgo sin beneficio.
</details>

### Ejercicio 2: bypass peligroso

Un desarrollador usa `bypassSecurityTrustHtml(api.description)`. Explica por qué el nombre no implica sanitización.

<details><summary>Solución razonada</summary>

El método marca el valor como confiable y evita defensa de Angular. Si la API contiene texto controlable, habilita XSS almacenado. Debe mostrarse como texto o sanitizar un subconjunto mediante política revisada antes de la frontera.
</details>

### Ejercicio 3: build más pequeño, usuario más lento

El bundle baja 15 %, pero INP empeora. ¿Es éxito?

<details><summary>Solución razonada</summary>

No puede afirmarse. El tamaño es una señal; INP indica respuesta de interacción y pudo empeorar por trabajo síncrono o hydration. Analiza trazas, segmentos y significancia y conserva el cambio solo si mejora el objetivo real.
</details>

## Rúbrica del proyecto

| Criterio | Inicial | Competente | Experto |
|---|---|---|---|
| Accesibilidad | Puntuación automática | Flujo de teclado/lector corregido | Componentes, routing, formularios y regresión automatizados |
| Seguridad | Confía en framework | Contextos y CSP correctos | Trusted Types, SSR y excepciones auditadas con amenaza |
| i18n | Strings traducidos | Catálogos, ICU y formatos | RTL, tiempo, pseudo-locale y accesibilidad verificados |
| Rendimiento | Lighthouse aislado | Budgets y comparación | RUM por versión y cuello demostrado |
| Release | Reemplaza archivos | Actualización y rollback documentados | Cache/SW, compatibilidad y pérdida de estado probadas |

## Bibliografía y fundamento académico

- Angular, documentación oficial de accesibilidad, Angular Aria, internacionalización, seguridad y configuración del workspace.
- W3C, WCAG y WAI-ARIA Authoring Practices; OWASP, prevención de XSS y CSP.
- Unicode Consortium, CLDR; IETF BCP 47 para etiquetas de idioma.
- web.dev, Core Web Vitals y medición de experiencia real.
- CS2023: HCI, Security, Software Engineering, Society/Ethics y Specialized Platform Development.
- SWEBOK V4: Construction, Testing, Quality, Security y Engineering Operations.

Los resultados observables son completar el flujo con tecnologías de asistencia, bloquear un sink hostil sin bypass, construir locales semánticamente correctas y mantener presupuestos y actualización segura con métricas por release.

<!-- OFFICIAL-TOPIC-ATLAS:START -->
## Atlas completo de temas oficiales

Derivado de la [documentación oficial](https://angular.dev/overview), sus referencias, migraciones y guías de operación. Inventariar no equivale a dominar: cada selección se demuestra con código, prueba, medición y explicación. **Cobertura: 46 temas.**

| Área | Temas que deben poder explicarse y aplicarse | Evidencia práctica |
|---|---|---|
| Fundamentos | `standalone components` · `templates` · `bindings` · `directivas` · `pipes` · `servicios` · `inyección de dependencias` | consola RutaFlow |
| Reactividad | `signals` · `computed` · `effect` · `linkedSignal` · `resource` · `RxJS` · `interop signal-observable` · `estado derivado` | consola RutaFlow |
| Aplicación | `router` · `guards` · `resolvers` · `formularios reactivos` · `validación` · `HTTP` · `interceptores` · `errores` | consola RutaFlow |
| Renderizado | `SSR` · `SSG` · `hydration` · `incremental hydration` · `event replay` · `zoneless` · `deferred views` · `streaming` | consola RutaFlow |
| Arquitectura | `lazy loading` · `dominios` · `librerías` · `monorepos` · `configuración` · `i18n` · `microfrontends con criterio` | consola RutaFlow |
| Calidad | `testing` · `harnesses` · `accesibilidad` · `sanitización` · `CSP y Trusted Types` · `rendimiento` · `profiling` · `migraciones` | consola RutaFlow |

### Método de estudio y proyecto de ampliación

Para cada tema responde qué problema resuelve, cuál es su modelo mental, cómo falla, cómo se verifica y cuándo no conviene. Elige uno por área e intégralos en una vertical RutaFlow. Entrega diagrama, ADR, pruebas de éxito y fallo, una medición, una amenaza y el enlace oficial con versión y fecha. Una API preview se aísla en laboratorio y nunca se presenta como base estable.
<!-- OFFICIAL-TOPIC-ATLAS:END -->

## Resumen del módulo

- La accesibilidad combina semántica, teclado, foco, feedback y pruebas humanas.
- Angular sanitiza bindings por contexto, pero DOM directo y bypass cruzan esa protección.
- CSP, Trusted Types y AOT añaden defensas que deben probarse con SSR y lazy loading.
- i18n requiere significado, plural, locale, moneda, zona horaria, RTL y accesibilidad.
- Budgets evitan regresiones; Core Web Vitals reales determinan experiencia.
- Cache y service worker crean coexistencia de versiones y exigen actualización y rollback seguros.
