import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="vs">
      <main className="state">
        <h1 className="t-1">We can&apos;t find that page</h1>
        <p className="lead">It may have moved, or the link may be wrong.</p>
        <Link className="btn btn-ink btn-sm" href="/">
          Go to your home page
        </Link>
      </main>
    </div>
  );
}
