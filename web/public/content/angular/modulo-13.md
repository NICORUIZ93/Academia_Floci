## Estructura del proyecto integrador

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

## Uniendo los módulos anteriores

Este proyecto integra: routing standalone con un guard funcional y una ruta perezosa (módulo 4), un store de signals consumido por múltiples componentes (módulo 9), HttpClient con interceptor de autenticación (módulo 7), formularios reactivos para crear/editar tareas (módulo 5), y tests de los componentes más críticos con Angular Testing Library (módulo 10).

```ts
// tareas.store.ts
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

## Cierre del track

Con este proyecto demuestras que puedes combinar reactividad basada en signals, una arquitectura standalone organizada por features, consumo de datos reales con manejo de errores, y una base de tests — el conjunto de habilidades que un equipo espera de un desarrollador Angular productivo hoy.
