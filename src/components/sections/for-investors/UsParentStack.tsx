import { Eyebrow } from "@/components/ui/Eyebrow";

const SV_STACK_TECH_CHIPS: readonly string[] = [
  "Delaware annual report and franchise tax, due each 1 March",
  "83(b) election and proof of filing, where it applies",
  "NOTAP registration within 30 days, if a Nigerian subsidiary pays its parent for technology or services",
  "Exchange-control approval, if IP moves offshore from South Africa",
];

export function UsParentStack() {
  return (
    <section className="pad-sm">
      <div className="wrap sv-split">
        <div className="sv-stack" data-reveal="">
          <Eyebrow>The Delaware flip</Eyebrow>
          <h2 className="h3">What a move under a US parent creates.</h2>
          <p>
            Many African startups move under a Delaware holding company to raise from US investors. The move
            creates duties on both sides. Ask for proof of each.
          </p>
          <div className="tech-chips">
            {SV_STACK_TECH_CHIPS.map((item) => (
              <span key={item} className="tech-chip">{item}</span>
            ))}
          </div>
          <p className="muted">
            A Delaware record is a dated certificate or a licensed provider. It is never live.
          </p>
        </div>
        <div className="sv-stack sv-stack--dark" data-reveal="">
          <Eyebrow>Across borders</Eyebrow>
          <h2 className="h3">Countries, not blocs.</h2>
          <p>
            A company can be incorporated in one country, sell in a second and raise from a third. Each finding is
            tagged to its country and the law behind it, so you can see which country’s paperwork is clean and
            which is not.
          </p>
          <p>
            Launch coverage is Delaware, the United Kingdom and Nigeria. Kenya, Ghana, South Africa, Germany and
            France are next.
          </p>
          <a className="link-arrow" href="/coverage">
            See coverage
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M7 17 17 7M8 7h9v9" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
