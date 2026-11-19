import Link from 'next/link';
import { MissingPage } from '@/components/MissingPage';
import { PublicMessage } from '@/components/PublicBar';

export default function NotFound() {
  return (
    <PublicMessage kicker="404 · Page not found" title="We can't find that page" art={<MissingPage />}>
      <p>It may have moved, or the link may be wrong.</p>
      <div className="btns">
        <Link className="btn btn-w btn-lg" href="/">
          Go to your home page
        </Link>
      </div>
    </PublicMessage>
  );
}
