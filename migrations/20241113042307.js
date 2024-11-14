module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('Productos');

    if (!tableDescription.tenant_id) {
      await queryInterface.addColumn('Productos', 'tenant_id', {
        type: Sequelize.UUID,
        allowNull: true, // Permitir nulos temporalmente
      });
    }
    
    // Elimina restricciones duplicadas en "codigoBarras"
    await queryInterface.removeConstraint('Productos', 'Productos_codigoBarras_key1').catch(() => {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Productos', 'tenant_id');
  }
};