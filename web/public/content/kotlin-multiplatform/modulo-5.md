# Módulo 5: Networking compartido con Ktor Client

## Sílabo

**Objetivo general**

Consumir APIs HTTP desde código común con Ktor Client, sin duplicar clientes HTTP por plataforma, incluyendo serialización con kotlinx.serialization y manejo explícito de errores de red.

**Objetivos específicos**

1. Configurar un `HttpClient` de Ktor en `commonMain` con serialización JSON.
2. Consumir un endpoint real deserializando la respuesta automáticamente.
3. Modelar errores de red con un resultado tipado explícito.
4. Agregar un interceptor de autenticación.

**Contenido**

- Ktor Client multiplataforma.
- Serialización con kotlinx.serialization.
- Manejo de errores de red.
- Interceptores y autenticación.

**Evaluación**

Cliente HTTP compartido que consume una API real desde Android e iOS, más tres ejercicios de evaluación.

---

## Comienza desde cero: prepara este capítulo

Este recorrido parte de una carpeta vacía. Al finalizar tendrás **Cliente HTTP compartido que consume una API real desde Android e iOS, más tres ejercicios de evaluación.** No avances ejecutando comandos que no comprendes: primero identifica la entrada, la transformación y la evidencia que comprobará el resultado.

### 1. Comprueba las herramientas

Los comandos funcionan en macOS, Linux y WSL. En PowerShell usa el equivalente indicado por la herramienta.

```bash
java --version
./gradlew --version
```

Si un comando no existe, detente e instala esa herramienta desde su sitio oficial. Cierra y abre la terminal después de modificar `PATH`. Las versiones deben ser compatibles entre sí antes de crear archivos.

### 2. Crea o recupera el proyecto del track

```bash
# Crea el proyecto con el asistente oficial de Kotlin Multiplatform
cd academia-labs/kmp-app
git init
./gradlew tasks
```

Trabaja dentro de `academia-labs/kmp-app`. Si ya existe, no lo vuelvas a generar: entra en la carpeta, confirma `git status` y continúa sobre una rama propia.

### 3. Ubica cada tema antes de escribir

```text
academia-labs/kmp-app/
├─ shared/src/commonMain/kotlin/
│  └─ module-5/
├─ tests/
├─ docs/decisions/
├─ evidence/module-5/
└─ README.md
```

| Tema | Archivo o decisión | Evidencia mínima |
|---|---|---|
| 1. Ktor Client multiplataforma | `shared/src/commonMain/kotlin/module-5/topic-1-ktor-client-multiplataforma.kt` | prueba + salida observable |
| 2. Manejo de errores de red con un tipo explícito | `shared/src/commonMain/kotlin/module-5/topic-2-manejo-de-errores-de-red-con-un-tipo-explicito.kt` | prueba + salida observable |
| 3. Interceptores y autenticación | `shared/src/commonMain/kotlin/module-5/topic-3-interceptores-y-autenticacion.kt` | prueba + salida observable |

Un ejemplo técnico vive en el archivo indicado y debe tener una prueba. Un tema conceptual vive en `docs/decisions/`: compara opciones usando restricciones medibles; no escribas código decorativo solo para llenar espacio.

### 4. Ejecuta una línea base

Desde `academia-labs/kmp-app`:

```bash
./gradlew :shared:allTests
```

**Resultado esperado:** el comando reconoce el proyecto y termina sin errores antes de introducir el cambio del capítulo. Después del incremento, la evidencia debe demostrar: **Cliente HTTP compartido que consume una API real desde Android e iOS, más tres ejercicios de evaluación.**

Si falla la línea base, no continúes. Localiza el primer mensaje que indique archivo, línea o dependencia; formula una causa y compruébala con un cambio pequeño.

### 5. Provoca un fallo y recupérate

Introduce un dato nulo o caso específico de plataforma; commonTest debe hacerlo visible. Guarda en `evidence/module-5/` el comando, la salida relevante, tu hipótesis y la corrección. Revierte únicamente el cambio deliberado; no borres todo el proyecto para ocultar la causa.

### 6. Conecta el capítulo con RutaFlow

Aplica el aprendizaje de **Networking compartido con Ktor Client** a un incremento vertical de RutaFlow. Define qué componente produce el dato, qué contrato lo transporta, quién lo consume y cómo observarás un fallo. La entrega final incluye archivo o decisión, prueba, salida, error corregido y una limitación que todavía validarías en producción.

---

## Contenido teórico

### Tema 1: Ktor Client multiplataforma

**Conceptos clave:** un único cliente HTTP, motor nativo abstraído por plataforma.

`val client = HttpClient { install(ContentNegotiation) { json() } }` configura un cliente HTTP declarado una única vez en `commonMain`, funcionando de forma idéntica en Android (donde Ktor usa internamente OkHttp como motor de transporte subyacente) y en iOS (donde usa Darwin/NSURLSession, el motor de red nativo de Apple), sin que el código que usa este cliente necesite conocer ni preocuparse por cuál motor específico está operando por debajo en cada plataforma: Ktor abstrae completamente esa diferencia de implementación nativa detrás de una única API común consistente.

`@Serializable data class TareaDTO(val id: String, val titulo: String); suspend fun obtenerTareas(): List<TareaDTO> = client.get("https://api.miapp.com/tareas").body()` demuestra el consumo de un endpoint real con deserialización automática: el plugin de `ContentNegotiation` con `json()` instalado detecta el tipo de contenido de la respuesta y deserializa automáticamente el JSON hacia el tipo Kotlin especificado (`List<TareaDTO>`), sin necesidad de parsear manualmente la respuesta cruda. Sin Ktor Client compartido, el proyecto necesitaría mantener y sincronizar dos implementaciones de cliente HTTP completamente separadas y potencialmente divergentes: `URLSession` nativo en el lado de iOS, y `OkHttp` (o `Retrofit` sobre él) en el lado de Android, cada una con su propia lógica de manejo de errores, reintentos, y configuración, duplicando trabajo que la capa compartida de Ktor evita completamente.

**Analogía:** Ktor Client es como un mensajero universal que sabe operar con los sistemas de transporte específicos de cada ciudad (el motor nativo de cada plataforma) sin que quien le da instrucciones necesite conocer esos detalles de transporte local, simplemente confiando en que el mensaje llegará a destino de la misma forma consistente sin importar la ciudad específica donde opere.

**¿Por qué es importante?** Ktor Client evita duplicar dos implementaciones de cliente HTTP completamente separadas (URLSession en iOS, OkHttp en Android), abstrayendo el motor de transporte nativo detrás de una única API común compartida.

**Casos de uso reales:**
- Consumir la misma API REST de tareas desde `TareasRepositoryImpl` (Módulo 4) en Android e iOS con un único cliente.
- Sincronizar el catálogo de productos de una app de e-commerce compartida entre ambas plataformas.
- Subir archivos adjuntos (fotos, documentos) reutilizando la misma configuración de multipart en ambas plataformas.

**Diagrama:**

```kotlin
val client = HttpClient {
    install(ContentNegotiation) { json() }
}
@Serializable
data class TareaDTO(val id: String, val titulo: String)
suspend fun obtenerTareas(): List<TareaDTO> =
    client.get("https://api.miapp.com/tareas").body()
```

### Tema 2: Manejo de errores de red con un tipo explícito

**Conceptos clave:** sealed class para resultado, evitar excepciones sin control.

`sealed class Resultado<out T> { data class Exito<T>(val datos: T) : Resultado<T>(); data class Error(val mensaje: String) : Resultado<Nothing>() }` modela explícitamente ambos resultados posibles de una operación de red (éxito con datos, o error con un mensaje descriptivo) como un tipo de retorno concreto y manejable, en vez de dejar que las excepciones de red (timeout, sin conexión, respuesta de error del servidor) se propaguen sin control hacia el código que invoca la función, obligando a quien maneja el resultado a considerar explícitamente ambos casos posibles mediante `when` exhaustivo (Módulo 1), de forma análoga al patrón `Result`/`Either` estudiado de forma más general en otros contextos funcionales.

`suspend fun obtenerTareasSeguro(): Resultado<List<TareaDTO>> = try { Resultado.Exito(obtenerTareas()) } catch (e: Exception) { Resultado.Error(e.message ?: "Error de red") }` envuelve la llamada real de red, capturando cualquier excepción y transformándola en el resultado tipado correspondiente. Modelar errores como un tipo de retorno explícito es preferible a dejar que las excepciones se propaguen sin control porque hace visible en la propia firma de la función (`Resultado<List<TareaDTO>>`, no simplemente `List<TareaDTO>`) que la operación puede fallar, forzando a cada punto de la aplicación que consume ese resultado a manejar explícitamente ambos casos, en vez de que un error de red no manejado se propague silenciosamente hasta terminar en un crash inesperado en un punto completamente distinto y no relacionado del código.

**Analogía:** modelar el resultado como un tipo explícito es como recibir siempre un recibo formal que indica claramente si el pedido se completó con éxito o si hubo un problema específico, en vez de simplemente no recibir nada en absoluto si algo salió mal, dejando a quien esperaba el pedido sin ninguna indicación clara de qué ocurrió realmente.

**¿Por qué es importante?** Modelar errores de red como un tipo de retorno explícito hace visible en la propia firma de la función que la operación puede fallar, forzando un manejo explícito de ambos casos posibles, en vez de dejar que las excepciones se propaguen sin control.

**Casos de uso reales:**
- Mostrar un mensaje de "sin conexión" específico frente a un mensaje de "credenciales inválidas" según el tipo de `Resultado.Error`.
- Reintentar automáticamente solo los errores de timeout, no los errores de validación del servidor (400 Bad Request).
- Propagar el `Resultado` tal cual desde el repositorio hasta el `StateFlow` de UI (Módulo 2), sin excepciones no manejadas en ningún punto intermedio.

**Diagrama:**

```kotlin
sealed class Resultado<out T> {
    data class Exito<T>(val datos: T) : Resultado<T>()
    data class Error(val mensaje: String) : Resultado<Nothing>()
}
suspend fun obtenerTareasSeguro(): Resultado<List<TareaDTO>> = try {
    Resultado.Exito(obtenerTareas())
} catch (e: Exception) {
    Resultado.Error(e.message ?: "Error de red")
}
```

### Tema 3: Interceptores y autenticación

**Conceptos clave:** header agregado automáticamente en cada request.

`val client = HttpClient { install(Auth) { bearer { loadTokens { BearerTokens(tokenActual, refreshToken) } } } }` configura el plugin de autenticación de Ktor para incluir automáticamente el header de autenticación correspondiente (`Authorization: Bearer <token>`) en cada petición saliente que lo requiera, garantizando que ninguna llamada individual del código de la aplicación necesite recordar manualmente agregar ese header, un patrón análogo en propósito a los interceptores de Angular (Módulo 7 del track de Angular) o de Spring Security (Módulo 4 del track de Spring Boot), centralizando esta responsabilidad transversal en un único lugar de configuración compartido entre ambas plataformas.

**Analogía:** un interceptor de autenticación configurado en el cliente compartido es como un sello de aprobación aplicado automáticamente a cada correspondencia saliente de una oficina, garantizando que ningún empleado individual tenga que recordar aplicar ese sello manualmente en cada envío particular.

**¿Por qué es importante?** Configurar la autenticación como un interceptor centralizado en el cliente HTTP compartido garantiza que ninguna llamada de red individual del código de la aplicación olvide incluir las credenciales necesarias, sin duplicar esa lógica en cada llamada.

**Casos de uso reales:**
- Renovar automáticamente un access token expirado (`refreshTokens`) sin que cada pantalla implemente su propia lógica de reintento.
- Agregar un header `X-App-Version` a todas las peticiones para depuración en producción, sin tocar cada llamada individual.
- Cerrar sesión automáticamente en ambas plataformas cuando el interceptor detecta una respuesta 401 repetida.

**Diagrama:**

```kotlin
val client = HttpClient {
    install(Auth) {
        bearer { loadTokens { BearerTokens(tokenActual, refreshToken) } }
    }
}
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

**Objetivo del laboratorio:** construir un cliente HTTP compartido que consume una API real desde Android e iOS.

**Requisitos previos:** Módulos 0-4 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Configurar `HttpClient` con serialización JSON | Ver Tema 1 | En `commonMain` |
| 2 | Definir un modelo `@Serializable` y consumir un endpoint real | Ver Tema 1 | Deserialización automática |
| 3 | Modelar errores de red con `Resultado` | Ver Tema 2 | Sealed class con éxito/error |
| 4 | Agregar un interceptor de autenticación | Ver Tema 3 | Header en cada request |

**Verificación:** el laboratorio se considera exitoso si el mismo cliente compartido consume correctamente la API real desde ambas plataformas, y si un error de red simulado (por ejemplo, desconectando la red) produce un `Resultado.Error` manejado correctamente, no un crash sin control.

**Errores comunes y soluciones**

- **Mantener implementaciones de cliente HTTP separadas por plataforma.** Usa Ktor Client compartido en `commonMain`.
- **Dejar que las excepciones de red se propaguen sin control.** Modela el resultado con un tipo explícito como `Resultado`.
- **Repetir manualmente el header de autenticación en cada llamada.** Configura un interceptor centralizado en el cliente compartido.

---

## Ejercicios de evaluación

### Ejercicio 1: Qué evita Ktor Client compartido

**Enunciado:** ¿qué evita tener que duplicar (URLSession en iOS, OkHttp en Android) al usar Ktor Client desde `commonMain`?

**Solución esperada:** evita mantener y sincronizar dos implementaciones completamente separadas de cliente HTTP, cada una con su propia lógica de manejo de errores, reintentos y configuración, dado que Ktor Client abstrae el motor de transporte nativo de cada plataforma detrás de una única API común compartida.

**Criterios de éxito:**
- Explica correctamente la evitación de duplicación de implementaciones separadas como el beneficio de Ktor Client compartido.

### Ejercicio 2: Por qué modelar errores como un tipo explícito

**Enunciado:** ¿por qué modelar errores de red como un tipo de retorno explícito es mejor que dejar que las excepciones se propaguen sin control?

**Solución esperada:** hace visible en la propia firma de la función que la operación puede fallar, forzando a cada punto de la aplicación que consume ese resultado a manejar explícitamente ambos casos posibles (éxito o error), en vez de que un error no manejado se propague silenciosamente hasta terminar en un crash inesperado en un punto no relacionado del código.

**Criterios de éxito:**
- Explica correctamente la visibilidad forzada en la firma de tipo y el manejo explícito obligatorio como beneficios.

### Ejercicio 3: Configuración centralizada de autenticación

**Enunciado:** ¿qué ventaja da configurar la autenticación como un interceptor centralizado en el cliente HTTP compartido?

**Solución esperada:** garantiza que ninguna llamada de red individual del código de la aplicación olvide incluir las credenciales necesarias, centralizando esa responsabilidad transversal en un único lugar de configuración, en vez de repetir manualmente esa lógica en cada llamada individual a lo largo del código.

**Criterios de éxito:**
- Explica correctamente la centralización evitando olvidos y duplicación como el beneficio del interceptor.

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

- JetBrains, documentación oficial de *Kotlin Multiplatform* y Kotlin Coroutines.
- Google, *Android Developers Documentation*; Apple, *Developer Documentation*.
- Kotlin Foundation, especificación y pautas de compatibilidad de Kotlin.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- Ktor Client abstrae el motor de transporte nativo de cada plataforma, evitando mantener clientes HTTP separados.
- Modelar errores de red como un tipo explícito (sealed class) fuerza un manejo explícito en vez de excepciones sin control.
- Un interceptor centralizado de autenticación garantiza que ninguna llamada olvide incluir las credenciales necesarias.

**Conceptos aprendidos**

- Ktor Client multiplataforma.
- Serialización con kotlinx.serialization.
- Manejo de errores de red con tipos explícitos.
- Interceptores y autenticación.

**Próximos pasos**

En el Módulo 6 aprenderás persistencia compartida con SQLDelight: esquemas SQL tipados, queries verificadas en compilación, y migraciones.

**Recursos adicionales**

- Documentación oficial de Ktor Client (ktor.io/docs/client.html) y kotlinx.serialization (kotlinlang.org/docs/serialization.html).
