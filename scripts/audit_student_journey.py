#!/usr/bin/env python3
"""Audita si una persona puede estudiar cada tema sin quedar bloqueada."""

from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web/public/content"
REPORT_JSON = ROOT / "docs/student-journey-audit.json"
REPORT_MD = ROOT / "docs/student-journey-audit.md"
TRACKS = (
    "foundations", "cloud", "devops", "javascript", "node", "angular", "react",
    "java", "spring-boot", "kotlin-multiplatform", "android", "ios", "flutter", "rutaflow",
)

CRITERIA = {
    "goal": r"objetivo|qu[eé] (?:vas a )?construir|entregable|meta",
    "prerequisites": r"requisitos previos|antes de comenzar|necesitas",
    "terms": r"conceptos clave|modelo mental|analog[ií]a|significa|se define",
    "code": r"^```(?!mermaid)",
    "location": r"(?:src/|lib/|app/|tests?/|examples/|[\w.-]+\.(?:ts|tsx|js|java|kt|swift|dart|py|tf|ya?ml|json|html|css))",
    "execution": r"\b(?:npm|npx|node|python3?|java|gradle|mvnw?|flutter|swift|docker|kubectl|terraform|aws|curl)\b",
    "expected": r"resultado esperado|salida esperada|debe (?:mostrar|imprimir|responder|aparecer)|verifica(?:r|ci[oó]n)?",
    "failure": r"error deliberado|provoca (?:un )?error|caso de fallo|haz que falle|rompe",
    "diagnosis": r"diagn[oó]st|errores comunes|si (?:ves|falla|no funciona|obtienes)|pista|corrige",
    "practice": r"pr[aá]ctica|ejercicio|laboratorio|predice|modifica|reto",
    "project": r"rutaflow|proyecto (?:integrador|propio|real|final|de tamaño real)|proyecto transversal",
    "proof": r"evidencia|r[uú]brica|criterio de (?:aceptaci[oó]n|finalizaci[oó]n)|demuestra",
    "transition": r"pr[oó]ximo(?:s)? paso|siguiente m[oó]dulo|a continuaci[oó]n|despu[eé]s aprender[aá]s|conecta con",
}


def structural_text(text: str) -> str:
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
        h2 = re.search(r"^##\s+", block_structure[match.end() - match.start():], re.MULTILINE)
        if h2:
            block = block[: match.end() - match.start() + h2.start()]
        yield match.group(1), block


def has(pattern: str, text: str) -> bool:
    return bool(re.search(pattern, text, re.IGNORECASE | re.MULTILINE))


def build_report() -> dict:
    result: dict[str, dict] = {}
    for track in TRACKS:
        paths = sorted((CONTENT / track).glob("modulo-*.md"), key=lambda p: int(re.search(r"\d+", p.stem).group()))
        module_ids = [int(re.search(r"\d+", path.stem).group()) for path in paths]
        expected_ids = list(range(module_ids[-1] + 1)) if module_ids else []
        installation = paths[0].read_text(encoding="utf-8") if paths else ""
        install_checks = {
            "windows": has(r"windows", installation),
            "macos": has(r"macos|macOS|homebrew", installation),
            "linux": has(r"linux|ubuntu|debian", installation),
            "versionCheck": has(r"--version|\s-v\b|doctor|version", installation),
            "firstRun": has(r"hola|hello|primer|localhost|run|ejecut", installation),
            "installRecovery": has(r"PATH|command not found|no se reconoce|si .*falla|si .*no funciona|errores comunes", installation),
        }
        topics = []
        counts = Counter()
        labs = 0
        verifiable_labs = 0
        for path in paths:
            module = int(re.search(r"\d+", path.stem).group())
            text = path.read_text(encoding="utf-8")
            if has(r"^##\s+Laboratorio", text):
                labs += 1
                if has(r"(?:\*\*)?(?:(?:La\s+)?(?:Verificaci[oó]n|Definici[oó]n de terminado|Criterio de aceptaci[oó]n|Resultado esperado)(?::|\s+(?:requiere|exige))|La entrega (?:incluye|contiene)|Entrega c[oó]digo)(?:\*\*)?", text):
                    verifiable_labs += 1
            for title, block in topic_blocks(text):
                checks = {name: has(pattern, block) for name, pattern in CRITERIA.items()}
                # Una definición excelente también necesita extensión para explicar decisiones y límites.
                checks["terms"] = checks["terms"] and len(re.findall(r"\b\w+\b", block)) >= 120
                missing = [name for name, passed in checks.items() if not passed]
                score = sum(checks.values())
                state = "practicable" if score >= 11 and all(checks[k] for k in ("terms", "code", "location", "execution", "practice")) else "explained" if checks["terms"] else "listed"
                topics.append({"module": module, "title": title, "state": state, "score": score, "missing": missing})
                counts.update(name for name, passed in checks.items() if passed)
        state_counts = Counter(topic["state"] for topic in topics)
        blockers = sorted(topics, key=lambda item: (item["score"], item["module"], item["title"]))[:15]
        result[track] = {
            "modules": len(paths),
            "sequenceComplete": module_ids == expected_ids,
            "missingModules": sorted(set(expected_ids) - set(module_ids)),
            "installation": install_checks,
            "topics": len(topics),
            "labs": labs,
            "verifiableLabs": verifiable_labs,
            "states": dict(state_counts),
            "criteria": {name: counts[name] for name in CRITERIA},
            "blockers": blockers,
        }
    return {"criteria": list(CRITERIA), "tracks": result}


def render(data: dict) -> str:
    lines = [
        "# Auditoría del recorrido del estudiante",
        "",
        "Esta auditoría simula el recorrido desde la instalación hasta la evidencia final. Un tema no es practicable si falta ejemplo, ubicación, ejecución o práctica, aunque tenga una explicación extensa.",
        "",
        "| Track | Módulos | Secuencia | Temas | Listados | Explicados | Practicables | Labs verificables | Error provocado | Diagnóstico | Transición |",
        "|---|---:|:---:|---:|---:|---:|---:|---:|---:|---:|---:|",
    ]
    for track, row in data["tracks"].items():
        states = row["states"]
        criteria = row["criteria"]
        lines.append(
            f"| {track} | {row['modules']} | {'Sí' if row['sequenceComplete'] else 'No'} | {row['topics']} | "
            f"{states.get('listed', 0)} | {states.get('explained', 0)} | {states.get('practicable', 0)} | {row['verifiableLabs']}/{row['labs']} | "
            f"{criteria['failure']} | {criteria['diagnosis']} | {criteria['transition']} |"
        )
    lines.extend(["", "## Instalación y primera ejecución", "", "| Track | Windows | macOS | Linux | Versión | Primera ejecución | Recuperación |", "|---|:---:|:---:|:---:|:---:|:---:|:---:|"])
    for track, row in data["tracks"].items():
        install = row["installation"]
        mark = lambda key: "Sí" if install[key] else "No"
        lines.append(f"| {track} | {mark('windows')} | {mark('macos')} | {mark('linux')} | {mark('versionCheck')} | {mark('firstRun')} | {mark('installRecovery')} |")
    lines.extend(["", "## Bloqueos prioritarios por track", ""])
    for track, row in data["tracks"].items():
        lines.append(f"### {track}")
        lines.append("")
        for item in row["blockers"][:5]:
            lines.append(f"- Módulo {item['module']} · {item['title']} — {item['score']}/{len(CRITERIA)}; falta: {', '.join(item['missing'])}")
        lines.append("")
    return "\n".join(lines)


def main() -> None:
    data = build_report()
    REPORT_JSON.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    REPORT_MD.write_text(render(data) + "\n", encoding="utf-8")
    topics = sum(row["topics"] for row in data["tracks"].values())
    print(f"Recorrido auditado: {topics} temas en {len(data['tracks'])} tracks")


if __name__ == "__main__":
    main()
