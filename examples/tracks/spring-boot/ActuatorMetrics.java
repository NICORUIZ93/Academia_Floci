// Observabilidad con Actuator (Módulo 7): métrica personalizada expuesta a Prometheus.
package com.ejemplo.tareas;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Service;

@Service
class TareaMetricsService {

  private final Counter tareasCreadas;

  // MeterRegistry se inyecta automáticamente cuando Actuator + Micrometer están
  // en el classpath (dependencia spring-boot-starter-actuator + micrometer-registry-prometheus).
  TareaMetricsService(MeterRegistry registry) {
    this.tareasCreadas = Counter.builder("tareas.creadas.total")
        .description("Número total de tareas creadas desde el arranque")
        .register(registry);
  }

  void registrarTareaCreada() {
    tareasCreadas.increment();
  }
}

// Con application.yml configurando:
//   management.endpoints.web.exposure.include: health,metrics,prometheus
//
// el contador queda disponible en:
//   GET /actuator/metrics/tareas.creadas.total
//   GET /actuator/prometheus   (formato que Prometheus scrapea directamente)
