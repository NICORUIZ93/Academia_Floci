# Módulo 7: HttpClient e interceptores

## Sílabo

**Objetivo general**

Consumir APIs REST de forma tipada con `HttpClient`, y centralizar autenticación y manejo de errores mediante interceptores funcionales.

**Objetivos específicos**

1. Configurar `HttpClient` con `provideHttpClient(withFetch())`.
2. Realizar peticiones tipadas usando interfaces TypeScript.
3. Escribir interceptores funcionales para agregar autenticación.
4. Centralizar el manejo de errores HTTP en un interceptor.
5. Combinar `HttpClient` con signals mediante `toSignal`.

**Contenido**

- `HttpClient` con backend `fetch`.
- Peticiones GET tipadas.
- Interceptores funcionales: autenticación y errores.
- Registro de interceptores en `app.config.ts`.
- Por qué centralizar el manejo de errores.

**Evaluación**

Consumo de una API con interceptor de autenticación y manejo centralizado de errores 401, más tres ejercicios de evaluación.

---

## Comienza desde cero: prepara este capítulo

Este recorrido parte de una carpeta vacía. Al finalizar tendrás **Consumo de una API con interceptor de autenticación y manejo centralizado de errores 401, más tres ejercicios de evaluación.** No avances ejecutando comandos que no comprendes: primero identifica la entrada, la transformación y la evidencia que comprobará el resultado.

### 1. Comprueba las herramientas

Los comandos funcionan en macOS, Linux y WSL. En PowerShell usa el equivalente indicado por la herramienta.

```bash
node --version
npm --version
npx ng version
```

Si un comando no existe, detente e instala esa herramienta desde su sitio oficial. Cierra y abre la terminal después de modificar `PATH`. Las versiones deben ser compatibles entre sí antes de crear archivos.

### 2. Crea o recupera el proyecto del track

```bash
npx @angular/cli@latest new academia-labs/angular-app --standalone --routing --style=scss
cd academia-labs/angular-app
git init
```

Trabaja dentro de `academia-labs/angular-app`. Si ya existe, no lo vuelvas a generar: entra en la carpeta, confirma `git status` y continúa sobre una rama propia.

### 3. Ubica cada tema antes de escribir

```text
academia-labs/angular-app/
├─ src/app/features/
│  └─ module-7/
├─ tests/
├─ docs/decisions/
├─ evidence/module-7/
└─ README.md
```

| Tema | Archivo o decisión | Evidencia mínima |
|---|---|---|
| 1. HttpClient con backend fetch | `src/app/features/module-7/topic-1-httpclient-con-backend-fetch.ts` | prueba + salida observable |
| 2. Interceptores funcionales | `src/app/features/module-7/topic-2-interceptores-funcionales.ts` | prueba + salida observable |
| 3. Registro de interceptores y centralización del manejo de errores | `src/app/features/module-7/topic-3-registro-de-interceptores-y-centralizacion-del-manejo-.ts` | prueba + salida observable |

Un ejemplo técnico vive en el archivo indicado y debe tener una prueba. Un tema conceptual vive en `docs/decisions/`: compara opciones usando restricciones medibles; no escribas código decorativo solo para llenar espacio.

### 4. Ejecuta una línea base

Desde `academia-labs/angular-app`:

```bash
npm test -- --watch=false && npm start
```

**Resultado esperado:** el comando reconoce el proyecto y termina sin errores antes de introducir el cambio del capítulo. Después del incremento, la evidencia debe demostrar: **Consumo de una API con interceptor de autenticación y manejo centralizado de errores 401, más tres ejercicios de evaluación.**

Si falla la línea base, no continúes. Localiza el primer mensaje que indique archivo, línea o dependencia; formula una causa y compruébala con un cambio pequeño.

### 5. Provoca un fallo y recupérate

Simula un estado vacío o un error HTTP y comprueba que la interfaz muestre recuperación y no una pantalla ambigua. Guarda en `evidence/module-7/` el comando, la salida relevante, tu hipótesis y la corrección. Revierte únicamente el cambio deliberado; no borres todo el proyecto para ocultar la causa.

### 6. Conecta el capítulo con RutaFlow

Aplica el aprendizaje de **HttpClient e interceptores** a un incremento vertical de RutaFlow. Define qué componente produce el dato, qué contrato lo transporta, quién lo consume y cómo observarás un fallo. La entrega final incluye archivo o decisión, prueba, salida, error corregido y una limitación que todavía validarías en producción.

---

## Contenido teórico

### Tema 1: HttpClient con backend fetch

**Conceptos clave:** `provideHttpClient(withFetch())`, peticiones tipadas, integración con signals.

`HttpClient` es el servicio inyectable de Angular para realizar peticiones HTTP, devolviendo Observables (Módulo 6) por cada petición realizada, que se resuelven una única vez con la respuesta del servidor (o se rechazan con un error) y luego se completan automáticamente. Desde versiones recientes de Angular, `provideHttpClient(withFetch())` configura `HttpClient` para usar la API `fetch()` nativa del navegador como mecanismo de transporte subyacente en vez de `XMLHttpRequest` (el mecanismo tradicional), lo cual habilita mejor soporte de streaming de respuestas y es más compatible con entornos de ejecución modernos como Server-Side Rendering (Módulo 11), donde `fetch` está disponible de forma nativa sin polyfills adicionales.

Tipar las respuestas HTTP con interfaces TypeScript (`interface Usuario { id: number; nombre: string; }`, y luego `this.http.get<Usuario[]>('/api/usuarios')`) no valida en tiempo de ejecución que la respuesta real del servidor efectivamente tenga esa forma (TypeScript se borra completamente al compilar, Módulo 0), pero sí proporciona autocompletado y verificación de tipos en tiempo de compilación sobre cómo el código consume esa respuesta, capturando errores comunes como acceder a una propiedad mal escrita o asumir un tipo incorrecto para un campo, exactamente en el momento de escribir el código, no en producción.

Combinar `HttpClient` con `toSignal()` (Módulo 6) convierte directamente el Observable de una petición HTTP en un signal legible de forma síncrona en plantillas y `computed()`, unificando el modelo de datos de la aplicación bajo signals incluso cuando el origen de esos datos es una petición asíncrona de red, evitando la necesidad de gestionar manualmente un estado de "cargando/cargado/error" con propiedades sueltas del componente.

**Analogía:** `HttpClient` es como un mensajero especializado que sabe exactamente cómo pedir información a un servidor remoto y traer la respuesta de vuelta; tipar la respuesta es como pedirle al mensajero que traiga la información en un formato específico y conocido de antemano, para que quien la reciba sepa exactamente qué esperar sin tener que inspeccionarla manualmente.

**¿Por qué es importante?** `provideHttpClient(withFetch())` moderniza el transporte subyacente de las peticiones; tipar las respuestas atrapa errores de uso en tiempo de compilación; `toSignal` integra los datos de red en el mismo modelo reactivo que el resto de la aplicación.

**Diagrama:**

```ts
// app.config.ts
providers: [provideHttpClient(withFetch())]

interface Usuario { id: number; nombre: string; }
private http = inject(HttpClient);
usuarios = toSignal(this.http.get<Usuario[]>('/api/usuarios'), { initialValue: [] });
```

### Tema 2: Interceptores funcionales

**Conceptos clave:** `HttpInterceptorFn`, transformación de la petición, manejo del flujo de respuesta.

Un interceptor es una función que se inserta en la cadena de procesamiento de cada petición HTTP saliente (y de cada respuesta entrante), pudiendo inspeccionar y modificar la petición antes de que llegue al servidor, o inspeccionar y transformar la respuesta (o el error) antes de que llegue al código que originó la petición, similar en concepto a los guards funcionales del Módulo 4 (una función simple con acceso a `inject()` en vez de una clase con dependencias declaradas en su constructor).

`authInterceptor`, un ejemplo típico, inyecta un `AuthService` para leer el token de autenticación actual, y clona la petición saliente agregándole un header `Authorization: Bearer <token>` (las peticiones HTTP son inmutables por diseño, de ahí `req.clone(...)` en vez de mutar `req` directamente), garantizando que absolutamente ninguna petición saliente del código de la aplicación olvide incluir ese header, sin necesidad de recordar agregarlo manualmente en cada llamada individual a `HttpClient` a lo largo de toda la aplicación.

`errorInterceptor`, otro ejemplo típico, envuelve la llamada a `next(req)` con un operador `catchError` de RxJS (Módulo 6): si la respuesta de error tiene código 401 (no autorizado, típicamente porque el token expiró o es inválido), redirige automáticamente a la ruta de login usando el `Router` (Módulo 4) inyectado; para cualquier otro error, lo relanza con `throwError` para que el código que originó la petición pueda manejarlo específicamente si necesita hacerlo.

**Analogía:** un interceptor es como un control de seguridad en la entrada de un edificio que revisa (y puede modificar, agregando una credencial) cada persona que entra, y también revisa cada persona que sale (la respuesta), pudiendo redirigirla automáticamente si algo no está en orden, sin que cada visitante individual tenga que recordar mostrar su credencial por su cuenta.

**¿Por qué es importante?** Los interceptores centralizan comportamiento transversal (autenticación, manejo de errores) que de otro modo tendría que repetirse manualmente en cada llamada HTTP individual de la aplicación, un ejemplo directo del principio DRY.

**Diagrama:**

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

**Conceptos clave:** `withInterceptors`, orden de ejecución, DRY aplicado a errores HTTP.

Los interceptores se registran en `app.config.ts` mediante `provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))`, aplicándose en el orden declarado en el arreglo para las peticiones salientes, y en orden inverso para las respuestas entrantes (de forma similar a cómo se anidan los middlewares en Express, estudiado en el Módulo 3 del track de Node.js), lo cual importa cuando un interceptor depende del resultado de otro (por ejemplo, si un interceptor de logging necesita ver la petición ya con el header de autenticación agregado por `authInterceptor`, debe registrarse después de él en el arreglo).

Sin un interceptor centralizado de errores, cada componente o servicio que realiza una petición HTTP tendría que repetir su propia lógica de `catchError` para manejar un 401 (redirigir a login) o un 500 (mostrar un mensaje genérico de error), duplicando la misma lógica de manejo decenas de veces a lo largo de la aplicación, y arriesgando inconsistencias si un desarrollador olvida agregar ese manejo en una llamada nueva; centralizarlo en un único interceptor garantiza que el comportamiento sea uniforme y que agregar una nueva regla de manejo de errores (por ejemplo, reintentar automáticamente ante un error 503) solo requiera modificar un único lugar del código.

**Analogía:** registrar interceptores es como definir el orden de las estaciones de control por las que pasa cada paquete en un centro de distribución: el orden importa porque cada estación puede depender de que la anterior ya haya hecho su trabajo (por ejemplo, etiquetar el paquete antes de que la siguiente estación lo escanee).

**¿Por qué es importante?** El orden de registro de interceptores determina el orden real de ejecución; centralizar el manejo de errores en un único interceptor evita duplicar la misma lógica de manejo en cada llamada HTTP individual de la aplicación.

**Diagrama:**

```ts
// app.config.ts
provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))
// Petición saliente:  authInterceptor → errorInterceptor → servidor
// Respuesta entrante:  servidor → errorInterceptor → authInterceptor → código origen
```

---

## Criterio transversal de calidad del código

Aplica estas decisiones en todos los ejemplos y en tu entrega:

- usa nombres que expresen intención, dominio y unidades; evita `data`, `temp`, `manager` o `process` cuando exista un término preciso;
- mantén funciones, componentes, clases, consultas y módulos cohesionados alrededor de una responsabilidad comprobable;
- haz visibles las dependencias y los efectos de red, tiempo, archivos, estado y base de datos;
- valida entradas en la frontera y representa errores con contexto, sin ocultar la causa ni registrar secretos;
- elimina duplicación de reglas, no toda repetición textual; una abstracción incorrecta cuesta más que dos líneas parecidas;
- escribe primero la solución más simple que satisface el requisito y refactoriza con pruebas verdes;
- aplica SOLID únicamente cuando exista una necesidad real de cambio, extensión, sustitución o aislamiento.

**SOLID con criterio:** responsabilidad única significa una razón coherente de cambio, no una clase por función. Abierto/cerrado justifica estrategias cuando hay variantes reales. Sustitución exige respetar contratos. Segregación evita obligar a consumidores a depender de operaciones que no usan. Inversión de dependencias protege el dominio frente a detalles externos; no exige crear interfaces para cada objeto.

**Comprobación antes de continuar:** ¿otra persona puede entender los nombres y el flujo?, ¿los casos de error son observables?, ¿una prueba demuestra la regla principal?, ¿cada abstracción aporta más claridad de la que cuesta? Registra una decisión de refactorización y una decisión consciente de *no abstraer*.

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

## Ejercicios de evaluación

### Ejercicio 1: Por qué clonar la petición

**Enunciado:** explica por qué `authInterceptor` usa `req.clone({...})` en vez de modificar `req` directamente.

**Solución esperada:** las peticiones HTTP de Angular son objetos inmutables por diseño; intentar mutar `req` directamente no tendría efecto (o generaría un error), por lo que la única forma correcta de agregar un header es crear una copia modificada con `clone()`, dejando el objeto original intacto.

**Criterios de éxito:**
- Explica correctamente la inmutabilidad de las peticiones HTTP y la necesidad de `clone()`.

### Ejercicio 2: Centralizar el manejo de errores

**Enunciado:** ¿qué problema evita centralizar el manejo de errores 401 en un interceptor, en vez de manejarlo individualmente en cada componente que hace una petición HTTP?

**Solución esperada:** evita duplicar la misma lógica de `catchError` en cada llamada individual, garantiza un comportamiento uniforme en toda la aplicación, y permite modificar el manejo de errores (por ejemplo, agregar un reintento automático) en un único lugar sin tener que tocar cada componente que hace peticiones.

**Criterios de éxito:**
- Explica correctamente el problema de duplicación y el beneficio de un único punto de cambio.

### Ejercicio 3: Orden de interceptores

**Enunciado:** si `errorInterceptor` se registrara antes que `authInterceptor` en `withInterceptors([...])`, ¿en qué orden se ejecutarían para la petición saliente?

**Solución esperada:** `errorInterceptor` se ejecutaría primero, seguido de `authInterceptor`, siguiendo estrictamente el orden del arreglo para las peticiones salientes.

**Criterios de éxito:**
- Identifica correctamente que el orden de ejecución en la petición saliente sigue el orden literal del arreglo.

---

## Rúbrica del proyecto

Esta rúbrica evalúa el laboratorio y los ejercicios como evidencia de dominio, no la mera finalización de pasos.

| Criterio | Peso | Evidencia esperada |
|---|---:|---|
| Comprensión conceptual | 20% | Explica el mecanismo, sus límites y por qué la solución funciona. |
| Implementación funcional | 30% | El artefacto satisface requisitos normales, límite y de error. |
| Verificación | 20% | Incluye pruebas, mediciones o inspecciones reproducibles. |
| Diseño y calidad | 15% | Nombres, estructura, seguridad y mantenibilidad son deliberados. |
| Comunicación profesional | 15% | README, decisiones, comandos y resultados permiten repetir el trabajo. |

Se alcanza competencia con 70/100 y sin cero en implementación o verificación. El nivel experto exige comparar alternativas, justificar trade-offs y reconocer condiciones donde la solución dejaría de ser válida.

## Bibliografía y fundamento académico

Estas fuentes sustentan los conceptos y deben consultarse para verificar detalles que cambian entre versiones:

- Google, *Angular Documentation* y guías oficiales de accesibilidad, seguridad y rendimiento.
- ReactiveX, *RxJS Documentation*.
- W3C, *Web Content Accessibility Guidelines (WCAG)*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- `HttpClient` con `withFetch()` moderniza el transporte subyacente de las peticiones.
- Tipar las respuestas HTTP atrapa errores de uso en tiempo de compilación.
- Los interceptores funcionales centralizan autenticación y manejo de errores transversal.
- El orden de registro de interceptores determina su orden real de ejecución.

**Conceptos aprendidos**

- `HttpClient` y peticiones tipadas.
- Interceptores funcionales de autenticación y errores.
- Registro y orden de ejecución de interceptores.
- Centralización del manejo de errores HTTP.

**Próximos pasos**

En el Módulo 8 aprenderás standalone components y arquitectura sin NgModules: bootstrap de la aplicación, organización por feature, y migración de un proyecto existente.

**Recursos adicionales**

- Documentación oficial de Angular: "HttpClient" e "Interceptors".
