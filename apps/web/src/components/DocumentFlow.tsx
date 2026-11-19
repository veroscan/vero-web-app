'use client';

/* Adding a document, as on the AddDocument board: drop a file, watch Vero read it (a scan line runs
   over the page), confirm where it belongs, then see it filed and the score worked out again.
   Every state comes from the real upload, read and confirm calls. Styles: styles/pages/docflow.css. */

import type { VaultDocument, VaultSlotView } from '@vero/shared';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type DragEvent } from 'react';
import { PlanLink } from './Bits';
import { Icon } from './Icon';
import { CountUp } from './Motion';
import { useSession } from './Session';
import { TLink } from './TLink';
import { useToast } from './Toast';
import { api, asApiError, isRedirecting } from '@/lib/api';
import { confirmFieldsFor, midSentence } from '@/lib/documents';
import { plural } from '@/lib/format';

const MAX_UPLOAD_MB = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB ?? 25);
/** How many reads in a row can fail for a passing reason before we say the document failed. */
const READ_RETRIES = 4;

function sizeWords(bytes: number | null | undefined): string | null {
  if (!bytes) return null;
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** A page being read: the scan line runs down it while Vero reads. */
function ReadingPaper({ caption }: { caption?: string }) {
  return (
    <div className="pic">
      <div className="sheetbox">
        <svg className="pp" viewBox="0 0 96 124" aria-hidden="true">
          <rect className="p2" x=".5" y=".5" width="95" height="123" rx="6" />
          <rect className="p3" x="10" y="12" width="30" height="5" rx="2.5" />
          <g className="p4">
            <rect x="10" y="28" width="70" height="4" rx="2" />
            <rect x="10" y="37" width="70" height="4" rx="2" />
            <rect x="10" y="46" width="56" height="4" rx="2" />
            <rect x="10" y="60" width="70" height="4" rx="2" />
            <rect x="10" y="69" width="62" height="4" rx="2" />
            <rect x="10" y="83" width="44" height="4" rx="2" />
            <rect x="10" y="97" width="66" height="4" rx="2" />
          </g>
        </svg>
        <span className="scanline" />
      </div>
      {caption ? <span className="cap">{caption}</span> : null}
    </div>
  );
}

function FiledPaper() {
  return (
    <div className="pic">
      <svg className="pp" viewBox="0 0 120 150" aria-hidden="true">
        <rect className="p5" x="18" y="20" width="84" height="112" rx="6" strokeWidth="1.5" strokeDasharray="5 4" />
        <path className="p2" d="M16 14h52l18 18v80a5 5 0 0 1-5 5H16a5 5 0 0 1-5-5V19a5 5 0 0 1 5-5z" transform="translate(8 6)" />
        <rect className="p3" x="28" y="32" width="30" height="5" rx="2.5" />
        <g className="p4">
          <rect x="28" y="48" width="56" height="4" rx="2" />
          <rect x="28" y="57" width="56" height="4" rx="2" />
          <rect x="28" y="66" width="44" height="4" rx="2" />
        </g>
        <path className="p6" d="M30 100c6-8 10 4 16-4s8 2 14-3" strokeWidth="1.8" strokeLinecap="round" />
        <rect className="p7" x="28" y="106" width="34" height="1.5" />
        <circle className="ok" cx="90" cy="116" r="15" strokeWidth="3" />
        <path className="mk" d="M83.5 116.5l4.5 4.5 8.5-9" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/** A copy that can't count: blurred lines for a file Vero couldn't read, a marked clause for the wrong one. */
export function ProblemPaper({ kind }: { kind: 'blurry' | 'wrong' }) {
  return (
    <div className="pic">
      <svg className="pp" viewBox="0 0 120 150" aria-hidden="true">
        {kind === 'blurry' ? (
          <>
            <defs>
              <filter id="vero-blur" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="2.2" />
              </filter>
            </defs>
            <g transform="rotate(-6 60 75)">
              <rect className="p2" x="16" y="16" width="86" height="114" rx="6" />
              <g filter="url(#vero-blur)">
                <rect className="p3" x="26" y="30" width="30" height="6" rx="3" />
                <g className="blur">
                  <rect x="26" y="46" width="64" height="5" rx="2" />
                  <rect x="26" y="56" width="64" height="5" rx="2" />
                  <rect x="26" y="66" width="50" height="5" rx="2" />
                  <rect x="26" y="80" width="64" height="5" rx="2" />
                  <rect x="26" y="90" width="56" height="5" rx="2" />
                </g>
              </g>
            </g>
          </>
        ) : (
          <>
            <rect className="p5" x="18" y="20" width="84" height="112" rx="6" strokeWidth="1.5" strokeDasharray="5 4" />
            <g transform="translate(-6 -4) rotate(-4 60 75)">
              <rect className="p2" x="14" y="14" width="84" height="112" rx="6" />
              <rect className="p3" x="24" y="28" width="30" height="5" rx="2.5" />
              <g className="p4">
                <rect x="24" y="44" width="62" height="4" rx="2" />
                <rect x="24" y="53" width="62" height="4" rx="2" />
              </g>
              <rect className="hl" x="20" y="62" width="70" height="16" rx="3" />
              <rect className="hr" x="24" y="68" width="48" height="4" rx="2" />
              <g className="p4">
                <rect x="24" y="86" width="62" height="4" rx="2" />
                <rect x="24" y="95" width="44" height="4" rx="2" />
              </g>
            </g>
          </>
        )}
        <circle className="wn" cx="94" cy="118" r="15" strokeWidth="3" />
        <path className="mk" d="M94 110v9M94 124.5v.5" strokeWidth="2.8" strokeLinecap="round" />
      </svg>
    </div>
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
  const facts = [document.pages ? plural(document.pages, 'page', 'pages') : null, sizeWords(document.sizeBytes)].filter(Boolean).join(', ');
  return (
    <div className="res" data-testid="confirm-document">
      <FiledPaper />
      <div>
        <div className="fn">
          <span className="nm">{document.fileName ?? 'Your document'}</span>
          {facts ? <small>{facts}</small> : null}
          <span className="st2" style={{ color: 'var(--sky-2)' }}>
            Read
          </span>
        </div>
        <h3>{!choosing && document.suggestion?.label ? `This looks like the ${midSentence(document.suggestion.label)}` : 'Where does this belong?'}</h3>
        <p className="lead">{document.suggestion?.label ? 'Vero read every page. Nothing counts until you confirm where it goes.' : "Vero read it but couldn't tell what it is. Choose where it goes and Vero checks it against that."}</p>
        {document.signatureHintWords ? <p className="hint">{document.signatureHintWords}</p> : null}
        <div className="ask">
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
              <input className="check" type="checkbox" checked={validated} onChange={(event) => setValidated(event.target.checked)} />
              <span>I&apos;ve checked this certificate is genuine with the Delaware Division of Corporations.</span>
            </label>
          ) : null}
        </div>
        {problem ? (
          <p className="formerror" role="alert" style={{ marginTop: 12 }}>
            {problem}
          </p>
        ) : null}
        <div className="acts2">
          <button className="btn btn-p" type="button" disabled={busy || !slotKey || needsMore} onClick={() => void file()}>
            {busy ? 'Filing it' : choosing ? 'File it here' : 'Yes, file it'}
          </button>
          {!choosing ? (
            <button className="btn btn-g" type="button" onClick={() => setChoosing(true)}>
              No, it&apos;s something else
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

type Stage =
  | { name: 'idle' }
  | { name: 'up'; fileName: string; size: number }
  | { name: 'read'; fileName: string; size: number; id: string }
  | { name: 'confirm'; document: VaultDocument }
  | { name: 'filed'; document: VaultDocument }
  | { name: 'failed'; fileName: string | null; message: string; code: string | null };

export type FlowStageName = Stage['name'];

interface FlowProps {
  companyId: string;
  slots: readonly VaultSlotView[];
  wantedSlot?: string | null;
  /** Pick up a document that's already been read and is waiting to be confirmed. */
  resume?: VaultDocument | null;
  /** Where "Back to the finding" goes after filing, when the person came from one. */
  backHref?: string | null;
  /** The finding page's version: a slim drop row inside its "What clears it" panel. */
  compact?: boolean;
  /** The words on the slim drop row. */
  dropTitle?: string;
  /** Under the drop zone: what Vero will check the file as. */
  expectLine?: string | null;
  onChanged?: () => void;
  onStage?: (stage: FlowStageName) => void;
}

/** Choose a file, upload it, wait while it's read, then confirm where it belongs. */
export function DocumentFlow({ companyId, slots, wantedSlot, resume, backHref, compact, dropTitle, expectLine, onChanged, onStage }: FlowProps) {
  const session = useSession();
  const toast = useToast();
  const [stage, setStage] = useState<Stage>(resume ? { name: 'confirm', document: resume } : { name: 'idle' });
  const [over, setOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const picker = useRef<HTMLInputElement>(null);
  const scoreBefore = useRef<number | null>(null);
  const [scoreAfter, setScoreAfter] = useState<number | null>(null);
  const stageChanged = useRef(onStage);
  stageChanged.current = onStage;

  useEffect(() => {
    stageChanged.current?.(stage.name);
  }, [stage.name]);

  // The bar fills towards the step Vero is on; the API doesn't report pages as it reads.
  useEffect(() => {
    if (stage.name === 'up') setProgress(0);
    const target = stage.name === 'up' ? 30 : stage.name === 'read' ? 88 : 100;
    const timer = window.setTimeout(() => setProgress(target), 60);
    return () => window.clearTimeout(timer);
  }, [stage.name]);

  const send = async (file: File) => {
    const exact = session.overview?.score.kind === 'exact' ? session.overview.score.value : null;
    scoreBefore.current = exact;
    setScoreAfter(null);
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setStage({ name: 'failed', fileName: file.name, code: 'payload_too_large', message: `That file is too big to upload. The limit is ${MAX_UPLOAD_MB} MB, so try a smaller copy.` });
      return;
    }
    setStage({ name: 'up', fileName: file.name, size: file.size });
    try {
      const uploaded = await api.vault.upload({
        params: { companyId },
        query: { fileName: file.name, ...(wantedSlot ? { slotKey: wantedSlot } : {}) },
        body: new Uint8Array(await file.arrayBuffer()),
      });
      setStage({ name: 'read', fileName: file.name, size: file.size, id: uploaded.id });
    } catch (error) {
      const failure = asApiError(error);
      setStage({ name: 'failed', fileName: file.name, code: failure.code, message: failure.message });
    }
  };

  // Reading happens in the background on the API, so this asks until it's finished.
  const reading = stage.name === 'read' ? stage.id : null;
  const readingName = stage.name === 'read' ? stage.fileName : null;
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
          else if (document.status === 'failed' || document.status === 'rejected') setStage({ name: 'failed', fileName: document.fileName ?? readingName, code: document.status, message: document.rejectionReason ?? "Vero couldn't read this file. Please upload it again." });
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
          setStage({ name: 'failed', fileName: readingName, code: failure.code, message: failure.message });
        },
      );
    };
    timer = setTimeout(check, 800);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [reading, readingName]);

  // Once filed, the score is worked out again in the background: follow it until it shows.
  const filedId = stage.name === 'filed' ? stage.document.id : null;
  useEffect(() => {
    if (!filedId) return;
    let live = true;
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const look = () => {
      session.refresh().then(
        () => undefined,
        () => undefined,
      );
      tries += 1;
      if (live && tries < 8) timer = setTimeout(look, 2500);
    };
    timer = setTimeout(look, 1200);
    return () => {
      live = false;
      clearTimeout(timer);
    };
    // Follows one filed document.
  }, [filedId]);
  const liveScore = session.overview?.score.kind === 'exact' ? session.overview.score.value : null;
  useEffect(() => {
    if (stage.name === 'filed' && liveScore !== null && scoreBefore.current !== null && liveScore !== scoreBefore.current) setScoreAfter(liveScore);
  }, [stage.name, liveScore]);

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

  const filedSlot = stage.name === 'filed' ? slots.find((slot) => slot.key === stage.document.slotKey) : undefined;

  return (
    <div className={`pg-docflow${compact ? ' compact' : ''}`} aria-live="polite">
      <input
        ref={picker}
        type="file"
        hidden
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
        aria-label="Choose a file"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void send(file);
        }}
      />
      {stage.name === 'idle' ? (
        <div className="st-v idle">
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
            {compact ? (
              <>
                <span className="ic">
                  <Icon name="upload" />
                </span>
                <span className="tx">
                  <span className="dt1">{dropTitle ?? 'Upload the document'}</span>
                  <span className="dt2">Drop it here or choose a file. PDF, Word or a clear photo, up to {MAX_UPLOAD_MB} MB. Vero reads it and checks again.</span>
                </span>
                <span className="btn btn-g">Choose file</span>
              </>
            ) : (
              <>
                <svg className="tray" viewBox="0 0 180 140" aria-hidden="true">
                  <g className="pg">
                    <path className="t1" d="M58 6h46l18 18v62a4 4 0 0 1-4 4H58a4 4 0 0 1-4-4V10a4 4 0 0 1 4-4z" strokeWidth="2" />
                    <path className="t2" d="M104 6v14a4 4 0 0 0 4 4h14" strokeWidth="2" strokeLinejoin="round" />
                    <rect className="t3" x="64" y="18" width="24" height="5" rx="2.5" />
                    <g className="t4">
                      <rect x="64" y="34" width="48" height="4" rx="2" />
                      <rect x="64" y="42" width="48" height="4" rx="2" />
                      <rect x="64" y="50" width="36" height="4" rx="2" />
                    </g>
                  </g>
                  <path className="t5" d="M20 92h32l10 16h56l10-16h32v34a8 8 0 0 1-8 8H28a8 8 0 0 1-8-8z" />
                  <path className="t6" d="M20 92h32l10 16h56l10-16h32" strokeWidth="2" strokeLinejoin="round" />
                </svg>
                <span className="dt1">Drop a document here</span>
                <span className="dt2">PDF, Word or a clear photo, up to {MAX_UPLOAD_MB} MB</span>
                <span className="btn btn-p">
                  <Icon name="upload" />
                  Choose a file
                </span>
                <span className="as">{expectLine ?? 'Vero works out what the document is.'}</span>
              </>
            )}
          </button>
        </div>
      ) : null}

      {stage.name === 'up' || stage.name === 'read' ? (
        <div className="st-v" role="status">
          <div className="res">
            <ReadingPaper caption={stage.name === 'up' ? 'Uploading' : 'Reading'} />
            <div>
              <div className="fn">
                <span className="nm">{stage.fileName}</span>
                {sizeWords(stage.size) ? <small>{sizeWords(stage.size)}</small> : null}
                <span className="st2" style={{ color: 'var(--sky-2)' }}>
                  {stage.name === 'up' ? 'Uploading' : 'Reading'}
                </span>
              </div>
              <h3>{stage.name === 'up' ? 'Sending your document' : 'Reading your document'}</h3>
              <div className="bar2">
                <i style={{ width: `${progress}%` }} />
              </div>
              <div className="prog">
                <span>
                  <b>{stage.name === 'up' ? 'Uploading the file' : 'Reading every page'}</b>
                </span>
                <span>Usually under a minute</span>
              </div>
              <div className="steps">
                <div>
                  <span>Upload the file, encrypted</span>
                  <span style={{ color: stage.name === 'up' ? 'var(--sky-2)' : 'var(--good)' }}>{stage.name === 'up' ? 'Now' : 'Done'}</span>
                </div>
                <div>
                  <span>Pull the text from every page</span>
                  <span style={{ color: stage.name === 'read' ? 'var(--sky-2)' : 'var(--ink-4)' }}>{stage.name === 'read' ? 'Now' : 'Next'}</span>
                </div>
                <div>
                  <span>Work out what it is and who signed it</span>
                  <span style={{ color: 'var(--ink-4)' }}>Next</span>
                </div>
                <div>
                  <span>Match it to the checks it can clear</span>
                  <span style={{ color: 'var(--ink-4)' }}>Next</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {stage.name === 'confirm' ? (
        <div className="st-v">
          <ConfirmDocument
            document={stage.document}
            slots={slots}
            {...(wantedSlot ? { wantedSlot } : {})}
            onFiled={(document) => {
              setStage({ name: 'filed', document });
              toast('Filed. Vero is scoring it again.');
              onChanged?.();
            }}
          />
        </div>
      ) : null}

      {stage.name === 'filed' ? (
        <div className="st-v" role="status">
          <div className="res" data-testid="drop-done">
            <FiledPaper />
            <div>
              <div className="fn">
                <span className="nm">{stage.document.fileName ?? 'Your document'}</span>
                <small>Read just now</small>
                <span className="st2" style={{ color: 'var(--good)' }}>
                  Filed
                </span>
              </div>
              <h3>{filedSlot ? `Filed as the ${midSentence(filedSlot.label)}` : 'Filed'}</h3>
              <p className="lead">{scoreAfter !== null ? 'Vero checked it again and the score has moved.' : 'Vero is checking it against everything it can clear. The score updates in about a minute.'}</p>
              {filedSlot ? (
                <>
                  <div className="lbl2">What it fills</div>
                  <div className="chk">
                    <div className="c">
                      <div>
                        <b>{filedSlot.label}</b>
                        <small>
                          {filedSlot.layerName}
                          {filedSlot.ruleKeys.length > 0 ? `, counts towards ${plural(filedSlot.ruleKeys.length, 'check', 'checks')}` : ''}
                        </small>
                      </div>
                      <span className="st2" style={{ color: 'var(--good)' }}>
                        In order
                      </span>
                    </div>
                  </div>
                </>
              ) : null}
              {scoreAfter !== null && scoreBefore.current !== null ? (
                <div className="sc">
                  <span className="pixel from">{scoreBefore.current}</span>
                  <Icon name="chev" />
                  <CountUp className="pixel to" value={scoreAfter} from={scoreBefore.current} />
                  <span className="t">
                    <b>{scoreAfter > scoreBefore.current ? `Up ${plural(scoreAfter - scoreBefore.current, 'point', 'points')}.` : 'The score changed.'}</b>
                    <br />
                    Worked out again from this document.
                  </span>
                </div>
              ) : null}
              <div className="acts2">
                {backHref ? (
                  <TLink className="btn btn-p" href={backHref}>
                    Back to the finding
                  </TLink>
                ) : (
                  <TLink className="btn btn-p" href="/documents">
                    Done
                  </TLink>
                )}
                <button className="btn btn-g" type="button" onClick={reset}>
                  Add another
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {stage.name === 'failed' ? (
        <div className="st-v" role="alert">
          <div className="res" data-testid="drop-failed">
            <ProblemPaper kind={stage.code === 'rejected' ? 'wrong' : 'blurry'} />
            <div>
              <div className="fn">
                <span className="nm">{stage.fileName ?? 'Your file'}</span>
                <span className="st2" style={{ color: 'var(--warn)' }}>
                  Not usable
                </span>
              </div>
              <h3>{stage.code === 'payload_too_large' ? 'This file is too big' : stage.code === 'plan_upgrade_required' ? 'Adding documents is part of a paid plan' : stage.code === 'rejected' ? "This copy can't count yet" : "Vero can't read this file"}</h3>
              <p className="why">{stage.message}</p>
              {stage.code === 'plan_upgrade_required' ? (
                <p className="why">
                  <PlanLink />
                </p>
              ) : (
                <>
                  <div className="lbl2">Upload this instead</div>
                  <div className="inst">
                    <div>
                      <span>1</span>The original PDF from the signing tool, if there is one.
                    </div>
                    <div>
                      <span>2</span>Or a flat scan of every page, including the signature page, at 300 dpi or more.
                    </div>
                  </div>
                </>
              )}
              <div className="kept">Your score has not changed.</div>
              <div className="acts2">
                <button className="btn btn-p" type="button" onClick={reset}>
                  <Icon name="upload" />
                  Try another file
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
