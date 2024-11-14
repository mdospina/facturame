const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const { verificarToken, verificarAdmin } = require('../middleware/auth');

// Crear un nuevo producto (solo para administradores)
router.post('/', verificarToken, verificarAdmin, productoController.crearProducto);

// Actualizar un producto (solo para administradores)
router.put('/:id', verificarToken, verificarAdmin, productoController.actualizarProducto);

// Eliminar un producto (solo para administradores)
router.delete('/:id', verificarToken, verificarAdmin, productoController.eliminarProducto);

// Consultar productos (disponible para usuarios autenticados)
router.get('/', verificarToken, productoController.obtenerProductos);

// Buscar un producto por nombre o código de barras
router.get('/buscar', verificarToken, productoController.buscarProducto);

module.exports = router;