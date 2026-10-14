bits, referencia, voltaje = 12, 3.3, 1.65
maximo = 2 ** bits - 1
# Cuantización ideal; no representa ruido ni tolerancias.
codigo = round(voltaje / referencia * maximo)
reconstruido = codigo / maximo * referencia
print(f"ADC={codigo}; reconstruido={reconstruido:.4f} V")
