# Módulo 13: React en producción — resiliencia, accesibilidad y seguridad

Una SPA puede aprobar el flujo feliz y aun desaparecer ante un error de render, perder foco al navegar, ejecutar HTML hostil o hidratar con información distinta a la del servidor. Este módulo convierte el proyecto final en una interfaz que falla de forma contenida, recupera con intención y conserva sus garantías entre cliente y servidor.


## Aprende construyendo

### Tema 1: Diseñar estados de carga, error y recuperación

**Conceptos clave:** pureza, render, commit, Effect, sincronización, Suspense, promise cacheada, Error Boundary, fallback, reset, error operacional, defecto, component stack, telemetría y Strict Mode.

El render debe comportarse como función pura: mismas props, estado y contexto producen la misma descripción sin modificar el exterior. Acceder al DOM, iniciar una petición imperativa o escribir storage durante render crea resultados que dependen de cuántas veces React evalúe. Un Effect sincroniza con un sistema externo **después** del commit; no es un lugar genérico para derivar estado que podía calcularse durante render.

Strict Mode repite ciertos ciclos en desarrollo para revelar efectos sin limpieza y render impuro. No “causa” la duplicación de producción: expone que el código no es simétrico. Cada suscripción debe devolver cleanup; cada request debe cancelarse o ignorar resultados obsoletos.

Suspense representa una parte que todavía no puede mostrar contenido. Una frontera demasiado alta reemplaza toda la pantalla por spinner; una demasiado baja produce parpadeo. Ubícala donde el diseño acepta revelar contenido conjuntamente. Una Promise leída mediante `use` necesita identidad cacheada; crearla durante cada render suspende repetidamente.

Error Boundary captura errores de render en descendientes y muestra fallback. No captura event handlers, callbacks asíncronos ordinarios, SSR, ni errores del propio boundary. Los eventos deben manejar rechazo en su flujo; el servidor usa su frontera; timers reportan explícitamente.

```tsx
<ErrorBoundary
  resetKeys={[taskId]}
  fallbackRender={({ resetErrorBoundary }) => (
    <section role="alert">
      <h2>No pudimos mostrar la tarea</h2>
      <button onClick={resetErrorBoundary}>Intentar de nuevo</button>
    </section>
  )}
  onError={(error, info) => reportError(error, info.componentStack)}
>
  <Suspense fallback={<TaskSkeleton />}>
    <TaskDetails id={taskId} />
  </Suspense>
</ErrorBoundary>
```

Recuperar significa restaurar una precondición: invalidar query, crear nueva Promise, resetear boundary o navegar. Un botón que repite el mismo recurso rechazado no recupera. Conserva estado confirmado, revierte optimistic update fallido y distingue offline, 404, 403 y defecto inesperado.

La telemetría incluye versión, ruta lógica y correlation ID, no props completos, tokens ni texto del usuario. Source maps simbolizan stacks con acceso controlado.

**Analogía:** los mamparos de un barco no evitan toda entrada de agua; limitan qué compartimento se pierde y permiten que el resto siga operando mientras se repara.

**¿Por qué es importante?** porque un error de una tarjeta no debería borrar navegación y trabajo no relacionado, y un fallback sin recuperación deja al usuario atrapado.

**Casos de uso reales:** chunk lazy que falla, query rechazada, componente con dato inesperado, actualización optimista revertida, sesión expirada y efecto duplicado en desarrollo.

**Diagrama:**

```text
render puro -> suspende -> Suspense fallback -> recurso resuelve -> UI
           `-> error -> boundary más cercano -> fallback + reporte
evento async -> catch explícito -> estado recuperable
reset -> nuevo recurso/precondición, no repetir objeto rechazado
```

### Tema 2: La composición visual debe conservar semántica y foco

**Conceptos clave:** HTML semántico, nombre accesible, rol, estado, teclado, foco, landmark, heading, route announcement, live region, formulario, error, portal, focus trap, Testing Library y axe.

React no cambia las reglas de HTML. Un componente `Button` que devuelve `<div onClick>` sigue siendo un div. Diseña primitivas semánticas antes de añadir estilos. Props polimórficas requieren contratos: si `as="a"`, debe existir `href`; si actúa como botón, usa button.

Las listas mantienen identidad mediante `key`. Una key inestable no solo afecta rendimiento: puede mover estado y foco al elemento equivocado después de reordenar. Usa identidad del dominio, nunca índice cuando se insertan o eliminan filas.

Al navegar en SPA actualiza `document.title`, conserva un `<h1>` único y anuncia transición. No enfoques automáticamente en cada render. Tras una navegación iniciada por usuario, mover foco al encabezado o contenido principal puede dar contexto; al cerrar modal, retorna al disparador. Portals cambian ubicación DOM, no la jerarquía React, y necesitan foco atrapado, Escape y fondo inerte.

```tsx
function Field({ id, label, error, ...props }: FieldProps) {
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && <p id={errorId}>{error}</p>}
    </div>
  );
}
```

En un submit inválido, muestra resumen con enlaces o lleva foco al primer campo inválido según el flujo, sin borrar valores. Mensajes deben indicar cómo corregir, no solo “error”. Estados loading y disabled conservan nombre y explicación; no sustituyas el botón por spinner sin texto.

Testing Library consulta por roles/nombres porque aproxima el árbol accesible. Añade axe para reglas automatizables y Playwright para tabulación, Escape y restauración de foco. Ninguna herramienta sustituye lector y revisión humana del orden.

**Analogía:** componer componentes es ensamblar señales de tránsito. Cambiar pintura no puede eliminar el significado, orden ni ruta que una persona necesita para llegar.

**¿Por qué es importante?** porque abstracciones de diseño pueden borrar semántica sin que TypeScript avise. El resultado excluye usuarios y vuelve frágiles las pruebas.

**Casos de uso reales:** modal por portal, combobox, formulario multi-paso, lista reordenable, toast, navegación protegida y skeleton que oculta nombres.

**Diagrama:**

```text
componente -> elemento nativo -> nombre + rol + estado
acción teclado -> foco predecible -> feedback asociado
Testing Library/axe -> regresión automática
teclado + lector -> flujo completo comprensible
```

### Tema 3: Cliente y servidor forman una sola frontera de seguridad

**Conceptos clave:** XSS, escape, dangerouslySetInnerHTML, sanitización contextual, URL, CSP, nonce, Server Component, Client Component, serialización, secreto, Server Action, autenticación, autorización, CSRF y cache.

React escapa texto interpolado. `dangerouslySetInnerHTML` omite esa protección porque declara HTML intencional. Solo recibe contenido sanitizado por una política mantenida y apropiada al contexto; no una regex. Valida protocolos de URLs y evita `javascript:`. Librerías que tocan DOM pueden crear sinks fuera de JSX.

```tsx
function RichDescription({ sanitizedHtml }: { sanitizedHtml: SanitizedHtml }) {
  return <section dangerouslySetInnerHTML={{ __html: sanitizedHtml.value }} />;
}
```

El tipo de marca ayuda a que solo el sanitizador cree `SanitizedHtml`, pero no demuestra que la implementación sea segura: prueba payloads y revisa configuración. CSP con nonce/hashes y Trusted Types agrega defensa. Evita permitir `unsafe-inline` global para hacer desaparecer errores.

Server Components no envían su código al cliente, pero los valores que pasan a Client Components se serializan y llegan al navegador. Nunca pases secreto, credencial o objeto con campos privados. Minimiza DTO en la frontera `use client`.

Server Actions son endpoints invocables, no funciones privadas por estar junto al componente. Autentica y autoriza dentro de cada acción, valida `FormData`, protege invariantes y considera CSRF/origen según cookies e infraestructura. Ocultar botón no impide llamar la acción.

La cache del servidor debe incluir identidad, permisos, locale y demás dimensiones que cambian resultado, o evitar cache compartida para datos privados. Tras una mutación, invalida datos correctos sin mostrar a otro usuario una respuesta reutilizada.

```ts
export async function deleteTask(formData: FormData) {
  'use server';
  const session = await requireSession();
  const taskId = TaskId.parse(formData.get('taskId'));
  await authorize(session.userId, 'delete', taskId);
  await tasks.delete(taskId);
}
```

**Analogía:** un Server Action es una puerta tras el mostrador, no una habitación secreta. Aunque el cliente normal llegue mediante un botón, cualquiera puede intentar la dirección y la puerta debe verificar identidad y permiso.

**¿Por qué es importante?** porque mezclar render servidor/cliente mueve datos y acciones a través de fronteras invisibles en JSX. Un supuesto equivocado filtra secretos o autoriza por interfaz.

**Casos de uso reales:** CMS, markdown, avatar URL, acción admin, cookie de sesión, RSC con objeto usuario, cache de dashboard y error serializado.

**Diagrama:**

```text
DB/secreto -> Server Component -> DTO mínimo serializable -> Client Component
form/browser -> Server Action -> autenticar -> autorizar -> validar -> mutar
texto -> escape React; HTML permitido -> sanitizador -> sink auditado
CSP/Trusted Types cubren DOM completo
```

### Tema 4: Hidratación determinista, idioma y releases medibles

**Conceptos clave:** SSR, hydration, mismatch, determinismo, identifierPrefix, suppressHydrationWarning, locale, timezone, RTL, streaming, bundle budget, Core Web Vitals, RUM, deployment ID y rollback.

Hydration une listeners al HTML del servidor suponiendo que el primer render cliente coincide. `Date.now()`, `Math.random()`, lectura directa de `window`, locale distinta o datos que cambian entre respuestas producen mismatch. Pasa snapshot serializable, usa IDs estables (`useId` cuando corresponde) y difiere contenido exclusivamente cliente después del montaje si no puede renderizarse igual.

`suppressHydrationWarning` silencia una diferencia inevitable en un nivel; no corrige datos ni debe cubrir árboles completos. Investiga primero: una divergencia puede asociar handlers con DOM equivocado o forzar render cliente.

El locale decidido en servidor debe llegar al cliente y a la ruta. Formatea números, moneda y fecha con locale y zona explícitos. Traduce contenido, labels, errores, metadatos y fallbacks de Suspense. Soporta plural completo y RTL mediante propiedades CSS lógicas. Prueba textos largos y mezcla bidireccional.

```tsx
const price = new Intl.NumberFormat(locale, {
  style: 'currency',
  currency: task.currency,
}).format(task.amount);

const due = new Intl.DateTimeFormat(locale, {
  dateStyle: 'long',
  timeZone: userTimeZone,
}).format(new Date(task.dueAt));
```

Define presupuesto de JS inicial y por ruta, pero mide experiencia: LCP, INP y CLS en dispositivos reales, segmentados por versión y ruta. Server Components pueden reducir JS, pero queries secuenciales crean waterfalls. Streaming mejora contenido temprano si boundaries siguen la jerarquía visual.

Cada release incluye deployment ID en telemetría, source maps privados, canary y rollback. Cliente y servidor pueden coexistir durante despliegue; cambios de contrato deben ser compatibles. Un chunk viejo solicitado después de limpiar assets produce fallo: conserva assets por ventana o maneja actualización con recarga segura que no pierda formulario.

**Analogía:** hidratar es superponer un plano interactivo sobre un edificio ya construido. Si puerta y ventana aparecen en posiciones distintas, ocultar la advertencia no alinea el edificio.

**¿Por qué es importante?** porque SSR solo aporta valor si el cliente conserva el resultado, y una app global debe producir el mismo significado entre servidor, navegador y release.

**Casos de uso reales:** hora local distinta, ID aleatorio, tema desde localStorage, locale por header, RTL, chunk desaparecido, despliegue canary y rollback compatible.

**Diagrama:**

```text
request -> locale/zona/datos snapshot -> HTML servidor
                                  `-> payload -> primer render cliente idéntico
build -> budgets -> canary -> RUM por deployment ID -> ampliar
                                  `-> regresión -> rollback compatible
```

## Revisión oficial de plataforma — julio de 2026

### React 19.2, Compiler y seguridad de Server Components

**React 19.2** incorpora `Activity`, `useEffectEvent`, `cacheSignal`, Performance Tracks y capacidades de pre-render parcial. `useEffectEvent` separa lógica no reactiva de un efecto sin mentir al linter; no es una forma general de omitir dependencias. **React Compiler** 1.0 puede reducir memorización manual, pero primero exige código conforme a las reglas de React y mediciones. Las aplicaciones con React Server Components deben usar una versión parcheada —19.0.1, 19.1.2, 19.2.1 o posterior— por avisos oficiales de seguridad.

**Aplicación al proyecto:** elimina una memorización especulativa y compara Performance Tracks, modela una pantalla conservada con Activity, migra un callback de efecto a useEffectEvent y añade un gate que rechace versiones vulnerables de paquetes RSC.


## Laboratorio práctico

### Proyecto: auditoría resiliente de la SPA y su versión Next.js

Parte del proyecto 12. Si migraste una vista a Next.js, ejecuta las pruebas de servidor/cliente; si conservas Vite, implementa las partes aplicables y documenta la frontera que no existe.

1. Dibuja árbol de Suspense y Error Boundaries para rutas y widgets. Justifica qué contenido permanece ante cada fallo.
2. Inyecta errores de render, query, handler, timer y SSR; registra cuáles captura cada mecanismo.
3. Implementa fallback accesible con retry que renueva el recurso y conserva estado confirmado.
4. Recorre login/lista/crear/editar solo con teclado y lector. Corrige semántica, foco, errores y announcements.
5. Automatiza roles/nombres, orden de tabulación, modal y restauración de foco con Testing Library, axe y Playwright.
6. Introduce un payload XSS inocuo en una descripción rica aislada, corrige con política contextual y añade CSP.
7. Audita props que cruzan Server/Client Components y cada Server Action; prueba 401, 403, manipulación y CSRF aplicable.
8. Provoca mismatches con fecha, random e información de navegador; elimínalos sin abuso de `suppressHydrationWarning`.
9. Añade `es-CO` y `en-US`, plurales, moneda y dos zonas; prueba RTL o pseudo-RTL y fallbacks.
10. Define budgets por entrada/ruta y mide Core Web Vitals en un dispositivo limitado antes/después de una mejora.
11. Simula despliegue con HTML viejo y chunks nuevos, y viceversa. Documenta compatibilidad, recuperación de formulario y rollback.

**Verificación:** conserva matriz fallo/frontera/resultado, evidencia del lector, reporte axe, payload bloqueado, pruebas de autorización, logs de hydration limpios, capturas de locales/RTL y comparación de métricas por deployment ID. CI falla ante regresión de contrato, a11y o budget crítico.

**Errores comunes y soluciones**

- Usar Effect para derivar estado: calcula durante render o modela evento; Effect sincroniza externos.
- Un boundary global único: delimita unidades que pueden fallar y recuperarse independientemente.
- Esperar que boundary capture eventos/timers: usa manejo asíncrono explícito.
- Arreglar accesibilidad con `aria-label` indiscriminado: empieza por elemento, label y flujo nativos.
- Confiar en “React escapa”: revisa HTML intencional, URLs, DOM externo y librerías.
- Autorizar ocultando botones: valida sesión y permiso dentro de acción/servidor.
- Silenciar hydration: elimina no determinismo o aísla la diferencia inevitable mínima.
- Formatear según navegador tras SSR: conserva la misma decisión de locale/zona en ambos lados.




## Atlas completo de temas oficiales

Derivado de la [documentación oficial](https://react.dev/reference/react), sus referencias, migraciones y guías de operación. Inventariar no equivale a dominar: cada selección se demuestra con código, prueba, medición y explicación. **Cobertura: 45 temas.**

| Área | Temas que deben poder explicarse y aplicarse | Evidencia práctica |
|---|---|---|
| Modelo | `pureza` · `JSX` · `props` · `estado` · `keys` · `render y commit` · `eventos` · `estado como snapshot` | portal RutaFlow |
| Hooks | `useState` · `useReducer` · `useContext` · `useRef` · `useEffect` · `useLayoutEffect` · `useEffectEvent` · `hooks propios` | portal RutaFlow |
| UX | `formularios` · `Actions` · `useActionState` · `useOptimistic` · `useTransition` · `Suspense` · `use` · `error boundaries` | portal RutaFlow |
| Servidor | `SSR` · `streaming` · `hidratación` · `Server Components` · `Server Functions` · `use client/use server` · `serialización` | portal RutaFlow |
| Optimización | `React Compiler` · `reglas del compilador` · `memoización` · `profiler` · `code splitting` · `caché` · `virtualización` | portal RutaFlow |
| Ingeniería | `routing` · `testing` · `accesibilidad` · `seguridad RSC` · `estado remoto` · `arquitectura` · `migración` | portal RutaFlow |

### Método de estudio y proyecto de ampliación

Para cada tema responde qué problema resuelve, cuál es su modelo mental, cómo falla, cómo se verifica y cuándo no conviene. Elige uno por área e intégralos en una vertical RutaFlow. Entrega diagrama, ADR, pruebas de éxito y fallo, una medición, una amenaza y el enlace oficial con versión y fecha. Una API preview se aísla en laboratorio y nunca se presenta como base estable.
<!-- OFFICIAL-TOPIC-ATLAS:END -->
