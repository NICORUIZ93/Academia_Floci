# Módulo 2: Colecciones y genéricos


## Aprende construyendo

### Tema 1: List, Set, Map y sus implementaciones

**Conceptos clave:** acceso indexado vs inserción eficiente, unicidad, orden.

`ArrayList` implementa `List` respaldado por un arreglo redimensionable internamente, ofreciendo acceso indexado rápido (`O(1)`, acceder a cualquier posición por su índice es prácticamente instantáneo) e inserción eficiente al final, pero inserción o eliminación costosa al inicio o en medio (`O(n)`, dado que todos los elementos posteriores deben desplazarse una posición); `LinkedList` implementa la misma interfaz `List` respaldada internamente por una lista doblemente enlazada de nodos, ofreciendo inserción y eliminación eficiente al inicio o en medio (sin necesidad de desplazar elementos, solo reenlazar referencias), a costa de acceso indexado más lento (`O(n)`, dado que acceder a una posición arbitraria requiere recorrer la lista nodo por nodo desde uno de los extremos).

`HashSet` implementa `Set` (una colección que garantiza ausencia de duplicados) respaldada por una tabla hash, ofreciendo operaciones de inserción y búsqueda extremadamente rápidas en promedio, pero sin ningún orden garantizado entre los elementos almacenados; `TreeSet` implementa la misma garantía de unicidad, pero manteniendo los elementos ordenados automáticamente según su orden natural (o un `Comparator` proporcionado, Tema 3), a costa de operaciones ligeramente más lentas que `HashSet` (`O(log n)` en vez de aproximadamente `O(1)`), dado que mantener el orden requiere una estructura interna de árbol balanceado en vez de una tabla hash simple.

`Map<K, V>` asocia claves únicas con valores (`edades.put("Ana", 28)`), con `HashMap` como la implementación más común (sin orden garantizado, acceso rápido) y alternativas como `LinkedHashMap` (que preserva el orden de inserción) o `TreeMap` (que ordena por clave, análogamente a `TreeSet`).

**Analogía:** `ArrayList` es como un estante numerado donde acceder a cualquier posición específica por su número es instantáneo, pero insertar un nuevo objeto al principio requiere renumerar y desplazar físicamente todos los demás objetos; `LinkedList` es como una cadena de personas tomadas de las manos, donde insertar a alguien nuevo en cualquier punto solo requiere que sus dos vecinos inmediatos se suelten y vuelvan a tomarse de la mano con la persona nueva, sin mover a nadie más, pero encontrar a la persona en la posición 500 requiere contar uno por uno desde el principio.

**¿Por qué es importante?** Elegir `ArrayList` frente a `LinkedList` según si el patrón de acceso predominante es indexado o de inserción/eliminación frecuente en los extremos evita costos de rendimiento innecesarios; elegir `HashSet` frente a `TreeSet` según si se necesita o no orden automático evita el costo adicional de mantener ese orden cuando no es requerido.

**Código del ejemplo:**

```java
List<String> lista = new ArrayList<>();   // acceso indexado rápido, inserción al final eficiente
List<String> enlazada = new LinkedList<>(); // inserción/eliminación al inicio eficiente, acceso indexado lento

Set<String> unicos = new HashSet<>();      // sin duplicados, sin orden garantizado
Set<String> ordenado = new TreeSet<>();    // sin duplicados, ordenado automáticamente

Map<String, Integer> edades = new HashMap<>();
edades.put("Ana", 28);
```

#### Construcción RutaFlow: paradas, unicidad y búsqueda

Crea `src/main/java/academia/entregas/ColeccionesRutaDemo.java`. Usa `ArrayList<String>` para la secuencia de paradas, `HashSet<String>` para códigos de guía ya escaneados y `HashMap<String, Guia>` para buscar una guía por número. Inserta dos veces `RF-1001` en el conjunto e imprime tamaños y contenido. Compila junto con `Guia.java` usando `javac -d out src/main/java/academia/entregas/*.java` y ejecuta `java -cp out academia.entregas.ColeccionesRutaDemo`. El resultado esperado es una sola guía escaneada aunque se intentó registrar dos veces.

Intenta leer una posición igual a `paradas.size()` y diagnostica `IndexOutOfBoundsException`; el último índice válido es `size() - 1`. Luego reemplaza temporalmente `HashSet` por `TreeSet` y explica qué garantía cambió y qué costo introduce. Como modificación, implementa `registrarEscaneo` para devolver `false` ante duplicados. RutaFlow conservará la lista para el orden operativo, el conjunto para unicidad y el mapa para acceso por identidad: no son intercambiables solo porque todos “guardan datos”.

### Tema 2: Genéricos, wildcards y type erasure

**Conceptos clave:** `<T>`, seguridad de tipos en compilación, borrado de tipos en tiempo de ejecución.

`class Caja<T> { private T contenido; void guardar(T valor) { this.contenido = valor; } T obtener() { return contenido; } }` define una clase genérica capaz de almacenar y devolver un valor de cualquier tipo concreto que se especifique al instanciarla (`Caja<String> cajaTexto = new Caja<>();`), con el compilador verificando en tiempo de compilación que solo se guarden y recuperen valores del tipo `String` para esa instancia específica, sin necesidad de castear manualmente el valor recuperado (como sí sería necesario si `Caja` almacenara internamente un `Object` genérico sin parametrizar).

Los wildcards (`List<? extends Number>`, aceptando una lista de `Number` o cualquier subtipo suyo, útil como parámetro de un método que solo lee elementos de la lista sin necesitar saber el tipo exacto) permiten mayor flexibilidad en las firmas de métodos que reciben colecciones genéricas, sin comprometer la seguridad de tipos. El type erasure es el mecanismo mediante el cual la información de tipo genérico (`<T>`, `<String>`, etc.) existe únicamente durante la compilación, para la verificación de tipos, pero se "borra" del bytecode final generado: en tiempo de ejecución, `Caja<String>` y `Caja<Integer>` son literalmente la misma clase `Caja` sin ninguna distinción de tipo genérico retenida, una decisión de diseño de Java tomada para preservar compatibilidad con código anterior a la introducción de genéricos (Java 5); `@SafeVarargs` suprime una advertencia del compilador relacionada específicamente con la combinación de varargs y genéricos, usada cuando el desarrollador garantiza manualmente que esa combinación específica es segura en ese caso concreto.

**Analogía:** los genéricos son como una plantilla de formulario que se ajusta automáticamente para verificar que solo se ingrese el tipo de dato correcto según el propósito específico de cada formulario concreto (uno para texto, otro para números); el type erasure es como que, una vez que el formulario ya fue completado y archivado, el archivo físico final no conserva ninguna etiqueta especial indicando para qué tipo de formulario fue diseñado originalmente, aunque esa verificación sí se aplicó estrictamente durante el proceso de llenado.

**¿Por qué es importante?** Los genéricos proporcionan seguridad de tipos en tiempo de compilación sin necesidad de castear manualmente; el type erasure explica por qué esa información de tipo genérico no está disponible para inspección en tiempo de ejecución, una limitación relevante al usar reflexión o al diseñar ciertas APIs genéricas avanzadas.

**Código del ejemplo:**

```java
class Caja<T> {
    private T contenido;
    void guardar(T valor) { this.contenido = valor; }
    T obtener() { return contenido; }
}
Caja<String> cajaTexto = new Caja<>();
// En tiempo de ejecución: type erasure borra <String>, solo queda Caja
```

#### Construcción RutaFlow: repositorio tipado

Crea `src/main/java/academia/entregas/RepositorioEnMemoria.java` como `final class RepositorioEnMemoria<T>` respaldada por `Map<String,T>`, con `guardar(String id, T valor)` y `Optional<T> buscar(String id)`. En `RepositorioDemo.java`, instancia `RepositorioEnMemoria<Guia>`, guarda una guía y recupera tanto un identificador existente como uno ausente. Compila con `javac -Xlint:all -d out src/main/java/academia/entregas/*.java` y ejecuta el demo; debes ver la guía encontrada y `Optional.empty` para la ausente.

Elimina `<Guia>` y usa el tipo crudo: `-Xlint:all` advertirá pérdida de seguridad. Después intenta guardar un `String` en el repositorio tipado y observa el error de compilación. Modifica el repositorio para aceptar en un método de solo lectura `List<? extends T>` y documenta por qué no puedes agregar allí con seguridad. Este componente permitirá probar RutaFlow sin base de datos; el borrado de tipos impide preguntar en runtime por `RepositorioEnMemoria<Guia>.class`, de modo que el contrato debe conservarse en la API y las pruebas.

### Tema 3: Comparable vs Comparator, e iteración

**Conceptos clave:** orden natural único frente a órdenes alternativos externos, `entrySet()`.

`Comparable<Persona>` (implementado directamente por la clase `Persona`, definiendo `compareTo`) establece el único orden "natural" de esa clase, apropiado cuando existe una forma canónica y única de ordenar objetos de ese tipo (por ejemplo, ordenar personas por edad como su criterio de orden natural más obvio y común); `Comparator` (una función o clase externa a `Persona`, pasada explícitamente a métodos de ordenamiento como `sort`) permite definir órdenes alternativos adicionales sin modificar la clase original (`personas.sort(Comparator.comparing(Persona::getNombre))`, ordenando por nombre sin tocar la implementación de `compareTo` que ya ordena por edad), apropiado cuando se necesitan múltiples criterios de orden distintos según el contexto específico de cada uso.

Recorrer un `Map` con for-each requiere iterar sobre `entrySet()` (`for (Map.Entry<String, Integer> entrada : edades.entrySet())`), que devuelve una vista del mapa como un conjunto de pares clave-valor, permitiendo acceder tanto a `entrada.getKey()` como a `entrada.getValue()` dentro de una única iteración, en vez de iterar únicamente sobre las claves (`keySet()`) y tener que consultar el valor correspondiente por separado en cada iteración, un patrón menos eficiente que recorrer directamente los pares ya emparejados de `entrySet()`.

**Analogía:** `Comparable` es como la forma oficial y única en que un catálogo ordena sus productos por defecto (por ejemplo, por código de producto); `Comparator` es como poder pedirle al mismo catálogo que, sin modificar su orden oficial, te lo muestre temporalmente ordenado de otra forma alternativa según tu necesidad puntual (por precio, por nombre), sin alterar el orden oficial del catálogo para nadie más.

**¿Por qué es importante?** `Comparable` define el único orden natural de una clase; `Comparator` permite múltiples órdenes alternativos externos sin modificar esa clase, siendo la elección correcta según si se necesita un único criterio canónico o múltiples criterios intercambiables.

**Código del ejemplo:**

```java
class Persona implements Comparable<Persona> {
    public int compareTo(Persona otra) { return this.edad - otra.edad; } // orden "natural"
}
personas.sort(Comparator.comparing(Persona::getNombre)); // orden alternativo, sin modificar la clase

for (Map.Entry<String, Integer> entrada : edades.entrySet()) {
    System.out.println(entrada.getKey() + ": " + entrada.getValue());
}
```

#### Construcción RutaFlow: ordenar entregas sin alterar el dominio

Crea `src/main/java/academia/entregas/EntregaProgramada.java` como `record` con `String guia`, `int prioridad` y `LocalDate fecha`. Haz que implemente `Comparable<EntregaProgramada>` por fecha y crea comparadores externos por prioridad y guía. En `OrdenEntregaDemo.java`, ordena copias de la misma lista con cada criterio. Ejecuta `javac -d out src/main/java/academia/entregas/*.java` y `java -cp out academia.entregas.OrdenEntregaDemo`; cada bloque debe mostrar un orden distinto y verificable.

Implementa primero `return this.prioridad - otra.prioridad` y prueba valores extremos: la resta puede desbordarse. Corrige con `Integer.compare`. Después encadena desempate con `thenComparing(EntregaProgramada::guia)` y predice el orden de dos entregas con igual prioridad. RutaFlow usa el orden natural únicamente para la cronología; las vistas operativas eligen comparadores explícitos para no esconder la decisión de negocio.

---


## Construcción guiada del capítulo

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
