# Módulo 7: Integración con plataformas nativas

## Sílabo

**Objetivo general**

Comunicarse directamente con código nativo de Android e iOS cuando un plugin existente no cubre una necesidad específica, usando `MethodChannel` para invocar código Kotlin/Swift desde Dart, entendiendo plugins federados y el manejo de permisos de plataforma.

**Objetivos específicos**

1. Crear un `MethodChannel` que invoque código nativo Kotlin desde Dart.
2. Implementar el lado Android (Kotlin) que responde a esa invocación.
3. Implementar el lado iOS (Swift) del mismo `MethodChannel`.
4. Solicitar un permiso de plataforma y manejar el rechazo.

**Contenido**

- `MethodChannel`: Dart ↔ Kotlin/Swift.
- Plugins federados.
- Permisos de plataforma.
- Cuándo escribir un platform channel propio.

**Evaluación**

Platform channel propio que invoca una API nativa simple desde Dart, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: MethodChannel

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

**Conceptos clave:** manejo explícito del rechazo, búsqueda de un plugin existente antes de construir uno propio.

```dart
final estado = await Permission.camera.request();
if (estado.isGranted) { abrirCamara(); } else { mostrarMensajePermisoDenegado(); }
```

Solicitar un permiso de plataforma sensible (cámara, ubicación, contactos) requiere manejar explícitamente ambos resultados posibles: concedido (proceder con la funcionalidad que depende de ese permiso) y denegado (mostrar un mensaje apropiado explicando por qué la funcionalidad no está disponible, en vez de simplemente fallar silenciosamente o crashear al intentar usar una capacidad sin el permiso correspondiente); este es el mismo patrón de manejo de permisos estudiado en Android nativo (Módulo 2 de ese track) e iOS nativo, expuesto aquí a través de un plugin de Flutter que internamente usa `MethodChannel` para comunicarse con las APIs nativas de permisos de cada plataforma.

Escribir un platform channel propio solo se justifica cuando el plugin necesario no existe ya publicado en pub.dev (el repositorio central de paquetes Dart/Flutter), o cuando se requiere una integración muy específica de bajo nivel que ningún plugin genérico existente cubre adecuadamente para el caso de uso concreto de la app; buscar primero un plugin ya existente y mantenido por la comunidad ahorra el esfuerzo considerable de escribir y mantener código nativo duplicado por plataforma (Kotlin para Android, Swift para iOS) que un plugin ya publicado probablemente ya resolvió correctamente, incluyendo el manejo de casos límite que un platform channel propio recién escrito podría no haber considerado todavía.

**Analogía:** manejar explícitamente el rechazo de un permiso es como preparar de antemano una respuesta cortés para cuando alguien decline una solicitud, en vez de quedarse sin ningún plan de contingencia si la respuesta no es la esperada; escribir un platform channel propio antes de buscar un plugin existente es como construir una herramienta especializada desde cero sin verificar primero si ya existe una herramienta comercial probada que resuelve exactamente la misma necesidad.

**¿Por qué es importante?** Manejar explícitamente el caso de permiso denegado evita fallos silenciosos o crashes; escribir un platform channel propio solo se justifica cuando no existe un plugin ya publicado, dado que reescribir esa integración manualmente duplica esfuerzo que probablemente ya está resuelto y mantenido por la comunidad.

**Diagrama:**

```dart
final estado = await Permission.camera.request();
if (estado.isGranted) { abrirCamara(); } else { mostrarMensajePermisoDenegado(); }
```

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

**Verificación:** el laboratorio se considera exitoso si el `MethodChannel` invoca correctamente el código nativo en ambas plataformas (Android e iOS) y devuelve el resultado esperado a Dart, y si el flujo de permisos maneja correctamente tanto la concesión como el rechazo.

**Errores comunes y soluciones**

- **Escribir un platform channel propio sin buscar primero un plugin existente en pub.dev.** Ahorra esfuerzo verificando primero si ya existe una solución mantenida por la comunidad.
- **Olvidar implementar el lado nativo en alguna de las dos plataformas.** El `MethodChannel` requiere implementación explícita en ambos lados (Kotlin e Swift) para funcionar en ambas plataformas.
- **No manejar el caso de permiso denegado.** Muestra un mensaje apropiado en vez de fallar silenciosamente o crashear.

---

## Ejercicios de evaluación

### Ejercicio 1: Cuándo escribir un platform channel propio

**Enunciado:** ¿cuándo deberías escribir un platform channel propio en vez de buscar un plugin existente?

**Solución esperada:** solo cuando el plugin necesario no existe ya publicado en pub.dev, o se requiere una integración muy específica de bajo nivel que ningún plugin genérico existente cubre adecuadamente; buscar primero un plugin existente ahorra el esfuerzo de mantener código nativo duplicado por plataforma.

**Criterios de éxito:**
- Explica correctamente la ausencia de un plugin existente adecuado como la condición para justificar un platform channel propio.

### Ejercicio 2: Qué distingue a un plugin federado

**Enunciado:** ¿qué hace un "plugin federado" distinto de un plugin simple?

**Solución esperada:** un plugin federado separa formalmente la interfaz Dart pública de las implementaciones específicas de cada plataforma, cada una en un paquete independiente, permitiendo que la comunidad agregue soporte para una plataforma nueva sin modificar el paquete principal ni las implementaciones ya existentes de otras plataformas.

**Criterios de éxito:**
- Explica correctamente la separación de interfaz e implementaciones por plataforma en paquetes independientes.

### Ejercicio 3: Por qué un MethodChannel requiere implementación en ambos lados

**Enunciado:** ¿por qué un `MethodChannel` requiere implementar el lado receptor por separado en Kotlin y en Swift?

**Solución esperada:** Dart no tiene acceso directo a las APIs nativas específicas de cada sistema operativo (las de Android están en Kotlin/Java, las de iOS en Swift/Objective-C), por lo que cada plataforma necesita su propia implementación del `setMethodCallHandler` que invoque las APIs nativas específicas correspondientes a esa plataforma.

**Criterios de éxito:**
- Explica correctamente la falta de acceso directo de Dart a las APIs nativas de cada plataforma como la razón.

---

## Resumen del módulo

**Puntos clave**

- Un `MethodChannel` establece comunicación bidireccional entre Dart y el código nativo de cada plataforma, requiriendo implementación separada en Kotlin e iOS Swift.
- Un plugin federado separa la interfaz Dart de las implementaciones específicas por plataforma, facilitando agregar soporte para plataformas nuevas de forma independiente.
- Manejar explícitamente el rechazo de un permiso evita fallos silenciosos o crashes.
- Escribir un platform channel propio solo se justifica cuando no existe ya un plugin publicado que cubra la necesidad.

**Conceptos aprendidos**

- `MethodChannel`: Dart ↔ Kotlin/Swift.
- Plugins federados.
- Permisos de plataforma.
- Cuándo escribir un platform channel propio.

**Próximos pasos**

En el Módulo 8 aprenderás animaciones y rendimiento: `AnimationController`, animaciones implícitas vs explícitas, y cómo detectar jank con Flutter DevTools.

**Recursos adicionales**

- Documentación oficial de platform channels de Flutter (docs.flutter.dev/platform-integration/platform-channels).
