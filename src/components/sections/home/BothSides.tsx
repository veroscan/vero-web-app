import { Button } from "@/components/ui/Button";
import { SectionHead } from "@/components/ui/SectionHead";
import { cssVars } from "@/lib/css";
import { cx } from "@/lib/cx";

interface MkWinMkTableItem {
  readonly text: string;
  readonly risk: string;
  readonly tone: string;
}

const MK_WIN_MK_TABLE_ITEMS: readonly MkWinMkTableItem[] = [
  { text: "Get the code signed over to your company", risk: "Urgent", tone: "risk" },
  { text: "File your UK confirmation statement", risk: "Important", tone: "watch" },
  { text: "Register with the NDPC", risk: "Important", tone: "watch" },
];

interface MkWinMkTableItem2 {
  readonly text: string;
  readonly watch: string;
  readonly tone: string;
}

const MK_WIN_MK_TABLE_ITEMS_2: readonly MkWinMkTableItem2[] = [
  { text: "Kestrel Pay Inc.", watch: "72 · Needs work", tone: "watch" },
  { text: "Ndani Health Ltd", watch: "81 · Healthy", tone: "good" },
  { text: "Atlas Robotics GmbH", watch: "46 · At risk", tone: "risk" },
];

export function BothSides() {
  return (
    <section className="pad" aria-labelledby="fi-title">
      <div className="wrap">
        <SectionHead
          eyebrow="Founders and investors"
          title="The same facts, read from both sides of the table."
          id="fi-title"
          intro="A founder sees what to fix. An investor sees what is there. Both see the same sources."
        />
        <div className="pstack">
          <article className="pcard" style={cssVars({ "--i": 0 })}>
            <div className="pcard-copy">
              <span className="pc-n">For founders</span>
              <h3>Know your score before your investors ask.</h3>
              <p>
                Scan your company in minutes. Fix the urgent problems first. Earn a badge you can put on your
                website.
              </p>
              <div>
                <Button variant="green" href="/for-founders">For founders</Button>
              </div>
            </div>
            <div className="pv pv-ui" aria-hidden="true">
              <div className="mk-win">
                <div className="mk-ahead">
                  <span>Do this next</span>
                  <span className="mk-sc">
                    <b>+8</b>
                    <em className="good">points</em>
                  </span>
                </div>
                <div className="mk-table">
                  {MK_WIN_MK_TABLE_ITEMS.map((item) => (
                    <div key={item.text} className="mk-row">
                      <span>{item.text}</span>
                      <em className={cx(item.tone)}>{item.risk}</em>
                    </div>
                  ))}
                </div>
                <div className="mk-ex">Example company and data</div>
              </div>
            </div>
          </article>
          <article className="pcard" style={cssVars({ "--i": 1 })}>
            <div className="pcard-copy">
              <span className="pc-n">For investors</span>
              <h3>Read a company before you back it.</h3>
              <p>
                Scan a company you are considering, or follow the ones you have already backed. Every finding
                names its source, so you can check it for yourself.
              </p>
              <div>
                <Button variant="light" href="/for-investors">For investors</Button>
              </div>
            </div>
            <div className="pv pv-ui" aria-hidden="true">
              <div className="mk-win">
                <div className="mk-ahead">
                  <span>Portfolio</span>
                  <span className="mk-sc">
                    <b>3</b>
                    <em className="none">examples</em>
                  </span>
                </div>
                <div className="mk-table">
                  {MK_WIN_MK_TABLE_ITEMS_2.map((item) => (
                    <div key={item.text} className="mk-row">
                      <span>{item.text}</span>
                      <em className={cx(item.tone)}>{item.watch}</em>
                    </div>
                  ))}
                </div>
                <div className="mk-ex">Example companies and data</div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
