## Pipeline multiplataforma

```yaml
# .github/workflows/ci.yml
jobs:
  test-common:
    steps:
      - run: ./gradlew :shared:allTests   # corre commonTest en ambos targets

  build-android:
    steps:
      - run: ./gradlew :androidApp:assembleDebug

  build-ios:
    runs-on: macos-latest   # builds de iOS requieren un runner macOS
    steps:
      - run: ./gradlew :shared:linkDebugFrameworkIosArm64
```

Validar ambos targets en cada push detecta regresiones de plataforma específica antes de que lleguen a un release — un cambio que rompe solo el build de iOS no debería descubrirse manualmente días después.

## Fastlane

```ruby
# fastlane/Fastfile
lane :beta do
  build_app(scheme: "MiApp")
  upload_to_testflight
end
```

Fastlane automatiza pasos tediosos y propensos a error manual: firma de código, incremento de número de build, subida a TestFlight/Play Console — todo con un solo comando (`fastlane beta`).

## Versionado compartido

Mantener el número de versión sincronizado entre la app Android y la app iOS (típicamente en un archivo de configuración compartido leído por ambos pipelines) evita confusión sobre qué versión del módulo compartido corre cada plataforma.
