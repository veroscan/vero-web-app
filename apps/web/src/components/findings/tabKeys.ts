import type { KeyboardEvent } from 'react';

/**
 * Arrow keys for a row of tabs or radio buttons (put it on the element with role="tablist" or "radiogroup").
 * Left and Right (and Up and Down) move to the neighbour and choose it; Home and End jump to the ends.
 */
export function arrowKeys(event: KeyboardEvent<HTMLElement>): void {
  const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
  if (step === 0 && event.key !== 'Home' && event.key !== 'End') return;
  const stops = [...event.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]:not([disabled]),[role="radio"]:not([disabled])')];
  const at = stops.indexOf(document.activeElement as HTMLElement);
  if (at < 0 || stops.length === 0) return;
  event.preventDefault();
  const next = stops[event.key === 'Home' ? 0 : event.key === 'End' ? stops.length - 1 : (at + step + stops.length) % stops.length];
  if (!next || next === stops[at]) return;
  next.focus();
  next.click();
  next.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}
