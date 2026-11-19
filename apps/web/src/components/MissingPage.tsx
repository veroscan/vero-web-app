/** A stack of pages with the front one missing: the page that isn't there. Flat, brand blues. */
export function MissingPage() {
  return (
    <svg className="art" viewBox="0 0 150 120" aria-hidden="true">
      <g transform="rotate(6 75 60)">
        <rect x="52" y="8" width="66" height="88" rx="9" fill="#1B2BD6" opacity=".55" />
        <rect x="40" y="18" width="66" height="88" rx="9" fill="#0182FA" opacity=".7" />
        <rect x="28" y="28" width="66" height="88" rx="9" fill="rgba(255,255,255,.06)" stroke="#9DDAF7" strokeWidth="2" strokeDasharray="6 5" />
        <text x="61" y="80" textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="700" fontSize="24" fill="#9DDAF7">?</text>
      </g>
    </svg>
  );
}
