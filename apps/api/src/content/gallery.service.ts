import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

export interface UpsertBeforeAfterDto {
  title: string;
  description?: string;
  beforeUrl: string;
  afterUrl: string;
  durationLabel?: string;
  concern?: string;
  productSlug?: string;
  isActive?: boolean;
  sortOrder?: number;
}

@Injectable()
export class GalleryService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  list(includeInactive = false, concern?: string) {
    return this.prisma.beforeAfter.findMany({
      where: { ...(includeInactive ? {} : { isActive: true }), ...(concern ? { concern } : {}) },
      orderBy: { sortOrder: 'asc' },
    });
  }

  byIds(ids: string[]) {
    return this.prisma.beforeAfter.findMany({ where: { id: { in: ids }, isActive: true } });
  }

  async create(actorId: string, dto: UpsertBeforeAfterDto) {
    const row = await this.prisma.beforeAfter.create({ data: dto });
    this.audit.log({ userId: actorId, action: 'CREATE', entity: 'BeforeAfter', entityId: row.id });
    return row;
  }

  async update(actorId: string, id: string, dto: Partial<UpsertBeforeAfterDto>) {
    const row = await this.prisma.beforeAfter.update({ where: { id }, data: dto });
    this.audit.log({ userId: actorId, action: 'UPDATE', entity: 'BeforeAfter', entityId: id });
    return row;
  }

  async remove(actorId: string, id: string) {
    await this.prisma.beforeAfter.delete({ where: { id } });
    this.audit.log({ userId: actorId, action: 'DELETE', entity: 'BeforeAfter', entityId: id });
    return { success: true };
  }
}
