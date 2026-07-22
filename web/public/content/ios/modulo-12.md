# Módulo 12: Proyecto integrador: app SwiftUI completa


## Aprende construyendo

### Tema 1: Arquitectura del proyecto integrador

#### Paso 1 · Objetivo y preparación
Al finalizar podrás ensamblar una app iOS desde cero. Prerrequisitos: macOS, Xcode, Swift y un simulador. Verifica xcodebuild -version.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, la app integra UI, ubicación, red, persistencia, concurrencia, pruebas y publicación sin perder datos offline.

#### Paso 3 · Teoría, modelo mental y analogía
El proyecto integra capas con ownership claro: vista, estado, caso de uso, repositorio y adaptadores. La analogía es una central móvil: cada estación tiene contrato, cola y evidencia.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-ios-m12
cd ejemplo-ios-m12
swift package init --type executable
swift test
```
En Xcode crea Sources/DeliveryList.swift y una app SwiftUI con DeliveryList, ViewModel, URLSession y SwiftData; implementa primero un flujo local y documenta cada archivo.

#### Paso 5 · Práctica guiada
Pista: corta deliberadamente la red para provocar un fallo deliberado de sincronización; diagnostica y muestra datos cacheados. Resultado esperado: UI recuperable y estado consistente.

#### Paso 6 · Práctica independiente
Añade ubicación simulada, reintentos, cancelación, migración, tests y una pantalla de accesibilidad; escribe README con comandos y decisiones.

#### Paso 7 · Cierre y evidencia
Guarda capturas, tests, logs y archive; como siguiente paso aplica la revisión a Android o Flutter. Errores comunes: lógica en View, cache sin invalidación, permisos tardíos, tareas sin cancelar y no probar offline. Fuentes oficiales: https://developer.apple.com/documentation/swiftui y https://developer.apple.com/documentation/foundation/urlsession.
**¿Por qué es importante?** Porque integrar capacidades muestra que puedes construir una app completa, no solo pantallas aisladas.
**Evidencia de aprendizaje:** entrega aplicación, flujo offline, pruebas, archive y retrospectiva; explica el resultado y conserva la salida.
**Conceptos clave:** cada módulo del track como una pieza que encaja en un sistema mayor coherente.

```
Vistas/         ← SwiftUI puro
ViewModels/      ← @Observable, orquesta servicios (módulo 8)
Servicios/        ← URLSession + async/await (módulo 5)
Persistencia/      ← SwiftData (módulo 6)
Dominio/            ← structs/enums puros (módulo 0)
Tests/                ← Swift Testing sobre la capa de dominio (módulo 9)
```

Este proyecto integra directamente cada concepto estudiado a lo largo del track en un único sistema coherente: el modelado de dominio seguro con structs y enums sin force-unwrap (Módulo 0) forma la base de los tipos que fluyen entre capas; la navegación con `NavigationStack` y al menos un sheet (Módulo 3) estructura las pantallas; la concurrencia estructurada con `async`/`await` y `TaskGroup` (Módulo 4) resuelve el networking de forma segura; la persistencia local reactiva con SwiftData (Módulo 6) cierra el ciclo offline; la arquitectura MVVM con inyección de dependencias por inicializador (Módulo 8) organiza todo el código en capas testeables; y los tests de la capa de dominio con Swift Testing (Módulo 9) dan confianza real antes de subir el build a TestFlight (Módulo 11).

Esta integración demuestra que cada concepto estudiado de forma aislada en su propio módulo encaja naturalmente como parte de un sistema mayor, reflejando cómo se construyen apps iOS profesionales reales: no como una colección de features aisladas, sino como capas que se comunican de forma predecible entre sí, cada una con una responsabilidad clara y bien delimitada.

**Analogía:** el proyecto integrador es como el ensamblaje final de un vehículo donde cada componente estudiado por separado (motor, transmisión, sistema eléctrico) se integra en un producto funcional completo, y solo al ensamblarlos todos juntos se puede verificar que realmente funcionan de forma coordinada como se esperaba de cada uno individualmente.

**¿Por qué es importante?** Integrar cada módulo del track en un proyecto real demuestra que los conceptos estudiados por separado (modelado de dominio, navegación, concurrencia, persistencia, arquitectura, testing) se combinan naturalmente en un sistema coherente, reflejando cómo se construyen apps iOS profesionales reales.

**Diagrama:**

```
Vistas/         ← SwiftUI puro
ViewModels/      ← @Observable, orquesta servicios
Servicios/        ← URLSession + async/await
Persistencia/      ← SwiftData
Dominio/            ← structs/enums puros
Tests/                ← Swift Testing
```

### Tema 2: Sincronización entre red y persistencia local

#### Paso 1 · Objetivo y preparación
Al finalizar podrás ensamblar una app iOS desde cero. Prerrequisitos: macOS, Xcode, Swift y un simulador. Verifica xcodebuild -version.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, la app integra UI, ubicación, red, persistencia, concurrencia, pruebas y publicación sin perder datos offline.

#### Paso 3 · Teoría, modelo mental y analogía
El proyecto integra capas con ownership claro: vista, estado, caso de uso, repositorio y adaptadores. La analogía es una central móvil: cada estación tiene contrato, cola y evidencia.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-ios-m12
cd ejemplo-ios-m12
swift package init --type executable
swift test
```
En Xcode crea Sources/DeliveryList.swift y una app SwiftUI con DeliveryList, ViewModel, URLSession y SwiftData; implementa primero un flujo local y documenta cada archivo.

#### Paso 5 · Práctica guiada
Pista: corta deliberadamente la red para provocar un fallo deliberado de sincronización; diagnostica y muestra datos cacheados. Resultado esperado: UI recuperable y estado consistente.

#### Paso 6 · Práctica independiente
Añade ubicación simulada, reintentos, cancelación, migración, tests y una pantalla de accesibilidad; escribe README con comandos y decisiones.

#### Paso 7 · Cierre y evidencia
Guarda capturas, tests, logs y archive; como siguiente paso aplica la revisión a Android o Flutter. Errores comunes: lógica en View, cache sin invalidación, permisos tardíos, tareas sin cancelar y no probar offline. Fuentes oficiales: https://developer.apple.com/documentation/swiftui y https://developer.apple.com/documentation/foundation/urlsession.
**¿Por qué es importante?** Porque integrar capacidades muestra que puedes construir una app completa, no solo pantallas aisladas.
**Evidencia de aprendizaje:** entrega aplicación, flujo offline, pruebas, archive y retrospectiva; explica el resultado y conserva la salida.
**Conceptos clave:** el ViewModel orquesta ambas fuentes, sin que la vista conozca ninguna de las dos directamente.

```swift
@Observable
class TareasViewModel {
    var tareas: [Tarea] = []
    private let servicio: ServicioTareas
    private let context: ModelContext

    func sincronizar() async {
        guard let remotas = try? await servicio.obtenerTodas() else { return }
        remotas.forEach { context.insert($0) }
        try? context.save()
    }
}
```

El `TareasViewModel` del proyecto integrador orquesta ambas fuentes de datos (el servicio de red y el `ModelContext` de SwiftData) sin que la vista necesite conocer ninguno de los dos directamente: la vista simplemente observa `viewModel.tareas` (poblado por `@Query` en la vista, o expuesto directamente desde el ViewModel según la variante de diseño elegida) y llama a `viewModel.sincronizar()` cuando corresponde, sin ninguna referencia directa a `URLSession` ni a `ModelContext` en el código de la vista misma; esta separación es exactamente el mismo principio de "cada capa con una única responsabilidad, comunicándose en una única dirección" aplicado en el proyecto integrador de Android con Room y Retrofit (Módulo 12 de ese track).

El manejo de errores con `try?` en `sincronizar()` refleja una decisión deliberada de degradación silenciosa ante un fallo de sincronización (la app simplemente continúa mostrando los últimos datos locales conocidos si la sincronización falla), apropiada para una operación de background no crítica, en contraste con un error que sí requeriría propagarse explícitamente a la UI si ocurriera durante una acción directa del usuario (como guardar un formulario).

**Analogía:** el ViewModel orquestando ambas fuentes es como un gerente de logística que coordina tanto el almacén local (SwiftData) como los proveedores externos (la API remota) sin que el personal de ventas (la vista) necesite tratar directamente con ninguno de los dos: simplemente consulta el inventario disponible y solicita una actualización cuando corresponde.

**¿Por qué es importante?** Mantener la orquestación entre red y persistencia local completamente dentro del ViewModel, sin que la vista conozca ninguna de las dos fuentes directamente, preserva la separación estricta de responsabilidades que hace que cada capa sea testeable y reemplazable de forma independiente.

**Código del ejemplo:**

```swift
@Observable
class TareasViewModel {
    func sincronizar() async {
        guard let remotas = try? await servicio.obtenerTodas() else { return }
        remotas.forEach { context.insert($0) }
        try? context.save()
    }
}
```

### Tema 3: Cierre del track

#### Paso 1 · Objetivo y preparación
Al finalizar podrás ensamblar una app iOS desde cero. Prerrequisitos: macOS, Xcode, Swift y un simulador. Verifica xcodebuild -version.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, la app integra UI, ubicación, red, persistencia, concurrencia, pruebas y publicación sin perder datos offline.

#### Paso 3 · Teoría, modelo mental y analogía
El proyecto integra capas con ownership claro: vista, estado, caso de uso, repositorio y adaptadores. La analogía es una central móvil: cada estación tiene contrato, cola y evidencia.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-ios-m12
cd ejemplo-ios-m12
swift package init --type executable
swift test
```
En Xcode crea Sources/DeliveryList.swift y una app SwiftUI con DeliveryList, ViewModel, URLSession y SwiftData; implementa primero un flujo local y documenta cada archivo.

#### Paso 5 · Práctica guiada
Pista: corta deliberadamente la red para provocar un fallo deliberado de sincronización; diagnostica y muestra datos cacheados. Resultado esperado: UI recuperable y estado consistente.

#### Paso 6 · Práctica independiente
Añade ubicación simulada, reintentos, cancelación, migración, tests y una pantalla de accesibilidad; escribe README con comandos y decisiones.

#### Paso 7 · Cierre y evidencia
Guarda capturas, tests, logs y archive; como siguiente paso aplica la revisión a Android o Flutter. Errores comunes: lógica en View, cache sin invalidación, permisos tardíos, tareas sin cancelar y no probar offline. Fuentes oficiales: https://developer.apple.com/documentation/swiftui y https://developer.apple.com/documentation/foundation/urlsession.
**¿Por qué es importante?** Porque integrar capacidades muestra que puedes construir una app completa, no solo pantallas aisladas.
**Evidencia de aprendizaje:** entrega aplicación, flujo offline, pruebas, archive y retrospectiva; explica el resultado y conserva la salida.
**Conceptos clave:** lo que hace que una app "se sienta nativa" en el sentido más profundo.

Una app iOS "completa" combina precisamente lo que Swift y SwiftUI hacen especialmente bien y que se ha estudiado a lo largo de todo el track: seguridad de tipos incorporada desde el diseño mismo del lenguaje (optionals, enums exhaustivos, Módulo 0), concurrencia estructurada que elimina por completo el anidamiento de callbacks tradicional (`async`/`await`, actors, `TaskGroup`, Módulo 4), y una UI declarativa que se mantiene automáticamente sincronizada con el estado subyacente sin código manual de actualización (`@Observable`, `@Query`, Módulos 2 y 6); el resultado combinado de estos tres pilares se percibe, de forma bastante literal, como genuinamente "nativo" de la plataforma, no simplemente como una app funcional construida con las herramientas de Apple.

Reflexionar sobre qué decisión de arquitectura resultó más natural en SwiftUI comparado con otros frameworks conocidos (Compose en Android, React en la web) es un ejercicio valioso para consolidar qué aspectos son genuinamente específicos del ecosistema Apple (la integración nativa de `@Observable` con el sistema de tipos de Swift, la verificación de exhaustividad de los enums) frente a principios universales de UI declarativa moderna (composición de vistas, estado como fuente de verdad, flujo unidireccional de datos) que simplemente se expresan con sintaxis distinta en cada plataforma estudiada a lo largo de la Academia.

**Analogía:** una app iOS completa es como una pieza musical interpretada con instrumentos específicamente diseñados para resaltar sus fortalezas naturales (seguridad de tipos, concurrencia estructurada, UI reactiva), en vez de forzar un estilo genérico que ignora las capacidades particulares de la plataforma para la que fue compuesta.

**¿Por qué es importante?** Cerrar el track integrando todos los conceptos en un proyecto real consolida que una app iOS profesional requiere la combinación de seguridad de tipos, concurrencia estructurada, y UI reactiva sincronizada automáticamente, los tres pilares que hacen que una app se perciba genuinamente nativa de la plataforma.

**Diagrama:**

```
App iOS "nativa" =
  seguridad de tipos (optionals, enums exhaustivos)
  + concurrencia estructurada (async/await, actors, TaskGroup)
  + UI reactiva sincronizada automáticamente (@Observable, @Query)
```

---

## Laboratorio práctico

**Objetivo del laboratorio:** construir una app iOS con SwiftUI, datos reales, persistencia local y tests.

**Requisitos previos:** Módulos 0-11 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Diseñar la arquitectura MVVM completa | Ver Tema 1 | Vistas, ViewModels, Servicios, Dominio |
| 2 | Implementar networking con `URLSession` + `async`/`await` | Ver Tema 2 | Con manejo de errores tipado |
| 3 | Persistir datos localmente con SwiftData | Ver Tema 2 | Sincronizados con la API |
| 4 | Escribir tests de la capa de dominio | Ver Módulo 9 | Con Swift Testing |
| 5 | Subir un build a TestFlight | Ver Módulo 11 | Para pruebas internas |

**Verificación:** el proyecto se considera exitoso si la app funciona correctamente con datos persistidos localmente incluso sin conexión (mostrando el último caché sincronizado), si el ViewModel orquesta ambas fuentes sin que la vista conozca ninguna directamente, y si la suite de tests de dominio pasa consistentemente con Swift Testing.

**Errores comunes y soluciones**

- **Hacer que la vista acceda directamente a `URLSession` o `ModelContext`.** Rompe la separación de capas; toda orquestación debe pasar por el ViewModel.
- **Propagar errores de sincronización en background directamente a la UI de forma intrusiva.** Considera una degradación silenciosa apropiada para operaciones no críticas.
- **Omitir tests de la capa de dominio, confiando solo en probar manualmente en el simulador.** Los tests dan confianza repetible antes de cada subida a TestFlight.

---
