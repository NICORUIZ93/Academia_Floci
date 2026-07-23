# Módulo 5: Testing, depuración, Git y CI


## Aprende construyendo

### Tema 1: Depurar con evidencia, no con cambios aleatorios

Ejecuta node --version para comprobar el entorno antes de continuar. **Evidencia de aprendizaje:** conserva la salida y explica qué verificaste.

#### Paso 1 · Objetivo y preparación
Al finalizar podrás investigar y mejorar un proyecto desde cero. Prerrequisitos: Git, terminal, editor y un lenguaje instalado. Verifica git --version.

#### Paso 2 · Contexto y caso real
En un caso real, un bug de entregas debe reproducirse, aislarse y corregirse sin perder historial ni introducir una regresión.

#### Paso 3 · Teoría, modelo mental y analogía
Depurar significa observar, formular hipótesis, cambiar una variable y medir. Las pruebas unitarias, integración y extremo a extremo cubren preguntas distintas. Git registra decisiones y CI automatiza controles. La analogía es una investigación: evidencia antes de conclusión, y una bitácora para que otra persona repita el análisis.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía y crea un defecto que pueda reproducirse:
```bash
mkdir depuracion-inventario
cd depuracion-inventario
python3 -m venv .venv
source .venv/bin/activate  # Windows PowerShell: .venv\Scripts\Activate.ps1
mkdir src
```
Guarda `src/inventario.py`:

```python
def retirar(stock: int, cantidad: int) -> int:
    # Este primer diseño contiene un defecto: acepta cantidades negativas.
    if cantidad > stock:
        raise ValueError("Stock insuficiente")
    return stock - cantidad

print(retirar(5, -2))
```

Ejecuta `python3 src/inventario.py`. **Resultado esperado del defecto:** imprime `7`; esa salida reproduce el problema y permite formular la hipótesis “falta validar que cantidad sea positiva”. Añade `if cantidad <= 0: raise ValueError("La cantidad debe ser positiva")` y repite: ahora debe aparecer un error controlado. **Fallo deliberado:** cambia la condición a `< 0`; el caso cero volverá a pasar y demuestra por qué una frontera exacta necesita su propia prueba.

#### Paso 5 · Práctica guiada
Pista: introduce deliberadamente una línea incorrecta para provocar un fallo deliberado de prueba o comando; usa git diff y el log para diagnosticar y corregir. Resultado esperado: historial claro y verificación verde.

#### Paso 6 · Práctica independiente
Añade una prueba automatizada, un lint, una revisión simulada y un workflow CI que ejecute los controles.

#### Paso 7 · Cierre y evidencia
Guarda commits, salida de CI y diagnóstico; como siguiente paso estudia despliegue. Errores comunes: editar sin reproducir, commits gigantes, ignorar fallos intermitentes y confiar solo en cobertura. Fuentes oficiales: https://git-scm.com/book/es/v2 y https://docs.github.com/actions.
**¿Por qué es importante?** Porque la calidad es un proceso observable, no una impresión subjetiva.
**Evidencia de aprendizaje:** entrega historial, prueba, fallo corregido y checklist de revisión.
**Conceptos clave:** síntoma, causa, reproducción, hipótesis, experimento, debugger, breakpoint, stack trace, log y regresión.

Un síntoma observable —“el stock queda negativo”— no identifica automáticamente la causa. Depurar consiste en reducir incertidumbre. Primero captura entrada, salida, versión y pasos. Después encuentra la reproducción mínima. Formula una hipótesis que pueda resultar falsa y cambia una sola variable.

```python
def retirar(stock, cantidad):
    if cantidad > stock:
        raise ValueError("Stock insuficiente")
    return stock - cantidad
```

Si `retirar(0, 0)` se considera válido, el resultado es cero. Si `cantidad=-2`, devuelve stock mayor: falta una precondición. El mensaje “algo está mal” no ayuda; el caso `retirar(5, -2) → error esperado` sí.

Lee el stack trace desde el tipo de error y la primera línea de tu código, no solo la última salida. Coloca un breakpoint antes de la decisión, inspecciona valores y avanza una instrucción. Los logs deben registrar evento y contexto útil sin secretos:

```python
logger.info("retirada_solicitada", extra={"sku": sku, "cantidad": cantidad})
```

Evita `print("aquí")` repetido: no expresa hipótesis ni estructura. Al corregir, crea una prueba que falle con la versión defectuosa y pase con la corrección. Así el conocimiento queda automatizado.

**Analogía:** depurar es investigación científica: reproducir, observar, plantear hipótesis, experimentar y conservar evidencia. Cambiar varias cosas equivale a alterar temperatura, presión y material a la vez.

**¿Por qué es importante?** La mayor parte del mantenimiento ocurre sobre comportamientos inesperados. Un proceso disciplinado reduce tiempo y evita “arreglos” que ocultan síntomas.

**Casos de uso reales:** errores de producción, consultas vacías, condiciones de carrera, datos corruptos y fallos dependientes de configuración.

**Diagrama:**

```mermaid
flowchart LR
    S["síntoma"] --> R["reproducir"] --> I["aislar"] --> H["hipótesis"]
    H --> E["experimento"] --> C["causa"] --> T["prueba de regresión"] --> F["corrección"]
```

### Tema 2: Pruebas con propósito y niveles adecuados

Ejecuta node --version para comprobar el entorno antes de continuar. **Evidencia de aprendizaje:** conserva la salida y explica qué verificaste.

#### Paso 1 · Objetivo y preparación
Al finalizar podrás investigar y mejorar un proyecto desde cero. Prerrequisitos: Git, terminal, editor y un lenguaje instalado. Verifica git --version.

#### Paso 2 · Contexto y caso real
En un caso real, un bug de entregas debe reproducirse, aislarse y corregirse sin perder historial ni introducir una regresión.

#### Paso 3 · Teoría, modelo mental y analogía
Depurar significa observar, formular hipótesis, cambiar una variable y medir. Las pruebas unitarias, integración y extremo a extremo cubren preguntas distintas. Git registra decisiones y CI automatiza controles. La analogía es una investigación: evidencia antes de conclusión, y una bitácora para que otra persona repita el análisis.

#### Paso 4 · Demostración guiada desde cero
Construye una unidad pequeña y su contrato desde una carpeta vacía:
```bash
mkdir pruebas-inventario
cd pruebas-inventario
python3 -m venv .venv
source .venv/bin/activate  # Windows PowerShell: .venv\Scripts\Activate.ps1
python3 -m pip install pytest
mkdir src tests
```
Guarda `src/inventario.py` con `def restante(stock, cantidad): return stock - cantidad` y `tests/test_inventario.py`:

```python
from src.inventario import restante

def test_resta_una_cantidad_valida():
    # Arrange: datos; Act: llamada; Assert: regla observable.
    resultado = restante(5, 2)
    assert resultado == 3
```

Ejecuta `python3 -m pytest -q`. **Resultado esperado:** `1 passed`. **Fallo deliberado:** cambia el resultado esperado a `4`; pytest muestra valores obtenidos y esperados. Corrige la aserción, no la función, porque el contrato correcto para `5 - 2` es `3`.

#### Paso 5 · Práctica guiada
Pista: introduce deliberadamente una línea incorrecta para provocar un fallo deliberado de prueba o comando; usa git diff y el log para diagnosticar y corregir. Resultado esperado: historial claro y verificación verde.

#### Paso 6 · Práctica independiente
Añade una prueba automatizada, un lint, una revisión simulada y un workflow CI que ejecute los controles.

#### Paso 7 · Cierre y evidencia
Guarda commits, salida de CI y diagnóstico; como siguiente paso estudia despliegue. Errores comunes: editar sin reproducir, commits gigantes, ignorar fallos intermitentes y confiar solo en cobertura. Fuentes oficiales: https://git-scm.com/book/es/v2 y https://docs.github.com/actions.
**¿Por qué es importante?** Porque la calidad es un proceso observable, no una impresión subjetiva.
**Evidencia de aprendizaje:** entrega historial, prueba, fallo corregido y checklist de revisión.
**Conceptos clave:** prueba unitaria, integración, end-to-end, arrange-act-assert, fixture, fake, stub, mock, determinismo, cobertura y regresión.

Una prueba es evidencia ejecutable de comportamiento. Una unidad prueba una pieza aislada y rápida; integración comprueba colaboración real —por ejemplo repositorio y SQLite—; E2E atraviesa el sistema desde interfaz hasta persistencia. No todo debe ser E2E ni todo debe simularse.

```python
import pytest
from inventario import retirar

def test_retirar_descuenta_stock():
    resultado = retirar(stock=5, cantidad=2)
    assert resultado == 3

def test_retirar_rechaza_cantidad_negativa():
    with pytest.raises(ValueError, match="positiva"):
        retirar(stock=5, cantidad=-2)
```

La estructura es Arrange (datos), Act (operación) y Assert (resultado). El nombre comunica regla. Prueba comportamiento público, no detalles internos, para permitir refactorizar.

Una integración SQLite debe usar una base temporal por prueba y migraciones reales. Un fake implementa comportamiento simplificado; stub devuelve respuestas preparadas; mock verifica interacción. Usa dobles en límites lentos o no deterministas, no para simular toda tu propia aplicación.

Cobertura indica qué líneas/ramas se ejecutaron, no si las afirmaciones son buenas. Una prueba que llama funciones sin comprobar nada aumenta cobertura sin confianza. Mutation testing evalúa si pequeñas alteraciones son detectadas. Prioriza riesgos: dinero, permisos, integridad y casos frontera.

Evita tiempo y aleatoriedad no controlados. Inyecta reloj o semilla. Una prueba que falla ocasionalmente destruye confianza y debe tratarse como defecto.

**Analogía:** pruebas unitarias inspeccionan piezas; integración comprueba conexiones; E2E conduce el vehículo. Inspeccionar solo tornillos no demuestra que el automóvil frene.

**¿Por qué es importante?** Una suite bien diseñada permite cambiar código con retroalimentación rápida y convierte requisitos en ejemplos verificables.

**Casos de uso reales:** regresiones, migraciones, autorización, contratos API, cálculos y flujos críticos.

**Diagrama:**

```mermaid
flowchart BT
    E2E["pocas E2E críticas"] --> INT["integraciones reales"] --> UNIT["muchas unitarias rápidas"]
```

### Tema 3: Git como historial de decisiones y colaboración

Ejecuta node --version para comprobar el entorno antes de continuar. **Evidencia de aprendizaje:** conserva la salida y explica qué verificaste.

#### Paso 1 · Objetivo y preparación
Al finalizar podrás investigar y mejorar un proyecto desde cero. Prerrequisitos: Git, terminal, editor y un lenguaje instalado. Verifica git --version.

#### Paso 2 · Contexto y caso real
En un caso real, un bug de entregas debe reproducirse, aislarse y corregirse sin perder historial ni introducir una regresión.

#### Paso 3 · Teoría, modelo mental y analogía
Depurar significa observar, formular hipótesis, cambiar una variable y medir. Las pruebas unitarias, integración y extremo a extremo cubren preguntas distintas. Git registra decisiones y CI automatiza controles. La analogía es una investigación: evidencia antes de conclusión, y una bitácora para que otra persona repita el análisis.

#### Paso 4 · Demostración guiada desde cero
Desde una **carpeta vacía**, crea `inventario.json` y construye un historial mínimo que explique una decisión:
```bash
mkdir historial-inventario
cd historial-inventario
git init
git config user.name "Estudiante"
git config user.email "estudiante@example.com"
printf '{"stock":5}\n' > inventario.json
git add inventario.json
git commit -m "Registrar stock inicial"
printf '{"stock":3}\n' > inventario.json
git diff
git add inventario.json
git commit -m "Descontar dos unidades entregadas"
git log --oneline --decorate
```
**Resultado esperado:** dos commits distintos y un diff que muestra `"stock":5` reemplazado por `"stock":3`. **Fallo deliberado:** modifica de nuevo el archivo y ejecuta `git commit -m "cambio"` sin `git add`; Git responde que no hay cambios preparados. El diagnóstico es que el área de staging todavía no contiene esa modificación: revisa con `git status` antes de decidir si agregarla.

#### Paso 5 · Práctica guiada
Pista: introduce deliberadamente una línea incorrecta para provocar un fallo deliberado de prueba o comando; usa git diff y el log para diagnosticar y corregir. Resultado esperado: historial claro y verificación verde.

#### Paso 6 · Práctica independiente
Añade una prueba automatizada, un lint, una revisión simulada y un workflow CI que ejecute los controles.

#### Paso 7 · Cierre y evidencia
Guarda commits, salida de CI y diagnóstico; como siguiente paso estudia despliegue. Errores comunes: editar sin reproducir, commits gigantes, ignorar fallos intermitentes y confiar solo en cobertura. Fuentes oficiales: https://git-scm.com/book/es/v2 y https://docs.github.com/actions.
**¿Por qué es importante?** Porque la calidad es un proceso observable, no una impresión subjetiva.
**Evidencia de aprendizaje:** entrega historial, prueba, fallo corregido y checklist de revisión.
**Conceptos clave:** repositorio, commit, diff, branch, merge, conflicto, remoto, pull request, revisión y trazabilidad.

Git almacena snapshots conectados. Un commit profesional representa una intención coherente y explica por qué. Antes de confirmar revisa:

```bash
git status
git diff
git add src/inventario.py tests/test_inventario.py
git commit -m "Rechazar retiradas con cantidad no positiva"
```

No uses `git add .` automáticamente cuando hay archivos no revisados. Un commit con código y prueba de regresión cuenta una historia completa. Evita mensajes “cambios” o “fix”.

Una rama permite trabajar sin alterar la línea principal. `merge` combina historias. Un conflicto no significa que Git esté roto: dos cambios afectan la misma región y una persona debe decidir el resultado preservando intenciones.

```bash
git switch -c fix/cantidad-negativa
# editar y probar
git commit -am "Rechazar cantidades negativas"
git switch main
git merge fix/cantidad-negativa
```

En conflicto, lee marcadores, comprende ambos cambios, edita una versión coherente, ejecuta pruebas y recién entonces agrega/resuelve. No elijas “ours/theirs” sin entender.

Una pull request comunica contexto, riesgos, pruebas y capturas/evidencia. La revisión busca corrección, diseño, seguridad, pruebas y mantenibilidad; no preferencias personales ya automatizables por formatter. Comentarios deben explicar impacto y sugerir dirección respetuosa.

**Analogía:** Git es el cuaderno de laboratorio; cada commit registra un experimento reproducible. Una PR es revisión por pares antes de incorporar resultados al conocimiento compartido.

**¿Por qué es importante?** Trazabilidad permite entender decisiones, revertir cambios, investigar defectos y colaborar sin sobrescribir trabajo.

**Casos de uso reales:** desarrollo de features, hotfixes, auditoría, releases, revisión y contribución open source.

**Diagrama:**

```mermaid
gitGraph
    commit id: "A"
    commit id: "B"
    branch feature
    commit id: "C"
    commit id: "D"
    checkout main
    merge feature id: "E"
```

### Tema 4: Calidad estática, revisión e integración continua

Ejecuta node --version para comprobar el entorno antes de continuar. **Evidencia de aprendizaje:** conserva la salida y explica qué verificaste.

#### Paso 1 · Objetivo y preparación
Al finalizar podrás investigar y mejorar un proyecto desde cero. Prerrequisitos: Git, terminal, editor y un lenguaje instalado. Verifica git --version.

#### Paso 2 · Contexto y caso real
En un caso real, un bug de entregas debe reproducirse, aislarse y corregirse sin perder historial ni introducir una regresión.

#### Paso 3 · Teoría, modelo mental y analogía
Depurar significa observar, formular hipótesis, cambiar una variable y medir. Las pruebas unitarias, integración y extremo a extremo cubren preguntas distintas. Git registra decisiones y CI automatiza controles. La analogía es una investigación: evidencia antes de conclusión, y una bitácora para que otra persona repita el análisis.

#### Paso 4 · Demostración guiada desde cero
Desde una **carpeta vacía**, crea `src/calculo.py` y reproduce localmente el mismo control que luego ejecutará CI:
```bash
mkdir calidad-python
cd calidad-python
python3 -m venv .venv
source .venv/bin/activate  # Windows PowerShell: .venv\Scripts\Activate.ps1
python3 -m pip install ruff pytest
mkdir src tests .github .github/workflows
```
Guarda `src/calculo.py` con `def total(valores): return sum(valores)` y una prueba que compruebe `total([2, 3]) == 5`. Luego ejecuta:

```bash
ruff check .
python3 -m pytest -q
```

**Resultado esperado:** Ruff termina sin hallazgos y pytest informa `1 passed`; esos dos comandos serán los pasos del workflow en `.github/workflows/calidad.yml`. **Fallo deliberado:** añade `import os` sin usarlo. `ruff check .` informa `F401`; elimina el import o úsalo con una razón real, en lugar de desactivar la regla.

#### Paso 5 · Práctica guiada
Pista: introduce deliberadamente una línea incorrecta para provocar un fallo deliberado de prueba o comando; usa git diff y el log para diagnosticar y corregir. Resultado esperado: historial claro y verificación verde.

#### Paso 6 · Práctica independiente
Añade una prueba automatizada, un lint, una revisión simulada y un workflow CI que ejecute los controles.

#### Paso 7 · Cierre y evidencia
Guarda commits, salida de CI y diagnóstico; como siguiente paso estudia despliegue. Errores comunes: editar sin reproducir, commits gigantes, ignorar fallos intermitentes y confiar solo en cobertura. Fuentes oficiales: https://git-scm.com/book/es/v2 y https://docs.github.com/actions.
**¿Por qué es importante?** Porque la calidad es un proceso observable, no una impresión subjetiva.
**Evidencia de aprendizaje:** entrega historial, prueba, fallo corregido y checklist de revisión.
**Conceptos clave:** formatter, linter, análisis estático, type checking, pipeline, job, step, artefacto, CI, feedback y calidad continua.

Herramientas estáticas detectan problemas sin ejecutar todos los caminos. Un formatter elimina discusiones de estilo; un linter encuentra patrones riesgosos; type checking detecta incompatibilidades; análisis de dependencias descubre vulnerabilidades conocidas. Ninguna sustituye pruebas.

```yaml
name: calidad
on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: python -m pip install pytest ruff
      - run: ruff check .
      - run: pytest -q
```

CI reconstruye el proyecto en un entorno limpio. Esto descubre dependencias globales o archivos olvidados. Fija versiones importantes, usa instalación reproducible y falla con mensajes accionables. Mantén el pipeline rápido: controles baratos primero, E2E después, despliegue solo si todo pasa.

No “arregles” un pipeline desactivando la prueba. Reproduce localmente, identifica si el defecto está en producto, prueba o entorno. Un control flaky debe corregirse o aislarse con propietario y plazo, no ignorarse indefinidamente.

La revisión humana se enfoca en lo que automatización no comprende bien: requisitos, arquitectura, nombres del dominio, amenazas y trade-offs. CI aporta evidencia, no aprobación moral ni garantía absoluta.

**Analogía:** CI es una línea de inspección repetible para cada cambio; no diseña el producto, pero impide que defectos conocidos avancen silenciosamente.

**¿Por qué es importante?** La retroalimentación temprana reduce coste de corrección y convierte estándares de equipo en controles consistentes.

**Casos de uso reales:** pull requests, releases, actualizaciones de dependencias, múltiples plataformas y despliegues regulados.

**Diagrama:**

```mermaid
flowchart LR
    PUSH["push / PR"] --> INSTALL["instalar limpio"] --> LINT["formato y lint"]
    LINT --> TEST["tests"] --> BUILD["build"] --> ART["artefacto"] --> REVIEW["revisión"]
```

## Construcción guiada del capítulo

### Proyecto 5: convertir el inventario en un repositorio confiable

Trabaja en una rama `quality/test-suite`:

1. Extrae reglas puras de inventario para pruebas unitarias.
2. Configura `pytest` y crea fixtures.
3. Añade casos normales, límites, inválidos y regresiones.
4. Crea integraciones con SQLite temporal y migraciones reales.
5. Prueba rollback e importación corrupta.
6. Configura Ruff como formatter/linter o equivalente documentado.
7. Añade workflow CI para lint y pruebas.
8. Provoca una prueba fallida y conserva captura/log del pipeline rojo.
9. Corrige y conserva evidencia verde.
10. Simula una PR con descripción, riesgos, checklist y revisión de un cambio.
11. Crea conflicto deliberado en README y resuélvelo preservando ambas intenciones.

**Verificación:** `pytest` funciona en clon limpio; ninguna prueba comparte base; CI falla ante regresión; la corrección incluye prueba; historial contiene commits pequeños y explicativos.

**Errores comunes y soluciones**

- Pruebas dependientes del orden: aísla estado.
- Mockear SQLite: usa base temporal para integración.
- Cobertura como meta única: revisa aserciones y riesgos.
- Commits gigantes: separa intenciones.
- CI distinto al entorno local: documenta versiones y comandos idénticos.
