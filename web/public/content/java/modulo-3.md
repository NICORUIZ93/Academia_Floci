# Módulo 3: Excepciones y manejo de recursos


## Aprende construyendo

### Tema 1: Checked vs unchecked exceptions

#### Paso 1 · Objetivo y preparación
Al finalizar podrás manejar fallos de este tema desde cero. Prerrequisitos: JDK 21 y un editor. Comprueba java --version.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, red, archivos y datos inválidos fallan de maneras distintas; el programa debe decidir qué recuperar, qué informar y qué detener.

#### Paso 3 · Teoría, modelo mental y analogía
Las checked exceptions obligan a declarar o tratar condiciones recuperables; las unchecked suelen representar errores de programación o precondiciones incumplidas. try-with-resources cierra recursos automáticamente. Una excepción personalizada comunica dominio sin ocultar la causa. La analogía es un protocolo de emergencia: registrar el incidente y liberar la puerta es mejor que fingir que nada ocurrió.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-java-m3
cd ejemplo-java-m3
mkdir -p src/main/java/com/example
```
Crea src/main/java/com/example/Main.java con una lectura segura y una excepción DeliveryNotFoundException; compila con javac -d out y ejecuta.

#### Paso 5 · Práctica guiada
Pista: elimina deliberadamente el archivo o lanza una entrada inválida para provocar un fallo deliberado; observa el stack trace, conserva la causa y corrige la ruta. Resultado esperado: error controlado y recurso cerrado.

#### Paso 6 · Práctica independiente
Añade una política que clasifique errores recuperables y no recuperables, una prueba de mensaje y un log estructurado sin datos sensibles.

#### Paso 7 · Cierre y evidencia
Guarda comandos, salida y diagnóstico; como siguiente paso prueba errores de red. Errores comunes: catch vacío, capturar Throwable, perder la causa, devolver stack trace al cliente y cerrar recursos manualmente. Fuentes oficiales: https://dev.java/learn/exceptions/ y https://docs.oracle.com/javase/tutorial/essential/exceptions/.
**¿Por qué es importante?** Porque el manejo de excepciones define cómo se recupera el sistema y qué información recibe el usuario.
**Evidencia de aprendizaje:** entrega código, fallo reproducido, corrección y prueba de cierre.
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

#### Construcción RutaFlow: distinguir fallo externo de defecto

Crea `src/main/java/academia/entregas/CargadorGuias.java` con `List<String> cargar(Path archivo) throws IOException`, usando `Files.readAllLines`. En `CargadorDemo.java`, recibe la ruta por argumento y captura `NoSuchFileException` para mostrar `No existe el archivo: ...`; no captures `Exception`. Compila con `javac -d out src/main/java/academia/entregas/*.java` y ejecuta primero con `datos/guias.txt` inexistente: ese mensaje es el resultado esperado. Crea luego el archivo y verifica que se imprima su cantidad de líneas.

Quita temporalmente `throws IOException` y observa el error de compilación. Después provoca una `IndexOutOfBoundsException` accediendo a la segunda guía cuando solo existe una: no la conviertas en “archivo inválido”, corrige el defecto verificando el tamaño. Como modificación, devuelve una lista inmutable con `List.copyOf`. Este cargador será el adaptador de entrada de RutaFlow; el dominio no debe conocer `IOException`.

### Tema 2: try-with-resources

#### Paso 1 · Objetivo y preparación
Al finalizar podrás manejar fallos de este tema desde cero. Prerrequisitos: JDK 21 y un editor. Comprueba java --version.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, red, archivos y datos inválidos fallan de maneras distintas; el programa debe decidir qué recuperar, qué informar y qué detener.

#### Paso 3 · Teoría, modelo mental y analogía
Las checked exceptions obligan a declarar o tratar condiciones recuperables; las unchecked suelen representar errores de programación o precondiciones incumplidas. try-with-resources cierra recursos automáticamente. Una excepción personalizada comunica dominio sin ocultar la causa. La analogía es un protocolo de emergencia: registrar el incidente y liberar la puerta es mejor que fingir que nada ocurrió.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-java-m3
cd ejemplo-java-m3
mkdir -p src/main/java/com/example
```
Crea src/main/java/com/example/Main.java con una lectura segura y una excepción DeliveryNotFoundException; compila con javac -d out y ejecuta.

#### Paso 5 · Práctica guiada
Pista: elimina deliberadamente el archivo o lanza una entrada inválida para provocar un fallo deliberado; observa el stack trace, conserva la causa y corrige la ruta. Resultado esperado: error controlado y recurso cerrado.

#### Paso 6 · Práctica independiente
Añade una política que clasifique errores recuperables y no recuperables, una prueba de mensaje y un log estructurado sin datos sensibles.

#### Paso 7 · Cierre y evidencia
Guarda comandos, salida y diagnóstico; como siguiente paso prueba errores de red. Errores comunes: catch vacío, capturar Throwable, perder la causa, devolver stack trace al cliente y cerrar recursos manualmente. Fuentes oficiales: https://dev.java/learn/exceptions/ y https://docs.oracle.com/javase/tutorial/essential/exceptions/.
**¿Por qué es importante?** Porque el manejo de excepciones define cómo se recupera el sistema y qué información recibe el usuario.
**Evidencia de aprendizaje:** entrega código, fallo reproducido, corrección y prueba de cierre.
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

#### Construcción RutaFlow: importar sin filtrar descriptores

Guarda `ImportadorGuias.java` en `src/main/java/academia/entregas/`. Implementa `int contar(Path ruta) throws IOException` con `try (BufferedReader reader = Files.newBufferedReader(ruta))` y `reader.lines().count()`. Crea `ImportadorDemo.java`, compila los archivos y ejecuta `java -cp out academia.entregas.ImportadorDemo datos/guias.txt`; el resultado esperado es el número exacto de registros.

Dentro del bloque lanza deliberadamente `new IllegalStateException("fallo de prueba")` después de leer la primera línea y confirma que el recurso se cierra igualmente. Para observarlo sin adivinar, crea un `RecursoTrazable implements AutoCloseable` que imprima `cerrado` desde `close()` y úsalo en un segundo `try`. Cambia su `close()` para lanzar otra excepción e inspecciona `getSuppressed()`: el fallo principal no debe perderse. RutaFlow aplicará este patrón a archivos, conexiones y respuestas HTTP cerrables.

### Tema 3: Excepciones personalizadas y no tragar excepciones

#### Paso 1 · Objetivo y preparación
Al finalizar podrás manejar fallos de este tema desde cero. Prerrequisitos: JDK 21 y un editor. Comprueba java --version.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, red, archivos y datos inválidos fallan de maneras distintas; el programa debe decidir qué recuperar, qué informar y qué detener.

#### Paso 3 · Teoría, modelo mental y analogía
Las checked exceptions obligan a declarar o tratar condiciones recuperables; las unchecked suelen representar errores de programación o precondiciones incumplidas. try-with-resources cierra recursos automáticamente. Una excepción personalizada comunica dominio sin ocultar la causa. La analogía es un protocolo de emergencia: registrar el incidente y liberar la puerta es mejor que fingir que nada ocurrió.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-java-m3
cd ejemplo-java-m3
mkdir -p src/main/java/com/example
```
Crea src/main/java/com/example/Main.java con una lectura segura y una excepción DeliveryNotFoundException; compila con javac -d out y ejecuta.

#### Paso 5 · Práctica guiada
Pista: elimina deliberadamente el archivo o lanza una entrada inválida para provocar un fallo deliberado; observa el stack trace, conserva la causa y corrige la ruta. Resultado esperado: error controlado y recurso cerrado.

#### Paso 6 · Práctica independiente
Añade una política que clasifique errores recuperables y no recuperables, una prueba de mensaje y un log estructurado sin datos sensibles.

#### Paso 7 · Cierre y evidencia
Guarda comandos, salida y diagnóstico; como siguiente paso prueba errores de red. Errores comunes: catch vacío, capturar Throwable, perder la causa, devolver stack trace al cliente y cerrar recursos manualmente. Fuentes oficiales: https://dev.java/learn/exceptions/ y https://docs.oracle.com/javase/tutorial/essential/exceptions/.
**¿Por qué es importante?** Porque el manejo de excepciones define cómo se recupera el sistema y qué información recibe el usuario.
**Evidencia de aprendizaje:** entrega código, fallo reproducido, corrección y prueba de cierre.
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

#### Construcción RutaFlow: error con lenguaje de negocio

Crea `GuiaDuplicadaException.java` en `src/main/java/academia/entregas/` y haz que conserve el número de guía en un campo accesible. En `RegistroGuias.java`, usa un `Set<String>` y lanza esa excepción al repetir un número. Desde `RegistroDemo.java`, registra dos veces `RF-1001`, captura únicamente `GuiaDuplicadaException` en la frontera e imprime `La guía RF-1001 ya existe`. Compila y ejecuta el demo; esa salida es el contrato esperado.

Sustituye el bloque por `catch (Exception ignored) {}` y comprueba que el proceso aparenta éxito: esa pérdida de evidencia es el fallo que debes reconocer. Corrígelo registrando contexto y conservando la causa cuando traduzcas una excepción técnica (`new GuiaImportacionException("...", causa)`). Modifica el demo para continuar con otra guía válida después del duplicado. En RutaFlow las excepciones de dominio expresan decisiones recuperables; los bugs no deben convertirse indiscriminadamente en mensajes de negocio.

---


## Construcción guiada del capítulo

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
