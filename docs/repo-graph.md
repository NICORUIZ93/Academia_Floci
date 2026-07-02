# Academia Floci Repo Graph

Generated: 2026-07-02 17:11 UTC
Root: `Academia_Floci`
Indexed files: 415
Import edges: 26

Use this file as the first, compact context for AI assistants. Refresh it with:

```bash
python3 scripts/build_repo_graph.py --json docs/repo-graph.json
```

For automated lookups, use `docs/repo-graph.json`.

## Project Shape

- `angular-app`: 44 files
- `automation-script`: 6 files
- `course-content`: 253 files
- `documentation`: 78 files
- `example`: 8 files
- `local-infra`: 1 files
- `project-file`: 25 files

## File Types

- `.md`: 321
- `.ts`: 30
- `.json`: 15
- `.html`: 9
- `.py`: 8
- `.scss`: 8
- `.sh`: 6
- `.txt`: 4
- `.yml`: 3
- `.js`: 3
- `.css`: 3
- `.gitignore`: 2
- `.mjs`: 2
- `.example`: 1

## High Signal Files

- `README.md` (170 lines, documentation)
  - headings: # Academia Master Hacker, ## Como empezar, ## Levantar Floci, # 1. Levantar todos los servicios, # 2. Verificar Floci AWS
- `scripts/validate.sh` (229 lines, automation-script)
- `scripts/build_repo_graph.py` (434 lines, automation-script)
  - symbols: FileNode, repo_files, read_text, classify, parse_ts_symbols, parse_ts_imports, parse_python_symbols, parse_python_imports, parse_markdown_headings, unique
- `web/index.html` (227 lines, project-file)
  - symbols: progressLabel, progressBar, toggleNav, floci-status, verifyFloci, courseNav, resetProgress, closeNav, courseList, courseLabel
- `web/src/app/app.ts` (11 lines, angular-app)
  - symbols: App
- `web/src/app/course-data.ts` (528 lines, angular-app)
  - symbols: ServiceGroup, CloudComparison, AltCloudGroup
- `web/src/app/catalog/course-catalog.ts` (207 lines, angular-app)
  - symbols: CourseCatalogComponent, cards, featuredTracks, foundationTracks, mobileTracks
- `web/src/app/course/course-shell.ts` (38 lines, angular-app)
  - symbols: CourseShellComponent, track, sidebarOpen, percent
- `web/src/app/course/lesson-viewer.ts` (133 lines, angular-app)
  - symbols: LessonViewerComponent, track, module, moduleIndex, previousModule, nextModule, tab, lessonHtml, lessonLoading, isComplete
- `web/public/content/manifest.json` (707 lines, course-content)
- `web/public/content/es/pasos.md` (1122 lines, course-content)
  - headings: # 45 pasos de Academia Floci, ## Cursos, ## Paso 1: ¿Qué es Docker?, ## Paso 2: Instalar Docker, ## Paso 3: Verificar Docker

## Internal Import Graph

- `web/src/app/app.config.ts` -> `web/src/app/app.routes.ts`
- `web/src/app/app.routes.ts` -> `web/src/app/catalog/course-catalog.ts`
- `web/src/app/app.routes.ts` -> `web/src/app/course/course-shell.ts`
- `web/src/app/app.routes.ts` -> `web/src/app/course/lesson-viewer.ts`
- `web/src/app/app.routes.ts` -> `web/src/app/study/study-page.ts`
- `web/src/app/app.spec.ts` -> `web/src/app/app.routes.ts`
- `web/src/app/app.spec.ts` -> `web/src/app/app.ts`
- `web/src/app/app.spec.ts` -> `web/src/app/study/study-page.ts`
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
- `web/src/main.ts` -> `web/src/app/app.config.ts`
- `web/src/main.ts` -> `web/src/app/app.ts`

## Most Connected Files

- `web/src/app/course-data.ts`: in=1, out=12
- `web/src/app/app.routes.ts`: in=2, out=4
- `web/src/app/app.ts`: in=2, out=1
- `web/src/app/command-palette.ts`: in=1, out=2
- `web/src/app/app.spec.ts`: in=0, out=3
- `web/src/app/study/study-page.ts`: in=2, out=0
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
- `web/src/app/tracks/android.track.ts`: in=1, out=0

## Files By Area


### angular-app

- `web/src/app/app.config.ts` (12 lines) - imports: @angular/core, @angular/router, ./app.routes
- `web/src/app/app.html` (3 lines)
- `web/src/app/app.routes.ts` (27 lines) - imports: @angular/router, ./study/study-page, ./catalog/course-catalog, ./course/course-shell, ./course/lesson-viewer
- `web/src/app/app.spec.ts` (35 lines) - imports: @angular/core/testing, @angular/router, @angular/router/testing, ./app, ./app.routes, ./study/study-page
- `web/src/app/app.ts` (11 lines) - symbols: App; imports: @angular/core, @angular/router, ./command-palette
- `web/src/app/catalog/course-catalog.html` (183 lines) - symbols: ruta, cloud, metodo, cursos
- `web/src/app/catalog/course-catalog.scss` (603 lines)
- `web/src/app/catalog/course-catalog.ts` (207 lines) - symbols: CourseCatalogComponent, cards, featuredTracks, foundationTracks, mobileTracks; imports: @angular/common, @angular/core, @angular/router, lucide-angular, ../course-data, ../icon-registry, ../progress.service
- `web/src/app/command-palette.html` (23 lines)
- `web/src/app/command-palette.scss` (30 lines)
- `web/src/app/command-palette.service.ts` (11 lines) - symbols: CommandPaletteService, isOpen; imports: @angular/core
- `web/src/app/command-palette.ts` (78 lines) - symbols: CommandPaletteComponent, query, results; imports: @angular/common, @angular/core, @angular/forms, @angular/router, lucide-angular, ./course-data, ./command-palette.service
- `web/src/app/content.service.ts` (20 lines) - symbols: ContentService; imports: @angular/core, marked
- `web/src/app/course-data.ts` (528 lines) - symbols: ServiceGroup, CloudComparison, AltCloudGroup; imports: ./course-module.model, ./tracks/devops.track, ./tracks/javascript.track, ./tracks/node.track, ./tracks/angular.track, ./tracks/react.track, ./tracks/java.track, ./tracks/spring-boot.track
- `web/src/app/course-module.model.ts` (34 lines) - symbols: CourseModule, Track
- `web/src/app/course/course-shell.html` (35 lines)
- `web/src/app/course/course-shell.scss` (57 lines)
- `web/src/app/course/course-shell.ts` (38 lines) - symbols: CourseShellComponent, track, sidebarOpen, percent; imports: @angular/common, @angular/core, @angular/core/rxjs-interop, @angular/router, lucide-angular, rxjs, ../course-data, ../command-palette.service
- ... 26 more files

### automation-script

- `scripts/build_curriculum.py` (273 lines) - symbols: source_text, normalize_ascii, clean_module_name, parse_curriculum, js_string, render_app_data, main; imports: __future__, json, re, pathlib
- `scripts/build_repo_graph.py` (434 lines) - symbols: FileNode, repo_files, read_text, classify, parse_ts_symbols, parse_ts_imports, parse_python_symbols, parse_python_imports; imports: __future__, argparse, ast, json, re, collections, dataclasses, datetime
- `scripts/fix_lessons.py` (205 lines) - symbols: safe_print, iter_text_check_files, find_text_quality_issues, normalized_content, fix_content, check_http, main; imports: argparse, glob, os, re, urllib.request
- `scripts/start.sh` (10 lines)
- `scripts/validate-floci.sh` (43 lines)
- `scripts/validate.sh` (229 lines)

### course-content

- `web/public/content/ATRIBUCION.md` (20 lines) - headings: # Atribucion y licencia
- `web/public/content/LICENSE-FLOCI.txt` (21 lines)
- `web/public/content/android/modulo-0.md` (50 lines) - headings: ## Estructura de un proyecto, ## Recursos en vez de hardcodear, ## AndroidManifest.xml, ## Módulos Gradle
- `web/public/content/android/modulo-1.md` (33 lines) - headings: ## Ciclo de vida de una Activity, ## ViewModel sobrevive a la rotación, ## SavedStateHandle
- `web/public/content/android/modulo-10.md` (37 lines) - headings: ## Material 3, ## Detectar recomposición innecesaria, ## Baseline Profiles, ## Accesibilidad
- `web/public/content/android/modulo-11.md` (46 lines) - headings: ## Firma de la app, ## App Bundle vs APK, ## Tracks de Play Console, ## Versionado
- `web/public/content/android/modulo-12.md` (32 lines) - headings: ## Arquitectura MVVM completa, ## Uniendo los módulos del track, ## Cierre del track
- `web/public/content/android/modulo-2.md` (43 lines) - headings: ## Composables y recomposición, ## State hoisting, ## remember vs rememberSaveable, ## Layout básico
- `web/public/content/android/modulo-3.md` (46 lines) - headings: ## NavHost y rutas, ## Argumentos tipados, ## Deep links, ## Bottom navigation con stacks independientes
- `web/public/content/android/modulo-4.md` (47 lines) - headings: ## StateFlow en el ViewModel, ## Observar con collectAsStateWithLifecycle, ## UDF: Unidirectional Data Flow, ## SharedFlow para eventos de un solo uso
- `web/public/content/android/modulo-5.md` (40 lines) - headings: ## Retrofit con coroutines, ## Interceptores de OkHttp
- `web/public/content/android/modulo-6.md` (46 lines) - headings: ## Entity, DAO y Database, ## Migraciones, ## Offline-first
- `web/public/content/android/modulo-7.md` (47 lines) - headings: ## Configuración básica, ## @Provides para dependencias externas, ## @Binds para interfaces, ## Scopes
- `web/public/content/android/modulo-8.md` (40 lines) - headings: ## CoroutineWorker, ## Encolar trabajo periódico con constraints, ## Notificación desde background
- `web/public/content/android/modulo-9.md` (41 lines) - headings: ## Test de ViewModel con repositorio fake, ## Compose UI Testing, ## Espresso para flujos end-to-end
- `web/public/content/angular/modulo-0.md` (41 lines) - headings: ## El CLI ya no genera NgModules, ## Interpolación y property binding, ## ng build
- `web/public/content/angular/modulo-1.md` (58 lines) - headings: ## input() y output() basados en signals, ## Control de flujo nativo, ## Content projection, ## Ciclo de vida
- `web/public/content/angular/modulo-10.md` (43 lines) - headings: ## TestBed básico, ## Angular Testing Library, ## Mockear HttpClient, ## Vitest en vez de Karma
- ... 235 more files

### documentation

- `README.md` (170 lines) - headings: # Academia Master Hacker, ## Como empezar, ## Levantar Floci, # 1. Levantar todos los servicios
- `web/README.md` (56 lines) - headings: # Web, ## Abrir la academia, ## Que contiene, ## Archivos principales
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
- `web/scripts/source-docs-en/getting-started/migrate-from-localstack.md` (254 lines) - headings: # Migrate from LocalStack, ## Compatibility mode, ## Step-by-step migration, ### 1 — Change the image
- `web/scripts/source-docs-en/getting-started/quick-start.md` (214 lines) - headings: # Quick Start, ## Step 1 — Start Floci, ## Step 2 — Configure AWS CLI, ## Step 3 — Verify the Setup
- ... 60 more files

### example

- `examples/README.md` (15 lines) - headings: # Ejemplos de referencia
- `examples/init/ready.d/10-seed.sh` (20 lines)
- `examples/node/demo.mjs` (68 lines) - imports: @aws-sdk/client-s3, @aws-sdk/client-sqs
- `examples/node/floci-example.js` (134 lines)
- `examples/node/package.json` (14 lines)
- `examples/python/demo.py` (68 lines) - imports: json, boto3
- `examples/python/floci-example.py` (148 lines) - symbols: run_s3_example, run_sqs_example, wait_for_table, run_dynamodb_example, main; imports: time, boto3, botocore.exceptions
- `examples/python/requirements.txt` (3 lines)

### local-infra

- `docker-compose.yml` (33 lines)

### project-file

- `.env.example` (8 lines)
- `.github/workflows/ci.yml` (40 lines)
- `.gitignore` (24 lines)
- `install.sh` (99 lines)
- `web/.gitignore` (48 lines)
- `web/.vscode/extensions.json` (5 lines)
- `web/.vscode/launch.json` (21 lines)
- `web/.vscode/mcp.json` (10 lines)
- `web/.vscode/tasks.json` (43 lines)
- `web/angular.json` (80 lines)
- `web/app-data.js` (2373 lines) - imports: ./Component.module.css, ./module, ./component, ./Component
- `web/app.css` (649 lines)
- `web/app.js` (450 lines)
- `web/e2e/academy.spec.ts` (49 lines) - imports: @playwright/test
- `web/index.html` (227 lines) - symbols: progressLabel, progressBar, toggleNav, floci-status, verifyFloci, courseNav, resetProgress, closeNav
- `web/package.json` (42 lines)
- `web/playwright.config.ts` (22 lines) - imports: @playwright/test
- `web/scripts/.translation-cache.json` (1 lines)
- ... 7 more files
