import { createTransport } from "nodemailer";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

export type MailData = {
  subject: string;
  html: string;
};

export type MailClient = {
  send: (recipient: string | string[], data: MailData) => Promise<void>;
};

console.log(
  process.env.SYSTEM_EMAIL_ADDRESS,
  process.env.SYSTEM_EMAIL_PASSWORD
);

export const createMailClient = () => {
  const transporter = createTransport({
    service: "gmail",
    auth: {
      user: process.env.SYSTEM_EMAIL_ADDRESS,
      pass: process.env.SYSTEM_EMAIL_PASSWORD,
    },
  });

  return {
    async send(recipient, data) {
      await transporter.sendMail({
        to: recipient,
        from: process.env.SYSTEM_EMAIL_ADDRESS,
        ...data,
      });
    },
  } as MailClient;
};
