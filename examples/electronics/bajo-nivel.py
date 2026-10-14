import struct
medicion = 513
# Contrato explícito: dos bytes, sin signo, little-endian.
trama = struct.pack("<H", medicion)
print(trama.hex(), struct.unpack("<H", trama)[0])
