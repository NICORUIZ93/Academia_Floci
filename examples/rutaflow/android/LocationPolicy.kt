package academy.rutaflow.location

data class LocationPolicy(val intervalMillis: Long, val minDistanceMeters: Float)

enum class RouteActivity { STOPPED, WALKING_TO_DOOR, DRIVING }

fun locationPolicy(activity: RouteActivity, batteryPercent: Int): LocationPolicy {
    require(batteryPercent in 0..100)
    if (batteryPercent <= 15) return LocationPolicy(intervalMillis = 120_000, minDistanceMeters = 200f)
    return when (activity) {
        RouteActivity.STOPPED -> LocationPolicy(180_000, 250f)
        RouteActivity.WALKING_TO_DOOR -> LocationPolicy(15_000, 10f)
        RouteActivity.DRIVING -> LocationPolicy(30_000, 50f)
    }
}
