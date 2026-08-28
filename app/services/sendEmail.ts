import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.NEXT_PUBLIC_TRANSPORT_HOST,
  port: parseInt(
    process.env.NEXT_PUBLIC_TRANSPORT_PORT!,
    10
  ),
  secure: true,
  auth: {
    user: process.env.NEXT_PUBLIC_BUSINESS_EMAIL,
    pass: process.env.NEXT_PUBLIC_BUSINESS_PASSWORD,
  },
});

export const sendEmail = async ({
  formData,
  contactEmail,
}: {
  formData: {
    name: string;
    last_name: string;
    email: string;
    phone: string;
    message: string;
    country_code: string;
  };
  contactEmail: string;
}) => {
  const inquiryMailOptions = {
    from: process.env.NEXT_PUBLIC_BUSINESS_EMAIL,
    to: process.env.NEXT_PUBLIC_BUSINESS_EMAIL,
    replyTo: formData.email,
    subject: `Mensaje de contacto: ${formData.name} ${formData.last_name}`,
    html: `
            <p>Nombre: ${formData.name} </p>
            <p>Apellidos: ${formData.last_name}</p>
            <p>Email: ${formData.email}</p>
            <p>Código de país: ${formData.country_code}</p>
            <p>Teléfono: ${formData.phone}</p>
            <p>Mensaje: ${formData.message}</p>
      `,
  };

  const inquirySecondaryMail = {
    from: process.env.NEXT_PUBLIC_BUSINESS_EMAIL,
    to: contactEmail,
    subject: `Mensaje de contacto: ${formData.name} ${formData.last_name}`,
    html: `
            <p>Nombre: ${formData.name}</p>
            <p>Apellidos: ${formData.last_name}</p>
            <p>Email: ${formData.email}</p>
            <p>Código de país: ${formData.country_code}</p>
            <p>Teléfono: ${formData.phone}</p>
            <p>Mensaje: ${formData.message}</p>
      `,
  };

  const confirmationMailOptions = {
    from: process.env.NEXT_PUBLIC_BUSINESS_EMAIL,
    to: formData.email,
    subject: "Confirmación de mensaje enviado - MediXenter",
    html: `
            <h2>¡Gracias por contactarnos!</h2>
            <p>Hola ${formData.name} ${formData.last_name},</p>
            <p>Hemos recibido tu mensaje correctamente. Te responderemos pronto.</p>
            <br>
            <p><strong>Resumen de tu mensaje:</strong></p>
            <p>Mensaje: ${formData.message}</p>
            <br>
            <p>Saludos,<br>Equipo de MediXenter</p>
      `,
  };

  const inquiryResult = await transporter.sendMail(
    inquiryMailOptions
  );

  const inquirySecondaryResult = await transporter.sendMail(
    inquirySecondaryMail
  );

  const confirmationResult = await transporter.sendMail(
    confirmationMailOptions
  );

  return {
    inquiryResult,
    inquirySecondaryResult,
    confirmationResult,
  };
};
