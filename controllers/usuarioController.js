const Usuario = require('../models/Usuario');
const { Op } = require('sequelize');

// Funciones de cliente
exports.obtenerClientes = async (req, res) => {
  try {
    const clientes = await Usuario.findAll({ where: { role: 'user' } });
    res.json(clientes);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
};

exports.actualizarCliente = async (req, res) => {
  const { id } = req.params;
  const { nombre, email, recibeReportesAutomaticos } = req.body;

  try {
    const cliente = await Usuario.findByPk(id);
    if (!cliente || cliente.role !== 'user') {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    cliente.nombre = nombre;
    cliente.email = email;
    cliente.recibeReportesAutomaticos = recibeReportesAutomaticos;
    await cliente.save();

    res.json({ mensaje: 'Cliente actualizado', cliente });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
};

exports.eliminarCliente = async (req, res) => {
  const { id } = req.params;

  try {
    const cliente = await Usuario.findByPk(id);
    if (!cliente || cliente.role !== 'user') {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    await cliente.destroy();
    res.json({ mensaje: 'Cliente eliminado' });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
};

// Funciones de usuario
exports.crearUsuario = async (req, res) => {
  const { nombre, email, contraseña_hash, role = 'user', recibeReportesAutomaticos } = req.body;

  try {
    const usuario = await Usuario.create({
      nombre,
      email,
      contraseña_hash,
      role,
      recibeReportesAutomaticos: recibeReportesAutomaticos ?? true,
    });

    res.status(201).json({ mensaje: 'Usuario creado con éxito', usuario });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
};

exports.actualizarPreferenciaReportes = async (req, res) => {
  const { id } = req.params;
  const { recibeReportesAutomaticos } = req.body;

  try {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    usuario.recibeReportesAutomaticos = recibeReportesAutomaticos;
    await usuario.save();

    res.json({ mensaje: 'Preferencia de reportes automáticos actualizada', usuario });
  } catch (error) {
    console.error('Error al actualizar preferencia de reportes:', error);
    res.status(500).json({ error: 'Error al actualizar preferencia de reportes' });
  }
};