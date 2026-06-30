## @ConfigurationProperties tipado

```java
@ConfigurationProperties("app.jwt")
@Validated
public record JwtConfig(
    @NotBlank String secreto,
    @Min(60) long expiracionSegundos
) {}
```

```yaml
app:
  jwt:
    secreto: ${JWT_SECRET}
    expiracion-segundos: 900
```

A diferencia de `@Value("${app.jwt.secreto}")` disperso por el código, `@ConfigurationProperties` agrupa configuración relacionada en un solo tipo, con autocompletado del IDE y validación centralizada.

## Falla rápido al arrancar

Con `@Validated`, si falta `app.jwt.secreto` en la configuración, la aplicación **no arranca** — falla inmediatamente con un mensaje claro, en vez de fallar silenciosamente más tarde cuando algún código intente usar un valor `null` en producción.

## Manejo global de excepciones

Ya cubierto en el módulo 2 con `@RestControllerAdvice` — la misma estrategia se extiende para mapear cualquier excepción de negocio a una respuesta HTTP consistente, en un solo lugar del código.
