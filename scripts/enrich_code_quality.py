#!/usr/bin/env python3
"""Añade el contrato transversal de calidad a todos los capítulos, de forma idempotente."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web" / "public" / "content"
TRACKS = (
    "foundations", "cloud", "angular", "react", "java", "spring-boot",
    "kotlin-multiplatform", "android", "ios", "flutter", "node",
    "javascript", "devops", "rutaflow",
)
HEADING = "## Criterio transversal de calidad del código"
SECTION = f"""{HEADING}

Aplica estas decisiones en todos los ejemplos y en tu entrega:

- usa nombres que expresen intención, dominio y unidades; evita `data`, `temp`, `manager` o `process` cuando exista un término preciso;
- mantén funciones, componentes, clases, consultas y módulos cohesionados alrededor de una responsabilidad comprobable;
- haz visibles las dependencias y los efectos de red, tiempo, archivos, estado y base de datos;
- valida entradas en la frontera y representa errores con contexto, sin ocultar la causa ni registrar secretos;
- elimina duplicación de reglas, no toda repetición textual; una abstracción incorrecta cuesta más que dos líneas parecidas;
- escribe primero la solución más simple que satisface el requisito y refactoriza con pruebas verdes;
- aplica SOLID únicamente cuando exista una necesidad real de cambio, extensión, sustitución o aislamiento.

**SOLID con criterio:** responsabilidad única significa una razón coherente de cambio, no una clase por función. Abierto/cerrado justifica estrategias cuando hay variantes reales. Sustitución exige respetar contratos. Segregación evita obligar a consumidores a depender de operaciones que no usan. Inversión de dependencias protege el dominio frente a detalles externos; no exige crear interfaces para cada objeto.

**Comprobación antes de continuar:** ¿otra persona puede entender los nombres y el flujo?, ¿los casos de error son observables?, ¿una prueba demuestra la regla principal?, ¿cada abstracción aporta más claridad de la que cuesta? Registra una decisión de refactorización y una decisión consciente de *no abstraer*.
"""

changed = 0
for track in TRACKS:
    for path in sorted((CONTENT / track).glob("modulo-*.md")):
        text = path.read_text(encoding="utf-8")
        if HEADING in text:
            continue
        anchor = "## Laboratorio práctico"
        if anchor not in text:
            raise RuntimeError(f"{path}: falta {anchor}")
        path.write_text(text.replace(anchor, SECTION.strip() + "\n\n" + anchor, 1), encoding="utf-8")
        changed += 1

print(f"Calidad de código: {changed} capítulos enriquecidos.")
