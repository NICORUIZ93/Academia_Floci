# Módulo 3: Excepciones y manejo de recursos

## Sílabo

**Objetivo general**

Manejar errores de forma explícita y liberar recursos externos sin fugas, dominando checked frente a unchecked exceptions, try-with-resources, y excepciones personalizadas.

**Objetivos específicos**

1. Diferenciar excepciones checked de unchecked, y cómo el compilador trata cada una.
2. Usar try-with-resources para cerrar recursos automáticamente.
3. Crear excepciones personalizadas apropiadas al dominio.
4. Reconocer y evitar el antipatrón de "tragar" excepciones silenciosamente.

**Contenido**

- Checked vs unchecked exceptions.
- try-with-resources.
- Excepciones personalizadas.
- Buenas prácticas: no tragar excepciones.

**Evaluación**

Lector de archivos con manejo robusto de excepciones y try-with-resources, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Checked vs unchecked exceptions

**Conceptos clave:** obligación de manejo verificada en compilación, indicación de bug.

Las excepciones checked (como `IOException`) son verificadas por el compilador: cualquier método que pueda lanzar una excepción checked debe declararlo explícitamente en su firma con `throws` (`void leerArchivo() throws IOException { ... }`), y cualquier código que invoque ese método está obligado, también verificado en tiempo de compilación, a manejar esa excepción con un `try`/`catch` o a propagarla declarándola también con `throws` en su propia firma, sin excepción posible — el código simplemente no compila si se omite ese manejo obligatorio.

Las excepciones unchecked (subclases de `RuntimeException`, como `IndexOutOfBoundsException` o `NullPointerException`) no requieren esa declaración obligatoria ni ese manejo verificado por el compilador, reflejando una distinción de diseño deliberada: las excepciones checked típicamente representan condiciones externas previsibles y recuperables (un archivo que podría no existir, una conexión de red que podría fallar), donde forzar al desarrollador a considerar explícitamente ese caso mediante el compilador tiene sentido; las excepciones unchecked típicamente representan errores de programación (acceder a un índice fuera de rango, invocar un método sobre una referencia nula) que en la mayoría de los casos indican un bug en el código, no una condición externa esperable que deba manejarse explícitamente en cada punto de la aplicación.

**Analogía:** una excepción checked es como un formulario de aduana obligatorio que debes completar explícitamente antes de continuar tu viaje, verificado activamente antes de que puedas proceder; una excepción unchecked es como una alarma de incendio que puede activarse en cualquier momento sin que nadie la haya anticipado explícitamente en cada paso del edificio, indicando generalmente que algo salió estructuralmente mal, no una condición externa rutinaria esperada.

**¿Por qué es importante?** El compilador obliga a manejar las checked exceptions porque representan condiciones externas previsibles que el desarrollador debe considerar explícitamente; las unchecked no se obligan porque típicamente indican bugs de programación, no condiciones externas esperables en cada punto del código.

**Código del ejemplo:**

```java
// checked: el compilador OBLIGA a manejarla o declararla con throws
void leerArchivo() throws IOException { ... }

// unchecked (RuntimeException): no es obligatorio manejarla, suele indicar un bug
int x = lista.get(100); // IndexOutOfBoundsException si la lista tiene menos elementos
```

### Tema 2: try-with-resources

**Conceptos clave:** `AutoCloseable`, cierre garantizado incluso ante error.

`try (BufferedReader reader = Files.newBufferedReader(ruta)) { String linea = reader.readLine(); }` declara un recurso dentro del propio paréntesis del `try`, garantizando que Java invoque automáticamente `reader.close()` al finalizar el bloque, sin necesidad de un bloque `finally` manual explícito para ese propósito, y crucialmente incluso si ocurre una excepción dentro del bloque `try`: el cierre del recurso está garantizado sin importar cómo se abandone el bloque (normalmente, o mediante una excepción propagada).

Cualquier clase que implemente la interfaz `AutoCloseable` (que declara un único método `close()`) puede usarse dentro de un try-with-resources, no solo las clases estándar de manejo de archivos: escribir una clase propia que gestione algún recurso externo (una conexión, un handle del sistema operativo) e implementar `AutoCloseable` en ella permite que también se beneficie de esta garantía automática de cierre, sin tener que escribir manualmente el patrón repetitivo de un bloque `finally` que verifica si el recurso no es nulo antes de cerrarlo, un patrón considerablemente más verboso y propenso a errores que el equivalente moderno con try-with-resources.

**Analogía:** try-with-resources es como un sistema de préstamo de bicicletas que garantiza automáticamente que la bicicleta se devuelva a su estación correspondiente al finalizar el recorrido, incluso si el ciclista tuvo un percance en el camino, sin depender de que el ciclista recuerde manualmente devolverla por su cuenta en cada situación posible.

**¿Por qué es importante?** try-with-resources garantiza el cierre correcto de un recurso incluso ante una excepción, eliminando la necesidad de un bloque `finally` manual repetitivo y propenso a errores de omisión.

**Código del ejemplo:**

```java
try (BufferedReader reader = Files.newBufferedReader(ruta)) {
    String linea = reader.readLine();
} // reader.close() se llama automáticamente, incluso si hay una excepción
```

### Tema 3: Excepciones personalizadas y no tragar excepciones

**Conceptos clave:** modelar errores de dominio, antipatrón del catch vacío.

Definir una excepción personalizada específica del dominio de la aplicación (`class SaldoInsuficienteException extends RuntimeException { SaldoInsuficienteException(String mensaje) { super(mensaje); } }`) permite comunicar de forma mucho más precisa y expresiva qué condición de error específica ocurrió, en comparación con lanzar una excepción genérica de propósito general (como `RuntimeException` directamente, o `IllegalStateException`), facilitando además que el código que captura esa excepción específica pueda reaccionar de forma diferenciada según el tipo exacto de excepción capturado, en vez de tener que inspeccionar el mensaje de texto de una excepción genérica para determinar qué condición específica ocurrió realmente.

Un catch vacío (`try { operacionRiesgosa(); } catch (Exception e) { }`) es un antipatrón grave conocido como "tragar" la excepción: el error ocurrido desaparece silenciosamente sin ningún registro ni indicación de que algo falló, haciendo que el bug correspondiente se vuelva invisible y extremadamente difícil de diagnosticar más adelante, cuando sus consecuencias downstream eventualmente se manifiesten de forma confusa y aparentemente no relacionada con su causa raíz real; la práctica correcta como mínimo registra el error (`log.error("Falló la operación", e)`) antes de decidir explícitamente si relanzarlo, manejarlo apropiadamente, o (en casos verdaderamente justificados y documentados) ignorarlo deliberadamente con una razón explícita comentada.

**Analogía:** un catch vacío es como desactivar silenciosamente la alarma de incendio de un edificio sin investigar qué la activó, dejando que el problema real subyacente (que sí existe y sigue sin resolverse) permanezca completamente invisible hasta que eventualmente cause un daño mucho mayor y más difícil de rastrear hasta su causa original.

**¿Por qué es importante?** Las excepciones personalizadas comunican con precisión qué condición de error específica ocurrió; un catch vacío oculta errores reales haciendo el bug correspondiente invisible y mucho más difícil de diagnosticar posteriormente.

**Código del ejemplo:**

```java
class SaldoInsuficienteException extends RuntimeException {
    SaldoInsuficienteException(String mensaje) { super(mensaje); }
}
if (saldo < monto) throw new SaldoInsuficienteException("Saldo: " + saldo);

// MAL: oculta el error, hace el bug invisible
try { operacionRiesgosa(); } catch (Exception e) { }
// BIEN: al menos registra el error antes de decidir qué hacer
try { operacionRiesgosa(); } catch (Exception e) {
    log.error("Falló la operación", e);
    throw e; // o maneja explícitamente
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

**Objetivo del laboratorio:** construir un lector de archivos con manejo robusto de excepciones y try-with-resources.

**Requisitos previos:** Módulos 0-2 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Provocar una excepción checked y una unchecked | Ver Tema 1 | Compara cómo el compilador trata cada una |
| 2 | Leer un archivo con try-with-resources | Ver Tema 2 | Verifica el cierre automático incluso ante error |
| 3 | Crear `SaldoInsuficienteException` | Ver Tema 3 | Extiende `RuntimeException` |
| 4 | Escribir un catch vacío y explicar el problema | Ver Tema 3 | Antipatrón de tragar excepciones |
| 5 | Corregir el catch vacío registrando el error | Ver Tema 3 | Decide explícitamente relanzar o manejar |

**Verificación:** el laboratorio se considera exitoso si el lector de archivos cierra correctamente el recurso incluso cuando el archivo no existe, y si ninguna excepción se descarta silenciosamente sin al menos un registro explícito del error.

**Errores comunes y soluciones**

- **Olvidar declarar `throws` para una excepción checked.** El compilador exige declararla o manejarla con try/catch.
- **Cerrar recursos manualmente en un `finally` en vez de usar try-with-resources.** Prefiere try-with-resources para código más simple y con la misma garantía.
- **Capturar `Exception` genérico y descartarlo silenciosamente.** Registra siempre el error como mínimo, y decide explícitamente cómo proceder.

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

- Las checked exceptions son verificadas por el compilador y representan condiciones externas previsibles; las unchecked típicamente indican bugs de programación.
- try-with-resources garantiza el cierre automático de cualquier `AutoCloseable`, incluso ante una excepción.
- Las excepciones personalizadas comunican con precisión condiciones de error específicas del dominio.
- Un catch vacío oculta errores reales, haciendo el bug correspondiente invisible y difícil de diagnosticar.

**Conceptos aprendidos**

- Checked vs unchecked exceptions.
- try-with-resources y `AutoCloseable`.
- Excepciones personalizadas.
- El antipatrón del catch vacío y su corrección.

**Próximos pasos**

En el Módulo 4 aprenderás Streams y programación funcional: map/filter/reduce/collect, lambdas, y `Optional`.

**Recursos adicionales**

- Documentación oficial de Java (docs.oracle.com/en/java): "Exceptions" y "The try-with-resources Statement".
