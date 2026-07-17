// Concurrencia moderna: async/await (Módulo 4): Task, TaskGroup y actores.
import Foundation

struct Tarea: Decodable {
  let id: String
  let titulo: String
}

enum ErrorRed: Error {
  case respuestaInvalida
}

func obtenerTareas() async throws -> [Tarea] {
  let url = URL(string: "https://api.ejemplo.com/tareas")!
  let (datos, respuesta) = try await URLSession.shared.data(from: url)

  guard let http = respuesta as? HTTPURLResponse, http.statusCode == 200 else {
    throw ErrorRed.respuestaInvalida
  }
  return try JSONDecoder().decode([Tarea].self, from: datos)
}

// TaskGroup: lanza varias tareas hijas en paralelo y espera a que todas terminen —
// el equivalente estructurado a Promise.all, pero con cancelación automática si
// una tarea hija falla o el grupo se cancela desde fuera.
func obtenerVariosRecursos(ids: [String]) async throws -> [Tarea] {
  try await withThrowingTaskGroup(of: Tarea.self) { grupo in
    for id in ids {
      grupo.addTask {
        let url = URL(string: "https://api.ejemplo.com/tareas/\(id)")!
        let (datos, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode(Tarea.self, from: datos)
      }
    }

    var resultados: [Tarea] = []
    for try await tarea in grupo {
      resultados.append(tarea)
    }
    return resultados
  }
}

// Actor: protege su estado interno de acceso concurrente sin locks manuales —
// el compilador garantiza que solo una tarea a la vez ejecuta código dentro del actor.
actor CacheDeTareas {
  private var cache: [String: Tarea] = [:]

  func guardar(_ tarea: Tarea) {
    cache[tarea.id] = tarea
  }

  func obtener(_ id: String) -> Tarea? {
    cache[id]
  }
}

// Desde una vista SwiftUI, se lanza con Task { } dentro de .task o un botón:
//
// .task {
//   do {
//     let tareas = try await obtenerTareas()
//   } catch {
//     print("Error: \(error)")
//   }
// }
