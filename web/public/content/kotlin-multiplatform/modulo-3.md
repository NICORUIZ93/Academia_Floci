## Source sets

```
shared/src/
  commonMain/   ← código compartido por TODAS las plataformas
  androidMain/   ← código específico de Android
  iosMain/        ← código específico de iOS
```

## expect/actual

```kotlin
// commonMain
expect fun nombrePlataforma(): String

// androidMain
actual fun nombrePlataforma(): String = "Android ${android.os.Build.VERSION.SDK_INT}"

// iosMain
actual fun nombrePlataforma(): String = UIDevice.currentDevice.systemName()
```

`commonMain` declara QUÉ necesita sin saber CÓMO se resuelve en cada plataforma — cada plataforma provee su propia implementación `actual`.

## build.gradle.kts multiplataforma

```kotlin
kotlin {
    androidTarget()
    iosX64(); iosArm64(); iosSimulatorArm64()

    sourceSets {
        commonMain.dependencies {
            implementation("io.ktor:ktor-client-core:2.3.0")
        }
    }
}
```

## Targets disponibles

KMP no se limita a Android/iOS: también compila a JVM (backend), JS/Wasm (web) y Native para Linux/Windows/macOS — la misma lógica de negocio puede, en teoría, alimentar un backend, una web y dos apps móviles.
