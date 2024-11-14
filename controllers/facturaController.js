const Factura = require('../models/Factura');
const DetalleFactura = require('../models/DetalleFactura');
const Producto = require('../models/Producto');
const Cliente = require('../models/Cliente');

exports.obtenerFacturas = async (req, res) => {
  const facturas = await Factura.findAll({ include: [Cliente, DetalleFactura] });
  res.json(facturas);
};

exports.crearFactura = async (req, res) => {
    const { clienteId, detalles } = req.body;
    let total = 0;
  
    try {
      // Crear la factura
      const factura = await Factura.create({ clienteId });
  
      // Procesar cada detalle
      for (const detalle of detalles) {
        const producto = await Producto.findByPk(detalle.productoId);
  
        if (!producto) {
          // Si el producto no existe, eliminamos la factura y enviamos un error
          await factura.destroy();
          return res.status(404).json({ error: `Producto con ID ${detalle.productoId} no encontrado.` });
        }
  
        // Verificar que haya suficiente stock
        if (producto.stock < detalle.cantidad) {
          await factura.destroy();
          return res.status(400).json({ error: `Stock insuficiente para el producto con ID ${detalle.productoId}.` });
        }
  
        const precioUnitario = producto.precio;
        const subtotal = precioUnitario * detalle.cantidad;
        total += subtotal;
  
        // Crear el detalle de la factura
        await DetalleFactura.create({
          facturaId: factura.id,
          productoId: detalle.productoId,
          cantidad: detalle.cantidad,
          precioUnitario: precioUnitario,
        });
  
        // Reducir el stock del producto
        producto.stock -= detalle.cantidad;
        await producto.save();
      }
  
      // Actualizar el total de la factura
      factura.total = total;
      await factura.save();
  
      res.json(factura);
    } catch (error) {
      console.error('Error al crear factura:', error);
      res.status(500).json({ error: 'Error al crear la factura' });
    }
  };

exports.obtenerFacturaPorId = async (req, res) => {
  const { id } = req.params;
  const factura = await Factura.findByPk(id, {
    include: [Cliente, { model: DetalleFactura, include: [Producto] }],
  });
  res.json(factura);
};