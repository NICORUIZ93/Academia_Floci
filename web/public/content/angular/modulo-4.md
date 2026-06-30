## Configuración de rutas standalone

```ts
export const routes: Routes = [
  { path: '', component: Home },
  { path: 'tareas', loadComponent: () => import('./tareas/lista').then(m => m.Lista) },
  { path: 'tareas/:id', loadComponent: () => import('./tareas/detalle').then(m => m.Detalle) },
  { path: 'admin', loadComponent: () => import('./admin/panel').then(m => m.Panel), canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
```

`loadComponent` carga el chunk solo cuando el usuario navega a esa ruta — reduce el bundle inicial.

## Guard funcional

```ts
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.estaAutenticado() ? true : router.parseUrl('/login');
};
```

Un guard funcional es solo una función — fácil de testear sin necesidad de `TestBed` ni mocks de clase.

## Parámetros de ruta

```ts
@Component({ /* ... */ })
export class Detalle {
  id = input<string>(); // input binding de rutas: Angular lo llena automáticamente desde :id
}
```

```ts
// con ActivatedRoute, alternativa clásica
private route = inject(ActivatedRoute);
id = toSignal(this.route.paramMap.pipe(map(p => p.get('id'))));
```
