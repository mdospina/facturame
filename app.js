require('dotenv').config({ path: './config.env' });
const express = require('express');
const app = express();
const sequelize = require('./config/database'); // Importa sequelize desde database.js
const productoRoutes = require('./routes/producto');
const facturaRoutes = require('./routes/factura');
const reporteRoutes = require('./routes/reporte');
const Factura = require('./models/Factura');
const DetalleFactura = require('./models/DetalleFactura');
const Usuario = require('./models/Usuario');
const usuarioRoutes = require('./routes/usuario');
const cron = require('node-cron');
const { enviarReporteVentasEmail } = require('./controllers/reporteController');
const cors = require('cors');

// Configuración de CORS para aceptar solicitudes desde http://localhost:3001


// Configuración de CORS
app.use(cors({
    origin: 'http://localhost:3001', // Cambia al puerto correcto del frontend
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization'
  }));
  
app.options('*', cors());
app.use(express.json());
app.use('/api/productos', productoRoutes);
app.use('/api/facturas', facturaRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/usuarios', usuarioRoutes);



// Sincroniza la base de datos
sequelize.sync({ alter: true })
  .then(() => console.log('Tablas sincronizadas en la base de datos'))
  .catch(err => console.error('Error al sincronizar tablas:', err));

// Programar el envío de reportes cada lunes a las 9:00 a. m.
cron.schedule('0 9 * * 1', async () => {
    console.log('Verificando usuarios para envío de reportes automáticos...');
    try {
      const usuarios = await Usuario.findAll({ where: { recibeReportesAutomaticos: true } });
  
      if (usuarios.length === 0) {
        console.log('No hay usuarios con reportes automáticos activados.');
        return;
      }
  
      // Fechas dinámicas: una semana antes hasta hoy
      const fechaFin = new Date().toISOString().split('T')[0];
      const fechaInicioObj = new Date();
      fechaInicioObj.setDate(fechaInicioObj.getDate() - 7);
      const fechaInicio = fechaInicioObj.toISOString().split('T')[0];
  
      // Enviar el reporte a cada usuario que tiene activada la preferencia
      for (const usuario of usuarios) {
        console.log(`Enviando reporte a ${usuario.email}`);
        await enviarReporteVentasEmail(fechaInicio, fechaFin, usuario.email);
      }
    } catch (error) {
      console.error('Error al enviar reportes automáticos:', error);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));