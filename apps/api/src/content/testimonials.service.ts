import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

export interface UpsertTestimonialDto {
  name: string;
  location?: string;
  avatarUrl?: string;
  rating?: number;
  text: string;
  productSlug?: string;
  isActive?: boolean;
  sortOrder?: number;
}

@Injectable()
export class TestimonialsService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  list(includeInactive = false) {
    return this.prisma.testimonial.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async create(actorId: string, dto: UpsertTestimonialDto) {
    const row = await this.prisma.testimonial.create({ data: dto });
    this.audit.log({ userId: actorId, action: 'CREATE', entity: 'Testimonial', entityId: row.id });
    return row;
  }

  async update(actorId: string, id: string, dto: Partial<UpsertTestimonialDto>) {
    const row = await this.prisma.testimonial.update({ where: { id }, data: dto });
    this.audit.log({ userId: actorId, action: 'UPDATE', entity: 'Testimonial', entityId: id });
    return row;
  }

  async remove(actorId: string, id: string) {
    await this.prisma.testimonial.delete({ where: { id } });
    this.audit.log({ userId: actorId, action: 'DELETE', entity: 'Testimonial', entityId: id });
    return { success: true };
  }
}
