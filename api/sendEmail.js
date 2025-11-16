import { Resend } from "resend";

// Usa la clave guardada en Vercel como variable de entorno
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { nombre, dni, telefono, fecha, pdfBase64 } = req.body || {};

    // Validaciones básicas
    if (!nombre || !dni || !telefono || !fecha || !pdfBase64) {
      return res.status(400).json({ error: "Faltan datos en el cuerpo de la solicitud" });
    }

    // Link al PDF como data URL (se puede abrir/guardar desde el mail)
    const safeName = nombre.replace(/\s+/g, "_");
    const pdfFileName = `Constancia_${safeName}.pdf`;
    const pdfDataUrl = `data:application/pdf;base64,${pdfBase64}`;

    const { error } = await resend.emails.send({
      from: "Formularios <onboarding@resend.dev>", // si después verificás tu dominio, cambiamos esto
      to: "s.i.balcarce@gmail.com",                // 📩 TU MAIL
      subject: `Nuevo formulario firmado - ${nombre}`,
      html: `
        <h2>Nuevo formulario recibido</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>DNI:</strong> ${dni}</p>
        <p><strong>Teléfono:</strong> ${telefono}</p>
        <p><strong>Fecha:</strong> ${fecha}</p>
        <hr />
        <p>
          Puedes descargar la constancia en PDF desde este enlace:<br/>
          <a href="${pdfDataUrl}" download="${pdfFileName}">
            Descargar PDF firmado
          </a>
        </p>
        <p style="font-size:12px;color:#555;margin-top:16px;">
          Nota: Este enlace contiene el archivo PDF en formato seguro (base64).
          También se descargó automáticamente en el dispositivo del cliente.
        </p>
      `,
    });

    if (error) {
      console.error("Error enviando email con Resend:", error);
      return res.status(500).json({ error: "Error al enviar el email" });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error en la función sendEmail:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

