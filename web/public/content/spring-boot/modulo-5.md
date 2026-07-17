# Módulo 5: Configuración, perfiles y manejo de errores

## Sílabo

**Objetivo general**

Externalizar configuración sensible con `@ConfigurationProperties` tipado, validarla al arranque, y mantener un manejo consistente de errores entre entornos.

**Objetivos específicos**

1. Mapear configuración tipada desde `application.yml` con `@ConfigurationProperties`.
2. Validar configuración al arranque con `@Validated`.
3. Provocar y entender el fallo de arranque por configuración inválida.
4. Centralizar el manejo de una excepción de negocio para un formato de error consistente.

**Contenido**

- `@ConfigurationProperties` tipado.
- Perfiles y configuración por entorno.
- Manejo global de excepciones.
- Validación de configuración al arranque.

**Evaluación**

Configuración tipada y validada al arranque, sin valores hardcodeados, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: @ConfigurationProperties tipado

**Conceptos clave:** agrupación de configuración relacionada, frente a `@Value` disperso.

`@ConfigurationProperties("app.jwt") @Validated public record JwtConfig(@NotBlank String secreto, @Min(60) long expiracionSegundos) {}` mapea un grupo completo de configuración relacionada (todo lo bajo el prefijo `app.jwt` en `application.yml`) hacia un único tipo fuertemente tipado, en vez de leer cada valor individual disperso con `@Value("${app.jwt.secreto}")` repetido en cada clase que necesita alguno de esos valores: esta agrupación centralizada ofrece autocompletado del IDE sobre la estructura completa de esa configuración, verificación de tipos en tiempo de compilación (un valor numérico mal configurado como texto se detecta al mapear, no en tiempo de ejecución al intentar usarlo), y validación centralizada de todo el grupo relacionado en un único lugar.

Usar `@Value` disperso por distintas clases del código, en cambio, disemina el conocimiento de qué claves de configuración existen y qué forma tienen a través de múltiples archivos no relacionados entre sí, dificultando tener una visión centralizada y completa de toda la configuración relacionada con un aspecto específico de la aplicación (como la configuración de JWT completa), y perdiendo la oportunidad de aplicar validación agrupada sobre ese conjunto relacionado de valores.

**Analogía:** `@ConfigurationProperties` es como un formulario estructurado y tipado con una sección dedicada y completa para cada tema relacionado (todo lo referente a JWT en un único lugar); `@Value` disperso es como anotar valores sueltos en notas adhesivas distribuidas por distintas partes de una oficina, sin ninguna vista centralizada de qué información relacionada existe en su conjunto.

**¿Por qué es importante?** `@ConfigurationProperties` agrupa configuración relacionada en un único tipo fuertemente tipado, con autocompletado y validación centralizada, frente a la dispersión y falta de estructura de `@Value` repartido por el código.

**Diagrama:**

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

## Ejercicios de evaluación

### Ejercicio 1: Por qué preferir @ConfigurationProperties tipado

**Enunciado:** ¿por qué preferir `@ConfigurationProperties` tipado sobre leer valores sueltos con `@Value`?

**Solución esperada:** `@ConfigurationProperties` agrupa configuración relacionada en un único tipo fuertemente tipado, con autocompletado del IDE, verificación de tipos en compilación, y validación centralizada de todo el grupo; `@Value` disperso disemina ese conocimiento a través de múltiples clases no relacionadas, sin esa estructura ni validación agrupada.

**Criterios de éxito:**
- Explica correctamente la agrupación, tipado y validación centralizada como ventajas frente a `@Value` disperso.

### Ejercicio 2: Ventaja de fallar al arranque

**Enunciado:** ¿qué ventaja da que la app falle al ARRANCAR por configuración inválida, en vez de fallar más tarde en producción?

**Solución esperada:** detecta el problema en el momento más temprano y controlado posible (el despliegue, típicamente supervisado activamente), con un mensaje de error claro y específico, en vez de manifestarse de forma impredecible y más difícil de diagnosticar durante la operación normal bajo tráfico real en producción.

**Criterios de éxito:**
- Explica correctamente la detección temprana y controlada como ventaja frente a la falla tardía e impredecible.

### Ejercicio 3: Consistencia del manejo de errores entre entornos

**Enunciado:** ¿por qué el formato de error debería ser idéntico sin importar el entorno (dev/test/prod) donde se ejecute la aplicación?

**Solución esperada:** un formato de error consistente entre entornos permite que los clientes de la API (y las pruebas automatizadas que verifican ese formato) confíen en un contrato predecible sin importar el entorno, evitando sorpresas o comportamiento inconsistente al promover código entre entornos distintos.

**Criterios de éxito:**
- Explica correctamente la previsibilidad del contrato de error entre entornos como la razón de esa consistencia.

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

- VMware/Broadcom, documentación de *Spring Framework* y *Spring Boot*.
- IETF, especificaciones HTTP y OAuth 2.0.
- OWASP Foundation, *Application Security Verification Standard*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- `@ConfigurationProperties` tipado agrupa configuración relacionada, con autocompletado y validación centralizada.
- `@Validated` en configuración hace que la aplicación falle al arranque ante valores inválidos o faltantes, en vez de fallar tarde en producción.
- El manejo global de excepciones se extiende consistentemente para cada nueva excepción de negocio, con el mismo formato en todos los entornos.

**Conceptos aprendidos**

- `@ConfigurationProperties` tipado.
- Validación de configuración al arranque.
- Manejo global de excepciones extendido.

**Próximos pasos**

En el Módulo 6 aprenderás testing en Spring Boot: `@SpringBootTest`, slices de testing, MockMvc, y Testcontainers.

**Recursos adicionales**

- Documentación oficial de Spring Boot (docs.spring.io/spring-boot): "Externalized Configuration" y "Type-safe Configuration Properties".
