import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { AuditService } from '../audit/audit.service';
import { CreateOrderDto, ListOrdersDto } from './orders.dto';
import { paginate, pageMeta } from '../common/dto/pagination.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly audit: AuditService,
  ) {}

  private async getShippingConfig() {
    const [flat, freeAbove] = await Promise.all([
      this.prisma.setting.findUnique({ where: { key: 'shipping.flatFee' } }),
      this.prisma.setting.findUnique({ where: { key: 'shipping.freeAbove' } }),
    ]);
    return {
      flatFee: Number(flat?.value ?? 200),
      freeAbove: Number(freeAbove?.value ?? 3000),
    };
  }

  private async generateOrderNumber(): Promise<string> {
    const d = new Date();
    const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    // count today's orders for a readable sequence; uniqueness enforced by unique index + retry
    for (let attempt = 0; attempt < 5; attempt++) {
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const count = await this.prisma.order.count({ where: { createdAt: { gte: start } } });
      const candidate = `BYO-${ymd}-${String(count + 1 + attempt).padStart(4, '0')}`;
      const exists = await this.prisma.order.findUnique({ where: { orderNumber: candidate } });
      if (!exists) return candidate;
    }
    return `BYO-${ymd}-${Date.now().toString(36).toUpperCase()}`;
  }

  /** Build the wa.me deep link with the complete pre-filled order message. */
  private buildWhatsappUrl(order: {
    orderNumber: string; customerName: string; customerEmail: string; customerPhone: string;
    address: string; city: string; postalCode?: string | null;
    items: Array<{ productName: string; variantName?: string | null; quantity: number; unitPrice: number; lineTotal: number }>;
    subtotal: number; shippingFee: number; total: number;
  }): string {
    const number = process.env.WHATSAPP_NUMBER ?? '923000527443';
    const fmt = (n: number) => `Rs. ${n.toLocaleString('en-PK')}`;
    const lines = [
      `🌿 *New Order — BeYoutiful Organics*`,
      ``,
      `*Order #:* ${order.orderNumber}`,
      ``,
      `*Customer:* ${order.customerName}`,
      `*Phone:* ${order.customerPhone}`,
      `*Email:* ${order.customerEmail}`,
      `*Address:* ${order.address}, ${order.city}${order.postalCode ? ' ' + order.postalCode : ''}`,
      ``,
      `*Items:*`,
      ...order.items.map(
        (i, n) =>
          `${n + 1}. ${i.productName}${i.variantName ? ` (${i.variantName})` : ''} × ${i.quantity} — ${fmt(i.lineTotal)}`,
      ),
      ``,
      `Subtotal: ${fmt(order.subtotal)}`,
      `Delivery: ${order.shippingFee === 0 ? 'FREE' : fmt(order.shippingFee)}`,
      `*Grand Total: ${fmt(order.total)}*`,
      ``,
      `Payment: Cash on Delivery`,
    ];
    return `https://wa.me/${number}?text=${encodeURIComponent(lines.join('\n'))}`;
  }

  async create(dto: CreateOrderDto, userId?: string | null) {
    // Server-side re-pricing — client prices are never trusted.
    const productIds = [...new Set(dto.items.map((i) => i.productId))];
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      include: { variants: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const items = dto.items.map((i) => {
      const product = productMap.get(i.productId);
      if (!product) throw new BadRequestException(`Product unavailable: ${i.productId}`);
      let unitPrice = product.price;
      let variantName: string | null = null;
      if (i.variantId) {
        const variant = product.variants.find((v) => v.id === i.variantId && v.isActive);
        if (!variant) throw new BadRequestException(`Variant unavailable for ${product.name}`);
        unitPrice = variant.price;
        variantName = variant.name;
      }
      return {
        productId: product.id,
        variantId: i.variantId ?? null,
        productName: product.name,
        variantName,
        unitPrice,
        quantity: i.quantity,
        lineTotal: unitPrice * i.quantity,
      };
    });

    const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
    const { flatFee, freeAbove } = await this.getShippingConfig();
    const shippingFee = subtotal >= freeAbove ? 0 : flatFee;
    const total = subtotal + shippingFee;
    const orderNumber = await this.generateOrderNumber();

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        userId: userId ?? null,
        customerName: dto.fullName,
        customerEmail: dto.email.toLowerCase(),
        customerPhone: dto.phone,
        address: dto.address,
        city: dto.city,
        postalCode: dto.postalCode,
        notes: dto.notes,
        subtotal,
        shippingFee,
        discount: 0,
        total,
        items: { create: items },
      },
      include: { items: true },
    });

    // update sold counters (fire and forget)
    Promise.all(
      items.map((i) =>
        this.prisma.product.update({ where: { id: i.productId }, data: { soldCount: { increment: i.quantity } } }),
      ),
    ).catch(() => undefined);

    // Emails — never block order creation.
    this.mail
      .sendOrderEmails({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        address: order.address,
        city: order.city,
        postalCode: order.postalCode,
        notes: order.notes,
        items,
        subtotal,
        shippingFee,
        total,
        createdAt: order.createdAt,
      })
      .then((ok) =>
        this.prisma.order.update({ where: { id: order.id }, data: { emailsSent: ok } }).catch(() => undefined),
      );

    const whatsappUrl = this.buildWhatsappUrl({ ...order, items });
    this.audit.log({ action: 'CREATE', entity: 'Order', entityId: order.id, detail: { orderNumber, total } });

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal,
      shippingFee,
      total,
      items,
      whatsappUrl,
      createdAt: order.createdAt,
    };
  }

  /** Public order lookup by number + email (order tracking without auth). */
  async track(orderNumber: string, email: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });
    if (!order || order.customerEmail !== email.toLowerCase()) {
      throw new NotFoundException('Order not found. Check your order number and email.');
    }
    const { customerPhone: _p, ...safe } = order;
    return safe;
  }

  /** Return all orders belonging to a logged in user (by userId or matching email). */
  async myOrders(userId: string, email: string) {
    const orders = await this.prisma.order.findMany({
      where: {
        OR: [{ userId }, { customerEmail: email.toLowerCase() }],
      },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
    return orders.map((o) => ({
      ...o,
      whatsappUrl: this.buildWhatsappUrl({
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        customerEmail: o.customerEmail,
        customerPhone: o.customerPhone,
        address: o.address,
        city: o.city,
        postalCode: o.postalCode,
        items: o.items,
        subtotal: o.subtotal,
        shippingFee: o.shippingFee,
        total: o.total,
      }),
    }));
  }

  // ── Admin ──
  async list(q: ListOrdersDto) {
    const where: Prisma.OrderWhereInput = {
      ...(q.status ? { status: q.status } : {}),
      ...(q.q
        ? {
            OR: [
              { orderNumber: { contains: q.q, mode: 'insensitive' } },
              { customerName: { contains: q.q, mode: 'insensitive' } },
              { customerEmail: { contains: q.q, mode: 'insensitive' } },
              { customerPhone: { contains: q.q } },
            ],
          }
        : {}),
    };
    const [rows, total, stats] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...paginate(q.page, q.limit),
        include: { items: { select: { productName: true, quantity: true } } },
      }),
      this.prisma.order.count({ where }),
      this.prisma.order.groupBy({ by: ['status'], _count: true, orderBy: { status: 'asc' } }),
    ]);
    return { rows, meta: pageMeta(total, q.page, q.limit), stats };
  }

  async byId(id: string) {
    const order = await this.prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(actorId: string, id: string, status: Prisma.EnumOrderStatusFieldUpdateOperationsInput['set']) {
    const order = await this.prisma.order.update({ where: { id }, data: { status } });
    this.audit.log({ userId: actorId, action: 'STATUS_CHANGE', entity: 'Order', entityId: id, detail: { status } });
    return order;
  }

  async dashboardStats() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [todayCount, monthCount, pending, monthRevenue, totalOrders, subscribers, pendingReviews, messages] =
      await this.prisma.$transaction([
        this.prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
        this.prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
        this.prisma.order.count({ where: { status: 'PENDING' } }),
        this.prisma.order.aggregate({
          where: { createdAt: { gte: startOfMonth }, status: { not: 'CANCELLED' } },
          _sum: { total: true },
        }),
        this.prisma.order.count(),
        this.prisma.newsletterSubscriber.count({ where: { isActive: true } }),
        this.prisma.review.count({ where: { status: 'PENDING' } }),
        this.prisma.contactMessage.count({ where: { isRead: false } }),
      ]);
    const recent = await this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: { id: true, orderNumber: true, customerName: true, total: true, status: true, createdAt: true },
    });
    return {
      todayCount,
      monthCount,
      pending,
      monthRevenue: monthRevenue._sum.total ?? 0,
      totalOrders,
      subscribers,
      pendingReviews,
      unreadMessages: messages,
      recent,
    };
  }
}
