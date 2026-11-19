import Link from 'next/link';

export function ComingNext({ title, note, backHref = '/', backLabel = 'Back to home' }: { title: string; note: string; backHref?: string; backLabel?: string }) {
  return (
    <main className="state" data-testid="coming-next">
      <h1 className="t-1">{title}</h1>
      <p className="lead">{note}</p>
      <p className="note">
        <span className="b">Coming next.</span>
        <span>This screen isn&apos;t built yet.</span>
      </p>
      <Link className="btn btn-line btn-sm" href={backHref}>
        {backLabel}
      </Link>
    </main>
  );
}
