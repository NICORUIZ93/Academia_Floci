tiempos = [0, 1, 2, 3]
corrientes = [2 * t for t in tiempos]
# Trapecios: aproximan el área entre dos muestras.
carga = sum((corrientes[i] + corrientes[i+1]) / 2 *
            (tiempos[i+1] - tiempos[i]) for i in range(3))
print(f"Carga: {carga:.1f} C")
