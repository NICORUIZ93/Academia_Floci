# Academia Floci

Curso simple en español para aprender cloud local con Floci paso a paso.

La entrada principal es una página HTML de un solo archivo:

- [Abrir curso paso a paso](web/index.html)
- [Ver los 45 pasos en Markdown](web/public/content/es/pasos.md)
- [Cuaderno de progreso](web/public/content/es/cuaderno-progreso.md)
- [Manual de consulta](web/public/content/es/guia-completa.md)

## Cómo empezar

1. Abre `web/index.html` en tu navegador.
2. Lee un solo paso.
3. Ejecuta el comando en tu terminal si el paso lo pide.
4. Compara tu salida con la salida esperada.
5. Marca `Ya lo ejecuté` para avanzar.

El progreso se guarda localmente en tu navegador con `localStorage`.

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
