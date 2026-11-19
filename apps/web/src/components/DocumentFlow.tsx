'use client';

import type { VaultDocument, VaultSlotView } from '@vero/shared';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type DragEvent } from 'react';
import { PlanLink } from './Bits';
import { useSession } from './Session';
import { TLink } from './TLink';
import { useToast } from './Toast';
import { api, asApiError, isRedirecting } from '@/lib/api';
import { confirmFieldsFor } from '@/lib/documents';

const MAX_UPLOAD_MB = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB ?? 25);

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 16V5M7 10l5-5 5 5M5 19h14" />
    </svg>
  );
}

interface ConfirmProps {
  document: VaultDocument;
  slots: readonly VaultSlotView[];
  /** The slot the person came here to fill, when they came from one. */
  wantedSlot?: string | null;
  onFiled: (document: VaultDocument) => void;
}

/** The person decides where a document belongs. Nothing counts until they do. */
/** How many reads in a row can fail for a passing reason before we say the document failed. */
const READ_RETRIES = 4;

export function ConfirmDocument({ document, slots, wantedSlot, onFiled }: ConfirmProps) {
  const router = useRouter();
  const suggested = document.suggestion?.slotKey && slots.some((slot) => slot.key === document.suggestion?.slotKey) ? document.suggestion.slotKey : null;
  const [choosing, setChoosing] = useState(!suggested);
  const [slotKey, setSlotKey] = useState(suggested ?? (wantedSlot && slots.some((slot) => slot.key === wantedSlot) ? wantedSlot : ''));
  const [documentDate, setDocumentDate] = useState('');
  const [expiresOn, setExpiresOn] = useState('');
  const [validated, setValidated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const slot = slots.find((candidate) => candidate.key === slotKey);
  const fields = confirmFieldsFor(slot);
  const needsMore = (fields.needsDocumentDate && !documentDate) || (fields.needsExpiry && !expiresOn);

  const file = async () => {
    if (!slotKey) {
      setProblem('Choose where this document goes.');
      return;
    }
    setBusy(true);
    setProblem(null);
    try {
      const result = await api.vault.confirm({
        params: { documentId: document.id },
        body: {
          slotKey,
          ...(fields.needsDocumentDate && documentDate ? { documentDate } : {}),
          ...(fields.needsExpiry && expiresOn ? { expiresOn } : {}),
          ...(fields.canValidate && validated ? { validated: true } : {}),
        },
      });
      // A copy that looks unsigned is kept, but doesn't count, and that needs its own screen.
      if (result.status === 'rejected') router.push(`/documents/${document.id}/rejected`);
      else onFiled(result);
    } catch (error) {
      if (!isRedirecting(error)) setProblem(asApiError(error).message);
      setBusy(false);
    }
  };

  const groups = [...new Set(slots.map((item) => item.layerName))];
  return (
    <div className="paper stack g12 recog" data-testid="confirm-document">
      <p className="row-t">{document.fileName ?? 'Your document'}</p>
      {document.suggestion?.label ? <p className="quiet">This looks like: {document.suggestion.label}.</p> : <p className="quiet">We couldn&apos;t tell what this is.</p>}
      {document.signatureHintWords ? <p className="quiet">{document.signatureHintWords}</p> : null}
      {!choosing ? <p className="b">Is that right?</p> : null}
      {choosing ? (
        <div className="field">
          <label htmlFor="slot-choice">Where does it belong?</label>
          <select className="input" id="slot-choice" value={slotKey} onChange={(event) => setSlotKey(event.target.value)}>
            <option value="">Choose one</option>
            {groups.map((group) => (
              <optgroup key={group} label={group}>
                {slots
                  .filter((item) => item.layerName === group)
                  .map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.label}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>
      ) : null}
      {fields.needsDocumentDate ? (
        <div className="field">
          <label htmlFor="doc-date">Date on the certificate</label>
          <input className="input" id="doc-date" type="date" value={documentDate} onChange={(event) => setDocumentDate(event.target.value)} />
        </div>
      ) : null}
      {fields.needsExpiry ? (
        <div className="field">
          <label htmlFor="doc-expiry">When does it run out?</label>
          <input className="input" id="doc-expiry" type="date" value={expiresOn} onChange={(event) => setExpiresOn(event.target.value)} />
        </div>
      ) : null}
      {fields.canValidate ? (
        <label className="checkline">
          <input className="tick" type="checkbox" checked={validated} onChange={(event) => setValidated(event.target.checked)} />
          <span>I&apos;ve checked this certificate is genuine with the Delaware Division of Corporations.</span>
        </label>
      ) : null}
      {problem ? (
        <p className="formerror" role="alert">
          {problem}
        </p>
      ) : null}
      <div className="btns">
        <button className="btn btn-ink btn-sm" type="button" disabled={busy || !slotKey || needsMore} onClick={() => void file()}>
          {busy ? 'Filing it' : choosing ? 'File it here' : 'Yes, file it'}
        </button>
        {!choosing ? (
          <button className="btn btn-line btn-sm" type="button" onClick={() => setChoosing(true)}>
            No, it&apos;s something else
          </button>
        ) : null}
      </div>
    </div>
  );
}

type Stage =
  | { name: 'idle' }
  | { name: 'up'; fileName: string }
  | { name: 'read'; fileName: string; id: string }
  | { name: 'confirm'; document: VaultDocument }
  | { name: 'filed'; document: VaultDocument }
  | { name: 'failed'; message: string; code: string | null };

interface FlowProps {
  companyId: string;
  slots: readonly VaultSlotView[];
  wantedSlot?: string | null;
  /** Pick up a document that's already been read and is waiting to be confirmed. */
  resume?: VaultDocument | null;
  backHref?: string | null;
  compact?: boolean;
  onChanged?: () => void;
}

/** Choose a file, upload it, wait while it's read, then confirm where it belongs. */
export function DocumentFlow({ companyId, slots, wantedSlot, resume, backHref, compact, onChanged }: FlowProps) {
  const session = useSession();
  const toast = useToast();
  const [stage, setStage] = useState<Stage>(resume ? { name: 'confirm', document: resume } : { name: 'idle' });
  const [over, setOver] = useState(false);
  const picker = useRef<HTMLInputElement>(null);
  const box = compact ? 'flowbox' : 'upstate';

  const send = async (file: File) => {
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setStage({ name: 'failed', code: 'payload_too_large', message: `That file is too big to upload. The limit is ${MAX_UPLOAD_MB} MB, so try a smaller copy.` });
      return;
    }
    setStage({ name: 'up', fileName: file.name });
    try {
      const uploaded = await api.vault.upload({
        params: { companyId },
        query: { fileName: file.name, ...(wantedSlot ? { slotKey: wantedSlot } : {}) },
        body: new Uint8Array(await file.arrayBuffer()),
      });
      setStage({ name: 'read', fileName: file.name, id: uploaded.id });
    } catch (error) {
      const failure = asApiError(error);
      setStage({ name: 'failed', code: failure.code, message: failure.message });
    }
  };

  // Reading happens in the background on the API, so this asks until it's finished.
  const reading = stage.name === 'read' ? stage.id : null;
  useEffect(() => {
    if (!reading) return;
    let current = true;
    let timer: ReturnType<typeof setTimeout>;
    let misses = 0;
    const check = () => {
      api.vault.document({ params: { documentId: reading } }).then(
        (document) => {
          if (!current) return;
          misses = 0;
          if (document.status === 'pending' || document.status === 'processing') timer = setTimeout(check, 1200);
          else if (document.status === 'failed' || document.status === 'rejected') setStage({ name: 'failed', code: null, message: document.rejectionReason ?? "We couldn't read this file. Please upload it again." });
          else if (document.status === 'filed') setStage({ name: 'filed', document });
          else setStage({ name: 'confirm', document });
        },
        (error: unknown) => {
          if (!current || isRedirecting(error)) return;
          const failure = asApiError(error);
          misses += 1;
          if ((failure.status === 0 || failure.status >= 500) && misses < READ_RETRIES) {
            timer = setTimeout(check, 1500);
            return;
          }
          setStage({ name: 'failed', code: failure.code, message: failure.message });
        },
      );
    };
    timer = setTimeout(check, 800);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [reading]);

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setOver(false);
    const file = event.dataTransfer.files[0];
    if (file) void send(file);
  };

  const reset = () => {
    if (picker.current) picker.current.value = '';
    setStage({ name: 'idle' });
  };

  return (
    <div aria-live="polite">
      {stage.name === 'idle' ? (
        <button
          className={`drop${over ? ' over' : ''}`}
          type="button"
          data-testid="drop-zone"
          onClick={() => picker.current?.click()}
          onDragEnter={(event) => {
            event.preventDefault();
            setOver(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={onDrop}
        >
          <UploadIcon />
          <span className={compact ? 'row-t' : 't-3'}>{compact ? 'Drop a document here' : 'Drop your document here'}</span>
          <span className="small">{compact ? "We'll work out what it is and where it goes." : `Or click to choose a file from your computer. Up to ${MAX_UPLOAD_MB} MB.`}</span>
        </button>
      ) : null}
      <input
        ref={picker}
        type="file"
        hidden
        aria-label="Choose a file"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void send(file);
        }}
      />
      {stage.name === 'up' ? (
        <div className={`${box} stack g12`} role="status">
          <div className="uprow">
            <span className="row-t">{stage.fileName}</span>
            <span className="small">Uploading</span>
          </div>
          <div className="lines" aria-hidden="true">
            <i />
          </div>
        </div>
      ) : null}
      {stage.name === 'read' ? (
        <div className={`${box} stack g8`} role="status">
          <p className="row-t">Reading your document</p>
          <p className="small">Working out what it is and who signed it.</p>
          <div className="lines" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
        </div>
      ) : null}
      {stage.name === 'confirm' ? (
        <ConfirmDocument
          document={stage.document}
          slots={slots}
          {...(wantedSlot ? { wantedSlot } : {})}
          onFiled={(document) => {
            setStage({ name: 'filed', document });
            toast('Filed. Your score is updating.');
            onChanged?.();
            session.refresh().catch(() => undefined);
          }}
        />
      ) : null}
      {stage.name === 'filed' ? (
        <div className="paper stack g12 recog" role="status" data-testid="drop-done">
          <p className="row-t">{stage.document.fileName ?? 'Your document'}</p>
          <p className="filedline">Filed. Your score is updating.</p>
          <div className="btns" style={{ gap: 16 }}>
            {backHref ? (
              <TLink className="btn btn-ink btn-sm" href={backHref}>
                Back to the issue
              </TLink>
            ) : null}
            <button className="link small plainbtn" type="button" onClick={reset}>
              Add another document
            </button>
          </div>
        </div>
      ) : null}
      {stage.name === 'failed' ? (
        <div className={`${box} stack g12`} role="alert" data-testid="drop-failed">
          <p className="formerror">{stage.message}</p>
          {stage.code === 'plan_upgrade_required' ? (
            <p className="small">
              <PlanLink />
            </p>
          ) : null}
          <div>
            <button className="btn btn-line btn-sm" type="button" onClick={reset}>
              Try another file
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

