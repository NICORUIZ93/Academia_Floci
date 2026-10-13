import Foundation
import SwiftData
@Model public final class EnvioLocal {
    @Attribute(.unique) public var id: String
    public var estado: String
    public init(id: String, estado: String = "pendiente") { self.id = id; self.estado = estado }
}
