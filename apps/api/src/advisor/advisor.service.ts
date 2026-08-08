import { Inject, Injectable } from '@nestjs/common';
import { AdvisorGoal, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  AdvisorAnswers,
  RECOMMENDATION_STRATEGY,
  RecommendationStrategy,
} from './strategies/recommendation.strategy';

@Injectable()
export class AdvisorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    @Inject(RECOMMENDATION_STRATEGY) private readonly strategy: RecommendationStrategy,
  ) {}

  /** Wizard config: goals, concerns that actually have products, optional questions. */
  async config() {
    const [concerns, questions, products] = await Promise.all([
      this.prisma.advisorConcern.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
      this.prisma.advisorQuestion.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: { options: { orderBy: { sortOrder: 'asc' } } },
      }),
      this.prisma.product.findMany({ where: { isActive: true }, select: { concerns: true } }),
    ]);
    const concernsWithProducts = new Set(products.flatMap((p) => p.concerns));
    return {
      goals: ['HAIR', 'SKIN'],
      concerns: concerns.filter((c) => concernsWithProducts.has(c.slug)),
      questions,
    };
  }

  async recommend(answers: AdvisorAnswers) {
    const result = await this.strategy.recommend(answers);

    const [products, blogs, faqs, gallery] = await Promise.all([
      this.prisma.product.findMany({
        where: { slug: { in: result.products.map((p) => p.slug) }, isActive: true },
        select: {
          id: true, name: true, slug: true, shortDescription: true, price: true, compareAtPrice: true,
          avgRating: true, reviewCount: true, benefits: true, directions: true,
          images: { orderBy: { sortOrder: 'asc' }, take: 1, select: { url: true, alt: true } },
          variants: { where: { isActive: true }, orderBy: { sortOrder: 'asc' }, select: { id: true, name: true, price: true } },
        },
      }),
      result.blogSlugs.length
        ? this.prisma.blogPost.findMany({
            where: { slug: { in: result.blogSlugs }, isPublished: true },
            select: { title: true, slug: true, excerpt: true, coverImageUrl: true },
          })
        : [],
      result.faqIds.length ? this.prisma.faq.findMany({ where: { id: { in: result.faqIds }, isActive: true } }) : [],
      result.beforeAfterIds.length
        ? this.prisma.beforeAfter.findMany({ where: { id: { in: result.beforeAfterIds }, isActive: true } })
        : this.prisma.beforeAfter.findMany({ where: { isActive: true, concern: answers.concern }, take: 4 }),
    ]);

    // Contextual FAQs fallback: match concern goal category
    const contextFaqs = faqs.length
      ? faqs
      : await this.prisma.faq.findMany({
          where: { isActive: true, category: answers.goal === 'HAIR' ? 'Hair' : 'Skin' },
          take: 4,
        });

    const byRank = new Map(result.products.map((p, i) => [p.slug, { rank: i, reason: p.reason }]));
    const ranked = [...products].sort((a, b) => (byRank.get(a.slug)?.rank ?? 99) - (byRank.get(b.slug)?.rank ?? 99));

    return {
      answers,
      products: ranked.map((p) => ({ ...p, reason: byRank.get(p.slug)?.reason ?? null })),
      routine: result.routine,
      blogs,
      faqs: contextFaqs,
      beforeAfter: gallery,
      matchedRules: result.matchedRules,
    };
  }

  // ── Admin: concerns ──
  listConcerns() {
    return this.prisma.advisorConcern.findMany({ orderBy: [{ goal: 'asc' }, { sortOrder: 'asc' }] });
  }
  async upsertConcern(actorId: string, dto: { id?: string; goal: AdvisorGoal; name: string; slug: string; sortOrder?: number; isActive?: boolean }) {
    const { id, ...data } = dto;
    const row = id
      ? await this.prisma.advisorConcern.update({ where: { id }, data })
      : await this.prisma.advisorConcern.create({ data });
    this.audit.log({ userId: actorId, action: id ? 'UPDATE' : 'CREATE', entity: 'AdvisorConcern', entityId: row.id });
    return row;
  }
  async removeConcern(actorId: string, id: string) {
    await this.prisma.advisorConcern.delete({ where: { id } });
    this.audit.log({ userId: actorId, action: 'DELETE', entity: 'AdvisorConcern', entityId: id });
    return { success: true };
  }

  // ── Admin: rules ──
  listRules() {
    return this.prisma.advisorRule.findMany({ orderBy: { priority: 'desc' } });
  }
  async upsertRule(
    actorId: string,
    dto: {
      id?: string; name: string; description?: string; priority?: number;
      conditions: unknown; productSlugs: unknown; routine?: unknown;
      blogSlugs?: string[]; faqIds?: string[]; beforeAfterIds?: string[]; isActive?: boolean;
    },
  ) {
    const { id, ...rest } = dto;
    const data = {
      name: rest.name,
      description: rest.description,
      priority: rest.priority ?? 0,
      conditions: rest.conditions as Prisma.InputJsonValue,
      productSlugs: rest.productSlugs as Prisma.InputJsonValue,
      routine: (rest.routine ?? []) as Prisma.InputJsonValue,
      blogSlugs: rest.blogSlugs ?? [],
      faqIds: rest.faqIds ?? [],
      beforeAfterIds: rest.beforeAfterIds ?? [],
      isActive: rest.isActive ?? true,
    };
    const row = id
      ? await this.prisma.advisorRule.update({ where: { id }, data })
      : await this.prisma.advisorRule.create({ data });
    this.audit.log({ userId: actorId, action: id ? 'UPDATE' : 'CREATE', entity: 'AdvisorRule', entityId: row.id });
    return row;
  }
  async removeRule(actorId: string, id: string) {
    await this.prisma.advisorRule.delete({ where: { id } });
    this.audit.log({ userId: actorId, action: 'DELETE', entity: 'AdvisorRule', entityId: id });
    return { success: true };
  }
}
