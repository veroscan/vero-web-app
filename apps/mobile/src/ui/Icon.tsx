import Svg, { Circle, Path, Rect } from 'react-native-svg';

/** The mobile kit's line icons (24 x 24, 1.8 stroke, round caps), from the m-* symbols in the boards. */
const shapes = {
  arrow: [<Path key="a" d="M5 12h14M13 6l6 6-6 6" />],
  back: [<Path key="a" d="M15 6l-6 6 6 6" />],
  bell: [<Path key="a" d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8" />, <Path key="b" d="M10 20a2 2 0 0 0 4 0" />],
  cal: [<Rect key="a" x="4" y="5" width="16" height="16" rx="3" />, <Path key="b" d="M8 3v4M16 3v4M4 10h16" />],
  check: [<Path key="a" d="M5 12.5l4.5 4.5L19 7.5" />],
  chev: [<Path key="a" d="M9 6l6 6-6 6" />],
  doc: [<Path key="a" d="M7 3h7l5 5v13H7z" />, <Path key="b" d="M14 3v5h5M10 13h6M10 17h6" />],
  down: [<Path key="a" d="M7 10l5 5 5-5" />],
  eye: [<Path key="a" d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />, <Circle key="b" cx="12" cy="12" r="3" />],
  flag: [<Path key="a" d="M5 21V4M5 4h11l-2 4 2 4H5" />],
  globe: [<Circle key="a" cx="12" cy="12" r="9" />, <Path key="b" d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" />],
  home: [<Path key="a" d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />],
  plus: [<Path key="a" d="M12 5v14M5 12h14" />],
  search: [<Circle key="a" cx="11" cy="11" r="7" />, <Path key="b" d="m20 20-3.5-3.5" />],
  share: [<Path key="a" d="M12 3v12M7 8l5-5 5 5" />, <Path key="b" d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />],
  upload: [<Path key="a" d="M12 16V4M6 10l6-6 6 6" />, <Path key="b" d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />],
  x: [<Path key="a" d="M6 6l12 12M18 6L6 18" />],
  // Extras in the same style, for screens the boards only hint at.
  lock: [<Rect key="a" x="5" y="11" width="14" height="10" rx="2.5" />, <Path key="b" d="M8 11V8a4 4 0 0 1 8 0v3" />],
  mail: [<Rect key="a" x="3" y="5" width="18" height="14" rx="3" />, <Path key="b" d="m4 7 8 6 8-6" />],
  moon: [<Path key="a" d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />],
  sun: [<Circle key="a" cx="12" cy="12" r="4" />, <Path key="b" d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />],
  link: [<Path key="a" d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />, <Path key="b" d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />],
  trash: [<Path key="a" d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />],
  clock: [<Circle key="a" cx="12" cy="12" r="9" />, <Path key="b" d="M12 7v5l3 2" />],
  building: [<Path key="a" d="M4 21V5l8-2v18M12 8l8 3v10M4 21h16M8 8v.01M8 12v.01M8 16v.01M16 14v.01M16 17v.01" />],
  sparkle: [<Path key="a" d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />],
  out: [<Path key="a" d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l4-4-4-4M14 12H4" />],
} as const;

export type IconName = keyof typeof shapes;

export function Icon({ name, size = 22, color = 'currentColor', stroke = 1.8 }: { name: IconName; size?: number; color?: string; stroke?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {shapes[name]}
    </Svg>
  );
}
