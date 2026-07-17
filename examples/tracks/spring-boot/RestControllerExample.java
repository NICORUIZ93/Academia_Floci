// REST APIs con Spring Web (Módulo 2): controller CRUD completo.
package com.ejemplo.tareas;

import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

record Tarea(String id, String titulo, boolean completada) {}
record CrearTareaRequest(String titulo) {}

@RestController
@RequestMapping("/api/tareas")
class TareaController {

  // En una app real esto sería un @Service inyectado, no estado en memoria del
  // controller — simplificado aquí para mantener el ejemplo en un solo archivo.
  private final List<Tarea> tareas = new java.util.ArrayList<>();

  @GetMapping
  List<Tarea> listar() {
    return tareas;
  }

  @GetMapping("/{id}")
  ResponseEntity<Tarea> obtener(@PathVariable String id) {
    return tareas.stream()
        .filter(t -> t.id().equals(id))
        .findFirst()
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  Tarea crear(@RequestBody CrearTareaRequest request) {
    Tarea nueva = new Tarea(UUID.randomUUID().toString(), request.titulo(), false);
    tareas.add(nueva);
    return nueva;
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  void eliminar(@PathVariable String id) {
    tareas.removeIf(t -> t.id().equals(id));
  }
}
