const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verificarToken, verificarAdmin } = require('../middleware/auth');
const Usuario = require('../models/Usuario');

// Ruta para crear un usuario (requiere ser admin)
router.post('/', verificarToken, verificarAdmin, usuarioController.crearUsuario);

// Ruta para actualizar la preferencia de reportes de un usuario específico
router.put('/:id/preferencia-reportes', verificarToken, verificarAdmin, usuarioController.actualizarPreferenciaReportes);

// Ruta de registro de usuario (para nuevos usuarios)
router.post('/registro', async (req, res) => {
  const { nombre, email, contraseña, role } = req.body;

  try {
    const existeUsuario = await Usuario.findOne({ where: { email } });
    if (existeUsuario) {
      return res.status(400).json({ error: 'El correo ya está en uso' });
    }

    const salt = await bcrypt.genSalt(10);
    const contraseña_hash = await bcrypt.hash(contraseña, salt);

    const nuevoUsuario = await Usuario.create({ nombre, email, contraseña_hash, role });
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Endpoint de login
router.post('/login', async (req, res) => {
  const { email, contraseña } = req.body;

  try {
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(400).json({ error: 'Credenciales incorrectas' });
    }

    const esContraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña_hash);
    if (!esContraseñaValida) {
      return res.status(400).json({ error: 'Credenciales incorrectas' });
    }

    const token = jwt.sign({ id: usuario.id, role: usuario.role }, process.env.JWT_SECRET, { expiresIn: '90d' });
    res.json({ token });
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ error: 'Error en el login' });
  }
});

// Rutas específicas para manejar clientes
router.get('/clientes', verificarToken, verificarAdmin, usuarioController.obtenerClientes);
router.put('/clientes/:id', verificarToken, verificarAdmin, usuarioController.actualizarCliente);
router.delete('/clientes/:id', verificarToken, verificarAdmin, usuarioController.eliminarCliente);

module.exports = router;