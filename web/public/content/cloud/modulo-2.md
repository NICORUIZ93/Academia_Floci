# Módulo 2: Almacenamiento en la nube con S3


## Aprende construyendo

### Tema 1: Objetos, buckets y su nomenclatura

#### Paso 1 · Objetivo y preparación
Al finalizar podrás almacenar un objeto desde cero. Prerrequisitos: Docker y AWS CLI; verifica `aws --version`.
#### Paso 2 · Contexto y caso real
Una entrega necesita conservar archivos con nombre, contenido y permisos.
#### Paso 3 · Teoría, modelo mental y analogía
Un bucket es un almacén y la key es la etiqueta única de cada paquete.
#### Paso 4 · Demostración guiada
Crea `src/upload.js` desde una carpeta vacía.
```bash
mkdir ejemplo-s3
aws --version
node --version
```
Resultado esperado: CLI disponible.
#### Paso 5 · Práctica guiada
Pista: usa un bucket inexistente para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Sube, descarga y verifica un archivo.
#### Paso 7 · Cierre y evidencia
Entrega comandos, salida, fallo y corrección; explica el resultado. Siguiente paso: claves y metadatos. Errores comunes: confundir key y ruta local. Fuente oficial: https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html.
**Conceptos clave:** objeto, bucket, almacenamiento de objetos (frente a almacenamiento de bloques o de archivos), nombre único global.

S3 es un servicio de almacenamiento de objetos: cada archivo que subes se guarda como un objeto, identificado por una clave (key) dentro de un contenedor lógico llamado bucket. A diferencia de un sistema de archivos tradicional, en S3 no existen carpetas reales: lo que parece una estructura de carpetas (`fotos/2024/viaje.jpg`) es, en realidad, una única clave de texto plano que contiene barras (`/`), y las herramientas de S3 (incluida la consola web de AWS) simplemente interpretan visualmente esas barras como si fueran carpetas.

Un bucket es el contenedor de nivel superior donde viven los objetos, y su nombre debe ser único a nivel global en todo AWS (no solo dentro de tu cuenta), porque S3 usa el nombre del bucket como parte de la URL pública del servicio. Esto significa que si alguien en cualquier parte del mundo ya está usando el nombre `mi-bucket` en su cuenta real de AWS, tú no podrías crear un bucket con ese mismo nombre en una cuenta real (aunque en Floci, al ser un entorno aislado por completo, esta restricción de unicidad global no aplica de la misma forma, ya que tu Floci local no comparte espacio de nombres con la nube real ni con otros Flocis de otras personas).

Los nombres de bucket siguen reglas estrictas: solo letras minúsculas, números, puntos y guiones; entre 3 y 63 caracteres; deben empezar y terminar con una letra o número; y no pueden tener formato de dirección IP. Estas reglas existen porque el nombre del bucket puede formar parte de una URL o de un nombre de host DNS (en el estilo de acceso "virtual-hosted", el bucket aparece como subdominio: `mi-bucket.s3.amazonaws.com`), y los nombres de host DNS tienen sus propias restricciones que S3 hereda para sus nombres de bucket.

Dentro de un bucket, la organización es plana: no hay límite práctico al número de objetos que puedes guardar, y no existe el concepto de "mover" un archivo de una carpeta a otra como operación atómica nativa (aunque los SDK y la CLI simulan esa operación copiando el objeto a la nueva clave y borrando el original). Entender esta naturaleza plana, sin jerarquía real, es clave para no sorprenderte cuando ciertas operaciones que parecen triviales en un sistema de archivos (como renombrar una carpeta completa) en S3 requieren, en realidad, copiar y borrar cada objeto uno por uno.

**Analogía:** piensa en un bucket como un almacén de autoservicio con miles de casillas, y en cada objeto como el contenido de una casilla identificada por una etiqueta única (la clave). No existen "pasillos" reales dentro del almacén; lo que parece un pasillo (`fotos/2024/`) es solo parte del texto de la etiqueta de cada casilla. Buscar por etiqueta es instantáneo; reorganizar "pasillos" completos significa, en realidad, volver a etiquetar y mover cada casilla una por una.

**¿Por qué es importante?** Casi cualquier aplicación real necesita guardar archivos que no encajan bien en una base de datos: imágenes, documentos, videos, backups, logs. S3 (y sus equivalentes en otros proveedores, Blob Storage y Cloud Storage, que verás en el Módulo 8) es el servicio de referencia para ese caso de uso en toda la industria, y entender su modelo de objeto plano —sin carpetas reales— evita errores de diseño comunes, como asumir que renombrar una "carpeta" con miles de archivos es una operación instantánea.

**Diagrama:**

```
Bucket: mi-bucket
┌──────────────────────────────────────────────┐
│  Clave: "hola.txt"            → objeto A       │
│  Clave: "fotos/2024/viaje.jpg" → objeto B       │
│  Clave: "fotos/2024/playa.jpg" → objeto C       │
│  Clave: "backups/db.sql"       → objeto D       │
└──────────────────────────────────────────────┘
   (No hay carpetas reales: "fotos/2024/" es solo
    texto dentro de cada clave, no una estructura física)
```

### Tema 2: Claves y metadatos

#### Paso 1 · Objetivo y preparación
Al finalizar podrás describir un objeto desde cero. Prerrequisitos: Docker y AWS CLI; verifica `aws --version`.
#### Paso 2 · Contexto y caso real
Los metadatos permiten validar tipo, integridad y comportamiento de una descarga.
#### Paso 3 · Teoría, modelo mental y analogía
La key es etiqueta; Content-Type y ETag son la ficha técnica y huella del paquete.
#### Paso 4 · Demostración guiada
Crea `src/metadata.js` desde una carpeta vacía.
```bash
mkdir ejemplo-metadatos
aws --version
node --version
```
Resultado esperado: CLI disponible.
#### Paso 5 · Práctica guiada
Pista: declara un tipo incorrecto para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Compara ETag y Content-Type.
#### Paso 7 · Cierre y evidencia
Entrega comandos, salida, fallo y corrección; explica el resultado. Siguiente paso: versionado. Errores comunes: confiar en extensión y no validar integridad. Fuente oficial: https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingMetadata.html.
**Conceptos clave:** clave (key), metadatos del sistema, metadatos personalizados, Content-Type, ETag.

La clave de un objeto es su identificador único dentro de un bucket: dos objetos en el mismo bucket nunca pueden tener la misma clave (si subes un archivo con una clave ya existente, sobrescribes el objeto anterior, salvo que el versionado esté activo, que es exactamente el tema siguiente). La clave es simplemente una cadena de texto de hasta 1024 bytes, sin ninguna estructura obligatoria más allá de eso; la convención de usar barras para simular carpetas es solo eso, una convención ampliamente adoptada por comodidad visual.

Cada objeto en S3 lleva asociados metadatos, divididos en dos categorías. Los metadatos del sistema son gestionados por S3 automáticamente: el tamaño del objeto en bytes, la fecha de la última modificación, y el ETag (un hash del contenido que sirve para detectar si el contenido cambió sin necesidad de descargar el objeto completo). El `Content-Type` es un metadato especial que le indica a un navegador o cliente HTTP cómo interpretar el archivo (por ejemplo, `image/jpeg` o `application/pdf`); si no lo especificas al subir el archivo, muchos clientes (incluida la CLI de AWS) intentan inferirlo automáticamente a partir de la extensión del archivo, pero no siempre aciertan, así que es buena práctica especificarlo explícitamente para archivos que vas a servir directamente desde un navegador.

Los metadatos personalizados, en cambio, son pares clave-valor arbitrarios que tú defines al subir el objeto, con el prefijo `x-amz-meta-` cuando se envían por la API HTTP directamente (la CLI simplifica esto con la opción `--metadata`). Son útiles para guardar información de negocio junto al archivo sin necesidad de una base de datos separada: por ejemplo, guardar el ID de usuario que subió una imagen, o la categoría de un documento, directamente como metadato del objeto.

Es importante entender una limitación práctica de los metadatos personalizados: no son consultables de forma eficiente. S3 no ofrece una forma nativa de "buscar todos los objetos donde el metadato `categoria` sea `factura`" sin recorrer (listar) todos los objetos del bucket uno por uno. Si tu aplicación necesita búsquedas eficientes por atributos, la práctica común es guardar esos atributos en una base de datos (como DynamoDB, que verás en el Módulo 4) que apunte a la clave del objeto en S3, en vez de depender de los metadatos de S3 como único mecanismo de búsqueda.

**Analogía:** la clave es como el número de seguimiento de un paquete: identifica exactamente ese paquete y ningún otro dentro del sistema. Los metadatos son como la etiqueta pegada al paquete: peso, fecha de envío (metadatos del sistema, que pone la empresa de mensajería automáticamente) y una nota escrita a mano por el remitente ("frágil", "para cumpleaños") que serían los metadatos personalizados. La empresa de mensajería puede leer la etiqueta de un paquete concreto al instante, pero no tiene forma rápida de encontrar "todos los paquetes marcados como frágiles" sin revisar cada paquete uno por uno.

**¿Por qué es importante?** Diseñar bien el esquema de claves y decidir correctamente qué metadatos guardar (y qué guardar en su lugar en una base de datos) es una de las decisiones de arquitectura más comunes al trabajar con almacenamiento de objetos. Un mal diseño de claves (por ejemplo, usar un prefijo secuencial como `00001`, `00002`, ...) puede incluso generar problemas de rendimiento a gran escala en la nube real, un detalle que documentación oficial de AWS aborda en profundidad y que conviene conocer aunque no sea observable en Floci a la escala de un laboratorio.

**Diagrama:**

```
Objeto con clave "facturas/2024/factura-001.pdf"
┌──────────────────────────────────────────────┐
│ Metadatos del sistema (S3 los gestiona):        │
│   Content-Type: application/pdf                 │
│   Content-Length: 245678                        │
│   ETag: "9bd8a..."                               │
│   Last-Modified: 2026-03-10T14:22:00Z            │
├──────────────────────────────────────────────┤
│ Metadatos personalizados (tú los defines):      │
│   x-amz-meta-usuario-id: u-4471                 │
│   x-amz-meta-categoria: factura                 │
└──────────────────────────────────────────────┘
```

### Tema 3: Versionado y ciclo de vida

#### Paso 1 · Objetivo y preparación
Al finalizar podrás recuperar versiones desde cero. Prerrequisitos: Docker y AWS CLI; verifica `aws --version`.
#### Paso 2 · Contexto y caso real
Un archivo reemplazado accidentalmente debe poder recuperarse.
#### Paso 3 · Teoría, modelo mental y analogía
Versionar es conservar ediciones con identificador, no sobrescribir la historia.
#### Paso 4 · Demostración guiada
Crea `src/versioning.js` desde una carpeta vacía.
```bash
mkdir ejemplo-versiones
aws --version
node --version
```
Resultado esperado: CLI disponible.
#### Paso 5 · Práctica guiada
Pista: borra una versión equivocada para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Prueba marcador de borrado y ciclo de vida.
#### Paso 7 · Cierre y evidencia
Entrega comandos, salida, fallo y corrección; explica el resultado. Siguiente paso: clases de almacenamiento. Errores comunes: creer que borrar elimina todo y olvidar costes. Fuente oficial: https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html.
**Conceptos clave:** versionado, ID de versión, marcador de borrado (delete marker), reglas de ciclo de vida (lifecycle rules).

Por defecto, cuando subes un objeto a una clave que ya existe, S3 simplemente sobrescribe el contenido anterior sin dejar rastro: la versión anterior se pierde para siempre. El versionado cambia este comportamiento: una vez activado en un bucket, cada vez que subes un objeto a una clave ya existente, S3 conserva ambas versiones —la anterior y la nueva—, cada una identificada por un ID de versión único, en vez de sobrescribir. Puedes listar todas las versiones históricas de una clave, recuperar cualquier versión anterior, o incluso restaurar una versión antigua como la versión "actual" simplemente volviendo a subirla.

Con el versionado activo, borrar un objeto tampoco lo elimina físicamente de inmediato: en su lugar, S3 coloca un marcador de borrado (delete marker) como la versión más reciente de esa clave. El objeto deja de aparecer en un listado normal (porque el marcador de borrado "oculta" las versiones anteriores en las operaciones estándar), pero las versiones reales del contenido siguen existiendo y son recuperables eliminando ese marcador de borrado. Esto añade una capa de protección contra borrados accidentales, aunque también significa que el versionado, una vez activado en un bucket, no se puede desactivar por completo —solo se puede suspender—, y que un bucket con versionado activo consume más espacio de almacenamiento, porque conserva cada versión histórica.

El ciclo de vida (lifecycle) de un objeto se gestiona con reglas que S3 aplica automáticamente con el paso del tiempo, sin intervención manual. Una regla de ciclo de vida puede, por ejemplo, mover automáticamente objetos con más de 30 días de antigüedad a una capa de almacenamiento más barata (pensada para acceso infrecuente), o eliminar automáticamente versiones antiguas de un objeto con más de 90 días, o eliminar marcadores de borrado huérfanos. Estas reglas se definen sobre un bucket completo o sobre un prefijo de claves específico (por ejemplo, solo sobre `logs/`), y se evalúan de forma asíncrona en segundo plano por el propio servicio.

Combinar versionado con reglas de ciclo de vida es un patrón muy común en producción: activas el versionado para protegerte de sobrescrituras y borrados accidentales, pero añades una regla de ciclo de vida que elimina automáticamente versiones con más de cierta antigüedad, para que el coste de almacenamiento no crezca sin control indefinidamente por conservar cada versión histórica para siempre.

**Analogía:** el versionado es como el historial de revisiones de un documento colaborativo (por ejemplo, en un editor de texto en línea): cada cambio guardado no borra el anterior, sino que queda disponible para volver atrás si es necesario. "Eliminar" el documento no destruye ese historial de inmediato; lo mueve a una papelera desde la que se puede recuperar. Una regla de ciclo de vida sería como una política automática que vacía permanentemente la papelera después de 90 días, para no acumular historial para siempre.

**¿Por qué es importante?** El versionado es la defensa más simple y efectiva contra el error humano más común al trabajar con almacenamiento: sobrescribir o borrar el archivo equivocado por accidente. Cualquier bucket que guarde datos que importa no perder (backups, documentos de usuarios, código fuente empaquetado) debería, como práctica estándar de la industria, tener versionado activo desde el primer día.

**Diagrama:**

```
Clave: "informe.pdf"        (versionado ACTIVO)

Subida 1  ──▶  versión v1  (contenido A)
Subida 2  ──▶  versión v2  (contenido B)   ← "versión actual"
Borrado   ──▶  marcador de borrado          ← "versión actual" (oculta v1 y v2 del listado normal)

v1 y v2 siguen existiendo y son recuperables
eliminando el marcador de borrado.
```

### Tema 4: Transición entre capas de almacenamiento

#### Paso 1 · Objetivo y preparación
Al finalizar podrás elegir una clase desde cero. Prerrequisitos: Docker y AWS CLI; verifica `aws --version`.
#### Paso 2 · Contexto y caso real
El coste y la latencia dependen de la frecuencia con que se consulta un archivo.
#### Paso 3 · Teoría, modelo mental y analogía
Es elegir entre una bodega cercana y otra barata pero lenta.
#### Paso 4 · Demostración guiada
Crea `src/storage-class.js` desde una carpeta vacía.
```bash
mkdir ejemplo-storage
aws --version
node --version
```
Resultado esperado: CLI disponible.
#### Paso 5 · Práctica guiada
Pista: usa una clase no soportada para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Compara coste, recuperación y retención.
#### Paso 7 · Cierre y evidencia
Entrega matriz, salida, fallo y corrección; explica el resultado. Siguiente paso: seguridad. Errores comunes: optimizar solo almacenamiento y olvidar recuperación. Fuente oficial: https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html.
**Conceptos clave:** clase de almacenamiento (storage class), Standard, Infrequent Access, Glacier, coste vs latencia de acceso.

S3 no ofrece una única forma de almacenar datos: ofrece varias clases de almacenamiento, cada una con un equilibrio distinto entre coste por gigabyte, coste por operación de acceso, y tiempo de recuperación. La clase Standard es la de propósito general, pensada para datos a los que accedes con frecuencia y necesitas recuperar al instante. Las clases de acceso infrecuente cuestan menos por gigabyte almacenado, pero cobran más por cada operación de lectura, y están pensadas para datos a los que accedes rara vez pero necesitas cuando los necesitas, sin demora. Las clases de archivo profundo (como Glacier en AWS) son mucho más baratas por gigabyte, pero el tiempo de recuperación puede ser de horas en vez de milisegundos, porque los datos se almacenan de una forma optimizada para coste, no para acceso inmediato.

Esta variedad existe porque no todos los datos tienen el mismo patrón de acceso a lo largo de su vida útil. Un archivo de log recién generado se consulta con frecuencia en sus primeros días (para depurar un problema reciente), pero después de unas semanas casi nadie vuelve a mirarlo, y después de un año probablemente solo se conserva por requisitos de auditoría o cumplimiento normativo, sin ninguna expectativa de consultarlo activamente. Pagar el precio de la capa Standard para ese archivo durante todo un año sería un desperdicio de presupuesto.

Las reglas de ciclo de vida que viste en el tema anterior son, precisamente, el mecanismo que automatiza esta transición: defines una regla que dice "después de 30 días, mueve estos objetos a la capa de acceso infrecuente; después de 90 días, muévelos a la capa de archivo profundo", y S3 se encarga de moverlos automáticamente sin que tengas que intervenir manualmente ni escribir un proceso propio que lo haga.

Es importante evaluar el patrón de acceso real de tus datos antes de aplicar transiciones agresivas: mover a una capa de archivo profundo datos que en realidad necesitas consultar con cierta regularidad puede acabar costando más en operaciones de recuperación de lo que ahorras en almacenamiento, además de introducir la latencia de recuperación (horas, no milisegundos) como un problema operativo real si alguien necesita ese dato con urgencia.

**Analogía:** las clases de almacenamiento son como los distintos tipos de guardado de documentos en una empresa: los documentos del mes actual están en el archivador de tu escritorio (Standard, acceso instantáneo, más caro por espacio), los del año pasado están en un archivador en el sótano (acceso infrecuente, más barato, tardas unos minutos en ir a buscarlos), y los de hace diez años están en un almacén externo de terceros (archivo profundo, muy barato, pero pedir un documento de vuelta puede tardar días).

**¿Por qué es importante?** El coste de almacenamiento en la nube a gran escala puede ser una de las partidas de gasto más significativas de una aplicación con muchos datos históricos. Diseñar bien las reglas de transición de ciclo de vida, en vez de dejar todo indefinidamente en la capa más cara, es una de las optimizaciones de coste más directas y de mayor impacto que existen en arquitecturas cloud reales.

**Diagrama:**

```
Día 0 ────────────▶ Día 30 ───────────▶ Día 90 ──────────▶
 Standard             Acceso infrecuente     Archivo profundo
 (rápido, caro)        (más barato,           (muy barato,
                        algo más de coste       recuperación en
                        por acceso)              horas, no ms)
```

### Tema 5: Políticas de bucket, ACL y URLs pre-firmadas

#### Paso 1 · Objetivo y preparación
Al finalizar podrás compartir un objeto con mínimo privilegio. Prerrequisitos: Docker y AWS CLI; verifica `aws --version`.
#### Paso 2 · Contexto y caso real
Una URL temporal debe permitir una acción concreta sin entregar credenciales.
#### Paso 3 · Teoría, modelo mental y analogía
La policy es reglamento, ACL es excepción y URL prefirmada es pase temporal.
#### Paso 4 · Demostración guiada
Crea `src/presigned-url.js` desde una carpeta vacía.
```bash
mkdir ejemplo-seguridad
aws --version
node --version
```
Resultado esperado: CLI disponible.
#### Paso 5 · Práctica guiada
Pista: usa un permiso excesivo para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Expira la URL y verifica la denegación.
#### Paso 7 · Cierre y evidencia
Entrega policy, salida, fallo y corrección; explica el resultado. Siguiente paso: colas. Errores comunes: ACL pública y URLs sin expiración. Fuente oficial: https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-best-practices.html.
**Conceptos clave:** bucket policy, ACL (lista de control de acceso), URL pre-firmada (presigned URL), principio de mínimo privilegio.

Existen tres mecanismos principales para controlar quién puede acceder a un bucket o a sus objetos, y cada uno resuelve un caso de uso distinto. Una política de bucket es un documento en formato JSON que se adjunta al bucket completo y define reglas de acceso basadas en el principal (quién hace la petición), la acción (qué operación intenta hacer) y el recurso (sobre qué objetos o el bucket completo aplica). Es el mecanismo más flexible y el recomendado para la mayoría de los casos, porque permite expresar reglas complejas, como "permitir lectura pública solo sobre el prefijo `publico/`, pero denegar todo lo demás".

Las ACL (listas de control de acceso) son un mecanismo más antiguo y más limitado, que se aplican a nivel de bucket u objeto individual, y conceden permisos a un conjunto reducido de destinatarios predefinidos (el propietario, otra cuenta AWS específica, o "todos" de forma pública). AWS recomienda actualmente evitar las ACL en favor de las políticas de bucket e IAM siempre que sea posible, porque son más difíciles de auditar a gran escala (revisar el acceso real a un bucket requiere revisar la política del bucket, las políticas IAM de cada usuario o rol, y además las ACL de cada objeto individual, si las hay).

Una URL pre-firmada resuelve un problema distinto: dar acceso temporal y limitado a un objeto específico sin necesidad de hacer público el bucket ni de compartir credenciales. Se genera firmando criptográficamente una URL con tus credenciales, con una fecha de expiración incluida en la propia firma; cualquiera que tenga esa URL puede realizar la operación permitida (normalmente descargar o subir un objeto específico) hasta que expire, sin necesitar sus propias credenciales de AWS. Es el mecanismo típico para, por ejemplo, permitir que un usuario de tu aplicación descargue un archivo privado durante quince minutos, sin exponer el bucket completo ni tus credenciales reales.

El hilo común entre estos tres mecanismos es el principio de mínimo privilegio: conceder exactamente el acceso necesario, ni más ni menos, y preferir siempre el mecanismo más explícito y auditable (políticas de bucket combinadas con políticas IAM) sobre atajos más amplios y menos trazables (ACL públicas, o compartir credenciales reales en vez de generar una URL temporal). Este principio no es exclusivo de S3: lo vas a ver formalizado con mucho más detalle en el Módulo 7, dedicado enteramente a IAM.

**Analogía:** una política de bucket es como el reglamento general de un edificio de oficinas, que dice explícitamente quién puede entrar a qué pisos y en qué horario. Una ACL es como dar una llave física a una persona concreta para una puerta concreta: funciona, pero si tienes que dar acceso a muchas personas distintas para muchas puertas distintas, se vuelve difícil de rastrear quién tiene qué llave. Una URL pre-firmada es como un pase de visitante de un solo uso, válido solo por unas horas, que no requiere que la persona tenga ninguna credencial permanente del edificio.

**¿Por qué es importante?** La configuración incorrecta de acceso a buckets S3 —típicamente buckets hechos públicos por error mediante una política o ACL demasiado permisiva— ha sido, en la nube real, una de las causas más comunes de filtraciones de datos reportadas en la industria. Entender la diferencia entre estos tres mecanismos, y por defecto inclinarte hacia el más restrictivo y auditable, es una de las habilidades de seguridad más prácticas y transferibles que vas a construir en este curso.

**Diagrama:**

```
┌─────────────────────┐   ┌─────────────────────┐   ┌───────────────────────┐
│  Política de bucket   │   │        ACL           │   │   URL pre-firmada       │
│  (reglas JSON sobre    │   │  (permisos directos   │   │   (acceso temporal,      │
│   el bucket completo,  │   │   a un objeto/bucket,  │   │    sin credenciales,     │
│   auditable, flexible) │   │   menos recomendado)   │   │    expira en el tiempo)  │
└─────────────────────┘   └─────────────────────┘   └───────────────────────┘
```

---


## Construcción guiada: almacena y recupera un archivo

> Esta construcción asume que ya ejecutaste `floci start` y `eval $(floci env)` (Módulo 1) en tu sesión de terminal, así que los comandos de `aws` no repiten `--endpoint-url`.

**Objetivo:** realizar el ciclo completo de operaciones CRUD sobre un bucket S3 en Floci, y después practicar versionado subiendo múltiples versiones de un mismo archivo.

**Requisitos previos:** Floci corriendo (Módulo 1) con el servicio S3 activo, AWS CLI configurada contra `http://localhost:4566`.

### Antes de escribir código: ubica el ejemplo

No necesitas inventar una estructura ni copiar un fragmento aislado. El repositorio ya contiene dos clientes ejecutables que realizan la misma consulta con SDK diferentes:

```text
Academia_Floci/
└── examples/
    ├── node/
    │   ├── package.json
    │   └── s3-list-buckets.js
    └── python/
        ├── requirements.txt
        └── s3_list_buckets.py
```

El archivo `package.json` declara AWS SDK para JavaScript; `requirements.txt` declara `boto3` para Python. Los archivos `s3-list-buckets.js` y `s3_list_buckets.py` son los puntos de entrada: configuran el cliente, envían `ListBuckets` y convierten la respuesta del SDK en una salida legible.

```mermaid
sequenceDiagram
    actor Estudiante
    participant SDK as "SDK AWS"
    participant Floci as "Floci :4566"
    participant S3 as "Servicio S3 local"
    Estudiante->>SDK: Ejecuta el cliente
    SDK->>Floci: ListBuckets + credenciales test
    Floci->>S3: Enruta la operación
    S3-->>Floci: Buckets[]
    Floci-->>SDK: Respuesta compatible con AWS
    SDK-->>Estudiante: Nombre y fecha de cada bucket
```

### Opción A — JavaScript con AWS SDK v3

Abre una terminal en la raíz del repositorio y ejecuta:

```bash
cd examples/node
npm install
node s3-list-buckets.js
```

El ejemplo usa `S3Client` como conexión reutilizable y `ListBucketsCommand` como descripción de una operación concreta. `endpoint` evita enviar la petición a AWS real; `forcePathStyle` genera rutas compatibles con el entorno local; las credenciales `test` son deliberadamente falsas y solo sirven para firmar la petición compatible.

Si todavía no creaste buckets, la salida será:

```text
No hay buckets todavía. Crea uno con s3-create-bucket.js
```

Después de crear `mi-bucket` con el paso 1 de la Parte 1, vuelve a ejecutar el cliente. Debes observar una línea similar a:

```text
Buckets:
  - mi-bucket (creado 2026-07-19T14:20:00.000Z)
```

### Opción B — Python con boto3

En otra terminal, desde la raíz del repositorio:

```bash
cd examples/python
python3 -m venv .venv
source .venv/bin/activate          # macOS o Linux
# En PowerShell de Windows usa: .venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python s3_list_buckets.py
```

`boto3.client("s3", ...)` cumple el mismo papel que `S3Client`: guarda endpoint, región y credenciales. `list_buckets()` realiza la llamada; `result.get("Buckets", [])` trata de forma segura el caso sin resultados. La salida debe coincidir con la del cliente JavaScript porque ambos consultan el mismo runtime local.

### Provoca un fallo útil antes de continuar

Detén Floci y ejecuta cualquiera de los clientes. Debes obtener un error de conexión contra `localhost:4566`. Ese fallo demuestra que el SDK no contiene datos ficticios: depende del servicio local. Inicia Floci de nuevo y confirma que el mismo comando vuelve a funcionar. Si el error menciona AWS real o credenciales de producción, revisa `endpoint`; no añadas claves reales para “arreglarlo”.

**Modificación guiada:** cambia temporalmente la región a `eu-west-1` en uno de los clientes y predice si el listado cambiará en el emulador. Ejecuta, compara el resultado y documenta la diferencia esperada al pasar a AWS real. Luego restaura `us-east-1` para continuar. Esta comparación conecta configuración local con una decisión real de arquitectura, en vez de limitarse a copiar comandos.

### Parte 1 — Operaciones CRUD básicas

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Crear un bucket | `aws s3 mb s3://mi-bucket` | Crea un bucket nuevo con nombre único dentro de tu Floci | `make_bucket: mi-bucket` |
| 2 | Crear un archivo local de prueba | `echo "Hola mundo" > hola.txt` | Prepara un archivo simple para subir | El archivo `hola.txt` aparece en tu directorio actual |
| 3 | Subir el archivo | `aws s3 cp hola.txt s3://mi-bucket/` | Sube el archivo como un objeto con clave `hola.txt` | `upload: ./hola.txt to s3://mi-bucket/hola.txt` |
| 4 | Listar los objetos del bucket | `aws s3 ls s3://mi-bucket/` | Confirma que el objeto existe en el bucket | Una línea con la fecha, tamaño y nombre `hola.txt` |
| 5 | Descargar el archivo | `aws s3 cp s3://mi-bucket/hola.txt hola-descargado.txt` | Descarga el objeto a un archivo local nuevo | `download: s3://mi-bucket/hola.txt to ./hola-descargado.txt` |
| 6 | Confirmar el contenido descargado | `cat hola-descargado.txt` | Verifica que el contenido descargado coincide con el original | `Hola mundo` |
| 7 | Eliminar el objeto | `aws s3 rm s3://mi-bucket/hola.txt` | Elimina el objeto del bucket | `delete: s3://mi-bucket/hola.txt` |
| 8 | Eliminar el bucket vacío | `aws s3 rb s3://mi-bucket` | Elimina el bucket, ya sin objetos dentro | `remove_bucket: mi-bucket` |

### Parte 2 — Versionado

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Crear un bucket nuevo para este laboratorio | `aws s3 mb s3://mi-bucket-versionado` | Bucket dedicado para practicar versionado sin interferir con el laboratorio anterior | `make_bucket: mi-bucket-versionado` |
| 2 | Activar el versionado | `aws s3api put-bucket-versioning --bucket mi-bucket-versionado --versioning-configuration Status=Enabled` | A partir de aquí, cada subida a una misma clave conserva la versión anterior en vez de sobrescribirla | Sin salida (comando exitoso) |
| 3 | Subir la primera versión | `echo "version 1" > informe.txt && aws s3 cp informe.txt s3://mi-bucket-versionado/` | Sube el contenido inicial | `upload: ./informe.txt to s3://mi-bucket-versionado/informe.txt` |
| 4 | Subir una segunda versión con el mismo nombre | `echo "version 2" > informe.txt && aws s3 cp informe.txt s3://mi-bucket-versionado/` | Con versionado activo, esto NO borra la versión 1; crea una versión nueva | `upload: ./informe.txt to s3://mi-bucket-versionado/informe.txt` |
| 5 | Listar todas las versiones de la clave | `aws s3api list-object-versions --bucket mi-bucket-versionado` | Muestra ambas versiones con sus IDs de versión distintos | Un JSON con dos entradas en `Versions`, cada una con un `VersionId` distinto |
| 6 | Descargar específicamente la versión más antigua | `aws s3api get-object --bucket mi-bucket-versionado --key informe.txt --version-id <VersionId-de-la-primera-version> version-1-recuperada.txt` | Recupera exactamente el contenido de la primera versión, aunque ya no sea la "versión actual" | `cat version-1-recuperada.txt` debe mostrar `version 1` |

**Verificación visual con ambas interfaces:** realiza la construcción con StackPort en `http://localhost:8080` y repítela con Floci UI en `http://localhost:4500` → **Cloud Explorer → Storage**. Si configuraste ambas interfaces contra el mismo runtime, puedes compararlas en paralelo; de lo contrario, recuerda que cada stack predeterminado mantiene recursos independientes. En todos los casos confirma con `aws s3 ls s3://NOMBRE --recursive` contra el endpoint correcto.

**Verificación:** en la Parte 1, el contenido observado en Floci UI debe coincidir con `aws s3 ls`; tras el paso 8, ambos deben confirmar que el bucket ya no existe. En la Parte 2, `list-object-versions` debe mostrar exactamente dos versiones para la clave `informe.txt`, con IDs distintos, y la versión recuperada explícitamente por su ID debe contener el texto `version 1`, no `version 2`.

**Errores comunes y soluciones**

- **`An error occurred (BucketAlreadyOwnedByYou)` al crear un bucket.** El nombre ya existe en tu instancia de Floci (por ejemplo, de un intento anterior que no eliminaste). Usa un nombre distinto o elimina primero el bucket existente con `aws s3 rb s3://nombre --force` (el `--force` elimina también los objetos que contenga).
- **`An error occurred (NoSuchBucket)` al subir un archivo.** El bucket no se creó correctamente, o escribiste mal el nombre. Verifica con `aws s3 ls` (sin especificar bucket) que el nombre aparece en la lista.
- **`fatal error: An error occurred (BucketNotEmpty)` al intentar eliminar un bucket.** El bucket todavía tiene objetos (o versiones, si el versionado está activo) dentro. Elimina primero todos los objetos con `aws s3 rm s3://bucket --recursive`, y si hay versionado activo, puede que necesites eliminar también las versiones y marcadores de borrado individualmente antes de poder borrar el bucket.
- **La AWS CLI intenta hablar con AWS real en vez de con Floci.** Olvidaste ejecutar `eval $(floci env)` en la sesión actual de terminal, o abriste una pestaña nueva donde esas variables no están exportadas — normalmente produce un error de credenciales o de conectividad. Vuelve a ejecutar `eval $(floci env)` (Módulo 1); si prefieres no depender de una variable de sesión, puedes añadir `--endpoint-url http://localhost:4566` a un comando puntual.

---
