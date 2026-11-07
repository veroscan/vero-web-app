/** Thin reading-progress bar at the top of an article. The runtime fills it as the page scrolls. */
export function ReadProgress() {
  return (
    <div className="read-progress" aria-hidden="true">
      <i></i>
    </div>
  );
}
