module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Añadir columna tenant_id temporalmente permitiendo valores NULL
    await queryInterface.addColumn('Productos', 'tenant_id', {
      type: Sequelize.UUID,
      allowNull: true,
    });

    // Actualizar los productos existentes con un tenant_id genérico
    await queryInterface.sequelize.query(`
      UPDATE "Productos"
      SET "tenant_id" = '1';
    `);

    // Modificar la columna tenant_id para no permitir valores NULL
    await queryInterface.changeColumn('Productos', 'tenant_id', {
      type: Sequelize.UUID,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Productos', 'tenant_id');
  }
};