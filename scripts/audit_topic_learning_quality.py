#!/usr/bin/env python3
"""Audita cada tema Markdown con criterios pedagógicos verificables."""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web/public/content"
JSON_REPORT = ROOT / "docs/topic-learning-quality.json"
MD_REPORT = ROOT / "docs/topic-learning-quality.md"


def topic_blocks(text: str):
    headings = list(re.finditer(r"^###\s+(Tema(?:[^:]*)?:\s*.+)$", text, re.MULTILINE))
    for index, match in enumerate(headings):
        end = headings[index + 1].start() if index + 1 < len(headings) else len(text)
        block = text[match.start():end]
        next_h2 = re.search(r"^##\s+", block[match.end() - match.start():], re.MULTILINE)
        if next_h2:
            block = block[:match.end() - match.start() + next_h2.start()]
        yield match.group(1), block


def evaluate(block: str) -> dict[str, bool]:
    return {
        "explanation": len(re.findall(r"\b\w+\b", block)) >= 90,
        "code": bool(re.search(r"^```(?!mermaid)", block, re.MULTILINE)),
        "visual": "```mermaid" in block or "Diagrama:" in block,
        "filePath": bool(re.search(r"(?:src/|lib/|app/|\.github/|[\w-]+\.(?:ts|tsx|js|java|kt|swift|dart|py|tf|ya?ml|json))", block)),
        "runCommand": bool(re.search(r"\b(npm|npx|node|python|java|gradle|mvn|flutter|swift|docker|kubectl|terraform|aws)\b", block, re.IGNORECASE)),
        "expectedResult": bool(re.search(r"(resultado esperado|salida esperada|debe mostrar|verifica)", block, re.IGNORECASE)),
        "practice": bool(re.search(r"(práctica|ejercicio|laboratorio|predice|modifica)", block, re.IGNORECASE)),
        "project": "RutaFlow" in block,
    }


def build() -> dict:
    tracks: dict[str, list[dict]] = defaultdict(list)
    for path in sorted(CONTENT.glob("*/modulo-*.md")):
        module = int(re.search(r"\d+", path.stem).group())
        for title, block in topic_blocks(path.read_text(encoding="utf-8")):
            tracks[path.parent.name].append({"module": module, "topic": title, "criteria": evaluate(block)})
    summary = {}
    for track, topics in sorted(tracks.items()):
        counts = Counter()
        for topic in topics:
            counts.update(name for name, passed in topic["criteria"].items() if passed)
        summary[track] = {"topics": len(topics), **{name: counts[name] for name in next(iter(topics))["criteria"]}}
    return {"criteria": ["explanation", "code", "visual", "filePath", "runCommand", "expectedResult", "practice", "project"], "summary": summary, "topics": tracks}


def render_markdown(data: dict) -> str:
    lines = ["# Auditoría pedagógica tema por tema", "", "Esta auditoría mide el contenido editorial real. El lector completa en pantalla las rutas, comandos, resultado esperado, práctica y gráfico conceptual que falten, pero el informe conserva la deuda del Markdown para orientar la revisión humana.", "", "| Track | Temas | Explicación | Código | Gráfico | Ruta | Ejecución | Resultado | Práctica | Proyecto |", "|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|"]
    for track, row in data["summary"].items():
        lines.append(f"| {track} | {row['topics']} | {row['explanation']} | {row['code']} | {row['visual']} | {row['filePath']} | {row['runCommand']} | {row['expectedResult']} | {row['practice']} | {row['project']} |")
    total = {key: sum(row[key] for row in data["summary"].values()) for key in ["topics", *data["criteria"]]}
    lines.append(f"| **Total** | **{total['topics']}** | **{total['explanation']}** | **{total['code']}** | **{total['visual']}** | **{total['filePath']}** | **{total['runCommand']}** | **{total['expectedResult']}** | **{total['practice']}** | **{total['project']}** |")
    lines.extend(["", "## Cobertura garantizada por el lector", "", "Los 1.201 temas reciben en tiempo de ejecución una guía de cuatro pasos con ruta de archivo, ubicación dentro del proyecto, comando, resultado esperado y práctica. Cuando el Markdown no posee código, el lector añade un punto de partida específico para el lenguaje del track; cuando no posee diagrama, añade un mapa concepto → aplicación → evidencia.", ""])
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(); parser.add_argument("--check", action="store_true"); args = parser.parse_args()
    data = build(); json_text = json.dumps(data, ensure_ascii=False, indent=2) + "\n"; md_text = render_markdown(data)
    if args.check:
        if not JSON_REPORT.exists() or JSON_REPORT.read_text(encoding="utf-8") != json_text or not MD_REPORT.exists() or MD_REPORT.read_text(encoding="utf-8") != md_text:
            raise SystemExit("La auditoría tema por tema está desactualizada")
    else:
        JSON_REPORT.write_text(json_text, encoding="utf-8"); MD_REPORT.write_text(md_text, encoding="utf-8")
    count = sum(row["topics"] for row in data["summary"].values())
    if count != 1201: raise SystemExit(f"Se esperaban 1201 temas; se encontraron {count}")
    print(f"Auditoría pedagógica detallada OK: {count} temas en {len(data['summary'])} tracks")


if __name__ == "__main__": main()
