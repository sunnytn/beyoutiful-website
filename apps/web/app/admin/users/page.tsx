'use client';

import { ResourceManager, ResourceConfig } from '@/components/admin/ResourceManager';

interface Row {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  _count?: { orders: number };
}

const config: ResourceConfig<Row> = {
  title: 'Users',
  description: 'Admin, staff and customer accounts. Staff can manage content; only admins manage users and settings.',
  listPath: '/admin/users',
  createPath: '/admin/users',
  updatePath: (id) => `/admin/users/${id}`,
  deletePath: (id) => `/admin/users/${id}`,
  updateMethod: 'PATCH',
  fields: [
    { key: 'fullName', label: 'Full name', type: 'text', required: true },
    { key: 'email', label: 'Email', type: 'text', required: true },
    { key: 'password', label: 'Password', type: 'text', hint: 'Min 8 characters. Leave blank when editing to keep current password.' },
    {
      key: 'role', label: 'Role', type: 'select', required: true,
      options: [
        { value: 'ADMIN', label: 'Admin (full access)' },
        { value: 'STAFF', label: 'Staff (content & orders)' },
        { value: 'CUSTOMER', label: 'Customer' },
      ],
    },
    { key: 'isActive', label: 'Account active', type: 'boolean' },
  ],
  tableColumns: [
    { key: 'fullName', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'orders', label: 'Orders', render: (r) => r._count?.orders ?? 0 },
    { key: 'isActive', label: 'Active', render: (r) => (r.isActive ? '✅' : '—') },
  ],
};

export default function Page() {
  return <ResourceManager config={config} />;
}
