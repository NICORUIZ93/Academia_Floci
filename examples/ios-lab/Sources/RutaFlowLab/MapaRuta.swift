#if os(iOS)
import SwiftUI
import MapKit
public struct Parada {
    public let coordenada: CLLocationCoordinate2D
    public let direccion: String
    public init(coordenada: CLLocationCoordinate2D, direccion: String) {
        self.coordenada = coordenada; self.direccion = direccion
    }
}
public struct MapaRuta: UIViewRepresentable {
    public let paradas: [Parada]
    public init(paradas: [Parada]) { self.paradas = paradas }
    public func makeUIView(context: Context) -> MKMapView { MKMapView() }
    public func updateUIView(_ view: MKMapView, context: Context) {
        view.removeAnnotations(view.annotations.filter { !($0 is MKUserLocation) })
        view.addAnnotations(paradas.map { parada in
            let point = MKPointAnnotation(); point.coordinate = parada.coordenada
            point.title = parada.direccion; return point
        })
    }
}
#endif
