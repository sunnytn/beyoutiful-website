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
  title: 'Ingredients',
  description: 'The ingredient library shown on the storefront and linked from products.',
  listPath: '/ingredients?all=true',
  createPath: '/ingredients',
  updatePath: (id) => `/ingredients/${id}`,
  deletePath: (id) => `/ingredients/${id}`,
  uploadFolder: 'ingredients',
  fields: [
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'slug', label: 'Slug (URL)', type: 'text', hint: 'Leave blank to auto-generate' },
    { key: 'description', label: 'Description', type: 'textarea', required: true },
    { key: 'benefits', label: 'Benefits', type: 'tags', hint: 'Comma separated, e.g. "Deep moisture, Barrier repair"' },
    { key: 'imageUrl', label: 'Image', type: 'image' },
    { key: 'isActive', label: 'Visible on site', type: 'boolean' },
  ],
  tableColumns: [
    { key: 'name', label: 'Name' },
    { key: 'slug', label: 'Slug' },
    { key: 'products', label: 'Used in', render: (r) => `${r._count?.products ?? 0} products` },
    { key: 'isActive', label: 'Active', render: (r) => (r.isActive ? '✅' : '—') },
  ],
};

export default function Page() {
  return <ResourceManager config={config} />;
}
