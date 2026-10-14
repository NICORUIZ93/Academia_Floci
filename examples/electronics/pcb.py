centros_mm, ancho_a, ancho_b, minimo = 0.50, 0.30, 0.30, 0.25
# Distancia de centros menos ambas mitades de pista.
espacio = centros_mm - (ancho_a + ancho_b) / 2
print(f"Espacio={espacio:.2f} mm; cumple={espacio >= minimo}")
