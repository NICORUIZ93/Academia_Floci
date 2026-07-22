#!/usr/bin/env python3
"""Genera una deuda editorial accionable sin confundir ayudas de UI con contenido."""

from __future__ import annotations

import argparse
from collections import Counter, defaultdict
from pathlib import Path

from audit_topic_learning_quality import build

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "docs" / "editorial-backlog.md"
LABELS = {
    "explanation": "explicación",
    "code": "código",
    "filePath": "ruta",
    "runCommand": "ejecución",
    "expectedResult": "resultado",
    "practice": "modificación",
    "project": "conexión con un proyecto",
    "modelMental": "modelo mental",
    "limitsDecision": "límites",
}


def render() -> str:
    data = build()
    lines = [
        "# Deuda editorial verificable",
        "",
        "Este inventario se genera desde el Markdown real. Las ayudas visuales, el glosario y los mensajes generados por la interfaz no cuentan como explicación editorial.",
        "",
        "## Estado global",
        "",
        "| Criterio | Cubierto | Pendiente |",
        "|---|---:|---:|",
    ]
    total = sum(row["topics"] for row in data["summary"].values())
    for key, label in LABELS.items():
        covered = sum(row[key] for row in data["summary"].values())
        lines.append(f"| {label.capitalize()} | {covered} | {total - covered} |")
    practicable = sum(row["practicable"] for row in data["summary"].values())
    lines.append(f"| **Tema practicable completo** | **{practicable}** | **{total - practicable}** |")

    lines.extend([
        "",
        "## Prioridad por track",
        "",
        "| Track | Temas | Sin código | Sin ruta | Sin ejecución | Sin resultado | Sin modificación | Sin límites |",
        "|---|---:|---:|---:|---:|---:|---:|---:|",
    ])
    for track, row in data["summary"].items():
        lines.append(
            f"| {track} | {row['topics']} | {row['topics'] - row['code']} | "
            f"{row['topics'] - row['filePath']} | {row['topics'] - row['runCommand']} | "
            f"{row['topics'] - row['expectedResult']} | {row['topics'] - row['practice']} | "
            f"{row['topics'] - row['limitsDecision']} |"
        )

    lines.extend(["", "## Temas sin código editorial", ""])
    by_track: dict[str, dict[int, list[str]]] = defaultdict(lambda: defaultdict(list))
    for track, topics in data["topics"].items():
        for topic in topics:
            if not topic["criteria"]["code"]:
                by_track[track][topic["module"]].append(topic["topic"])
    if not by_track:
        lines.append("No hay temas pendientes de código.")
    for track, modules in sorted(by_track.items()):
        lines.append(f"### {track}")
        lines.append("")
        for module, topics in sorted(modules.items()):
            clean = [topic.split(":", 1)[-1].strip() for topic in topics]
            lines.append(f"- Módulo {module}: " + "; ".join(clean))
        lines.append("")

    lines.extend([
        "## Regla de cierre",
        "",
        "Un pendiente solo se cierra cuando el tema específico incluye archivo, código explicado, comando, salida, fallo diagnosticable, modificación y conexión con un proyecto propio. No se acepta texto generado o el mismo ejemplo repetido entre temas.",
        "",
    ])
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    content = render()
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != content:
            raise SystemExit("La deuda editorial está desactualizada")
    else:
        OUTPUT.write_text(content, encoding="utf-8")
        print(f"Deuda editorial actualizada: {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
