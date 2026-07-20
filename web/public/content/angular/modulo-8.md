# Módulo 8: Standalone components y arquitectura sin NgModules


## Aprende construyendo

### Tema 1: Bootstrap sin NgModules

**Conceptos clave:** `bootstrapApplication`, ausencia de `AppModule`, `ApplicationConfig`.

Antes de que existieran los standalone components (Módulo 0), toda aplicación Angular requería un `AppModule` raíz decorado con `@NgModule({ declarations: [...], imports: [...], bootstrap: [AppComponent] })`, que actuaba como el punto de entrada obligatorio de la aplicación, declarando explícitamente qué componentes pertenecían a ese módulo y qué otros módulos importaba. Con `bootstrapApplication(App, appConfig)` en `main.ts`, ese `AppModule` raíz desaparece por completo: el componente raíz se arranca directamente, y su configuración global (proveedores de routing, HTTP, animaciones, etc.) se declara en un objeto `ApplicationConfig` plano (típicamente en `app.config.ts`), sin ninguna clase de módulo de por medio.

`app.config.ts` centraliza el arreglo `providers` que anteriormente estaría distribuido entre el `AppModule` y potencialmente varios módulos de features (`imports: [RouterModule.forRoot(routes), HttpClientModule]`), reemplazándolo por funciones `provide*()` explícitas (`provideRouter(routes)`, `provideHttpClient()`), cada una responsable de configurar exactamente un aspecto concreto de la aplicación, en vez de un módulo monolítico que agrupaba configuración heterogénea bajo una única declaración `imports`.

Sin `AppModule`, tampoco existen `declarations` ni el concepto de "módulo de features" que agrupa componentes relacionados bajo un `NgModule` dedicado: cada componente standalone declara directamente, en su propio decorador `@Component({ imports: [...] })` (Módulo 0), exactamente qué otros componentes, directivas y pipes necesita, haciendo explícitas sus propias dependencias sin depender de qué módulo lo "envuelva" externamente.

**Analogía:** el `AppModule` tradicional era como un directorio telefónico central que había que consultar y mantener actualizado para saber qué partes de la aplicación existían y cómo se relacionaban entre sí; con standalone components, cada componente lleva consigo su propia lista de contactos directos, sin depender de un directorio centralizado externo.

**¿Por qué es importante?** Eliminar el `AppModule` y los NgModules de features simplifica el árbol de dependencias de la aplicación: cada componente declara explícitamente lo que necesita, sin capas intermedias de configuración de módulos que rastrear.

**Código del ejemplo:**

```ts
// main.ts
bootstrapApplication(App, appConfig);

// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideHttpClient()],
};
// No existe AppModule, ni declarations, ni imports de módulo.
```

### Tema 2: Organización por feature

**Conceptos clave:** cohesión, agrupación por funcionalidad frente a agrupación por tipo.

Un enfoque común pero problemático a gran escala organiza el código por tipo de archivo (`components/`, `services/`, `pipes/`, `guards/`), lo cual dispersa todo lo relacionado con una única funcionalidad concreta (por ejemplo, "tareas") a través de múltiples carpetas distantes entre sí, obligando a saltar entre `components/tarea-lista/`, `services/tareas.service.ts` y `guards/tarea.guard.ts` para entender o modificar completamente esa funcionalidad, incluso cuando esos archivos casi siempre cambian juntos.

Organizar por feature en cambio agrupa bajo una única carpeta (`tareas/`) todos los archivos relacionados con esa funcionalidad concreta: sus componentes (`tarea-lista.ts`, `tarea-detalle.ts`), su servicio o store (`tareas.service.ts`), y sus rutas (`tareas.routes.ts`), maximizando la cohesión (Módulo 3 del track de JavaScript, principio de responsabilidad única aplicado a nivel de organización de archivos, no solo de funciones individuales): todo lo que cambia junto vive junto, y eliminar completamente una funcionalidad de la aplicación se reduce a eliminar una única carpeta, en vez de rastrear y eliminar archivos dispersos entre múltiples carpetas por tipo.

**Analogía:** organizar por tipo es como guardar todas las herramientas de un mismo material en un cajón (todos los destornilladores juntos, todos los martillos juntos), obligando a abrir varios cajones distintos para ensamblar un mueble completo; organizar por feature es como tener una caja de herramientas dedicada específicamente a ensamblar ese mueble en particular, con todo lo necesario junto en un mismo lugar.

**¿Por qué es importante?** La organización por feature mantiene junto todo lo que cambia junto, facilitando entender, modificar y eliminar una funcionalidad completa como una unidad coherente.

**Diagrama:**

```
src/app/
  tareas/
    tarea-lista.ts
    tarea-detalle.ts
    tareas.service.ts
    tareas.routes.ts
  usuarios/
    ...
```

### Tema 3: Migración desde NgModules

**Conceptos clave:** conversión gradual, `ng generate @angular/core:standalone`, compatibilidad durante la transición.

Migrar un proyecto existente basado en NgModules hacia standalone components es un proceso incremental, no un "big bang" que deba completarse de una sola vez: el primer paso consiste en convertir cada componente declarado en un `NgModule` a `standalone: true`, moviendo sus dependencias desde el arreglo `imports` del módulo contenedor hacia el propio decorador `@Component` de cada componente individual, un cambio que puede hacerse componente por componente mientras el resto de la aplicación sigue usando NgModules normalmente (Angular soporta la coexistencia de componentes standalone y basados en módulos durante la transición).

El segundo paso reemplaza `RouterModule.forRoot(routes)` (la configuración tradicional de routing dentro de un `NgModule`) por `provideRouter(routes)` dentro de `bootstrapApplication`, moviendo la configuración de rutas desde el sistema de módulos hacia el sistema de providers standalone (Módulo 4). El tercer paso, una vez que todos los componentes de un `NgModule` ya son standalone y ya no queda ningún `declarations` con contenido real, elimina ese `NgModule` ahora vacío por completo, dado que ya no cumple ninguna función.

El CLI de Angular incluye `ng generate @angular/core:standalone`, un esquema de migración automática (Módulo 12) que analiza el proyecto existente y aplica gran parte de estos tres pasos automáticamente, reduciendo significativamente el trabajo manual necesario para una migración completa, aunque revisar manualmente el resultado sigue siendo necesario para casos especiales que el esquema automático no cubre perfectamente.

**Analogía:** migrar de NgModules a standalone es como remodelar una casa habitada habitación por habitación en vez de demoler la casa entera y reconstruirla de cero: cada habitación (componente) se puede actualizar de forma independiente mientras el resto de la casa sigue siendo habitable y funcional durante todo el proceso.

**¿Por qué es importante?** Una migración incremental, apoyada por herramientas automáticas del CLI, permite modernizar gradualmente un proyecto grande sin necesidad de detener el desarrollo de nuevas funcionalidades durante el proceso.

**Diagrama:**

```
Paso 1: Componente NgModule → standalone: true (mover imports al componente)
Paso 2: RouterModule.forRoot(routes) → provideRouter(routes)
Paso 3: Eliminar el NgModule ya vacío
Automatización: ng generate @angular/core:standalone
```

---


## Laboratorio práctico

**Objetivo del laboratorio:** migrar un componente NgModule a standalone y reorganizar el proyecto por feature.

**Requisitos previos:** Módulos 0-7 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Identificar un componente en un NgModule | — | Revisa sus dependencias declaradas en `imports` del módulo |
| 2 | Convertirlo a standalone | `standalone: true` + `imports: [...]` propios | Mueve las dependencias al propio componente |
| 3 | Reemplazar `RouterModule.forRoot` | `provideRouter(routes)` | En `bootstrapApplication` |
| 4 | Eliminar el NgModule vacío | — | Verifica que no quede nada en `declarations` |
| 5 | Reorganizar por feature | Ver Tema 2 | Agrupa componentes, servicio y rutas relacionados |

**Verificación:** el laboratorio se considera exitoso si la aplicación compila y funciona igual después de la migración, sin ningún `NgModule` de features restante, y con el código reorganizado en carpetas por feature.

**Errores comunes y soluciones**

- **Intentar migrar toda la aplicación de una sola vez.** Migra componente por componente; Angular soporta coexistencia durante la transición.
- **Olvidar mover una dependencia del módulo al componente.** Verifica en tiempo de compilación qué falta declarando explícitamente en `imports` del componente.
- **Dejar un NgModule vacío sin eliminar.** Elimínalo una vez que ya no declare ningún componente real.

---
