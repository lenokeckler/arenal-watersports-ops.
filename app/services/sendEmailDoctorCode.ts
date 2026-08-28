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

export const sendEmailDoctorCode = async ({
  doctorData,
  language,
}: {
  doctorData: {
    name: string;
    last_name: string;
    doctor_code: string;
    email: string;
  };
  language?: Language;
}) => {
  const currentLanguage: Language =
    language || store.getState().language.currentLanguage;

  const subjects = {
    spanish: "Código de registro - MediXenter",
    english: "Registration Code - MediXenter",
  };

  const bodies = {
    spanish: `
        <p>Hola ${doctorData.name} ${doctorData.last_name},</p>
        <br>
        <p>Tu código de registro al sistema es: ${doctorData.doctor_code}</p>
        <br>
        <br>Equipo de MediXenter</p>
      `,
    english: `
        <p>Hello ${doctorData.name} ${doctorData.last_name},</p>
        <br>
        <p>Your registration code for the system is: ${doctorData.doctor_code}</p>
        <br>
        <br>MediXenter Team</p>
      `,
  };

  const mailOptions = {
    from: process.env.NEXT_PUBLIC_BUSINESS_EMAIL,
    to: doctorData.email,
    subject: subjects[currentLanguage],
    html: bodies[currentLanguage],
  };

  const result = await transporter.sendMail(mailOptions);

  return { result };
};
