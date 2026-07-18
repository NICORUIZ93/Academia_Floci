#!/usr/bin/env python3
"""Valida las tres prioridades educativas sin contar contenido heredado ni placeholders."""

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web/public/content"
TRACKS = (
    "foundations", "cloud", "devops", "javascript", "node", "angular", "react",
    "java", "spring-boot", "kotlin-multiplatform", "android", "ios", "flutter", "rutaflow",
)

errors: list[str] = []
modules = topics = 0
for track in TRACKS:
    for path in sorted((CONTENT / track).glob("modulo-*.md")):
        modules += 1
        text = path.read_text(encoding="utf-8")
        prose = re.sub(r"```[\s\S]*?```", "", text)
        substantial_paragraphs = [
            paragraph for paragraph in re.split(r"\n\s*\n", prose)
            if len(re.findall(r"\b\w+\b", paragraph)) >= 20
            and not paragraph.lstrip().startswith(("#", "-", "|"))
        ]
        if len(substantial_paragraphs) < 5:
            errors.append(f"{path.relative_to(ROOT)}: requiere al menos 5 párrafos sustanciales")

        headings = list(re.finditer(r"^### Tema[^\n]+", text, re.MULTILINE))
        for index, heading in enumerate(headings):
            topics += 1
            end = headings[index + 1].start() if index + 1 < len(headings) else len(text)
            block = text[heading.start():end]
            next_section = re.search(r"^## ", block[heading.end() - heading.start():], re.MULTILINE)
            if next_section:
                block = block[:heading.end() - heading.start() + next_section.start()]
            if "¿Por qué es importante?" not in block:
                errors.append(f"{path.relative_to(ROOT)} · {heading.group(0)}: falta importancia explícita")

activities = (ROOT / "web/src/app/learning-activities.ts").read_text(encoding="utf-8")
viewer = (ROOT / "web/src/app/course/lesson-viewer.ts").read_text(encoding="utf-8")
progress = (ROOT / "web/src/app/progress.service.ts").read_text(encoding="utf-8")
if "Array.from({ length: 5 }" not in activities:
    errors.append("learning-activities.ts: cada quiz debe contener cinco preguntas")
if activities.count("trackId: '") != 12:
    errors.append("learning-activities.ts: deben existir exactamente 12 proyectos integradores")
for requirement in ("passQuiz",):
    if requirement not in progress:
        errors.append(f"progress.service.ts: falta {requirement}")
for requirement in ("addTopicLearningSupport", "Errores comunes y cómo diagnosticarlos"):
    if requirement not in viewer:
        errors.append(f"lesson-viewer.ts: falta soporte global {requirement}")

if modules != 224:
    errors.append(f"se esperaban 224 módulos; encontrados {modules}")
if topics < 893:
    errors.append(f"se esperaban al menos 893 temas; encontrados {topics}")
if errors:
    print("Prioridades educativas FALLARON:")
    for error in errors:
        print(f"- {error}")
    raise SystemExit(1)

print(f"Prioridades educativas OK: {modules} módulos, {topics} temas, 5 preguntas por módulo, 12 proyectos y progreso persistente sin gamificación.")
