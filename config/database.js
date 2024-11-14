const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('facturame', 'facturame', 'maikel', {
  host: 'localhost',
  dialect: 'postgres',
});

module.exports = sequelize;