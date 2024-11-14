const express = require('express');
const router = express.Router();
const {
  reporteVentas,
  reporteEstadisticasProductos,
  generarReporteVentasPDF,
  generarReporteVentasExcel,
  enviarReporteVentasEmail,
} = require('../controllers/reporteController'); // Importar las funciones necesarias

router.get('/ventas', async (req, res) => {
    const { fechaInicio, fechaFin } = req.query;
  
    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos: fechaInicio o fechaFin' });
    }
  
    try {
      const reporte = await obtenerReporteVentas(fechaInicio, fechaFin);
      res.json(reporte);
    } catch (error) {
      console.error('Error en el endpoint /ventas:', error);
      res.status(500).json({ error: 'Error al obtener el reporte de ventas' });
    }
  });

// Ruta para el reporte de estadísticas de productos
router.get('/estadisticas-productos', reporteEstadisticasProductos);

// Ruta para generar reporte de ventas en PDF
router.get('/ventas/pdf', generarReporteVentasPDF);

// Ruta para generar reporte de ventas en Excel
router.get('/ventas/excel', generarReporteVentasExcel);

// Ruta para enviar reporte de ventas por correo electrónico
router.get('/ventas/email', async (req, res) => {
    // Obtener el correo y las fechas desde los parámetros de consulta
    const { fechaInicio, fechaFin, destinatario } = req.query;
  
    // Verificar que todos los parámetros requeridos estén presentes
    if (!fechaInicio || !fechaFin || !destinatario) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos: fechaInicio, fechaFin o destinatario' });
    }
  
    try {
      // Llamar a la función para enviar el reporte
      await enviarReporteVentasEmail(fechaInicio, fechaFin, destinatario);
      res.json({ mensaje: 'Reporte enviado correctamente' });
    } catch (error) {
      console.error('Error en el endpoint /ventas/email:', error);
      res.status(500).json({ error: 'Error al enviar el reporte' });
    }
  });

module.exports = router;