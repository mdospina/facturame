module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Agregar columna tenant_id a la tabla Productos
    await queryInterface.addColumn('Productos', 'tenant_id', {
      type: Sequelize.UUID,
      allowNull: true, // Temporalmente permitimos null
    });

    // Actualizar los productos existentes con un tenant_id genérico o específico
    const productos = await queryInterface.sequelize.query(
      `SELECT id FROM "Productos";`, { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    for (const producto of productos) {
      // Asignamos un tenant_id genérico o personalizado (puedes cambiarlo)
      await queryInterface.sequelize.query(
        `UPDATE "Productos" SET "tenant_id" = '1' WHERE "id" = ${producto.id};`
      );
    }

    // Modificamos la columna para no permitir null después de actualizar los registros
    await queryInterface.changeColumn('Productos', 'tenant_id', {
      type: Sequelize.UUID,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Productos', 'tenant_id');
  }
};