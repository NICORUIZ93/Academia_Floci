import Foundation
import Observation

public struct Envio: Identifiable, Sendable, Equatable {
    public let id: String
    public let fechaLimite: Date
    public init(id: String, fechaLimite: Date = .distantFuture) { self.id = id; self.fechaLimite = fechaLimite }
}
public protocol ServicioEnvios: Sendable { func obtenerEnvios() async throws -> [Envio] }
public struct ServicioDemo: ServicioEnvios {
    public init() {}
    public func obtenerEnvios() async throws -> [Envio] { [Envio(id: "RF-4471")] }
}
@MainActor @Observable
public final class EnviosViewModel {
    public private(set) var envios: [Envio]
    public private(set) var error: String?
    private let servicio: any ServicioEnvios
    private var revision = 0
    public init(servicio: any ServicioEnvios = ServicioDemo(), envios: [Envio] = []) {
        self.servicio = servicio; self.envios = envios
    }
    public func cargar() async {
        revision += 1
        let current = revision
        do {
            let respuesta = try await servicio.obtenerEnvios()
            guard !Task.isCancelled, revision == current else { return }
            envios = respuesta; error = nil
        } catch {
            guard !Task.isCancelled, revision == current else { return }
            self.error = String(describing: error)
        }
    }
}
public struct EsEnvioAtrasado {
    public init() {}
    public func callAsFunction(_ envio: Envio, ahora: Date) -> Bool { envio.fechaLimite < ahora }
}
