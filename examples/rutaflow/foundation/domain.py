from dataclasses import dataclass
from enum import Enum
from math import hypot


class ShipmentStatus(str, Enum):
    CREATED = "created"
    ASSIGNED = "assigned"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"


ALLOWED_TRANSITIONS = {
    ShipmentStatus.CREATED: {ShipmentStatus.ASSIGNED},
    ShipmentStatus.ASSIGNED: {ShipmentStatus.OUT_FOR_DELIVERY},
    ShipmentStatus.OUT_FOR_DELIVERY: {ShipmentStatus.DELIVERED},
    ShipmentStatus.DELIVERED: set(),
}


def transition(current: ShipmentStatus, requested: ShipmentStatus) -> ShipmentStatus:
    if requested not in ALLOWED_TRANSITIONS[current]:
        raise ValueError(f"invalid shipment transition: {current} -> {requested}")
    return requested


@dataclass(frozen=True)
class Stop:
    shipment_id: str
    latitude: float
    longitude: float


def nearest_neighbor_route(origin: tuple[float, float], stops: list[Stop]) -> list[Stop]:
    """Heurística educativa O(n²); no afirma encontrar la ruta óptima."""
    remaining = stops.copy()
    ordered: list[Stop] = []
    position = origin
    while remaining:
        selected = min(
            remaining,
            key=lambda stop: hypot(stop.latitude - position[0], stop.longitude - position[1]),
        )
        ordered.append(selected)
        remaining.remove(selected)
        position = (selected.latitude, selected.longitude)
    return ordered
