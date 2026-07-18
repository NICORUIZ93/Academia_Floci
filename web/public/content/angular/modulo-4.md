# Módulo 4: Routing y navegación

## Sílabo

**Objetivo general**

Estructurar una aplicación Angular con múltiples vistas, carga perezosa de rutas y protección de acceso mediante guards funcionales, usando la configuración de rutas standalone moderna.

**Objetivos específicos**

1. Configurar rutas standalone con `Routes` y `provideRouter`.
2. Implementar guards funcionales (`CanActivateFn`) para proteger rutas.
3. Implementar lazy loading de componentes con `loadComponent`.
4. Leer parámetros de ruta y query params, integrándolos con signals.
5. Explicar el propósito de `CanDeactivateFn`, `CanMatchFn`, `canActivateChild` y `ResolveFn`.

**Contenido**

- Router config con rutas standalone.
- Guards funcionales (`CanActivate`).
- Lazy loading con `loadComponent`.
- Parámetros de ruta y query params.
- `CanDeactivateFn`, `CanMatchFn`, `canActivateChild` y `ResolveFn`.
- `ActivatedRouteSnapshot`, `RouterStateSnapshot` y `fragment`.

**Evaluación**

Una aplicación con al menos 4 rutas, una protegida por guard y una cargada de forma perezosa, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Router config con rutas standalone

**Conceptos clave:** `Routes`, `provideRouter`, configuración declarativa de navegación.

La configuración de rutas en Angular moderno se declara como un array plano de objetos `Routes` (`export const routes: Routes = [...]`), cada uno asociando un `path` (el segmento de URL) con un `component` a renderizar (o, para lazy loading, una función `loadComponent`, Tema 3), y se registra en la aplicación mediante `provideRouter(routes)` dentro del array de `providers` de la configuración de la aplicación (`app.config.ts`), reemplazando el antiguo patrón de `RouterModule.forRoot(routes)` que requería un `NgModule` dedicado exclusivamente al routing.

Cada ruta puede además declarar `canActivate` (un array de guards que deben aprobar el acceso antes de activar la ruta, Tema 2), y una ruta con `path: "**"` (comodín que coincide con cualquier URL no capturada por ninguna ruta anterior) combinada con `redirectTo` gestiona el caso de una URL no reconocida, redirigiendo típicamente hacia una página de inicio o una vista de error 404 dedicada. El orden de las rutas en el array importa: Angular evalúa las rutas en el orden declarado, activando la primera que coincida con la URL actual, por lo que la ruta comodín `**` debe declararse siempre al final del array, después de todas las rutas específicas, para no interceptar accidentalmente URLs que sí deberían coincidir con una ruta más específica declarada después de ella.

Esta configuración declarativa centralizada de todas las rutas de la aplicación en un único array (o en varios arrays organizados por feature, combinados mediante rutas hijas anidadas) proporciona una visión completa y auditable de toda la navegación posible de la aplicación en un solo lugar, facilitando razonar sobre qué vistas existen, cuáles están protegidas, y cuáles se cargan de forma perezosa, sin necesidad de rastrear esa información dispersa entre múltiples archivos de configuración de módulos como en el patrón histórico anterior a la adopción de standalone.

**Analogía:** la configuración de rutas es como el índice completo y centralizado de un edificio de oficinas, listando cada oficina disponible (cada ruta), quién tiene permiso de entrar a cada una (guards), y cuáles solo se abren y se acondicionan bajo demanda cuando alguien realmente solicita visitarlas (lazy loading), en vez de mantener todas las oficinas completamente acondicionadas y listas desde el primer momento aunque nadie las visite nunca.

**¿Por qué es importante?** La configuración declarativa de rutas centraliza toda la navegación posible de una aplicación en un lugar auditable, y `provideRouter` reemplaza el patrón anterior basado en NgModules, alineándose con la arquitectura standalone moderna estudiada en el Módulo 8.

**Código del ejemplo:**

```ts
export const routes: Routes = [
  { path: '', component: Home },
  { path: 'tareas', loadComponent: () => import('./tareas/lista').then(m => m.Lista) },
  { path: 'tareas/:id', loadComponent: () => import('./tareas/detalle').then(m => m.Detalle) },
  { path: 'admin', loadComponent: () => import('./admin/panel').then(m => m.Panel), canActivate: [authGuard] },
  { path: '**', redirectTo: '' }, // siempre al final
];
```

### Tema 2: Guards funcionales

**Conceptos clave:** `CanActivateFn`, protección de rutas, testabilidad.

Un guard funcional es simplemente una función que Angular invoca antes de activar una ruta, devolviendo `true` (permite la navegación), `false` (la bloquea) o una `UrlTree` (redirige hacia otra ruta en vez de bloquear silenciosamente, la opción más amigable para el usuario, que en vez de simplemente denegar el acceso lo redirige hacia una ubicación más apropiada, como una página de login). `export const authGuard: CanActivateFn = () => { const auth = inject(AuthService); return auth.estaAutenticado() ? true : inject(Router).parseUrl("/login"); };` ilustra este patrón: usa `inject()` (Módulo 3) directamente dentro de la función, sin necesitar ninguna clase ni constructor, precisamente el contexto funcional donde `inject()` es indispensable.

Esta forma funcional reemplaza el patrón histórico de guards implementados como clases que implementan una interfaz específica (`CanActivate`), y ofrece una ventaja concreta de testabilidad: probar un guard funcional es simplemente invocar la función directamente con argumentos simulados y verificar su valor de retorno, sin necesidad de instanciar una clase completa mediante `TestBed` ni de simular su ciclo de vida de inyección de dependencias como clase, una prueba unitaria considerablemente más simple y directa (en el espíritu del Módulo 9 del track de JavaScript, donde funciones puras y simples son más fáciles de probar que estructuras con estado y dependencias complejas).

Encadenar múltiples guards en el array `canActivate` de una misma ruta (`canActivate: [authGuard, permisosGuard]`) permite componer verificaciones independientes: Angular evalúa cada guard en orden, y la navegación solo procede si todos aprueban; si cualquiera de ellos devuelve `false` o una `UrlTree`, la navegación se detiene (o se redirige) en ese punto, sin evaluar los guards restantes de la lista, un patrón de composición similar en espíritu al middleware de Express estudiado en el Módulo 4 del track de Node.js.

**Analogía:** un guard funcional es como un control de acceso independiente y simple en la entrada de una sala específica, que verifica una condición puntual (¿tiene la credencial correcta?) y decide si permite el paso, lo deniega, o redirige hacia otra sala más apropiada; ser una simple función (no una clase compleja) lo hace tan fácil de probar como verificar el resultado de cualquier función pura ante distintas entradas simuladas.

**¿Por qué es importante?** Los guards funcionales son considerablemente más fáciles de testear que las clases guard clásicas, y el patrón de devolver una `UrlTree` para redirigir (en vez de simplemente bloquear) ofrece una experiencia de usuario más amigable ante un acceso denegado.

**Código del ejemplo:**

```ts
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.estaAutenticado() ? true : router.parseUrl('/login');
};
```

### Tema 3: Lazy loading con loadComponent

**Conceptos clave:** carga bajo demanda de rutas, `import()` dinámico, reducción del bundle inicial.

`loadComponent: () => import("./tareas/lista").then(m => m.Lista)` usa `import()` dinámico (estudiado en profundidad en el Módulo 7 del track de JavaScript) para cargar el componente correspondiente a una ruta específica únicamente cuando el usuario navega efectivamente hacia esa ruta, en vez de incluir el código de todas las rutas posibles de la aplicación en el bundle inicial que se descarga al cargar la aplicación por primera vez. Verificar en la pestaña Network de las herramientas de desarrollador que el chunk correspondiente a una ruta con `loadComponent` solo se descarga en el momento exacto de navegar hacia ella (no antes, durante la carga inicial de la aplicación) confirma directamente que el lazy loading está funcionando como se espera.

Esta técnica tiene un impacto directo y medible en el tiempo de carga inicial percibido por el usuario, especialmente en aplicaciones con muchas rutas o con funcionalidades específicas (como un panel de administración usado solo por un subconjunto reducido de usuarios) que no todos los usuarios necesitan cargar en cada visita: un usuario que solo navega a la página de inicio de una aplicación con `loadComponent` en sus demás rutas nunca descarga el código de esas otras rutas durante esa sesión específica, reduciendo tanto el tiempo de descarga inicial como el tiempo de parseo y ejecución de JavaScript que el navegador debe realizar antes de que la aplicación se vuelva interactiva.

Combinar lazy loading de rutas con guards (Tema 2) en la misma ruta es perfectamente natural: `{path: "admin", loadComponent: ..., canActivate: [authGuard]}` evalúa primero el guard, y solo si aprueba la navegación, procede a descargar y renderizar el chunk correspondiente, evitando incluso el coste de descarga de un componente al que, de todas formas, el usuario no tendría acceso a ver si el guard lo hubiera rechazado.

**Analogía:** el lazy loading de rutas es como un servicio de streaming que descarga cada episodio de una serie únicamente cuando el espectador decide reproducirlo, en vez de descargar la temporada completa de antemano sin saber con certeza qué episodios específicos el espectador realmente llegará a ver.

**¿Por qué es importante?** `loadComponent` reduce directamente el tamaño del bundle inicial, mejorando el tiempo de carga percibido, especialmente valioso en aplicaciones con muchas rutas o funcionalidades opcionales de uso poco frecuente.

**Código del ejemplo:**

```ts
{ path: 'tareas', loadComponent: () => import('./tareas/lista').then(m => m.Lista) }
// verificar en DevTools → Network: el chunk de "lista" solo se descarga al navegar a /tareas
```

### Tema 4: Parámetros de ruta, query params y capacidades avanzadas de routing

**Conceptos clave:** input binding de rutas, `ActivatedRoute`, `CanDeactivateFn`, `ResolveFn`.

Los parámetros de ruta dinámicos (`:id` en `path: "tareas/:id"`) pueden leerse de dos formas: la forma clásica inyecta `ActivatedRoute` y suscribe (o convierte con `toSignal`, Módulo 6) al observable `paramMap`; la forma moderna y más concisa usa "input binding de rutas", donde simplemente declarar `id = input<string>();` en el componente hace que Angular llene automáticamente ese input con el valor del parámetro de ruta `:id` correspondiente, sin ninguna suscripción manual necesaria, una integración directa entre el sistema de routing y el modelo de inputs basados en signals estudiado en el Módulo 1.

Los query params (`?estado=pendiente`), a diferencia de los parámetros de ruta (que son parte de la estructura jerárquica de la URL), representan filtros o modificadores opcionales que no cambian qué componente se activa, sino que proporcionan información adicional que ese componente puede leer para ajustar su comportamiento (por ejemplo, qué filtro aplicar sobre una lista mostrada). Sincronizar un query param con un signal del componente permite que el estado del filtro sea reflejado en la URL (haciendo esa vista filtrada compartible mediante un enlace directo, y preservada correctamente ante recargas de página o el uso del botón de retroceso del navegador).

`CanDeactivateFn` protege contra la navegación fuera de una ruta actual (útil para advertir al usuario si intenta abandonar un formulario con cambios sin guardar); `CanMatchFn` decide si una ruta puede considerarse una coincidencia en absoluto antes incluso de intentar activarla (útil, por ejemplo, para mostrar una ruta alternativa completamente distinta según una condición, en vez de simplemente bloquear el acceso a la misma ruta); `canActivateChild` aplica un guard a todas las rutas hijas de una ruta padre de una sola vez, evitando declarar el mismo guard repetidamente en cada ruta hija individual; y `ResolveFn` permite precargar datos necesarios para una vista antes de que esa vista termine de activarse, garantizando que el componente ya tenga los datos disponibles inmediatamente al renderizarse, en vez de mostrar primero un estado de carga y solicitar los datos después de que el componente ya esté visible.

**Analogía:** los parámetros de ruta son como el número de habitación específico dentro de un hotel (parte de la dirección estructural); los query params son como instrucciones adicionales de servicio para esa habitación específica (limpieza extra, no molestar), que no cambian cuál habitación es pero sí modifican cómo se atiende. `CanDeactivateFn` es como preguntar "¿está seguro de que quiere salir de la habitación sin llevar sus pertenencias?" antes de permitir la salida; `ResolveFn` es como tener la habitación completamente preparada y lista antes de que el huésped llegue, en vez de empezar a prepararla justo cuando él ya está entrando.

**¿Por qué es importante?** El input binding de rutas simplifica la lectura de parámetros integrándose directamente con signals; los guards avanzados (`CanDeactivate`, `CanMatch`, `canActivateChild`) y `ResolveFn` cubren escenarios de navegación más sofisticados que un simple `CanActivate` no resuelve por sí solo.

**Código del ejemplo:**

```ts
@Component({ /* ... */ })
export class Detalle {
  id = input<string>(); // Angular lo llena automáticamente desde :id de la ruta
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

**Objetivo del laboratorio:** construir una aplicación con al menos 4 rutas, incluyendo una protegida por guard funcional y una cargada de forma perezosa, con parámetros de ruta y query params sincronizados.

**Requisitos previos:** Módulos 0-3 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Definir al menos 4 rutas | home, lista, detalle/:id, 404 con redirectTo | Verifica el orden correcto del array |
| 2 | Cargar una ruta de forma perezosa | `loadComponent` | Verifica en Network que solo se descarga al navegar |
| 3 | Implementar un guard funcional | Ver Tema 2 | Bloquea el acceso si no hay "sesión" simulada |
| 4 | Leer un parámetro de ruta | Input binding de rutas | Úsalo para cargar el detalle correspondiente |
| 5 | Sincronizar un query param con un signal | `?estado=pendiente` | Verifica persistencia ante recarga de página |

**Verificación:** el laboratorio se considera exitoso si las 4 rutas navegan correctamente, si la ruta protegida redirige apropiadamente sin sesión simulada, y si el chunk de la ruta perezosa se confirma descargado solo al navegar hacia ella.

**Errores comunes y soluciones**

- **Colocar la ruta comodín `**` antes de rutas específicas.** Siempre debe ir al final del array, o interceptará URLs que deberían coincidir con rutas más específicas.
- **Bloquear silenciosamente con `false` en vez de redirigir con una `UrlTree`.** Prefiere redirigir hacia una ubicación útil (como `/login`) para una mejor experiencia de usuario.
- **Confundir parámetros de ruta con query params.** Los parámetros de ruta identifican qué recurso se muestra; los query params modifican cómo se muestra, sin cambiar qué componente se activa.

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

- Las rutas standalone se declaran como un array `Routes` registrado con `provideRouter`, reemplazando el patrón `RouterModule.forRoot` basado en NgModules.
- Los guards funcionales son simples funciones, considerablemente más fáciles de testear que las clases guard clásicas, y pueden redirigir con una `UrlTree` en vez de solo bloquear.
- `loadComponent` habilita lazy loading de rutas, reduciendo el bundle inicial y mejorando el tiempo de carga percibido.
- El input binding de rutas simplifica la lectura de parámetros; `CanDeactivateFn`, `CanMatchFn`, `canActivateChild` y `ResolveFn` cubren escenarios avanzados de navegación.

**Conceptos aprendidos**

- Configuración declarativa de rutas standalone.
- Guards funcionales y su ventaja de testabilidad.
- Lazy loading de componentes con `loadComponent`.
- Parámetros de ruta, query params, y mecanismos avanzados de routing.

**Próximos pasos**

En el Módulo 5 aprenderás formularios reactivos y template-driven, con validadores síncronos y asíncronos, y formularios anidados y dinámicos con `FormArray`.

**Recursos adicionales**

- Documentación oficial de Angular: "Routing" y "Router reference".
