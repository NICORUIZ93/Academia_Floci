## Bootstrap sin NgModules

```ts
// main.ts
bootstrapApplication(App, appConfig);

// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideHttpClient()],
};
```

No existe `AppModule`, `declarations` ni `imports` de módulo — cada componente standalone declara sus propias dependencias en su propio `@Component({ imports: [...] })`.

## Organización por feature

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

En vez de agrupar por tipo (`components/`, `services/`, `pipes/`), agrupar por feature mantiene junto todo lo relacionado con una funcionalidad — más fácil de entender y de mover/eliminar como unidad.

## Migrando un proyecto con NgModules

1. Convierte cada componente declarado en un `NgModule` a `standalone: true`, moviendo sus dependencias de `imports` del módulo al propio componente.
2. Reemplaza `RouterModule.forRoot(routes)` por `provideRouter(routes)` en `bootstrapApplication`.
3. Elimina los `NgModule` ya vacíos.

El CLI incluye `ng generate @angular/core:standalone` para automatizar gran parte de esta migración.
