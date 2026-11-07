export function Marquee() {
  return (
    <section className="pad-sm u-overflow-hidden" aria-hidden="true">
      <div className="big-marquee">
        <div className="marquee-track">
          <span>Delaware</span>
          <i className="sep"></i>
          <span>United Kingdom</span>
          <i className="sep"></i>
          <span>Nigeria</span>
          <i className="sep"></i>
          <span>Delaware</span>
          <i className="sep"></i>
          <span>United Kingdom</span>
          <i className="sep"></i>
          <span>Nigeria</span>
          <i className="sep"></i>
        </div>
      </div>
    </section>
  );
}
