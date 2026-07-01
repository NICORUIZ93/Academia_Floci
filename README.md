# Academia Cloud Local en español

Curso local para aprender cloud escribiendo, investigando, fallando y validando
por cuenta propia. La metodología usa emuladores locales de AWS, Azure y GCP
para practicar gratis en tu PC antes de tocar una cuenta real.

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
docker compose up -d aws-local stackport
source .env
aws sts get-caller-identity
```

Docker debe estar iniciado antes de ejecutar `docker compose up`.
StackPort queda disponible en `http://localhost:8080` para inspeccionar los
recursos AWS locales que creas durante el curso.

En Windows, si PowerShell muestra errores con `sh`, usa WSL o Git Bash. Para
este curso la ruta más estable es Docker Compose:

```powershell
docker compose up -d aws-local stackport
$env:AWS_ENDPOINT_URL="http://localhost:4566"
$env:AWS_ACCESS_KEY_ID="test"
$env:AWS_SECRET_ACCESS_KEY="test"
$env:AWS_DEFAULT_REGION="us-east-1"
aws sts get-caller-identity
```

Cloud local se trabaja por CLI. Este proyecto usa StackPort como interfaz
visual para inspeccionar recursos AWS locales; no dependas de una UI externa
para seguir la academia.

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
