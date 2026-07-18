#!/usr/bin/env python3
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / "docs/requested-practical-examples.json").read_text(encoding="utf-8"))
errors = []
if data.get("listedRows") != 214:
    errors.append(f"se esperaban 214 filas, existen {data.get('listedRows')}")
for item in data.get("items", []):
    path = ROOT / f"web/public/content/{item['track']}/modulo-{item['module']}.md"
    text = path.read_text(encoding="utf-8") if path.exists() else ""
    heading = f"### Ejemplo guiado: {item['topic']}"
    if heading not in text:
        errors.append(f"falta ejemplo: {item['track']} / {item['topic']}")
    elif text.split(heading, 1)[1].split("### ", 1)[0].count("```") < 2:
        errors.append(f"ejemplo sin código: {item['track']} / {item['topic']}")
if errors:
    print("Ejemplos solicitados FALLÓ:")
    for error in errors[:30]: print(f"- {error}")
    raise SystemExit(1)
print(f"Ejemplos solicitados OK: {data['listedRows']} temas con práctica y código.")
