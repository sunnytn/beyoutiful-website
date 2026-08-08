import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

/** Keys safe to expose publicly (storefront needs them). */
const PUBLIC_KEYS = [
  'business.name', 'business.email', 'business.whatsapp', 'business.whatsappDisplay', 'business.city',
  'social.facebook', 'social.instagram', 'social.whatsappCatalog',
  'shipping.flatFee', 'shipping.freeAbove', 'shipping.dispatchDays', 'shipping.deliveryDays',
  'seo.defaultTitle', 'seo.defaultDescription',
];

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  async publicSettings() {
    const rows = await this.prisma.setting.findMany({ where: { key: { in: PUBLIC_KEYS } } });
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  }

  async all() {
    const rows = await this.prisma.setting.findMany({ orderBy: [{ group: 'asc' }, { key: 'asc' }] });
    return rows;
  }

  async upsertMany(actorId: string, entries: Array<{ key: string; value: unknown; group?: string }>) {
    for (const e of entries) {
      await this.prisma.setting.upsert({
        where: { key: e.key },
        update: { value: e.value as Prisma.InputJsonValue, ...(e.group ? { group: e.group } : {}) },
        create: { key: e.key, value: e.value as Prisma.InputJsonValue, group: e.group ?? 'general' },
      });
    }
    this.audit.log({ userId: actorId, action: 'UPDATE', entity: 'Setting', detail: { keys: entries.map((e) => e.key) } });
    return { success: true };
  }
}
