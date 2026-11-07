/** Empty mount point: the runtime draws the page-to-page transition canvas into it. */
export function PageTransition() {
  return <div className="transition" aria-hidden="true"></div>;
}
