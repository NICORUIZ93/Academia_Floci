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

## Antes de comenzar: instala Flutter y valida todo

Flutter incluye Dart. Descarga el SDK estable desde [docs.flutter.dev/get-started/install](https://docs.flutter.dev/get-started/install), descomprímelo en una ruta permanente sin espacios y agrega `flutter/bin` al `PATH`. Instala Git, VS Code con las extensiones Flutter/Dart y Android Studio para obtener el Android SDK.

| Sistema | Preparación adicional |
|---|---|
| Windows | Activa Developer Mode para enlaces simbólicos; evita `Program Files` para el SDK |
| macOS | Instala Xcode para iOS y ejecuta `sudo xcodebuild -license`; instala CocoaPods si `flutter doctor` lo pide |
| Linux | Instala las librerías indicadas por Flutter y configura KVM para acelerar el emulador Android |

Ejecuta `flutter doctor -v` y resuelve cada marca roja; las advertencias de una plataforma que no usarás todavía pueden esperar. Acepta licencias Android con `flutter doctor --android-licenses`. Después:

```bash
flutter create mi_primera_app
cd mi_primera_app
flutter devices
flutter run
```

Selecciona Chrome o un emulador si hay varios dispositivos. Cambia el texto en `lib/main.dart` y usa hot reload (`r` en la terminal). Si `flutter` no se reconoce, el problema es `PATH`; si no aparecen dispositivos, el SDK funciona pero falta configurar un destino.

## Aprende construyendo

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

**Código del ejemplo:**

```dart
String nombre = "Ana";     // garantizado no-null en TODO el programa
String? apodo;              // explícitamente nullable
print(apodo?.length);       // null-aware access
print(apodo ?? "Sin apodo"); // valor por defecto
```

### Tema 2: Clases y mixins

**Conceptos clave:** comportamiento reutilizable sin herencia múltiple tradicional.

#### `extends`, `implements`, `with` y `@override` no significan lo mismo

`extends` hereda implementación y establece una relación «es un» con una sola superclase; `implements` obliga a satisfacer el contrato público de uno o varios tipos, pero no hereda sus implementaciones; `with` aplica el comportamiento de un mixin compatible. `@override` es una anotación de Dart que comunica al analizador que el miembro pretende reemplazar uno heredado o exigido por un contrato. No realiza el reemplazo: la firma y la jerarquía son las que lo determinan.

Usar `@override` hace visible un error frecuente. Si se escribe mal `build` o cambia la firma, el analizador avisa que no existe ningún miembro compatible para sobrescribir; sin la anotación, el método mal escrito podría quedar como un método nuevo y el framework seguiría llamando al original. En widgets, `build` debe limitarse a describir UI: puede ejecutarse muchas veces y no es el lugar para peticiones HTTP o escrituras persistentes.

```dart
class Ave extends Animal with Volador implements Rastreable {
  @override
  String obtenerId() => 'ave-01';
}
```

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

**Código del ejemplo:**

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

**Código del ejemplo:**

```dart
Future<Usuario> obtenerUsuario() async {
  await Future.delayed(Duration(seconds: 1));
  return Usuario("Ana");
}
final nombres = personas.where((p) => p.edad >= 18).map((p) => p.nombre).toList();
```

---

## Ruta de proyecto progresivo desde carpeta vacía

No crees un proyecto desechable por módulo. Conserva un único repositorio que evoluciona durante todo el track y etiqueta cada hito (`git tag modulo-N`). Empieza con `flutter create academia_flutter && cd academia_flutter && git init`. Ejecuta el comando paso a paso, inspecciona los archivos generados y registra versiones y precondiciones en el README.

| Hito | Evolución acumulativa | Evidencia antes de avanzar |
|---|---|---|
| Base | widgets, layout y navegación. | Arranque reproducible, commit limpio y prueba mínima. |
| Aplicación | estado, red y persistencia. | Casos normales, límite y error automatizados. |
| Integración | Conecta capas y reemplaza dobles por infraestructura controlada. | Diagrama, contratos y prueba de integración. |
| Experto | profiling, seguridad y doble release. | Perfil o threat model, telemetría y runbook de recuperación. |

Al iniciar cada laboratorio crea una rama `modulo-N`, implementa el incremento, verifica el criterio de éxito y fusiona solo con pruebas verdes. Si un módulo necesita un experimento aislado, colócalo en `experiments/modulo-N/`; el producto acumulativo permanece ejecutable. Al terminar, otra persona debe poder clonar el repositorio y reproducir el último hito siguiendo únicamente el README.

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

- Google, *Flutter Documentation* y guías de arquitectura y rendimiento.
- Google, *Dart Language Documentation* y *Effective Dart*.
- OWASP Foundation, *Mobile Application Security Verification Standard*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

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
- Ejemplos de código ejecutables de este track, en Dart: carpeta [`examples/tracks/flutter/`](https://github.com/NICORUIZ93/Academia_Floci/tree/main/examples/tracks/flutter) del repositorio — `stateful-widget.dart` (Módulo 1), `responsive-layout.dart` (Módulo 2), `state-management.dart` (Módulo 4), `networking.dart` (Módulo 5), `local-persistence.dart` (Módulo 6).
