# Módulo 5: Networking

## Sílabo

**Objetivo general**

Consumir APIs REST reales con manejo de errores y estados de carga explícitos, comparando el paquete `http` básico con `dio` (con interceptores, cancelación y timeouts configurables), y generando modelos tipados de forma segura con `json_serializable`.

**Objetivos específicos**

1. Hacer una petición GET con el paquete `http`.
2. Repetir el ejercicio con `dio` y comparar la ergonomía.
3. Generar clases de modelo con `json_serializable`.
4. Modelar explícitamente los 3 estados de una pantalla de datos.
5. Agregar un interceptor de autenticación con `dio`.

**Contenido**

- `http` vs `dio`.
- Serialización con `json_serializable`.
- Interceptores (auth, logging).
- Manejo de errores y estados de carga.

**Evaluación**

App que consume una API real con estados loading/error/success explícitos, más tres ejercicios de evaluación.

---

## Contenido teórico

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

## Ejercicios de evaluación

### Ejercicio 1: Ventajas de dio sobre http

**Enunciado:** ¿qué ventajas tiene `dio` sobre el paquete `http` nativo para una app de tamaño real?

**Solución esperada:** `dio` ofrece interceptores, cancelación de peticiones en curso, y timeouts configurables como parte de su API central, capacidades que `http` no ofrece nativamente y que requerirían implementarse manualmente con código adicional propio si se usara solo `http`.

**Criterios de éxito:**
- Menciona al menos dos de: interceptores, cancelación, timeouts configurables como ventajas de `dio`.

### Ejercicio 2: Por qué json_serializable es más seguro

**Enunciado:** ¿por qué generar modelos con `json_serializable` es más seguro que parsear JSON manualmente con `Map<String, dynamic>`?

**Solución esperada:** un campo faltante o mal tipado produce un error claro y explícito al deserializar con el código generado, en vez de fallar silenciosamente (por ejemplo, obteniendo `null` de una clave inexistente sin ningún error visible) hasta que ese valor problemático causa un fallo confuso en un punto distinto y más difícil de rastrear del código.

**Criterios de éxito:**
- Explica correctamente la detección clara y temprana de errores como la ventaja de seguridad.

### Ejercicio 3: Ventaja de modelar estados con sealed class

**Enunciado:** ¿qué ventaja da modelar los estados de una pantalla (cargando, éxito, error) con una `sealed class` en vez de variables booleanas sueltas?

**Solución esperada:** el compilador verifica exhaustivamente que un `switch` sobre esos estados maneje todos los casos posibles, previniendo omitir accidentalmente el manejo de algún estado (especialmente el de error), a diferencia de variables booleanas independientes que podrían combinarse de formas inconsistentes o incompletas sin ninguna verificación estructural.

**Criterios de éxito:**
- Explica correctamente la verificación exhaustiva del compilador como la ventaja de usar `sealed class`.

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

- `dio` ofrece interceptores, cancelación y timeouts configurables nativamente, capacidades que `http` básico no incluye.
- `json_serializable` genera parsing tipado y verificado, detectando campos faltantes o mal tipados con errores claros en vez de fallos silenciosos.
- Los interceptores de `dio` centralizan transformaciones transversales (auth, logging) sin duplicar lógica en cada petición.
- Modelar estados explícitos con `sealed class` previene omitir el manejo de algún estado, especialmente el de error.

**Conceptos aprendidos**

- `http` vs `dio`.
- Serialización con `json_serializable`.
- Interceptores.
- Manejo de errores y estados de carga.

**Próximos pasos**

En el Módulo 6 aprenderás persistencia local: `shared_preferences`, `sqflite`, Hive, y una estrategia offline-first.

**Recursos adicionales**

- Documentación oficial de dio (pub.dev/packages/dio).
