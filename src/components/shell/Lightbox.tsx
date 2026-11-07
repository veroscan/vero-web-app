/** Image preview overlay used by `[data-zoom]` images (the runtime fills and toggles it). */
export function Lightbox() {
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Image preview">
      <button type="button" aria-label="Close preview">
        &times;
      </button>
      <img alt="" />
    </div>
  );
}
