# Módulo 0: Linux y shell scripting para DevOps

## Sílabo

**Objetivo general**

Dominar la terminal de Linux como herramienta principal de trabajo: navegación, permisos, procesos, automatización con scripts bash robustos, y los fundamentos de redes y hardening que sostienen cualquier pipeline DevOps posterior.

**Objetivos específicos**

1. Operar el sistema de archivos y gestionar permisos con `chmod`/`chown`.
2. Gestionar procesos, señales y tareas en segundo plano desde la shell.
3. Combinar `grep`, `awk` y `sed` en pipes para procesar texto y logs.
4. Escribir scripts bash robustos con `set -euo pipefail` y variables de entorno.
5. Programar tareas con `cron` y aplicar hardening básico (SSH, firewall).
6. Explicar el modelo OSI/TCP-IP a un nivel práctico y situar la cultura DevOps en el ciclo completo de entrega de software.

**Contenido**

- Sistema de archivos y permisos (`chmod`/`chown`).
- Procesos, señales y jobs en segundo plano.
- Pipes, redirección y filtros (`grep`, `awk`, `sed`).
- Variables de entorno y scripts bash robustos (`set -euo pipefail`).
- Cron y tareas programadas.
- Hardening: SSH sin contraseña, firewalls (`ufw`/`iptables`), SELinux/AppArmor.
- Redes: modelo OSI, TCP/IP, DNS y balanceadores de carga.
- Cultura DevOps y el ciclo Plan→Code→Build→Test→Release→Deploy→Operate→Monitor.

**Evaluación**

Un laboratorio que construye un script bash idempotente de preparación de entorno, y tres ejercicios de evaluación sobre permisos, señales y robustez de scripts.

---

## Contenido teórico

### Tema 1: Sistema de archivos y permisos (chmod/chown)

**Conceptos clave:** propietario, grupo, otros, permisos de lectura/escritura/ejecución, notación octal.

En Linux, cada archivo y directorio tiene un propietario (owner), un grupo (group), y un conjunto de permisos definidos para tres categorías de identidad: el propietario, los miembros del grupo, y todos los demás usuarios del sistema (others). Para cada una de esas tres categorías existen tres permisos posibles: lectura (`r`), escritura (`w`) y ejecución (`x`). La salida de `ls -l` muestra estos nueve bits como una cadena de caracteres como `rwxr-xr--`, donde los primeros tres caracteres son los permisos del propietario, los siguientes tres los del grupo, y los últimos tres los de otros.

`chmod` modifica estos permisos, y admite dos notaciones: la simbólica (`chmod u+x archivo` añade permiso de ejecución al propietario) y la octal (`chmod 755 archivo`, donde cada dígito representa la suma de los valores 4=lectura, 2=escritura, 1=ejecución para cada categoría; 7 = 4+2+1 = lectura+escritura+ejecución, 5 = 4+1 = lectura+ejecución). La notación octal es la más usada en scripts y documentación porque es más compacta y menos ambigua de comunicar por escrito que la simbólica.

`chown` cambia el propietario (y opcionalmente el grupo) de un archivo: `chown usuario:grupo archivo`. Esta operación normalmente requiere privilegios de superusuario (`sudo`) si el archivo no te pertenece ya, precisamente porque cambiar la propiedad de un archivo es una operación sensible que podría usarse para eludir restricciones de acceso si cualquier usuario pudiera hacerlo libremente sobre archivos ajenos.

En el contexto de DevOps, entender permisos correctamente es crítico porque una configuración de permisos incorrecta es una de las causas más comunes tanto de fallos de despliegue ("permission denied" al ejecutar un script en un servidor) como de vulnerabilidades de seguridad reales (un archivo de configuración con credenciales legible por "otros" en un servidor compartido). La práctica estándar de la industria es aplicar el mismo principio de mínimo privilegio que vas a ver formalizado en el track Cloud: conceder solo los permisos estrictamente necesarios (por ejemplo, `600` para un archivo con credenciales, legible y escribible solo por su propietario, sin ningún permiso para grupo u otros).

**Analogía:** los permisos de Linux son como las llaves de un edificio de oficinas compartido: tú (propietario) tienes la llave maestra de tu propia oficina, tu equipo (grupo) tiene una llave que abre ciertas puertas comunes, y cualquier otra persona del edificio (otros) puede o no tener acceso a esas mismas puertas según cómo configures la cerradura. `chmod 600` sería como cerrar tu oficina con una llave que solo tú tienes, sin dar copias ni siquiera a tu propio equipo.

**¿Por qué es importante?** En cualquier pipeline de CI/CD o servidor de producción, un error de permisos —un script no ejecutable, un archivo de credenciales legible por cualquiera— es de los fallos más comunes y a la vez más rápidos de diagnosticar si entiendes bien este modelo. Es, con diferencia, uno de los primeros conceptos que cualquier ingeniero DevOps necesita dominar de forma reflexiva, no memorizada.

**Diagrama:**

```
-rwxr-xr--  1 nicolas  devops   script.sh
 │└┬┘└┬┘└┬┘
 │ │  │   └─ otros: r-- (solo lectura)
 │ │  └───── grupo: r-x (lectura + ejecución)
 │ └──────── propietario: rwx (lectura+escritura+ejecución)
 └────────── tipo de archivo (- = archivo regular, d = directorio)

chmod 754 script.sh   →   7=rwx (dueño) 5=r-x (grupo) 4=r-- (otros)
```

### Tema 2: Procesos, señales y jobs en segundo plano

**Conceptos clave:** proceso, PID, señal (SIGTERM/SIGKILL/SIGHUP), job en segundo plano, `&`, `jobs`, `kill`.

Cada programa en ejecución en Linux es un proceso, identificado por un número único llamado PID (Process ID). Un proceso puede lanzarse en primer plano (bloqueando la terminal hasta que termina) o en segundo plano añadiendo `&` al final del comando, lo que libera la terminal inmediatamente mientras el proceso sigue ejecutándose. `jobs` lista los procesos en segundo plano lanzados desde esa misma sesión de terminal, y `fg`/`bg` los traen de vuelta a primer o segundo plano respectivamente.

Las señales son el mecanismo por el que el sistema operativo (o tú, explícitamente) comunica eventos a un proceso en ejecución. `SIGTERM` (la señal por defecto de `kill <pid>`) le pide educadamente al proceso que termine, dándole la oportunidad de cerrar archivos abiertos, liberar recursos, y salir de forma ordenada; un proceso bien escrito captura esta señal y hace una limpieza antes de terminar. `SIGKILL` (`kill -9 <pid>`) es una señal que el proceso no puede capturar ni ignorar: el kernel lo termina inmediatamente sin darle ninguna oportunidad de limpieza, lo cual puede dejar recursos en un estado inconsistente (archivos temporales sin borrar, conexiones de red a medio cerrar). `SIGHUP` tradicionalmente indicaba que la terminal controladora se había cerrado, y muchos daemons la reinterpretan hoy como una señal de "recarga tu configuración sin reiniciar por completo".

La diferencia práctica entre `SIGTERM` y `SIGKILL` es exactamente la diferencia entre pedirle a alguien que termine su trabajo con calma y sacarlo a la fuerza de la sala: la primera opción es siempre la preferida en operación normal (por ejemplo, cuando Kubernetes detiene un Pod, primero envía `SIGTERM` y solo después de un plazo de gracia sin respuesta envía `SIGKILL`), y depender de `SIGKILL` como primera opción es una señal de que algo en el diseño del proceso no está gestionando bien su ciclo de vida.

Entender procesos y señales es la base para depurar situaciones reales como un servidor que no libera un puerto porque un proceso anterior quedó "zombi" o colgado, o diseñar correctamente el apagado ordenado (graceful shutdown) de un servicio, algo que se vuelve crítico cuando ese mismo servicio corre dentro de un contenedor Docker o un Pod de Kubernetes, temas que verás en detalle más adelante en este mismo track.

**Analogía:** `SIGTERM` es como tocar la puerta de una reunión y avisar "por favor, termina lo que estás haciendo y sal en los próximos minutos"; la persona puede guardar su trabajo antes de salir. `SIGKILL` es como cortar la electricidad de la sala de reuniones sin previo aviso: la reunión termina instantáneamente, pero cualquier cosa que no se había guardado se pierde.

**¿Por qué es importante?** Diseñar servicios que respondan correctamente a `SIGTERM` (cerrando conexiones activas, terminando de procesar la petición en curso, liberando recursos) en vez de depender de que el orquestador los mate con `SIGKILL` es una de las diferencias prácticas entre un servicio que se despliega sin downtime perceptible y uno que corta peticiones a medias en cada despliegue.

**Diagrama:**

```
kill <pid>       ──▶  SIGTERM  ──▶  el proceso puede capturarla y cerrar ordenadamente
kill -9 <pid>    ──▶  SIGKILL  ──▶  el kernel termina el proceso, sin oportunidad de limpieza
comando &        ──▶  proceso lanzado en segundo plano, terminal libre
jobs             ──▶  lista procesos en segundo plano de esta sesión
```

### Tema 3: Pipes, redirección y filtros (grep, awk, sed)

**Conceptos clave:** pipe (`|`), redirección (`>`, `>>`, `<`), `grep`, `awk`, `sed`, procesamiento de texto en flujo.

Un pipe (`|`) conecta la salida estándar de un comando con la entrada estándar del siguiente, permitiendo encadenar herramientas pequeñas y especializadas para construir transformaciones de texto complejas sin escribir un programa dedicado. Esta filosofía de "herramientas pequeñas que hacen una cosa bien y se combinan entre sí" es uno de los principios de diseño fundacionales de Unix, y sigue siendo la forma más rápida de procesar logs y archivos de texto en cualquier tarea DevOps del día a día.

`grep` busca líneas que coincidan con un patrón (literal o una expresión regular): `grep "ERROR" app.log` imprime solo las líneas que contienen la palabra "ERROR". `awk` es un lenguaje de procesamiento de texto orientado a columnas: `awk '{print $1, $3}'` imprime la primera y tercera columna de cada línea (usando espacios como separador por defecto), y admite lógica de condiciones y agregaciones (sumar una columna numérica de todo un archivo, por ejemplo). `sed` (stream editor) transforma texto línea por línea, típicamente para sustituciones: `sed 's/error/ERROR/g'` reemplaza todas las ocurrencias de "error" por "ERROR" en cada línea que pasa por él.

La redirección, distinta del pipe, conecta un comando con un archivo en vez de con otro comando: `comando > archivo.txt` escribe la salida en el archivo (sobrescribiéndolo si ya existe), `comando >> archivo.txt` añade al final sin sobrescribir, y `comando < archivo.txt` usa el archivo como entrada. Combinar redirección con pipes es habitual: `grep "ERROR" app.log | awk '{print $1}' | sort | uniq -c` es una cadena típica que filtra líneas de error, extrae una columna (por ejemplo, la marca de tiempo o el código de error), y cuenta cuántas veces aparece cada valor único, todo en una sola línea de comando sin escribir ningún script.

Dominar esta combinación de `grep`/`awk`/`sed` conectados por pipes es una de las habilidades más transferibles y de mayor retorno inmediato en el trabajo diario de cualquier perfil DevOps o SRE: la inmensa mayoría de las tareas de diagnóstico rápido sobre logs de texto plano en un servidor —sin acceso a un sistema de observabilidad centralizado como el que vas a construir más adelante en este track— se resuelven con una combinación de estos tres comandos.

**Analogía:** un pipe es como una línea de ensamblaje donde cada estación (comando) hace una única tarea específica sobre la pieza que recibe de la estación anterior, y la pasa transformada a la siguiente: una estación filtra piezas defectuosas (`grep`), otra extrae solo cierta parte de cada pieza (`awk`), otra la retoca (`sed`). Ninguna estación necesita saber nada de las demás, solo recibir la pieza y entregarla transformada.

**¿Por qué es importante?** Antes de tener un sistema de observabilidad centralizado (que vas a construir en un módulo posterior de este mismo track), esta combinación de herramientas de línea de comandos es, en la práctica, la primera línea de diagnóstico de cualquier ingeniero cuando algo falla en un servidor: revisar logs rápidamente por SSH, sin depender de ninguna herramienta adicional instalada.

**Diagrama:**

```
cat app.log | grep "ERROR" | awk '{print $1}' | sort | uniq -c
   │            │              │                │        │
   │            │              │                │        └─ cuenta ocurrencias únicas
   │            │              │                └────────── ordena
   │            │              └─────────────────────────── extrae 1ra columna
   │            └────────────────────────────────────────── filtra líneas con "ERROR"
   └─────────────────────────────────────────────────────── lee el archivo completo
```

### Tema 4: Variables de entorno y scripts bash robustos (set -euo pipefail)

**Conceptos clave:** variable de entorno, `export`, `set -e`, `set -u`, `set -o pipefail`, idempotencia de scripts.

Una variable de entorno es un valor con nombre disponible para un proceso y, si se exporta con `export`, para cualquier proceso hijo que ese proceso lance. Los scripts bash las usan constantemente para parametrizar comportamiento sin hardcodear valores (por ejemplo, un script de despliegue que lee `$ENTORNO` para decidir si despliega a `staging` o `produccion`).

Por defecto, bash tiene un comportamiento sorprendentemente permisivo con los errores: si un comando dentro de un script falla, bash simplemente continúa ejecutando la siguiente línea, como si nada hubiera pasado, a menos que le indiques explícitamente lo contrario. Esto es peligroso en scripts de automatización, donde un fallo silencioso a mitad de un script (por ejemplo, un `cd` a un directorio que no existe) puede hacer que las líneas siguientes se ejecuten en el directorio equivocado, con consecuencias potencialmente destructivas.

`set -e` cambia este comportamiento: el script se detiene inmediatamente en cuanto cualquier comando devuelve un código de salida distinto de cero (un fallo). `set -u` hace que el script falle si intenta usar una variable que nunca fue definida, en vez de silenciosamente tratarla como una cadena vacía (lo que podría, por ejemplo, convertir `rm -rf "$DIRECTORIO_VACIO_POR_ERROR"/*` en un desastroso `rm -rf /*` si la variable estaba vacía por un error tipográfico). `set -o pipefail` corrige un caso especial: sin esta opción, una cadena de comandos conectados por pipes solo reporta el código de salida del último comando de la cadena, ocultando un fallo en cualquier comando anterior del pipe; con `pipefail`, si cualquier comando de la cadena falla, todo el pipe se considera fallido.

La combinación `set -euo pipefail` al inicio de cualquier script bash de automatización real —tan común que se conoce coloquialmente como "modo estricto de bash"— convierte un script frágil, que puede fallar silenciosamente y seguir ejecutando pasos posteriores sobre un estado incorrecto, en uno que se detiene inmediata y ruidosamente ante el primer problema, exactamente el comportamiento que quieres en cualquier script que toque infraestructura real, un despliegue, o datos de producción.

**Analogía:** un script sin `set -euo pipefail` es como un trabajador que, si se equivoca en un paso de una receta, simplemente sigue con el siguiente paso de todas formas, sin avisar a nadie que algo salió mal, entregando al final un plato potencialmente arruinado sin que nadie lo sepa hasta que alguien lo prueba. Con `set -euo pipefail`, ese mismo trabajador se detiene y avisa inmediatamente en cuanto algo no sale como se esperaba, antes de seguir arruinando los pasos siguientes.

**¿Por qué es importante?** La ausencia de `set -euo pipefail` (o su equivalente) en scripts de automatización reales es una fuente extremadamente común de incidentes silenciosos en producción: un script de despliegue que "parece" haber terminado bien, pero en realidad falló en un paso intermedio y siguió ejecutando el resto sobre un estado corrupto. Adoptar esta línea como estándar en cualquier script bash nuevo es una de las prácticas de menor coste y mayor impacto en fiabilidad que existen.

**Diagrama:**

```
#!/bin/bash
set -euo pipefail
#     │││
#     ││└─ pipefail: un pipe falla si CUALQUIER comando de la cadena falla
#     │└── u: falla si usas una variable no definida
#     └─── e: el script se detiene en el primer comando que falle

cd "$DIRECTORIO"      # si $DIRECTORIO no existe o no está definida, el script se detiene aquí
rm -rf "$DIRECTORIO"/*  # nunca se ejecuta sobre un directorio equivocado
```

### Tema 5: Cron y tareas programadas

**Conceptos clave:** crontab, expresión cron (minuto hora día mes día-semana), tarea periódica.

`cron` es el daemon estándar de Linux para ejecutar comandos de forma automática y periódica, sin intervención manual. Cada usuario tiene su propio archivo de configuración (crontab), editable con `crontab -e`, donde cada línea define una tarea con el formato: cinco campos de tiempo (minuto, hora, día del mes, mes, día de la semana) seguidos del comando a ejecutar. Por ejemplo, `*/5 * * * * /ruta/script.sh` ejecuta `script.sh` cada 5 minutos, sin restricción de hora, día del mes, mes o día de la semana (los asteriscos significan "cualquier valor").

Cada uno de los cinco campos acepta valores específicos, rangos, listas, o el comodín `*/N` para "cada N unidades": `0 3 * * *` ejecuta algo a las 3:00 AM todos los días; `0 9 * * 1-5` lo ejecuta a las 9:00 AM solo de lunes a viernes; `0 0 1 * *` lo ejecuta a medianoche el primer día de cada mes. Dominar esta sintaxis compacta es útil porque aparece, con variantes menores, en muchas otras herramientas de programación de tareas más allá de cron puro, incluyendo el EventBridge Scheduler que se menciona en el track Cloud y los CronJobs de Kubernetes que vas a estudiar más adelante en este mismo track.

Un detalle operativo importante de cron es que las tareas se ejecutan con un entorno mínimo, sin las variables de entorno ni el `PATH` completo que tendrías en una sesión interactiva de terminal: un script que funciona perfectamente cuando lo ejecutas manualmente puede fallar silenciosamente bajo cron simplemente porque no encuentra un comando en su `PATH` reducido, o porque depende de una variable de entorno que solo existía en tu sesión interactiva. La práctica recomendada es usar siempre rutas absolutas dentro de scripts destinados a cron, y redirigir explícitamente su salida a un archivo de log (`>> /var/log/mi-script.log 2>&1`) para poder diagnosticar fallos, ya que cron no muestra la salida en ninguna terminal por defecto.

**Analogía:** cron es como un despertador programable con múltiples alarmas: puedes configurar una alarma que suene "cada 5 minutos", otra "todos los días a las 3 AM", y otra "el primer lunes de cada mes", y el despertador las dispara automáticamente sin que nadie tenga que estar pendiente del reloj.

**¿Por qué es importante?** Prácticamente cualquier sistema real necesita tareas de mantenimiento periódico —rotación de logs, backups, limpieza de archivos temporales, sincronización de datos—, y cron (o sus equivalentes más modernos en Kubernetes o en la nube) es la herramienta fundacional para ese patrón. Entender su sintaxis y sus particularidades operativas (entorno mínimo, necesidad de rutas absolutas) evita el clásico "funciona cuando lo ejecuto yo, pero no cuando lo ejecuta cron".

**Diagrama:**

```
*/5 * * * *  /ruta/script.sh
 │  │ │ │ │
 │  │ │ │ └── día de la semana (0-6, 0=domingo)
 │  │ │ └──── mes (1-12)
 │  │ └────── día del mes (1-31)
 │  └───────── hora (0-23)
 └──────────── minuto (0-59, */5 = cada 5 minutos)
```

### Tema 6: Hardening básico — SSH sin contraseña, firewalls, SELinux/AppArmor

**Conceptos clave:** autenticación por clave pública SSH, `ufw`/`iptables`, SELinux, AppArmor, control de acceso obligatorio.

El acceso remoto por SSH usando solo contraseña es vulnerable a ataques de fuerza bruta (probar contraseñas repetidamente hasta acertar) y depende enteramente de la fortaleza de esa contraseña. La autenticación por clave pública resuelve esto de raíz: generas un par de claves (una privada, que nunca sale de tu máquina, y una pública, que copias al servidor), y el servidor verifica criptográficamente que quien se conecta posee la clave privada correspondiente a una clave pública ya autorizada, sin que ninguna contraseña viaje por la red ni deba memorizarse. Deshabilitar completamente la autenticación por contraseña en el servidor (dejando solo autenticación por clave) es una práctica de hardening estándar una vez que confirmas que el acceso por clave funciona correctamente.

Un firewall filtra el tráfico de red permitiendo o bloqueando conexiones según reglas explícitas, normalmente basadas en puerto, protocolo y origen. `ufw` (uncomplicated firewall) es una interfaz simplificada sobre `iptables`, pensada para configurar reglas comunes sin memorizar la sintaxis más verbosa de `iptables` directamente: `ufw allow 22/tcp` permite SSH, `ufw allow 80,443/tcp` permite tráfico web, y `ufw enable` activa el firewall con una política por defecto de denegar todo lo no permitido explícitamente, aplicando exactamente el principio de "denegado por defecto" que ya viste (o verás) formalizado en el contexto de IAM en el track Cloud.

SELinux (en distribuciones basadas en Red Hat) y AppArmor (en distribuciones basadas en Debian/Ubuntu) implementan control de acceso obligatorio (mandatory access control): van más allá de los permisos tradicionales de archivo del Tema 1, aplicando políticas que restringen qué puede hacer un proceso específico —incluso si ese proceso corre con privilegios de superusuario—, limitando el daño potencial si ese proceso es comprometido. Por ejemplo, una política de AppArmor puede restringir a un servidor web para que solo pueda leer archivos de un directorio específico, aunque técnicamente corra con permisos que en teoría le permitirían leer cualquier archivo del sistema.

**Analogía:** la autenticación SSH por clave es como reemplazar la cerradura de una puerta (que cualquiera con la combinación correcta de números puede abrir) por un lector biométrico que solo reconoce tu huella específica: mucho más difícil de falsificar que adivinar una combinación. El firewall es como un guardia en la entrada del edificio que solo deja pasar a quienes tienen cita en las puertas autorizadas, rechazando por defecto a cualquiera que no esté en la lista. SELinux/AppArmor son como restringir, incluso para el propio personal de seguridad del edificio, a qué áreas específicas puede entrar cada uno según su función, en vez de darle acceso irrestricto a todo el edificio solo por ser parte de la seguridad.

**¿Por qué es importante?** Estos tres mecanismos de hardening —autenticación fuerte, firewall con denegación por defecto, y control de acceso obligatorio— son la base mínima de seguridad de cualquier servidor expuesto a internet, y forman parte del checklist estándar de cualquier proceso de aprovisionamiento de infraestructura real, mucho antes de llegar a las capas de seguridad más específicas de aplicación o de nube que vas a ver en otros módulos y tracks.

**Diagrama:**

```
┌─────────────────────────────────────────────────┐
│  Capa 1: Autenticación SSH por clave pública        │
│           (sin contraseñas expuestas a fuerza bruta) │
├─────────────────────────────────────────────────┤
│  Capa 2: Firewall (ufw/iptables)                     │
│           (deniega todo excepto lo explícitamente     │
│            permitido: puertos 22, 80, 443, etc.)      │
├─────────────────────────────────────────────────┤
│  Capa 3: SELinux / AppArmor                          │
│           (limita qué puede hacer cada proceso,        │
│            incluso si corre con privilegios altos)     │
└─────────────────────────────────────────────────┘
```

### Tema 7: Redes — modelo OSI, TCP/IP, DNS y balanceadores de carga

**Conceptos clave:** modelo OSI, TCP/IP, resolución DNS, balanceador de carga.

El modelo OSI describe la comunicación de red en siete capas conceptuales, de las cuales, en el trabajo diario de DevOps, las más relevantes son la capa de red (donde operan las direcciones IP), la capa de transporte (donde operan TCP y UDP, gestionando conexiones fiables o no fiables respectivamente), y la capa de aplicación (donde operan protocolos como HTTP, DNS o SSH). El modelo TCP/IP, más práctico y el que realmente implementa internet, condensa estas ideas en menos capas, pero el vocabulario del modelo OSI ("capa 3", "capa 4", "capa 7") sigue siendo el lenguaje común de la industria para describir en qué nivel opera una herramienta concreta (por ejemplo, "un balanceador de capa 4" frente a "un balanceador de capa 7").

DNS (Domain Name System) traduce nombres legibles por humanos (`ejemplo.com`) a direcciones IP que las máquinas usan realmente para enrutar tráfico. Esta resolución ocurre en varios pasos jerárquicos (servidores raíz, servidores de dominio de nivel superior, servidores autoritativos del dominio específico), pero en la práctica diaria de DevOps lo más relevante es entender que los registros DNS (tipo `A` para IPv4, `CNAME` para alias, `TXT` para verificación, entre otros) son configuración que debe gestionarse con el mismo cuidado que cualquier otra infraestructura, y que los cambios de DNS tardan en propagarse según el TTL (tiempo de vida) configurado en cada registro, algo que explica por qué un cambio de DNS no siempre es visible instantáneamente para todos los usuarios.

Un balanceador de carga distribuye el tráfico entrante entre múltiples instancias de un mismo servicio, tanto para repartir la carga de trabajo como para dar tolerancia a fallos (si una instancia falla, el balanceador deja de enviarle tráfico, sin que el resto del sistema se vea afectado). Un balanceador de capa 4 opera a nivel de conexión TCP/UDP, sin inspeccionar el contenido de la petición; un balanceador de capa 7 opera a nivel de aplicación (HTTP), pudiendo tomar decisiones de enrutamiento más sofisticadas basadas en la ruta de la URL, las cabeceras, o las cookies de la petición, al coste de un procesamiento algo más costoso por petición.

**Analogía:** el modelo OSI es como las distintas capas de un sistema postal: una capa se encarga de la dirección física del edificio (red/IP), otra de que el paquete llegue completo y en orden (transporte/TCP), y otra del contenido específico de la carta (aplicación/HTTP). DNS es como una guía telefónica que traduce un nombre de empresa a su dirección física real. Un balanceador de carga es como un recepcionista en la entrada de un complejo de oficinas con varias sedes idénticas, que dirige a cada visitante a la sede con menos fila en ese momento, y deja de enviar visitantes a cualquier sede que esté cerrada por mantenimiento.

**¿Por qué es importante?** Entender redes a este nivel práctico —sin necesidad de ser un experto en protocolos de bajo nivel— es indispensable para diagnosticar problemas comunes de despliegue: por qué un servicio no es alcanzable desde otro, por qué un cambio de DNS no se refleja de inmediato, o cómo diseñar correctamente el balanceo de tráfico hacia múltiples réplicas de un servicio, un concepto que reaparece directamente cuando trabajes con Services de Kubernetes más adelante en este track.

**Diagrama:**

```
Cliente ──▶ DNS (ejemplo.com → 203.0.113.10) ──▶ Balanceador de carga
                                                        │
                                    ┌───────────────────┼───────────────────┐
                                    ▼                    ▼                    ▼
                              Instancia 1          Instancia 2          Instancia 3
                              (recibe parte         (recibe parte         (recibe parte
                               del tráfico)           del tráfico)           del tráfico)
```

### Tema 8: Cultura DevOps y el ciclo Plan→Code→Build→Test→Release→Deploy→Operate→Monitor

**Conceptos clave:** cultura DevOps, ciclo de vida infinito, colaboración Dev+Ops, retroalimentación continua.

DevOps no es, ante todo, una herramienta ni un conjunto de comandos: es una cultura y un conjunto de prácticas que buscan eliminar la separación tradicional entre los equipos de desarrollo (Dev, que escriben código) y los de operaciones (Ops, que mantienen la infraestructura en producción), unificando la responsabilidad de que el software funcione bien de principio a fin, no solo "hasta que se entrega a producción". Esta separación tradicional generaba fricciones estructurales: el equipo de Dev optimizaba por lanzar funcionalidades rápido, el equipo de Ops optimizaba por estabilidad y evitar cambios, y ambos incentivos chocaban constantemente.

El ciclo Plan→Code→Build→Test→Release→Deploy→Operate→Monitor, representado habitualmente como un símbolo de infinito, ilustra que estas fases no son un proceso lineal de una sola pasada, sino un flujo continuo: lo que se observa en la fase de Monitor retroalimenta directamente la siguiente fase de Plan, cerrando el ciclo. Planificar (Plan) define qué se va a construir; programar (Code) lo implementa; construir (Build) lo empaqueta de forma reproducible (exactamente lo que vas a practicar con Docker en el Tema 2 del siguiente módulo); probar (Test) verifica que funciona correctamente; liberar (Release) y desplegar (Deploy) lo llevan a producción; operar (Operate) lo mantiene funcionando; y monitorear (Monitor) observa su comportamiento real, generando información que alimenta la siguiente iteración de planificación.

Cada uno de los módulos siguientes de este track —Git, Docker, CI, CD, Kubernetes, Terraform, observabilidad, logging, seguridad— corresponde a una o varias fases concretas de este ciclo, y el proyecto final del track (el pipeline CI/CD completo) es, literalmente, una implementación funcional de este ciclo de principio a fin. Entender esta cultura antes de aprender las herramientas específicas es lo que te permite ver cada herramienta no como un fin en sí mismo, sino como el medio para sostener un flujo continuo y confiable de valor desde el código hasta el usuario final, con retroalimentación constante entre ambos extremos.

**Analogía:** la cultura DevOps es como pasar de una fábrica organizada en departamentos aislados que se pasan el trabajo por encima del muro (diseño termina su parte y "la lanza" a producción, sin saber ni preocuparse de qué pasa después) a una línea de producción integrada donde el mismo equipo extendido observa el producto terminado en uso real, y esa observación alimenta directamente el siguiente ciclo de diseño, sin que la información se pierda entre departamentos que no se hablan.

**¿Por qué es importante?** Sin esta comprensión cultural de fondo, es fácil aprender herramientas de DevOps (Docker, Kubernetes, Terraform, Prometheus) de forma aislada, como comandos sueltos, sin entender por qué existen ni cómo encajan entre sí. Entender el ciclo completo desde el Módulo 0 te da el mapa mental sobre el cual vas a ir colocando cada herramienta nueva a medida que avances en el resto de este track.

**Diagrama:**

```
        ┌─────── Plan ───────┐
        │                     │
    Monitor                  Code
        │                     │
    Operate                Build
        │                     │
     Deploy ── Release ── Test
        (ciclo continuo, no lineal — lo que se observa
         en Monitor retroalimenta el siguiente Plan)
```

---

## Laboratorio práctico

**Objetivo del laboratorio:** escribir un script bash idempotente (que se puede ejecutar varias veces sin causar efectos indeseados) que prepara un entorno de desarrollo desde cero, aplicando permisos correctos, manejo robusto de errores, y verificación de cada paso.

**Requisitos previos:** una terminal Linux o macOS (o WSL en Windows), acceso de lectura/escritura a tu directorio de usuario.

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Crear el archivo del script | Crea `preparar-entorno.sh` con `#!/bin/bash` y `set -euo pipefail` en las dos primeras líneas | Activa el modo estricto de bash desde el inicio del script | El archivo se guarda sin errores |
| 2 | Dar permisos de ejecución | `chmod 755 preparar-entorno.sh` | El propietario puede leer/escribir/ejecutar; grupo y otros solo pueden leer/ejecutar | `ls -l` muestra `rwxr-xr-x` |
| 3 | Añadir una verificación idempotente de directorio | Añade al script:<br>`DIR_PROYECTO="$HOME/mi-proyecto"`<br>`mkdir -p "$DIR_PROYECTO"` | `mkdir -p` no falla si el directorio ya existe, a diferencia de `mkdir` simple; esto hace el script seguro de ejecutar varias veces | Sin errores, se ejecute una o varias veces |
| 4 | Añadir manejo de variable no definida | Añade una línea que use una variable, por ejemplo `echo "Entorno: $ENTORNO"`, SIN definir `ENTORNO` antes, y ejecuta el script | Demuestra en la práctica el efecto de `set -u` | El script falla inmediatamente con un error `unbound variable`, en vez de imprimir una cadena vacía silenciosamente |
| 5 | Corregir definiendo la variable con un valor por defecto | Cambia la línea anterior a `ENTORNO="${ENTORNO:-desarrollo}"` antes del `echo` | La sintaxis `${VAR:-valor}` usa "desarrollo" si `ENTORNO` no está definida, sin fallar | El script imprime `Entorno: desarrollo` sin error |
| 6 | Añadir un paso que dependa de un pipe | Añade: `echo "preparando..." \| tee -a "$DIR_PROYECTO/log.txt"` | Verifica el comportamiento de `pipefail`: si `tee` fallara, todo el pipe se consideraría fallido | El mensaje aparece en pantalla y se añade a `log.txt` |
| 7 | Ejecutar el script completo dos veces seguidas | `./preparar-entorno.sh && ./preparar-entorno.sh` | Confirma la idempotencia: ejecutarlo dos veces no produce ningún error ni efecto duplicado indeseado | Ambas ejecuciones terminan exitosamente, sin errores de "el directorio ya existe" |

**Verificación:** el laboratorio se considera exitoso si el script se ejecuta sin errores tanto la primera vez como en ejecuciones sucesivas (idempotencia), y si forzar una variable no definida (paso 4) efectivamente detiene el script con un error claro, confirmando que `set -euo pipefail` está protegiendo el script como se espera.

**Errores comunes y soluciones**

- **`Permission denied` al intentar ejecutar el script con `./preparar-entorno.sh`.** Falta el permiso de ejecución; revisa con `ls -l` y corrige con `chmod +x preparar-entorno.sh`.
- **El script continúa ejecutándose después de un comando fallido, a pesar de tener `set -e`.** Algunos contextos específicos de bash (como dentro de una condición `if`, o el lado izquierdo de un `&&`) no disparan `set -e` de la misma forma; revisa la documentación de bash sobre las excepciones conocidas de `set -e` si te encuentras con este caso.
- **`unbound variable` en un lugar inesperado del script.** Con `set -u` activo, cualquier variable no definida (incluyendo errores tipográficos en el nombre de una variable) provoca este error; revisa cuidadosamente que el nombre de la variable esté escrito exactamente igual en su definición y en su uso.
- **El script funciona en tu terminal pero falla al programarlo con cron.** Recuerda del Tema 5 que cron ejecuta con un entorno mínimo; usa siempre rutas absolutas dentro de scripts destinados a cron, y no asumas que el `PATH` incluye todo lo que tienes disponible interactivamente.

---

## Ejercicios de evaluación

### Ejercicio 1: Diagnosticar permisos

**Enunciado:** un compañero reporta que su script `deploy.sh` falla con `Permission denied` al intentar ejecutarlo en un servidor, aunque el archivo existe y su contenido es correcto. Sin ejecutar nada, explica cuál es la causa más probable y el comando exacto para solucionarla.

**Solución esperada:** la causa más probable es que el archivo no tiene el bit de ejecución activado para el usuario que intenta ejecutarlo. La solución es `chmod +x deploy.sh` (o, de forma más explícita y siguiendo la notación octal del Tema 1, `chmod 755 deploy.sh` si además se quiere garantizar lectura para grupo y otros).

**Criterios de éxito:**
- Identifica correctamente la falta del bit de ejecución como causa más probable, no un problema de contenido del script.
- Proporciona el comando `chmod` correcto.

### Ejercicio 2: Elegir la señal correcta

**Enunciado:** necesitas detener un proceso que sabes que maneja conexiones activas de usuarios y que, si se le da la oportunidad, cierra esas conexiones de forma ordenada antes de terminar. Explica qué señal usarías primero, por qué, y en qué circunstancia recurrirías a la alternativa más agresiva.

**Solución esperada:** usarías `SIGTERM` (`kill <pid>`) primero, porque el proceso puede capturarla y realizar su cierre ordenado de conexiones antes de terminar, respetando el trabajo en curso de sus usuarios. Solo recurrirías a `SIGKILL` (`kill -9 <pid>`) si, tras un tiempo razonable de espera, el proceso no responde a `SIGTERM` y necesitas forzar su terminación de todas formas, aceptando el riesgo de dejar recursos en un estado inconsistente.

**Criterios de éxito:**
- Elige `SIGTERM` como primera opción, no `SIGKILL`.
- Explica correctamente que `SIGTERM` permite un cierre ordenado y `SIGKILL` no da esa oportunidad.

### Ejercicio 3: Corregir un script frágil

**Enunciado:** revisa este script y explica qué añadirías para hacerlo más robusto según lo aprendido en el Tema 4, sin cambiar su lógica de negocio:
```bash
#!/bin/bash
cd /var/www/mi-app
git pull
npm install
npm run build
```

**Solución esperada:** añadir `set -euo pipefail` justo después de la primera línea (`#!/bin/bash`). Sin esto, si `cd` falla (por ejemplo, porque el directorio no existe en ese servidor), el script continuaría ejecutando `git pull`, `npm install` y `npm run build` en el directorio equivocado (probablemente el directorio desde el que se invocó el script), con resultados potencialmente destructivos o confusos, en vez de detenerse inmediatamente ante ese primer fallo.

**Criterios de éxito:**
- Propone añadir `set -euo pipefail` (o como mínimo `set -e`) como la corrección principal.
- Explica correctamente la consecuencia concreta de no tenerlo: seguir ejecutando comandos en un directorio incorrecto si el `cd` falla.

---

## Resumen del módulo

**Puntos clave**

- Los permisos de Linux (propietario/grupo/otros × lectura/escritura/ejecución) son la base de la seguridad de archivos y una fuente común de fallos de despliegue si se configuran mal.
- `SIGTERM` permite un cierre ordenado de un proceso; `SIGKILL` lo termina sin darle oportunidad de limpieza.
- `grep`, `awk` y `sed` combinados por pipes son la herramienta de diagnóstico más rápida sobre logs de texto plano.
- `set -euo pipefail` convierte un script bash frágil en uno que se detiene inmediatamente ante el primer error, en vez de continuar silenciosamente sobre un estado incorrecto.
- `cron` programa tareas periódicas, pero corre con un entorno mínimo que exige rutas absolutas y buen manejo de logs.
- El hardening básico (SSH por clave, firewall con denegación por defecto, SELinux/AppArmor) es la base mínima de seguridad de cualquier servidor.
- La cultura DevOps entiende Plan→Code→Build→Test→Release→Deploy→Operate→Monitor como un ciclo continuo, no un proceso lineal de una sola pasada.

**Conceptos aprendidos**

- Permisos de archivo y su notación octal.
- Procesos, señales, y jobs en segundo plano.
- Procesamiento de texto con `grep`, `awk`, `sed` y pipes.
- Scripts bash robustos con `set -euo pipefail`.
- Programación de tareas con `cron`.
- Hardening básico: SSH por clave, firewalls, control de acceso obligatorio.
- Fundamentos prácticos de redes: modelo OSI, DNS, balanceadores de carga.
- La cultura y el ciclo de vida DevOps.

**Próximos pasos**

En el Módulo 1 vas a profundizar en Git más allá de los comandos básicos: estrategias de branching a escala de equipo, rebase interactivo, y las herramientas que te permiten navegar y corregir el historial de un repositorio con confianza.

**Recursos adicionales**

- Documentación del manual de Linux (`man bash`, `man chmod`, `man cron`) como referencia primaria y siempre disponible sin conexión.
- Guía oficial de `ufw` y documentación de `iptables` para hardening de firewall.
- Introducción oficial a DevOps y su ciclo de vida, publicada por las principales plataformas de CI/CD del mercado.
