# Módulo 6: Autenticación y autorización

## Sílabo

**Objetivo general**

Implementar login seguro en una API Node sin reinventar criptografía desde cero, dominando hashing de contraseñas, JWT con access y refresh tokens, y control de acceso basado en roles.

**Objetivos específicos**

1. Implementar hashing seguro de contraseñas con bcrypt.
2. Explicar la diferencia entre un access token y un refresh token, e implementar ambos con JWT.
3. Construir un middleware de autenticación que valide JWT y rechace peticiones no autorizadas.
4. Implementar control de acceso basado en roles.
5. Explicar por qué nunca se debe construir un algoritmo propio de hashing de contraseñas.

**Contenido**

- Hashing de contraseñas (bcrypt/argon2).
- JWT: access y refresh tokens.
- Sesiones frente a tokens.
- OAuth 2.0 con un proveedor externo.
- Passport.js y sus estrategias de autenticación.

**Evaluación**

Una API protegida con JWT, refresh tokens y rutas con control de roles, más tres ejercicios de evaluación.

---

## Aprende construyendo

### Tema 1: Hashing de contraseñas

**Conceptos clave:** hashing frente a cifrado, funciones lentas deliberadamente, `bcrypt`/`argon2`.

Una contraseña nunca debe almacenarse en texto plano, ni siquiera cifrada (encriptada) de forma reversible: debe almacenarse hasheada, un proceso unidireccional que transforma la contraseña en una cadena de longitud fija que no puede revertirse matemáticamente de vuelta a la contraseña original. La distinción entre hashing y cifrado es crucial: el cifrado está diseñado para ser reversible (existe una clave que permite recuperar el texto original), apropiado para datos que legítimamente necesitan recuperarse; el hashing está diseñado deliberadamente para ser irreversible, apropiado precisamente para contraseñas, donde el sistema nunca necesita "recordar" la contraseña original, solo verificar si un intento de login coincide con ella.

`bcrypt` y `argon2` son algoritmos de hashing diseñados específicamente para contraseñas, con una propiedad deliberada y contraintuitiva: son lentos a propósito, y ese costo computacional es ajustable mediante un parámetro de "factor de costo" (el `10` en `bcrypt.hash(contraseña, 10)`) que se puede aumentar con el tiempo a medida que el hardware se vuelve más rápido, manteniendo el costo de un ataque de fuerza bruta (probar millones de contraseñas candidatas) prohibitivamente alto incluso con hardware moderno especializado en cómputo paralelo masivo. Esto contrasta directamente con funciones hash de propósito general como SHA-256, diseñadas para ser extremadamente rápidas (apropiado para verificar integridad de archivos, por ejemplo), una propiedad que las hace inadecuadas específicamente para contraseñas, porque esa misma velocidad facilita enormemente los ataques de fuerza bruta.

`bcrypt.compare(contraseñaIngresada, hashAlmacenado)` verifica un intento de login sin necesitar revertir el hash almacenado: internamente, hashea la contraseña ingresada con los mismos parámetros usados originalmente (incluyendo la "sal" aleatoria embebida en el propio hash almacenado, que previene que dos usuarios con la misma contraseña produzcan el mismo hash) y compara el resultado con el hash almacenado. Nunca construir un algoritmo propio de hashing de contraseñas, ni siquiera "solo por curiosidad" en un proyecto pequeño, es una recomendación categórica de la industria: diseñar criptografía segura requiere experiencia especializada extremadamente profunda para evitar vulnerabilidades sutiles que un atacante experimentado explotaría, y bibliotecas como bcrypt/argon2 ya han sido revisadas y probadas exhaustivamente por la comunidad de seguridad durante años.

**Analogía:** hashear una contraseña es como triturar un documento en una trituradora industrial de alta seguridad: es fácil verificar que un fragmento específico coincide con el resultado esperado de triturar un documento particular, pero es prácticamente imposible reconstruir el documento original completo a partir de los fragmentos resultantes. Que bcrypt sea deliberadamente lento es como usar una trituradora que además funciona más despacio a propósito, dificultando que alguien pueda triturar (y probar) millones de documentos candidatos por segundo.

**¿Por qué es importante?** El hashing correcto de contraseñas es la defensa fundamental contra el robo masivo de credenciales en caso de una brecha de la base de datos; usar bcrypt/argon2 en vez de una implementación propia es una decisión de seguridad no negociable en cualquier sistema de autenticación real.

**Código del ejemplo:**

```js
import bcrypt from "bcrypt";
const hash = await bcrypt.hash(contraseñaPlano, 10); // lento a propósito, con sal embebida
const esValida = await bcrypt.compare(contraseñaIngresada, hash); // verifica sin revertir
```

### Tema 2: JWT — access y refresh tokens

**Conceptos clave:** JSON Web Token, tokens de corta y larga duración, header `Authorization`.

Un JWT (JSON Web Token) es una cadena firmada digitalmente que codifica información (llamada "claims", como el id del usuario) de forma verificable pero no necesariamente secreta: cualquiera puede leer el contenido de un JWT decodificándolo (no está cifrado), pero solo quien posee el secreto usado para firmarlo puede haberlo generado válidamente, y cualquier verificador con acceso a ese mismo secreto (o a la clave pública correspondiente, en esquemas de firma asimétrica) puede confirmar que el token no fue alterado desde su emisión. Esta propiedad hace a los JWT apropiados para autenticación sin estado (stateless): el servidor no necesita consultar una base de datos o un almacén de sesiones para verificar la identidad del usuario en cada petición, simplemente verifica la firma criptográfica del token recibido.

El patrón de access token y refresh token separa dos preocupaciones distintas: el access token tiene una duración de vida corta (típicamente minutos), viaja en cada petición (convencionalmente en la cabecera `Authorization: Bearer <token>`), y su corta duración limita el daño potencial si ese token específico es interceptado o robado (expira pronto, limitando la ventana de uso indebido posible); el refresh token tiene una duración de vida considerablemente más larga (días o semanas), se almacena de forma más segura (frecuentemente en una cookie httpOnly, inaccesible directamente desde JavaScript del lado del cliente, mitigando el riesgo de robo mediante ataques de XSS), y se usa exclusivamente contra un endpoint específico (`/refresh`) para obtener un nuevo access token sin requerir que el usuario vuelva a introducir su contraseña cada vez que el access token expira.

Este patrón de dos tokens equilibra seguridad (limitando la ventana de exposición del token de uso más frecuente) con experiencia de usuario (evitando pedir la contraseña repetidamente cada pocos minutos), y es la práctica estándar ampliamente adoptada para autenticación basada en tokens en APIs modernas, en contraste con usar un único token de larga duración (que maximiza el daño potencial si se roba, dado que permanece válido por mucho más tiempo) o requerir reautenticación completa constante (una experiencia de usuario considerablemente peor).

**Analogía:** el access token es como un pase temporal de acceso a un edificio, válido solo por unas pocas horas, que se debe mostrar en cada puerta interna; el refresh token es como la credencial maestra guardada de forma segura en la recepción, que solo se usa específicamente para emitir un nuevo pase temporal cuando el anterior expira, sin necesitar volver a verificar la identidad completa de la persona desde cero cada vez.

**¿Por qué es importante?** El patrón de access/refresh token es el estándar de la industria para autenticación con JWT, equilibrando la seguridad de tokens de corta duración con una experiencia de usuario fluida que no requiere reautenticación constante.

**Código del ejemplo:**

```js
const accessToken = jwt.sign({ sub: usuario.id }, SECRETO, { expiresIn: "15m" });
const refreshToken = jwt.sign({ sub: usuario.id }, SECRETO_REFRESH, { expiresIn: "7d" });
// Cliente usa accessToken en cada request; cuando expira, usa refreshToken contra /refresh
```

### Tema 3: Middleware de autenticación y control de roles

**Conceptos clave:** verificación de JWT, `req.usuario`, autorización basada en roles.

Un middleware de autenticación centraliza la verificación de JWT para cualquier ruta que requiera un usuario autenticado: extrae el token de la cabecera `Authorization`, lo verifica con `jwt.verify(token, secreto)` (que lanza una excepción si el token es inválido, expiró, o fue firmado con un secreto distinto), y si la verificación tiene éxito, adjunta la información decodificada del usuario a `req.usuario` para que las rutas posteriores en la cadena puedan acceder a ella directamente, sin necesidad de repetir la verificación en cada ruta individual. Si la verificación falla, el middleware responde inmediatamente con `401` (No autorizado), deteniendo la cadena sin invocar `next()`, protegiendo efectivamente cualquier ruta que dependa de este middleware.

El control de acceso basado en roles añade una capa adicional sobre la autenticación: no basta con verificar que el usuario está autenticado (sabe quién es), sino también que tiene el rol o permiso específico necesario para la acción solicitada. Un middleware `requireRole(rolNecesario)` (una función de orden superior que devuelve un middleware específico configurado para ese rol, un patrón directamente relacionado con las funciones de orden superior estudiadas en el Módulo 1 del track de JavaScript) verifica que `req.usuario.rol` coincida con el rol requerido, respondiendo con `403` (Prohibido, distinto semánticamente de `401`: el usuario está autenticado pero no tiene permiso suficiente) si no coincide.

Encadenar ambos middleware en una ruta específica (`app.delete("/tareas/:id", requireAuth, requireRole("admin"), borrarTarea)`) expresa declarativamente los requisitos exactos de esa ruta: primero verificar autenticación, luego verificar el rol específico, y solo entonces ejecutar la lógica real de borrado, un patrón legible y fácilmente auditable que deja explícito, con solo leer la declaración de la ruta, exactamente qué se requiere para acceder a ella.

**Analogía:** el middleware de autenticación es como un guardia de seguridad que verifica la identificación de cualquiera que intente entrar a un edificio; el middleware de control de roles es como un guardia adicional en un piso específico del edificio que, además de confirmar que la persona ya fue identificada por el guardia de entrada, verifica que tenga la credencial específica de acceso a esa área restringida particular.

**¿Por qué es importante?** Separar la verificación de autenticación (quién eres) del control de roles (qué puedes hacer) en middleware independientes y componibles permite expresar declarativamente los requisitos exactos de cada ruta, facilitando la auditoría de seguridad de una API completa.

**Código del ejemplo:**

```js
function requireAuth(req, res, next) {
  try { req.usuario = jwt.verify(req.headers.authorization?.split(" ")[1], SECRETO); next(); }
  catch { res.status(401).json({ error: "No autorizado" }); }
}
function requireRole(rol) {
  return (req, res, next) => req.usuario.rol === rol ? next() : res.status(403).end();
}
app.delete("/tareas/:id", requireAuth, requireRole("admin"), borrarTarea);
```

### Tema 4: OAuth 2.0 y Passport.js

**Conceptos clave:** delegación de autenticación a un proveedor externo, estrategias de Passport.

OAuth 2.0 permite que un usuario se autentique usando una cuenta de un proveedor externo confiable (Google, GitHub, entre otros) sin que la aplicación necesite gestionar directamente ni ver la contraseña real del usuario en ese proveedor externo. El flujo típico redirige al usuario hacia el proveedor externo, donde inicia sesión (si no lo había hecho ya) y autoriza explícitamente a la aplicación a acceder a cierta información limitada de su perfil; el proveedor redirige de vuelta a la aplicación con un código de autorización temporal, que la aplicación intercambia (en una petición servidor a servidor, no visible directamente para el usuario) por un token de acceso que permite consultar la información del perfil del usuario autorizada.

Este enfoque delega la responsabilidad de gestionar credenciales sensibles (contraseñas) al proveedor externo, que típicamente invierte considerablemente más recursos en seguridad de lo que la mayoría de aplicaciones individuales podrían justificar, además de ofrecer una experiencia de login más fluida para el usuario (que no necesita crear ni recordar una contraseña adicional específica para cada aplicación distinta que use).

Passport.js es una biblioteca de middleware de autenticación para Node que abstrae la implementación de múltiples "estrategias" de autenticación (usuario/contraseña local, OAuth con Google, OAuth con GitHub, entre muchas otras) detrás de una interfaz consistente, permitiendo soportar múltiples métodos de login en una misma aplicación sin implementar el protocolo específico de cada proveedor externo manualmente desde cero, aunque para nuevos proyectos algunos equipos optan por implementar OAuth directamente (sin Passport) o usar servicios especializados de autenticación como identidad como servicio (Auth0, Clerk, entre otros) que abstraen aún más esta complejidad completa.

**Analogía:** OAuth 2.0 es como usar la llave maestra de un hotel de alta seguridad (el proveedor externo) para acceder a servicios de terceros afiliados (la aplicación), donde el hotel verifica tu identidad una vez y emite un pase temporal específico para cada servicio afiliado, sin que ese servicio afiliado necesite jamás conocer tu contraseña real de acceso al hotel.

**¿Por qué es importante?** OAuth 2.0 delega la gestión de credenciales sensibles a proveedores especializados con mayor inversión en seguridad, mejorando tanto la seguridad como la experiencia de usuario frente a gestionar contraseñas propias para cada aplicación individual.

**Diagrama:**

```
Usuario → [Login con Google] → Google (autentica, pide autorización)
                                       │
Usuario ◄── redirige con código ───────┘
    │
Aplicación intercambia código por token (servidor a servidor)
    │
Aplicación consulta perfil autorizado del usuario con ese token
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

**Objetivo del laboratorio:** implementar autenticación completa con hashing de contraseñas, JWT de access y refresh, y control de roles sobre la API construida en módulos anteriores.

**Requisitos previos:** Módulos 0-5 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Implementar registro con contraseña hasheada | Ver Tema 1 | Nunca almacenar la contraseña en texto plano |
| 2 | Implementar login con verificación y access token | `bcrypt.compare` + `jwt.sign` | Access token de corta duración |
| 3 | Agregar refresh token y endpoint `/refresh` | Ver Tema 2 | Emite un nuevo access token sin pedir contraseña de nuevo |
| 4 | Crear el middleware `requireAuth` | Ver Tema 3 | Rechaza con 401 si el JWT es inválido |
| 5 | Agregar control de roles | `requireRole("admin")` | Solo un admin puede acceder a una ruta protegida específica |
| 6 | Documentar integración con OAuth (Google) | Sin implementación completa | Describe el flujo completo de intercambio de código por token |

**Verificación:** el laboratorio se considera exitoso si un usuario puede registrarse, iniciar sesión, refrescar su access token expirado sin volver a introducir la contraseña, y si una ruta protegida por rol rechaza correctamente a un usuario sin el rol requerido.

**Errores comunes y soluciones**

- **Almacenar contraseñas en texto plano "temporalmente, solo para probar".** Nunca hagas esto, ni siquiera en desarrollo; adopta el hábito de hashear desde la primera línea de código de autenticación.
- **Usar un único token de larga duración en vez del patrón access/refresh.** Esto maximiza el daño potencial si el token se roba; adopta el patrón de dos tokens desde el diseño inicial.
- **Confundir 401 (no autenticado) con 403 (autenticado pero sin permiso).** Usa 401 cuando el JWT es inválido o falta; usa 403 cuando el usuario es válido pero no tiene el rol requerido.

---



## Bibliografía y fundamento académico

Estas fuentes sustentan los conceptos y deben consultarse para verificar detalles que cambian entre versiones:

- OpenJS Foundation, *Node.js Documentation*.
- IETF, especificaciones HTTP Semantics, OAuth 2.0 y JSON.
- OWASP Foundation, *Application Security Verification Standard*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- Las contraseñas deben hashearse (nunca cifrarse ni almacenarse en texto plano) con bcrypt/argon2, algoritmos deliberadamente lentos.
- El patrón access/refresh token equilibra seguridad (tokens de corta duración) con experiencia de usuario (sin reautenticación constante).
- Un middleware de autenticación centraliza la verificación de JWT; un middleware de roles añade control de acceso granular por encima.
- OAuth 2.0 delega la gestión de credenciales a proveedores externos confiables; Passport.js abstrae múltiples estrategias de autenticación.

**Conceptos aprendidos**

- Hashing seguro de contraseñas y por qué nunca construir criptografía propia.
- El patrón access/refresh token con JWT.
- Middleware de autenticación y control de acceso basado en roles.
- OAuth 2.0 y el rol de Passport.js.

**Próximos pasos**

En el Módulo 7 aprenderás a probar endpoints HTTP reales con Vitest y Supertest, incluyendo bases de datos de prueba efímeras con Testcontainers.

**Recursos adicionales**

- Documentación oficial de jsonwebtoken y de bcrypt en npm.
- OWASP Cheat Sheet Series: "Password Storage" y "Authentication".
- Documentación oficial de Passport.js (passportjs.org).
