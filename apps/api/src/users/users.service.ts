import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async list(page = 1, limit = 20, role?: UserRole) {
    const where = role ? { role } : {};
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, email: true, fullName: true, phone: true, role: true,
          isActive: true, createdAt: true, _count: { select: { orders: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { rows, total, page, limit };
  }

  async create(actorId: string, dto: { email: string; password: string; fullName: string; role: UserRole; phone?: string }) {
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash: await bcrypt.hash(dto.password, 12),
        fullName: dto.fullName,
        role: dto.role,
        phone: dto.phone,
      },
      select: { id: true, email: true, fullName: true, role: true },
    });
    this.audit.log({ userId: actorId, action: 'CREATE', entity: 'User', entityId: user.id });
    return user;
  }

  async update(actorId: string, id: string, dto: { fullName?: string; role?: UserRole; isActive?: boolean; password?: string; phone?: string }) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('User not found');
    if (existing.id === actorId && (dto.isActive === false || (dto.role && dto.role !== 'ADMIN'))) {
      throw new BadRequestException('You cannot deactivate or demote your own account');
    }
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        fullName: dto.fullName,
        role: dto.role,
        isActive: dto.isActive,
        phone: dto.phone,
        ...(dto.password ? { passwordHash: await bcrypt.hash(dto.password, 12) } : {}),
      },
      select: { id: true, email: true, fullName: true, role: true, isActive: true },
    });
    this.audit.log({ userId: actorId, action: 'UPDATE', entity: 'User', entityId: id });
    return user;
  }

  async remove(actorId: string, id: string) {
    if (actorId === id) throw new BadRequestException('You cannot delete your own account');
    await this.prisma.user.delete({ where: { id } });
    this.audit.log({ userId: actorId, action: 'DELETE', entity: 'User', entityId: id });
    return { success: true };
  }
}
