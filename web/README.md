# Web

La pagina principal de la academia es `index.html`.

No usa Angular, TypeScript ni librerias externas. Es una app estatica:
HTML para estructura, CSS para interfaz, `app-data.js` para curriculo y `app.js`
para navegacion, progreso y copiado de practicas.

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

## Archivos principales

- `index.html`: estructura de la aplicacion.
- `app.css`: estilos responsivos.
- `app-data.js`: modulos, niveles y lecciones generadas.
- `app.js`: navegacion, progreso y renderizado.
- `../scripts/build_curriculum.py`: regenera el curriculo desde el esquema del libro.

## Validar cambios

Desde la raiz del repositorio:

```bash
./scripts/validate.sh
```
