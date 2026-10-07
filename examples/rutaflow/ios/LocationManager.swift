import Foundation
import CoreLocation
import Observation

// Paso 4 (Concurrencia) → Paso 10 (RutaFlow)
// El conductor rastreable debe reportar ubicación cada X metros o Y segundos,
// sin bloquear la UI ni consumir batería innecesariamente.

@Observable
final class LocationManager: NSObject, CLLocationManagerDelegate {
    private let manager = CLLocationManager()
    var ubicacionActual: CLLocationCoordinate2D?
    var autorizado: Bool = false
    var rastreando: Bool = false
    var navigationPath: [Delivery] = []

    override init() {
        super.init()
        manager.delegate = self
        manager.requestWhenInUseAuthorization()
    }

    func inicializarLocationTracking() async {
        await MainActor.run {
            rastreando = true
            autorizado = manager.authorizationStatus == .authorizedWhenInUse
                || manager.authorizationStatus == .authorizedAlways

            if autorizado {
                manager.startUpdatingLocation()
            }
        }
    }

    func detenerTracking() {
        rastreando = false
        manager.stopUpdatingLocation()
    }

    // MARK: - CLLocationManagerDelegate

    nonisolated func locationManager(
        _ manager: CLLocationManager,
        didUpdateLocations locations: [CLLocation]
    ) {
        guard let ultima = locations.last else { return }

        Task { @MainActor in
            self.ubicacionActual = ultima.coordinate
        }
    }

    nonisolated func locationManager(
        _ manager: CLLocationManager,
        didFailWithError error: Error
    ) {
        print("Location error: \(error.localizedDescription)")
    }

    nonisolated func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        Task { @MainActor in
            self.autorizado = manager.authorizationStatus == .authorizedWhenInUse
                || manager.authorizationStatus == .authorizedAlways
        }
    }
}

// MARK: - Locaciones simuladas para preview/testing

extension CLLocationCoordinate2D {
    static let madridCentro = CLLocationCoordinate2D(latitude: 40.4168, longitude: -3.7038)
    static let madridNorte = CLLocationCoordinate2D(latitude: 40.4500, longitude: -3.7000)
    static let madridSur = CLLocationCoordinate2D(latitude: 40.3800, longitude: -3.7100)
}
