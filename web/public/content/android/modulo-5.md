# Módulo 5: Networking con Retrofit/Ktor

## Sílabo

**Objetivo general**

Consumir APIs REST reales desde Android con manejo de errores y estados de carga explícitos, usando Retrofit sobre coroutines y OkHttp como capa de transporte configurable.

**Objetivos específicos**

1. Definir una interfaz Retrofit con un método `suspend` que consuma un endpoint GET real.
2. Actualizar el `StateFlow` de un `ViewModel` a partir del resultado de esa llamada.
3. Modelar explícitamente los estados de carga, éxito y error.
4. Agregar interceptores de OkHttp para logging y autenticación.

**Contenido**

- Retrofit + OkHttp.
- Coroutines para llamadas suspendidas.
- Manejo de errores HTTP.
- Interceptores (logging, auth).

**Evaluación**

App que consume una API real con estados loading/error/success explícitos, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Retrofit con coroutines

**Conceptos clave:** interfaz declarativa, funciones suspend en vez de callbacks.

```kotlin
interface ApiService {
    @GET("tareas")
    suspend fun obtenerTareas(): List<TareaDTO>
}

val retrofit = Retrofit.Builder()
    .baseUrl("https://api.miapp.com/")
    .addConverterFactory(MoshiConverterFactory.create())
    .build()
```

Retrofit permite declarar un endpoint HTTP como una simple función de interfaz anotada (`@GET("tareas")`), generando en tiempo de compilación la implementación real que realiza la petición HTTP subyacente; al marcar esa función como `suspend` (el modificador de funciones suspendibles estudiado en el Módulo 2 de Kotlin Multiplatform), Retrofit ejecuta la llamada de red de forma asíncrona sin bloquear el hilo que la invoca, y el código que la llama puede leerse de forma lineal y secuencial (`val tareas = apiService.obtenerTareas()`) exactamente como si fuera una llamada síncrona normal, evitando por completo el anidamiento de callbacks del Retrofit clásico pre-coroutines (`enqueue(object : Callback<...> { onResponse... onFailure... })`).

Este mismo patrón de "función suspend que envuelve una operación de red asíncrona" es el mismo principio que sustenta Ktor Client en Kotlin Multiplatform (Módulo 6 de ese track): ambos exponen operaciones de red como funciones suspend consumibles de forma lineal, la diferencia siendo que Retrofit está diseñado específicamente para la JVM/Android mientras que Ktor Client funciona de forma multiplataforma (incluyendo iOS mediante Kotlin/Native).

**Analogía:** una función Retrofit anotada es como llenar un formulario de pedido estandarizado (la anotación `@GET`) y entregárselo a un servicio de mensajería (Retrofit) que se encarga de todo el trámite de entrega y recepción por su cuenta; el uso de `suspend` es como poder continuar con otras tareas mientras se espera la respuesta del pedido, sin quedar bloqueado esperando en la ventanilla.

**¿Por qué es importante?** Retrofit + coroutines permite leer código de red de forma lineal y secuencial, sin el anidamiento de callbacks del Retrofit clásico, y comparte el mismo principio de "función suspend para operaciones asíncronas" que Ktor Client en KMP.

**Casos de uso reales:**
- Definir toda la API de un backend (login, tareas, perfil) como una única interfaz `ApiService` clara y testeable.
- Llamar varios endpoints en paralelo desde un ViewModel usando `async`/`await` sobre funciones suspend de Retrofit.
- Migrar código antiguo con callbacks anidados de Retrofit clásico a coroutines para simplificar el manejo de errores.

**Código del ejemplo:**

```kotlin
interface ApiService {
    @GET("tareas")
    suspend fun obtenerTareas(): List<TareaDTO>
}
```

### Tema 2: Manejo de errores HTTP

**Conceptos clave:** distinguir errores de red de errores de servidor, mensajes específicos para cada caso.

```kotlin
viewModelScope.launch {
    try {
        val tareas = apiService.obtenerTareas()
        _estado.value = EstadoUI.Exito(tareas)
    } catch (e: HttpException) {
        _estado.value = EstadoUI.Error("Error ${e.code()}")
    } catch (e: IOException) {
        _estado.value = EstadoUI.Error("Sin conexión")
    }
}
```

Separar explícitamente `HttpException` (el servidor respondió, pero con un código de error como 404 o 500) de `IOException` (la petición nunca llegó a completarse, típicamente por falta de conexión a internet) permite mostrar al usuario un mensaje específico y accionable para cada caso, en vez de un genérico "algo salió mal" que no le indica si el problema es transitorio (revisar su conexión) o si corresponde a un recurso inexistente o un error del servidor fuera de su control; esta distinción refleja el mismo principio de manejo de excepciones tipado por categoría estudiado en el Módulo 3 del track de Java (excepciones checked vs unchecked), aplicado aquí específicamente al dominio de networking.

Un `ViewModel` que capture indiscriminadamente `Exception` genérica sin distinguir estas categorías pierde información valiosa que podría usarse para decidir automáticamente si reintentar la operación (apropiado ante `IOException`, un problema típicamente transitorio) o no (poco útil ante un `HttpException` 404, donde reintentar el mismo request simplemente repetiría el mismo error).

**Analogía:** distinguir `HttpException` de `IOException` es como diferenciar entre una carta devuelta porque el destinatario se mudó (el servidor respondió con un error específico) frente a una carta que nunca llegó porque el servicio postal está fuera de servicio (la conexión falló por completo) — ambas son "la carta no llegó a su destino", pero requieren acciones de seguimiento completamente distintas.

**¿Por qué es importante?** Sin modelar explícitamente el estado de error (y sus categorías), la app no puede comunicar al usuario si el problema es su conexión o un error del servidor, ni decidir automáticamente si vale la pena reintentar la operación.

**Casos de uso reales:**
- Mostrar "Revisa tu conexión a internet" específicamente ante un `IOException`, con un botón de reintentar.
- Mostrar "Sesión expirada, inicia sesión de nuevo" específicamente ante un `HttpException` con código 401.
- Reintentar automáticamente hasta 3 veces ante errores de red transitorios, sin reintentar ante un 404 definitivo.

**Diagrama:**

```
Petición HTTP
   ├─ éxito → EstadoUI.Exito(datos)
   ├─ HttpException (servidor respondió con error) → EstadoUI.Error("Error ${code}")
   └─ IOException (sin conexión) → EstadoUI.Error("Sin conexión")
```

### Tema 3: Interceptores de OkHttp

**Conceptos clave:** transformación transversal de cada request/response, sin modificar el código de cada llamada individual.

```kotlin
val client = OkHttpClient.Builder()
    .addInterceptor(HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BODY })
    .addInterceptor { chain ->
        chain.proceed(chain.request().newBuilder().addHeader("Authorization", "Bearer $token").build())
    }
    .build()
```

Un interceptor de OkHttp se ejecuta de forma transversal en cada petición y respuesta que pasa por el cliente HTTP, permitiendo aplicar una transformación común (loguear el cuerpo completo de la petición y respuesta, o agregar un header de autenticación) sin necesidad de repetir esa lógica manualmente en cada llamada individual de la API; esto es exactamente el mismo principio que los interceptores funcionales de `HttpClient` en Angular (Módulo 7 del track de Angular), donde también se centraliza una transformación transversal (agregar un token, loguear, manejar errores globalmente) en un único punto en vez de duplicar esa lógica en cada llamada HTTP dispersa por el código.

El orden en que se registran los interceptores importa: un interceptor de autenticación registrado antes que uno de logging aseguraría que el log capture la petición ya con el header de autenticación agregado, mientras que el orden inverso mostraría el log sin ese header, una distinción relevante al depurar problemas de autenticación mediante los logs de red.

**Analogía:** un interceptor de OkHttp es como una estación de control aduanero por la que pasa obligatoriamente cada paquete que entra o sale de un país, aplicando el mismo sello o etiqueta a todos los paquetes sin que el remitente individual tenga que solicitarlo explícitamente en cada envío.

**¿Por qué es importante?** Los interceptores centralizan transformaciones transversales (logging, autenticación) en un único punto, evitando duplicar esa lógica en cada llamada individual de la API, el mismo principio que los interceptores de HttpClient en Angular.

**Casos de uso reales:**
- Agregar el header `Authorization: Bearer <token>` a todas las llamadas de la API sin tocar cada endpoint individual.
- Loguear cuerpo completo de request/response solo en builds de debug, desactivado automáticamente en producción.
- Renovar un token expirado interceptando una respuesta 401 y reintentando la petición original una vez renovado.

**Código del ejemplo:**

```kotlin
OkHttpClient.Builder()
    .addInterceptor(loggingInterceptor)   // orden importa: se ejecutan en secuencia
    .addInterceptor(authInterceptor)
    .build()
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

**Objetivo del laboratorio:** construir una app que consume una API real con estados loading/error/success explícitos.

**Requisitos previos:** Módulo 4 completado.

| Paso | Acción | Código/Comando | Explicación |
|---|---|---|---|
| 1 | Definir una interfaz Retrofit con un método `suspend` GET | Ver Tema 1 | Consume un endpoint real |
| 2 | Llamarla desde un `ViewModel` en `viewModelScope.launch` | Ver Tema 1 | Actualiza el `StateFlow` con el resultado |
| 3 | Modelar explícitamente Cargando/Éxito/Error | Ver Tema 2 | Muestra cada estado en la UI |
| 4 | Agregar un interceptor de logging | Ver Tema 3 | Loguea cada request/response |
| 5 | Agregar un interceptor de autenticación | Ver Tema 3 | Header en cada llamada |

**Verificación:** el laboratorio se considera exitoso si la UI muestra correctamente cada uno de los tres estados (cargando, éxito, error) según corresponda, y si los logs de OkHttp muestran el header de autenticación aplicado a cada petición.

**Errores comunes y soluciones**

- **Capturar `Exception` genérica sin distinguir `HttpException` de `IOException`.** Distínguelas para dar mensajes específicos y decidir si reintentar.
- **Registrar el interceptor de logging antes que el de autenticación cuando se necesita ver el header en el log.** Ajusta el orden de registro según qué necesites observar.
- **No modelar el estado de error explícitamente.** Sin él, la app no puede comunicar al usuario qué salió mal.

---

## Ejercicios de evaluación

### Ejercicio 1: Retrofit + coroutines vs Callback

**Enunciado:** ¿por qué Retrofit + coroutines es más simple de leer que el Retrofit clásico con `Callback`?

**Solución esperada:** con `suspend`, el código de red se lee de forma lineal y secuencial como si fuera síncrono, sin bloquear el hilo; el Retrofit clásico con `Callback` requiere anidar `onResponse`/`onFailure` en callbacks, dificultando seguir el flujo del código especialmente al encadenar múltiples llamadas.

**Criterios de éxito:**
- Explica correctamente la lectura lineal/secuencial de coroutines frente al anidamiento de callbacks.

### Ejercicio 2: Consecuencia de no modelar el error

**Enunciado:** ¿qué pasa con tu pantalla si nunca modelas explícitamente el estado de error?

**Solución esperada:** la app no puede comunicar al usuario qué salió mal (si es un problema de conexión o un error del servidor), ni decidir automáticamente si vale la pena reintentar la operación, dejando a la UI en un estado indefinido o mostrando un mensaje genérico poco útil.

**Criterios de éxito:**
- Explica correctamente la falta de comunicación específica al usuario como consecuencia.

### Ejercicio 3: Propósito de un interceptor

**Enunciado:** ¿qué problema resuelve un interceptor de OkHttp frente a repetir la misma lógica en cada llamada?

**Solución esperada:** centraliza una transformación transversal (logging, autenticación) en un único punto que se aplica automáticamente a cada request/response, evitando duplicar esa lógica manualmente en cada llamada individual de la API.

**Criterios de éxito:**
- Menciona correctamente la centralización de lógica transversal como el problema que resuelve.

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

- Google, *Android Developers Documentation* y guías de arquitectura de aplicaciones.
- JetBrains, *Kotlin Language Documentation*.
- OWASP Foundation, *Mobile Application Security Verification Standard*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- Retrofit con funciones `suspend` permite leer código de red de forma lineal, sin el anidamiento de callbacks del Retrofit clásico.
- Distinguir `HttpException` de `IOException` permite mensajes de error específicos y decisiones informadas sobre reintentar.
- Los interceptores de OkHttp centralizan transformaciones transversales (logging, autenticación) sin duplicar lógica por llamada.
- El orden de registro de interceptores afecta qué ve cada uno de la petición/respuesta.

**Conceptos aprendidos**

- Retrofit + OkHttp.
- Coroutines para llamadas suspendidas.
- Manejo de errores HTTP.
- Interceptores (logging, auth).

**Próximos pasos**

En el Módulo 6 aprenderás a persistir datos localmente con Room, implementando una estrategia offline-first sobre la capa de red ya construida aquí.

**Recursos adicionales**

- Documentación oficial de Retrofit (square.github.io/retrofit).
