## Herencia y sobreescritura

```java
class Animal {
    String hablar() { return "..."; }
}

class Perro extends Animal {
    @Override
    String hablar() { return "Guau"; }
}
```

## Interfaces

```java
interface Volador {
    void volar();
}

class Pajaro implements Volador {
    public void volar() { System.out.println("Vuela"); }
}
```

## Clase abstracta vs interfaz

```java
abstract class Forma {
    abstract double area();              // sin implementación: cada subclase la define
    void describir() { System.out.println("Área: " + area()); } // con implementación, compartida
}
```

Usa una **clase abstracta** cuando hay comportamiento compartido entre subclases relacionadas. Usa una **interfaz** para definir un contrato que clases NO relacionadas pueden implementar (Java permite implementar múltiples interfaces, pero solo extender una clase).

## Sobrecarga vs sobreescritura

```java
int sumar(int a, int b) { return a + b; }
double sumar(double a, double b) { return a + b; } // sobrecarga: misma firma, distintos tipos

// sobreescritura: una subclase redefine el comportamiento heredado con @Override
```

## Modificadores de acceso

`private` (solo la clase), sin modificador/package-private (mismo paquete), `protected` (paquete + subclases), `public` (todos).
