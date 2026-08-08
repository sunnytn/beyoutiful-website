import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { OrdersService } from './orders.service';
import { CreateOrderDto, ListOrdersDto, UpdateOrderStatusDto } from './orders.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  @Throttle({ strict: { ttl: 60_000, limit: 5 } })
  create(@Body() dto: CreateOrderDto) {
    return this.orders.create(dto);
  }

  @Get('track')
  track(@Query('orderNumber') orderNumber: string, @Query('email') email: string) {
    return this.orders.track(orderNumber, email);
  }

  @Get('my-orders')
  @UseGuards(JwtAuthGuard)
  myOrders(@CurrentUser() user: AuthUser) {
    return this.orders.myOrders(user.id, user.email);
  }

  // ── Admin ──
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  list(@Query() q: ListOrdersDto) {
    return this.orders.list(q);
  }

  @Get('stats/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  stats() {
    return this.orders.dashboardStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  byId(@Param('id') id: string) {
    return this.orders.byId(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  updateStatus(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.orders.updateStatus(user.id, id, dto.status);
  }
}
