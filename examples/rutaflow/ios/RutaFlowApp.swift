import SwiftUI
import SwiftData

@main
struct RutaFlowApp: App {
    let modelContainer: ModelContainer

    init() {
        do {
            // Esquema: Delivery → Routes → Stops; Real-time location tracking
            modelContainer = try ModelContainer(
                for: Delivery.self,
                migrationPlan: DeliveryMigrationPlan.self
            )
        } catch {
            fatalError("Could not initialize ModelContainer: \(error)")
        }
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .modelContainer(modelContainer)
                .preferredColorScheme(nil) // Respeta tema del sistema
        }
    }
}

// MARK: - Modelos principales

@Model
final class Delivery {
    @Attribute(.unique) var guia: String // "RF-5002"
    var estado: EstadoEntrega = .en_ruta
    var direccion: String
    var coordenadas: (lat: Double, lng: Double)
    var intentos: Int = 0
    var firma: Data?
    var fotosEntrega: [Data] = []
    var fechaCreacion: Date = .now
    var fechaEntrega: Date?

    // Relaciones
    @Relationship(deleteRule: .cascade, inverse: \Stop.delivery)
    var paradas: [Stop] = []

    init(
        guia: String,
        direccion: String,
        coordenadas: (lat: Double, lng: Double)
    ) {
        self.guia = guia
        self.direccion = direccion
        self.coordenadas = coordenadas
    }
}

@Model
final class Stop {
    var secuencia: Int
    var direccion: String
    var estado: EstadoParada = .pendiente
    var notaCliente: String?
    var delivery: Delivery?

    init(secuencia: Int, direccion: String) {
        self.secuencia = secuencia
        self.direccion = direccion
    }
}

enum EstadoEntrega: String, Codable {
    case creada, en_ruta, entregada, fallida, retorno
}

enum EstadoParada: String, Codable {
    case pendiente, visitada, rechazada
}

// MARK: - Migraciones

enum DeliveryMigrationPlan: SchemaMigrationPlan {
    static var schemas: [VersionedSchema.Type] {
        [DeliverySchemaV1.self]
    }

    static var initialVersion: DeliverySchemaV1 {
        DeliverySchemaV1.self
    }
}

enum DeliverySchemaV1: VersionedSchema {
    static var models: [any PersistentModel.Type] {
        [Delivery.self, Stop.self]
    }
}
