// Routing y navegación: guard funcional (Módulo 4).
// Uso de referencia: referencia authGuard desde el array `canActivate` de una ruta.
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

// Los guards funcionales (desde Angular 15+) son simples funciones, no clases con
// interfaces que implementar — más fáciles de testear y componer que los guards
// basados en clases de versiones anteriores de Angular.
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const estaAutenticado = Boolean(localStorage.getItem('token'));

  if (!estaAutenticado) {
    // Redirige a login y guarda la URL original como query param, para
    // volver ahí después de un login exitoso.
    router.navigate(['/login'], { queryParams: { redirectTo: state.url } });
    return false;
  }
  return true;
};

// Uso en las rutas:
//
// export const routes: Routes = [
//   {
//     path: 'panel',
//     canActivate: [authGuard],
//     loadComponent: () => import('./panel/panel.component').then((m) => m.PanelComponent),
//   },
// ];
