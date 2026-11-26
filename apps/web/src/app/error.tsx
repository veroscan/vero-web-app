'use client';

import { useEffect } from 'react';
import { PublicMessage } from '@/components/PublicBar';

/** What anyone sees when a page breaks. An error page can't export a title, so it is set here. */
export default function ErrorPage({ reset }: { reset: () => void }) {
  useEffect(() => {
    const before = document.title;
    document.title = 'Something went wrong | Vero';
    return () => {
      document.title = before;
    };
  }, []);
  return (
    <PublicMessage kicker="Something broke" title="Something went wrong" role="alert">
      <p>That&apos;s on our side, not yours. Try again, and if it keeps happening, come back in a few minutes.</p>
      <div className="btns">
        <button className="btn btn-w btn-lg" type="button" onClick={reset}>
          Try again
        </button>
        <a className="btn btn-g btn-lg" href="/">
          Go to your home page
        </a>
      </div>
    </PublicMessage>
  );
}
