import type { VaultDocument, VaultSlotView } from '@vero/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, ZoomIn, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { api, asApiError } from '@/lib/api';
import { confirmFieldsFor } from '@/lib/documents';
import { midSentence, plural, sizeWords } from '@/lib/format';
import { workspaceKey } from '@/lib/workspace';
import { useTheme } from '@/theme/ThemeProvider';
import { Field, Sheet, Switch } from '@/ui/Controls';
import { Icon } from '@/ui/Icon';
import { Rise, useCountUp } from '@/ui/Motion';
import { Btn, tap } from '@/ui/Surfaces';
import { Kicker, Pixel, T } from '@/ui/Text';
import { keys } from './data';
import { SheetHead } from './Parts';

const MAX_UPLOAD_MB = 25;
/** How many reads in a row can fail for a passing reason before we say the document failed. */
const READ_RETRIES = 4;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

type Stage =
  | { name: 'idle' }
  | { name: 'up'; fileName: string; size: number }
  | { name: 'read'; fileName: string; size: number; id: string }
  | { name: 'confirm'; document: VaultDocument }
  | { name: 'filed'; document: VaultDocument }
  | { name: 'rejected'; document: VaultDocument; slotKey: string }
  | { name: 'failed'; fileName: string | null; message: string; code: string | null };

/** Reads the picked file's bytes: the File on web, the local copy on a phone. */
async function bytesOf(asset: DocumentPicker.DocumentPickerAsset): Promise<Uint8Array<ArrayBuffer>> {
  if (asset.file) return new Uint8Array(await asset.file.arrayBuffer());
  const response = await fetch(asset.uri);
  return new Uint8Array(await response.arrayBuffer());
}

/** One line of the kit's `.steps`: waiting, now (a spinning ring) or done (a green tick that pops). */
function Step({ title, sub, state }: { title: string; sub: string; state: 'wait' | 'now' | 'on' }) {
  const { c } = useTheme();
  const still = useReducedMotion();
  const spin = useSharedValue(0);
  useEffect(() => {
    if (state === 'now' && !still) spin.set(withRepeat(withTiming(360, { duration: 800, easing: Easing.linear }), -1, false));
    else spin.set(0);
  }, [state, still, spin]);
  const ring = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.get()}deg` }] }));
  const base = c.dark ? 'rgba(150,170,255,0.14)' : '#C9CFDD';
  return (
    <View accessible accessibilityLabel={`${title}, ${state === 'on' ? 'done' : state === 'now' ? 'in progress' : 'waiting'}`} style={{ flexDirection: 'row', gap: 14, paddingVertical: 11, paddingHorizontal: 2, opacity: state === 'wait' ? 0.35 : 1 }}>
      <View style={{ width: 24, height: 24 }}>
        {state === 'on' ? (
          <Animated.View entering={still ? undefined : ZoomIn.springify().damping(12)} style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: c.good, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={15} color="#fff" stroke={2.6} />
          </Animated.View>
        ) : (
          <Animated.View style={[{ width: 24, height: 24, borderRadius: 12, borderWidth: 1.6, borderColor: state === 'now' ? '#0182FA' : base, borderTopColor: state === 'now' ? 'transparent' : base }, ring]} />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <T weight={700} size={14.5} style={{ lineHeight: 19 }}>
          {title}
        </T>
        <T variant="small">{sub}</T>
      </View>
    </View>
  );
}

/** A radio card in the kit's `.opt` style. */
function Option({ label, sub, on, onPress }: { label: string; sub?: string; on: boolean; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: on }}
      accessibilityLabel={label}
      onPress={() => {
        tap();
        onPress();
      }}
      style={{ flexDirection: 'row', gap: 14, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 18, borderWidth: 1, borderColor: on ? c.navy : c.cardBorder, backgroundColor: c.dark ? c.card : '#fff', marginTop: 8 }}
    >
      <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 1.6, borderColor: on ? c.navy : c.dark ? 'rgba(150,170,255,0.25)' : '#C9CFDD', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
        {on ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c.navy }} /> : null}
      </View>
      <View style={{ flex: 1 }}>
        <T weight={700} size={14.5}>
          {label}
        </T>
        {sub ? (
          <T variant="small" style={{ marginTop: 2 }}>
            {sub}
          </T>
        ) : null}
      </View>
    </Pressable>
  );
}

/** The person says where the document belongs. Nothing counts until they do (web: ConfirmDocument). */
function Confirm({ document, slots, wanted, onFiled, onRejected }: { document: VaultDocument; slots: readonly VaultSlotView[]; wanted: string | null; onFiled: (document: VaultDocument) => void; onRejected: (document: VaultDocument, slotKey: string) => void }) {
  const { c } = useTheme();
  const suggested = document.suggestion?.slotKey && slots.some((slot) => slot.key === document.suggestion?.slotKey) ? document.suggestion.slotKey : null;
  const start = suggested ?? (wanted && slots.some((slot) => slot.key === wanted) ? wanted : '');
  const [choosing, setChoosing] = useState(!start);
  const [slotKey, setSlotKey] = useState(start);
  const [documentDate, setDocumentDate] = useState('');
  const [expiresOn, setExpiresOn] = useState('');
  const [validated, setValidated] = useState(false);
  const [signed, setSigned] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const slot = slots.find((candidate) => candidate.key === slotKey);
  const fields = confirmFieldsFor(slot);
  const needsMore = (fields.needsDocumentDate && !DATE.test(documentDate)) || (fields.needsExpiry && !DATE.test(expiresOn));
  const unsigned = document.signatureHint === 'looks_unsigned';
  // The slots most likely to be right come first: the one asked for, the suggestion, then the empty ones.
  const ordered = [...slots].sort((a, b) => Number(b.key === wanted) - Number(a.key === wanted) || Number(b.key === suggested) - Number(a.key === suggested) || Number(b.state !== 'read') - Number(a.state !== 'read'));

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
          ...(unsigned && signed ? { confirmSigned: true } : {}),
        },
      });
      if (result.status === 'rejected') onRejected(result, slotKey);
      else onFiled(result);
    } catch (error) {
      setProblem(asApiError(error).message);
      setBusy(false);
    }
  };

  const label = slot?.label ?? document.suggestion?.label ?? null;
  return (
    <Rise>
      <T weight={700} size={17} style={{ marginTop: 6, lineHeight: 22, letterSpacing: -0.25 }} accessibilityRole="header">
        {!choosing && label ? (suggested === slotKey ? `This looks like the ${midSentence(label)}` : `File it as the ${midSentence(label)}?`) : 'Where does this belong?'}
      </T>
      <T variant="sub" style={{ marginTop: 4 }}>
        {document.suggestion?.label ? 'Vero read every page. Nothing counts until you confirm where it goes.' : "Vero read it but couldn't tell what it is. Choose where it goes and Vero checks it against that."}
      </T>
      {document.signatureHintWords ? (
        <T variant="small" color={unsigned ? c.warn : c.ink3} style={{ marginTop: 8 }}>
          {document.signatureHintWords}
        </T>
      ) : null}
      {choosing ? (
        <View style={{ marginTop: 8 }} accessibilityRole="radiogroup">
          {ordered.slice(0, 12).map((item) => (
            <Option key={item.key} label={item.label} sub={item.layerName} on={item.key === slotKey} onPress={() => setSlotKey(item.key)} />
          ))}
        </View>
      ) : null}
      {fields.needsDocumentDate ? <Field style={{ marginTop: 12 }} value={documentDate} onChangeText={setDocumentDate} placeholder="Date on the certificate, YYYY-MM-DD" accessibilityLabel="Date on the certificate" keyboardType="numbers-and-punctuation" icon="cal" /> : null}
      {fields.needsExpiry ? <Field style={{ marginTop: 12 }} value={expiresOn} onChangeText={setExpiresOn} placeholder="When it runs out, YYYY-MM-DD" accessibilityLabel="When does it run out?" keyboardType="numbers-and-punctuation" icon="cal" /> : null}
      {fields.canValidate ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14 }}>
          <T variant="small" style={{ flex: 1 }}>
            I&apos;ve checked this certificate is genuine with the Delaware Division of Corporations.
          </T>
          <Switch value={validated} onChange={setValidated} label="I've checked this certificate is genuine" />
        </View>
      ) : null}
      {unsigned ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14 }}>
          <T variant="small" style={{ flex: 1 }}>
            It is signed. Vero only guessed, and you have the last word.
          </T>
          <Switch value={signed} onChange={setSigned} label="It is signed" />
        </View>
      ) : null}
      {problem ? (
        <T variant="small" color={c.urgent} style={{ marginTop: 12 }} accessibilityRole="alert">
          {problem}
        </T>
      ) : null}
      <Btn label={busy ? 'Filing it' : choosing ? 'File it here' : 'Yes, file it'} busy={busy} disabled={!slotKey || needsMore} onPress={() => void file()} style={{ marginTop: 18 }} testID="confirm-file" />
      {!choosing ? <Btn kind="ghost" label="No, it's something else" onPress={() => setChoosing(true)} style={{ marginTop: 10 }} /> : null}
    </Rise>
  );
}

/**
 * Upload proof, as on the Upload board: pick a file, watch it upload and be read (the steps fill
 * in as the API reports them), confirm where it belongs, then see the score worked out again.
 * Every state comes from the real upload, read and confirm calls.
 */
export function UploadSheet({
  open,
  onClose,
  companyId,
  companyName,
  wanted,
  resume,
  title = 'Upload proof',
}: {
  open: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
  /** The slot the person came to fill, when they came from one. */
  wanted?: { slotKey: string; label: string } | null;
  /** Pick up a document that's already been read and is waiting to be confirmed. */
  resume?: VaultDocument | null;
  title?: string;
}) {
  const { c } = useTheme();
  const queries = useQueryClient();
  const { height } = useWindowDimensions();
  const [stage, setStage] = useState<Stage>({ name: 'idle' });
  const [picking, setPicking] = useState(false);
  const [before, setBefore] = useState<number | null>(null);
  const [after, setAfter] = useState<number | null>(null);
  const [settled, setSettled] = useState(false);
  const vault = useQuery({ queryKey: keys.vault(companyId), enabled: open, queryFn: () => api.vault.get({ params: { companyId } }) });
  const fetchScore = async (): Promise<number | null> => {
    const overview = await queries.fetchQuery({ queryKey: keys.overview(companyId), staleTime: 0, queryFn: () => api.results.overview({ params: { companyId }, query: { scope: 'company' } }) });
    return overview.score.kind === 'exact' ? overview.score.value : null;
  };

  // A fresh start each time the sheet opens (previous-value pattern, during render; starts at
  // false so a sheet mounted already open starts fresh too).
  const [wasOpen, setWasOpen] = useState(false);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) {
      setStage(resume ? { name: 'confirm', document: resume } : { name: 'idle' });
      setAfter(null);
      setSettled(false);
    }
  }

  const choose = async () => {
    setPicking(true);
    try {
      const picked = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg'],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (picked.canceled) return;
      const asset = picked.assets[0];
      if (!asset) return;
      const size = asset.size ?? asset.file?.size ?? 0;
      if (size > MAX_UPLOAD_MB * 1024 * 1024) {
        setStage({ name: 'failed', fileName: asset.name, code: 'payload_too_large', message: `That file is too big to upload. The limit is ${MAX_UPLOAD_MB} MB, so try a smaller copy.` });
        return;
      }
      setBefore(await fetchScore().catch(() => null));
      setAfter(null);
      setSettled(false);
      setStage({ name: 'up', fileName: asset.name, size });
      try {
        const uploaded = await api.vault.upload({
          params: { companyId },
          query: { fileName: asset.name, ...(wanted ? { slotKey: wanted.slotKey } : {}) },
          body: await bytesOf(asset),
        });
        setStage({ name: 'read', fileName: asset.name, size, id: uploaded.id });
      } catch (error) {
        const failure = asApiError(error);
        setStage({ name: 'failed', fileName: asset.name, code: failure.code, message: failure.message });
      }
    } finally {
      setPicking(false);
    }
  };

  // Reading happens in the background on the API, so this asks until it's finished.
  const readingId = stage.name === 'read' ? stage.id : null;
  const readingName = stage.name === 'read' ? stage.fileName : null;
  useEffect(() => {
    if (!readingId) return;
    let live = true;
    let misses = 0;
    let timer: ReturnType<typeof setTimeout>;
    const check = () => {
      api.vault.document({ params: { documentId: readingId } }).then(
        (document) => {
          if (!live) return;
          misses = 0;
          if (document.status === 'pending' || document.status === 'processing') timer = setTimeout(check, 1200);
          else if (document.status === 'failed') setStage({ name: 'failed', fileName: document.fileName ?? readingName, code: document.status, message: document.rejectionReason ?? "Vero couldn't read this file. Please upload it again." });
          else if (document.status === 'rejected') setStage({ name: 'rejected', document, slotKey: document.slotKey ?? '' });
          else if (document.status === 'filed') setStage({ name: 'filed', document });
          else setStage({ name: 'confirm', document });
        },
        (error: unknown) => {
          if (!live) return;
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
      live = false;
      clearTimeout(timer);
    };
  }, [readingId, readingName]);

  // Once filed, the score is worked out again in the background: follow it until it moves.
  const filedId = stage.name === 'filed' ? stage.document.id : null;
  useEffect(() => {
    if (!filedId) return;
    let live = true;
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const look = async () => {
      const score = await fetchScore().catch(() => null);
      if (!live) return;
      tries += 1;
      if (score !== null && before !== null && score !== before) {
        setAfter(score);
        setSettled(true);
        void queries.invalidateQueries({ queryKey: workspaceKey });
        return;
      }
      if (tries >= 10) {
        setSettled(true);
        void queries.invalidateQueries({ queryKey: workspaceKey });
        return;
      }
      timer = setTimeout(() => void look(), 2500);
    };
    timer = setTimeout(() => void look(), 1200);
    return () => {
      live = false;
      clearTimeout(timer);
    };
    // Follows one filed document.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filedId]);

  const close = () => {
    void queries.invalidateQueries({ queryKey: workspaceKey });
    onClose();
  };

  const canUpload = vault.data?.canUpload ?? true;
  const fileName = stage.name === 'up' || stage.name === 'read' ? stage.fileName : stage.name === 'confirm' || stage.name === 'filed' || stage.name === 'rejected' ? (stage.document.fileName ?? 'Your document') : stage.name === 'failed' ? stage.fileName : null;
  const facts =
    stage.name === 'up' || stage.name === 'read'
      ? sizeWords(stage.size)
      : stage.name === 'confirm' || stage.name === 'filed' || stage.name === 'rejected'
        ? [stage.document.pages ? plural(stage.document.pages, 'page', 'pages') : null, sizeWords(stage.document.sizeBytes)].filter(Boolean).join(' · ')
        : null;
  const order = ['up', 'read', 'confirm', 'filed'];
  const at = order.indexOf(stage.name);
  const stepState = (index: number): 'wait' | 'now' | 'on' => {
    if (stage.name === 'filed') return index < 2 || settled ? 'on' : 'now';
    if (at < 0) return 'wait';
    if (index < at) return 'on';
    if (index === at) return stage.name === 'confirm' ? 'wait' : 'now';
    return 'wait';
  };
  const target = wanted?.label ? `the ${midSentence(wanted.label)}` : 'the checks it can clear';
  const showSteps = stage.name === 'up' || stage.name === 'read' || stage.name === 'confirm' || (stage.name === 'filed' && !settled);
  const filedSlot = stage.name === 'filed' ? (vault.data?.slots.find((slot) => slot.key === stage.document.slotKey) ?? null) : null;
  const to = useCountUp(after ?? 0, { from: before ?? 0, ms: 1100, delay: 200 });

  return (
    <Sheet open={open} onClose={close} label={title}>
      <SheetHead title={title} onClose={close} />
      <ScrollView style={{ maxHeight: height * 0.72 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {fileName ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 16, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 18, backgroundColor: c.dark ? 'rgba(61,123,255,0.16)' : '#F6F7FB' }}>
            <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.dark ? c.card : '#fff', borderWidth: 1, borderColor: c.cardBorder, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="doc" size={22} color={c.navy} />
            </View>
            <View style={{ flex: 1 }}>
              <T weight={700} size={14.5} numberOfLines={1}>
                {fileName}
              </T>
              {facts ? <T variant="small">{facts}</T> : null}
            </View>
          </View>
        ) : null}

        {stage.name === 'idle' ? (
          !canUpload ? (
            <View style={{ marginTop: 14 }} testID="upload-locked">
              <T weight={700} size={15}>
                Adding documents is part of a paid plan
              </T>
              <T variant="sub" style={{ marginTop: 4 }}>
                Your plan shows the documents Vero expects for {companyName}, but can&apos;t add them. The first read comes from public records and your answers.
              </T>
              <Btn kind="ghost" label="Close" onPress={close} style={{ marginTop: 16 }} />
            </View>
          ) : (
            <View style={{ marginTop: 14 }}>
              <T variant="sub">{wanted ? `Add the ${midSentence(wanted.label)} for ${companyName}. ` : `Add a document for ${companyName}. `}PDF, Word or a clear photo, up to {MAX_UPLOAD_MB} MB. Vero reads it and checks again.</T>
              <Btn label={picking ? 'Opening your files' : 'Choose a file'} icon="upload" busy={picking} onPress={() => void choose()} style={{ marginTop: 18 }} testID="choose-file" />
              <T variant="small" center style={{ marginTop: 12 }}>
                Stored privately and never shared.
              </T>
            </View>
          )
        ) : null}

        {showSteps ? (
          <View style={{ marginTop: 18 }} accessibilityLiveRegion="polite">
            <Step title={stage.name === 'up' ? 'Uploading' : 'Uploaded'} sub="Stored privately, never shared" state={stepState(0)} />
            <Step title={stage.name === 'read' ? 'Reading the document' : 'Read'} sub="Who signed it, dates, what it is" state={stepState(1)} />
            <Step title={stage.name === 'filed' ? 'Working out the score again' : 'Matching it to the finding'} sub={stage.name === 'filed' ? 'Usually under a minute' : `Checking it against ${target}`} state={stepState(2)} />
          </View>
        ) : null}

        {stage.name === 'confirm' ? (
          <Confirm
            document={stage.document}
            slots={vault.data?.slots ?? []}
            wanted={wanted?.slotKey ?? null}
            onFiled={(document) => setStage({ name: 'filed', document })}
            onRejected={(document, slotKey) => setStage({ name: 'rejected', document, slotKey })}
          />
        ) : null}

        {stage.name === 'filed' && settled ? (
          <Rise>
            <Kicker style={{ color: c.good, marginTop: 14 }}>{filedSlot ? `Filed as the ${midSentence(filedSlot.label)}` : 'Filed'}</Kicker>
            {after !== null && before !== null ? (
              <View accessible accessibilityLabel={`${companyName}'s score went from ${before} to ${after}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, marginBottom: 18 }}>
                <Pixel size={60} color={c.ink4}>
                  {before}
                </Pixel>
                <Icon name="chev" size={18} color={c.ink4} />
                <Pixel size={60} color={c.good}>
                  {to}
                </Pixel>
                <T variant="small" style={{ marginLeft: 8, flexShrink: 1 }}>
                  {`${companyName}'s score,\nworked out again`}
                </T>
              </View>
            ) : (
              <T variant="sub" style={{ marginTop: 8, marginBottom: 18 }}>
                It&apos;s on file. The score hasn&apos;t moved yet; Vero checks it against everything it can clear, and the score updates on its own.
              </T>
            )}
            <Btn label="Done" onPress={close} testID="upload-done-btn" />
            <Btn kind="ghost" label="Add another" onPress={() => setStage({ name: 'idle' })} style={{ marginTop: 10 }} />
          </Rise>
        ) : null}

        {stage.name === 'rejected' ? (
          <Rise>
            <Kicker style={{ color: c.warn, marginTop: 14 }}>Kept, not counted yet</Kicker>
            <T variant="sub" style={{ marginTop: 6 }}>
              {stage.document.rejectionReason ?? "This copy doesn't count yet."}
            </T>
            {stage.document.signatureHint === 'looks_unsigned' && stage.slotKey ? (
              <Btn
                label="It is signed, count it"
                style={{ marginTop: 16 }}
                onPress={() => {
                  const { document, slotKey } = stage;
                  void api.vault.confirm({ params: { documentId: document.id }, body: { slotKey, confirmSigned: true } }).then(
                    (result) => setStage(result.status === 'filed' ? { name: 'filed', document: result } : { name: 'rejected', document: result, slotKey }),
                    (error: unknown) => setStage({ name: 'failed', fileName: document.fileName, code: asApiError(error).code, message: asApiError(error).message }),
                  );
                }}
              />
            ) : null}
            <Btn kind="ghost" label="Upload the signed copy" icon="upload" onPress={() => setStage({ name: 'idle' })} style={{ marginTop: 10 }} />
          </Rise>
        ) : null}

        {stage.name === 'failed' ? (
          <Rise>
            <Kicker style={{ color: c.warn, marginTop: 14 }}>{stage.code === 'plan_upgrade_required' ? 'Paid plan' : 'Not usable'}</Kicker>
            <T weight={700} size={17} style={{ marginTop: 6 }}>
              {stage.code === 'payload_too_large' ? 'This file is too big' : stage.code === 'plan_upgrade_required' ? 'Adding documents is part of a paid plan' : "Vero can't use this file"}
            </T>
            <T variant="sub" style={{ marginTop: 4 }}>
              {stage.message}
            </T>
            <T variant="small" style={{ marginTop: 10 }}>
              Your score has not changed.
            </T>
            {stage.code !== 'plan_upgrade_required' ? <Btn label="Try another file" icon="upload" onPress={() => setStage({ name: 'idle' })} style={{ marginTop: 16 }} /> : <Btn kind="ghost" label="Close" onPress={close} style={{ marginTop: 16 }} />}
          </Rise>
        ) : null}
      </ScrollView>
    </Sheet>
  );
}
