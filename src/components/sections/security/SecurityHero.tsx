interface PageHeroSvcJumpItem {
  readonly title: string;
  readonly label: string;
  readonly href: string;
}

const PAGE_HERO_SVC_JUMP_ITEMS: readonly PageHeroSvcJumpItem[] = [
  { title: "01", label: "What we collect", href: "#collected" },
  { title: "02", label: "Encryption and access", href: "#protected" },
  { title: "03", label: "AI", href: "#ai" },
  { title: "04", label: "Your rights", href: "#rights" },
  { title: "05", label: "What is confirmed", href: "#status" },
];

export function SecurityHero() {
  return (
    <section className="page-hero">
      <div className="wrap">
        <div className="crumbs" data-hero="">
          <a href="/">Home</a>{" "}
          · Security
        </div>
        <div className="page-hero-row">
          <h1 className="h1" data-hero-split="">Security and trust.</h1>
          <p className="lead" data-hero="">
            Vero Scan has not launched yet. This page sets out what the product collects, how documents will be
            handled, who can see them and how to reach us. Anything not yet confirmed is marked planned, or put in
            square brackets for Code &amp; Clause to confirm.
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
