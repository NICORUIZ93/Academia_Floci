## Build de release Android

```bash
flutter build appbundle --release
```

Genera el `.aab` para subir a Play Console, igual que en el track Android nativo.

## Build de release iOS

```bash
flutter build ipa --release
```

Requiere macOS con Xcode instalado y los certificados/provisioning profiles configurados, igual que en el track iOS nativo.

## Iconos y splash screen

```yaml
# pubspec.yaml
flutter_launcher_icons:
  image_path: "assets/icon.png"
flutter_native_splash:
  image: "assets/splash.png"
```

```bash
dart run flutter_launcher_icons
dart run flutter_native_splash:create
```

## CI/CD con Codemagic o Fastlane

```yaml
# codemagic.yaml
workflows:
  android-release:
    scripts:
      - flutter build appbundle --release
    artifacts:
      - build/**/outputs/**/*.aab
```

Una sola base de código Flutter, pero el pipeline igual necesita pasos SEPARADOS para Android e iOS (firma, builds, distribución) — la unificación de Flutter es a nivel de código de la app, no de las herramientas de publicación de cada tienda.
