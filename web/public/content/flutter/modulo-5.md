# Módulo 5: Networking


## Aprende construyendo

### Tema 1: http vs dio

**Conceptos clave:** simplicidad básica frente a un cliente HTTP completo para apps de tamaño real.

```dart
// http: simple, suficiente para casos básicos
final respuesta = await http.get(Uri.parse('https://api.miapp.com/tareas'));

// dio: interceptores, cancelación, timeouts configurables, transformación de datos
final dio = Dio();
dio.interceptors.add(LogInterceptor());
final respuesta = await dio.get('/tareas');
```

El paquete `http` (mantenido oficialmente por el equipo de Dart) ofrece una API mínima y directa para peticiones HTTP básicas, suficiente para casos simples de un proyecto pequeño o un prototipo; `dio` es un cliente HTTP considerablemente más completo, con soporte incorporado para interceptores (Tema 3), cancelación de peticiones en curso, configuración fina de timeouts por petición, y transformación automática de datos, capacidades que en `http` requerirían implementarse manualmente con código adicional propio, aumentando la complejidad de mantenimiento a medida que la app crece más allá de casos triviales.

Para una app de tamaño real que necesita manejar autenticación (agregando un header en cada petición), logging consistente de todas las peticiones para depuración, y cancelación de peticiones obsoletas (por ejemplo, al iniciar una nueva búsqueda antes de que la anterior complete, el mismo patrón estudiado con `Task.cancel()` en Swift, Módulo 5 del track de iOS), `dio` ofrece estas capacidades como parte de su API central, en vez de requerir construir esa infraestructura manualmente sobre el paquete `http` más básico.

**Analogía:** `http` es como un servicio postal básico que simplemente entrega y recibe correspondencia; `dio` es como un servicio de logística completo con seguimiento en tiempo real, capacidad de cancelar un envío en tránsito, y reglas configurables de manejo especial para cada tipo específico de paquete, capacidades que el servicio básico simplemente no ofrece de forma nativa.

**¿Por qué es importante?** `dio` ofrece interceptores, cancelación y timeouts configurables como parte de su API central, capacidades que una app de tamaño real necesita y que `http` no ofrece nativamente, requiriendo construir esa infraestructura manualmente si se usara el paquete más básico.

**Código del ejemplo:**

```dart
final dio = Dio();
dio.interceptors.add(LogInterceptor());
final respuesta = await dio.get('/tareas');
```

### Tema 2: json_serializable

**Conceptos clave:** generación de código en tiempo de compilación, parsing tipado y verificado.

```dart
@JsonSerializable()
class Tarea {
  final String id;
  final String titulo;
  Tarea({required this.id, required this.titulo});
  factory Tarea.fromJson(Map<String, dynamic> json) => _$TareaFromJson(json);
}
```

`json_serializable` genera automáticamente, en tiempo de compilación (mediante un paso de build separado, `build_runner`), el código de parsing (`_$TareaFromJson`) que convierte un `Map<String, dynamic>` genérico (la representación cruda de JSON decodificado en Dart) hacia una instancia tipada de `Tarea`; un campo faltante o con un tipo incorrecto en el JSON recibido produce un error claro y explícito al deserializar, en vez de fallar silenciosamente o de forma confusa más adelante en el código si se hubiera parseado manualmente accediendo directamente a claves de un `Map<String, dynamic>` sin ninguna verificación de tipo centralizada (un enfoque propenso a errores silenciosos como acceder a una clave inexistente y obtener `null` sin ningún error visible hasta que ese valor `null` causa un problema en un punto completamente distinto y más difícil de rastrear del código).

Este mismo principio de generación de código de parsing tipado en tiempo de compilación es directamente análogo a `Codable` en Swift (Módulo 5 del track de iOS) y a `kotlinx.serialization` en Kotlin (Módulo 6 del track de Kotlin Multiplatform), todos eliminando la necesidad de escribir manualmente el parsing campo por campo desde una estructura genérica no tipada.

**Analogía:** `json_serializable` es como un traductor certificado que verifica cuidadosamente que cada campo del documento original (JSON) tenga el formato exacto esperado antes de producir la versión traducida y tipada, rechazando explícitamente con un error claro cualquier documento que no cumpla el formato esperado, en vez de producir una traducción silenciosamente incompleta o incorrecta.

**¿Por qué es importante?** Generar modelos con `json_serializable` es más seguro que parsear JSON manualmente con `Map<String, dynamic>` porque un campo faltante o mal tipado falla de forma clara y explícita en el punto de deserialización, en vez de propagar un error silencioso que se manifiesta de forma confusa más adelante en el código.

**Código del ejemplo:**

```dart
@JsonSerializable()
class Tarea {
  final String id;
  final String titulo;
  factory Tarea.fromJson(Map<String, dynamic> json) => _$TareaFromJson(json);
}
```

### Tema 3: Interceptores y estados explícitos

**Conceptos clave:** transformación transversal de cada petición, categorías modeladas exhaustivamente.

```dart
dio.interceptors.add(InterceptorsWrapper(
  onRequest: (options, handler) {
    options.headers['Authorization'] = 'Bearer $token';
    handler.next(options);
  },
));
```

Un interceptor de `dio` se ejecuta de forma transversal en cada petición (o respuesta, o error) que pasa por ese cliente HTTP, permitiendo aplicar una transformación común (agregar un header de autenticación, loguear cada petición) sin repetir esa lógica manualmente en cada llamada individual a la API, el mismo principio ya estudiado con interceptores de OkHttp en Android (Módulo 5 de ese track) y de `HttpClient` en Angular (Módulo 7 del track de Angular).

```dart
sealed class EstadoTareas {}
class Cargando extends EstadoTareas {}
class Exito extends EstadoTareas { final List<Tarea> tareas; Exito(this.tareas); }
class Error extends EstadoTareas { final String mensaje; Error(this.mensaje); }
```

Modelar explícitamente los tres estados posibles de una pantalla que depende de datos remotos (cargando, éxito con datos, error con un mensaje) mediante una jerarquía `sealed class` (verificada exhaustivamente por el compilador de Dart en un `switch`, el mismo principio que las sealed classes de Kotlin, Módulo 1 del track de Kotlin Multiplatform, o los enums con valores asociados de Swift, Módulo 0 del track de iOS) obliga a manejar cada caso explícitamente en la UI, evitando el problema de omitir accidentalmente el manejo del estado de error y dejar a la pantalla en un estado indefinido o con un comportamiento silenciosamente incorrecto ante un fallo de red.

**Analogía:** un interceptor de `dio` es como una estación de control por la que pasa obligatoriamente cada paquete de un servicio de logística, aplicando el mismo sello a todos sin que el remitente individual deba solicitarlo en cada envío; modelar estados explícitos con sealed classes es como un formulario con secciones obligatorias claramente marcadas para cada resultado posible de un trámite, garantizando que ninguna posibilidad quede sin una sección correspondiente de manejo.

**¿Por qué es importante?** Los interceptores centralizan transformaciones transversales sin duplicar lógica en cada llamada; modelar estados explícitos con sealed classes, verificados exhaustivamente por el compilador, previene omitir el manejo de algún estado (especialmente el de error) en la UI.

**Código del ejemplo:**

```dart
sealed class EstadoTareas {}
class Cargando extends EstadoTareas {}
class Exito extends EstadoTareas { final List<Tarea> tareas; Exito(this.tareas); }
class Error extends EstadoTareas { final String mensaje; Error(this.mensaje); }
```

---


## Laboratorio práctico

**Objetivo del laboratorio:** construir una app que consume una API real con estados loading/error/success explícitos.

**Requisitos previos:** Módulo 4 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Petición GET con `http` | Ver Tema 1 | Contra una API pública |
| 2 | Repetir con `dio` | Ver Tema 1 | Compara ergonomía |
| 3 | Generar modelos con `json_serializable` | Ver Tema 2 | Deserialización tipada |
| 4 | Modelar los 3 estados explícitamente | Ver Tema 3 | `sealed class` |
| 5 | Agregar un interceptor de autenticación | Ver Tema 3 | Header en cada request |

**Verificación:** el laboratorio se considera exitoso si la UI muestra correctamente cada uno de los tres estados según corresponda, y si el interceptor de autenticación aplica el header correctamente en cada petición verificable con logging.

**Errores comunes y soluciones**

- **Parsear JSON manualmente con `Map<String, dynamic>` sin verificación de tipo.** Prefiere `json_serializable` para detección temprana de campos faltantes o mal tipados.
- **Usar `http` básico para una app que necesita cancelación e interceptores.** Considera `dio` para esas capacidades nativas.
- **Omitir el manejo explícito del estado de error en la UI.** Modélalo con una `sealed class` verificada exhaustivamente por el compilador.

---
