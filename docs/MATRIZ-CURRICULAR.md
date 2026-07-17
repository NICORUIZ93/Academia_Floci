# Matriz curricular auditable

Esta matriz convierte la intención “de cero absoluto a experto” en resultados que una persona puede demostrar. No afirma equivalencia con un grado universitario ni certificación de ACM o IEEE: utiliza sus cuerpos de conocimiento como referencias para detectar vacíos y hacer trazable la evaluación.

Fuentes primarias:

- [CS2023 Knowledge Areas — ACM/IEEE-CS/AAAI](https://csed.acm.org/knowledge-areas/)
- [SWEBOK Guide V4.0 Topics — IEEE Computer Society](https://www.computer.org/education/bodies-of-knowledge/software-engineering/topics)

Las fuentes verificables por máquina están en [`docs/curriculum-matrix.json`](curriculum-matrix.json) y [`docs/specialization-outcomes.json`](specialization-outcomes.json). `scripts/validate_curriculum.py` comprueba que ningún módulo común o especializado quede sin resultado, marco académico o evidencia.

## Progresión de competencia

| Etapa | Módulos | La persona demuestra |
|---|---:|---|
| Fundamentos | 0–3 | Ejecuta y explica programas, modela algoritmos y comprende la web sin depender de frameworks. |
| Aplicación | 4–5 | Persiste datos, prueba, depura y colabora con automatización reproducible. |
| Integración | 6–8 | Protege, diseña y opera software considerando arquitectura, concurrencia y plataforma. |
| Experto | 9–10 | Justifica propiedades y decisiones bajo incertidumbre, fallos parciales y objetivos operativos. |

## Cobertura por módulo

| Módulo | Áreas CS2023 | Áreas SWEBOK V4 | Evidencia integradora principal |
|---:|---|---|---|
| 0 · Entorno | AR, SDF, SF | Construction, Computing Foundations | Programa, error diagnosticado y README reproducible |
| 1 · Programación | FPL, SDF | Construction, Computing Foundations | Calculadora con contratos y casos límite |
| 2 · Algoritmos | AL, MSF, SDF | Construction, Mathematical Foundations | Inventario JSON y benchmark |
| 3 · Web y redes | HCI, NC, SDF | Construction, Quality, Computing Foundations | Sitio accesible y evidencia HTTP |
| 4 · Datos | DM, SDF | Design, Construction, Computing Foundations | Modelo, migraciones, transacciones e índices |
| 5 · Calidad | SDF, SE | Testing, Configuration Management, Quality | Regresión, suite, Git y CI |
| 6 · Seguridad | SEC, SEP | Security, Professional Practice | Threat model, roles y pruebas negativas |
| 7 · Ingeniería | SE, SEP | Requirements, Architecture, Design, Maintenance | Criterios, C4, ADRs y refactoring |
| 8 · Sistemas | AR, OS, PDC, SF | Construction, Operations, Computing Foundations | Carrera reproducida, contenedor y runbook |
| 9 · Matemáticas | AL, MSF, SE | Models and Methods, Mathematical/Engineering Foundations | Propiedades, grafos y experimento |
| 10 · Distribuidos | NC, PDC, SE, SF | Architecture, Construction, Operations, Quality | Outbox, fallos, trazas, SLO y postmortem |

## Método de evaluación

Cada resultado requiere evidencia observable: un artefacto ejecutable, una explicación razonada y una verificación repetible. Completar una lectura o reconocer términos no demuestra competencia. Las rúbricas de cada módulo distinguen ejecución inicial, aplicación competente y juicio experto.

La cobertura es intencionalmente transversal. Por ejemplo, seguridad no vive solo en el módulo 6: reaparece en contenedores, observabilidad y cada track especializado. La primera matriz identifica dónde se enseña el fundamento; la matriz de especializaciones prueba dónde se transfiere y evalúa en cada plataforma.

## Resultados por especialización

| Track | Módulos trazados | Resultados observables | Evidencias integradoras características |
|---|---:|---:|---|
| JavaScript | 14 | 4 | Aplicación modular, perfil de memoria, threat model |
| Node.js | 14 | 4 | Contrato HTTP, persistencia, fallos y runbook |
| Angular | 15 | 4 | Formularios, streams, arquitectura y auditoría WCAG |
| React | 14 | 4 | Comportamiento probado, ADR, rendimiento y seguridad |
| Java | 15 | 4 | Invariantes, concurrencia, JFR/JMH y seguridad de runtime |
| Spring Boot | 14 | 4 | Transacciones, autorización, contratos y game day |
| Android | 14 | 4 | UI/lifecycle, offline, modularidad y operación móvil |
| Kotlin Multiplatform | 13 | 4 | Contratos por target, compatibilidad y pipeline multi-target |
| iOS | 14 | 4 | Concurrencia, Instruments, Keychain, outbox y TestFlight |
| Flutter | 14 | 4 | Widgets, channels, DevTools, isolates y releases dobles |
| DevOps | 15 | 4 | IaC, pipeline, SLO, incidente y supply chain firmada |
| Cloud | 33 | 5 | Arquitecturas multi-cloud, FinOps, restore y chaos experiment |
| **Total especializado** | **189** | **49** | **Código, pruebas, mediciones, decisiones y operación** |

Los resultados agrupan módulos que cooperan para una capacidad profesional; no reemplazan las rúbricas por módulo. Cada resultado declara los IDs responsables, al menos dos evidencias y su relación con CS2023 y SWEBOK. El validador compara la unión de esos IDs con el catálogo real, por lo que agregar o eliminar una lección obliga a actualizar su contrato curricular.

## Vacíos declarados y alcance

CS2023 incluye áreas especializadas como inteligencia artificial y gráficos. No se presentan como dominio experto dentro de la ruta de fundamentos porque requieren rutas de aprendizaje propias; sí se cubren los prerrequisitos de programación, algoritmos, datos, matemáticas, ética y experimentación. Esta declaración evita confundir amplitud nominal con aprendizaje profundo.

La revisión final del currículo debe comprobar dos direcciones:

1. Cada módulo y track tiene resultados y evidencia alineados a una necesidad profesional o académica.
2. Cada área declarada aparece en contenido, práctica y evaluación; una mención bibliográfica aislada no cuenta como cobertura.
