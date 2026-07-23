# Auditoría de términos y comandos sin explicar

Heurística: un comando o flag que aparece en un bloque de código de terminal se considera explicado solo si, en la prosa del mismo tema, aparece cerca de una frase que lo define ("es el", "es un/una", "significa", "sirve para", "viene de", "ejecuta", "instala", "activa"...). Es una heurística de triage, no un veredicto definitivo: falsos positivos y negativos son posibles. Sirve para priorizar revisión manual, no para auto-corregir contenido.

| Track | Temas con términos sin explicar | Términos sin explicar más comunes |
|---|---:|---|
| foundations | 5 | `python` (1), `--directory` (1), `curl` (1), `--decorate` (1), `--oneline` (1), `--fail` (1) |
| devops | 32 | `--rm` (1), `docker` (1), `--no-cache` (1), `--all` (1), `--graph` (1), `--no-ff` (1) |
| javascript | 6 | `node` (1), `npm` (1), `npx` (1), `--save-dev` (1), `--template` (1), `--init` (1) |
| node | 11 | `node` (1), `npm` (1), `--region` (1), `--save-dev` (1), `--depth` (1), `git` (1) |
| angular | 6 | `--defaults` (1), `--routing` (1), `--skip-git` (1), `--standalone` (1), `--style` (1), `--watch` (1) |
| react | 3 | `--template` (1), `npm` (1), `--app` (1), `--eslint` (1), `--no-tailwind` (1), `--src-dir` (1) |
| java | 3 | `mvn` (1), `gradlew` (1), `--add-modules` (1), `--ignore-missing-deps` (1), `--no-header-files` (1), `--no-man-pages` (1) |
| spring-boot | 3 | `curl` (1), `mvnw` (1), `mvn` (1), `--destination` (1) |
| kotlin-multiplatform | 3 | `gradlew` (1), `--tests` (1), `gradle` (1) |
| android | 6 | `python` (1), `python3` (1), `adb` (1), `gradlew` (1), `curl` (1), `--max-time` (1) |
| ios | 1 | `--type` (1) |
| flutter | 3 | `flutter` (1), `--release` (1), `dart` (1) |
| rutaflow | 1 | `node` (1) |
| **Total** | **83** | |

## Términos sin explicar más frecuentes en todo el curso

| Término | Apariciones sin explicar |
|---|---:|
| `node` | 5 |
| `curl` | 4 |
| `npm` | 4 |
| `--silent` | 3 |
| `--version` | 3 |
| `--output` | 3 |
| `npx` | 3 |
| `--save-dev` | 3 |
| `gradlew` | 3 |
| `python` | 2 |
| `--oneline` | 2 |
| `git` | 2 |
| `kind` | 2 |
| `--watch` | 2 |
| `python3` | 2 |
| `--template` | 2 |
| `--init` | 2 |
| `--noEmit` | 2 |
| `mvn` | 2 |
| `--tests` | 2 |
| `--directory` | 1 |
| `--decorate` | 1 |
| `--fail` | 1 |
| `--rm` | 1 |
| `docker` | 1 |
| `--no-cache` | 1 |
| `--all` | 1 |
| `--graph` | 1 |
| `--no-ff` | 1 |
| `--cached` | 1 |

## Detalle por track

### android

- Módulo 0 · Tema 2: Recursos externalizados: `python`, `python3`
- Módulo 1 · Tema 1: Ciclo de vida de una Activity: `adb`, `gradlew`
- Módulo 5 · Tema 1: Retrofit con coroutines: `curl`
- Módulo 5 · Tema 2: Manejo de errores HTTP: `--max-time`
- Módulo 13 · Tema 3: Offline-first necesita un protocolo de cambios: `kind`
- Módulo 14 · Tema 1: ComposeTestRule ejecuta tu UI sin emulador visible: `--tests`

### angular

- Módulo 0 · Tema 1: El CLI ya no genera NgModules: `--defaults`, `--routing`, `--skip-git`, `--standalone`, `--style`, `--watch`, `npx`
- Módulo 0 · Tema 3: TypeScript a fondo — unknown, any, never y utility types: `--init`, `--noEmit`, `--save-dev`, `--silent`, `--strict`, `npm`
- Módulo 8 · Tema 3: Migración desde NgModules: `--module`
- Módulo 9 · Tema 2: NgRx — actions, reducers y selectors: `--save`
- Módulo 11 · Tema 1: Server-Side Rendering: `--ssr`
- Módulo 12 · Tema 1: Reconocer la versión y la arquitectura de un proyecto: `node`

### devops

- Módulo 0 · Tema 1: Sistema de archivos y permisos (chmod/chown): `--rm`, `docker`
- Módulo 0 · Tema 6: Hardening básico — SSH sin contraseña, firewalls, SELinux/AppArmor: `--no-cache`
- Módulo 1 · Tema 1: Trunk-based development vs GitFlow: `--all`, `--graph`, `--no-ff`, `--oneline`, `git`
- Módulo 1 · Tema 4: Hooks de Git y commits firmados: `--cached`
- Módulo 1 · Tema 5: Monorepos vs polyrepos: `--stat`
- Módulo 1 · Tema 6: git cherry-pick, git stash, git reset vs git revert: `--no-edit`
- Módulo 2 · Tema 1: Dockerfile multi-stage: `--from`, `--omit`
- Módulo 2 · Tema 3: Imágenes base distroless/alpine: `--format`
- Módulo 2 · Tema 5: Redes en Docker: `--name`, `--network`
- Módulo 3 · Tema 4: Perfiles para distintos entornos: `--services`
- Módulo 4 · Tema 2: Caché de dependencias en CI: `--prefer-offline`
- Módulo 5 · Tema 3: Rolling updates: `--no-recreate`, `--scale`
- Módulo 6 · Tema 1: Pod, ReplicaSet, Deployment: `--record`, `kind`
- Módulo 6 · Tema 3: ConfigMaps y Secrets: `--command`, `--env`, `--from-literal`, `--image`, `--restart`
- Módulo 6 · Tema 4: kubectl esencial: `--requests`
- Módulo 6 · Tema 5: Namespaces: `--current`, `--namespace`
- Módulo 6 · Tema 6: StatefulSets, DaemonSets, Jobs y CronJobs: `--for`, `--timeout`
- Módulo 7 · Tema 2: Ingress Controllers y reglas de enrutamiento: `--port`, `--target-port`
- Módulo 7 · Tema 3: HorizontalPodAutoscaler: `--cpu-percent`, `--limits`, `--max`, `--min`, `--watch`
- Módulo 7 · Tema 4: Probes de liveness y readiness: `--from-file`
- Módulo 7 · Tema 5: RBAC en Kubernetes: `--as`
- Módulo 8 · Tema 6: Ansible — playbooks, roles, inventory y módulos: `ansible-playbook`
- Módulo 8 · Tema 7: Pulumi como alternativa a HCL: `node`
- Módulo 9 · Tema 1: Modelo de métricas de Prometheus — counter, gauge, histogram: `--silent`
- Módulo 9 · Tema 2: PromQL esencial: `--add-host`
- Módulo 9 · Tema 7: Métricas DORA — Lead Time, Deployment Frequency, MTTR, Change Failure Rate: `--date`, `python3`
- Módulo 11 · Tema 1: Escaneo de imágenes y dependencias (Trivy, Snyk): `--severity`, `--version`
- Módulo 11 · Tema 2: Integración en el pipeline: `--exit-code`
- Módulo 11 · Tema 3: Gestión de secretos (Vault, SOPS): `--cap-add`, `vault`
- Módulo 11 · Tema 5: SBOM y supply chain security: `--output`
- Módulo 12 · Tema 2: Gestión de secretos cloud-native: `--endpoint-url`, `--query`, `--secret-id`, `--secret-string`
- Módulo 14 · Tema 3: Construir una imagen no demuestra de dónde proviene: `--certificate-identity-regexp`, `--certificate-oidc-issuer`

### flutter

- Módulo 0 · Tema 1: Sound null safety: `flutter`
- Módulo 11 · Tema 1: Builds de release para cada plataforma: `--release`
- Módulo 11 · Tema 2: Iconos y splash screens: `dart`

### foundations

- Módulo 0 · Tema 1: Del hardware al programa en ejecución: `python`
- Módulo 3 · Tema 1: De una URL al servidor: red, DNS, IP y puertos: `--directory`
- Módulo 3 · Tema 2: HTTP como contrato observable: `curl`
- Módulo 5 · Tema 3: Git como historial de decisiones y colaboración: `--decorate`, `--oneline`
- Módulo 8 · Tema 3: Linux como entorno observable: `--fail`, `--silent`

### ios

- Módulo 0 · Tema 1: Optionals y unwrapping seguro: `--type`

### java

- Módulo 8 · Tema 1: pom.xml vs build.gradle.kts: `mvn`
- Módulo 13 · Tema 3: Build reproducible y cierre del track: `gradlew`
- Módulo 14 · Tema 4: El runtime es parte del artefacto y necesita ciclo de vida: `--add-modules`, `--ignore-missing-deps`, `--no-header-files`, `--no-man-pages`, `--output`, `--print-module-deps`, `--strip-debug`

### javascript

- Módulo 0 · Tema 1: Variables — `const`, `let` y `var`: `node`, `npm`
- Módulo 0 · Tema 5: JavaScript en navegador y Node.js: `npx`
- Módulo 7 · Tema 2: Tree-shaking y code-splitting: `--save-dev`
- Módulo 7 · Tema 3: Vite y esbuild: `--template`
- Módulo 11 · Tema 1: Tipos básicos, interfaces y type aliases: `--init`, `--noEmit`
- Módulo 14 · Tema 5: WebAssembly con Rust o C: `--target`

### kotlin-multiplatform

- Módulo 0 · Tema 1: Null safety real: `gradlew`
- Módulo 6 · Tema 1: Esquemas SQLDelight y queries tipadas: `--tests`
- Módulo 8 · Tema 1: El framework generado para iOS: `gradle`

### node

- Módulo 0 · Tema 1: Node no es "JavaScript en el servidor" sin más: `node`, `npm`
- Módulo 0 · Tema 3: process, global y módulos core: `--region`
- Módulo 1 · Tema 1: package.json y semver: `--save-dev`
- Módulo 1 · Tema 2: Lockfiles e instalación reproducible: `--depth`, `git`
- Módulo 1 · Tema 3: Workspaces — monorepos con npm/pnpm: `--workspace`
- Módulo 1 · Tema 4: Scripts de ciclo de vida: `--foreground-scripts`
- Módulo 3 · Tema 1: El modelo request/response: `curl`
- Módulo 5 · Tema 1: PostgreSQL desde Node con el driver puro: `--version`
- Módulo 5 · Tema 2: Prisma — schema, migraciones y queries tipadas: `--datasource-provider`, `--output`
- Módulo 7 · Tema 4: Alternativas de testing y debugging: `--inspect`
- Módulo 10 · Tema 4: OWASP API Security Top 10 y auditoría de dependencias: `--json`

### react

- Módulo 0 · Tema 1: JSX es azúcar sintáctica sobre createElement: `--template`, `npm`
- Módulo 10 · Tema 1: Server Components por defecto: `--app`, `--eslint`, `--no-tailwind`, `--src-dir`, `--ts`, `--use-npm`, `npx`
- Módulo 14 · Tema 1: Server Components y streaming: `--version`

### rutaflow

- Módulo 0 · Tema 1: El proceso logístico como sistema: `node`

### spring-boot

- Módulo 0 · Tema 1: Inversión de control y el contenedor de Spring: `curl`, `mvnw`
- Módulo 3 · Tema 1: Entidades y repositorios derivados: `mvn`
- Módulo 11 · Tema 1: Fat JAR vs capas de Docker: `--destination`
