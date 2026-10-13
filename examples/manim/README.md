# Escenas visuales de la ruta integral

El directorio `scenes/` contiene una escena Python independiente por cada uno de
los 53 temas, una escena integradora por cada uno de los 20 bloques y una escena
del proyecto final: 74 escenas en total. Las escenas se generan desde el mismo
inventario que los roadmaps y cada archivo declara su propia clase `Scene`.

## Instalación y render

Las escenas usan primitivas de la API de Manim Community Edition:

```bash
python -m pip install manim
manim -pql examples/manim/scenes/tema_01_fundamentos_de_programacion.py Tema01FundamentosDeProgramacionScene
```

La documentación oficial de ManimGX indica Python 3.13 o posterior para su
instalación actual:

```bash
python -m pip install manimgx
```

Estas escenas se escribieron contra la API de Manim CE, como solicita la ruta.
Aunque ManimGX declara compatibilidad con esa API, su render debe verificarse
con la versión instalada; consulta su guía oficial si el comando `manim` no
acepta el archivo.

En el entorno de desarrollo actual no se pudo instalar Manim CE: la compilación
de `pycairo` requiere Cairo y `pkg-config`, que no están disponibles. El Python
del entorno es 3.9, inferior al mínimo indicado actualmente por ManimGX. Por
eso aquí se verificó la sintaxis Python, no la renderización.

Desde la raíz del repositorio se pueden regenerar las 74 escenas o comprobar
que están sincronizadas con el inventario:

```bash
python3 examples/manim/build_curriculum_scenes.py
python3 examples/manim/build_curriculum_scenes.py --check
```

Cada escena muestra el contexto del tema, sus conceptos centrales y una meta
observable como flujo de entrada, transformación y resultado. El generador
elimina escenas antiguas de su directorio cuando ya no pertenecen al currículo.
