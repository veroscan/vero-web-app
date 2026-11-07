import { SectionHead } from "@/components/ui/SectionHead";
import { cssVars } from "@/lib/css";
import { cx } from "@/lib/cx";

interface NdMockRbItem {
  readonly tone: string;
  readonly w: string;
}

const ND_MOCK_RB_ITEMS: readonly NdMockRbItem[] = [
  { tone: "r", w: "49%" },
  { tone: "w", w: "68%" },
  { tone: "w", w: "74%" },
  { tone: "g", w: "88%" },
];

interface SvRelMediaNdMockItem {
  readonly emphasis: string;
  readonly tone: string;
}

const SV_REL_MEDIA_ND_MOCK_ITEMS: readonly SvRelMediaNdMockItem[] = [
  { emphasis: "Checked with Companies House today", tone: "g" },
  { emphasis: "Found on the NDPC list", tone: "g" },
  { emphasis: "You uploaded this and we read it", tone: "w" },
  { emphasis: "A lawyer read this", tone: "g" },
];

export function InvestorExamples() {
  return (
    <section className="pad-sm">
      <div className="wrap">
        <SectionHead eyebrow="Keep reading" title="See it for yourself." />
        <div className="sv-rels">
          <a className="sv-rel" href="/sample-report" data-reveal="">
            <div className="sv-rel-media">
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
                  {ND_MOCK_RB_ITEMS.map((item) => (
                    <u key={item.w} className={cx(item.tone)} style={cssVars({ "--w": item.w })}></u>
                  ))}
                </i>
              </span>
            </div>
            <small>Resource</small>
            <h3>Sample report</h3>
            <span className="res-more">
              Open
              <i>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 17 17 7M8 7h9v9" />
                </svg>
              </i>
            </span>
          </a>
          <a className="sv-rel" href="/methodology" data-reveal="">
            <div className="sv-rel-media">
              <span className="nd-mock vm m-src" aria-hidden="true">
                {SV_REL_MEDIA_ND_MOCK_ITEMS.map((item) => (
                  <i key={item.emphasis} className="sr">
                    <b className={cx(item.tone)}></b>
                    <em>{item.emphasis}</em>
                  </i>
                ))}
              </span>
            </div>
            <small>Resource</small>
            <h3>Methodology</h3>
            <span className="res-more">
              Open
              <i>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 17 17 7M8 7h9v9" />
                </svg>
              </i>
            </span>
          </a>
          <a className="sv-rel" href="/for-founders" data-reveal="">
            <div className="sv-rel-media">
              <span className="nd-mock vm m-score" aria-hidden="true">
                <i className="sc">
                  <b>72</b>
                  <em>out of 100</em>
                </i>
                <i className="rw">
                  <b></b>
                  <em>Code ownership</em>
                  <u className="r">Urgent</u>
                </i>
                <i className="rw">
                  <b></b>
                  <em>Data protection</em>
                  <u className="w">Important</u>
                </i>
              </span>
            </div>
            <small>Solutions</small>
            <h3>For founders</h3>
            <span className="res-more">
              Open
              <i>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 17 17 7M8 7h9v9" />
                </svg>
              </i>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
