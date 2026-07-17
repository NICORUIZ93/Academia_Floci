// Programación orientada a objetos (Módulo 1): encapsulación, herencia y polimorfismo.
import java.util.List;

abstract class Empleado {
  private final String nombre; // encapsulación: solo accesible vía getNombre()
  private final double salarioBase;

  Empleado(String nombre, double salarioBase) {
    this.nombre = nombre;
    this.salarioBase = salarioBase;
  }

  String getNombre() {
    return nombre;
  }

  // Método abstracto: cada subclase define su propio cálculo de bono.
  // Esto es polimorfismo — el mismo mensaje "calcularSalario()" produce
  // resultados distintos según el tipo real del objeto en tiempo de ejecución.
  abstract double calcularSalario();

  @Override
  public String toString() {
    return "%s: $%.2f".formatted(nombre, calcularSalario());
  }
}

class Desarrollador extends Empleado {
  private final int añosExperiencia;

  Desarrollador(String nombre, double salarioBase, int añosExperiencia) {
    super(nombre, salarioBase); // constructor de la clase base
    this.añosExperiencia = añosExperiencia;
  }

  @Override
  double calcularSalario() {
    // Bono del 5% por cada año de experiencia, aplicado sobre el salario base.
    return salarioBase() + salarioBase() * 0.05 * añosExperiencia;
  }

  private double salarioBase() {
    return 50_000; // simplificado para el ejemplo
  }
}

public class OopBasics {
  public static void main(String[] args) {
    List<Empleado> equipo = List.of(
        new Desarrollador("Ana", 50_000, 3),
        new Desarrollador("Luis", 50_000, 1)
    );

    // Polimorfismo en acción: cada empleado.calcularSalario() ejecuta la
    // implementación de Desarrollador, aunque la variable declarada sea Empleado.
    equipo.forEach(System.out::println);
  }
}
