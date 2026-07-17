# Módulo 2: Colecciones y genéricos

## Sílabo

**Objetivo general**

Dominar el Java Collections Framework como base de cualquier programa real, eligiendo la estructura de datos correcta para cada caso, y usar genéricos para escribir código reutilizable con seguridad de tipos.

**Objetivos específicos**

1. Elegir entre `ArrayList` y `LinkedList` según el patrón de acceso.
2. Usar `HashSet` y `TreeSet` según se necesite o no orden.
3. Crear una clase genérica propia con `<T>`.
4. Diferenciar `Comparable` de `Comparator`.
5. Recorrer un `Map` con for-each usando `entrySet()`.

**Contenido**

- List, Set, Map y sus implementaciones.
- Genéricos: `<T>` y wildcards.
- Comparable vs Comparator.
- Iteradores y for-each.
- Queue, Deque y ConcurrentHashMap.
- Type erasure y `@SafeVarargs`.

**Evaluación**

Estructura de datos propia genérica (ej. cola de prioridad) con tests, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: List, Set, Map y sus implementaciones

**Conceptos clave:** acceso indexado vs inserción eficiente, unicidad, orden.

`ArrayList` implementa `List` respaldado por un arreglo redimensionable internamente, ofreciendo acceso indexado rápido (`O(1)`, acceder a cualquier posición por su índice es prácticamente instantáneo) e inserción eficiente al final, pero inserción o eliminación costosa al inicio o en medio (`O(n)`, dado que todos los elementos posteriores deben desplazarse una posición); `LinkedList` implementa la misma interfaz `List` respaldada internamente por una lista doblemente enlazada de nodos, ofreciendo inserción y eliminación eficiente al inicio o en medio (sin necesidad de desplazar elementos, solo reenlazar referencias), a costa de acceso indexado más lento (`O(n)`, dado que acceder a una posición arbitraria requiere recorrer la lista nodo por nodo desde uno de los extremos).

`HashSet` implementa `Set` (una colección que garantiza ausencia de duplicados) respaldada por una tabla hash, ofreciendo operaciones de inserción y búsqueda extremadamente rápidas en promedio, pero sin ningún orden garantizado entre los elementos almacenados; `TreeSet` implementa la misma garantía de unicidad, pero manteniendo los elementos ordenados automáticamente según su orden natural (o un `Comparator` proporcionado, Tema 3), a costa de operaciones ligeramente más lentas que `HashSet` (`O(log n)` en vez de aproximadamente `O(1)`), dado que mantener el orden requiere una estructura interna de árbol balanceado en vez de una tabla hash simple.

`Map<K, V>` asocia claves únicas con valores (`edades.put("Ana", 28)`), con `HashMap` como la implementación más común (sin orden garantizado, acceso rápido) y alternativas como `LinkedHashMap` (que preserva el orden de inserción) o `TreeMap` (que ordena por clave, análogamente a `TreeSet`).

**Analogía:** `ArrayList` es como un estante numerado donde acceder a cualquier posición específica por su número es instantáneo, pero insertar un nuevo objeto al principio requiere renumerar y desplazar físicamente todos los demás objetos; `LinkedList` es como una cadena de personas tomadas de las manos, donde insertar a alguien nuevo en cualquier punto solo requiere que sus dos vecinos inmediatos se suelten y vuelvan a tomarse de la mano con la persona nueva, sin mover a nadie más, pero encontrar a la persona en la posición 500 requiere contar uno por uno desde el principio.

**¿Por qué es importante?** Elegir `ArrayList` frente a `LinkedList` según si el patrón de acceso predominante es indexado o de inserción/eliminación frecuente en los extremos evita costos de rendimiento innecesarios; elegir `HashSet` frente a `TreeSet` según si se necesita o no orden automático evita el costo adicional de mantener ese orden cuando no es requerido.

**Diagrama:**

```java
List<String> lista = new ArrayList<>();   // acceso indexado rápido, inserción al final eficiente
List<String> enlazada = new LinkedList<>(); // inserción/eliminación al inicio eficiente, acceso indexado lento

Set<String> unicos = new HashSet<>();      // sin duplicados, sin orden garantizado
Set<String> ordenado = new TreeSet<>();    // sin duplicados, ordenado automáticamente

Map<String, Integer> edades = new HashMap<>();
edades.put("Ana", 28);
```

### Tema 2: Genéricos, wildcards y type erasure

**Conceptos clave:** `<T>`, seguridad de tipos en compilación, borrado de tipos en tiempo de ejecución.

`class Caja<T> { private T contenido; void guardar(T valor) { this.contenido = valor; } T obtener() { return contenido; } }` define una clase genérica capaz de almacenar y devolver un valor de cualquier tipo concreto que se especifique al instanciarla (`Caja<String> cajaTexto = new Caja<>();`), con el compilador verificando en tiempo de compilación que solo se guarden y recuperen valores del tipo `String` para esa instancia específica, sin necesidad de castear manualmente el valor recuperado (como sí sería necesario si `Caja` almacenara internamente un `Object` genérico sin parametrizar).

Los wildcards (`List<? extends Number>`, aceptando una lista de `Number` o cualquier subtipo suyo, útil como parámetro de un método que solo lee elementos de la lista sin necesitar saber el tipo exacto) permiten mayor flexibilidad en las firmas de métodos que reciben colecciones genéricas, sin comprometer la seguridad de tipos. El type erasure es el mecanismo mediante el cual la información de tipo genérico (`<T>`, `<String>`, etc.) existe únicamente durante la compilación, para la verificación de tipos, pero se "borra" del bytecode final generado: en tiempo de ejecución, `Caja<String>` y `Caja<Integer>` son literalmente la misma clase `Caja` sin ninguna distinción de tipo genérico retenida, una decisión de diseño de Java tomada para preservar compatibilidad con código anterior a la introducción de genéricos (Java 5); `@SafeVarargs` suprime una advertencia del compilador relacionada específicamente con la combinación de varargs y genéricos, usada cuando el desarrollador garantiza manualmente que esa combinación específica es segura en ese caso concreto.

**Analogía:** los genéricos son como una plantilla de formulario que se ajusta automáticamente para verificar que solo se ingrese el tipo de dato correcto según el propósito específico de cada formulario concreto (uno para texto, otro para números); el type erasure es como que, una vez que el formulario ya fue completado y archivado, el archivo físico final no conserva ninguna etiqueta especial indicando para qué tipo de formulario fue diseñado originalmente, aunque esa verificación sí se aplicó estrictamente durante el proceso de llenado.

**¿Por qué es importante?** Los genéricos proporcionan seguridad de tipos en tiempo de compilación sin necesidad de castear manualmente; el type erasure explica por qué esa información de tipo genérico no está disponible para inspección en tiempo de ejecución, una limitación relevante al usar reflexión o al diseñar ciertas APIs genéricas avanzadas.

**Diagrama:**

```java
class Caja<T> {
    private T contenido;
    void guardar(T valor) { this.contenido = valor; }
    T obtener() { return contenido; }
}
Caja<String> cajaTexto = new Caja<>();
// En tiempo de ejecución: type erasure borra <String>, solo queda Caja
```

### Tema 3: Comparable vs Comparator, e iteración

**Conceptos clave:** orden natural único frente a órdenes alternativos externos, `entrySet()`.

`Comparable<Persona>` (implementado directamente por la clase `Persona`, definiendo `compareTo`) establece el único orden "natural" de esa clase, apropiado cuando existe una forma canónica y única de ordenar objetos de ese tipo (por ejemplo, ordenar personas por edad como su criterio de orden natural más obvio y común); `Comparator` (una función o clase externa a `Persona`, pasada explícitamente a métodos de ordenamiento como `sort`) permite definir órdenes alternativos adicionales sin modificar la clase original (`personas.sort(Comparator.comparing(Persona::getNombre))`, ordenando por nombre sin tocar la implementación de `compareTo` que ya ordena por edad), apropiado cuando se necesitan múltiples criterios de orden distintos según el contexto específico de cada uso.

Recorrer un `Map` con for-each requiere iterar sobre `entrySet()` (`for (Map.Entry<String, Integer> entrada : edades.entrySet())`), que devuelve una vista del mapa como un conjunto de pares clave-valor, permitiendo acceder tanto a `entrada.getKey()` como a `entrada.getValue()` dentro de una única iteración, en vez de iterar únicamente sobre las claves (`keySet()`) y tener que consultar el valor correspondiente por separado en cada iteración, un patrón menos eficiente que recorrer directamente los pares ya emparejados de `entrySet()`.

**Analogía:** `Comparable` es como la forma oficial y única en que un catálogo ordena sus productos por defecto (por ejemplo, por código de producto); `Comparator` es como poder pedirle al mismo catálogo que, sin modificar su orden oficial, te lo muestre temporalmente ordenado de otra forma alternativa según tu necesidad puntual (por precio, por nombre), sin alterar el orden oficial del catálogo para nadie más.

**¿Por qué es importante?** `Comparable` define el único orden natural de una clase; `Comparator` permite múltiples órdenes alternativos externos sin modificar esa clase, siendo la elección correcta según si se necesita un único criterio canónico o múltiples criterios intercambiables.

**Diagrama:**

```java
class Persona implements Comparable<Persona> {
    public int compareTo(Persona otra) { return this.edad - otra.edad; } // orden "natural"
}
personas.sort(Comparator.comparing(Persona::getNombre)); // orden alternativo, sin modificar la clase

for (Map.Entry<String, Integer> entrada : edades.entrySet()) {
    System.out.println(entrada.getKey() + ": " + entrada.getValue());
}
```

---

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

**Objetivo del laboratorio:** construir una estructura de datos genérica propia con tests, comparando el rendimiento de distintas implementaciones de colecciones.

**Requisitos previos:** Módulo 1 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Comparar `ArrayList` vs `LinkedList` insertando al inicio | Ver Tema 1 | Mide el tiempo con 100,000 elementos |
| 2 | Usar `HashSet` y `TreeSet` para eliminar duplicados | Ver Tema 1 | Compara la presencia de orden |
| 3 | Crear `Caja<T>` genérica | Ver Tema 2 | Verifica la seguridad de tipos en compilación |
| 4 | Implementar `Comparable` y un `Comparator` externo | Ver Tema 3 | Compara ambos criterios de orden |
| 5 | Recorrer un `Map` con `entrySet()` | Ver Tema 3 | Verifica acceso a clave y valor |

**Verificación:** el laboratorio se considera exitoso si la comparación de rendimiento entre `ArrayList` y `LinkedList` muestra la diferencia esperada al insertar al inicio, y si la estructura de datos genérica propia funciona correctamente con al menos dos tipos concretos distintos.

**Errores comunes y soluciones**

- **Usar `ArrayList` para inserciones frecuentes al inicio de una lista grande.** Considera `LinkedList` para ese patrón de acceso específico.
- **Asumir orden en un `HashSet`.** Usa `TreeSet` o `LinkedHashSet` si el orden importa.
- **Confundir cuándo usar `Comparable` frente a `Comparator`.** Usa `Comparable` para el único orden natural de la clase; `Comparator` para órdenes alternativos externos.

---

## Ejercicios de evaluación

### Ejercicio 1: Cuándo elegir LinkedList sobre ArrayList

**Enunciado:** ¿cuándo elegirías un `LinkedList` sobre un `ArrayList`?

**Solución esperada:** cuando el patrón de acceso predominante involucra inserciones o eliminaciones frecuentes al inicio o en medio de la lista, dado que `LinkedList` realiza esas operaciones sin necesidad de desplazar elementos, a diferencia de `ArrayList`, donde esas mismas operaciones requieren desplazar todos los elementos posteriores.

**Criterios de éxito:**
- Identifica correctamente el patrón de inserción/eliminación frecuente en los extremos como el criterio de elección.

### Ejercicio 2: Comparable vs Comparator

**Enunciado:** ¿qué diferencia hay entre implementar `Comparable` y pasar un `Comparator`?

**Solución esperada:** `Comparable` se implementa directamente en la clase y define su único orden natural; `Comparator` es una función o clase externa que define un orden alternativo adicional sin modificar la clase original, permitiendo múltiples criterios de orden distintos según el contexto.

**Criterios de éxito:**
- Distingue correctamente el orden natural único (Comparable) del orden alternativo externo (Comparator).

### Ejercicio 3: Type erasure

**Enunciado:** explica qué es el type erasure y una consecuencia práctica de su existencia.

**Solución esperada:** el type erasure borra la información de tipo genérico del bytecode final, existiendo únicamente durante la compilación para verificación de tipos; una consecuencia práctica es que, en tiempo de ejecución, `Caja<String>` y `Caja<Integer>` son la misma clase sin distinción de tipo genérico retenida, lo cual limita ciertas operaciones de reflexión o verificación de tipos genéricos en tiempo de ejecución.

**Criterios de éxito:**
- Explica correctamente el borrado de información de tipo genérico en tiempo de ejecución y menciona una consecuencia práctica razonable.

---

## Rúbrica del proyecto

Esta rúbrica evalúa el laboratorio y los ejercicios como evidencia de dominio, no la mera finalización de pasos.

| Criterio | Peso | Evidencia esperada |
|---|---:|---|
| Comprensión conceptual | 20% | Explica el mecanismo, sus límites y por qué la solución funciona. |
| Implementación funcional | 30% | El artefacto satisface requisitos normales, límite y de error. |
| Verificación | 20% | Incluye pruebas, mediciones o inspecciones reproducibles. |
| Diseño y calidad | 15% | Nombres, estructura, seguridad y mantenibilidad son deliberados. |
| Comunicación profesional | 15% | README, decisiones, comandos y resultados permiten repetir el trabajo. |

Se alcanza competencia con 70/100 y sin cero en implementación o verificación. El nivel experto exige comparar alternativas, justificar trade-offs y reconocer condiciones donde la solución dejaría de ser válida.

## Bibliografía y fundamento académico

Estas fuentes sustentan los conceptos y deben consultarse para verificar detalles que cambian entre versiones:

- Oracle, *Java Language Specification* y *Java Virtual Machine Specification*.
- OpenJDK, documentación de Java SE, JFR y JMH.
- Bloch, J., *Effective Java*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- `ArrayList`/`LinkedList` y `HashSet`/`TreeSet` ofrecen distintos balances de rendimiento según el patrón de acceso o la necesidad de orden.
- Los genéricos (`<T>`) proporcionan seguridad de tipos en compilación, borrada del bytecode final por el type erasure.
- `Comparable` define el único orden natural de una clase; `Comparator` permite órdenes alternativos externos.
- `entrySet()` permite recorrer un `Map` accediendo eficientemente a clave y valor en una única iteración.

**Conceptos aprendidos**

- List, Set, Map y sus implementaciones principales.
- Genéricos, wildcards y type erasure.
- Comparable vs Comparator.
- Iteración sobre Maps con entrySet.

**Próximos pasos**

En el Módulo 3 aprenderás excepciones y manejo de recursos: checked vs unchecked, try-with-resources, y excepciones personalizadas.

**Recursos adicionales**

- Documentación oficial de Java (docs.oracle.com/en/java): "Java Collections Framework" y "Generics".
