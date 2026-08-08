import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger('Audit');
  constructor(private readonly prisma: PrismaService) {}

  /** Fire-and-forget audit write — must never break the main request. */
  log(entry: {
    userId?: string | null;
    action: string;
    entity: string;
    entityId?: string | null;
    detail?: unknown;
    ip?: string | null;
  }) {
    this.prisma.auditLog
      .create({
        data: {
          userId: entry.userId ?? null,
          action: entry.action,
          entity: entry.entity,
          entityId: entry.entityId ?? null,
          detail: (entry.detail as Prisma.InputJsonValue) ?? undefined,
          ip: entry.ip ?? null,
        },
      })
      .catch((e) => this.logger.warn(`audit write failed: ${e.message}`));
  }

  async list(page = 1, limit = 50) {
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: { email: true, fullName: true } } },
      }),
      this.prisma.auditLog.count(),
    ]);
    return { rows, total, page, limit };
  }
}
