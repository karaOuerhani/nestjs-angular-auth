import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT!) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendVerificationEmail(email: string, verificationCode: string): Promise<void> {
    // Read the email template
    const templatePath = path.join(__dirname, '../templates/verification-email.html');
    let htmlContent = fs.readFileSync(templatePath, 'utf8');

    // Replace placeholders with actual values
    htmlContent = htmlContent.replace(/{{verificationCode}}/g, verificationCode);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Vérifiez votre email - MyApp',
      html: htmlContent,
    };

    await this.transporter.sendMail(mailOptions);
  }
}