import nodemailer from 'nodemailer';
import { EmailOptions } from '../types';

export default async function sendEmail(options: EmailOptions): Promise<void> {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error('Error sending email');
  }
}
