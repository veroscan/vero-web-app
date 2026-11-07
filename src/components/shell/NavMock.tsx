import { cssVars } from "@/lib/css";
import type { NavMockId } from "@/lib/site";

type Tone = "g" | "w" | "r";

const SCORE_ROWS: readonly { label: string; tone: Tone; word: string }[] = [
  { label: "Code ownership", tone: "r", word: "Urgent" },
  { label: "Data protection", tone: "w", word: "Important" },
  { label: "Annual filing", tone: "g", word: "Done" },
];

const PORTFOLIO_ROWS: readonly { company: string; tone: Tone; score: number }[] = [
  { company: "Kestrel Pay", tone: "w", score: 72 },
  { company: "Ndani Health", tone: "g", score: 81 },
  { company: "Atlas Robotics", tone: "r", score: 46 },
  { company: "Lumen Labs", tone: "w", score: 64 },
];

const SOURCE_ROWS: readonly { label: string; tone: Tone }[] = [
  { label: "Checked with Companies House today", tone: "g" },
  { label: "Found on the NDPC list", tone: "g" },
  { label: "You uploaded this and we read it", tone: "w" },
  { label: "You told us", tone: "w" },
  { label: "A lawyer read this", tone: "g" },
];

const REPORT_BARS: readonly { tone: Tone; width: string }[] = [
  { tone: "r", width: "49%" },
  { tone: "w", width: "68%" },
  { tone: "w", width: "74%" },
  { tone: "g", width: "88%" },
];

const SECURITY_LINES = [
  "Your documents are encrypted",
  "Only your team can open them",
  "You can delete them any time",
] as const;

/** Miniature product screens shown in the header dropdown previews. */
export function NavMock({ id }: { id: NavMockId }) {
  switch (id) {
    case "founders":
      return (
        <span className="nd-mock vm m-score" aria-hidden="true">
          <i className="sc">
            <b>72</b>
            <em>out of 100</em>
          </i>
          <i className="rl">
            <u></u>
          </i>
          {SCORE_ROWS.map((row) => (
            <i className="rw" key={row.label}>
              <b></b>
              <em>{row.label}</em>
              <u className={row.tone}>{row.word}</u>
            </i>
          ))}
        </span>
      );
    case "investors":
      return (
        <span className="nd-mock vm m-port" aria-hidden="true">
          <i className="ph">
            <em>Portfolio</em>
            <u>4 companies</u>
          </i>
          {PORTFOLIO_ROWS.map((row) => (
            <i className="pr" key={row.company}>
              <em>{row.company}</em>
              <b className={row.tone}>{row.score}</b>
            </i>
          ))}
        </span>
      );
    case "method":
      return (
        <span className="nd-mock vm m-src" aria-hidden="true">
          {SOURCE_ROWS.map((row) => (
            <i className="sr" key={row.label}>
              <b className={row.tone}></b>
              <em>{row.label}</em>
            </i>
          ))}
        </span>
      );
    case "sample":
      return (
        <span className="nd-mock vm m-rep" aria-hidden="true">
          <i className="rh">
            <em>Kestrel Pay Inc.</em>
            <u>Example</u>
          </i>
          <i className="rs">
            <b>72</b>
            <em>Needs work</em>
          </i>
          <i className="rb">
            {REPORT_BARS.map((bar) => (
              <u key={bar.width} className={bar.tone} style={cssVars({ "--w": bar.width })}></u>
            ))}
          </i>
        </span>
      );
    case "insights":
      return (
        <span className="nd-mock vm m-art" aria-hidden="true">
          <i className="at">
            <u>Compliance</u>
          </i>
          <i className="ah"></i>
          <i className="ah s"></i>
          <i className="ap"></i>
          <i className="ap"></i>
          <i className="ap s"></i>
          <i className="ap"></i>
        </span>
      );
    case "security":
      return (
        <span className="nd-mock vm m-sec" aria-hidden="true">
          <i className="sh">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </i>
          {SECURITY_LINES.map((line) => (
            <i className="sl" key={line}>
              <em>{line}</em>
              <b className="g"></b>
            </i>
          ))}
        </span>
      );
  }
}
