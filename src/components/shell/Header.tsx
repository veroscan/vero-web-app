import { COMPANY, NAV, NAV_DEMO, NAV_WAITLIST } from "@/lib/site";
import { Button } from "../ui/Button";
import { CurrentLink } from "./CurrentLink";
import { NavDropdown } from "./NavDropdown";

export function Header() {
  return (
    <header className="site-header">
      <nav className="nav" aria-label="Main">
        <a className="logo" href="/" aria-label={`${COMPANY.productName} home`}>
          <img className="logo-full" src="/vero/logo-ink.svg" alt={COMPANY.productName} width="143" height="32" />
        </a>
        <ul className="nav-links">
          {NAV.map((entry) =>
            entry.kind === "drop" ? (
              <NavDropdown key={entry.drop.label} drop={entry.drop} />
            ) : (
              <li key={entry.link.href}>
                <CurrentLink href={entry.link.href}>{entry.link.label}</CurrentLink>
              </li>
            ),
          )}
        </ul>
        <a className="nav-demo" href={NAV_DEMO.href}>
          {NAV_DEMO.label}
        </a>
        <Button href={NAV_WAITLIST.href}>{NAV_WAITLIST.label}</Button>
        <button className="burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobileMenu">
          <span></span>
          <span></span>
        </button>
      </nav>
    </header>
  );
}
