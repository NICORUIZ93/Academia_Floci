import SwiftUI
import SwiftData

struct ContentView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Delivery.fechaCreacion, order: .reverse)
    private var entregas: [Delivery]

    @State private var mostrarNueva = false
    @State private var seleccionada: Delivery?
    @State private var locationManager = LocationManager()

    var body: some View {
        NavigationStack(path: $locationManager.navigationPath) {
            List {
                Section("Entregas del día") {
                    if entregas.isEmpty {
                        ContentUnavailableView(
                            "Sin entregas",
                            systemImage: "truck.box",
                            description: Text("Descarga una ruta desde RutaFlow Cloud")
                        )
                    } else {
                        ForEach(entregas) { entrega in
                            TarjetaEntreguaRow(entrega: entrega)
                                .onTapGesture { seleccionada = entrega }
                                .swipeActions(edge: .trailing) {
                                    Button("Eliminar", systemImage: "trash", role: .destructive) {
                                        modelContext.delete(entrega)
                                    }
                                }
                        }
                    }
                }
            }
            .navigationDestination(for: Delivery.self) { entrega in
                DetalleEntregaView(entrega: entrega)
            }
            .navigationTitle("RutaFlow Conductor")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button("", systemImage: "plus") {
                        mostrarNueva = true
                    }
                }
            }
            .sheet(isPresented: $mostrarNueva) {
                NuevaEntregaSheet()
                    .presentationDetents([.medium, .large])
            }
        }
        .environment(locationManager)
        .task {
            // Simula descarga de rutas desde API
            await locationManager.inicializarLocationTracking()
        }
    }
}

// MARK: - Row

struct TarjetaEntreguaRow: View {
    let entrega: Delivery
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading) {
                    Text("Guía: \(entrega.guia)")
                        .font(.headline)
                    Text(entrega.direccion)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Badge(estado: entrega.estado)
            }
            ProgressView(value: Double(entrega.intentos), total: 3.0)
                .tint(.blue)
        }
        .padding(.vertical, 4)
    }
}

// MARK: - Badge de estado

struct Badge: View {
    let estado: EstadoEntrega

    var body: some View {
        Text(estado.rawValue)
            .font(.caption2)
            .fontWeight(.semibold)
            .foregroundStyle(.white)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(colorPorEstado)
            .clipShape(.capsule)
    }

    private var colorPorEstado: Color {
        switch estado {
        case .creada: .gray
        case .en_ruta: .blue
        case .entregada: .green
        case .fallida: .red
        case .retorno: .orange
        }
    }
}

// MARK: - Nueva entrega

struct NuevaEntregaSheet: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    @State private var guia = ""
    @State private var direccion = ""
    @State private var lat = 40.416945
    @State private var lng = -3.703790 // Madrid

    var body: some View {
        NavigationStack {
            Form {
                Section("Información de entrega") {
                    TextField("Guía (ej: RF-5002)", text: $guia)
                    TextField("Dirección completa", text: $direccion)
                }
                Section("Ubicación") {
                    Stepper("Latitud", value: $lat, in: 0...90, step: 0.001)
                    Stepper("Longitud", value: $lng, in: -180...0, step: 0.001)
                    Text("Coords: (\(String(format: "%.5f", lat)), \(String(format: "%.5f", lng)))")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .navigationTitle("Nueva entrega")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancelar") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Crear") {
                        let nueva = Delivery(
                            guia: guia,
                            direccion: direccion,
                            coordenadas: (lat, lng)
                        )
                        modelContext.insert(nueva)
                        dismiss()
                    }
                    .disabled(guia.isEmpty || direccion.isEmpty)
                }
            }
        }
    }
}

#Preview {
    ContentView()
        .modelContainer(for: Delivery.self, inMemory: true)
}
