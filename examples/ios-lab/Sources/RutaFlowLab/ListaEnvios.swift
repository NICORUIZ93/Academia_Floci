import SwiftUI
public struct ListaEnvios: View {
    private let vm: EnviosViewModel
    public init(vm: EnviosViewModel) { self.vm = vm }
    public var body: some View {
        List {
            if vm.envios.isEmpty { Text("Sin envíos") }
            ForEach(vm.envios) { envio in TarjetaEnvio(envio: envio) }
        }
    }
}
public struct TarjetaEnvio: View {
    public let envio: Envio
    public init(envio: Envio) { self.envio = envio }
    public var body: some View { Text(envio.id).accessibilityLabel("Envío " + envio.id) }
}
