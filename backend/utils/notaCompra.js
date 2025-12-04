import PDFDocument from "pdfkit";

const COMPANY_INFO = {
  nombre: "Big5hats",
  lema: "Estilo que te distingue",
  colorPrimario: "#0b0c10",
  colorSecundario: "#f5d14f",
};

const formatCurrency = (v) =>
  "$" + Number(v || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 });

export function generarNotaCompraPDF({ orden, usuario }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks = [];

    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err) => reject(err));

    const now = new Date();
    const fecha = now.toLocaleDateString("es-MX");
    const hora = now.toLocaleTimeString("es-MX");

    // Marca y lema (logo simple con iniciales)
    doc.save();
    doc.rect(40, 40, 76, 76).fill(COMPANY_INFO.colorPrimario);
    doc
      .fillColor(COMPANY_INFO.colorSecundario)
      .font("Helvetica-Bold")
      .fontSize(28)
      .text("B5", 40, 70, { width: 76, align: "center" });
    doc.restore();

    doc
      .fillColor("#111")
      .fontSize(20)
      .font("Helvetica-Bold")
      .text(COMPANY_INFO.nombre, 130, 50);
    doc.fontSize(12).font("Helvetica").fillColor("#555").text(COMPANY_INFO.lema, 130, 78);

    doc.moveDown().moveDown();
    doc.fillColor("#111").fontSize(14).font("Helvetica-Bold").text("Nota de compra");
    doc.font("Helvetica").fontSize(11).text(`Fecha: ${fecha}`);
    doc.text(`Hora: ${hora}`);
    doc.text(`Cliente: ${usuario?.nombre || "Cliente"}`);

    doc.moveDown();
    doc.fontSize(13).font("Helvetica-Bold").text("Articulos");
    doc.moveDown(0.3);
    (orden.items || []).forEach((it, idx) => {
      const nombre = it.nombre || it.productoNombre || `Producto ${it.productoId || idx + 1}`;
      const qty = Number(it.cantidad) || 0;
      const unit = Number(it.precioUnit ?? it.precio_unit ?? 0);
      doc.font("Helvetica").fontSize(11).text(`${idx + 1}. ${nombre} (x${qty})`, {
        continued: true,
      });
      doc.text(formatCurrency(unit * qty), { align: "right" });
    });

    doc.moveDown();
    doc.font("Helvetica").fontSize(11);
    doc.text(`Subtotal: ${formatCurrency(orden.subtotal)}`);
    doc.text(`Impuestos: ${formatCurrency(orden.tax)}`);
    doc.text(`Gastos de envio: ${formatCurrency(orden.shipping)}`);
    doc.text(`Cupon: ${orden.promoCode || "N/A"}`);
    doc.text(`Descuento aplicado: ${formatCurrency(orden.discount)}`);
    doc.font("Helvetica-Bold").text(`Total general: ${formatCurrency(orden.total)}`);

    if (orden.datosEnvio) {
      doc.moveDown();
      doc.font("Helvetica-Bold").text("Datos de envio");
      const env = orden.datosEnvio;
      doc.font("Helvetica").text(env.nombre || "");
      doc.text(env.direccion || "");
      doc.text(`${env.ciudad || ""} ${env.zip || ""}`.trim());
      if (env.paisLabel) doc.text(env.paisLabel);
      if (env.telefono) doc.text(`Tel: ${env.telefono}`);
    }

    doc.moveDown();
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#555")
      .text(
        "Gracias por elegir Big5hats. Esta nota confirma la compra y el cobro correspondiente.",
        { width: 520 }
      );

    doc.end();
  });
}
