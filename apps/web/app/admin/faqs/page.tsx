'use client';

import { ResourceManager, ResourceConfig } from '@/components/admin/ResourceManager';

interface Row {
  id: string;
  question: string;
  category: string;
  isActive: boolean;
  sortOrder: number;
}

const config: ResourceConfig<Row> = {
  title: 'FAQs',
  description: 'Site-wide questions shown on the FAQs page, in search, and by the advisor.',
  listPath: '/faqs?all=true',
  createPath: '/faqs',
  updatePath: (id) => `/faqs/${id}`,
  deletePath: (id) => `/faqs/${id}`,
  fields: [
    { key: 'question', label: 'Question', type: 'text', required: true },
    { key: 'answer', label: 'Answer', type: 'textarea', required: true },
    {
      key: 'category', label: 'Category', type: 'select', required: true,
      options: ['General', 'Orders', 'Shipping', 'Products', 'Hair', 'Skin'].map((c) => ({ value: c, label: c })),
    },
    { key: 'tags', label: 'Tags', type: 'tags' },
    { key: 'sortOrder', label: 'Sort order', type: 'number' },
    { key: 'isActive', label: 'Visible on site', type: 'boolean' },
  ],
  tableColumns: [
    { key: 'question', label: 'Question' },
    { key: 'category', label: 'Category' },
    { key: 'isActive', label: 'Active', render: (r) => (r.isActive ? '✅' : '—') },
  ],
};

export default function Page() {
  return <ResourceManager config={config} />;
}
