const express = require('express');
const router = express.Router();
const facturaController = require('../controllers/facturaController');

router.get('/', facturaController.obtenerFacturas);
router.post('/', facturaController.crearFactura);
router.get('/:id', facturaController.obtenerFacturaPorId);

module.exports = router;