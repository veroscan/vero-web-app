import { V_MARK_PATH } from "@/lib/brand";
import { COMPANY, FOOTER_COLUMNS, FOOTER_LEGAL_LINKS } from "@/lib/site";

const COPYRIGHT_YEAR = "2026";

export function Footer() {
  return (
    <footer className="site-footer">
      <svg className="foot-mark" viewBox="-6 -6 144 112" aria-hidden="true">
        <path d={V_MARK_PATH} />
      </svg>
      <div className="wrap u-position-relative">
        <div className="foot-grid">
          <div className="foot-brand">
            <a className="logo" href="/" aria-label={`${COMPANY.productName} home`}>
              <img className="logo-full" src="/vero/logo-white.svg" alt={COMPANY.productName} width="143" height="32" />
            </a>
            <p>
              The legal health score for technology companies. {COMPANY.productName} is a product of Code &amp; Clause
              LTD, a cross-border technology law firm.
            </p>
          </div>
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h4>{column.title}</h4>
              <ul>
                {column.links.map((link) => (
                  <li key={`${link.href}${link.label}`}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h4>Contact</h4>
            <ul>
              <li>
                <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
              </li>
              <li className="foot-addr">
                {COMPANY.legalName}
                <br />
                {COMPANY.streetAddress},
                <br />
                {COMPANY.locality}, Nigeria
              </li>
            </ul>
          </div>
        </div>
        <p className="foot-areas">
          <b>Launch coverage:</b> Delaware, the United Kingdom and Nigeria. Kenya, Ghana, South Africa, Germany and
          France are next. Company names on this site are examples. Legal facts are as of November 2026.
        </p>
        <div className="foot-bottom">
          <div className="foot-legal">
            <span>
              &copy; <span data-year="">{COPYRIGHT_YEAR}</span> {COMPANY.legalName}. All rights reserved.
            </span>
            <small>Vero Scan is not legal advice and does not replace a lawyer.</small>
          </div>
          <div className="foot-links">
            {FOOTER_LEGAL_LINKS.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
