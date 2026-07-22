# Módulo 7: Integración con plataformas nativas


## Aprende construyendo

### Tema 1: MethodChannel

#### Paso 1 · Objetivo y preparación
Al finalizar podrás implementar este tema Flutter desde cero. Prerrequisitos: Flutter SDK, Dart y editor. Verifica flutter doctor.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, la aplicación debe guardar datos, usar capacidades del dispositivo y mantener una interfaz fluida aun con conectividad o recursos limitados.

#### Paso 3 · Teoría, modelo mental y analogía
La solución separa almacenamiento, plataforma y renderizado; cada integración necesita contrato, permisos, cancelación y medición. La analogía es una estación móvil con inventario, herramientas y límites de capacidad.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-flutter-practica
cd ejemplo-flutter-practica
flutter create app
cd app
flutter pub get
flutter run
```
Crea lib/features/example/ con la implementación específica del tema y conecta una pantalla mínima; documenta cada archivo y salida.

#### Paso 5 · Práctica guiada
Pista: desactiva deliberadamente una capacidad, permiso o recurso para provocar un fallo deliberado; lee el diagnóstico y corrígelo. Resultado esperado: comportamiento visible, controlado y reproducible.

#### Paso 6 · Práctica independiente
Añade loading/empty/error, una prueba de widget, medición de rendimiento y una alternativa documentada para otra plataforma.

#### Paso 7 · Cierre y evidencia
Guarda estructura, comandos, captura, logs y test; como siguiente paso integra el resultado con la arquitectura de datos. Errores comunes: permisos implícitos, almacenamiento sin migración, plugin sin fallback y medir solo en debug. Fuentes oficiales: https://docs.flutter.dev/ y https://api.flutter.dev/.
**¿Por qué es importante?** Porque las capacidades móviles deben funcionar bajo fallos reales y límites del dispositivo.
**Evidencia de aprendizaje:** entrega código, ejecución, fallo, corrección, prueba y medición.
**Conceptos clave:** puente de comunicación bidireccional entre Dart y el código nativo de cada plataforma.

```dart
// Dart
const canal = MethodChannel('com.miapp/sistema');
final version = await canal.invokeMethod<String>('obtenerVersionSO');
```

```kotlin
// Android (Kotlin)
MethodChannel(flutterEngine.dartExecutor.binaryMessenger, "com.miapp/sistema")
    .setMethodCallHandler { call, result ->
        if (call.method == "obtenerVersionSO") result.success(Build.VERSION.RELEASE)
    }
```

```swift
// iOS (Swift)
let canal = FlutterMethodChannel(name: "com.miapp/sistema", binaryMessenger: controller.binaryMessenger)
canal.setMethodCallHandler { call, result in
    if call.method == "obtenerVersionSO" { result(UIDevice.current.systemVersion) }
}
```

Un `MethodChannel` establece un canal de comunicación bidireccional identificado por un nombre único de string (`"com.miapp/sistema"`) entre el código Dart y el código nativo de cada plataforma: `invokeMethod` desde Dart envía una invocación asíncrona hacia el lado nativo correspondiente, y el `setMethodCallHandler` en Kotlin (Android) o Swift (iOS) recibe esa invocación, ejecuta la lógica nativa necesaria (aquí, leer la versión del sistema operativo mediante APIs específicas de cada plataforma) y devuelve el resultado de vuelta hacia Dart de forma asíncrona.

Este mecanismo es necesario específicamente porque Dart, aunque compila a código nativo en ambas plataformas, no tiene acceso directo a las APIs específicas de cada sistema operativo (las APIs de Android están escritas en Kotlin/Java, las de iOS en Swift/Objective-C); el `MethodChannel` es el puente explícito que permite que la lógica de la app, mayoritariamente escrita en Dart, invoque esas capacidades nativas específicas de plataforma cuando sea necesario, requiriendo implementar el lado receptor por separado en cada plataforma (Kotlin para Android, Swift para iOS), dado que cada una expone sus propias APIs de sistema con su propio lenguaje nativo.

**Analogía:** un `MethodChannel` es como un servicio de traducción e intermediación entre dos oficinas que hablan idiomas distintos (Dart y el código nativo de cada plataforma): una solicitud se traduce y transmite hacia la oficina correspondiente, se procesa allí con las herramientas específicas disponibles en esa oficina, y la respuesta se traduce de vuelta hacia el idioma original del solicitante.

**¿Por qué es importante?** El `MethodChannel` es el puente explícito necesario porque Dart no tiene acceso directo a las APIs nativas específicas de cada sistema operativo, requiriendo implementar el lado receptor por separado en Kotlin (Android) y Swift (iOS), cada uno con sus propias APIs de sistema.

**Diagrama:**

```
Dart: invokeMethod('obtenerVersionSO')
   ↓
Kotlin (Android) / Swift (iOS): setMethodCallHandler procesa y responde
   ↓
Dart: recibe el resultado de vuelta
```

### Tema 2: Plugins federados

#### Paso 1 · Objetivo y preparación
Al finalizar podrás implementar este tema Flutter desde cero. Prerrequisitos: Flutter SDK, Dart y editor. Verifica flutter doctor.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, la aplicación debe guardar datos, usar capacidades del dispositivo y mantener una interfaz fluida aun con conectividad o recursos limitados.

#### Paso 3 · Teoría, modelo mental y analogía
La solución separa almacenamiento, plataforma y renderizado; cada integración necesita contrato, permisos, cancelación y medición. La analogía es una estación móvil con inventario, herramientas y límites de capacidad.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-flutter-practica
cd ejemplo-flutter-practica
flutter create app
cd app
flutter pub get
flutter run
```
Crea lib/features/example/ con la implementación específica del tema y conecta una pantalla mínima; documenta cada archivo y salida.

#### Paso 5 · Práctica guiada
Pista: desactiva deliberadamente una capacidad, permiso o recurso para provocar un fallo deliberado; lee el diagnóstico y corrígelo. Resultado esperado: comportamiento visible, controlado y reproducible.

#### Paso 6 · Práctica independiente
Añade loading/empty/error, una prueba de widget, medición de rendimiento y una alternativa documentada para otra plataforma.

#### Paso 7 · Cierre y evidencia
Guarda estructura, comandos, captura, logs y test; como siguiente paso integra el resultado con la arquitectura de datos. Errores comunes: permisos implícitos, almacenamiento sin migración, plugin sin fallback y medir solo en debug. Fuentes oficiales: https://docs.flutter.dev/ y https://api.flutter.dev/.
**¿Por qué es importante?** Porque las capacidades móviles deben funcionar bajo fallos reales y límites del dispositivo.
**Evidencia de aprendizaje:** entrega código, ejecución, fallo, corrección, prueba y medición.
**Conceptos clave:** separación de la interfaz Dart de las implementaciones específicas por plataforma.

Un plugin federado separa formalmente la interfaz Dart pública (el conjunto de métodos y tipos que el desarrollador Flutter consume, independiente de la plataforma) de las implementaciones concretas específicas de cada plataforma (Android, iOS, web, cada una en su propio paquete separado que implementa esa misma interfaz), permitiendo que la comunidad agregue soporte para una plataforma nueva (por ejemplo, una implementación para Linux o Windows) sin necesidad de modificar el paquete principal ni las implementaciones ya existentes de otras plataformas, dado que cada implementación específica de plataforma vive de forma completamente independiente y aislada de las demás.

Esta arquitectura de plugin federado es especialmente valiosa para el ecosistema de paquetes de terceros de Flutter, donde un mismo plugin popular (por ejemplo, uno de geolocalización o de cámara) necesita mantener implementaciones nativas correctas y actualizadas para múltiples plataformas simultáneamente: separar esas implementaciones en paquetes independientes permite que distintos mantenedores, potencialmente sin ninguna relación directa entre sí, contribuyan y actualicen cada implementación de plataforma de forma independiente sin coordinar cambios en un único paquete monolítico compartido.

**Analogía:** un plugin federado es como un estándar de enchufe eléctrico universal definido de forma independiente de la implementación local específica de cada país (voltaje, forma física del conector): el estándar general permite que cualquier fabricante local implemente su propia versión conforme a las especificidades de su región, sin necesidad de coordinar cambios con los fabricantes de otras regiones.

**¿Por qué es importante?** Un plugin federado permite agregar soporte para una plataforma nueva sin modificar el paquete principal ni las implementaciones existentes de otras plataformas, facilitando que la comunidad contribuya implementaciones específicas de forma independiente y descentralizada.

**Diagrama:**

```
Paquete principal (interfaz Dart)
   ├── Implementación Android (paquete separado)
   ├── Implementación iOS (paquete separado)
   └── Implementación web (paquete separado, agregable sin tocar los demás)
```

### Tema 3: Permisos de plataforma y cuándo escribir un platform channel propio

#### Paso 1 · Objetivo y preparación
Al finalizar podrás implementar este tema Flutter desde cero. Prerrequisitos: Flutter SDK, Dart y editor. Verifica flutter doctor.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, la aplicación debe guardar datos, usar capacidades del dispositivo y mantener una interfaz fluida aun con conectividad o recursos limitados.

#### Paso 3 · Teoría, modelo mental y analogía
La solución separa almacenamiento, plataforma y renderizado; cada integración necesita contrato, permisos, cancelación y medición. La analogía es una estación móvil con inventario, herramientas y límites de capacidad.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-flutter-practica
cd ejemplo-flutter-practica
flutter create app
cd app
flutter pub get
flutter run
```
Crea lib/features/example/ con la implementación específica del tema y conecta una pantalla mínima; documenta cada archivo y salida.

#### Paso 5 · Práctica guiada
Pista: desactiva deliberadamente una capacidad, permiso o recurso para provocar un fallo deliberado; lee el diagnóstico y corrígelo. Resultado esperado: comportamiento visible, controlado y reproducible.

#### Paso 6 · Práctica independiente
Añade loading/empty/error, una prueba de widget, medición de rendimiento y una alternativa documentada para otra plataforma.

#### Paso 7 · Cierre y evidencia
Guarda estructura, comandos, captura, logs y test; como siguiente paso integra el resultado con la arquitectura de datos. Errores comunes: permisos implícitos, almacenamiento sin migración, plugin sin fallback y medir solo en debug. Fuentes oficiales: https://docs.flutter.dev/ y https://api.flutter.dev/.
**¿Por qué es importante?** Porque las capacidades móviles deben funcionar bajo fallos reales y límites del dispositivo.
**Evidencia de aprendizaje:** entrega código, ejecución, fallo, corrección, prueba y medición.
**Conceptos clave:** manejo explícito del rechazo, búsqueda de un plugin existente antes de construir uno propio.

```dart
final estado = await Permission.camera.request();
if (estado.isGranted) { abrirCamara(); } else { mostrarMensajePermisoDenegado(); }
```

Solicitar un permiso de plataforma sensible (cámara, ubicación, contactos) requiere manejar explícitamente ambos resultados posibles: concedido (proceder con la funcionalidad que depende de ese permiso) y denegado (mostrar un mensaje apropiado explicando por qué la funcionalidad no está disponible, en vez de simplemente fallar silenciosamente o crashear al intentar usar una capacidad sin el permiso correspondiente); este es el mismo patrón de manejo de permisos estudiado en Android nativo (Módulo 2 de ese track) e iOS nativo, expuesto aquí a través de un plugin de Flutter que internamente usa `MethodChannel` para comunicarse con las APIs nativas de permisos de cada plataforma.

Escribir un platform channel propio solo se justifica cuando el plugin necesario no existe ya publicado en pub.dev (el repositorio central de paquetes Dart/Flutter), o cuando se requiere una integración muy específica de bajo nivel que ningún plugin genérico existente cubre adecuadamente para el caso de uso concreto de la app; buscar primero un plugin ya existente y mantenido por la comunidad ahorra el esfuerzo considerable de escribir y mantener código nativo duplicado por plataforma (Kotlin para Android, Swift para iOS) que un plugin ya publicado probablemente ya resolvió correctamente, incluyendo el manejo de casos límite que un platform channel propio recién escrito podría no haber considerado todavía.

**Analogía:** manejar explícitamente el rechazo de un permiso es como preparar de antemano una respuesta cortés para cuando alguien decline una solicitud, en vez de quedarse sin ningún plan de contingencia si la respuesta no es la esperada; escribir un platform channel propio antes de buscar un plugin existente es como construir una herramienta especializada desde cero sin verificar primero si ya existe una herramienta comercial probada que resuelve exactamente la misma necesidad.

**¿Por qué es importante?** Manejar explícitamente el caso de permiso denegado evita fallos silenciosos o crashes; escribir un platform channel propio solo se justifica cuando no existe ya un plugin publicado, dado que reescribir esa integración manualmente duplica esfuerzo que probablemente ya está resuelto y mantenido por la comunidad.

### Tema 4: Cámara, galería y carga multipart de una evidencia

#### Paso 1 · Objetivo y preparación
Al finalizar podrás implementar este tema Flutter desde cero. Prerrequisitos: Flutter SDK, Dart y editor. Verifica flutter doctor.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, la aplicación debe guardar datos, usar capacidades del dispositivo y mantener una interfaz fluida aun con conectividad o recursos limitados.

#### Paso 3 · Teoría, modelo mental y analogía
La solución separa almacenamiento, plataforma y renderizado; cada integración necesita contrato, permisos, cancelación y medición. La analogía es una estación móvil con inventario, herramientas y límites de capacidad.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-flutter-practica
cd ejemplo-flutter-practica
flutter create app
cd app
flutter pub get
flutter run
```
Crea lib/features/example/ con la implementación específica del tema y conecta una pantalla mínima; documenta cada archivo y salida.

#### Paso 5 · Práctica guiada
Pista: desactiva deliberadamente una capacidad, permiso o recurso para provocar un fallo deliberado; lee el diagnóstico y corrígelo. Resultado esperado: comportamiento visible, controlado y reproducible.

#### Paso 6 · Práctica independiente
Añade loading/empty/error, una prueba de widget, medición de rendimiento y una alternativa documentada para otra plataforma.

#### Paso 7 · Cierre y evidencia
Guarda estructura, comandos, captura, logs y test; como siguiente paso integra el resultado con la arquitectura de datos. Errores comunes: permisos implícitos, almacenamiento sin migración, plugin sin fallback y medir solo en debug. Fuentes oficiales: https://docs.flutter.dev/ y https://api.flutter.dev/.
**¿Por qué es importante?** Porque las capacidades móviles deben funcionar bajo fallos reales y límites del dispositivo.
**Evidencia de aprendizaje:** entrega código, ejecución, fallo, corrección, prueba y medición.
**Conceptos clave:** `XFile`, permiso contextual, validación local, puerto de dominio, `FormData`, progreso, idempotencia y archivo temporal.

En RutaFlow construiremos la evidencia de entrega: el conductor toma una fotografía o elige una imagen, ve una previsualización y confirma antes de subirla. Capturar, validar y transferir son responsabilidades distintas. La pantalla no debe conocer cabeceras HTTP ni construir `FormData`; pide una imagen a un adaptador de dispositivo y entrega una evidencia válida a un repositorio.

**Requisitos previos:** una app creada con `flutter create rutaflow_driver`, el Módulo 5 para Dio y un emulador o dispositivo. Desde la raíz ejecuta:

```bash
flutter pub add image_picker dio mime http_parser
```

Agrega las descripciones de uso en `ios/Runner/Info.plist` (`NSCameraUsageDescription` y `NSPhotoLibraryUsageDescription`). En Android verifica la configuración exigida por la versión actual del plugin y prueba el flujo de recuperación cuando el sistema destruye la actividad por falta de memoria; no copies permisos antiguos sin revisar la plataforma objetivo.

```text
lib/features/delivery_proof/
├── domain/delivery_proof.dart
├── domain/delivery_proof_repository.dart
├── application/attach_delivery_proof.dart
├── infrastructure/image_picker_proof_source.dart
├── infrastructure/dio_delivery_proof_repository.dart
└── presentation/delivery_proof_page.dart
```

Primero representa la entrada válida en `lib/features/delivery_proof/domain/delivery_proof.dart`. El dominio no depende de `XFile`, widgets ni Dio:

```dart
import 'dart:typed_data';

final class DeliveryProof {
  DeliveryProof({required this.bytes, required this.fileName, required this.mimeType}) {
    if (bytes.isEmpty) throw ArgumentError('La imagen está vacía');
    if (bytes.lengthInBytes > 5 * 1024 * 1024) {
      throw ArgumentError('La imagen supera 5 MB');
    }
    if (!{'image/jpeg', 'image/png'}.contains(mimeType)) {
      throw ArgumentError('Formato no permitido: $mimeType');
    }
  }

  final Uint8List bytes;
  final String fileName;
  final String mimeType;
}
```

El adaptador `image_picker_proof_source.dart` convierte el resultado del plugin en un tipo propio. `pickImage` puede devolver `null`: cancelar el selector no es un error.

```dart
import 'package:image_picker/image_picker.dart';
import 'package:mime/mime.dart';

final class ImagePickerProofSource {
  ImagePickerProofSource(this._picker);
  final ImagePicker _picker;

  Future<DeliveryProof?> capture() async {
    final file = await _picker.pickImage(
      source: ImageSource.camera,
      imageQuality: 82,
      maxWidth: 1920,
    );
    if (file == null) return null;
    final bytes = await file.readAsBytes();
    return DeliveryProof(
      bytes: bytes,
      fileName: file.name,
      mimeType: lookupMimeType(file.name, headerBytes: bytes) ?? '',
    );
  }
}
```

Define en `delivery_proof_repository.dart` el contrato que necesita el caso de uso:

```dart
abstract interface class DeliveryProofRepository {
  Future<Uri> upload({
    required String deliveryId,
    required DeliveryProof proof,
    required String idempotencyKey,
    required void Function(double progress) onProgress,
  });
}
```

La implementación `dio_delivery_proof_repository.dart` traduce el contrato de dominio a HTTP. Envía un identificador de idempotencia para que reintentar después de perder la conexión no cree dos evidencias:

```dart
import 'package:dio/dio.dart';
import 'package:http_parser/http_parser.dart';

final class DioDeliveryProofRepository implements DeliveryProofRepository {
  DioDeliveryProofRepository(this._dio);
  final Dio _dio;

  @override
  Future<Uri> upload({
    required String deliveryId,
    required DeliveryProof proof,
    required String idempotencyKey,
    required void Function(double) onProgress,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/deliveries/$deliveryId/proof',
      data: FormData.fromMap({
        'file': MultipartFile.fromBytes(
          proof.bytes,
          filename: proof.fileName,
          contentType: MediaType.parse(proof.mimeType),
        ),
      }),
      options: Options(headers: {'Idempotency-Key': idempotencyKey}),
      onSendProgress: (sent, total) => onProgress(total == 0 ? 0 : sent / total),
    );
    return Uri.parse(response.data!['url'] as String);
  }
}
```

```mermaid
sequenceDiagram
  actor C as Conductor
  participant UI as DeliveryProofPage
  participant P as ImagePicker
  participant D as DeliveryProof
  participant API as API de entregas
  C->>UI: tomar fotografía
  UI->>P: pickImage(camera)
  P-->>UI: XFile o cancelación
  UI->>D: validar bytes, tamaño y MIME
  UI->>API: multipart + Idempotency-Key
  API-->>UI: 201 + URL de evidencia
  UI-->>C: confirmación y miniatura
```

**Analogía:** la cámara obtiene el paquete, el dominio inspecciona peso y tipo, y el repositorio es la empresa transportadora. La pantalla coordina el envío, pero no necesita conocer cómo se construye el vehículo HTTP.

**¿Por qué es importante?** Una foto visible en pantalla todavía no es una evidencia persistida. Separar selección, validación y carga permite probar reglas sin cámara real, mostrar progreso, reintentar con seguridad y reemplazar Dio sin modificar el dominio.

**Resultado esperado:** al confirmar aparece progreso de 0 a 100 %, el servidor responde `201` con una URL y la interfaz cambia a «Evidencia guardada». Cancelar vuelve a la pantalla sin error; un PNG/JPEG mayor de 5 MB se rechaza antes de consumir red.

**Fallo deliberado:** activa modo avión cuando la carga llegue aproximadamente al 50 %. La interfaz debe conservar la fotografía para reintento, mostrar un error recuperable y reutilizar la misma clave de idempotencia. No marques la entrega como completada hasta recibir la confirmación del servidor.

**Modificación sin copiar:** agrega selección desde galería y compresión en un isolate. Decide mediante una prueba qué componente cambia y demuestra que `DeliveryProof` sigue sin importar paquetes de Flutter.

---


## Laboratorio práctico

**Objetivo del laboratorio:** construir un platform channel propio que invoca una API nativa simple desde Dart.

**Requisitos previos:** Módulo 6 completado, entorno con Android Studio y Xcode configurados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Crear un `MethodChannel` simple en Dart | Ver Tema 1 | Ej. obtener la versión del SO |
| 2 | Implementar el lado Android (Kotlin) | Ver Tema 1 | Responde a la invocación |
| 3 | Implementar el lado iOS (Swift) | Ver Tema 1 | Mismo `MethodChannel` |
| 4 | Solicitar un permiso de plataforma | Ver Tema 3 | Maneja el rechazo del usuario |
| 5 | Capturar y subir una evidencia | Ver Tema 4 | Valida, previsualiza y muestra progreso multipart |
| 6 | Cortar la red durante la carga | Ver Tema 4 | Conserva la evidencia y reintenta con idempotencia |

**Verificación:** el laboratorio se considera exitoso si el `MethodChannel` invoca correctamente el código nativo en ambas plataformas (Android e iOS) y devuelve el resultado esperado a Dart, y si el flujo de permisos maneja correctamente tanto la concesión como el rechazo.

**Errores comunes y soluciones**

- **Escribir un platform channel propio sin buscar primero un plugin existente en pub.dev.** Ahorra esfuerzo verificando primero si ya existe una solución mantenida por la comunidad.
- **Olvidar implementar el lado nativo en alguna de las dos plataformas.** El `MethodChannel` requiere implementación explícita en ambos lados (Kotlin e Swift) para funcionar en ambas plataformas.
- **No manejar el caso de permiso denegado.** Muestra un mensaje apropiado en vez de fallar silenciosamente o crashear.
- **Marcar la entrega completa cuando solo existe una foto local.** Espera la confirmación del backend y conserva un estado pendiente recuperable.
- **Confiar únicamente en la extensión del archivo.** Valida tipo, firma, tamaño y autorización también en el servidor.

---
