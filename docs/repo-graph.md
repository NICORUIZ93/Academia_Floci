# Academia Floci Repo Graph

Generated: 2026-07-17 05:16 UTC
Root: `Academia_Floci`
Indexed files: 576
Import edges: 27

Use this file as the first, compact context for AI assistants. Refresh it with:

```bash
python3 scripts/build_repo_graph.py --json docs/repo-graph.json
```

For automated lookups, use `docs/repo-graph.json`.

## Project Shape

- `angular-app`: 46 files
- `automation-script`: 6 files
- `course-content`: 285 files
- `documentation`: 80 files
- `example`: 133 files
- `local-infra`: 1 files
- `project-file`: 25 files

## File Types

- `.md`: 356
- `.ts`: 32
- `.py`: 31
- `.js`: 30
- `.go`: 24
- `.java`: 24
- `.rs`: 24
- `.json`: 16
- `.html`: 9
- `.scss`: 8
- `.sh`: 6
- `.yml`: 4
- `.txt`: 4
- `.css`: 3
- `.gitignore`: 2
- `.mjs`: 2
- `.example`: 1

## High Signal Files

- `README.md` (246 lines, documentation)
  - headings: # Academia_Floci, ## Como empezar, ## Levantar Floci, # 1. Levantar todos los servicios, # 2. Verificar Floci AWS
- `scripts/validate.sh` (448 lines, automation-script)
- `scripts/build_repo_graph.py` (440 lines, automation-script)
  - symbols: FileNode, repo_files, read_text, classify, parse_ts_symbols, parse_ts_imports, parse_python_symbols, parse_python_imports, parse_markdown_headings, unique
- `web/index.html` (249 lines, project-file)
  - symbols: progressLabel, progressBar, openCloudLab, toggleNav, courseNav, resetProgress, closeNav, courseList, courseLabel, difficultyBadge
- `web/src/app/app.ts` (11 lines, angular-app)
  - symbols: App
- `web/src/app/course-data.ts` (1003 lines, angular-app)
  - symbols: ServiceGroup, CloudComparison, AltCloudGroup
- `web/src/app/catalog/course-catalog.ts` (80 lines, angular-app)
  - symbols: CourseCatalogComponent, cards, featuredTracks, foundationTracks, mobileTracks
- `web/src/app/course/course-shell.ts` (40 lines, angular-app)
  - symbols: CourseShellComponent, track, sidebarOpen, percent
- `web/src/app/course/lesson-viewer.ts` (191 lines, angular-app)
  - symbols: LessonViewerComponent, TocItem, track, module, moduleIndex, previousModule, nextModule, lessonHtml, lessonLoading, tocItems
- `web/public/content/manifest.json` (707 lines, course-content)
- `web/public/content/es/pasos.md` (1122 lines, course-content)
  - headings: # 45 pasos de Academia Floci, ## Cursos, ## Paso 1: ¿Qué es Docker?, ## Paso 2: Instalar Docker, ## Paso 3: Verificar Docker

## Internal Import Graph

- `web/src/app/app.config.ts` -> `web/src/app/app.routes.ts`
- `web/src/app/app.routes.ts` -> `web/src/app/catalog/course-catalog.ts`
- `web/src/app/app.routes.ts` -> `web/src/app/course/course-shell.ts`
- `web/src/app/app.routes.ts` -> `web/src/app/course/final-quiz.ts`
- `web/src/app/app.routes.ts` -> `web/src/app/course/lesson-viewer.ts`
- `web/src/app/app.spec.ts` -> `web/src/app/app.routes.ts`
- `web/src/app/app.spec.ts` -> `web/src/app/app.ts`
- `web/src/app/app.spec.ts` -> `web/src/app/catalog/course-catalog.ts`
- `web/src/app/app.ts` -> `web/src/app/command-palette.ts`
- `web/src/app/command-palette.ts` -> `web/src/app/command-palette.service.ts`
- `web/src/app/command-palette.ts` -> `web/src/app/course-data.ts`
- `web/src/app/course-data.ts` -> `web/src/app/course-module.model.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/android.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/angular.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/devops.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/flutter.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/ios.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/java.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/javascript.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/kotlin-multiplatform.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/node.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/react.track.ts`
- `web/src/app/course-data.ts` -> `web/src/app/tracks/spring-boot.track.ts`
- `web/src/app/course/course-shell.ts` -> `web/src/app/course/lesson-index.ts`
- `web/src/app/course/lesson-viewer.ts` -> `web/src/app/course/lab-verification.ts`
- `web/src/main.ts` -> `web/src/app/app.config.ts`
- `web/src/main.ts` -> `web/src/app/app.ts`

## Most Connected Files

- `web/src/app/course-data.ts`: in=1, out=12
- `web/src/app/app.routes.ts`: in=2, out=4
- `web/src/app/app.ts`: in=2, out=1
- `web/src/app/command-palette.ts`: in=1, out=2
- `web/src/app/app.spec.ts`: in=0, out=3
- `web/src/app/catalog/course-catalog.ts`: in=2, out=0
- `web/src/app/course/lesson-viewer.ts`: in=1, out=1
- `web/src/app/course/course-shell.ts`: in=1, out=1
- `web/src/app/app.config.ts`: in=1, out=1
- `web/src/main.ts`: in=0, out=2
- `web/src/app/tracks/spring-boot.track.ts`: in=1, out=0
- `web/src/app/tracks/react.track.ts`: in=1, out=0
- `web/src/app/tracks/node.track.ts`: in=1, out=0
- `web/src/app/tracks/kotlin-multiplatform.track.ts`: in=1, out=0
- `web/src/app/tracks/javascript.track.ts`: in=1, out=0
- `web/src/app/tracks/java.track.ts`: in=1, out=0
- `web/src/app/tracks/ios.track.ts`: in=1, out=0
- `web/src/app/tracks/flutter.track.ts`: in=1, out=0
- `web/src/app/tracks/devops.track.ts`: in=1, out=0
- `web/src/app/tracks/angular.track.ts`: in=1, out=0

## Files By Area


### angular-app

- `web/src/app/app.config.ts` (12 lines) - imports: @angular/core, @angular/router, ./app.routes
- `web/src/app/app.html` (3 lines)
- `web/src/app/app.routes.ts` (28 lines) - imports: @angular/router, ./catalog/course-catalog, ./course/course-shell, ./course/final-quiz, ./course/lesson-viewer
- `web/src/app/app.spec.ts` (32 lines) - imports: @angular/core/testing, @angular/router, @angular/router/testing, ./app, ./app.routes, ./catalog/course-catalog
- `web/src/app/app.ts` (11 lines) - symbols: App; imports: @angular/core, @angular/router, ./command-palette
- `web/src/app/catalog/course-catalog.html` (55 lines)
- `web/src/app/catalog/course-catalog.scss` (153 lines)
- `web/src/app/catalog/course-catalog.ts` (80 lines) - symbols: CourseCatalogComponent, cards, featuredTracks, foundationTracks, mobileTracks; imports: @angular/common, @angular/core, @angular/router, lucide-angular, ../course-data, ../icon-registry, ../progress.service, ../theme.service
- `web/src/app/command-palette.html` (23 lines)
- `web/src/app/command-palette.scss` (30 lines)
- `web/src/app/command-palette.service.ts` (11 lines) - symbols: CommandPaletteService, isOpen; imports: @angular/core
- `web/src/app/command-palette.ts` (78 lines) - symbols: CommandPaletteComponent, query, results; imports: @angular/common, @angular/core, @angular/forms, @angular/router, lucide-angular, ./course-data, ./command-palette.service
- `web/src/app/content.service.ts` (27 lines) - symbols: ContentService; imports: @angular/core, marked
- `web/src/app/course-data.ts` (1003 lines) - symbols: ServiceGroup, CloudComparison, AltCloudGroup; imports: ./course-module.model, ./tracks/devops.track, ./tracks/javascript.track, ./tracks/node.track, ./tracks/angular.track, ./tracks/react.track, ./tracks/java.track, ./tracks/spring-boot.track
- `web/src/app/course-module.model.ts` (41 lines) - symbols: CourseModule, QuizQuestion, Track
- `web/src/app/course/course-shell.html` (38 lines)
- `web/src/app/course/course-shell.scss` (58 lines)
- `web/src/app/course/course-shell.ts` (40 lines) - symbols: CourseShellComponent, track, sidebarOpen, percent; imports: @angular/common, @angular/core, @angular/core/rxjs-interop, @angular/router, lucide-angular, rxjs, ../course-data, ../command-palette.service
- ... 28 more files

### automation-script

- `scripts/build_curriculum.py` (273 lines) - symbols: source_text, normalize_ascii, clean_module_name, parse_curriculum, js_string, render_app_data, main; imports: __future__, json, re, pathlib
- `scripts/build_repo_graph.py` (440 lines) - symbols: FileNode, repo_files, read_text, classify, parse_ts_symbols, parse_ts_imports, parse_python_symbols, parse_python_imports; imports: __future__, argparse, ast, json, re, collections, dataclasses, datetime
- `scripts/fix_lessons.py` (205 lines) - symbols: safe_print, iter_text_check_files, find_text_quality_issues, normalized_content, fix_content, check_http, main; imports: argparse, glob, os, re, urllib.request
- `scripts/start.sh` (10 lines)
- `scripts/validate-floci.sh` (43 lines)
- `scripts/validate.sh` (448 lines)

### course-content

- `web/public/content/ATRIBUCION.md` (20 lines) - headings: # Atribucion y licencia
- `web/public/content/LICENSE-FLOCI.txt` (21 lines)
- `web/public/content/android/modulo-0.md` (201 lines) - headings: # Módulo 0: Kotlin aplicado a Android, ## Sílabo, ## Contenido teórico, ### Tema 1: Estructura de un proyecto Android Studio
- `web/public/content/android/modulo-1.md` (191 lines) - headings: # Módulo 1: Ciclo de vida: Activities y ViewModel, ## Sílabo, ## Contenido teórico, ### Tema 1: Ciclo de vida de una Activity
- `web/public/content/android/modulo-10.md` (187 lines) - headings: # Módulo 10: Performance, Material 3 y accesibilidad, ## Sílabo, ## Contenido teórico, ### Tema 1: Detectar y corregir recomposición innecesaria
- `web/public/content/android/modulo-11.md` (206 lines) - headings: # Módulo 11: Publicación en Google Play, ## Sílabo, ## Contenido teórico, ### Tema 1: Firma de la app
- `web/public/content/android/modulo-12.md` (202 lines) - headings: # Módulo 12: Proyecto integrador: app Android completa, ## Sílabo, ## Contenido teórico, ### Tema 1: Arquitectura MVVM completa con UDF
- `web/public/content/android/modulo-2.md` (202 lines) - headings: # Módulo 2: Jetpack Compose: UI declarativa, ## Sílabo, ## Contenido teórico, ### Tema 1: Composables y recomposición
- `web/public/content/android/modulo-3.md` (210 lines) - headings: # Módulo 3: Navegación con Navigation Compose, ## Sílabo, ## Contenido teórico, ### Tema 1: NavHost y NavController
- `web/public/content/android/modulo-4.md` (208 lines) - headings: # Módulo 4: Estado con StateFlow y Compose, ## Sílabo, ## Contenido teórico, ### Tema 1: StateFlow en el ViewModel
- `web/public/content/android/modulo-5.md` (208 lines) - headings: # Módulo 5: Networking con Retrofit/Ktor, ## Sílabo, ## Contenido teórico, ### Tema 1: Retrofit con coroutines
- `web/public/content/android/modulo-6.md` (213 lines) - headings: # Módulo 6: Persistencia local con Room, ## Sílabo, ## Contenido teórico, ### Tema 1: Entities, DAOs y Database
- `web/public/content/android/modulo-7.md` (209 lines) - headings: # Módulo 7: Inyección de dependencias con Hilt, ## Sílabo, ## Contenido teórico, ### Tema 1: Configuración básica de Hilt
- `web/public/content/android/modulo-8.md` (205 lines) - headings: # Módulo 8: Trabajo en segundo plano, ## Sílabo, ## Contenido teórico, ### Tema 1: CoroutineWorker y garantía de ejecución
- `web/public/content/android/modulo-9.md` (212 lines) - headings: # Módulo 9: Testing en Android, ## Sílabo, ## Contenido teórico, ### Tema 1: Testing de ViewModels con fakes y runTest
- `web/public/content/angular/modulo-0.md` (214 lines) - headings: # Módulo 0: Fundamentos y Angular CLI, ## Sílabo, ## Contenido teórico, ### Tema 1: El CLI ya no genera NgModules
- `web/public/content/angular/modulo-1.md` (238 lines) - headings: # Módulo 1: Componentes, plantillas y data binding, ## Sílabo, ## Contenido teórico, ### Tema 1: input()/output() basados en signals
- `web/public/content/angular/modulo-10.md` (189 lines) - headings: # Módulo 10: Testing en Angular, ## Sílabo, ## Contenido teórico, ### Tema 1: TestBed y componentes standalone
- ... 267 more files

### documentation

- `README.md` (246 lines) - headings: # Academia_Floci, ## Como empezar, ## Levantar Floci, # 1. Levantar todos los servicios
- `docs/METODOLOGIA.md` (67 lines) - headings: # Metodología de Aprendizaje — Academia Floci, ## 1. Principios (basados en evidencia), ## 2. El ciclo de cada lección (regla 20/60/20), ## 3. Ruta por perfil
- `docs/PLANTILLA-LECCION.md` (110 lines) - headings: # Plantilla de Lección — Prompt Maestro para Claude / Codex, ## PROMPT MAESTRO (copiar desde aquí), ## DATOS DE LA LECCIÓN, ## REGLAS DE ESTILO
- `web/README.md` (72 lines) - headings: # Web, ## Abrir la academia, ## Que contiene, ## Archivos principales
- `web/scripts/source-docs-en/configuration/advanced/application-yml.md` (335 lines) - headings: # application.yml Reference, ## URL configuration, ## Full Reference, ### Initialization hooks
- `web/scripts/source-docs-en/configuration/application-yml.md` (7 lines) - headings: # application.yml Reference
- `web/scripts/source-docs-en/configuration/docker-compose.md` (184 lines) - headings: # Running with Docker, ## Quick Start, ## Docker Compose, ### Minimal (stateless)
- `web/scripts/source-docs-en/configuration/docker-images.md` (103 lines) - headings: # Docker Images, ## Axis 1 — Variant (what's inside), ## Axis 2 — Channel (how stable), ## Full Tag Matrix
- `web/scripts/source-docs-en/configuration/docker.md` (135 lines) - headings: # Docker Configuration, ## Docker Daemon Socket, ## Private Registry Authentication, ### Mount the host Docker config
- `web/scripts/source-docs-en/configuration/environment-variables.md` (422 lines) - headings: # Environment Variables Reference, ## Global, ## Authentication, ## Browser CORS
- `web/scripts/source-docs-en/configuration/initialization-hooks.md` (186 lines) - headings: # Initialization Hooks, ## Lifecycle Phases, ## Hook Directories, ## Script Types
- `web/scripts/source-docs-en/configuration/multi-account.md` (161 lines) - headings: # Multi-Account Isolation, ## How It Works, ## Default Behavior (Single Account), ## Enabling Multi-Account Isolation
- `web/scripts/source-docs-en/configuration/ports.md` (165 lines) - headings: # Ports Reference, ## Port Overview, ## Why some ports don't need docker-compose mapping, ### Proxy-in-Floci (ElastiCache, RDS)
- `web/scripts/source-docs-en/configuration/storage.md` (175 lines) - headings: # Storage Modes, ## Modes, ## Global Configuration, ## Per-Service Override
- `web/scripts/source-docs-en/configuration/tls.md` (177 lines) - headings: # TLS / HTTPS, ## Quick Start, # AWS CLI, # Node.js
- `web/scripts/source-docs-en/contributing.md` (104 lines) - headings: # Contributing, ## Ways to Help, ## Development Setup, # Clone
- `web/scripts/source-docs-en/getting-started/aws-setup.md` (144 lines) - headings: # AWS CLI & SDK Setup, ## Environment Variables, ## AWS CLI Profile, ## SDK Configuration
- `web/scripts/source-docs-en/getting-started/installation.md` (85 lines) - headings: # Installation, ## Docker (Recommended), ### Requirements, ## Image Tags
- ... 62 more files

### example

- `examples/README.md` (90 lines) - headings: # Ejemplos de referencia, ## Ejemplos por operación (node/, python/, java/, go/, rust/), # Node.js (requiere: npm install en examples/node/), # Python (requiere: pip install boto3)
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
- ... 115 more files

### local-infra

- `docker-compose.yml` (40 lines)

### project-file

- `.claude/settings.local.json` (8 lines)
- `.env.example` (8 lines)
- `.github/workflows/ci.yml` (42 lines)
- `.gitignore` (24 lines)
- `install.sh` (99 lines)
- `web/.gitignore` (48 lines)
- `web/.vscode/extensions.json` (5 lines)
- `web/.vscode/launch.json` (21 lines)
- `web/.vscode/mcp.json` (10 lines)
- `web/.vscode/tasks.json` (43 lines)
- `web/angular.json` (80 lines)
- `web/app-data.js` (2389 lines) - imports: ./Component.module.css, ./module, ./component, ./Component
- `web/app.css` (698 lines)
- `web/app.js` (535 lines)
- `web/e2e/academy.spec.ts` (39 lines) - imports: @playwright/test
- `web/index.html` (249 lines) - symbols: progressLabel, progressBar, openCloudLab, toggleNav, courseNav, resetProgress, closeNav, courseList
- `web/package.json` (43 lines)
- `web/playwright.config.ts` (22 lines) - imports: @playwright/test
- ... 7 more files
