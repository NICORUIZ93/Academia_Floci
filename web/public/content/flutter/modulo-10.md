# Módulo 10: Theming, accesibilidad y Material/Cupertino


## Aprende construyendo

### Tema 1: ThemeData con Material 3

#### Paso 1 · Objetivo y preparación
Al finalizar podrás aplicar este tema Flutter desde cero. Prerrequisitos: Flutter SDK, Dart, editor y, si corresponde, Xcode/Android Studio. Verifica flutter doctor.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, la app debe probarse, tematizarse, publicarse y operarse con datos reales sin perder accesibilidad ni rendimiento.

#### Paso 3 · Teoría, modelo mental y analogía
El tema conecta una responsabilidad concreta con una frontera verificable: pruebas, diseño, release, arquitectura o producción. La analogía es una operación logística completa: preparación, control, transporte, entrega y seguimiento.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-flutter-final
cd ejemplo-flutter-final
flutter create app
cd app
flutter pub get
flutter test
```
Crea lib/features/example/ y el archivo principal del tema; ejecuta la prueba o build correspondiente y documenta la salida.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente una configuración, expectativa o dependencia para provocar un fallo deliberado; diagnostica y corrígelo. Resultado esperado: build/test reproducible y experiencia visible.

#### Paso 6 · Práctica independiente
Añade un caso de error, una prueba de accesibilidad, medición de rendimiento y documentación de la decisión técnica.

#### Paso 7 · Cierre y evidencia
Guarda código, comandos, captura, logs y test; como siguiente paso integra el resultado en un proyecto completo. Errores comunes: probar solo el camino feliz, publicar debug, ignorar Semantics y no medir release. Fuentes oficiales: https://docs.flutter.dev/ y https://api.flutter.dev/.
**¿Por qué es importante?** Porque una app profesional se prueba, se publica y se opera con evidencia.
**Evidencia de aprendizaje:** entrega proyecto aislado, resultado, fallo, corrección, prueba y medición.
**Conceptos clave:** un único esquema de diseño centralizado, coherencia visual en toda la app.

```dart
MaterialApp(
  theme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.blue),
  darkTheme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.blue, brightness: Brightness.dark),
  themeMode: ThemeMode.system, // sigue la preferencia del sistema operativo
)
```

Definir un `ThemeData` centralizado en el punto de entrada de la app (colores, tipografía, formas de componentes) garantiza coherencia visual exacta en toda la aplicación, sin necesidad de especificar manualmente esos mismos valores repetidamente en cada widget individual; `colorSchemeSeed` genera automáticamente un esquema de colores Material 3 completo y armónico a partir de un único color base, aplicando las reglas de diseño de Material Design 3 para derivar variantes apropiadas de ese color para distintos contextos (superficies, contenedores, texto sobre cada superficie) sin que el desarrollador tenga que definir manualmente cada variante individual.

`ThemeMode.system` hace que la app siga automáticamente la preferencia de modo claro/oscuro configurada a nivel del sistema operativo del dispositivo, en vez de requerir que el usuario configure ese ajuste por separado dentro de cada app individual, una expectativa de UX cada vez más establecida en apps móviles modernas.

**Analogía:** un `ThemeData` centralizado es como un manual de identidad visual corporativa único aplicado consistentemente en toda una organización, en vez de que cada departamento defina sus propios colores y tipografías de forma independiente y potencialmente inconsistente entre sí.

**¿Por qué es importante?** Centralizar el `ThemeData` con Material 3 garantiza coherencia visual en toda la app sin repetir configuración en cada widget, y `ThemeMode.system` respeta automáticamente la preferencia de modo oscuro/claro del sistema operativo del usuario.

**Código del ejemplo:**

```dart
MaterialApp(
  theme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.blue),
  darkTheme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.blue, brightness: Brightness.dark),
  themeMode: ThemeMode.system,
)
```

### Tema 2: Adaptación Material vs Cupertino

#### Paso 1 · Objetivo y preparación
Al finalizar podrás aplicar este tema Flutter desde cero. Prerrequisitos: Flutter SDK, Dart, editor y, si corresponde, Xcode/Android Studio. Verifica flutter doctor.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, la app debe probarse, tematizarse, publicarse y operarse con datos reales sin perder accesibilidad ni rendimiento.

#### Paso 3 · Teoría, modelo mental y analogía
El tema conecta una responsabilidad concreta con una frontera verificable: pruebas, diseño, release, arquitectura o producción. La analogía es una operación logística completa: preparación, control, transporte, entrega y seguimiento.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-flutter-final
cd ejemplo-flutter-final
flutter create app
cd app
flutter pub get
flutter test
```
Crea lib/features/example/ y el archivo principal del tema; ejecuta la prueba o build correspondiente y documenta la salida.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente una configuración, expectativa o dependencia para provocar un fallo deliberado; diagnostica y corrígelo. Resultado esperado: build/test reproducible y experiencia visible.

#### Paso 6 · Práctica independiente
Añade un caso de error, una prueba de accesibilidad, medición de rendimiento y documentación de la decisión técnica.

#### Paso 7 · Cierre y evidencia
Guarda código, comandos, captura, logs y test; como siguiente paso integra el resultado en un proyecto completo. Errores comunes: probar solo el camino feliz, publicar debug, ignorar Semantics y no medir release. Fuentes oficiales: https://docs.flutter.dev/ y https://api.flutter.dev/.
**¿Por qué es importante?** Porque una app profesional se prueba, se publica y se opera con evidencia.
**Evidencia de aprendizaje:** entrega proyecto aislado, resultado, fallo, corrección, prueba y medición.
**Conceptos clave:** detectar la plataforma y mostrar el widget nativo correspondiente.

```dart
import 'dart:io';

Widget botonAdaptativo() => Platform.isIOS
    ? CupertinoButton(child: Text('Continuar'), onPressed: () {})
    : ElevatedButton(child: Text('Continuar'), onPressed: () {});
```

Detectar la plataforma en tiempo de ejecución (`Platform.isIOS`) y mostrar el widget de diseño correspondiente (Cupertino para iOS, el conjunto de widgets que imita las convenciones visuales de Apple; Material para Android, siguiendo las convenciones de Google) para un mismo componente lógico hace que la app se sienta considerablemente menos "genérica" y más integrada en cada sistema operativo, dado que los usuarios de cada plataforma tienen expectativas visuales y de interacción específicas formadas por el uso constante de otras apps nativas de esa misma plataforma (Material en Android, Cupertino en iOS), que una app que ignora completamente esta distinción y muestra siempre el mismo estilo en ambas plataformas no cumple.

Esta decisión de "una sola base de código Dart, pero apariencia adaptada según la plataforma detectada" es exactamente la promesa central de Flutter en su forma más cuidadosamente implementada: compartir la lógica y estructura general de la app en Dart, mientras se adapta selectivamente la presentación visual de componentes específicos según las convenciones nativas esperadas de cada plataforma de destino.

**Analogía:** adaptar Material/Cupertino según la plataforma es como un guía turístico bilingüe que no solo traduce el idioma sino que también adapta sutilmente su comportamiento y protocolo según las costumbres culturales específicas de cada audiencia, resultando en una experiencia que se percibe genuinamente adaptada en vez de una traducción literal aplicada indiscriminadamente sin ninguna consideración cultural.

**¿Por qué es importante?** Adaptar Material/Cupertino según la plataforma hace que una app Flutter se sienta más nativa en cada sistema operativo, cumpliendo con las expectativas visuales y de interacción específicas que los usuarios de cada plataforma ya tienen formadas por el uso de otras apps nativas.

**Código del ejemplo:**

```dart
Platform.isIOS
    ? CupertinoButton(child: Text('Continuar'), onPressed: () {})
    : ElevatedButton(child: Text('Continuar'), onPressed: () {})
```

### Tema 3: Accesibilidad con Semantics y dark mode

#### Paso 1 · Objetivo y preparación
Al finalizar podrás aplicar este tema Flutter desde cero. Prerrequisitos: Flutter SDK, Dart, editor y, si corresponde, Xcode/Android Studio. Verifica flutter doctor.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, la app debe probarse, tematizarse, publicarse y operarse con datos reales sin perder accesibilidad ni rendimiento.

#### Paso 3 · Teoría, modelo mental y analogía
El tema conecta una responsabilidad concreta con una frontera verificable: pruebas, diseño, release, arquitectura o producción. La analogía es una operación logística completa: preparación, control, transporte, entrega y seguimiento.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-flutter-final
cd ejemplo-flutter-final
flutter create app
cd app
flutter pub get
flutter test
```
Crea lib/features/example/ y el archivo principal del tema; ejecuta la prueba o build correspondiente y documenta la salida.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente una configuración, expectativa o dependencia para provocar un fallo deliberado; diagnostica y corrígelo. Resultado esperado: build/test reproducible y experiencia visible.

#### Paso 6 · Práctica independiente
Añade un caso de error, una prueba de accesibilidad, medición de rendimiento y documentación de la decisión técnica.

#### Paso 7 · Cierre y evidencia
Guarda código, comandos, captura, logs y test; como siguiente paso integra el resultado en un proyecto completo. Errores comunes: probar solo el camino feliz, publicar debug, ignorar Semantics y no medir release. Fuentes oficiales: https://docs.flutter.dev/ y https://api.flutter.dev/.
**¿Por qué es importante?** Porque una app profesional se prueba, se publica y se opera con evidencia.
**Evidencia de aprendizaje:** entrega proyecto aislado, resultado, fallo, corrección, prueba y medición.
**Conceptos clave:** verificación activa con el lector de pantalla real, no asunción por inspección visual.

```dart
Semantics(
  label: 'Eliminar tarea',
  button: true,
  child: IconButton(icon: Icon(Icons.delete), onPressed: eliminar),
)
```

Sin `Semantics` con un `label` explícito, TalkBack (Android) o VoiceOver (iOS) leen un ícono interactivo sin texto visible simplemente como "botón" genérico, sin ninguna indicación de qué acción específica realiza ese botón concreto; activar un lector de pantalla en la propia app y navegarla exclusivamente con gestos de accesibilidad (sin mirar directamente la pantalla) revela rápidamente estos huecos de accesibilidad de una forma que ninguna inspección puramente visual del diseño, por cuidadosa que sea, puede detectar, exactamente el mismo principio de verificación activa estudiado con TalkBack en Android (Módulo 10 de ese track) y VoiceOver en iOS (Módulo 10 de ese track), aplicado aquí de forma unificada mediante el widget `Semantics` de Flutter, que internamente se traduce hacia el mecanismo de accesibilidad nativo apropiado de cada plataforma.

```dart
final esOscuro = Theme.of(context).brightness == Brightness.dark;
```

Probar la app explícitamente en ambos modos (claro y oscuro) en un dispositivo real, en vez de asumir que "se ve bien" en un modo implica automáticamente que también se ve bien en el otro, revela problemas concretos como contrastes de color insuficientes (texto oscuro sobre fondo oscuro por un color hardcodeado que ignora el tema activo) o iconografía que se vuelve invisible o difícil de distinguir en el modo no probado explícitamente.

**Analogía:** navegar la propia app solo con un lector de pantalla activado es como intentar usar el propio producto con los ojos vendados, revelando qué tan bien funciona genuinamente para alguien que depende completamente del tacto y del sonido; probar ambos modos de color explícitamente es como revisar un documento impreso tanto en tinta clara como oscura antes de asumir que es legible en cualquiera de las dos condiciones.

**¿Por qué es importante?** Activar un lector de pantalla en la propia app revela huecos de accesibilidad que una inspección visual no puede detectar; probar ambos modos de color explícitamente revela contrastes insuficientes o iconografía invisible que no se notarían probando solo uno de los dos modos.

**Código del ejemplo:**

```dart
Semantics(label: 'Eliminar tarea', button: true, child: IconButton(icon: Icon(Icons.delete), onPressed: eliminar))
// Sin esto, TalkBack/VoiceOver leen simplemente "botón" genérico
```

---


## Laboratorio práctico

**Objetivo del laboratorio:** construir una app con theming consistente, dark mode y accesibilidad auditada.

**Requisitos previos:** Módulo 9 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Definir un `ThemeData` con Material 3 | Ver Tema 1 | Colores y tipografía consistentes |
| 2 | Adaptar un widget según la plataforma | Ver Tema 2 | Cupertino en iOS, Material en Android |
| 3 | Agregar `Semantics` a elementos sin texto | Ver Tema 3 | Soporte de TalkBack/VoiceOver |
| 4 | Implementar dark mode completo | Ver Tema 3 | Probado en ambos modos en dispositivo real |

**Verificación:** el laboratorio se considera exitoso si el lector de pantalla describe correctamente todos los elementos interactivos sin texto visible, y si la app se ve correctamente sin contrastes insuficientes en ambos modos de color.

**Errores comunes y soluciones**

- **Repetir configuración de colores/tipografía en cada widget individual en vez de centralizarla en `ThemeData`.** Centraliza para coherencia y mantenibilidad.
- **Ignorar la distinción Material/Cupertino asumiendo que el mismo estilo funciona igual de bien en ambas plataformas.** Adapta componentes clave según la plataforma detectada.
- **Probar solo un modo de color (claro u oscuro) y asumir que el otro funciona igual.** Prueba explícitamente ambos en dispositivo real.

---
