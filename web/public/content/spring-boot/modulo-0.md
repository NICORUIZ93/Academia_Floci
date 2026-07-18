# Módulo 0: Fundamentos de Spring — IoC y DI

## Sílabo

**Objetivo general**

Entender el contenedor de Spring como gestor del ciclo de vida de los objetos de la aplicación, dominando inversión de control, inyección de dependencias por constructor, y qué significa realmente la autoconfiguración de "Boot".

**Objetivos específicos**

1. Explicar qué problema resuelve la inversión de control.
2. Aplicar inyección por constructor y explicar por qué es preferible a la inyección por campo.
3. Diferenciar `@Component`, `@Service` y `@Repository`.
4. Explicar qué hace realmente la autoconfiguración de Spring Boot.
5. Usar `@Scope`, `@Qualifier` y `@Primary` apropiadamente.

**Contenido**

- Inversión de control y el contenedor de Spring.
- Inyección por constructor vs por campo.
- `@Component`, `@Service`, `@Repository`.
- Autoconfiguración: qué hace realmente "Boot".
- `@Scope`: singleton, prototype, request, session.
- `@Qualifier` y `@Primary` cuando hay varias implementaciones.

**Evaluación**

Aplicación Spring Boot mínima con dos beans inyectados por constructor, más tres ejercicios de evaluación.

---

## Antes de comenzar: del equipo vacío a Spring Boot

Completa primero los fundamentos del track Java o asegúrate de entender clases, interfaces, excepciones y colecciones. Instala **JDK 21**, Git y un editor: IntelliJ IDEA Community es la opción más sencilla para Spring; VS Code con Extension Pack for Java y Spring Boot Extension Pack también funciona.

- **Windows:** instala Eclipse Temurin JDK 21, Git e IntelliJ; verifica `java --version` y `javac --version` en PowerShell.
- **macOS:** usa `brew install --cask temurin` y `brew install git`; instala IntelliJ desde JetBrains Toolbox.
- **Ubuntu/Debian:** ejecuta `sudo apt install openjdk-21-jdk git`; descarga IntelliJ o usa SDKMAN.

No necesitas instalar Maven si el proyecto incluye `mvnw`/`mvnw.cmd`: ese *wrapper* descarga la versión correcta. En [start.spring.io](https://start.spring.io/) elige Java, Maven, Spring Boot estable, JDK 21 y la dependencia **Spring Web**. Descarga, descomprime y ejecuta:

```bash
# macOS/Linux
./mvnw spring-boot:run

# Windows PowerShell
.\mvnw.cmd spring-boot:run
```

Visita `http://localhost:8080`. Un 404 significa que el servidor sí arrancó pero aún no existe una ruta; “connection refused” significa que no arrancó. Lee siempre desde la primera línea `Caused by:` del error, no solo la última.

## Aprende construyendo

### Tema 1: Inversión de control y el contenedor de Spring

**Conceptos clave:** el framework crea y conecta objetos, no el propio código de la aplicación.

En código sin un contenedor de inversión de control, una clase que necesita colaboradores típicamente los crea ella misma directamente (`new RepositorioTareas()`), acoplándose fuertemente a una implementación concreta específica y haciendo que cambiar esa implementación, o sustituirla por una versión de prueba durante los tests, requiera modificar el código interno de la propia clase que la crea. La inversión de control invierte esa responsabilidad: en vez de que cada clase cree sus propias dependencias, un contenedor externo (el contenedor de Spring) las crea centralizadamente y las "inyecta" en cada clase que las declara como necesarias, de modo que la clase consumidora solo declara qué necesita (a través de su constructor, típicamente), sin saber ni importarle cómo esa dependencia concreta se construye ni de dónde proviene.

`@Service public class ServicioTareas { private final RepositorioTareas repositorio; public ServicioTareas(RepositorioTareas repositorio) { this.repositorio = repositorio; } }` declara que `ServicioTareas` necesita un `RepositorioTareas`, y el contenedor de Spring, al detectar esta clase como un bean gestionado, se encarga de encontrar (o crear) una instancia de `RepositorioTareas` y pasarla automáticamente al constructor en el momento de instanciar `ServicioTareas`, sin que ningún código de la aplicación tenga que escribir explícitamente esa conexión.

**Analogía:** sin inversión de control, cada empleado de una empresa tendría que fabricar personalmente cada herramienta que necesita para su trabajo; con inversión de control, un departamento central de suministros (el contenedor de Spring) entrega automáticamente a cada empleado exactamente las herramientas que declaró necesitar, sin que el empleado tenga que saber de dónde vienen ni cómo se fabricaron.

**¿Por qué es importante?** La inversión de control desacopla a cada clase de cómo se construyen sus dependencias, permitiendo sustituir implementaciones (por ejemplo, con mocks durante tests) sin modificar el código de la clase consumidora.

**Código del ejemplo:**

```java
@Service
public class ServicioTareas {
    private final RepositorioTareas repositorio;
    public ServicioTareas(RepositorioTareas repositorio) { // inyección por constructor
        this.repositorio = repositorio;
    }
}
```

### Tema 2: Inyección por constructor vs por campo

**Conceptos clave:** inmutabilidad, testabilidad sin el contenedor.

`@Autowired private RepositorioTareas repositorio;` (inyección por campo) es sintácticamente más corta, pero tiene desventajas concretas frente a la inyección por constructor: el campo no puede declararse `final`, permitiendo en teoría que se reasigne después de la construcción inicial (aunque en la práctica Spring solo lo asigna una vez, el propio lenguaje no impone esa garantía de inmutabilidad); y, más importante en la práctica diaria, escribir un test unitario de esa clase sin levantar el contenedor completo de Spring se vuelve más difícil, dado que no existe una forma directa de "pasarle" el mock al campo privado sin usar reflexión o alguna utilidad especial de testing.

Con inyección por constructor, el campo puede declararse `final` (garantizando inmutabilidad real, verificada por el compilador, no solo por convención), y en un test unitario basta con escribir directamente `new ServicioTareas(repositorioMockeado)`, pasando el mock explícitamente como argumento del constructor, sin ninguna necesidad de levantar el contenedor de Spring completo para esa prueba específica, haciendo la prueba considerablemente más rápida y simple de escribir.

**Analogía:** la inyección por campo es como recibir una herramienta a través de una ranura oculta después de que ya empezaste a trabajar, sin que quede completamente claro ni garantizado en qué momento exacto llegó ni si podría cambiar después; la inyección por constructor es como recibir todas las herramientas necesarias en tus manos directamente al comenzar tu turno de trabajo, con la garantía explícita de que las tienes desde el primer momento y de que no cambiarán después.

**¿Por qué es importante?** La inyección por constructor permite declarar dependencias como `final` (inmutabilidad real) y facilita escribir tests unitarios simples con `new` directo, sin necesidad de levantar el contenedor de Spring.

**Código del ejemplo:**

```java
// Evita: campo mutable, difícil de testear sin el contenedor de Spring
@Autowired
private RepositorioTareas repositorio;
```

### Tema 3: Estereotipos, autoconfiguración y scopes

**Conceptos clave:** `@Component`/`@Service`/`@Repository`, autoconfiguración de starters, ciclo de vida de un bean.

`@Component`, `@Service` y `@Repository` son todas variantes especializadas de la misma anotación base `@Component`, que le indica a Spring "gestiona esta clase como un bean dentro del contenedor"; la diferencia entre ellas es principalmente semántica y documental, con una excepción funcional concreta: `@Repository` traduce automáticamente excepciones específicas de la tecnología de persistencia subyacente (por ejemplo, excepciones específicas de JDBC) a una jerarquía de excepciones propia y consistente de Spring, independiente de la tecnología concreta usada por debajo; `@Service` no agrega ningún comportamiento funcional adicional respecto a `@Component`, pero documenta claramente la intención de que esa clase pertenece a la capa de lógica de negocio.

`spring-boot-starter-web`, al agregarse como dependencia, trae automáticamente un servidor Tomcat embebido, Jackson para serialización JSON, y Spring MVC, y crucialmente los autoconfigura con valores por defecto sensatos para el caso común, sin requerir la configuración XML extensa y manual que el Spring clásico (previo a Spring Boot) exigía — esta autoconfiguración inteligente basada en qué dependencias están presentes en el classpath es precisamente lo que "Boot" agrega sobre el Spring Framework original. `@Scope` controla el ciclo de vida de un bean: `singleton` (por defecto, una única instancia compartida por todo el contenedor), `prototype` (una nueva instancia cada vez que se solicita), `request`/`session` (una instancia por petición HTTP o por sesión de usuario, respectivamente, en aplicaciones web). `@Qualifier` y `@Primary` resuelven la ambigüedad cuando existen múltiples implementaciones candidatas de una misma interfaz: `@Primary` marca una implementación como la opción por defecto quando no se especifica otra cosa, mientras `@Qualifier("nombreEspecifico")` permite pedir explícitamente una implementación concreta distinta de la marcada como primaria.

**Analogía:** los estereotipos son como distintos uniformes de un mismo tipo de empleado (todos "gestionados" por la empresa), donde el uniforme de `@Repository` además incluye una traducción automática de idioma específica para comunicarse con sistemas externos de almacenamiento; la autoconfiguración es como recibir automáticamente el equipo estándar apropiado según qué departamento declaraste unirte, sin tener que solicitar cada pieza manualmente.

**¿Por qué es importante?** Entender que `@Service`/`@Repository` son variantes de `@Component` con semántica adicional (y en el caso de `@Repository`, traducción de excepciones) aclara su propósito real; la autoconfiguración de Boot es lo que elimina la configuración XML manual extensa del Spring clásico.

**Diagrama:**

```
@Component / @Service / @Repository: variantes de la misma anotación base, con semántica adicional
spring-boot-starter-web → Tomcat + Jackson + Spring MVC, autoconfigurados con valores sensatos
@Scope: singleton (por defecto) | prototype | request | session
```

---

## Ruta de proyecto progresivo desde carpeta vacía

No crees un proyecto desechable por módulo. Conserva un único repositorio que evoluciona durante todo el track y etiqueta cada hito (`git tag modulo-N`). Empieza con genera `academia-spring` en `start.spring.io`, descomprímelo en una carpeta vacía y ejecuta `git init`. Ejecuta el comando paso a paso, inspecciona los archivos generados y registra versiones y precondiciones en el README.

| Hito | Evolución acumulativa | Evidencia antes de avanzar |
|---|---|---|
| Base | API y configuración. | Arranque reproducible, commit limpio y prueba mínima. |
| Aplicación | datos, seguridad y mensajería. | Casos normales, límite y error automatizados. |
| Integración | Conecta capas y reemplaza dobles por infraestructura controlada. | Diagrama, contratos y prueba de integración. |
| Experto | contratos, observabilidad y resiliencia. | Perfil o threat model, telemetría y runbook de recuperación. |

Al iniciar cada laboratorio crea una rama `modulo-N`, implementa el incremento, verifica el criterio de éxito y fusiona solo con pruebas verdes. Si un módulo necesita un experimento aislado, colócalo en `experiments/modulo-N/`; el producto acumulativo permanece ejecutable. Al terminar, otra persona debe poder clonar el repositorio y reproducir el último hito siguiendo únicamente el README.

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

**Objetivo del laboratorio:** construir una aplicación Spring Boot mínima con dos beans inyectados por constructor.

**Requisitos previos:** conocimientos de Java (track de Java) recomendados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Crear un proyecto con start.spring.io y arrancarlo | `./mvnw spring-boot:run` | Verifica el arranque |
| 2 | Definir `@Service` y `@Repository` con inyección por constructor | Ver Tema 1 | Verifica la conexión automática |
| 3 | Cambiar a `@Autowired` por campo y comparar | Ver Tema 2 | Documenta la diferencia de testabilidad |
| 4 | Observar cuándo el contenedor instancia el bean | — | `println` en el constructor |
| 5 | Investigar qué autoconfigura `spring-boot-starter-web` | Ver Tema 3 | Documenta las dependencias que trae |

**Verificación:** el laboratorio se considera exitoso si el servicio y el repositorio se conectan correctamente por inyección de constructor, y si puedes explicar concretamente por qué esa forma facilita escribir un test unitario sin levantar el contenedor.

**Errores comunes y soluciones**

- **Usar inyección por campo por costumbre.** Prefiere inyección por constructor para inmutabilidad y testabilidad.
- **Confundir `@Service` con una anotación funcionalmente distinta de `@Component`.** Solo `@Repository` agrega comportamiento funcional adicional (traducción de excepciones).
- **No declarar `@Primary` ni `@Qualifier` con múltiples implementaciones.** Sin ninguno de los dos, Spring falla al arrancar por ambigüedad.

---



## Bibliografía y fundamento académico

Estas fuentes sustentan los conceptos y deben consultarse para verificar detalles que cambian entre versiones:

- VMware/Broadcom, documentación de *Spring Framework* y *Spring Boot*.
- IETF, especificaciones HTTP y OAuth 2.0.
- OWASP Foundation, *Application Security Verification Standard*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- La inversión de control delega la creación y conexión de dependencias al contenedor de Spring, desacoplando a cada clase de cómo se construyen sus colaboradores.
- La inyección por constructor permite inmutabilidad real y tests unitarios simples sin levantar el contenedor.
- `@Service`/`@Repository` son variantes de `@Component`, con `@Repository` agregando traducción de excepciones.
- La autoconfiguración de Boot elimina la configuración XML manual extensa del Spring clásico.

**Conceptos aprendidos**

- Inversión de control y el contenedor de Spring.
- Inyección por constructor vs por campo.
- Estereotipos de Spring y autoconfiguración.
- `@Scope`, `@Qualifier` y `@Primary`.

**Próximos pasos**

En el Módulo 1 aprenderás la estructura de proyecto de Spring Boot: Spring Initializr, `application.yml`, y perfiles por entorno.

**Recursos adicionales**

- Documentación oficial de Spring Framework (docs.spring.io/spring-framework) y Spring Boot (docs.spring.io/spring-boot).
- Ejemplos de código ejecutables de este track, en Java: carpeta [`examples/tracks/spring-boot/`](https://github.com/NICORUIZ93/Academia_Floci/tree/main/examples/tracks/spring-boot) del repositorio — `RestControllerExample.java` (Módulo 2), `JpaRepositoryExample.java` (Módulo 3), `SecurityConfig.java` (Módulo 4), `ActuatorMetrics.java` (Módulo 7), `WebFluxReactive.java` (Módulo 9).
