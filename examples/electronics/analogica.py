vin, rf, rg, alimentacion = 0.2, 9000, 1000, 3.3
ganancia = 1 + rf / rg
ideal = vin * ganancia
# Modelo didáctico: un amplificador no supera su alimentación.
salida = min(max(ideal, 0), alimentacion)
print(f"Ganancia={ganancia:.1f}; salida={salida:.2f} V")
