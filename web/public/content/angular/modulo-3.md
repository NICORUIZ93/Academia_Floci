## Servicios con inject()

```ts
@Injectable({ providedIn: 'root' }) // un único singleton para toda la app
export class TareasService {
  private tareas = signal<Tarea[]>([]);
  readonly lista = this.tareas.asReadonly();

  agregar(tarea: Tarea) { this.tareas.update(l => [...l, tarea]); }
}

@Component({ /* ... */ })
export class ListaTareas {
  private servicio = inject(TareasService); // más conciso que inyección por constructor
  tareas = this.servicio.lista;
}
```

## Jerarquía de inyectores

```
Root (toda la app)
 └─ Ruta (providers: [...] en una Route)
     └─ Componente (providers: [...] en @Component)
```

Un servicio provisto a nivel de ruta crea una instancia nueva cada vez que se navega a esa ruta; provisto en `root`, es un único singleton compartido por toda la aplicación.

## Tokens de inyección personalizados

```ts
export const API_URL = new InjectionToken<string>('API_URL');

// en app.config.ts
providers: [{ provide: API_URL, useValue: 'https://api.miapp.com' }]

// en cualquier servicio/componente
private apiUrl = inject(API_URL);
```

Útil para inyectar configuración, valores de entorno o implementaciones intercambiables (ej. un servicio mock en tests) sin acoplar el código a un valor fijo.
