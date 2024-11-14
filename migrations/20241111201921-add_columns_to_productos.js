module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('Productos');

    // Agregar columnas si no existen
    if (!tableDescription.costo) {
      await queryInterface.addColumn('Productos', 'costo', { type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 });
    }
    if (!tableDescription.precioVenta) {
      await queryInterface.addColumn('Productos', 'precioVenta', { type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 });
    }
    if (!tableDescription.iva) {
      await queryInterface.addColumn('Productos', 'iva', { type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 });
    }
    if (!tableDescription.totalConIva) {
      await queryInterface.addColumn('Productos', 'totalConIva', { type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 });
    }
    if (!tableDescription.codigoBarras) {
      await queryInterface.addColumn('Productos', 'codigoBarras', { type: Sequelize.STRING, allowNull: true });
    }

    // Agregar la restricción única solo si no existe
    const [results] = await queryInterface.sequelize.query(`
      SELECT constraint_name FROM information_schema.table_constraints 
      WHERE table_name = 'Productos' AND constraint_type = 'UNIQUE' 
      AND constraint_name = 'unique_codigoBarras'
    `);

    if (results.length === 0) {
      await queryInterface.addConstraint('Productos', {
        fields: ['codigoBarras'],
        type: 'unique',
        name: 'unique_codigoBarras'
      });
    }

    // Agregar columna tenant_id permitiendo valores NULL temporalmente
    if (!tableDescription.tenant_id) {
      await queryInterface.addColumn('Productos', 'tenant_id', {
        type: Sequelize.INTEGER,
        allowNull: true, // Permitir NULL temporalmente
      });

      // Asignar valor por defecto a tenant_id para registros existentes (por ejemplo, tenant_id = 1)
      await queryInterface.sequelize.query(`UPDATE "Productos" SET "tenant_id" = 1`);

      // Cambiar tenant_id a NOT NULL
      await queryInterface.changeColumn('Productos', 'tenant_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
      });
    }
  },

  down: async (queryInterface) => {
    await queryInterface.removeConstraint('Productos', 'unique_codigoBarras');
    await queryInterface.removeColumn('Productos', 'costo');
    await queryInterface.removeColumn('Productos', 'precioVenta');
    await queryInterface.removeColumn('Productos', 'iva');
    await queryInterface.removeColumn('Productos', 'totalConIva');
    await queryInterface.removeColumn('Productos', 'codigoBarras');
    await queryInterface.removeColumn('Productos', 'tenant_id');
  }
};