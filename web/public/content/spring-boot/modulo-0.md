## Inversión de control

En vez de que una clase cree sus propias dependencias (`new RepositorioTareas()`), el contenedor de Spring las crea y las "inyecta" — la clase solo declara qué necesita, sin saber cómo se construye.

```java
@Service
public class ServicioTareas {
    private final RepositorioTareas repositorio;

    public ServicioTareas(RepositorioTareas repositorio) { // inyección por constructor
        this.repositorio = repositorio;
    }
}
```

## Por qué inyección por constructor

```java
// Evita: campo mutable, difícil de testear sin el contenedor de Spring
@Autowired
private RepositorioTareas repositorio;
```

Con inyección por constructor, el campo puede ser `final` (inmutable), y en un test unitario puedes simplemente hacer `new ServicioTareas(repositorioMockeado)` sin necesidad de levantar el contexto de Spring.

## Estereotipos: @Component, @Service, @Repository

Las tres son variantes de `@Component` (le dicen a Spring "gestiona esta clase como un bean"), con semántica adicional: `@Repository` traduce excepciones de persistencia a excepciones de Spring; `@Service` documenta intención (capa de lógica de negocio).

## Qué hace "Boot"

`spring-boot-starter-web` trae Tomcat embebido, Jackson para JSON, y Spring MVC — y los **autoconfigura** con valores sensatos por defecto, sin que escribas XML ni configuración manual extensa como en el Spring clásico.
