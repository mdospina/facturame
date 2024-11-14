const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Producto = sequelize.define('Producto', {
  nombre: { type: DataTypes.STRING, allowNull: false },
  costo: { type: DataTypes.FLOAT, allowNull: false },
  precioVenta: { type: DataTypes.FLOAT, allowNull: false },
  iva: { type: DataTypes.FLOAT, allowNull: false },
  totalConIva: { type: DataTypes.FLOAT, allowNull: false },
  codigoBarras: { type: DataTypes.STRING, unique: true, allowNull: false },
  tenant_id: { type: DataTypes.UUID, allowNull: false }, // Añadimos el campo tenant_id
}, {
  tableName: 'Productos',
});

module.exports = Producto;