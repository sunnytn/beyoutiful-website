/** Shared domain types & constants — BeYoutiful Organics */

// ── Enums (mirror Prisma enums; single source for the frontend) ──
export const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PACKED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const USER_ROLES = ['ADMIN', 'STAFF', 'CUSTOMER'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ADVISOR_GOALS = ['HAIR', 'SKIN'] as const;
export type AdvisorGoal = (typeof ADVISOR_GOALS)[number];

export const REVIEW_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

// ── Money ──
export const CURRENCY = 'PKR';
export const CURRENCY_SYMBOL = 'Rs.';

/** Prices are stored as integer paisa-free rupees (whole PKR). */
export function formatPrice(amount: number): string {
  return `${CURRENCY_SYMBOL} ${amount.toLocaleString('en-PK')}`;
}

// ── Order number ──
export const ORDER_NUMBER_PREFIX = 'BYO';

// ── Advisor ──
export interface AdvisorAnswers {
  goal: AdvisorGoal;
  concern: string; // concern slug
  profile?: Record<string, string>; // questionKey -> optionValue
}

export interface AdvisorRuleConditions {
  goal?: AdvisorGoal;
  concerns?: string[];
  /** every entry must match answered profile value (unanswered = pass) */
  profile?: Record<string, string[]>;
}

export interface RoutineStep {
  order: number;
  title: string;
  description: string;
  productSlug?: string;
  frequency?: string;
}

export interface AdvisorRecommendation {
  products: Array<{ slug: string; score: number; reason?: string }>;
  routine: RoutineStep[];
  blogSlugs: string[];
  faqIds: string[];
  beforeAfterIds: string[];
}

// ── Cart / checkout payloads ──
export interface CartItemInput {
  productId: string;
  variantId?: string | null;
  quantity: number;
}

export interface CheckoutCustomerInput {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode?: string;
  notes?: string;
}

// ── Misc ──
export const SITE_NAME = 'BeYoutiful Organics';
export const SITE_TAGLINE = 'Pure. Organic. BeYoutiful.';
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
