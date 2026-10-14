referencias = [0, 25, 50]
medidas = [0.2, 25.4, 49.7]
# La aceptación parte de un requisito medible.
errores = [abs(a-b) for a,b in zip(referencias, medidas)]
print(f"Error máximo={max(errores):.2f} °C; acepta={max(errores) <= 0.5}")
