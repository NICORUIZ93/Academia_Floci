# Módulo 10: Theming, accesibilidad y Material/Cupertino

## Sílabo

**Objetivo general**

Construir una app pulida que se sienta nativa en ambas plataformas sin duplicar código, usando `ThemeData` con Material 3, adaptación explícita entre widgets Material y Cupertino según la plataforma detectada en runtime, accesibilidad con `Semantics`, y soporte completo de dark mode.

**Objetivos específicos**

1. Definir un `ThemeData` con Material 3 aplicado a toda la app.
2. Detectar la plataforma en runtime y mostrar el widget adaptado correspondiente.
3. Agregar `Semantics` con labels apropiados a elementos sin texto visible.
4. Implementar soporte completo de dark mode.

**Contenido**

- `ThemeData` y Material 3.
- Adaptación Material vs Cupertino.
- Accesibilidad (`Semantics`, soporte de lectores de pantalla).
- Dark mode.

**Evaluación**

App con theming consistente, dark mode y accesibilidad auditada, más tres ejercicios de evaluación.

---

## Aprende construyendo

### Tema 1: ThemeData con Material 3

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

## Criterio transversal de calidad del código

Aplica estas decisiones en todos los ejemplos y en tu entrega:

- usa nombres que expresen intención, dominio y unidades; evita `data`, `temp`, `manager` o `process` cuando exista un término preciso;
- mantén funciones, componentes, clases, consultas y módulos cohesionados alrededor de una responsabilidad comprobable;
- haz visibles las dependencias y los efectos de red, tiempo, archivos, estado y base de datos;
- valida entradas en la frontera y representa errores con contexto, sin ocultar la causa ni registrar secretos;
- elimina duplicación de reglas, no toda repetición textual; una abstracción incorrecta cuesta más que dos líneas parecidas;
- escribe primero la solución más simple que satisface el requisito y refactoriza con pruebas verdes;
- aplica SOLID únicamente cuando exista una necesidad real de cambio, extensión, sustitución o aislamiento.

**SOLID con criterio:** responsabilidad única significa una razón coherente de cambio, no una clase por función. Abierto/cerrado justifica estrategias cuando hay variantes reales. Sustitución exige respetar contratos. Segregación evita obligar a consumidores a depender de operaciones que no usan. Inversión de dependencias protege el dominio frente a detalles externos; no exige crear interfaces para cada objeto.

**Comprobación antes de continuar:** ¿otra persona puede entender los nombres y el flujo?, ¿los casos de error son observables?, ¿una prueba demuestra la regla principal?, ¿cada abstracción aporta más claridad de la que cuesta? Registra una decisión de refactorización y una decisión consciente de *no abstraer*.

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


## Rúbrica del proyecto

Esta rúbrica evalúa el laboratorio y los ejercicios como evidencia de dominio, no la mera finalización de pasos.

| Criterio | Peso | Evidencia esperada |
|---|---:|---|
| Comprensión conceptual | 20% | Explica el mecanismo, sus límites y por qué la solución funciona. |
| Implementación funcional | 30% | El artefacto satisface requisitos normales, límite y de error. |
| Verificación | 20% | Incluye pruebas, mediciones o inspecciones reproducibles. |
| Diseño y calidad | 15% | Nombres, estructura, seguridad y mantenibilidad son deliberados. |
| Comunicación profesional | 15% | README, decisiones, comandos y resultados permiten repetir el trabajo. |

Se alcanza competencia con 70/100 y sin cero en implementación o verificación. El nivel experto exige comparar alternativas, justificar trade-offs y reconocer condiciones donde la solución dejaría de ser válida.

## Bibliografía y fundamento académico

Estas fuentes sustentan los conceptos y deben consultarse para verificar detalles que cambian entre versiones:

- Google, *Flutter Documentation* y guías de arquitectura y rendimiento.
- Google, *Dart Language Documentation* y *Effective Dart*.
- OWASP Foundation, *Mobile Application Security Verification Standard*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- Centralizar `ThemeData` con Material 3 garantiza coherencia visual sin repetir configuración en cada widget.
- Adaptar Material/Cupertino según la plataforma detectada hace que una app Flutter se sienta genuinamente nativa en cada sistema operativo.
- `Semantics` con labels apropiados es necesario para que TalkBack/VoiceOver describan correctamente elementos sin texto visible.
- Probar explícitamente ambos modos de color revela problemas de contraste o iconografía que no se notarían probando solo uno.

**Conceptos aprendidos**

- `ThemeData` y Material 3.
- Adaptación Material vs Cupertino.
- Accesibilidad con `Semantics`.
- Dark mode.

**Próximos pasos**

En el Módulo 11 aprenderás a publicar tu app en App Store y Google Play desde una sola base de código, con builds de release separados para cada tienda.

**Recursos adicionales**

- Documentación oficial de Material 3 en Flutter (docs.flutter.dev/ui/design/material).
