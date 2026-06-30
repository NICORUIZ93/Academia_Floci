## Hashing de contraseñas

```js
import bcrypt from "bcrypt";
const hash = await bcrypt.hash(contraseñaPlano, 10); // nunca guardes la contraseña en texto plano
const esValida = await bcrypt.compare(contraseñaIngresada, hash);
```

## JWT: access y refresh tokens

```js
import jwt from "jsonwebtoken";

const accessToken = jwt.sign({ sub: usuario.id }, SECRETO, { expiresIn: "15m" }); // corta duración
const refreshToken = jwt.sign({ sub: usuario.id }, SECRETO_REFRESH, { expiresIn: "7d" }); // larga duración, guardado de forma segura
```

El access token viaja en cada request (header `Authorization: Bearer ...`); cuando expira, el cliente usa el refresh token contra `/refresh` para obtener uno nuevo sin pedirle la contraseña otra vez al usuario.

## Middleware de autenticación

```js
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    req.usuario = jwt.verify(token, SECRETO);
    next();
  } catch {
    res.status(401).json({ error: "No autorizado" });
  }
}

function requireRole(rol) {
  return (req, res, next) => req.usuario.rol === rol ? next() : res.status(403).end();
}

app.delete("/tareas/:id", requireAuth, requireRole("admin"), borrarTarea);
```

## Por qué no construir tu propia criptografía

`bcrypt` y `argon2` están diseñados específicamente para ser lentos (a propósito) y resistentes a ataques de fuerza bruta con hardware especializado. Una implementación casera casi siempre es más rápida de romper, no más segura.
