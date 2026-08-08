import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

/**
 * Intent-aware search:
 * 1. Expand the query via the admin-managed SearchSynonym table
 *    (Urdu/Roman-Urdu terms, colloquialisms → canonical concern/product slugs).
 * 2. Search products (name, description, tags, concerns, ingredients),
 *    concerns, ingredients, blogs and FAQs in parallel.
 */
@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  private async expandQuery(q: string): Promise<string[]> {
    const lowered = q.toLowerCase().trim();
    const synonyms = await this.prisma.searchSynonym.findMany({ where: { isActive: true } });
    const terms = new Set<string>([lowered]);
    for (const syn of synonyms) {
      if (lowered.includes(syn.term.toLowerCase())) {
        syn.mapsTo.forEach((t) => terms.add(t.toLowerCase()));
      }
    }
    return [...terms];
  }

  async search(q: string) {
    if (!q || q.trim().length < 2) {
      return { query: q, products: [], ingredients: [], concerns: [], blogs: [], faqs: [] };
    }
    const terms = await this.expandQuery(q);

    const productOr = terms.flatMap((t) => [
      { name: { contains: t, mode: 'insensitive' as const } },
      { description: { contains: t, mode: 'insensitive' as const } },
      { shortDescription: { contains: t, mode: 'insensitive' as const } },
      { slug: { contains: t.replace(/\s+/g, '-') } },
      { tags: { has: t } },
      { concerns: { has: t.replace(/\s+/g, '-') } },
      { ingredients: { some: { ingredient: { name: { contains: t, mode: 'insensitive' as const } } } } },
    ]);

    const [products, ingredients, concerns, blogs, faqs] = await Promise.all([
      this.prisma.product.findMany({
        where: { isActive: true, OR: productOr },
        take: 12,
        orderBy: { avgRating: 'desc' },
        select: {
          name: true, slug: true, shortDescription: true, price: true, avgRating: true, reviewCount: true,
          images: { orderBy: { sortOrder: 'asc' }, take: 1, select: { url: true, alt: true } },
        },
      }),
      this.prisma.ingredient.findMany({
        where: {
          isActive: true,
          OR: terms.flatMap((t) => [
            { name: { contains: t, mode: 'insensitive' as const } },
            { description: { contains: t, mode: 'insensitive' as const } },
          ]),
        },
        take: 6,
        select: { name: true, slug: true, description: true, imageUrl: true },
      }),
      this.prisma.advisorConcern.findMany({
        where: {
          isActive: true,
          OR: terms.flatMap((t) => [
            { name: { contains: t, mode: 'insensitive' as const } },
            { slug: { contains: t.replace(/\s+/g, '-') } },
          ]),
        },
        take: 6,
      }),
      this.prisma.blogPost.findMany({
        where: {
          isPublished: true,
          OR: terms.flatMap((t) => [
            { title: { contains: t, mode: 'insensitive' as const } },
            { excerpt: { contains: t, mode: 'insensitive' as const } },
            { content: { contains: t, mode: 'insensitive' as const } },
          ]),
        },
        take: 6,
        select: { title: true, slug: true, excerpt: true, coverImageUrl: true },
      }),
      this.prisma.faq.findMany({
        where: {
          isActive: true,
          OR: terms.flatMap((t) => [
            { question: { contains: t, mode: 'insensitive' as const } },
            { answer: { contains: t, mode: 'insensitive' as const } },
          ]),
        },
        take: 6,
      }),
    ]);

    return { query: q, expandedTerms: terms, products, ingredients, concerns, blogs, faqs };
  }

  // ── Admin: synonyms ──
  listSynonyms() {
    return this.prisma.searchSynonym.findMany({ orderBy: { term: 'asc' } });
  }
  async upsertSynonym(actorId: string, dto: { id?: string; term: string; mapsTo: string[]; isActive?: boolean }) {
    const { id, ...data } = dto;
    const row = id
      ? await this.prisma.searchSynonym.update({ where: { id }, data })
      : await this.prisma.searchSynonym.create({ data });
    this.audit.log({ userId: actorId, action: id ? 'UPDATE' : 'CREATE', entity: 'SearchSynonym', entityId: row.id });
    return row;
  }
  async removeSynonym(actorId: string, id: string) {
    await this.prisma.searchSynonym.delete({ where: { id } });
    this.audit.log({ userId: actorId, action: 'DELETE', entity: 'SearchSynonym', entityId: id });
    return { success: true };
  }
}
