import { Resend } from "resend";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { nombre, dni, telefono, fecha, pdfBase64 } = req.body;

  if (!nombre || !dni || !telefono || !fecha || !pdfBase64) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "Formulario <notificaciones@resend.dev>",
      to: "juandomingoferraggini@gmail.com",
      subject: `Nuevo formulario firmado - ${nombre}`,
      html: `
        <h2>Nuevo formulario recibido</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>DNI:</strong> ${dni}</p>
        <p><strong>Teléfono:</strong> ${telefono}</p>
        <p><strong>Fecha:</strong> ${fecha}</p>
        <p>Se adjunta el PDF firmado por el cliente.</p>
      `,
      attachments: [
        {
          filename: `Constancia_${nombre.replace(/\s+/g, "_")}.pdf`,
          content: pdfBase64,
        }
      ]
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error enviando email:", error);
    return res.status(500).json({ error: "Error al enviar email" });
  }
}
