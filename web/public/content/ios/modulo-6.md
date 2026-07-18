# Módulo 6: Persistencia con SwiftData

## Sílabo

**Objetivo general**

Persistir datos localmente con SwiftData, el framework moderno de Apple construido sobre el mismo motor de Core Data, con sintaxis declarativa (`@Model`, `@Query`) que reduce drásticamente la configuración manual antes necesaria.

**Objetivos específicos**

1. Definir un modelo con `@Model` y configurar el `ModelContainer`.
2. Usar `@Query` para observar automáticamente cambios en los datos.
3. Insertar, actualizar y eliminar registros a través del `ModelContext`.
4. Documentar cómo SwiftData maneja la migración de esquema.

**Contenido**

- `@Model` y el esquema de SwiftData.
- Queries con `@Query`.
- Migraciones de esquema.
- Relación con Core Data (cuándo usar cada uno).

**Evaluación**

App con persistencia local en SwiftData y una vista que reacciona a cambios, más tres ejercicios de evaluación.

---

## Comienza desde cero: prepara este capítulo

Este recorrido parte de una carpeta vacía. Al finalizar tendrás **App con persistencia local en SwiftData y una vista que reacciona a cambios, más tres ejercicios de evaluación.** No avances ejecutando comandos que no comprendes: primero identifica la entrada, la transformación y la evidencia que comprobará el resultado.

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
│  └─ module-6/
├─ tests/
├─ docs/decisions/
├─ evidence/module-6/
└─ README.md
```

| Tema | Archivo o decisión | Evidencia mínima |
|---|---|---|
| 1. @Model y ModelContainer | `Features/module-6/topic-1-model-y-modelcontainer.swift` | prueba + salida observable |
| 2. @Query y operaciones de escritura | `Features/module-6/topic-2-query-y-operaciones-de-escritura.swift` | prueba + salida observable |
| 3. Migraciones y SwiftData vs Core Data | `Features/module-6/topic-3-migraciones-y-swiftdata-vs-core-data.swift` | prueba + salida observable |

Un ejemplo técnico vive en el archivo indicado y debe tener una prueba. Un tema conceptual vive en `docs/decisions/`: compara opciones usando restricciones medibles; no escribas código decorativo solo para llenar espacio.

### 4. Ejecuta una línea base

Desde `academia-labs/ios-app`:

```bash
xcodebuild test -scheme RutaFlowLab -destination 'platform=iOS Simulator,name=iPhone 16'
```

**Resultado esperado:** el comando reconoce el proyecto y termina sin errores antes de introducir el cambio del capítulo. Después del incremento, la evidencia debe demostrar: **App con persistencia local en SwiftData y una vista que reacciona a cambios, más tres ejercicios de evaluación.**

Si falla la línea base, no continúes. Localiza el primer mensaje que indique archivo, línea o dependencia; formula una causa y compruébala con un cambio pequeño.

### 5. Provoca un fallo y recupérate

Simula permiso denegado, respuesta vacía o tarea cancelada; verifica estado y mensaje. SwiftUI requiere macOS. Guarda en `evidence/module-6/` el comando, la salida relevante, tu hipótesis y la corrección. Revierte únicamente el cambio deliberado; no borres todo el proyecto para ocultar la causa.

### 6. Conecta el capítulo con RutaFlow

Aplica el aprendizaje de **Persistencia con SwiftData** a un incremento vertical de RutaFlow. Define qué componente produce el dato, qué contrato lo transporta, quién lo consume y cómo observarás un fallo. La entrega final incluye archivo o decisión, prueba, salida, error corregido y una limitación que todavía validarías en producción.

---

## Contenido teórico

### Tema 1: @Model y ModelContainer

**Conceptos clave:** declaración de esquema mediante macros, sin configuración manual de `NSManagedObject`.

```swift
@Model
class Tarea {
    var titulo: String
    var completada: Bool
    init(titulo: String, completada: Bool = false) {
        self.titulo = titulo
        self.completada = completada
    }
}
```

```swift
WindowGroup { ContentView() }
    .modelContainer(for: Tarea.self)
```

`@Model` es una macro de Swift que transforma una clase ordinaria en una entidad persistente completa de SwiftData, generando automáticamente todo el código de infraestructura necesario (conformidad a los protocolos internos requeridos, integración con el `ModelContext`) sin que el desarrollador escriba manualmente ese código repetitivo; esto contrasta marcadamente con configurar Core Data directamente, donde definir una entidad equivalente requería crear una subclase de `NSManagedObject`, declarar su esquema en un archivo `.xcdatamodeld` separado mediante una interfaz gráfica, y mantener sincronizados ambos artefactos (el código Swift y el archivo de modelo) manualmente.

`.modelContainer(for: Tarea.self)` en el punto de entrada de la app configura el contenedor de persistencia raíz para el esquema completo, análogo conceptualmente a `@Database` en Room (Módulo 6 del track de Android), estableciendo dónde y cómo se almacenan físicamente los datos persistentes de la app.

**Analogía:** `@Model` es como una plantilla arquitectónica que genera automáticamente todos los planos técnicos detallados de construcción a partir de una descripción simple de alto nivel del edificio deseado, en vez de requerir que un ingeniero dibuje manualmente cada plano técnico por separado y los mantenga sincronizados con la descripción original.

**¿Por qué es importante?** `@Model` simplifica drásticamente la definición de una entidad persistente frente a configurar Core Data manualmente (`NSManagedObject`, `NSFetchRequest`), generando la infraestructura necesaria automáticamente mediante una macro declarativa.

**Diagrama:**

```swift
@Model
class Tarea {
    var titulo: String
    var completada: Bool
}
```

### Tema 2: @Query y operaciones de escritura

**Conceptos clave:** observación automática de la fuente de verdad persistida.

```swift
struct ListaTareasView: View {
    @Query private var tareas: [Tarea] // se actualiza automáticamente cuando los datos cambian
    var body: some View { List(tareas) { Text($0.titulo) } }
}
```

`@Query` en una vista SwiftUI observa automáticamente los datos persistidos por SwiftData, actualizando la vista cada vez que esos datos cambian (una inserción, actualización o eliminación) sin que el desarrollador escriba ningún mecanismo de notificación de cambios manual, el mismo principio que un DAO reactivo devolviendo `Flow` en Room (Módulo 6 del track de Android): la UI se mantiene sincronizada automáticamente con la fuente de verdad persistida, cerrando el ciclo completo desde la base de datos hasta la pantalla.

```swift
@Environment(\.modelContext) private var context

context.insert(Tarea(titulo: "Nueva tarea"))
context.delete(tarea)
try? context.save()
```

`ModelContext`, inyectado vía `@Environment` (Módulo 2), es el objeto a través del cual se realizan todas las operaciones de escritura (inserción, eliminación, y la actualización de propiedades directamente sobre los objetos `@Model` obtenidos, dado que son referencias vivas gestionadas por el contexto); `try? context.save()` persiste esos cambios pendientes de forma explícita al almacenamiento subyacente, aunque SwiftData también realiza guardados automáticos periódicos según ciertas condiciones internas.

**Analogía:** `@Query` es como una pantalla de monitoreo que se actualiza sola en tiempo real cada vez que algo cambia en el almacén subyacente, sin que un operador tenga que refrescarla manualmente; `ModelContext` es como el libro de registro oficial a través del cual se asientan todos los movimientos de entrada y salida del almacén.

**¿Por qué es importante?** `@Query` mantiene la vista sincronizada automáticamente con los datos persistidos, sin mecanismos de notificación manual; `ModelContext` centraliza todas las operaciones de escritura y su persistencia explícita al almacenamiento subyacente.

**Diagrama:**

```
SwiftData datos cambian → @Query re-evalúa automáticamente → la vista se actualiza sola
```

### Tema 3: Migraciones y SwiftData vs Core Data

**Conceptos clave:** capa moderna sobre el mismo motor probado, elección según necesidad de control fino.

SwiftData es una capa moderna construida directamente sobre el mismo motor subyacente de Core Data (probado en producción durante más de una década en el ecosistema Apple), reemplazando la sintaxis imperativa y verbosa de `NSManagedObject`/`NSFetchRequest` por macros declarativas de Swift (`@Model`, `@Query`); para proyectos nuevos, SwiftData es generalmente la opción recomendada, dado que ofrece la misma robustez del motor subyacente con una experiencia de desarrollo considerablemente más simple y menos propensa a errores de configuración manual.

Core Data directo sigue siendo relevante en dos escenarios concretos: aplicaciones existentes que ya invirtieron considerablemente en su configuración de Core Data (donde una migración completa a SwiftData no siempre justifica el esfuerzo), y casos que requieren control muy fino sobre aspectos avanzados del stack de persistencia (configuraciones específicas de `NSPersistentContainer`, migraciones de esquema extremadamente complejas con lógica de transformación de datos personalizada) que SwiftData, siendo una capa de más alto nivel, todavía no expone con el mismo nivel de detalle granular que la API original de Core Data.

**Analogía:** SwiftData es como un panel de control moderno y simplificado instalado sobre la misma maquinaria industrial robusta que lleva años funcionando de forma confiable (Core Data); para la mayoría de las operaciones diarias, el panel moderno es más fácil de usar, pero un técnico especializado que necesite ajustar parámetros muy específicos de la maquinaria original podría todavía necesitar acceder directamente a los controles originales más detallados.

**¿Por qué es importante?** SwiftData simplifica drásticamente la configuración frente a Core Data manual sin sacrificar la robustez del motor subyacente; Core Data directo sigue siendo relevante para apps existentes o casos que requieren control muy fino no expuesto todavía por la capa de más alto nivel de SwiftData.

**Diagrama:**

```
Core Data (motor subyacente, probado en producción)
        ↑
SwiftData (@Model, @Query — capa declarativa moderna sobre el mismo motor)
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

**Objetivo del laboratorio:** construir una app con persistencia local en SwiftData y una vista que reacciona a cambios.

**Requisitos previos:** Módulo 5 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Definir un modelo con `@Model` | Ver Tema 1 | Configurar `ModelContainer` en el entry point |
| 2 | Usar `@Query` para observar los datos | Ver Tema 2 | Actualización automática de la vista |
| 3 | Insertar, actualizar y eliminar vía `ModelContext` | Ver Tema 2 | Verifica que la vista se actualiza sola |
| 4 | Agregar un campo nuevo al modelo | Ver Tema 3 | Documenta cómo SwiftData maneja la migración |

**Verificación:** el laboratorio se considera exitoso si la vista con `@Query` se actualiza automáticamente al insertar, actualizar o eliminar un registro a través del `ModelContext`, sin ningún código adicional de notificación manual.

**Errores comunes y soluciones**

- **Configurar Core Data manualmente para un proyecto nuevo sin necesidad concreta de control fino.** Prefiere SwiftData para proyectos nuevos por su simplicidad.
- **Olvidar `try? context.save()` tras cambios que requieren persistencia inmediata.** Aunque SwiftData guarda automáticamente en ciertas condiciones, no asumas que siempre ocurre de inmediato.
- **Modificar un objeto `@Model` fuera de un `ModelContext` válido.** Los objetos `@Model` son referencias vivas gestionadas por su contexto correspondiente.

---

## Ejercicios de evaluación

### Ejercicio 1: Qué simplifica SwiftData

**Enunciado:** ¿qué simplifica SwiftData frente a configurar Core Data manualmente (`NSManagedObject`, `NSFetchRequest`)?

**Solución esperada:** genera automáticamente, mediante macros declarativas (`@Model`, `@Query`), toda la infraestructura de persistencia necesaria, sin requerir definir manualmente subclases de `NSManagedObject` ni mantener sincronizado un archivo de esquema `.xcdatamodeld` separado.

**Criterios de éxito:**
- Explica correctamente la generación automática de infraestructura mediante macros como la simplificación.

### Ejercicio 2: Cuándo preferir Core Data directo

**Enunciado:** ¿cuándo seguirías prefiriendo Core Data directamente sobre SwiftData?

**Solución esperada:** en apps existentes que ya invirtieron considerablemente en su configuración de Core Data, o en casos que requieren control muy fino sobre aspectos avanzados del stack de persistencia que SwiftData, como capa de más alto nivel, todavía no expone con el mismo nivel de detalle.

**Criterios de éxito:**
- Menciona correctamente apps existentes y/o necesidad de control fino como razones válidas.

### Ejercicio 3: Ventaja de un DAO/Query reactivo

**Enunciado:** ¿qué ventaja da que `@Query` observe automáticamente los datos persistidos, comparado con consultarlos manualmente cada vez?

**Solución esperada:** la vista se actualiza automáticamente cada vez que los datos subyacentes cambian (inserción, actualización, eliminación), sin que el desarrollador escriba ningún mecanismo de notificación de cambios manual ni vuelva a consultar explícitamente los datos.

**Criterios de éxito:**
- Explica correctamente la actualización automática sin notificación manual como la ventaja.

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

- `@Model` genera automáticamente la infraestructura de persistencia necesaria mediante una macro declarativa, sin configuración manual de Core Data.
- `@Query` mantiene la vista sincronizada automáticamente con los datos persistidos; `ModelContext` centraliza las operaciones de escritura.
- SwiftData es una capa moderna sobre el mismo motor de Core Data, recomendada para proyectos nuevos por su simplicidad.
- Core Data directo sigue siendo relevante para apps existentes o casos que requieren control muy fino no expuesto por SwiftData.

**Conceptos aprendidos**

- `@Model` y el esquema de SwiftData.
- `@Query`.
- Migraciones de esquema.
- Relación con Core Data.

**Próximos pasos**

En el Módulo 7 aprenderás Combine, el modelo de programación reactiva que precedió a `async`/`await` en el ecosistema Apple y que sigue presente en mucho código real.

**Recursos adicionales**

- Documentación oficial de SwiftData (developer.apple.com/documentation/swiftdata).
