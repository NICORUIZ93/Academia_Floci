# Módulo 0: Fundamentos de Dart

## Sílabo

**Objetivo general**

Dominar Dart, el lenguaje detrás de Flutter: null safety comprobada de forma sólida (sound), orientación a objetos con clases y mixins, y el modelo asíncrono basado en `Future`/`async`/`await` que sustenta toda la interacción con red y I/O en Flutter.

**Objetivos específicos**

1. Declarar una variable nullable y manejar el caso `null` explícitamente.
2. Crear una jerarquía de clases con herencia y aplicar un mixin.
3. Escribir una función `async` que simule una petición con `Future.delayed`.
4. Transformar una colección con `map`, `where` y `reduce` encadenados.
5. Ejecutar `dart analyze` y corregir advertencias de null safety.

**Contenido**

- Null safety (sound null safety).
- Clases, mixins y herencia.
- Futures y `async`/`await`.
- Colecciones y funciones de orden superior.

**Evaluación**

Programa de consola en Dart con manejo asíncrono y null safety estricta, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Sound null safety

**Conceptos clave:** garantía verificada en todo el programa, no solo advertencias parciales.

```dart
String nombre = "Ana";       // nunca null
String? apodo;                  // explícitamente nullable

print(apodo?.length);           // null-aware: null si apodo es null
print(apodo ?? "Sin apodo");    // valor por defecto
```

Dart distingue en el sistema de tipos entre `String` (que el compilador garantiza que nunca contendrá `null`) y `String?` (explícitamente nullable), de forma directamente análoga a los optionals de Swift (Módulo 0 del track de iOS): intentar usar un `String?` donde se espera un `String` sin verificar primero produce un error del analizador estático, no un crash en tiempo de ejecución. La calificación "sound" (sólida) es específica y significativa: Dart garantiza esta propiedad de forma consistente en **todo** el programa, incluyendo código de librerías externas ya migradas a null safety, no solo en advertencias parciales o heurísticas que podrían tener excepciones; esto contrasta con el manejo de `null`/`undefined` en JavaScript (Módulo 0 del track de JavaScript), donde no existe ninguna garantía estructural equivalente verificada por el sistema de tipos, y acceder a una propiedad de un valor inesperadamente `undefined` simplemente falla en tiempo de ejecución sin ninguna advertencia previa del lenguaje.

El operador `?.` (null-aware access) accede a una propiedad o método solo si el receptor no es `null`, devolviendo `null` en caso contrario en vez de lanzar una excepción; `??` (nil coalescing, el mismo operador presente en Swift) provee un valor por defecto cuando la expresión de la izquierda es `null`.

**Analogía:** sound null safety es como un sistema de inspección de calidad que garantiza, verificado de punta a punta en toda la línea de producción (incluyendo componentes de proveedores externos ya certificados), que ningún paquete etiquetado como "contenido garantizado" pueda llegar vacío, en vez de una política de "generalmente debería tener contenido" sin verificación estructural completa.

**¿Por qué es importante?** El sound null safety de Dart garantiza, verificado en todo el programa incluyendo librerías externas, que un valor no-nullable nunca será `null`, una garantía estructural que JavaScript no ofrece por defecto en su sistema de tipos.

**Diagrama:**

```dart
String nombre = "Ana";     // garantizado no-null en TODO el programa
String? apodo;              // explícitamente nullable
print(apodo?.length);       // null-aware access
print(apodo ?? "Sin apodo"); // valor por defecto
```

### Tema 2: Clases y mixins

**Conceptos clave:** comportamiento reutilizable sin herencia múltiple tradicional.

```dart
mixin Volador {
  void volar() => print("Volando");
}

class Pajaro extends Animal with Volador {}
```

Dart, como la mayoría de los lenguajes orientados a objetos modernos, no permite herencia múltiple directa (una clase no puede `extends` de dos clases distintas simultáneamente); un mixin resuelve la necesidad de compartir comportamiento entre clases que no comparten una relación de herencia natural, permitiendo que `Pajaro` herede de `Animal` (su relación de herencia principal) **y** obtenga adicionalmente el comportamiento de `Volador` (un comportamiento transversal que también podría aplicarse a otras clases no relacionadas con `Animal`, como un `Avion` o un `Superheroe`), sin necesidad de que `Volador` participe en la jerarquía de herencia principal de `Pajaro`.

Este patrón de composición de comportamiento transversal es conceptualmente similar a los protocolos con extensiones en Swift (Módulo 0 del track de iOS) o a las interfaces con implementación por defecto en Java/Kotlin, todos resolviendo el mismo problema de "compartir comportamiento entre tipos no relacionados por una jerarquía de herencia única", aunque cada lenguaje lo resuelve con una sintaxis y semántica ligeramente distinta.

**Analogía:** un mixin es como una habilidad certificada que se puede añadir a la formación de cualquier profesional independientemente de su especialización principal (un médico y un ingeniero pueden ambos certificarse en primeros auxilios avanzados), sin que esa habilidad transversal altere ni dependa de su especialización de base.

**¿Por qué es importante?** Un mixin permite compartir comportamiento reutilizable entre clases sin depender de herencia múltiple tradicional (no soportada en Dart), resolviendo el mismo problema que protocolos con extensiones en Swift o interfaces con implementación por defecto en otros lenguajes orientados a objetos.

**Diagrama:**

```dart
mixin Volador {
  void volar() => print("Volando");
}
class Pajaro extends Animal with Volador {}
// Pajaro hereda de Animal Y obtiene el comportamiento de Volador
```

### Tema 3: Futures, async/await y colecciones funcionales

**Conceptos clave:** operación asíncrona representada como un valor futuro, transformación declarativa de colecciones.

```dart
Future<Usuario> obtenerUsuario() async {
  await Future.delayed(Duration(seconds: 1));
  return Usuario("Ana");
}

void main() async {
  final usuario = await obtenerUsuario();
  print(usuario.nombre);
}
```

Un `Future<T>` representa un valor de tipo `T` que estará disponible en algún momento futuro, no inmediatamente; una función marcada `async` puede usar `await` para suspender su ejecución hasta que ese `Future` se resuelva, sin bloquear el hilo de ejecución mientras tanto, permitiendo que el código se lea de forma lineal y secuencial exactamente igual que en `async`/`await` de Swift (Módulo 4 del track de iOS) o `suspend` en Kotlin (Módulo 2 del track de Kotlin Multiplatform): la misma convergencia de múltiples lenguajes hacia el mismo modelo mental de asincronía legible.

```dart
final nombres = personas.where((p) => p.edad >= 18).map((p) => p.nombre).toList();
final total = pedidos.fold<double>(0, (acumulado, p) => acumulado + p.monto);
```

`where` (filtrar según un predicado), `map` (transformar cada elemento), y `fold`/`reduce` (acumular una colección a un único valor) son las operaciones funcionales fundamentales para transformar colecciones de forma declarativa, encadenables entre sí para expresar transformaciones complejas como una secuencia legible de pasos simples, en vez de un bucle imperativo con una variable acumuladora mutable gestionada manualmente paso a paso.

**Analogía:** un `Future` es como un recibo de un pedido que garantiza la entrega en algún momento posterior, aunque no inmediatamente: se puede seguir haciendo otras cosas mientras se espera, y `await` es simplemente el momento de recoger el pedido cuando efectivamente está listo; encadenar `where`/`map`/`fold` es como una línea de ensamblaje con estaciones sucesivas, cada una aplicando una transformación simple y bien definida, produciendo en conjunto un resultado complejo a partir de pasos individuales fáciles de entender por separado.

**¿Por qué es importante?** `Future` con `async`/`await` permite código asíncrono legible de forma lineal, el mismo modelo convergente que otros lenguajes modernos; encadenar operaciones funcionales sobre colecciones expresa transformaciones complejas de forma declarativa y legible, sin bucles imperativos con estado mutable manual.

**Diagrama:**

```dart
Future<Usuario> obtenerUsuario() async {
  await Future.delayed(Duration(seconds: 1));
  return Usuario("Ana");
}
final nombres = personas.where((p) => p.edad >= 18).map((p) => p.nombre).toList();
```

---

## Laboratorio práctico

**Objetivo del laboratorio:** construir un programa de consola en Dart con manejo asíncrono y null safety estricta.

**Requisitos previos:** Dart SDK instalado (incluido con Flutter).

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Declarar una variable nullable y usarla sin verificar | Ver Tema 1 | Observa el error del analizador |
| 2 | Crear una jerarquía de clases con un mixin | Ver Tema 2 | Herencia + comportamiento transversal |
| 3 | Escribir una función `async` con `Future.delayed` | Ver Tema 3 | Esperarla con `await` |
| 4 | Encadenar `map`, `where` y `reduce` | Ver Tema 3 | Sobre una lista de objetos |
| 5 | Ejecutar `dart analyze` | `dart analyze` | Corregir advertencias de null safety |

**Verificación:** el laboratorio se considera exitoso si `dart analyze` no reporta ninguna advertencia de null safety, y si el programa maneja correctamente el flujo asíncrono simulado con `Future.delayed`.

**Errores comunes y soluciones**

- **Usar el operador de aserción `!` por comodidad sin verificar realmente la ausencia de null.** Arriesga una excepción en runtime; prefiere `?.` o `??` cuando sea posible.
- **Usar herencia múltiple simulada de forma incorrecta en vez de un mixin.** Dart no soporta herencia múltiple directa; usa mixins para comportamiento transversal.
- **Bloquear código síncrono esperando un `Future` sin `async`/`await`.** Usa el modificador `async` en la función que necesita esperar el resultado.

---

## Ejercicios de evaluación

### Ejercicio 1: Qué garantiza sound null safety

**Enunciado:** ¿qué garantiza el "sound null safety" de Dart que JavaScript no garantiza por defecto?

**Solución esperada:** garantiza, de forma verificada consistentemente en todo el programa (incluyendo librerías externas ya migradas), que un valor declarado como no-nullable nunca contendrá `null`, detectando en tiempo de análisis estático cualquier intento de violar esa garantía; JavaScript no ofrece ninguna estructura equivalente en su sistema de tipos, permitiendo que un valor `undefined` cause un fallo en tiempo de ejecución sin advertencia previa.

**Criterios de éxito:**
- Explica correctamente la verificación consistente en todo el programa como la garantía distintiva del sound null safety.

### Ejercicio 2: Diferencia entre herencia simple y mixin

**Enunciado:** ¿qué diferencia hay entre herencia simple y un mixin en Dart?

**Solución esperada:** la herencia simple (`extends`) establece la relación de tipo principal de una clase (solo se puede heredar de una única clase); un mixin (`with`) agrega comportamiento reutilizable adicional a una clase sin participar en su jerarquía de herencia principal, permitiendo compartir ese comportamiento entre clases que no están relacionadas entre sí.

**Criterios de éxito:**
- Distingue correctamente la relación de herencia principal de la composición de comportamiento transversal vía mixin.

### Ejercicio 3: Legibilidad de async/await

**Enunciado:** ¿por qué `async`/`await` sobre un `Future` es más fácil de leer que encadenar callbacks?

**Solución esperada:** permite que el código asíncrono se lea de forma lineal y secuencial, exactamente como código síncrono normal, en vez de anidar closures de callback sucesivos que dificultan seguir el flujo del código al encadenar múltiples operaciones asíncronas dependientes.

**Criterios de éxito:**
- Explica correctamente la lectura lineal como razón de la mayor facilidad frente a callbacks anidados.

---

## Resumen del módulo

**Puntos clave**

- El sound null safety de Dart garantiza, verificado en todo el programa, que un tipo no-nullable nunca contendrá `null`.
- Los mixins permiten compartir comportamiento reutilizable entre clases sin depender de herencia múltiple tradicional.
- `Future` con `async`/`await` permite código asíncrono legible de forma lineal, el mismo modelo convergente de otros lenguajes modernos.
- Encadenar `where`/`map`/`fold` expresa transformaciones de colecciones de forma declarativa y legible.

**Conceptos aprendidos**

- Null safety (sound null safety).
- Clases, mixins y herencia.
- Futures y `async`/`await`.
- Colecciones y funciones de orden superior.

**Próximos pasos**

En el Módulo 1 aprenderás que "en Flutter todo es un widget": la diferencia entre `StatelessWidget` y `StatefulWidget`, y el árbol de widgets que sustenta toda la UI.

**Recursos adicionales**

- Documentación oficial de null safety en Dart (dart.dev/null-safety).
