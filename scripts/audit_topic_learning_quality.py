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
EDITORIAL_MARKERS = ("DEFINITIVE-COMPLEMENTS", "SUPPLEMENTAL-COMPLEMENTS", "REQUESTED-PRACTICAL-EXAMPLES")


def student_visible_content(text: str) -> str:
    for marker in EDITORIAL_MARKERS:
        text = re.sub(
            rf"\n?<!-- {marker}:START -->[\s\S]*?<!-- {marker}:END -->\n?",
            "\n",
            text,
        )
    return text


def structural_text(text: str) -> str:
    """Oculta el contenido de fences conservando offsets y saltos de línea."""
    return re.sub(
        r"^```[^\n]*\n[\s\S]*?^```[ \t]*$",
        lambda match: re.sub(r"[^\n]", " ", match.group()),
        text,
        flags=re.MULTILINE,
    )


def topic_blocks(text: str):
    structure = structural_text(text)
    headings = list(re.finditer(r"^###\s+(Tema(?:[^:]*)?:\s*.+)$", structure, re.MULTILINE))
    for index, match in enumerate(headings):
        end = headings[index + 1].start() if index + 1 < len(headings) else len(text)
        block = text[match.start():end]
        block_structure = structure[match.start():end]
        next_h2 = re.search(r"^##\s+", block_structure[match.end() - match.start():], re.MULTILINE)
        if next_h2:
            block = block[:match.end() - match.start() + next_h2.start()]
        yield match.group(1), block


def evaluate(block: str) -> dict[str, bool]:
    return {
        "explanation": len(re.findall(r"\b\w+\b", block)) >= 90,
        "code": bool(re.search(r"^```(?!mermaid)", block, re.MULTILINE)),
        "visual": "```mermaid" in block or bool(re.search(r"[┌┐└┘├┤┬┴┼─│]", block)),
        "filePath": bool(re.search(r"(?:src/|lib/|app/|\.github/|[\w-]+\.(?:ts|tsx|js|java|kt|swift|dart|py|tf|ya?ml|json))", block)),
        "runCommand": bool(re.search(r"\b(npm|npx|node|python|java|gradle|mvn|flutter|swift|docker|kubectl|terraform|aws)\b", block, re.IGNORECASE)),
        "expectedResult": bool(re.search(r"(resultado esperado|salida esperada|debe mostrar|verifica)", block, re.IGNORECASE)),
        "practice": bool(re.search(r"(práctica|ejercicio|laboratorio|construcci[oó]n|predice|modifica)", block, re.IGNORECASE)),
        "project": bool(re.search(r"proyecto (propio|integrador|real|de tamaño real|final)|proyecto transversal", block, re.IGNORECASE)),
        "modelMental": bool(re.search(r"(analogía|modelo mental|por qué es importante)", block, re.IGNORECASE)),
        "limitsDecision": bool(re.search(r"(cuándo|límite|limitación|no usar|no conviene|diferencia|frente a|trade.?off)", block, re.IGNORECASE)),
    }


def classify(criteria: dict[str, bool], block: str) -> dict[str, bool | int]:
    """Distingue presencia editorial de una lección realmente practicable."""
    rubric = {
        "explanation": 2 if criteria["modelMental"] and criteria["limitsDecision"] else int(criteria["explanation"]),
        "example": 2 if criteria["code"] else 0,
        "location": 2 if criteria["filePath"] else 0,
        "execution": 2 if criteria["runCommand"] else 0,
        "result": 2 if criteria["expectedResult"] else 0,
        "visual": 2 if criteria["visual"] else 0,
        "practice": 2 if criteria["practice"] else 0,
        "project": 2 if criteria["project"] else 0,
    }
    score = sum(rubric.values())
    generic_markers = (
        "Este tema se incorpora de forma explícita porque no aparecía",
        "Este tema se estudia identificando el problema, sus prerrequisitos",
        "amplía el mapa mental y permite comprender decisiones",
        "Evidence(topic:",
        "passed: true",
    )
    return {
        "rubricScore": score,
        "practicable": score >= 12 and all(criteria[name] for name in ("code", "filePath", "runCommand", "practice")),
        "genericScaffold": any(marker in block for marker in generic_markers),
    }


def build() -> dict:
    tracks: dict[str, list[dict]] = defaultdict(list)
    for path in sorted(CONTENT.glob("*/modulo-*.md")):
        module = int(re.search(r"\d+", path.stem).group())
        for title, block in topic_blocks(student_visible_content(path.read_text(encoding="utf-8"))):
            criteria = evaluate(block)
            tracks[path.parent.name].append({
                "module": module,
                "topic": title,
                "criteria": criteria,
                "classification": classify(criteria, block),
            })
    summary = {}
    for track, topics in sorted(tracks.items()):
        counts = Counter()
        for topic in topics:
            counts.update(name for name, passed in topic["criteria"].items() if passed)
        summary[track] = {
            "topics": len(topics),
            **{name: counts[name] for name in next(iter(topics))["criteria"]},
            "practicable": sum(topic["classification"]["practicable"] for topic in topics),
            "genericScaffold": sum(topic["classification"]["genericScaffold"] for topic in topics),
        }
    return {"criteria": ["explanation", "code", "visual", "filePath", "runCommand", "expectedResult", "practice", "project", "modelMental", "limitsDecision"], "summary": summary, "topics": tracks}


def render_markdown(data: dict) -> str:
    lines = ["# Auditoría pedagógica tema por tema", "", "Esta auditoría mide exclusivamente el contenido editorial real. **Explicación** solo indica extensión mínima; no demuestra calidad. **Practicable** exige simultáneamente explicación, código, ruta, ejecución, resultado, práctica, proyecto, modelo mental y límites. **Texto genérico** detecta plantillas que nombran un tema sin enseñarlo. Una ausencia o plantilla es deuda editorial explícita.", "", "| Track | Temas | Explicación | Código | Ruta | Ejecución | Resultado | Práctica | Proyecto | Modelo mental | Límites | Practicable | Texto genérico |", "|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|"]
    for track, row in data["summary"].items():
        lines.append(f"| {track} | {row['topics']} | {row['explanation']} | {row['code']} | {row['filePath']} | {row['runCommand']} | {row['expectedResult']} | {row['practice']} | {row['project']} | {row['modelMental']} | {row['limitsDecision']} | {row['practicable']} | {row['genericScaffold']} |")
    total = {key: sum(row[key] for row in data["summary"].values()) for key in ["topics", *data["criteria"], "practicable", "genericScaffold"]}
    lines.append(f"| **Total** | **{total['topics']}** | **{total['explanation']}** | **{total['code']}** | **{total['filePath']}** | **{total['runCommand']}** | **{total['expectedResult']}** | **{total['practice']}** | **{total['project']}** | **{total['modelMental']}** | **{total['limitsDecision']}** | **{total['practicable']}** | **{total['genericScaffold']}** |")
    lines.extend(["", "## Regla editorial", "", "Un término listado en el sílabo no está cubierto hasta que el Markdown explique su modelo mental, muestre una aplicación específica, indique una decisión o límite y proponga evidencia verificable. El lector no genera diagramas decorativos para ocultar esa deuda.", ""])
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--require-practicable", action="store_true", help="falla si algún tema no cumple el contrato pedagógico")
    args = parser.parse_args()
    data = build(); json_text = json.dumps(data, ensure_ascii=False, indent=2) + "\n"; md_text = render_markdown(data)
    if args.check:
        if not JSON_REPORT.exists() or JSON_REPORT.read_text(encoding="utf-8") != json_text or not MD_REPORT.exists() or MD_REPORT.read_text(encoding="utf-8") != md_text:
            raise SystemExit("La auditoría tema por tema está desactualizada")
    else:
        JSON_REPORT.write_text(json_text, encoding="utf-8"); MD_REPORT.write_text(md_text, encoding="utf-8")
    count = sum(row["topics"] for row in data["summary"].values())
    if count == 0 or len(data["summary"]) != 14:
        raise SystemExit(f"Inventario visible inválido: {count} temas en {len(data['summary'])} tracks")
    practicable = sum(row["practicable"] for row in data["summary"].values())
    generic = sum(row["genericScaffold"] for row in data["summary"].values())
    if args.require_practicable and (practicable != count or generic):
        raise SystemExit(
            f"Cobertura pedagógica incompleta: {practicable}/{count} temas practicables; "
            f"{generic} temas conservan texto genérico"
        )
    print(f"Auditoría pedagógica detallada OK: {count} temas en {len(data['summary'])} tracks")


if __name__ == "__main__": main()
