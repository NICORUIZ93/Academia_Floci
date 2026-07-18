# Academia_Floci

Academia en espanol para estudiar desarrollo profesional y cloud local. El repo
mantiene dos experiencias:

- `web/index.html`: version estatica, sin build ni backend.
- `web/src`: version Angular "Academia Cloud Local", usada por build, unit tests
  y e2e.

La academia reúne 13 rutas, 200 capítulos y más de 750 temas en formato de
libro, con proyectos acumulativos, práctica, evaluación y fuentes académicas.

- [Abrir la academia](web/index.html)
- [Guia web](web/README.md)
- [Mapa compacto del repo](docs/repo-graph.md)
- [Metodología de aprendizaje](docs/METODOLOGIA-DE-APRENDIZAJE.md)
- [Matriz curricular](docs/MATRIZ-CURRICULAR.md)
- [Fuentes oficiales y versiones revisadas](docs/official-sources.json)
- [Estándar de código, Clean Code y SOLID](docs/ESTANDAR-DE-CODIGO.md)
- [Proyecto transversal de logística RutaFlow](examples/rutaflow/README.md)

## Como empezar

1. Abre `web/index.html` en tu navegador.
2. Elige un modulo en el panel izquierdo.
3. Estudia objetivo, teoria, practica, profundizacion, errores, reto y recursos.
4. Haz la practica propuesta.
5. Escribe una nota con lo que entendiste.
6. Marca la leccion como completada.

El progreso se guarda localmente en tu navegador con `localStorage`.

Si prefieres servirlo por HTTP:

```bash
./scripts/start.sh
```

Luego abre `http://localhost:8081`.

Para trabajar con la version Angular:

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

Cada tema sigue una estructura simple:

- Objetivo claro.
- Teoria breve con analogias.
- Practica ejecutable o mini ejercicio.
- Profundizacion.
- Errores comunes.
- Reto.
- Recursos para seguir.

## Modulos (app estatica, `web/index.html`)

| Modulo | Enfoque | Proyecto final |
|---|---|---|
| JavaScript | Lenguaje, DOM, asincronia, rendimiento y seguridad web defensiva | Juego Adivina el numero |
| Node.js | Backend, APIs, bases de datos, observabilidad y arquitectura | API REST de tareas con JWT |
| Angular | TypeScript, Signals, routing, SSR, NgRx e internals | Panel de administracion |
| React | Hooks, state management, Next.js, testing y accesibilidad | E-commerce con carrito |
| Java | OOP, collections, concurrencia, JVM y testing | Biblioteca por consola |
| Spring Boot | REST, JPA, seguridad, cloud, WebFlux y arquitectura hexagonal | API de reservas |
| DevOps | Linux, Git, Docker, Kubernetes, IaC, GitOps y DevSecOps | Pipeline CI/CD |
| Cloud | AWS, Azure, GCP, Floci, seguridad, observabilidad e IaC | Sistema desplegado en Floci |

## Contenido aplicado (app estatica)

El archivo `web/app-data.js` se genera desde el esquema ampliado del libro con:

- 8 modulos.
- 213 lecciones tematicas.
- Mas de 900 subtemas aplicados dentro de las lecciones.
- 7 secciones por leccion: objetivo, teoria, practica, profundizacion, errores
  comunes, reto y recursos.

## Tracks de la app Angular (`web/src`)

La version Angular tiene su propio contenido, mas amplio, en formato Markdown
(`web/public/content/<track>/modulo-N.md`), organizado en 14 tracks, 224
modulos y 1.217 temas. Cada modulo sigue la misma plantilla: Silabo, Contenido
teorico, Laboratorio practico, Ejercicios de evaluacion y Resumen. Los temas
permanecen abiertos y el laboratorio vive dentro de la misma ruta del modulo;
no existe una ruta de cuestionario o examen separada.

Cada tema muestra una ruta guiada de ocho pasos: conocimiento previo, archivo o
registro de decisión, incremento, ejecución, resultado observable, fallo
deliberado, conexión con RutaFlow y evidencia final. La guía distingue los
temas con código de las decisiones conceptuales para no inventar implementaciones.
Además, los 224 Markdown activos contienen una sección persistente **Comienza
desde cero** con comprobación de herramientas, creación o recuperación del
proyecto, árbol de carpetas, una ruta por cada tema real, línea base ejecutable,
resultado esperado, fallo deliberado y conexión con RutaFlow. WebFlux conserva
su tutorial manual como referencia y los otros 223 capítulos cumplen el mismo
contrato mediante `scripts/enrich_from_zero_guides.py`.
La auditoría editorial de `docs/topic-learning-quality.md` sigue midiendo el
Markdown real por separado: una ayuda generada en la interfaz no convierte una
explicación superficial en contenido editorial completo.

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
TypeScript, y que temas y laboratorios permanezcan dentro del mismo capitulo.

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

Para regenerar el curriculo desde el texto fuente disponible en esta sesion:

```bash
python3 scripts/build_curriculum.py
```

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
    ├── index.html
    ├── app.css
    ├── app-data.js
    ├── app.js
    ├── src/
    ├── README.md
    └── public/content/
```

## Validar el repositorio

Antes de subir cambios, ejecuta:

```bash
./scripts/validate.sh
```

La validacion comprueba que la app estatica exista, que tenga 8 modulos, que el
curriculo genere lecciones consecutivas, que aplique los subtemas del libro y
que el mapa del repo este actualizado.

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
