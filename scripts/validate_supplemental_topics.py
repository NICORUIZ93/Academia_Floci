#!/usr/bin/env python3
from pathlib import Path
import json,unicodedata
ROOT=Path(__file__).resolve().parents[1];path=ROOT/"docs/supplemental-track-topics.json";errors=[]
def fold(value):return "".join(c for c in unicodedata.normalize("NFD",value).lower() if unicodedata.category(c)!="Mn")
if not path.exists():errors.append("falta registro suplementario");data={"items":[]}
else:data=json.loads(path.read_text(encoding="utf-8"))
if data.get("listedRows",0)<200:errors.append(f"cobertura insuficiente: {data.get('listedRows',0)} filas")
for item in data.get("items",[]):
    content=ROOT/f"web/public/content/{item['track']}/modulo-{item['module']}.md"
    if not content.exists() or fold(item["topic"]) not in fold(content.read_text(encoding="utf-8")):errors.append(f"{item['track']}: falta {item['topic']}")
if errors:print("Suplemento académico FALLÓ:");[print(f"- {e}") for e in errors];raise SystemExit(1)
print(f"Suplemento académico OK: {data['listedRows']} filas trazadas a capítulos visibles.")
