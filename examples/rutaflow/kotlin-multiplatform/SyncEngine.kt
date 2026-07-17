package academy.rutaflow.sync

import kotlinx.coroutines.CancellationException

data class PendingCommand(val id: String, val payload: String, val attempts: Int)

interface Outbox {
    suspend fun ready(): List<PendingCommand>
    suspend fun markDelivered(commandId: String)
    suspend fun scheduleRetry(commandId: String, attempts: Int)
}

interface DeliveryApi { suspend fun send(command: PendingCommand) }

class SyncEngine(private val outbox: Outbox, private val api: DeliveryApi) {
    suspend fun drain() {
        for (command in outbox.ready()) {
            try {
                api.send(command) // command.id viaja como clave de idempotencia
                outbox.markDelivered(command.id)
            } catch (cancelled: CancellationException) {
                throw cancelled
            } catch (failure: Exception) {
                outbox.scheduleRetry(command.id, command.attempts + 1)
            }
        }
    }
}
