# Matemáticas discretas, lógica y probabilidad para software

Las matemáticas de este módulo no son una colección de fórmulas para memorizar. Son un lenguaje para decir exactamente qué debe ocurrir, detectar contradicciones, justificar algoritmos y distinguir una mejora real de una coincidencia. Trabajarás sobre el inventario acumulativo y convertirás afirmaciones vagas en propiedades verificables.

## Sílabo

1. Lógica proposicional, predicados, cuantificadores e invariantes.
2. Conjuntos, funciones, relaciones, inducción y corrección.
3. Combinatoria, grafos, árboles y dependencias.
4. Probabilidad, estadística descriptiva, muestreo e inferencia responsable.
5. Proyecto 9: cuaderno reproducible de razonamiento y evidencia.

## Aprende construyendo

### Tema 1: Lógica para especificar antes de programar

**Conceptos clave:** proposición, valor de verdad, negación, conjunción, disyunción, implicación, equivalencia, predicado, cuantificador universal, cuantificador existencial, precondición, postcondición e invariante.

Una proposición afirma algo que puede ser verdadero o falso. `stock >= 0` es una proposición cuando `stock` tiene un valor; `stock(x) >= 0` es un predicado sobre productos. Los conectores permiten formar reglas: un retiro es aceptable si el producto existe **y** el stock alcanza. La implicación `P -> Q` exige que cuando P sea verdadera, Q también lo sea; no afirma que P sea verdadera.

Los cuantificadores evitan ambigüedad. “Para todo producto, el stock no es negativo” se escribe `∀p: stock(p) >= 0`. “Existe un administrador activo” se expresa `∃u: admin(u) ∧ activo(u)`. Negar correctamente importa: la negación de “todos pasaron” es “existe al menos uno que no pasó”, no “nadie pasó”. Las leyes de De Morgan permiten transformar condiciones y revisar autorizaciones complejas.

Una precondición debe cumplirse antes de una operación; una postcondición describe el resultado; un invariante debe preservarse durante toda transición válida. El método de retiro puede especificarse así:

```text
Pre: cantidad > 0 y producto existe
Transición: stock_nuevo = stock_anterior - cantidad
Post: retiro aceptado implica stock_nuevo >= 0
Invariante global: para todo producto, stock >= 0
```

En Python una propiedad puede comprobar miles de entradas generadas, aunque eso no equivale por sí solo a una demostración:

```python
from hypothesis import given, strategies as st

@given(stock=st.integers(min_value=0), cantidad=st.integers(min_value=1))
def test_retirar_preserva_stock_no_negativo(stock, cantidad):
    resultado = retirar(stock, cantidad)
    assert resultado.stock >= 0
    assert resultado.aceptado == (cantidad <= stock)
```

**Analogía:** una especificación lógica se parece al contrato de una caja fuerte: define qué condiciones permiten abrirla y qué propiedad debe continuar cierta; no prescribe todavía la forma de las bisagras.

**¿Por qué es importante?** porque casos de prueba elegidos a mano suelen confirmar nuestra intuición. Predicados e invariantes obligan a declarar qué significa “correcto” y permiten buscar contraejemplos.

**Casos de uso reales:** reglas de autorización, validación de formularios, restricciones SQL, contratos de API, estados de pedidos y pruebas basadas en propiedades.

**Diagrama:**

```text
entrada cumple Pre ──> operación ──> Post debe cumplirse
       │                    │
       `──── invariante antes y después ────´
contraejemplo = entrada válida que rompe la propiedad
```

### Tema 2: Conjuntos, relaciones, funciones e inducción

**Conceptos clave:** conjunto, pertenencia, subconjunto, unión, intersección, diferencia, producto cartesiano, función, inyección, sobreyección, relación, equivalencia, orden parcial, caso base, paso inductivo y recursión.

Un conjunto agrupa elementos sin orden ni repetición. Si `A` contiene permisos concedidos y `R` permisos requeridos, la autorización puede expresarse `R ⊆ A`. La intersección encuentra elementos comunes; la diferencia identifica faltantes. Estas operaciones están detrás de roles, filtros, etiquetas y consultas.

Una relación es un subconjunto de pares. “Usuario tiene rol” relaciona usuarios y roles; “módulo depende de módulo” relaciona componentes. Una relación de equivalencia es reflexiva, simétrica y transitiva y divide elementos en clases. Un orden parcial es reflexivo, antisimétrico y transitivo: no obliga a que cada par sea comparable. La relación “es prerrequisito de” debería formar un orden sin ciclos.

Una función asigna exactamente una salida a cada entrada de su dominio. Puede ser total o parcial según esté definida para todas. Distinguir esto mejora APIs: buscar por ID puede devolver `Producto | None`; pretender que siempre existe oculta una función parcial.

La inducción demuestra propiedades indexadas por naturales. Primero prueba un caso base. Luego supone que la propiedad vale para `n` y demuestra que vale para `n+1`. Para la suma de una lista, el caso vacío devuelve cero; al agregar un elemento, la suma nueva es el elemento más la suma de la lista restante. La hipótesis inductiva conecta la estructura recursiva con su corrección.

```python
def suma(valores: list[int]) -> int:
    if not valores:                 # caso base
        return 0
    return valores[0] + suma(valores[1:])
```

Una prueba de corrección no demuestra eficiencia ni ausencia de errores de implementación ajenos a sus supuestos. Declara dominio, propiedad y supuestos explícitamente.

**Analogía:** la inducción es una fila de fichas de dominó: verificas que la primera cae y que cada ficha que cae derriba la siguiente. Ambas partes son necesarias.

**¿Por qué es importante?** porque conjuntos y relaciones modelan sistemas sin depender del lenguaje, mientras la inducción permite justificar bucles, recursión y estructuras construidas paso a paso.

**Casos de uso reales:** permisos por conjuntos, deduplicación, modelos relacionales, orden de migraciones, tipos opcionales, recorridos recursivos y pruebas de algoritmos.

**Diagrama:**

```text
Permisos requeridos R = {leer, editar}
Permisos concedidos A = {leer, editar, exportar}
R subconjunto de A -> autorizado

P(0) cierta + [P(n) implica P(n+1)] -> P(n) para todo natural n
```

### Tema 3: Conteo, grafos y estructuras conectadas

**Conceptos clave:** regla de suma, regla de producto, permutación, combinación, principio del palomar, grafo, vértice, arista, grado, camino, ciclo, grafo dirigido, DAG, árbol, BFS, DFS y orden topológico.

La combinatoria responde cuántas posibilidades existen sin enumerarlas. Si una API tiene 3 roles, 4 operaciones y 2 estados de cuenta, hay hasta `3 × 4 × 2 = 24` combinaciones de decisión. Esa cifra ayuda a diseñar particiones de prueba, aunque no obliga a ejecutar cada combinación si algunas son equivalentes.

Una permutación considera orden; una combinación no. Elegir 3 revisores entre 10 produce `C(10,3)`, mientras asignarles tres turnos distintos introduce orden. El principio del palomar afirma que al colocar más objetos que contenedores, alguno contiene más de uno; explica por qué hashes finitos necesariamente tienen colisiones, aunque una función buena las haga poco probables.

Un grafo representa entidades como vértices y relaciones como aristas. Las dependencias de módulos forman un grafo dirigido. Si no hay ciclos es un DAG y puede obtenerse un orden topológico de build o migración. DFS profundiza antes de retroceder; BFS explora por capas y encuentra caminos mínimos en grafos no ponderados.

```python
def tiene_ciclo(grafo: dict[str, set[str]]) -> bool:
    visitados, activos = set(), set()

    def visitar(nodo: str) -> bool:
        if nodo in activos:
            return True
        if nodo in visitados:
            return False
        activos.add(nodo)
        for vecino in grafo.get(nodo, set()):
            if visitar(vecino):
                return True
        activos.remove(nodo)
        visitados.add(nodo)
        return False

    return any(visitar(n) for n in grafo)
```

La terminación depende de marcar visitados; la detección del ciclo usa el conjunto de nodos activos en la ruta actual. Confundir ambos conjuntos produce falsos positivos.

**Analogía:** un grafo de dependencias es un mapa de tareas. Un ciclo significa que A espera a B mientras B, directa o indirectamente, espera a A: ninguna puede empezar.

**¿Por qué es importante?** porque redes, rutas, paquetes, builds, relaciones sociales y arquitectura comparten las mismas estructuras; reconocerlas permite reutilizar algoritmos conocidos.

**Casos de uso reales:** dependencias de paquetes, planificación de cursos, rutas de red, motores de recomendación, detección de fraude, árboles del DOM y análisis de arquitectura.

**Diagrama:**

```text
dominio -> aplicación -> infraestructura
   |            |
   `-> pruebas <-´       DAG: tiene orden posible

A -> B -> C -> A         ciclo: orden imposible
```

### Tema 4: Probabilidad y evidencia para decisiones técnicas

**Conceptos clave:** experimento, espacio muestral, evento, probabilidad condicional, independencia, variable aleatoria, esperanza, varianza, distribución, población, muestra, sesgo, intervalo de confianza, correlación, causalidad y prueba de hipótesis.

La probabilidad modela incertidumbre, no ignorancia absoluta. Una variable aleatoria asigna un número a cada resultado: latencia, errores por minuto o demanda diaria. La media resume centro, pero es sensible a extremos; mediana y percentiles describen mejor latencias asimétricas. La varianza y desviación expresan dispersión. Informar solo el promedio puede ocultar usuarios que sufren una cola larga.

La probabilidad condicional `P(A|B)` mide A sabiendo B. Independencia significa que conocer B no cambia la probabilidad de A. Confundirla con ausencia de relación visible produce errores. El teorema de Bayes actualiza una creencia inicial usando evidencia, pero una prueba con pocos falsos positivos aún puede generar muchas alertas falsas cuando el evento buscado es muy raro.

Una muestra debe representar la población sobre la que concluirás. Medir únicamente durante la noche no permite afirmar rendimiento diurno. Repetir observaciones del mismo entorno no elimina sesgo. Un intervalo de confianza comunica incertidumbre del procedimiento; no convierte una muestra mala en buena.

```python
from statistics import mean, median, quantiles

latencias = medir(repeticiones=100, semilla=2026)
p50 = median(latencias)
p95 = quantiles(latencias, n=100)[94]
print({"n": len(latencias), "media": mean(latencias), "p50": p50, "p95": p95})
```

Comparar dos versiones exige controlar calentamiento, carga, datos, hardware y orden; registrar semilla y ambiente; repetir; mostrar distribución y tamaño del efecto. Un valor p no mide importancia práctica ni probabilidad de que una hipótesis sea verdadera. Correlación tampoco prueba causalidad: una tercera variable puede explicar ambas.

**Analogía:** probar una cucharada de sopa informa sobre toda la olla solo si antes se mezcló bien y la muestra no fue elegida para confirmar el sabor esperado.

**¿Por qué es importante?** porque métricas y experimentos influyen en capacidad, alertas y despliegues. Una conclusión exagerada puede optimizar el lugar equivocado o degradar usuarios reales.

**Casos de uso reales:** pruebas A/B, SLO de latencia, detección de anomalías, planificación de capacidad, backoff aleatorio, muestreo de logs y análisis de defectos.

**Diagrama:**

```text
población -> diseño de muestreo -> muestra -> estadístico
    ^                                      |
    `------ conclusión con incertidumbre --´
sesgo de selección no se corrige aumentando n
```

## Criterio transversal de calidad del código

Aplica estas decisiones en todos los ejemplos y en tu entrega:

- usa nombres que expresen intención, dominio y unidades; evita `data`, `temp`, `manager` o `process` cuando exista un término preciso;
- mantén funciones, componentes, clases, consultas y módulos cohesionados alrededor de una responsabilidad comprobable;
- haz visibles las dependencias y los efectos de red, tiempo, archivos, estado y base de datos;
- valida entradas en la frontera y representa errores con contexto, sin ocultar la causa ni registrar secretos;
- elimina duplicación de reglas, no toda repetición textual; una abstracción incorrecta cuesta más que dos líneas parecidas;
- escribe primero la solución más simple que satisface el requisito y refactoriza con pruebas verdes;
- aplica SOLID únicamente cuando exista una necesidad real de cambio, extensión, sustitución o aislamiento.

**SOLID con criterio:** responsabilidad única significa una razón coherente de cambio, no una clase por función. Abierto/cerrado justifica estrategias cuando hay variantes reales. Sustitución exige respetar contratos. Segregación evita obligar a consumidores a depender de operaciones que no usan. Inversión de dependencias protege el dominio frente a detalles externos; no exige crear interfaces para cada objeto.

**Comprobación antes de continuar:** ¿otra persona puede entender los nombres y el flujo?, ¿los casos de error son observables?, ¿una prueba demuestra la regla principal?, ¿cada abstracción aporta más claridad de la que cuesta? Registra una decisión de refactorización y una decisión consciente de *no abstraer*.

## Laboratorio práctico

### Proyecto 9: cuaderno de propiedades, grafos y evidencia

Crea `analysis/fundamentos-matematicos.ipynb` o un documento ejecutable equivalente y un script reproducible sin depender del estado oculto del cuaderno.

1. Escribe cinco invariantes del inventario con lenguaje natural, predicados y ejemplos/contraejemplos.
2. Implementa pruebas generativas para retiro, devolución y autorización. Conserva el contraejemplo mínimo de un defecto introducido deliberadamente.
3. Define dominio, caso base, hipótesis y paso inductivo para demostrar una propiedad de búsqueda, suma o recorrido.
4. Extrae dependencias internas y represéntalas como grafo dirigido. Implementa DFS para ciclos y compara el resultado con una herramienta visual.
5. Calcula el número de combinaciones relevantes de rol, operación y estado; reduce casos mediante clases de equivalencia justificadas.
6. Compara latencia de búsqueda con y sin índice usando datos sintéticos, semilla fija, calentamiento y al menos 30 repeticiones por condición.
7. Presenta mediana, p95, dispersión y tamaño del efecto. Escribe qué puede y qué no puede concluirse.
8. Añade `make analysis` o comando equivalente que reconstruya datos, ejecute pruebas y produzca tablas desde un clon limpio.

**Verificación:** el pipeline debe fallar cuando un contraejemplo rompe un invariante o aparece un ciclo prohibido. El experimento debe registrar versión, máquina, semilla, tamaño de datos y comandos. Cambiar la semilla no debería invertir sistemáticamente la conclusión; si lo hace, informa inestabilidad en lugar de ocultarla.

**Errores comunes y soluciones**

- Tratar implicación como equivalencia: escribe tabla de verdad y busca el caso donde la conclusión ocurre sin la condición.
- Usar ejemplos como demostración: declara qué entradas no cubren y añade argumento formal o propiedad.
- DFS infinito: marca nodos y distingue visitados de activos.
- Comparar promedios aislados: muestra distribución, percentiles y tamaño muestral.
- Concluir causalidad por correlación: identifica variables de confusión y diseña control o experimento.
- Ejecutar celdas fuera de orden: reinicia y ejecuta todo automáticamente antes de entregar.


## Rúbrica del proyecto

| Criterio | Inicial | Competente | Experto |
|---|---|---|---|
| Especificación | Reglas vagas | Predicados e invariantes claros | Supuestos, contraejemplos y límites explícitos |
| Corrección | Casos felices | Propiedades generativas | Propiedad, prueba y argumento formal conectados |
| Grafos | Dibujo manual | DFS y detección de ciclo | Testigo, complejidad y restricción automatizada |
| Experimento | Un promedio | Diseño reproducible y percentiles | Incertidumbre, sesgos y efecto interpretados |
| Comunicación | Afirma sin evidencia | Resultado trazable | Separa observación, inferencia y causalidad |

## Bibliografía y fundamento académico

- Rosen, *Discrete Mathematics and Its Applications*: lógica, relaciones, conteo, inducción y grafos.
- Lehman, Leighton y Meyer, *Mathematics for Computer Science* (MIT): pruebas y estructuras discretas.
- Downey, *Think Stats*: probabilidad y estadística computacional reproducible.
- ACM/IEEE-CS CS2023: Mathematical and Statistical Foundations, Algorithmic Foundations y Society, Ethics and the Profession.
- SWEBOK v4: fundamentos matemáticos, testing, calidad, medición y métodos de ingeniería.

Los resultados observables son formalizar una regla, generar un contraejemplo, justificar una propiedad, detectar un ciclo y diseñar un experimento reproducible que comunique incertidumbre y límites.

## Resumen del módulo

- La lógica convierte reglas ambiguas en condiciones y propiedades evaluables.
- Conjuntos, funciones y relaciones modelan permisos, datos y dependencias.
- La inducción justifica propiedades de estructuras y algoritmos construidos por pasos.
- Grafos hacen visibles caminos, ciclos y órdenes de ejecución.
- Probabilidad y estadística permiten decidir con incertidumbre, siempre que el muestreo y el experimento sean honestos.
- El software experto no solo funciona: declara qué garantiza y presenta evidencia reproducible de sus límites.
