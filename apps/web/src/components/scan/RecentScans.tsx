'use client';
/* "Recent scans" on the NewScan board: your own company and the ones you follow, from the API. */
import type { ScoreView } from '@vero/shared';
import { useRouter } from 'next/navigation';
import type { CSSProperties } from 'react';
import { Reveal } from '@/components/Motion';
import { useSession } from '@/components/Session';
import { useWatchlist } from '@/components/Shell';
import { TLink } from '@/components/TLink';
import { countryShort, whenWords } from '@/lib/format';
import { scoreText } from '@/lib/shell';

interface Row {
  key: string;
  name: string;
  sub: string;
  where: string;
  when: string;
  score: ScoreView;
  href: string;
}

export function useRecentRows(): Row[] | null {
  const session = useSession();
  const watchlist = useWatchlist();
  if (!watchlist && !session.root) return null;
  const rows: Row[] = [];
  const { root, overview } = session;
  if (root) {
    rows.push({
      key: root.id,
      name: root.legalName,
      sub: root.registrationNumber ? `Your company · ${root.registrationNumber}` : 'Your company',
      where: countryShort(root.incorporationCountry),
      when: overview?.scannedAt ? whenWords(overview.scannedAt) : 'Not scanned yet',
      score: overview?.score ?? { kind: 'none' },
      href: session.hasResult ? '/' : '/onboarding/questions',
    });
  }
  for (const item of watchlist?.companies ?? []) {
    rows.push({
      key: item.companyId,
      name: item.legalName,
      sub: item.scanInProgress ? 'Watchlist · scanning now' : 'Watchlist',
      where: countryShort(item.incorporationCountry),
      when: item.lastScannedAt ? whenWords(item.lastScannedAt) : 'Not scanned yet',
      score: item.score,
      href: `/watchlist/${item.companyId}`,
    });
  }
  return rows.slice(0, 6);
}

export function RecentScans({ rows, i = 1 }: { rows: Row[]; i?: number }) {
  const router = useRouter();
  return (
    <Reveal as="section" className="mod rec" i={i}>
      <div className="mh">
        <h2>Recent scans</h2>
        <span className="sub">Companies you have scanned or follow</span>
      </div>
      <table style={{ marginTop: 12 }}>
        <thead>
          <tr>
            <th>Company</th>
            <th>Where</th>
            <th>Last scan</th>
            <th style={{ textAlign: 'right' }}>Score</th>
          </tr>
        </thead>
        <tbody className="rows-in">
          {rows.map((row, index) => {
            const low = row.score.kind === 'exact' && row.score.value < 70;
            return (
              <tr key={row.key} style={{ '--r': index } as CSSProperties} onClick={() => router.push(row.href)}>
                <td>
                  <TLink href={row.href} onClick={(event) => event.stopPropagation()}>
                    <b>{row.name}</b>
                  </TLink>
                  <small>{row.sub}</small>
                </td>
                <td className="src2">{row.where}</td>
                <td className="src2">{row.when}</td>
                <td className={`pixel sc${low ? ' low' : ''}`}>{scoreText(row.score)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Reveal>
  );
}
