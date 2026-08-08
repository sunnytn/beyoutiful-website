import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { orderCustomerEmail, orderBusinessEmail, OrderEmailData } from './templates/order-emails';

@Injectable()
export class MailService {
  private readonly logger = new Logger('Mail');
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: Number(process.env.SMTP_PORT ?? 587) === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
    } else {
      this.logger.warn('SMTP not configured — emails will be logged, not sent.');
    }
  }

  private async send(to: string, subject: string, html: string) {
    if (!this.transporter) {
      this.logger.log(`[dry-run] to=${to} subject="${subject}"`);
      return;
    }
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM ?? 'BeYoutiful Organics <no-reply@beyoutifulorganics.com>',
      to,
      subject,
      html,
    });
  }

  /** Both order emails; failures are logged, never thrown. */
  async sendOrderEmails(data: OrderEmailData): Promise<boolean> {
    const business = process.env.BUSINESS_EMAIL ?? 'beyoutiful.organics@gmail.com';
    try {
      await Promise.all([
        this.send(data.customerEmail, `Order Confirmed — ${data.orderNumber} · BeYoutiful Organics`, orderCustomerEmail(data)),
        this.send(business, `🛍 New Order ${data.orderNumber} — ${data.customerName}`, orderBusinessEmail(data)),
      ]);
      return true;
    } catch (e) {
      this.logger.error(`order emails failed: ${(e as Error).message}`);
      return false;
    }
  }

  /** Branded welcome email on newsletter signup — failures logged, never thrown. */
  async sendNewsletterWelcome(to: string) {
    try {
      await this.send(
        to,
        'Welcome to the BeYoutiful family 🌿',
        `<!doctype html><html><body style="margin:0;padding:0;background:#faf7f2;font-family:Georgia,'Times New Roman',serif;color:#2d2a26;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f2;padding:32px 16px;"><tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;">
          <tr><td style="background:#3d5a3d;padding:32px;text-align:center;">
            <div style="color:#f7f3ea;font-size:24px;letter-spacing:4px;">BEYOUTIFUL</div>
            <div style="color:#c9d3c0;font-size:12px;letter-spacing:2px;margin-top:4px;">O R G A N I C S</div>
          </td></tr>
          <tr><td style="padding:40px;">
            <h1 style="font-size:22px;margin:0 0 12px;">Welcome to the family 🌿</h1>
            <p style="color:#6b6459;line-height:1.7;margin:0 0 16px;">You're in! Expect honest ingredient talk, simple rituals that actually work, and first access to small-batch launches. No spam — ever.</p>
            <p style="color:#6b6459;line-height:1.7;margin:0 0 24px;">Not sure where to start? Answer a few quick questions and get a routine matched to your hair or skin:</p>
            <p style="text-align:center;margin:0 0 8px;">
              <a href="${process.env.WEB_URL ?? 'https://beyoutifulorganics.com'}/advisor" style="display:inline-block;background:#c77b4f;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:999px;font-size:13px;letter-spacing:2px;">FIND MY PERFECT PRODUCTS</a>
            </p>
          </td></tr>
          <tr><td style="background:#f4efe6;padding:24px 40px;text-align:center;color:#8a8378;font-size:12px;">
            Because no matter where you are in your beauty journey — you look BeYoutiful.<br/>© BeYoutiful Organics · Karachi, Pakistan
          </td></tr>
        </table></td></tr></table></body></html>`,
      );
    } catch (e) {
      this.logger.error(`welcome email failed: ${(e as Error).message}`);
    }
  }

  async sendContactNotification(msg: { name: string; email: string; phone?: string | null; subject?: string | null; message: string }) {
    const business = process.env.BUSINESS_EMAIL ?? 'beyoutiful.organics@gmail.com';
    try {
      await this.send(
        business,
        `📩 Contact form: ${msg.subject ?? 'New message'} — ${msg.name}`,
        `<p><strong>${msg.name}</strong> (${msg.email}${msg.phone ? `, ${msg.phone}` : ''})</p><p>${msg.message.replace(/\n/g, '<br/>')}</p>`,
      );
    } catch (e) {
      this.logger.error(`contact email failed: ${(e as Error).message}`);
    }
  }
}
