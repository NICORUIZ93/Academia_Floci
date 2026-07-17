// Streams y programación funcional (Módulo 4): filter, map, reduce y collect.
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

record Producto(String nombre, String categoria, double precio) {}

public class StreamsFunctional {
  public static void main(String[] args) {
    List<Producto> productos = List.of(
        new Producto("Laptop", "Electrónica", 1200),
        new Producto("Mouse", "Electrónica", 25),
        new Producto("Escritorio", "Muebles", 300),
        new Producto("Silla", "Muebles", 150)
    );

    // filter + map + collect: un pipeline declarativo, no un bucle for imperativo.
    List<String> nombresCaros = productos.stream()
        .filter(p -> p.precio() > 100)
        .map(Producto::nombre)
        .collect(Collectors.toList());
    System.out.println("Caros: " + nombresCaros);

    // reduce: combina todos los elementos en un único valor (aquí, la suma).
    double total = productos.stream()
        .mapToDouble(Producto::precio)
        .sum();
    System.out.println("Total inventario: $" + total);

    // groupingBy: agrupa por una clave derivada — aquí, la categoría.
    Map<String, List<Producto>> porCategoria = productos.stream()
        .collect(Collectors.groupingBy(Producto::categoria));
    porCategoria.forEach((categoria, lista) ->
        System.out.println(categoria + ": " + lista.size() + " producto(s)"));

    // Los streams son perezosos: filter/map no hacen nada hasta que una operación
    // terminal (collect, sum, forEach) los "activa" — evita recorridos intermedios.
  }
}
