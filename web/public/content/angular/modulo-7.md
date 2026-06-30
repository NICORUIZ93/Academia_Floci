## HttpClient con fetch backend

```ts
// app.config.ts
providers: [provideHttpClient(withFetch())]
```

```ts
interface Usuario { id: number; nombre: string; }

private http = inject(HttpClient);
usuarios = toSignal(this.http.get<Usuario[]>('/api/usuarios'), { initialValue: [] });
```

## Interceptores funcionales

```ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  return next(req).pipe(
    catchError(error => {
      if (error.status === 401) router.navigate(['/login']);
      return throwError(() => error);
    })
  );
};
```

```ts
// app.config.ts
provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))
```

Centralizar el manejo de errores en un interceptor evita repetir el mismo `catchError` en cada llamada HTTP de la aplicación.
