entradas = {"marcha": True, "puerta_cerrada": False, "alarma": False}
# Interlock: marcha solicitada no basta para habilitar motor.
motor = entradas["marcha"] and entradas["puerta_cerrada"] and not entradas["alarma"]
print(f"Motor habilitado: {motor}")
