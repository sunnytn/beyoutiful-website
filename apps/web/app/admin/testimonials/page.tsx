'use client';

import { ResourceManager, ResourceConfig } from '@/components/admin/ResourceManager';

interface Row {
  id: string;
  name: string;
  location: string | null;
  rating: number;
  isActive: boolean;
}

const config: ResourceConfig<Row> = {
  title: 'Testimonials',
  description: 'Customer quotes shown on the homepage and testimonials page.',
  listPath: '/testimonials?all=true',
  createPath: '/testimonials',
  updatePath: (id) => `/testimonials/${id}`,
  deletePath: (id) => `/testimonials/${id}`,
  uploadFolder: 'testimonials',
  fields: [
    { key: 'name', label: 'Customer name', type: 'text', required: true },
    { key: 'location', label: 'City', type: 'text' },
    { key: 'rating', label: 'Rating (1–5)', type: 'number' },
    { key: 'text', label: 'Testimonial', type: 'textarea', required: true },
    { key: 'productSlug', label: 'Product slug (optional)', type: 'text', hint: 'Links "shop what they used"' },
    { key: 'avatarUrl', label: 'Photo (optional)', type: 'image' },
    { key: 'sortOrder', label: 'Sort order', type: 'number' },
    { key: 'isActive', label: 'Visible on site', type: 'boolean' },
  ],
  tableColumns: [
    { key: 'name', label: 'Name' },
    { key: 'location', label: 'City' },
    { key: 'rating', label: 'Rating', render: (r) => '★'.repeat(r.rating) },
    { key: 'isActive', label: 'Active', render: (r) => (r.isActive ? '✅' : '—') },
  ],
};

export default function Page() {
  return <ResourceManager config={config} />;
}
