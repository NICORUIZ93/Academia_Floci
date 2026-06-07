#!/usr/bin/env python3
"""Genera el catalogo local de contenido educativo y documentacion traducida."""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "public/content/manifest.json"
DOCS = ROOT / "public/content/oficial-es"

CATEGORIES = {
    "configuration": "configuracion",
    "getting-started": "primeros pasos",
    "services": "servicios",
    "testcontainers": "testcontainers",
}


def document_title(path: Path) -> str:
    text = path.read_text(encoding="utf-8")
    match = re.search(r"^#\s+(.+?)\s*$", text, re.MULTILINE)
    if match:
        return re.sub(r"\s+\{#[^}]+\}$", "", match.group(1)).strip()
    return path.stem.replace("-", " ").title()


def main() -> None:
    existing = json.loads(MANIFEST.read_text(encoding="utf-8"))
    local = [item for item in existing if item.get("type") != "official"]
    translated = []

    for index, path in enumerate(sorted(DOCS.rglob("*.md"))):
        relative = path.relative_to(DOCS)
        section = relative.parts[0] if len(relative.parts) > 1 else "general"
        translated.append(
            {
                "id": f"official-es-{index}",
                "title": document_title(path),
                "category": CATEGORIES.get(section, "general"),
                "path": f"content/oficial-es/{relative.as_posix()}",
                "language": "Español latino",
                "type": "official",
            }
        )

    MANIFEST.write_text(
        json.dumps(local + translated, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Manifiesto generado: {len(local)} recursos locales + {len(translated)} capítulos traducidos")


if __name__ == "__main__":
    main()
