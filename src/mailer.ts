import { createTransport } from "nodemailer";

export type MailData = {
  subject: string;
  html: string;
};

export type MailClient = {
  send: (recipient: string | string[], data: MailData) => Promise<void>;
};

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
