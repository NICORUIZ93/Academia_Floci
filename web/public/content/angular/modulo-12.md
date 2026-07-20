# Módulo 12: Apéndice: qué cambió entre versiones mayores


## Aprende construyendo

### Tema 1: Los saltos que importan

**Conceptos clave:** reescritura completa, motor Ivy, standalone, Signals.

El salto de AngularJS (la versión 1.x original, basada en un modelo completamente distinto de controllers y `$scope`) a Angular 2 en 2016 no fue una actualización incremental sino una reescritura completa del framework desde cero, sin ninguna compatibilidad hacia atrás con el código de AngularJS: los conceptos, la sintaxis y la arquitectura entera cambiaron, siendo esta la razón por la que "Angular" (sin el "JS") y "AngularJS" se consideran hoy proyectos esencialmente distintos, con Angular siendo el sucesor moderno mantenido activamente y AngularJS considerado legado en proceso de retiro definitivo desde hace años.

Angular 9, en 2020, adoptó Ivy como motor de renderizado por defecto (reemplazando al motor anterior, llamado View Engine), produciendo bundles de producción significativamente más pequeños gracias a una mejor capacidad de tree-shaking (eliminar código no utilizado del bundle final) y mensajes de error considerablemente más claros y específicos en tiempo de desarrollo, un cambio interno que la mayoría de aplicaciones no necesitaron modificar código para aprovechar, pero que mejoró tangiblemente la experiencia tanto de desarrollo como de producción.

Angular 14, en 2022, introdujo standalone components (Módulo 0) como funcionalidad en vista previa (no aún el comportamiento por defecto del CLI), permitiendo experimentar con la nueva arquitectura sin NgModules de forma opcional; Angular 16 y 17, en 2023, estabilizaron Signals (Módulo 2) como API pública y marcaron standalone como el comportamiento por defecto del CLI para proyectos nuevos, consolidando ambos como el enfoque recomendado hacia adelante en vez de una alternativa experimental opcional. Angular 17 en adelante continuó esta dirección con control de flujo nativo en plantillas (`@if`/`@for`, Módulo 1), `@defer` (Módulo 11) y SSR de primera clase (Módulo 11) integrados directamente en el core del framework.

**Analogía:** el salto de AngularJS a Angular 2 es como mudarse a una ciudad completamente distinta en vez de simplemente remodelar la casa actual; los saltos posteriores (Ivy, standalone, Signals) son como renovaciones sucesivas de esa nueva ciudad: cada una mejora significativamente la experiencia de vivir ahí, pero sin requerir mudarse de nuevo a otra ciudad distinta.

**¿Por qué es importante?** Entender qué cambió y por qué en cada salto mayor ayuda a interpretar por qué código Angular de épocas distintas puede lucir muy diferente entre sí, y a reconocer qué prácticas son legado frente a cuáles son el enfoque recomendado actual.

**Diagrama:**

```
AngularJS → Angular 2 (2016): reescritura completa, sin compatibilidad hacia atrás
Angular 9 (2020): motor Ivy por defecto — bundles más pequeños, mejores errores
Angular 14 (2022): standalone components en preview
Angular 16-17 (2023): Signals estable, standalone por defecto
Angular 17+: control de flujo nativo, @defer, SSR de primera clase
```

### Tema 2: Cómo leer un Angular Update Guide

**Conceptos clave:** update.angular.io, checklist específica entre versiones, `ng update`.

[update.angular.io](https://update.angular.io) es una herramienta oficial que, dadas una versión de origen y una versión de destino concretas (por ejemplo, de Angular 16 a Angular 17), genera una checklist específica y personalizada de exactamente qué pasos son necesarios para esa migración particular: qué APIs cambiaron o se volvieron obsoletas, qué comandos automáticos de `ng update` están disponibles para automatizar partes de la migración, y qué pasos, si los hay, requieren intervención manual porque no pueden automatizarse de forma segura.

`ng update @angular/core@18 @angular/cli@18` es el comando que efectivamente ejecuta las migraciones automáticas (codemods, transformaciones automáticas de código fuente) asociadas a esa actualización específica de versión, modificando directamente los archivos del proyecto cuando es posible hacerlo de forma segura y determinista (por ejemplo, renombrando una API deprecada a su reemplazo directo), dejando comentarios o advertencias en el código para los casos que requieren juicio humano y no pueden resolverse automáticamente sin riesgo de introducir un comportamiento incorrecto.

Leer la checklist generada antes de ejecutar el comando (en vez de ejecutarlo ciegamente y confiar en que todo funcionará) permite anticipar qué partes del proyecto probablemente requerirán atención manual después de la migración automática, y decidir con criterio si el proyecto está listo para asumir esa actualización en este momento, o si conviene posponerla hasta resolver dependencias de terceros que todavía no son compatibles con la nueva versión de destino.

**Analogía:** update.angular.io es como un itinerario de viaje personalizado que indica exactamente qué documentos preparar y qué pasos seguir para un viaje específico entre dos ciudades concretas, en vez de una guía genérica de viaje que no sabe exactamente de dónde partes ni a dónde vas.

**¿Por qué es importante?** Leer la checklist generada antes de ejecutar `ng update` permite anticipar qué requerirá intervención manual, evitando sorpresas y permitiendo decidir con criterio el momento apropiado para asumir la actualización.

**Diagrama:**

```
update.angular.io: version origen + version destino → checklist específica
ng update @angular/core@18 @angular/cli@18 → ejecuta codemods automáticos disponibles
```

### Tema 3: Por qué migrar una versión mayor a la vez

**Conceptos clave:** rutas de migración soportadas, riesgo acumulado, verificación incremental.

Angular publica y mantiene `ng update` con migraciones automáticas diseñadas y probadas específicamente para saltos de una única versión mayor consecutiva (de la versión N a la versión N+1); intentar saltar directamente de una versión considerablemente más antigua a una mucho más reciente (por ejemplo, de Angular 10 directamente a Angular 17) no tiene una ruta de migración automática confiable ni soportada oficialmente, dado que las migraciones automáticas de versiones intermedias nunca se ejecutarían, dejando el proyecto en un estado potencialmente inconsistente entre APIs de épocas muy distintas del framework.

Migrar una versión mayor a la vez, ejecutando y verificando exhaustivamente que la aplicación sigue funcionando correctamente en cada paso intermedio antes de continuar al siguiente, acota el riesgo de cada migración individual a un conjunto de cambios conocido, documentado y relativamente acotado, en vez de acumular todos los cambios de múltiples versiones simultáneamente en un único paso masivo difícil de depurar si algo falla: si un problema aparece después de migrar de la versión 15 a la 16, es mucho más fácil diagnosticarlo sabiendo exactamente qué cambió en ese paso específico, que si se hubiera intentado saltar directamente de la versión 12 a la 17 de una sola vez, mezclando los cambios de cinco versiones mayores distintas en un único diagnóstico.

**Analogía:** migrar versión por versión es como subir una escalera peldaño por peldaño, verificando el equilibrio en cada uno antes de continuar; intentar saltar varias versiones a la vez es como intentar subir varios peldaños de un salto: si se pierde el equilibrio, es mucho más difícil identificar exactamente en qué peldaño específico ocurrió el problema.

**¿Por qué es importante?** Migrar una versión mayor a la vez, verificando en cada paso intermedio, acota el riesgo de cada migración individual y facilita diagnosticar problemas específicos, en vez de acumular el riesgo de múltiples versiones en un único paso masivo y difícil de depurar.

**Diagrama:**

```
Angular 12 → 13 → 14 → 15 → 16 → 17
             (verificar en cada paso antes de continuar al siguiente)

NO soportado de forma confiable: Angular 12 → 17 directamente
```

---


## Laboratorio práctico

**Objetivo del laboratorio:** planificar una migración concreta de versión usando update.angular.io.

**Requisitos previos:** Módulos 0-11 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Identificar la versión actual del proyecto | `ng version` | Punto de partida de la migración |
| 2 | Consultar update.angular.io | — | Genera la checklist específica |
| 3 | Leer la checklist completa | — | Anticipa qué requerirá intervención manual |
| 4 | Ejecutar `ng update` | `ng update @angular/core@N @angular/cli@N` | Aplica las migraciones automáticas disponibles |
| 5 | Verificar la aplicación tras la migración | — | Antes de continuar a la siguiente versión mayor |

**Verificación:** el laboratorio se considera exitoso si puedes explicar exactamente qué cambios trae la checklist generada para una migración concreta, y por qué se recomienda verificar la aplicación completamente antes de continuar a la siguiente versión mayor.

**Errores comunes y soluciones**

- **Ejecutar `ng update` sin leer la checklist antes.** Lee siempre la checklist generada para anticipar qué requerirá atención manual.
- **Intentar saltar múltiples versiones mayores de una vez.** Migra una versión mayor a la vez, verificando en cada paso.
- **No verificar la aplicación tras cada paso de migración.** Verifica exhaustivamente antes de continuar a la siguiente versión.

---
