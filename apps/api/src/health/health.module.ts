import { Controller, Get, Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller({ path: 'health', version: '' })
class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', db: 'up', time: new Date().toISOString() };
    } catch {
      return { status: 'degraded', db: 'down', time: new Date().toISOString() };
    }
  }
}

@Module({ controllers: [HealthController] })
export class HealthModule {}
