#!/usr/bin/env python3
"""Añade rúbrica y bibliografía explícitas a módulos heredados.

Es una migración idempotente: conserva las secciones especializadas existentes y
solo inserta los contratos académicos que falten antes del resumen del módulo.
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web" / "public" / "content"

REFERENCES = {
    "foundations": [
        "ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023 (CS2023)*.",
        "IEEE Computer Society, *Guide to the Software Engineering Body of Knowledge, Version 4.0*.",
        "Downey, A., *Think Python*, para práctica gradual y modelos mentales ejecutables.",
    ],
    "javascript": [
        "ECMA International, *ECMAScript Language Specification*.",
        "MDN Web Docs, guías de JavaScript y Web APIs.",
        "WHATWG, *HTML Living Standard* y *Fetch Standard*.",
    ],
    "node": [
        "OpenJS Foundation, *Node.js Documentation*.",
        "IETF, especificaciones HTTP Semantics, OAuth 2.0 y JSON.",
        "OWASP Foundation, *Application Security Verification Standard*.",
    ],
    "angular": [
        "Google, *Angular Documentation* y guías oficiales de accesibilidad, seguridad y rendimiento.",
        "ReactiveX, *RxJS Documentation*.",
        "W3C, *Web Content Accessibility Guidelines (WCAG)*.",
    ],
    "react": [
        "Meta Open Source, *React Documentation*.",
        "WHATWG, estándares de DOM, HTML y Fetch.",
        "W3C, *Web Content Accessibility Guidelines (WCAG)*.",
    ],
    "java": [
        "Oracle, *Java Language Specification* y *Java Virtual Machine Specification*.",
        "OpenJDK, documentación de Java SE, JFR y JMH.",
        "Bloch, J., *Effective Java*.",
    ],
    "spring-boot": [
        "VMware/Broadcom, documentación de *Spring Framework* y *Spring Boot*.",
        "IETF, especificaciones HTTP y OAuth 2.0.",
        "OWASP Foundation, *Application Security Verification Standard*.",
    ],
    "android": [
        "Google, *Android Developers Documentation* y guías de arquitectura de aplicaciones.",
        "JetBrains, *Kotlin Language Documentation*.",
        "OWASP Foundation, *Mobile Application Security Verification Standard*.",
    ],
    "kotlin-multiplatform": [
        "JetBrains, documentación oficial de *Kotlin Multiplatform* y Kotlin Coroutines.",
        "Google, *Android Developers Documentation*; Apple, *Developer Documentation*.",
        "Kotlin Foundation, especificación y pautas de compatibilidad de Kotlin.",
    ],
    "ios": [
        "Apple, *Swift Language Guide* y *Apple Developer Documentation*.",
        "Apple, *Human Interface Guidelines* y documentación de accesibilidad.",
        "OWASP Foundation, *Mobile Application Security Verification Standard*.",
    ],
    "flutter": [
        "Google, *Flutter Documentation* y guías de arquitectura y rendimiento.",
        "Google, *Dart Language Documentation* y *Effective Dart*.",
        "OWASP Foundation, *Mobile Application Security Verification Standard*.",
    ],
    "devops": [
        "CNCF, documentación oficial de Kubernetes, Prometheus y OpenTelemetry.",
        "HashiCorp, *Terraform Documentation*.",
        "Beyer et al., *Site Reliability Engineering*; Forsgren et al., *Accelerate*.",
    ],
    "cloud": [
        "AWS, Microsoft Azure y Google Cloud, marcos oficiales de arquitectura bien diseñada.",
        "NIST, *Cloud Computing Standards Roadmap* y *Secure Software Development Framework*.",
        "Beyer et al., *Site Reliability Engineering*.",
    ],
}

PROJECT_START = {
    "javascript": ("`mkdir academia-javascript && cd academia-javascript && git init && npm init -y`", "HTML/DOM", "API y persistencia", "calidad, seguridad y rendimiento"),
    "node": ("`mkdir academia-node && cd academia-node && git init && npm init -y`", "CLI y HTTP", "API, datos y autenticación", "observabilidad, resiliencia y operación"),
    "angular": ("`npx @angular/cli new academia-angular --standalone --routing --style=scss`", "componentes y formularios", "estado, rutas y APIs", "arquitectura, accesibilidad y producción"),
    "react": ("`npm create vite@latest academia-react -- --template react-ts && cd academia-react && git init`", "componentes y estado", "rutas, formularios y datos", "arquitectura, accesibilidad y producción"),
    "java": ("`mkdir academia-java && cd academia-java && git init && gradle init --type java-application`", "dominio y colecciones", "I/O, concurrencia y datos", "testing, profiling y seguridad"),
    "spring-boot": ("genera `academia-spring` en `start.spring.io`, descomprímelo en una carpeta vacía y ejecuta `git init`", "API y configuración", "datos, seguridad y mensajería", "contratos, observabilidad y resiliencia"),
    "android": ("crea una carpeta vacía `academia-android`, abre Android Studio y genera allí un proyecto **Empty Activity**; luego ejecuta `git init`", "Compose, estado y navegación", "red, Room y trabajo en background", "testing, seguridad y publicación"),
    "kotlin-multiplatform": ("crea `academia-kmp` con el asistente oficial Kotlin Multiplatform en una carpeta vacía y ejecuta `git init`", "dominio común y targets", "red, datos e integración nativa", "compatibilidad y operación multi-target"),
    "ios": ("crea una carpeta vacía `academia-ios`, genera dentro un proyecto **iOS App / SwiftUI** con Xcode y ejecuta `git init`", "SwiftUI, estado y navegación", "concurrencia, red y SwiftData", "testing, seguridad y TestFlight"),
    "flutter": ("`flutter create academia_flutter && cd academia_flutter && git init`", "widgets, layout y navegación", "estado, red y persistencia", "profiling, seguridad y doble release"),
    "devops": ("`mkdir academia-devops && cd academia-devops && git init`", "scripts y contenedores", "CI/CD, Kubernetes e IaC", "SLO, incidentes y supply chain"),
    "cloud": ("`mkdir academia-cloud && cd academia-cloud && git init`; crea allí `compose.yaml`, `infra/`, `src/` y `tests/`", "almacenamiento, eventos y serverless", "datos, IaC y servicios integrados", "gobierno, multi-cloud y recuperación"),
}

RUBRIC = """## Rúbrica del proyecto

Esta rúbrica evalúa el laboratorio y los ejercicios como evidencia de dominio, no la mera finalización de pasos.

| Criterio | Peso | Evidencia esperada |
|---|---:|---|
| Comprensión conceptual | 20% | Explica el mecanismo, sus límites y por qué la solución funciona. |
| Implementación funcional | 30% | El artefacto satisface requisitos normales, límite y de error. |
| Verificación | 20% | Incluye pruebas, mediciones o inspecciones reproducibles. |
| Diseño y calidad | 15% | Nombres, estructura, seguridad y mantenibilidad son deliberados. |
| Comunicación profesional | 15% | README, decisiones, comandos y resultados permiten repetir el trabajo. |

Se alcanza competencia con 70/100 y sin cero en implementación o verificación. El nivel experto exige comparar alternativas, justificar trade-offs y reconocer condiciones donde la solución dejaría de ser válida.
"""


def bibliography(track: str) -> str:
    lines = [
        "## Bibliografía y fundamento académico",
        "",
        "Estas fuentes sustentan los conceptos y deben consultarse para verificar detalles que cambian entre versiones:",
        "",
    ]
    lines.extend(f"- {reference}" for reference in REFERENCES[track])
    lines.extend([
        "- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.",
        "- IEEE Computer Society, *SWEBOK Guide V4.0*.",
        "",
    ])
    return "\n".join(lines)


def project_path(track: str) -> str:
    start, first, middle, expert = PROJECT_START[track]
    return f"""## Ruta de proyecto progresivo desde carpeta vacía

No crees un proyecto desechable por módulo. Conserva un único repositorio que evoluciona durante todo el track y etiqueta cada hito (`git tag modulo-N`). Empieza con {start}. Ejecuta el comando paso a paso, inspecciona los archivos generados y registra versiones y precondiciones en el README.

| Hito | Evolución acumulativa | Evidencia antes de avanzar |
|---|---|---|
| Base | {first}. | Arranque reproducible, commit limpio y prueba mínima. |
| Aplicación | {middle}. | Casos normales, límite y error automatizados. |
| Integración | Conecta capas y reemplaza dobles por infraestructura controlada. | Diagrama, contratos y prueba de integración. |
| Experto | {expert}. | Perfil o threat model, telemetría y runbook de recuperación. |

Al iniciar cada laboratorio crea una rama `modulo-N`, implementa el incremento, verifica el criterio de éxito y fusiona solo con pruebas verdes. Si un módulo necesita un experimento aislado, colócalo en `experiments/modulo-N/`; el producto acumulativo permanece ejecutable. Al terminar, otra persona debe poder clonar el repositorio y reproducir el último hito siguiendo únicamente el README.
"""


changed = 0
for track, _ in REFERENCES.items():
    for path in sorted((CONTENT / track).glob("modulo-*.md")):
        text = path.read_text(encoding="utf-8")
        if path.name == "modulo-0.md" and track in PROJECT_START and "## Ruta de proyecto progresivo desde carpeta vacía" not in text:
            marker = "## Laboratorio práctico"
            if marker not in text:
                raise RuntimeError(f"{path}: falta {marker}")
            text = text.replace(marker, project_path(track).rstrip() + "\n\n" + marker, 1)
        additions: list[str] = []
        if "## Rúbrica del proyecto" not in text:
            additions.append(RUBRIC.rstrip())
        if "## Bibliografía y fundamento académico" not in text:
            additions.append(bibliography(track).rstrip())
        original = path.read_text(encoding="utf-8")
        if not additions and text == original:
            continue
        if additions:
            marker = "## Resumen del módulo"
            if marker not in text:
                raise RuntimeError(f"{path}: falta {marker}")
            insertion = "\n\n".join(additions) + "\n\n"
            text = text.replace(marker, insertion + marker, 1)
        path.write_text(text, encoding="utf-8")
        changed += 1

print(f"Enriquecimiento curricular: {changed} módulos actualizados.")
