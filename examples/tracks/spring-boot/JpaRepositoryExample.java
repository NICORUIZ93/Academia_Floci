// Persistencia con Spring Data JPA (Módulo 3): entidad + repositorio + consultas derivadas.
package com.ejemplo.tareas;

import jakarta.persistence.*;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

@Entity
@Table(name = "tareas")
class TareaEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  private String titulo;
  private boolean completada;

  protected TareaEntity() {} // constructor sin argumentos requerido por JPA

  TareaEntity(String titulo) {
    this.titulo = titulo;
    this.completada = false;
  }

  String getId() { return id; }
  String getTitulo() { return titulo; }
  boolean isCompletada() { return completada; }
  void setCompletada(boolean completada) { this.completada = completada; }
}

// JpaRepository<Entidad, TipoId> ya trae save(), findById(), findAll(), delete()
// sin escribir ninguna implementación — Spring Data genera la implementación en
// tiempo de ejecución a partir de la interfaz.
interface TareaRepository extends JpaRepository<TareaEntity, String> {

  // Consulta derivada: Spring Data interpreta el nombre del método y genera el
  // SQL/JPQL automáticamente — no hace falta escribir la consulta a mano.
  List<TareaEntity> findByCompletadaFalse();

  // Para consultas más complejas que el naming convention no puede expresar,
  // @Query permite JPQL explícito.
  @Query("SELECT t FROM TareaEntity t WHERE t.titulo LIKE %:texto%")
  List<TareaEntity> buscarPorTitulo(String texto);
}

// Uso típico en un @Service:
//
// @Service
// class TareaService {
//   private final TareaRepository repo;
//   TareaService(TareaRepository repo) { this.repo = repo; } // inyección por constructor
//
//   List<TareaEntity> pendientes() {
//     return repo.findByCompletadaFalse();
//   }
// }
