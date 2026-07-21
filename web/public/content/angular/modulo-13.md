# Módulo 13: Proyecto integrador — aplicación standalone completa


## Aprende construyendo

### Tema 1: Estructura del proyecto integrador

#### Paso 1 · Objetivo y preparación
Al finalizar podrás ensamblar una app Angular completa desde cero. Prerrequisitos: Node.js LTS, npm y Angular CLI. Verifica ng version.

#### Paso 2 · Contexto y caso real
En un caso real, una app de entregas necesita navegación, estado, formularios y backend sin que el estudiante adivine la ubicación de cada archivo.

#### Paso 3 · Teoría, modelo mental y analogía
El proyecto integrador conecta componentes, rutas, store, validación y HTTP mediante contratos. La analogía es una central: cada área recibe una responsabilidad, un evento y una evidencia de salida.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-angular-m13
cd ejemplo-angular-m13
npx -p @angular/cli ng new app --standalone --routing=true --style=css --skip-git
cd app
ng serve
```
Crea src/app/features/deliveries con ruta, store, formulario y servicio; implementa primero el camino feliz y prueba en el navegador.

#### Paso 5 · Práctica guiada
Pista: rompe deliberadamente el contrato del formulario para provocar un fallo deliberado de validación o HTTP; lee el error, corrígelo y registra el resultado. Resultado esperado: flujo completo estable.

#### Paso 6 · Práctica independiente
Añade loading/empty/error, guard, test de componente, prueba HTTP y README con estructura, decisiones y comandos exactos.

#### Paso 7 · Cierre y evidencia
Guarda captura, árbol, tests y logs; como siguiente paso publica un build de producción. Errores comunes: lógica en plantilla, store sin límites, error invisible y carpetas ambiguas. Fuentes oficiales: https://angular.dev/overview y https://angular.dev/guide/http.
**¿Por qué es importante?** Porque integrar capas demuestra que el estudiante puede construir y mantener una aplicación real.
**Evidencia de aprendizaje:** entrega aplicación funcionando, pruebas, fallo diagnosticado y guía reproducible.
**Conceptos clave:** organización por feature, separación entre `tareas/` y `auth/`.

Siguiendo el principio de organización por feature estudiado en el Módulo 8, el proyecto integrador se estructura en dos features principales claramente separadas: `tareas/`, que agrupa todo lo relacionado con la gestión de tareas (`tarea-lista.ts` para listar, `tarea-detalle.ts` para ver/editar una tarea individual, `tareas.store.ts` como store centralizado de estado, y `tareas.routes.ts` con las rutas específicas de esta feature), y `auth/`, que agrupa todo lo relacionado con autenticación (`auth.guard.ts` como guard funcional de protección de rutas, `auth.interceptor.ts` como interceptor de autenticación HTTP, y `auth.service.ts` como servicio de estado de sesión).

`app.routes.ts` y `app.config.ts` permanecen en la raíz de `src/app/`, actuando como el punto de composición donde se ensamblan las rutas y providers de cada feature individual (mediante `loadChildren` o composición directa de arreglos de rutas, Módulo 4), sin que la raíz de la aplicación necesite conocer los detalles internos de implementación de cada feature, solo su punto de integración público (las rutas que expone, los providers globales que requiere).

Esta separación clara entre `tareas/` y `auth/` refleja además una separación de responsabilidades a nivel de dominio: `auth/` se preocupa exclusivamente por quién es el usuario actual y si tiene permiso para acceder a ciertas rutas, mientras que `tareas/` se preocupa exclusivamente por la lógica de negocio de gestión de tareas en sí, comunicándose entre sí solo a través de puntos de integración explícitos (el guard consultando el estado de autenticación, el interceptor agregando el token a las peticiones de tareas), sin que la lógica de tareas necesite conocer los detalles internos de cómo funciona la autenticación.

**Analogía:** la estructura del proyecto integrador es como un edificio con departamentos claramente delimitados (tareas, autenticación), cada uno con su propia responsabilidad interna bien definida, comunicándose entre sí únicamente a través de puertas y protocolos explícitos (el guard, el interceptor), sin que un departamento necesite conocer el funcionamiento interno completo del otro.

**¿Por qué es importante?** Una estructura clara por feature, con puntos de integración explícitos entre features distintas, mantiene el proyecto comprensible y modificable a medida que crece, evitando que la lógica de dominios distintos se entremezcle de forma difícil de mantener.

**Diagrama:**

```
src/app/
  tareas/
    tarea-lista.ts
    tarea-detalle.ts
    tareas.store.ts      ← signals + computed
    tareas.routes.ts
  auth/
    auth.guard.ts
    auth.interceptor.ts
    auth.service.ts
  app.routes.ts
  app.config.ts
```

### Tema 2: Integrando routing, store y formularios

#### Paso 1 · Objetivo y preparación
Al finalizar podrás ensamblar una app Angular completa desde cero. Prerrequisitos: Node.js LTS, npm y Angular CLI. Verifica ng version.

#### Paso 2 · Contexto y caso real
En un caso real, una app de entregas necesita navegación, estado, formularios y backend sin que el estudiante adivine la ubicación de cada archivo.

#### Paso 3 · Teoría, modelo mental y analogía
El proyecto integrador conecta componentes, rutas, store, validación y HTTP mediante contratos. La analogía es una central: cada área recibe una responsabilidad, un evento y una evidencia de salida.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-angular-m13
cd ejemplo-angular-m13
npx -p @angular/cli ng new app --standalone --routing=true --style=css --skip-git
cd app
ng serve
```
Crea src/app/features/deliveries con ruta, store, formulario y servicio; implementa primero el camino feliz y prueba en el navegador.

#### Paso 5 · Práctica guiada
Pista: rompe deliberadamente el contrato del formulario para provocar un fallo deliberado de validación o HTTP; lee el error, corrígelo y registra el resultado. Resultado esperado: flujo completo estable.

#### Paso 6 · Práctica independiente
Añade loading/empty/error, guard, test de componente, prueba HTTP y README con estructura, decisiones y comandos exactos.

#### Paso 7 · Cierre y evidencia
Guarda captura, árbol, tests y logs; como siguiente paso publica un build de producción. Errores comunes: lógica en plantilla, store sin límites, error invisible y carpetas ambiguas. Fuentes oficiales: https://angular.dev/overview y https://angular.dev/guide/http.
**¿Por qué es importante?** Porque integrar capas demuestra que el estudiante puede construir y mantener una aplicación real.
**Evidencia de aprendizaje:** entrega aplicación funcionando, pruebas, fallo diagnosticado y guía reproducible.
**Conceptos clave:** guard funcional, ruta perezosa, store con HttpClient, formulario reactivo.

El routing del proyecto integrador combina un guard funcional (`CanActivateFn`, Módulo 4) que consulta `AuthService` para verificar si existe una sesión activa antes de permitir el acceso a las rutas de `tareas/`, junto con carga perezosa mediante `loadComponent` (Módulo 4) para que el código de la feature de tareas solo se descargue cuando el usuario efectivamente navega hacia ella, reduciendo el bundle inicial de la aplicación para usuarios que todavía no han iniciado sesión y por tanto no necesitan ese código todavía.

`TareasStore` (detallado en el Tema 3) actúa como la única fuente de verdad del estado de tareas, consumido tanto por `tarea-lista.ts` (que muestra la lista completa, posiblemente filtrada mediante un `computed()` como `pendientes`) como por `tarea-detalle.ts` (que muestra y permite editar una tarea individual), garantizando que ambos componentes vean siempre el mismo estado consistente sin necesidad de sincronización manual entre ellos, exactamente el mismo patrón de store compartido estudiado en el Módulo 9.

El formulario de creación/edición de tareas usa Reactive Forms (Módulo 5) con un `FormGroup` que incluye validadores síncronos para campos obligatorios (título, por ejemplo) y potencialmente un validador asíncrono para verificar, por ejemplo, que no exista ya una tarea con el mismo título exacto, consultando al servicio correspondiente de forma similar al patrón estudiado en ese módulo; al enviar el formulario, el store se actualiza a través de su método público correspondiente (nunca modificando el signal interno directamente desde el componente del formulario, Módulo 9), manteniendo la encapsulación del estado centralizado.

**Analogía:** integrar routing, store y formularios es como coordinar la entrada (el guard, verificando quién puede pasar), el almacén central (el store, con la única versión autorizada de la mercancía) y el mostrador de pedidos (el formulario, donde se solicitan cambios que el almacén central procesa y refleja para todos).

**¿Por qué es importante?** Combinar estas piezas de forma coherente (guard protegiendo rutas, store como única fuente de verdad, formulario comunicándose con el store a través de métodos públicos) demuestra cómo los conceptos estudiados de forma aislada en módulos anteriores se combinan naturalmente en una aplicación real.

**Diagrama:**

```
auth.guard.ts (CanActivateFn) → protege tareas.routes.ts (loadComponent, lazy)
tareas.store.ts ← consumido por → tarea-lista.ts + tarea-detalle.ts
formulario reactivo → store.metodoPublico(...) → estado actualizado para ambos componentes
```

### Tema 3: TareasStore — combinando signals, computed y HttpClient

#### Paso 1 · Objetivo y preparación
Al finalizar podrás ensamblar una app Angular completa desde cero. Prerrequisitos: Node.js LTS, npm y Angular CLI. Verifica ng version.

#### Paso 2 · Contexto y caso real
En un caso real, una app de entregas necesita navegación, estado, formularios y backend sin que el estudiante adivine la ubicación de cada archivo.

#### Paso 3 · Teoría, modelo mental y analogía
El proyecto integrador conecta componentes, rutas, store, validación y HTTP mediante contratos. La analogía es una central: cada área recibe una responsabilidad, un evento y una evidencia de salida.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-angular-m13
cd ejemplo-angular-m13
npx -p @angular/cli ng new app --standalone --routing=true --style=css --skip-git
cd app
ng serve
```
Crea src/app/features/deliveries con ruta, store, formulario y servicio; implementa primero el camino feliz y prueba en el navegador.

#### Paso 5 · Práctica guiada
Pista: rompe deliberadamente el contrato del formulario para provocar un fallo deliberado de validación o HTTP; lee el error, corrígelo y registra el resultado. Resultado esperado: flujo completo estable.

#### Paso 6 · Práctica independiente
Añade loading/empty/error, guard, test de componente, prueba HTTP y README con estructura, decisiones y comandos exactos.

#### Paso 7 · Cierre y evidencia
Guarda captura, árbol, tests y logs; como siguiente paso publica un build de producción. Errores comunes: lógica en plantilla, store sin límites, error invisible y carpetas ambiguas. Fuentes oficiales: https://angular.dev/overview y https://angular.dev/guide/http.
**¿Por qué es importante?** Porque integrar capas demuestra que el estudiante puede construir y mantener una aplicación real.
**Evidencia de aprendizaje:** entrega aplicación funcionando, pruebas, fallo diagnosticado y guía reproducible.
**Conceptos clave:** store inyectable que consume HttpClient, estado derivado con `computed`.

`TareasStore`, registrado con `providedIn: 'root'` (Módulo 3), mantiene un signal privado `tareas` con el arreglo completo de tareas cargadas desde el backend, y expone `pendientes` como un `computed()` derivado que filtra automáticamente solo las tareas no completadas, recalculándose sin intervención manual cada vez que el signal `tareas` cambia (Módulo 2), de la misma forma que `total` se recalculaba automáticamente en `CarritoStore` (Módulo 9).

El método `cargar()` del store inyecta `HttpClient` (Módulo 7) y realiza la petición GET correspondiente, suscribiéndose a la respuesta para actualizar el signal `tareas` con `.set(t)` una vez que los datos llegan del servidor; en una versión más completa de este store, esta suscripción se combinaría con `takeUntilDestroyed()` (Módulo 6) si el store tuviera un ciclo de vida más corto que el de toda la aplicación, aunque al estar registrado en la raíz con `providedIn: 'root'`, su ciclo de vida coincide con el de la aplicación completa, haciendo esa precaución menos crítica en este caso específico.

Esta combinación de signals para el estado local reactivo, `computed()` para estado derivado, y `HttpClient` para sincronizar ese estado con un backend real, ejemplifica el patrón central de gestión de estado que domina la mayoría de aplicaciones Angular modernas: un store simple, inyectable y encapsulado, que integra naturalmente tanto la reactividad síncrona de signals como la naturaleza asíncrona de la comunicación de red, sin necesidad de la ceremonia adicional de NgRx (Módulo 9) para un caso de uso de esta complejidad moderada.

**Analogía:** `TareasStore` es como un gestor de inventario que mantiene la lista maestra actualizada de productos (el signal `tareas`), calcula automáticamente vistas derivadas útiles como "productos por reabastecer" (el `computed` `pendientes`), y se encarga por su cuenta de sincronizar periódicamente esa lista maestra con el proveedor externo (la petición HTTP), sin que ningún otro departamento de la empresa necesite involucrarse directamente en esa sincronización.

**¿Por qué es importante?** `TareasStore` demuestra en una única clase compacta cómo combinar los tres pilares estudiados a lo largo del track — reactividad de signals, estado derivado con `computed`, y comunicación asíncrona con `HttpClient` — en un patrón de store simple y suficiente para la gran mayoría de aplicaciones reales.

**Código del ejemplo:**

```ts
@Injectable({ providedIn: 'root' })
export class TareasStore {
  private tareas = signal<Tarea[]>([]);
  readonly pendientes = computed(() => this.tareas().filter(t => !t.completada));

  constructor(private http: HttpClient) {}

  cargar() {
    this.http.get<Tarea[]>('/api/tareas').subscribe(t => this.tareas.set(t));
  }
}
```

---

## Proyecto transversal RutaFlow: Consola operativa de rutas

RutaFlow conecta este track con una plataforma completa de paquetería. La implementación de referencia está en `examples/rutaflow/angular/operations.store.ts`; se estudia como punto de partida pequeño, no como sistema terminado.

### Capacidad y fundamento

Representa carga, éxito y error como unión discriminada, evitando combinaciones como `loading=true` con `error` y datos viejos. Signals almacenan la fuente mínima y `computed` deriva rutas retrasadas. Componentes de mapa, filtros y tabla consumen vistas derivadas sin mutar arrays ni duplicar reglas.

### Implementación guiada

1. Copia el contrato y escribe primero casos normales, límite, inválidos y duplicados.
2. Ejecuta la referencia, provoca un fallo y explica el mensaje antes de modificarla.
3. Implementa una mejora pequeña manteniendo nombres de dominio, efectos visibles y errores tipados.
4. Integra con el contrato del track anterior sin compartir tablas, estado mutable ni detalles de framework.
5. Registra la decisión en el README y etiqueta el hito de RutaFlow correspondiente.

### Verificación profesional

Construye lista y mapa sincronizados, filtro por centro y panel de retrasos. Prueba cada estado, actualización de una ruta, teclado, foco y anuncio accesible. Mide recomputaciones antes de aplicar optimizaciones y evita introducir un store global para estado que pertenece a una sola pantalla.

El capítulo se completa cuando la evidencia permite a otra persona reproducir el flujo y explicar qué garantías ofrece y cuáles todavía no.


## Laboratorio práctico

**Objetivo del laboratorio:** construir la aplicación integradora completa de gestión de tareas.

**Requisitos previos:** Módulos 0-12 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Estructurar el proyecto por feature | Ver Tema 1 | `tareas/` y `auth/` separados |
| 2 | Implementar el guard funcional y la ruta perezosa | Ver Tema 2 | `CanActivateFn` + `loadComponent` |
| 3 | Construir `TareasStore` | Ver Tema 3 | signals + computed + HttpClient |
| 4 | Implementar el formulario reactivo de tareas | Módulo 5 | Validadores síncronos y asíncronos |
| 5 | Escribir pruebas de los componentes críticos | Módulo 10 | `TestBed` o Angular Testing Library |

**Verificación:** el laboratorio (y el track completo) se considera exitoso si la aplicación protege correctamente las rutas de tareas para usuarios sin sesión, si el store mantiene un estado consistente entre múltiples componentes, y si el formulario de tareas valida correctamente antes de enviar cambios al store.

**Errores comunes y soluciones**

- **Mezclar lógica de autenticación dentro de la feature de tareas.** Mantén `auth/` y `tareas/` como features separadas, comunicándose solo a través de puntos de integración explícitos.
- **Modificar el signal del store directamente desde el formulario.** Usa siempre los métodos públicos del store, nunca el signal interno directamente.
- **Omitir pruebas de los componentes críticos.** Prioriza probar el guard, el store y el formulario, que concentran la lógica más importante de la aplicación.

---
