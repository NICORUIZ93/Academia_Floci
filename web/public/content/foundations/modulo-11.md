# Módulo 11: Ciencias de la Computación: mapa de especializaciones

## Sílabo

**Objetivo general:** comprender el mapa de Ciencias de la Computación, sus relaciones y prerrequisitos mediante experimentos reproducibles antes de elegir una especialización.

## Contenido teórico

## Criterio transversal de calidad del código

Usa nombres claros, errores explícitos y pruebas reproducibles. Aplica SOLID solo cuando reduzca el coste de cambiar; no abstraer sin presión real. Distingue evidencia, inferencia y opinión.

## Laboratorio práctico

Crea un portafolio con un experimento de sistemas, teoría, datos, inteligencia artificial, cómputo visual y práctica profesional. Registra hipótesis, implementación, medición, límites y siguiente prerrequisito.

**Verificación:** cada uno de los seis experimentos declara una pregunta distinta, incluye un artefacto reproducible, registra al menos una medición y explica una limitación sin exagerar conclusiones. Otra persona puede ejecutar uno de ellos usando exclusivamente su README. La comparación final debe justificar qué especialización continuarías, qué prerrequisito te falta y qué evidencia cambiaría tu decisión.


## Rúbrica del proyecto

| Criterio | Inicial | Competente | Experto |
|---|---|---|---|
| Fundamento | Enumera áreas | Explica relaciones | Justifica prerrequisitos y límites |
| Evidencia | Captura | Experimento | Reproducción, medición y crítica |
| Práctica | Código aislado | Dos áreas | Portafolio interdisciplinario |

## Bibliografía y fundamento académico

- ACM/IEEE-CS/AAAI CS2023 y SWEBOK V4.
- Planes académicos citados en la lista suplementaria.
- NIST SSDF, OWASP y W3C cuando corresponda.


## Resumen del módulo

### Ejemplo reproducible: comparar dos estrategias

```python
from time import perf_counter

def measure(label, operation):
    started = perf_counter()
    result = operation()
    return {"strategy": label, "result": result, "seconds": perf_counter() - started}

data = list(range(10_000))
print(measure("linear-search", lambda: 9_999 in data))
print(measure("set-lookup", lambda: 9_999 in set(data)))
```

El experimento no demuestra que una estructura sea siempre mejor: registra tamaño de entrada, coste de construcción y número de consultas antes de concluir.

El mapa evita confundir una ruta de herramientas con toda la disciplina y permite elegir una especialización con fundamento.
