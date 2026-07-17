#!/usr/bin/env python3
"""Valida que Clean Code y SOLID sean criterios transversales y no menciones aisladas."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web" / "public" / "content"
TRACKS = (
    "foundations", "cloud", "angular", "react", "java", "spring-boot",
    "kotlin-multiplatform", "android", "ios", "flutter", "node",
    "javascript", "devops", "rutaflow",
)
HEADING = "## Criterio transversal de calidad del código"
STANDARD = ROOT / "docs" / "ESTANDAR-DE-CODIGO.md"
errors: list[str] = []
files = 0

if not STANDARD.exists():
    errors.append("falta docs/ESTANDAR-DE-CODIGO.md")
else:
    standard = STANDARD.read_text(encoding="utf-8").lower()
    for term in ("corrección", "claridad", "cohesión", "dependencias", "errores", "verificación", "simplicidad", "solid"):
        if term not in standard:
            errors.append(f"estándar: falta {term}")

for track in TRACKS:
    for path in sorted((CONTENT / track).glob("modulo-*.md")):
        files += 1
        text = path.read_text(encoding="utf-8")
        if HEADING not in text:
            errors.append(f"{path.relative_to(ROOT)}: falta el criterio transversal")
        quality = text.split(HEADING, 1)[-1].split("## Laboratorio práctico", 1)[0].lower()
        for term in ("nombres", "errores", "prueba", "solid", "no abstraer"):
            if term not in quality:
                errors.append(f"{path.relative_to(ROOT)}: el criterio no cubre {term}")

if errors:
    print("Calidad de código FALLÓ:")
    for error in errors:
        print(f"- {error}")
    raise SystemExit(1)

print(f"Calidad de código OK: {files} capítulos aplican claridad, verificación y SOLID con criterio.")
