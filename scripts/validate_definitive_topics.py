#!/usr/bin/env python3
"""Valida que cada fila definitiva apunte a contenido real y visible."""
from pathlib import Path
import json, unicodedata
ROOT=Path(__file__).resolve().parents[1]; registry=ROOT/"docs/definitive-track-topics.json"; errors=[]
def fold(value): return "".join(c for c in unicodedata.normalize("NFD",value).lower() if unicodedata.category(c)!="Mn")
if not registry.exists(): errors.append("falta docs/definitive-track-topics.json"); data={"items":[]}
else: data=json.loads(registry.read_text(encoding="utf-8"))
if data.get("listedRows",0)<200: errors.append(f"solo {data.get('listedRows',0)} filas de la lista definitiva")
if data.get("professionalExtensions")!=36: errors.append("se esperaban 36 extensiones profesionales")
for item in data.get("items",[]):
    path=ROOT/f"web/public/content/{item['track']}/modulo-{item['module']}.md"
    if not path.exists(): errors.append(f"{item['track']} · {item['topic']}: módulo ausente"); continue
    if fold(item["topic"]) not in fold(path.read_text(encoding="utf-8")): errors.append(f"{item['track']} · {item['topic']}: no visible en módulo {item['module']}")
if errors:
    print("Lista definitiva FALLÓ:"); [print(f"- {error}") for error in errors]; raise SystemExit(1)
print(f"Lista definitiva OK: {data['listedRows']} filas y {data['professionalExtensions']} extensiones trazadas a contenido visible.")
