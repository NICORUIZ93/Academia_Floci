## Estructura de un proyecto

```
app/
  src/main/
    java/com/miapp/      ← código Kotlin
    res/
      values/strings.xml  ← textos externalizados
      drawable/             ← imágenes/iconos
    AndroidManifest.xml    ← declara componentes, permisos, ícono
  build.gradle.kts          ← dependencias y configuración del módulo
```

## Recursos en vez de hardcodear

```xml
<!-- res/values/strings.xml -->
<string name="titulo_bienvenida">Bienvenido</string>
```

```kotlin
Text(text = stringResource(R.string.titulo_bienvenida))
```

Externalizar strings permite traducir la app a otros idiomas sin tocar el código, y centraliza textos repetidos.

## AndroidManifest.xml

```xml
<application android:icon="@mipmap/ic_launcher" android:label="@string/app_name">
    <activity android:name=".MainActivity" android:exported="true">
        <intent-filter>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
        </intent-filter>
    </activity>
</application>
```

El sistema operativo lee el manifiesto antes de instalar la app para saber qué componentes, permisos y puntos de entrada declara.

## Módulos Gradle

```kotlin
// app/build.gradle.kts
dependencies {
    implementation(project(":core"))
}
```
