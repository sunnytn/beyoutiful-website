import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class HomepageService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  /** Everything the homepage needs in one round trip. */
  async payload() {
    const [sections, categories, featured, bestSellers, newArrivals, ingredients, testimonials, posts] =
      await Promise.all([
        this.prisma.homepageSection.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
        this.prisma.category.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: { _count: { select: { products: true } } },
        }),
        this.productCards({ isFeatured: true }, 4),
        this.productCards({ isBestSeller: true }, 8),
        this.productCards({ isNewArrival: true }, 4),
        this.prisma.ingredient.findMany({ where: { isActive: true, imageUrl: { not: null } }, take: 6 }),
        this.prisma.testimonial.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' }, take: 6 }),
        this.prisma.blogPost.findMany({
          where: { isPublished: true },
          orderBy: { publishedAt: 'desc' },
          take: 3,
          select: { title: true, slug: true, excerpt: true, coverImageUrl: true, publishedAt: true },
        }),
      ]);
    return { sections, categories, featured, bestSellers, newArrivals, ingredients, testimonials, posts };
  }

  private productCards(where: Prisma.ProductWhereInput, take: number) {
    return this.prisma.product.findMany({
      where: { isActive: true, ...where },
      take,
      orderBy: { soldCount: 'desc' },
      select: {
        name: true, slug: true, shortDescription: true, price: true, compareAtPrice: true,
        avgRating: true, reviewCount: true, isBestSeller: true, isNewArrival: true,
        images: { orderBy: { sortOrder: 'asc' }, take: 2, select: { url: true, alt: true } },
      },
    });
  }

  listSections() {
    return this.prisma.homepageSection.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async updateSection(
    actorId: string,
    key: string,
    dto: { title?: string; subtitle?: string; content?: unknown; isActive?: boolean; sortOrder?: number },
  ) {
    const row = await this.prisma.homepageSection.upsert({
      where: { key },
      update: { ...dto, content: dto.content as Prisma.InputJsonValue },
      create: { key, ...dto, content: dto.content as Prisma.InputJsonValue },
    });
    this.audit.log({ userId: actorId, action: 'UPDATE', entity: 'HomepageSection', entityId: key });
    return row;
  }
}
