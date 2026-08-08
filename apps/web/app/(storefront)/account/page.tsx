'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useCustomerAuth } from '@/lib/stores';
import { formatPrice } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface OrderItem {
  id: string;
  productName: string;
  variantName?: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  whatsappUrl?: string;
  createdAt: string;
  items: OrderItem[];
}

const statusTones: Record<Order['status'], 'forest' | 'cream' | 'clay' | 'outline'> = {
  PENDING: 'cream',
  CONFIRMED: 'forest',
  PACKED: 'forest',
  SHIPPED: 'forest',
  DELIVERED: 'forest',
  CANCELLED: 'clay',
};

export default function AccountPage() {
  const router = useRouter();
  const { user, accessToken, logout } = useCustomerAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (!accessToken || !user) {
      router.push('/account/login');
      return;
    }
    api<Order[]>('/orders/my-orders', { token: accessToken })
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [accessToken, user, router, mounted]);

  if (!mounted || loading) {
    return (
      <div className="container-luxe py-20 text-center text-sm text-ink-soft">
        Loading account details…
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container-luxe py-12 lg:py-16">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cream-300 pb-6">
        <div>
          <span className="eyebrow">Customer Account</span>
          <h1 className="font-display text-3xl text-forest-800 mt-1">Hello, {user.fullName}</h1>
          <p className="mt-1 text-sm text-ink-soft">{user.email} {user.phone ? `· ${user.phone}` : ''}</p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            logout();
            router.push('/');
          }}
        >
          Sign Out
        </Button>
      </div>

      {/* content */}
      <div className="mt-10">
        <h2 className="font-display text-xl text-forest-800 mb-6">Order History</h2>

        {orders.length === 0 ? (
          <div className="rounded-organic bg-white p-12 text-center shadow-soft">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream-200 text-2xl">
              📦
            </div>
            <h3 className="mt-4 font-display text-lg text-forest-800">No orders yet</h3>
            <p className="mt-1.5 text-sm text-ink-soft">You haven't placed any orders with this account yet.</p>
            <Link href="/shop" className="mt-6 inline-block">
              <Button size="md">Explore Catalog</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="overflow-hidden rounded-organic bg-white p-6 shadow-soft">
                {/* order meta */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream-200 pb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-lg text-forest-800">{order.orderNumber}</span>
                      <Badge tone={statusTones[order.status]}>{order.status}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-ink-faint">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="font-display text-xl text-forest-800">{formatPrice(order.total)}</span>
                    <p className="text-xs text-ink-faint">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                  </div>
                </div>

                {/* items list */}
                <div className="divide-y divide-cream-100 py-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 text-sm">
                      <div>
                        <span className="font-medium text-ink">{item.productName}</span>
                        {item.variantName && <span className="ml-2 text-xs text-ink-faint">({item.variantName})</span>}
                        <span className="ml-2 text-xs text-ink-soft">× {item.quantity}</span>
                      </div>
                      <span className="font-semibold text-ink-soft">{formatPrice(item.lineTotal)}</span>
                    </div>
                  ))}
                </div>

                {/* footer */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-cream-200 pt-4 text-xs text-ink-soft">
                  <div>
                    <span className="font-semibold text-ink">Shipping Address:</span> {order.address}, {order.city}
                  </div>

                  {order.whatsappUrl && (
                    <a
                      href={order.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-medium text-forest-700 hover:text-forest-800 hover:underline"
                    >
                      <span>💬 Track via WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
