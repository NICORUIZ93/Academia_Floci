## MethodChannel: Dart habla con código nativo

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

## Plugins federados

Un plugin federado separa la interfaz Dart de las implementaciones por plataforma (Android, iOS, web) en paquetes distintos — permite que la comunidad implemente soporte para una plataforma nueva sin tocar el paquete principal.

## Permisos

```dart
final estado = await Permission.camera.request();
if (estado.isGranted) { abrirCamara(); } else { mostrarMensajePermisoDenegado(); }
```

## Cuándo escribir un platform channel propio

Solo cuando el plugin que necesitas NO existe en pub.dev, o necesitas una integración muy específica de bajo nivel que ningún plugin genérico cubre — buscar primero un plugin existente ahorra mantener código nativo duplicado por plataforma.
