import Foundation

enum RouteActivity { case stopped, walkingToDoor, driving }

struct LocationPolicy: Equatable {
    let minimumInterval: Duration
    let distanceFilterMeters: Double

    static func forRoute(activity: RouteActivity, batteryLevel: Double) -> Self {
        precondition((0...1).contains(batteryLevel))
        if batteryLevel <= 0.15 {
            return .init(minimumInterval: .seconds(120), distanceFilterMeters: 200)
        }
        return switch activity {
        case .stopped: .init(minimumInterval: .seconds(180), distanceFilterMeters: 250)
        case .walkingToDoor: .init(minimumInterval: .seconds(15), distanceFilterMeters: 10)
        case .driving: .init(minimumInterval: .seconds(30), distanceFilterMeters: 50)
        }
    }
}
