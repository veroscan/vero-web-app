import { ARROW_UP_RIGHT_PATH } from "@/lib/brand";
import { cssVars } from "@/lib/css";
import type { NavDrop } from "@/lib/site";
import { ArrowIcon, StrokeIcon } from "../ui/Icon";
import { CurrentLink } from "./CurrentLink";
import { NavMock } from "./NavMock";

const pad2 = (n: number) => String(n).padStart(2, "0");

/** A header item with a hover/focus dropdown: link list on the left, matching preview card on the right. */
export function NavDropdown({ drop }: { drop: NavDrop }) {
  const itemHrefs = drop.items.map((item) => item.href);

  return (
    <li className="has-drop" data-nav-drop="">
      <CurrentLink href={drop.href} aria-haspopup="true" alsoCurrentFor={itemHrefs}>
        {drop.label}
        <svg
          className="caret"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </CurrentLink>
      <div className="nav-drop">
        <div className="nd-list">
          {drop.items.map((item, index) => (
            <CurrentLink key={item.href} className="nd-item" href={item.href} style={cssVars({ "--i": index })}>
              <span className="nd-ico">
                <StrokeIcon paths={item.iconPaths} aria-hidden="true" />
              </span>
              <span className="nd-txt">
                {item.label}
                <small>{item.description}</small>
              </span>
              <span className="nd-arr">
                <ArrowIcon path={ARROW_UP_RIGHT_PATH} />
              </span>
            </CurrentLink>
          ))}
        </div>
        <div className="nd-preview" aria-hidden="true">
          {drop.items.map((item, index) => (
            <a key={item.href} className="nd-fig" href={item.href} tabIndex={-1}>
              <NavMock id={item.mock} />
              <span className="nd-cap">
                <small>
                  {pad2(index + 1)} / {pad2(drop.items.length)}
                </small>
                <b>{item.captionTitle}</b>
                <span>{item.captionLine}</span>
              </span>
              <span className="nd-go">
                <ArrowIcon path={ARROW_UP_RIGHT_PATH} />
              </span>
            </a>
          ))}
        </div>
        <div className="nd-foot">
          <a className="nd-all" href={drop.all.href}>
            {drop.all.label} <ArrowIcon path={ARROW_UP_RIGHT_PATH} />
          </a>
          <a className="nd-talk" href={drop.talk.href}>
            {drop.talk.label}
          </a>
        </div>
      </div>
    </li>
  );
}
