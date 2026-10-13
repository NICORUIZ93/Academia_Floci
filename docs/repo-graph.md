# Academia Floci Repo Graph

Generated: 2026-10-13 05:07 UTC
Root: `floci-biblioteca-continuidad`
Indexed files: 904
Import edges: 47

Use this file as the first, compact context for AI assistants. Refresh it with:

```bash
python3 scripts/build_repo_graph.py --json docs/repo-graph.json
```

For automated lookups, use `docs/repo-graph.json`.

## Project Shape

- `angular-app`: 53 files
- `automation-script`: 33 files
- `course-content`: 348 files
- `documentation`: 121 files
- `example`: 309 files
- `local-infra`: 1 files
- `project-file`: 39 files

## File Types

- `.md`: 465
- `.py`: 66
- `.ts`: 61
- `.js`: 53
- `.java`: 46
- `.json`: 40
- `.rs`: 25
- `.go`: 24
- `.dart`: 19
- `.swift`: 19
- `.gitignore`: 11
- `.kt`: 11
- `.html`: 10
- `.yaml`: 8
- `.sh`: 7
- `.scss`: 7
- `.yml`: 6
- `.mjs`: 6
- `.jsx`: 5
- `.tf`: 4
- `.txt`: 4
- `.example`: 3
- `Dockerfile`: 2
- `.css`: 2

## High Signal Files

- `README.md` (260 lines, documentation)
  - headings: # Academia_Floci, ## Como empezar, ## Levantar Floci, # 1. Levantar todos los servicios, # 2. Verificar Floci AWS
- `scripts/validate.sh` (128 lines, automation-script)
- `scripts/build_repo_graph.py` (464 lines, automation-script)
  - symbols: FileNode, repo_files, read_text, classify, parse_ts_symbols, parse_ts_imports, parse_python_symbols, parse_python_imports, parse_markdown_headings, unique
- `web/src/app/app.ts` (11 lines, angular-app)
  - symbols: App
- `web/src/app/course-data.ts` (883 lines, angular-app)
  - symbols: ServiceGroup, CloudComparison, AltCloudGroup
- `web/src/app/catalog/course-catalog.ts` (90 lines, angular-app)
  - symbols: CourseCatalogComponent, cards, featuredTracks, foundationTracks, mobileTracks, totalModules
- `web/src/app/course/course-shell.ts` (59 lines, angular-app)
  - symbols: CourseShellComponent, track, officialPath, sidebarOpen, trackLogo, percent
- `web/src/app/course/lesson-viewer.ts` (934 lines, angular-app)
  - symbols: LessonViewerComponent, TocItem, track, module, officialSource, projectBootstrap, trackProject, projectStep, projectProgress, showProjectBootstrap
- `web/public/content/manifest.json` (819 lines, course-content)
- `web/public/content/es/pasos.md` (1122 lines, course-content)
  - headings: # 45 pasos de Academia Floci, ## Cursos, ## Paso 1: ¿Qué es Docker?, ## Paso 2: Instalar Docker, ## Paso 3: Verificar Docker

## Internal Import Graph

- `examples/javascript-master/src/demo.ts` -> `examples/javascript-master/src/binary/decode-gps.js`
- `examples/javascript-master/src/demo.ts` -> `examples/javascript-master/src/domain/delivery-status.ts`
- `examples/javascript-master/src/demo.ts` -> `examples/javascript-master/src/platform/time.js`
- `examples/javascript-master/src/demo.ts` -> `examples/javascript-master/src/routing/route-strategy.js`
- `examples/javascript-master/src/demo.ts` -> `examples/javascript-master/src/validation/tracking-code.js`
- `examples/javascript-master/src/domain/contracts.test.ts` -> `examples/javascript-master/src/domain/delivery-status.ts`
- `examples/javascript-master/src/main.ts` -> `examples/javascript-master/src/location/watch-location.js`
- `examples/javascript-master/src/main.ts` -> `examples/javascript-master/src/realtime/tracking-socket.js`
- `examples/javascript-master/src/main.ts` -> `examples/javascript-master/src/route-client.ts`
- `examples/javascript-master/src/main.ts` -> `examples/javascript-master/src/storage/delivery-draft.js`
- `examples/javascript-master/src/main.ts` -> `examples/javascript-master/src/ui/delivery-button.ts`
- `examples/javascript-master/src/ui/delivery-button.test.ts` -> `examples/javascript-master/src/ui/delivery-button.ts`
- `examples/node-federation/federation.test.mjs` -> `examples/node-federation/server.mjs`
- `web/src/app/app.config.ts` -> `web/src/app/app.routes.ts`
- `web/src/app/app.routes.ts` -> `web/src/app/catalog/course-catalog.ts`
- `web/src/app/app.routes.ts` -> `web/src/app/course/course-shell.ts`
- `web/src/app/app.routes.ts` -> `web/src/app/course/lesson-viewer.ts`
- `web/src/app/app.spec.ts` -> `web/src/app/app.routes.ts`
- `web/src/app/app.spec.ts` -> `web/src/app/app.ts`
- `web/src/app/app.spec.ts` -> `web/src/app/catalog/course-catalog.ts`
- `web/src/app/app.spec.ts` -> `web/src/app/content.service.ts`
- `web/src/app/app.spec.ts` -> `web/src/app/course-data.ts`
- `web/src/app/app.ts` -> `web/src/app/command-palette.ts`
- `web/src/app/command-palette.ts` -> `web/src/app/command-palette.service.ts`
- `web/src/app/command-palette.ts` -> `web/src/app/course-data.ts`
- `web/src/app/command-palette.ts` -> `web/src/app/topic-index.service.ts`
- `web/src/app/course-data.ts` -> `web/src/app/course-module.model.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/android.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/angular.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/devops.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/flutter.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/foundations.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/ios.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/java.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/javascript.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/kotlin-multiplatform.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/node.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/react.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/rutaflow.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/spring-boot.track.ts`
- `web/src/app/course/course-shell.ts` -> `web/src/app/course/lesson-index.ts`
- `web/src/app/learning-activities.spec.ts` -> `web/src/app/learning-activities.ts`
- `web/src/app/progress.service.spec.ts` -> `web/src/app/progress.service.ts`
- `web/src/app/project-bootstrap.spec.ts` -> `web/src/app/course-data.ts`
- `web/src/app/project-bootstrap.spec.ts` -> `web/src/app/project-bootstrap.ts`
- `web/src/main.ts` -> `web/src/app/app.config.ts`
- `web/src/main.ts` -> `web/src/app/app.ts`

## Most Connected Files

- `web/src/app/course-data.ts`: in=3, out=14
- `web/src/app/app.routes.ts`: in=2, out=3
- `web/src/app/app.spec.ts`: in=0, out=5
- `examples/javascript-master/src/main.ts`: in=0, out=5
- `examples/javascript-master/src/demo.ts`: in=0, out=5
- `web/src/app/command-palette.ts`: in=1, out=3
- `web/src/app/app.ts`: in=2, out=1
- `web/src/app/catalog/course-catalog.ts`: in=2, out=0
- `examples/javascript-master/src/ui/delivery-button.ts`: in=2, out=0
- `examples/javascript-master/src/domain/delivery-status.ts`: in=2, out=0
- `web/src/app/course/course-shell.ts`: in=1, out=1
- `web/src/app/app.config.ts`: in=1, out=1
- `web/src/main.ts`: in=0, out=2
- `web/src/app/project-bootstrap.spec.ts`: in=0, out=2
- `web/src/app/tracks/spring-boot.track.ts`: in=1, out=0
- `web/src/app/tracks/rutaflow.track.ts`: in=1, out=0
- `web/src/app/tracks/react.track.ts`: in=1, out=0
- `web/src/app/tracks/node.track.ts`: in=1, out=0
- `web/src/app/tracks/kotlin-multiplatform.track.ts`: in=1, out=0
- `web/src/app/tracks/javascript.track.ts`: in=1, out=0

## Files By Area


### angular-app

- `web/src/app/app.config.ts` (12 lines) - imports: @angular/core, @angular/router, ./app.routes
- `web/src/app/app.html` (4 lines)
- `web/src/app/app.routes.ts` (27 lines) - imports: @angular/router, ./catalog/course-catalog, ./course/course-shell, ./course/lesson-viewer
- `web/src/app/app.spec.ts` (185 lines) - imports: @angular/core/testing, @angular/router, @angular/router/testing, ./app, ./app.routes, ./catalog/course-catalog, ./content.service, ./course-data
- `web/src/app/app.ts` (11 lines) - symbols: App; imports: @angular/core, @angular/router, ./command-palette
- `web/src/app/catalog/course-catalog.html` (91 lines) - symbols: main-content, catalog-title, tracks-title, official-title
- `web/src/app/catalog/course-catalog.scss` (198 lines)
- `web/src/app/catalog/course-catalog.ts` (90 lines) - symbols: CourseCatalogComponent, cards, featuredTracks, foundationTracks, mobileTracks, totalModules; imports: @angular/common, @angular/core, @angular/router, lucide-angular, ../course-data, ../icon-registry, ../official-updates, ../progress.service
- `web/src/app/command-palette.html` (29 lines) - symbols: palette-title, palette-results
- `web/src/app/command-palette.scss` (31 lines)
- `web/src/app/command-palette.service.ts` (11 lines) - symbols: CommandPaletteService, isOpen; imports: @angular/core
- `web/src/app/command-palette.ts` (129 lines) - symbols: CommandPaletteComponent, query, activeIndex, activeResultId, index, results; imports: @angular/common, @angular/core, @angular/forms, @angular/router, lucide-angular, ./course-data, ./command-palette.service, ./topic-index.service
- `web/src/app/content.service.ts` (22 lines) - symbols: ContentService; imports: @angular/core, marked
- `web/src/app/course-data.ts` (883 lines) - symbols: ServiceGroup, CloudComparison, AltCloudGroup; imports: ./course-module.model, ./tracks/devops.track, ./tracks/javascript.track, ./tracks/node.track, ./tracks/angular.track, ./tracks/react.track, ./tracks/java.track, ./tracks/spring-boot.track
- `web/src/app/course-module.model.ts` (34 lines) - symbols: CourseModule, Track
- `web/src/app/course/course-shell.html` (53 lines) - symbols: official-path-title, main-content
- `web/src/app/course/course-shell.scss` (86 lines)
- `web/src/app/course/course-shell.ts` (59 lines) - symbols: CourseShellComponent, track, officialPath, sidebarOpen, trackLogo, percent; imports: @angular/common, @angular/core, @angular/core/rxjs-interop, @angular/router, lucide-angular, rxjs, ../course-data, ../command-palette.service
- ... 35 more files

### automation-script

- `scripts/audit_code_visual_quality.py` (128 lines) - symbols: student_visible_content, structural_text, blocks, evaluate, build, render, main; imports: __future__, argparse, json, re, collections, pathlib
- `scripts/audit_seven_step_methodology.py` (136 lines) - symbols: matches, evaluate, build, render_markdown, main; imports: __future__, argparse, json, re, collections, pathlib, audit_topic_learning_quality
- `scripts/audit_student_journey.py` (157 lines) - symbols: structural_text, topic_blocks, has, build_report, render, main; imports: __future__, json, re, collections, pathlib
- `scripts/audit_topic_learning_quality.py` (187 lines) - symbols: student_visible_content, structural_text, topic_blocks, evaluate, classify, demo_signature, build, render_markdown; imports: __future__, argparse, json, re, collections, pathlib
- `scripts/audit_unexplained_terms.py` (222 lines) - symbols: student_visible_content, structural_text, topic_blocks, extract_terminal_terms, term_is_explained, build, render_markdown, main; imports: __future__, argparse, json, re, collections, pathlib
- `scripts/build_editorial_backlog.py` (97 lines) - symbols: render, main; imports: __future__, argparse, pathlib, audit_topic_learning_quality
- `scripts/build_prerequisite_graph.py` (114 lines) - symbols: topics_for, build, render, main; imports: __future__, argparse, json, re, pathlib
- `scripts/build_repo_graph.py` (464 lines) - symbols: FileNode, repo_files, read_text, classify, parse_ts_symbols, parse_ts_imports, parse_python_symbols, parse_python_imports; imports: __future__, argparse, ast, json, re, subprocess, collections, dataclasses
- `scripts/build_web_topic_index.py` (75 lines) - symbols: slugify, clean_topic_title, main; imports: __future__, json, re, sys, unicodedata, collections, pathlib
- `scripts/catalog_external_library.py` (49 lines) - symbols: main; imports: argparse, hashlib, json, pathlib, pymupdf
- `scripts/complete_rutaflow_methodology.py` (44 lines) - symbols: blocks, topic_name, methodology, main; imports: pathlib, re
- `scripts/create_delivery_modules.py` (61 lines) - symbols: render; imports: pathlib
- `scripts/create_master_gap_modules.py` (84 lines) - symbols: render; imports: pathlib, json
- `scripts/create_rutaflow_content.py` (104 lines) - symbols: render; imports: pathlib
- `scripts/enrich_official_topic_atlas.py` (127 lines) - symbols: block; imports: pathlib, json
- `scripts/enrich_official_updates.py` (97 lines) - imports: pathlib
- `scripts/enrich_rutaflow_projects.py` (15 lines)
- `scripts/fix_lessons.py` (229 lines) - symbols: safe_print, iter_text_check_files, find_text_quality_issues, normalized_content, fix_content, check_http, main; imports: ast, argparse, glob, os, re, urllib.request
- ... 15 more files

### course-content

- `web/public/content/ATRIBUCION.md` (20 lines) - headings: # Atribucion y licencia
- `web/public/content/LICENSE-FLOCI.txt` (21 lines)
- `web/public/content/android/modulo-0.md` (402 lines) - headings: # Módulo 0: Kotlin aplicado a Android, ## Antes de comenzar: instala Android Studio y un dispositivo de prueba, ## Aprende construyendo, ### Tema 1: Estructura de un proyecto Android Studio
- `web/public/content/android/modulo-1.md` (343 lines) - headings: # Módulo 1: Ciclo de vida: Activities y ViewModel, ## Aprende construyendo, ### Tema 1: Ciclo de vida de una Activity, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-10.md` (408 lines) - headings: # Módulo 10: Performance, Material 3 y accesibilidad, ## Aprende construyendo, ### Tema 1: Detectar y corregir recomposición innecesaria, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-11.md` (317 lines) - headings: # Módulo 11: Publicación en Google Play, ## Aprende construyendo, ### Tema 1: Firma de la app, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-12.md` (328 lines) - headings: # Módulo 12: Proyecto integrador: app Android completa, ## Aprende construyendo, ### Tema 1: Arquitectura MVVM completa con UDF, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-13.md` (565 lines) - headings: # Módulo 13: Android en producción — seguridad, sincronización y calidad, ## Aprende construyendo, ### Tema 1: El sistema operativo conecta tu app con entradas externas, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-14.md` (813 lines) - headings: # Módulo 14: Compose Master — pruebas, accesibilidad y animación, ## Aprende construyendo, ### Tema 1: ComposeTestRule ejecuta tu UI sin emulador visible, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-2.md` (366 lines) - headings: # Módulo 2: Jetpack Compose: UI declarativa, ## Aprende construyendo, ### Tema 1: Composables y recomposición, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-3.md` (453 lines) - headings: # Módulo 3: Navegación con Navigation Compose, ## Aprende construyendo, ### Tema 1: NavHost y NavController, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-4.md` (369 lines) - headings: # Módulo 4: Estado con StateFlow y Compose, ## Aprende construyendo, ### Tema 1: StateFlow en el ViewModel, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-5.md` (365 lines) - headings: # Módulo 5: Networking con Retrofit/Ktor, ## Aprende construyendo, ### Tema 1: Retrofit con coroutines, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-6.md` (382 lines) - headings: # Módulo 6: Persistencia local con Room, ## Aprende construyendo, ### Tema 1: Entities, DAOs y Database, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-7.md` (388 lines) - headings: # Módulo 7: Inyección de dependencias con Hilt, ## Aprende construyendo, ### Tema 1: Configuración básica de Hilt, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-8.md` (376 lines) - headings: # Módulo 8: Trabajo en segundo plano, ## Aprende construyendo, ### Tema 1: CoroutineWorker y garantía de ejecución, #### Paso 1 · Objetivo y preparación
- `web/public/content/android/modulo-9.md` (403 lines) - headings: # Módulo 9: Testing en Android, ## Aprende construyendo, ### Tema 1: Testing de ViewModels con fakes y runTest, #### Paso 1 · Objetivo y preparación
- `web/public/content/angular/modulo-0.md` (654 lines) - headings: # Módulo 0: Fundamentos y Angular CLI, ## Antes de comenzar: prepara tu equipo desde cero, ### Windows, ### macOS
- ... 330 more files

### documentation

- `CLAUDE.md` (118 lines) - headings: # CLAUDE.md, ## What this is, ## First step for any repo exploration, ## Commands
- `README.md` (260 lines) - headings: # Academia_Floci, ## Como empezar, ## Levantar Floci, # 1. Levantar todos los servicios
- `docs/ESTANDAR-DE-CODIGO.md` (56 lines) - headings: # Estándar transversal de código y diseño, ## Prioridades, ## Clean Code con criterio, ## SOLID cuando aporta valor
- `docs/FASE-3-STATUS.md` (295 lines) - headings: # Fase 3 — Estado de Implementación, ## Part 2: Runbooks Operacionales — ✅ COMPLETADO (30h, 30 temas), ### Cloud Runbooks (15 temas, 15h) — ✅ ENTREGADOS, ### DevOps Runbooks (15 temas, 15h) — ✅ ENTREGADOS
- `docs/MATRIZ-CURRICULAR.md` (71 lines) - headings: # Matriz curricular auditable, ## Progresión de competencia, ## Cobertura por módulo, ## Método de evaluación
- `docs/METODOLOGIA-DE-APRENDIZAJE.md` (57 lines) - headings: # Metodología Aprende construyendo, ## Ciclo de cada capítulo, ## Tamaño de las experiencias, ## Regla para mostrar soluciones
- `docs/PLANTILLA-LECCION.md` (105 lines) - headings: # Plantilla de Lección — Prompt Maestro para Claude / Codex, ## PROMPT MAESTRO (copiar desde aquí), ## DATOS DE LA LECCIÓN, ## REGLAS DE ESTILO
- `docs/RUNBOOKS-CLOUD.md` (1633 lines) - headings: # Cloud Runbooks — Troubleshooting Operacional, ## Runbook 1: DynamoDB Throttling, ### Síntomas, ### Diagnosis
- `docs/RUNBOOKS-DEVOPS.md` (1409 lines) - headings: # DevOps Runbooks — Troubleshooting Operacional, ## Runbook 1: Docker Image Build Failures, ### Síntomas, ### Diagnosis
- `docs/biblioteca/clean-code.md` (30 lines) - headings: # Identificación e índice: Código limpio, ## Temas localizados en el índice, pendientes de lectura
- `docs/biblioteca/cola.md` (78 lines) - headings: # Cola de revisión libro por libro
- `docs/biblioteca/shvets-patrones.md` (33 lines) - headings: # Revisión parcial: Sumérgete en los patrones de diseño, ## Alcance comprobado, ## Hallazgos aplicados, ## Temas del índice aún por revisar
- `docs/code-visual-quality.md` (26 lines) - headings: # Auditoría de código y visuales, ## Regla editorial
- `docs/editorial-backlog.md` (46 lines) - headings: # Deuda editorial verificable, ## Estado global, ## Prioridad por track, ## Pendientes por tema
- `docs/editorial-contract.md` (46 lines) - headings: # Contrato editorial de Academia Floci, ## Unidad mínima: un tema explicado y practicable, ## Progresión de libro, ## Código y recursos visuales
- `docs/integracion-biblioteca-externa-progreso.md` (205 lines) - headings: # Integración de biblioteca externa y capturas — progreso, ## Fase 1 — Capturas de `~/Downloads` (COMPLETA), ### Alta relevancia — material listo para integrar, ### Relevancia media — confirma contenido existente, sin acción requerida
- `docs/plan-de-mejora-2026-10.md` (158 lines) - headings: # Plan de mejora — octubre 2026, ## 1. Técnico — ya resuelto hoy, ## 2. Contenido editorial — lo que de verdad falta, ### Por qué importa arrancar por Cloud
- `docs/prerequisite-graph.md` (40 lines) - headings: # Grafo de prerrequisitos, ## Dependencias entre libros, ## Cobertura
- ... 103 more files

### example

- `examples/README.md` (129 lines) - headings: # Ejemplos de referencia, ## Ejemplos por operación (node/, python/, java/, go/, rust/), # Node.js (requiere: npm install en examples/node/), # Python (requiere: pip install boto3)
- `examples/cloud-http/server.mjs` (11 lines) - imports: node:http
- `examples/devops-health/.env.example` (2 lines)
- `examples/devops-health/.gitignore` (3 lines)
- `examples/devops-health/Dockerfile` (8 lines)
- `examples/devops-health/compose.yaml` (29 lines)
- `examples/devops-health/package.json` (2 lines)
- `examples/devops-health/server.mjs` (18 lines) - imports: node:http, pg
- `examples/flutter-testing/.gitignore` (3 lines)
- `examples/flutter-testing/l10n.yaml` (5 lines)
- `examples/flutter-testing/lib/buscador_envios.dart` (41 lines)
- `examples/flutter-testing/lib/l10n/generated/app_localizations.dart` (141 lines)
- `examples/flutter-testing/lib/l10n/generated/app_localizations_en.dart` (14 lines)
- `examples/flutter-testing/lib/l10n/generated/app_localizations_es.dart` (14 lines)
- `examples/flutter-testing/lib/main.dart` (13 lines)
- `examples/flutter-testing/pubspec.yaml` (17 lines)
- `examples/flutter-testing/test/buscador_envios_test.dart` (32 lines)
- `examples/flutter-testing/test/l10n_test.dart` (16 lines)
- ... 291 more files

### local-infra

- `docker-compose.yml` (47 lines)

### project-file

- `.env.example` (8 lines)
- `.github/workflows/ci.yml` (60 lines)
- `.gitignore` (27 lines)
- `docs/biblioteca/catalogo.json` (564 lines)
- `docs/code-visual-quality.json` (2779 lines)
- `docs/curriculum-matrix.json` (155 lines)
- `docs/floci-official-curriculum.json` (14 lines)
- `docs/official-learning-guides.json` (22 lines)
- `docs/official-sources.json` (195 lines)
- `docs/official-topic-atlas.json` (175 lines)
- `docs/prerequisite-graph.json` (10293 lines)
- `docs/requested-master-topics.json` (189 lines)
- `docs/revision-stacks-inventario-2026-10-11.json` (25528 lines)
- `docs/revision-stacks-reproducciones-2026-10-11.json` (41 lines)
- `docs/seven-step-methodology.json` (24625 lines)
- `docs/specialization-outcomes.json` (117 lines)
- `docs/student-journey-audit.json` (3062 lines)
- `docs/topic-learning-quality.json` (20841 lines)
- ... 21 more files
