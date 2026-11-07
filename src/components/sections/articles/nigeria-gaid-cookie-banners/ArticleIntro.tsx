const TAKEAWAYS_LIST_ITEMS: readonly string[] = [
  "GAID 2025 has applied since 19 September 2025. It governs how notices and consent work on websites and apps used by people in Nigeria.",
  "Article 7(1)(l): notices belong on the homepage, and the cookie notice should obstruct the middle, left or right of the page. A bottom bar does not.",
  "Article 19: offer explicit accept and reject, state the purpose of each cookie category and explain how to withdraw consent.",
  "No analytics or advertising cookies should load before the visitor makes a choice.",
  "The privacy notice behind the banner must meet NDPA s.27, publish the DPO contact where required and state the basis for cross-border transfers.",
];

export function ArticleIntro() {
  return (
    <section className="post-intro">
      <div className="wrap post-intro-grid">
        <div className="takeaways" data-reveal="">
          <small>In short</small>
          <ol>
            {TAKEAWAYS_LIST_ITEMS.map((item) => (
              <li key={item}>
                <span>{item}</span>
              </li>
            ))}
            <li>
              <span>
                Vero Scan tests the live banner against the rules for{" "}
                <a href="/coverage">Nigeria</a>
                , the{" "}
                <a href="/coverage">United Kingdom</a>{" "}
                and the{" "}
                <a href="/coverage">United States</a>
                , depending on where your users are.
              </span>
            </li>
            <li>
              <span>Most failures are fixed in the consent tool’s settings, not by rebuilding the site.</span>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
