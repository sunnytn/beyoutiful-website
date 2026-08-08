'use client';

import { ResourceManager, ResourceConfig } from '@/components/admin/ResourceManager';

interface Row {
  id: string;
  path: string;
  metaTitle: string | null;
  noIndex: boolean;
}

const config: ResourceConfig<Row> = {
  title: 'SEO Overrides',
  description:
    'Override meta title, description, OG image and canonical URL for any page path. Products and blog posts also have their own SEO fields in their editors.',
  listPath: '/seo/admin/entries',
  createPath: '/seo/admin/entries',
  updatePath: () => '/seo/admin/entries',
  deletePath: (id) => `/seo/admin/entries/${id}`,
  updateMethod: 'PUT',
  upsertViaCreate: false,
  fields: [
    { key: 'path', label: 'Page path', type: 'text', required: true, hint: 'e.g. /about or /shop/rose-water' },
    { key: 'metaTitle', label: 'Meta title', type: 'text' },
    { key: 'metaDescription', label: 'Meta description', type: 'textarea' },
    { key: 'ogImageUrl', label: 'Social share image', type: 'image' },
    { key: 'canonicalUrl', label: 'Canonical URL', type: 'text' },
    { key: 'noIndex', label: 'Hide from search engines (noindex)', type: 'boolean' },
  ],
  tableColumns: [
    { key: 'path', label: 'Path' },
    { key: 'metaTitle', label: 'Title' },
    { key: 'noIndex', label: 'NoIndex', render: (r) => (r.noIndex ? '🚫' : '—') },
  ],
  uploadFolder: 'seo',
};

export default function Page() {
  return <ResourceManager config={config} />;
}
