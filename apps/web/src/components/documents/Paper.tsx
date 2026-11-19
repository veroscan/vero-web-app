/* One paper in the company file on the Documents page (board: Documents, "Company file").
   In order: a filled page with a green tick. With a problem: a page with a marked line and an amber mark.
   Missing: a dashed outline, with the points it would add when the API says. Being read: the scan line.
   Colours come from styles/pages/documents.css so the dark theme maps them. */

import type { SlotKind } from '@/lib/documents';

const OUTLINE = 'M4 2h46l20 20v66a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4z';
const FOLD = 'M50 2v16a4 4 0 0 0 4 4h16';

export function PaperArt({ kind, gain }: { kind: SlotKind; gain?: number | null }) {
  if (kind === 'missing') {
    return (
      <svg viewBox="0 0 76 94" aria-hidden="true">
        <path className="pm" d={OUTLINE} strokeWidth="1.5" strokeDasharray="5 4" />
        {gain && gain > 0 ? (
          <text className="pgn" x="35" y="56" textAnchor="middle">
            +{gain}
          </text>
        ) : (
          <path className="pmp" d="M35 41v14M28 48h14" strokeWidth="2" strokeLinecap="round" />
        )}
      </svg>
    );
  }
  if (kind === 'problem') {
    return (
      <svg viewBox="0 0 76 94" aria-hidden="true">
        <path className="pw" d={OUTLINE} />
        <path className="pfw" d={FOLD} />
        <rect className="ph" x="10" y="12" width="26" height="5" rx="2.5" />
        <g className="pl">
          <rect x="10" y="28" width="46" height="4" rx="2" />
          <rect x="10" y="36" width="38" height="4" rx="2" />
        </g>
        <rect className="pwb" x="7" y="47" width="56" height="14" rx="3" />
        <rect className="pwl" x="11" y="52" width="30" height="4" rx="2" />
        <rect className="pl" x="10" y="68" width="42" height="4" rx="2" />
        <circle className="mpr" cx="60" cy="80" r="10" strokeWidth="2.5" />
        <path className="mmk" d="M60 75v6M60 84.5v.5" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    );
  }
  const page = (
    <>
      <path className="pw" d={OUTLINE} />
      <path className="pf" d={FOLD} />
      <rect className="ph" x="10" y="12" width="26" height="5" rx="2.5" />
      <g className="pl">
        <rect x="10" y="28" width="50" height="4" rx="2" />
        <rect x="10" y="36" width="50" height="4" rx="2" />
        <rect x="10" y="44" width="40" height="4" rx="2" />
      </g>
    </>
  );
  if (kind === 'reading') {
    return (
      <span className="sheetbox">
        <svg viewBox="0 0 76 94" aria-hidden="true">
          {page}
        </svg>
        <span className="scanline" />
      </span>
    );
  }
  return (
    <svg viewBox="0 0 76 94" aria-hidden="true">
      {page}
      <circle className="pss" cx="17" cy="78" r="7" strokeWidth="1.6" />
      <circle className="ps" cx="17" cy="78" r="3" />
      <circle className="mok" cx="60" cy="80" r="10" strokeWidth="2.5" />
      <path className="mmk" d="M55.5 80.5l3 3 6-6.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
