# Floci en español

Curso local para aprender Floci escribiendo, investigando, fallando y validando
por cuenta propia. Los ejemplos resueltos no forman parte del recorrido inicial.

## Contenido

- [Empieza aquí: curso interactivo](web/public/content/es/curso-interactivo.md)
- [Cuaderno de progreso](web/public/content/es/cuaderno-progreso.md)
- [Manual de consulta](web/public/content/es/guia-completa.md)
- [Docker Compose](docker-compose.yml)
- [Variables de entorno](.env.example)
- [Ejemplos de referencia](examples/README.md)
- [Aplicacion Angular interactiva](web/README.md)

## Inicio rápido

```bash
cp .env.example .env
docker compose up -d floci stackport
source .env
aws sts get-caller-identity
```

Docker debe estar iniciado antes de ejecutar `docker compose up`.
StackPort queda disponible en `http://localhost:8080` para inspeccionar los
recursos AWS locales que creas con Floci.

En Windows, si PowerShell muestra errores con `sh`, usa WSL o Git Bash. Para
este curso la ruta más estable es Docker Compose:

```powershell
docker compose up -d floci stackport
$env:AWS_ENDPOINT_URL="http://localhost:4566"
$env:AWS_ACCESS_KEY_ID="test"
$env:AWS_SECRET_ACCESS_KEY="test"
$env:AWS_DEFAULT_REGION="us-east-1"
aws sts get-caller-identity
```

Floci se trabaja por CLI. Este proyecto usa StackPort como interfaz visual; no
dependas de una imagen `floci/floci-ui:latest` para seguir la academia.

No abras los ejemplos hasta haber completado los retos equivalentes. El Compose
no crea recursos automáticamente: bucket, colas, tablas y funciones los debes
crear tú durante el curso.

## Aplicacion visual

```bash
cd web
npm install
npm start
```

Abre `http://localhost:4200`. El progreso, las notas y las evidencias se guardan
localmente en el navegador.
