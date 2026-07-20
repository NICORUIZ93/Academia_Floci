# Módulo 7: Records, sealed classes y pattern matching


## Aprende construyendo

### Tema 1: record — modelos inmutables sin boilerplate

**Conceptos clave:** generación automática de constructor/getters/equals/hashCode/toString, inmutabilidad.

`record Punto(int x, int y) {}` declara una clase inmutable completa en una única línea: el compilador genera automáticamente un constructor que acepta ambos componentes, métodos de acceso con el mismo nombre que cada componente (`p.x()`, `p.y()`, en vez de la convención `getX()`/`getY()` de una clase tradicional), y sobreescribe `equals()`, `hashCode()` y `toString()` basándose en el valor de todos los componentes declarados, reemplazando por completo el boilerplate que una clase POJO (Plain Old Java Object) tradicional requeriría escribir manualmente (o generar con un IDE, o delegar a una librería externa como Lombok) para lograr exactamente el mismo resultado.

Los componentes de un record son inherentemente inmutables (no existe ningún método generado automáticamente para modificar `x` o `y` después de construir el `Punto`), reflejando la intención de diseño de que un record modele datos que, una vez creados, no cambian — cualquier "modificación" real requiere construir una nueva instancia del record con los valores actualizados, en vez de mutar la instancia existente, el mismo principio de inmutabilidad estudiado de forma más general para signals en el Módulo 2 del track de Angular, aquí aplicado como una característica estructural del propio lenguaje Java para modelar datos.

**Analogía:** un record es como un formulario impreso con campos ya fijados en tinta permanente en el momento de imprimirse: puedes leer cualquier campo cuantas veces quieras, pero no puedes tachar y reescribir un valor existente; si necesitas datos distintos, imprimes un formulario completamente nuevo con los valores correctos, en vez de modificar el existente.

**¿Por qué es importante?** `record` elimina el boilerplate que una clase POJO tradicional requeriría para constructor, getters, `equals`, `hashCode` y `toString`, mientras impone inmutabilidad estructural como parte del diseño del lenguaje.

**Código del ejemplo:**

```java
record Punto(int x, int y) {}
// genera automáticamente: constructor, getters (x(), y()), equals, hashCode y toString

Punto p = new Punto(3, 4);
p.x(); // 3
```

#### Construcción RutaFlow: eventos inmutables

Crea `src/main/java/academia/entregas/EventoEntrega.java` como `record EventoEntrega(String guia, Instant ocurridoEn, String tipo)`. Usa un constructor compacto para rechazar texto vacío y fechas futuras. En `EventoDemo.java`, crea dos instancias iguales y verifica `equals=true`; compila y ejecuta el demo.

Intenta asignar `evento.tipo = "OTRO"`: el compilador impide mutar el componente. Después introduce una `List<String>` mutable como componente y demuestra que el record no vuelve inmutable el objeto contenido; corrige con `List.copyOf` en el constructor. Como modificación, implementa `conTipo(String nuevo)` devolviendo otra instancia. RutaFlow usa eventos como valores históricos: cambiar el pasado destruiría auditoría y reproducibilidad.

### Tema 2: sealed — jerarquías cerradas y exhaustividad

**Conceptos clave:** `permits`, lista explícita de implementaciones válidas, verificación de exhaustividad.

`sealed interface Forma permits Circulo, Cuadrado {}` declara explícitamente, mediante la cláusula `permits`, exactamente qué clases o interfaces tienen permitido implementar o extender `Forma`, una restricción verificada por el compilador: ningún otro código, en ningún otro lugar del proyecto, puede crear una implementación adicional no listada en esa cláusula `permits`, a diferencia de una interfaz normal sin `sealed`, que cualquier clase en cualquier lugar puede implementar libremente sin ninguna restricción del compilador.

Esta restricción deliberada habilita una capacidad adicional en el pattern matching de switch (Tema 3): dado que el compilador conoce exactamente el conjunto completo y cerrado de implementaciones posibles de una sealed interface, puede verificar en tiempo de compilación que un switch sobre esa interfaz cubre absolutamente todos los casos posibles, sin necesidad de una rama `default` como red de seguridad — si en el futuro se agrega una nueva implementación a la lista `permits` pero se olvida agregar su caso correspondiente en algún switch existente en el código, el compilador falla inmediatamente en ese punto, señalando exactamente dónde falta cubrir el nuevo caso, en vez de dejar ese olvido como un bug silencioso que solo se manifestaría en producción cuando efectivamente se procese un objeto de ese nuevo tipo no contemplado.

**Analogía:** `sealed` es como una lista cerrada y oficial de sucursales autorizadas de una franquicia, donde no se permite abrir una sucursal nueva no autorizada explícitamente en esa lista; esto permite que cualquier proceso que dependa de conocer todas las sucursales existentes (como un switch exhaustivo) pueda confiar con certeza en que esa lista está efectivamente completa y no puede haber una sucursal adicional no contemplada apareciendo por sorpresa.

**¿Por qué es importante?** `sealed` permite que el compilador verifique exhaustividad en un switch sin necesidad de una rama `default`, detectando en tiempo de compilación cualquier caso nuevo agregado a la jerarquía que se haya olvidado cubrir en algún switch existente.

**Código del ejemplo:**

```java
sealed interface Forma permits Circulo, Cuadrado {}
record Circulo(double radio) implements Forma {}
record Cuadrado(double lado) implements Forma {}
```

#### Construcción RutaFlow: resultados cerrados de una entrega

Crea `ResultadoEntrega.java` como `sealed interface` que permita `Entregada`, `Rechazada` y `Reprogramada`, todas records en archivos del mismo paquete. Crea `ResultadoDemo.java` y compila con `javac -d out src/main/java/academia/entregas/*.java`; las tres variantes deben construirse sin `null` ni códigos mágicos.

Declara `ResultadoDesconocido implements ResultadoEntrega` sin añadirlo a `permits`: el compilador debe rechazarlo. Luego agrega una cuarta variante autorizada y conserva el fallo hasta actualizar quienes procesan la jerarquía. Como modificación, decide qué datos mínimos necesita cada caso, evitando campos opcionales que solo aplican a otra variante. RutaFlow mantiene cerrado este conjunto porque controla todos los resultados internos; una interfaz extensible de plugins no debería ser `sealed`.

### Tema 3: Pattern matching exhaustivo y para instanceof

**Conceptos clave:** switch sin default verificado, eliminación del casteo manual clásico.

`double area(Forma forma) { return switch (forma) { case Circulo c -> Math.PI * c.radio() * c.radio(); case Cuadrado q -> q.lado() * q.lado(); }; }` combina pattern matching (extrayendo directamente `c`/`q` ya tipados correctamente según cada caso, sin casteo manual explícito) con la verificación de exhaustividad habilitada por `sealed` (Tema 2): el compilador verifica que este switch efectivamente cubre absolutamente todos los casos posibles de la sealed interface `Forma` (`Circulo` y `Cuadrado`, y ningún otro caso posible dado que `permits` los restringe exactamente a esos dos), permitiendo omitir por completo una rama `default`, dado que no existe ningún caso adicional posible que esa rama tendría que cubrir.

`if (obj instanceof Circulo c) { System.out.println(c.radio()); }` reemplaza el patrón clásico anterior (`if (obj instanceof Circulo) { Circulo c = (Circulo) obj; ... }`, que requería un casteo manual explícito y redundante inmediatamente después de la verificación `instanceof`) con una única expresión que verifica el tipo y simultáneamente declara una variable ya correctamente tipada (`c`) disponible directamente dentro del bloque donde la verificación resultó verdadera, eliminando la redundancia y el riesgo de un casteo manual incorrecto que el patrón clásico anterior conllevaba.

**Analogía:** un switch exhaustivo verificado por el compilador es como un formulario de clasificación que garantiza automáticamente que cada categoría posible de un conjunto cerrado y conocido tiene su propio casillero correspondiente, sin necesidad de un casillero genérico de "otros" como respaldo; pattern matching para instanceof es como verificar la identidad de alguien y recibir simultáneamente su credencial ya lista para usar, en vez de verificar la identidad y luego tener que solicitar la credencial por separado en un paso adicional redundante.

**¿Por qué es importante?** El pattern matching exhaustivo garantiza, verificado por el compilador, que ningún caso posible de una sealed interface quede sin cubrir; el pattern matching para instanceof elimina la redundancia y el riesgo del casteo manual clásico.

**Código del ejemplo:**

```java
double area(Forma forma) {
    return switch (forma) {
        case Circulo c -> Math.PI * c.radio() * c.radio();
        case Cuadrado q -> q.lado() * q.lado();
        // sin default: el compilador verifica que cubriste TODOS los casos posibles de Forma
    };
}

if (obj instanceof Circulo c) {
    System.out.println(c.radio()); // sin casteo manual: c ya es de tipo Circulo aquí
}
```

#### Construcción RutaFlow: presentar todos los resultados

En `PresentadorResultado.java`, implementa `String presentar(ResultadoEntrega resultado)` mediante un `switch` con patrón para cada record, sin `default`. Ejecuta `ResultadoDemo` y verifica mensajes distintos para entregada, rechazada y reprogramada. La extracción de componentes debe ocurrir en el patrón o mediante sus accesores, sin cast manual.

Añade una nueva variante a `permits` y no actualices el switch: el error de exhaustividad es el feedback esperado. Corrige agregando un caso con significado de negocio, no un `default` que silencie futuras evoluciones. Como modificación, usa una guarda cuando dos rechazos requieran mensajes diferentes y prueba ambos. Esta presentación vive en el borde de RutaFlow; la jerarquía de dominio no conoce consola ni HTTP.

---


## Construcción guiada del capítulo

**Objetivo del laboratorio:** modelar un dominio inmutable con records y sealed interfaces, con pattern matching exhaustivo.

**Requisitos previos:** Módulos 0-6 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Definir `Punto` como record | Ver Tema 1 | Verifica los métodos generados automáticamente |
| 2 | Definir `Forma` como sealed interface | Ver Tema 2 | Con `Circulo` y `Cuadrado` como records |
| 3 | Escribir un switch exhaustivo sin `default` | Ver Tema 3 | Verifica el error del compilador si falta un caso |
| 4 | Usar pattern matching para instanceof | Ver Tema 3 | Sin casteo manual |
| 5 | Escribir un text block para SQL multilínea | Ver el ejemplo de text blocks | Con `"""` |

**Verificación:** el laboratorio se considera exitoso si agregar una nueva implementación a `permits` sin actualizar el switch existente produce un error de compilación (no un bug silencioso), y si el modelo de dominio es completamente inmutable.

**Errores comunes y soluciones**

- **Agregar una rama `default` innecesaria a un switch exhaustivo sobre una sealed interface.** Omítela para que el compilador verifique exhaustividad real.
- **Intentar mutar un componente de un record.** Los records son inmutables; construye una nueva instancia con los valores actualizados.
- **Usar el casteo manual clásico donde pattern matching para instanceof sería más claro.** Prefiere `if (obj instanceof Tipo variable)`.

---
