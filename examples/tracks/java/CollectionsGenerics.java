// Colecciones y genéricos (Módulo 2): List/Set/Map, y una clase genérica propia.
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

// <T> es un parámetro de tipo: Pila<String> y Pila<Integer> comparten el mismo
// código compilado, con el compilador verificando el tipo en cada uso.
class Pila<T> {
  private final List<T> elementos = new ArrayList<>();

  void apilar(T elemento) {
    elementos.add(elemento);
  }

  T desapilar() {
    if (elementos.isEmpty()) {
      throw new IllegalStateException("La pila está vacía");
    }
    return elementos.remove(elementos.size() - 1);
  }

  boolean estaVacia() {
    return elementos.isEmpty();
  }
}

public class CollectionsGenerics {
  public static void main(String[] args) {
    // List: orden de inserción preservado, permite duplicados.
    List<String> nombres = new ArrayList<>(List.of("Ana", "Luis", "Ana"));

    // Set: sin duplicados. HashSet no garantiza orden; usa LinkedHashSet si importa.
    Set<String> nombresUnicos = new HashSet<>(nombres);
    System.out.println("Únicos: " + nombresUnicos);

    // Map: pares clave-valor.
    Map<String, Integer> edades = new HashMap<>();
    edades.put("Ana", 30);
    edades.put("Luis", 25);
    edades.forEach((nombre, edad) -> System.out.println(nombre + " tiene " + edad + " años"));

    Pila<Integer> pila = new Pila<>();
    pila.apilar(1);
    pila.apilar(2);
    System.out.println("Desapilado: " + pila.desapilar()); // 2 — último en entrar, primero en salir
  }
}
