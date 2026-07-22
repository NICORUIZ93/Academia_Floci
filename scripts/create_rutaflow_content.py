#!/usr/bin/env python3
"""Genera los ocho capítulos mantenibles de la ruta transversal RutaFlow."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "web/public/content/rutaflow"

MODULES = [
    ("RutaFlow desde cero: producto, entorno y dominio", "Convertir un proceso real de paquetería en un producto verificable antes de escoger frameworks.", [
        ("El proceso logístico como sistema", "actores, comandos, eventos, estados, invariantes y límites", "Una guía pasa por admisión, clasificación, asignación, tránsito, intento y entrega. El estado resume el presente; el evento conserva el hecho ocurrido. Cliente, operador, conductor, tesorería y soporte observan el mismo envío con permisos y necesidades diferentes. Una invariante como «una entrega confirmada no vuelve a tránsito» pertenece al dominio y no a una pantalla.", "un expediente clínico: el diagnóstico actual resume, pero la historia explica cómo se llegó allí", "evita que cada aplicación invente reglas contradictorias y permite auditar decisiones"),
        ("Entorno reproducible en Windows, macOS y Linux", "Git, editor, runtimes, contenedores, variables y diagnóstico", "El punto de partida será un monorepo con apps, servicios, paquetes, infraestructura y documentación. En Windows se recomienda WSL 2; en macOS, Homebrew es opcional; en Linux se usa el gestor de la distribución. Docker no sustituye comprender puertos, procesos y volúmenes. Cada instalación se valida con comandos de versión y una prueba mínima.", "una cocina profesional: importa la receta, pero también que todos midan con los mismos instrumentos", "reduce el tiempo perdido por diferencias locales y vuelve repetible cada laboratorio"),
        ("Arquitectura, privacidad y amenazas", "monolito modular, límites, PII, mínimo privilegio y ADR", "Se comienza con un monolito modular porque despliegues distribuidos no corrigen un dominio confuso. Direcciones, teléfonos, fotografías y coordenadas son datos sensibles: se clasifican, minimizan, cifran y retienen solo el tiempo justificado. Un ADR registra contexto, decisión y consecuencias. El threat model estudia suplantación, manipulación, repudio, exposición y abuso de recursos.", "diseñar un edificio: primero se separan áreas y accesos; después se decide cuántos edificios hacen falta", "la arquitectura queda guiada por riesgo y cambio, no por moda"),
    ]),
    ("Datos, geografía y contabilidad de una entrega", "Diseñar datos que conserven historia, ubicación y dinero sin perder integridad.", [
        ("Modelo relacional e historial", "identidades, claves, constraints, migraciones y auditoría", "Shipment representa el agregado; ShipmentEvent registra hechos inmutables. Una transición se valida dentro de una transacción y una restricción protege incluso ante errores de aplicación. Direcciones operativas se separan de su presentación pública. Las migraciones son código versionado, reversible cuando es posible y probado con datos realistas.", "un libro de actas: se agrega una corrección, no se borra el pasado", "permite explicar qué ocurrió y reconstruir proyecciones"),
        ("Geografía con precisión útil", "PostGIS, SRID, índices, distancia, geocodificación y privacidad", "Latitud y longitud no son texto. Se almacenan con sistema de referencia explícito y se consultan con índices espaciales. La distancia geodésica no equivale a la distancia por carretera. Guardar seis decimales no hace exacto un GPS con error de veinte metros; la interfaz debe comunicar precisión y antigüedad.", "una fotografía desenfocada guardada en alta resolución sigue desenfocada", "impide decisiones falsas, consultas lentas y exposición innecesaria"),
        ("Ledger de doble partida", "cuentas, débitos, créditos, tarifas versionadas y conciliación", "El saldo es una proyección de movimientos, no un campo que se corrige manualmente. Cada asiento debe balancear débitos y créditos en la misma moneda. Una tarifa conserva versión y vigencia para reproducir una cotización histórica. Recaudo, comisión, obligación al comercio y efectivo del conductor son cuentas diferentes.", "una balanza: todo valor que aparece en un lado debe explicar su contrapartida", "hace auditables el efectivo, pagos, liquidaciones y reversos"),
    ]),
    ("Backend: envíos, asignación e idempotencia", "Construir una API que siga siendo correcta cuando la red, los procesos o los usuarios repiten acciones.", [
        ("Contratos HTTP y autorización", "OpenAPI, recursos, errores, identidad, roles y ownership", "OpenAPI define entradas, salidas y errores antes de acoplar clientes. Autenticación responde quién; autorización decide qué puede hacer esa identidad sobre ese recurso. Un tracking público usa un token acotado y nunca expone notas internas, teléfono completo o coordenadas históricas.", "la recepción de un edificio verifica identidad y también a qué piso puede entrar", "un endpoint funcional sin autorización contextual sigue siendo una vulnerabilidad"),
        ("Casos de uso y transacciones", "puertos, adaptadores, invariantes, optimistic locking e idempotency key", "Confirmar entrega es un caso de uso: carga el envío, valida versión y transición, registra evidencia, guarda evento y resultado idempotente. Si el cliente reintenta con la misma clave recibe el resultado anterior. Si dos operadores actualizan la misma versión, uno debe recargar en vez de sobrescribir silenciosamente.", "un número de turno: repetir la solicitud no crea dos trámites", "los móviles pierden conectividad y los gateways reintentan; la duplicación es normal"),
        ("Outbox, colas y observabilidad", "commit atómico, entrega al menos una vez, deduplicación, trazas y métricas", "Guardar datos y publicar directamente crea una ventana de fallo. El outbox persiste cambio y mensaje en la misma transacción; un publicador reintenta. El consumidor registra message_id antes de aplicar efectos. Correlation ID y trazas conectan API, base y worker, mientras métricas miden latencia, errores y backlog.", "una bandeja de correo sellada junto con el documento que debe enviarse", "convierte fallos parciales en trabajo recuperable y observable"),
    ]),
    ("Frontend web: cliente y centro de operaciones", "Crear interfaces comprensibles, accesibles y seguras para clientes y operación.", [
        ("Estados explícitos y arquitectura de interfaz", "carga, vacío, éxito, error, cache, componentes y stores", "Una pantalla remota no tiene solo datos: puede estar cargando, desactualizada, vacía o fallar. Angular Signals o un hook React modelan esos estados sin mezclar transporte con presentación. Los componentes de dominio muestran ShipmentStatus; los adaptadores traducen DTO y errores del backend.", "un tablero de aeropuerto distingue vuelo a tiempo, retrasado, cancelado y sin información", "evita spinners infinitos, datos viejos presentados como actuales y componentes imposibles de probar"),
        ("Mapas operativos", "viewport, capas, clustering, selección, actualización incremental y precisión", "No se renderizan miles de marcadores DOM. El servidor limita por bounding box; el cliente agrupa puntos y actualiza solo entidades modificadas. Color no es el único canal: icono y texto comunican estado. La última posición muestra hora y círculo de precisión, no una certeza animada.", "un mapa de calor resume una multitud antes de pedir el detalle de una persona", "mantiene legible y rápida una herramienta de decisión"),
        ("Accesibilidad, seguridad y rendimiento", "teclado, foco, contraste, XSS, CSP, budgets y pruebas", "El mapa tiene alternativa tabular; filtros poseen etiquetas; diálogos gestionan foco. Datos externos se tratan como texto y una CSP limita ejecución. Se miden LCP, interacción y tamaño de bundles. Pruebas unitarias cubren estados y E2E recorre cotización y tracking con teclado.", "una rampa no es un adorno: cambia quién puede entrar al edificio", "una aplicación profesional funciona bajo discapacidad, mala red y dispositivos modestos"),
    ]),
    ("Aplicación Flutter del conductor: GPS, batería y offline", "Implementar una jornada de reparto confiable aun con mala señal y recursos limitados.", [
        ("Arquitectura Flutter por capacidades", "features, dominio, repositorios, estado, navegación y pruebas", "La app separa jornada, paradas, escaneo, evidencia y sincronización. Widgets renderizan estado; casos de uso coordinan; repositorios aíslan SQLite, cámara, GPS y red. Las dependencias apuntan hacia políticas estables y no hacia plugins. Se prueban dominio, adapters y flujos críticos.", "una caja de herramientas: cada instrumento tiene propósito y puede reemplazarse sin reconstruir la casa", "reduce acoplamiento a plugins y hace verificables las reglas offline"),
        ("GPS, permisos y batería", "precisión, frecuencia, distancia, background, consentimiento y muestreo adaptativo", "La política combina movimiento, etapa y carga: detenido usa menor frecuencia; ruta activa aumenta muestreo; batería baja reduce precisión. Permiso se pide al iniciar una función comprensible, no al abrir la app. Android e iOS imponen límites de background que deben probarse en dispositivos reales.", "un fotógrafo no dispara cien veces por segundo cuando la escena no cambia", "preserva jornada y privacidad sin perder señal operacional útil"),
        ("Offline-first y prueba de entrega", "SQLite, outbox local, estados de sincronización, conflictos y evidencia", "Confirmar entrega guarda primero un comando local con UUID y evidencia; luego sincroniza con idempotency key. Pendiente no significa fallido. Un conflicto de versión requiere política explícita. Fotografías se comprimen, cifran, suben con URL temporal y retención definida; firma no sustituye identidad.", "un mensajero conserva recibos numerados hasta entregarlos en oficina", "el trabajo del conductor no desaparece al entrar a un ascensor sin señal"),
    ]),
    ("Rutas, mapas y seguimiento en tiempo real", "Optimizar recorridos y transmitir posiciones sin confundir estimaciones con hechos.", [
        ("Grafos y problema de rutas", "matriz de coste, VRP, capacidad, ventanas, heurísticas y restricciones", "La ruta más corta puede incumplir capacidad, prioridad o horario. El problema real minimiza coste sujeto a restricciones y cambios. Se parte de nearest-neighbor, se mejora con 2-opt y se compara con una solución de referencia. Toda heurística registra semilla, tiempo y brecha.", "organizar citas médicas: cercanía importa, pero también horario, urgencia y duración", "permite explicar por qué una ruta es viable aunque no sea geométricamente mínima"),
        ("Geocoding y map matching", "calidad de dirección, candidatos, snapping, error y fallback humano", "Geocodificar produce candidatos con confianza, no verdad. Se normaliza sin destruir información y se permite corrección humana. Map matching usa secuencia, red vial y velocidad para evitar saltar a una vía paralela. El sistema conserva entrada original y procedencia.", "reconocer una canción con ruido: el mejor resultado necesita un nivel de confianza", "evita despachos a coordenadas plausibles pero incorrectas"),
        ("Streaming y ETA con incertidumbre", "orden, partición, backpressure, datos tardíos, percentiles e intervalos", "El stream particiona por conductor, usa sequence_number y tolera eventos tardíos. El cliente recibe actualizaciones limitadas, no cada punto bruto. ETA combina distancia, tráfico histórico y operación; se evalúa con MAE y percentiles y se comunica como intervalo cuando la incertidumbre es alta.", "un pronóstico del tiempo: una franja honesta es más útil que un minuto falso", "protege infraestructura y confianza del usuario"),
    ]),
    ("Facturación, recaudo, liquidaciones y fraude", "Modelar dinero como un subsistema auditable y el riesgo como apoyo a decisiones humanas.", [
        ("Cotización y facturación reproducible", "Money, moneda, redondeo, vigencia, impuestos y versiones", "Money combina entero en unidad menor y moneda; nunca float. La cotización guarda tarifa, versión, entradas y desglose. El cambio de tarifa crea nueva vigencia. Impuestos dependen de jurisdicción y fecha, por lo que el motor recibe política explícita.", "un tiquete conserva fecha y tarifa aunque el precio cambie mañana", "soporte y auditoría pueden reproducir cada cobro"),
        ("Recaudo, liquidación y conciliación", "doble partida, efectivo contra entrega, pagos, settlement, reversos y diferencias", "Cobrar efectivo aumenta caja del conductor y obligación a entregar; liquidar mueve ambas cuentas. Un pago electrónico cruza procesador, banco y ledger interno. Conciliación compara fuentes por referencia, monto, moneda y ventana; las diferencias entran a una cola, no se eliminan.", "cerrar caja: el total esperado y el contado se comparan y toda diferencia se investiga", "separa el movimiento real de la representación contable"),
        ("Fraude responsable", "señales, reglas, modelos, explicabilidad, revisión, sesgo y privacidad", "Velocidad imposible, evidencia repetida o concentración de reversos son señales, no culpabilidad. Una puntuación prioriza revisión y registra factores. Bloquear automáticamente por un GPS impreciso puede perjudicar zonas rurales. Se miden falsos positivos por segmento y existe apelación.", "una alarma de humo solicita inspección; no condena el edificio", "reduce pérdidas sin convertir correlaciones defectuosas en decisiones irreversibles"),
    ]),
    ("Producción: cloud, DevOps, seguridad y operación", "Operar RutaFlow con despliegues verificables, objetivos de servicio y recuperación probada.", [
        ("Infraestructura y entrega segura", "Terraform, Kubernetes, CI/CD, artefactos, secretos, SBOM y firma", "Terraform crea redes, datos e identidades con estado protegido; Kubernetes ejecuta workloads con requests, limits y probes. La pipeline prueba, escanea, genera SBOM, firma una imagen inmutable y promueve el mismo digest. Floci visualiza pipelines; StackPort puede ofrecer el entorno reproducible de práctica.", "una cadena de custodia: cada relevo conserva identidad y evidencia", "reduce configuraciones manuales y permite saber exactamente qué se desplegó"),
        ("SLO y respuesta a incidentes", "SLI, presupuesto de error, alertas por burn rate, trazas, runbooks y postmortem", "Disponibilidad útil mide confirmaciones válidas, no procesos vivos. Un SLO fija objetivo y ventana; el presupuesto equilibra velocidad y confiabilidad. Alertas actúan sobre síntomas y burn rate. El runbook orienta diagnóstico; el postmortem sin culpa identifica condiciones y acciones con responsable.", "un tablero de salud mide funciones vitales, no cuántas luces están encendidas", "conecta decisiones técnicas con impacto en entregas"),
        ("Continuidad, costes y proyecto final", "backup, restore, RPO, RTO, game day, DR y coste por entrega", "Un backup no está probado hasta restaurarlo y verificar integridad. RPO limita pérdida tolerable; RTO, tiempo de recuperación. Un game day simula caída de base, cola saturada y proveedor de mapas lento. FinOps atribuye coste por servicio y entrega sin sacrificar seguridad.", "un simulacro de evacuación revela puertas bloqueadas antes del incendio", "convierte documentación optimista en capacidad operacional demostrada"),
    ]),
]

INSTALL = """
## Antes de comenzar: instala y comprueba el entorno

Necesitas Git, un editor, Docker Desktop o Docker Engine, Node.js LTS, Python 3.12+, Java 21, Flutter estable y `make` opcional. En **Windows**, instala WSL 2 con Ubuntu, activa virtualización y ejecuta el repositorio dentro del sistema de archivos de WSL. En **macOS**, instala Xcode Command Line Tools; Homebrew facilita herramientas pero no es obligatorio. En **Linux**, instala Git y Docker desde la documentación de tu distribución y agrega tu usuario al grupo de Docker solo si comprendes su alcance de privilegios. Flutter exige Android Studio y Android SDK para Android; Xcode solo está disponible en macOS para iOS.

Valida una herramienta a la vez: `git --version`, `docker version`, `node --version`, `python3 --version`, `java --version` y `flutter doctor -v`. No continúes ante una marca roja relacionada con la plataforma que usarás. Después crea una carpeta vacía, inicializa Git, copia `.env.example` a `.env` sin secretos reales y levanta PostgreSQL con Compose. El primer criterio de éxito no es «instalé algo», sino que una prueba pueda conectarse, crear un envío y eliminar los datos de prueba de manera repetible.

## Ruta de proyecto progresivo desde carpeta vacía

Cada módulo agrega una vertical ejecutable al mismo repositorio: primero dominio; luego persistencia; API; web; móvil; optimización y tiempo real; finanzas; finalmente despliegue y operación. Cada entrega conserva README, ADR, prueba automatizada, comandos de ejecución y una demostración breve. No se copia una solución final: se avanza con commits pequeños y se registra por qué cambió el diseño.
"""

def render(index, module):
    title, objective, topics = module
    theory = []
    for n, (name, concepts, body, analogy, importance) in enumerate(topics, 1):
        theory.append(f"""### Tema {n}: {name}

**Conceptos clave:** {concepts}.

{body} El criterio no es memorizar la herramienta, sino poder predecir qué sucede ante duplicados, datos incompletos, concurrencia, pérdida de red o permisos insuficientes. Documenta supuestos y mide antes de optimizar.

**Analogía:** Es como {analogy}.

**¿Por qué es importante?** Porque {importance}. En RutaFlow la decisión se valida con una prueba automatizada y una observación operativa, no solo con una captura de pantalla.

**Casos de uso reales:** estudia el flujo normal, un reintento, un dato tardío y un acceso sin permiso. Dibuja primero el flujo y marca dónde puede fallar.

**Diagrama:**

```mermaid
flowchart LR
  A[Entrada] --> B[Regla de dominio]
  B --> C[(Estado durable)]
  C --> D[Evento observable]
  B -->|rechazo explícito| E[Error recuperable]
```
""")
    before = INSTALL if index == 0 else ""
    return f"""# Módulo {index}: {title}

{before}

## Aprende construyendo

{''.join(theory)}
"""

OUT.mkdir(parents=True, exist_ok=True)
for index, module in enumerate(MODULES):
    (OUT / f"modulo-{index}.md").write_text(render(index, module), encoding="utf-8")
print(f"RutaFlow: {len(MODULES)} capítulos generados en {OUT.relative_to(ROOT)}")
