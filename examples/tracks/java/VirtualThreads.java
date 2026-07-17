// Concurrencia — hilos y virtual threads (Módulo 5, Java 21+).
import java.time.Duration;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class VirtualThreads {
  public static void main(String[] args) throws InterruptedException {
    // Executors.newVirtualThreadPerTaskExecutor(): cada tarea recibe su propio
    // hilo virtual, ligero (administrado por la JVM, no por el sistema operativo).
    // A diferencia de un pool de hilos de plataforma tradicional, se pueden crear
    // miles o millones de hilos virtuales sin agotar memoria del sistema operativo —
    // ideal para trabajo con mucho I/O bloqueante (llamadas HTTP, consultas a BD).
    try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
      List<Future<String>> resultados = List.of(1, 2, 3, 4, 5).stream()
          .map(id -> executor.submit(() -> simularLlamadaRed(id)))
          .toList();

      for (Future<String> resultado : resultados) {
        try {
          System.out.println(resultado.get());
        } catch (Exception e) {
          System.out.println("Error: " + e.getMessage());
        }
      }
    } // el try-with-resources cierra el executor y espera a que terminen las tareas
  }

  private static String simularLlamadaRed(int id) throws InterruptedException {
    // Thread.sleep() bloquea el hilo virtual sin bloquear un hilo de SO real
    // por debajo — la JVM "desmonta" el hilo virtual del hilo de plataforma
    // mientras espera, y lo remonta cuando el bloqueo termina.
    Thread.sleep(Duration.ofMillis(200));
    return "Petición " + id + " completada en hilo: " + Thread.currentThread();
  }
}
