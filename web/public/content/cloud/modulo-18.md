# Módulo 18: Autenticación de usuarios con Cognito

## Sílabo

**Objetivo general**

Implementar registro, login y autorización de usuarios sin construir un sistema de autenticación propio desde cero, entendiendo los tres tipos de JWT emitidos por Cognito, el flujo OAuth 2.0 con PKCE, y cómo proteger un API Gateway con un Cognito Authorizer.

**Objetivos específicos**

1. Crear un User Pool y un App Client.
2. Registrar un usuario, confirmarlo, e iniciar sesión obteniendo tokens JWT.
3. Decodificar un JWT y examinar sus claims.
4. Proteger un API Gateway con un Cognito Authorizer.

**Contenido**

- User Pool.
- App Client.
- JWT (Access / ID / Refresh token).
- OAuth 2.0.
- PKCE.
- Grupos y atributos.

**Evaluación**

API REST protegida con Cognito Authorizer donde solo usuarios autenticados pueden crear tareas, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Por qué no construir tu propio sistema de autenticación

**Conceptos clave:** autenticación es un problema resuelto con implicaciones de seguridad severas si se hace incorrectamente.

```bash
aws cognito-idp create-user-pool --pool-name MiApp --auto-verified-attributes email
aws cognito-idp sign-up --client-id <client-id> --username alice@ejemplo.com --password "Segura123!" --user-attributes Name=email,Value=alice@ejemplo.com
```

Construir un sistema de autenticación propio (hashing de contraseñas, gestión de sesiones, recuperación de contraseña, verificación de email, protección contra ataques de fuerza bruta) requiere resolver correctamente un conjunto extenso de detalles de seguridad donde un único error (un algoritmo de hashing débil, un flujo de recuperación de contraseña vulnerable a enumeración de usuarios) puede comprometer completamente la seguridad de todos los usuarios de la aplicación; Cognito (y servicios equivalentes como Auth0 o Firebase Authentication) encapsula toda esta complejidad ya resuelta y auditada extensamente por expertos en seguridad, permitiendo que un equipo de desarrollo de aplicación se enfoque en su lógica de negocio específica en vez de reinventar y potencialmente comprometer un componente de seguridad tan crítico y con tan poco margen de error aceptable.

Un User Pool es el directorio de usuarios completo (gestiona su registro, verificación, atributos, y credenciales); un App Client representa una aplicación cliente específica autorizada a interactuar con ese User Pool (una web app y una app móvil de la misma organización podrían tener App Clients distintos con configuraciones de seguridad diferenciadas, como si requieren o no un secreto de cliente).

**Analogía:** construir tu propio sistema de autenticación es como fabricar tu propia cerradura de seguridad desde cero sin experiencia previa en cerrajería, arriesgando que un defecto de diseño no detectado comprometa la seguridad completa de la puerta; usar Cognito es como instalar una cerradura certificada y probada extensamente por especialistas, con la garantía de que los defectos de diseño más comunes ya fueron identificados y corregidos por expertos antes de llegar al mercado.

**¿Por qué es importante?** NO debes construir tu propio sistema de autenticación porque requiere resolver correctamente numerosos detalles críticos de seguridad donde un único error puede comprometer completamente la seguridad de todos los usuarios, mientras que Cognito encapsula esa complejidad ya auditada y resuelta por expertos.

**Diagrama:**

```bash
aws cognito-idp create-user-pool --pool-name MiApp --auto-verified-attributes email
aws cognito-idp create-user-pool-client --user-pool-id <pool-id> --client-name web-client --no-generate-secret
```

### Tema 2: Access Token, ID Token y Refresh Token

**Conceptos clave:** tres tokens JWT con propósitos distintos, no intercambiables entre sí.

```bash
aws cognito-idp initiate-auth --client-id <client-id> --auth-flow USER_PASSWORD_AUTH --auth-parameters USERNAME=alice@ejemplo.com,PASSWORD="Segura123!"
```

Tras un login exitoso, Cognito emite tres tokens JWT con propósitos claramente diferenciados: el **Access Token** autoriza al portador a acceder a recursos protegidos (APIs), conteniendo claims relacionados con permisos y scopes, pero deliberadamente sin información de identidad personal del usuario; el **ID Token** contiene específicamente información de identidad del usuario (claims como `sub`, `email`, `cognito:groups`), destinado a que la aplicación cliente conozca quién es el usuario autenticado, no para autorizar acceso a APIs; el **Refresh Token** tiene una vida útil considerablemente más larga que los otros dos y se usa exclusivamente para obtener un nuevo Access Token/ID Token cuando estos expiran, sin requerir que el usuario vuelva a ingresar sus credenciales completas cada vez.

Esta separación de propósitos (autorización vs identidad vs renovación) sigue el estándar OpenID Connect construido sobre OAuth 2.0, y es importante respetarla estrictamente: usar el ID Token para autorizar acceso a una API (en vez del Access Token diseñado específicamente para ese propósito) es un error de seguridad común que mezcla incorrectamente información de identidad con autorización de acceso, potencialmente exponiendo datos de identidad innecesarios a servicios que solo deberían verificar permisos.

**Analogía:** el Access Token es como una credencial de acceso que abre puertas específicas sin revelar quién la porta; el ID Token es como una tarjeta de identificación que confirma quién es la persona sin autorizar acceso a ninguna puerta específica; el Refresh Token es como un comprobante de registro que permite solicitar credenciales de acceso renovadas sin tener que presentar de nuevo toda la documentación de identidad original completa.

**¿Por qué es importante?** El Access Token autoriza acceso a APIs; el ID Token comunica identidad al cliente; el Refresh Token renueva los otros dos sin reingreso de credenciales, cada uno con un propósito distinto y no intercambiable que debe respetarse estrictamente para evitar errores de seguridad.

**Diagrama:**

```
Access Token  → autoriza acceso a APIs (permisos, scopes)
ID Token      → identidad del usuario (sub, email, grupos)
Refresh Token → renueva Access/ID Token sin reingresar credenciales
```

### Tema 3: OAuth 2.0 y PKCE

**Conceptos clave:** protocolo de autorización delegada, protección adicional para clientes que no pueden guardar secretos de forma segura.

OAuth 2.0 es el protocolo estándar de la industria para autorización delegada (permitir que una aplicación acceda a recursos en nombre de un usuario sin que ese usuario comparta directamente su contraseña con esa aplicación), y Cognito implementa flujos OAuth 2.0 completos, permitiendo integraciones estándar con proveedores de identidad externos (Google, Facebook) además de la autenticación directa con usuario y contraseña propia estudiada en el Tema 2.

PKCE (Proof Key for Code Exchange) es una extensión de seguridad de OAuth 2.0 diseñada específicamente para clientes que no pueden almacenar un secreto de forma segura (aplicaciones móviles nativas o aplicaciones de una sola página en el navegador, donde cualquier secreto embebido en el código del cliente sería potencialmente extraíble por un atacante); PKCE genera un verificador aleatorio y su correspondiente desafío derivado criptográficamente al inicio del flujo de autorización, y exige presentar ese verificador original al final del intercambio para obtener el token, de modo que incluso si un atacante interceptara el código de autorización intermedio, no podría completar el intercambio sin también poseer el verificador original que nunca se transmitió en ese paso intermedio interceptable.

**Analogía:** OAuth 2.0 es como un sistema de valet parking donde el cliente entrega una llave de acceso limitada y específica (no la llave maestra de su casa) que solo permite mover el auto, no acceder a otras propiedades del cliente; PKCE es como un código de verificación adicional generado al momento de entregar esa llave limitada, que solo el cliente original conoce y que debe presentarse nuevamente al recuperar el vehículo, previniendo que alguien que intercepte la llave limitada en el camino pueda usarla sin también conocer ese código adicional.

**¿Por qué es importante?** OAuth 2.0 permite autorización delegada sin compartir contraseñas directamente; PKCE protege específicamente a clientes que no pueden guardar secretos de forma segura (apps móviles, SPAs), previniendo que un código de autorización interceptado sea explotable sin también poseer el verificador original nunca transmitido en ese paso interceptable.

**Diagrama:**

```
Cliente genera verificador aleatorio → deriva un challenge → inicia flujo de autorización con el challenge
Servidor emite código de autorización
Cliente presenta el código + el verificador ORIGINAL → servidor valida y emite el token
```

---

## Laboratorio práctico

**Objetivo del laboratorio:** construir una API REST protegida con Cognito Authorizer donde solo usuarios autenticados pueden crear tareas.

**Requisitos previos:** Módulo 17 completado.

| Paso | Acción | Comando | Explicación |
|---|---|---|---|
| 1 | Crear un User Pool y un App Client | Ver Tema 1 | Sin secret para cliente web |
| 2 | Registrar y confirmar un usuario | `sign-up` + `admin-confirm-sign-up` | Flujo completo |
| 3 | Iniciar sesión y obtener tokens JWT | `initiate-auth` | Access/ID/Refresh |
| 4 | Decodificar el JWT y examinar sus claims | Ver Tema 2 | `sub`, `email`, `cognito:groups` |
| 5 | Proteger API Gateway con Cognito Authorizer | `aws apigateway create-authorizer --type COGNITO_USER_POOLS` | Solo usuarios autenticados |

**Verificación:** el laboratorio se considera exitoso si un request sin token válido es rechazado por el API Gateway, y si un request con un Access Token válido puede crear tareas correctamente.

**Errores comunes y soluciones**

- **Usar el ID Token para autorizar acceso a una API en vez del Access Token.** Mezcla identidad con autorización incorrectamente; usa el Access Token para ese propósito.
- **Construir un sistema de autenticación propio para ahorrar la integración con Cognito.** Arriesga vulnerabilidades críticas de seguridad ya resueltas por servicios auditados como Cognito.
- **Omitir PKCE en una app móvil o SPA que no puede guardar un secreto de forma segura.** Usa PKCE específicamente para esos clientes.

---

## Ejercicios de evaluación

### Ejercicio 1: Diferencia entre Access Token, ID Token y Refresh Token

**Enunciado:** ¿qué diferencia hay entre Access Token, ID Token y Refresh Token?

**Solución esperada:** el Access Token autoriza acceso a recursos protegidos (APIs); el ID Token comunica identidad del usuario a la aplicación cliente; el Refresh Token renueva los otros dos sin requerir reingreso de credenciales, cada uno con un propósito distinto y no intercambiable.

**Criterios de éxito:**
- Distingue correctamente el propósito de cada uno de los tres tokens.

### Ejercicio 2: Por qué no construir tu propio sistema de autenticación

**Enunciado:** ¿por qué NO debes construir tu propio sistema de autenticación?

**Solución esperada:** requiere resolver correctamente numerosos detalles críticos de seguridad (hashing de contraseñas, gestión de sesiones, protección contra fuerza bruta) donde un único error puede comprometer completamente la seguridad de todos los usuarios, algo que servicios auditados como Cognito ya resuelven de forma probada y extensamente revisada por expertos.

**Criterios de éxito:**
- Explica correctamente el riesgo de errores críticos de seguridad como razón de usar un servicio auditado en vez de construir uno propio.

### Ejercicio 3: Qué es PKCE y para qué sirve

**Enunciado:** ¿qué es el flujo PKCE y para qué sirve?

**Solución esperada:** es una extensión de seguridad de OAuth 2.0 para clientes que no pueden almacenar un secreto de forma segura (apps móviles, SPAs), donde se genera un verificador aleatorio y su desafío derivado al inicio del flujo, exigiendo presentar el verificador original al final del intercambio, previniendo que un código de autorización interceptado sea explotable sin también poseer ese verificador nunca transmitido en el paso interceptable.

**Criterios de éxito:**
- Explica correctamente el propósito de proteger clientes sin capacidad de guardar secretos de forma segura.

---

## Resumen del módulo

**Puntos clave**

- Construir un sistema de autenticación propio arriesga errores críticos de seguridad; Cognito encapsula esa complejidad ya auditada por expertos.
- Access Token, ID Token y Refresh Token tienen propósitos distintos y no intercambiables: autorización, identidad, y renovación respectivamente.
- OAuth 2.0 permite autorización delegada sin compartir contraseñas directamente entre servicios.
- PKCE protege específicamente a clientes que no pueden guardar secretos de forma segura, como apps móviles o SPAs.

**Conceptos aprendidos**

- User Pool.
- App Client.
- JWT (Access / ID / Refresh token).
- OAuth 2.0.
- PKCE.
- Grupos y atributos.

**Próximos pasos**

En el Módulo 19 aprenderás analítica de datos con Athena y Glue, consultando terabytes de datos en S3 con SQL sin moverlos a una base de datos.

**Recursos adicionales**

- Documentación oficial de Amazon Cognito (docs.aws.amazon.com/cognito).
