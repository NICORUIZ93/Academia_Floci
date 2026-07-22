#!/usr/bin/env python3
"""Genera los módulos explícitos de tracking Flutter + Spring Boot."""
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
MODULES={
"flutter":("Flutter para entregas: mapas, GPS y tiempo real",[
("Diseño de pantallas y Riverpod","La jornada se diseña desde tareas reales: iniciar turno, aceptar ruta, navegar a una parada, escanear, capturar evidencia y confirmar. Riverpod representa estados sellados de carga, datos, error y sincronización; un provider no debe convertirse en una clase global que conozca UI, red y SQLite. Los widgets observan modelos de pantalla y los casos de uso preservan reglas."),
("Google Maps y localización en tiempo real","google_maps_flutter presenta marcadores, polylines y cámara; geolocator obtiene posiciones con precisión, timestamp y velocidad. Antes de solicitar permiso se explica el beneficio. Background location requiere justificación y configuración separada en Android/iOS. Una posición vieja o imprecisa se descarta o comunica como aproximación."),
("Socket.IO y actualización de rutas","socket_io_client conecta con un servidor compatible, autentica el handshake, entra en una sala por jornada y procesa eventos versionados. La app reconecta con backoff, reanuda desde el último sequence number y no supone entrega exactamente una vez. La ruta se recalcula únicamente ante desviación significativa o cambio operativo."),
("Animaciones de localización","El marcador no salta entre puntos: interpola posición y rumbo durante un intervalo limitado. Los eventos fuera de orden no retroceden el vehículo. AnimationController se libera en dispose y el frame budget se mide con DevTools. La animación comunica movimiento estimado; no fabrica precisión que el GPS no posee."),
("Almacenamiento local, imágenes y offline","SQLite conserva jornada, paradas y un outbox de comandos. Capturar foto genera un archivo comprimido y cifrado con referencia local; no guarda bytes grandes en una fila. Cada confirmación usa UUID idempotente y estados pending/syncing/synced/failed. image_picker/camera manejan cancelación, metadatos y permisos."),
("Dio y notificaciones push","Dio configura timeouts, cancelación, interceptores seguros y subida multipart con progreso. El refresh de token se serializa para evitar una tormenta de solicitudes. FCM/APNs despierta o informa, pero la app consulta el backend como fuente de verdad. El token push rota, se asocia a instalación y nunca autoriza operaciones."),]),
"spring-boot":("Backend de entregas: MySQL espacial, archivos y tiempo real",[
("CRUD API y contratos","Crear, consultar, asignar, actualizar y cancelar envíos son casos de uso diferentes, no un controlador genérico que expone entidades. DTO, Bean Validation, Problem Details y OpenAPI definen el contrato. DELETE puede significar cancelación de negocio y no eliminación física. Idempotency-Key protege creación y confirmación ante reintentos."),
("MySQL y datos espaciales","MySQL 8 almacena POINT con SRID 4326 e índices SPATIAL. ST_Distance_Sphere permite filtros iniciales de cercanía, mientras rutas reales requieren un motor vial. Longitud va antes que latitud en WKT. EXPLAIN demuestra uso del índice; precisión, timestamp y procedencia acompañan cada coordenada."),
("JPA e Hibernate Spatial","JPA modela agregados y Hibernate traduce persistencia, pero no reemplaza entender SQL. Hibernate Spatial integra Geometry/Point; migraciones Flyway crean SRID, constraints e índices. Se evitan N+1 mediante proyecciones o fetch explícito. Una transacción valida versión optimista, guarda posición y produce outbox."),
("JWT Bearer y autorización por roles","Spring Security valida Authorization: Bearer mediante resource server y firma asimétrica; no se escribe criptografía casera. ROLE_DRIVER permite acciones de conductor, pero también se verifica que la jornada esté asignada a esa identidad. Expiración corta, scopes, rotación y revocación limitan daño. Logs nunca imprimen tokens."),
("Socket.IO y tiempo real","Spring soporta WebSocket/STOMP de forma natural; Socket.IO es otro protocolo y requiere un servidor compatible o gateway. El curso implementa y compara ambos para decidir por interoperabilidad, rooms, acknowledgements y operación. Eventos contienen shipmentId, sequence, occurredAt y schemaVersion; consumidores deduplican."),
("Archivos y notificaciones push","La base almacena metadatos y hash; fotografías viven en object storage con claves no predecibles, URLs firmadas y retención. Se valida MIME real, tamaño y malware. Un outbox dispara Firebase Admin/APNs después del commit. Push es entrega al menos una vez: payload mínimo, deduplicación y consulta posterior al API."),])}

def render(track,title,topics):
    sections=[]
    for i,(name,body) in enumerate(topics,1):
        sections.append(f"""### Tema {i}: {name}

**Conceptos clave:** contratos, estados explícitos, fallos, seguridad y verificación.

{body} La implementación se conecta a RutaFlow y se prueba con camino feliz, entrada inválida, repetición y dependencia no disponible.

**Analogía:** Es como una central de despacho: cada mensaje necesita identidad, hora, destino y confirmación; ver un vehículo en pantalla no demuestra que el paquete fue entregado.

**¿Por qué es importante?** Porque una aplicación logística funciona en movimiento, con mala red, concurrencia y datos sensibles. La corrección debe sobrevivir fuera de una demostración local.

**Casos de uso reales:** posición tardía, token vencido, fotografía pesada, comando repetido y usuario intentando acceder a una entrega ajena.

**Diagrama:**

```mermaid
sequenceDiagram
  participant M as App móvil
  participant A as API segura
  participant D as Datos/outbox
  M->>A: comando idempotente
  A->>D: regla + persistencia
  D-->>A: resultado + evento
  A-->>M: estado verificable
```
""")
    return f"""# Módulo 14: {title}

## Aprende construyendo

{''.join(sections)}
"""

for track,(title,topics) in MODULES.items():
    path=ROOT/f"web/public/content/{track}/modulo-14.md"
    path.write_text(render(track,title,topics),encoding="utf-8")
    print(path.relative_to(ROOT))
