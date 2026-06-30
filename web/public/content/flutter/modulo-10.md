## ThemeData con Material 3

```dart
MaterialApp(
  theme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.blue),
  darkTheme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.blue, brightness: Brightness.dark),
  themeMode: ThemeMode.system, // sigue la preferencia del sistema operativo
)
```

## Adaptación Material vs Cupertino

```dart
import 'dart:io';

Widget botonAdaptativo() => Platform.isIOS
    ? CupertinoButton(child: Text('Continuar'), onPressed: () {})
    : ElevatedButton(child: Text('Continuar'), onPressed: () {});
```

Detectar la plataforma y mostrar el widget nativo correspondiente hace que la app se sienta menos "genérica" y más integrada en cada sistema operativo.

## Accesibilidad con Semantics

```dart
Semantics(
  label: 'Eliminar tarea',
  button: true,
  child: IconButton(icon: Icon(Icons.delete), onPressed: eliminar),
)
```

Sin esto, TalkBack/VoiceOver leen un ícono sin contexto como "botón" genérico, sin indicar qué acción realiza.

## Dark mode

```dart
final esOscuro = Theme.of(context).brightness == Brightness.dark;
```

Probar la app en ambos modos (no asumir que "se ve bien" en uno implica que se ve bien en el otro) revela contrastes de color insuficientes o iconografía invisible.
