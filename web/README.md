# Web

La página principal del curso es `index.html`.

No usa Angular, componentes, TypeScript ni librerías externas. Es un solo archivo
HTML con CSS y JavaScript embebidos.

## Abrir el curso

Opción directa:

```text
web/index.html
```

También puedes servir la carpeta con cualquier servidor estático:

```bash
cd web
python3 -m http.server 8081
```

Luego abre `http://localhost:8081`.

## Qué contiene

- 45 pasos numerados.
- Un solo paso visible a la vez.
- Panel lateral con 5 pasos visibles.
- Botón para copiar comandos.
- Progreso guardado en `localStorage`.
- Diseño blanco, simple y sin distracciones.

## Contenido de referencia

- `public/content/es/pasos.md`: los mismos 45 pasos en Markdown.
- `public/content/es/cuaderno-progreso.md`: plantilla para evidencias.
- `public/content/es/guia-completa.md`: manual de consulta.

## Angular

`src/` conserva la app Angular anterior como referencia técnica. No es la ruta
principal de estudio porque tiene más navegación y estructura de la necesaria.
