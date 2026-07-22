# Módulo 6: Persistencia con SwiftData


## Aprende construyendo

### Tema 1: @Model y ModelContainer

#### Paso 1 · Objetivo y preparación
Al finalizar podrás persistir datos SwiftUI desde cero. Prerrequisitos: macOS, Xcode y Swift. Verifica xcodebuild -version.

#### Paso 2 · Contexto y caso real
En un caso real, la app guarda borradores y estados offline, pero debe migrar el esquema sin perder entregas.

#### Paso 3 · Teoría, modelo mental y analogía
SwiftData usa @Model para describir persistencia, ModelContainer para contexto y @Query para lecturas reactivas. Migraciones deben versionarse; Core Data ofrece control más antiguo y amplio. La analogía es un archivo histórico: cada cambio de formato conserva datos y deja registro.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-ios-m6
cd ejemplo-ios-m6
swift package init --type executable
swift run
```
Crea Sources/DeliveryModel.swift y un proyecto SwiftUI en Xcode con modelo Delivery @Model, ModelContainer y una vista que inserte y consulte; documenta contexto y persistencia.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente un campo requerido para provocar un fallo deliberado de migración o guardado; observa el error y corrígelo con una versión compatible. Resultado esperado: datos persistidos y consulta estable.

#### Paso 6 · Práctica independiente
Añade relación Driver-Delivery, borrador offline, migración versionada y una comparación con Core Data.

#### Paso 7 · Cierre y evidencia
Guarda modelo, capturas, logs y migración; como siguiente paso estudia notificaciones. Errores comunes: guardar UI en modelo, cambios destructivos, contexto en hilo incorrecto y no probar datos antiguos. Fuentes oficiales: https://developer.apple.com/documentation/swiftdata y https://developer.apple.com/documentation/coredata.
**¿Por qué es importante?** Porque persistencia transforma decisiones temporales en datos que deben sobrevivir actualizaciones.
**Evidencia de aprendizaje:** entrega modelo, inserción, migración, fallo y consulta.
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

**Código del ejemplo:**

```swift
@Model
class Tarea {
    var titulo: String
    var completada: Bool
}
```

### Tema 2: @Query y operaciones de escritura

#### Paso 1 · Objetivo y preparación
Al finalizar podrás persistir datos SwiftUI desde cero. Prerrequisitos: macOS, Xcode y Swift. Verifica xcodebuild -version.

#### Paso 2 · Contexto y caso real
En un caso real, la app guarda borradores y estados offline, pero debe migrar el esquema sin perder entregas.

#### Paso 3 · Teoría, modelo mental y analogía
SwiftData usa @Model para describir persistencia, ModelContainer para contexto y @Query para lecturas reactivas. Migraciones deben versionarse; Core Data ofrece control más antiguo y amplio. La analogía es un archivo histórico: cada cambio de formato conserva datos y deja registro.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-ios-m6
cd ejemplo-ios-m6
swift package init --type executable
swift run
```
Crea Sources/DeliveryModel.swift y un proyecto SwiftUI en Xcode con modelo Delivery @Model, ModelContainer y una vista que inserte y consulte; documenta contexto y persistencia.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente un campo requerido para provocar un fallo deliberado de migración o guardado; observa el error y corrígelo con una versión compatible. Resultado esperado: datos persistidos y consulta estable.

#### Paso 6 · Práctica independiente
Añade relación Driver-Delivery, borrador offline, migración versionada y una comparación con Core Data.

#### Paso 7 · Cierre y evidencia
Guarda modelo, capturas, logs y migración; como siguiente paso estudia notificaciones. Errores comunes: guardar UI en modelo, cambios destructivos, contexto en hilo incorrecto y no probar datos antiguos. Fuentes oficiales: https://developer.apple.com/documentation/swiftdata y https://developer.apple.com/documentation/coredata.
**¿Por qué es importante?** Porque persistencia transforma decisiones temporales en datos que deben sobrevivir actualizaciones.
**Evidencia de aprendizaje:** entrega modelo, inserción, migración, fallo y consulta.
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

#### Paso 1 · Objetivo y preparación
Al finalizar podrás persistir datos SwiftUI desde cero. Prerrequisitos: macOS, Xcode y Swift. Verifica xcodebuild -version.

#### Paso 2 · Contexto y caso real
En un caso real, la app guarda borradores y estados offline, pero debe migrar el esquema sin perder entregas.

#### Paso 3 · Teoría, modelo mental y analogía
SwiftData usa @Model para describir persistencia, ModelContainer para contexto y @Query para lecturas reactivas. Migraciones deben versionarse; Core Data ofrece control más antiguo y amplio. La analogía es un archivo histórico: cada cambio de formato conserva datos y deja registro.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-ios-m6
cd ejemplo-ios-m6
swift package init --type executable
swift run
```
Crea Sources/DeliveryModel.swift y un proyecto SwiftUI en Xcode con modelo Delivery @Model, ModelContainer y una vista que inserte y consulte; documenta contexto y persistencia.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente un campo requerido para provocar un fallo deliberado de migración o guardado; observa el error y corrígelo con una versión compatible. Resultado esperado: datos persistidos y consulta estable.

#### Paso 6 · Práctica independiente
Añade relación Driver-Delivery, borrador offline, migración versionada y una comparación con Core Data.

#### Paso 7 · Cierre y evidencia
Guarda modelo, capturas, logs y migración; como siguiente paso estudia notificaciones. Errores comunes: guardar UI en modelo, cambios destructivos, contexto en hilo incorrecto y no probar datos antiguos. Fuentes oficiales: https://developer.apple.com/documentation/swiftdata y https://developer.apple.com/documentation/coredata.
**¿Por qué es importante?** Porque persistencia transforma decisiones temporales en datos que deben sobrevivir actualizaciones.
**Evidencia de aprendizaje:** entrega modelo, inserción, migración, fallo y consulta.
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
