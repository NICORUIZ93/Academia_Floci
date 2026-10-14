vin, vout, corriente, eficiencia = 12, 5, 1, 0.9
duty = vout / vin
pout = vout * corriente
pin = pout / eficiencia
# Las pérdidas se convierten principalmente en calor.
print(f"Duty={duty:.3f}; pérdidas={pin-pout:.3f} W")
