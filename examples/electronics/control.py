temperatura, referencia = 20.0, 25.0
for _ in range(100):
    error = referencia - temperatura
    # Control P con saturación y planta discreta de primer orden.
    potencia = min(10.0, max(0.0, 2 * error))
    temperatura += 0.1 * (potencia - (temperatura - 20))
print(f"Temperatura: {temperatura:.2f} °C")
