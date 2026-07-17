# Módulo 7: Records, sealed classes y pattern matching

## Sílabo

**Objetivo general**

Dominar las features de Java 17-21 que reducen boilerplate y hacen el modelado de datos más expresivo: records, sealed classes/interfaces, pattern matching en switch e instanceof, y text blocks.

**Objetivos específicos**

1. Definir un record y explicar qué genera automáticamente.
2. Definir una sealed interface con sus implementaciones permitidas.
3. Escribir un switch exhaustivo con pattern matching sobre una sealed interface.
4. Usar pattern matching para instanceof sin casteo manual.
5. Escribir un text block para contenido multilínea.

**Contenido**

- `record` para modelos inmutables.
- `sealed` classes/interfaces.
- Pattern matching en switch e instanceof.
- Text blocks.

**Evaluación**

Modelo de dominio inmutable usando records y sealed interfaces con pattern matching, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: record — modelos inmutables sin boilerplate

**Conceptos clave:** generación automática de constructor/getters/equals/hashCode/toString, inmutabilidad.

`record Punto(int x, int y) {}` declara una clase inmutable completa en una única línea: el compilador genera automáticamente un constructor que acepta ambos componentes, métodos de acceso con el mismo nombre que cada componente (`p.x()`, `p.y()`, en vez de la convención `getX()`/`getY()` de una clase tradicional), y sobreescribe `equals()`, `hashCode()` y `toString()` basándose en el valor de todos los componentes declarados, reemplazando por completo el boilerplate que una clase POJO (Plain Old Java Object) tradicional requeriría escribir manualmente (o generar con un IDE, o delegar a una librería externa como Lombok) para lograr exactamente el mismo resultado.

Los componentes de un record son inherentemente inmutables (no existe ningún método generado automáticamente para modificar `x` o `y` después de construir el `Punto`), reflejando la intención de diseño de que un record modele datos que, una vez creados, no cambian — cualquier "modificación" real requiere construir una nueva instancia del record con los valores actualizados, en vez de mutar la instancia existente, el mismo principio de inmutabilidad estudiado de forma más general para signals en el Módulo 2 del track de Angular, aquí aplicado como una característica estructural del propio lenguaje Java para modelar datos.

**Analogía:** un record es como un formulario impreso con campos ya fijados en tinta permanente en el momento de imprimirse: puedes leer cualquier campo cuantas veces quieras, pero no puedes tachar y reescribir un valor existente; si necesitas datos distintos, imprimes un formulario completamente nuevo con los valores correctos, en vez de modificar el existente.

**¿Por qué es importante?** `record` elimina el boilerplate que una clase POJO tradicional requeriría para constructor, getters, `equals`, `hashCode` y `toString`, mientras impone inmutabilidad estructural como parte del diseño del lenguaje.

**Diagrama:**

```java
record Punto(int x, int y) {}
// genera automáticamente: constructor, getters (x(), y()), equals, hashCode y toString

Punto p = new Punto(3, 4);
p.x(); // 3
```

### Tema 2: sealed — jerarquías cerradas y exhaustividad

**Conceptos clave:** `permits`, lista explícita de implementaciones válidas, verificación de exhaustividad.

`sealed interface Forma permits Circulo, Cuadrado {}` declara explícitamente, mediante la cláusula `permits`, exactamente qué clases o interfaces tienen permitido implementar o extender `Forma`, una restricción verificada por el compilador: ningún otro código, en ningún otro lugar del proyecto, puede crear una implementación adicional no listada en esa cláusula `permits`, a diferencia de una interfaz normal sin `sealed`, que cualquier clase en cualquier lugar puede implementar libremente sin ninguna restricción del compilador.

Esta restricción deliberada habilita una capacidad adicional en el pattern matching de switch (Tema 3): dado que el compilador conoce exactamente el conjunto completo y cerrado de implementaciones posibles de una sealed interface, puede verificar en tiempo de compilación que un switch sobre esa interfaz cubre absolutamente todos los casos posibles, sin necesidad de una rama `default` como red de seguridad — si en el futuro se agrega una nueva implementación a la lista `permits` pero se olvida agregar su caso correspondiente en algún switch existente en el código, el compilador falla inmediatamente en ese punto, señalando exactamente dónde falta cubrir el nuevo caso, en vez de dejar ese olvido como un bug silencioso que solo se manifestaría en producción cuando efectivamente se procese un objeto de ese nuevo tipo no contemplado.

**Analogía:** `sealed` es como una lista cerrada y oficial de sucursales autorizadas de una franquicia, donde no se permite abrir una sucursal nueva no autorizada explícitamente en esa lista; esto permite que cualquier proceso que dependa de conocer todas las sucursales existentes (como un switch exhaustivo) pueda confiar con certeza en que esa lista está efectivamente completa y no puede haber una sucursal adicional no contemplada apareciendo por sorpresa.

**¿Por qué es importante?** `sealed` permite que el compilador verifique exhaustividad en un switch sin necesidad de una rama `default`, detectando en tiempo de compilación cualquier caso nuevo agregado a la jerarquía que se haya olvidado cubrir en algún switch existente.

**Diagrama:**

```java
sealed interface Forma permits Circulo, Cuadrado {}
record Circulo(double radio) implements Forma {}
record Cuadrado(double lado) implements Forma {}
```

### Tema 3: Pattern matching exhaustivo y para instanceof

**Conceptos clave:** switch sin default verificado, eliminación del casteo manual clásico.

`double area(Forma forma) { return switch (forma) { case Circulo c -> Math.PI * c.radio() * c.radio(); case Cuadrado q -> q.lado() * q.lado(); }; }` combina pattern matching (extrayendo directamente `c`/`q` ya tipados correctamente según cada caso, sin casteo manual explícito) con la verificación de exhaustividad habilitada por `sealed` (Tema 2): el compilador verifica que este switch efectivamente cubre absolutamente todos los casos posibles de la sealed interface `Forma` (`Circulo` y `Cuadrado`, y ningún otro caso posible dado que `permits` los restringe exactamente a esos dos), permitiendo omitir por completo una rama `default`, dado que no existe ningún caso adicional posible que esa rama tendría que cubrir.

`if (obj instanceof Circulo c) { System.out.println(c.radio()); }` reemplaza el patrón clásico anterior (`if (obj instanceof Circulo) { Circulo c = (Circulo) obj; ... }`, que requería un casteo manual explícito y redundante inmediatamente después de la verificación `instanceof`) con una única expresión que verifica el tipo y simultáneamente declara una variable ya correctamente tipada (`c`) disponible directamente dentro del bloque donde la verificación resultó verdadera, eliminando la redundancia y el riesgo de un casteo manual incorrecto que el patrón clásico anterior conllevaba.

**Analogía:** un switch exhaustivo verificado por el compilador es como un formulario de clasificación que garantiza automáticamente que cada categoría posible de un conjunto cerrado y conocido tiene su propio casillero correspondiente, sin necesidad de un casillero genérico de "otros" como respaldo; pattern matching para instanceof es como verificar la identidad de alguien y recibir simultáneamente su credencial ya lista para usar, en vez de verificar la identidad y luego tener que solicitar la credencial por separado en un paso adicional redundante.

**¿Por qué es importante?** El pattern matching exhaustivo garantiza, verificado por el compilador, que ningún caso posible de una sealed interface quede sin cubrir; el pattern matching para instanceof elimina la redundancia y el riesgo del casteo manual clásico.

**Diagrama:**

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

## Ejercicios de evaluación

### Ejercicio 1: Qué garantiza un switch exhaustivo sobre sealed

**Enunciado:** ¿qué garantiza el compilador cuando usas un switch exhaustivo sobre una sealed interface?

**Solución esperada:** el compilador garantiza que el switch cubre absolutamente todos los casos posibles de esa sealed interface, dado que `permits` restringe exactamente qué implementaciones existen; si se agrega una nueva implementación a `permits` y se olvida su caso correspondiente en algún switch existente, el compilador falla inmediatamente en ese punto, en vez de dejarlo como un bug silencioso.

**Criterios de éxito:**
- Explica correctamente la verificación de exhaustividad y la detección en compilación de casos faltantes.

### Ejercicio 2: Boilerplate eliminado por record

**Enunciado:** ¿qué boilerplate elimina `record` comparado con una clase POJO tradicional?

**Solución esperada:** `record` genera automáticamente el constructor, los métodos de acceso a cada componente, y las implementaciones de `equals()`, `hashCode()` y `toString()` basadas en el valor de todos los componentes, eliminando la necesidad de escribir manualmente (o generar con herramientas externas) todo ese código repetitivo para una clase inmutable simple.

**Criterios de éxito:**
- Enumera correctamente al menos tres de los cinco elementos generados automáticamente (constructor, getters, equals, hashCode, toString).

### Ejercicio 3: Pattern matching para instanceof

**Enunciado:** compara el patrón clásico de `instanceof` + casteo manual con el pattern matching moderno para `instanceof`.

**Solución esperada:** el patrón clásico requiere verificar `instanceof` y luego castear manualmente la variable a ese tipo en una línea adicional redundante y propensa a error; el pattern matching moderno (`if (obj instanceof Circulo c)`) combina la verificación y la declaración de una variable ya correctamente tipada en una única expresión, eliminando la redundancia y el riesgo de un casteo incorrecto.

**Criterios de éxito:**
- Explica correctamente la eliminación de la redundancia del casteo manual mediante el pattern matching moderno.

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

- `record` genera automáticamente constructor, getters, `equals`, `hashCode` y `toString`, imponiendo inmutabilidad estructural.
- `sealed` restringe explícitamente qué implementaciones existen, habilitando verificación de exhaustividad en switch.
- El pattern matching en switch e instanceof elimina el casteo manual clásico, con extracción de variables ya tipadas.
- Los text blocks permiten escribir contenido multilínea (como SQL) sin concatenación manual de strings.

**Conceptos aprendidos**

- `record` para modelos inmutables.
- `sealed` classes/interfaces y exhaustividad.
- Pattern matching en switch e instanceof.
- Text blocks.

**Próximos pasos**

En el Módulo 8 aprenderás build tools: Maven y Gradle, gestión de dependencias, y proyectos multi-módulo.

**Recursos adicionales**

- Documentación oficial de Java (docs.oracle.com/en/java): "Records", "Sealed Classes" y "Pattern Matching for switch".
