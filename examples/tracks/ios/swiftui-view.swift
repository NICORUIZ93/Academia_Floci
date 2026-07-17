// SwiftUI: vistas y layout declarativo (Módulo 1).
import SwiftUI

struct TarjetaTarea: View {
  let titulo: String
  let completada: Bool

  var body: some View {
    HStack {
      // El operador ternario y las expresiones condicionales se resuelven en
      // tiempo de construcción de la vista — `some View` permite que el tipo
      // concreto devuelto varíe (Text, Image, etc.) sin declararlo explícitamente.
      Image(systemName: completada ? "checkmark.circle.fill" : "circle")
        .foregroundStyle(completada ? .green : .gray)

      Text(titulo)
        .strikethrough(completada)
        .font(.body)

      Spacer() // empuja el contenido anterior hacia la izquierda
    }
    .padding()
    .background(Color(.secondarySystemBackground))
    .clipShape(RoundedRectangle(cornerRadius: 12))
  }
}

#Preview {
  VStack(spacing: 8) {
    TarjetaTarea(titulo: "Aprender SwiftUI", completada: true)
    TarjetaTarea(titulo: "Publicar la app", completada: false)
  }
  .padding()
}
