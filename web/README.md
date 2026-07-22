# Web

La carpeta `web` contiene la aplicación Angular oficial de Academia Floci. El
contenido de las lecciones vive en `public/content/` y se presenta mediante el
lector educativo de `src/app/course/`.

## Abrir la academia

```bash
npm ci
npm start
```

Luego abre `http://localhost:4200`.

## Que contiene

- 14 tracks desde fundamentos hasta nivel Master.
- Lecciones Markdown, código copiable y diagramas Mermaid.
- Progreso local, búsqueda, tema claro/oscuro y diseño responsivo.
- Prácticas, laboratorios y documentación oficial dentro de cada módulo.

## Archivos principales

- `src/`: aplicación Angular.
- `public/content/`: lecciones y documentación publicada.
- `package.json`: comandos de desarrollo, pruebas y build.

## Validar cambios

Desde la raiz del repositorio:

```bash
./scripts/validate.sh
cd web && npm run build --silent
cd web && npm test -- --watch=false
cd web && npm run e2e
```
