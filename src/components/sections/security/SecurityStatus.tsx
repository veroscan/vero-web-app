import { SectionHead } from "@/components/ui/SectionHead";

interface StatusPaLimItem {
  readonly text: string;
  readonly heading: string;
  readonly paTag: string;
}

const STATUS_PA_LIMS: readonly StatusPaLimItem[] = [
  { text: "02", heading: "Role-based access, one organisation at a time", paTag: "Planned baseline" },
  { text: "03", heading: "Multi-factor sign-in an organisation can require", paTag: "Planned" },
  { text: "04", heading: "Independent penetration test", paTag: "Planned before launch" },
];

export function SecurityStatus() {
  return (
    <section className="pad on-dark u-overflow-hidden" id="status" aria-labelledby="status-title">
      <div className="wrap">
        <SectionHead
          eyebrow="Honest status"
          title="What is planned, and what is still to be confirmed."
          id="status-title"
          intro="Vero Scan has not launched. We would rather tell you plainly what is not yet settled than imply it is."
        />
        <ol className="pa-lims">
          <li className="pa-lim" data-reveal="">
            <span className="n">01</span>
            <h3>Encryption in transit and at rest</h3>
            <p>
              <b className="pa-tag watch">Planned baseline</b>{" "}
              Providers, regions and settings: [Code &amp; Clause to confirm]
            </p>
          </li>
          {STATUS_PA_LIMS.map((item) => (
            <li key={item.text} className="pa-lim" data-reveal="">
              <span className="n">{item.text}</span>
              <h3>{item.heading}</h3>
              <p>
                <b className="pa-tag watch">{item.paTag}</b>{" "}
              </p>
            </li>
          ))}
          <li className="pa-lim" data-reveal="">
            <span className="n">05</span>
            <h3>Security certifications</h3>
            <p>
              <b className="pa-tag none">None claimed</b>{" "}
              We will not claim one until it is held
            </p>
          </li>
          <li className="pa-lim" data-reveal="">
            <span className="n">06</span>
            <h3>In-app account deletion and data export</h3>
            <p>
              <b className="pa-tag watch">Planned</b>{" "}
            </p>
          </li>
          <li className="pa-lim" data-reveal="">
            <span className="n">07</span>
            <h3>Named list of sub-processors</h3>
            <p>
              <b className="pa-tag watch">Before launch</b>{" "}
              Hosting and database, an AI model provider, email delivery and registry-data vendors. [Named list to
              confirm]
            </p>
          </li>
          <li className="pa-lim" data-reveal="">
            <span className="n">08</span>
            <h3>Response times, disclosure policy, data protection officer</h3>
            <p>
              <b className="pa-tag watch">To confirm</b>{" "}
              [Code &amp; Clause to confirm]
            </p>
          </li>
        </ol>
        <p className="small-print u-margin-top-28px" data-reveal="">
          Privacy policy and terms are on their own pages. Read the{" "}
          <a className="link" href="/privacy-policy">privacy policy</a>
          . Square brackets mark details Code &amp; Clause has not yet confirmed.
        </p>
      </div>
    </section>
  );
}
