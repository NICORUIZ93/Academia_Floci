# Web

La carpeta `web` contiene dos superficies:

- `index.html`, `app.css`, `app-data.js` y `app.js`: app estatica que se puede
  abrir desde disco o servir por HTTP.
- `src/`: app Angular "Academia Cloud Local", usada por build, unit tests y e2e.

La app estatica usa Mermaid desde CDN para diagramas visuales.

## Abrir la academia

Opcion directa:

```text
web/index.html
```

Si estas viendo el archivo desde GitHub, el navegador mostrara el codigo. Para
estudiar, descarga o clona el repo y abre el archivo localmente.

Tambien puedes servir la carpeta con cualquier servidor estatico:

```bash
cd web
python3 -m http.server 8081
```

Luego abre `http://localhost:8081`.

Opcion Angular:

```bash
npm ci
npm start
```

Luego abre `http://localhost:4200`.

## Que contiene

- 8 modulos: JavaScript, Node.js, Angular, React, Java, Spring Boot, DevOps y Cloud.
- Niveles de fundamentos, intermedio, avanzado y master.
- 213 lecciones generadas desde el libro ampliado.
- Mas de 900 subtemas visibles dentro de las lecciones.
- Secciones de objetivo, teoria, practica, profundizacion, errores comunes, reto y recursos.
- Temario del modulo activo.
- Boton para copiar practicas.
- Progreso guardado en `localStorage`.
- Layout responsivo sin build step.
- Diagramas Mermaid y paneles de aprendizaje activo.

## Archivos principales

- `index.html`: estructura de la aplicacion.
- `app.css`: estilos responsivos.
- `app-data.js`: modulos, niveles y lecciones generadas.
- `app.js`: navegacion, progreso y renderizado.
- `src/`: aplicacion Angular.
- `../scripts/build_curriculum.py`: regenera el curriculo desde el esquema del libro.

## Validar cambios

Desde la raiz del repositorio:

```bash
./scripts/validate.sh
cd web && npm run build --silent
cd web && npm test -- --watch=false
cd web && npm run e2e
```
