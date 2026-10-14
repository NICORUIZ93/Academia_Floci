tareas = [("sensor", 2, 20), ("publicar", 5, 100)]
# Utilización necesaria; no es prueba suficiente de planificabilidad.
utilizacion = sum(coste / periodo for _, coste, periodo in tareas)
print(f"Utilización: {utilizacion:.2%}")
