## Cabeceras seguras con helmet

```js
import helmet from "helmet";
app.use(helmet()); // agrega X-Content-Type-Options, Strict-Transport-Security, etc.
```

## Rate limiting

```js
import rateLimit from "express-rate-limit";
app.use(rateLimit({ windowMs: 60_000, max: 100 })); // máximo 100 requests por minuto por IP
```

Sin esto, un solo cliente (o un bot) puede saturar tu API o intentar fuerza bruta sobre un login sin ninguna fricción.

## Inyección SQL: el problema y la solución

```js
// PELIGROSO: concatenación directa
const query = `SELECT * FROM usuarios WHERE email = '${email}'`; // un email malicioso puede alterar el SQL completo

// SEGURO: parámetros
const { rows } = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
```

Los drivers y ORMs (Prisma, pg con parámetros) escapan automáticamente los valores — nunca construyas SQL concatenando strings de entrada del usuario.

## Sanitización contra XSS

Si vas a renderizar contenido generado por usuarios en HTML (en otra app que lo consuma), escapa o sanitiza ese contenido antes de insertarlo en el DOM — de lo contrario, un usuario podría inyectar `<script>` que se ejecute en el navegador de otros usuarios.

## Auditoría de dependencias

```bash
npm audit          # lista vulnerabilidades conocidas en tus dependencias
npm audit fix       # aplica actualizaciones automáticas seguras
```
