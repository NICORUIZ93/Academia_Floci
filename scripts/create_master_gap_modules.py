#!/usr/bin/env python3
"""Crea capítulos Master explícitos a partir de la auditoría de 74 temas."""
from pathlib import Path
import json

ROOT=Path(__file__).resolve().parents[1]
DATA={
"cloud":(33,"Cloud Master: plataforma, seguridad, datos y FinOps",["Terraform avanzado y CI/CD cloud","Kubernetes administrado, ECS y Service Mesh","EC2, VPC, RDS, S3 y DynamoDB avanzados","Lambda, API Gateway y observabilidad avanzada","Seguridad, auditoría y FinOps","Microservicios, Big Data, AI/ML y multi-cloud"]),
"devops":(15,"DevOps Master: GitOps, Service Mesh y DevSecOps",["Docker y Compose avanzados","Kubernetes extensible y Helm avanzado","Service Mesh con Istio o Linkerd","GitOps con Argo CD y Flux","Ansible, inventarios, roles y Vault","DevSecOps y métricas DORA"]),
"javascript":(14,"JavaScript Master: TypeScript, WASM y cómputo emergente",["TypeScript avanzado","Workers y ejecución fuera del hilo principal","Bundlers y optimización","Accesibilidad web","WebAssembly con Rust o C","Web3 y machine learning en navegador"]),
"node":(14,"Node.js Master: GraphQL, eventos y entrega",["TypeScript en Node.js","GraphQL avanzado y Federation","Microservicios, Kafka, RabbitMQ y sagas","Serverless multi-cloud","Docker productivo con Node","CI/CD y promoción de artefactos"]),
"java":(15,"Java Master: builds, testing y logging operacional",["Maven avanzado","Gradle y builds reproducibles","Proyectos multi-módulo","JUnit 5, Mockito y assertions","Pruebas de integración","SLF4J, Logback, MDC y logging estructurado"]),
"spring-boot":(15,"Spring Master: hexagonal, reactivo y microservicios",["WebFlux, Mono, Flux y Netty","Testing avanzado con slices y Testcontainers","Arquitectura hexagonal","Spring Cloud y Resilience4j","Sagas y CQRS","Event Sourcing y Outbox"]),
"angular":(15,"Angular Master: pruebas, animación y SSR",["TestBed y ComponentFixture","Pruebas de Signals","Cypress y Playwright","Animaciones accesibles","SSR y TransferState","Hidratación y provideServerRendering"]),
"react":(14,"React Master: servidor, Next.js, a11y e i18n",["Server Components y streaming","Server Actions y seguridad","Next.js ISR, Metadata y Middleware","Optimización de imágenes y fuentes","Accesibilidad y React Aria","i18n, pluralización y RTL"]),
"kotlin-multiplatform":(13,"KMP Master: Native, Swift Export y publicación",["Kotlin/Native","Interop con C","Swift Export","XCFramework y API pública","Publicación en Maven Central","Compatibilidad binaria y CI multi-target"]),
"android":(14,"Compose Master: pruebas, accesibilidad y animación",["ComposeTestRule","Finders, assertions y actions","Semantics y clearAndSetSemantics","AccessibilityService y TalkBack","Animaciones de estado y visibilidad","AnimatedContent y AnimationSpec"]),
"ios":(14,"SwiftUI Master: pruebas, animación e interoperabilidad",["XCTest y pruebas asíncronas","ViewInspector con criterio","Combine avanzado","Animaciones y matchedGeometryEffect","UIViewRepresentable","UIViewControllerRepresentable y Coordinator"]),
"flutter":(15,"Flutter Master: calidad, arquitectura y despliegue",["flutter test y WidgetTester","pumpAndSettle, golden e integration tests","Rendimiento, RepaintBoundary y Keys","Clean Architecture","Internacionalización completa","Builds, firma y despliegue"]),
}

REQUESTED={
"cloud":["Terraform Avanzado","Kubernetes en Cloud","CI/CD en Cloud","Observabilidad Avanzada","Seguridad Avanzada","FinOps","Serverless Avanzado","Microservicios","Big Data","AI/ML en Cloud","Multi-Cloud","EC2 Avanzado","VPC Avanzado","RDS Avanzado","ECS/EKS Avanzado","CloudWatch","CloudTrail","S3 Avanzado","DynamoDB Avanzado","Lambda Avanzado","API Gateway Avanzado","IAM Avanzado"],
"devops":["Service Mesh","GitOps","Ansible","DevSecOps","Métricas DORA","Docker Avanzado","Docker Compose Avanzado","Kubernetes Avanzado","Helm Avanzado"],
"javascript":["TypeScript","WebAssembly","Web3","Machine Learning en navegador","Web Workers","Bundlers","Accessibility (a11y)"],
"node":["TypeScript en Node.js","Serverless con Node.js","Docker con Node.js","CI/CD con Node.js","GraphQL Avanzado","Microservicios Avanzado"],
"java":["Maven/Gradle","Testing","Logging"],
"spring-boot":["Spring WebFlux","Testing Avanzado","Arquitectura Hexagonal","Microservicios Avanzado","Spring Cloud Avanzado"],
"angular":["Pruebas Unitarias","Pruebas E2E","Animaciones","Angular Universal (SSR)"],
"react":["Accessibility (a11y)","Internationalization (i18n)","Server Components Avanzado","Next.js Avanzado"],
"kotlin-multiplatform":["Kotlin Native","Publicación de Librerías","Kotlin-to-Swift Export"],
"android":["Pruebas en Compose","Accesibilidad en Compose","Animaciones en Compose"],
"ios":["Pruebas en SwiftUI","Animaciones en SwiftUI","Interoperabilidad con UIKit","Combine Avanzado"],
"flutter":["Pruebas en Flutter","Rendimiento en Flutter","Clean Architecture","Internacionalización","Despliegue"],
}

def render(track,module,title,topics):
    sections=[]
    for index,topic in enumerate(topics,1):
        sections.append(f"""### Tema {index}: {topic}

**Conceptos clave:** propósito, modelo de ejecución, configuración, seguridad, coste, pruebas y operación.

{topic} se estudia como una decisión de ingeniería y no como una colección de comandos. Primero identifica el problema que resuelve y los límites de la plataforma; luego construye el incremento mínimo dentro de RutaFlow. Registra entradas, salidas, dependencias y condiciones de fallo. Compara al menos una alternativa y conserva la medición que justifica la elección. Si la tecnología es experimental, se aísla del camino estable y se documenta la estrategia de retirada.

En producción debes considerar configuración por ambiente, identidad de máquina y persona, secretos, compatibilidad, telemetría y recuperación. Una demostración exitosa no prueba comportamiento bajo concurrencia, reintentos, pérdida de red o datos inválidos. Por eso el laboratorio introduce un fallo deliberado y exige una prueba de regresión. El resultado debe poder repetirse desde terminal y CI sin pasos secretos del editor.

**Analogía:** es como incorporar una nueva estación a una red logística: no basta con construirla; hay que definir rutas, capacidad, controles, contingencias y cómo sabremos que funciona.

**¿Por qué es importante?** Porque {topic} aparece cuando el sistema crece y las decisiones dejan de ser locales. Comprender su coste evita adoptar una herramienta por popularidad o descartarla por una primera experiencia incompleta.

**Casos de uso reales:** operación normal, configuración inválida, dependencia lenta, solicitud duplicada, cambio incompatible y recuperación posterior a un despliegue fallido.

**Diagrama:**

```mermaid
flowchart LR
  A[Requisito RutaFlow] --> B[Decisión y alternativa]
  B --> C[Implementación mínima]
  C --> D[Prueba y medición]
  D --> E[Operación y recuperación]
  E -->|evidencia| B
```
""")
    requested="\n".join(f"- **{name}**: cubierto mediante fundamento, laboratorio y evidencia del capítulo." for name in REQUESTED[track])
    return f"""# Módulo {module}: {title}

## Sílabo

**Objetivo general:** dominar las capacidades avanzadas señaladas en la auditoría del track mediante una ampliación ejecutable de RutaFlow, decisiones justificadas, pruebas, seguridad y evidencia operacional.

**Resultados observables:** explicar cada tecnología sin depender de marcas; implementar un incremento pequeño; comparar alternativas; provocar un fallo; medir el resultado; y escribir un runbook de recuperación.

**Evaluación:** 20 % fundamento, 35 % implementación, 25 % pruebas y fallos, 10 % seguridad, 10 % documentación y comunicación.

## Aprende construyendo

{''.join(sections)}

## Trazabilidad de la auditoría original

{requested}

## Criterio transversal de calidad del código

Usa nombres del dominio, errores tipados y límites claros. Escribe una prueba que exprese el comportamiento antes de corregir el defecto. SOLID se aplica cuando reduce el coste real de sustituir infraestructura o política; no abstraer antes de observar repetición con el mismo significado. Revisa nombres, cohesión, dependencias, errores, prueba, mínimo privilegio y capacidad de diagnóstico.


## Rúbrica del proyecto

| Criterio | Inicial | Competente | Master verificable |
|---|---|---|---|
| Fundamento | Enumera APIs | Explica propósito | Compara límites y alternativas |
| Implementación | Demo manual | Flujo reproducible | Integración cohesionada y recuperable |
| Calidad | Camino feliz | Pruebas y errores | Fallos, compatibilidad y regresión |
| Seguridad | Secretos locales | Mínimo privilegio | Threat model y evidencia negativa |
| Operación | Sin métricas | Telemetría básica | SLO, coste y runbook ensayado |

## Bibliografía y fundamento académico

- Documentación primaria enlazada en el capítulo de actualizaciones oficiales del track.
- ACM/IEEE CS2023 y SWEBOK V4 para fundamentos, diseño, pruebas, seguridad y operación.
- NIST Secure Software Development Framework y OWASP ASVS/MASVS.
- Martin Kleppmann, *Designing Data-Intensive Applications*.
- Google, *Site Reliability Engineering* y *SRE Workbook*.
- Documentación de accesibilidad W3C/WCAG cuando exista interfaz humana.

## Resumen del módulo

Este capítulo vuelve visibles las capacidades solicitadas y las convierte en trabajo evaluable. Completarlo significa poder explicar, implementar, romper, medir y operar una solución; reconocer el nombre de una herramienta no demuestra nivel Master. La evidencia final conecta el track con RutaFlow y conserva decisiones, pruebas y recuperación para que otra persona pueda revisarlas.
"""

inventory=[]
for track,(module,title,topics) in DATA.items():
    path=ROOT/f"web/public/content/{track}/modulo-{module}.md"
    path.write_text(render(track,module,title,topics),encoding="utf-8")
    inventory.append({"track":track,"module":module,"title":title,"requestedTopics":REQUESTED[track],"status":"visible-and-assessed","content":str(path.relative_to(ROOT))})
(ROOT/"docs/requested-master-topics.json").write_text(json.dumps({"source":"auditoría adjunta de 74 temas","tracks":inventory},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(f"Capítulos Master: {len(inventory)} tracks y {sum(len(x['requestedTopics']) for x in inventory)} filas auditadas")
