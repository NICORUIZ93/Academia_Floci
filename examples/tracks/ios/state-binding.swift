// Estado y data flow (Módulo 2): @State, @Binding, @Observable.
import SwiftUI

// @Observable (Swift 5.9+/iOS 17+) reemplaza a ObservableObject + @Published:
// SwiftUI observa automáticamente qué propiedades lee cada vista y solo
// recompone las que realmente dependen de la propiedad que cambió.
@Observable
class TareasStore {
  var tareas: [String] = []

  func agregar(_ titulo: String) {
    tareas.append(titulo)
  }
}

struct PantallaTareas: View {
  // @State es dueño del valor y sobrevive a recomposiciones de esta vista —
  // úsalo para estado que pertenece exclusivamente a esta vista.
  @State private var nuevaTarea = ""
  @State private var store = TareasStore()

  var body: some View {
    VStack {
      TextField("Nueva tarea", text: $nuevaTarea) // $ crea un Binding<String> hacia @State
      Button("Agregar") {
        store.agregar(nuevaTarea)
        nuevaTarea = ""
      }
      CampoBusqueda(texto: $nuevaTarea) // pasa el binding a una vista hija
    }
    .padding()
  }
}

// @Binding: la vista NO es dueña del valor, solo lo lee/escribe a través de una
// referencia hacia el @State del padre — cambios aquí se reflejan arriba y viceversa.
struct CampoBusqueda: View {
  @Binding var texto: String

  var body: some View {
    Text("Buscando: \(texto)")
  }
}
