import { expect, test } from 'vitest';
import { statusLabel } from './delivery-status';
import { parseTrackingCode } from '../validation/tracking-code.js';
import { decodeGps } from '../binary/decode-gps.js';
import { planRoute, strategies } from '../routing/route-strategy.js';
import { formatDeliveryInstant } from '../platform/time.js';
test('estados y código de guía', () => {
 expect(statusLabel({ kind: 'assigned', courierId: 'c-9' })).toBe('Asignada a c-9');
 expect(parseTrackingCode('CO-2026-000123').year).toBe(2026);
 expect(() => parseTrackingCode('prefijo CO-2026-000123')).toThrow();
});
test('protocolo GPS y paquete truncado', () => {
 const b = new ArrayBuffer(8); const view = new DataView(b);
 view.setInt32(0, 4673000, false); view.setInt32(4, -74048000, false);
 expect(decodeGps(b)).toEqual({ latitudeE6: 4673000, longitudeE6: -74048000 });
 expect(() => decodeGps(new ArrayBuffer(7))).toThrow(RangeError);
});
test('las estrategias no mutan las rutas', () => {
 const routes = [{minutes: 5, energy: 10}, {minutes: 10, energy: 5}];
 expect(planRoute({ routes }, strategies.fastest)).toEqual(routes[0]);
 expect(planRoute({ routes }, strategies.lowBattery)).toEqual(routes[1]);
 expect(routes[0].minutes).toBe(5);
});
test('fecha inválida se rechaza', () => { expect(() => formatDeliveryInstant('no-fecha', 'UTC')).toThrow(); });
