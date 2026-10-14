raw_frio, raw_caliente = 102, 902
ref_frio, ref_caliente = 0.0, 100.0
pendiente = (ref_caliente-ref_frio) / (raw_caliente-raw_frio)
offset = ref_frio - pendiente * raw_frio
# Modelo lineal válido entre referencias bajo estas condiciones.
print(f"Temperatura: {pendiente * 502 + offset:.2f} °C")
