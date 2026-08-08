import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AdvisorAnswers,
  RecommendationResult,
  RecommendationStrategy,
  RoutineStep,
  ScoredProduct,
} from './recommendation.strategy';

interface RuleConditions {
  goal?: 'HAIR' | 'SKIN';
  concerns?: string[];
  profile?: Record<string, string[]>;
}

@Injectable()
export class RuleEngineStrategy implements RecommendationStrategy {
  constructor(private readonly prisma: PrismaService) {}

  /** Pure matching logic — exported for unit testing. */
  static matches(conditions: RuleConditions, answers: AdvisorAnswers): boolean {
    if (conditions.goal && conditions.goal !== answers.goal) return false;
    if (conditions.concerns?.length && !conditions.concerns.includes(answers.concern)) return false;
    if (conditions.profile) {
      for (const [key, allowed] of Object.entries(conditions.profile)) {
        const answered = answers.profile?.[key];
        // Unanswered optional questions never disqualify a rule.
        if (answered && allowed.length && !allowed.includes(answered)) return false;
      }
    }
    return true;
  }

  async recommend(answers: AdvisorAnswers): Promise<RecommendationResult> {
    const rules = await this.prisma.advisorRule.findMany({
      where: { isActive: true },
      orderBy: { priority: 'desc' },
    });

    const productScores = new Map<string, ScoredProduct>();
    let routine: RoutineStep[] = [];
    const blogSlugs = new Set<string>();
    const faqIds = new Set<string>();
    const beforeAfterIds = new Set<string>();
    const matchedRules: string[] = [];

    for (const rule of rules) {
      const conditions = rule.conditions as unknown as RuleConditions;
      if (!RuleEngineStrategy.matches(conditions, answers)) continue;
      matchedRules.push(rule.name);

      const priorityBoost = rule.priority / 100;
      for (const p of (rule.productSlugs as unknown as ScoredProduct[]) ?? []) {
        const existing = productScores.get(p.slug);
        const score = (p.score ?? (p as unknown as { weight?: number }).weight ?? 1) + priorityBoost;
        if (!existing || existing.score < score) {
          productScores.set(p.slug, { slug: p.slug, score, reason: p.reason });
        }
      }
      // First (= highest priority) matching rule with a routine wins the routine slot.
      if (!routine.length && Array.isArray(rule.routine) && (rule.routine as unknown as RoutineStep[]).length) {
        routine = rule.routine as unknown as RoutineStep[];
      }
      rule.blogSlugs.forEach((s) => blogSlugs.add(s));
      rule.faqIds.forEach((s) => faqIds.add(s));
      rule.beforeAfterIds.forEach((s) => beforeAfterIds.add(s));
    }

    // Fallback: if no rule matched, recommend products tagged with the concern.
    if (productScores.size === 0) {
      const fallback = await this.prisma.product.findMany({
        where: { isActive: true, concerns: { has: answers.concern } },
        orderBy: { avgRating: 'desc' },
        take: 6,
        select: { slug: true },
      });
      fallback.forEach((p, i) => productScores.set(p.slug, { slug: p.slug, score: 5 - i * 0.1 }));
    }

    return {
      products: [...productScores.values()].sort((a, b) => b.score - a.score).slice(0, 8),
      routine: [...routine].sort((a, b) => a.order - b.order),
      blogSlugs: [...blogSlugs],
      faqIds: [...faqIds],
      beforeAfterIds: [...beforeAfterIds],
      matchedRules,
    };
  }
}
