## Firma de la app

```kotlin
android {
    signingConfigs {
        create("release") {
            storeFile = file("keystore.jks")
            storePassword = System.getenv("KEYSTORE_PASSWORD")
            keyAlias = "mi-app"
            keyPassword = System.getenv("KEY_PASSWORD")
        }
    }
}
```

## App Bundle vs APK

```bash
./gradlew bundleRelease   # genera app-release.aab
```

Google Play requiere un **App Bundle** (`.aab`) en vez de un APK universal: Play genera APKs optimizados por dispositivo (arquitectura de CPU, idioma, densidad de pantalla) a partir del bundle, reduciendo el tamaño de descarga para cada usuario.

## Tracks de Play Console

```
Pruebas internas → Pruebas cerradas → Pruebas abiertas → Producción
```

Cada track permite validar la app con un grupo cada vez más amplio de usuarios antes del lanzamiento completo.

## Versionado

```kotlin
android {
    defaultConfig {
        versionCode = 12        // entero, SIEMPRE incremental, lo usa Play internamente
        versionName = "1.3.0"   // string visible al usuario, semver
    }
}
```

## Políticas relevantes

Revisa especialmente las políticas sobre permisos sensibles (ubicación, contactos), privacidad de datos (Data Safety section) y contenido apropiado — Play Console rechaza o suspende apps que las violan.
