#!/usr/bin/env python3
"""Conecta los proyectos finales con implementaciones RutaFlow específicas por ruta."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web" / "public" / "content"
HEADING = "## Proyecto transversal RutaFlow"
PROJECTS = {
    "foundations/modulo-10.md": ("Dominio, algoritmos y contabilidad", "`examples/rutaflow/foundation/domain.py` y `examples/rutaflow/database/schema.sql`", "Modela estados e invariantes antes de elegir tecnología. Compara una heurística de vecino más cercano con distancia total, explica por qué no garantiza el óptimo y construye casos que refuten decisiones incorrectas. En datos, usa restricciones para impedir estados imposibles y un libro mayor de débito/crédito: el saldo se deriva de movimientos inmutables, no se edita directamente.", "Prueba cada transición válida e inválida, un conjunto donde la heurística no produzca el óptimo y una transacción contable balanceada/rechazada. Entrega tabla de casos, complejidad, diagrama de estados y consultas de integridad."),
    "javascript/modulo-12.md": ("Widget público de seguimiento", "`examples/rutaflow/javascript/tracking-widget.js`", "Construye el seguimiento sin `innerHTML`: crea nodos, asigna `textContent`, usa `aria-live` y formatea fechas con `Intl`. El contrato público no expone dirección, teléfono, coordenadas ni identificadores internos. Separa obtención, validación, presentación y renderizado para que la función conserve una responsabilidad clara.", "Prueba caracteres HTML en `publicCode`, fecha inválida, actualización de estado y navegación con lector de pantalla. Mide que una actualización reemplace el contenido sin duplicar nodos y explica por qué sanitizar después es más frágil que no interpretar texto como HTML."),
    "node/modulo-12.md": ("Comando idempotente de entrega", "`examples/rutaflow/node/confirm-delivery.ts`", "Implementa `confirmDelivery` alrededor de un comando con identidad estable. El caso de uso valida la frontera y depende de un contrato de repositorio, no del ORM. La implementación SQL debe guardar `commandId`, transición y resultado en una única transacción; una restricción única resuelve carreras que un `find` previo no puede evitar por sí solo.", "Simula respuesta perdida y reenvía el mismo comando: ambos intentos deben devolver el mismo resultado y producir un solo evento. Añade pruebas para PIN inválido, envío ajeno, estado terminal, carrera concurrente y error transitorio de base de datos."),
    "angular/modulo-13.md": ("Consola operativa de rutas", "`examples/rutaflow/angular/operations.store.ts`", "Representa carga, éxito y error como unión discriminada, evitando combinaciones como `loading=true` con `error` y datos viejos. Signals almacenan la fuente mínima y `computed` deriva rutas retrasadas. Componentes de mapa, filtros y tabla consumen vistas derivadas sin mutar arrays ni duplicar reglas.", "Construye lista y mapa sincronizados, filtro por centro y panel de retrasos. Prueba cada estado, actualización de una ruta, teclado, foco y anuncio accesible. Mide recomputaciones antes de aplicar optimizaciones y evita introducir un store global para estado que pertenece a una sola pantalla."),
    "react/modulo-12.md": ("Seguimiento del cliente", "`examples/rutaflow/react/use-shipment-tracking.tsx`", "El hook modela estados explícitos y cancela la petición cuando cambia el código o se desmonta la vista. `encodeURIComponent` protege la composición de URL, pero el servidor sigue validando. La interfaz renderiza skeleton, resultado, vacío y error; nunca muestra un error técnico ni conserva silenciosamente un envío anterior.", "Prueba cambio rápido de código, aborto, 404, 500, respuesta tardía y recuperación. Añade actualización periódica o stream solo después de comprobar cleanup y consumo. Usa React Performance Tracks para medir, no `memo` por costumbre."),
    "java/modulo-13.md": ("Motor de tarifas", "`examples/rutaflow/java/PricingEngine.java`", "Modela dinero con `BigDecimal`, unidades en nombres y entrada validada. `PricingRule` aplica abierto/cerrado porque existen variantes reales —peso, distancia, zona, contrato—; el motor no conoce detalles de cada regla. `List.copyOf` evita que el llamador cambie reglas después de construir el motor.", "Implementa reglas base, sobrepeso y zona remota; prueba bordes, escala y redondeo HALF_EVEN. Añade una regla sin modificar el motor y crea una prueba de contrato que todas las reglas deben cumplir: cargo no negativo, determinista y sin mutar la solicitud."),
    "spring-boot/modulo-12.md": ("Confirmación transaccional y outbox", "`examples/rutaflow/spring-boot/DeliveryService.java`", "La confirmación autoriza al conductor dentro del dominio, bloquea o versiona el agregado, registra el comando procesado y añade el evento a outbox en una sola transacción. Publicar directamente al broker antes del commit puede anunciar una entrega que luego se revierte; publicar después sin outbox puede perder el evento.", "Implementa repositorios JPA y migraciones con índices/constraints. Prueba repetición, carrera, conductor no asignado, rollback y publicación tras reinicio. Expón métricas de comandos duplicados, edad de outbox y errores, sin usar el identificador de envío como etiqueta de alta cardinalidad."),
    "kotlin-multiplatform/modulo-11.md": ("Sincronización compartida", "`examples/rutaflow/kotlin-multiplatform/SyncEngine.kt`", "Comparte el protocolo de outbox, backoff y estados; conserva permisos, almacenamiento seguro y scheduling en implementaciones nativas. La cancelación se relanza porque significa que el lifecycle terminó, no un fallo de red. Un error clasificable programa retry; validación o autorización deben terminar en estado no reintentable.", "Crea fakes contractuales para Android/iOS y prueba orden, duplicación, cancelación y cambio de cuenta. Usa reloj y generador de IDs inyectados. Verifica exportación Swift y evita exponer tipos coroutine que hagan incómoda la API nativa."),
    "android/modulo-12.md": ("Ubicación consciente de batería", "`examples/rutaflow/android/LocationPolicy.kt`", "La frecuencia GPS es una política de dominio que combina actividad y batería; no debe quedar dispersa entre callbacks. Una entrega detenida no necesita la precisión de un trayecto activo. La ubicación enviada conserva timestamp, accuracy y secuencia, y el servidor rechaza puntos viejos o imposibles sin asumir fraude automáticamente.", "Conecta la política a Fused Location Provider y foreground service solo durante jornada autorizada. Prueba batería baja, permiso aproximado, pérdida de señal, Doze, proceso recreado y logout. Mide consumo en ruta simulada y documenta retención y consentimiento."),
    "ios/modulo-12.md": ("Tracking de ruta y privacidad", "`examples/rutaflow/ios/LocationPolicy.swift`", "La política pura decide intervalo y distancia antes de tocar Core Location. `Duration` y nombres con unidad evitan números ambiguos. La app solicita permiso en contexto, detiene tracking fuera de jornada y reduce precisión/frecuencia según batería; background location requiere beneficio visible y configuración justificada.", "Implementa un adaptador `CLLocationManager`, prueba autorización denegada/restringida, accuracy reducida, pausa y relanzamiento. Usa GPX para simular ruta, Energy Log para comparar políticas y redacción de logs para impedir coordenadas precisas."),
    "flutter/modulo-12.md": ("Entrega offline con outbox", "`examples/rutaflow/flutter/delivery_outbox.dart`", "La UI confirma localmente una entrega como pendiente y la outbox persiste el comando antes de mostrar éxito. `commandId` permanece estable en cada reintento. El motor solo reintenta errores transitorios; errores de negocio requieren corrección humana. Reloj, API y almacenamiento se inyectan para pruebas deterministas.", "Implementa persistencia SQLite, indicador pendiente/error y sincronización al abrir o recuperar red. Prueba cierre del proceso, respuesta perdida, duplicación, backoff, logout y conflicto. Perfila isolate/UI y batería en Android e iOS por separado."),
    "devops/modulo-13.md": ("Entrega operable", "`examples/rutaflow/devops/deployment.yaml`", "El manifiesto fija imagen por digest, ejecuta non-root, elimina capacidades, usa filesystem de solo lectura y declara recursos. Readiness decide tráfico; liveness solo reinicia bloqueo real. Dos réplicas no garantizan disponibilidad si comparten nodo, zona, base o configuración defectuosa.", "Añade Service, PodDisruptionBudget, topology spread, NetworkPolicy y autoscaling basado en una señal defendible. Valida schema/policies, firma, SBOM y provenance en CI. Ejecuta rollback y game day de pérdida de pod/nodo observando el SLO de confirmación."),
    "cloud/modulo-31.md": ("Arquitectura event-driven y recuperación", "`examples/rutaflow/cloud/template.yaml`", "La cola desacopla recepción y procesamiento; visibility timeout, DLQ y consumidor idempotente forman un solo contrato. DynamoDB conserva eventos ordenados por envío y point-in-time recovery, pero partición, tamaño, consistencia y coste deben medirse. La misma capacidad se compara con Service Bus/Cosmos y Pub/Sub/Firestore sin fingir paridad exacta.", "Despliega en Floci, publica duplicados y fuerza cinco fallos hasta DLQ. Implementa replay autorizado, alarmas por edad y DLQ, least privilege, cifrado y presupuesto. Después valida un entorno real acotado y ejecuta restore demostrando un recorrido funcional."),
}

changed = 0
for relative, (title, source, explanation, verification) in PROJECTS.items():
    path = CONTENT / relative
    text = path.read_text(encoding="utf-8")
    if HEADING in text:
        continue
    anchor = "## Criterio transversal de calidad del código"
    if anchor not in text:
        raise RuntimeError(f"{path}: falta {anchor}")
    section = f"""{HEADING}: {title}

RutaFlow conecta este track con una plataforma completa de paquetería. La implementación de referencia está en {source}; se estudia como punto de partida pequeño, no como sistema terminado.

### Capacidad y fundamento

{explanation}

### Implementación guiada

1. Copia el contrato y escribe primero casos normales, límite, inválidos y duplicados.
2. Ejecuta la referencia, provoca un fallo y explica el mensaje antes de modificarla.
3. Implementa una mejora pequeña manteniendo nombres de dominio, efectos visibles y errores tipados.
4. Integra con el contrato del track anterior sin compartir tablas, estado mutable ni detalles de framework.
5. Registra la decisión en el README y etiqueta el hito de RutaFlow correspondiente.

### Verificación profesional

{verification}

El capítulo se completa cuando la evidencia permite a otra persona reproducir el flujo y explicar qué garantías ofrece y cuáles todavía no.

"""
    path.write_text(text.replace(anchor, section + anchor, 1), encoding="utf-8")
    changed += 1

print(f"RutaFlow: {changed} proyectos finales conectados.")
