# Módulo 7: Identidad y acceso con IAM

## Sílabo

**Objetivo general**

Gestionar quién puede hacer qué dentro de tu cuenta de nube: usuarios, grupos, roles y políticas, aplicando de forma consistente el principio de mínimo privilegio a los servicios que ya usaste en los módulos anteriores.

**Objetivos específicos**

1. Explicar el principio de mínimo privilegio y el modelo de responsabilidad compartida.
2. Diferenciar usuarios, grupos y roles, y cuándo usar cada uno.
3. Escribir una política IAM que conceda exactamente el acceso necesario, ni más ni menos.
4. Verificar permisos efectivos usando el simulador de políticas.
5. Justificar por qué los roles son preferibles a las credenciales de usuario para servicios como Lambda.

**Contenido**

- Principio de mínimo privilegio.
- Modelo de responsabilidad compartida.
- Usuarios, grupos y roles.
- Estructura de una política: acciones, recursos y condiciones.
- Buenas prácticas: roles sobre usuarios, políticas restrictivas, rotación de credenciales.

**Evaluación**

Un laboratorio que crea un usuario con permisos mínimos verificados con el simulador de políticas, y tres ejercicios de evaluación sobre diseño de políticas, roles frente a usuarios, y diagnóstico de permisos.

---

## Aprende construyendo

### Tema 1: Principio de mínimo privilegio

**Conceptos clave:** mínimo privilegio, superficie de ataque, permisos por defecto denegados.

El principio de mínimo privilegio establece que cualquier identidad —una persona, una aplicación, un servicio— debe tener únicamente los permisos estrictamente necesarios para realizar su función, y ningún permiso adicional "por si acaso" o "por comodidad". En IAM, este principio se refuerza con un comportamiento por defecto importante: cualquier acción sobre cualquier recurso está denegada de forma implícita a menos que exista una política que la permita explícitamente. No existe un estado inicial de "todo permitido" que debas ir restringiendo; el punto de partida es "nada permitido", y vas concediendo permisos específicos según se necesitan.

Este enfoque reduce directamente lo que se conoce como superficie de ataque: si una credencial se ve comprometida —por una fuga accidental, un error de configuración, o un ataque exitoso—, el daño que un atacante puede causar con esa credencial está limitado exactamente a los permisos que esa identidad tenía concedidos, ni uno más. Una credencial con permisos administrativos completos comprometida es un incidente de seguridad potencialmente catastrófico; esa misma credencial, si solo tenía permiso de lectura sobre un bucket específico, limita el daño posible a esa acción concreta sobre ese recurso concreto.

Aplicar mínimo privilegio en la práctica no es una tarea de una sola vez: requiere revisar periódicamente qué permisos realmente se usan (muchos proveedores de nube, incluyendo AWS en su entorno real, ofrecen herramientas de análisis de acceso que muestran qué permisos concedidos nunca se han usado realmente), y retirar permisos que ya no son necesarios porque la función de esa identidad cambió con el tiempo. Es común, en la práctica real, que las políticas de una organización acumulen permisos "de más" con el tiempo, porque es más fácil conceder un permiso nuevo cuando surge una necesidad puntual que revisar y retirar permisos antiguos que dejaron de usarse.

Un error común al aplicar mal este principio es sobrecompensar en la dirección opuesta: hacer las políticas tan restrictivas que rompen funcionalidad legítima, generando fricción operativa que empuja a los equipos a conceder permisos más amplios de los necesarios "para que deje de fallar", exactamente el resultado contrario al buscado. El objetivo real no es "restringir al máximo posible" de forma ciega, sino conceder exactamente lo necesario, ni más ni menos, y eso requiere entender bien qué acciones concretas necesita cada identidad para cumplir su función.

**Analogía:** el mínimo privilegio es como dar llaves de un edificio: en vez de entregar una llave maestra que abre todas las puertas a cada empleado nuevo, le das solo las llaves de las puertas que realmente necesita para su trabajo diario. Si esa llave se pierde o se la roban, el acceso comprometido se limita a esas puertas específicas, no a todo el edificio.

**¿Por qué es importante?** La configuración excesivamente permisiva de permisos es, de forma consistente, una de las causas más citadas de incidentes de seguridad graves en la nube real, muchas veces no por un ataque sofisticado sino simplemente porque una credencial con permisos demasiado amplios terminó expuesta por accidente (en un repositorio público, en un log, en una configuración mal protegida). Aplicar mínimo privilegio de forma consistente es una de las defensas más efectivas y de menor coste de implementación contra ese tipo de incidentes.

**Diagrama:**

```
Sin mínimo privilegio:                  Con mínimo privilegio:
┌─────────────────────┐               ┌─────────────────────┐
│ Usuario con acceso      │               │ Usuario con acceso      │
│ TOTAL a todos los         │               │ SOLO a lo que necesita   │
│ servicios y recursos       │               │ para su función especifica│
└─────────────────────┘               └─────────────────────┘
Si se compromete:                       Si se compromete:
  daño potencial = TODO                    daño potencial = LIMITADO
```

### Tema 2: Modelo de responsabilidad compartida

**Conceptos clave:** responsabilidad del proveedor, responsabilidad del cliente, seguridad "de" la nube vs seguridad "en" la nube.

El modelo de responsabilidad compartida define, con una línea explícita, qué aspectos de seguridad son responsabilidad del proveedor de nube y cuáles son responsabilidad de quien usa esos servicios. El proveedor es responsable de la seguridad "de" la nube: la infraestructura física de los centros de datos, la virtualización subyacente, la disponibilidad del hardware, y la seguridad del software base de cada servicio gestionado. El cliente es responsable de la seguridad "en" la nube: cómo configura esos servicios, qué datos guarda en ellos, quién tiene acceso, y cómo gestiona sus propias credenciales.

Esta distinción explica por qué, aunque uses un servicio completamente gestionado como S3 o DynamoDB, sigues siendo responsable de configurar correctamente los permisos de acceso a tus propios buckets y tablas. El proveedor garantiza que el servicio S3 en sí mismo funciona de forma segura y confiable a nivel de infraestructura, pero no puede (ni debería) evitar que tú, como cliente, configures una política de bucket demasiado permisiva que exponga tus datos accidentalmente al público. Ese error de configuración es enteramente responsabilidad del cliente, no del proveedor.

La proporción exacta de responsabilidad varía según el tipo de servicio: en un servicio de infraestructura básica (como una máquina virtual sin gestionar), el cliente asume más responsabilidad (parcheo del sistema operativo, configuración de red, gestión de accesos); en un servicio completamente gestionado y serverless como Lambda o DynamoDB, el proveedor asume más responsabilidad operativa (parcheo del runtime, gestión de la infraestructura subyacente), pero el cliente sigue siendo enteramente responsable de la configuración de acceso (políticas IAM) y del contenido de los datos que procesa o almacena.

Entender este modelo evita dos malentendidos comunes: asumir que "está en la nube, entonces es seguro por defecto" (ignorando la parte de responsabilidad que corresponde al cliente), o, en el otro extremo, subestimar las garantías reales que el proveedor sí ofrece sobre la infraestructura subyacente. La gran mayoría de los incidentes de seguridad reportados en la nube real caen del lado de la responsabilidad del cliente: configuraciones incorrectas, permisos demasiado amplios, credenciales expuestas, no fallos de la infraestructura del proveedor en sí.

**Analogía:** el modelo de responsabilidad compartida es como alquilar un apartamento en un edificio con seguridad: el edificio (el proveedor) es responsable de que la estructura sea segura, de que el ascensor funcione, y de que haya un portero en la entrada principal. Tú, como inquilino (el cliente), eres responsable de cerrar con llave la puerta de tu propio apartamento, de no dejar la ventana abierta, y de decidir a quién le das una copia de tu llave. Si dejas tu puerta abierta y alguien entra, no es culpa del edificio ni de su sistema de seguridad general.

**¿Por qué es importante?** Entender exactamente dónde termina la responsabilidad del proveedor y empieza la tuya es fundamental para no operar con una falsa sensación de seguridad. La configuración de IAM, las políticas de bucket, y las decisiones de acceso que tú tomas son, en la inmensa mayoría de los incidentes reales de seguridad en la nube, el punto donde algo salió mal, no un fallo del proveedor.

**Diagrama:**

```
┌───────────────────────────────────────────────────┐
│  RESPONSABILIDAD DEL CLIENTE                          │
│  Configuración de IAM, políticas de bucket, datos,      │
│  gestión de credenciales, cifrado de aplicación           │
├───────────────────────────────────────────────────┤
│  RESPONSABILIDAD DEL PROVEEDOR                        │
│  Infraestructura física, virtualización, disponibilidad  │
│  del servicio, seguridad del software base                │
└───────────────────────────────────────────────────┘
```

### Tema 3: Usuarios, grupos y roles

**Conceptos clave:** usuario IAM, grupo IAM, rol IAM, credenciales de larga duración vs temporales, asunción de rol.

Un usuario IAM representa una identidad individual y persistente dentro de tu cuenta, típicamente asociada a una persona real (aunque también se usa, con menos frecuencia recomendada, para aplicaciones). Un usuario tiene credenciales de larga duración: una contraseña para acceso a la consola, y/o un par de claves de acceso (access key ID y secret access key) para acceso programático, que permanecen válidas hasta que se rotan o revocan manualmente. Esta persistencia es, a la vez, su utilidad principal (una persona necesita poder autenticarse repetidamente a lo largo del tiempo) y su mayor riesgo (una credencial de larga duración filtrada sigue siendo válida hasta que alguien la revoque activamente).

Un grupo IAM es simplemente una colección de usuarios a los que se les puede asignar políticas de forma conjunta: en vez de adjuntar la misma política individualmente a diez usuarios distintos, adjuntas la política una vez al grupo, y añades esos diez usuarios como miembros del grupo. Esto simplifica enormemente la gestión a escala: si necesitas ajustar los permisos de todo un equipo, modificas la política del grupo una sola vez, en vez de repetir el cambio en cada usuario individual.

Un rol IAM es conceptualmente distinto de un usuario: no representa una identidad persistente con credenciales propias de larga duración, sino un conjunto de permisos que cualquier identidad autorizada —un usuario, un servicio de AWS como Lambda, o incluso una identidad externa a tu cuenta— puede "asumir" temporalmente, obteniendo credenciales de corta duración válidas solo por un periodo limitado (normalmente entre minutos y horas). Cuando una función Lambda se ejecuta, no usa las credenciales de larga duración de ningún usuario: asume el rol que le asignaste al desplegarla, obteniendo credenciales temporales generadas específicamente para esa ejecución, que expiran automáticamente después.

Esta diferencia —credenciales de larga duración (usuario) frente a credenciales temporales obtenidas al asumir un rol— es la razón central por la que, en la práctica moderna de seguridad en la nube, se prefiere fuertemente el uso de roles sobre la creación de usuarios con credenciales de larga duración para casi cualquier caso de uso de servicio a servicio (una Lambda accediendo a S3, un servicio accediendo a DynamoDB), reservando los usuarios IAM principalmente para personas que necesitan acceso interactivo persistente, y frecuentemente ni siquiera para eso en organizaciones que usan un proveedor de identidad federado en su lugar.

**Analogía:** un usuario IAM con sus credenciales de larga duración es como una llave de tu casa que llevas contigo permanentemente en el bolsillo: útil porque siempre la tienes, pero si la pierdes, sigue siendo válida hasta que cambies la cerradura. Un grupo es como hacer copias idénticas de esa llave para varios miembros de la familia que necesitan el mismo acceso. Un rol es como una llave de un casillero de hotel que se genera nueva y válida solo durante tu estancia, y que deja de funcionar automáticamente al hacer el check-out, sin que nadie tenga que ir físicamente a "recogerla" o desactivarla manualmente.

**¿Por qué es importante?** Elegir mal entre usuario y rol —típicamente, crear un usuario IAM con credenciales de larga duración y embeberlas directamente en el código de una aplicación o de una función Lambda, en vez de asignarle un rol— es uno de los errores de seguridad más comunes y más fácilmente evitables en arquitecturas cloud reales, precisamente porque expone credenciales permanentes en lugares (código fuente, variables de entorno, archivos de configuración) con mayor riesgo de filtración accidental que el mecanismo de asunción temporal de roles.

**Diagrama:**

```
Usuario IAM                    Grupo IAM                    Rol IAM
┌───────────────┐             ┌───────────────┐           ┌───────────────┐
│ Credenciales de   │             │ Colección de       │           │ Sin credenciales   │
│ larga duración      │             │ usuarios que          │           │ propias; se "asume"  │
│ (persona, o app     │             │ comparten políticas    │           │ y da credenciales     │
│  con menos           │             │                       │           │ TEMPORALES             │
│  recomendación)      │             │                       │           │ (Lambda, servicios)    │
└───────────────┘             └───────────────┘           └───────────────┘
```

### Tema 4: Estructura de una política — acciones, recursos y condiciones

**Conceptos clave:** documento de política JSON, `Effect` (Allow/Deny), `Action`, `Resource`, `Condition`, ARN.

Una política IAM es un documento JSON que describe qué está permitido o denegado. Su estructura básica gira en torno a declaraciones (statements), cada una con al menos tres componentes: `Effect`, que es `Allow` o `Deny`; `Action`, que especifica qué operaciones concretas cubre esa declaración (por ejemplo, `s3:GetObject`, `dynamodb:PutItem`), usando el formato `servicio:Accion`; y `Resource`, que especifica sobre qué recursos concretos aplica, normalmente usando el ARN (Amazon Resource Name) exacto o un patrón con comodines (como `arn:aws:s3:::mi-bucket/*` para "cualquier objeto dentro de `mi-bucket`").

Un cuarto componente opcional, `Condition`, permite refinar aún más cuándo aplica una declaración, más allá de la acción y el recurso: por ejemplo, permitir una acción solo si la petición proviene de un rango de direcciones IP específico, solo durante ciertas horas del día, o solo si la petición incluye cifrado en tránsito. Las condiciones son lo que permite expresar reglas de negocio de seguridad más matizadas que un simple "permitir esta acción sobre este recurso", sin necesidad de mecanismos externos adicionales.

Cuando una petición llega a AWS, el motor de evaluación de políticas revisa todas las políticas aplicables a esa identidad (las adjuntas directamente al usuario, las de cualquier grupo del que sea miembro, y las del rol si aplica) y determina el resultado final siguiendo una regla explícita: si existe una declaración `Deny` explícita que aplica a esa petición, el resultado final es siempre denegado, sin importar cuántas declaraciones `Allow` existan; si no hay ningún `Deny` explícito pero tampoco ningún `Allow` que aplique, el resultado por defecto es denegado (recordando el comportamiento "denegado por defecto" del Tema 1); solo si existe al menos un `Allow` aplicable y ningún `Deny` aplicable, la acción se permite.

Esta jerarquía —`Deny` explícito siempre gana— es una herramienta de seguridad deliberada: permite establecer políticas de "barrera" a nivel de organización que ningún permiso más permisivo concedido después puede anular accidentalmente. Por ejemplo, una organización puede establecer una política que deniegue explícitamente cualquier acción fuera de una región geográfica específica, y esa restricción se mantiene sin importar qué otras políticas más permisivas se concedan individualmente a usuarios o roles específicos.

**Analogía:** una política IAM es como un contrato de acceso muy específico: "se permite (`Effect: Allow`) entrar a la sala de archivos (`Resource`) solo para consultar documentos (`Action: leer`), y solo en horario de oficina (`Condition`)". Si existe otro contrato distinto que dice explícitamente "prohibido el acceso a la sala de archivos después de las 6 PM" (`Deny` explícito), esa prohibición se respeta sin importar que el primer contrato pareciera permitirlo en términos generales de "horario de oficina" mal definido.

**¿Por qué es importante?** Saber leer y escribir correctamente la estructura de una política —especialmente entender que un `Deny` explícito siempre prevalece sobre cualquier `Allow`— es una habilidad indispensable para diagnosticar por qué una acción específica está siendo denegada cuando, a primera vista, parece que debería estar permitida por alguna política que sí la menciona.

**Diagrama:**

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::mi-bucket/*"
    },
    {
      "Effect": "Deny",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::mi-bucket/privado/*"
    }
  ]
}
   → Permite leer cualquier objeto de "mi-bucket",
     EXCEPTO los que estén bajo el prefijo "privado/"
     (el Deny explícito gana sobre el Allow general)
```

### Tema 5: Buenas prácticas — roles sobre usuarios, políticas restrictivas, rotación de credenciales

**Conceptos clave:** rotación de credenciales, políticas administradas vs políticas en línea, auditoría de acceso, autenticación multifactor (MFA).

Además de preferir roles sobre usuarios para casos de servicio a servicio (Tema 3), y de aplicar mínimo privilegio en cada política (Tema 1), existen prácticas operativas adicionales que forman parte del estándar de la industria para gestionar IAM de forma segura y sostenible. La rotación periódica de credenciales de larga duración —cambiar las claves de acceso de un usuario cada cierto intervalo de tiempo, incluso si no hay indicio de que se hayan comprometido— reduce la ventana de exposición de cualquier credencial que sí se haya filtrado sin que nadie lo haya detectado todavía: cuanto más frecuente la rotación, menor el tiempo durante el cual una credencial filtrada sigue siendo válida y explotable.

Preferir políticas administradas (managed policies) sobre políticas en línea (inline policies) es otra práctica recomendada de mantenibilidad: una política administrada es un documento independiente y reutilizable que puede adjuntarse a múltiples usuarios, grupos o roles a la vez, y que se audita y versiona como una entidad propia, mientras que una política en línea está embebida directamente dentro de un usuario, grupo o rol específico, y solo aplica a esa entidad concreta, lo que dificulta mantener consistencia si necesitas el mismo conjunto de permisos en varias identidades distintas.

La autenticación multifactor (MFA) añade una capa adicional de verificación —normalmente un código temporal generado por una aplicación o dispositivo físico, además de la contraseña— para el acceso interactivo de usuarios, de forma que comprometer únicamente la contraseña de un usuario no sea suficiente para obtener acceso: el atacante necesitaría también el segundo factor, que típicamente vive en un dispositivo físico distinto y mucho más difícil de comprometer remotamente que una contraseña filtrada en una base de datos robada de otro servicio.

Finalmente, la auditoría periódica de acceso —revisar qué permisos existen, quién los tiene, y cuáles se usan realmente en la práctica— es lo que convierte el mínimo privilegio en una práctica sostenida en el tiempo, en vez de un estado inicial correcto que se degrada silenciosamente a medida que se conceden permisos nuevos sin retirar nunca los que dejaron de ser necesarios. Servicios de análisis de acceso (como IAM Access Analyzer en AWS real) automatizan buena parte de esta auditoría, señalando permisos concedidos que nunca se han usado, como candidatos claros para revisar y potencialmente retirar.

**Analogía:** estas buenas prácticas son como el mantenimiento periódico de la seguridad de un edificio, más allá de simplemente instalar buenas cerraduras el primer día: cambiar las cerraduras periódicamente aunque no haya indicios de robo (rotación de credenciales), tener un catálogo centralizado y reutilizable de "niveles de acceso" estándar en vez de definir permisos ad hoc para cada empleado nuevo (políticas administradas), exigir una tarjeta además de una llave para las áreas más sensibles (MFA), y hacer una ronda periódica revisando quién todavía tiene acceso a zonas que ya no necesita (auditoría de acceso).

**¿Por qué es importante?** Ninguna de estas prácticas por sí sola es suficiente, pero juntas forman una defensa en profundidad: incluso si una práctica falla en un caso concreto (una contraseña se filtra), las demás (MFA, rotación, mínimo privilegio) limitan el daño potencial de esa falla individual, en vez de depender de que un único mecanismo de seguridad nunca falle.

**Diagrama:**

```
┌──────────────────────────────────────────────────────┐
│           Defensa en profundidad de IAM                   │
├──────────────────────────────────────────────────────┤
│  Mínimo privilegio     → limita el daño si algo falla       │
│  Roles sobre usuarios   → credenciales temporales, no       │
│                            permanentes, para servicios        │
│  Rotación de credenciales → reduce ventana de exposición      │
│  MFA                    → una contraseña filtrada no basta    │
│  Auditoría periódica    → detecta permisos de más con tiempo  │
└──────────────────────────────────────────────────────┘
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

> Este laboratorio asume que ya ejecutaste `floci start` y `eval $(floci env)` (Módulo 1) en tu sesión de terminal, así que los comandos de `aws` no repiten `--endpoint-url`.

**Objetivo del laboratorio:** crear un usuario con permisos mínimos (solo lectura sobre un bucket específico), organizarlo en un grupo, y verificar esos permisos con el simulador de políticas de IAM.

**Requisitos previos:** Floci corriendo con el servicio IAM activo, un bucket ya existente para probar los permisos (puedes reutilizar `mi-bucket` del Módulo 2, o crear uno nuevo).

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Crear el bucket de prueba (si no existe) | `aws s3 mb s3://bucket-solo-lectura` | Prepara un bucket específico para verificar permisos restringidos | `make_bucket: bucket-solo-lectura` |
| 2 | Crear un usuario IAM | `aws iam create-user --user-name usuario-lectura` | Crea la identidad de usuario a la que le vas a asignar permisos mínimos | Un JSON con `User` y su `Arn` |
| 3 | Crear un grupo IAM | `aws iam create-group --group-name grupo-solo-lectura` | Prepara un grupo para gestionar el permiso de forma reutilizable | Un JSON con `Group` y su `Arn` |
| 4 | Añadir el usuario al grupo | `aws iam add-user-to-group --user-name usuario-lectura --group-name grupo-solo-lectura` | El usuario hereda cualquier política que se adjunte al grupo | Sin salida (comando exitoso) |
| 5 | Escribir la política de mínimo privilegio | Crea un archivo `politica.json` con:<br>`{`<br>`  "Version": "2012-10-17",`<br>`  "Statement": [{`<br>`    "Effect": "Allow",`<br>`    "Action": "s3:GetObject",`<br>`    "Resource": "arn:aws:s3:::bucket-solo-lectura/*"`<br>`  }]`<br>`}` | Permite únicamente leer objetos (no listarlos, no escribirlos) de ese bucket específico | El archivo se guarda sin errores de sintaxis JSON |
| 6 | Crear la política administrada | `aws iam create-policy --policy-name PoliticaSoloLectura --policy-document file://politica.json` | Registra la política como una entidad reutilizable; guarda el `Arn` devuelto | Un JSON con `Policy` y su `Arn` |
| 7 | Adjuntar la política al grupo | `aws iam attach-group-policy --group-name grupo-solo-lectura --policy-arn <Arn-de-la-politica>` | El usuario, como miembro del grupo, hereda ahora este permiso | Sin salida (comando exitoso) |
| 8 | Verificar el permiso concedido con el simulador | `aws iam simulate-principal-policy --policy-source-arn <Arn-del-usuario> --action-names s3:GetObject --resource-arns arn:aws:s3:::bucket-solo-lectura/archivo.txt` | Simula si esa acción concreta sobre ese recurso concreto sería permitida, sin necesidad de ejecutar la acción real | Un JSON con `EvalDecision: "allowed"` |
| 9 | Verificar que una acción NO concedida es denegada | `aws iam simulate-principal-policy --policy-source-arn <Arn-del-usuario> --action-names s3:DeleteObject --resource-arns arn:aws:s3:::bucket-solo-lectura/archivo.txt` | Confirma que el mínimo privilegio funciona: esta acción nunca fue concedida | Un JSON con `EvalDecision: "implicitDeny"` |

**Comprobación visual:** abre Floci UI y revisa si IAM aparece como placeholder. En la versión actual no debes esperar administración completa de usuarios y políticas desde la consola. Esta limitación es deliberadamente visible: evita que una tabla falsa produzca confianza incorrecta. Para seguridad, la evidencia debe venir de `get-policy-version` y `simulate-principal-policy`, no solo de una pantalla.

**Verificación:** el laboratorio se considera exitoso si el paso 8 confirma `"allowed"` para `s3:GetObject`, y el paso 9 confirma `"implicitDeny"` (o `explicitDeny`) para `s3:DeleteObject`, demostrando que el usuario tiene exactamente lectura y ningún permiso de borrado. Registra la disponibilidad de IAM en Floci UI sin tratar un placeholder como un fallo.

**Errores comunes y soluciones**

- **El simulador devuelve `implicitDeny` incluso para `s3:GetObject`.** Verifica que el `Resource` en tu política coincide exactamente con el ARN que usaste en `simulate-principal-policy` (incluyendo el sufijo `/*` si tu política lo especifica así, y que el nombre del bucket coincida carácter por carácter).
- **`MalformedPolicyDocument` al crear la política.** El archivo `politica.json` tiene un error de sintaxis JSON (una coma de más, comillas mal cerradas). Valida el JSON con cualquier herramienta de validación antes de volver a intentarlo.
- **Confundir adjuntar una política al usuario directamente frente a adjuntarla al grupo.** Si adjuntas la política solo al grupo pero el usuario no es miembro de ese grupo (paso 4 olvidado), el usuario no hereda el permiso, y el simulador debería reflejar correctamente esa ausencia.
- **Olvidar que `simulate-principal-policy` no ejecuta la acción real.** Es una herramienta de verificación teórica basada en las políticas actuales; no sustituye una prueba funcional real si necesitas confirmar comportamiento observable, solo confirma qué decidiría el motor de evaluación de políticas para esa combinación específica de acción y recurso.

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

- AWS, Microsoft Azure y Google Cloud, marcos oficiales de arquitectura bien diseñada.
- NIST, *Cloud Computing Standards Roadmap* y *Secure Software Development Framework*.
- Beyer et al., *Site Reliability Engineering*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- El principio de mínimo privilegio parte de "todo denegado por defecto" y concede exactamente los permisos necesarios, ni más ni menos.
- El modelo de responsabilidad compartida separa lo que el proveedor garantiza (infraestructura) de lo que el cliente debe gestionar (configuración de acceso, datos).
- Los usuarios tienen credenciales de larga duración; los roles se asumen y dan credenciales temporales, siendo preferibles para casi cualquier caso de servicio a servicio.
- Una política IAM se compone de `Effect`, `Action`, `Resource` y, opcionalmente, `Condition`; un `Deny` explícito siempre prevalece sobre cualquier `Allow`.
- Buenas prácticas adicionales incluyen rotación de credenciales, políticas administradas reutilizables, MFA, y auditoría periódica de acceso.

**Conceptos aprendidos**

- Principio de mínimo privilegio y su justificación en términos de superficie de ataque.
- Modelo de responsabilidad compartida entre proveedor y cliente.
- Diferencias entre usuarios, grupos y roles, y cuándo usar cada uno.
- Estructura de una política IAM y la jerarquía de evaluación (Deny explícito siempre gana).
- Buenas prácticas operativas de seguridad en IAM más allá del diseño de una política individual.

**Próximos pasos**

En el Módulo 8 vas a repetir los patrones de almacenamiento y mensajería que ya conoces, pero en Azure y GCP con floci-az y floci-gcp, comparando los tres proveedores lado a lado.

**Recursos adicionales**

- Documentación oficial de AWS IAM: conceptos básicos y guía de usuario.
- Documentación oficial sobre la evaluación de políticas IAM (lógica de Allow/Deny).
- Documentación oficial del simulador de políticas IAM (`simulate-principal-policy`).
- Código ejecutable de cada operación (crear usuario, crear política, asignar política) en Node.js, Python, Java, Go y Rust: carpeta [`examples/`](https://github.com/NICORUIZ93/Academia_Floci/tree/main/examples) del repositorio, archivos que empiezan por `iam-`/`iam_`/`Iam` (ver [`examples/README.md`](https://github.com/NICORUIZ93/Academia_Floci/blob/main/examples/README.md) para la lista completa).
