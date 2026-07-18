# Módulo 3: Navegación

## Sílabo

**Objetivo general**

Estructurar una app con múltiples pantallas usando las APIs de navegación modernas de SwiftUI: `NavigationStack` con navegación programática, sheets y full screen covers para presentación modal, `TabView` para navegación por pestañas, y deep linking.

**Objetivos específicos**

1. Construir un `NavigationStack` con al menos 3 niveles de profundidad.
2. Usar `NavigationPath` para navegar programáticamente.
3. Presentar contenido modal con `.sheet()` y `.fullScreenCover()`.
4. Construir una `TabView` con múltiples pestañas, cada una con su propio stack.

**Contenido**

- `NavigationStack` y `NavigationPath`.
- Sheets y full screen covers.
- `TabView`.
- Deep linking.
- `Form`, `Picker`, `DatePicker`, `Toggle` y `Slider`.
- `.swipeActions()` y `.onDelete()` en listas.

**Evaluación**

App con navegación tipo stack, una tab bar y al menos un sheet modal, más tres ejercicios de evaluación.

---

## Comienza desde cero: prepara este capítulo

Este recorrido parte de una carpeta vacía. Al finalizar tendrás **App con navegación tipo stack, una tab bar y al menos un sheet modal, más tres ejercicios de evaluación.** No avances ejecutando comandos que no comprendes: primero identifica la entrada, la transformación y la evidencia que comprobará el resultado.

### 1. Comprueba las herramientas

La práctica de SwiftUI requiere macOS y Xcode. En Windows/Linux estudia el modelo y conserva la ejecución para un equipo macOS.

```bash
xcodebuild -version
swift --version
git --version
```

Si un comando no existe, detente e instala esa herramienta desde su sitio oficial. Cierra y abre la terminal después de modificar `PATH`. Las versiones deben ser compatibles entre sí antes de crear archivos.

### 2. Crea o recupera el proyecto del track

```bash
# Xcode: New Project → iOS App → SwiftUI + Swift
cd academia-labs/ios-app
git init
```

Trabaja dentro de `academia-labs/ios-app`. Si ya existe, no lo vuelvas a generar: entra en la carpeta, confirma `git status` y continúa sobre una rama propia.

### 3. Ubica cada tema antes de escribir

```text
academia-labs/ios-app/
├─ Features/
│  └─ module-3/
├─ tests/
├─ docs/decisions/
├─ evidence/module-3/
└─ README.md
```

| Tema | Archivo o decisión | Evidencia mínima |
|---|---|---|
| 1. NavigationStack y NavigationPath | `Features/module-3/topic-1-navigationstack-y-navigationpath.swift` | prueba + salida observable |
| 2. Sheets, full screen covers y TabView | `Features/module-3/topic-2-sheets-full-screen-covers-y-tabview.swift` | prueba + salida observable |
| 3. Deep linking y controles de formulario | `Features/module-3/topic-3-deep-linking-y-controles-de-formulario.swift` | prueba + salida observable |

Un ejemplo técnico vive en el archivo indicado y debe tener una prueba. Un tema conceptual vive en `docs/decisions/`: compara opciones usando restricciones medibles; no escribas código decorativo solo para llenar espacio.

### 4. Ejecuta una línea base

Desde `academia-labs/ios-app`:

```bash
xcodebuild test -scheme RutaFlowLab -destination 'platform=iOS Simulator,name=iPhone 16'
```

**Resultado esperado:** el comando reconoce el proyecto y termina sin errores antes de introducir el cambio del capítulo. Después del incremento, la evidencia debe demostrar: **App con navegación tipo stack, una tab bar y al menos un sheet modal, más tres ejercicios de evaluación.**

Si falla la línea base, no continúes. Localiza el primer mensaje que indique archivo, línea o dependencia; formula una causa y compruébala con un cambio pequeño.

### 5. Provoca un fallo y recupérate

Simula permiso denegado, respuesta vacía o tarea cancelada; verifica estado y mensaje. SwiftUI requiere macOS. Guarda en `evidence/module-3/` el comando, la salida relevante, tu hipótesis y la corrección. Revierte únicamente el cambio deliberado; no borres todo el proyecto para ocultar la causa.

### 6. Conecta el capítulo con RutaFlow

Aplica el aprendizaje de **Navegación** a un incremento vertical de RutaFlow. Define qué componente produce el dato, qué contrato lo transporta, quién lo consume y cómo observarás un fallo. La entrega final incluye archivo o decisión, prueba, salida, error corregido y una limitación que todavía validarías en producción.

---

## Contenido teórico

### Tema 1: NavigationStack y NavigationPath

**Conceptos clave:** navegación declarada por tipo de dato, manipulable programáticamente.

```swift
NavigationStack(path: $path) {
    ListaTareasView()
        .navigationDestination(for: Tarea.self) { tarea in DetalleTareaView(tarea: tarea) }
}
```

`NavigationStack` gestiona un stack de navegación completo, con `.navigationDestination(for:)` declarando qué vista corresponde a cada tipo de dato que se agregue al stack (aquí, `Tarea`); esto reemplaza el modelo más antiguo de `NavigationView` con `NavigationLink` anidados directamente en cada vista, que requería estructurar la jerarquía de navegación de forma implícita a través de la composición de vistas, dificultando la navegación programática o los flujos complejos que no siguen simplemente el camino natural de taps del usuario.

```swift
path.append(tarea) // navega programáticamente, sin depender de NavigationLink anidados
```

`NavigationPath` (o un array tipado equivalente) permite manipular el stack de navegación completo desde código imperativo: agregar (`append`), quitar (`removeLast`), o resetear completamente el stack (asignando un array vacío), habilitando casos de uso que serían difíciles de expresar con `NavigationLink` puro, como responder a un deep link entrante navegando directamente varios niveles de profundidad de una sola vez, o implementar un flujo de "volver al inicio" desde cualquier punto profundo del stack.

**Analogía:** `NavigationStack` con `NavigationPath` es como un sistema de coordenadas GPS que permite saltar directamente a cualquier punto de una ruta con instrucciones programáticas explícitas, en vez de depender únicamente de seguir letrero por letrero (`NavigationLink`) el camino predefinido de una sola dirección posible.

**¿Por qué es importante?** `NavigationPath` habilita navegación programática y flujos complejos (deep linking, resetear el stack completo) que serían difíciles de expresar con el modelo anterior basado únicamente en `NavigationLink` anidados dentro de cada vista.

**Código del ejemplo:**

```swift
NavigationStack(path: $path) {
    ListaTareasView()
        .navigationDestination(for: Tarea.self) { tarea in DetalleTareaView(tarea: tarea) }
}
path.append(tarea) // push programático
```

### Tema 2: Sheets, full screen covers y TabView

**Conceptos clave:** dos niveles de intensidad de presentación modal, cada uno apropiado para un tipo distinto de interrupción.

```swift
.sheet(isPresented: $mostrarFormulario) { FormularioTareaView() }       // modal parcial, dismissible deslizando
.fullScreenCover(isPresented: $mostrarOnboarding) { OnboardingView() } // cubre toda la pantalla, ideal para flujos obligatorios
```

Un `.sheet()` presenta contenido modal parcial (típicamente deslizable hacia abajo para descartar, dejando visible parte del contexto anterior), apropiado para acciones complementarias o formularios que el usuario puede abandonar fácilmente sin perder su contexto de navegación previo; un `.fullScreenCover()` cubre la pantalla completa sin ningún gesto de descarte trivial disponible por defecto, apropiado para flujos que el desarrollador considera deliberadamente obligatorios o que requieren la atención completa del usuario sin distracción del contexto anterior (un onboarding inicial, un flujo de autenticación crítico).

```swift
TabView {
    NavigationStack { InicioView() }.tabItem { Label("Inicio", systemImage: "house") }
    NavigationStack { TareasView() }.tabItem { Label("Tareas", systemImage: "checklist") }
}
```

Anidar un `NavigationStack` independiente dentro de cada pestaña de una `TabView` establece exactamente el mismo patrón de stacks de navegación independientes por sección estudiado en Android (Módulo 3 del track de Android): cada pestaña mantiene su propio historial de navegación, de modo que cambiar de pestaña y regresar preserva el punto exacto donde el usuario quedó en cada una, cumpliendo con la misma expectativa de UX consolidada en apps móviles de ambas plataformas.

**Analogía:** un sheet es como abrir un cajón parcialmente para consultar algo rápido sin perder de vista el resto de la habitación; un full screen cover es como entrar a una sala separada donde la puerta se cierra completamente, apropiada cuando la actividad requiere concentración total sin ninguna distracción del contexto anterior.

**¿Por qué es importante?** Elegir entre sheet y full screen cover comunica al usuario la intensidad esperada de la interrupción (complementaria y descartable vs obligatoria y de atención completa); anidar un `NavigationStack` por pestaña preserva el historial independiente de cada sección, la misma expectativa de UX de Android.

**Diagrama:**

```
TabView
├── Inicio  → NavigationStack propio
└── Tareas  → NavigationStack propio (independiente del de Inicio)
```

### Tema 3: Deep linking y controles de formulario

**Conceptos clave:** entrada externa mapeada directamente a un punto específico de navegación.

```swift
.onOpenURL { url in
    if let id = extraerID(de: url) { path.append(Tarea(id: id)) }
}
```

`.onOpenURL` captura una URL entrante (desde una notificación, un link compartido, o un esquema de URL personalizado registrado por la app) y permite reaccionar programáticamente extrayendo la información relevante y navegando directamente al punto correspondiente del `NavigationPath`, el mismo principio de deep linking estudiado en Android (Módulo 3 de ese track) aplicado aquí con las APIs nativas de SwiftUI: una entrada externa lleva al usuario directamente al contenido relevante, en vez de aterrizar en la pantalla principal de la app requiriendo navegación manual adicional.

`Form`, `Picker`, `DatePicker`, `Toggle` y `Slider` son los controles de entrada estándar de SwiftUI para construir formularios completos de forma declarativa, cada uno vinculado a una propiedad de estado mediante un `Binding` (con el prefijo `$`); `.swipeActions()` agrega acciones reveladas mediante gesto de deslizamiento sobre una fila de una lista (eliminar, marcar como completada), y `.onDelete()` habilita el gesto estándar de eliminación por deslizamiento en modo edición de una `List`, ambos patrones de interacción esperados por convención en apps iOS nativas.

**Analogía:** `.onOpenURL` es como un sistema de recepción de correspondencia que lee automáticamente la dirección exacta escrita en cada sobre entrante y lo entrega directamente en la oficina correspondiente del edificio, en vez de dejarlo en la recepción general para que alguien lo redirija manualmente después.

**¿Por qué es importante?** El deep linking mediante `.onOpenURL` lleva al usuario directamente al contenido relevante desde una entrada externa; los controles estándar de formulario y los gestos de swipe/delete cumplen con las convenciones de interacción esperadas en apps iOS nativas.

**Código del ejemplo:**

```swift
.onOpenURL { url in
    if let id = extraerID(de: url) { path.append(Tarea(id: id)) }
}
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

**Objetivo del laboratorio:** construir una app con navegación tipo stack, una tab bar y al menos un sheet modal.

**Requisitos previos:** Módulo 2 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Construir un `NavigationStack` de al menos 3 niveles | Ver Tema 1 | Lista → detalle → sub-detalle |
| 2 | Usar `NavigationPath` para navegar programáticamente | Ver Tema 1 | Sin depender solo de `NavigationLink` |
| 3 | Presentar un `.sheet()` y un `.fullScreenCover()` | Ver Tema 2 | Explica cuándo usar cada uno |
| 4 | Construir una `TabView` con 3 pestañas | Ver Tema 2 | Cada una con su propio `NavigationStack` |
| 5 | Configurar `.onOpenURL` para deep linking | Ver Tema 3 | Navega directamente a la pantalla relevante |

**Verificación:** el laboratorio se considera exitoso si navegar profundamente en una pestaña y cambiar a otra mediante la tab bar preserva ese historial al regresar, y si abrir una URL configurada navega directamente a la pantalla correspondiente sin pasos manuales adicionales.

**Errores comunes y soluciones**

- **Usar un full screen cover para una acción complementaria que el usuario debería poder descartar fácilmente.** Prefiere un sheet para ese caso.
- **Compartir un único `NavigationStack` entre todas las pestañas de una `TabView`.** Anida uno independiente por pestaña para preservar el historial de cada una.
- **Olvidar registrar el esquema de URL en el proyecto para que `.onOpenURL` reciba las llamadas.** Configúralo en la configuración del target antes de probar el deep link.

---

## Ejercicios de evaluación

### Ejercicio 1: Ventaja de NavigationPath

**Enunciado:** ¿qué ventaja da `NavigationPath` sobre el manejo de navegación basado en `NavigationLink` anidados del SwiftUI antiguo?

**Solución esperada:** permite manipular el stack de navegación completo desde código imperativo (agregar, quitar, resetear), habilitando casos de uso como deep linking a varios niveles de profundidad o resetear el stack completo, que serían difíciles de expresar dependiendo únicamente de `NavigationLink` anidados en cada vista.

**Criterios de éxito:**
- Explica correctamente la manipulación programática del stack como la ventaja de `NavigationPath`.

### Ejercicio 2: Cuándo usar sheet vs full screen cover

**Enunciado:** ¿cuándo usarías un sheet en vez de un full screen cover?

**Solución esperada:** para acciones complementarias o formularios que el usuario puede abandonar fácilmente sin perder su contexto de navegación previo, reservando el full screen cover para flujos deliberadamente obligatorios que requieren la atención completa del usuario.

**Criterios de éxito:**
- Distingue correctamente el nivel de intensidad de interrupción apropiado para cada uno.

### Ejercicio 3: Qué logra el deep linking

**Enunciado:** ¿qué logra configurar deep linking con `.onOpenURL` en una app SwiftUI?

**Solución esperada:** permite que una entrada externa (notificación, link compartido) lleve al usuario directamente al contenido relevante navegando programáticamente al punto correspondiente, en vez de aterrizar en la pantalla principal requiriendo navegación manual adicional.

**Criterios de éxito:**
- Explica correctamente la llegada directa al contenido relevante como el logro del deep linking.

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

## Resumen del módulo

**Puntos clave**

- `NavigationStack` con `.navigationDestination(for:)` declara qué vista corresponde a cada tipo de dato agregado al stack.
- `NavigationPath` habilita navegación programática, útil para deep linking y flujos complejos que no siguen el camino natural de taps.
- Sheets y full screen covers comunican distintos niveles de intensidad de interrupción; cada pestaña de una `TabView` debería anidar su propio `NavigationStack`.
- `.onOpenURL` mapea entradas externas directamente a puntos específicos de navegación.

**Conceptos aprendidos**

- `NavigationStack` y `NavigationPath`.
- Sheets y full screen covers.
- `TabView`.
- Deep linking.
- Controles de formulario y gestos de swipe/delete.

**Próximos pasos**

En el Módulo 4 aprenderás concurrencia moderna con `async`/`await`, actors y `TaskGroup`, reemplazando GCD y callbacks con un modelo estructurado y seguro.

**Recursos adicionales**

- Documentación oficial de navegación en SwiftUI (developer.apple.com/documentation/swiftui/navigation).
