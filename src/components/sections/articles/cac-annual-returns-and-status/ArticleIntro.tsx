const TAKEAWAYS_LIST_ITEMS: readonly string[] = [
  "“Active” on the CAC register means the company exists and has not been flagged as a non-filer. It does not prove which annual returns were filed.",
  "Every CAMA 2020 company files an annual return. Missed years attract penalties, inactive status and, in the end, a risk of strike-off.",
  "The CAC Status Report or a historical report settles the filing history. Keep a recent one in the data room.",
  "Investors reconcile the register of members and filed allotments to your cap table. Mismatches are the most common finding.",
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
                Vero Scan pulls CAC records through licensed partners via{" "}
                <a href="/product">registry intelligence</a>{" "}
                and confirms filing history by document, never by assumption. See the{" "}
                <a href="/coverage">Nigeria module</a>{" "}
                for the full list.
              </span>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
