const Producto = require('../models/Producto');
const { Op } = require('sequelize');

// Obtener productos del cliente actual
const obtenerProductos = async (req, res) => {
  const tenantId = req.user.tenant_id; // Obtenemos tenant_id del usuario autenticado
  try {
    const productos = await Producto.findAll({
      where: { tenant_id: tenantId },
    });
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// Crear un producto asignado al cliente actual
const crearProducto = async (req, res) => {
  const tenantId = req.user.tenant_id;
  try {
    const { nombre, costo, precioVenta, iva, codigoBarras } = req.body;
    const totalConIva = precioVenta * (1 + iva / 100);

    const nuevoProducto = await Producto.create({
      nombre,
      costo,
      precioVenta,
      iva,
      totalConIva,
      codigoBarras,
      tenant_id: tenantId, // Asociamos el producto al cliente autenticado
    });

    res.status(201).json(nuevoProducto);
  } catch (error) {
    console.error('Error al crear el producto:', error);
    res.status(500).json({ error: 'Error al crear el producto' });
  }
};

// Actualizar un producto del cliente actual
const actualizarProducto = async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { id } = req.params;
  const { nombre, costo, precioVenta, iva, codigoBarras } = req.body;

  try {
    const producto = await Producto.findOne({
      where: { id, tenant_id: tenantId },
    });

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const totalConIva = precioVenta * (1 + iva / 100);
    await producto.update({ nombre, costo, precioVenta, iva, totalConIva, codigoBarras });

    res.json({ mensaje: 'Producto actualizado' });
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
};

// Eliminar un producto del cliente actual
const eliminarProducto = async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { id } = req.params;

  try {
    const producto = await Producto.findOne({
      where: { id, tenant_id: tenantId },
    });

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await producto.destroy();
    res.json({ mensaje: 'Producto eliminado' });
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
};

// Buscar un producto por nombre o código de barras del cliente actual
const buscarProducto = async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { query } = req.query;

  try {
    const producto = await Producto.findOne({
      where: {
        tenant_id: tenantId,
        [Op.or]: [
          { nombre: { [Op.like]: `%${query}%` } },
          { codigoBarras: query }
        ]
      }
    });

    if (producto) {
      res.json(producto);
    } else {
      res.status(404).json({ error: 'Producto no encontrado' });
    }
  } catch (error) {
    console.error('Error al buscar producto:', error);
    res.status(500).json({ error: 'Error al buscar producto' });
  }
};

module.exports = {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  buscarProducto,
};