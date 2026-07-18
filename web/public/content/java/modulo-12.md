# Módulo 12: Buenas prácticas y patrones de diseño

## Sílabo

**Objetivo general**

Aplicar patrones de diseño clásicos (Builder, Factory, Strategy) con criterio en código Java moderno e idiomático, junto con principios SOLID, reconociendo también cuándo NO aplicar un patrón.

**Objetivos específicos**

1. Implementar el patrón Builder para objetos con muchos campos opcionales.
2. Implementar una Factory que devuelva distintas implementaciones según un parámetro.
3. Implementar Strategy para intercambiar algoritmos sin modificar el código que los usa.
4. Aplicar el principio de responsabilidad única refactorizando una clase que lo viola.
5. Reconocer cuándo aplicar un patrón sería sobre-ingeniería.

**Contenido**

- Builder, Factory, Strategy.
- Inyección de dependencias manual.
- Principios SOLID aplicados.
- Cuándo NO aplicar un patrón.

**Evaluación**

Refactor de un módulo propio aplicando al menos dos patrones de diseño justificados, más tres ejercicios de evaluación.

---

## Comienza desde cero: prepara este capítulo

Este recorrido parte de una carpeta vacía. Al finalizar tendrás **Refactor de un módulo propio aplicando al menos dos patrones de diseño justificados, más tres ejercicios de evaluación.** No avances ejecutando comandos que no comprendes: primero identifica la entrada, la transformación y la evidencia que comprobará el resultado.

### 1. Comprueba las herramientas

Los comandos funcionan en macOS, Linux y WSL. En PowerShell usa el equivalente indicado por la herramienta.

```bash
java --version
javac --version
git --version
```

Si un comando no existe, detente e instala esa herramienta desde su sitio oficial. Cierra y abre la terminal después de modificar `PATH`. Las versiones deben ser compatibles entre sí antes de crear archivos.

### 2. Crea o recupera el proyecto del track

```bash
mkdir -p academia-labs/java/src/{main,test}/java/academy
cd academia-labs/java
git init
```

Trabaja dentro de `academia-labs/java`. Si ya existe, no lo vuelvas a generar: entra en la carpeta, confirma `git status` y continúa sobre una rama propia.

### 3. Ubica cada tema antes de escribir

```text
academia-labs/java/
├─ src/main/java/academy/
│  └─ module-12/
├─ tests/
├─ docs/decisions/
├─ evidence/module-12/
└─ README.md
```

| Tema | Archivo o decisión | Evidencia mínima |
|---|---|---|
| 1. Builder — constructores con muchos parámetros opcionales | `src/main/java/academy/module-12/topic-1-builder-constructores-con-muchos-parametros-opcionales.java` | prueba + salida observable |
| 2. Factory y Strategy | `src/main/java/academy/module-12/topic-2-factory-y-strategy.java` | prueba + salida observable |
| 3. SOLID y cuándo NO aplicar un patrón | `src/main/java/academy/module-12/topic-3-solid-y-cuando-no-aplicar-un-patron.java` | prueba + salida observable |

Un ejemplo técnico vive en el archivo indicado y debe tener una prueba. Un tema conceptual vive en `docs/decisions/`: compara opciones usando restricciones medibles; no escribas código decorativo solo para llenar espacio.

### 4. Ejecuta una línea base

Desde `academia-labs/java`:

```bash
./gradlew test  # Windows: .\gradlew.bat test
```

**Resultado esperado:** el comando reconoce el proyecto y termina sin errores antes de introducir el cambio del capítulo. Después del incremento, la evidencia debe demostrar: **Refactor de un módulo propio aplicando al menos dos patrones de diseño justificados, más tres ejercicios de evaluación.**

Si falla la línea base, no continúes. Localiza el primer mensaje que indique archivo, línea o dependencia; formula una causa y compruébala con un cambio pequeño.

### 5. Provoca un fallo y recupérate

Viola una precondición o usa un valor frontera; la prueba debe expresar la regla incumplida. Guarda en `evidence/module-12/` el comando, la salida relevante, tu hipótesis y la corrección. Revierte únicamente el cambio deliberado; no borres todo el proyecto para ocultar la causa.

### 6. Conecta el capítulo con RutaFlow

Aplica el aprendizaje de **Buenas prácticas y patrones de diseño** a un incremento vertical de RutaFlow. Define qué componente produce el dato, qué contrato lo transporta, quién lo consume y cómo observarás un fallo. La entrega final incluye archivo o decisión, prueba, salida, error corregido y una limitación que todavía validarías en producción.

---

## Contenido teórico

### Tema 1: Builder — constructores con muchos parámetros opcionales

**Conceptos clave:** encadenamiento fluido, evitar confusión de orden de argumentos.

Un constructor con muchos parámetros, varios de ellos opcionales (`new Pedido("Ana", "Laptop", 2, null, true, false, 15.5, ...)`), es propenso a errores de uso: es fácil confundir el orden de los argumentos posicionales, especialmente cuando varios comparten el mismo tipo (¿cuál booleano corresponde a qué opción específica?), y no queda ninguna indicación clara en el sitio de la llamada de qué representa cada valor individual sin consultar constantemente la firma del constructor. El patrón Builder (`Pedido pedido = Pedido.builder().cliente("Ana").producto("Laptop").cantidad(2).build();`) resuelve este problema encadenando llamadas a métodos con nombres descriptivos, uno por cada campo que se desea establecer, en el orden que resulte más natural para quien construye el objeto, omitiendo directamente cualquier campo opcional que no aplique en ese caso específico, sin necesidad de pasar `null` o valores por defecto explícitos como marcadores de posición para cada campo omitido.

Esta legibilidad mejorada es particularmente valiosa cuando el número de campos es considerable y muchos son genuinamente opcionales, dado que el código resultante en el sitio de la llamada se vuelve autoexplicativo (`.cliente("Ana").producto("Laptop")` deja claro exactamente qué representa cada valor, sin ambigüedad posicional), a diferencia de un constructor tradicional con muchos parámetros posicionales, donde esa claridad depende completamente de que quien lee el código recuerde o consulte constantemente el orden exacto de la firma.

**Analogía:** un constructor con muchos parámetros posicionales es como llenar un formulario sin ninguna etiqueta en sus casillas, donde el orden exacto de llenado importa críticamente y es fácil confundir una casilla con otra; un Builder es como un formulario con cada campo claramente etiquetado por su nombre, donde simplemente se completan las casillas relevantes en cualquier orden natural, dejando en blanco las que no aplican, sin riesgo de confusión.

**¿Por qué es importante?** El patrón Builder evita la confusión de orden de argumentos posicionales de un constructor con muchos parámetros, especialmente cuando varios son opcionales o comparten el mismo tipo.

**Código del ejemplo:**

```java
Pedido pedido = Pedido.builder()
    .cliente("Ana")
    .producto("Laptop")
    .cantidad(2)
    .build();
```

### Tema 2: Factory y Strategy

**Conceptos clave:** creación centralizada según un criterio, algoritmos intercambiables sin modificar el código consumidor.

Una Factory centraliza la lógica de decidir qué implementación concreta de una interfaz crear según cierto criterio (`NotificadorFactory.crear("email")` devolviendo un `EmailNotificador`, o `NotificadorFactory.crear("sms")` devolviendo un `SmsNotificador`, ambos implementando la misma interfaz `Notificador`), centralizando esa lógica de decisión en un único lugar en vez de dispersarla en cada punto del código que necesita crear una de esas implementaciones, facilitando además agregar un nuevo tipo de notificador en el futuro modificando únicamente la Factory, sin tocar el código que consume las notificaciones ya creadas.

Strategy encapsula un algoritmo intercambiable detrás de una interfaz común (`interface CalculadoraDescuento { double calcular(double precio); }`, con implementaciones concretas como `DescuentoNavidad`), permitiendo que el código que usa esa estrategia (`double precioFinal = estrategia.calcular(precioOriginal);`) permanezca completamente ajeno a cuál implementación específica de descuento está actualmente activa, delegando esa decisión a quien configura o inyecta la estrategia concreta a usar en cada contexto, sin que el código consumidor necesite ninguna lógica condicional propia (`if`/`switch`) para decidir qué algoritmo aplicar en cada caso.

**Analogía:** una Factory es como un departamento de compras centralizado que decide, según el tipo de pedido, a qué proveedor específico contactar, sin que cada departamento de la empresa que necesita un producto tenga que conocer y decidir individualmente entre todos los proveedores posibles; Strategy es como intercambiar el motor de un vehículo modular sin que el resto del vehículo necesite saber ni importarle cuál motor específico está instalado en cada momento, mientras cumpla con la misma interfaz de conexión esperada.

**¿Por qué es importante?** Factory centraliza la lógica de creación según un criterio, facilitando agregar nuevas implementaciones sin tocar el código consumidor; Strategy permite intercambiar algoritmos completos sin que el código que los usa necesite lógica condicional propia para elegir entre ellos.

**Código del ejemplo:**

```java
interface Notificador { void enviar(String mensaje); }
class NotificadorFactory {
    static Notificador crear(String tipo) {
        return switch (tipo) {
            case "email" -> new EmailNotificador();
            case "sms" -> new SmsNotificador();
            default -> throw new IllegalArgumentException("Tipo desconocido");
        };
    }
}

interface CalculadoraDescuento { double calcular(double precio); }
class DescuentoNavidad implements CalculadoraDescuento {
    public double calcular(double precio) { return precio * 0.8; }
}
double precioFinal = estrategia.calcular(precioOriginal); // no sabe (ni le importa) cuál estrategia está activa
```

### Tema 3: SOLID y cuándo NO aplicar un patrón

**Conceptos clave:** responsabilidad única, sobre-ingeniería evitable.

El principio de responsabilidad única (la "S" de SOLID) es, en la práctica, el más fácil de violar sin notarlo gradualmente con el tiempo: una clase `Pedido` que originalmente solo modelaba los datos de un pedido, pero que con el tiempo acumuló también la lógica de enviar emails de confirmación y de generar PDFs de factura, tiene en realidad tres razones distintas y no relacionadas para cambiar (un cambio en el modelo de datos del pedido, un cambio en cómo se envían emails, un cambio en cómo se generan PDFs), cada una debería justificar modificar una clase distinta y separada (`Pedido`, `EmailService`, `PdfGenerator`), en vez de acumularse todas en la misma clase original, que termina acoplando responsabilidades sin relación real entre sí.

Reconocer cuándo NO aplicar un patrón de diseño es una habilidad igualmente importante que saber aplicarlos: si una Factory solo tiene un único caso posible (un `if` con una única rama, sin ninguna perspectiva realista de que se agregue una segunda implementación alguna vez), o si un Strategy nunca tendrá genuinamente una segunda implementación alternativa real en el futuro previsible, introducir ese patrón agrega una capa de indirección (una interfaz, una clase de Factory) sin ningún beneficio real a cambio, dado que no existe la variabilidad que esos patrones están diseñados específicamente para gestionar; en esos casos, código simple y directo, sin la indirección adicional, es preferible a una flexibilidad teórica que en la práctica nunca llega a usarse.

**Analogía:** una clase que viola la responsabilidad única es como una persona con tres trabajos completamente distintos y no relacionados entre sí, donde un cambio en las condiciones de cualquiera de los tres trabajos afecta inevitablemente a la misma persona, aunque los otros dos trabajos no tengan ninguna relación real con ese cambio específico; aplicar un patrón sin necesidad real es como instalar un sistema de intercambio modular elaborado para una pieza que nunca, en la práctica, necesitará intercambiarse por otra alternativa distinta.

**¿Por qué es importante?** Separar responsabilidades no relacionadas en clases distintas (principio de responsabilidad única) facilita el mantenimiento aislado de cada una; reconocer cuándo un patrón no aporta beneficio real evita la indirección innecesaria de una flexibilidad que nunca se usa en la práctica.

**Diagrama:**

```
Pedido (violando SRP): datos + envío de email + generación de PDF → 3 razones de cambio en 1 clase
Refactor: Pedido | EmailService | PdfGenerator → cada uno con 1 sola razón de cambio

Factory con un único caso, Strategy sin alternativa real → patrón innecesario, prefiere código directo
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

**Objetivo del laboratorio:** refactorizar un módulo propio aplicando al menos dos patrones de diseño justificados por una necesidad real.

**Requisitos previos:** Módulos 0-11 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Implementar Builder para un objeto con campos opcionales | Ver Tema 1 | Evita confusión de orden de argumentos |
| 2 | Implementar una Factory según un parámetro | Ver Tema 2 | Centraliza la lógica de creación |
| 3 | Implementar Strategy para un algoritmo intercambiable | Ver Tema 2 | Sin modificar el código consumidor |
| 4 | Refactorizar una clase que viola SRP | Ver Tema 3 | Separa sus responsabilidades distintas |
| 5 | Identificar un caso de sobre-ingeniería en tu propio código | Ver Tema 3 | Documenta por qué el patrón no aportaría valor ahí |

**Verificación:** el laboratorio se considera exitoso si los patrones aplicados resuelven un problema real y concreto del código (no solo se aplican por aplicar), y si el ejemplo de sobre-ingeniería identificado está correctamente justificado con una razón específica.

**Errores comunes y soluciones**

- **Aplicar un patrón sin una necesidad real detrás.** Verifica primero que existe genuina variabilidad o complejidad que el patrón resuelve.
- **Dejar una clase acumulando responsabilidades no relacionadas con el tiempo.** Revisa periódicamente si una clase tiene más de una razón real para cambiar.
- **Confundir Factory con Strategy.** Factory decide qué crear; Strategy encapsula un algoritmo intercambiable ya creado.

---

## Ejercicios de evaluación

### Ejercicio 1: Problema que resuelve Builder

**Enunciado:** ¿qué problema concreto resuelve el patrón Builder frente a un constructor con 8 parámetros?

**Solución esperada:** un constructor con muchos parámetros posicionales es propenso a confundir el orden de los argumentos, especialmente entre parámetros del mismo tipo, y no deja ninguna indicación clara en el sitio de la llamada de qué representa cada valor; Builder encadena métodos con nombres descriptivos por cada campo, haciendo el código autoexplicativo y permitiendo omitir directamente los campos opcionales sin marcadores de posición.

**Criterios de éxito:**
- Explica correctamente la confusión de orden posicional evitada y la claridad ganada con nombres descriptivos.

### Ejercicio 2: Reconocer cuándo no aplicar un patrón

**Enunciado:** ¿cómo reconoces cuándo NO aplicar un patrón de diseño?

**Solución esperada:** cuando no existe la variabilidad real que el patrón está diseñado para gestionar (una Factory con un único caso posible sin perspectiva de agregar otro, un Strategy sin ninguna alternativa real prevista), aplicar el patrón agrega una capa de indirección sin ningún beneficio real a cambio, siendo preferible código simple y directo en ese caso.

**Criterios de éxito:**
- Explica correctamente la ausencia de variabilidad real como el criterio para no aplicar un patrón.

### Ejercicio 3: Responsabilidad única en la práctica

**Enunciado:** identifica en un ejemplo propio una clase que viola el principio de responsabilidad única, y describe cómo la separarías.

**Solución esperada:** cualquier ejemplo razonable donde una clase acumule dos o más responsabilidades no relacionadas (por ejemplo, modelar datos y además enviar notificaciones), separadas en clases independientes, cada una con una única razón de cambio real.

**Criterios de éxito:**
- Identifica correctamente al menos dos responsabilidades no relacionadas en el ejemplo, y propone una separación coherente.

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

- Oracle, *Java Language Specification* y *Java Virtual Machine Specification*.
- OpenJDK, documentación de Java SE, JFR y JMH.
- Bloch, J., *Effective Java*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- Builder evita la confusión de orden de argumentos posicionales en constructores con muchos parámetros opcionales.
- Factory centraliza la lógica de creación según un criterio; Strategy encapsula algoritmos intercambiables sin lógica condicional en el consumidor.
- El principio de responsabilidad única es el más fácil de violar gradualmente, acumulando razones de cambio no relacionadas en una misma clase.
- Reconocer cuándo NO aplicar un patrón evita indirección innecesaria sin beneficio real.

**Conceptos aprendidos**

- Builder, Factory y Strategy.
- Principios SOLID aplicados, especialmente responsabilidad única.
- Criterios para reconocer sobre-ingeniería evitable.

**Próximos pasos**

En el Módulo 13, el proyecto integrador final, unirás POO, concurrencia, testing y build reproducible en una aplicación real.

**Recursos adicionales**

- "Design Patterns: Elements of Reusable Object-Oriented Software" (Gang of Four) como referencia clásica de patrones de diseño.
