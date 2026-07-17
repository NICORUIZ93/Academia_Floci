// HttpClient e interceptores (Módulo 7): interceptor funcional que añade el token
// de autenticación a cada petición saliente.
import { HttpInterceptorFn } from '@angular/common/http';

// Desde Angular 15+, los interceptores pueden ser funciones (HttpInterceptorFn) en
// vez de clases que implementan HttpInterceptor — se registran con withInterceptors()
// en provideHttpClient(), sin necesidad de un array `providers` con clases inyectables.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return next(req);
  }

  // Las requests HTTP son inmutables: se clona la request con el header añadido
  // en vez de mutar `req` directamente.
  const clonada = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
  return next(clonada);
};

// Registro en app.config.ts:
//
// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideHttpClient(withInterceptors([authInterceptor])),
//   ],
// };
