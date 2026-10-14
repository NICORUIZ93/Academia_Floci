# Primer mapa Archify de la academia

`recorrido-estudio.workflow.json` describe el método recomendado: llegar al sitio, comenzar Fundamentos, preparar el equipo, leer, ejecutar, modificar, explicar, guardar y continuar. No representa un sistema de calificación automática ni certifica que todas las lecciones estén completas.

La versión pública está en `web/public/visuals/recorrido-estudio.html` y se abre desde el catálogo. Es una copia exacta del HTML que pasó los controles de Archify; `verification.json` conserva su hash y el alcance. Las capturas y recibos completos se guardan localmente en `.archify/`, excluido de Git.

Para regenerar, instala la revisión de Archify indicada en `docs/skills-visual-learning.json`, lee su `SKILL.md` y ejecuta `finalize workflow` con este candidato. `meta.output` indica la carpeta de la entrega local original; copia el HTML a la ruta pública después de comprobarlo. Un cambio de candidato necesita una entrega y revisión nuevas: no reutilices este recibo para otra imagen.

El visor se genera con [Archify](https://github.com/tt-a1i/archify), que publica su código bajo MIT. Su procedencia y licencia son independientes del contenido editorial de la academia.
