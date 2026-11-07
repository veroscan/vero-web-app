interface PageHeroSvcJumpItem {
  readonly title: string;
  readonly label: string;
  readonly href: string;
}

const PAGE_HERO_SVC_JUMP_ITEMS: readonly PageHeroSvcJumpItem[] = [
  { title: "01", label: "Six areas", href: "#layers" },
  { title: "02", label: "Findings", href: "#findings" },
  { title: "03", label: "Weights", href: "#weights" },
  { title: "04", label: "Sources", href: "#sources" },
  { title: "05", label: "Verification", href: "#verification" },
  { title: "06", label: "Limits", href: "#limits" },
];

export function MethodologyHero() {
  return (
    <section className="page-hero">
      <div className="wrap">
        <div className="crumbs" data-hero="">
          <a href="/">Home</a>{" "}
          · Methodology
        </div>
        <div className="page-hero-row">
          <h1 className="h1" data-hero-split="">How the score works.</h1>
          <p className="lead" data-hero="">
            The score is one number out of 100, built from facts. This page sets out the method: six areas, how
            findings are weighted, where each fact comes from, and what a score cannot tell you.
          </p>
        </div>
        <nav className="svc-jump" aria-label="On this page" data-hero="">
          {PAGE_HERO_SVC_JUMP_ITEMS.map((item) => (
            <a key={item.title} href={item.href}>
              <b>{item.title}</b>
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}
