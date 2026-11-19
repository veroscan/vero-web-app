'use client';

import { PublicMessage } from '@/components/PublicBar';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <PublicMessage kicker="Something broke" title="Something went wrong" role="alert">
      <p>That&apos;s on our side, not yours. Please try again.</p>
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
