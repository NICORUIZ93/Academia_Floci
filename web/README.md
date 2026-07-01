# Web

La página principal del curso es `index.html`.

No usa Angular, componentes, TypeScript ni librerías externas. Es un solo archivo
HTML con CSS y JavaScript embebidos.

## Abrir el curso

Opción directa en tu computador:

```text
web/index.html
```

Si estás viendo el archivo desde GitHub, el navegador mostrará el código del
HTML. Para estudiar, descarga o clona el repo y abre el archivo localmente.

También puedes servir la carpeta con cualquier servidor estático:

```bash
cd web
python3 -m http.server 8081
```

Luego abre `http://localhost:8081`.

## Qué contiene

- Catálogo de cursos tipo Udemy, pero simple.
- 45 pasos numerados.
- Una sola lección visible a la vez.
- Temario del curso activo.
- Botón para copiar comandos.
- Progreso guardado en `localStorage`.
- Diseño blanco, simple y sin distracciones.

## Contenido de referencia

- `public/content/es/pasos.md`: los mismos 45 pasos en Markdown.
- `public/content/es/cuaderno-progreso.md`: plantilla para evidencias.
- `public/content/es/guia-completa.md`: manual de consulta.

## Validar cambios

Desde la raíz del repositorio:

```bash
./scripts/validate.sh
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

## Angular

`src/` conserva la app Angular anterior como referencia técnica. No es la ruta
principal de estudio porque tiene más navegación y estructura de la necesaria.
