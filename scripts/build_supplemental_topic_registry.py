#!/usr/bin/env python3
"""Integra la lista académica suplementaria y el mapa transversal de CS."""
from pathlib import Path
import argparse,json,re,unicodedata

ROOT=Path(__file__).resolve().parents[1]; CONTENT=ROOT/"web/public/content"
MASTER={"cloud":33,"devops":15,"javascript":14,"node":14,"java":15,"spring-boot":15,"angular":15,"react":14,"kotlin-multiplatform":13,"android":14,"ios":14,"flutter":15,"foundations":11}
ORDER=["cloud","devops","javascript","node","java","spring-boot","angular","react","kotlin-multiplatform","android","ios","flutter"]
START="<!-- SUPPLEMENTAL-COMPLEMENTS:START -->";END="<!-- SUPPLEMENTAL-COMPLEMENTS:END -->"
def fold(value):return "".join(c for c in unicodedata.normalize("NFD",value).lower() if unicodedata.category(c)!="Mn")
def module_id(path):
    match=re.search(r"modulo-(\d+)\.md$",path.name);return int(match.group(1)) if match else -1

parser=argparse.ArgumentParser();parser.add_argument("source",type=Path);args=parser.parse_args()
items=[];current=None;track_index=-1
for raw in args.source.read_text(encoding="utf-8").splitlines():
    line=raw.strip()
    if "TEMAS DE CIENCIAS DE LA COMPUTACIÓN" in line:current="foundations";continue
    heading=re.search(r"TRACK\s+(\d+):",line,re.I)
    if heading:track_index=int(heading.group(1))-1;current=ORDER[track_index] if 0<=track_index<len(ORDER) else None;continue
    if line.startswith(("📊","🎯","📚")):current=None;continue
    parts=[part.strip() for part in line.split("\t")]
    if current and len(parts)==3 and parts[0] not in {"Tema","Track"} and not parts[0].startswith("~"):
        items.append({"track":current,"topic":parts[0],"description":parts[1],"academicSource":parts[2]})

for track in MASTER:
    track_items=[item for item in items if item["track"]==track]
    corpus=[(path,path.read_text(encoding="utf-8")) for path in sorted((CONTENT/track).glob("modulo-*.md"),key=module_id)]
    missing=[]
    for item in track_items:
        found=next((path for path,text in corpus if fold(item["topic"]) in fold(text)),None)
        item["module"]=module_id(found) if found else MASTER[track];item["status"]="desarrollado" if found else "complementado"
        if not found:missing.append(item)
    path=CONTENT/track/f"modulo-{MASTER[track]}.md"
    if track=="foundations" and not path.exists():
        path.write_text("""# Módulo 11: Ciencias de la Computación: mapa de especializaciones

## Sílabo

**Objetivo general:** comprender el mapa de Ciencias de la Computación, sus relaciones y prerrequisitos mediante experimentos reproducibles antes de elegir una especialización.

## Contenido teórico

## Criterio transversal de calidad del código

Usa nombres claros, errores explícitos y pruebas reproducibles. Aplica SOLID solo cuando reduzca el coste de cambiar; no abstraer sin presión real. Distingue evidencia, inferencia y opinión.

## Laboratorio práctico

Crea un portafolio con un experimento de sistemas, teoría, datos, inteligencia artificial, cómputo visual y práctica profesional. Registra hipótesis, implementación, medición, límites y siguiente prerrequisito.

## Ejercicios de evaluación

### Ejercicio 1: mapa de prerrequisitos

Dibuja dependencias entre matemáticas, algoritmos, sistemas, datos e inteligencia artificial.

### Ejercicio 2: experimento reproducible

Implementa dos áreas y compara sus métodos de validación.

### Ejercicio 3: responsabilidad profesional

Analiza impacto, privacidad, accesibilidad, energía y riesgo de una solución.

## Rúbrica del proyecto

| Criterio | Inicial | Competente | Experto |
|---|---|---|---|
| Fundamento | Enumera áreas | Explica relaciones | Justifica prerrequisitos y límites |
| Evidencia | Captura | Experimento | Reproducción, medición y crítica |
| Práctica | Código aislado | Dos áreas | Portafolio interdisciplinario |

## Bibliografía y fundamento académico

- ACM/IEEE-CS/AAAI CS2023 y SWEBOK V4.
- Planes académicos citados en la lista suplementaria.
- NIST SSDF, OWASP y W3C cuando corresponda.

## Resumen del módulo

El mapa evita confundir una ruta de herramientas con toda la disciplina y permite elegir una especialización con fundamento.
""",encoding="utf-8")
    text=path.read_text(encoding="utf-8");sections=[]
    for item in missing:
        sections.append(f"""### Tema suplementario: {item['topic']}

**Conceptos clave:** {item['description']}.

La fuente académica señalada es **{item['academicSource']}**. Este tema se estudia identificando el problema, sus prerrequisitos, un modelo mínimo, un experimento y las limitaciones de la evidencia. En RutaFlow se conecta con una decisión concreta de producto, datos, plataforma u operación, evitando agregar tecnología sin necesidad verificable.

**Analogía:** es una asignatura dentro de un programa universitario: aporta una perspectiva específica y necesita conectarse con las demás para formar criterio profesional.

**¿Por qué es importante?** Porque {item['topic']} amplía el mapa mental y permite comprender decisiones que una guía centrada únicamente en frameworks no explica.

**Casos de uso reales:** diseño inicial, restricción de recursos, entrada inválida, fallo parcial, impacto humano y revisión posterior mediante métricas.

**Práctica breve:** construye un ejemplo pequeño, formula una hipótesis, mide el resultado, registra una amenaza o sesgo y explica qué conocimiento adicional necesitarías para usarlo en producción.
""")
    block=f"""{START}
## Ampliación académica suplementaria

Esta sección incorpora los elementos de la nueva auditoría que no aparecían literalmente en el currículo. Cada uno se conecta con fundamento, práctica y evidencia.

{''.join(sections) if sections else 'No se detectaron brechas nominales nuevas.'}
{END}
"""
    if START in text:
        before,rest=text.split(START,1);_,after=rest.split(END,1);text=before.rstrip()+"\n\n"+block+after
    else:text=text.replace("## Resumen del módulo",block+"\n## Resumen del módulo")
    path.write_text(text,encoding="utf-8")

data={"sourceTitle":"Temas avanzados y académicos suplementarios","listedRows":len(items),"items":items}
(ROOT/"docs/supplemental-track-topics.json").write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(f"Registro suplementario: {len(items)} filas; {sum(1 for x in items if x['status']=='complementado')} complementos añadidos")
