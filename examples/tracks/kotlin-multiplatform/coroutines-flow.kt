// Coroutines y Flow (Módulo 2): concurrencia estructurada y streams de datos asíncronos.
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

// Flow<T>: secuencia asíncrona y fría (no emite nada hasta que alguien la colecta
// con collect{}) — el equivalente de Kotlin a un Observable/Flux, pero basado en
// coroutines suspend en vez de callbacks.
fun contadorFlow(): Flow<Int> = flow {
  for (i in 1..5) {
    delay(200) // suspende la coroutine sin bloquear el hilo subyacente
    emit(i)
  }
}

suspend fun main() = coroutineScope {
  // launch: coroutine "fire and forget" dentro del scope — si lanza una excepción,
  // cancela el scope completo (concurrencia estructurada: sin coroutines huérfanas).
  launch {
    contadorFlow()
      .map { it * it }              // transforma cada valor emitido
      .filter { it % 2 == 0 }       // solo cuadrados pares
      .collect { valor -> println("Recibido: $valor") }
  }

  // async: como launch, pero devuelve un Deferred<T> con el resultado — se usa
  // cuando sí necesitas el valor de vuelta, a diferencia de launch.
  val resultado = async {
    delay(100)
    "Resultado calculado en paralelo"
  }
  println(resultado.await())
}
