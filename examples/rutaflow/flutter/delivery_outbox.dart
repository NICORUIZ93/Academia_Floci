abstract interface class DeliveryOutbox {
  Future<List<PendingDelivery>> ready(DateTime now);
  Future<void> markDelivered(String commandId);
  Future<void> scheduleRetry(String commandId, DateTime nextAttemptAt);
}

abstract interface class DeliveryApi {
  Future<void> send(PendingDelivery command);
}

final class PendingDelivery {
  const PendingDelivery({required this.commandId, required this.attempts});
  final String commandId;
  final int attempts;
}

final class DeliverySyncEngine {
  DeliverySyncEngine(this._outbox, this._api, this._clock);
  final DeliveryOutbox _outbox;
  final DeliveryApi _api;
  final DateTime Function() _clock;

  Future<void> drain() async {
    for (final command in await _outbox.ready(_clock())) {
      try {
        await _api.send(command);
        await _outbox.markDelivered(command.commandId);
      } on TransientNetworkFailure {
        final seconds = 1 << command.attempts.clamp(0, 6);
        await _outbox.scheduleRetry(command.commandId, _clock().add(Duration(seconds: seconds)));
      }
    }
  }
}

final class TransientNetworkFailure implements Exception {}
