# Academia Floci

Curso simple en español para aprender cloud local con Floci, organizado por
cursos cortos y lecciones paso a paso.

La entrada principal es una página HTML de un solo archivo. En GitHub el enlace
puede mostrarse como código; para usar el curso, abre el archivo localmente o
sirve la carpeta `web` como sitio estático.

- [Archivo del curso paso a paso](web/index.html)
- [Ver los 45 pasos en Markdown](web/public/content/es/pasos.md)
- [Cuaderno de progreso](web/public/content/es/cuaderno-progreso.md)
- [Manual de consulta](web/public/content/es/guia-completa.md)

## Cómo empezar

1. Abre `web/index.html` en tu navegador.
2. Elige un curso en el panel izquierdo.
3. Lee una sola lección.
4. Ejecuta el comando en tu terminal si la lección lo pide.
5. Compara tu salida con la salida esperada.
6. Marca `Ya lo completé` para avanzar.

El progreso se guarda localmente en tu navegador con `localStorage`.

Cuando sirves la carpeta `web` por HTTP, la página carga las lecciones desde
`web/public/content/es/pasos.md`. Si abres `web/index.html` directo desde el
disco, usa los mismos pasos embebidos como respaldo para evitar bloqueos de
seguridad del navegador con archivos locales.

Si prefieres servirlo por HTTP:

```bash
./scripts/start.sh
```

Luego abre `http://localhost:8081`.

## Requisitos

- Docker instalado y abierto.
- AWS CLI instalada para los pasos de AWS.
- Terminal disponible: Terminal en macOS/Linux, PowerShell o WSL en Windows.

## Laboratorio local

Puedes levantar los servicios locales con Docker Compose:

```bash
cp .env.example .env
docker compose up -d aws-local stackport
```

StackPort queda disponible en `http://localhost:8080` para inspeccionar recursos
AWS locales. Floci/AWS local escucha en `http://localhost:4566`.

En Windows PowerShell:

```powershell
docker compose up -d aws-local stackport
$env:AWS_ENDPOINT_URL="http://localhost:4566"
$env:AWS_ACCESS_KEY_ID="test"
$env:AWS_SECRET_ACCESS_KEY="test"
$env:AWS_DEFAULT_REGION="us-east-1"
aws sts get-caller-identity
```

## Cursos

| Curso | Pasos | Tema |
|---|---:|---|
| Inicio y ambiente | 1-7 | Docker, Floci y AWS CLI |
| Almacenamiento S3 | 8-14 | Buckets, archivos y limpieza |
| Colas SQS | 15-20 | Mensajes, recepción y borrado |
| Base NoSQL DynamoDB | 21-27 | Tabla, items, lectura y limpieza |
| Funciones Lambda | 28-32 | Crear, invocar, actualizar y borrar |
| API Gateway | 33-36 | API REST, recurso, método y despliegue |
| Permisos IAM | 37-40 | Usuario, política y asignación |
| Proyecto final | 41-45 | CRUD de tareas con servicios locales |

## Estructura

```text
Academia_Floci/
├── README.md
├── docker-compose.yml
├── .env.example
├── examples/
├── scripts/
└── web/
    ├── index.html
    ├── README.md
    └── public/content/es/
        ├── pasos.md
        ├── cuaderno-progreso.md
        └── guia-completa.md
```

## Nota sobre la app Angular

La carpeta `web/src` conserva la versión Angular anterior como referencia de
desarrollo, pero no es la ruta recomendada para estudiar. Para aprender sin
perderse, usa `web/index.html`.

## Validar el repositorio

Antes de subir cambios, ejecuta:

```bash
./scripts/validate.sh
```

La validación comprueba que existan los archivos principales, que `web/index.html`
tenga 8 cursos, que `web/index.html` y `pasos.md` tengan 45 pasos, que el
manifest sea JSON válido y que no vuelvan a aparecer páginas HTML duplicadas en
la raíz.

## Contribuir

Si encuentras errores o quieres sugerir mejoras:

1. Abre un issue en GitHub.
2. Describe el problema con el paso, comando o archivo afectado.
3. Si puedes, propone una corrección pequeña y comprobable.
