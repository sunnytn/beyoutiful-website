import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

export interface UpsertIngredientDto {
  name: string;
  slug?: string;
  description: string;
  benefits?: string[];
  imageUrl?: string;
  isActive?: boolean;
}

@Injectable()
export class IngredientsService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  list(includeInactive = false) {
    return this.prisma.ingredient.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });
  }

  async bySlug(slug: string) {
    const ing = await this.prisma.ingredient.findUnique({
      where: { slug },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true, name: true, slug: true, price: true, shortDescription: true, avgRating: true,
                images: { orderBy: { sortOrder: 'asc' }, take: 1, select: { url: true, alt: true } },
              },
            },
          },
        },
      },
    });
    if (!ing || !ing.isActive) throw new NotFoundException('Ingredient not found');
    return ing;
  }

  async create(actorId: string, dto: UpsertIngredientDto) {
    const row = await this.prisma.ingredient.create({
      data: { ...dto, benefits: dto.benefits ?? [], slug: dto.slug ? slugify(dto.slug) : slugify(dto.name) },
    });
    this.audit.log({ userId: actorId, action: 'CREATE', entity: 'Ingredient', entityId: row.id });
    return row;
  }

  async update(actorId: string, id: string, dto: Partial<UpsertIngredientDto>) {
    const row = await this.prisma.ingredient.update({
      where: { id },
      data: { ...dto, ...(dto.slug ? { slug: slugify(dto.slug) } : {}) },
    });
    this.audit.log({ userId: actorId, action: 'UPDATE', entity: 'Ingredient', entityId: id });
    return row;
  }

  async remove(actorId: string, id: string) {
    await this.prisma.ingredient.delete({ where: { id } });
    this.audit.log({ userId: actorId, action: 'DELETE', entity: 'Ingredient', entityId: id });
    return { success: true };
  }
}
