import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { UpsertTaxonomyDto } from './categories.service';

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

@Injectable()
export class CollectionsService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  list(includeInactive = false) {
    return this.prisma.collection.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: true } } },
    });
  }

  async bySlug(slug: string) {
    const col = await this.prisma.collection.findUnique({
      where: { slug },
      include: { _count: { select: { products: true } } },
    });
    if (!col || !col.isActive) throw new NotFoundException('Collection not found');
    return col;
  }

  async create(actorId: string, dto: UpsertTaxonomyDto) {
    const row = await this.prisma.collection.create({ data: { ...dto, slug: dto.slug ? slugify(dto.slug) : slugify(dto.name) } });
    this.audit.log({ userId: actorId, action: 'CREATE', entity: 'Collection', entityId: row.id });
    return row;
  }

  async update(actorId: string, id: string, dto: Partial<UpsertTaxonomyDto>) {
    const row = await this.prisma.collection.update({
      where: { id },
      data: { ...dto, ...(dto.slug ? { slug: slugify(dto.slug) } : {}) },
    });
    this.audit.log({ userId: actorId, action: 'UPDATE', entity: 'Collection', entityId: id });
    return row;
  }

  async remove(actorId: string, id: string) {
    await this.prisma.collection.delete({ where: { id } });
    this.audit.log({ userId: actorId, action: 'DELETE', entity: 'Collection', entityId: id });
    return { success: true };
  }
}
