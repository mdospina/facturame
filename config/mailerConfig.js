const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'michaelospina19@gmail.com',  // Cambia a tu correo electrónico
    pass: 'zldj ayuq bpna etsi'        // Cambia a tu contraseña
  },
  debug: true, // Activa el modo de depuración
  logger: true // Habilita el registro detallado
});

module.exports = transporter;