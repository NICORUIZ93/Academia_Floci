# Módulo 8: Infraestructura como código con Terraform

## Sílabo

**Objetivo general**

Describir infraestructura completa en archivos versionables, entendiendo el ciclo `plan`/`apply`, el estado remoto con locking, módulos reutilizables, workspaces para múltiples entornos, y las alternativas Ansible y Pulumi.

**Objetivos específicos**

1. Escribir un archivo `.tf` que provisione un recurso y entender el flujo `init`/`plan`/`apply`.
2. Explicar por qué el archivo de estado nunca debe editarse manualmente.
3. Configurar un backend remoto con locking para trabajo en equipo.
4. Extraer una definición en un módulo reutilizable con variables de entrada.
5. Usar workspaces para mantener estados separados de múltiples entornos con el mismo código.
6. Diferenciar el enfoque declarativo de Terraform del enfoque imperativo de Ansible, y situar Pulumi como alternativa con lenguajes de programación reales.

**Contenido**

- Providers, resources y data sources.
- State remoto y locking.
- Módulos reutilizables.
- `terraform plan` vs `apply`.
- Workspaces para múltiples entornos.
- Ansible: playbooks, roles, inventory y módulos.
- Pulumi como alternativa a HCL.

**Evaluación**

Un laboratorio que provisiona, modifica y modulariza infraestructura con Terraform, y tres ejercicios de evaluación sobre riesgo de editar el estado manualmente, diseño de módulos, y elección entre Terraform, Ansible y Pulumi.

---

## Aprende construyendo

### Tema 1: Providers, resources y data sources

**Conceptos clave:** provider, resource, data source, HCL (HashiCorp Configuration Language).

Un provider en Terraform es un plugin que sabe cómo comunicarse con una plataforma específica —AWS, Azure, GCP, Kubernetes, e incluso servicios que no son de nube (como GitHub o Cloudflare)— traduciendo la configuración declarativa que escribes en HCL a las llamadas de API reales de esa plataforma. Declarar `provider "aws" { region = "us-east-1" }` le indica a Terraform que necesita el plugin de AWS y en qué región debe operar por defecto; Terraform descarga automáticamente el plugin correspondiente durante `terraform init`.

Un resource declara una pieza específica de infraestructura que Terraform debe crear, actualizar o eliminar para que coincida con tu configuración: `resource "aws_s3_bucket" "datos" { bucket = "mi-app-datos" }` declara que debe existir un bucket S3 con ese nombre específico. La primera palabra tras `resource` (`aws_s3_bucket`) es el tipo de recurso, definido por el provider; la segunda (`datos`) es un nombre local que usas para referenciar ese recurso específico dentro de tu propia configuración de Terraform, sin relación con el nombre real del recurso en la plataforma de destino.

Un data source, a diferencia de un resource, no crea ni gestiona nada: consulta información ya existente en la plataforma (por ejemplo, el ID de una imagen de máquina virtual publicada por el proveedor, o los detalles de una red ya creada por otro medio), permitiendo referenciar esa información dentro de tu configuración sin que Terraform intente gestionar el ciclo de vida de ese recurso externo. Esta distinción es importante: usar un `resource` para algo que en realidad ya existe y no debería ser gestionado por esta configuración específica de Terraform puede llevar a Terraform a intentar modificarlo o incluso eliminarlo si en algún momento se retira esa declaración, mientras que un `data source` es puramente de solo lectura.

HCL, el lenguaje de configuración de Terraform, es deliberadamente declarativo: describes el estado final deseado de la infraestructura (qué recursos deben existir y con qué configuración), no una secuencia de pasos imperativos de cómo llegar ahí. Terraform es responsable de calcular internamente qué acciones concretas (crear, modificar, destruir) son necesarias para hacer que la infraestructura real coincida con esa descripción declarativa, un enfoque que contrasta directamente con el estilo imperativo de herramientas como Ansible, que estudiarás en el Tema 6 de este mismo módulo.

**Analogía:** un provider es como el traductor especializado necesario para comunicarte con un proveedor específico (uno que habla "AWS", otro que habla "Azure"). Un resource es como una orden de compra específica que describe exactamente qué producto necesitas tener disponible ("necesito que exista un bucket con este nombre"), y el proveedor se encarga de todos los detalles de cómo conseguirlo o ajustarlo. Un data source es como consultar un catálogo existente del proveedor para obtener información (el código de un producto ya disponible) sin estar pidiendo que se cree nada nuevo.

**¿Por qué es importante?** Entender la diferencia entre declarar qué debe existir (declarativo, HCL) y describir cómo conseguirlo paso a paso (imperativo) es la base conceptual para entender por qué Terraform puede calcular automáticamente el plan de cambios necesario simplemente comparando tu configuración declarada contra el estado actual conocido, sin que tengas que especificar tú mismo la secuencia exacta de operaciones.

**Diagrama:**

```
provider "aws" { region = "us-east-1" }    ← plugin para hablar con AWS

resource "aws_s3_bucket" "datos" {          ← "debe existir este bucket"
  bucket = "mi-app-datos"
}

data "aws_ami" "ubuntu" {                    ← "consulta (no crees) esta info"
  most_recent = true
  owners      = ["099720109477"]
}
```

### Tema 2: State remoto y locking

**Conceptos clave:** archivo de estado (`terraform.tfstate`), backend remoto, locking, desincronización del estado.

Terraform mantiene un archivo de estado que registra qué recursos gestiona actualmente y con qué configuración específica, sirviendo como el mapa de correspondencia entre tu configuración declarativa en HCL y los recursos reales existentes en la plataforma de destino. Este archivo es fundamental para el funcionamiento de Terraform: sin él, Terraform no tendría forma de saber qué recursos ya existen y gestiona, ni de calcular correctamente qué cambios son necesarios para reconciliar tu configuración declarada con la realidad actual.

Editar manualmente el archivo de estado es una de las operaciones más peligrosas y desaconsejadas en el uso de Terraform, precisamente porque ese archivo debe reflejar fielmente la realidad de la infraestructura desplegada; una edición manual incorrecta puede desincronizar el estado registrado de la realidad efectiva (por ejemplo, haciendo que Terraform crea que un recurso no existe cuando en realidad sí existe, llevándolo a intentar crearlo de nuevo y potencialmente generando un conflicto o una duplicación no intencionada), un problema que puede ser difícil de diagnosticar y corregir después del hecho.

Un backend remoto almacena este archivo de estado en un lugar compartido y accesible por todo el equipo (por ejemplo, un bucket S3, similar en espíritu al almacenamiento de objetos que ya conoces del track Cloud), en vez de mantenerlo únicamente en el disco local de la persona que ejecutó `terraform apply` por última vez. Esto es indispensable para trabajo en equipo: sin un backend remoto compartido, cada persona tendría su propia copia local del estado, potencialmente desincronizada de lo que otros compañeros aplicaron, con un riesgo real de que dos personas apliquen cambios conflictivos sin que ninguna sepa del trabajo de la otra.

El locking del estado añade una protección adicional crítica sobre el backend remoto: mientras una persona está ejecutando `terraform apply` (un proceso que puede tardar varios minutos en infraestructura compleja), el backend bloquea el estado para que nadie más pueda iniciar otra operación de escritura simultánea sobre esa misma configuración, evitando que dos aplicaciones concurrentes corrompan el estado compartido escribiendo sobre él al mismo tiempo de forma descoordinada. Sin locking, dos personas ejecutando `apply` casi simultáneamente sobre el mismo backend remoto podrían terminar con un archivo de estado corrupto o inconsistente, reflejando incorrectamente la infraestructura real.

**Analogía:** el archivo de estado es como el inventario maestro de un almacén: refleja exactamente qué hay disponible y dónde. Editarlo manualmente sin que corresponda a la realidad física del almacén es como escribir a mano en el inventario que hay 50 unidades de un producto cuando en realidad hay solo 30, generando confusión y errores en cualquier operación futura que confíe en ese inventario. Un backend remoto es como mantener ese inventario maestro en un sistema centralizado accesible por todo el equipo, en vez de que cada persona tenga su propia copia en papel que podría quedar desactualizada. El locking es como un sistema que impide que dos personas modifiquen el inventario maestro exactamente al mismo tiempo, evitando que sus cambios simultáneos se pisen entre sí y corrompan el registro.

**¿Por qué es importante?** El estado de Terraform es, posiblemente, el activo más crítico y más frágil de cualquier proyecto de infraestructura como código; un backend remoto con locking apropiadamente configurado es una práctica no negociable para cualquier equipo que use Terraform en un contexto colaborativo real, y evitar editar el estado manualmente es una de las reglas de seguridad más importantes al trabajar con esta herramienta.

**Diagrama:**

```
Sin backend remoto:                     Con backend remoto + locking:
┌────────────┐  ┌────────────┐        ┌──────────────────────┐
│ Estado local  │  │ Estado local  │        │ Estado remoto compartido  │
│ Persona A       │  │ Persona B       │        │ (S3, por ejemplo)          │
│ (puede estar     │  │ (puede estar     │        │ + lock activo durante       │
│  desactualizado) │  │  desactualizado) │        │  cualquier apply en curso    │
└────────────┘  └────────────┘        └──────────────────────┘
  riesgo de conflictos                    ambas personas comparten el
  no detectados                            mismo estado, sin pisarse
```

### Tema 3: Módulos reutilizables

**Conceptos clave:** módulo, variables de entrada, outputs, composición de infraestructura.

Un módulo de Terraform encapsula un conjunto de recursos relacionados como una unidad reutilizable con una interfaz explícita de entrada (variables) y salida (outputs), de forma análoga a cómo una función encapsula lógica reutilizable en cualquier lenguaje de programación. En vez de repetir la misma definición de, por ejemplo, una red virtual completa (VPC) con sus subredes, tablas de rutas y gateways cada vez que un proyecto nuevo la necesita, defines esa infraestructura una única vez como un módulo, y la reutilizas invocándola con distintos valores de entrada según cada contexto específico.

`module "vpc" { source = "./modulos/vpc"; cidr = "10.0.0.0/16" }` invoca el módulo ubicado en esa ruta local, pasándole `cidr` como valor de entrada; internamente, ese módulo define sus propios recursos parametrizados por esa variable de entrada, sin que el código que invoca el módulo necesite conocer los detalles internos de implementación de cómo se construye exactamente esa red. Esta encapsulación permite que un equipo de infraestructura centralice y mantenga la lógica correcta y las buenas prácticas de configuración de un tipo de recurso complejo en un único lugar, mientras que otros equipos simplemente consumen ese módulo con los parámetros específicos de su propio contexto, sin necesitar entender ni replicar esos detalles internos de implementación.

Los módulos pueden vivir localmente dentro del mismo repositorio (como en el ejemplo anterior), o publicarse y consumirse desde registros de módulos compartidos (como el Registro público de Terraform, o un registro privado interno de una organización), habilitando el mismo patrón de reutilización a través de múltiples equipos o incluso múltiples organizaciones, de forma similar en espíritu a cómo los charts de Helm (que estudiaste en el módulo anterior de este track) se comparten y reutilizan a través de un ecosistema más amplio.

Diseñar bien la interfaz de un módulo —qué variables de entrada expone, qué outputs produce para que otros módulos o configuraciones puedan consumirlos— es una habilidad de diseño similar a diseñar bien la interfaz pública de una función o una clase en programación tradicional: una interfaz demasiado rígida (pocas variables configurables) limita la reutilización a casos muy específicos, mientras que una interfaz excesivamente flexible (todo configurable, sin valores por defecto sensatos) traslada demasiada complejidad de decisión a quien consume el módulo, en vez de encapsular sabiamente las decisiones que realmente deberían estar centralizadas.

**Analogía:** un módulo de Terraform es como un plano arquitectónico estandarizado y reutilizable de una habitación de hotel: en vez de que cada nuevo hotel de la cadena diseñe su propia habitación desde cero, todos reutilizan el mismo plano probado, ajustando solo parámetros específicos como el tamaño exacto o el color de la decoración (las variables de entrada), sin tener que rediseñar la distribución completa de tuberías y electricidad (los detalles internos ya resueltos) en cada nuevo hotel.

**¿Por qué es importante?** Los módulos son el mecanismo principal para evitar la duplicación de configuración de infraestructura entre proyectos y entornos, centralizando buenas prácticas y decisiones de diseño complejas en un único lugar mantenido y probado, en vez de que cada equipo reinvente y potencialmente cometa los mismos errores de configuración de forma independiente.

**Diagrama:**

```
modulos/vpc/                          Proyecto A                Proyecto B
├── main.tf (recursos de red)         module "vpc" {              module "vpc" {
├── variables.tf (cidr, etc.)           source = "../modulos/vpc"    source = "../modulos/vpc"
└── outputs.tf (vpc_id, etc.)           cidr   = "10.0.0.0/16"        cidr   = "10.1.0.0/16"
                                       }                            }
                                       (misma lógica interna, distinto CIDR)
```

### Tema 4: terraform plan vs apply

**Conceptos clave:** `terraform plan`, `terraform apply`, diff de cambios, revisión antes de aplicar.

`terraform plan` calcula y muestra, sin aplicar ningún cambio real todavía, exactamente qué acciones tomaría Terraform para reconciliar el estado actual conocido con tu configuración declarada: qué recursos se crearían desde cero, cuáles se modificarían (y específicamente qué atributos cambiarían), y cuáles se destruirían por completo. Esta vista previa es una de las características más valiosas de Terraform desde una perspectiva de seguridad operativa: te permite revisar exactamente el impacto de un cambio antes de comprometerte a ejecutarlo, especialmente crítico para detectar de antemano una destrucción de recurso no intencionada que tu configuración provocaría por accidente.

`terraform apply` ejecuta efectivamente esos cambios calculados, típicamente mostrando primero el mismo plan como confirmación final y pidiendo una aprobación explícita antes de proceder (a menos que se ejecute con una bandera que omite esa confirmación interactiva, típicamente reservada para pipelines de CI/CD automatizados donde la aprobación ya ocurrió en un paso anterior del proceso, como una revisión de pull request). Este flujo de dos pasos —primero ver el plan, después aplicarlo explícitamente— es deliberado: separa el cálculo de qué cambiaría de la ejecución real de esos cambios, dando una oportunidad explícita de revisión humana antes de comprometerse a modificar infraestructura real.

En pipelines de CI/CD que gestionan infraestructura con Terraform, es una práctica extendida ejecutar `terraform plan` automáticamente en cada pull request que modifica configuración de infraestructura, publicando ese plan como comentario visible en el propio pull request (similar en espíritu a publicar un reporte de cobertura como artifact, que estudiaste en el Módulo 4 de este track), permitiendo que cualquier revisor del cambio vea exactamente qué infraestructura se modificaría antes de aprobar la fusión, y reservando `terraform apply` para ejecutarse automáticamente solo después de que ese pull request haya sido aprobado y fusionado.

Un detalle importante es que el plan calculado por `terraform plan` puede quedar obsoleto si la infraestructura real cambia entre el momento del `plan` y el momento del `apply` (por ejemplo, si alguien más aplicó un cambio distinto en el intervalo); por esta razón, `terraform apply` recalcula internamente el plan justo antes de aplicar, y puede requerir una nueva confirmación si detecta que la situación cambió respecto al plan mostrado originalmente.

**Analogía:** `terraform plan` es como pedir un presupuesto detallado y una lista exacta de qué se va a construir, modificar o demoler antes de autorizar cualquier obra real, permitiéndote revisar y objetar cualquier ítem antes de comprometerte. `terraform apply` es dar la autorización final para que la obra efectivamente comience, ejecutando exactamente lo que ese presupuesto detallado especificó.

**¿Por qué es importante?** La separación explícita entre calcular el impacto de un cambio (`plan`) y ejecutarlo (`apply`) es una de las razones principales por las que Terraform se considera una herramienta segura para gestionar infraestructura crítica: nunca aplicas cambios a ciegas sin haber visto primero, de forma explícita y detallada, exactamente qué se va a crear, modificar o destruir.

**Diagrama:**

```
Configuración HCL  +  Estado actual conocido
        │
        ▼
terraform plan  ──▶  muestra: + crear (2), ~ modificar (1), - destruir (0)
        │                      (ningún cambio real todavía)
        ▼  (revisión humana, o aprobación de PR)
terraform apply ──▶  ejecuta exactamente esos cambios, actualiza el estado
```

### Tema 5: Workspaces para múltiples entornos

**Conceptos clave:** workspace, estado separado por entorno, mismo código con distintos parámetros.

Un workspace de Terraform permite mantener múltiples estados completamente independientes para la misma configuración de código, típicamente uno por entorno (`desarrollo`, `staging`, `produccion`). `terraform workspace new staging` crea un workspace nuevo con su propio estado vacío, y `terraform workspace select prod` cambia el workspace activo, de forma que las operaciones subsiguientes de `plan`/`apply` afectan únicamente al estado de ese workspace específico, sin interferir con el estado de otros workspaces que usan exactamente la misma configuración de código pero mantienen su propia infraestructura real completamente separada.

Esto permite reutilizar la misma definición de infraestructura (el mismo código HCL) para desplegar entornos paralelos con la misma estructura pero con parámetros específicos distintos (normalmente combinando workspaces con variables que ajustan valores según el nombre del workspace activo, como el tamaño de instancia o el número de réplicas), sin duplicar archivos de configuración completos para cada entorno. Es importante notar que los workspaces comparten el mismo backend remoto configurado y la misma configuración de recursos base; lo que varía entre workspaces es el estado (qué infraestructura específica existe realmente) y, típicamente, los valores de variables que se ajustan según cuál esté activo.

Los workspaces son adecuados para variaciones relativamente simples entre entornos que comparten fundamentalmente la misma estructura de infraestructura (el mismo tipo de recursos, con distintos tamaños o cantidades). Para diferencias más sustanciales entre entornos —por ejemplo, si producción necesita una arquitectura de red significativamente más compleja que desarrollo, no solo "el mismo tipo de recurso pero más grande"— muchos equipos prefieren, en su lugar, mantener directorios de configuración completamente separados por entorno (cada uno con su propia composición de módulos, potencialmente distinta), reservando workspaces para el caso más simple de "misma estructura, distintos parámetros y distinta escala".

**Analogía:** los workspaces son como usar el mismo plano arquitectónico de una casa para construir varias casas idénticas en estructura pero en terrenos (entornos) distintos, cada una con su propia dirección y registro de propiedad independiente (su propio estado), aunque compartan exactamente el mismo diseño base. Si en cambio necesitaras construir una mansión en un terreno y una cabaña pequeña en otro (estructuras fundamentalmente distintas, no solo escaladas), usar el mismo plano con pequeños ajustes ya no tendría sentido, y necesitarías planos completamente distintos para cada uno.

**¿Por qué es importante?** Los workspaces evitan la duplicación de código de configuración para entornos que comparten esencialmente la misma estructura, manteniendo el estado de cada entorno completamente aislado del de los demás, de forma que aplicar cambios en un entorno nunca afecta accidentalmente al estado registrado de otro entorno distinto.

**Diagrama:**

```
Mismo código HCL
        │
   ┌────┼────────────┬────────────────┐
   ▼                  ▼                  ▼
workspace         workspace          workspace
"desarrollo"       "staging"          "produccion"
(estado propio,     (estado propio,     (estado propio,
 infra separada)     infra separada)     infra separada)
```

### Tema 6: Ansible — playbooks, roles, inventory y módulos

**Conceptos clave:** playbook, role, inventory, módulo de Ansible, enfoque imperativo/procedural sobre infraestructura existente.

Ansible resuelve un problema relacionado pero distinto al de Terraform: mientras Terraform se enfoca principalmente en aprovisionar (crear, modificar, destruir) la infraestructura misma —máquinas virtuales, redes, bases de datos gestionadas—, Ansible se enfoca en configurar el software y el estado dentro de máquinas ya existentes (instalar paquetes, gestionar archivos de configuración, aplicar actualizaciones, reiniciar servicios), conectándose por SSH sin necesidad de instalar ningún agente permanente en las máquinas gestionadas.

Un playbook es el archivo YAML que describe una secuencia de tareas a ejecutar sobre un conjunto de máquinas objetivo; cada tarea invoca un módulo de Ansible (una pieza reutilizable de funcionalidad, como instalar un paquete, copiar un archivo, o gestionar un servicio), especificando qué estado deseado debe alcanzarse. Aunque Ansible se ejecuta de forma procedural (las tareas de un playbook se ejecutan en el orden en que aparecen, a diferencia del enfoque puramente declarativo de Terraform), sus módulos individuales están diseñados para ser idempotentes: ejecutar el mismo playbook múltiples veces sobre la misma máquina no debería producir cambios adicionales si el estado deseado ya se alcanzó en una ejecución anterior, aplicando el mismo principio de idempotencia que ya estudiaste con scripts bash en el Módulo 0 de este track, pero ahora aplicado de forma sistemática a través del propio diseño de los módulos de Ansible.

Un role empaqueta un conjunto relacionado de tareas, variables, archivos y plantillas como una unidad reutilizable y compartible, de forma análoga en espíritu a un módulo de Terraform o un chart de Helm: en vez de escribir un playbook monolítico gigante para configurar un servidor completo, se compone a partir de roles más pequeños y reutilizables (un role para configurar un servidor web, otro para configurar una base de datos, otro para aplicar hardening de seguridad básico como el que estudiaste en el Módulo 0 de este track). Un inventory es la lista de máquinas objetivo sobre las que Ansible va a operar, organizadas opcionalmente en grupos (servidores web, servidores de base de datos), permitiendo dirigir un playbook o role específico únicamente al grupo de máquinas relevante.

La relación práctica entre Terraform y Ansible en un flujo de trabajo real es frecuentemente complementaria, no excluyente: Terraform aprovisiona la infraestructura base (crea las máquinas virtuales, la red), y Ansible se ejecuta después para configurar el software dentro de esas máquinas ya creadas, cada herramienta resolviendo la parte del problema para la que fue diseñada específicamente.

**Analogía:** si Terraform es como construir el edificio completo desde los cimientos (decidir cuántos pisos, dónde van las paredes), Ansible es como el equipo que entra después a amueblar y configurar cada oficina específica dentro de ese edificio ya construido: instalar el mobiliario correcto, configurar las conexiones de red internas, aplicar las políticas de seguridad de cada oficina, repitiendo ese mismo proceso de configuración de forma consistente en cada oficina similar del edificio.

**¿Por qué es importante?** Entender que Terraform y Ansible resuelven problemas complementarios distintos —aprovisionar infraestructura frente a configurar software dentro de ella— evita el error de intentar forzar a una sola herramienta a hacer el trabajo completo de ambas, cuando en la práctica muchos equipos reales combinan ambas herramientas, cada una en su rol específico dentro de un mismo flujo de trabajo de infraestructura.

**Diagrama:**

```
Terraform (aprovisiona)              Ansible (configura después)
┌─────────────────────┐           ┌─────────────────────┐
│ crea la máquina virtual  │  ────▶ │ instala paquetes,          │
│ crea la red                │       │ copia configuración,        │
│ crea el disco                │       │ aplica hardening, etc.       │
└─────────────────────┘           └─────────────────────┘
```

### Tema 7: Pulumi como alternativa a HCL

**Conceptos clave:** infraestructura como código con lenguajes de programación reales, tipado estático, reutilización de herramientas del ecosistema del lenguaje.

Pulumi ofrece el mismo concepto fundamental de infraestructura como código declarativa que Terraform, pero permitiendo escribir esa definición usando lenguajes de programación de propósito general ya establecidos (TypeScript, Python, Go, entre otros) en vez de un lenguaje de configuración específico como HCL. Esto significa que puedes aprovechar directamente las herramientas, el tipado estático, las estructuras de control, y el ecosistema completo de librerías de un lenguaje que ya conoces y usas para el resto de tu trabajo de desarrollo, en vez de aprender la sintaxis y las limitaciones específicas de un lenguaje de configuración dedicado exclusivamente a este propósito.

Esta elección tiene implicaciones prácticas concretas: con Pulumi en TypeScript, por ejemplo, puedes usar bucles, condicionales, funciones auxiliares reutilizables, y el sistema de tipos del propio lenguaje para detectar errores de configuración en tiempo de compilación (antes incluso de intentar aplicar el cambio), aprovechando además el soporte de autocompletado y verificación de tipos de cualquier editor de código configurado para ese lenguaje, ventajas que HCL, al ser un lenguaje de configuración más limitado y específico, no ofrece con la misma profundidad.

El compromiso de esta elección es que introduce una dependencia adicional del runtime del lenguaje elegido (necesitas Node.js instalado para Pulumi en TypeScript, por ejemplo, de una forma que Terraform con HCL puro no requiere, al ser HCL interpretado directamente por el propio binario de Terraform sin depender de ningún runtime de lenguaje externo), y potencialmente introduce mayor complejidad de código si el equipo abusa de las capacidades de un lenguaje de programación completo para construir abstracciones de infraestructura excesivamente elaboradas y difíciles de seguir, en vez de mantener definiciones de infraestructura razonablemente directas y legibles.

La elección entre Terraform (HCL) y Pulumi (lenguaje de programación real) suele depender de la familiaridad y preferencia del equipo: equipos con fuerte experiencia en un lenguaje de programación específico y que valoran el tipado estático y las herramientas de ese ecosistema pueden preferir Pulumi; equipos que prefieren la simplicidad declarativa más restringida y el ecosistema más maduro y ampliamente adoptado de HCL (con más ejemplos, más módulos públicos disponibles, más familiaridad extendida en la industria) suelen preferir Terraform, que sigue siendo, con diferencia, la herramienta de infraestructura como código más adoptada en la industria al momento de escribir este curso.

**Analogía:** HCL es como un formulario estandarizado con campos específicos y limitados, diseñado exclusivamente para describir infraestructura, fácil de aprender por su alcance acotado. Pulumi es como escribir esa misma descripción usando el idioma completo y flexible que ya dominas para escribir cualquier otro documento, con toda la expresividad de ese idioma disponible, a costa de que esa misma flexibilidad permite también escribir descripciones innecesariamente complejas si no se usa con disciplina.

**¿Por qué es importante?** Conocer que existen alternativas a HCL, con sus propios compromisos explícitos, te prepara para tomar una decisión informada si en un trabajo real te encuentras con un equipo que ya usa Pulumi, o si tu propio equipo evalúa esta elección para un proyecto nuevo, en vez de asumir que Terraform con HCL es la única forma posible de practicar infraestructura como código.

**Diagrama:**

```
Terraform (HCL)                        Pulumi (TypeScript, Python, Go...)
┌─────────────────────┐              ┌─────────────────────┐
│ resource "aws_s3_bucket"  │              │ new aws.s3.Bucket("datos", { │
│  "datos" {                  │              │   bucket: "mi-app-datos"       │
│  bucket = "mi-app-datos"     │              │ });                              │
│ }                              │              │ (con tipado estático,             │
│ (lenguaje de configuración      │              │  bucles, funciones reales           │
│  dedicado y limitado)            │              │  del lenguaje elegido)              │
└─────────────────────┘              └─────────────────────┘
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

**Objetivo del laboratorio:** provisionar un recurso simple con Terraform, revisar el plan antes de aplicar, modularizar la definición, y configurar un backend remoto (o documentar cómo se haría si no tienes acceso a uno real para este laboratorio).

**Requisitos previos:** Terraform instalado, acceso a un proveedor cloud (puede ser Floci del track Cloud si el provider correspondiente lo soporta, o una cuenta de pruebas de un proveedor real con capa gratuita).

| Paso | Acción | Comando/Configuración | Explicación | Resultado esperado |
|---|---|---|---|---|
| 1 | Escribir la configuración inicial | Crea un archivo `main.tf` con un `provider` y un `resource` simple (por ejemplo, un bucket de almacenamiento) | Define la infraestructura deseada mínima | El archivo se guarda sin errores de sintaxis HCL |
| 2 | Inicializar Terraform | `terraform init` | Descarga el provider necesario y prepara el directorio de trabajo | El comando confirma que el provider se descargó correctamente |
| 3 | Revisar el plan antes de aplicar | `terraform plan` | Muestra exactamente qué se crearía, sin aplicar ningún cambio todavía | La salida muestra `+ crear` para el recurso definido |
| 4 | Aplicar el cambio | `terraform apply` (confirmando cuando se solicite) | Ejecuta efectivamente la creación del recurso | El recurso se crea, y Terraform confirma el éxito |
| 5 | Modificar el recurso y observar el plan del diff | Cambia un atributo del recurso (por ejemplo, una etiqueta) y ejecuta `terraform plan` de nuevo | Verifica que Terraform detecta correctamente solo el cambio específico, no una recreación completa innecesaria | La salida muestra `~ modificar` con el atributo específico que cambió |
| 6 | Extraer la definición en un módulo | Mueve la definición del recurso a una carpeta `modulos/mi-recurso/`, con sus propias `variables.tf` y `outputs.tf`, e invócalo desde `main.tf` con `module "mi-recurso" { source = "./modulos/mi-recurso" ... }` | Aplica el patrón de reutilización del Tema 3 | `terraform plan` sigue funcionando correctamente tras la modularización, sin cambios inesperados en la infraestructura ya creada |
| 7 | Documentar (sin implementar completo, si no tienes acceso a un backend real) un backend remoto | Escribe el bloque `terraform { backend "s3" { ... } }` correspondiente, documentando qué bucket y qué configuración de locking usarías | Aplica el razonamiento del Tema 2 aunque no completes la migración real del estado en este laboratorio | Un bloque de configuración de backend correctamente documentado |

**Verificación:** el laboratorio se considera exitoso si `terraform plan` en el paso 5 muestra correctamente solo una modificación (no una destrucción y recreación completa) tras cambiar un atributo simple, y si tras modularizar la definición en el paso 6, `terraform plan` no reporta ningún cambio inesperado sobre la infraestructura ya existente (confirmando que la modularización fue puramente una reorganización de código, sin afectar el recurso real ya desplegado).

**Errores comunes y soluciones**

- **`terraform init` falla al descargar el provider.** Verifica tu conexión a internet y que el nombre y la versión del provider especificados en tu configuración son correctos; revisa también si tu organización requiere un proxy o un registro de providers privado configurado explícitamente.
- **`terraform plan` muestra que un recurso se destruirá y recreará por completo, cuando solo esperabas una modificación simple.** Algunos atributos de ciertos tipos de recursos no se pueden modificar in situ y requieren recrear el recurso completo (esto se documenta explícitamente en la documentación de cada provider para cada atributo específico); revisa si el atributo que cambiaste pertenece a esa categoría antes de aplicar, para evitar una recreación no anticipada.
- **Tras modularizar, `terraform plan` muestra que el recurso existente se destruirá y se creará uno nuevo dentro del módulo.** Esto ocurre porque, desde la perspectiva del estado de Terraform, el recurso dentro de un módulo tiene una dirección interna distinta a la del recurso fuera de cualquier módulo; usa `terraform state mv` para mover la entrada del recurso dentro del estado a su nueva dirección dentro del módulo, en vez de dejar que Terraform destruya y recree el recurso real innecesariamente.
- **El plan de un compañero muestra cambios que tú no hiciste.** Esto normalmente indica que el estado no está compartido correctamente entre ambos (cada uno tiene su propia copia local desactualizada); confirma que el backend remoto está correctamente configurado y que ambos están usando efectivamente el mismo estado compartido.

---



## Bibliografía y fundamento académico

Estas fuentes sustentan los conceptos y deben consultarse para verificar detalles que cambian entre versiones:

- CNCF, documentación oficial de Kubernetes, Prometheus y OpenTelemetry.
- HashiCorp, *Terraform Documentation*.
- Beyer et al., *Site Reliability Engineering*; Forsgren et al., *Accelerate*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.


## Resumen del módulo

**Puntos clave**

- Los providers traducen configuración HCL declarativa a llamadas de API de una plataforma específica; los resources declaran qué debe existir; los data sources solo consultan información existente sin gestionarla.
- El archivo de estado nunca debe editarse manualmente; un backend remoto con locking es indispensable para trabajo en equipo seguro.
- Los módulos encapsulan infraestructura reutilizable con una interfaz explícita de variables de entrada y outputs, evitando duplicación entre proyectos.
- `terraform plan` muestra el impacto de un cambio antes de aplicarlo; `terraform apply` lo ejecuta, típicamente tras confirmación explícita.
- Los workspaces mantienen estados separados para el mismo código entre entornos que comparten esencialmente la misma estructura.
- Ansible complementa a Terraform configurando software dentro de máquinas ya aprovisionadas, con un enfoque procedural pero módulos idempotentes.
- Pulumi ofrece el mismo concepto de IaC declarativa usando lenguajes de programación reales en vez de HCL, a costa de una dependencia adicional del runtime del lenguaje elegido.

**Conceptos aprendidos**

- Providers, resources y data sources en Terraform.
- El archivo de estado, backends remotos y locking.
- Módulos reutilizables con variables de entrada y outputs.
- El flujo `plan`/`apply` y su valor como revisión previa a cualquier cambio.
- Workspaces para múltiples entornos con el mismo código.
- Ansible: playbooks, roles, inventory y módulos, como complemento de Terraform.
- Pulumi como alternativa a HCL con lenguajes de programación reales.

**Próximos pasos**

En el Módulo 9 vas a centralizar observabilidad con Prometheus y Grafana, aprendiendo el modelo de métricas de series temporales y cómo alertar antes de que un incidente afecte a los usuarios.

**Recursos adicionales**

- Documentación oficial de Terraform: providers, módulos, backends remotos y workspaces.
- Documentación oficial de Ansible: playbooks, roles e inventory.
- Documentación oficial de Pulumi como referencia de infraestructura como código con lenguajes de programación reales.
