# Floci en español

Curso local para aprender Floci escribiendo, investigando, fallando y validando
por cuenta propia. Los ejemplos resueltos no forman parte del recorrido inicial.

## Contenido

- [Empieza aquí: curso interactivo](CURSO_INTERACTIVO.md)
- [Cuaderno de progreso](PROGRESO.md)
- [Manual de consulta](GUIA_FLOCI_ES.md)
- [Docker Compose](docker-compose.yml)
- [Variables de entorno](.env.example)
- [Ejemplos de referencia](examples/README.md)
- [Aplicacion Angular interactiva](web/README.md)

## Inicio rápido

```bash
cp .env.example .env
docker compose up -d
source .env
aws sts get-caller-identity
```

Docker debe estar iniciado antes de ejecutar `docker compose up`.

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
