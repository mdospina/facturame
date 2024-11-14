const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Cliente = require('./Cliente');

const Factura = sequelize.define('Factura', {
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  total: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
});

// Relación con el cliente
Factura.belongsTo(Cliente, { foreignKey: 'clienteId', onDelete: 'CASCADE' });
Cliente.hasMany(Factura, { foreignKey: 'clienteId' });

module.exports = Factura;