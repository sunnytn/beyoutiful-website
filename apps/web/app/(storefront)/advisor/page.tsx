import { Suspense } from 'react';
import { buildMetadata } from '@/lib/seo';
import { AdvisorWizard } from '@/components/advisor/AdvisorWizard';

export const metadata = buildMetadata({
  title: 'AI Hair & Skin Advisor — Find My Perfect Products',
  description:
    'Answer a few quick questions about your hair or skin and get a personalised routine — products, usage guides, articles and real results, matched to you.',
  path: '/advisor',
});

export default function AdvisorPage() {
  return (
    <div className="container-luxe py-14 lg:py-20">
      <Suspense>
        <AdvisorWizard />
      </Suspense>
    </div>
  );
}
