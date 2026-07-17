// Autenticación y autorización (Módulo 6): JWT con access + refresh tokens.
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'solo-para-desarrollo';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'tambien-solo-para-desarrollo';

async function registrarUsuario(password) {
  // bcrypt.hash incluye un salt aleatorio en el propio hash resultante — nunca
  // se guarda ni se necesita un salt por separado.
  const hash = await bcrypt.hash(password, 10);
  return hash;
}

async function verificarPassword(password, hashGuardado) {
  return bcrypt.compare(password, hashGuardado);
}

function generarTokens(userId) {
  // Access token: vida corta (minutos), viaja en cada petición protegida.
  const accessToken = jwt.sign({ sub: userId }, ACCESS_SECRET, { expiresIn: '15m' });

  // Refresh token: vida larga (días), se usa SOLO para pedir un access token
  // nuevo cuando el actual expira — nunca se envía en peticiones normales de API.
  const refreshToken = jwt.sign({ sub: userId }, REFRESH_SECRET, { expiresIn: '7d' });

  return { accessToken, refreshToken };
}

function verificarAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET); // lanza si expiró o la firma no coincide
}

// Middleware Express para proteger rutas:
function requiereAutenticacion(req, res, next) {
  const header = req.headers.authorization; // formato esperado: "Bearer <token>"
  const token = header?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    req.usuario = verificarAccessToken(token);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

module.exports = { registrarUsuario, verificarPassword, generarTokens, requiereAutenticacion };
