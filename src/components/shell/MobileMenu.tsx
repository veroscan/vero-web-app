import { COMPANY, MOBILE_MENU, NAV_DEMO } from "@/lib/site";

const pad2 = (n: number) => String(n).padStart(2, "0");

/** Full-screen menu opened by the header burger (the runtime toggles it). */
export function MobileMenu() {
  return (
    <div className="mobile-menu" id="mobileMenu" data-lenis-prevent="">
      <ul>
        {MOBILE_MENU.map((entry, index) => (
          <li key={entry.label}>
            <a className="mm-link" href={entry.href}>
              <small>{pad2(index + 1)}</small>
              {entry.label}
            </a>
            {entry.children && (
              <div className="mm-sub">
                {entry.children.map((child) => (
                  <a key={child.href} href={child.href}>
                    {child.label}
                  </a>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
      <div className="mm-foot">
        <span>
          {COMPANY.productName}, a product of {COMPANY.legalName}
        </span>
        <a href={NAV_DEMO.href}>{NAV_DEMO.label}</a>
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
      </div>
    </div>
  );
}
