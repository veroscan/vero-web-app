import type { SlotState, VaultSlotView } from '@vero/shared';

// Ported from apps/web/src/lib/documents.ts: how a document slot reads, and what filing it needs.

/** The slot Delaware's rules date from the certificate, rather than from an expiry. */
export const CERTIFICATE_SLOT = 'de_good_standing';

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

/** Empty slots are the to-do list, along with anything still waiting on the person. */
export function isToDo(state: SlotState): boolean {
  return state === 'missing' || state === 'declared_missing' || state === 'needs_confirmation' || state === 'not_accepted';
}

export function isInPlace(state: SlotState): boolean {
  return state === 'read';
}

/** The `Status` tone for a slot. An empty slot is plain, never red: it isn't held against anyone. */
export function slotTone(state: SlotState): 'urgent' | 'warn' | 'good' | 'muted' {
  switch (slotKind(state)) {
    case 'ok':
      return 'good';
    case 'problem':
      return state === 'needs_confirmation' ? 'warn' : 'urgent';
    case 'reading':
    case 'missing':
      return 'muted';
  }
}

/** The finding page's words for where each proof document stands. */
export const PROOF_WORDS: Record<SlotState, string> = {
  missing: 'Not shared yet',
  declared_missing: "You told us you don't have it",
  reading: 'Being read now',
  needs_confirmation: 'Read, waiting for you to confirm',
  read: 'On file and read',
  not_accepted: 'A copy is on file but does not count yet',
};

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
