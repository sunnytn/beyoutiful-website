'use client';

import { ResourceManager, ResourceConfig } from '@/components/admin/ResourceManager';

interface Row {
  id: string;
  term: string;
  mapsTo: string[];
  isActive: boolean;
}

const config: ResourceConfig<Row> = {
  title: 'Search Synonyms',
  description:
    'Teach search what customers mean — map Urdu/Roman-Urdu or casual terms to products and concerns (e.g. "khushki" → dandruff).',
  listPath: '/search/admin/synonyms',
  createPath: '/search/admin/synonyms',
  updatePath: () => '/search/admin/synonyms',
  deletePath: (id) => `/search/admin/synonyms/${id}`,
  upsertViaCreate: true,
  fields: [
    { key: 'term', label: 'When a customer types…', type: 'text', required: true },
    { key: 'mapsTo', label: 'Search for these instead', type: 'tags', required: true, hint: 'Comma separated product slugs, concern slugs or words' },
    { key: 'isActive', label: 'Enabled', type: 'boolean' },
  ],
  tableColumns: [
    { key: 'term', label: 'Term' },
    { key: 'mapsTo', label: 'Maps to', render: (r) => r.mapsTo.join(', ') },
    { key: 'isActive', label: 'Active', render: (r) => (r.isActive ? '✅' : '—') },
  ],
};

export default function Page() {
  return <ResourceManager config={config} />;
}
