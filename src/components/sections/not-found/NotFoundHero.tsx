import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

interface NfWinPuRowItem {
  readonly title: string;
  readonly detail: string;
  readonly href: string;
}

const NF_WIN_PU_ROWS: readonly NfWinPuRowItem[] = [
  { title: "Home", detail: "The legal health score for technology companies", href: "/" },
  { title: "Product", detail: "How Vero Scan works", href: "/product" },
  { title: "Contact", detail: "Tell us what you were looking for", href: "/contact" },
];

export function NotFoundHero() {
  return (
    <section className="hero nf-hero">
      <div className="wrap">
        <div className="hero-grid">
          <div className="hero-copy">
            <Eyebrow data-hero="">Error 404</Eyebrow>
            <h1 className="display" data-hero-split="">We could not find that page.</h1>
            <p className="lead" data-hero="">
              The link may be old, or the address may have a typo. Try one of these instead.
            </p>
            <div className="btn-row" data-hero="">
              <Button variant="green" href="/">Go to the home page</Button>
              <Button variant="soft" href="/product">See the product</Button>
            </div>
            <p className="small-print" data-hero="">
              “Not found” only means we looked here and it was not there. It is never proof that something does
              not exist.
            </p>
          </div>
          <div className="nf-win" data-hero="">
            <h2>Here is what we found</h2>
            <ul className="pu-rows">
              <li className="pu-row">
                <span className="pu-t">
                  <b>The page you asked for</b>
                  <small className="nf-pathline" data-nf-path="">The address you opened</small>
                </span>
                <span className="st sw2">
                  <span className="a none u-color-muted">Looking</span>
                  <span className="b risk">Not found</span>
                </span>
              </li>
              {NF_WIN_PU_ROWS.map((item) => (
                <li key={item.title} className="pu-row">
                  <a className="pu-t" href={item.href}>
                    <b>{item.title}</b>
                    <small>{item.detail}</small>
                  </a>
                  <span className="st good">
                    Found
                    <span className="arrow">→</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="nf-ex">
              If a link on this site brought you here, please tell us at hello@codeclauselegal.com.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
