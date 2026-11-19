'use client';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="vs">
      <main className="state" role="alert">
        <h1 className="t-2">Something went wrong</h1>
        <p className="quiet">That&apos;s on our side. Please try again.</p>
        <button className="btn btn-ink btn-sm" type="button" onClick={reset}>
          Try again
        </button>
      </main>
    </div>
  );
}
