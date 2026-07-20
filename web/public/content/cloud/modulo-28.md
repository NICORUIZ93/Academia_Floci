# Módulo 28: Bases de datos de grafos y búsqueda — Neptune y OpenSearch


## Aprende construyendo

### Tema 1: Bases de datos de grafos — cuando las relaciones son el dato

**Conceptos clave:** vértice, arista, recorrido de grafo, consulta multi-salto.

Una base de datos relacional o de documentos modela relaciones mediante claves foráneas o referencias, pero seguir una cadena de relaciones —"amigos de mis amigos que también siguieron a esta cuenta"— requiere múltiples consultas o JOINs costosos que se vuelven progresivamente más lentos cuantos más "saltos" de relación necesitas recorrer. Una base de datos de grafos invierte esta prioridad: almacena vértices (entidades, como personas o productos) y aristas (las relaciones entre ellos, como "sigue a" o "compró") como ciudadanos de primera clase, optimizada específicamente para recorrer cadenas de relaciones de forma eficiente sin importar cuántos saltos tenga la consulta.

El caso de uso clásico que justifica esta elección son los grafos sociales (quién conoce a quién), los sistemas de recomendación (productos comprados por usuarios similares), y la detección de fraude (patrones de transacciones conectadas entre múltiples cuentas). Si tu consulta más común es "dame el registro con esta clave" o "dame todos los registros que cumplan este filtro", DynamoDB o RDS siguen siendo la elección correcta; si tu consulta más común es "sigue esta cadena de relaciones y dime qué encuentras al final", una base de grafos como Neptune es donde deberías estar mirando.

**Analogía:** una base de datos relacional es como una guía telefónica: excelente para buscar el número de una persona específica por su nombre, pero terrible para responder "¿quién conoce a alguien que conoce a Juan?". Una base de grafos es como un mapa de conexiones sociales dibujado a mano, donde seguir esa cadena de amistades es tan simple como seguir las líneas dibujadas.

**¿Por qué es importante?** Elegir la estructura de datos correcta para el patrón de consulta dominante de tu aplicación es una de las decisiones arquitectónicas con mayor impacto en rendimiento a largo plazo; forzar consultas de grafo complejas dentro de una base relacional es una fuente común de deuda técnica que se vuelve dolorosa exactamente cuando el sistema crece.

### Tema 2: Neptune en Floci — un servidor Gremlin real, no una simulación

**Conceptos clave:** Apache TinkerPop Gremlin Server, `CreateDBCluster`, proxy WebSocket.

Igual que ElastiCache con Valkey, Neptune en Floci no simula el comportamiento de una base de grafos: gestiona un contenedor Docker real de Apache TinkerPop Gremlin Server —el motor de grafos de código abierto que Neptune usa internamente— y expone una conexión proxy hacia él en un puerto del rango configurado (por defecto 8182–8282, siguiendo el puerto estándar de Gremlin). Cuando creas un clúster con `CreateDBCluster`, Floci lanza este contenedor real; `DescribeDBClusters` te devuelve el endpoint y puerto donde conectarte con cualquier cliente Gremlin estándar, como la librería `gremlin-python`.

Esto significa que las consultas Gremlin que aprendas y practiques aquí —`g.addV()` para añadir un vértice, `g.V().has(...)` para buscar, `g.V().out(...)` para recorrer aristas salientes— son exactamente el mismo lenguaje de consulta que usarías contra un Neptune real en AWS, porque el motor de ejecución subyacente es idéntico.

**Analogía:** conectarte a Neptune en Floci es como practicar ajedrez contra un motor de ajedrez real instalado en tu computadora, en vez de contra un tablero de juguete que solo simula las reglas aproximadamente: las jugadas (consultas) que aprendes a hacer aquí funcionan exactamente igual en el motor real de producción.

**¿Por qué es importante?** Que el motor Gremlin sea real —no una reinterpretación aproximada— es lo que te permite aprender el lenguaje de consulta de grafos genuinamente, sin el riesgo de aprender comportamientos que luego no se replican contra un Neptune real en AWS.

### Tema 3: OpenSearch — modo simulado y modo real

**Conceptos clave:** modo `mock`, dominio, versión de motor, `/_cluster/health`.

OpenSearch resuelve un problema distinto: búsqueda de texto completo (encontrar documentos que contienen ciertas palabras, con relevancia y tolerancia a errores tipográficos) y agregaciones analíticas sobre grandes volúmenes de documentos — piensa en la barra de búsqueda de un sitio de e-commerce, o en un panel de analítica de logs. Floci ofrece dos modos controlados por `FLOCI_SERVICES_OPENSEARCH_MOCK`: en modo simulado (`true`), solo se gestionan los metadatos del dominio en proceso, sin lanzar ningún contenedor — perfecto para pruebas de integración en CI donde solo te interesa validar que tu código de infraestructura crea el dominio correctamente, sin pagar el costo de tiempo de arranque de un motor de búsqueda completo. En modo real (`false`, el valor por defecto), Floci lanza un contenedor Docker completo de OpenSearch, eligiendo la imagen según la versión de motor solicitada, y espera a que `/_cluster/health` reporte un estado saludable antes de marcar el dominio como creado, momento en el cual puedes indexar y buscar documentos de verdad.

Un detalle útil: en modo real, todas las peticiones al plano de datos (`/_search`, `/_index`) funcionan contra el motor completo real, mientras que en modo simulado esos endpoints no responden — solo el plano de gestión (crear/describir/eliminar dominios) está disponible en ese modo.

**Analogía:** el modo simulado de OpenSearch es como probar que la tubería de agua de un edificio está correctamente instalada sin abrir la llave todavía; el modo real es abrir la llave y comprobar que efectivamente sale agua — ambas pruebas son útiles, pero responden preguntas distintas.

**¿Por qué es importante?** Elegir el modo correcto según el contexto —simulado para CI rápida donde solo validas configuración, real para desarrollo local donde necesitas probar búsquedas de verdad— es la misma disciplina de "usa la herramienta con el costo justo para la pregunta que estás respondiendo" que ya aplicaste en otros módulos.

### Tema 4: Eligiendo entre Neptune, OpenSearch y DynamoDB

**Conceptos clave:** patrón de acceso dominante, búsqueda por clave vs relación vs texto completo.

Con Neptune, OpenSearch y DynamoDB en tu caja de herramientas, la pregunta de diseño correcta no es "¿cuál es la mejor base de datos?" sino "¿cuál es el patrón de acceso dominante de esta parte específica de mi sistema?". Si necesitas recuperar un registro por su identificador de forma extremadamente rápida y predecible, DynamoDB. Si necesitas encontrar documentos que contengan ciertas palabras, con relevancia y tolerancia a errores de escritura, OpenSearch. Si necesitas recorrer cadenas de relaciones entre entidades —quién está conectado con quién, y a través de qué caminos—, Neptune.

En sistemas reales, es común usar los tres simultáneamente para distintas partes del mismo dominio: DynamoDB como fuente de verdad transaccional de tus datos de negocio, con un flujo de eventos (DynamoDB Streams, que ya viste en el Módulo 4) que replica cambios hacia OpenSearch para habilitar búsqueda, y hacia Neptune si además necesitas modelar relaciones complejas entre esas mismas entidades — una arquitectura de "múltiples vistas especializadas sobre los mismos datos", cada una optimizada para su propio patrón de consulta.

**Analogía:** elegir entre estas bases de datos es como elegir la herramienta correcta en un taller: un martillo (DynamoDB) para clavos, una sierra (OpenSearch) para cortes precisos, y una llave inglesa (Neptune) para tuercas — ninguna reemplaza completamente a las otras, y un proyecto complejo suele necesitar las tres.

**¿Por qué es importante?** Esta capacidad de "múltiples vistas especializadas sobre la misma fuente de verdad" es un patrón arquitectónico maduro (a veces llamado CQRS a nivel de almacenamiento) que separa correctamente la responsabilidad de "dónde vive la verdad" de "cómo se consulta eficientemente para cada caso de uso".

---


## Laboratorio práctico

> Este laboratorio asume que ya ejecutaste `floci start` y `eval $(floci env)` (Módulo 1) en tu sesión de terminal, así que los comandos de `aws` no repiten `--endpoint-url`.

**Objetivo del laboratorio:** crear un clúster Neptune y modelar un pequeño grafo de relaciones con consultas Gremlin, y luego crear un dominio OpenSearch en modo real e indexar y buscar un documento.

**Requisitos previos:** el socket Docker montado y los rangos de puertos de Neptune (`8182-8282`) y OpenSearch (`9400-9499`) expuestos en tu `docker-compose.yml`. Necesitas la librería `gremlin-python` instalada (`pip install gremlinpython`) para el laboratorio de Neptune.

### Laboratorio 28.1 — Grafo de relaciones con Neptune

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Crea el clúster | `aws neptune create-db-cluster --db-cluster-identifier mi-grafo --engine neptune` | Lanza un contenedor Gremlin Server real | Confirmación con el `DBClusterIdentifier` |
| 2 | Obtén el puerto de conexión | `aws neptune describe-db-clusters --db-cluster-identifier mi-grafo --query 'DBClusters[0].Port' --output text` | El puerto real asignado dentro del rango | Un número de puerto, ej. `8182` |
| 3 | Añade vértices con gremlin-python | Script Python: `client.submit("g.addV('persona').property('nombre','Ana')").all().result()` y repite para "Beto" y "Carla" | Crea tres nodos en el grafo | Confirmación de cada vértice creado |
| 4 | Añade aristas de relación | `client.submit("g.V().has('nombre','Ana').addE('conoce').to(g.V().has('nombre','Beto'))").all().result()` | Conecta Ana con Beto mediante una relación "conoce" | Confirmación de la arista |
| 5 | Consulta el recorrido | `client.submit("g.V().has('nombre','Ana').out('conoce').values('nombre')").all().result()` | Recorre la relación desde Ana | `['Beto']` |

### Laboratorio 28.2 — Búsqueda de texto completo con OpenSearch

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Crea el dominio en modo real | `aws opensearch create-domain --domain-name mi-busqueda --engine-version "OpenSearch_2.11" --cluster-config InstanceType=m5.large.search,InstanceCount=1 --ebs-options EBSEnabled=true,VolumeType=gp2,VolumeSize=10` | Lanza un contenedor OpenSearch real | `Processing: true` inicialmente |
| 2 | Espera a que esté listo | `aws opensearch describe-domain --domain-name mi-busqueda` | Repite hasta que `Created: true` | `Created: true`, con un `Endpoint` asignado |
| 3 | Indexa un documento | `curl -X POST "http://<endpoint>/productos/_doc/1" -H "Content-Type: application/json" -d '{"nombre": "Laptop profesional", "categoria": "electronica"}'` | Escribe directamente al plano de datos real | Confirmación de indexación |
| 4 | Busca por texto | `curl "http://<endpoint>/productos/_search?q=laptop"` | Búsqueda de texto completo real | El documento indexado en los resultados |

**Verificación:** el laboratorio se considera exitoso si la consulta Gremlin `g.V().has('nombre','Ana').out('conoce').values('nombre')` devuelve `['Beto']`, confirmando que la relación se guardó y se puede recorrer, y si la búsqueda `_search?q=laptop` contra tu dominio OpenSearch en modo real devuelve el documento indexado en el paso anterior.

**Errores comunes y soluciones**

- **`gremlin-python` no puede conectar.** Verifica que estés usando el puerto exacto devuelto por `describe-db-clusters`, no el 8182 por defecto si tu clúster obtuvo un puerto distinto del rango.
- **El dominio OpenSearch se queda en `Processing: true` mucho tiempo.** El contenedor real puede tardar en arrancar completamente; verifica con `docker ps` que el contenedor está corriendo, y revisa sus logs si nunca reporta salud verde/amarilla en `/_cluster/health`.
- **Confundir cuándo usar Neptune vs simplemente relaciones en DynamoDB.** Si tu "relación" es siempre de un solo salto y conocido de antemano (por ejemplo, "el autor de este artículo"), una clave foránea simple en DynamoDB es suficiente; reserva Neptune para cuando realmente necesites recorrer cadenas de relaciones de profundidad variable.

---
