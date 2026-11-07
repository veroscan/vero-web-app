interface StatItem {
  readonly heading: string;
  readonly text: string;
  readonly count: string;
}

const STATS: readonly StatItem[] = [
  {
    heading: "countries at launch",
    text: "Delaware, the United Kingdom and Nigeria. Kenya, Ghana, South Africa, Germany and France are next.",
    count: "3",
  },
  {
    heading: "areas behind every score",
    text: "Company foundations, Intellectual property, Compliance, Contracts, Fundraising, and AI and data.",
    count: "6",
  },
  {
    heading: "is the top of the scale",
    text: "75 and above is Healthy, 50 to 74 Needs work, under 50 At risk. These are launch defaults and may change.",
    count: "100",
  },
];

export function LaunchStats() {
  return (
    <section className="pad-sm" aria-label="Vero Scan at a glance">
      <div className="wrap">
        <div className="stats">
          {STATS.map((item) => (
            <div key={item.heading} className="stat" data-reveal="">
              <div className="stat-n">
                <b data-count={item.count}>0</b>
              </div>
              <h3>{item.heading}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
