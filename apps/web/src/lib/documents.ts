import type { SlotState, VaultSlotView } from '@vero/shared';
import type { Tone } from './words';

/** The slot Delaware's rules date from the certificate, rather than from an expiry. */
export const CERTIFICATE_SLOT = 'de_good_standing';

const TODO: readonly SlotState[] = ['missing', 'declared_missing', 'needs_confirmation', 'not_accepted'];
const IN_PLACE: readonly SlotState[] = ['read'];

/** Empty slots are the to-do list, along with anything still waiting on the person. */
export function isToDo(state: SlotState): boolean {
  return TODO.includes(state);
}

export function isInPlace(state: SlotState): boolean {
  return IN_PLACE.includes(state);
}

/** "Not checked yet" is deliberately plain: an empty slot isn't held against anyone. */
export function slotTone(state: SlotState): Tone {
  switch (state) {
    case 'read':
      return 'good';
    case 'needs_confirmation':
      return 'watch';
    case 'declared_missing':
    case 'not_accepted':
      return 'risk';
    case 'missing':
    case 'reading':
      return 'none';
  }
}

export interface SlotGroup {
  layer: number;
  name: string;
  slots: VaultSlotView[];
  inPlace: number;
  toDo: number;
}

/** One group per area, the ones with the most to do first, as in the design. */
export function groupSlots(slots: readonly VaultSlotView[]): SlotGroup[] {
  const groups = new Map<number, SlotGroup>();
  for (const slot of slots) {
    const group = groups.get(slot.layer) ?? { layer: slot.layer, name: slot.layerName, slots: [], inPlace: 0, toDo: 0 };
    group.slots.push(slot);
    if (isInPlace(slot.state)) group.inPlace += 1;
    if (isToDo(slot.state)) group.toDo += 1;
    groups.set(slot.layer, group);
  }
  return [...groups.values()].sort((a, b) => b.toDo - a.toDo || a.layer - b.layer);
}

export interface ConfirmFields {
  needsDocumentDate: boolean;
  needsExpiry: boolean;
  canValidate: boolean;
}

/** What the API will insist on before it files a document in this slot. */
export function confirmFieldsFor(slot: Pick<VaultSlotView, 'key' | 'expires'> | undefined): ConfirmFields {
  if (!slot) return { needsDocumentDate: false, needsExpiry: false, canValidate: false };
  const certificate = slot.key === CERTIFICATE_SLOT;
  return { needsDocumentDate: certificate, needsExpiry: !certificate && slot.expires, canValidate: certificate };
}

/** Lowers a title's first letter for use mid-sentence, leaving initials such as "IP" alone. */
export function midSentence(title: string): string {
  const second = title.charAt(1);
  return second && second === second.toUpperCase() && second !== second.toLowerCase() ? title : title.charAt(0).toLowerCase() + title.slice(1);
}

/** How the company file draws a slot: in order, with a problem, missing, or being read now. */
export type SlotKind = 'ok' | 'problem' | 'missing' | 'reading';

export function slotKind(state: SlotState): SlotKind {
  switch (state) {
    case 'read':
      return 'ok';
    case 'needs_confirmation':
    case 'not_accepted':
    case 'declared_missing':
      return 'problem';
    case 'reading':
      return 'reading';
    case 'missing':
      return 'missing';
  }
}

/** The colour token for a slot's status word. An empty slot is plain, never red: it isn't held against anyone. */
export function slotColour(state: SlotState): string {
  switch (slotKind(state)) {
    case 'ok':
      return 'var(--good)';
    case 'problem':
      return state === 'needs_confirmation' ? 'var(--warn)' : 'var(--urgent)';
    case 'reading':
      return 'var(--sky-2)';
    case 'missing':
      return 'var(--ink-3)';
  }
}

