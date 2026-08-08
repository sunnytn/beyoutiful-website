import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class SeoService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  async byPath(path: string) {
    const entry = await this.prisma.seoEntry.findUnique({ where: { path } });
    return entry ?? null;
  }

  list() {
    return this.prisma.seoEntry.findMany({ orderBy: { path: 'asc' } });
  }

  async upsert(
    actorId: string,
    dto: { path: string; metaTitle?: string; metaDescription?: string; ogImageUrl?: string; canonicalUrl?: string; noIndex?: boolean },
  ) {
    const row = await this.prisma.seoEntry.upsert({
      where: { path: dto.path },
      update: dto,
      create: dto,
    });
    this.audit.log({ userId: actorId, action: 'UPDATE', entity: 'SeoEntry', entityId: dto.path });
    return row;
  }

  async remove(actorId: string, id: string) {
    await this.prisma.seoEntry.delete({ where: { id } });
    this.audit.log({ userId: actorId, action: 'DELETE', entity: 'SeoEntry', entityId: id });
    return { success: true };
  }

  /** Sitemap payload for the frontend's sitemap.ts */
  async sitemapData() {
    const [products, categories, collections, posts, ingredients] = await Promise.all([
      this.prisma.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
      this.prisma.category.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
      this.prisma.collection.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
      this.prisma.blogPost.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
      this.prisma.ingredient.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    ]);
    return { products, categories, collections, posts, ingredients };
  }
}
