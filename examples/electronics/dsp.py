muestras = [20, 20, 29, 20, 20]
ventana = 3
# Media causal: solo usa presente y pasado.
filtradas = [sum(muestras[i-ventana+1:i+1]) / ventana
             for i in range(ventana-1, len(muestras))]
print(filtradas)
