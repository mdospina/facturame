const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extrae el token del encabezado de la solicitud

  if (!token) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verifica el token
    req.user = decoded; // Guarda el usuario decodificado en la solicitud
    next(); // Llama a la siguiente función en la ruta
  } catch (error) {
    res.status(401).json({ error: 'Token no válido' });
  }
};

module.exports = verificarToken;