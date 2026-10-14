import math
fs = 10
a = [math.cos(2 * math.pi * 7 * n / fs) for n in range(10)]
b = [math.cos(2 * math.pi * 3 * n / fs) for n in range(10)]
# El alias se comprueba sobre todas las muestras.
print(f"Diferencia máxima: {max(abs(x-y) for x,y in zip(a,b)):.6f}")
