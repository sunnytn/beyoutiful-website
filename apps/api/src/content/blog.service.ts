import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { paginate, pageMeta } from '../common/dto/pagination.dto';

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

export interface UpsertPostDto {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string;
  categoryId?: string;
  tags?: string[];
  author?: string;
  isPublished?: boolean;
  publishedAt?: string;
  metaTitle?: string;
  metaDescription?: string;
}

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  async list(page = 1, limit = 9, opts: { tag?: string; q?: string; includeUnpublished?: boolean } = {}) {
    const where: Prisma.BlogPostWhereInput = {
      ...(opts.includeUnpublished ? {} : { isPublished: true }),
      ...(opts.tag ? { tags: { has: opts.tag } } : {}),
      ...(opts.q
        ? { OR: [{ title: { contains: opts.q, mode: 'insensitive' } }, { excerpt: { contains: opts.q, mode: 'insensitive' } }] }
        : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.blogPost.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        ...paginate(page, limit),
        select: {
          id: true, title: true, slug: true, excerpt: true, coverImageUrl: true, tags: true,
          author: true, publishedAt: true, isPublished: true,
          category: { select: { name: true, slug: true } },
        },
      }),
      this.prisma.blogPost.count({ where }),
    ]);
    return { rows, meta: pageMeta(total, page, limit) };
  }

  async bySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug },
      include: { category: { select: { name: true, slug: true } } },
    });
    if (!post || !post.isPublished) throw new NotFoundException('Post not found');
    const related = await this.prisma.blogPost.findMany({
      where: { isPublished: true, id: { not: post.id } },
      orderBy: { publishedAt: 'desc' },
      take: 3,
      select: { title: true, slug: true, excerpt: true, coverImageUrl: true, publishedAt: true },
    });
    return { ...post, related };
  }

  async byId(id: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async create(actorId: string, dto: UpsertPostDto) {
    const post = await this.prisma.blogPost.create({
      data: {
        ...dto,
        slug: dto.slug ? slugify(dto.slug) : slugify(dto.title),
        tags: dto.tags ?? [],
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : new Date(),
      },
    });
    this.audit.log({ userId: actorId, action: 'CREATE', entity: 'BlogPost', entityId: post.id });
    return post;
  }

  async update(actorId: string, id: string, dto: Partial<UpsertPostDto>) {
    const post = await this.prisma.blogPost.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.slug ? { slug: slugify(dto.slug) } : {}),
        ...(dto.publishedAt ? { publishedAt: new Date(dto.publishedAt) } : {}),
      },
    });
    this.audit.log({ userId: actorId, action: 'UPDATE', entity: 'BlogPost', entityId: id });
    return post;
  }

  async remove(actorId: string, id: string) {
    await this.prisma.blogPost.delete({ where: { id } });
    this.audit.log({ userId: actorId, action: 'DELETE', entity: 'BlogPost', entityId: id });
    return { success: true };
  }

  listCategories() {
    return this.prisma.blogCategory.findMany({ include: { _count: { select: { posts: true } } } });
  }
}
