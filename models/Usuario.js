const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  nombre: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  contraseña_hash: { type: DataTypes.STRING, allowNull: true },  // Opcional para ciertos clientes
  role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'user' },
  recibeReportesAutomaticos: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  timestamps: true,
});

module.exports = Usuario;