interface PageHeroSvcJumpItem {
  readonly title: string;
  readonly label: string;
  readonly href: string;
}

const PAGE_HERO_SVC_JUMP_ITEMS: readonly PageHeroSvcJumpItem[] = [
  { title: "01", label: "Delaware", href: "#delaware" },
  { title: "02", label: "United Kingdom", href: "#united-kingdom" },
  { title: "03", label: "Nigeria", href: "#nigeria" },
  { title: "04", label: "Next", href: "#next" },
];

export function CoverageHero() {
  return (
    <section className="page-hero">
      <div className="wrap">
        <div className="crumbs" data-hero="">
          <a href="/">Home</a>{" "}
          · Coverage
        </div>
        <div className="page-hero-row">
          <h1 className="h1" data-hero-split="">Three places at launch. Five more next.</h1>
          <p className="lead" data-hero="">
            Each country has its own registers, its own rules and its own way of being checked. Vero reads each
            one the way it allows, and says on every finding how it knows.
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
