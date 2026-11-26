import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PublicHero } from '@/components/PublicBar';

const DOCS: Record<string, { title: string; about: string }> = {
  terms: { title: 'Terms', about: 'The agreement between you and Vero when you use it.' },
  privacy: { title: 'Privacy policy', about: 'What Vero keeps about you and your companies, and why.' },
};

export function generateStaticParams(): { doc: string }[] {
  return Object.keys(DOCS).map((doc) => ({ doc }));
}

export async function generateMetadata({ params }: { params: Promise<{ doc: string }> }): Promise<Metadata> {
  const { doc } = await params;
  const page = DOCS[doc];
  return page ? { title: page.title, description: page.about } : { title: 'Page not found' };
}

export default async function LegalPage({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  const page = DOCS[doc];
  if (!page) notFound();
  const other = doc === 'terms' ? { href: '/legal/privacy', label: 'Privacy policy' } : { href: '/legal/terms', label: 'Terms' };
  return (
    <div className="pg-pub">
      <PublicHero size="short">
        <div className="content wrap narrow">
          <div className="ph2">
            <div className="k">Legal</div>
            <h1 className="disp">{page.title}</h1>
            <div className="meta">
              <span>{page.about}</span>
            </div>
          </div>
        </div>
      </PublicHero>
      <main className="mod doc" data-testid="legal-doc">
        <h2>Being written</h2>
        <p>The final wording is being prepared and will be published here before Vero opens to everyone.</p>
        <p>Until then, Vero shows what official registers and the documents you add say. It is not legal advice.</p>
        <div className="docfoot">
          {/* Not prefetched: signed in, /sign-in redirects to the app and the prefetch would 404. */}
          <Link className="btn btn-g" href="/sign-in" prefetch={false}>
            Back to sign in
          </Link>
          <Link className="link" href={other.href}>
            {other.label}
          </Link>
        </div>
      </main>
    </div>
  );
}
