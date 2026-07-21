# Academia Floci Repo Graph

Generated: 2026-07-21 08:34 UTC
Root: `Academia_Floci`
Indexed files: 782
Import edges: 33

Use this file as the first, compact context for AI assistants. Refresh it with:

```bash
python3 scripts/build_repo_graph.py --json docs/repo-graph.json
```

For automated lookups, use `docs/repo-graph.json`.

## Project Shape

- `angular-app`: 53 files
- `automation-script`: 28 files
- `course-content`: 347 files
- `documentation`: 104 files
- `example`: 216 files
- `local-infra`: 1 files
- `project-file`: 33 files

## File Types

- `.md`: 442
- `.py`: 58
- `.ts`: 48
- `.js`: 42
- `.java`: 40
- `.json`: 28
- `.go`: 24
- `.rs`: 24
- `.kt`: 11
- `.html`: 8
- `.scss`: 7
- `.yml`: 6
- `.sh`: 6
- `.dart`: 6
- `.swift`: 6
- `.jsx`: 5
- `.yaml`: 4
- `.tf`: 4
- `.txt`: 4
- `.example`: 2
- `.gitignore`: 2
- `.mjs`: 2
- `.css`: 2
- `Dockerfile`: 1

## High Signal Files

- `README.md` (257 lines, documentation)
  - headings: # Academia_Floci, ## Como empezar, ## Levantar Floci, # 1. Levantar todos los servicios, # 2. Verificar Floci AWS
- `scripts/validate.sh` (127 lines, automation-script)
- `scripts/build_repo_graph.py` (464 lines, automation-script)
  - symbols: FileNode, repo_files, read_text, classify, parse_ts_symbols, parse_ts_imports, parse_python_symbols, parse_python_imports, parse_markdown_headings, unique
- `web/src/app/app.ts` (11 lines, angular-app)
  - symbols: App
- `web/src/app/course-data.ts` (883 lines, angular-app)
  - symbols: ServiceGroup, CloudComparison, AltCloudGroup
- `web/src/app/catalog/course-catalog.ts` (90 lines, angular-app)
  - symbols: CourseCatalogComponent, cards, featuredTracks, foundationTracks, mobileTracks, totalModules
- `web/src/app/course/course-shell.ts` (46 lines, angular-app)
  - symbols: CourseShellComponent, track, officialPath, sidebarOpen, trackLogo, percent
- `web/src/app/course/lesson-viewer.ts` (679 lines, angular-app)
  - symbols: LessonViewerComponent, TocItem, track, module, officialSource, projectBootstrap, trackProject, showProjectBootstrap, showTrackProject, moduleIndex
- `web/public/content/manifest.json` (819 lines, course-content)
- `web/public/content/es/pasos.md` (1122 lines, course-content)
  - headings: # 45 pasos de Academia Floci, ## Cursos, ## Paso 1: ¿Qué es Docker?, ## Paso 2: Instalar Docker, ## Paso 3: Verificar Docker

## Internal Import Graph

- `web/src/app/app.config.ts` -> `web/src/app/app.routes.ts`
- `web/src/app/app.routes.ts` -> `web/src/app/catalog/course-catalog.ts`
- `web/src/app/app.routes.ts` -> `web/src/app/course/course-shell.ts`
- `web/src/app/app.routes.ts` -> `web/src/app/course/lesson-viewer.ts`
- `web/src/app/app.spec.ts` -> `web/src/app/app.routes.ts`
- `web/src/app/app.spec.ts` -> `web/src/app/app.ts`
- `web/src/app/app.spec.ts` -> `web/src/app/catalog/course-catalog.ts`
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
- `web/src/app/command-palette.ts`: in=1, out=3
- `web/src/app/app.spec.ts`: in=0, out=4
- `web/src/app/app.ts`: in=2, out=1
- `web/src/app/catalog/course-catalog.ts`: in=2, out=0
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
- `web/src/app/tracks/java.track.ts`: in=1, out=0
- `web/src/app/tracks/ios.track.ts`: in=1, out=0
- `web/src/app/tracks/foundations.track.ts`: in=1, out=0
- `web/src/app/tracks/flutter.track.ts`: in=1, out=0

## Files By Area


### angular-app

- `web/src/app/app.config.ts` (12 lines) - imports: @angular/core, @angular/router, ./app.routes
- `web/src/app/app.html` (4 lines)
- `web/src/app/app.routes.ts` (27 lines) - imports: @angular/router, ./catalog/course-catalog, ./course/course-shell, ./course/lesson-viewer
- `web/src/app/app.spec.ts` (155 lines) - imports: @angular/core/testing, @angular/router, @angular/router/testing, ./app, ./app.routes, ./catalog/course-catalog, ./course-data
- `web/src/app/app.ts` (11 lines) - symbols: App; imports: @angular/core, @angular/router, ./command-palette
- `web/src/app/catalog/course-catalog.html` (91 lines) - symbols: main-content, catalog-title, tracks-title, official-title
- `web/src/app/catalog/course-catalog.scss` (198 lines)
- `web/src/app/catalog/course-catalog.ts` (90 lines) - symbols: CourseCatalogComponent, cards, featuredTracks, foundationTracks, mobileTracks, totalModules; imports: @angular/common, @angular/core, @angular/router, lucide-angular, ../course-data, ../icon-registry, ../official-updates, ../progress.service
- `web/src/app/command-palette.html` (25 lines) - symbols: palette-title
- `web/src/app/command-palette.scss` (30 lines)
- `web/src/app/command-palette.service.ts` (11 lines) - symbols: CommandPaletteService, isOpen; imports: @angular/core
- `web/src/app/command-palette.ts` (90 lines) - symbols: CommandPaletteComponent, query, index, results; imports: @angular/common, @angular/core, @angular/forms, @angular/router, lucide-angular, ./course-data, ./command-palette.service, ./topic-index.service
- `web/src/app/content.service.ts` (22 lines) - symbols: ContentService; imports: @angular/core, marked
- `web/src/app/course-data.ts` (883 lines) - symbols: ServiceGroup, CloudComparison, AltCloudGroup; imports: ./course-module.model, ./tracks/devops.track, ./tracks/javascript.track, ./tracks/node.track, ./tracks/angular.track, ./tracks/react.track, ./tracks/java.track, ./tracks/spring-boot.track
- `web/src/app/course-module.model.ts` (34 lines) - symbols: CourseModule, Track
- `web/src/app/course/course-shell.html` (53 lines) - symbols: official-path-title, main-content
- `web/src/app/course/course-shell.scss` (80 lines)
- `web/src/app/course/course-shell.ts` (46 lines) - symbols: CourseShellComponent, track, officialPath, sidebarOpen, trackLogo, percent; imports: @angular/common, @angular/core, @angular/core/rxjs-interop, @angular/router, lucide-angular, rxjs, ../course-data, ../command-palette.service
- ... 35 more files

### automation-script

- `scripts/audit_code_visual_quality.py` (128 lines) - symbols: student_visible_content, structural_text, blocks, evaluate, build, render, main; imports: __future__, argparse, json, re, collections, pathlib
- `scripts/audit_seven_step_methodology.py` (136 lines) - symbols: matches, evaluate, build, render_markdown, main; imports: __future__, argparse, json, re, collections, pathlib, audit_topic_learning_quality
- `scripts/audit_student_journey.py` (157 lines) - symbols: structural_text, topic_blocks, has, build_report, render, main; imports: __future__, json, re, collections, pathlib
- `scripts/audit_topic_learning_quality.py` (155 lines) - symbols: student_visible_content, structural_text, topic_blocks, evaluate, classify, build, render_markdown, main; imports: __future__, argparse, json, re, collections, pathlib
- `scripts/build_editorial_backlog.py` (101 lines) - symbols: render, main; imports: __future__, argparse, collections, pathlib, audit_topic_learning_quality
- `scripts/build_prerequisite_graph.py` (114 lines) - symbols: topics_for, build, render, main; imports: __future__, argparse, json, re, pathlib
- `scripts/build_repo_graph.py` (464 lines) - symbols: FileNode, repo_files, read_text, classify, parse_ts_symbols, parse_ts_imports, parse_python_symbols, parse_python_imports; imports: __future__, argparse, ast, json, re, subprocess, collections, dataclasses
- `scripts/build_web_topic_index.py` (75 lines) - symbols: slugify, clean_topic_title, main; imports: __future__, json, re, sys, unicodedata, collections, pathlib
- `scripts/create_delivery_modules.py` (61 lines) - symbols: render; imports: pathlib
- `scripts/create_master_gap_modules.py` (84 lines) - symbols: render; imports: pathlib, json
- `scripts/create_rutaflow_content.py` (104 lines) - symbols: render; imports: pathlib
- `scripts/enrich_official_topic_atlas.py` (127 lines) - symbols: block; imports: pathlib, json
- `scripts/enrich_official_updates.py` (97 lines) - imports: pathlib
- `scripts/enrich_rutaflow_projects.py` (61 lines) - imports: pathlib
- `scripts/fix_lessons.py` (205 lines) - symbols: safe_print, iter_text_check_files, find_text_quality_issues, normalized_content, fix_content, check_http, main; imports: argparse, glob, os, re, urllib.request
- `scripts/fix_misleading_diagram_labels.py` (43 lines) - symbols: replace, main; imports: __future__, re, pathlib
- `scripts/start.sh` (10 lines)
- `scripts/validate-floci.sh` (43 lines)
- ... 10 more files

### course-content

- `web/public/content/ATRIBUCION.md` (20 lines) - headings: # Atribucion y licencia
- `web/public/content/LICENSE-FLOCI.txt` (21 lines)
- `web/public/content/android/modulo-0.md` (169 lines) - headings: # Módulo 0: Kotlin aplicado a Android, ## Antes de comenzar: instala Android Studio y un dispositivo de prueba, ## Aprende construyendo, ### Tema 1: Estructura de un proyecto Android Studio
- `web/public/content/android/modulo-1.md` (126 lines) - headings: # Módulo 1: Ciclo de vida: Activities y ViewModel, ## Aprende construyendo, ### Tema 1: Ciclo de vida de una Activity, ### Tema 2: ViewModel sobrevive a la rotación
- `web/public/content/android/modulo-10.md` (116 lines) - headings: # Módulo 10: Performance, Material 3 y accesibilidad, ## Aprende construyendo, ### Tema 1: Detectar y corregir recomposición innecesaria, ### Tema 2: Baseline Profiles y ciclo de efectos
- `web/public/content/android/modulo-11.md` (141 lines) - headings: # Módulo 11: Publicación en Google Play, ## Aprende construyendo, ### Tema 1: Firma de la app, ### Tema 2: App Bundle vs APK
- `web/public/content/android/modulo-12.md` (159 lines) - headings: # Módulo 12: Proyecto integrador: app Android completa, ## Aprende construyendo, ### Tema 1: Arquitectura MVVM completa con UDF, ### Tema 2: Inyección de dependencias en toda la app
- `web/public/content/android/modulo-13.md` (247 lines) - headings: # Módulo 13: Android en producción — seguridad, sincronización y calidad, ## Aprende construyendo, ### Tema 1: El sistema operativo conecta tu app con entradas externas, ### Tema 2: Proteger datos exige conocer copias y ciclo de vida
- `web/public/content/android/modulo-14.md` (157 lines) - headings: # Módulo 14: Compose Master: pruebas, accesibilidad y animación, ## Aprende construyendo, ### Tema 1: ComposeTestRule, ### Tema 2: Finders, assertions y actions
- `web/public/content/android/modulo-2.md` (141 lines) - headings: # Módulo 2: Jetpack Compose: UI declarativa, ## Aprende construyendo, ### Tema 1: Composables y recomposición, #### Qué hace realmente `@Composable`
- `web/public/content/android/modulo-3.md` (146 lines) - headings: # Módulo 3: Navegación con Navigation Compose, ## Aprende construyendo, ### Tema 1: NavHost y NavController, ### Tema 2: Argumentos tipados y deep links
- `web/public/content/android/modulo-4.md` (144 lines) - headings: # Módulo 4: Estado con StateFlow y Compose, ## Aprende construyendo, ### Tema 1: StateFlow en el ViewModel, ### Tema 2: collectAsStateWithLifecycle y UDF
- `web/public/content/android/modulo-5.md` (144 lines) - headings: # Módulo 5: Networking con Retrofit/Ktor, ## Aprende construyendo, ### Tema 1: Retrofit con coroutines, ### Tema 2: Manejo de errores HTTP
- `web/public/content/android/modulo-6.md` (149 lines) - headings: # Módulo 6: Persistencia local con Room, ## Aprende construyendo, ### Tema 1: Entities, DAOs y Database, ### Tema 2: Room + Flow reactivo, y migraciones
- `web/public/content/android/modulo-7.md` (142 lines) - headings: # Módulo 7: Inyección de dependencias con Hilt, ## Aprende construyendo, ### Tema 1: Configuración básica de Hilt, ### Tema 2: @Provides y @Binds
- `web/public/content/android/modulo-8.md` (140 lines) - headings: # Módulo 8: Trabajo en segundo plano, ## Aprende construyendo, ### Tema 1: CoroutineWorker y garantía de ejecución, ### Tema 2: Constraints y trabajo periódico
- `web/public/content/android/modulo-9.md` (147 lines) - headings: # Módulo 9: Testing en Android, ## Aprende construyendo, ### Tema 1: Testing de ViewModels con fakes y runTest, ### Tema 2: Compose UI Testing
- `web/public/content/angular/modulo-0.md` (293 lines) - headings: # Módulo 0: Fundamentos y Angular CLI, ## Antes de comenzar: prepara tu equipo desde cero, ### Windows, ### macOS
- ... 329 more files

### documentation

- `CLAUDE.md` (118 lines) - headings: # CLAUDE.md, ## What this is, ## First step for any repo exploration, ## Commands
- `README.md` (257 lines) - headings: # Academia_Floci, ## Como empezar, ## Levantar Floci, # 1. Levantar todos los servicios
- `docs/ESTANDAR-DE-CODIGO.md` (56 lines) - headings: # Estándar transversal de código y diseño, ## Prioridades, ## Clean Code con criterio, ## SOLID cuando aporta valor
- `docs/MATRIZ-CURRICULAR.md` (71 lines) - headings: # Matriz curricular auditable, ## Progresión de competencia, ## Cobertura por módulo, ## Método de evaluación
- `docs/METODOLOGIA-DE-APRENDIZAJE.md` (57 lines) - headings: # Metodología Aprende construyendo, ## Ciclo de cada capítulo, ## Tamaño de las experiencias, ## Regla para mostrar soluciones
- `docs/PLANTILLA-LECCION.md` (105 lines) - headings: # Plantilla de Lección — Prompt Maestro para Claude / Codex, ## PROMPT MAESTRO (copiar desde aquí), ## DATOS DE LA LECCIÓN, ## REGLAS DE ESTILO
- `docs/code-visual-quality.md` (26 lines) - headings: # Auditoría de código y visuales, ## Regla editorial
- `docs/editorial-backlog.md` (45 lines) - headings: # Deuda editorial verificable, ## Estado global, ## Prioridad por track, ## Temas sin código editorial
- `docs/editorial-contract.md` (44 lines) - headings: # Contrato editorial de Academia Floci, ## Unidad mínima: un tema explicado y practicable, ## Progresión de libro, ## Código y recursos visuales
- `docs/prerequisite-graph.md` (40 lines) - headings: # Grafo de prerrequisitos, ## Dependencias entre libros, ## Cobertura
- `docs/seven-step-methodology.md` (30 lines) - headings: # Auditoría de metodología universal por tema, ## Interpretación
- `docs/student-journey-audit.md` (155 lines) - headings: # Auditoría del recorrido del estudiante, ## Instalación y primera ejecución, ## Bloqueos prioritarios por track, ### foundations
- `docs/topic-learning-quality.md` (26 lines) - headings: # Auditoría pedagógica tema por tema, ## Regla editorial
- `web/README.md` (39 lines) - headings: # Web, ## Abrir la academia, ## Que contiene, ## Archivos principales
- `web/scripts/source-docs-en/configuration/advanced/application-yml.md` (356 lines) - headings: # application.yml Reference, ## URL configuration, ## Full Reference, ### Initialization hooks
- `web/scripts/source-docs-en/configuration/application-yml.md` (7 lines) - headings: # application.yml Reference
- `web/scripts/source-docs-en/configuration/docker-compose.md` (184 lines) - headings: # Running with Docker, ## Quick Start, ## Docker Compose, ### Minimal (stateless)
- `web/scripts/source-docs-en/configuration/docker-images.md` (103 lines) - headings: # Docker Images, ## Axis 1 — Variant (what's inside), ## Axis 2 — Channel (how stable), ## Full Tag Matrix
- ... 86 more files

### example

- `examples/README.md` (129 lines) - headings: # Ejemplos de referencia, ## Ejemplos por operación (node/, python/, java/, go/, rust/), # Node.js (requiere: npm install en examples/node/), # Python (requiere: pip install boto3)
- `examples/go/apigateway_create_api.go` (43 lines)
- `examples/go/apigateway_create_resource.go` (66 lines)
- `examples/go/apigateway_put_method.go` (60 lines)
- `examples/go/dynamodb_create_table.go` (67 lines)
- `examples/go/dynamodb_delete_item.go` (48 lines)
- `examples/go/dynamodb_get_item.go` (62 lines)
- `examples/go/dynamodb_put_item.go` (58 lines)
- `examples/go/dynamodb_update_item.go` (64 lines)
- `examples/go/floci_s3_example.go` (64 lines)
- `examples/go/iam_attach_policy.go` (58 lines)
- `examples/go/iam_create_policy.go` (75 lines)
- `examples/go/iam_create_user.go` (43 lines)
- `examples/go/lambda_create_function.go` (80 lines)
- `examples/go/lambda_invoke.go` (53 lines)
- `examples/go/lambda_update.go` (76 lines)
- `examples/go/s3_create_bucket.go` (44 lines)
- `examples/go/s3_delete.go` (50 lines)
- ... 198 more files

### local-infra

- `docker-compose.yml` (47 lines)

### project-file

- `.claude/settings.local.json` (14 lines)
- `.env.example` (8 lines)
- `.github/workflows/ci.yml` (55 lines)
- `.gitignore` (25 lines)
- `docs/code-visual-quality.json` (4809 lines)
- `docs/curriculum-matrix.json` (155 lines)
- `docs/floci-official-curriculum.json` (14 lines)
- `docs/official-learning-guides.json` (22 lines)
- `docs/official-sources.json` (21 lines)
- `docs/official-topic-atlas.json` (175 lines)
- `docs/prerequisite-graph.json` (9963 lines)
- `docs/requested-master-topics.json` (189 lines)
- `docs/seven-step-methodology.json` (23845 lines)
- `docs/specialization-outcomes.json` (116 lines)
- `docs/student-journey-audit.json` (3758 lines)
- `docs/topic-learning-quality.json` (19262 lines)
- `install.sh` (99 lines)
- `web/.gitignore` (48 lines)
- ... 15 more files
