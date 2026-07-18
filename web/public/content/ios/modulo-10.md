# Módulo 10: Performance, accesibilidad y HIG

## Sílabo

**Objetivo general**

Construir una app rápida, accesible y que respeta las Human Interface Guidelines, usando Instruments para medir performance real, VoiceOver para verificar accesibilidad, y entendiendo por qué seguir las convenciones de Apple hace que una app "se sienta" genuinamente nativa.

**Objetivos específicos**

1. Grabar una sesión con Instruments sobre una interacción lenta.
2. Activar VoiceOver y navegar la app solo con gestos de accesibilidad.
3. Agregar `.accessibilityLabel` a elementos sin texto visible.
4. Verificar la app con Dynamic Type en su tamaño más grande y en modo oscuro.

**Contenido**

- Instruments para medir performance.
- Accesibilidad con VoiceOver.
- Human Interface Guidelines esenciales.
- Dynamic Type y dark mode.
- `@ViewBuilder` y `.matchedGeometryEffect()`.
- Interop con UIKit: `UIViewRepresentable` y `UIViewControllerRepresentable`.
- Novedades recientes: Liquid Glass, layouts volumétricos y WebView nativo.

**Evaluación**

Auditoría de accesibilidad (VoiceOver) de una pantalla con mejoras aplicadas, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Instruments

**Conceptos clave:** medición real de comportamiento, no percepción subjetiva.

Xcode incluye Instruments, un conjunto de herramientas de perfilado con plantillas especializadas: Time Profiler identifica qué función específica consume más tiempo de CPU durante una interacción concreta, Allocations rastrea el uso de memoria y detecta posibles fugas, y Core Animation mide frames perdidos durante animaciones y scrolls. Grabar una sesión real con estas herramientas sobre una interacción específica de la app (por ejemplo, un scroll que se percibe ligeramente entrecortado) revela cuellos de botella concretos y medibles que la simple percepción subjetiva de "se siente fluido" en el simulador durante desarrollo no puede revelar, dado que el simulador corre en hardware de escritorio considerablemente más potente que un dispositivo real, ocultando problemas de rendimiento que solo se manifiestan en el hardware real de los usuarios.

Esta necesidad de medición real sobre percepción subjetiva es un principio universal de optimización de performance, compartido con el uso del Layout Inspector en Android (Módulo 10 del track de Android) para detectar recomposiciones innecesarias: en ambos casos, la intuición de "se ve rápido" no sustituye una medición objetiva con la herramienta de perfilado apropiada de la plataforma.

**Analogía:** Instruments es como un electrocardiograma que revela irregularidades reales en el funcionamiento de un órgano que un examen visual superficial ("se ve saludable") no puede detectar, requiriendo instrumentación especializada para medir lo que efectivamente ocurre por debajo de la percepción superficial.

**¿Por qué es importante?** Instruments revela cuellos de botella de rendimiento reales y medibles (consumo de CPU, memoria, frames perdidos) que la percepción subjetiva de fluidez en el simulador no puede detectar, dado que el hardware de desarrollo suele ser considerablemente más potente que los dispositivos reales de los usuarios.

**Diagrama:**

```
Time Profiler    → qué función consume más CPU
Allocations      → uso de memoria y posibles fugas
Core Animation   → frames perdidos en animaciones/scroll
```

### Tema 2: Accesibilidad con VoiceOver

**Conceptos clave:** verificación activa con la herramienta real, no inspección visual.

```swift
Image(systemName: "trash")
    .accessibilityLabel("Eliminar tarea")
```

Sin `.accessibilityLabel` explícito, VoiceOver (el lector de pantalla nativo de iOS) lee un elemento sin texto visible (como un ícono usado como botón) simplemente como "imagen" genérica, una descripción completamente inútil para un usuario con discapacidad visual que necesita entender qué hace ese elemento antes de interactuar con él; navegar la propia app activamente con VoiceOver habilitado (deslizando entre elementos, sin mirar la pantalla directamente) expone rápidamente estos huecos de accesibilidad de una forma que una simple inspección visual del diseño, por cuidadosa que sea, no puede revelar, dado que un desarrollador vidente evalúa naturalmente la UI de forma visual, no auditiva.

Este mismo principio de "probar activamente con la herramienta de accesibilidad real, no asumir accesibilidad por inspección visual" es idéntico al de probar con TalkBack en Android (Módulo 10 de ese track), reflejando que la verificación activa con el lector de pantalla real es el único método confiable de descubrir estos problemas en cualquier plataforma móvil.

**Analogía:** navegar la propia app con VoiceOver activado es como intentar usar el propio producto con los ojos vendados para descubrir qué tan bien funciona realmente para alguien que depende completamente del tacto y el sonido, una prueba que ninguna revisión puramente visual del diseño puede sustituir.

**¿Por qué es importante?** Verificar activamente la app con VoiceOver expone huecos de accesibilidad que una inspección visual del diseño no puede revelar, dado que un desarrollador vidente evalúa naturalmente la UI de forma visual, no de la forma en que un usuario con discapacidad visual la experimenta.

**Diagrama:**

```swift
Image(systemName: "trash").accessibilityLabel("Eliminar tarea")
// Sin esto, VoiceOver lee simplemente "imagen" — inútil para el usuario
```

### Tema 3: Human Interface Guidelines, Dynamic Type e interop con UIKit

**Conceptos clave:** convenciones documentadas que hacen que una app se sienta nativa, más allá de usar SwiftUI.

Apple documenta convenciones esperadas de comportamiento e interacción en sus Human Interface Guidelines (HIG): tamaño mínimo de áreas táctiles (44x44 puntos, garantizando que elementos interactivos sean cómodamente presionables sin errores de precisión), iconografía consistente mediante SF Symbols (el sistema de íconos nativo de Apple, ya integrado visualmente con la tipografía del sistema), y patrones de navegación estándar (los estudiados en el Módulo 3); seguir estas convenciones documentadas hace que una app "se sienta nativa" de forma genuina, un resultado que usar SwiftUI por sí solo no garantiza automáticamente si las decisiones de diseño e interacción se apartan de esas convenciones esperadas por el usuario habitual de iOS.

```swift
Text("Título").font(.title) // escala automáticamente con la configuración de tamaño de texto del usuario
.preferredColorScheme(.dark) // para previsualizar dark mode explícitamente
```

Dynamic Type permite que el texto de la app escale automáticamente según la configuración de tamaño de texto que el usuario eligió en Ajustes de Accesibilidad, y probar la app específicamente en el tamaño de texto más grande disponible revela rápidamente layouts que se rompen con texto considerablemente más largo de lo esperado (etiquetas truncadas, botones desbordados); `UIViewRepresentable` y `UIViewControllerRepresentable` permiten embeber Views y ViewControllers de UIKit (el framework de UI imperativo anterior a SwiftUI) dentro de un árbol SwiftUI, útil durante una migración incremental o para integrar componentes de terceros que aún no ofrecen una versión SwiftUI nativa, el mismo patrón que `AndroidView`/`ComposeView` en Android (Módulo 10 de ese track).

**Analogía:** las Human Interface Guidelines son como el código de vestimenta y protocolo esperado en un ambiente profesional específico: seguirlas hace que alguien se perciba genuinamente parte de ese ambiente, mientras que ignorarlas, aun con las mejores intenciones y herramientas modernas disponibles, produce una impresión de no pertenecer del todo al contexto esperado.

**¿Por qué es importante?** Seguir las HIG hace que una app "se sienta" nativa de forma genuina, un resultado que usar SwiftUI por sí solo no garantiza automáticamente; probar con Dynamic Type en su tamaño más grande revela layouts que se rompen con texto más largo de lo esperado.

**Diagrama:**

```
UIViewRepresentable            → embebe una View de UIKit DENTRO de SwiftUI
UIViewControllerRepresentable  → embebe un ViewController de UIKit DENTRO de SwiftUI
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

**Objetivo del laboratorio:** realizar una auditoría de accesibilidad (VoiceOver) de una pantalla con mejoras aplicadas.

**Requisitos previos:** Módulo 9 completado.

| Paso | Acción | Código/Comando | Explicación |
|---|---|---|---|
| 1 | Grabar una sesión con Instruments (Time Profiler) | Ver Tema 1 | Sobre una interacción lenta |
| 2 | Activar VoiceOver y navegar solo con gestos | Ver Tema 2 | Sin mirar la pantalla |
| 3 | Agregar `.accessibilityLabel` donde falte | Ver Tema 2 | Elementos sin texto visible |
| 4 | Verificar con Dynamic Type en tamaño más grande y dark mode | Ver Tema 3 | Revisa layouts rotos |

**Verificación:** el laboratorio se considera exitoso si VoiceOver describe correctamente todos los elementos interactivos tras las mejoras aplicadas, y si la pantalla se ve correctamente sin layouts rotos con el tamaño de texto más grande disponible.

**Errores comunes y soluciones**

- **Confiar en la percepción subjetiva de fluidez en el simulador sin medir con Instruments.** El hardware de desarrollo es más potente; mide en dispositivo real.
- **Omitir `.accessibilityLabel` en íconos interactivos.** Sin él, VoiceOver los describe genéricamente como "imagen", inútil para el usuario.
- **Ignorar las HIG asumiendo que usar SwiftUI garantiza automáticamente una sensación nativa.** Revisa activamente las convenciones documentadas por Apple.

---

## Ejercicios de evaluación

### Ejercicio 1: Qué revela Instruments que el simulador no revela

**Enunciado:** ¿qué revela Instruments que el simulador "se ve fluido" no revela?

**Solución esperada:** revela cuellos de botella de rendimiento reales y medibles (consumo de CPU, memoria, frames perdidos) que la percepción subjetiva de fluidez no puede detectar, dado que el simulador corre en hardware de escritorio considerablemente más potente que los dispositivos reales de los usuarios, ocultando problemas que solo se manifiestan en hardware real.

**Criterios de éxito:**
- Explica correctamente la diferencia de hardware entre simulador y dispositivo real como razón de la brecha.

### Ejercicio 2: Por qué las HIG hacen que una app se sienta nativa

**Enunciado:** ¿por qué seguir las Human Interface Guidelines hace que una app "se sienta" nativa, más allá de usar SwiftUI?

**Solución esperada:** las HIG documentan convenciones específicas de comportamiento e interacción esperadas por el usuario habitual de iOS (tamaños de área táctil, iconografía consistente, patrones de navegación estándar); usar SwiftUI por sí solo no garantiza automáticamente seguir esas convenciones si las decisiones de diseño se apartan de ellas.

**Criterios de éxito:**
- Explica correctamente que SwiftUI no garantiza automáticamente el cumplimiento de las convenciones documentadas en las HIG.

### Ejercicio 3: Por qué usar el propio ícono sin descripción es un problema real

**Enunciado:** ¿qué problema real ocurre si un ícono interactivo carece de `.accessibilityLabel`?

**Solución esperada:** VoiceOver lo lee simplemente como "imagen" genérica, una descripción completamente inútil para un usuario con discapacidad visual que necesita entender qué hace ese elemento específico antes de interactuar con él.

**Criterios de éxito:**
- Explica correctamente la descripción genérica e inútil de VoiceOver como el problema concreto.

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

- Apple, *Swift Language Guide* y *Apple Developer Documentation*.
- Apple, *Human Interface Guidelines* y documentación de accesibilidad.
- OWASP Foundation, *Mobile Application Security Verification Standard*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

<!-- REQUESTED-PRACTICAL-EXAMPLES:START -->
## Ejemplos guiados de los temas solicitados

Estos ejemplos acompañan la ampliación académica. No son código para copiar sin contexto: ejecuta, modifica, provoca un fallo y conserva la evidencia.

### Ejemplo guiado: Interoperabilidad con UIKit

**Qué demuestra:** convierte el concepto en una evidencia pequeña, explícita y verificable dentro de RutaFlow. El ejemplo separa la decisión del framework para poder probarla y cambiarla.

```swift
struct Evidence: Sendable { let topic: String; let passed: Bool }

actor InteroperabilidadConUikitVerifier {
    func run() async -> Evidence { Evidence(topic: "Interoperabilidad con UIKit", passed: true) }
}
```

**Práctica:** reemplaza el resultado exitoso por un fallo realista, agrega una aserción automatizada y registra qué señal permitiría diagnosticarlo en producción.

<!-- REQUESTED-PRACTICAL-EXAMPLES:END -->

## Resumen del módulo

**Puntos clave**

- Instruments mide rendimiento real (CPU, memoria, frames) de forma objetiva, revelando problemas que la percepción subjetiva no detecta.
- Navegar activamente con VoiceOver expone huecos de accesibilidad que una inspección visual no puede revelar.
- Seguir las Human Interface Guidelines hace que una app se sienta genuinamente nativa, más allá de simplemente usar SwiftUI.
- Dynamic Type y dark mode requieren verificación activa en sus configuraciones extremas para detectar layouts rotos.

**Conceptos aprendidos**

- Instruments para medir performance.
- Accesibilidad con VoiceOver.
- Human Interface Guidelines esenciales.
- Dynamic Type y dark mode.
- `@ViewBuilder` y `.matchedGeometryEffect()`.
- Interop con UIKit.

**Próximos pasos**

En el Módulo 11 aprenderás a publicar tu app en la App Store: certificados, TestFlight, y la metadata de App Store Connect.

**Recursos adicionales**

- Human Interface Guidelines de Apple (developer.apple.com/design/human-interface-guidelines).
