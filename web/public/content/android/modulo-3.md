# Módulo 3: Navegación con Navigation Compose

## Sílabo

**Objetivo general**

Estructurar una app con múltiples pantallas, paso de argumentos tipado, deep links y navegación anidada con stacks independientes por sección.

**Objetivos específicos**

1. Definir un `NavHost` con al menos 4 destinos y navegar entre ellos.
2. Pasar un argumento tipado de una pantalla de lista a una de detalle.
3. Configurar un deep link que abra directamente una pantalla de detalle.
4. Implementar una bottom navigation bar con stacks de navegación independientes por sección.

**Contenido**

- `NavHost` y `NavController`.
- Argumentos de navegación tipados.
- Deep links.
- Navegación anidada (bottom nav + stack).

**Evaluación**

App con al menos 4 pantallas, navegación con argumentos y un bottom navigation, más tres ejercicios de evaluación.

---

## Comienza desde cero: prepara este capítulo

Este recorrido parte de una carpeta vacía. Al finalizar tendrás **App con al menos 4 pantallas, navegación con argumentos y un bottom navigation, más tres ejercicios de evaluación.** No avances ejecutando comandos que no comprendes: primero identifica la entrada, la transformación y la evidencia que comprobará el resultado.

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
│  └─ module-3/
├─ tests/
├─ docs/decisions/
├─ evidence/module-3/
└─ README.md
```

| Tema | Archivo o decisión | Evidencia mínima |
|---|---|---|
| 1. NavHost y NavController | `app/src/main/java/academy/module-3/topic-1-navhost-y-navcontroller.kt` | prueba + salida observable |
| 2. Argumentos tipados y deep links | `app/src/main/java/academy/module-3/topic-2-argumentos-tipados-y-deep-links.kt` | prueba + salida observable |
| 3. Navegación anidada con stacks independientes | `app/src/main/java/academy/module-3/topic-3-navegacion-anidada-con-stacks-independientes.kt` | prueba + salida observable |

Un ejemplo técnico vive en el archivo indicado y debe tener una prueba. Un tema conceptual vive en `docs/decisions/`: compara opciones usando restricciones medibles; no escribas código decorativo solo para llenar espacio.

### 4. Ejecuta una línea base

Desde `academia-labs/android-app`:

```bash
./gradlew testDebugUnitTest
```

**Resultado esperado:** el comando reconoce el proyecto y termina sin errores antes de introducir el cambio del capítulo. Después del incremento, la evidencia debe demostrar: **App con al menos 4 pantallas, navegación con argumentos y un bottom navigation, más tres ejercicios de evaluación.**

Si falla la línea base, no continúes. Localiza el primer mensaje que indique archivo, línea o dependencia; formula una causa y compruébala con un cambio pequeño.

### 5. Provoca un fallo y recupérate

Simula permiso denegado, proceso recreado o dato ausente; verifica que la pantalla conserve un estado comprensible. Guarda en `evidence/module-3/` el comando, la salida relevante, tu hipótesis y la corrección. Revierte únicamente el cambio deliberado; no borres todo el proyecto para ocultar la causa.

### 6. Conecta el capítulo con RutaFlow

Aplica el aprendizaje de **Navegación con Navigation Compose** a un incremento vertical de RutaFlow. Define qué componente produce el dato, qué contrato lo transporta, quién lo consume y cómo observarás un fallo. La entrega final incluye archivo o decisión, prueba, salida, error corregido y una limitación que todavía validarías en producción.

---

## Contenido teórico

### Tema 1: NavHost y NavController

**Conceptos clave:** grafo de navegación declarado una vez, historial gestionado automáticamente.

```kotlin
NavHost(navController, startDestination = "lista") {
    composable("lista") { ListaTareasScreen(onTareaClick = { id -> navController.navigate("detalle/$id") }) }
    composable("detalle/{id}") { backStackEntry ->
        val id = backStackEntry.arguments?.getString("id")
        DetalleTareaScreen(id)
    }
}
```

`NavHost` declara el grafo completo de navegación de la app: qué rutas existen (`"lista"`, `"detalle/{id}"`) y qué composable se renderiza para cada una, mientras que `NavController` es el objeto que ejecuta transiciones entre esas rutas (`navController.navigate(...)`) y gestiona automáticamente el historial de navegación (el back stack), de modo que el botón "atrás" del sistema funciona correctamente sin código adicional explícito por parte del desarrollador. Este modelo declarativo de navegación (declarar el grafo completo de antemano, en vez de gestionar transiciones imperativas de pantalla en pantalla) es conceptualmente análogo a React Router (Módulo 6 del track de React), donde también se declara un árbol de rutas y el router gestiona el historial del navegador automáticamente.

Cada destino en el grafo se identifica por una ruta con formato de string (similar a una URL), lo que permite razonar sobre la navegación de la app como un conjunto de "direcciones" bien definidas, y facilita funcionalidades adicionales como deep links (Tema 3) que simplemente necesitan mapear una URI externa hacia una de estas rutas ya declaradas.

**Analogía:** un `NavHost` es como el mapa completo de un edificio con todas sus salas numeradas y sus puertas de conexión ya definidas de antemano; el `NavController` es como el sistema de señalización que guía a un visitante de una sala a otra y recuerda automáticamente el camino recorrido para que pueda regresar sobre sus pasos.

**¿Por qué es importante?** Declarar el grafo de navegación completo de antemano, en vez de gestionar transiciones imperativas dispersas por el código, centraliza la estructura de navegación de la app y permite que el sistema gestione automáticamente el historial (back stack) sin código adicional.

**Casos de uso reales:**
- Navegar de una lista de tareas a su detalle al tocar un ítem, con el botón atrás regresando automáticamente a la lista.
- Documentar de un vistazo todas las pantallas de la app leyendo el grafo declarado en `NavHost`.
- Añadir una nueva pantalla al flujo sin tocar el código de navegación de las pantallas existentes.

**Diagrama:**

```kotlin
NavHost(navController, startDestination = "lista") {
    composable("lista") { ListaTareasScreen(onTareaClick = { id -> navController.navigate("detalle/$id") }) }
    composable("detalle/{id}") { backStackEntry -> DetalleTareaScreen(backStackEntry.arguments?.getString("id")) }
}
```

### Tema 2: Argumentos tipados y deep links

**Conceptos clave:** validación de tipo en tiempo de navegación, entrada externa mapeada a una ruta interna.

```kotlin
composable(
    "detalle/{id}",
    arguments = listOf(navArgument("id") { type = NavType.StringType })
) { /* ... */ }
```

Declarar explícitamente el tipo de un argumento de navegación con `navArgument(...) { type = ... }` (en vez de simplemente interpolar el valor en el string de la ruta sin ninguna declaración adicional) permite que Navigation Compose valide y extraiga el argumento con el tipo correcto automáticamente, evitando errores de conversión manual (parsear un string a `Int` incorrectamente, por ejemplo) que serían responsabilidad del desarrollador con un mecanismo de navegación más genérico y no tipado, como el histórico `Bundle` de Android clásico.

```kotlin
composable(
    "detalle/{id}",
    deepLinks = listOf(navDeepLink { uriPattern = "miapp://tarea/{id}" })
) { /* ... */ }
```

Un deep link mapea una URI externa (que puede llegar desde una notificación push, un link compartido, o un navegador web) directamente hacia una ruta específica ya declarada en el `NavHost`, con el argumento correspondiente ya resuelto automáticamente a partir de esa URI; esto permite que un usuario que recibe una notificación sobre una tarea específica llegue directamente a la pantalla de detalle de esa tarea exacta, en vez de aterrizar en la pantalla principal de la app y tener que navegar manualmente hasta encontrarla, una diferencia significativa en la experiencia percibida del usuario.

**Analogía:** un argumento tipado es como una casilla de un formulario que solo acepta un formato específico de dato (validado automáticamente al llegar), en vez de un campo de texto libre que podría contener cualquier cosa y requeriría validación manual posterior; un deep link es como una dirección postal específica que un cartero externo puede usar para entregar un paquete directamente en la puerta correcta de un edificio grande, en vez de dejarlo en la recepción general para que alguien lo redirija manualmente.

**¿Por qué es importante?** Los argumentos tipados evitan errores de conversión manual y hacen explícito el contrato de cada ruta; los deep links permiten que entradas externas (notificaciones, links) lleven al usuario directamente a la pantalla relevante, mejorando significativamente la experiencia percibida.

**Casos de uso reales:**
- Tocar una notificación push de "nuevo comentario" y aterrizar directamente en el detalle de esa tarea específica.
- Compartir un link de una tarea (`miapp://tarea/42`) que abre la app directamente en esa pantalla si está instalada.
- Pasar un ID de usuario tipado entre pantallas de perfil sin arriesgar un `ClassCastException` en tiempo de ejecución.

**Diagrama:**

```kotlin
composable(
    "detalle/{id}",
    arguments = listOf(navArgument("id") { type = NavType.StringType }),
    deepLinks = listOf(navDeepLink { uriPattern = "miapp://tarea/{id}" })
) { /* ... */ }
```

### Tema 3: Navegación anidada con stacks independientes

**Conceptos clave:** cada sección principal mantiene su propio historial de navegación.

```kotlin
Scaffold(bottomBar = {
    NavigationBar {
        items.forEach { item -> NavigationBarItem(onClick = { navController.navigate(item.ruta) }, /* ... */) }
    }
}) { padding ->
    NavHost(navController, startDestination = "inicio", Modifier.padding(padding)) { /* ... */ }
}
```

En una app con una bottom navigation bar de varias secciones principales (Inicio, Tareas, Perfil), cada sección típicamente necesita mantener su propio historial de navegación independiente, de modo que si el usuario navega profundamente dentro de la sección "Tareas" (lista → detalle → edición) y luego cambia a "Perfil" mediante la bottom bar, al volver a "Tareas" el usuario debería encontrar exactamente el mismo punto profundo donde lo dejó, no la pantalla raíz de esa sección; lograr esto requiere un `NavHost` anidado por sección, cada uno con su propio back stack, en vez de un único `NavHost` plano compartido entre todas las secciones donde cambiar de sección mediante la bottom bar simplemente reemplazaría la pantalla actual sin preservar ese historial profundo por separado.

Esta necesidad de stacks independientes por sección es un patrón extremadamente común en apps móviles reales (presente también, por ejemplo, en la navegación por pestañas de iOS estudiada en el track de iOS), y refleja una expectativa de UX bien establecida entre los usuarios de apps móviles: cada pestaña principal se percibe como un contexto de navegación separado y persistente, no como una vista temporal que se resetea cada vez que se abandona.

**Analogía:** stacks de navegación independientes por sección son como tener un marcador de página distinto para cada uno de varios libros que se están leyendo simultáneamente: cambiar de libro (sección) y volver preserva exactamente la página donde se quedó cada uno, en vez de que todos compartan un único marcador que se mueve de forma confusa entre libros distintos.

**¿Por qué es importante?** Cada sección de una bottom navigation suele necesitar su propio stack independiente para que cambiar entre secciones no pierda el contexto de navegación profundo dentro de cada una, cumpliendo con una expectativa de UX ya establecida en apps móviles.

**Casos de uso reales:**
- Una app de e-commerce donde el usuario navega profundo en "Categorías", cambia a "Carrito" y al volver sigue donde estaba.
- Una app bancaria con pestañas "Cuentas", "Tarjetas", "Más" que preservan el historial de cada una independientemente.
- Evitar el bug de UX de perder el scroll y la pantalla actual al tocar dos veces la misma pestaña por accidente.

**Diagrama:**

```
Bottom Nav
├── Inicio  → stack propio: [Inicio]
├── Tareas  → stack propio: [Lista → Detalle → Edición]
└── Perfil  → stack propio: [Perfil]

Cambiar de pestaña NO resetea el stack de la pestaña anterior.
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

**Objetivo del laboratorio:** construir una app con al menos 4 pantallas, navegación con argumentos y un bottom navigation.

**Requisitos previos:** Módulo 2 completado.

| Paso | Acción | Código/Comando | Explicación |
|---|---|---|---|
| 1 | Definir un `NavHost` con al menos 4 destinos | Ver Tema 1 | Navega con `NavController` |
| 2 | Pasar un argumento tipado (ej. ID de tarea) | Ver Tema 2 | De lista a detalle |
| 3 | Configurar un deep link hacia la pantalla de detalle | Ver Tema 2 | Verifica desde un link externo |
| 4 | Implementar bottom navigation con 3 secciones | Ver Tema 3 | Cada una con su propio stack |

**Verificación:** el laboratorio se considera exitoso si navegar profundamente en una sección y cambiar a otra mediante la bottom bar preserva ese historial al regresar, y si el deep link configurado abre directamente la pantalla de detalle correcta con el argumento ya resuelto.

**Errores comunes y soluciones**

- **Interpolar argumentos sin declarar su tipo con `navArgument`.** Declara el tipo explícitamente para validación y extracción automática.
- **Usar un único `NavHost` plano para todas las secciones de una bottom navigation.** Anida un `NavHost` independiente por sección para preservar su historial por separado.
- **Olvidar registrar el `uriPattern` del deep link en el manifiesto (intent-filter) además del grafo de navegación.** Ambos son necesarios para que el sistema operativo enrute la URI hacia la app.

---

## Ejercicios de evaluación

### Ejercicio 1: Ventaja de argumentos tipados

**Enunciado:** ¿qué ventaja da pasar argumentos tipados en vez de un `Bundle` genérico como antes?

**Solución esperada:** Navigation Compose valida y extrae el argumento con el tipo declarado automáticamente, evitando errores de conversión manual que serían responsabilidad del desarrollador con un `Bundle` genérico no tipado.

**Criterios de éxito:**
- Menciona correctamente la validación/extracción automática como ventaja frente al `Bundle` genérico.

### Ejercicio 2: Por qué stacks independientes por sección

**Enunciado:** ¿por qué cada sección de un bottom navigation suele necesitar su propio stack independiente?

**Solución esperada:** para que navegar profundamente dentro de una sección y luego cambiar a otra mediante la bottom bar preserve ese historial al regresar, cumpliendo con la expectativa de UX de que cada pestaña es un contexto de navegación persistente y separado.

**Criterios de éxito:**
- Explica correctamente la preservación del historial por sección como razón.

### Ejercicio 3: Qué resuelve un deep link

**Enunciado:** ¿qué problema de experiencia de usuario resuelve un deep link configurado correctamente?

**Solución esperada:** permite que una entrada externa (notificación, link compartido) lleve al usuario directamente a la pantalla relevante con el argumento ya resuelto, en vez de aterrizar en la pantalla principal y tener que navegar manualmente hasta encontrarla.

**Criterios de éxito:**
- Explica correctamente la llegada directa a la pantalla relevante como beneficio del deep link.

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

- `NavHost` declara el grafo completo de navegación; `NavController` ejecuta transiciones y gestiona el historial automáticamente.
- Los argumentos tipados evitan errores de conversión manual frente a un `Bundle` genérico.
- Los deep links mapean URIs externas directamente hacia rutas ya declaradas, con argumentos resueltos automáticamente.
- Cada sección de una bottom navigation suele necesitar su propio stack de navegación independiente.

**Conceptos aprendidos**

- `NavHost` y `NavController`.
- Argumentos de navegación tipados.
- Deep links.
- Navegación anidada (bottom nav + stack).

**Próximos pasos**

En el Módulo 4 aprenderás a conectar la capa de datos con la UI de forma reactiva usando `StateFlow` y el patrón UDF completo.

**Recursos adicionales**

- Documentación oficial de Navigation Compose (developer.android.com/jetpack/compose/navigation).
