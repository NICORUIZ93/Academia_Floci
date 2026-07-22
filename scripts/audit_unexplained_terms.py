#!/usr/bin/env python3
"""Detecta comandos/herramientas de terminal (y sus flags) que aparecen en un
bloque de código pero nunca se explican en la prosa del mismo tema: qué son,
de qué paquete/herramienta vienen o para qué sirven.

Esto es exactamente el hueco que los auditores existentes (audit_topic_learning_quality.py)
no detectan: ellos miden CANTIDAD de texto explicativo (>= 90 palabras) y presencia
de ciertas frases ("por qué es importante", "analogía"), pero no si un comando
puntual como `npx ng update ... --dry-run` fue realmente presentado antes de usarse.

Heurística (imperfecta a propósito, como el resto de los audits del repo): un
término (nombre de herramienta de CLI o flag `--algo`) que aparece dentro de un
bloque de código de terminal se considera "explicado" si, en algún lugar de la
prosa de ese mismo tema (fuera de los bloques de código), el término aparece
cerca de una frase que lo define ("es el", "es un/una", "significa", "sirve
para", "viene de", "forma parte de", "ejecuta", "instala", "activa", etc.). Si
el término nunca aparece cerca de una frase así, se marca como pendiente.

No reescribe contenido. Genera un inventario para priorizar la corrección
manual, igual que build_editorial_backlog.py.
"""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web/public/content"
JSON_REPORT = ROOT / "docs/unexplained-terms-audit.json"
MD_REPORT = ROOT / "docs/unexplained-terms-audit.md"
TRACKS = (
    "foundations", "cloud", "devops", "javascript", "node", "angular", "react",
    "java", "spring-boot", "kotlin-multiplatform", "android", "ios", "flutter", "rutaflow",
)

TERMINAL_LANGS = {"bash", "sh", "shell", "console", "zsh", "powershell", "ps1"}

# Herramientas de línea de comandos conocidas cuyo primer uso debería explicarse.
KNOWN_TOOLS = {
    "npx", "npm", "npm.cmd", "ng", "yarn", "pnpm", "node", "git",
    "docker", "docker-compose", "kubectl", "helm", "terraform", "tofu",
    "aws", "gcloud", "az", "gradle", "gradlew", "mvn", "mvnw", "java", "javac",
    "python", "python3", "pip", "pip3", "flutter", "dart", "swift", "swiftc",
    "xcodebuild", "pod", "adb", "xcrun", "curl", "wget", "brew", "choco",
    "systemctl", "cargo", "rustc", "go", "psql", "mysql", "redis-cli",
    "sdkmanager", "fastlane", "pytest", "uvicorn", "gunicorn", "kubeadm",
    "minikube", "kind", "k9s", "istioctl", "ansible", "ansible-playbook",
    "packer", "vault", "consul", "nomad", "serverless", "sam", "cdk", "pulumi",
    "eslint", "jest", "vitest", "playwright", "tsc", "vite", "webpack",
    "docker-credential-helper", "nvm", "corepack", "openssl", "jq",
}

DEFINING_CUES = re.compile(
    r"\b(es el|es la|es un|es una|significa|viene de|forma parte de|"
    r"sirve para|permite|hace que|instala|activa|ejecuta|corre|representa|"
    r"es la bandera|es el flag|es una bandera|es un flag|es el ejecutable|"
    r"es el comando|es la herramienta|es el subcomando)\b",
    re.IGNORECASE,
)

FLAG_PATTERN = re.compile(r"(?<![\w-])(--[a-zA-Z][\w-]*)")
FENCE_PATTERN = re.compile(r"^```([^\n]*)\n([\s\S]*?)^```[ \t]*$", re.MULTILINE)


def student_visible_content(text: str) -> str:
    for marker in ("DEFINITIVE-COMPLEMENTS", "SUPPLEMENTAL-COMPLEMENTS", "REQUESTED-PRACTICAL-EXAMPLES"):
        text = re.sub(rf"\n?<!-- {marker}:START -->[\s\S]*?<!-- {marker}:END -->\n?", "\n", text)
    return text


def structural_text(text: str) -> str:
    """Oculta el contenido de fences conservando offsets y saltos de línea."""
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
        next_h2 = re.search(r"^##\s+", block_structure[match.end() - match.start():], re.MULTILINE)
        if next_h2:
            block = block[:match.end() - match.start() + next_h2.start()]
        yield match.group(1), block


def extract_terminal_terms(block: str) -> set[str]:
    """Nombres de herramienta (primera palabra de cada línea) y flags `--algo`
    encontrados dentro de bloques de código de terminal."""
    terms: set[str] = set()
    for lang, body in FENCE_PATTERN.findall(block):
        language = lang.strip().split()[0].lower() if lang.strip() else ""
        if language not in TERMINAL_LANGS:
            continue
        for line in body.splitlines():
            line = line.strip().lstrip("$#").strip()
            if not line or line.startswith(("#", "//")):
                continue
            first_word = re.split(r"\s+", line)[0].strip("`")
            first_word = first_word.rsplit("/", 1)[-1]  # ./gradlew -> gradlew
            if first_word in KNOWN_TOOLS:
                terms.add(first_word)
            for flag in FLAG_PATTERN.findall(line):
                terms.add(flag)
    return terms


def term_is_explained(term: str, prose: str) -> bool:
    escaped = re.escape(term)
    for match in re.finditer(rf"(?<![\w-]){escaped}(?![\w-])", prose):
        window = prose[max(0, match.start() - 90):match.end() + 90]
        if DEFINING_CUES.search(window):
            return True
    return False


def build() -> dict:
    """Recorre cada track en orden de módulo/tema y solo reporta la PRIMERA
    aparición sin explicar de cada término. Si el término se explicó una vez
    en el track (en cualquier tema anterior), las repeticiones posteriores no
    se marcan otra vez — igual que un libro real, que presenta un término una
    sola vez y luego lo reutiliza asumiendo que ya se aprendió."""
    tracks: dict[str, list[dict]] = defaultdict(list)
    for track in TRACKS:
        paths = sorted((CONTENT / track).glob("modulo-*.md"), key=lambda p: int(re.search(r"\d+", p.stem).group()))
        explained_so_far: set[str] = set()
        for path in paths:
            module = int(re.search(r"\d+", path.stem).group())
            text = student_visible_content(path.read_text(encoding="utf-8"))
            for title, block in topic_blocks(text):
                terms = extract_terminal_terms(block)
                if not terms:
                    continue
                prose = structural_text(block)
                new_terms = terms - explained_so_far
                if not new_terms:
                    continue
                explained_here = {term for term in new_terms if term_is_explained(term, prose)}
                gaps = sorted(new_terms - explained_here)
                explained_so_far |= new_terms  # se reporta una sola vez por track
                if gaps:
                    tracks[track].append({
                        "module": module,
                        "topic": title,
                        "unexplainedTerms": gaps,
                        "totalTerms": len(terms),
                    })
    return {"tracks": tracks}


def render_markdown(data: dict) -> str:
    lines = [
        "# Auditoría de términos y comandos sin explicar",
        "",
        "Heurística: un comando o flag que aparece en un bloque de código de terminal "
        "se considera explicado solo si, en la prosa del mismo tema, aparece cerca de una "
        "frase que lo define (\"es el\", \"es un/una\", \"significa\", \"sirve para\", \"viene de\", "
        "\"ejecuta\", \"instala\", \"activa\"...). Es una heurística de triage, no un veredicto "
        "definitivo: falsos positivos y negativos son posibles. Sirve para priorizar revisión "
        "manual, no para auto-corregir contenido.",
        "",
        "| Track | Temas con términos sin explicar | Términos sin explicar más comunes |",
        "|---|---:|---|",
    ]
    all_terms = Counter()
    total_topics_flagged = 0
    for track, topics in data["tracks"].items():
        counter = Counter(term for topic in topics for term in topic["unexplainedTerms"])
        all_terms.update(counter)
        total_topics_flagged += len(topics)
        top = ", ".join(f"`{term}` ({count})" for term, count in counter.most_common(6))
        lines.append(f"| {track} | {len(topics)} | {top} |")
    lines.append(f"| **Total** | **{total_topics_flagged}** | |")
    lines.extend(["", "## Términos sin explicar más frecuentes en todo el curso", ""])
    lines.append("| Término | Apariciones sin explicar |")
    lines.append("|---|---:|")
    for term, count in all_terms.most_common(30):
        lines.append(f"| `{term}` | {count} |")
    lines.extend(["", "## Detalle por track", ""])
    for track, topics in sorted(data["tracks"].items()):
        if not topics:
            continue
        lines.append(f"### {track}")
        lines.append("")
        for topic in sorted(topics, key=lambda item: (item["module"], item["topic"])):
            terms = ", ".join(f"`{term}`" for term in topic["unexplainedTerms"])
            lines.append(f"- Módulo {topic['module']} · {topic['topic']}: {terms}")
        lines.append("")
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    data = build()
    json_text = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    md_text = render_markdown(data)
    if args.check:
        if not JSON_REPORT.exists() or JSON_REPORT.read_text(encoding="utf-8") != json_text or not MD_REPORT.exists() or MD_REPORT.read_text(encoding="utf-8") != md_text:
            raise SystemExit("La auditoría de términos sin explicar está desactualizada")
    else:
        JSON_REPORT.write_text(json_text, encoding="utf-8")
        MD_REPORT.write_text(md_text, encoding="utf-8")
    total_topics = sum(len(topics) for topics in data["tracks"].values())
    print(f"Auditoría de términos sin explicar: {total_topics} temas con al menos un término/comando sin explicar cerca")


if __name__ == "__main__":
    main()
