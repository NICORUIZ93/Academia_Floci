export function decodeGps(buffer) {
  if (!(buffer instanceof ArrayBuffer) || buffer.byteLength !== 8) {
    throw new RangeError('Paquete GPS esperado: 8 bytes');
  }
  const view = new DataView(buffer);
  return {
    // false declara big-endian; el protocolo no depende de la máquina.
    latitudeE6: view.getInt32(0, false),
    longitudeE6: view.getInt32(4, false),
  };
}
