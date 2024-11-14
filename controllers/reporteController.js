const Factura = require('../models/Factura');
const DetalleFactura = require('../models/DetalleFactura');
const Cliente = require('../models/Cliente');
const Producto = require('../models/Producto');
const { Op } = require('sequelize');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const fs = require('fs');
const transporter = require('../config/mailerConfig');

// Reporte de ventas en un periodo de tiempo
async function reporteVentas(req, res) {
  const { fechaInicio, fechaFin } = req.query;

  try {
    const facturas = await Factura.findAll({
      where: {
        fecha: {
          [Op.between]: [new Date(fechaInicio), new Date(fechaFin)],
        },
      },
      include: [Cliente],
    });

    const totalVentas = facturas.reduce((acc, factura) => acc + factura.total, 0);

    res.json({
      totalVentas,
      facturas,
    });
  } catch (error) {
    console.error('Error al generar reporte de ventas:', error);
    res.status(500).json({ error: 'Error al generar el reporte de ventas' });
  }
}

// Reporte de estadísticas de productos
async function reporteEstadisticasProductos(req, res) {
  try {
    const productos = await Producto.findAll({
      include: [
        {
          model: DetalleFactura,
          attributes: ['cantidad'],
        },
      ],
    });

    const estadisticas = productos.map((producto) => {
      const cantidadVendida = producto.DetalleFacturas.reduce((acc, detalle) => acc + detalle.cantidad, 0);
      const totalVentas = cantidadVendida * producto.precio;

      return {
        productoId: producto.id,
        nombre: producto.nombre,
        cantidadVendida,
        totalVentas,
        stockActual: producto.stock,
      };
    });

    res.json(estadisticas);
  } catch (error) {
    console.error('Error al generar reporte de estadísticas de productos:', error);
    res.status(500).json({ error: 'Error al generar el reporte de estadísticas de productos' });
  }
}

// Reporte de ventas en formato PDF
async function generarReporteVentasPDF(req, res) {
  const { fechaInicio, fechaFin } = req.query;

  try {
    const facturas = await Factura.findAll({
      where: {
        fecha: {
          [Op.between]: [
            new Date(fechaInicio + 'T00:00:00'),
            new Date(fechaFin + 'T23:59:59'),
          ],
        },
      },
      include: [Cliente],
    });

    const doc = new PDFDocument();
    const filePath = './reporte_ventas.pdf';
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);
    doc.fontSize(18).text('Reporte de Ventas', { align: 'center' });
    doc.fontSize(12).text(`Periodo: ${fechaInicio} a ${fechaFin}`, { align: 'center' });
    doc.moveDown();

    if (facturas.length === 0) {
      doc.fontSize(14).text('Sin ventas en el periodo seleccionado.', { align: 'center' });
    } else {
      doc.fontSize(14).text('Facturas:', { underline: true });
      facturas.forEach((factura, index) => {
        doc.fontSize(12).text(`Factura ${index + 1}: Cliente: ${factura.Cliente.nombre}, Total: $${factura.total.toFixed(2)}, Fecha: ${factura.fecha.toDateString()}`);
      });

      const totalVentas = facturas.reduce((acc, factura) => acc + factura.total, 0);
      doc.moveDown();
      doc.fontSize(14).text(`Total de Ventas: $${totalVentas.toFixed(2)}`, { align: 'right' });
    }

    doc.end();

    writeStream.on('finish', () => {
      res.download(filePath, 'reporte_ventas.pdf', (err) => {
        if (err) {
          console.error('Error al enviar el archivo PDF:', err);
          res.status(500).json({ error: 'Error al generar el PDF' });
        } else {
          fs.unlinkSync(filePath);
        }
      });
    });
  } catch (error) {
    console.error('Error al generar reporte de ventas en PDF:', error);
    res.status(500).json({ error: 'Error al generar el reporte de ventas en PDF' });
  }
}

// Reporte de ventas en formato Excel
async function generarReporteVentasExcel(req, res) {
  const { fechaInicio, fechaFin } = req.query;

  try {
    const facturas = await Factura.findAll({
      where: {
        fecha: {
          [Op.between]: [
            new Date(fechaInicio + 'T00:00:00'),
            new Date(fechaFin + 'T23:59:59'),
          ],
        },
      },
      include: [Cliente],
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte de Ventas');

    worksheet.columns = [
      { header: 'Cliente', key: 'cliente', width: 30 },
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: 'Total', key: 'total', width: 10 },
    ];

    facturas.forEach(factura => {
      worksheet.addRow({
        cliente: factura.Cliente.nombre,
        fecha: factura.fecha.toDateString(),
        total: factura.total,
      });
    });

    const totalVentas = facturas.reduce((acc, factura) => acc + factura.total, 0);
    worksheet.addRow({});
    worksheet.addRow({ cliente: 'Total de Ventas', total: totalVentas });

    const totalRow = worksheet.lastRow;
    totalRow.font = { bold: true };

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=reporte_ventas_${fechaInicio}_a_${fechaFin}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error al generar reporte de ventas en Excel:', error);
    res.status(500).json({ error: 'Error al generar el reporte de ventas en Excel' });
  }
}

// Enviar reporte de ventas por correo electrónico
async function enviarReporteVentasEmail(fechaInicio, fechaFin, destinatario) {
    console.log('Entrando en enviarReporteVentasEmail...');
  
    try {
      const facturas = await Factura.findAll({
        where: {
          fecha: {
            [Op.between]: [
              new Date(fechaInicio + 'T00:00:00'),
              new Date(fechaFin + 'T23:59:59'),
            ],
          },
        },
        include: [Cliente],
      });
      
      console.log('Facturas obtenidas:', facturas.length);
  
      const doc = new PDFDocument();
      const filePath = './reporte_ventas.pdf';
      const writeStream = fs.createWriteStream(filePath);
  
      doc.pipe(writeStream);
      doc.fontSize(18).text('Reporte de Ventas', { align: 'center' });
      doc.fontSize(12).text(`Periodo: ${fechaInicio} a ${fechaFin}`, { align: 'center' });
      doc.moveDown();
  
      if (facturas.length === 0) {
        doc.fontSize(14).text('Sin ventas en el periodo seleccionado.', { align: 'center' });
      } else {
        facturas.forEach((factura, index) => {
          doc.fontSize(12).text(`Factura ${index + 1}: Cliente: ${factura.Cliente.nombre}, Total: $${factura.total.toFixed(2)}, Fecha: ${factura.fecha.toDateString()}`);
        });
      }
  
      doc.end();
  
      writeStream.on('finish', () => {
        console.log('PDF generado correctamente. Iniciando el envío de correo...');
  
        const mailOptions = {
          from: 'michaelospina19@gmail.com',
          to: destinatario,
          subject: `Reporte de Ventas: ${fechaInicio} a ${fechaFin}`,
          text: 'Adjunto encontrarás el reporte de ventas.',
          attachments: [
            {
              filename: 'reporte_ventas.pdf',
              path: filePath
            }
          ]
        };
  
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error al enviar el correo:', error);
          } else {
            console.log('Correo enviado:', info);
            fs.unlinkSync(filePath); // Eliminar el archivo temporal después de enviar el correo
          }
        });
      });
    } catch (error) {
      console.error('Error al generar y enviar el reporte de ventas:', error);
    }
  }

// Exportar todas las funciones
module.exports = {
  reporteVentas,
  reporteEstadisticasProductos,
  generarReporteVentasPDF,
  generarReporteVentasExcel,
  enviarReporteVentasEmail,
};