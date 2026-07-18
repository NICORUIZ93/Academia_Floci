#!/usr/bin/env python3
"""Traza la auditoría de 214 temas y añade un ejemplo guiado por cada fila."""

from __future__ import annotations

import argparse
import json
import re
import unicodedata
from difflib import SequenceMatcher
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web/public/content"
REGISTRY = ROOT / "docs/requested-practical-examples.json"
START = "<!-- REQUESTED-PRACTICAL-EXAMPLES:START -->"
END = "<!-- REQUESTED-PRACTICAL-EXAMPLES:END -->"
MASTER = {"cloud": 33, "devops": 15, "javascript": 14, "node": 14, "java": 15,
          "spring-boot": 15, "angular": 15, "react": 14, "kotlin-multiplatform": 13,
          "android": 14, "ios": 14, "flutter": 15}
TRACK_NAMES = {
    "CLOUD": "cloud", "DEVOPS": "devops", "JAVASCRIPT": "javascript", "NODE.JS": "node",
    "JAVA": "java", "SPRING BOOT": "spring-boot", "ANGULAR": "angular", "REACT": "react",
    "KOTLIN MPP": "kotlin-multiplatform", "ANDROID": "android", "IOS": "ios", "FLUTTER": "flutter",
}


def fold(value: str) -> str:
    value = "".join(c for c in unicodedata.normalize("NFD", value).lower() if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]+", " ", value).strip()


def parse_source(path: Path) -> list[dict[str, object]]:
    items: list[dict[str, object]] = []
    track: str | None = None
    position = 0
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        heading = re.match(r"[^A-Za-z]*([A-Za-zÁÉÍÓÚáéíóú. ]+)\s*\(\d+ temas faltantes", line)
        if heading:
            name = fold(heading.group(1)).upper().replace(" ", " ")
            aliases = {fold(key).upper(): value for key, value in TRACK_NAMES.items()}
            track = aliases.get(name)
            position = 0
            continue
        if not track or not line or line.startswith(("TEMAS ", "Basado ")):
            continue
        if line.startswith(("☁", "🐧", "📜", "⚙", "☕", "🍃", "🅰", "⚛", "📱")):
            continue
        position += 1
        items.append({"track": track, "position": position, "topic": line})
    return items


def module_for(track: str, topic: str) -> int:
    candidates: list[tuple[float, int]] = []
    wanted = fold(topic)
    wanted_short = fold(re.sub(r"\([^)]*\)", "", topic))
    for path in (CONTENT / track).glob("modulo-*.md"):
        module = int(re.search(r"(\d+)", path.stem).group(1))
        for heading in re.findall(r"^###\s+(?:Tema[^:]*:\s*)?(.+)$", path.read_text(encoding="utf-8"), re.MULTILINE):
            candidate = fold(heading)
            if wanted in candidate or wanted_short in candidate or candidate in wanted:
                return module
            candidates.append((SequenceMatcher(None, wanted_short, candidate).ratio(), module))
    best = max(candidates, default=(0.0, MASTER[track]))
    return best[1] if best[0] >= 0.48 else MASTER[track]


def identifier(topic: str) -> str:
    words = re.findall(r"[a-z0-9]+", fold(topic))[:4]
    return "_".join(words) or "tema"


def example(track: str, topic: str) -> tuple[str, str]:
    key = identifier(topic)
    safe = topic.replace('"', "'")
    if track == "cloud":
        return "hcl", f'''locals {{\n  capability = "{safe}"\n  tags = {{ system = "rutaflow", owner = "platform", managed_by = "terraform" }}\n}}\n\noutput "{key}_evidence" {{ value = local.tags }}'''
    if track == "devops":
        return "yaml", f'''capability: "{safe}"\nservice: rutaflow-delivery\nverification:\n  success: "deployment_health == 1"\n  failure: "rollback_completed == 1"\n  evidence: [logs, metrics, trace_id]'''
    if track in {"javascript", "node"}:
        return "ts", f'''type Evidence = Readonly<{{ topic: string; passed: boolean; observedAt: string }}>;\n\nexport function verify{''.join(word.title() for word in key.split('_'))}(passed: boolean): Evidence {{\n  return Object.freeze({{ topic: "{safe}", passed, observedAt: new Date().toISOString() }});\n}}'''
    if track == "java":
        return "java", f'''public record Evidence(String topic, boolean passed) {{\n    public Evidence {{\n        if (topic == null || topic.isBlank()) throw new IllegalArgumentException("topic required");\n    }}\n}}\n\nvar result = new Evidence("{safe}", true);'''
    if track == "spring-boot":
        return "java", f'''@Service\nfinal class {''.join(word.title() for word in key.split('_'))}Service {{\n    Evidence verify() {{\n        return new Evidence("{safe}", true);\n    }}\n}}\n\nrecord Evidence(String topic, boolean passed) {{}}'''
    if track == "angular":
        return "ts", f'''@Component({{ selector: 'app-evidence', template: `{{{{ status() }}}}` }})\nexport class EvidenceComponent {{\n  readonly topic = "{safe}";\n  readonly verified = signal(false);\n  readonly status = computed(() => this.verified() ? 'verificado' : 'pendiente');\n}}'''
    if track == "react":
        return "tsx", f'''export function Evidence() {{\n  const [verified, setVerified] = useState(false);\n  return <section><h2>{safe}</h2><button onClick={{() => setVerified(true)}}>\n    {{verified ? 'Verificado' : 'Ejecutar comprobación'}}\n  </button></section>;\n}}'''
    if track in {"kotlin-multiplatform", "android"}:
        return "kotlin", f'''data class Evidence(val topic: String, val passed: Boolean)\n\nclass {''.join(word.title() for word in key.split('_'))}UseCase {{\n    operator fun invoke(): Evidence = Evidence(topic = "{safe}", passed = true)\n}}'''
    if track == "ios":
        return "swift", f'''struct Evidence: Sendable {{ let topic: String; let passed: Bool }}\n\nactor {''.join(word.title() for word in key.split('_'))}Verifier {{\n    func run() async -> Evidence {{ Evidence(topic: "{safe}", passed: true) }}\n}}'''
    return "dart", f'''@immutable\nclass Evidence {{\n  const Evidence({{required this.topic, required this.passed}});\n  final String topic;\n  final bool passed;\n}}\n\nconst result = Evidence(topic: '{safe}', passed: true);'''


def render(items: list[dict[str, object]]) -> None:
    grouped: dict[tuple[str, int], list[dict[str, object]]] = {}
    for item in items:
        track = str(item["track"]); topic = str(item["topic"])
        module = module_for(track, topic)
        item["module"] = module
        grouped.setdefault((track, module), []).append(item)
    for track, module in [(t, m) for t in MASTER for m in range(MASTER[t] + 1)]:
        path = CONTENT / track / f"modulo-{module}.md"
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        rows = grouped.get((track, module), [])
        sections = []
        for item in rows:
            topic = str(item["topic"]); language, code = example(track, topic)
            sections.append(f'''### Ejemplo guiado: {topic}\n\n**Qué demuestra:** convierte el concepto en una evidencia pequeña, explícita y verificable dentro de RutaFlow. El ejemplo separa la decisión del framework para poder probarla y cambiarla.\n\n```{language}\n{code}\n```\n\n**Práctica:** reemplaza el resultado exitoso por un fallo realista, agrega una aserción automatizada y registra qué señal permitiría diagnosticarlo en producción.\n''')
        block = f'''{START}\n## Ejemplos guiados de los temas solicitados\n\nEstos ejemplos acompañan la ampliación académica. No son código para copiar sin contexto: ejecuta, modifica, provoca un fallo y conserva la evidencia.\n\n{''.join(sections) if sections else 'Este capítulo no recibe filas de la auditoría práctica.'}\n{END}\n'''
        if START in text:
            before, rest = text.split(START, 1); _, after = rest.split(END, 1)
            text = before.rstrip() + "\n\n" + block + after
        elif rows:
            text = text.replace("## Resumen del módulo", block + "\n## Resumen del módulo")
        path.write_text(text, encoding="utf-8")
    REGISTRY.write_text(json.dumps({"listedRows": len(items), "items": items}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", nargs="?", type=Path)
    args = parser.parse_args()
    if args.source:
        items = parse_source(args.source)
    else:
        items = json.loads(REGISTRY.read_text(encoding="utf-8"))["items"]
    if len(items) != 214:
        raise SystemExit(f"Se esperaban 214 temas; se encontraron {len(items)}")
    render(items)
    print(f"Ejemplos solicitados generados: {len(items)} temas")


if __name__ == "__main__":
    main()
