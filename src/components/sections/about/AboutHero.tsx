import { cssVars } from "@/lib/css";

interface LsMainLsKpiItem {
  readonly detail: string;
  readonly text: string;
}

const LS_MAIN_LS_KPIS: readonly LsMainLsKpiItem[] = [
  { detail: "Score", text: "72" },
  { detail: "Areas", text: "6" },
  { detail: "Open", text: "12" },
];

interface LsMainLsBarItem {
  readonly h: string;
}

const LS_MAIN_LS_BARS: readonly LsMainLsBarItem[] = [
  { h: "84%" },
  { h: "49%" },
  { h: "68%" },
  { h: "82%" },
  { h: "74%" },
  { h: "75%" },
];

interface AbHeroVisualLayerStepItem {
  readonly title: string;
  readonly text: string;
  readonly layer: string;
}

const AB_HERO_VISUAL_LAYER_STEPS: readonly AbHeroVisualLayerStepItem[] = [
  { title: "01", text: "Registers", layer: "0" },
  { title: "02", text: "Documents", layer: "1" },
  { title: "03", text: "Score and lawyer", layer: "2" },
];

export function AboutHero() {
  return (
    <section className="page-hero ab-hero">
      <div className="orb orb--ring u-width-260px-height-260px-left-neg90px-top-8pct" data-float="30"></div>
      <div className="wrap ab-hero-grid">
        <div className="ab-hero-copy">
          <div className="crumbs" data-hero="">
            <a href="/">Home</a>{" "}
            · About
          </div>
          <h1 className="display ab-title" data-hero-split="">
            Built by lawyers who think in{" "}
            <span className="green">product terms.</span>
          </h1>
          <p className="lead" data-hero="">
            Vero Scan is built by Code &amp; Clause, a cross-border technology law firm. Software reads the
            records. Lawyers confirm the documents. Together they turn legal health into a score anyone can read.
          </p>
        </div>
        <div className="ab-hero-visual">
          <div className="layers" data-layers="" aria-hidden="true">
            <div className="layers-3d">
              <div className="layer l-paper">
                <span className="lt">Company record</span>
                <span className="stamp">Checked</span>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i className="sig"></i>
              </div>
              <div className="layer l-sheet">
                <span className="lt">Contractor agreement.pdf</span>
                <div className="cells">
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i className="hl"></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i className="hl"></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i className="hl"></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                </div>
              </div>
              <div className="layer l-sys">
                <div className="ls-side">
                  <b></b>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                </div>
                <div className="ls-main">
                  <div className="ls-kpis">
                    {LS_MAIN_LS_KPIS.map((item) => (
                      <span key={item.detail}>
                        <small>{item.detail}</small>
                        {item.text}
                      </span>
                    ))}
                  </div>
                  <div className="ls-bars">
                    {LS_MAIN_LS_BARS.map((item) => (
                      <i key={item.h} style={cssVars({ "--h": item.h })}></i>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <ol className="layer-steps" data-hero="">
            {AB_HERO_VISUAL_LAYER_STEPS.map((item) => (
              <li key={item.title} data-layer={item.layer}>
                <b>{item.title}</b>
                {item.text}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
