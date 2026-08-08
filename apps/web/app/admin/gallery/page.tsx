'use client';

import { ResourceManager, ResourceConfig } from '@/components/admin/ResourceManager';

interface Row {
  id: string;
  title: string;
  concern: string | null;
  durationLabel: string | null;
  isActive: boolean;
}

const config: ResourceConfig<Row> = {
  title: 'Before / After Gallery',
  description: 'Real customer transformations shown on the Before & After page and in advisor results.',
  listPath: '/gallery?all=true',
  createPath: '/gallery',
  updatePath: (id) => `/gallery/${id}`,
  deletePath: (id) => `/gallery/${id}`,
  uploadFolder: 'gallery',
  fields: [
    { key: 'title', label: 'Title', type: 'text', required: true },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'beforeUrl', label: 'Before photo', type: 'image', required: true },
    { key: 'afterUrl', label: 'After photo', type: 'image', required: true },
    { key: 'durationLabel', label: 'Duration label', type: 'text', hint: 'e.g. "12 weeks"' },
    { key: 'concern', label: 'Concern slug', type: 'text', hint: 'e.g. hair-fall, dullness — used by the advisor' },
    { key: 'productSlug', label: 'Product slug', type: 'text', hint: 'Links "shop the product used"' },
    { key: 'sortOrder', label: 'Sort order', type: 'number' },
    { key: 'isActive', label: 'Visible on site', type: 'boolean' },
  ],
  tableColumns: [
    { key: 'title', label: 'Title' },
    { key: 'concern', label: 'Concern' },
    { key: 'durationLabel', label: 'Duration' },
    { key: 'isActive', label: 'Active', render: (r) => (r.isActive ? '✅' : '—') },
  ],
};

export default function Page() {
  return <ResourceManager config={config} />;
}
