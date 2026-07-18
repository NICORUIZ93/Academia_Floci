# Academia Floci Repo Graph

Generated: 2026-07-18 05:17 UTC
Root: `Academia_Floci`
Indexed files: 787
Import edges: 33

Use this file as the first, compact context for AI assistants. Refresh it with:

```bash
python3 scripts/build_repo_graph.py --json docs/repo-graph.json
```

For automated lookups, use `docs/repo-graph.json`.

## Project Shape

- `angular-app`: 52 files
- `automation-script`: 34 files
- `course-content`: 347 files
- `documentation`: 100 files
- `example`: 215 files
- `local-infra`: 1 files
- `project-file`: 38 files

## File Types

- `.md`: 438
- `.py`: 64
- `.ts`: 47
- `.js`: 44
- `.java`: 40
- `.json`: 30
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
- `.css`: 3
- `.gitignore`: 2
- `.mjs`: 2
- `.example`: 1
- `Dockerfile`: 1

## High Signal Files

- `README.md` (301 lines, documentation)
  - headings: # Academia_Floci, ## Como empezar, ## Levantar Floci, # 1. Levantar todos los servicios, # 2. Verificar Floci AWS
- `scripts/validate.sh` (439 lines, automation-script)
- `scripts/build_repo_graph.py` (446 lines, automation-script)
  - symbols: FileNode, repo_files, read_text, classify, parse_ts_symbols, parse_ts_imports, parse_python_symbols, parse_python_imports, parse_markdown_headings, unique
- `web/index.html` (282 lines, project-file)
  - symbols: progressLabel, progressBar, openCloudLab, toggleNav, levelLabel, nextLevelLabel, xpValue, streakValue, openBadges, badgeValue
- `web/src/app/app.ts` (11 lines, angular-app)
  - symbols: App
- `web/src/app/course-data.ts` (883 lines, angular-app)
  - symbols: ServiceGroup, CloudComparison, AltCloudGroup
- `web/src/app/catalog/course-catalog.ts` (88 lines, angular-app)
  - symbols: CourseCatalogComponent, cards, featuredTracks, foundationTracks, mobileTracks, totalModules
- `web/src/app/course/course-shell.ts` (57 lines, angular-app)
  - symbols: CourseShellComponent, track, officialPath, sidebarOpen, trackLogo, percent, stats
- `web/src/app/course/lesson-viewer.ts` (622 lines, angular-app)
  - symbols: LessonViewerComponent, TocItem, track, module, projectBootstrap, moduleIndex, isCloudIntroduction, previousModule, nextModule, lessonHtml
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
- `web/src/app/course/lab-verification.spec.ts` -> `web/src/app/course/lab-verification.ts`
- `web/src/app/course/lesson-viewer.ts` -> `web/src/app/course/lab-verification.ts`
- `web/src/app/progress.service.spec.ts` -> `web/src/app/progress.service.ts`
- `web/src/app/project-bootstrap.spec.ts` -> `web/src/app/course-data.ts`
- `web/src/app/project-bootstrap.spec.ts` -> `web/src/app/project-bootstrap.ts`
- `web/src/main.ts` -> `web/src/app/app.config.ts`
- `web/src/main.ts` -> `web/src/app/app.ts`

## Most Connected Files

- `web/src/app/course-data.ts`: in=3, out=14
- `web/src/app/app.routes.ts`: in=2, out=3
- `web/src/app/app.spec.ts`: in=0, out=4
- `web/src/app/app.ts`: in=2, out=1
- `web/src/app/command-palette.ts`: in=1, out=2
- `web/src/app/course/lab-verification.ts`: in=2, out=0
- `web/src/app/catalog/course-catalog.ts`: in=2, out=0
- `web/src/app/course/lesson-viewer.ts`: in=1, out=1
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

## Files By Area


### angular-app

- `web/src/app/app.config.ts` (12 lines) - imports: @angular/core, @angular/router, ./app.routes
- `web/src/app/app.html` (3 lines)
- `web/src/app/app.routes.ts` (27 lines) - imports: @angular/router, ./catalog/course-catalog, ./course/course-shell, ./course/lesson-viewer
- `web/src/app/app.spec.ts` (157 lines) - imports: @angular/core/testing, @angular/router, @angular/router/testing, ./app, ./app.routes, ./catalog/course-catalog, ./course-data
- `web/src/app/app.ts` (11 lines) - symbols: App; imports: @angular/core, @angular/router, ./command-palette
- `web/src/app/catalog/course-catalog.html` (92 lines) - symbols: catalog-title, tracks-title, official-title
- `web/src/app/catalog/course-catalog.scss` (198 lines)
- `web/src/app/catalog/course-catalog.ts` (88 lines) - symbols: CourseCatalogComponent, cards, featuredTracks, foundationTracks, mobileTracks, totalModules; imports: @angular/common, @angular/core, @angular/router, lucide-angular, ../course-data, ../icon-registry, ../official-updates, ../progress.service
- `web/src/app/command-palette.html` (23 lines)
- `web/src/app/command-palette.scss` (30 lines)
- `web/src/app/command-palette.service.ts` (11 lines) - symbols: CommandPaletteService, isOpen; imports: @angular/core
- `web/src/app/command-palette.ts` (78 lines) - symbols: CommandPaletteComponent, query, results; imports: @angular/common, @angular/core, @angular/forms, @angular/router, lucide-angular, ./course-data, ./command-palette.service
- `web/src/app/content.service.ts` (27 lines) - symbols: ContentService; imports: @angular/core, marked
- `web/src/app/course-data.ts` (883 lines) - symbols: ServiceGroup, CloudComparison, AltCloudGroup; imports: ./course-module.model, ./tracks/devops.track, ./tracks/javascript.track, ./tracks/node.track, ./tracks/angular.track, ./tracks/react.track, ./tracks/java.track, ./tracks/spring-boot.track
- `web/src/app/course-module.model.ts` (34 lines) - symbols: CourseModule, Track
- `web/src/app/course/course-shell.html` (62 lines) - symbols: official-path-title
- `web/src/app/course/course-shell.scss` (89 lines)
- `web/src/app/course/course-shell.ts` (57 lines) - symbols: CourseShellComponent, track, officialPath, sidebarOpen, trackLogo, percent, stats; imports: @angular/common, @angular/core, @angular/core/rxjs-interop, @angular/router, lucide-angular, rxjs, ../course-data, ../command-palette.service
- ... 34 more files

### automation-script

- `scripts/audit_code_visual_quality.py` (105 lines) - symbols: blocks, evaluate, build, render, main; imports: __future__, argparse, json, re, collections, pathlib
- `scripts/audit_student_journey.py` (146 lines) - symbols: topic_blocks, has, build_report, render, main; imports: __future__, json, re, collections, pathlib
- `scripts/audit_topic_learning_quality.py` (123 lines) - symbols: topic_blocks, evaluate, classify, build, render_markdown, main; imports: __future__, argparse, json, re, collections, pathlib
- `scripts/build_curriculum.py` (273 lines) - symbols: source_text, normalize_ascii, clean_module_name, parse_curriculum, js_string, render_app_data, main; imports: __future__, json, re, pathlib
- `scripts/build_definitive_topic_registry.py` (95 lines) - symbols: clean, fold, module_number; imports: pathlib, argparse, json, re, unicodedata
- `scripts/build_repo_graph.py` (446 lines) - symbols: FileNode, repo_files, read_text, classify, parse_ts_symbols, parse_ts_imports, parse_python_symbols, parse_python_imports; imports: __future__, argparse, ast, json, re, collections, dataclasses, datetime
- `scripts/build_requested_practical_examples.py` (142 lines) - symbols: fold, parse_source, module_for, identifier, example, render, main; imports: __future__, argparse, json, re, unicodedata, difflib, pathlib
- `scripts/build_supplemental_topic_registry.py` (116 lines) - symbols: fold, module_id; imports: pathlib, argparse, json, re, unicodedata
- `scripts/build_web_topic_index.py` (72 lines) - symbols: slugify, clean_topic_title, main; imports: __future__, json, re, sys, unicodedata, collections, pathlib
- `scripts/create_delivery_modules.py` (126 lines) - symbols: render; imports: pathlib
- `scripts/create_master_gap_modules.py` (150 lines) - symbols: render; imports: pathlib, json
- `scripts/create_rutaflow_content.py` (178 lines) - symbols: render; imports: pathlib
- `scripts/enrich_code_quality.py` (44 lines) - imports: pathlib
- `scripts/enrich_curriculum_sections.py` (172 lines) - symbols: bibliography, project_path; imports: pathlib
- `scripts/enrich_from_zero_guides.py` (203 lines) - symbols: TrackGuide, topic_blocks, slug, extract_evaluation, render, main; imports: __future__, argparse, re, dataclasses, pathlib
- `scripts/enrich_official_topic_atlas.py` (127 lines) - symbols: block; imports: pathlib, json
- `scripts/enrich_official_updates.py` (97 lines) - imports: pathlib
- `scripts/enrich_rutaflow_projects.py` (61 lines) - imports: pathlib
- ... 16 more files

### course-content

- `web/public/content/ATRIBUCION.md` (20 lines) - headings: # Atribucion y licencia
- `web/public/content/LICENSE-FLOCI.txt` (21 lines)
- `web/public/content/android/modulo-0.md` (359 lines) - headings: # Módulo 0: Kotlin aplicado a Android, ## Sílabo, ## Comienza desde cero: prepara este capítulo, ### 1. Comprueba las herramientas
- `web/public/content/android/modulo-1.md` (315 lines) - headings: # Módulo 1: Ciclo de vida: Activities y ViewModel, ## Sílabo, ## Comienza desde cero: prepara este capítulo, ### 1. Comprueba las herramientas
- `web/public/content/android/modulo-10.md` (311 lines) - headings: # Módulo 10: Performance, Material 3 y accesibilidad, ## Sílabo, ## Comienza desde cero: prepara este capítulo, ### 1. Comprueba las herramientas
- `web/public/content/android/modulo-11.md` (330 lines) - headings: # Módulo 11: Publicación en Google Play, ## Sílabo, ## Comienza desde cero: prepara este capítulo, ### 1. Comprueba las herramientas
- `web/public/content/android/modulo-12.md` (348 lines) - headings: # Módulo 12: Proyecto integrador: app Android completa, ## Sílabo, ## Comienza desde cero: prepara este capítulo, ### 1. Comprueba las herramientas
- `web/public/content/android/modulo-13.md` (397 lines) - headings: # Módulo 13: Android en producción — seguridad, sincronización y calidad, ## Sílabo, ## Comienza desde cero: prepara este capítulo, ### 1. Comprueba las herramientas
- `web/public/content/android/modulo-14.md` (1041 lines) - headings: # Módulo 14: Compose Master: pruebas, accesibilidad y animación, ## Sílabo, ## Comienza desde cero: prepara este capítulo, ### 1. Comprueba las herramientas
- `web/public/content/android/modulo-2.md` (332 lines) - headings: # Módulo 2: Jetpack Compose: UI declarativa, ## Sílabo, ## Comienza desde cero: prepara este capítulo, ### 1. Comprueba las herramientas
- `web/public/content/android/modulo-3.md` (334 lines) - headings: # Módulo 3: Navegación con Navigation Compose, ## Sílabo, ## Comienza desde cero: prepara este capítulo, ### 1. Comprueba las herramientas
- `web/public/content/android/modulo-4.md` (332 lines) - headings: # Módulo 4: Estado con StateFlow y Compose, ## Sílabo, ## Comienza desde cero: prepara este capítulo, ### 1. Comprueba las herramientas
- `web/public/content/android/modulo-5.md` (332 lines) - headings: # Módulo 5: Networking con Retrofit/Ktor, ## Sílabo, ## Comienza desde cero: prepara este capítulo, ### 1. Comprueba las herramientas
- `web/public/content/android/modulo-6.md` (337 lines) - headings: # Módulo 6: Persistencia local con Room, ## Sílabo, ## Comienza desde cero: prepara este capítulo, ### 1. Comprueba las herramientas
- `web/public/content/android/modulo-7.md` (333 lines) - headings: # Módulo 7: Inyección de dependencias con Hilt, ## Sílabo, ## Comienza desde cero: prepara este capítulo, ### 1. Comprueba las herramientas
- `web/public/content/android/modulo-8.md` (350 lines) - headings: # Módulo 8: Trabajo en segundo plano, ## Sílabo, ## Comienza desde cero: prepara este capítulo, ### 1. Comprueba las herramientas
- `web/public/content/android/modulo-9.md` (336 lines) - headings: # Módulo 9: Testing en Android, ## Sílabo, ## Comienza desde cero: prepara este capítulo, ### 1. Comprueba las herramientas
- `web/public/content/angular/modulo-0.md` (370 lines) - headings: # Módulo 0: Fundamentos y Angular CLI, ## Sílabo, ## Comienza desde cero: prepara este capítulo, ### 1. Comprueba las herramientas
- ... 329 more files

### documentation

- `README.md` (301 lines) - headings: # Academia_Floci, ## Como empezar, ## Levantar Floci, # 1. Levantar todos los servicios
- `docs/ESTANDAR-DE-CODIGO.md` (56 lines) - headings: # Estándar transversal de código y diseño, ## Prioridades, ## Clean Code con criterio, ## SOLID cuando aporta valor
- `docs/MATRIZ-CURRICULAR.md` (71 lines) - headings: # Matriz curricular auditable, ## Progresión de competencia, ## Cobertura por módulo, ## Método de evaluación
- `docs/METODOLOGIA-DE-APRENDIZAJE.md` (57 lines) - headings: # Metodología Aprende construyendo, ## Ciclo de cada capítulo, ## Tamaño de las experiencias, ## Regla para mostrar soluciones
- `docs/METODOLOGIA.md` (67 lines) - headings: # Metodología de Aprendizaje — Academia Floci, ## 1. Principios (basados en evidencia), ## 2. El ciclo de cada lección (regla 20/60/20), ## 3. Ruta por perfil
- `docs/PLANTILLA-LECCION.md` (118 lines) - headings: # Plantilla de Lección — Prompt Maestro para Claude / Codex, ## PROMPT MAESTRO (copiar desde aquí), ## DATOS DE LA LECCIÓN, ## REGLAS DE ESTILO
- `docs/code-visual-quality.md` (26 lines) - headings: # Auditoría de código y visuales, ## Regla editorial
- `docs/student-journey-audit.md` (155 lines) - headings: # Auditoría del recorrido del estudiante, ## Instalación y primera ejecución, ## Bloqueos prioritarios por track, ### foundations
- `docs/topic-learning-quality.md` (26 lines) - headings: # Auditoría pedagógica tema por tema, ## Regla editorial
- `web/README.md` (72 lines) - headings: # Web, ## Abrir la academia, ## Que contiene, ## Archivos principales
- `web/scripts/source-docs-en/configuration/advanced/application-yml.md` (356 lines) - headings: # application.yml Reference, ## URL configuration, ## Full Reference, ### Initialization hooks
- `web/scripts/source-docs-en/configuration/application-yml.md` (7 lines) - headings: # application.yml Reference
- `web/scripts/source-docs-en/configuration/docker-compose.md` (184 lines) - headings: # Running with Docker, ## Quick Start, ## Docker Compose, ### Minimal (stateless)
- `web/scripts/source-docs-en/configuration/docker-images.md` (103 lines) - headings: # Docker Images, ## Axis 1 — Variant (what's inside), ## Axis 2 — Channel (how stable), ## Full Tag Matrix
- `web/scripts/source-docs-en/configuration/docker.md` (186 lines) - headings: # Docker Configuration, ## Docker Daemon Socket, ## Private Registry Authentication, ### Mount the host Docker config
- `web/scripts/source-docs-en/configuration/environment-variables.md` (439 lines) - headings: # Environment Variables Reference, ## Global, ## Authentication, ## Browser CORS
- `web/scripts/source-docs-en/configuration/initialization-hooks.md` (186 lines) - headings: # Initialization Hooks, ## Lifecycle Phases, ## Hook Directories, ## Script Types
- `web/scripts/source-docs-en/configuration/multi-account.md` (176 lines) - headings: # Multi-Account Isolation, ## How It Works, ## Temporary Credentials (AssumeRole), ## Default Behavior (Single Account)
- ... 82 more files

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
- ... 197 more files

### local-infra

- `docker-compose.yml` (47 lines)

### project-file

- `.claude/settings.local.json` (14 lines)
- `.env.example` (8 lines)
- `.github/workflows/ci.yml` (47 lines)
- `.gitignore` (24 lines)
- `docs/code-visual-quality.json` (7812 lines)
- `docs/curriculum-matrix.json` (155 lines)
- `docs/definitive-track-topics.json` (3168 lines)
- `docs/floci-official-curriculum.json` (14 lines)
- `docs/official-learning-guides.json` (22 lines)
- `docs/official-sources.json` (21 lines)
- `docs/official-topic-atlas.json` (175 lines)
- `docs/requested-master-topics.json` (189 lines)
- `docs/requested-practical-examples.json` (1290 lines)
- `docs/specialization-outcomes.json` (116 lines)
- `docs/student-journey-audit.json` (4390 lines)
- `docs/supplemental-track-topics.json` (2127 lines)
- `docs/topic-learning-quality.json` (24597 lines)
- `install.sh` (99 lines)
- ... 20 more files
