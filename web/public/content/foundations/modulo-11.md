# Módulo 11: Ciencias de la Computación: mapa de especializaciones

## Antes de comenzar: entorno de experimentos

Necesitas Python 3 y una terminal. Crea `academia-labs/foundations/specializations/{src,evidence}`; en Windows PowerShell crea las dos carpetas por separado si tu terminal no expande llaves. Comprueba `python3 --version` o `py --version`. No instales dependencias: todos los ejemplos usan la biblioteca estándar.

## Aprende construyendo

Este capítulo no intenta resumir toda la disciplina. Construirás seis experimentos pequeños para distinguir sus áreas, reconocer los fundamentos que comparten y elegir qué estudiar después con evidencia. Trabaja dentro de `academia-labs/foundations/specializations/` y guarda cada resultado en `evidence/`.

### Tema 1: Sistemas, arquitectura y sistemas operativos

#### Paso 1 · Objetivo y preparación
Al finalizar podrás aplicar este tema desde cero. Prerrequisitos: Python y terminal; verifica `python --version`.
#### Paso 2 · Contexto y caso real
Una aplicación necesita entender recursos, procesos y límites.
#### Paso 3 · Teoría, modelo mental y analogía
El sistema operativo coordina recursos como un administrador de una ciudad.
#### Paso 4 · Demostración guiada
Crea `src/system.py` desde una carpeta vacía.
```bash
mkdir ejemplo-system
python --version
```
Resultado esperado: Python disponible.
#### Paso 5 · Práctica guiada
Pista: usa un proceso inexistente para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Mide un proceso y documenta salida.
#### Paso 7 · Cierre y evidencia
Entrega código, salida, fallo y corrección; explica el resultado. Siguiente paso: algoritmos. Errores comunes: confundir proceso e hilo. Fuente oficial: https://pages.cs.wisc.edu/~remzi/OSTEP/.

**¿Por qué es importante?** Permite entender por qué una aplicación compite por CPU, memoria y entrada/salida antes de intentar optimizarla.

**Qué construirás:** un simulador mínimo de planificación de procesos. Un sistema operativo decide qué trabajo usa el procesador; la cola no es la CPU, sino el modelo que permite decidir el siguiente turno. Esto importa en servidores, móviles y sistemas de entregas porque una mala política aumenta latencia o deja tareas sin atender.

**Conceptos clave:** un *proceso* es un programa en ejecución; una *ráfaga* es el tiempo de CPU que necesita; *Round Robin* asigna turnos de duración fija. No concluyas que una política es universalmente mejor: el resultado depende de carga, prioridad y coste del cambio de contexto.

**Modelo mental:** imagina una mesa compartida por turnos. **Límite:** el simulador no representa prioridades, espera de entrada/salida ni el coste real de cambiar de proceso.

Crea `src/round_robin.py`:

```python
from collections import deque

processes = deque([{"id": "gps", "remaining": 5}, {"id": "sync", "remaining": 3}])
quantum = 2

while processes:
    process = processes.popleft()
    consumed = min(quantum, process["remaining"])
    process["remaining"] -= consumed
    print(f"{process['id']}: usa {consumed}, resta {process['remaining']}")
    if process["remaining"] > 0:  # Solo vuelve a la cola si falta trabajo.
        processes.append(process)
```

Ejecuta `python3 src/round_robin.py`. **Resultado esperado:** turnos alternados hasta que ambos procesos lleguen a cero. Provoca `quantum = 0`: el programa no avanza porque ningún proceso consume CPU. Valida `quantum > 0` y explica el error en `evidence/systems.md`.

**Modifica y comprueba:** añade un proceso `photo` con ráfaga 7 y registra cuántos turnos necesita. En RutaFlow, relaciona cada proceso con GPS, sincronización y procesamiento de evidencia fotográfica.

### Tema 2: Algoritmos, autómatas, lenguajes y compiladores

#### Paso 1 · Objetivo y preparación
Al finalizar podrás aplicar este tema desde cero. Prerrequisitos: Python y terminal; verifica `python --version`.
#### Paso 2 · Contexto y caso real
Un compilador transforma reglas en un programa ejecutable.
#### Paso 3 · Teoría, modelo mental y analogía
La traducción ocurre por etapas verificables, como traducir un idioma formal.
#### Paso 4 · Demostración guiada
Crea `src/compiler.py` desde una carpeta vacía.
```bash
mkdir ejemplo-compiler
python --version
```
Resultado esperado: Python disponible.
#### Paso 5 · Práctica guiada
Pista: introduce un token inválido para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Añade una regla y una prueba.
#### Paso 7 · Cierre y evidencia
Entrega código, salida, fallo y corrección; explica el resultado. Siguiente paso: datos. Errores comunes: mezclar análisis y ejecución. Fuente oficial: https://craftinginterpreters.com/.

**¿Por qué es importante?** Convierte reglas informales en lenguajes que una máquina puede reconocer, rechazar y probar de manera determinista.

**Qué construirás:** un analizador de códigos de seguimiento. Un autómata conserva un estado pequeño mientras lee símbolos; un parser decide si una secuencia pertenece a un lenguaje. Esta idea sostiene validadores, protocolos, compiladores y formularios.

El código válido tendrá `RF-` seguido de cuatro dígitos. Esta gramática es deliberadamente limitada: reconocer una forma no verifica que el envío exista ni que el usuario tenga autorización.

**Modelo mental:** cada carácter abre o cierra el camino hacia un estado válido. **Límite:** validar sintaxis no valida identidad, existencia ni permisos en RutaFlow.

Crea `src/tracking_parser.py`:

```python
def is_tracking_code(text: str) -> bool:
    state = "R"
    digits = 0
    for char in text:
        if state == "R" and char == "R": state = "F"
        elif state == "F" and char == "F": state = "DASH"
        elif state == "DASH" and char == "-": state = "DIGITS"
        elif state == "DIGITS" and char.isdigit(): digits += 1
        else: return False  # Símbolo inválido para el estado actual.
    return state == "DIGITS" and digits == 4

for value in ["RF-2048", "RF-20A8", "RF-12345"]:
    print(value, is_tracking_code(value))
```

Ejecuta `python3 src/tracking_parser.py`. La salida esperada es `True`, `False`, `False`. El fallo más común es aceptar cualquier cantidad de dígitos; prueba límites antes de conectar el parser con datos reales.

**Modifica y comprueba:** permite un prefijo de país `CO-RF-2048` sin usar expresiones regulares. Dibuja los nuevos estados y guarda tres casos en `evidence/languages.md`.

### Tema 3: Bases de datos, almacenes analíticos y minería de datos

#### Paso 1 · Objetivo y preparación
Al finalizar podrás aplicar este tema desde cero. Prerrequisitos: Python y terminal; verifica `python --version`.
#### Paso 2 · Contexto y caso real
Los datos de entregas requieren modelo, consulta y medición.
#### Paso 3 · Teoría, modelo mental y analogía
Una base de datos es un archivo con reglas de acceso y consistencia.
#### Paso 4 · Demostración guiada
Crea `src/data.py` desde una carpeta vacía.
```bash
mkdir ejemplo-data
python --version
```
Resultado esperado: Python disponible.
#### Paso 5 · Práctica guiada
Pista: consulta una columna inexistente para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Añade índice y prueba.
#### Paso 7 · Cierre y evidencia
Entrega código, salida, fallo y corrección; explica el resultado. Siguiente paso: inteligencia artificial. Errores comunes: ignorar cardinalidad. Fuente oficial: https://www.postgresql.org/docs/.

**¿Por qué es importante?** Ayuda a separar decisiones operativas de análisis histórico y evita extraer conclusiones que los datos no respaldan.

**Qué construirás:** una consulta transaccional y una agregación analítica sobre entregas. Una base operacional optimiza escrituras y consultas concretas; un almacén analítico organiza historia para comparar periodos. Minería de datos busca patrones, pero una correlación no demuestra una causa.

**Modelo mental:** la base operacional es la libreta de trabajo actual y el almacén analítico es el archivo histórico. **Límite:** tres filas comprueban la consulta, pero no representan toda la operación.

Crea `src/delivery_data.py`:

```python
import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE delivery (zone TEXT NOT NULL, minutes INTEGER NOT NULL CHECK(minutes > 0))")
db.executemany("INSERT INTO delivery VALUES (?, ?)", [("norte", 31), ("norte", 25), ("sur", 48)])

query = "SELECT zone, COUNT(*), ROUND(AVG(minutes), 1) FROM delivery GROUP BY zone"
for zone, total, average in db.execute(query):
    print(zone, total, average)
```

Ejecuta `python3 src/delivery_data.py`. **Resultado esperado:** `norte 2 28.0` y `sur 1 48.0`. Intenta insertar cero minutos: la restricción `CHECK` debe rechazar el dato. Si eliminas esa restricción, el promedio seguirá ejecutándose, pero representará información inválida.

**Modifica y comprueba:** añade fecha y estado, calcula entregas completadas por día y explica qué índice usarías. Este experimento alimenta el tablero operativo de RutaFlow, no un modelo predictivo todavía.

### Tema 4: Inteligencia artificial, aprendizaje automático y visión

#### Paso 1 · Objetivo y preparación
Al finalizar podrás aplicar este tema desde cero. Prerrequisitos: Python y terminal; verifica `python --version`.
#### Paso 2 · Contexto y caso real
Un modelo predictivo debe medirse y explicar sus límites.
#### Paso 3 · Teoría, modelo mental y analogía
Aprender es ajustar una función con datos y validar fuera de muestra.
#### Paso 4 · Demostración guiada
Crea `src/ml.py` desde una carpeta vacía.
```bash
mkdir ejemplo-ml
python --version
```
Resultado esperado: Python disponible.
#### Paso 5 · Práctica guiada
Pista: mezcla entrenamiento y prueba para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Añade métrica y conjunto de validación.
#### Paso 7 · Cierre y evidencia
Entrega código, salida, fallo y corrección; explica el resultado. Siguiente paso: gráficos. Errores comunes: fuga de datos y sesgo no medido. Fuente oficial: https://scikit-learn.org/stable/user_guide.html.

**¿Por qué es importante?** Obliga a comparar cualquier modelo con una línea base y a medir errores antes de confiar decisiones a una predicción.

**Qué construirás:** una línea base que estima retraso usando el promedio histórico. Una *característica* es una entrada medible; una *etiqueta* es el resultado que se quiere predecir; una línea base sencilla permite demostrar si un modelo complejo realmente mejora.

**Modelo mental:** la línea base es el rival mínimo que cualquier modelo nuevo debe superar. **Límite:** una media histórica no entiende tráfico, zona, clima ni cambios operativos.

Crea `src/delay_baseline.py`:

```python
training_minutes = [22, 24, 27, 31, 36]
test_minutes = [25, 33]
prediction = sum(training_minutes) / len(training_minutes)

errors = [abs(real - prediction) for real in test_minutes]
mae = sum(errors) / len(errors)  # Error absoluto medio: menor es mejor.
print(f"predicción={prediction:.1f}, mae={mae:.1f}")
```

Ejecuta `python3 src/delay_baseline.py`. **Resultado esperado:** `predicción=28.0, mae=4.0`. Deja `training_minutes` vacío para provocar una división por cero. La corrección profesional no es inventar un valor: valida datos, registra el incidente y evita publicar una predicción.

**Modifica y comprueba:** compara la media con la mediana y justifica cuál resiste mejor un valor extremo de 300 minutos. En RutaFlow, nunca uses ubicación, imagen o comportamiento personal sin propósito, consentimiento, retención definida y análisis de sesgo.

### Tema 5: Gráficos y cómputo científico

#### Paso 1 · Objetivo y preparación
Al finalizar podrás aplicar este tema desde cero. Prerrequisitos: Python y terminal; verifica `python --version`.
#### Paso 2 · Contexto y caso real
Una visualización debe comunicar una decisión operativa.
#### Paso 3 · Teoría, modelo mental y analogía
Un gráfico traduce variables y escalas en una comparación visible.
#### Paso 4 · Demostración guiada
Crea `src/plot.py` desde una carpeta vacía.
```bash
mkdir ejemplo-plot
python --version
```
Resultado esperado: Python disponible.
#### Paso 5 · Práctica guiada
Pista: cambia la escala para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Añade unidades, etiquetas y prueba.
#### Paso 7 · Cierre y evidencia
Entrega código, salida, fallo y corrección; explica el resultado. Siguiente paso: redes. Errores comunes: ejes ambiguos y datos sin unidad. Fuente oficial: https://matplotlib.org/stable/users/explain/quick_start.html.

**¿Por qué es importante?** Explica cómo mapas, animaciones y simulaciones transforman coordenadas conservando propiedades que pueden verificarse.

**Qué construirás:** una transformación de coordenadas 2D. Los gráficos representan puntos mediante vectores y los transforman con matrices; el cómputo científico exige además medir error numérico y documentar unidades.

**Modelo mental:** una transformación cambia la representación siguiendo una regla que debe conservar propiedades conocidas. **Límite:** este plano cartesiano no sustituye una proyección geográfica para GPS.

Crea `src/transform.py`:

```python
from math import cos, sin, pi

def rotate(point: tuple[float, float], degrees: float) -> tuple[float, float]:
    radians = degrees * pi / 180
    x, y = point
    return (x * cos(radians) - y * sin(radians), x * sin(radians) + y * cos(radians))

x, y = rotate((1.0, 0.0), 90)
print(round(x, 6), round(y, 6))
```

Ejecuta `python3 src/transform.py`. El resultado esperado es `0.0 1.0`. Sin `round` probablemente verás un número diminuto distinto de cero: no es necesariamente un error lógico, sino precisión finita de punto flotante.

**Modifica y comprueba:** rota tres puntos que formen una ruta y verifica que la distancia entre ellos se conserve. En RutaFlow esta base ayuda a entender mapas y animación, pero latitud y longitud reales requieren una proyección geográfica apropiada.

### Tema 6: Redes, seguridad, web e ingeniería profesional

#### Paso 1 · Objetivo y preparación
Al finalizar podrás aplicar este tema desde cero. Prerrequisitos: Python y terminal; verifica `python --version`.
#### Paso 2 · Contexto y caso real
La ingeniería profesional une red, seguridad y operación verificable.
#### Paso 3 · Teoría, modelo mental y analogía
Cada capa tiene contrato, amenaza, prueba y responsable.
#### Paso 4 · Demostración guiada
Crea `src/professional.py` desde una carpeta vacía.
```bash
mkdir ejemplo-profesional
python --version
```
Resultado esperado: Python disponible.
#### Paso 5 · Práctica guiada
Pista: elimina una validación para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Añade revisión y automatización.
#### Paso 7 · Cierre y evidencia
Entrega código, salida, fallo y corrección; explica el resultado. Siguiente paso: especialización. Errores comunes: seguridad como añadido y documentación desactualizada. Fuente oficial: https://owasp.org/www-project-top-ten/.

**¿Por qué es importante?** Enseña a comunicar evidencia y riesgos para que una decisión técnica pueda revisarse, reproducirse y corregirse.

**Qué construirás:** un informe reproducible que separa evidencia, inferencia y decisión. La ingeniería profesional no termina al producir código: declara amenazas, privacidad, accesibilidad, operación y límites éticos.

**Modelo mental:** evidencia es lo observado, inferencia es la explicación provisional y decisión es la acción reversible. **Límite:** una observación pequeña no demuestra por sí sola la causa de un incidente.

Crea `src/evidence.py`:

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class Finding:
    evidence: str
    inference: str
    decision: str

finding = Finding(
    evidence="2 de 20 solicitudes superaron 500 ms",
    inference="la latencia podría concentrarse en una dependencia",
    decision="añadir trazas antes de escalar infraestructura",
)
print(finding)
```

Ejecuta `python3 src/evidence.py` y guarda la salida en `evidence/professional-practice.txt`. **Resultado esperado:** una representación de `Finding` con sus tres campos. Cambia `frozen=True` por `False` y modifica la evidencia después de decidir: técnicamente funciona, pero destruye la trazabilidad. La inmutabilidad no garantiza verdad; evita que el registro cambie accidentalmente.

**Modifica y comprueba:** añade `risk` y `owner`, después redacta un README para que otra persona reproduzca uno de los seis experimentos. El entregable de RutaFlow es una decisión de especialización respaldada por resultados, límites y el prerrequisito que estudiarás después.

## Fuentes para continuar

- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- Python, SQLite y documentación de cada biblioteca estándar utilizada.
- NIST Secure Software Development Framework y W3C Web Accessibility Initiative para práctica profesional.
