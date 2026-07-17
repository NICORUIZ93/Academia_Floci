package academy.rutaflow.delivery;

import java.time.Instant;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DeliveryService {
    private final ShipmentRepository shipments;
    private final ProcessedCommandRepository commands;
    private final OutboxRepository outbox;

    public DeliveryService(ShipmentRepository shipments, ProcessedCommandRepository commands, OutboxRepository outbox) {
        this.shipments = shipments;
        this.commands = commands;
        this.outbox = outbox;
    }

    @Transactional
    public DeliveryReceipt confirm(UUID commandId, UUID shipmentId, UUID authenticatedDriverId, Instant occurredAt) {
        return commands.findReceipt(commandId).orElseGet(() -> {
            var shipment = shipments.findForUpdate(shipmentId).orElseThrow(ShipmentNotFound::new);
            shipment.confirmDeliveryBy(authenticatedDriverId, occurredAt);
            var receipt = new DeliveryReceipt(shipmentId, shipment.version());
            commands.save(commandId, receipt);
            outbox.append("ShipmentDelivered", shipmentId, receipt);
            return receipt;
        });
    }
}
