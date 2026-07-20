# Módulo 2: Estructuras de datos, algoritmos y complejidad


## Aprende construyendo

### Tema 1: Elegir estructuras según las operaciones

**Conceptos clave:** lista, tupla, conjunto, diccionario, orden, duplicados, clave, acceso, inserción y mutabilidad.

Una estructura de datos organiza valores para facilitar ciertas operaciones. No existe una estructura universalmente mejor. Una lista conserva orden y permite duplicados; un conjunto representa pertenencia sin duplicados; un diccionario relaciona claves únicas con valores; una tupla expresa una agrupación fija que no se modifica.

```python
productos = [
    {"sku": "A-10", "nombre": "Teclado", "stock": 4},
    {"sku": "B-20", "nombre": "Mouse", "stock": 9},
]

por_sku = {producto["sku"]: producto for producto in productos}
categorias = {"periféricos", "oficina", "periféricos"}
```

`productos` sirve para recorrer y conservar un orden. `por_sku` permite expresar “dame el producto cuya clave es A-10” sin revisar conceptualmente todos. `categorias` elimina el duplicado porque la pregunta relevante es pertenencia, no posición.

Antes de elegir, escribe las operaciones dominantes: buscar por SKU, listar en orden, agregar, eliminar y comprobar categorías. La estructura se decide por esas operaciones y por restricciones como memoria u orden estable. Duplicar una vista derivada —lista y diccionario— puede mejorar lectura a cambio de sincronización y memoria; esa es una decisión, no magia gratuita.

**Ejemplo desde cero:** modela cinco contactos. Primero usa una lista y escribe una búsqueda por teléfono. Después crea un diccionario indexado por teléfono y compara claridad. No afirmes que uno “es más rápido” sin explicar tamaño, operación y coste de mantener el índice.

**Analogía:** una lista es una fila numerada, un conjunto es un control de invitados únicos y un diccionario es un archivador con una etiqueta única por carpeta. Cada organización acelera preguntas distintas.

**¿Por qué es importante?** Seleccionar una estructura adecuada suele producir mejoras mayores y código más claro que optimizar instrucciones individuales. Bases de datos e índices generalizan la misma idea.

**Casos de uso reales:** carrito ordenado, permisos únicos, caché por identificador, catálogo por SKU y registro de coordenadas inmutables.

**Diagrama:**

```text
¿necesitas orden/posición? → lista
¿solo pertenencia única?   → conjunto
¿buscar por clave?         → diccionario
¿grupo fijo e inmutable?   → tupla
```

### Tema 2: Pilas, colas y abstracciones de comportamiento

**Conceptos clave:** tipo abstracto de datos, pila, cola, LIFO, FIFO, push, pop, enqueue y dequeue.

Una estructura también puede definirse por las operaciones permitidas, no por su implementación concreta. Una **pila** sigue LIFO: el último elemento agregado sale primero. Una **cola** sigue FIFO: el primero en entrar sale primero. Python puede representarlas con listas o `deque`, pero el comportamiento conceptual es independiente del lenguaje.

```python
from collections import deque

historial = []
historial.append("abrir archivo")
historial.append("editar título")
ultima_accion = historial.pop()

trabajos = deque()
trabajos.append("generar factura 1")
trabajos.append("generar factura 2")
primero = trabajos.popleft()
```

En el historial, `pop` devuelve “editar título”: base de deshacer. En trabajos, `popleft` devuelve la factura 1: orden de llegada. Usar `list.pop(0)` desplaza los elementos restantes y expresa peor una cola; `deque` está diseñada para operar eficientemente en ambos extremos.

Implementa una pila con funciones `apilar`, `desapilar` y `esta_vacia`. Define qué ocurre al desapilar vacía. Ese comportamiento forma parte del contrato. Después utiliza la pila para comprobar paréntesis balanceados: al abrir, apila; al cerrar, verifica y desapila; al final debe quedar vacía.

**Analogía:** una pila es una torre de platos; una cola es la fila de atención. Sacar el plato inferior o atender al último que llegó viola el modelo.

**¿Por qué es importante?** Pilas aparecen en llamadas, navegación y parsing; colas en mensajería, impresión y procesamiento asíncrono. Reconocer el patrón evita diseñar estados confusos.

**Casos de uso reales:** undo/redo, historial del navegador, cola de emails, tareas en background y recorrido de grafos.

**Diagrama:**

```text
PILA LIFO:  A → B → C → sale C
COLA FIFO:  A → B → C → sale A
```

### Tema 3: Búsqueda, precondiciones y demostración de corrección

**Conceptos clave:** búsqueda lineal, búsqueda binaria, precondición, invariante, corrección y caso ausente.

La búsqueda lineal revisa elementos hasta encontrar el objetivo o terminar. Funciona aunque los datos no estén ordenados.

```python
def buscar_lineal(valores, objetivo):
    for indice, valor in enumerate(valores):
        if valor == objetivo:
            return indice
    return -1
```

El retorno `-1` expresa ausencia. Prueba objetivo al inicio, medio, final, ausente y lista vacía. El invariante es: antes de cada iteración, el objetivo no está en las posiciones ya examinadas.

La búsqueda binaria descarta la mitad en cada paso, pero exige datos ordenados:

```python
def buscar_binaria(valores, objetivo):
    izquierda, derecha = 0, len(valores) - 1
    while izquierda <= derecha:
        medio = (izquierda + derecha) // 2
        if valores[medio] == objetivo:
            return medio
        if valores[medio] < objetivo:
            izquierda = medio + 1
        else:
            derecha = medio - 1
    return -1
```

Traza `[2, 5, 9, 12, 20]` buscando `12`. Anota izquierda, derecha y medio. La región posible se reduce sin excluir el objetivo. Probar el algoritmo con una lista desordenada no demuestra que esté roto: viola su precondición. La interfaz o documentación debe hacer esa exigencia visible.

**Error deliberado:** usa `while izquierda < derecha`. Busca un valor que quede como último candidato y observa cómo se omite. El caso de una lista de un elemento detecta rápidamente este error.

**Analogía:** la búsqueda lineal revisa cada página; la binaria abre un diccionario por la mitad y decide en qué mitad continuar, posible solo porque está ordenado.

**¿Por qué es importante?** Un algoritmo no es correcto “porque funcionó una vez”. Debe funcionar para todas las entradas que satisfacen su contrato y terminar en tiempo finito.

**Casos de uso reales:** localizar registros, autocompletado, índices ordenados y diagnóstico de versiones mediante bisección.

**Diagrama:**

```text
[2 5 9 12 20] → medio 9 → descartar izquierda → [12 20] → encontrar 12
```

### Tema 4: Complejidad, medición, ordenamiento y recursión

**Conceptos clave:** tamaño de entrada, Big O, tiempo, espacio, O(1), O(log n), O(n), O(n²), ordenamiento y recursión.

Big O describe cómo crece el trabajo cuando crece la entrada; no es un cronómetro. Una búsqueda lineal es O(n): duplicar elementos puede duplicar comparaciones. La binaria es O(log n): duplicar el tamaño añade aproximadamente un paso. Dos bucles anidados sobre la entrada suelen sugerir O(n²).

```python
def tiene_duplicados_lento(valores):
    for i in range(len(valores)):
        for j in range(i + 1, len(valores)):
            if valores[i] == valores[j]:
                return True
    return False

def tiene_duplicados(valores):
    return len(valores) != len(set(valores))
```

La segunda solución usa memoria adicional para un conjunto y suele acercarse a O(n). Este intercambio tiempo-espacio debe documentarse. No concluyas solo por cinco elementos; mide tamaños crecientes con `time.perf_counter`, repite y evita incluir entrada/salida en la región medida.

Ordenar permite búsqueda binaria, pero ordenar también cuesta. Si harás una sola búsqueda, quizá no compense; si harás miles, puede hacerlo. El análisis debe considerar el flujo completo.

Recursión significa que una función resuelve un caso mediante una versión más pequeña del mismo problema. Necesita caso base y progreso.

```python
def factorial(n):
    if n < 0:
        raise ValueError("n debe ser no negativo")
    if n <= 1:
        return 1
    return n * factorial(n - 1)
```

Traza `factorial(4)` y dibuja llamadas. El caso base detiene; `n-1` progresa. Sin cualquiera aparece recursión infinita hasta agotar la pila. En Python, un bucle puede ser más apropiado para problemas lineales; recursión brilla en árboles y estructuras naturalmente anidadas.

**Analogía:** Big O compara la forma de crecimiento de rutas, no el modelo del vehículo. Un automóvil lento en una autopista escalable puede superar a uno rápido obligado a visitar cada par de ciudades.

**¿Por qué es importante?** El análisis permite anticipar fallos de escala antes de producción y comunicar decisiones con un vocabulario compartido.

**Casos de uso reales:** detectar duplicados, ordenar reportes, recorrer directorios, buscar en índices y evitar endpoints cuadráticos.

**Diagrama:**

```text
n=10     O(log n)≈4     O(n)=10       O(n²)=100
n=1000   O(log n)≈10    O(n)=1000     O(n²)=1 000 000
```


## Laboratorio práctico

### Proyecto 2: gestor de inventario con análisis de rendimiento

Desde una carpeta vacía crea `inventario/`, inicializa Git y construye una aplicación de consola que permita agregar, actualizar, listar, buscar y eliminar productos por SKU. Persiste los productos en `inventario.json` usando la biblioteca estándar.

Fases y commits sugeridos:

1. Modelo de producto y lista inicial.
2. CRUD en memoria con validaciones.
3. Índice por SKU y justificación escrita.
4. Guardado/carga JSON con manejo de archivo inexistente o corrupto.
5. Búsqueda lineal y binaria implementadas manualmente.
6. Generador de 100, 1 000 y 10 000 productos y medición repetida.
7. README con tabla de resultados, complejidad esperada y límites.

No uses una librería de benchmarking para ocultar el proceso. Aísla la operación, usa el mismo conjunto de consultas y registra entorno. La medición no sustituye el análisis: explica discrepancias por constantes, orden previo, caché o tamaño insuficiente.

**Verificación:** reiniciar el programa conserva datos; SKU duplicado se rechaza; búsqueda ausente no rompe; JSON corrupto produce mensaje accionable; las mediciones son reproducibles y no afirman causalidad sin evidencia.

**Errores comunes y soluciones**

- Elegir diccionario “porque es rápido” sin describir operaciones: escribe requisitos primero.
- Aplicar binaria a datos desordenados: valida o garantiza la precondición.
- Medir una sola vez: repite y reporta variabilidad.
- Confundir O(1) con tiempo cero: significa crecimiento independiente de n en el modelo.
- Recursión sin progreso: identifica caso base y reducción.
