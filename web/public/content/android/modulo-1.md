# Módulo 1: Ciclo de vida: Activities y ViewModel

## Sílabo

**Objetivo general**

Dominar el ciclo de vida de Android, la fuente más común de bugs para desarrolladores nuevos, y entender cómo `ViewModel` y `SavedStateHandle` ofrecen dos niveles distintos de supervivencia frente a rotación de pantalla y muerte de proceso.

**Objetivos específicos**

1. Observar el orden de los callbacks del ciclo de vida de una Activity.
2. Confirmar experimentalmente que el estado en un composable simple se pierde al rotar.
3. Mover ese estado a un `ViewModel` y confirmar que sobrevive a la rotación.
4. Usar `SavedStateHandle` para sobrevivir incluso a la muerte del proceso.
5. Identificar el evento del ciclo de vida correcto para liberar recursos costosos.

**Contenido**

- Ciclo de vida de Activity/Fragment.
- `ViewModel` y supervivencia a rotación.
- `SavedStateHandle`.
- Lifecycle-aware components.

**Evaluación**

Pantalla que sobrevive a rotación de pantalla sin perder estado, usando `ViewModel`, más tres ejercicios de evaluación.

---

## Comienza desde cero: prepara este capítulo

Este recorrido parte de una carpeta vacía. Al finalizar tendrás **Pantalla que sobrevive a rotación de pantalla sin perder estado, usando `ViewModel`, más tres ejercicios de evaluación.** No avances ejecutando comandos que no comprendes: primero identifica la entrada, la transformación y la evidencia que comprobará el resultado.

### 1. Comprueba las herramientas

Los comandos funcionan en macOS, Linux y WSL. En PowerShell usa el equivalente indicado por la herramienta.

```bash
java --version
./gradlew --version
adb version
```

Si un comando no existe, detente e instala esa herramienta desde su sitio oficial. Cierra y abre la terminal después de modificar `PATH`. Las versiones deben ser compatibles entre sí antes de crear archivos.

### 2. Crea o recupera el proyecto del track

```bash
# Android Studio: New Project → Empty Activity → Kotlin + Compose
cd academia-labs/android-app
git init
./gradlew tasks
```

Trabaja dentro de `academia-labs/android-app`. Si ya existe, no lo vuelvas a generar: entra en la carpeta, confirma `git status` y continúa sobre una rama propia.

### 3. Ubica cada tema antes de escribir

```text
academia-labs/android-app/
├─ app/src/main/java/academy/
│  └─ module-1/
├─ tests/
├─ docs/decisions/
├─ evidence/module-1/
└─ README.md
```

| Tema | Archivo o decisión | Evidencia mínima |
|---|---|---|
| 1. Ciclo de vida de una Activity | `app/src/main/java/academy/module-1/topic-1-ciclo-de-vida-de-una-activity.kt` | prueba + salida observable |
| 2. ViewModel sobrevive a la rotación | `app/src/main/java/academy/module-1/topic-2-viewmodel-sobrevive-a-la-rotacion.kt` | prueba + salida observable |
| 3. SavedStateHandle | `app/src/main/java/academy/module-1/topic-3-savedstatehandle.kt` | prueba + salida observable |

Un ejemplo técnico vive en el archivo indicado y debe tener una prueba. Un tema conceptual vive en `docs/decisions/`: compara opciones usando restricciones medibles; no escribas código decorativo solo para llenar espacio.

### 4. Ejecuta una línea base

Desde `academia-labs/android-app`:

```bash
./gradlew testDebugUnitTest
```

**Resultado esperado:** el comando reconoce el proyecto y termina sin errores antes de introducir el cambio del capítulo. Después del incremento, la evidencia debe demostrar: **Pantalla que sobrevive a rotación de pantalla sin perder estado, usando `ViewModel`, más tres ejercicios de evaluación.**

Si falla la línea base, no continúes. Localiza el primer mensaje que indique archivo, línea o dependencia; formula una causa y compruébala con un cambio pequeño.

### 5. Provoca un fallo y recupérate

Simula permiso denegado, proceso recreado o dato ausente; verifica que la pantalla conserve un estado comprensible. Guarda en `evidence/module-1/` el comando, la salida relevante, tu hipótesis y la corrección. Revierte únicamente el cambio deliberado; no borres todo el proyecto para ocultar la causa.

### 6. Conecta el capítulo con RutaFlow

Aplica el aprendizaje de **Ciclo de vida: Activities y ViewModel** a un incremento vertical de RutaFlow. Define qué componente produce el dato, qué contrato lo transporta, quién lo consume y cómo observarás un fallo. La entrega final incluye archivo o decisión, prueba, salida, error corregido y una limitación que todavía validarías en producción.

---

## Contenido teórico

### Tema 1: Ciclo de vida de una Activity

**Conceptos clave:** callbacks predecibles, destrucción y recreación por defecto al rotar.

```
onCreate → onStart → onResume → [en pantalla] → onPause → onStop → onDestroy
```

Cada Activity en Android atraviesa una secuencia predecible de callbacks del ciclo de vida a medida que cambia su visibilidad e interactividad: `onCreate` se ejecuta una única vez al crearse la instancia (donde se infla la UI inicial), `onStart`/`onResume` marcan que la Activity se vuelve visible e interactiva respectivamente, y `onPause`/`onStop`/`onDestroy` marcan la secuencia inversa cuando el usuario navega fuera de ella. Comprender este orden exacto es crítico porque determina en qué momento específico es seguro (o inseguro) realizar ciertas operaciones: iniciar una cámara en `onResume` y liberarla en `onPause` es el patrón correcto, mientras que hacerlo en `onCreate`/`onDestroy` dejaría la cámara activa innecesariamente mientras la app está en background, consumiendo batería sin ningún beneficio para el usuario.

Por defecto, Android **destruye y recrea completamente** la Activity cuando ocurre un cambio de configuración como una rotación de pantalla (el razonamiento histórico es que muchos recursos, como layouts XML alternativos por orientación, requerían recargarse desde cero); esto significa que cualquier variable de estado que viva únicamente en memoria dentro de la Activity o en un composable simple (`var contador by remember { mutableStateOf(0) }` sin persistencia adicional) se pierde por completo en ese proceso de destrucción y recreación, un comportamiento sorprendente para quien no lo conoce y una fuente extremadamente común de bugs reportados como "se resetea la pantalla al girar el teléfono".

**Analogía:** el ciclo de vida de una Activity es como el protocolo de apertura y cierre de una tienda física: hay un orden fijo para abrir (desbloquear, encender luces, poner el cartel de abierto) y otro para cerrar (cartel de cerrado, apagar luces, bloquear), y ciertas operaciones (como activar la alarma) solo tienen sentido en un punto específico de esa secuencia, no en cualquier momento arbitrario.

**¿Por qué es importante?** Conocer el orden exacto del ciclo de vida determina cuándo es seguro iniciar o liberar recursos costosos, y entender que una rotación destruye y recrea la Activity por defecto explica por qué el estado simple se pierde al rotar, motivando la necesidad de `ViewModel`.

**Casos de uso reales:**
- Iniciar la cámara o el GPS en `onResume` y liberarlos en `onPause` para no drenar batería en segundo plano.
- Pausar la reproducción de un video al salir de la pantalla (`onStop`) y reanudarla al volver (`onStart`).
- Diagnosticar el bug clásico de "se resetea el formulario al rotar" identificando dónde vive el estado perdido.

**Diagrama:**

```
onCreate → onStart → onResume → [en pantalla] → onPause → onStop → onDestroy
                                                      ↑
                                        rotación: destruye y recrea todo el ciclo
```

### Tema 2: ViewModel sobrevive a la rotación

**Conceptos clave:** vinculado al `ViewModelStore`, no al ciclo de vida de la Activity individual.

```kotlin
class TareasViewModel : ViewModel() {
    private val _contador = MutableStateFlow(0)
    val contador = _contador.asStateFlow()

    fun incrementar() { _contador.value++ }
}
```

Un `ViewModel` está vinculado internamente al `ViewModelStore` de la Activity (o del NavGraph, en el caso de navegación con Compose), una estructura que Android preserva deliberadamente a través de una recreación por cambio de configuración como la rotación, incluso mientras la instancia de la Activity en sí se destruye y se crea una nueva: cuando el sistema recrea la Activity tras rotar, en vez de crear un `ViewModel` nuevo desde cero, recupera la misma instancia que ya existía antes de la rotación desde ese `ViewModelStore` preservado, de modo que cualquier estado (`StateFlow`, variables normales) que viva dentro del `ViewModel` sobrevive intacto sin ninguna configuración especial adicional por parte del desarrollador.

Esta supervivencia tiene un límite claro y bien definido: el `ViewModelStore` se destruye definitivamente solo cuando la Activity se cierra "de verdad" (el usuario navega hacia atrás desde ella, terminándola explícitamente), no simplemente cuando el dispositivo rota; sin embargo, si el sistema operativo mata el proceso completo de la app por falta de memoria (un escenario más agresivo y menos predecible, común en dispositivos con poca RAM o tras mucho tiempo en background), el `ViewModelStore` en memoria se pierde por completo junto con todo el proceso, y ni siquiera un `ViewModel` puede sobrevivir a eso por sí solo — ese escenario específico requiere `SavedStateHandle` (Tema 3).

**Analogía:** un `ViewModel` es como el registro de un hotel que permanece en la recepción mientras un huésped simplemente cambia de habitación dentro del mismo hotel (rotación): la información no se pierde porque el registro nunca dependió de una habitación específica. Pero si el hotel completo cierra y se demuele (muerte del proceso), ese registro en papel desaparece con el edificio — se necesitaría una copia en una caja fuerte externa (`SavedStateHandle`) para sobrevivir a eso.

**¿Por qué es importante?** Un `ViewModel` sobrevive a rotación porque Android preserva deliberadamente el `ViewModelStore` a través de recreaciones por cambio de configuración, pero no sobrevive a que el sistema mate el proceso completo por falta de memoria, un escenario más agresivo que requiere una capa adicional de persistencia.

**Casos de uso reales:**
- Mantener la lista de tareas ya cargada de red visible tras rotar el dispositivo, sin volver a pedirla al servidor.
- Conservar el estado de scroll y los filtros aplicados en una lista al girar la pantalla.
- Compartir un mismo `ViewModel` entre varios composables de una misma pantalla sin pasar el estado manualmente entre ellos.

**Diagrama:**

```
Rotación:  Activity destruida → recreada → ViewModelStore preservado → mismo ViewModel recuperado
Muerte de proceso: TODO se destruye, incluyendo el ViewModelStore en memoria
```

### Tema 3: SavedStateHandle

**Conceptos clave:** persistencia adicional que sobrevive incluso a la muerte del proceso.

```kotlin
class TareasViewModel(private val savedStateHandle: SavedStateHandle) : ViewModel() {
    var filtro: String
        get() = savedStateHandle["filtro"] ?: ""
        set(value) { savedStateHandle["filtro"] = value }
}
```

`SavedStateHandle` ofrece un nivel de supervivencia estrictamente mayor que el `ViewModel` "normal" descrito en el Tema 2: mientras el `ViewModel` en sí solo sobrevive a recreaciones dentro del mismo proceso (como la rotación), `SavedStateHandle` persiste sus valores en un mecanismo del sistema (similar conceptualmente al `Bundle` de estado que Android ya usaba históricamente para Activities individuales) que sobrevive incluso cuando el sistema mata el proceso completo por falta de memoria, restaurando esos valores automáticamente cuando el usuario regresa a la app y el sistema recrea el proceso desde cero.

Esta distinción entre los dos niveles de supervivencia importa en la práctica al decidir qué guardar dónde: datos que son costosos de recalcular pero no críticos para la experiencia del usuario (una lista completa cacheada) pueden vivir solo en el `ViewModel` normal, mientras que datos pequeños que afectan directamente la continuidad de la experiencia del usuario tras reabrir la app (qué filtro tenía seleccionado, en qué paso de un formulario estaba) son buenos candidatos para `SavedStateHandle`, dado su costo mínimo de serialización y su beneficio directo en la percepción de continuidad de la app.

**Analogía:** `SavedStateHandle` es como una nota adhesiva que un huésped deja pegada en su propia maleta antes de salir del hotel, de modo que incluso si el hotel entero se demuele y se reconstruye desde cero en el mismo terreno, esa nota específica (el estado guardado) puede recuperarse y volver a colocarse en la maleta del huésped al regresar, a diferencia del registro completo de la recepción que sí se pierde con la demolición.

**¿Por qué es importante?** `SavedStateHandle` sobrevive a un escenario más agresivo (muerte completa del proceso) que un `ViewModel` normal (que solo sobrevive rotación), por lo que conviene reservarlo específicamente para datos pequeños que afectan la continuidad percibida por el usuario al reabrir la app.

**Casos de uso reales:**
- Restaurar el paso actual de un formulario multi-pantalla si el sistema mata la app en background y el usuario vuelve horas después.
- Recordar el término de búsqueda escrito para no perderlo si Android recicla el proceso por falta de memoria.
- Guardar el ID del ítem seleccionado en una lista para reabrir exactamente ese detalle tras una interrupción del sistema.

**Diagrama:**

```
ViewModel normal:        sobrevive rotación,        NO sobrevive muerte de proceso
ViewModel + SavedStateHandle: sobrevive rotación,   SÍ sobrevive muerte de proceso (para los valores guardados en él)
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

**Objetivo del laboratorio:** construir una pantalla que sobreviva a rotación de pantalla sin perder estado, usando `ViewModel`.

**Requisitos previos:** Módulo 0 completado.

| Paso | Acción | Código/Comando | Explicación |
|---|---|---|---|
| 1 | Imprimir logs en cada callback del ciclo de vida | Ver Tema 1 | Observa el orden al rotar |
| 2 | Confirmar que un contador simple se pierde al rotar | Ver Tema 1 | Estado en `remember` simple |
| 3 | Mover el contador a un `ViewModel` | Ver Tema 2 | Confirma que sobrevive a rotación |
| 4 | Usar `SavedStateHandle` para el mismo valor | Ver Tema 3 | Sobrevive incluso a muerte de proceso |
| 5 | Identificar el callback correcto para liberar un recurso costoso | Ver Tema 1 | Ej. una cámara: `onResume`/`onPause` |

**Verificación:** el laboratorio se considera exitoso si el contador movido al `ViewModel` conserva su valor tras rotar la pantalla, y si, al simular la muerte del proceso (con la opción de desarrollador correspondiente), el valor guardado en `SavedStateHandle` se restaura correctamente al reabrir la app.

**Errores comunes y soluciones**

- **Guardar estado de UI directamente en la Activity o en `remember` simple sin `ViewModel`.** Se pierde al rotar; muévelo al `ViewModel`.
- **Asumir que `ViewModel` sobrevive a la muerte del proceso igual que a la rotación.** No es así; usa `SavedStateHandle` para ese escenario más agresivo.
- **Iniciar recursos costosos (cámara, sensores) en `onCreate` en vez de `onResume`.** Deja el recurso activo innecesariamente en background.

---

## Ejercicios de evaluación

### Ejercicio 1: Por qué el ViewModel sobrevive a rotación pero no a la muerte del proceso

**Enunciado:** ¿por qué un `ViewModel` sobrevive a una rotación de pantalla pero no a que el sistema mate el proceso completamente?

**Solución esperada:** el `ViewModel` está vinculado al `ViewModelStore`, que Android preserva deliberadamente a través de recreaciones por cambio de configuración como la rotación; pero si el sistema mata el proceso completo por falta de memoria, todo lo que vive en memoria (incluyendo ese `ViewModelStore`) se pierde junto con el proceso, sin excepción para el `ViewModel`.

**Criterios de éxito:**
- Explica correctamente la preservación del `ViewModelStore` frente a rotación, y su pérdida total ante muerte de proceso.

### Ejercicio 2: Diferencia entre lo que sobrevive un ViewModel y SavedStateHandle

**Enunciado:** ¿qué diferencia hay entre lo que sobrevive un `ViewModel` y lo que sobrevive `SavedStateHandle`?

**Solución esperada:** un `ViewModel` normal sobrevive solo a recreaciones dentro del mismo proceso (como la rotación); `SavedStateHandle` persiste sus valores en un mecanismo que sobrevive incluso a la muerte completa del proceso, restaurándolos automáticamente cuando el usuario regresa a la app.

**Criterios de éxito:**
- Distingue correctamente el nivel de supervivencia de cada mecanismo.

### Ejercicio 3: Cuándo liberar un recurso costoso

**Enunciado:** ¿qué evento del ciclo de vida deberías usar para liberar un recurso costoso como una cámara?

**Solución esperada:** iniciarla en `onResume` y liberarla en `onPause`, de modo que el recurso solo esté activo mientras la Activity es visible e interactiva, evitando consumo innecesario de batería mientras la app está en background.

**Criterios de éxito:**
- Menciona correctamente `onResume`/`onPause` como el par de callbacks apropiado.

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

- Google, *Android Developers Documentation* y guías de arquitectura de aplicaciones.
- JetBrains, *Kotlin Language Documentation*.
- OWASP Foundation, *Mobile Application Security Verification Standard*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- El ciclo de vida de una Activity sigue un orden predecible de callbacks, cada uno apropiado para operaciones específicas.
- Una rotación destruye y recrea la Activity por defecto, perdiendo cualquier estado que viva solo en memoria simple.
- `ViewModel` sobrevive a rotación porque su `ViewModelStore` se preserva deliberadamente, pero no sobrevive a la muerte completa del proceso.
- `SavedStateHandle` ofrece un nivel adicional de persistencia que sí sobrevive a la muerte del proceso, apropiado para datos pequeños que afectan la continuidad percibida por el usuario.

**Conceptos aprendidos**

- Ciclo de vida de Activity/Fragment.
- `ViewModel` y supervivencia a rotación.
- `SavedStateHandle`.
- Lifecycle-aware components.

**Próximos pasos**

En el Módulo 2 aprenderás Jetpack Compose: UI declarativa, recomposición, y el patrón de state hoisting que ya usaste implícitamente al mover el contador al `ViewModel`.

**Recursos adicionales**

- Documentación oficial de Android sobre el ciclo de vida de Activity (developer.android.com/guide/components/activities/activity-lifecycle).
