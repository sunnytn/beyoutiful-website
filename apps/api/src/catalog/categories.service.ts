import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

export interface UpsertTaxonomyDto {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  list(includeInactive = false) {
    return this.prisma.category.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: true } } },
    });
  }

  async bySlug(slug: string) {
    const cat = await this.prisma.category.findUnique({
      where: { slug },
      include: { _count: { select: { products: true } } },
    });
    if (!cat || !cat.isActive) throw new NotFoundException('Category not found');
    return cat;
  }

  async create(actorId: string, dto: UpsertTaxonomyDto) {
    const row = await this.prisma.category.create({ data: { ...dto, slug: dto.slug ? slugify(dto.slug) : slugify(dto.name) } });
    this.audit.log({ userId: actorId, action: 'CREATE', entity: 'Category', entityId: row.id });
    return row;
  }

  async update(actorId: string, id: string, dto: Partial<UpsertTaxonomyDto>) {
    const row = await this.prisma.category.update({
      where: { id },
      data: { ...dto, ...(dto.slug ? { slug: slugify(dto.slug) } : {}) },
    });
    this.audit.log({ userId: actorId, action: 'UPDATE', entity: 'Category', entityId: id });
    return row;
  }

  async remove(actorId: string, id: string) {
    await this.prisma.category.delete({ where: { id } });
    this.audit.log({ userId: actorId, action: 'DELETE', entity: 'Category', entityId: id });
    return { success: true };
  }
}
