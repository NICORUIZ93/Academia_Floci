# Módulo 18: Autenticación de usuarios con Cognito


## Aprende construyendo

### Tema 1: Por qué no construir tu propio sistema de autenticación

#### Paso 1 · Objetivo y preparación
Al finalizar podrás distinguir autenticación y autorización desde cero. Prerrequisitos: Node.js y Docker; verifica `node --version`.
#### Paso 2 · Contexto y caso real
Una aplicación debe saber quién solicita y qué puede hacer.
#### Paso 3 · Teoría, modelo mental y analogía
Autenticar es comprobar identidad; autorizar es comprobar permiso.
#### Paso 4 · Demostración guiada
Crea `src/auth.js` desde una carpeta vacía.
```bash
mkdir ejemplo-auth
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: acepta una credencial inválida para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Prueba usuario válido, inválido y revocado.
#### Paso 7 · Cierre y evidencia
Entrega flujo, salida, fallo y corrección; explica el resultado. Siguiente paso: JWT. Errores comunes: confiar solo en frontend y mensajes que revelan usuarios. Fuente oficial: https://owasp.org/www-project-authentication-cheat-sheet/.
**Conceptos clave:** autenticación es un problema resuelto con implicaciones de seguridad severas si se hace incorrectamente.

```bash
aws cognito-idp create-user-pool --pool-name MiApp --auto-verified-attributes email
aws cognito-idp sign-up --client-id <client-id> --username alice@ejemplo.com --password "Segura123!" --user-attributes Name=email,Value=alice@ejemplo.com
```

`--pool-name` nombra el User Pool (el directorio de usuarios, explicado abajo); `--auto-verified-attributes email` le dice a Cognito que verifique automáticamente el email de cada usuario nuevo (enviando un código de confirmación) antes de dejarlo iniciar sesión. Al registrar un usuario, `--client-id` identifica el App Client (la aplicación que hace el pedido, explicada abajo); `--username` y `--password` son las credenciales del usuario nuevo; `--user-attributes` son datos adicionales del perfil (acá, el mismo email en formato `Name=...,Value=...`). Al crear el App Client, `--client-name` lo identifica y `--no-generate-secret` indica que este cliente (por ejemplo, una app web pública) no necesita un secreto compartido, a diferencia de un backend que sí podría requerirlo; `--user-pool-id` en ese mismo comando indica a qué User Pool pertenece ese cliente. En resumen: `--pool-name` es la bandera que nombra el User Pool; `--auto-verified-attributes` es la bandera que activa la verificación automática de un atributo; `--client-id` es la bandera que identifica el App Client al autenticar; `--password` es la bandera con la contraseña del usuario; `--user-attributes` es la bandera con datos adicionales del perfil; `--client-name` es la bandera que nombra el App Client al crearlo; `--no-generate-secret` es la bandera que indica que ese cliente no necesita secreto compartido; y `--user-pool-id` es la bandera que fija a qué User Pool pertenece el cliente.

Construir un sistema de autenticación propio (hashing de contraseñas, gestión de sesiones, recuperación de contraseña, verificación de email, protección contra ataques de fuerza bruta) requiere resolver correctamente un conjunto extenso de detalles de seguridad donde un único error (un algoritmo de hashing débil, un flujo de recuperación de contraseña vulnerable a enumeración de usuarios) puede comprometer completamente la seguridad de todos los usuarios de la aplicación; Cognito (y servicios equivalentes como Auth0 o Firebase Authentication) encapsula toda esta complejidad ya resuelta y auditada extensamente por expertos en seguridad, permitiendo que un equipo de desarrollo de aplicación se enfoque en su lógica de negocio específica en vez de reinventar y potencialmente comprometer un componente de seguridad tan crítico y con tan poco margen de error aceptable.

Un User Pool es el directorio de usuarios completo (gestiona su registro, verificación, atributos, y credenciales); un App Client representa una aplicación cliente específica autorizada a interactuar con ese User Pool (una web app y una app móvil de la misma organización podrían tener App Clients distintos con configuraciones de seguridad diferenciadas, como si requieren o no un secreto de cliente).

**Analogía:** construir tu propio sistema de autenticación es como fabricar tu propia cerradura de seguridad desde cero sin experiencia previa en cerrajería, arriesgando que un defecto de diseño no detectado comprometa la seguridad completa de la puerta; usar Cognito es como instalar una cerradura certificada y probada extensamente por especialistas, con la garantía de que los defectos de diseño más comunes ya fueron identificados y corregidos por expertos antes de llegar al mercado.

**¿Por qué es importante?** NO debes construir tu propio sistema de autenticación porque requiere resolver correctamente numerosos detalles críticos de seguridad donde un único error puede comprometer completamente la seguridad de todos los usuarios, mientras que Cognito encapsula esa complejidad ya auditada y resuelta por expertos.

**Prueba en terminal:**

```bash
aws cognito-idp create-user-pool --pool-name MiApp --auto-verified-attributes email
aws cognito-idp create-user-pool-client --user-pool-id <pool-id> --client-name web-client --no-generate-secret
```

### Tema 2: Access Token, ID Token y Refresh Token

#### Paso 1 · Objetivo y preparación
Al finalizar podrás separar tokens desde cero. Prerrequisitos: Node.js y Docker; verifica `node --version`.
#### Paso 2 · Contexto y caso real
Access, refresh e identidad tienen duración y riesgo diferentes.
#### Paso 3 · Teoría, modelo mental y analogía
Son pases distintos: entrada inmediata, renovación y ficha de identidad.
#### Paso 4 · Demostración guiada
Crea `src/jwt.js` desde una carpeta vacía.
```bash
mkdir ejemplo-jwt
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: acepta un token expirado para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Valida firma, expiración y audiencia.
#### Paso 7 · Cierre y evidencia
Entrega validación, salida, fallo y corrección; explica el resultado. Siguiente paso: OAuth. Errores comunes: guardar refresh en local inseguro y no rotar. Fuente oficial: https://datatracker.ietf.org/doc/html/rfc7519.
**Conceptos clave:** tres tokens JWT con propósitos distintos, no intercambiables entre sí.

```bash
aws cognito-idp initiate-auth --client-id <client-id> --auth-flow USER_PASSWORD_AUTH --auth-parameters USERNAME=alice@ejemplo.com,PASSWORD="Segura123!"
```

`--auth-flow` elige el mecanismo de autenticación (`USER_PASSWORD_AUTH` es el flujo clásico de usuario y contraseña; Cognito soporta otros, como autenticación sin contraseña); `--auth-parameters` son los datos que ese flujo específico necesita — para `USER_PASSWORD_AUTH`, el usuario y la contraseña. En resumen: `--auth-parameters` es la bandera que lleva esos datos según el flujo elegido.

Tras un login exitoso, Cognito emite tres tokens JWT con propósitos claramente diferenciados: el **Access Token** autoriza al portador a acceder a recursos protegidos (APIs), conteniendo claims relacionados con permisos y scopes, pero deliberadamente sin información de identidad personal del usuario; el **ID Token** contiene específicamente información de identidad del usuario (claims como `sub`, `email`, `cognito:groups`), destinado a que la aplicación cliente conozca quién es el usuario autenticado, no para autorizar acceso a APIs; el **Refresh Token** tiene una vida útil considerablemente más larga que los otros dos y se usa exclusivamente para obtener un nuevo Access Token/ID Token cuando estos expiran, sin requerir que el usuario vuelva a ingresar sus credenciales completas cada vez.

Esta separación de propósitos (autorización vs identidad vs renovación) sigue el estándar OpenID Connect construido sobre OAuth 2.0, y es importante respetarla estrictamente: usar el ID Token para autorizar acceso a una API (en vez del Access Token diseñado específicamente para ese propósito) es un error de seguridad común que mezcla incorrectamente información de identidad con autorización de acceso, potencialmente exponiendo datos de identidad innecesarios a servicios que solo deberían verificar permisos.

**Analogía:** el Access Token es como una credencial de acceso que abre puertas específicas sin revelar quién la porta; el ID Token es como una tarjeta de identificación que confirma quién es la persona sin autorizar acceso a ninguna puerta específica; el Refresh Token es como un comprobante de registro que permite solicitar credenciales de acceso renovadas sin tener que presentar de nuevo toda la documentación de identidad original completa.

**¿Por qué es importante?** El Access Token autoriza acceso a APIs; el ID Token comunica identidad al cliente; el Refresh Token renueva los otros dos sin reingreso de credenciales, cada uno con un propósito distinto y no intercambiable que debe respetarse estrictamente para evitar errores de seguridad.

**Diagrama:**

```mermaid
flowchart LR
    A["Access Token"] --> A1["autoriza acceso a APIs (permisos, scopes)"]
    B["ID Token"] --> B1["identidad del usuario (sub, email, grupos)"]
    C["Refresh Token"] --> C1["renueva Access/ID Token sin reingresar credenciales"]
```

### Tema 3: OAuth 2.0 y PKCE

#### Paso 1 · Objetivo y preparación
Al finalizar podrás explicar OAuth desde cero. Prerrequisitos: Node.js y Docker; verifica `node --version`.
#### Paso 2 · Contexto y caso real
Una app móvil necesita acceder sin guardar un secreto de cliente permanente.
#### Paso 3 · Teoría, modelo mental y analogía
OAuth entrega permiso delegado, no la contraseña del usuario.
#### Paso 4 · Demostración guiada
Crea `src/oauth.js` desde una carpeta vacía.
```bash
mkdir ejemplo-oauth
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: omite PKCE para provocar un fallo deliberado de seguridad y corrígelo.
#### Paso 6 · Práctica independiente
Documenta scopes, redirect URI y revocación.
#### Paso 7 · Cierre y evidencia
Entrega flujo, salida, fallo y corrección; explica el resultado. Siguiente paso: autorización por roles. Errores comunes: redirect abierto y scopes excesivos. Fuente oficial: https://www.rfc-editor.org/rfc/rfc6749.
**Conceptos clave:** protocolo de autorización delegada, protección adicional para clientes que no pueden guardar secretos de forma segura.

OAuth 2.0 es el protocolo estándar de la industria para autorización delegada (permitir que una aplicación acceda a recursos en nombre de un usuario sin que ese usuario comparta directamente su contraseña con esa aplicación), y Cognito implementa flujos OAuth 2.0 completos, permitiendo integraciones estándar con proveedores de identidad externos (Google, Facebook) además de la autenticación directa con usuario y contraseña propia estudiada en el Tema 2.

PKCE (Proof Key for Code Exchange) es una extensión de seguridad de OAuth 2.0 diseñada específicamente para clientes que no pueden almacenar un secreto de forma segura (aplicaciones móviles nativas o aplicaciones de una sola página en el navegador, donde cualquier secreto embebido en el código del cliente sería potencialmente extraíble por un atacante); PKCE genera un verificador aleatorio y su correspondiente desafío derivado criptográficamente al inicio del flujo de autorización, y exige presentar ese verificador original al final del intercambio para obtener el token, de modo que incluso si un atacante interceptara el código de autorización intermedio, no podría completar el intercambio sin también poseer el verificador original que nunca se transmitió en ese paso intermedio interceptable.

**Analogía:** OAuth 2.0 es como un sistema de valet parking donde el cliente entrega una llave de acceso limitada y específica (no la llave maestra de su casa) que solo permite mover el auto, no acceder a otras propiedades del cliente; PKCE es como un código de verificación adicional generado al momento de entregar esa llave limitada, que solo el cliente original conoce y que debe presentarse nuevamente al recuperar el vehículo, previniendo que alguien que intercepte la llave limitada en el camino pueda usarla sin también conocer ese código adicional.

**¿Por qué es importante?** OAuth 2.0 permite autorización delegada sin compartir contraseñas directamente; PKCE protege específicamente a clientes que no pueden guardar secretos de forma segura (apps móviles, SPAs), previniendo que un código de autorización interceptado sea explotable sin también poseer el verificador original nunca transmitido en ese paso interceptable.

**Diagrama:**

```mermaid
sequenceDiagram
    participant Cliente
    participant Servidor
    Note over Cliente: genera verificador aleatorio → deriva un challenge
    Cliente->>Servidor: inicia flujo de autorización con el challenge
    Servidor->>Cliente: emite código de autorización
    Cliente->>Servidor: presenta el código + el verificador ORIGINAL
    Servidor->>Cliente: valida y emite el token
```

---


## Laboratorio práctico

> Este laboratorio asume que ya ejecutaste `floci start` y `eval $(floci env)` (Módulo 1) en tu sesión de terminal, así que los comandos de `aws` no repiten `--endpoint-url`.

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
