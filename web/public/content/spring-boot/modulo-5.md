# Módulo 5: Configuración, perfiles y manejo de errores


## Aprende construyendo

### Tema 1: @ConfigurationProperties tipado

#### Paso 1 · Objetivo y preparación
Al finalizar podrás configurar este comportamiento desde cero. Prerrequisitos: JDK 21, Maven y un editor.

#### Paso 2 · Contexto y caso real
En un caso real, una API de entregas cambia URLs, límites y credenciales entre local, pruebas y producción sin recompilar el dominio.

#### Paso 3 · Teoría, modelo mental y analogía
La configuración externa debe validarse al iniciar y exponerse mediante tipos, no leerse con strings dispersos. Fallar rápido evita aceptar un proceso que luego no puede operar. Las excepciones globales deben mantener el mismo contrato en cada entorno. La analogía es revisar el manifiesto antes de salir del almacén: una caja sin dirección detiene la salida, no se descubre en carretera.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-spring-m5
cd ejemplo-spring-m5
curl -fsSL https://start.spring.io/starter.zip -d dependencies=web,actuator -d javaVersion=21 -o app.zip
unzip app.zip
mvn test
```
Crea src/main/java/com/example/demo/AppProperties.java con ConfigurationProperties y una restricción de validación; crea application.yml con un valor obligatorio.

#### Paso 5 · Práctica guiada
Pista: ejecuta mvn spring-boot:run sin la propiedad para provocar un fallo deliberado de arranque; lee el diagnóstico y corrígela. Resultado esperado: el contexto inicia y health responde 200.

#### Paso 6 · Práctica independiente
Define perfiles local y prod, una excepción de dominio y una respuesta Problem Details idéntica en ambos perfiles; prueba una configuración inválida.

#### Paso 7 · Cierre y evidencia
Guarda logs, configuración de ejemplo sin secretos y respuesta; como siguiente paso añade un chequeo de configuración en CI. Errores comunes: incluir secretos en Git, valores por defecto inseguros, capturar excepciones sin trazabilidad y diferencias entre perfiles. Fuentes oficiales: https://docs.spring.io/spring-boot/reference/features/external-config.html y https://docs.spring.io/spring-boot/reference/actuator/index.html.
**¿Por qué es importante?** Porque una aplicación que inicia con configuración inválida falla tarde y de forma costosa.
**Evidencia de aprendizaje:** entrega el log de fallo, la corrección y una respuesta de health.
**Conceptos clave:** agrupación de configuración relacionada, frente a `@Value` disperso.

`@ConfigurationProperties("app.jwt") @Validated public record JwtConfig(@NotBlank String secreto, @Min(60) long expiracionSegundos) {}` mapea un grupo completo de configuración relacionada (todo lo bajo el prefijo `app.jwt` en `application.yml`) hacia un único tipo fuertemente tipado, en vez de leer cada valor individual disperso con `@Value("${app.jwt.secreto}")` repetido en cada clase que necesita alguno de esos valores: esta agrupación centralizada ofrece autocompletado del IDE sobre la estructura completa de esa configuración, verificación de tipos en tiempo de compilación (un valor numérico mal configurado como texto se detecta al mapear, no en tiempo de ejecución al intentar usarlo), y validación centralizada de todo el grupo relacionado en un único lugar.

Usar `@Value` disperso por distintas clases del código, en cambio, disemina el conocimiento de qué claves de configuración existen y qué forma tienen a través de múltiples archivos no relacionados entre sí, dificultando tener una visión centralizada y completa de toda la configuración relacionada con un aspecto específico de la aplicación (como la configuración de JWT completa), y perdiendo la oportunidad de aplicar validación agrupada sobre ese conjunto relacionado de valores.

**Analogía:** `@ConfigurationProperties` es como un formulario estructurado y tipado con una sección dedicada y completa para cada tema relacionado (todo lo referente a JWT en un único lugar); `@Value` disperso es como anotar valores sueltos en notas adhesivas distribuidas por distintas partes de una oficina, sin ninguna vista centralizada de qué información relacionada existe en su conjunto.

**¿Por qué es importante?** `@ConfigurationProperties` agrupa configuración relacionada en un único tipo fuertemente tipado, con autocompletado y validación centralizada, frente a la dispersión y falta de estructura de `@Value` repartido por el código.

**Código del ejemplo:**

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

### Tema 2: Fallar rápido al arranque

#### Paso 1 · Objetivo y preparación
Al finalizar podrás configurar este comportamiento desde cero. Prerrequisitos: JDK 21, Maven y un editor.

#### Paso 2 · Contexto y caso real
En un caso real, una API de entregas cambia URLs, límites y credenciales entre local, pruebas y producción sin recompilar el dominio.

#### Paso 3 · Teoría, modelo mental y analogía
La configuración externa debe validarse al iniciar y exponerse mediante tipos, no leerse con strings dispersos. Fallar rápido evita aceptar un proceso que luego no puede operar. Las excepciones globales deben mantener el mismo contrato en cada entorno. La analogía es revisar el manifiesto antes de salir del almacén: una caja sin dirección detiene la salida, no se descubre en carretera.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-spring-m5
cd ejemplo-spring-m5
curl -fsSL https://start.spring.io/starter.zip -d dependencies=web,actuator -d javaVersion=21 -o app.zip
unzip app.zip
mvn test
```
Crea src/main/java/com/example/demo/AppProperties.java con ConfigurationProperties y una restricción de validación; crea application.yml con un valor obligatorio.

#### Paso 5 · Práctica guiada
Pista: ejecuta mvn spring-boot:run sin la propiedad para provocar un fallo deliberado de arranque; lee el diagnóstico y corrígela. Resultado esperado: el contexto inicia y health responde 200.

#### Paso 6 · Práctica independiente
Define perfiles local y prod, una excepción de dominio y una respuesta Problem Details idéntica en ambos perfiles; prueba una configuración inválida.

#### Paso 7 · Cierre y evidencia
Guarda logs, configuración de ejemplo sin secretos y respuesta; como siguiente paso añade un chequeo de configuración en CI. Errores comunes: incluir secretos en Git, valores por defecto inseguros, capturar excepciones sin trazabilidad y diferencias entre perfiles. Fuentes oficiales: https://docs.spring.io/spring-boot/reference/features/external-config.html y https://docs.spring.io/spring-boot/reference/actuator/index.html.
**¿Por qué es importante?** Porque una aplicación que inicia con configuración inválida falla tarde y de forma costosa.
**Evidencia de aprendizaje:** entrega el log de fallo, la corrección y una respuesta de health.
**Conceptos clave:** validación temprana, evitar fallas silenciosas tardías en producción.

Con `@Validated` aplicado a una clase de `@ConfigurationProperties`, si falta un valor obligatorio (como `app.jwt.secreto` en el ejemplo del Tema 1, marcado `@NotBlank`), la aplicación no arranca en absoluto: falla inmediatamente durante el proceso de arranque con un mensaje de error claro y específico indicando exactamente qué valor de configuración falta o es inválido, en vez de arrancar aparentemente con éxito y fallar mucho más tarde, potencialmente ya en producción y bajo tráfico real, cuando algún código intente efectivamente usar ese valor faltante (que en ese punto sería `null` o un valor por defecto inesperado), produciendo un error considerablemente más difícil de diagnosticar porque ocurre en un momento y contexto completamente distinto de donde realmente se originó el problema (la configuración faltante desde el inicio).

Este principio de "fallar rápido" (fail-fast) prioriza detectar problemas de configuración en el momento más temprano y controlado posible (el arranque de la aplicación, típicamente supervisado activamente durante un despliegue) en vez de dejar que se manifiesten más tarde de forma impredecible durante la operación normal en producción, donde el impacto de un fallo es considerablemente mayor y su diagnóstico más costoso.

**Analogía:** fallar rápido al arranque es como que un avión rechace despegar si detecta durante la revisión previa en tierra que le falta un componente esencial, en vez de descubrir esa falta a mitad de vuelo, un momento donde el problema es considerablemente más peligroso y difícil de resolver que durante la revisión previa controlada en tierra.

**¿Por qué es importante?** Fallar al arranque por configuración inválida detecta el problema en el momento más temprano y controlado posible, evitando que se manifieste de forma impredecible y más costosa de diagnosticar durante la operación real en producción.

**Diagrama:**

```
Sin @Validated: falta app.jwt.secreto → app arranca "bien" → falla más tarde en producción (NullPointerException)
Con @Validated: falta app.jwt.secreto → app NO arranca → error claro inmediato, en el momento del despliegue
```

### Tema 3: Manejo global de excepciones consistente entre entornos

#### Paso 1 · Objetivo y preparación
Al finalizar podrás configurar este comportamiento desde cero. Prerrequisitos: JDK 21, Maven y un editor.

#### Paso 2 · Contexto y caso real
En un caso real, una API de entregas cambia URLs, límites y credenciales entre local, pruebas y producción sin recompilar el dominio.

#### Paso 3 · Teoría, modelo mental y analogía
La configuración externa debe validarse al iniciar y exponerse mediante tipos, no leerse con strings dispersos. Fallar rápido evita aceptar un proceso que luego no puede operar. Las excepciones globales deben mantener el mismo contrato en cada entorno. La analogía es revisar el manifiesto antes de salir del almacén: una caja sin dirección detiene la salida, no se descubre en carretera.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-spring-m5
cd ejemplo-spring-m5
curl -fsSL https://start.spring.io/starter.zip -d dependencies=web,actuator -d javaVersion=21 -o app.zip
unzip app.zip
mvn test
```
Crea src/main/java/com/example/demo/AppProperties.java con ConfigurationProperties y una restricción de validación; crea application.yml con un valor obligatorio.

#### Paso 5 · Práctica guiada
Pista: ejecuta mvn spring-boot:run sin la propiedad para provocar un fallo deliberado de arranque; lee el diagnóstico y corrígela. Resultado esperado: el contexto inicia y health responde 200.

#### Paso 6 · Práctica independiente
Define perfiles local y prod, una excepción de dominio y una respuesta Problem Details idéntica en ambos perfiles; prueba una configuración inválida.

#### Paso 7 · Cierre y evidencia
Guarda logs, configuración de ejemplo sin secretos y respuesta; como siguiente paso añade un chequeo de configuración en CI. Errores comunes: incluir secretos en Git, valores por defecto inseguros, capturar excepciones sin trazabilidad y diferencias entre perfiles. Fuentes oficiales: https://docs.spring.io/spring-boot/reference/features/external-config.html y https://docs.spring.io/spring-boot/reference/actuator/index.html.
**¿Por qué es importante?** Porque una aplicación que inicia con configuración inválida falla tarde y de forma costosa.
**Evidencia de aprendizaje:** entrega el log de fallo, la corrección y una respuesta de health.
**Conceptos clave:** el mismo `@ControllerAdvice` extendido, formato uniforme sin importar el entorno.

El manejo global de excepciones, ya cubierto en el Módulo 2 con `@RestControllerAdvice`, se extiende naturalmente para mapear cualquier excepción de negocio adicional que surja durante el desarrollo continuo de la aplicación hacia una respuesta HTTP consistente, en un único lugar centralizado del código, garantizando que el formato de error permanezca exactamente el mismo sin importar en qué entorno específico (desarrollo, pruebas, producción) se ejecute la aplicación, ni qué endpoint particular haya originado el error.

Combinar esta centralización del manejo de errores con la configuración tipada y validada del Tema 1 produce una aplicación considerablemente más robusta en su conjunto: los problemas de configuración se detectan tempranamente al arranque (Tema 2), y los errores que sí ocurren durante la operación normal se comunican de forma consistente y predecible hacia los consumidores de la API (Módulo 2), reduciendo significativamente la superficie de comportamiento sorpresivo o inconsistente entre distintos entornos o distintos puntos del código de la aplicación.

**Analogía:** extender el manejo global de excepciones es como ampliar el mismo protocolo unificado de atención de incidencias de una empresa para cubrir cada nuevo tipo de incidencia que surge con el tiempo, en vez de crear un protocolo distinto y potencialmente inconsistente para cada nuevo tipo de problema que aparece.

**¿Por qué es importante?** Extender el mismo mecanismo centralizado de manejo de errores para cada nueva excepción de negocio mantiene un formato de respuesta consistente en toda la aplicación, sin importar el entorno ni el endpoint específico donde ocurra el error.

**Diagrama:**

```
Mismo @RestControllerAdvice (Módulo 2) → mapea cada nueva excepción de negocio →
formato de error consistente, sin importar el entorno (dev/test/prod)
```

---


## Laboratorio práctico

**Objetivo del laboratorio:** configurar propiedades tipadas y validadas al arranque, sin valores hardcodeados.

**Requisitos previos:** Módulos 0-4 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Crear una clase `@ConfigurationProperties` | Ver Tema 1 | Con valores tipados desde `application.yml` |
| 2 | Agregar `@Validated` | Ver Tema 2 | Falla al arranque si falta un valor obligatorio |
| 3 | Provocar la falla intencionalmente | Ver Tema 2 | Borra un valor requerido y observa el error |
| 4 | Centralizar una excepción de negocio adicional | Ver Tema 3 | Mismo formato JSON de error consistente |

**Verificación:** el laboratorio se considera exitoso si borrar un valor de configuración obligatorio impide que la aplicación arranque, con un mensaje de error claro señalando exactamente qué falta, y si todos los errores de negocio devuelven el mismo formato JSON consistente.

**Errores comunes y soluciones**

- **Usar `@Value` disperso en vez de `@ConfigurationProperties` agrupado.** Agrupa configuración relacionada en un único tipo tipado.
- **Omitir `@Validated` en la clase de configuración.** Sin ella, un valor faltante puede pasar desapercibido hasta usarse en producción.
- **Crear un nuevo `@ControllerAdvice` separado para cada nueva excepción.** Extiende el mismo `@ControllerAdvice` centralizado existente.

---
