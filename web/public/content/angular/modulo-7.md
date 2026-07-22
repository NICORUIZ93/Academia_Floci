# Módulo 7: HttpClient e interceptores


## Aprende construyendo

### Tema 1: HttpClient con backend fetch

#### Paso 1 · Objetivo y preparación
Al finalizar podrás consumir una API Angular desde cero. Prerrequisitos: Node.js LTS, npm, Angular CLI y una API de prueba. Verifica ng version.

#### Paso 2 · Contexto y caso real
En un caso real, la aplicación solicita entregas, adjunta autenticación, registra latencia y muestra errores útiles sin duplicar código en cada componente.

#### Paso 3 · Teoría, modelo mental y analogía
HttpClient crea solicitudes tipadas; fetch reduce dependencia de XHR; interceptores funcionales transforman o observan cada request. Centralizar errores evita respuestas inconsistentes, pero no debe ocultar la causa. La analogía es un punto de control: añade sello, mide el paso y deriva incidentes.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-angular-m7
cd ejemplo-angular-m7
npx -p @angular/cli ng new app --standalone --routing=false --style=css --skip-git
cd app
ng serve
```
Crea src/app/api.service.ts y src/app/auth.interceptor.ts; registra provideHttpClient con interceptors y muestra respuesta o error en una vista.

#### Paso 5 · Práctica guiada
Pista: apunta deliberadamente a una URL inválida para provocar un fallo deliberado de red; lee el status, registra el contexto y corrígelo. Resultado esperado: mensaje de error accionable sin romper la aplicación.

#### Paso 6 · Práctica independiente
Añade timeout, retry selectivo, correlation ID y una prueba con HttpTestingController; nunca incluyas tokens en logs.

#### Paso 7 · Cierre y evidencia
Guarda request, respuesta, error y captura; como siguiente paso estudia autenticación. Errores comunes: interceptores con efectos ocultos, retry de 4xx, respuestas sin tipos y logging de PII. Fuentes oficiales: https://angular.dev/guide/http/interceptors y https://angular.dev/guide/http/setup.
**¿Por qué es importante?** Porque una frontera HTTP coherente hace observable y mantenible toda la comunicación.
**Evidencia de aprendizaje:** entrega servicio, interceptor, prueba de error y correlation ID; explica el resultado y conserva la salida.
**Conceptos clave:** `provideHttpClient(withFetch())`, peticiones tipadas, integración con signals.

`HttpClient` es el servicio inyectable de Angular para realizar peticiones HTTP, devolviendo Observables (Módulo 6) por cada petición realizada, que se resuelven una única vez con la respuesta del servidor (o se rechazan con un error) y luego se completan automáticamente. Desde versiones recientes de Angular, `provideHttpClient(withFetch())` configura `HttpClient` para usar la API `fetch()` nativa del navegador como mecanismo de transporte subyacente en vez de `XMLHttpRequest` (el mecanismo tradicional), lo cual habilita mejor soporte de streaming de respuestas y es más compatible con entornos de ejecución modernos como Server-Side Rendering (Módulo 11), donde `fetch` está disponible de forma nativa sin polyfills adicionales.

Tipar las respuestas HTTP con interfaces TypeScript (`interface Usuario { id: number; nombre: string; }`, y luego `this.http.get<Usuario[]>('/api/usuarios')`) no valida en tiempo de ejecución que la respuesta real del servidor efectivamente tenga esa forma (TypeScript se borra completamente al compilar, Módulo 0), pero sí proporciona autocompletado y verificación de tipos en tiempo de compilación sobre cómo el código consume esa respuesta, capturando errores comunes como acceder a una propiedad mal escrita o asumir un tipo incorrecto para un campo, exactamente en el momento de escribir el código, no en producción.

Combinar `HttpClient` con `toSignal()` (Módulo 6) convierte directamente el Observable de una petición HTTP en un signal legible de forma síncrona en plantillas y `computed()`, unificando el modelo de datos de la aplicación bajo signals incluso cuando el origen de esos datos es una petición asíncrona de red, evitando la necesidad de gestionar manualmente un estado de "cargando/cargado/error" con propiedades sueltas del componente.

**Analogía:** `HttpClient` es como un mensajero especializado que sabe exactamente cómo pedir información a un servidor remoto y traer la respuesta de vuelta; tipar la respuesta es como pedirle al mensajero que traiga la información en un formato específico y conocido de antemano, para que quien la reciba sepa exactamente qué esperar sin tener que inspeccionarla manualmente.

**¿Por qué es importante?** `provideHttpClient(withFetch())` moderniza el transporte subyacente de las peticiones; tipar las respuestas atrapa errores de uso en tiempo de compilación; `toSignal` integra los datos de red en el mismo modelo reactivo que el resto de la aplicación.

**Código del ejemplo:**

```ts
// app.config.ts
providers: [provideHttpClient(withFetch())]

interface Usuario { id: number; nombre: string; }
private http = inject(HttpClient);
usuarios = toSignal(this.http.get<Usuario[]>('/api/usuarios'), { initialValue: [] });
```

### Tema 2: Interceptores funcionales

#### Paso 1 · Objetivo y preparación
Al finalizar podrás consumir una API Angular desde cero. Prerrequisitos: Node.js LTS, npm, Angular CLI y una API de prueba. Verifica ng version.

#### Paso 2 · Contexto y caso real
En un caso real, la aplicación solicita entregas, adjunta autenticación, registra latencia y muestra errores útiles sin duplicar código en cada componente.

#### Paso 3 · Teoría, modelo mental y analogía
HttpClient crea solicitudes tipadas; fetch reduce dependencia de XHR; interceptores funcionales transforman o observan cada request. Centralizar errores evita respuestas inconsistentes, pero no debe ocultar la causa. La analogía es un punto de control: añade sello, mide el paso y deriva incidentes.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-angular-m7
cd ejemplo-angular-m7
npx -p @angular/cli ng new app --standalone --routing=false --style=css --skip-git
cd app
ng serve
```
Crea src/app/api.service.ts y src/app/auth.interceptor.ts; registra provideHttpClient con interceptors y muestra respuesta o error en una vista.

#### Paso 5 · Práctica guiada
Pista: apunta deliberadamente a una URL inválida para provocar un fallo deliberado de red; lee el status, registra el contexto y corrígelo. Resultado esperado: mensaje de error accionable sin romper la aplicación.

#### Paso 6 · Práctica independiente
Añade timeout, retry selectivo, correlation ID y una prueba con HttpTestingController; nunca incluyas tokens en logs.

#### Paso 7 · Cierre y evidencia
Guarda request, respuesta, error y captura; como siguiente paso estudia autenticación. Errores comunes: interceptores con efectos ocultos, retry de 4xx, respuestas sin tipos y logging de PII. Fuentes oficiales: https://angular.dev/guide/http/interceptors y https://angular.dev/guide/http/setup.
**¿Por qué es importante?** Porque una frontera HTTP coherente hace observable y mantenible toda la comunicación.
**Evidencia de aprendizaje:** entrega servicio, interceptor, prueba de error y correlation ID; explica el resultado y conserva la salida.
**Conceptos clave:** `HttpInterceptorFn`, transformación de la petición, manejo del flujo de respuesta.

Un interceptor es una función que se inserta en la cadena de procesamiento de cada petición HTTP saliente (y de cada respuesta entrante), pudiendo inspeccionar y modificar la petición antes de que llegue al servidor, o inspeccionar y transformar la respuesta (o el error) antes de que llegue al código que originó la petición, similar en concepto a los guards funcionales del Módulo 4 (una función simple con acceso a `inject()` en vez de una clase con dependencias declaradas en su constructor).

`authInterceptor`, un ejemplo típico, inyecta un `AuthService` para leer el token de autenticación actual, y clona la petición saliente agregándole un header `Authorization: Bearer <token>` (las peticiones HTTP son inmutables por diseño, de ahí `req.clone(...)` en vez de mutar `req` directamente), garantizando que absolutamente ninguna petición saliente del código de la aplicación olvide incluir ese header, sin necesidad de recordar agregarlo manualmente en cada llamada individual a `HttpClient` a lo largo de toda la aplicación.

`errorInterceptor`, otro ejemplo típico, envuelve la llamada a `next(req)` con un operador `catchError` de RxJS (Módulo 6): si la respuesta de error tiene código 401 (no autorizado, típicamente porque el token expiró o es inválido), redirige automáticamente a la ruta de login usando el `Router` (Módulo 4) inyectado; para cualquier otro error, lo relanza con `throwError` para que el código que originó la petición pueda manejarlo específicamente si necesita hacerlo.

**Analogía:** un interceptor es como un control de seguridad en la entrada de un edificio que revisa (y puede modificar, agregando una credencial) cada persona que entra, y también revisa cada persona que sale (la respuesta), pudiendo redirigirla automáticamente si algo no está en orden, sin que cada visitante individual tenga que recordar mostrar su credencial por su cuenta.

**¿Por qué es importante?** Los interceptores centralizan comportamiento transversal (autenticación, manejo de errores) que de otro modo tendría que repetirse manualmente en cada llamada HTTP individual de la aplicación, un ejemplo directo del principio DRY.

**Código del ejemplo:**

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

### Tema 3: Registro de interceptores y centralización del manejo de errores

#### Paso 1 · Objetivo y preparación
Al finalizar podrás consumir una API Angular desde cero. Prerrequisitos: Node.js LTS, npm, Angular CLI y una API de prueba. Verifica ng version.

#### Paso 2 · Contexto y caso real
En un caso real, la aplicación solicita entregas, adjunta autenticación, registra latencia y muestra errores útiles sin duplicar código en cada componente.

#### Paso 3 · Teoría, modelo mental y analogía
HttpClient crea solicitudes tipadas; fetch reduce dependencia de XHR; interceptores funcionales transforman o observan cada request. Centralizar errores evita respuestas inconsistentes, pero no debe ocultar la causa. La analogía es un punto de control: añade sello, mide el paso y deriva incidentes.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-angular-m7
cd ejemplo-angular-m7
npx -p @angular/cli ng new app --standalone --routing=false --style=css --skip-git
cd app
ng serve
```
Crea src/app/api.service.ts y src/app/auth.interceptor.ts; registra provideHttpClient con interceptors y muestra respuesta o error en una vista.

#### Paso 5 · Práctica guiada
Pista: apunta deliberadamente a una URL inválida para provocar un fallo deliberado de red; lee el status, registra el contexto y corrígelo. Resultado esperado: mensaje de error accionable sin romper la aplicación.

#### Paso 6 · Práctica independiente
Añade timeout, retry selectivo, correlation ID y una prueba con HttpTestingController; nunca incluyas tokens en logs.

#### Paso 7 · Cierre y evidencia
Guarda request, respuesta, error y captura; como siguiente paso estudia autenticación. Errores comunes: interceptores con efectos ocultos, retry de 4xx, respuestas sin tipos y logging de PII. Fuentes oficiales: https://angular.dev/guide/http/interceptors y https://angular.dev/guide/http/setup.
**¿Por qué es importante?** Porque una frontera HTTP coherente hace observable y mantenible toda la comunicación.
**Evidencia de aprendizaje:** entrega servicio, interceptor, prueba de error y correlation ID; explica el resultado y conserva la salida.
**Conceptos clave:** `withInterceptors`, orden de ejecución, DRY aplicado a errores HTTP.

Los interceptores se registran en `app.config.ts` mediante `provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))`, aplicándose en el orden declarado en el arreglo para las peticiones salientes, y en orden inverso para las respuestas entrantes (de forma similar a cómo se anidan los middlewares en Express, estudiado en el Módulo 3 del track de Node.js), lo cual importa cuando un interceptor depende del resultado de otro (por ejemplo, si un interceptor de logging necesita ver la petición ya con el header de autenticación agregado por `authInterceptor`, debe registrarse después de él en el arreglo).

Sin un interceptor centralizado de errores, cada componente o servicio que realiza una petición HTTP tendría que repetir su propia lógica de `catchError` para manejar un 401 (redirigir a login) o un 500 (mostrar un mensaje genérico de error), duplicando la misma lógica de manejo decenas de veces a lo largo de la aplicación, y arriesgando inconsistencias si un desarrollador olvida agregar ese manejo en una llamada nueva; centralizarlo en un único interceptor garantiza que el comportamiento sea uniforme y que agregar una nueva regla de manejo de errores (por ejemplo, reintentar automáticamente ante un error 503) solo requiera modificar un único lugar del código.

**Analogía:** registrar interceptores es como definir el orden de las estaciones de control por las que pasa cada paquete en un centro de distribución: el orden importa porque cada estación puede depender de que la anterior ya haya hecho su trabajo (por ejemplo, etiquetar el paquete antes de que la siguiente estación lo escanee).

**¿Por qué es importante?** El orden de registro de interceptores determina el orden real de ejecución; centralizar el manejo de errores en un único interceptor evita duplicar la misma lógica de manejo en cada llamada HTTP individual de la aplicación.

**Código del ejemplo:**

```ts
// app.config.ts
provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))
// Petición saliente:  authInterceptor → errorInterceptor → servidor
// Respuesta entrante:  servidor → errorInterceptor → authInterceptor → código origen
```

---


## Laboratorio práctico

**Objetivo del laboratorio:** consumir una API con autenticación e interceptor de errores centralizado.

**Requisitos previos:** Módulos 0-6 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Configurar `HttpClient` con fetch | `provideHttpClient(withFetch())` | Backend moderno de transporte |
| 2 | Definir la interfaz de respuesta | Ver Tema 1 | Autocompletado y verificación de tipos |
| 3 | Escribir `authInterceptor` | Ver Tema 2 | Agrega el header de autenticación automáticamente |
| 4 | Escribir `errorInterceptor` | Ver Tema 2 | Redirige a login ante un 401 |
| 5 | Registrar ambos interceptores | `withInterceptors([...])` | Verifica el orden de ejecución |

**Verificación:** el laboratorio se considera exitoso si toda petición saliente incluye el header de autenticación automáticamente, y si un error 401 simulado redirige correctamente a la página de login sin código adicional en el componente que originó la petición.

**Errores comunes y soluciones**

- **Mutar la petición en vez de clonarla.** Las peticiones HTTP son inmutables; usa siempre `req.clone({...})`.
- **Registrar los interceptores en el orden incorrecto.** Si un interceptor depende de otro, verifica el orden del arreglo en `withInterceptors`.
- **No relanzar el error en `errorInterceptor`.** Si no usas `throwError`, el código que originó la petición nunca se entera de que hubo un error.

---
