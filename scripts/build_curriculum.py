#!/usr/bin/env python3
"""Generate the browser curriculum from the expanded book outline."""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / ".codex/attachments/d04e72be-5f87-4e28-b907-fb1325994d21/pasted-text.txt"
FALLBACK_SOURCE = Path("/Users/proyectoapp/.codex/attachments/d04e72be-5f87-4e28-b907-fb1325994d21/pasted-text.txt")
OUTPUT = ROOT / "web/app-data.js"

MODULE_META = {
    "JAVASCRIPT": {
        "id": "javascript",
        "title": "JavaScript",
        "description": "Lenguaje, navegador, rendimiento, seguridad web y arquitectura",
        "project": "Juego Adivina el numero con interfaz grafica",
    },
    "NODE.JS": {
        "id": "node",
        "title": "Node.js",
        "description": "Backend, APIs, datos, observabilidad y produccion",
        "project": "API REST de tareas con autenticacion JWT",
    },
    "ANGULAR": {
        "id": "angular",
        "title": "Angular",
        "description": "TypeScript, Signals, arquitectura, testing y produccion",
        "project": "Panel de administracion con Signals state",
    },
    "REACT": {
        "id": "react",
        "title": "React",
        "description": "UI moderna, hooks, Next.js, testing y accesibilidad",
        "project": "E-commerce con carrito de compras y Next.js",
    },
    "JAVA": {
        "id": "java",
        "title": "Java",
        "description": "OOP, concurrencia, JVM, performance y testing",
        "project": "Sistema de gestion de biblioteca con consola",
    },
    "SPRING BOOT": {
        "id": "spring",
        "title": "Spring Boot",
        "description": "APIs robustas, seguridad, microservicios y arquitectura",
        "project": "API de reservas con seguridad y documentacion",
    },
    "DEVOPS": {
        "id": "devops",
        "title": "DevOps",
        "description": "Linux, CI/CD, contenedores, Kubernetes, IaC y GitOps",
        "project": "Pipeline CI/CD con despliegue en Kubernetes",
    },
    "CLOUD": {
        "id": "cloud",
        "title": "Cloud",
        "description": "AWS, Azure, GCP, Floci, seguridad, datos y automatizacion",
        "project": "Sistema completo desplegado en Floci",
    },
}


def source_text() -> str:
    path = SOURCE if SOURCE.exists() else FALLBACK_SOURCE
    return path.read_text(encoding="utf-8")


def normalize_ascii(text: str) -> str:
    replacements = {
        "á": "a",
        "é": "e",
        "í": "i",
        "ó": "o",
        "ú": "u",
        "Á": "A",
        "É": "E",
        "Í": "I",
        "Ó": "O",
        "Ú": "U",
        "ñ": "n",
        "Ñ": "N",
        "ü": "u",
        "Ü": "U",
        "—": "-",
        "→": "->",
        "“": '"',
        "”": '"',
        "‘": "'",
        "’": "'",
        "…": "...",
        "🚀": "",
    }
    for src, target in replacements.items():
        text = text.replace(src, target)
    return text


def clean_module_name(raw: str) -> str:
    name = re.split(r"\s+[—-]\s+", raw.strip())[0]
    name = re.sub(r"\s*\([^)]*\)", "", name)
    return name.strip().upper()


def parse_curriculum(text: str) -> list[dict]:
    start = text.find("📚 MÓDULO 1: JAVASCRIPT — De cero a master hacker")
    if start == -1:
        raise SystemExit("No se encontro el inicio del curriculo ampliado")
    end = text.find("🏆 EL CAMINO DEL MASTER HACKER", start)
    if end == -1:
        raise SystemExit("No se encontro el cierre del curriculo ampliado")

    lines = normalize_ascii(text[start:end]).splitlines()
    modules: list[dict] = []
    current_module: dict | None = None
    current_level: dict | None = None
    current_topic: dict | None = None

    module_re = re.compile(r"MODULO\s+(\d+):\s+(.+)$", re.IGNORECASE)
    level_re = re.compile(r"NIVEL\s+([^:]+):?\s*(.*)$", re.IGNORECASE)
    topic_re = re.compile(r"^(\d+)\.\s+(.+)$")

    for raw_line in lines:
        line = raw_line.strip()
        if not line:
            continue

        module_match = module_re.search(line)
        if module_match:
            module_key = clean_module_name(module_match.group(2))
            meta = MODULE_META.get(module_key)
            if not meta:
                continue
            current_module = {
                **meta,
                "code": module_match.group(1).zfill(2),
                "levels": [],
            }
            modules.append(current_module)
            current_level = None
            current_topic = None
            continue

        if current_module:
            level_match = level_re.search(line)
            if level_match and "Tema" not in line:
                current_level = {
                    "title": level_match.group(1).strip().title(),
                    "tone": level_match.group(2).strip() or "Ruta de aprendizaje",
                    "topics": [],
                }
                current_module["levels"].append(current_level)
                current_topic = None
                continue

        if current_level:
            topic_match = topic_re.match(line)
            if topic_match:
                current_topic = {
                    "title": topic_match.group(2).strip(),
                    "subtopics": [],
                }
                current_level["topics"].append(current_topic)
                continue

        if current_topic and not line.startswith(("Tema", "Que aprenderas")):
            current_topic["subtopics"].append(line)

    modules = [module for module in modules if module["levels"]]
    if len(modules) != 8:
        raise SystemExit(f"Se esperaban 8 modulos y se encontraron {len(modules)}")
    return modules


def js_string(value: object) -> str:
    return json.dumps(value, ensure_ascii=True, indent=2)


def render_app_data(modules: list[dict]) -> str:
    return f"""const STORAGE_KEY = "academia-master-paso-actual";

const METHOD = [
  "Objetivo claro antes de estudiar.",
  "Teoria breve con analogias del mundo real.",
  "Practica ejecutable o mini ejercicio.",
  "Profundizacion para entender por que funciona.",
  "Errores comunes y como diagnosticarlos.",
  "Reto final para consolidar.",
  "Recursos para seguir profundizando.",
];

const COURSE_BLUEPRINTS = {js_string(modules)};

const courses = COURSE_BLUEPRINTS.map((course, index) => {{
  const total = course.levels.reduce((sum, level) => sum + level.topics.length, 0);
  const start = COURSE_BLUEPRINTS.slice(0, index).reduce(
    (sum, item) => sum + item.levels.reduce((levelSum, level) => levelSum + level.topics.length, 0),
    1,
  );

  return {{
    id: course.id,
    code: course.code,
    title: course.title,
    description: course.description,
    project: course.project,
    start,
    end: start + total - 1,
  }};
}});

const fallbackSteps = COURSE_BLUEPRINTS.flatMap((course, courseIndex) => {{
  let offset = courses[courseIndex].start;
  return course.levels.flatMap((levelBlock) =>
    levelBlock.topics.map((topic) => {{
      const number = offset;
      offset += 1;
      return step(number, course, levelBlock, topic);
    }}),
  );
}});

function step(number, course, level, topic) {{
  const subtopics = topic.subtopics.length ? topic.subtopics : ["Idea principal, vocabulario clave y uso en proyecto real"];
  return {{
    number,
    title: `${{course.title}}: ${{topic.title}}`,
    explanation: `${{level.title}} (${{level.tone}}). ${{subtopics[0]}}.`,
    objective: `Dominar ${{topic.title}} dentro de ${{course.title}} y conectarlo con el proyecto final.`,
    theory: `Estudia el concepto, identifica sus piezas y explica donde aparece en sistemas reales. Tema base: ${{subtopics[0]}}.`,
    command: `Practica: crea una nota, ejemplo o mini ejercicio sobre "${{topic.title}}" dentro del proyecto final: ${{course.project}}.`,
    // Cambio P2: cada leccion generada recibe nivel y tiempo para badges visuales.
    difficulty: level.title,
    estimatedTime: level.title === "Fundamentos" ? "10 min" : level.title === "Intermedio" ? "15 min" : level.title === "Avanzado" ? "20 min" : "25 min",
    deepDive: `Profundiza revisando sus limites, costos, tradeoffs y relacion con otros temas del modulo ${{course.title}}.`,
    commonErrors: [
      "Memorizar nombres sin construir un ejemplo minimo.",
      "Copiar codigo sin explicar entradas, salidas y fallos.",
      "Saltar a herramientas avanzadas sin validar el fundamento.",
    ],
    challenge: `Reto: aplica ${{topic.title}} en una pieza pequena del proyecto "${{course.project}}" y documenta la decision tecnica.`,
    resources: [
      "Documentacion oficial de la tecnologia.",
      "Roadmap del modulo y ejemplos del proyecto.",
      "Pruebas, logs o mediciones que demuestren que funciona.",
    ],
    breakdown: [
      `Modulo: ${{course.title}}`,
      `Nivel: ${{level.title}}`,
      `Proyecto final: ${{course.project}}`,
      ...subtopics,
    ],
    output: `Resultado esperado: puedes explicar ${{topic.title}}, aplicar sus subtemas, detectar errores comunes y defender una solucion practica.`,
  }};
}}
"""


def main() -> None:
    modules = parse_curriculum(source_text())
    OUTPUT.write_text(render_app_data(modules), encoding="utf-8")
    topics = sum(len(level["topics"]) for module in modules for level in module["levels"])
    subtopics = sum(len(topic["subtopics"]) for module in modules for level in module["levels"] for topic in level["topics"])
    print(f"Wrote {OUTPUT.relative_to(ROOT)} with {len(modules)} modules, {topics} topics, {subtopics} subtopics.")


if __name__ == "__main__":
    main()
