import nodemailer from "nodemailer";
import { store } from "@/app/store";
import { Language } from "@/app/types";

const DECIMAL_BASE = 10;

const transporter = nodemailer.createTransport({
  host: process.env.NEXT_PUBLIC_TRANSPORT_HOST,
  port: parseInt(
    process.env.NEXT_PUBLIC_TRANSPORT_PORT!,
    DECIMAL_BASE
  ),
  secure: true,
  auth: {
    user: process.env.NEXT_PUBLIC_BUSINESS_EMAIL,
    pass: process.env.NEXT_PUBLIC_BUSINESS_PASSWORD,
  },
});

export const sendEmailPriceChange = async ({
  userData,
  planData,
  language,
}: {
  userData: {
    name: string;
    email: string;
  };
  planData: {
    planName: string;
    priceMonthly: number;
    priceAnnual: number;
  };
  language?: Language;
}) => {
  const currentLanguage: Language =
    language || store.getState().language.currentLanguage;

  const subjects = {
    spanish: "Actualización de precio de plan - MediXenter",
    english: "Plan Price Update - MediXenter",
  };

  const bodies = {
    spanish: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0066cc;">Actualización de Precio de Plan</h2>
          <p>Hola ${userData.name},</p>
          <p>Te informamos que el precio de tu plan <strong>${planData.planName}</strong> ha sido actualizado.</p>
          <p>A partir de tu próximo ciclo de facturación, se aplicarán las siguientes tarifas:</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>Precio Mensual:</strong> $${planData.priceMonthly.toFixed(2)} USD</p>
            <p style="margin: 10px 0;"><strong>Precio Anual:</strong> $${planData.priceAnnual.toFixed(2)} USD</p>
          </div>
          <p>Estos precios ya incluyen cualquier descuento aplicable.</p>
          <p>Si tienes alguna pregunta o inquietud, no dudes en contactarnos.</p>
          <br>
          <p>Saludos,<br><strong>Equipo de MediXenter</strong></p>
        </div>
      `,
    english: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0066cc;">Plan Price Update</h2>
          <p>Hello ${userData.name},</p>
          <p>We inform you that the price of your <strong>${planData.planName}</strong> plan has been updated.</p>
          <p>Starting from your next billing cycle, the following rates will apply:</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>Monthly Price:</strong> $${planData.priceMonthly.toFixed(2)} USD</p>
            <p style="margin: 10px 0;"><strong>Annual Price:</strong> $${planData.priceAnnual.toFixed(2)} USD</p>
          </div>
          <p>These prices already include any applicable discounts.</p>
          <p>If you have any questions or concerns, please don't hesitate to contact us.</p>
          <br>
          <p>Best regards,<br><strong>MediXenter Team</strong></p>
        </div>
      `,
  };

  const mailOptions = {
    from: process.env.NEXT_PUBLIC_BUSINESS_EMAIL,
    to: userData.email,
    subject: subjects[currentLanguage],
    html: bodies[currentLanguage],
  };

  const result = await transporter.sendMail(mailOptions);

  return { result };
};
