// Persistencia con SwiftData (Módulo 6, iOS 17+): el sucesor declarativo de Core Data.
import SwiftData
import SwiftUI

// @Model convierte esta clase en una entidad persistente — SwiftData genera el
// esquema y el código de persistencia automáticamente a partir de las propiedades,
// sin un archivo .xcdatamodeld separado como requería Core Data.
@Model
final class TareaModel {
  var titulo: String
  var completada: Bool
  var creada: Date

  init(titulo: String, completada: Bool = false) {
    self.titulo = titulo
    self.completada = completada
    self.creada = .now
  }
}

struct ListaTareasView: View {
  // @Query observa la base de datos y recompone la vista automáticamente cuando
  // los datos cambian — el equivalente declarativo de un NSFetchedResultsController.
  @Query(sort: \TareaModel.creada, order: .reverse) private var tareas: [TareaModel]
  @Environment(\.modelContext) private var contexto

  var body: some View {
    List {
      ForEach(tareas) { tarea in
        Text(tarea.titulo)
      }
      .onDelete { indices in
        for indice in indices {
          contexto.delete(tareas[indice])
        }
      }
    }
    .toolbar {
      Button("Agregar") {
        contexto.insert(TareaModel(titulo: "Nueva tarea"))
        // SwiftData guarda automáticamente en puntos naturales del ciclo de vida;
        // try? contexto.save() fuerza un guardado inmediato si hace falta.
      }
    }
  }
}
