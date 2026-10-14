"""Comprobación por estados del circuito de la página 65, modelo de umbral fijo.

Referencia izquierda inferior=0 V; derecha inferior=-10 V. D1 y D4
apuntan hacia abajo, D2 a la derecha y D3 hacia arriba. Cada diodo
puede conducir directamente a 0.5 V o en ruptura inversa a -8 V.
El dibujo determina los ánodos/cátodos, no el orden del OCR.
"""
from fractions import Fraction as F

izquierda, derecha = F(0), F(-10)
x, y, z, u = F(1, 2), F(0), F(-2), F(-10)
w = y - 10  # Nodo bajo la fuente VB: positivo arriba.
i2 = (y - z) / 1000
i3 = (z - y) / 1000
i4 = (w - u) / 1000
i1 = (8 - x) / 3000 - i2

# KCL en los cuatro nodos desconocidos, con corrientes orientadas por ánodo.
assert (x - 8) / 3000 + i1 + i2 == 0
assert (y - z) / 1000 + (w - u) / 1000 - i2 == 0
assert (z - y) / 1000 - i3 == 0
assert (u - w) / 1000 + i4 == 0
# Una hipótesis de estado es válida solo si satisface tensión Y corriente.
assert x - izquierda == F(1, 2) and i1 > 0
assert x - y == F(1, 2) and i2 > 0
assert derecha - z == -8 and i3 < 0
assert -8 < u - derecha < F(1, 2) and i4 == 0

print(f"D1 directa: {float(i1 * 1000):.3f} mA")
print(f"D2 directa: {float(i2 * 1000):.3f} mA")
print(f"D3 ruptura Zener: {float(-i3 * 1000):.3f} mA (sentido inverso)")
print("D4 bloqueado: 0.000 mA")
