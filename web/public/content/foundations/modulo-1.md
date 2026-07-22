# Módulo 1: Pensamiento computacional y programación


## Aprende construyendo

### Tema 1: Del problema al algoritmo y a los casos de prueba

Ejecuta node --version para comprobar el entorno antes de continuar. **Evidencia de aprendizaje:** conserva la salida y explica qué verificaste.

#### Paso 1 · Objetivo y preparación
Al finalizar podrás resolver este problema desde cero. Prerrequisitos: terminal, editor y un lenguaje instalado; verifica su versión.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, una regla de tarifa o estado debe poder explicarse, probarse y modificarse sin adivinar qué ocurre.

#### Paso 3 · Teoría, modelo mental y analogía
Un algoritmo transforma entradas en salidas mediante pasos finitos. Variables guardan estado, decisiones eligen caminos, bucles repiten y funciones encapsulan una responsabilidad. La analogía es una receta con medidas: cambiar un ingrediente debe dejar claro qué resultado cambia.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-fundamentos-m1
cd ejemplo-fundamentos-m1
python --version
mkdir src
printf "resultado\n" > src/algoritmo.txt
cat src/algoritmo.txt
```
Escribe el pseudocódigo del caso, implementa el camino feliz y anota la entrada y salida.

#### Paso 5 · Práctica guiada
Pista: usa una entrada límite para provocar un fallo deliberado de lógica, traza cada paso y corrígelo. Resultado esperado: salida coherente con la regla escrita.

#### Paso 6 · Práctica independiente
Añade tres casos normales, uno límite y uno inválido; separa una función pura y documenta su complejidad.

#### Paso 7 · Cierre y evidencia
Guarda algoritmo, tabla de casos, código y salida; como siguiente paso estudia estructuras de datos. Errores comunes: programar antes de definir entrada, bucles sin condición, funciones gigantes y pruebas solo felices. Fuentes oficiales: https://www.cs.cmu.edu/~15110/ y https://developer.mozilla.org/es/docs/Learn.
**¿Por qué es importante?** Porque una solución clara se puede revisar antes de convertirla en código.
**Evidencia de aprendizaje:** entrega pseudocódigo, casos, implementación y diagnóstico.
**Conceptos clave:** problema, requisito, entrada, proceso, salida, algoritmo, precondición, caso normal, caso límite y caso inválido.

Programar no comienza escribiendo sintaxis. Comienza definiendo con precisión qué problema se resolverá. “Haz una calculadora” es ambiguo: ¿qué operaciones admite?, ¿acepta decimales?, ¿qué ocurre si el usuario escribe texto?, ¿cómo se informa una división por cero? Un **requisito** elimina ambigüedad al describir comportamiento observable.

Considera: “calcular el total de una compra aplicando 10 % de descuento cuando el subtotal sea al menos 100”. La entrada es el subtotal; el proceso compara y quizá descuenta; la salida es el total. Una precondición razonable es que el subtotal no sea negativo.

```text
LEER subtotal
SI subtotal < 0
    MOSTRAR "valor inválido"
SI NO, SI subtotal >= 100
    total = subtotal * 0.90
SI NO
    total = subtotal
MOSTRAR total
```

Este pseudocódigo no pertenece a un lenguaje específico. Permite discutir la lógica antes de preocuparnos por paréntesis. Después diseñamos casos: `50 → 50` es normal sin descuento; `100 → 90` prueba exactamente el límite; `-1 → error` prueba entrada inválida. Un único ejemplo como `150 → 135` no demuestra que el límite ni la validación funcionen.

**Ejemplo desde cero:** escribe primero la tabla de pruebas, luego el programa. Esto invierte el hábito de “codificar y ver qué pasa” por “definir qué debe pasar y comprobarlo”.

**Analogía:** un algoritmo es una ruta de viaje y los casos de prueba son recorridos de inspección: uno por la carretera principal, otro por el límite del mapa y otro intentando entrar por una vía prohibida.

**¿Por qué es importante?** Los defectos caros suelen surgir de requisitos ambiguos y casos no considerados, no de desconocer una palabra reservada. Pensar en ejemplos antes de implementar conecta programación con ingeniería.

**Casos de uso reales:** reglas de descuento, validación de edad, cálculo de impuestos, límites de retiro y permisos de acceso se expresan como entradas, decisiones y resultados verificables.

**Diagrama:**

```mermaid
flowchart LR
    NEED["necesidad"] --> REQ["requisitos"] --> IO["entradas y salidas"]
    IO --> ALG["algoritmo"] --> CASES["casos"] --> CODE["código"]
```

#### Construcción RutaFlow: especificar antes de programar

Crea `rutaflow-fundamentos/01-tarifa/casos.md` con una tabla `distancia`, `peso`, `resultado` y `motivo`; incluye normal, cero, límites y negativo. Luego crea `rutaflow-fundamentos/01-tarifa/tarifa.py` implementando únicamente esos acuerdos. Desde esa carpeta ejecuta:

```bash
python3 tarifa.py
# En Windows, si el instalador registró este comando: python tarifa.py
```

La salida esperada muestra cada caso como `OK` o detalla la diferencia.

Cambia “al menos 10 km” de `>=` a `>` y comprueba que el caso de frontera falla. Corrige la condición y añade sin copiar una regla de recargo nocturno con tres casos nuevos. Este incremento será la primera regla de tarifas de RutaFlow; todavía no usa interfaz gráfica ni base de datos porque primero debe existir un contrato verificable.

### Tema 2: Variables, tipos, expresiones y cambios de estado

Ejecuta node --version para comprobar el entorno antes de continuar. **Evidencia de aprendizaje:** conserva la salida y explica qué verificaste.

Ejecuta node --version antes de probar la expresión.

#### Paso 1 · Objetivo y preparación
Al finalizar podrás resolver este problema desde cero. Prerrequisitos: terminal, editor y un lenguaje instalado; verifica su versión.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, una regla de tarifa o estado debe poder explicarse, probarse y modificarse sin adivinar qué ocurre.

#### Paso 3 · Teoría, modelo mental y analogía
Un algoritmo transforma entradas en salidas mediante pasos finitos. Variables guardan estado, decisiones eligen caminos, bucles repiten y funciones encapsulan una responsabilidad. La analogía es una receta con medidas: cambiar un ingrediente debe dejar claro qué resultado cambia.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-fundamentos-m1
cd ejemplo-fundamentos-m1
python --version
mkdir src
printf "resultado\n" > src/algoritmo.txt
cat src/algoritmo.txt
```
Escribe el pseudocódigo del caso, implementa el camino feliz y anota la entrada y salida.

#### Paso 5 · Práctica guiada
Pista: usa una entrada límite para provocar un fallo deliberado de lógica, traza cada paso y corrígelo. Resultado esperado: salida coherente con la regla escrita.

#### Paso 6 · Práctica independiente
Añade tres casos normales, uno límite y uno inválido; separa una función pura y documenta su complejidad.

#### Paso 7 · Cierre y evidencia
Guarda algoritmo, tabla de casos, código y salida; como siguiente paso estudia estructuras de datos. Errores comunes: programar antes de definir entrada, bucles sin condición, funciones gigantes y pruebas solo felices. Fuentes oficiales: https://www.cs.cmu.edu/~15110/ y https://developer.mozilla.org/es/docs/Learn.
**¿Por qué es importante?** Porque una solución clara se puede revisar antes de convertirla en código.
**Evidencia de aprendizaje:** entrega pseudocódigo, casos, implementación y diagnóstico.
**Conceptos clave:** valor, variable, asignación, tipo, expresión, conversión y estado.

Un valor es información concreta, como `25`, `3.14`, `"Ana"` o `True`. Una variable asocia un nombre con un valor para poder usarlo posteriormente. El tipo determina qué representa el valor y qué operaciones tienen sentido: sumar números es distinto de concatenar textos.

```python
precio = 25.50
cantidad = 3
subtotal = precio * cantidad
print(subtotal)
```

Línea por línea: `precio` recibe un decimal; `cantidad`, un entero; la tercera línea evalúa la expresión de multiplicación y guarda `76.5`; la cuarta envía ese valor a salida. El signo `=` significa asignación, no afirmación matemática permanente. Si luego escribimos `cantidad = 4`, el estado cambia.

La entrada de `input()` siempre es texto. Para operar numéricamente hay que convertirla:

```python
texto = input("Cantidad: ")
cantidad = int(texto)
```

`int` puede fallar si el texto no representa un entero. Esa posibilidad forma parte del requisito; no debe ocultarse. Usa nombres que expresen significado (`precio_unitario`) y no posiciones accidentales (`x`).

Haz un trazado manual con columnas `línea`, `precio`, `cantidad`, `subtotal`. Actualiza la tabla después de cada instrucción. Este ejercicio parece lento, pero enseña a observar estado y prepara para usar un debugger.

**Analogía:** una variable es una etiqueta reutilizable sobre una caja; el tipo describe qué clase de contenido admite y las expresiones combinan contenidos para producir uno nuevo.

**¿Por qué es importante?** Comprender estado permite razonar sobre formularios, bases de datos, interfaces y procesos concurrentes. Muchos errores ocurren porque una variable tiene un valor distinto del que el programador supone.

**Casos de uso reales:** totales de una factura, estado de una sesión, cantidad disponible en inventario y progreso de una descarga son valores que cambian durante la ejecución.

**Diagrama:**

```mermaid
flowchart LR
    TEXT["entrada: '3'"] --> CONVERT["int('3')"] --> VALUE["cantidad = 3"]
    VALUE --> CALC["precio × cantidad"] --> TOTAL["subtotal"]
```

#### Construcción RutaFlow: estado visible

Guarda `rutaflow-fundamentos/02-paquete/paquete.py`. Pide cantidad y peso unitario, convierte los textos y calcula el peso total; imprime nombres y unidades: `3 unidades · 2.5 kg = 7.5 kg`. Ejecuta `python3 paquete.py`, primero con `3` y `2.5`, y después con `tres` para observar `ValueError`.

Captura solo el error de conversión en la frontera y muestra qué formato se espera. Antes de ejecutar, completa `trazado.md` con el valor de cada variable por línea. Como modificación, agrega `peso_maximo` y un booleano `requiere_division`; predice el resultado para 49.9, 50 y 50.1 kg. RutaFlow conservará cantidades como números y unidades explícitas, no textos ambiguos.

### Tema 3: Decisiones, repeticiones y trazado de ejecución

Ejecuta node --version para comprobar el entorno antes de continuar. **Evidencia de aprendizaje:** conserva la salida y explica qué verificaste.

Ejecuta node --version antes de trazar el flujo.

#### Paso 1 · Objetivo y preparación
Al finalizar podrás resolver este problema desde cero. Prerrequisitos: terminal, editor y un lenguaje instalado; verifica su versión.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, una regla de tarifa o estado debe poder explicarse, probarse y modificarse sin adivinar qué ocurre.

#### Paso 3 · Teoría, modelo mental y analogía
Un algoritmo transforma entradas en salidas mediante pasos finitos. Variables guardan estado, decisiones eligen caminos, bucles repiten y funciones encapsulan una responsabilidad. La analogía es una receta con medidas: cambiar un ingrediente debe dejar claro qué resultado cambia.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-fundamentos-m1
cd ejemplo-fundamentos-m1
python --version
mkdir src
printf "resultado\n" > src/algoritmo.txt
cat src/algoritmo.txt
```
Escribe el pseudocódigo del caso, implementa el camino feliz y anota la entrada y salida.

#### Paso 5 · Práctica guiada
Pista: usa una entrada límite para provocar un fallo deliberado de lógica, traza cada paso y corrígelo. Resultado esperado: salida coherente con la regla escrita.

#### Paso 6 · Práctica independiente
Añade tres casos normales, uno límite y uno inválido; separa una función pura y documenta su complejidad.

#### Paso 7 · Cierre y evidencia
Guarda algoritmo, tabla de casos, código y salida; como siguiente paso estudia estructuras de datos. Errores comunes: programar antes de definir entrada, bucles sin condición, funciones gigantes y pruebas solo felices. Fuentes oficiales: https://www.cs.cmu.edu/~15110/ y https://developer.mozilla.org/es/docs/Learn.
**¿Por qué es importante?** Porque una solución clara se puede revisar antes de convertirla en código.
**Evidencia de aprendizaje:** entrega pseudocódigo, casos, implementación y diagnóstico.
**Conceptos clave:** booleano, comparación, condición, rama, bucle, iteración, acumulador e invariante.

Una condición produce `True` o `False`. `if` selecciona una rama; `for` o `while` repite trabajo. Estas herramientas son suficientes para expresar gran cantidad de algoritmos, pero también permiten bucles infinitos y ramas imposibles si no se razona con cuidado.

```python
total = 0
for numero in [12, 8, 5]:
    total = total + numero
print(total)
```

Antes del bucle, `total` vale cero. En cada iteración mantiene la suma de los elementos ya visitados: esa propiedad es un **invariante**. Después de 12 vale 12; después de 8 vale 20; después de 5 vale 25. Trazar una tabla permite predecir la salida sin ejecutar.

```python
if subtotal < 0:
    print("El subtotal no puede ser negativo")
elif subtotal >= 100:
    print(subtotal * 0.90)
else:
    print(subtotal)
```

El orden importa. Primero se rechaza lo inválido; luego se evalúa descuento; finalmente queda el caso ordinario. Para probarlo, elige valores a ambos lados de cada frontera: `-1`, `0`, `99.99`, `100` y `100.01`.

**Error deliberado:** cambia `>= 100` por `> 100`. El caso `100` descubrirá la regresión. Esta práctica enseña que una prueba debe ser capaz de fallar cuando el comportamiento se rompe.

**Analogía:** una condición es una bifurcación; un bucle es recorrer estaciones hasta cumplir un criterio. El trazado es el registro del viaje, no una suposición sobre dónde terminaste.

**¿Por qué es importante?** Control de flujo modela reglas de negocio y procesamiento de colecciones. Saber trazarlo es la base para diagnosticar resultados incorrectos sin llenar el código de impresiones aleatorias.

**Casos de uso reales:** recorrer pedidos, filtrar usuarios autorizados, reintentar una petición y procesar líneas de un archivo.

**Diagrama:**

```mermaid
flowchart TD
    VALUE["subtotal"] --> INVALID{"¿negativo?"}
    INVALID -->|"sí"| ERROR["error"]
    INVALID -->|"no"| LIMIT{"¿>= 100?"}
    LIMIT -->|"sí"| DISCOUNT["aplicar descuento"]
    LIMIT -->|"no"| ORIGINAL["conservar subtotal"]
```

#### Construcción RutaFlow: procesar varias guías

Crea `rutaflow-fundamentos/03-lote/lote.py` con una lista de pesos `[12, 8, -1, 50, 50.1]`. Recorre la lista, rechaza negativos, cuenta aceptados y acumula peso sin sumar el inválido. Ejecuta `python3 lote.py`; el resultado esperado informa cuatro aceptados, uno rechazado y `120.1 kg`.

Mueve por error el acumulador dentro del bucle y usa el trazado para explicar por qué se pierde el estado. Restáuralo y cambia `<= 50` por `< 50` para que el caso límite detecte la regresión. Como modificación, agrega una parada anticipada cuando el vehículo alcance capacidad y muestra qué guías quedaron pendientes. Este flujo prepara el procesamiento de rutas sin introducir aún concurrencia.

### Tema 4: Funciones y descomposición de problemas

Ejecuta node --version para comprobar el entorno antes de continuar. **Evidencia de aprendizaje:** conserva la salida y explica qué verificaste.

Ejecuta node --version antes de llamar la función.

#### Paso 1 · Objetivo y preparación
Al finalizar podrás resolver este problema desde cero. Prerrequisitos: terminal, editor y un lenguaje instalado; verifica su versión.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, una regla de tarifa o estado debe poder explicarse, probarse y modificarse sin adivinar qué ocurre.

#### Paso 3 · Teoría, modelo mental y analogía
Un algoritmo transforma entradas en salidas mediante pasos finitos. Variables guardan estado, decisiones eligen caminos, bucles repiten y funciones encapsulan una responsabilidad. La analogía es una receta con medidas: cambiar un ingrediente debe dejar claro qué resultado cambia.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-fundamentos-m1
cd ejemplo-fundamentos-m1
python --version
mkdir src
printf "resultado\n" > src/algoritmo.txt
cat src/algoritmo.txt
```
Escribe el pseudocódigo del caso, implementa el camino feliz y anota la entrada y salida.

#### Paso 5 · Práctica guiada
Pista: usa una entrada límite para provocar un fallo deliberado de lógica, traza cada paso y corrígelo. Resultado esperado: salida coherente con la regla escrita.

#### Paso 6 · Práctica independiente
Añade tres casos normales, uno límite y uno inválido; separa una función pura y documenta su complejidad.

#### Paso 7 · Cierre y evidencia
Guarda algoritmo, tabla de casos, código y salida; como siguiente paso estudia estructuras de datos. Errores comunes: programar antes de definir entrada, bucles sin condición, funciones gigantes y pruebas solo felices. Fuentes oficiales: https://www.cs.cmu.edu/~15110/ y https://developer.mozilla.org/es/docs/Learn.
**¿Por qué es importante?** Porque una solución clara se puede revisar antes de convertirla en código.
**Evidencia de aprendizaje:** entrega pseudocódigo, casos, implementación y diagnóstico.
**Conceptos clave:** función, parámetro, argumento, retorno, alcance, contrato, responsabilidad y composición.

Una función nombra una operación y permite utilizarla con datos distintos. Sus parámetros son entradas; `return` produce una salida. Una función pequeña puede comprobarse de manera aislada.

```python
def calcular_total(subtotal):
    if subtotal < 0:
        raise ValueError("El subtotal no puede ser negativo")
    if subtotal >= 100:
        return subtotal * 0.90
    return subtotal
```

`def` declara la función. `subtotal` solo existe dentro de ella: tiene alcance local. La validación establece parte de su contrato. `raise` no imprime silenciosamente un valor inventado; informa que el contrato fue violado. Cada `return` termina la función y entrega un resultado.

```python
def leer_subtotal():
    return float(input("Subtotal: "))

def mostrar_total(total):
    print(f"Total: {total:.2f}")

subtotal = leer_subtotal()
total = calcular_total(subtotal)
mostrar_total(total)
```

Ahora entrada, negocio y presentación están separadas. `calcular_total` no conoce la terminal y puede probarse directamente con `calcular_total(100)`. Evita funciones que lean, calculen, guarden y muestren todo a la vez.

**Analogía:** una función es una máquina con conectores de entrada y salida. Si además obliga a introducir la mano, pintar el producto y enviarlo por correo, tiene demasiadas responsabilidades.

**¿Por qué es importante?** La descomposición reduce carga mental, facilita pruebas y permite reemplazar terminal por web o móvil sin reescribir la regla central.

**Casos de uso reales:** validar credenciales, calcular envío, convertir monedas y transformar respuestas de una API son operaciones que conviene aislar.

**Diagrama:**

```mermaid
flowchart LR
    INPUT["leer_subtotal()"] --> RULE["calcular_total(subtotal)"] --> OUTPUT["mostrar_total(total)"]
```

#### Construcción RutaFlow: separar entrada, regla y salida

Crea `rutaflow-fundamentos/04-cotizador/cotizador.py` con `leer_envio`, `calcular_tarifa` y `mostrar_resumen`, y `test_cotizador.py` con llamadas directas a la función pura. Ejecuta `python3 test_cotizador.py` y después `python3 cotizador.py`; debes ver casos verdes sin escribir en terminal durante las pruebas de negocio.

Introduce un `input()` dentro de `calcular_tarifa` y observa que la prueba deja de ser automática; devuelve esa responsabilidad a `leer_envio`. Como modificación, añade una función `recargo_por_zona` y compón el total sin usar variables globales. RutaFlow podrá reemplazar la terminal por HTTP o Flutter porque su regla recibe datos y devuelve un resultado, sin conocer la interfaz.


## Construcción guiada del capítulo

### Proyecto 1: calculadora de presupuesto desde carpeta vacía

Construye un programa que reciba descripción, precio y cantidad de varios productos; calcule subtotal; aplique descuento configurable; rechace valores negativos; y muestre un resumen. Empieza con `mkdir presupuesto`, crea `presupuesto.py`, `README.md` y `casos.md`.

Implementa por incrementos y crea un commit después de cada etapa:

1. Un producto con valores escritos en código.
2. Entrada del usuario y conversión de tipos.
3. Validación y mensajes claros.
4. Funciones separadas para leer, calcular y mostrar.
5. Repetición para varios productos.
6. Tabla manual con al menos ocho casos.

**Verificación:** otra persona debe poder clonar/copiar la carpeta, ejecutar el comando documentado y reproducir todos los casos. Incluye un caso normal, valores cero, límite exacto del descuento, decimales, negativo y texto inválido.

**Errores comunes y soluciones**

- Mezclar texto y número sin conversión: inspecciona tipos antes de operar.
- Usar `>` cuando el requisito dice “al menos”: prueba la frontera exacta.
- Atrapar todo error sin explicarlo: captura solo excepciones esperadas.
- Crear una función enorme: separa entrada, regla y presentación.
