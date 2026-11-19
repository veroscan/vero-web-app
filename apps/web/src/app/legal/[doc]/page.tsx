import { notFound } from 'next/navigation';
import { ComingNext } from '@/components/ComingNext';

const DOCS: Record<string, string> = { terms: 'Terms', privacy: 'Privacy policy' };

export default async function LegalPage({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  const title = DOCS[doc];
  if (!title) notFound();
  return (
    <div className="vs">
      <ComingNext title={title} note="The final wording will be published here." backHref="/sign-in" backLabel="Back to sign in" />
    </div>
  );
}
