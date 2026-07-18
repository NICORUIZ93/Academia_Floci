# Módulo 8: Trabajo en segundo plano

## Sílabo

**Objetivo general**

Ejecutar tareas diferidas o periódicas que sobreviven incluso si la app se cierra, usando WorkManager con constraints de red y batería, entendiendo por qué este mecanismo garantiza ejecución donde un coroutine lanzado desde la UI no lo hace.

**Objetivos específicos**

1. Crear un `CoroutineWorker` que sincronice datos con un servidor remoto.
2. Encolarlo como trabajo periódico con WorkManager.
3. Agregar constraints de red y batería.
4. Disparar una notificación local al completar la sincronización.
5. Verificar que el trabajo persiste incluso tras cerrar la app.

**Contenido**

- WorkManager: tareas únicas y periódicas.
- Constraints (red, batería).
- Coroutines en background con scopes correctos.
- Notificaciones desde background work.

**Evaluación**

Tarea periódica con WorkManager que sincroniza datos con constraints de red, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: CoroutineWorker y garantía de ejecución

**Conceptos clave:** persistencia de la solicitud de trabajo, independiente del proceso de la app.

```kotlin
class SincronizarWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        return try {
            repositorio.sincronizar()
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }
}
```

`CoroutineWorker` es la clase base de WorkManager para definir una unidad de trabajo diferido escrita con coroutines: su método `doWork()`, marcado `suspend`, puede llamar directamente a operaciones suspendidas como la sincronización con una API remota (Módulo 5), devolviendo `Result.success()`, `Result.failure()`, o `Result.retry()` según el resultado, con WorkManager encargándose de reintentar automáticamente el trabajo (con backoff exponencial por defecto) si se devuelve `Result.retry()`.

La garantía fundamental de WorkManager, que un simple `coroutineScope.launch { }` lanzado desde una Activity o `ViewModel` no ofrece, es que la solicitud de trabajo persiste independientemente del ciclo de vida del proceso de la app: si el usuario cierra la app (o el sistema operativo mata el proceso por falta de memoria) mientras un `CoroutineWorker` está pendiente o en progreso, WorkManager garantiza que ese trabajo eventualmente se ejecute (o se reintente) cuando las condiciones lo permitan, incluso reiniciando el proceso de la app específicamente para ese propósito si es necesario; un coroutine lanzado directamente desde `viewModelScope`, en cambio, se cancela automáticamente cuando el `ViewModel` correspondiente se destruye, sin ninguna garantía de completarse si el usuario abandona la pantalla o cierra la app antes de que termine.

**Analogía:** un `CoroutineWorker` encolado en WorkManager es como una encomienda registrada en un sistema postal formal, que garantiza su entrega eventual independientemente de si el remitente original sigue en su domicilio o no; un coroutine lanzado desde la UI es como pedirle a un mensajero informal que entregue algo mientras uno espera en la puerta — si uno cierra la puerta y se va antes de que el mensajero regrese, no hay ninguna garantía de que la entrega se complete.

**¿Por qué es importante?** WorkManager garantiza que un trabajo eventualmente se ejecute incluso si el proceso de la app termina, una garantía que un coroutine lanzado directamente desde la UI no ofrece, dado que se cancela junto con el ciclo de vida del componente que lo lanzó.

**Casos de uso reales:**
- Subir fotos o archivos adjuntos pendientes aunque el usuario cierre la app antes de que termine la subida.
- Sincronizar cambios locales offline-first (Módulo 6) con el servidor en cuanto haya conexión disponible.
- Procesar y comprimir un video grande en background sin bloquear la UI ni depender de que la app siga abierta.

**Código del ejemplo:**

```kotlin
class SincronizarWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result =
        try { repositorio.sincronizar(); Result.success() } catch (e: Exception) { Result.retry() }
}
```

### Tema 2: Constraints y trabajo periódico

**Conceptos clave:** ejecución condicionada al cumplimiento de requisitos del sistema, no inmediata.

```kotlin
val constraints = Constraints.Builder()
    .setRequiredNetworkType(NetworkType.CONNECTED)
    .setRequiresBatteryNotLow(true)
    .build()

val solicitud = PeriodicWorkRequestBuilder<SincronizarWorker>(15, TimeUnit.MINUTES)
    .setConstraints(constraints)
    .build()

WorkManager.getInstance(context).enqueue(solicitud)
```

Las constraints declaran condiciones del sistema que deben cumplirse antes de que WorkManager ejecute el trabajo encolado: `setRequiredNetworkType(NetworkType.CONNECTED)` retrasa la ejecución hasta que haya conexión a internet disponible, y `setRequiresBatteryNotLow(true)` la retrasa mientras la batería del dispositivo esté en un nivel crítico bajo; WorkManager respeta estas constraints en vez de ejecutar el trabajo inmediatamente siempre, porque el sistema operativo (y por extensión, WorkManager como parte del ecosistema Jetpack) prioriza la salud general de la batería y los recursos del dispositivo sobre la puntualidad exacta de un trabajo en segundo plano no crítico para el usuario en ese instante.

Quince minutos es el intervalo **mínimo** que Android permite configurar para trabajo periódico (`PeriodicWorkRequestBuilder`); el sistema no garantiza una ejecución exacta cada quince minutos, solo que el trabajo correrá "aproximadamente" con esa periodicidad, ajustando el momento exacto según la actividad general del dispositivo (agrupando trabajos en segundo plano de distintas apps para minimizar el número de veces que el dispositivo debe "despertar" completamente), priorizando batería sobre puntualidad exacta.

**Analogía:** las constraints son como las condiciones que un servicio de entrega a domicilio impone antes de salir a repartir (solo si hay suficiente combustible, solo en horario diurno), retrasando la entrega hasta que esas condiciones se cumplan, en vez de salir a repartir sin importar las circunstancias y arriesgarse a quedar varado a mitad de camino.

**¿Por qué es importante?** Las constraints evitan que WorkManager ejecute trabajo en momentos inoportunos para el dispositivo (sin red, con batería crítica), priorizando la salud general del dispositivo sobre la puntualidad exacta del trabajo en segundo plano.

**Casos de uso reales:**
- Sincronizar solo por wifi (`NetworkType.UNMETERED`) para no consumir datos móviles del usuario sin avisar.
- Postergar backups automáticos de fotos hasta que el dispositivo esté cargando y con batería suficiente.
- Ejecutar limpieza de caché periódica cada 15-30 minutos sin afectar la duración de la batería del usuario.

**Código del ejemplo:**

```kotlin
Constraints.Builder()
    .setRequiredNetworkType(NetworkType.CONNECTED)
    .setRequiresBatteryNotLow(true)
    .build()
// El trabajo espera hasta que AMBAS condiciones se cumplan
```

### Tema 3: Notificaciones desde background work

**Conceptos clave:** comunicar al usuario un resultado ocurrido fuera de su interacción directa.

```kotlin
NotificationManagerCompat.from(context).notify(ID, notificacion)
```

Disparar una notificación local desde dentro de `doWork()` al completar exitosamente la sincronización comunica al usuario que ocurrió algo relevante mientras la app no estaba necesariamente en primer plano (o incluso mientras estaba completamente cerrada), sin requerir que el usuario abra activamente la app para descubrir ese resultado; esto es particularmente valioso para trabajo periódico de larga duración (sincronización de datos, descargas programadas), donde el usuario se beneficia de saber que la operación se completó (o falló) sin tener que verificarlo manualmente.

Verificar con `adb shell dumpsys jobscheduler` (o la herramienta de inspección equivalente en Android Studio) que el trabajo periódico persiste correctamente incluso después de cerrar la app confirma en la práctica la garantía descrita en el Tema 1: la solicitud de trabajo vive en un almacenamiento del sistema gestionado por WorkManager, independiente del proceso de la app que la encoló originalmente.

**Analogía:** una notificación desde background work es como un mensaje de texto automático que confirma la entrega de un paquete, enviado independientemente de si el destinatario está revisando activamente el estado del envío o no, permitiéndole enterarse del resultado sin tener que consultar manualmente.

**¿Por qué es importante?** Las notificaciones desde background work comunican resultados relevantes al usuario sin requerir que abra la app activamente, y verificar la persistencia del trabajo tras cerrar la app confirma en la práctica la garantía central de WorkManager.

**Casos de uso reales:**
- Notificar "Backup completado" tras sincronizar fotos exitosamente en segundo plano durante la noche.
- Avisar al usuario que una descarga grande falló y necesita reintentarse manualmente con mejor conexión.
- Confirmar que un pedido se procesó correctamente aunque el usuario haya cerrado la app tras confirmarlo.

**Diagrama:**

```
CoroutineWorker.doWork() completa exitosamente
        ↓
NotificationManagerCompat.notify(...) → el usuario ve la notificación sin haber abierto la app
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

**Objetivo del laboratorio:** construir una tarea periódica con WorkManager que sincroniza datos con constraints de red.

**Requisitos previos:** Módulo 7 completado.

| Paso | Acción | Código/Comando | Explicación |
|---|---|---|---|
| 1 | Crear un `CoroutineWorker` que sincronice datos | Ver Tema 1 | Con la API del Módulo 5 |
| 2 | Encolarlo como trabajo periódico (15 minutos) | Ver Tema 2 | El mínimo permitido |
| 3 | Agregar constraints de red y batería | Ver Tema 2 | Solo corre con conexión y batería no baja |
| 4 | Disparar una notificación al completar | Ver Tema 3 | `NotificationManagerCompat` |
| 5 | Verificar persistencia tras cerrar la app | `adb shell dumpsys jobscheduler` | Confirma que el trabajo sobrevive |

**Verificación:** el laboratorio se considera exitoso si el trabajo periódico sigue registrado (verificable con `dumpsys`) después de cerrar la app por completo, y si la notificación aparece correctamente tras una sincronización exitosa.

**Errores comunes y soluciones**

- **Lanzar la sincronización con `viewModelScope.launch` en vez de WorkManager.** Se cancela si el usuario abandona la pantalla o cierra la app antes de completarse.
- **Configurar un intervalo periódico menor a 15 minutos.** Android lo ajusta automáticamente al mínimo permitido de 15 minutos.
- **No manejar `Result.retry()` ante un fallo transitorio.** Sin él, un fallo temporal (ej. sin conexión momentánea) no se reintenta automáticamente.

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

- `CoroutineWorker` permite escribir trabajo en background con coroutines, con reintentos automáticos vía `Result.retry()`.
- WorkManager garantiza persistencia de la solicitud de trabajo independiente del ciclo de vida del proceso de la app.
- Las constraints retrasan la ejecución hasta que se cumplan condiciones del sistema (red, batería), priorizando salud del dispositivo.
- Quince minutos es el intervalo mínimo para trabajo periódico, sin garantía de exactitud absoluta.

**Conceptos aprendidos**

- WorkManager: tareas únicas y periódicas.
- Constraints (red, batería).
- Coroutines en background con scopes correctos.
- Notificaciones desde background work.

**Próximos pasos**

En el Módulo 9 aprenderás a testear ViewModels, Compose UI y flujos completos con las herramientas estándar del ecosistema Android.

**Recursos adicionales**

- Documentación oficial de WorkManager (developer.android.com/topic/libraries/architecture/workmanager).
