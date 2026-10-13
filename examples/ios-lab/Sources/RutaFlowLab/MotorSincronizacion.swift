import Foundation
public struct ConfirmacionPendiente: Identifiable, Sendable {
    public let id: UUID
    public let envioId: String
    public init(id: UUID = UUID(), envioId: String) { self.id = id; self.envioId = envioId }
}
public protocol EnviadorConfirmaciones: Sendable {
    func enviar(_ confirmacion: ConfirmacionPendiente) async throws
}
// Cola en memoria para estudiar el protocolo; persistir antes de usarla en producción.
public actor MotorSincronizacion {
    private var pendientes: [ConfirmacionPendiente] = []
    private var sincronizando = false
    public init() {}
    public func agregar(_ item: ConfirmacionPendiente) { pendientes.append(item) }
    public func cantidadPendiente() -> Int { pendientes.count }
    public func sincronizar(con servicio: any EnviadorConfirmaciones) async throws {
        guard !sincronizando else { return }
        sincronizando = true
        defer { sincronizando = false }
        while let primero = pendientes.first {
            try Task.checkCancellation()
            try await servicio.enviar(primero) // El servidor deduplica por primero.id.
            pendientes.removeFirst() // Solo quitar tras el acuse exitoso.
        }
    }
    public func sincronizacionMedida(con servicio: any EnviadorConfirmaciones) async throws -> Duration {
        let inicio = ContinuousClock.now
        try await sincronizar(con: servicio)
        return inicio.duration(to: .now)
    }
}
