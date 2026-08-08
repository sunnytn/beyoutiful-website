import { Injectable, NotFoundException } from '@nestjs/common';
import { ReviewStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  async submit(dto: { productSlug: string; name: string; email?: string; rating: number; title?: string; body: string }, userId?: string) {
    const product = await this.prisma.product.findUnique({ where: { slug: dto.productSlug } });
    if (!product) throw new NotFoundException('Product not found');
    const review = await this.prisma.review.create({
      data: {
        productId: product.id,
        userId: userId ?? null,
        name: dto.name,
        email: dto.email,
        rating: Math.min(5, Math.max(1, dto.rating)),
        title: dto.title,
        body: dto.body,
      },
    });
    return { id: review.id, status: review.status, message: 'Thanks! Your review will appear once approved.' };
  }

  async list(status?: ReviewStatus, page = 1, limit = 20) {
    const where = status ? { status } : {};
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { product: { select: { name: true, slug: true } } },
      }),
      this.prisma.review.count({ where }),
    ]);
    return { rows, total, page, limit };
  }

  async moderate(actorId: string, id: string, status: ReviewStatus) {
    const review = await this.prisma.review.update({ where: { id }, data: { status } });
    await this.recomputeProductRating(review.productId);
    this.audit.log({ userId: actorId, action: 'STATUS_CHANGE', entity: 'Review', entityId: id, detail: { status } });
    return review;
  }

  async remove(actorId: string, id: string) {
    const review = await this.prisma.review.delete({ where: { id } });
    await this.recomputeProductRating(review.productId);
    this.audit.log({ userId: actorId, action: 'DELETE', entity: 'Review', entityId: id });
    return { success: true };
  }

  private async recomputeProductRating(productId: string) {
    const agg = await this.prisma.review.aggregate({
      where: { productId, status: 'APPROVED' },
      _avg: { rating: true },
      _count: true,
    });
    await this.prisma.product.update({
      where: { id: productId },
      data: { avgRating: agg._avg.rating ?? 0, reviewCount: agg._count },
    });
  }
}
