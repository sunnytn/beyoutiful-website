import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService, private readonly mail: MailService) {}

  async submit(dto: { name: string; email: string; phone?: string; subject?: string; message: string }) {
    const row = await this.prisma.contactMessage.create({ data: dto });
    this.mail.sendContactNotification(dto).catch(() => undefined);
    return { success: true, id: row.id, message: 'Thanks for reaching out — we usually reply within a few hours.' };
  }

  async list(page = 1, limit = 20) {
    const [rows, total, unread] = await this.prisma.$transaction([
      this.prisma.contactMessage.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.contactMessage.count(),
      this.prisma.contactMessage.count({ where: { isRead: false } }),
    ]);
    return { rows, total, unread, page, limit };
  }

  markRead(id: string, isRead = true) {
    return this.prisma.contactMessage.update({ where: { id }, data: { isRead } });
  }

  async remove(id: string) {
    await this.prisma.contactMessage.delete({ where: { id } });
    return { success: true };
  }
}
