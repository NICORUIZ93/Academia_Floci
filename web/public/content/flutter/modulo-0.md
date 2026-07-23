# Módulo 0: Fundamentos de Dart


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

#### Paso 1 · Objetivo y preparación
Al finalizar podrás ejecutar Dart y Flutter desde cero. Prerrequisitos: Flutter SDK, Dart, Android Studio o Xcode según plataforma. Verifica flutter --version y dart --version.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, datos ausentes, modelos compartidos y llamadas asíncronas deben expresarse sin crashes ni bloqueos de interfaz.

#### Paso 3 · Teoría, modelo mental y analogía
Null safety distingue valor y ausencia; clases encapsulan estado; mixins reutilizan capacidades; Future representa un resultado futuro y async/await expresa espera. La analogía es una central: cada paquete tiene etiqueta, cada tarea una promesa y cada ausencia una decisión explícita.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-flutter-m0
cd ejemplo-flutter-m0
flutter create app
cd app
flutter run
```

`flutter` es el comando que gestiona proyectos Flutter (`create` arma el proyecto nuevo, `run` lo compila y ejecuta en el emulador o dispositivo conectado).
Crea lib/delivery.dart con modelo nullable y función async; úsalo en lib/main.dart y explica la ruta y la salida en el emulador.

#### Paso 5 · Práctica guiada
Pista: fuerza deliberadamente un null no validado para provocar un fallo deliberado; lee el stack trace y corrígelo con if/guard. Resultado esperado: pantalla estable y mensaje controlado.

#### Paso 6 · Práctica independiente
Añade lista de entregas, FutureBuilder, estado loading/error y una prueba de Dart para datos ausentes.

#### Paso 7 · Cierre y evidencia
Guarda estructura, comandos, captura y log; como siguiente paso estudia widgets. Errores comunes: force unwrap, Future sin manejo de error, lógica de red en build y mixins sin contrato. Fuentes oficiales: https://docs.flutter.dev/get-started/install y https://dart.dev/language.
**¿Por qué es importante?** Porque Dart y null safety son la base de una app Flutter robusta.
**Evidencia de aprendizaje:** entrega app, modelo, fallo, corrección y test.
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

#### Paso 1 · Objetivo y preparación
Al finalizar podrás ejecutar Dart y Flutter desde cero. Prerrequisitos: Flutter SDK, Dart, Android Studio o Xcode según plataforma. Verifica flutter --version y dart --version.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, datos ausentes, modelos compartidos y llamadas asíncronas deben expresarse sin crashes ni bloqueos de interfaz.

#### Paso 3 · Teoría, modelo mental y analogía
Null safety distingue valor y ausencia; clases encapsulan estado; mixins reutilizan capacidades; Future representa un resultado futuro y async/await expresa espera. La analogía es una central: cada paquete tiene etiqueta, cada tarea una promesa y cada ausencia una decisión explícita.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-flutter-m0
cd ejemplo-flutter-m0
flutter create app
cd app
flutter run
```
Crea lib/delivery.dart con modelo nullable y función async; úsalo en lib/main.dart y explica la ruta y la salida en el emulador.

#### Paso 5 · Práctica guiada
Pista: fuerza deliberadamente un null no validado para provocar un fallo deliberado; lee el stack trace y corrígelo con if/guard. Resultado esperado: pantalla estable y mensaje controlado.

#### Paso 6 · Práctica independiente
Añade lista de entregas, FutureBuilder, estado loading/error y una prueba de Dart para datos ausentes.

#### Paso 7 · Cierre y evidencia
Guarda estructura, comandos, captura y log; como siguiente paso estudia widgets. Errores comunes: force unwrap, Future sin manejo de error, lógica de red en build y mixins sin contrato. Fuentes oficiales: https://docs.flutter.dev/get-started/install y https://dart.dev/language.
**¿Por qué es importante?** Porque Dart y null safety son la base de una app Flutter robusta.
**Evidencia de aprendizaje:** entrega app, modelo, fallo, corrección y test.
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

#### Paso 1 · Objetivo y preparación
Al finalizar podrás ejecutar Dart y Flutter desde cero. Prerrequisitos: Flutter SDK, Dart, Android Studio o Xcode según plataforma. Verifica flutter --version y dart --version.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, datos ausentes, modelos compartidos y llamadas asíncronas deben expresarse sin crashes ni bloqueos de interfaz.

#### Paso 3 · Teoría, modelo mental y analogía
Null safety distingue valor y ausencia; clases encapsulan estado; mixins reutilizan capacidades; Future representa un resultado futuro y async/await expresa espera. La analogía es una central: cada paquete tiene etiqueta, cada tarea una promesa y cada ausencia una decisión explícita.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-flutter-m0
cd ejemplo-flutter-m0
flutter create app
cd app
flutter run
```
Crea lib/delivery.dart con modelo nullable y función async; úsalo en lib/main.dart y explica la ruta y la salida en el emulador.

#### Paso 5 · Práctica guiada
Pista: fuerza deliberadamente un null no validado para provocar un fallo deliberado; lee el stack trace y corrígelo con if/guard. Resultado esperado: pantalla estable y mensaje controlado.

#### Paso 6 · Práctica independiente
Añade lista de entregas, FutureBuilder, estado loading/error y una prueba de Dart para datos ausentes.

#### Paso 7 · Cierre y evidencia
Guarda estructura, comandos, captura y log; como siguiente paso estudia widgets. Errores comunes: force unwrap, Future sin manejo de error, lógica de red en build y mixins sin contrato. Fuentes oficiales: https://docs.flutter.dev/get-started/install y https://dart.dev/language.
**¿Por qué es importante?** Porque Dart y null safety son la base de una app Flutter robusta.
**Evidencia de aprendizaje:** entrega app, modelo, fallo, corrección y test.
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
