const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Factura = require('./Factura');
const Producto = require('./Producto');

const DetalleFactura = sequelize.define('DetalleFactura', {
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  precioUnitario: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
});

// Relaciones con Factura y Producto
DetalleFactura.belongsTo(Factura, { foreignKey: 'facturaId', onDelete: 'CASCADE' });
Factura.hasMany(DetalleFactura, { foreignKey: 'facturaId' });

DetalleFactura.belongsTo(Producto, { foreignKey: 'productoId', onDelete: 'CASCADE' });
Producto.hasMany(DetalleFactura, { foreignKey: 'productoId' });

module.exports = DetalleFactura;