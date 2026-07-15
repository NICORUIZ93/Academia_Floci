# Módulo 13: Proyecto integrador — aplicación standalone completa

## Sílabo

**Objetivo general**

Construir una aplicación Angular standalone completa que integre routing con guards, un store de estado con signals, HttpClient con interceptores, formularios reactivos y una suite básica de pruebas, demostrando el conjunto combinado de habilidades del track.

**Objetivos específicos**

1. Estructurar el proyecto organizando el código por feature.
2. Implementar rutas protegidas con un guard funcional y carga perezosa.
3. Construir un store de tareas con signals que consuma HttpClient.
4. Implementar un formulario reactivo para crear y editar tareas.
5. Escribir pruebas para los componentes más críticos de la aplicación.

**Contenido**

- Estructura del proyecto integrador.
- Integración de routing, store, HttpClient y formularios.
- `TareasStore`: signals + computed + HttpClient.
- Cierre del track: el conjunto de habilidades combinadas.

**Evaluación**

Construcción completa de la aplicación de gestión de tareas descrita, más tres ejercicios de evaluación de cierre.

---

## Contenido teórico

### Tema 1: Estructura del proyecto integrador

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

**Conceptos clave:** store inyectable que consume HttpClient, estado derivado con `computed`.

`TareasStore`, registrado con `providedIn: 'root'` (Módulo 3), mantiene un signal privado `tareas` con el arreglo completo de tareas cargadas desde el backend, y expone `pendientes` como un `computed()` derivado que filtra automáticamente solo las tareas no completadas, recalculándose sin intervención manual cada vez que el signal `tareas` cambia (Módulo 2), de la misma forma que `total` se recalculaba automáticamente en `CarritoStore` (Módulo 9).

El método `cargar()` del store inyecta `HttpClient` (Módulo 7) y realiza la petición GET correspondiente, suscribiéndose a la respuesta para actualizar el signal `tareas` con `.set(t)` una vez que los datos llegan del servidor; en una versión más completa de este store, esta suscripción se combinaría con `takeUntilDestroyed()` (Módulo 6) si el store tuviera un ciclo de vida más corto que el de toda la aplicación, aunque al estar registrado en la raíz con `providedIn: 'root'`, su ciclo de vida coincide con el de la aplicación completa, haciendo esa precaución menos crítica en este caso específico.

Esta combinación de signals para el estado local reactivo, `computed()` para estado derivado, y `HttpClient` para sincronizar ese estado con un backend real, ejemplifica el patrón central de gestión de estado que domina la mayoría de aplicaciones Angular modernas: un store simple, inyectable y encapsulado, que integra naturalmente tanto la reactividad síncrona de signals como la naturaleza asíncrona de la comunicación de red, sin necesidad de la ceremonia adicional de NgRx (Módulo 9) para un caso de uso de esta complejidad moderada.

**Analogía:** `TareasStore` es como un gestor de inventario que mantiene la lista maestra actualizada de productos (el signal `tareas`), calcula automáticamente vistas derivadas útiles como "productos por reabastecer" (el `computed` `pendientes`), y se encarga por su cuenta de sincronizar periódicamente esa lista maestra con el proveedor externo (la petición HTTP), sin que ningún otro departamento de la empresa necesite involucrarse directamente en esa sincronización.

**¿Por qué es importante?** `TareasStore` demuestra en una única clase compacta cómo combinar los tres pilares estudiados a lo largo del track — reactividad de signals, estado derivado con `computed`, y comunicación asíncrona con `HttpClient` — en un patrón de store simple y suficiente para la gran mayoría de aplicaciones reales.

**Diagrama:**

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

## Ejercicios de evaluación

### Ejercicio 1: Separación de features

**Enunciado:** explica por qué `auth/` y `tareas/` se mantienen como features separadas en vez de mezclar toda la lógica en una única carpeta.

**Solución esperada:** mantenerlas separadas refleja una separación real de responsabilidades de dominio (quién es el usuario y qué puede hacer, frente a la lógica de negocio de gestión de tareas en sí), permitiendo que cada feature evolucione independientemente y que la lógica de tareas no necesite conocer los detalles internos de cómo funciona la autenticación, solo su punto de integración explícito (el guard, el interceptor).

**Criterios de éxito:**
- Explica correctamente la separación de responsabilidades de dominio entre ambas features.

### Ejercicio 2: Por qué un store de signals aquí, no NgRx

**Enunciado:** justifica por qué `TareasStore` usa un store de signals directo en vez de NgRx, según los criterios estudiados en el Módulo 9.

**Solución esperada:** la complejidad de este caso (un store simple con estado local y una sincronización HTTP directa) no requiere historial de cambios inspeccionable, ni un patrón único obligatorio para un equipo grande, ni coordinación de side-effects asíncronos complejos, los tres criterios que justificarían la ceremonia adicional de NgRx según el Módulo 9; un store de signals simple es suficiente y más simple de mantener para este caso.

**Criterios de éxito:**
- Justifica correctamente aplicando los criterios de decisión estudiados en el Módulo 9, no solo una preferencia sin fundamento.

### Ejercicio 3: Cierre del track — habilidades combinadas

**Enunciado:** enumera las habilidades concretas del track de Angular que este proyecto integrador combina en una única aplicación.

**Solución esperada:** reactividad basada en signals (Módulo 2), arquitectura standalone organizada por features (Módulo 8), routing con guards funcionales y carga perezosa (Módulo 4), consumo de datos reales con HttpClient e interceptores (Módulo 7), formularios reactivos con validación (Módulo 5), y una base de pruebas para los componentes críticos (Módulo 10).

**Criterios de éxito:**
- Enumera al menos cuatro de las seis habilidades combinadas, vinculándolas correctamente a los módulos donde se estudiaron.

---

## Resumen del módulo

**Puntos clave**

- El proyecto integrador organiza el código en features claramente separadas (`tareas/`, `auth/`).
- Combina routing con guards funcionales y carga perezosa, un store de signals con HttpClient, y formularios reactivos.
- `TareasStore` ejemplifica el patrón central de gestión de estado con signals, `computed` y HttpClient.
- El proyecto demuestra la integración natural de todo el conjunto de habilidades estudiadas a lo largo del track.

**Conceptos aprendidos**

- Estructura de un proyecto real organizado por feature.
- Integración de routing, estado y formularios en una aplicación completa.
- Aplicación práctica de los criterios de decisión estudiados (signals frente a NgRx, `switchMap` frente a otros operadores, SSR y `@defer`).

**Próximos pasos**

Con el track de Angular completo, estás preparado para construir, mantener y escalar aplicaciones Angular modernas de nivel productivo, combinando signals, arquitectura standalone, routing, formularios, HttpClient y testing.

**Recursos adicionales**

- Documentación oficial de Angular (angular.dev) como referencia continua para profundizar en cualquiera de los temas de este track.
