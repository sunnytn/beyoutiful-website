import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class NewsletterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async subscribe(email: string) {
    const existing = await this.prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase() },
    });
    await this.prisma.newsletterSubscriber.upsert({
      where: { email: email.toLowerCase() },
      update: { isActive: true, unsubscribedAt: null },
      create: { email: email.toLowerCase() },
    });
    // Welcome email only on first-ever subscription (fire-and-forget).
    if (!existing) {
      void this.mail.sendNewsletterWelcome(email.toLowerCase());
    }
    return { success: true, message: 'Welcome to the BeYoutiful family! 🌿' };
  }

  async unsubscribe(email: string) {
    await this.prisma.newsletterSubscriber.updateMany({
      where: { email: email.toLowerCase() },
      data: { isActive: false, unsubscribedAt: new Date() },
    });
    return { success: true, message: 'You have been unsubscribed.' };
  }

  async list(page = 1, limit = 50) {
    const [rows, total, active] = await this.prisma.$transaction([
      this.prisma.newsletterSubscriber.findMany({
        orderBy: { subscribedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.newsletterSubscriber.count(),
      this.prisma.newsletterSubscriber.count({ where: { isActive: true } }),
    ]);
    return { rows, total, active, page, limit };
  }

  async exportEmails() {
    const rows = await this.prisma.newsletterSubscriber.findMany({
      where: { isActive: true },
      select: { email: true },
    });
    return { emails: rows.map((r) => r.email) };
  }
}
