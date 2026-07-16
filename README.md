# Academia_Floci

Academia en espanol para estudiar desarrollo profesional y cloud local. El repo
mantiene dos experiencias:

- `web/index.html`: version estatica, sin build ni backend.
- `web/src`: version Angular "Academia Cloud Local", usada por build, unit tests
  y e2e.

El curriculo ampliado aplica 213 temas y mas de 900 subtemas en formato de
libro.

- [Abrir la academia](web/index.html)
- [Guia web](web/README.md)
- [Mapa compacto del repo](docs/repo-graph.md)

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
- StackPort: `http://localhost:8080`
- Azure local: `http://localhost:4577`
- GCP local: `http://localhost:4588`

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

## Modulos

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

## Contenido aplicado

El archivo `web/app-data.js` se genera desde el esquema ampliado del libro con:

- 8 modulos.
- 213 lecciones tematicas.
- Mas de 900 subtemas aplicados dentro de las lecciones.
- 7 secciones por leccion: objetivo, teoria, practica, profundizacion, errores
  comunes, reto y recursos.

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
