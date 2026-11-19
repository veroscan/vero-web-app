/* The registry record Vero just read: a certificate on a stack of filings, with the real number and date. */
export function RecordArt({ numberLabel, number, formed }: { numberLabel: string; number: string | null; formed: string | null }) {
  return (
    <svg viewBox="0 0 210 250" aria-hidden="true">
      <g transform="rotate(6 105 125)">
        <rect x="40" y="6" width="150" height="200" rx="12" fill="#9DDAF7" opacity=".35" />
      </g>
      <g transform="rotate(-4 105 125)">
        <rect x="22" y="22" width="150" height="200" rx="12" fill="#C9EAFB" opacity=".55" />
      </g>
      <rect x="20" y="34" width="160" height="206" rx="12" fill="#fff" />
      <rect x="36" y="52" width="52" height="6" rx="3" fill="#000066" />
      <rect x="36" y="66" width="96" height="4" rx="2" fill="#DCE4EF" />
      <rect x="36" y="88" width="128" height="30" rx="7" fill="#E3F3FD" />
      <text x="44" y="102" fontFamily="Plus Jakarta Sans" fontSize="8.5" fontWeight="700" fill="#8A90A8">
        {numberLabel}
      </text>
      <text x="44" y="113" fontFamily="Lowres Pixel" fontSize="13" fill="#000066">
        {number ? number.slice(0, 16) : 'Not given'}
      </text>
      <rect x="36" y="124" width="128" height="30" rx="7" fill="#E3F3FD" />
      <text x="44" y="138" fontFamily="Plus Jakarta Sans" fontSize="8.5" fontWeight="700" fill="#8A90A8">
        Formed
      </text>
      <text x="44" y="149" fontFamily="Lowres Pixel" fontSize="13" fill="#000066">
        {formed ?? 'Not given'}
      </text>
      <rect x="36" y="166" width="110" height="4" rx="2" fill="#E6ECF4" />
      <rect x="36" y="176" width="90" height="4" rx="2" fill="#E6ECF4" />
      <rect x="36" y="186" width="100" height="4" rx="2" fill="#E6ECF4" />
      <circle cx="146" cy="208" r="20" fill="none" stroke="#0182FA" strokeWidth="2" strokeDasharray="3 3" />
      <circle cx="146" cy="208" r="13" fill="#0182FA" />
      <path d="M140 208.5l4 4 8-8.5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
