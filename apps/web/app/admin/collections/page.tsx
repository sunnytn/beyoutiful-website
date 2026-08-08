'use client';

import { ResourceManager, ResourceConfig } from '@/components/admin/ResourceManager';

interface Row {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  _count?: { products: number };
}

const config: ResourceConfig<Row> = {
  title: 'Collections',
  description: 'Curated groups like Best Sellers, Gift Sets or seasonal edits.',
  listPath: '/collections?all=true',
  createPath: '/collections',
  updatePath: (id) => `/collections/${id}`,
  deletePath: (id) => `/collections/${id}`,
  uploadFolder: 'collections',
  fields: [
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'slug', label: 'Slug (URL)', type: 'text', hint: 'Leave blank to auto-generate' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'imageUrl', label: 'Image', type: 'image' },
    { key: 'sortOrder', label: 'Sort order', type: 'number' },
    { key: 'isActive', label: 'Visible on site', type: 'boolean' },
  ],
  tableColumns: [
    { key: 'name', label: 'Name' },
    { key: 'slug', label: 'Slug' },
    { key: 'products', label: 'Products', render: (r) => r._count?.products ?? 0 },
    { key: 'isActive', label: 'Active', render: (r) => (r.isActive ? '✅' : '—') },
  ],
};

export default function Page() {
  return <ResourceManager config={config} />;
}
