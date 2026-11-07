const TAKEAWAYS_LIST_ITEMS: readonly string[] = [
  "In Nigeria, the UK and the US, copyright in software starts with its author. Employers get an exception for employees; contractors keep their rights unless they assign them.",
  "UK: an assignment must be in writing and signed by the assignor (CDPA 1988 s.90(3)). US: a written, signed transfer is required (17 USC §204(a)), and software rarely qualifies as work made for hire.",
  "Common defects: “agrees to assign” wording, the wrong party signing, assignments that start after the work, and founder IP never transferred.",
  "Confirmatory assignments fix most gaps, and they are far easier to get before a round than during one.",
  "Vero Scan treats a missing assignment for core product work as a critical finding, checked by document and confirmed by a Code & Clause lawyer.",
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
          </ol>
        </div>
      </div>
    </section>
  );
}
