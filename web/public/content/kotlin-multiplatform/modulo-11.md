# Módulo 11: Proyecto integrador — app KMP completa

## Sílabo

**Objetivo general**

Unir lógica de negocio, networking, persistencia y UI compartida en una app real para Android e iOS, con CI que valida ambas plataformas.

**Objetivos específicos**

1. Diseñar la arquitectura compartida completa: dominio, casos de uso, repositorios con Ktor + SQLDelight.
2. Implementar la UI consumiendo el módulo compartido, en Compose Multiplatform o nativa por plataforma.
3. Sincronizar datos remotos con caché local en el repositorio compartido.
4. Configurar CI que compile y testee ambos targets en cada push.

**Contenido**

- Arquitectura compartida por capas.
- Networking y persistencia comunes.
- UI nativa o Compose Multiplatform.
- CI que valida ambas plataformas.

**Evaluación**

App con lógica de negocio, networking y persistencia compartidos, funcionando en Android e iOS, más tres ejercicios de evaluación de cierre.

---

## Contenido teórico

### Tema 1: Arquitectura del proyecto integrador

**Conceptos clave:** capas compartidas frente a UI específica o compartida, tests con fakes.

El proyecto integrador organiza el código compartido en `shared/src/commonMain/kotlin/` con `dominio/` (modelos y casos de uso, Módulo 4) y `data/` (`TareaRepositoryImpl` combinando Ktor para datos remotos y SQLDelight para caché local, Módulos 5-6), con `commonTest/` conteniendo los tests que verifican esa lógica compartida usando fakes (Módulo 9); `androidApp/` e `iosApp/` contienen la UI específica de cada plataforma (ya sea nativa completa — Jetpack Compose en Android, SwiftUI en iOS consumiendo el `Shared.framework`, Módulo 8 — o Compose Multiplatform compartido, Módulo 7, según la decisión de arquitectura tomada para ese proyecto específico).

Esta estructura demuestra el patrón central de todo el track aplicado en su forma más completa: maximizar el código en `commonMain` (dominio, datos, y potencialmente UI si se opta por Compose Multiplatform) mientras se aísla en cada `App` específico únicamente lo que genuinamente requiere una integración nativa profunda de cada plataforma particular, con `commonTest` verificando exhaustivamente esa capa compartida una única vez, con la garantía de que esa verificación es igualmente válida para ambas plataformas de destino.

**Analogía:** la arquitectura del proyecto integrador es como una fábrica central que produce el componente principal común (compartido en `commonMain`) distribuido hacia dos plantas de ensamblaje final especializadas (`androidApp`, `iosApp`), cada una encargándose únicamente del acabado final específico según el mercado particular al que se dirige.

**¿Por qué es importante?** El proyecto integrador demuestra el patrón central de KMP en su forma más completa: maximizar código compartido verificado una única vez, aislando en cada plataforma únicamente lo que genuinamente requiere integración nativa específica.

**Diagrama:**

```
shared/src/
  commonMain/kotlin/
    dominio/        ← modelos + casos de uso (módulo 4)
    data/           ← TareaRepositoryImpl (Ktor + SQLDelight, módulos 5-6)
  commonTest/        ← tests con fakes (módulo 9)
androidApp/           ← UI Compose o Jetpack Compose nativo
iosApp/                ← UI SwiftUI consumiendo Shared.framework (módulo 8)
```

### Tema 2: Sincronización de datos remotos con caché local

**Conceptos clave:** repositorio como única fuente de verdad, fallback offline.

```kotlin
class TareaRepositoryImpl(
    private val api: HttpClient,
    private val db: Database,
) : TareaRepository {
    override suspend fun obtenerTodas(): List<Tarea> = try {
        val remotas = api.get("/tareas").body<List<TareaDTO>>()
        db.tareaQueries.transaction { remotas.forEach { guardarLocal(it) } }
        db.tareaQueries.selectTodas().executeAsList()
    } catch (e: Exception) {
        db.tareaQueries.selectTodas().executeAsList() // fallback offline a la caché local
    }
}
```

Esta implementación del repositorio combina ambas capas de persistencia estudiadas en el track (Ktor para obtener datos remotos actualizados, SQLDelight para persistir localmente esos datos como caché) en una única fuente de verdad coherente hacia el resto de la aplicación: si la petición de red exitosa, actualiza la caché local con los datos remotos más recientes antes de devolver el resultado leído desde esa misma caché local recién actualizada; si la petición de red falla (sin conexión, timeout, o cualquier otro error), el `catch` recurre directamente a los datos ya existentes en la caché local como fallback, permitiendo que la aplicación siga siendo funcional (mostrando los últimos datos conocidos) incluso sin conexión de red disponible, en vez de fallar completamente ante cualquier problema de conectividad.

Este patrón de "red primero, con fallback a caché local" (u otras variantes similares, como "caché primero, actualizar en segundo plano") es una decisión de arquitectura de sincronización de datos extremadamente común en aplicaciones móviles reales, donde la conectividad de red del usuario nunca puede asumirse como garantizada ni constante, y compartir esta lógica de sincronización específica en `commonMain` significa que ambas plataformas se benefician exactamente del mismo comportamiento de resiliencia ante conectividad intermitente, sin necesidad de implementar esa lógica de sincronización por separado en cada plataforma.

**Analogía:** este patrón de sincronización es como un asistente que siempre intenta primero consultar la fuente de información más actualizada disponible, pero que, si esa fuente no está accesible en este momento, recurre automáticamente a la última copia confiable que ya tiene guardada, permitiendo seguir operando razonablemente bien incluso cuando la fuente principal está temporalmente inaccesible.

**¿Por qué es importante?** Combinar Ktor y SQLDelight en el repositorio compartido, con fallback offline a la caché local, hace que ambas plataformas se beneficien exactamente del mismo comportamiento de resiliencia ante conectividad intermitente, sin duplicar esa lógica de sincronización por separado.

**Diagrama:**

```kotlin
override suspend fun obtenerTodas(): List<Tarea> = try {
    val remotas = api.get("/tareas").body<List<TareaDTO>>()
    db.tareaQueries.transaction { remotas.forEach { guardarLocal(it) } }
    db.tareaQueries.selectTodas().executeAsList()
} catch (e: Exception) {
    db.tareaQueries.selectTodas().executeAsList() // fallback offline a la caché local
}
```

### Tema 3: Cierre del track — la promesa realista de KMP

**Conceptos clave:** compartir donde la duplicación es redundancia, UI nativa donde importa la experiencia específica.

KMP no reemplaza el desarrollo nativo completo ni pretende hacerlo: la promesa realista y consolidada de KMP es compartir específicamente la lógica de negocio, el networking, y la persistencia (Módulos 4-6), áreas donde la duplicación entre Android e iOS es efectivamente redundancia pura sin ningún beneficio real (la lógica de filtrar tareas pendientes, o de sincronizar datos remotos con caché local, no tiene ninguna razón conceptual para diferir entre plataformas), mientras la UI puede seguir siendo completamente nativa por plataforma donde la experiencia específica de cada sistema operativo importa genuinamente (aprovechando al máximo las convenciones, gestos y patrones de interacción nativos específicos que los usuarios de cada plataforma esperan), o compartida con Compose Multiplatform (Módulo 7) cuando el equipo decide priorizar la velocidad de desarrollo compartido sobre la fidelidad exacta a las convenciones nativas de cada plataforma.

Esta decisión de dónde trazar exactamente la línea entre lo compartido y lo específico de plataforma es, en última instancia, una decisión de arquitectura que cada equipo debe tomar según sus propias prioridades concretas (velocidad de desarrollo compartido frente a fidelidad nativa exacta), sin que exista una única respuesta correcta universal aplicable a todos los proyectos por igual — el track completo proporciona las herramientas y el criterio necesario para tomar esa decisión de forma informada en cada caso específico.

**Analogía:** la promesa realista de KMP es como una cocina central que prepara los ingredientes base compartidos por todos los platos del menú de una cadena de restaurantes (donde preparar esos ingredientes por separado en cada sucursal sería pura redundancia), mientras cada sucursal individual conserva la libertad de presentar y servir el plato final según las preferencias específicas y las expectativas particulares de su clientela local.

**¿Por qué es importante?** Entender que KMP comparte específicamente lo que es redundancia pura entre plataformas (lógica, networking, persistencia), dejando la UI como una decisión de arquitectura deliberada (nativa por fidelidad, o compartida por velocidad), evita expectativas poco realistas sobre qué KMP puede y debe compartir.

**Diagrama:**

```
Compartido (redundancia pura si se duplicara): lógica de negocio, networking, persistencia
Decisión de arquitectura del equipo: UI nativa (fidelidad) vs Compose Multiplatform (velocidad compartida)
```

---

## Laboratorio práctico

**Objetivo del laboratorio:** construir la app KMP integradora completa con lógica, networking, persistencia y UI, funcionando en Android e iOS.

**Requisitos previos:** Módulos 0-10 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Diseñar la arquitectura compartida completa | Ver Tema 1 | dominio + casos de uso + repositorios con Ktor+SQLDelight |
| 2 | Implementar la UI consumiendo el módulo compartido | Módulo 7 u 8 | Compose Multiplatform o nativa por plataforma |
| 3 | Sincronizar datos remotos con caché local | Ver Tema 2 | Con fallback offline |
| 4 | Configurar CI para ambos targets | Módulo 10 | Compilación y tests en cada push |

**Verificación:** el laboratorio (y el track completo) se considera exitoso si la app funciona correctamente en Android e iOS compartiendo la misma lógica de negocio, networking y persistencia, si sigue siendo funcional (mostrando datos en caché) sin conexión de red, y si el pipeline de CI valida ambos targets en cada push.

**Errores comunes y soluciones**

- **Duplicar la lógica de sincronización de datos por separado en cada plataforma.** Compártela en el repositorio de `commonMain`.
- **No implementar un fallback offline en el repositorio.** Sin él, la app falla completamente ante cualquier problema de conectividad.
- **Decidir compartir o no compartir UI sin evaluar las prioridades reales del equipo.** Evalúa fidelidad nativa frente a velocidad de desarrollo compartido según el contexto específico del proyecto.

---

## Ejercicios de evaluación

### Ejercicio 1: Proporción real de código compartido

**Enunciado:** ¿qué porcentaje real de tu código terminó siendo compartido vs específico de plataforma?

**Solución esperada:** cualquier estimación razonable con justificación basada en el proyecto propio; una respuesta común señala que dominio, casos de uso, networking y persistencia (una proporción considerable del código total) terminaron compartidos, mientras que la UI (si se optó por nativa) permaneció específica de plataforma.

**Criterios de éxito:**
- Da una estimación razonable y coherente con las decisiones de arquitectura tomadas en el proyecto propio.

### Ejercicio 2: Decisión de arquitectura que ahorró más tiempo

**Enunciado:** ¿qué decisión de arquitectura te ahorró más tiempo al final del proyecto?

**Solución esperada:** cualquier respuesta razonablemente justificada; respuestas comunes incluyen compartir la lógica de sincronización de datos (evitando implementarla dos veces con el riesgo de que ambas implementaciones diverjan), o compartir los tests de la capa común (verificando ambas plataformas con un único esfuerzo de escritura de pruebas).

**Criterios de éxito:**
- Justifica su elección con un ahorro concreto de tiempo o esfuerzo observado en el proyecto propio.

### Ejercicio 3: Cierre del track — la promesa realista de KMP

**Enunciado:** explica la promesa realista de KMP: qué comparte y qué no pretende reemplazar.

**Solución esperada:** KMP comparte específicamente la lógica de negocio, networking y persistencia, áreas donde la duplicación entre plataformas es pura redundancia sin beneficio real; no pretende reemplazar el desarrollo nativo completo, dejando la UI como una decisión de arquitectura deliberada entre fidelidad nativa por plataforma o velocidad de desarrollo con UI compartida (Compose Multiplatform).

**Criterios de éxito:**
- Explica correctamente la distinción entre lo que KMP comparte (lógica, networking, persistencia) y lo que deja como decisión deliberada (UI).

---

## Resumen del módulo

**Puntos clave**

- El proyecto integrador combina dominio, casos de uso, Ktor y SQLDelight en `commonMain`, con UI nativa o compartida según la decisión de arquitectura.
- El repositorio compartido combina datos remotos y caché local con fallback offline, beneficiando a ambas plataformas por igual.
- La promesa realista de KMP es compartir lógica, networking y persistencia (pura redundancia si se duplicara), dejando la UI como decisión deliberada del equipo.

**Conceptos aprendidos**

- Arquitectura completa de un proyecto KMP real.
- Sincronización de datos remotos con caché local y fallback offline.
- La promesa realista de Kotlin Multiplatform.

**Próximos pasos**

Con el track de Kotlin Multiplatform completo, estás preparado para diseñar, construir y probar aplicaciones que comparten lógica de negocio, networking y persistencia entre Android e iOS, tomando decisiones informadas sobre UI nativa frente a compartida.

**Recursos adicionales**

- Documentación oficial de Kotlin Multiplatform (kotlinlang.org/docs/multiplatform.html) como referencia continua para profundizar en cualquiera de los temas de este track.
