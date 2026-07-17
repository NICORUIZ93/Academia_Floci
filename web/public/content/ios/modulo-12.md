# Módulo 12: Proyecto integrador: app SwiftUI completa

## Sílabo

**Objetivo general**

Unir SwiftUI, concurrencia moderna, networking y persistencia en una app real, integrando arquitectura MVVM, `async`/`await` con manejo de errores tipado, persistencia con SwiftData, y una suite de tests de la capa de dominio con Swift Testing.

**Objetivos específicos**

1. Diseñar la arquitectura MVVM completa: Vistas, ViewModels `@Observable`, Servicios/Repositorios.
2. Implementar networking real con `URLSession` + `async`/`await` y manejo de errores tipado.
3. Persistir datos localmente con SwiftData, sincronizados con la API.
4. Escribir tests de la capa de dominio con Swift Testing.
5. Subir un build a TestFlight para pruebas internas.

**Contenido**

- Arquitectura MVVM.
- Networking con `async`/`await`.
- Persistencia con SwiftData.
- Tests de la capa de dominio.

**Evaluación**

App iOS con SwiftUI, datos reales, persistencia local y tests, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Arquitectura del proyecto integrador

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

**Diagrama:**

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

## Proyecto transversal RutaFlow: Tracking de ruta y privacidad

RutaFlow conecta este track con una plataforma completa de paquetería. La implementación de referencia está en `examples/rutaflow/ios/LocationPolicy.swift`; se estudia como punto de partida pequeño, no como sistema terminado.

### Capacidad y fundamento

La política pura decide intervalo y distancia antes de tocar Core Location. `Duration` y nombres con unidad evitan números ambiguos. La app solicita permiso en contexto, detiene tracking fuera de jornada y reduce precisión/frecuencia según batería; background location requiere beneficio visible y configuración justificada.

### Implementación guiada

1. Copia el contrato y escribe primero casos normales, límite, inválidos y duplicados.
2. Ejecuta la referencia, provoca un fallo y explica el mensaje antes de modificarla.
3. Implementa una mejora pequeña manteniendo nombres de dominio, efectos visibles y errores tipados.
4. Integra con el contrato del track anterior sin compartir tablas, estado mutable ni detalles de framework.
5. Registra la decisión en el README y etiqueta el hito de RutaFlow correspondiente.

### Verificación profesional

Implementa un adaptador `CLLocationManager`, prueba autorización denegada/restringida, accuracy reducida, pausa y relanzamiento. Usa GPX para simular ruta, Energy Log para comparar políticas y redacción de logs para impedir coordenadas precisas.

El capítulo se completa cuando la evidencia permite a otra persona reproducir el flujo y explicar qué garantías ofrece y cuáles todavía no.

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

## Ejercicios de evaluación

### Ejercicio 1: Decisión más natural en SwiftUI

**Enunciado:** ¿qué decisión de arquitectura te resultó más natural en SwiftUI comparado con otros frameworks que conozcas?

**Solución esperada:** una respuesta válida identifica un aspecto específico de SwiftUI (por ejemplo, la integración de `@Observable` directamente con el sistema de tipos de Swift, o la verificación de exhaustividad de enums en el manejo de estado) y lo compara razonadamente con el enfoque equivalente en otro framework conocido (Compose, React).

**Criterios de éxito:**
- Identifica un aspecto concreto de SwiftUI y lo compara de forma razonada con otro framework.

### Ejercicio 2: Parte que requirió más iteración

**Enunciado:** ¿qué parte del proyecto (concurrencia, persistencia, testing) requirió más iteración para sentirse "correcta"?

**Solución esperada:** una respuesta válida identifica una dificultad concreta (por ejemplo, coordinar correctamente la cancelación de tareas async al navegar entre pantallas, o sincronizar el `ModelContext` de SwiftData con las actualizaciones de red sin duplicar datos) y explica cómo se resolvió iterativamente.

**Criterios de éxito:**
- Identifica una dificultad de integración específica y razonada, no una respuesta genérica sin justificación.

### Ejercicio 3: Los tres pilares de una app iOS nativa

**Enunciado:** ¿qué combinación de características hace que una app iOS se perciba genuinamente "nativa" de la plataforma?

**Solución esperada:** la combinación de seguridad de tipos incorporada desde el diseño del lenguaje (optionals, enums exhaustivos), concurrencia estructurada sin callbacks anidados (`async`/`await`, actors, `TaskGroup`), y una UI declarativa sincronizada automáticamente con el estado sin código manual de actualización (`@Observable`, `@Query`).

**Criterios de éxito:**
- Menciona al menos dos de los tres pilares (seguridad de tipos, concurrencia estructurada, UI reactiva) como parte de la respuesta.

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

- El proyecto integrador combina modelado de dominio, navegación, concurrencia, persistencia, arquitectura MVVM y testing en un único sistema coherente.
- El ViewModel orquesta tanto la red como la persistencia local sin que la vista conozca ninguna de las dos directamente.
- Una app iOS "nativa" combina seguridad de tipos, concurrencia estructurada, y UI reactiva sincronizada automáticamente.
- Reflexionar sobre las decisiones de arquitectura consolida qué es específico de SwiftUI frente a principios universales de UI declarativa.

**Conceptos aprendidos**

- Arquitectura MVVM.
- Networking con `async`/`await`.
- Persistencia con SwiftData.
- Tests de la capa de dominio.

**Próximos pasos**

Con el track de iOS completo, los mismos principios de arquitectura (MVVM, offline-first, concurrencia estructurada, testing) reaparecerán en Kotlin Multiplatform si decides compartir lógica de negocio entre Android e iOS, y en el track de Flutter con un enfoque de UI compartida completa entre plataformas.

**Recursos adicionales**

- Guía oficial de arquitectura de apps de Apple (developer.apple.com/documentation/xcode/architecting-your-app).
