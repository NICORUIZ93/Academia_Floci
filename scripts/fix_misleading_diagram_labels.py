#!/usr/bin/env python3
"""Corrige etiquetas 'Diagrama' que en realidad presentan código o comandos."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web/public/content"
TRACKS = (
    "foundations", "cloud", "devops", "javascript", "node", "angular", "react",
    "java", "spring-boot", "kotlin-multiplatform", "android", "ios", "flutter", "rutaflow",
)
TERMINAL = {"bash", "sh", "shell", "powershell", "zsh"}
DATA = {"json", "yaml", "yml", "xml", "sql", "prisma"}
PATTERN = re.compile(r"\*\*Diagrama:\*\*(\s*\n\s*```(?P<language>[a-zA-Z0-9_-]+)\s*\n)")


def replace(match: re.Match[str]) -> str:
    language = match.group("language").lower()
    if language == "mermaid" or language == "text":
        return match.group(0)
    label = "Prueba en terminal" if language in TERMINAL else "Configuración del ejemplo" if language in DATA else "Código del ejemplo"
    return f"**{label}:**{match.group(1)}"


def main() -> None:
    changed_files = changed_labels = 0
    for track in TRACKS:
        for path in (CONTENT / track).glob("modulo-*.md"):
            source = path.read_text(encoding="utf-8")
            updated, count = PATTERN.subn(replace, source)
            if count and updated != source:
                path.write_text(updated, encoding="utf-8")
                changed_files += 1
                changed_labels += count
    print(f"Etiquetas corregidas: {changed_labels} en {changed_files} capítulos")


if __name__ == "__main__":
    main()
