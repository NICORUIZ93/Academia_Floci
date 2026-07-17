// Networking con URLSession (Módulo 5): peticiones POST/GET con Codable.
import Foundation

struct CrearTareaRequest: Encodable {
  let titulo: String
}

struct TareaRespuesta: Decodable {
  let id: String
  let titulo: String
  let completada: Bool
}

enum ApiError: Error {
  case codigoInvalido(Int)
  case decodificacion(Error)
}

final class TareasApiClient {
  private let baseUrl = URL(string: "https://api.ejemplo.com")!
  private let sesion = URLSession.shared

  func crearTarea(titulo: String) async throws -> TareaRespuesta {
    var request = URLRequest(url: baseUrl.appendingPathComponent("tareas"))
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    // JSONEncoder codifica directamente la struct Encodable — sin construir el
    // cuerpo de la petición a mano con diccionarios ni serialización manual.
    request.httpBody = try JSONEncoder().encode(CrearTareaRequest(titulo: titulo))

    let (datos, respuesta) = try await sesion.data(for: request)

    guard let http = respuesta as? HTTPURLResponse, (200...299).contains(http.statusCode) else {
      let codigo = (respuesta as? HTTPURLResponse)?.statusCode ?? -1
      throw ApiError.codigoInvalido(codigo)
    }

    do {
      return try JSONDecoder().decode(TareaRespuesta.self, from: datos)
    } catch {
      throw ApiError.decodificacion(error)
    }
  }
}
