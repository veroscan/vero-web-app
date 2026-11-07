interface PageHeroSvcJumpItem {
  readonly title: string;
  readonly label: string;
  readonly href: string;
}

const PAGE_HERO_SVC_JUMP_ITEMS: readonly PageHeroSvcJumpItem[] = [
  { title: "01", label: "Scan", href: "#scan" },
  { title: "02", label: "Score", href: "#score" },
  { title: "03", label: "Report", href: "#report" },
  { title: "04", label: "Act", href: "#act" },
  { title: "05", label: "Verify", href: "#verify" },
  { title: "06", label: "Documents and dates", href: "#around" },
];

export function ProductHero() {
  return (
    <section className="page-hero">
      <div className="wrap">
        <div className="crumbs" data-hero="">
          <a href="/">Home</a>{" "}
          · Product
        </div>
        <div className="page-hero-row">
          <h1 className="h1" data-hero-split="">From a company name to a score, a plan and proof.</h1>
          <p className="lead" data-hero="">
            Vero Scan reads the official registers, your website and the documents you give it. It scores six
            areas out of 100, tells you in plain English what to fix, and lets a Code &amp; Clause lawyer confirm
            what matters.
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
