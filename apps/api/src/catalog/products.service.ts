import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ListProductsDto, UpsertProductDto } from './products.dto';
import { paginate, pageMeta } from '../common/dto/pagination.dto';

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

const cardSelect = {
  id: true, name: true, slug: true, shortDescription: true, price: true, compareAtPrice: true,
  isFeatured: true, isBestSeller: true, isNewArrival: true, avgRating: true, reviewCount: true,
  concerns: true, stock: true, isActive: true,
  images: { orderBy: { sortOrder: 'asc' as const }, take: 2, select: { url: true, alt: true } },
  variants: { where: { isActive: true }, orderBy: { sortOrder: 'asc' as const }, select: { id: true, name: true, price: true, stock: true } },
  categories: { select: { category: { select: { name: true, slug: true } } } },
} satisfies Prisma.ProductSelect;

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async list(q: ListProductsDto) {
    const where: Prisma.ProductWhereInput = {
      ...(q.includeInactive ? {} : { isActive: true }),
      ...(q.category ? { categories: { some: { category: { slug: q.category } } } } : {}),
      ...(q.collection ? { collections: { some: { collection: { slug: q.collection } } } } : {}),
      ...(q.concern ? { concerns: { has: q.concern } } : {}),
      ...(q.featured ? { isFeatured: true } : {}),
      ...(q.bestSeller ? { isBestSeller: true } : {}),
      ...(q.newArrival ? { isNewArrival: true } : {}),
      ...(q.minPrice != null || q.maxPrice != null
        ? { price: { ...(q.minPrice != null ? { gte: q.minPrice } : {}), ...(q.maxPrice != null ? { lte: q.maxPrice } : {}) } }
        : {}),
      ...(q.q
        ? {
            OR: [
              { name: { contains: q.q, mode: 'insensitive' } },
              { description: { contains: q.q, mode: 'insensitive' } },
              { tags: { has: q.q.toLowerCase() } },
            ],
          }
        : {}),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      q.sort === 'price-asc' ? { price: 'asc' }
      : q.sort === 'price-desc' ? { price: 'desc' }
      : q.sort === 'rating' ? { avgRating: 'desc' }
      : q.sort === 'newest' ? { createdAt: 'desc' }
      : q.sort === 'popular' ? { soldCount: 'desc' }
      : { isBestSeller: 'desc' };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({ where, orderBy, ...paginate(q.page, q.limit), select: cardSelect }),
      this.prisma.product.count({ where }),
    ]);
    return { rows, meta: pageMeta(total, q.page, q.limit) };
  }

  async bySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
        categories: { include: { category: { select: { id: true, name: true, slug: true } } } },
        collections: { include: { collection: { select: { id: true, name: true, slug: true } } } },
        ingredients: { include: { ingredient: true } },
        faqs: { orderBy: { sortOrder: 'asc' } },
        relatedFrom: {
          include: { related: { select: cardSelect } },
          take: 8,
        },
        reviews: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: { id: true, name: true, rating: true, title: true, body: true, createdAt: true },
        },
      },
    });
    if (!product || !product.isActive) throw new NotFoundException('Product not found');
    return product;
  }

  /** Admin: full detail regardless of active state */
  async byId(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { orderBy: { sortOrder: 'asc' } },
        categories: { select: { categoryId: true } },
        collections: { select: { collectionId: true } },
        ingredients: { select: { ingredientId: true } },
        faqs: { orderBy: { sortOrder: 'asc' } },
        relatedFrom: { select: { related: { select: { slug: true } } } },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async slugsForRelated(slugs: string[]) {
    return this.prisma.product.findMany({ where: { slug: { in: slugs } }, select: { id: true, slug: true } });
  }

  async create(actorId: string, dto: UpsertProductDto) {
    const slug = dto.slug ? slugify(dto.slug) : slugify(dto.name);
    const related = dto.relatedSlugs?.length ? await this.slugsForRelated(dto.relatedSlugs) : [];
    const product = await this.prisma.product.create({
      data: {
        ...this.scalarData(dto),
        slug,
        images: { create: (dto.images ?? []).map((im, i) => ({ ...im, sortOrder: im.sortOrder ?? i })) },
        variants: { create: (dto.variants ?? []).map(({ id: _id, ...v }, i) => ({ ...v, sortOrder: v.sortOrder ?? i })) },
        categories: { create: (dto.categoryIds ?? []).map((categoryId) => ({ categoryId })) },
        collections: { create: (dto.collectionIds ?? []).map((collectionId) => ({ collectionId })) },
        ingredients: { create: (dto.ingredientIds ?? []).map((ingredientId) => ({ ingredientId })) },
        faqs: { create: (dto.faqs ?? []).map((f, i) => ({ ...f, sortOrder: i })) },
        relatedFrom: { create: related.map((r) => ({ relatedId: r.id })) },
      },
    });
    this.audit.log({ userId: actorId, action: 'CREATE', entity: 'Product', entityId: product.id, detail: { name: product.name } });
    return product;
  }

  async update(actorId: string, id: string, dto: UpsertProductDto) {
    await this.byId(id);
    const related = dto.relatedSlugs ? await this.slugsForRelated(dto.relatedSlugs) : null;
    const product = await this.prisma.$transaction(async (tx) => {
      // replace relations wholesale (admin sends complete state)
      if (dto.images) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        await tx.productImage.createMany({ data: dto.images.map((im, i) => ({ ...im, productId: id, sortOrder: im.sortOrder ?? i })) });
      }
      if (dto.variants) {
        const keepIds = dto.variants.filter((v) => v.id).map((v) => v.id as string);
        await tx.productVariant.deleteMany({ where: { productId: id, id: { notIn: keepIds } } });
        for (const [i, v] of dto.variants.entries()) {
          if (v.id) {
            await tx.productVariant.update({ where: { id: v.id }, data: { name: v.name, price: v.price, stock: v.stock, sortOrder: v.sortOrder ?? i } });
          } else {
            await tx.productVariant.create({ data: { productId: id, name: v.name, price: v.price, stock: v.stock ?? 100, sortOrder: v.sortOrder ?? i } });
          }
        }
      }
      if (dto.categoryIds) {
        await tx.productCategory.deleteMany({ where: { productId: id } });
        await tx.productCategory.createMany({ data: dto.categoryIds.map((categoryId) => ({ productId: id, categoryId })) });
      }
      if (dto.collectionIds) {
        await tx.productCollection.deleteMany({ where: { productId: id } });
        await tx.productCollection.createMany({ data: dto.collectionIds.map((collectionId) => ({ productId: id, collectionId })) });
      }
      if (dto.ingredientIds) {
        await tx.productIngredient.deleteMany({ where: { productId: id } });
        await tx.productIngredient.createMany({ data: dto.ingredientIds.map((ingredientId) => ({ productId: id, ingredientId })) });
      }
      if (dto.faqs) {
        await tx.productFaq.deleteMany({ where: { productId: id } });
        await tx.productFaq.createMany({ data: dto.faqs.map((f, i) => ({ ...f, productId: id, sortOrder: i })) });
      }
      if (related) {
        await tx.relatedProduct.deleteMany({ where: { productId: id } });
        await tx.relatedProduct.createMany({ data: related.filter((r) => r.id !== id).map((r) => ({ productId: id, relatedId: r.id })) });
      }
      return tx.product.update({
        where: { id },
        data: { ...this.scalarData(dto), ...(dto.slug ? { slug: slugify(dto.slug) } : {}) },
      });
    });
    this.audit.log({ userId: actorId, action: 'UPDATE', entity: 'Product', entityId: id, detail: { name: product.name } });
    return product;
  }

  async remove(actorId: string, id: string) {
    const p = await this.prisma.product.delete({ where: { id } });
    this.audit.log({ userId: actorId, action: 'DELETE', entity: 'Product', entityId: id, detail: { name: p.name } });
    return { success: true };
  }

  private scalarData(dto: UpsertProductDto) {
    return {
      name: dto.name,
      shortDescription: dto.shortDescription,
      description: dto.description,
      benefits: dto.benefits ?? undefined,
      directions: dto.directions,
      price: dto.price,
      compareAtPrice: dto.compareAtPrice ?? null,
      stock: dto.stock,
      isActive: dto.isActive,
      isFeatured: dto.isFeatured,
      isBestSeller: dto.isBestSeller,
      isNewArrival: dto.isNewArrival,
      videoUrl: dto.videoUrl,
      concerns: dto.concerns ?? undefined,
      tags: dto.tags ?? undefined,
      metaTitle: dto.metaTitle,
      metaDescription: dto.metaDescription,
    };
  }
}
