# Academia_Floci

Academia en español para estudiar desarrollo profesional y cloud local. La
experiencia oficial es una aplicación Angular con lecciones Markdown.

La academia reúne 14 rutas, 224 capítulos y 877 temas editoriales en formato de
libro. La calidad práctica se mide por separado: un tema no se considera terminado
solo porque su nombre aparezca en el índice.

- [Guia web](web/README.md)
- [Mapa compacto del repo](docs/repo-graph.md)
- [Metodología de aprendizaje](docs/METODOLOGIA-DE-APRENDIZAJE.md)
- [Matriz curricular](docs/MATRIZ-CURRICULAR.md)
- [Fuentes oficiales y versiones revisadas](docs/official-sources.json)
- [Estándar de código, Clean Code y SOLID](docs/ESTANDAR-DE-CODIGO.md)
- [Proyecto transversal de logística RutaFlow](examples/rutaflow/README.md)

## Como empezar

1. Instala Node.js LTS y clona el repositorio.
2. Ejecuta `cd web && npm ci && npm start`.
3. Abre `http://localhost:4200`.
4. Elige un track y avanza tema por tema ejecutando sus ejemplos.

El progreso se guarda localmente en tu navegador con `localStorage`.

Cada capítulo incluye tres decisiones prácticas con verificación inmediata y un
quiz de cinco preguntas. No hay XP, insignias, rachas ni recompensas artificiales:
el progreso representa exclusivamente actividades y capítulos terminados. Las
12 rutas de especialización tienen un proyecto integrador propio; Fundamentos
prepara las bases y RutaFlow conecta los proyectos en una plataforma logística transversal.

```bash
cd web
npm ci
npm start
```

Luego abre `http://localhost:4200`.

## Levantar Floci

Opción recomendada — `floci-cli` (la herramienta oficial del proyecto, que usa el track Cloud del curso a partir del Módulo 1):

```bash
curl -fsSL https://floci.io/install.sh | sh   # instala floci-cli
floci start                                    # levanta Floci AWS
floci doctor                                   # diagnostica el entorno
eval $(floci env)                              # exporta las variables de AWS CLI
aws s3 ls                                      # ya sin --endpoint-url
floci stop                                     # detén Floci al terminar
```

Opción alternativa — Docker Compose (útil para correr AWS, Azure y GCP local a la vez):

```bash
# 1. Levantar todos los servicios
docker compose up -d

# 2. Verificar Floci AWS
curl http://localhost:4566/_localstack/health

# 3. Verificar Azure
curl http://localhost:4577

# 4. Verificar GCP
curl http://localhost:4588

# 5. Validar todo el entorno
./scripts/validate-floci.sh
```

Servicios locales:

- AWS local: `http://localhost:4566`
- StackPort (explorador AWS ligero incluido en este compose): `http://localhost:8080`
- Azure local: `http://localhost:4577`
- GCP local: `http://localhost:4588`

Panel visual oficial recomendado (proyecto aparte — no está en este `docker-compose.yml`):

```bash
git clone https://github.com/floci-io/floci-ui
cd floci-ui
docker compose up                      # solo AWS
# docker compose --profile multicloud up   # AWS + Azure + GCP
```

Ábrelo en `http://localhost:4500`.

La metodología recomendada del curso es crear y modificar recursos con CLI,
SDK o Terraform y comprobar después el resultado visualmente. Puedes usar
**StackPort** para una exploración AWS rápida dentro del Compose de la academia,
**Floci UI** para la consola oficial y su visión multi-cloud, o ambos a lo largo
del curso. Los stacks predeterminados comparten el puerto `4566`: para abrirlos
simultáneamente debes apuntar ambas interfaces al mismo runtime y evitar levantar
un segundo Floci. Cuando una categoría de Floci UI aparece como `placeholder`, usa
StackPort si soporta ese recurso y conserva CLI/SDK como fuente de verdad.

Credenciales locales para AWS CLI y SDKs:

```bash
aws configure set region us-east-1
aws configure set aws_access_key_id test
aws configure set aws_secret_access_key test
```

Ejemplos:

```bash
node examples/node/floci-example.js
python3 examples/python/floci-example.py
```

Tambien hay ejemplos base en Java, Go y Rust dentro de `examples/`.

## Metodologia

El contrato editorial que debe alcanzar cada tema es:

- Resultado concreto y motivo para construirlo.
- Prerrequisitos, carpeta y archivo exactos.
- Código específico comentado y explicación por bloques.
- Comando de ejecución y salida comprobable.
- Un fallo intencional con su diagnóstico.
- Una modificación breve que el estudiante resuelve.
- Incremento correspondiente del proyecto RutaFlow.

## Tracks de la academia

La version Angular tiene su propio contenido, mas amplio, en formato Markdown
(`web/public/content/<track>/modulo-N.md`), organizado en 14 tracks, 224
módulos y 877 temas editoriales visibles. Cada módulo prioriza una secuencia de
temas prácticos. Sílabo, bibliografía o resumen solo aparecen cuando aportan
contexto que no esté explicado en el recorrido principal. No existen rutas
separadas de cuestionarios, rúbricas o laboratorios repetidos.

La preparación completa se abre por defecto en el módulo inicial y permanece
disponible, de forma plegable, en todos los capítulos para quien llegue desde un
enlace directo. WebFlux es uno de los temas que ya alcanza el recorrido manual
esperado; no se usa para ocultar la deuda editorial de los demás.
La auditoría editorial de `docs/topic-learning-quality.md` sigue midiendo el
Markdown real por separado: una ayuda generada en la interfaz no convierte una
explicación superficial en contenido editorial completo.

`docs/code-visual-quality.md` mide además, sin contar las guías generadas, qué
temas tienen código, comentarios didácticos, ubicación, comando, Mermaid y
fuente oficial. Los bloques ejecutables ya no se presentan falsamente como
“Diagrama”: código, terminal y configuración tienen etiquetas propias; los
diagramas Mermaid se renderizan como figuras accesibles con contexto y guía de
lectura. Los visuales ASCII restantes se conservan como deuda explícita hasta
que puedan redibujarse sin alterar su significado.

| Track | Modulos | Enfoque |
|---|---|---|
| Fundamentos | 12 | Computador, programación, web, datos e ingeniería de software |
| Cloud Local | 35 | AWS, Azure y GCP en local con Floci |
| DevOps | 16 | Linux, Git, Docker, CI/CD, Kubernetes, IaC |
| JavaScript | 15 | Lenguaje, DOM, asincronia, rendimiento |
| Node.js | 15 | Backend, APIs, bases de datos, produccion |
| Angular | 16 | Componentes, Signals, routing, SSR, zoneless |
| React | 15 | Hooks, estado, data fetching, Next.js |
| Java | 16 | POO, colecciones, concurrencia, JVM moderna |
| Spring Boot | 16 | REST, JPA, seguridad, microservicios |
| Kotlin Multiplatform | 14 | Logica compartida entre Android e iOS |
| Android | 15 | Jetpack Compose, ciclo de vida, Room, Hilt |
| iOS | 15 | SwiftUI, concurrencia moderna, SwiftData |
| Flutter | 16 | Widgets, gestion de estado, plataformas nativas |
| RutaFlow | 8 | Proyecto integrador de entregas, GPS, datos y operación |

`scripts/validate.sh` valida automaticamente que el numero de archivos
Markdown de cada track coincida con los modulos declarados en su fuente
TypeScript, que el índice web corresponda a esos 14 tracks y que los reportes de
calidad permanezcan sincronizados con el Markdown real.

## Actualización tecnológica

Cada ruta se contrasta con especificaciones, documentación, notas de versión,
seguridad y migración publicadas por los proyectos oficiales. El registro
`docs/official-sources.json` indica la línea estable o LTS utilizada, la fecha
de revisión y qué términos deben estar incorporados en el contenido.

```bash
python3 scripts/validate_official_sources.py
```

La comprobación vence a los 120 días. El CI se ejecuta además cada mes para
detectar una revisión pendiente aunque el repositorio no reciba cambios. Las
funciones preview o experimentales se presentan como tales y nunca como base
obligatoria de producción.

## Seguridad

Los temas de seguridad se tratan desde una practica defensiva y autorizada:
entender riesgos, proteger sistemas propios, validar configuraciones y construir
software mas robusto. No incluye instrucciones para atacar sistemas de terceros.

## Estructura

```text
Academia_Floci/
├── README.md
├── docker-compose.yml
├── .env.example
├── docs/
├── examples/
├── scripts/
└── web/
    ├── src/
    ├── README.md
    └── public/content/
```

## Validar el repositorio

Antes de subir cambios, ejecuta:

```bash
./scripts/validate.sh
```

La validación comprueba la aplicación Angular, la relación entre tracks y
Markdown, las auditorías educativas, los 224 conjuntos de ejercicios y quizzes,
los 12 proyectos, el progreso académico y el mapa actualizado del repositorio.

El CI tambien ejecuta build y tests de Angular:

```bash
cd web
npm run build --silent
npm test -- --watch=false
npm run e2e
```

## Mapa compacto para asistentes de IA

Para reducir exploracion repetida del repositorio, este proyecto incluye:

- `docs/repo-graph.md`: snapshot legible para asistentes.
- `docs/repo-graph.json`: indice estructurado para herramientas.

Actualizalo cuando cambie la estructura:

```bash
python3 scripts/build_repo_graph.py
```

Comprueba sincronizacion:

```bash
python3 scripts/build_repo_graph.py --check
```
