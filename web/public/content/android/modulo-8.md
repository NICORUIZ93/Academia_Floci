## CoroutineWorker

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

## Encolar trabajo periódico con constraints

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

WorkManager garantiza que el trabajo se ejecute eventualmente — incluso si el sistema mata el proceso de la app, persiste la solicitud y la reintenta cuando se cumplen las constraints, sin que el usuario tenga que reabrir la app.

## Notificación desde background

```kotlin
NotificationManagerCompat.from(context).notify(ID, notificacion)
```

15 minutos es el intervalo MÍNIMO que Android permite para trabajo periódico — el sistema no garantiza exactitud, solo que correrá "aproximadamente" cada ese intervalo, priorizando batería sobre puntualidad.
