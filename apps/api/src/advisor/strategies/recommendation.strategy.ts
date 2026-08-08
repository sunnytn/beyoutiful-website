/**
 * Strategy contract for the advisor recommendation engine.
 *
 * Today: RuleEngineStrategy (admin-configurable rules, no code required).
 * Tomorrow: an LlmStrategy can implement this same interface and be swapped
 * in via the DI token below (or chosen at runtime from Setting `advisor.strategy`)
 * without touching the wizard UI, controller or API contract.
 */
export interface AdvisorAnswers {
  goal: 'HAIR' | 'SKIN';
  concern: string;
  profile?: Record<string, string>;
}

export interface ScoredProduct {
  slug: string;
  score: number;
  reason?: string;
}

export interface RoutineStep {
  order: number;
  title: string;
  description: string;
  productSlug?: string;
  frequency?: string;
}

export interface RecommendationResult {
  products: ScoredProduct[];
  routine: RoutineStep[];
  blogSlugs: string[];
  faqIds: string[];
  beforeAfterIds: string[];
  matchedRules: string[];
}

export interface RecommendationStrategy {
  recommend(answers: AdvisorAnswers): Promise<RecommendationResult>;
}

export const RECOMMENDATION_STRATEGY = Symbol('RECOMMENDATION_STRATEGY');
