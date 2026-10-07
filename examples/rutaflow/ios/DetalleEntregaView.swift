import SwiftUI
import SwiftData
import MapKit

// Paso 10 (RutaFlow) · Detalles de entrega
// Esta pantalla integra estados, navegación, formularios y persistencia.

struct DetalleEntregaView: View {
    @Bindable var entrega: Delivery
    @State private var mostrarFirma = false
    @State private var mostrarMapa = false
    @State private var estadoFirma = EstadoFirma.pendiente
    @State private var notaEntrega = ""

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                // Encabezado
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text("Guía \(entrega.guia)")
                            .font(.title2)
                            .fontWeight(.bold)
                        Spacer()
                        Menu {
                            Button("Cambiar estado", action: { cambiarEstado() })
                            Button("Reintentar", action: { reintentar() })
                            Button("Marcar como fallida", action: {
                                entrega.estado = .fallida
                            })
                        } label: {
                            Image(systemName: "ellipsis.circle")
                        }
                    }
                    Text(entrega.direccion)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    Badge(estado: entrega.estado)
                }
                .padding()
                .background(Color(.systemGray6))
                .clipShape(.rect(cornerRadius: 8))

                // Ubicación
                VStack(alignment: .leading, spacing: 8) {
                    Text("Ubicación")
                        .font(.headline)
                    HStack {
                        Image(systemName: "mappin.circle.fill")
                            .foregroundStyle(.red)
                        VStack(alignment: .leading) {
                            Text("(\(String(format: "%.4f", entrega.coordenadas.lat)), \(String(format: "%.4f", entrega.coordenadas.lng)))")
                                .font(.caption)
                            Text("Centro de Madrid")
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                        Button("Ver mapa", systemImage: "map") {
                            mostrarMapa = true
                        }
                        .sheet(isPresented: $mostrarMapa) {
                            MapPreview(coordenadas: entrega.coordenadas)
                                .presentationDetents([.medium, .large])
                        }
                    }
                }

                // Reintentos
                VStack(alignment: .leading, spacing: 8) {
                    Text("Intentos: \(entrega.intentos)/3")
                        .font(.headline)
                    ProgressView(value: Double(entrega.intentos), total: 3.0)
                        .tint(entrega.intentos >= 2 ? .orange : .green)
                }

                // Firma
                VStack(alignment: .leading, spacing: 8) {
                    Text("Firma del cliente")
                        .font(.headline)
                    if let firma = entrega.firma {
                        Image(uiImage: UIImage(data: firma) ?? UIImage())
                            .resizable()
                            .scaledToFit()
                            .frame(height: 100)
                            .border(Color.gray.opacity(0.3))
                    } else {
                        Button("Capturar firma", systemImage: "pencil.tip") {
                            mostrarFirma = true
                        }
                        .sheet(isPresented: $mostrarFirma) {
                            SignatureCapture(firma: $entrega.firma, isPresented: $mostrarFirma)
                        }
                    }
                }

                // Nota del cliente
                VStack(alignment: .leading, spacing: 8) {
                    Text("Nota del cliente")
                        .font(.headline)
                    TextEditor(text: $notaEntrega)
                        .frame(height: 80)
                        .border(Color.gray.opacity(0.3))
                        .onChange(of: notaEntrega) { _, newValue in
                            if let parada = entrega.paradas.first {
                                parada.notaCliente = newValue
                            }
                        }
                }

                // Acciones
                VStack(spacing: 8) {
                    Button("Marcar como entregada", systemImage: "checkmark.circle.fill") {
                        entrega.estado = .entregada
                        entrega.fechaEntrega = .now
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.green)

                    Button("Rechazado por cliente", systemImage: "xmark.circle.fill", role: .destructive) {
                        entrega.estado = .fallida
                    }
                    .buttonStyle(.bordered)
                }
            }
            .padding()
        }
        .navigationTitle("Detalles")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func cambiarEstado() {
        entrega.estado = EstadoEntrega.allCases.randomElement() ?? .en_ruta
    }

    private func reintentar() {
        if entrega.intentos < 3 {
            entrega.intentos += 1
            entrega.estado = .en_ruta
        }
    }
}

// MARK: - Componentes auxiliares

struct MapPreview: View {
    let coordenadas: (lat: Double, lng: Double)

    var body: some View {
        VStack {
            Text("Mapa: \(coordenadas.lat), \(coordenadas.lng)")
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(Color(.systemGray5))
        }
        .navigationTitle("Ubicación")
    }
}

struct SignatureCapture: View {
    @Binding var firma: Data?
    @Binding var isPresented: Bool

    var body: some View {
        NavigationStack {
            VStack {
                Text("Dibuja firma del cliente")
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(Color.white)
                    .border(Color.gray)
            }
            .padding()
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancelar") { isPresented = false }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Guardar") {
                        // Simulación: genera datos de firma
                        firma = "simulada".data(using: .utf8)
                        isPresented = false
                    }
                }
            }
        }
    }
}

extension EstadoEntrega: CaseIterable {
    static var allCases: [EstadoEntrega] {
        [.creada, .en_ruta, .entregada, .fallida, .retorno]
    }
}

#Preview {
    let container = try! ModelContainer(for: Delivery.self, inMemory: true)
    let context = ModelContext(container)

    let entrega = Delivery(
        guia: "RF-5002",
        direccion: "Calle Gran Vía, 1, Madrid",
        coordenadas: (40.4168, -3.7038)
    )
    context.insert(entrega)

    return NavigationStack {
        DetalleEntregaView(entrega: entrega)
    }
    .modelContainer(container)
}
