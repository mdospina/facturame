// archivo: middleware/auth.js
const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Acceso denegado. No se proporcionó token' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Token no válido' });
  }
}

function verificarAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Acceso denegado. Se requieren privilegios de administrador' });
    }
  }
  
  module.exports = { verificarToken, verificarAdmin };