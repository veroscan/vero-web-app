import { COMPANY } from "@/lib/site";

/** Intro overlay. `vero/loader.js` and the runtime animate it; the markup must stay as is. */
export function Loader() {
  return (
    <div className="loader" aria-hidden="true">
      <canvas className="ld-cv"></canvas>
      <div className="ld-ui">
        <div className="ld-top">
          <span>{COMPANY.productName}</span>
          <span>{COMPANY.tagline}</span>
          <span className="ld-hide-s">A product of Code &amp; Clause</span>
        </div>
        <div className="ld-bottom">
          <div className="ld-count">
            <span className="ld-num">000</span>
            <small>%</small>
          </div>
          <div className="ld-status">
            <i></i>
            <span className="ld-msg">Reading the registers</span>
          </div>
        </div>
        <div className="ld-line">
          <i></i>
        </div>
      </div>
    </div>
  );
}
