dato = 0b10110010
paridad = dato.bit_count() % 2
recibido = dato ^ 0b00000001
# Un cambio de un bit altera la paridad.
valido = recibido.bit_count() % 2 == paridad
print(f"Trama válida: {valido}")
