## Del código a la JVM

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

`public` (accesible desde cualquier lugar), `static` (pertenece a la clase, no a una instancia — por eso la JVM puede llamarlo sin crear un objeto), `void` (no devuelve nada), `main` (punto de entrada que la JVM busca por convención), `String[] args` (argumentos de línea de comandos).

## JDK, JRE y JVM

- **JVM**: la máquina virtual que ejecuta bytecode
- **JRE**: JVM + librerías estándar necesarias para EJECUTAR programas Java
- **JDK**: JRE + herramientas para DESARROLLAR (compilador `javac`, debugger, etc.)

Para programar necesitas el JDK; para solo ejecutar un .jar ya compilado, basta el JRE (aunque hoy la mayoría instala el JDK completo de todas formas).

## Tipos primitivos vs referencias

```java
int edad = 30;              // primitivo: valor directo en la pila
String nombre = "Ana";       // referencia: variable apunta a un objeto en el heap
Integer edadObjeto = 30;     // wrapper: versión objeto del primitivo int
```
