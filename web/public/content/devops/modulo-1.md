# Módulo 1: Git avanzado y estrategias de branching

## Sílabo

**Objetivo general**

Ir más allá de `add`/`commit`/`push`: reescribir historial con confianza, elegir una estrategia de branching adecuada al tamaño y madurez de un equipo, y usar herramientas de diagnóstico como `bisect` para encontrar regresiones con precisión.

**Objetivos específicos**

1. Comparar trunk-based development y GitFlow, y justificar cuándo usar cada uno.
2. Usar rebase interactivo para limpiar un historial de commits antes de compartirlo.
3. Usar `git bisect` para localizar el commit exacto que introdujo un bug.
4. Configurar hooks de Git y explicar el valor de los commits firmados.
5. Diferenciar monorepos de polyrepos y sus implicaciones de tooling y ownership.
6. Usar `cherry-pick`, `stash`, `reset` y `revert` de forma apropiada según el contexto.

**Contenido**

- Trunk-based development vs GitFlow.
- Rebase interactivo vs merge.
- Bisect para encontrar regresiones.
- Hooks de Git y commits firmados.
- Monorepos vs polyrepos.
- `git cherry-pick`, `git stash`, `git reset` vs `git revert`.
- `git reflog`, `git worktree` y `git submodule`.

**Evaluación**

Un laboratorio que limpia un historial con rebase, provoca y resuelve un conflicto, y usa `bisect` para encontrar una regresión; tres ejercicios de evaluación sobre elección de estrategia de branching, riesgos de reescribir historial compartido, y diferencias entre `reset` y `revert`.

---

## Aprende construyendo

### Tema 1: Trunk-based development vs GitFlow

**Conceptos clave:** rama principal (`main`/`trunk`), integración continua, feature flag, rama de larga duración, ceremonia de release.

Trunk-based development es una estrategia donde todo el equipo integra sus cambios a la rama principal (`main` o `trunk`) con mucha frecuencia, normalmente varias veces al día, manteniendo esa rama siempre en un estado desplegable. El trabajo incompleto o experimental que no debe ser visible todavía para los usuarios se oculta con feature flags (interruptores en configuración que activan o desactivan una funcionalidad) en vez de aislarlo en una rama separada de larga duración. Esta estrategia exige, casi como condición previa, un pipeline de CI/CD maduro (el que vas a construir en los Módulos 4 y 5 de este mismo track): sin pruebas automatizadas confiables y un pipeline rápido, integrar constantemente a `main` sería arriesgado.

GitFlow, en cambio, es un modelo más estructurado con varias ramas de larga duración con propósitos específicos: `develop` como rama de integración continua de funcionalidades, `release/*` para preparar una versión específica antes de publicarla, `hotfix/*` para corregir errores urgentes directamente sobre producción, y `main` reservada exclusivamente para el código que efectivamente está en producción. Este modelo añade más ceremonia (más tipos de rama, más pasos formales de fusión) pero da más control explícito sobre qué contiene exactamente cada versión publicada, algo valioso en contextos con ciclos de release programados y menos automatización de por medio.

La elección entre ambos no es una cuestión de cuál es "mejor" en abstracto, sino de qué encaja con la madurez operativa y el tamaño del equipo. Equipos pequeños con buena cobertura de pruebas y despliegues frecuentes tienden a beneficiarse de trunk-based development, porque su mayor simplicidad y velocidad de integración superan la necesidad de la estructura adicional de GitFlow. Equipos grandes, con múltiples versiones soportadas simultáneamente en producción, o con procesos de aprobación de release más formales (por ejemplo, en software regulado), suelen encontrar en GitFlow una estructura que refleja mejor esa realidad organizativa.

Un error común es adoptar GitFlow por costumbre o porque "así se hace en la industria", sin evaluar si la ceremonia adicional realmente aporta valor al contexto específico del equipo; del mismo modo, forzar trunk-based development en un equipo sin disciplina de pruebas automatizadas suele degradar rápidamente la estabilidad de `main`, precisamente la propiedad que esta estrategia depende de mantener.

**Analogía:** trunk-based development es como un grupo de cocineros que van añadiendo ingredientes a la misma olla común constantemente, confiando en que cada uno prueba su ingrediente antes de añadirlo (las pruebas automatizadas) para no arruinar el plato compartido. GitFlow es como preparar cada plato en una estación separada (una rama de funcionalidad), y solo llevarlo a la olla común (`main`) en una ceremonia formal de "montaje del plato final" (el proceso de release), con más pasos de control antes de servir.

**¿Por qué es importante?** La estrategia de branching de un equipo no es un detalle superficial: determina directamente qué tan rápido puede integrarse y validarse un cambio, qué tan fácil es depurar una regresión, y qué tan arriesgado es cada despliegue. Elegir mal esta estrategia genera fricción constante que el equipo siente todos los días, aunque rara vez se identifique de inmediato como la causa raíz.

**Diagrama:**

```
Trunk-based:                         GitFlow:
main ●─●─●─●─●─●─●─●                main ────────●──────────●────
     (integración constante,         develop ●─●───●─●─●──●───
      feature flags ocultan               \        /  \        /
      trabajo incompleto)          feature/x ●─●─●     release/1.2 ●─●
                                                              \
                                                          hotfix/urgente ●
```

### Tema 2: Rebase interactivo vs merge

**Conceptos clave:** `git rebase -i`, `pick`/`squash`/`reword`/`drop`, historial lineal, riesgo de reescribir historial compartido.

`git merge` combina dos ramas creando un nuevo commit de fusión que tiene dos padres, preservando exactamente el historial tal como ocurrió, incluyendo todos los commits intermedios de ambas ramas. `git rebase` reescribe el historial: toma los commits de tu rama y los "reaplica" uno por uno sobre la punta actual de otra rama, como si los hubieras escrito directamente ahí desde el principio, produciendo un historial final lineal, sin commits de fusión.

`git rebase -i HEAD~3` abre un editor con los últimos tres commits, permitiendo reordenarlos y aplicarles una acción a cada uno: `pick` los mantiene tal cual, `squash` los combina con el commit anterior en uno solo, `reword` permite cambiar el mensaje de un commit sin tocar su contenido, y `drop` lo elimina por completo del historial. Esto es extremadamente útil para limpiar una secuencia de commits de trabajo en progreso ("WIP", "fix typo", "otro intento") en un único commit coherente y bien descrito antes de abrir un pull request, dejando un historial legible para quien lo revise después.

La regla de seguridad más importante sobre el rebase, sin excepciones razonables, es: nunca reescribas el historial de una rama que otras personas ya tienen clonada o que ya fue fusionada a una rama compartida. Como el rebase cambia los hashes de commit (cada commit reaplicado es técnicamente un commit nuevo, aunque su contenido sea idéntico), cualquier persona que ya tenga la versión antigua de esos commits en su copia local terminará con un historial divergente e inconsistente respecto al tuyo, generando conflictos confusos y difíciles de resolver para todo el equipo.

La práctica segura y ampliamente adoptada es: usa rebase libremente sobre tus propias ramas de funcionalidad que nadie más ha clonado todavía, para limpiar tu historial antes de compartirlo; usa merge (o rebase solo con extremo cuidado y coordinación explícita del equipo) sobre ramas que ya son compartidas o públicas, donde reescribir el historial afectaría a otras personas.

**Analogía:** el merge es como pegar dos capítulos de un libro tal como fueron escritos, con una nota explícita de "aquí se unieron ambas historias". El rebase es como reescribir uno de los capítulos como si siempre hubiera continuado directamente donde terminó el otro, sin esa nota de unión, produciendo una narrativa más lineal y limpia de leer. Rebasar una rama que otros ya leyeron es como reescribir un capítulo que un grupo de lectores ya está discutiendo activamente: de repente, todos están hablando de versiones distintas del mismo capítulo.

**¿Por qué es importante?** Saber cuándo usar rebase y cuándo usar merge —y sobre todo, respetar la regla de no reescribir historial compartido— evita uno de los problemas más frustrantes y evitables en el trabajo colaborativo con Git: un historial confuso, con commits duplicados o conflictos aparentemente inexplicables, causados por reescribir algo que otra persona ya había construido sobre la versión anterior.

**Diagrama:**

```
Antes del rebase interactivo:          Después de "squash" los tres en uno:
main ─●
       \                                main ─●
   feature ●─●─●  ("WIP", "fix", "fix2")            \
                                              feature ●  ("Añade validación de formulario")
```

### Tema 3: Bisect para encontrar regresiones

**Conceptos clave:** `git bisect`, búsqueda binaria, commit `good`/`bad`, regresión.

`git bisect` automatiza la búsqueda del commit exacto que introdujo un bug, usando búsqueda binaria sobre el historial de commits en vez de revisarlos uno por uno secuencialmente. El proceso empieza con `git bisect start`, seguido de marcar un commit donde sabes que el bug ya está presente (`git bisect bad`, normalmente el commit actual) y otro donde sabes con certeza que el bug todavía no existía (`git bisect good <commit-o-tag>`, por ejemplo una versión anterior conocida como estable).

A partir de ahí, Git hace checkout automáticamente al commit que está exactamente a mitad de camino entre ambos puntos marcados, y te pide que pruebes si el bug está presente en ese punto medio, marcándolo como `good` o `bad` según el resultado. Con cada marca, Git reduce a la mitad el rango de commits sospechosos, y repite el proceso hasta converger en un único commit: exactamente el que introdujo la regresión. Para un historial de mil commits, esto reduce la búsqueda a aproximadamente diez iteraciones (log₂ de mil), en vez de las potencialmente mil revisiones secuenciales que tomaría revisarlos uno por uno.

Este proceso puede automatizarse por completo si tienes un script o un test que determine automáticamente si el bug está presente (por ejemplo, un test unitario específico que falla exactamente cuando el bug existe): `git bisect run <script>` ejecuta ese script en cada punto medio y marca automáticamente `good`/`bad` según su código de salida, sin necesitar intervención manual en cada paso, encontrando la regresión de forma completamente automática.

`git bisect` es una de esas herramientas que la mayoría de los desarrolladores conocen de nombre pero pocos usan habitualmente, a pesar de ser dramáticamente más eficiente que la alternativa manual de revisar commits uno por uno o intentar adivinar cuál pudo haber introducido el problema. Es especialmente valiosa en repositorios con historiales largos donde el bug se introdujo hace tiempo y nadie recuerda exactamente en qué cambio.

**Analogía:** `git bisect` es como buscar una palabra específica en un diccionario físico: en vez de leer página por página desde el principio, abres el diccionario por la mitad, ves si la palabra que buscas viene antes o después alfabéticamente, y repites ese proceso de dividir a la mitad hasta encontrarla en unos pocos pasos, en vez de cientos.

**¿Por qué es importante?** En cualquier proyecto con suficiente historial, encontrar manualmente el commit exacto que introdujo un bug sutil (uno que no fue detectado inmediatamente al introducirse) puede consumir horas de revisión manual. `git bisect`, especialmente combinado con un test automatizado y `bisect run`, reduce esa búsqueda a minutos, siendo una de las herramientas de diagnóstico de mayor retorno de tiempo invertido en el ecosistema de Git.

**Diagrama:**

```
good ●───────────────●───────────────● bad
     v1.0          (punto medio)   HEAD (bug presente)
                        │
              ¿el bug está aquí? marca good o bad
                        │
        el rango sospechoso se reduce a la mitad
        y el proceso se repite hasta converger
        en el commit exacto que introdujo el bug
```

### Tema 4: Hooks de Git y commits firmados

**Conceptos clave:** hook (`pre-commit`, `pre-push`), automatización local, commit firmado (GPG/SSH), verificación de autoría.

Un hook de Git es un script que se ejecuta automáticamente en un punto específico del flujo de trabajo de Git, viviendo en el directorio `.git/hooks/` de un repositorio (o gestionado de forma compartida con herramientas como Husky en proyectos Node.js, que sincronizan hooks entre todos los miembros del equipo). Un hook `pre-commit`, por ejemplo, se ejecuta justo antes de que un commit se complete, y si el script termina con un código de salida distinto de cero, Git cancela el commit por completo: es el mecanismo perfecto para bloquear localmente un commit que no pasa el linter o que introduce un archivo con un patrón prohibido (como una clave de API hardcodeada).

Un commit firmado añade una firma criptográfica (usando GPG o, más recientemente, también claves SSH) que verifica que ese commit específico fue efectivamente creado por quien dice haberlo creado, y que su contenido no fue alterado después de firmarse. Esto es distinto y más fuerte que simplemente confiar en el nombre y correo configurados localmente con `git config user.name`/`user.email`, que cualquiera puede escribir libremente sin ninguna verificación real de identidad. Plataformas como GitHub muestran una insignia visual de "Verified" junto a los commits firmados correctamente, dando una señal de confianza adicional sobre la autoría real de ese cambio.

Los hooks son, por naturaleza, locales a cada copia del repositorio: no se distribuyen automáticamente solo por hacer `git clone`, lo que significa que un hook `pre-commit` configurado en tu máquina no protege automáticamente a un compañero de equipo que no lo tiene configurado en la suya, a menos que el equipo use explícitamente una herramienta que sincronice hooks (como Husky) como parte del proceso de instalación del proyecto. Esta es una diferencia importante frente a validaciones de CI, que sí se aplican de forma centralizada e inevitable para todo el equipo sin depender de la configuración local de cada persona.

Precisamente por esa naturaleza local y opcional, los hooks se consideran una primera línea de defensa rápida y conveniente (detectar un problema antes incluso de hacer commit, ahorrando el ciclo de subir el cambio y esperar a que CI lo rechace), pero nunca deben ser la única línea de defensa: la validación real y obligatoria para todo el equipo debe vivir en el pipeline de CI, que vas a construir en el Módulo 4 de este track, precisamente porque CI no puede ser omitido ni desactivado localmente por accidente u omisión.

**Analogía:** un hook de Git es como una alarma de humo instalada en tu propia cocina: te avisa rápidamente si algo empieza a arder mientras cocinas, pero solo protege tu cocina específica, no la de tus vecinos, a menos que cada uno instale la suya. Un commit firmado es como notariar un documento: cualquiera puede firmar con su nombre a mano, pero una firma notariada (o su equivalente criptográfico) da una garantía mucho más fuerte de que esa persona específica, y nadie más, produjo ese documento exacto.

**¿Por qué es importante?** Los hooks aceleran el ciclo de retroalimentación al detectar problemas antes de subir un cambio, y los commits firmados añaden una capa real de verificación de identidad, especialmente valiosa en proyectos de código abierto o con requisitos de cumplimiento donde la autoría verificable de cada cambio importa. Ninguno de los dos reemplaza a CI como la validación obligatoria final, pero ambos mejoran significativamente el flujo de trabajo diario de un equipo.

**Diagrama:**

```
.git/hooks/pre-commit (local, opcional, rápido)
   │
   ▼
git commit ──▶ ejecuta el hook ──▶ ¿pasa? ──▶ Sí: commit se crea
                                        └──▶ No: commit se cancela

CI en el pipeline (centralizado, obligatorio, para TODO el equipo)
   │
   ▼
git push ──▶ dispara CI ──▶ ¿pasa? ──▶ Sí: PR puede fusionarse
                                  └──▶ No: PR bloqueado
```

### Tema 5: Monorepos vs polyrepos

**Conceptos clave:** monorepo, polyrepo, cambios atómicos, ownership, tooling compartido.

Un monorepo aloja múltiples proyectos o paquetes relacionados dentro de un único repositorio Git, mientras que un polyrepo distribuye cada proyecto en su propio repositorio independiente. La ventaja principal de un monorepo es la posibilidad de hacer cambios atómicos que abarcan múltiples paquetes relacionados en un único commit y un único pull request: si una función compartida cambia su firma, puedes actualizar esa función y todos sus consumidores internos en el mismo cambio, revisado y fusionado como una sola unidad coherente, en vez de coordinar múltiples pull requests separados en repositorios distintos que deben fusionarse en un orden específico.

Un monorepo también facilita compartir configuración de tooling (linters, formateo, configuración de CI) de forma centralizada, evitando que cada proyecto mantenga su propia copia potencialmente desincronizada de esa configuración. La desventaja es que, a medida que el monorepo crece, operaciones como clonar el repositorio completo, o ejecutar el pipeline de CI sobre "todo" en vez de solo lo que cambió, pueden volverse lentas si no se invierte en herramientas específicas de monorepo (como sistemas de build que solo reconstruyen y prueban lo que realmente cambió, en vez de todo el repositorio en cada commit).

Un polyrepo da límites de ownership mucho más claros: cada equipo controla completamente su propio repositorio, con su propio ciclo de despliegue independiente, sin riesgo de que un cambio en un proyecto no relacionado afecte accidentalmente al pipeline de CI de otro. La desventaja es la fricción de coordinar cambios que sí necesitan tocar múltiples repositorios a la vez (por ejemplo, un cambio de contrato de API que afecta tanto al backend como a un cliente), que requiere múltiples pull requests coordinados manualmente, con el riesgo de que queden temporalmente desincronizados entre sí.

No existe una respuesta universalmente correcta entre ambos enfoques: empresas de gran escala como Google operan con un monorepo gigantesco y herramientas de build altamente especializadas para sostenerlo; muchas otras organizaciones, especialmente con equipos más pequeños y proyectos con ciclos de vida y ownership claramente independientes, encuentran en el polyrepo un modelo más simple de operar sin esa inversión adicional en tooling especializado.

**Analogía:** un monorepo es como un edificio de oficinas compartido donde varios departamentos relacionados trabajan bajo el mismo techo, pueden coordinar cambios de infraestructura común fácilmente (el mismo sistema eléctrico, la misma recepción), pero cualquier obra grande en el edificio (una reconstrucción del pipeline de CI) afecta potencialmente a todos los inquilinos a la vez. Un polyrepo es como cada departamento en su propio edificio independiente: control total sobre su espacio, pero coordinar una reunión conjunta entre varios departamentos requiere organizar el transporte entre edificios distintos cada vez.

**¿Por qué es importante?** La decisión entre monorepo y polyrepo afecta directamente cómo se coordinan los cambios entre equipos, qué tan rápido es el pipeline de CI, y qué tan claros son los límites de responsabilidad entre proyectos. Es una decisión de arquitectura organizacional, no solo técnica, que rara vez se revierte fácilmente una vez que un proyecto crece, por lo que vale la pena razonarla con cuidado desde el principio de un proyecto nuevo.

**Diagrama:**

```
Monorepo                              Polyrepo
┌─────────────────────────┐        ┌───────────┐  ┌───────────┐
│  /paquete-a                │        │ repo-a       │  │ repo-b       │
│  /paquete-b                │        │ (propio CI,   │  │ (propio CI,   │
│  /tooling-compartido        │        │  propio ciclo │  │  propio ciclo │
│  (un solo commit puede       │        │  de release)  │  │  de release)  │
│   tocar a y b a la vez)      │        └───────────┘  └───────────┘
└─────────────────────────┘           (coordinar cambios entre ambos
                                        requiere PRs separados)
```

### Tema 6: git cherry-pick, git stash, git reset vs git revert

**Conceptos clave:** `cherry-pick`, `stash`, `reset` (soft/mixed/hard), `revert`, historial destructivo vs no destructivo.

`git cherry-pick <commit>` aplica un commit específico de otra rama sobre tu rama actual, sin traer el resto del historial de esa rama, útil cuando necesitas un cambio puntual (por ejemplo, una corrección urgente) sin fusionar toda una rama de funcionalidad todavía en desarrollo. `git stash` guarda temporalmente los cambios no confirmados de tu directorio de trabajo, dejándolo limpio (como si acabaras de hacer checkout de un commit), para poder cambiar de rama rápidamente o probar algo distinto, y recuperar esos cambios después con `git stash pop` cuando quieras continuar donde los dejaste.

`git reset` mueve la punta de una rama a un commit distinto, con tres modos según cuánto afecta al directorio de trabajo y al área de staging: `--soft` mueve solo la referencia de la rama, dejando los cambios de esos commits "deshechos" en el área de staging, listos para volver a confirmarse de otra forma; `--mixed` (el valor por defecto) además saca esos cambios del área de staging, dejándolos como cambios no confirmados en tu directorio de trabajo; `--hard` descarta completamente esos cambios, sin dejar ningún rastro en el directorio de trabajo, siendo el modo más destructivo de los tres.

`git revert <commit>`, en cambio, no reescribe el historial: crea un commit nuevo que deshace exactamente los cambios de un commit anterior, preservando ambos commits (el original y el que lo revierte) visibles en el historial. Esta es la diferencia crucial frente a `reset`: `revert` es seguro de usar sobre ramas ya compartidas (porque no reescribe nada, solo añade un commit nuevo que deshace el efecto), mientras que `reset` reescribe la posición de la rama y puede causar los mismos problemas de historial divergente que viste con rebase en el Tema 2 si se usa sobre una rama que otros ya tienen.

La regla práctica que resume estos cuatro comandos: `cherry-pick` para traer un cambio puntual de otra rama; `stash` para guardar trabajo temporal sin comprometerlo todavía; `reset` para reescribir tu propio historial local no compartido; `revert` para deshacer un cambio de forma segura en una rama que ya es compartida o pública, sin alterar el historial existente.

**Analogía:** `cherry-pick` es como fotocopiar una sola página de un libro ajeno y pegarla en el tuyo, sin llevarte el libro completo. `stash` es como guardar temporalmente en un cajón un trabajo a medio terminar sobre tu escritorio, para poder despejarlo y atender algo urgente, sacándolo de nuevo del cajón cuando quieras continuar. `reset --hard` es como arrancar páginas completas de tu propio cuaderno personal. `revert` es como escribir una nueva entrada en un diario compartido que dice explícitamente "corrijo lo que escribí el martes", sin arrancar la página del martes, dejando ambas entradas visibles para quien lea el diario completo.

**¿Por qué es importante?** Confundir `reset --hard` con `revert` sobre una rama compartida es uno de los errores más comunes y potencially más disruptivos que un desarrollador nuevo con Git puede cometer: reescribir el historial de una rama que el resto del equipo ya tiene clonada genera exactamente el mismo problema de divergencia que viste con rebase compartido, mientras que `revert` logra el mismo objetivo (deshacer un cambio) de forma completamente segura para cualquier rama, compartida o no.

**Diagrama:**

```
git reset --hard <commit-anterior>    git revert <commit-a-deshacer>
main ──●──●──●                        main ──●──●──●──●(revierte al anterior)
        (la rama "retrocede",                 (nuevo commit que deshace el efecto,
         el historial posterior                el commit original SIGUE visible
         desaparece de la rama)                 en el historial)
```

### Tema 7: git reflog, git worktree y git submodule

**Conceptos clave:** `reflog`, red de seguridad de Git, `worktree` (múltiples directorios de trabajo), `submodule` (repositorio anidado).

`git reflog` es, posiblemente, la red de seguridad más subestimada de Git: registra un historial local de a dónde ha apuntado `HEAD` (la posición actual del repositorio) a lo largo del tiempo, incluyendo operaciones que reescriben el historial como rebases o resets. Si alguna vez ejecutas un `reset --hard` por error, o un rebase sale mal y "pierdes" commits que parecían haber desaparecido, `git reflog` casi siempre te permite encontrar la referencia exacta a ese estado anterior y recuperarlo con un simple `git reset --hard <hash-del-reflog>`, incluso cuando esos commits ya no son alcanzables desde ninguna rama visible.

`git worktree` permite tener múltiples directorios de trabajo asociados al mismo repositorio, cada uno con una rama distinta activa simultáneamente, sin necesidad de clonar el repositorio varias veces ni de hacer stash/checkout constante para alternar entre ramas. Esto es útil, por ejemplo, cuando necesitas revisar un pull request en una rama distinta mientras mantienes tu propio trabajo en curso intacto en otro directorio, sin interrumpir ninguno de los dos.

`git submodule` permite incluir un repositorio Git completo dentro de otro, como una referencia a un commit específico de ese repositorio externo, útil cuando un proyecto depende de otro repositorio de código que se versiona de forma independiente (por ejemplo, una librería compartida entre varios proyectos que vive en su propio repositorio). Los submódulos tienen fama merecida de ser algo incómodos de operar correctamente (es fácil olvidar actualizar la referencia del submódulo, o clonar un repositorio sin inicializar sus submódulos por accidente), por lo que muchos equipos prefieren, cuando es posible, alternativas como gestores de paquetes propios o, si el caso de uso encaja, directamente un monorepo (Tema 5) para evitar esa complejidad operativa.

Estos tres comandos —`reflog`, `worktree` y `submodule`— no se usan con la misma frecuencia diaria que `commit`, `push` o `merge`, pero cada uno resuelve un problema específico que, cuando aparece, no tiene una alternativa igualmente directa: `reflog` para recuperarte de un error de historial, `worktree` para trabajar en paralelo sobre múltiples ramas sin fricciones, y `submodule` para incluir dependencias de código externas versionadas de forma independiente.

**Analogía:** `git reflog` es como la papelera de reciclaje del sistema operativo, pero para el historial de tu repositorio: incluso si "borraste" algo con una operación destructiva, normalmente sigue recuperable durante un tiempo antes de que Git lo limpie definitivamente. `git worktree` es como tener varios escritorios físicos distintos, cada uno con un proyecto diferente abierto, en vez de tener que guardar y sacar papeles de un cajón cada vez que cambias de tarea. `git submodule` es como incluir literalmente un capítulo de otro libro, con una referencia exacta a qué edición de ese libro externo estás incluyendo.

**¿Por qué es importante?** `git reflog` en particular es una herramienta que vale la pena conocer antes de necesitarla en pánico: el momento en que más se necesita (después de un error aparentemente irreversible) es exactamente el peor momento para estar aprendiendo que existe por primera vez.

**Diagrama:**

```
git reflog
┌───────────────────────────────────────────────┐
│ a1b2c3d HEAD@{0}: reset: moving to HEAD~3          │
│ e4f5g6h HEAD@{1}: commit: Añade validación          │  ← este commit "desapareció"
│ i7j8k9l HEAD@{2}: checkout: moving from main         │     de la rama tras el reset,
└───────────────────────────────────────────────┘     pero sigue recuperable:
                                                          git reset --hard e4f5g6h
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

**Objetivo del laboratorio:** limpiar un historial de commits con rebase interactivo, provocar y resolver un conflicto de fusión manualmente, y usar `git bisect` para encontrar el commit exacto que introdujo un bug.

**Requisitos previos:** Git instalado y configurado (`git config user.name`/`user.email`), un repositorio local de prueba con al menos algunos commits.

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Crear tres commits desordenados | Haz tres cambios pequeños y confírmalos por separado con mensajes como "WIP", "fix", "fix de verdad" | Simula el historial típico de trabajo en progreso antes de limpiar | Tres commits nuevos en el historial |
| 2 | Limpiar el historial con rebase interactivo | `git rebase -i HEAD~3`, y en el editor cambia los dos últimos de `pick` a `squash`, ajustando el mensaje final | Combina los tres commits en uno solo, con un mensaje descriptivo único | El historial ahora muestra un único commit coherente en vez de tres |
| 3 | Crear dos ramas que modifiquen la misma línea de un archivo | Crea `rama-a` y `rama-b` desde el mismo punto, y en cada una modifica la misma línea de un archivo de forma distinta | Prepara un conflicto de fusión intencional | Ambas ramas tienen commits que modifican la misma línea |
| 4 | Fusionar y provocar el conflicto | Desde `main`, ejecuta `git merge rama-a` (sin conflicto), y luego `git merge rama-b` | El segundo merge debería fallar por conflicto en la línea modificada por ambas ramas | Git reporta `CONFLICT (content)` y marca el archivo como sin fusionar |
| 5 | Resolver el conflicto manualmente | Edita el archivo para elegir (o combinar) el contenido correcto entre las marcas `<<<<<<<`/`=======`/`>>>>>>>`, luego `git add <archivo>` y `git commit` | Completa la fusión con la resolución elegida | El commit de merge se crea exitosamente, sin marcas de conflicto restantes en el archivo |
| 6 | Introducir un bug intencional en un commit intermedio | Sobre una rama de prueba con al menos 5-6 commits, introduce un bug obvio (por ejemplo, invertir una condición) en uno de los commits intermedios, y sigue añadiendo commits normales después | Prepara el escenario para practicar `bisect` | El bug está presente desde ese commit en adelante, sin que sea obvio en cuál exactamente |
| 7 | Usar bisect para encontrar el commit exacto | `git bisect start`, `git bisect bad` (en el commit actual), `git bisect good <commit-inicial-sin-el-bug>`, y en cada punto medio verifica manualmente si el bug está presente, marcando `git bisect good` o `git bisect bad` | Converge mediante búsqueda binaria en el commit exacto que introdujo el bug | Git reporta el hash exacto del commit responsable |
| 8 | Terminar la sesión de bisect | `git bisect reset` | Vuelve tu repositorio al estado (rama y commit) en que estaba antes de iniciar `bisect` | El repositorio vuelve a la rama original |

**Verificación:** el laboratorio se considera exitoso si el paso 2 deja un único commit limpio en vez de tres, si el conflicto del paso 4 se resuelve correctamente sin dejar marcas de conflicto en el archivo final, y si `git bisect` en el paso 7 identifica exactamente el commit donde introdujiste el bug intencional, no uno anterior ni posterior.

**Errores comunes y soluciones**

- **El editor de `rebase -i` no se abre, o se cierra sin aplicar cambios.** Verifica tu editor configurado con `git config --get core.editor`; si usas un editor de terminal como Vim por primera vez, recuerda que debes guardar y salir explícitamente (`:wq` en Vim) para que el rebase continúe.
- **Aparecen marcas `<<<<<<<`/`=======`/`>>>>>>>` en el archivo tras resolver un conflicto y olvidas eliminarlas antes de confirmar.** Revisa cuidadosamente el archivo completo antes de `git add`; dejar estas marcas produce un archivo con sintaxis rota, no un error de Git en sí mismo (Git no puede detectar automáticamente si "olvidaste" limpiar las marcas).
- **`git bisect` converge en un commit que no tiene sentido como causa del bug.** Verifica que estás probando correctamente el bug en cada punto medio antes de marcarlo `good`/`bad`; un error de marcado en cualquier paso intermedio hace que la búsqueda binaria converja en un commit incorrecto.
- **Reescribiste con rebase una rama que un compañero ya había clonado, y ahora aparecen conflictos extraños al sincronizar.** Esto es exactamente el riesgo descrito en el Tema 2; la solución más simple es coordinar con el equipo, y que quien clonó la versión antigua vuelva a clonar la rama reescrita desde cero, en vez de intentar reconciliar manualmente ambos historiales divergentes.

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

- CNCF, documentación oficial de Kubernetes, Prometheus y OpenTelemetry.
- HashiCorp, *Terraform Documentation*.
- Beyer et al., *Site Reliability Engineering*; Forsgren et al., *Accelerate*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- Trunk-based development favorece integración frecuente con CI maduro y feature flags; GitFlow da más estructura formal para releases programados o regulados.
- El rebase interactivo limpia el historial reaplicando commits, pero nunca debe usarse sobre ramas que otros ya tienen clonadas o fusionadas.
- `git bisect` usa búsqueda binaria para encontrar el commit exacto que introdujo una regresión, mucho más rápido que revisar commits uno por uno.
- Los hooks de Git dan validación local rápida pero opcional; la validación obligatoria para todo el equipo debe vivir en CI.
- Monorepos facilitan cambios atómicos entre paquetes relacionados; los polyrepos dan límites de ownership más claros.
- `revert` es seguro sobre ramas compartidas porque no reescribe historial; `reset` sí lo reescribe y puede causar divergencia si se usa sobre una rama ya compartida.
- `git reflog` es la red de seguridad para recuperarte de operaciones destructivas accidentales.

**Conceptos aprendidos**

- Trunk-based development vs GitFlow y cuándo elegir cada uno.
- Rebase interactivo, sus comandos (`pick`/`squash`/`reword`/`drop`) y su riesgo sobre historial compartido.
- `git bisect` como herramienta de búsqueda binaria de regresiones.
- Hooks de Git y commits firmados.
- Monorepos vs polyrepos.
- `cherry-pick`, `stash`, `reset` vs `revert`.
- `reflog`, `worktree` y `submodule`.

**Próximos pasos**

En el Módulo 2 vas a empaquetar aplicaciones en imágenes Docker reproducibles, aplicando buenas prácticas de multi-stage builds y gestión de capas para minimizar el tamaño final de imagen.

**Recursos adicionales**

- Documentación oficial de Git: referencia completa de `rebase`, `bisect`, `reflog`, `worktree` y `submodule`.
- Guía oficial de GitHub sobre commits firmados con GPG y SSH.
- Comparativas publicadas por la comunidad sobre trunk-based development frente a GitFlow, incluyendo el material original que popularizó cada modelo.
