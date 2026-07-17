// Records, sealed classes y pattern matching (Módulo 7, Java 17-21+).
// Records: clases inmutables de datos sin boilerplate (constructor, getters,
// equals/hashCode/toString generados automáticamente por el compilador).
record Punto(int x, int y) {}

// sealed restringe qué clases pueden implementar Forma — el compilador conoce
// el conjunto cerrado de subtipos posibles, lo que habilita el "exhaustiveness
// checking" del switch de abajo (sin necesitar una rama `default`).
sealed interface Forma permits Circulo, Rectangulo {}
record Circulo(Punto centro, double radio) implements Forma {}
record Rectangulo(Punto esquina, double ancho, double alto) implements Forma {}

public class RecordsPatternMatching {
  static double calcularArea(Forma forma) {
    // Pattern matching en switch (Java 21+): cada rama "deconstruye" el record
    // directamente en sus componentes (radio, ancho, alto), sin casts manuales
    // ni llamadas a getters. El compilador exige cubrir todos los subtipos de
    // Forma (sealed) o falla en tiempo de compilación — no en producción.
    return switch (forma) {
      case Circulo(Punto centro, double radio) -> Math.PI * radio * radio;
      case Rectangulo(Punto esquina, double ancho, double alto) -> ancho * alto;
    };
  }

  public static void main(String[] args) {
    Forma circulo = new Circulo(new Punto(0, 0), 5);
    Forma rectangulo = new Rectangulo(new Punto(1, 1), 4, 3);

    System.out.printf("Área círculo: %.2f%n", calcularArea(circulo));
    System.out.printf("Área rectángulo: %.2f%n", calcularArea(rectangulo));

    // Los records ya traen igualdad estructural: dos records son iguales si
    // todos sus componentes lo son, sin implementar equals() manualmente.
    System.out.println(new Punto(1, 1).equals(new Punto(1, 1))); // true
  }
}
