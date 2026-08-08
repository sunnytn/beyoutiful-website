import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

export interface UpsertFaqDto {
  question: string;
  answer: string;
  category?: string;
  tags?: string[];
  sortOrder?: number;
  isActive?: boolean;
}

@Injectable()
export class FaqsService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  list(includeInactive = false, category?: string) {
    return this.prisma.faq.findMany({
      where: { ...(includeInactive ? {} : { isActive: true }), ...(category ? { category } : {}) },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  async byIds(ids: string[]) {
    return this.prisma.faq.findMany({ where: { id: { in: ids }, isActive: true } });
  }

  async create(actorId: string, dto: UpsertFaqDto) {
    const row = await this.prisma.faq.create({ data: { ...dto, tags: dto.tags ?? [] } });
    this.audit.log({ userId: actorId, action: 'CREATE', entity: 'Faq', entityId: row.id });
    return row;
  }

  async update(actorId: string, id: string, dto: Partial<UpsertFaqDto>) {
    const row = await this.prisma.faq.update({ where: { id }, data: dto });
    this.audit.log({ userId: actorId, action: 'UPDATE', entity: 'Faq', entityId: id });
    return row;
  }

  async remove(actorId: string, id: string) {
    await this.prisma.faq.delete({ where: { id } });
    this.audit.log({ userId: actorId, action: 'DELETE', entity: 'Faq', entityId: id });
    return { success: true };
  }
}
