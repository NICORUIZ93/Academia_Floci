# Módulo 0: Kotlin aplicado a Android

## Sílabo

**Objetivo general**

Arrancar un proyecto Android moderno y entender su estructura (módulos Gradle, manifiesto, recursos) antes de escribir cualquier línea de UI, estableciendo las bases sobre las que se construirán los 12 módulos siguientes.

**Objetivos específicos**

1. Crear un proyecto Android Studio y ejecutarlo en un emulador.
2. Recorrer la estructura generada: código fuente, manifiesto, recursos.
3. Externalizar un texto a `strings.xml` y consumirlo desde un composable.
4. Modificar el `AndroidManifest.xml` (ícono, nombre visible).
5. Agregar un módulo Gradle nuevo y establecer una dependencia entre módulos.

**Contenido**

- Estructura de un proyecto Android Studio.
- Gradle y módulos de app.
- `AndroidManifest.xml`.
- Recursos (strings, dimens, drawables).

**Evaluación**

Proyecto Android nuevo corriendo en un emulador con un recurso propio, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Estructura de un proyecto Android Studio

**Conceptos clave:** separación entre código, recursos y configuración de build.

Un proyecto Android Studio organiza el código Kotlin bajo `app/src/main/java/com/miapp/`, los recursos (textos, imágenes, dimensiones, colores) bajo `app/src/main/res/`, y la configuración de build bajo archivos `build.gradle.kts` en cada nivel (proyecto raíz y cada módulo). Esta separación no es arbitraria: el sistema de recursos de Android (`res/`) permite que el mismo código fuente seleccione automáticamente el recurso correcto según el idioma del dispositivo, el tamaño de pantalla, o el modo claro/oscuro, sin que el código Kotlin necesite ninguna lógica condicional explícita para eso, algo que sería mucho más difícil de mantener si los textos e imágenes estuvieran hardcodeados directamente dentro del código.

El archivo `build.gradle.kts` de cada módulo declara sus dependencias (librerías externas, otros módulos del mismo proyecto) y su configuración de compilación (versión mínima de Android soportada, versión de Kotlin, plugins aplicados). Gradle lee estos archivos y construye un grafo de dependencias completo antes de compilar, determinando en qué orden deben compilarse los módulos y qué código está disponible para cada uno, de forma conceptualmente similar a cómo Maven o Gradle organizan un proyecto Java multi-módulo (estudiado en profundidad en el Módulo 9 del track de Java).

**Analogía:** la estructura de un proyecto Android es como los planos de un edificio: una carpeta para la estructura (código), otra para el mobiliario y la decoración (recursos), y un documento de especificaciones (Gradle) que define qué materiales usar y de dónde vienen, todo separado para que un electricista no tenga que revisar los planos de plomería para hacer su trabajo.

**¿Por qué es importante?** Entender esta estructura desde el primer módulo evita la confusión común de "dónde va cada cosa" que ralentiza a cualquier desarrollador nuevo en Android, y prepara el terreno para conceptos posteriores (recursos localizados, módulos Gradle separados por feature) que dependen directamente de esta organización.

**Diagrama:**

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

### Tema 2: Recursos externalizados

**Conceptos clave:** una fuente de verdad por texto/valor, selección automática según configuración del dispositivo.

```xml
<!-- res/values/strings.xml -->
<string name="titulo_bienvenida">Bienvenido</string>
```

```kotlin
Text(text = stringResource(R.string.titulo_bienvenida))
```

Externalizar un string a `res/values/strings.xml` en vez de escribirlo directamente como literal dentro del composable Kotlin (`Text("Bienvenido")`) tiene dos beneficios concretos que se vuelven cada vez más valiosos a medida que la app crece: primero, permite traducir la app completa a otro idioma agregando un archivo `res/values-es/strings.xml` o `res/values-fr/strings.xml` sin tocar absolutamente ninguna línea del código Kotlin existente, dado que Android selecciona automáticamente el archivo de recursos correcto según el idioma configurado en el dispositivo del usuario; segundo, centraliza cada texto en una única fuente de verdad, de modo que corregir un error tipográfico o cambiar el copy de un texto que aparece en múltiples pantallas requiere modificar una sola línea en vez de buscar y reemplazar ese texto duplicado en cada composable donde aparece.

Este mismo mecanismo de "resolución automática según configuración" se extiende más allá de idiomas: `res/values-night/` provee valores específicos para modo oscuro, y calificadores de densidad de pantalla (`drawable-hdpi/`, `drawable-xhdpi/`) permiten proveer versiones de una misma imagen optimizadas para distintas resoluciones de pantalla, todo resuelto automáticamente por el sistema en tiempo de ejecución sin lógica condicional explícita en el código de la app.

**Analogía:** externalizar strings es como tener un único directorio telefónico central en vez de que cada empleado memorice individualmente los números que necesita: actualizar un número (corregir un texto) se hace en un solo lugar, y cualquiera que consulte el directorio (cualquier pantalla que use ese string) obtiene automáticamente el valor correcto y actualizado.

**¿Por qué es importante?** Externalizar recursos evita duplicación de texto, habilita traducción sin tocar código Kotlin, y permite que Android resuelva automáticamente variantes (idioma, modo oscuro, densidad de pantalla) según la configuración del dispositivo del usuario.

**Diagrama:**

```xml
<!-- res/values/strings.xml -->
<string name="titulo_bienvenida">Bienvenido</string>
```

```kotlin
Text(text = stringResource(R.string.titulo_bienvenida))
```

### Tema 3: AndroidManifest.xml y módulos Gradle

**Conceptos clave:** contrato entre la app y el sistema operativo, declarado antes de instalar.

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

El `AndroidManifest.xml` es leído por el sistema operativo antes de instalar la app, y declara todo lo que Android necesita saber de antemano: qué componentes existen (Activities, Services, BroadcastReceivers), cuál es el punto de entrada de la app (el `intent-filter` con `MAIN`/`LAUNCHER` que aparece en el launcher del dispositivo), qué permisos requiere la app (acceso a cámara, ubicación, internet), y metadatos como el ícono y el nombre visible. Esta declaración anticipada permite que el sistema operativo tome decisiones de seguridad y de recursos (por ejemplo, pedir permiso explícito al usuario) sin necesidad de ejecutar código de la app primero.

Un proyecto Gradle multi-módulo divide la aplicación en unidades de compilación independientes (`:app`, `:core`, `:feature-tareas`), cada una con su propio `build.gradle.kts` declarando sus propias dependencias. Un módulo `:app/build.gradle.kts` que declare `implementation(project(":core"))` establece que el módulo `:app` depende del módulo `:core`, permitiendo que Gradle compile `:core` primero y lo ponga a disposición de `:app`; esta separación en módulos, aunque opcional en un proyecto pequeño, se vuelve valiosa en proyectos grandes al forzar límites explícitos entre partes de la app y permitir compilaciones incrementales más rápidas (solo recompilar el módulo que cambió, no el proyecto entero).

**Analogía:** el AndroidManifest.xml es como el formulario de aduana que se completa antes de que un envío cruce la frontera: declara de antemano qué contiene el paquete (componentes), qué permisos especiales necesita (permisos sensibles), y cómo identificarlo (ícono, nombre), permitiendo que la aduana (el sistema operativo) tome decisiones antes de que el contenido real llegue a su destino.

**¿Por qué es importante?** El manifiesto es el contrato que el sistema operativo lee antes de instalar o ejecutar la app; los módulos Gradle establecen límites explícitos de compilación que se vuelven cada vez más valiosos a medida que el proyecto crece.

**Diagrama:**

```kotlin
// app/build.gradle.kts
dependencies {
    implementation(project(":core"))
}
```

---

## Laboratorio práctico

**Objetivo del laboratorio:** crear un proyecto Android nuevo corriendo en un emulador con un recurso propio.

**Requisitos previos:** Android Studio instalado, un emulador configurado.

| Paso | Acción | Código/Comando | Explicación |
|---|---|---|---|
| 1 | Crear un proyecto nuevo con plantilla "Empty Activity" | Android Studio → New Project | Base mínima funcional |
| 2 | Ejecutar en un emulador | Run ▶ | Verifica que el entorno funciona |
| 3 | Agregar un string y usarlo desde un composable | Ver Tema 2 | En vez de hardcodear texto |
| 4 | Modificar ícono y nombre en el manifiesto | Ver Tema 3 | `android:icon`, `android:label` |
| 5 | Agregar un módulo Gradle nuevo y una dependencia | Ver Tema 3 | `:core` dependido por `:app` |

**Verificación:** el laboratorio se considera exitoso si la app corre en el emulador mostrando un texto leído desde `strings.xml` (no hardcodeado), y si el proyecto compila correctamente con el módulo `:core` agregado y referenciado desde `:app`.

**Errores comunes y soluciones**

- **Hardcodear texto directamente en el composable.** Externalízalo a `strings.xml` desde el principio, incluso en un proyecto pequeño.
- **Olvidar sincronizar Gradle tras agregar un módulo nuevo.** Ejecuta "Sync Project with Gradle Files" tras cualquier cambio en `build.gradle.kts`.
- **No declarar el `intent-filter` de `MAIN`/`LAUNCHER`.** Sin él, la Activity no aparece como punto de entrada en el launcher del dispositivo.

---

## Ejercicios de evaluación

### Ejercicio 1: Por qué externalizar strings

**Enunciado:** ¿por qué externalizar strings a un archivo de recursos en vez de hardcodearlos en el código?

**Solución esperada:** externalizar strings centraliza cada texto en una única fuente de verdad (facilitando correcciones), y permite traducir la app agregando archivos de recursos por idioma sin tocar el código Kotlin, dado que Android resuelve automáticamente el archivo correcto según la configuración del dispositivo.

**Criterios de éxito:**
- Menciona correctamente centralización y/o traducción sin tocar código como razones.

### Ejercicio 2: Qué declara el manifiesto

**Enunciado:** ¿qué declara el `AndroidManifest.xml` que el sistema operativo necesita saber antes de instalar la app?

**Solución esperada:** declara los componentes de la app (Activities, Services, BroadcastReceivers), el punto de entrada (intent-filter de MAIN/LAUNCHER), los permisos requeridos, y metadatos como ícono y nombre, todo leído por el sistema antes de instalar o ejecutar la app.

**Criterios de éxito:**
- Menciona al menos dos de: componentes, permisos, punto de entrada, metadatos.

### Ejercicio 3: Ventaja de separar en módulos Gradle

**Enunciado:** ¿qué ventaja da dividir un proyecto Android en módulos Gradle separados (`:app`, `:core`) en vez de un solo módulo monolítico?

**Solución esperada:** fuerza límites explícitos entre partes de la app y permite compilaciones incrementales más rápidas, dado que Gradle solo necesita recompilar el módulo que cambió, no el proyecto entero.

**Criterios de éxito:**
- Explica correctamente al menos uno de: límites explícitos, compilación incremental más rápida.

---

## Resumen del módulo

**Puntos clave**

- Un proyecto Android separa código, recursos y configuración de build en carpetas y archivos distintos.
- Externalizar recursos (strings, drawables) centraliza el contenido y habilita traducción/adaptación automática.
- El `AndroidManifest.xml` es el contrato que el sistema operativo lee antes de instalar o ejecutar la app.
- Los módulos Gradle establecen límites explícitos de compilación, valiosos a medida que el proyecto crece.

**Conceptos aprendidos**

- Estructura de un proyecto Android Studio.
- Gradle y módulos de app.
- `AndroidManifest.xml`.
- Recursos (strings, dimens, drawables).

**Próximos pasos**

En el Módulo 1 aprenderás el ciclo de vida de Activities y cómo `ViewModel` y `SavedStateHandle` sobreviven a la rotación de pantalla y a la muerte del proceso.

**Recursos adicionales**

- Documentación oficial de Android sobre recursos de la app (developer.android.com/guide/topics/resources).
