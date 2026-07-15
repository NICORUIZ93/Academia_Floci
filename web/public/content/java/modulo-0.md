# Módulo 0: Sintaxis, tipos y el modelo de la JVM

## Sílabo

**Objetivo general**

Entender que Java compila a bytecode y se ejecuta sobre una máquina virtual, dominar los tipos primitivos frente a las referencias, y comprender qué significa cada palabra de `public static void main`.

**Objetivos específicos**

1. Compilar y ejecutar un programa Java, observando el `.class` generado.
2. Declarar variables de los 8 tipos primitivos y de tipo referencia.
3. Leer entrada del usuario con `Scanner` y validar tipos.
4. Diferenciar JDK, JRE y JVM.
5. Inspeccionar el bytecode generado con `javap`.

**Contenido**

- Del código fuente a la JVM: compilación y ejecución.
- `public static void main`: qué significa cada palabra.
- JDK vs JRE vs JVM.
- Tipos primitivos vs referencias.

**Evaluación**

Programa de consola que procesa entrada del usuario con validación de tipos, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Del código fuente a la JVM

**Conceptos clave:** bytecode, portabilidad, `javac`/`java`.

Java no compila directamente a código máquina nativo específico de un procesador (como sí lo hacen C o C++), sino a bytecode: una representación intermedia (`Hola.class`) que no depende de ningún procesador específico, sino de una máquina virtual, la JVM (Java Virtual Machine), que interpreta o compila ese bytecode a código máquina real en el momento de la ejecución, específicamente para el procesador y sistema operativo donde esa JVM concreta se ejecuta. `javac Hola.java` realiza la compilación de código fuente a bytecode, generando el archivo `.class`; `java Hola` invoca la JVM, que carga ese archivo `.class` y lo ejecuta.

Esta arquitectura de dos pasos es la base del lema histórico de Java "write once, run anywhere" (escribe una vez, ejecuta en cualquier lugar): el mismo archivo `.class` compilado una única vez puede ejecutarse sin recompilar en cualquier sistema operativo o arquitectura de procesador que tenga una JVM disponible, dado que la JVM específica de cada plataforma es la responsable de traducir ese bytecode universal al código máquina específico de esa plataforma particular, en vez de que el desarrollador tenga que recompilar el código fuente por separado para cada plataforma de destino distinta (como sí sería necesario con un lenguaje que compila directamente a código máquina nativo).

**Analogía:** el bytecode es como una partitura musical universal, escrita una única vez, que distintos músicos (las JVMs de cada plataforma) pueden interpretar correctamente en sus propios instrumentos específicos, sin que el compositor original tenga que reescribir la partitura para cada instrumento distinto.

**¿Por qué es importante?** Compilar a bytecode en vez de código máquina nativo directamente es lo que permite que un mismo programa Java compilado una sola vez se ejecute sin recompilar en cualquier plataforma que tenga una JVM disponible.

**Diagrama:**

```java
public class Hola {
    public static void main(String[] args) {
        System.out.println("Hola Java");
    }
}
```
```bash
javac Hola.java   # compila a bytecode: genera Hola.class
java Hola          # la JVM interpreta/compila el bytecode y lo ejecuta
```

### Tema 2: public static void main — qué significa cada palabra

**Conceptos clave:** punto de entrada, pertenencia a la clase frente a instancia.

`public static void main(String[] args)` es la firma exacta que la JVM busca como punto de entrada de cualquier programa Java ejecutable, y cada palabra de esa firma tiene un significado preciso y necesario: `public` hace que el método sea accesible desde cualquier lugar, incluyendo desde fuera de la propia clase, necesario porque la JVM (que no es parte del código de la aplicación) necesita poder invocarlo desde el exterior; `static` indica que el método pertenece a la clase en sí, no a una instancia particular de esa clase, siendo esto crucial porque la JVM invoca `main` sin haber creado previamente ningún objeto de esa clase — si `main` no fuera `static`, la JVM necesitaría una instancia ya existente para invocarlo, pero no existe ninguna todavía en ese punto de la ejecución.

`void` indica que el método no devuelve ningún valor (el programa simplemente termina cuando `main` retorna, sin que la JVM espere ni use un valor de retorno de esa llamada específica); `main` es el nombre exacto que la JVM busca por convención estricta, sin el cual no reconocería ese método como el punto de entrada; `String[] args` es el arreglo de argumentos de línea de comandos que se pasan al ejecutar el programa (`java Hola argumento1 argumento2` haría que `args` contenga `["argumento1", "argumento2"]`), permitiendo parametrizar la ejecución del programa desde fuera sin necesidad de recompilarlo.

**Analogía:** `main` es como la puerta principal marcada específicamente para que cualquier visitante (la JVM) sepa exactamente por dónde entrar, sin necesidad de que alguien dentro del edificio (una instancia ya creada) lo reciba primero en la puerta.

**¿Por qué es importante?** Cada palabra de `public static void main(String[] args)` cumple un propósito necesario y preciso para que la JVM pueda localizar e invocar ese método como punto de entrada sin necesitar una instancia previamente existente de la clase.

**Diagrama:**

```
public: accesible desde cualquier lugar (la JVM necesita invocarlo desde fuera)
static: pertenece a la clase, no requiere una instancia previa
void: no devuelve ningún valor
main: nombre exacto buscado por convención
String[] args: argumentos de línea de comandos
```

### Tema 3: JDK, JRE y JVM

**Conceptos clave:** desarrollo frente a ejecución, herramientas incluidas en cada nivel.

La JVM es específicamente la máquina virtual que ejecuta bytecode, el componente mínimo necesario para correr cualquier programa Java ya compilado; el JRE (Java Runtime Environment) incluye la JVM más las librerías estándar necesarias para que los programas Java se ejecuten correctamente (las clases básicas como `String`, `ArrayList`, etc., que un programa típico necesita en tiempo de ejecución, no solo el motor de ejecución del bytecode en sí); el JDK (Java Development Kit) incluye el JRE completo más las herramientas necesarias específicamente para desarrollar programas Java, no solo ejecutarlos (`javac` el compilador, un debugger, `javap` para inspeccionar bytecode, y otras herramientas de desarrollo).

Para escribir y compilar código Java se necesita el JDK completo, dado que incluye `javac`; para simplemente ejecutar un `.jar` ya compilado por alguien más, en principio bastaría con el JRE, aunque en la práctica moderna la mayoría de entornos instala directamente el JDK completo incluso para casos de solo ejecución, dado que las distribuciones actuales del JDK ya son razonablemente livianas y evitan tener que gestionar dos instalaciones separadas según el caso de uso específico.

**Analogía:** la JVM es como el motor de un vehículo (lo mínimo necesario para moverse); el JRE es el vehículo completo listo para conducir (motor más todo lo necesario para circular); el JDK es ese mismo vehículo más un taller completo de herramientas para repararlo y modificarlo, necesario solo para quien construye o modifica vehículos, no para quien simplemente los conduce.

**¿Por qué es importante?** Distinguir JDK, JRE y JVM aclara exactamente qué instalar según si el objetivo es desarrollar código Java (JDK) o simplemente ejecutar un programa ya compilado (JRE, aunque en la práctica se suele instalar el JDK completo de todas formas).

**Diagrama:**

```
JVM: ejecuta bytecode (el mínimo necesario)
JRE: JVM + librerías estándar (para EJECUTAR programas)
JDK: JRE + herramientas de desarrollo, javac incluido (para DESARROLLAR programas)
```

### Tema 4: Tipos primitivos vs referencias

**Conceptos clave:** valor directo frente a apuntador a un objeto, wrappers.

Un tipo primitivo (`int edad = 30;`) almacena su valor directamente en la variable (típicamente en la pila de ejecución, un área de memoria de acceso rápido y de ciclo de vida ligado al alcance donde la variable se declara), sin ninguna capa de indirección adicional; un tipo referencia (`String nombre = "Ana";`) almacena en la variable no el dato en sí, sino una referencia (conceptualmente un apuntador) hacia un objeto real ubicado en el heap (un área de memoria separada, gestionada por el recolector de basura, Módulo 11), de modo que la variable "apunta hacia" ese objeto en vez de contenerlo directamente.

Los tipos wrapper (`Integer edadObjeto = 30;`, la versión objeto correspondiente al primitivo `int`) existen específicamente para los casos donde Java requiere que un valor se trate como un objeto (por ejemplo, para almacenarlo dentro de una colección genérica como `List<Integer>`, dado que los genéricos de Java no admiten directamente tipos primitivos, Módulo 2), a costa de la sobrecarga adicional de memoria e indirección que un objeto conlleva frente a un primitivo puro, siendo esta la razón por la que Java sigue ofreciendo primitivos además de sus wrappers correspondientes, en vez de usar únicamente objetos para todo: los primitivos son más eficientes en memoria y velocidad para el caso extremadamente común de valores numéricos simples usados directamente.

**Analogía:** un tipo primitivo es como llevar el efectivo directamente en el bolsillo; un tipo referencia es como llevar una llave de una caja fuerte donde el objeto real está guardado en otro lugar — acceder al contenido real requiere primero seguir esa referencia hasta la caja fuerte correspondiente.

**¿Por qué es importante?** Los tipos primitivos almacenan su valor directamente, siendo más eficientes; los tipos referencia apuntan a objetos en el heap, necesarios cuando Java requiere tratar ese valor como un objeto completo (por ejemplo, dentro de colecciones genéricas).

**Diagrama:**

```java
int edad = 30;              // primitivo: valor directo en la pila
String nombre = "Ana";       // referencia: variable apunta a un objeto en el heap
Integer edadObjeto = 30;     // wrapper: versión objeto del primitivo int
```

---

## Laboratorio práctico

**Objetivo del laboratorio:** compilar y ejecutar un programa Java que procese entrada del usuario con validación de tipos, inspeccionando el bytecode generado.

**Requisitos previos:** ninguno (módulo introductorio del track).

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Escribir y compilar `Hola.java` | Ver Tema 1 | Observa el `.class` generado |
| 2 | Declarar los 8 tipos primitivos y un `String` | Ver Tema 4 | Distingue primitivos de referencias |
| 3 | Leer un número con `Scanner` y validar | — | Maneja el caso de entrada incorrecta |
| 4 | Investigar JDK vs JRE vs JVM | Ver Tema 3 | Documenta cuál necesitas para cada caso |
| 5 | Inspeccionar el bytecode con `javap -c` | Ver Tema 1 | Observa las instrucciones generadas |

**Verificación:** el laboratorio se considera exitoso si el programa compila y ejecuta correctamente, si maneja apropiadamente una entrada inválida del usuario sin terminar abruptamente, y si puedes explicar al menos tres instrucciones del bytecode generado por `javap`.

**Errores comunes y soluciones**

- **Confundir `JRE` con `JDK` al instalar el entorno de desarrollo.** Para desarrollar necesitas el JDK, que incluye `javac`.
- **Olvidar que `main` debe ser exactamente `public static void main(String[] args)`.** Cualquier desviación de esa firma exacta impide que la JVM lo reconozca como punto de entrada.
- **Asumir que un tipo primitivo puede usarse directamente en una colección genérica.** Usa el wrapper correspondiente (`Integer`, no `int`, dentro de `List<Integer>`).

---

## Ejercicios de evaluación

### Ejercicio 1: Por qué bytecode en vez de código máquina nativo

**Enunciado:** explica por qué Java compila a bytecode en vez de código máquina nativo directamente.

**Solución esperada:** compilar a bytecode permite que el mismo archivo compilado se ejecute sin recompilar en cualquier plataforma que tenga una JVM disponible, dado que la JVM específica de cada plataforma es la responsable de traducir ese bytecode universal al código máquina específico de esa plataforma, en vez de requerir una recompilación separada para cada plataforma de destino.

**Criterios de éxito:**
- Explica correctamente la portabilidad entre plataformas como razón principal.

### Ejercicio 2: Cada palabra de main

**Enunciado:** explica qué significa cada palabra de `public static void main(String[] args)`.

**Solución esperada:** `public` (accesible desde cualquier lugar, necesario para que la JVM lo invoque desde fuera), `static` (pertenece a la clase, no requiere una instancia previa), `void` (no devuelve ningún valor), `main` (nombre exacto buscado por convención), `String[] args` (argumentos de línea de comandos).

**Criterios de éxito:**
- Explica correctamente el propósito de cada una de las cinco partes de la firma.

### Ejercicio 3: JDK, JRE y JVM

**Enunciado:** ¿qué necesitas instalar si solo quieres ejecutar un `.jar` ya compilado por otra persona, sin desarrollar código Java tú mismo?

**Solución esperada:** en principio, el JRE es suficiente, dado que incluye la JVM más las librerías estándar necesarias para ejecutar programas Java, sin necesitar las herramientas de desarrollo (como `javac`) que solo el JDK completo incluye; en la práctica moderna, sin embargo, es común instalar directamente el JDK completo incluso para este caso.

**Criterios de éxito:**
- Identifica correctamente el JRE como suficiente en principio, mencionando que el JDK agrega herramientas de desarrollo no necesarias para solo ejecutar.

---

## Resumen del módulo

**Puntos clave**

- Java compila a bytecode, ejecutado por la JVM, lo que permite portabilidad entre plataformas sin recompilar.
- Cada palabra de `public static void main(String[] args)` cumple un propósito necesario para que la JVM lo reconozca como punto de entrada.
- El JDK incluye herramientas de desarrollo (como `javac`) que el JRE, y este a su vez la JVM, no incluyen por sí solos.
- Los tipos primitivos almacenan su valor directamente; los tipos referencia apuntan a objetos en el heap.

**Conceptos aprendidos**

- Compilación a bytecode y ejecución en la JVM.
- Significado de cada parte de `main`.
- Diferencias entre JDK, JRE y JVM.
- Tipos primitivos frente a referencias y wrappers.

**Próximos pasos**

En el Módulo 1 aprenderás programación orientada a objetos: clases, herencia, interfaces, polimorfismo y modificadores de acceso.

**Recursos adicionales**

- Documentación oficial de Java (docs.oracle.com/en/java) y la especificación de la JVM.
