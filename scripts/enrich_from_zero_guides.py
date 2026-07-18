#!/usr/bin/env python3
"""Añade una preparación reproducible y específica a cada capítulo activo.

La guía usa los temas y el entregable reales del Markdown. No sustituye la
explicación editorial de cada tema ni la cuenta como cobertura pedagógica.
"""

from __future__ import annotations

import argparse
import re
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web/public/content"
TRACKS = (
    "foundations", "cloud", "devops", "javascript", "node", "angular", "react",
    "java", "spring-boot", "kotlin-multiplatform", "android", "ios", "flutter", "rutaflow",
)
MARKER = "## Comienza desde cero: prepara este capítulo"


@dataclass(frozen=True)
class TrackGuide:
    check: str
    create: str
    root: str
    source: str
    extension: str
    run: str
    failure: str
    platform: str = "Los comandos funcionan en macOS, Linux y WSL. En PowerShell usa el equivalente indicado por la herramienta."


GUIDES = {
    "foundations": TrackGuide("python3 --version\ngit --version", "mkdir -p academia-labs/foundations/{src,tests,docs/evidence}\ncd academia-labs/foundations\ngit init", "academia-labs/foundations", "src", "py", "python3 -m unittest discover -s tests -v", "Usa una entrada inválida o elimina una precondición y conserva el mensaje que explica la causa."),
    "cloud": TrackGuide("docker --version\naws --version\nterraform version", "mkdir -p academia-labs/cloud/{infra,tests,evidence}\ncd academia-labs/cloud\ngit init\ndocker compose up -d", "academia-labs/cloud", "infra", "tf", "terraform -chdir=infra validate", "Cambia un endpoint, permiso o identificador por un valor inválido; inspecciona la respuesta del emulador antes de corregir."),
    "devops": TrackGuide("git --version\ndocker --version\nbash --version", "mkdir -p academia-labs/devops/{app,infra,scripts,evidence}\ncd academia-labs/devops\ngit init", "academia-labs/devops", "infra", "yaml", "docker compose config", "Rompe una referencia, variable o healthcheck y localiza la causa con la validación o los logs."),
    "javascript": TrackGuide("node --version\nnpm --version\ngit --version", "npm create vite@latest academia-labs/javascript -- --template vanilla-ts\ncd academia-labs/javascript\nnpm install\ngit init", "academia-labs/javascript", "src", "ts", "npm test && npm run dev", "Prueba un valor límite, un tipo inesperado o una operación fuera de orden; compara la salida con tu predicción."),
    "node": TrackGuide("node --version\nnpm --version\ngit --version", "mkdir -p academia-labs/node-api/src\ncd academia-labs/node-api\nnpm init -y\nnpm install fastify\nnpm install -D typescript tsx @types/node\ngit init", "academia-labs/node-api", "src", "ts", "npm test && npm run dev", "Envía una entrada inválida o desconecta una dependencia; verifica estado HTTP, cuerpo y log con contexto."),
    "angular": TrackGuide("node --version\nnpm --version\nnpx ng version", "npx @angular/cli@latest new academia-labs/angular-app --standalone --routing --style=scss\ncd academia-labs/angular-app\ngit init", "academia-labs/angular-app", "src/app/features", "ts", "npm test -- --watch=false && npm start", "Simula un estado vacío o un error HTTP y comprueba que la interfaz muestre recuperación y no una pantalla ambigua."),
    "react": TrackGuide("node --version\nnpm --version\ngit --version", "npm create vite@latest academia-labs/react-app -- --template react-ts\ncd academia-labs/react-app\nnpm install\ngit init", "academia-labs/react-app", "src/features", "tsx", "npm test -- --run && npm run dev", "Cambia una prop o respuesta a un caso vacío o erróneo; observa el estado visual y corrige desde la primera causa."),
    "java": TrackGuide("java --version\njavac --version\ngit --version", "mkdir -p academia-labs/java/src/{main,test}/java/academy\ncd academia-labs/java\ngit init", "academia-labs/java", "src/main/java/academy", "java", "./gradlew test  # Windows: .\\gradlew.bat test", "Viola una precondición o usa un valor frontera; la prueba debe expresar la regla incumplida."),
    "spring-boot": TrackGuide("java --version\njavac --version\ncurl --version", "mkdir -p academia-labs && cd academia-labs\ncurl -G https://start.spring.io/starter.zip -d type=maven-project -d language=java -d javaVersion=21 -d artifactId=spring-api -d dependencies=web,validation -o spring-api.zip\nunzip spring-api.zip -d spring-api && cd spring-api", "academia-labs/spring-api", "src/main/java/io/academia/rutaflow", "java", "./mvnw test  # Windows: .\\mvnw.cmd test", "Envía una petición inválida o sustituye una dependencia por un fallo controlado; verifica estado, cuerpo y causa."),
    "kotlin-multiplatform": TrackGuide("java --version\n./gradlew --version", "# Crea el proyecto con el asistente oficial de Kotlin Multiplatform\ncd academia-labs/kmp-app\ngit init\n./gradlew tasks", "academia-labs/kmp-app", "shared/src/commonMain/kotlin", "kt", "./gradlew :shared:allTests", "Introduce un dato nulo o caso específico de plataforma; commonTest debe hacerlo visible."),
    "android": TrackGuide("java --version\n./gradlew --version\nadb version", "# Android Studio: New Project → Empty Activity → Kotlin + Compose\ncd academia-labs/android-app\ngit init\n./gradlew tasks", "academia-labs/android-app", "app/src/main/java/academy", "kt", "./gradlew testDebugUnitTest", "Simula permiso denegado, proceso recreado o dato ausente; verifica que la pantalla conserve un estado comprensible."),
    "ios": TrackGuide("xcodebuild -version\nswift --version\ngit --version", "# Xcode: New Project → iOS App → SwiftUI + Swift\ncd academia-labs/ios-app\ngit init", "academia-labs/ios-app", "Features", "swift", "xcodebuild test -scheme RutaFlowLab -destination 'platform=iOS Simulator,name=iPhone 16'", "Simula permiso denegado, respuesta vacía o tarea cancelada; verifica estado y mensaje. SwiftUI requiere macOS.", "La práctica de SwiftUI requiere macOS y Xcode. En Windows/Linux estudia el modelo y conserva la ejecución para un equipo macOS."),
    "flutter": TrackGuide("flutter doctor -v\nflutter --version\ngit --version", "flutter create --org com.academia academia-labs/flutter_app\ncd academia-labs/flutter_app\ngit init\nflutter pub get", "academia-labs/flutter_app", "lib/features", "dart", "flutter analyze && flutter test", "Simula pérdida de red, permiso denegado o widget desmontado; comprueba la recuperación sin errores ocultos."),
    "rutaflow": TrackGuide("git --version\ndocker --version\nnode --version\njava --version\nflutter --version", "mkdir -p academia-labs/rutaflow/{apps,services,packages,infra,docs/evidence}\ncd academia-labs/rutaflow\ngit init", "academia-labs/rutaflow", "docs/iterations", "md", "docker compose config", "Rompe de forma controlada un contrato entre componentes y localiza la causa con pruebas, logs o métricas."),
}


def topic_blocks(text: str) -> list[tuple[str, str]]:
    headings = list(re.finditer(r"^###\s+(Tema(?:[^:]*)?:\s*.+)$", text, re.MULTILINE))
    result = []
    for index, match in enumerate(headings):
        end = headings[index + 1].start() if index + 1 < len(headings) else len(text)
        next_h2 = re.search(r"^##\s+", text[match.end():end], re.MULTILINE)
        if next_h2:
            end = match.end() + next_h2.start()
        result.append((match.group(1), text[match.start():end]))
    return result


def slug(value: str) -> str:
    value = value.lower().replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o").replace("ú", "u").replace("ñ", "n")
    return re.sub(r"[^a-z0-9]+", "-", value).strip("-")[:54]


def extract_evaluation(text: str) -> str:
    match = re.search(r"\*\*Evaluación\*\*\s*\n+([^\n]+)", text)
    return match.group(1).strip() if match else "Un incremento pequeño, probado y reproducible del capítulo."


def render(track: str, module: int, text: str) -> str:
    guide = GUIDES[track]
    title_match = re.search(r"^#\s+Módulo\s+\d+:\s*(.+)$", text, re.MULTILINE)
    title = title_match.group(1).strip() if title_match else f"Módulo {module}"
    evaluation = extract_evaluation(text)
    rows = []
    for index, (heading, block) in enumerate(topic_blocks(text), start=1):
        topic = re.sub(r"^Tema(?:\s+(?:complementario|suplementario))?(?:\s+\d+)?\s*:\s*", "", heading, flags=re.IGNORECASE).strip()
        has_code = bool(re.search(r"^```(?!mermaid)", block, re.MULTILINE))
        artifact = f"{guide.source}/module-{module}/topic-{index}-{slug(topic)}.{guide.extension}" if has_code else f"docs/decisions/module-{module}-topic-{index}.md"
        evidence = "prueba + salida observable" if has_code else "contexto + alternativas + decisión + consecuencias"
        rows.append(f"| {index}. {topic.replace('|', '/')} | `{artifact}` | {evidence} |")
    topic_table = "\n".join(rows)
    return f"""{MARKER}

Este recorrido parte de una carpeta vacía. Al finalizar tendrás **{evaluation}** No avances ejecutando comandos que no comprendes: primero identifica la entrada, la transformación y la evidencia que comprobará el resultado.

### 1. Comprueba las herramientas

{guide.platform}

```bash
{guide.check}
```

Si un comando no existe, detente e instala esa herramienta desde su sitio oficial. Cierra y abre la terminal después de modificar `PATH`. Las versiones deben ser compatibles entre sí antes de crear archivos.

### 2. Crea o recupera el proyecto del track

```bash
{guide.create}
```

Trabaja dentro de `{guide.root}`. Si ya existe, no lo vuelvas a generar: entra en la carpeta, confirma `git status` y continúa sobre una rama propia.

### 3. Ubica cada tema antes de escribir

```text
{guide.root}/
├─ {guide.source}/
│  └─ module-{module}/
├─ tests/
├─ docs/decisions/
├─ evidence/module-{module}/
└─ README.md
```

| Tema | Archivo o decisión | Evidencia mínima |
|---|---|---|
{topic_table}

Un ejemplo técnico vive en el archivo indicado y debe tener una prueba. Un tema conceptual vive en `docs/decisions/`: compara opciones usando restricciones medibles; no escribas código decorativo solo para llenar espacio.

### 4. Ejecuta una línea base

Desde `{guide.root}`:

```bash
{guide.run}
```

**Resultado esperado:** el comando reconoce el proyecto y termina sin errores antes de introducir el cambio del capítulo. Después del incremento, la evidencia debe demostrar: **{evaluation}**

Si falla la línea base, no continúes. Localiza el primer mensaje que indique archivo, línea o dependencia; formula una causa y compruébala con un cambio pequeño.

### 5. Provoca un fallo y recupérate

{guide.failure} Guarda en `evidence/module-{module}/` el comando, la salida relevante, tu hipótesis y la corrección. Revierte únicamente el cambio deliberado; no borres todo el proyecto para ocultar la causa.

### 6. Conecta el capítulo con RutaFlow

Aplica el aprendizaje de **{title}** a un incremento vertical de RutaFlow. Define qué componente produce el dato, qué contrato lo transporta, quién lo consume y cómo observarás un fallo. La entrega final incluye archivo o decisión, prueba, salida, error corregido y una limitación que todavía validarías en producción.

---

"""


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="valida sin modificar archivos")
    args = parser.parse_args()
    changed = 0
    active = 0
    failures = []
    for track in TRACKS:
        for path in sorted((CONTENT / track).glob("modulo-*.md")):
            active += 1
            text = path.read_text(encoding="utf-8")
            is_webflux_reference = text.startswith("# Módulo 9: Programación reactiva con WebFlux")
            if MARKER in text or is_webflux_reference:
                if args.check:
                    expected_topics = len(topic_blocks(text))
                    if is_webflux_reference:
                        if "## Comienza desde cero: crea una API WebFlux ejecutable" not in text:
                            failures.append(f"{path}: falta la guía WebFlux")
                    else:
                        guide_section = text.split(MARKER, 1)[1].split("## Contenido teórico", 1)[0]
                        rows = len(re.findall(r"^\|\s+\d+\.", guide_section, re.MULTILINE))
                        required = ("### 1. Comprueba", "### 2. Crea", "### 3. Ubica", "### 4. Ejecuta", "Resultado esperado", "### 5. Provoca", "### 6. Conecta")
                        if rows != expected_topics or not all(item in guide_section for item in required):
                            failures.append(f"{path}: {rows}/{expected_topics} temas trazados o estructura incompleta")
                continue
            if args.check:
                failures.append(f"{path}: falta guía desde cero")
                continue
            module = int(re.search(r"\d+", path.stem).group())
            insertion = render(track, module, text)
            anchor = re.search(r"^---\s*$", text, re.MULTILINE)
            if anchor:
                position = anchor.end()
            else:
                content_heading = re.search(r"^##\s+Contenido teórico\s*$", text, re.MULTILINE | re.IGNORECASE)
                if not content_heading:
                    raise SystemExit(f"No se encontró el inicio del contenido en {path}")
                position = content_heading.start()
            updated = text[:position].rstrip() + "\n\n" + insertion + text[position:].lstrip("\n")
            path.write_text(updated, encoding="utf-8")
            changed += 1
    if failures:
        raise SystemExit("Guías desde cero incompletas:\n- " + "\n- ".join(failures))
    verb = "validados" if args.check else "revisados"
    print(f"Guías desde cero: {changed} añadidas; {active} capítulos activos {verb}")


if __name__ == "__main__":
    main()
