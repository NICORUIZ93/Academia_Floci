#!/usr/bin/env python3
"""Convierte la lista definitiva en cobertura trazable y completa brechas nominales."""
from pathlib import Path
import argparse, json, re, unicodedata

ROOT=Path(__file__).resolve().parents[1]
CONTENT=ROOT/"web/public/content"
MASTER={"cloud":33,"devops":15,"javascript":14,"node":14,"java":15,"spring-boot":15,"angular":15,"react":14,"kotlin-multiplatform":13,"android":14,"ios":14,"flutter":15}
HEADINGS={"CLOUD":"cloud","DEVOPS":"devops","JAVASCRIPT":"javascript","NODE.JS":"node","ANGULAR":"angular","REACT":"react","JAVA AVANZADO":"java","KOTLIN MULTIPLATFORM":"kotlin-multiplatform","ANDROID (JETPACK COMPOSE)":"android","IOS (SWIFTUI)":"ios","FLUTTER":"flutter"}
EXTRA={
"cloud":[("Sostenibilidad cloud","carbon-aware computing, eficiencia energética y eliminación de recursos ociosos"),("Policy as Code","controles preventivos con OPA, Sentinel o políticas nativas"),("Arquitectura de plataforma","landing zones, golden paths y autoservicio gobernado")],
"devops":[("Platform Engineering","portales internos, golden paths y experiencia de desarrollo"),("eBPF y observabilidad de kernel","telemetría de red y runtime con límites de seguridad"),("Ingeniería de releases","feature flags, canary, blue-green y rollback automatizado")],
"javascript":[("WebGPU","cómputo y gráficos modernos con detección de capacidades"),("Privacidad en navegador","permissions, storage partitioning y minimización"),("Web Components","custom elements, shadow DOM y contratos interoperables")],
"node":[("Contratos y compatibilidad","OpenAPI, schema evolution y consumer-driven contracts"),("Diagnóstico de runtime","heap snapshots, flame graphs y diagnostics_channel"),("Protección ante abuso","rate limits, cuotas, backpressure y load shedding")],
"java":[("Java Memory Model","happens-before, visibilidad y publicación segura"),("Flight Recorder y JFR","profiling continuo de bajo overhead"),("Foreign Function and Memory API","interop nativo con memoria acotada")],
"spring-boot":[("Observabilidad OpenTelemetry","trazas, métricas, baggage y cardinalidad"),("Contratos evolutivos","OpenAPI, Spring Cloud Contract y compatibilidad"),("Consistencia distribuida","idempotencia, optimistic locking y reconciliación")],
"angular":[("Accesibilidad Angular","CDK a11y, foco, live regions y auditoría"),("Seguridad del navegador","sanitización, CSP y Trusted Types"),("Diseño de sistemas frontend","design tokens, librerías y documentación visual")],
"react":[("React Compiler","optimización automática y reglas de pureza"),("Seguridad de React Server Components","serialización, autorización y supply chain"),("Observabilidad frontend","Web Vitals, errores, trazas y release health")],
"kotlin-multiplatform":[("Compatibilidad binaria","API validation, versionado y migración"),("Wasm target","límites y distribución para navegador"),("Observabilidad compartida","correlación, crash symbols y privacidad")],
"android":[("Offline-first y sincronización","outbox, conflictos e idempotencia"),("Energía y background","WorkManager, foreground services y batería"),("Baseline Profiles y Macrobenchmark","startup, jank y regresiones por release")],
"ios":[("Observation y Swift Concurrency estricta","aislamiento, Sendable y MainActor"),("Privacidad y Data Protection","Keychain, entitlements y retención"),("MetricKit y signposts","rendimiento, hangs y diagnóstico por versión")],
"flutter":[("Isolates y presupuesto de frames","trabajo CPU-bound, jank y medición"),("Seguridad de plugins","permisos, platform channels y supply chain"),("Offline-first resiliente","outbox, conflictos, reintentos e idempotencia")],
}
START="<!-- DEFINITIVE-COMPLEMENTS:START -->"; END="<!-- DEFINITIVE-COMPLEMENTS:END -->"

def clean(value): return " ".join(value.strip().split())
def fold(value): return "".join(c for c in unicodedata.normalize("NFD",value).lower() if unicodedata.category(c)!="Mn")
def module_number(path):
    match=re.search(r"modulo-(\d+)\.md$",path.name); return int(match.group(1)) if match else -1

parser=argparse.ArgumentParser(); parser.add_argument("source",type=Path); args=parser.parse_args()
lines=args.source.read_text(encoding="utf-8").splitlines(); items=[]; current=None; level=""
for line in lines:
    heading=re.search(r"TRACK\s+\d+:\s*(.+)",line,re.I)
    if heading:
        name=clean(re.sub(r"\s*\(.*basado.*$","",heading.group(1),flags=re.I))
        current="java-spring" if "JAVA Y SPRING" in name.upper() else next((value for key,value in HEADINGS.items() if key in name.upper()),None)
        continue
    level_match=re.search(r"Nivel\s+(Básico|Intermedio|Avanzado|Master)",line,re.I)
    if level_match: level=level_match.group(1).capitalize(); continue
    row=re.match(r"^(\d+)\t([^\t]+)\t(.+)$",line)
    if not row or not current: continue
    number=int(row.group(1)); track=current
    if current=="java-spring": track="java" if number<=11 else "spring-boot"
    items.append({"track":track,"level":level,"position":number,"topic":clean(row.group(2)),"description":clean(row.group(3)),"source":"lista-definitiva"})

for track,extras in EXTRA.items():
    for topic,description in extras: items.append({"track":track,"level":"Master","position":None,"topic":topic,"description":description,"source":"extensión-profesional"})

grouped={track:[] for track in MASTER}
for item in items:
    if item["track"] in grouped: grouped[item["track"]].append(item)

for track,track_items in grouped.items():
    files=sorted((CONTENT/track).glob("modulo-*.md"),key=module_number)
    corpus=[(path,path.read_text(encoding="utf-8")) for path in files]
    missing=[]
    for item in track_items:
        found=next((path for path,text in corpus if fold(item["topic"]) in fold(text)),None)
        if found: item["module"]=module_number(found); item["status"]="desarrollado"
        else: item["module"]=MASTER[track]; item["status"]="complementado"; missing.append(item)
    path=CONTENT/track/f"modulo-{MASTER[track]}.md"; text=path.read_text(encoding="utf-8")
    sections=[]
    for item in missing:
        sections.append(f"""### Tema complementario: {item['topic']}

**Conceptos clave:** {item['description']}.

Este tema se incorpora de forma explícita porque no aparecía con el mismo nombre en el currículo visible. Estúdialo identificando propósito, entradas, salida observable, límites, amenaza y coste de operación. Construye un ejemplo mínimo conectado con RutaFlow y compara una alternativa antes de añadir una dependencia.

**Analogía:** es una pieza del sistema logístico que solo aporta valor cuando se conecta con un proceso, una responsabilidad y una señal verificable.

**¿Por qué es importante?** Porque reconocer `{item['topic']}` no demuestra dominio; debes aplicarlo, provocar un fallo y explicar cuándo no conviene utilizarlo.

**Casos de uso reales:** camino feliz, configuración inválida, dato tardío, acceso no autorizado y recuperación tras una dependencia indisponible.

**Práctica breve:** implementa una capacidad pequeña, escribe una prueba de éxito y otra de fallo, registra una métrica y documenta la decisión en un ADR.
""")
    block=f"""{START}
## Complementos de la lista definitiva

Las siguientes capacidades no aparecían literalmente en el índice previo. Se incorporan con el mismo criterio del capítulo: fundamento, aplicación en RutaFlow, fallo deliberado y evidencia reproducible.

{''.join(sections) if sections else 'La auditoría no detectó brechas nominales adicionales en este track.'}
{END}
"""
    if START in text:
        before,rest=text.split(START,1); _,after=rest.split(END,1); text=before.rstrip()+"\n\n"+block+after
    else: text=text.replace("## Resumen del módulo",block+"\n## Resumen del módulo")
    path.write_text(text,encoding="utf-8")

registry={"sourceTitle":"Lista definitiva de temas por track","listedRows":sum(1 for x in items if x["source"]=="lista-definitiva"),"professionalExtensions":sum(1 for x in items if x["source"]=="extensión-profesional"),"items":items}
(ROOT/"docs/definitive-track-topics.json").write_text(json.dumps(registry,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(f"Registro definitivo: {registry['listedRows']} filas + {registry['professionalExtensions']} extensiones; {sum(1 for x in items if x['status']=='complementado')} complementos añadidos")
