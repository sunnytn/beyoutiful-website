import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CatalogModule } from './catalog/catalog.module';
import { OrdersModule } from './orders/orders.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ContentModule } from './content/content.module';
import { AdvisorModule } from './advisor/advisor.module';
import { SearchModule } from './search/search.module';
import { MarketingModule } from './marketing/marketing.module';
import { UploadsModule } from './uploads/uploads.module';
import { SiteModule } from './site/site.module';
import { AuditModule } from './audit/audit.module';
import { HealthModule } from './health/health.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60_000, limit: 120 },
      { name: 'strict', ttl: 60_000, limit: 10 },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    CatalogModule,
    OrdersModule,
    ReviewsModule,
    ContentModule,
    AdvisorModule,
    SearchModule,
    MarketingModule,
    UploadsModule,
    SiteModule,
    AuditModule,
    HealthModule,
    MailModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
