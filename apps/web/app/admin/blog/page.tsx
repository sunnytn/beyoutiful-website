'use client';

import { ResourceManager, ResourceConfig } from '@/components/admin/ResourceManager';

interface Row {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  publishedAt: string;
}

const config: ResourceConfig<Row> = {
  title: 'Blog Posts',
  description: 'Write in Markdown — headings (##), bold (**text**), lists (-) and links ([text](url)) are supported.',
  listPath: '/blog/admin/all?limit=60',
  createPath: '/blog',
  updatePath: (id) => `/blog/${id}`,
  deletePath: (id) => `/blog/${id}`,
  uploadFolder: 'blog',
  fields: [
    { key: 'title', label: 'Title', type: 'text', required: true },
    { key: 'slug', label: 'Slug (URL)', type: 'text', hint: 'Leave blank to auto-generate' },
    { key: 'excerpt', label: 'Excerpt', type: 'textarea', required: true },
    { key: 'content', label: 'Content (Markdown)', type: 'textarea', required: true },
    { key: 'coverImageUrl', label: 'Cover image', type: 'image' },
    { key: 'tags', label: 'Tags', type: 'tags' },
    { key: 'author', label: 'Author', type: 'text' },
    { key: 'metaTitle', label: 'SEO title', type: 'text' },
    { key: 'metaDescription', label: 'SEO description', type: 'textarea' },
    { key: 'isPublished', label: 'Published', type: 'boolean' },
  ],
  tableColumns: [
    { key: 'title', label: 'Title' },
    { key: 'slug', label: 'Slug' },
    { key: 'isPublished', label: 'Published', render: (r) => (r.isPublished ? '✅' : '📝 draft') },
  ],
};

export default function Page() {
  return <ResourceManager config={config} />;
}
