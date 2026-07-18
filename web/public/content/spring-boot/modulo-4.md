# Módulo 4: Spring Security

## Sílabo

**Objetivo general**

Proteger endpoints con autenticación y autorización declarativa usando la configuración moderna de Spring Security, JWT, y entender cuándo CORS y CSRF son relevantes.

**Objetivos específicos**

1. Configurar un `SecurityFilterChain` moderno sin `WebSecurityConfigurerAdapter`.
2. Implementar un filtro JWT que valide tokens en cada request.
3. Aplicar autorización basada en roles con `@PreAuthorize`.
4. Configurar CORS apropiadamente.
5. Explicar cuándo CSRF es relevante y por qué se deshabilita en APIs stateless con JWT.

**Contenido**

- `SecurityFilterChain` y configuración moderna.
- JWT con Spring Security.
- Autorización basada en roles/permisos.
- CORS y CSRF.
- Versionado de APIs.

**Evaluación**

API protegida con JWT y rutas con autorización por rol, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: SecurityFilterChain moderno

**Conceptos clave:** configuración declarativa vía `@Bean`, reglas de autorización por ruta.

La configuración moderna de Spring Security (reemplazando el patrón anterior basado en extender `WebSecurityConfigurerAdapter`, ahora deprecado) declara la cadena de filtros de seguridad directamente como un `@Bean`: `@Bean SecurityFilterChain filterChain(HttpSecurity http) throws Exception { return http.csrf(csrf -> csrf.disable()).authorizeHttpRequests(auth -> auth.requestMatchers("/public/**").permitAll().anyRequest().authenticated()).addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class).build(); }`, configurando de forma fluida y declarativa qué rutas requieren autenticación (`anyRequest().authenticated()`), cuáles están explícitamente permitidas sin autenticación (`requestMatchers("/public/**").permitAll()`), y en qué punto de la cadena se inserta el filtro JWT personalizado (Tema 2).

Este enfoque basado en `@Bean` en vez de heredar de una clase base específica de Spring Security refleja la migración general del framework hacia composición explícita mediante beans en vez de herencia de clases base configurables, un cambio de estilo consistente con la dirección general de Spring moderno de preferir configuración declarativa y componible sobre jerarquías de herencia rígidas para personalizar comportamiento del framework.

**Analogía:** el `SecurityFilterChain` es como una lista de control de acceso a la entrada de un edificio, especificando explícitamente qué áreas son de acceso público sin credencial, y cuáles requieren verificación de identidad antes de permitir el paso, con un guardia específico (el filtro JWT) posicionado en un punto concreto de la fila de verificación.

**¿Por qué es importante?** La configuración moderna vía `@Bean` reemplaza la herencia de `WebSecurityConfigurerAdapter`, declarando de forma fluida y explícita qué rutas requieren autenticación y en qué punto se insertan filtros personalizados.

**Código del ejemplo:**

```java
@Bean
SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    return http
        .csrf(csrf -> csrf.disable()) // API stateless con JWT: no usa sesiones basadas en cookies
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/public/**").permitAll()
            .anyRequest().authenticated())
        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
        .build();
}
```

### Tema 2: Filtro JWT y autorización por rol

**Conceptos clave:** validación de token en cada request, `SecurityContextHolder`, `@PreAuthorize`.

`public class JwtFilter extends OncePerRequestFilter { protected void doFilterInternal(...) { String token = extraerToken(req); if (token != null && jwtService.esValido(token)) { var auth = new UsernamePasswordAuthenticationToken(...); SecurityContextHolder.getContext().setAuthentication(auth); } chain.doFilter(req, res); } }` extiende `OncePerRequestFilter` (garantizando que se ejecute exactamente una vez por petición, sin duplicaciones en cadenas de filtros anidadas) para extraer y validar el token JWT del header `Authorization` en cada petición entrante, y, si es válido, establecer explícitamente la identidad autenticada correspondiente en el `SecurityContextHolder`, el mecanismo central de Spring Security que el resto del framework consulta para saber quién es el usuario actualmente autenticado durante el procesamiento de esa petición específica.

`@PreAuthorize("hasRole('ADMIN')")` sobre un método de controller verifica, antes de ejecutar ese método, que el usuario autenticado (establecido por el filtro JWT) tenga el rol requerido, devolviendo automáticamente un 403 (Forbidden) si no lo tiene, sin necesidad de escribir manualmente esa verificación condicional dentro del cuerpo del método — una forma declarativa de expresar reglas de autorización directamente sobre el método protegido, en vez de lógica imperativa de verificación repetida en cada endpoint que requiera cierto rol específico.

**Analogía:** el filtro JWT es como un control de identidad en la entrada que verifica las credenciales de cada visitante y le entrega una etiqueta visible con su identidad verificada; `@PreAuthorize` es como un letrero en la puerta de una sala específica que solo permite el paso a visitantes con cierta etiqueta particular, rechazando automáticamente a cualquiera sin ella sin que el personal de esa sala tenga que verificarlo manualmente cada vez.

**¿Por qué es importante?** El filtro JWT establece la identidad autenticada en cada petición mediante `SecurityContextHolder`; `@PreAuthorize` expresa reglas de autorización declarativamente sobre cada método protegido, sin lógica imperativa repetida.

**Código del ejemplo:**

```java
public class JwtFilter extends OncePerRequestFilter {
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) {
        String token = extraerToken(req);
        if (token != null && jwtService.esValido(token)) {
            var auth = new UsernamePasswordAuthenticationToken(jwtService.getUsuario(token), null, jwtService.getAuthorities(token));
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        chain.doFilter(req, res);
    }
}
@PreAuthorize("hasRole('ADMIN')")
@DeleteMapping("/{id}")
public void eliminar(@PathVariable Long id) { ... }
```

### Tema 3: CORS y CSRF

**Conceptos clave:** origen distinto del navegador, protección específica de sesiones basadas en cookies.

CORS (Cross-Origin Resource Sharing) controla qué orígenes (combinaciones de protocolo, dominio y puerto) tienen permitido, desde el navegador del usuario, realizar peticiones hacia la API desde un origen distinto al que sirve la propia API: `config.setAllowedOrigins(List.of("https://miapp.com"))` restringe explícitamente qué frontends específicos pueden consumir la API desde un navegador, una protección relevante específicamente para peticiones iniciadas desde JavaScript ejecutándose en un navegador, no para llamadas directas entre servidores (que no están sujetas a la política del mismo origen que los navegadores imponen).

CSRF (Cross-Site Request Forgery) es un ataque relevante específicamente para aplicaciones que usan sesiones basadas en cookies para mantener la autenticación: dado que el navegador envía automáticamente las cookies de un dominio en cualquier petición hacia ese dominio (incluso si la petición fue iniciada desde un sitio malicioso distinto), un atacante podría inducir al navegador de una víctima ya autenticada a enviar una petición no deseada aprovechando esa cookie enviada automáticamente. Una API stateless que usa JWT (Tema 2) generalmente no necesita esa protección específica, dado que el token JWT no se envía automáticamente por el navegador como sí ocurre con las cookies — debe incluirse explícitamente en el header `Authorization` por el código cliente que realiza la petición, algo que un atacante que induce una petición desde un sitio malicioso no puede hacer sin conocer ese token específico de la víctima, eliminando la superficie de ataque que CSRF explota específicamente.

**Analogía:** CORS es como una lista de invitados autorizados a acceder a un recurso desde direcciones externas específicas; CSRF es un ataque que aprovecha que alguien lleva puesta automáticamente una credencial visible (la cookie) que cualquier lugar reconoce sin verificación adicional, mientras que un token JWT es como una credencial que debe presentarse explícitamente cada vez, no una que se lleva puesta automáticamente y de forma visible en todo momento.

**¿Por qué es importante?** CORS restringe qué orígenes de navegador pueden consumir la API; CSRF explota el envío automático de cookies de sesión, una superficie de ataque que las APIs stateless con JWT generalmente no tienen, dado que el token debe incluirse explícitamente en cada petición.

**Código del ejemplo:**

```java
@Bean
CorsConfigurationSource corsConfig() {
    var config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("https://miapp.com"));
    // ...
}
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

**Objetivo del laboratorio:** construir una API protegida con JWT y rutas con autorización por rol.

**Requisitos previos:** Módulos 0-3 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Configurar el `SecurityFilterChain` | Ver Tema 1 | `/api/**` autenticado, `/public/**` permitido |
| 2 | Implementar el filtro JWT | Ver Tema 2 | Valida el token en cada request |
| 3 | Agregar `@PreAuthorize("hasRole('ADMIN')")` | Ver Tema 2 | Verifica el 403 sin ese rol |
| 4 | Configurar CORS para el frontend | Ver Tema 3 | Solo el origen esperado |
| 5 | Documentar cuándo CSRF es relevante | Ver Tema 3 | Y por qué se deshabilita aquí |

**Verificación:** el laboratorio se considera exitoso si un usuario sin el rol requerido recibe 403 al intentar acceder a un endpoint protegido, y si el filtro JWT rechaza correctamente peticiones con un token inválido o ausente hacia rutas autenticadas.

**Errores comunes y soluciones**

- **Deshabilitar CSRF en una aplicación que usa sesiones basadas en cookies.** CSRF sigue siendo relevante en ese caso; solo deshabilítalo en APIs stateless con JWT.
- **Configurar CORS con `allowedOrigins("*")` en producción.** Restringe explícitamente a los orígenes reales esperados.
- **Olvidar `OncePerRequestFilter` para el filtro JWT.** Sin él, el filtro podría ejecutarse más de una vez por petición en ciertas configuraciones de servlets anidados.

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

- La configuración moderna de Spring Security declara el `SecurityFilterChain` vía `@Bean`, reemplazando la herencia de `WebSecurityConfigurerAdapter`.
- Un filtro JWT valida el token y establece la identidad autenticada en `SecurityContextHolder`; `@PreAuthorize` expresa autorización declarativamente.
- CORS restringe qué orígenes de navegador pueden consumir la API; CSRF es relevante para sesiones basadas en cookies, generalmente innecesario en APIs stateless con JWT.

**Conceptos aprendidos**

- `SecurityFilterChain` moderno.
- Filtro JWT y `SecurityContextHolder`.
- Autorización con `@PreAuthorize`.
- CORS y CSRF.

**Próximos pasos**

En el Módulo 5 aprenderás configuración tipada con `@ConfigurationProperties`, perfiles, y manejo global de excepciones.

**Recursos adicionales**

- Documentación oficial de Spring Security (docs.spring.io/spring-security).
