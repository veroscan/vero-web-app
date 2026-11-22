import type { IssueSummary, VaultDocument, VaultSlotView } from '@vero/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Redirect, router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { keys, useIssues, useView } from '@/components/findings/data';
import { LightScreen } from '@/components/findings/LightScreen';
import { CompanyChoices, ErrorCard, SampleNote, SheetHead, Skeleton, SkeletonList } from '@/components/findings/Parts';
import { UploadSheet } from '@/components/findings/UploadSheet';
import { api } from '@/lib/api';
import { isToDo, slotKind, type SlotKind } from '@/lib/documents';
import { longDate, plural, whenWords } from '@/lib/format';
import { isOpenIssue } from '@/lib/issues';
import { useSession } from '@/lib/session';
import { workspaceKey } from '@/lib/workspace';
import { useTheme } from '@/theme/ThemeProvider';
import { motion } from '@/theme/tokens';
import { Seg, Sheet } from '@/ui/Controls';
import { Icon } from '@/ui/Icon';
import { Rise } from '@/ui/Motion';
import { Btn, Card, IconBtn, List, Row, Status, tap } from '@/ui/Surfaces';
import { T } from '@/ui/Text';

type Tab = 'all' | 'act';
type Kind = SlotKind | 'needed';
const SHOW = 6;

interface Fact {
  slot: VaultSlotView;
  kind: Kind;
  document: VaultDocument | undefined;
  open: IssueSummary[];
}

/** A missing slot that would clear an open finding is the one to fill; any other empty slot is never held against anyone. */
function kindOf(slot: VaultSlotView, open: IssueSummary[]): Kind {
  const kind = slotKind(slot.state);
  return kind === 'missing' && open.length > 0 ? 'needed' : kind;
}

const KIND_TONE: Record<Kind, 'urgent' | 'warn' | 'good' | 'muted'> = { ok: 'good', problem: 'warn', needed: 'urgent', missing: 'muted', reading: 'muted' };
const ORDER: Record<Kind, number> = { needed: 0, problem: 1, reading: 2, missing: 3, ok: 4 };

function statusWord(fact: Fact): string {
  if (fact.kind === 'needed') return 'Missing';
  if (fact.kind === 'missing') return 'Not shared';
  if (fact.slot.state === 'declared_missing') return "You don't have it";
  return fact.slot.stateWord;
}

function lineFor(fact: Fact): string {
  const { slot, document, kind } = fact;
  if (kind === 'needed') return fact.open.some((issue) => issue.severity === 'critical') ? 'Needed to clear an urgent finding' : 'Needed to clear an open finding';
  if (kind === 'missing') return 'Not shared yet · never lowers the score';
  if (kind === 'reading') return 'Vero is reading it now';
  if (slot.state === 'needs_confirmation') return 'Read · counts once you confirm it';
  if (slot.state === 'declared_missing') return 'Counts as a gap until you add it';
  if (slot.state === 'not_accepted') return document?.rejectionReason ?? "This copy doesn't count yet";
  if (document?.expiresOn) return `Shared by you · runs out ${longDate(document.expiresOn)}`;
  if (document) return `Shared by you · ${whenWords(document.uploadedAt).replace(/^(Today|Yesterday)$/, (word) => word.toLowerCase())}`;
  return slot.layerName;
}

/** One block of the 8-block mix bar, growing in from the left. */
function Block({ color, index }: { color: string; index: number }) {
  const still = useReducedMotion();
  const s = useSharedValue(still ? 1 : 0);
  useEffect(() => {
    if (!still) s.set(withDelay(300 + index * 70, withTiming(1, { duration: 600, easing: Easing.bezier(...motion.ease) })));
  }, [still, index, s]);
  const style = useAnimatedStyle(() => ({ opacity: s.get(), transform: [{ scaleX: s.get() }] }));
  return <Animated.View style={[{ flex: 1, height: 10, borderRadius: 3, backgroundColor: color, transformOrigin: 'left' }, style]} />;
}

/** Shares eight blocks between the kinds, keeping at least one for any kind that has slots. */
function blocks(counts: { kind: Kind; n: number }[], total: number): Kind[] {
  const live = counts.filter((item) => item.n > 0);
  if (total === 0 || live.length === 0) return [];
  const raw = live.map((item) => ({ ...item, share: Math.max(1, Math.floor((item.n / total) * 8)), rest: ((item.n / total) * 8) % 1 }));
  let used = raw.reduce((sum, item) => sum + item.share, 0);
  const byRest = [...raw].sort((a, b) => b.rest - a.rest);
  for (let k = 0; used < 8 && k < byRest.length * 8; k += 1) {
    const item = byRest[k % byRest.length];
    if (item) {
      item.share += 1;
      used += 1;
    }
  }
  while (used > 8) {
    const biggest = raw.reduce((a, b) => (b.share > a.share ? b : a));
    biggest.share -= 1;
    used -= 1;
  }
  return raw.flatMap((item) => Array.from({ length: item.share }, () => item.kind));
}

/** Documents, as on the Documents board, against the company's document slots. */
export default function Documents() {
  const { c } = useTheme();
  const queries = useQueryClient();
  const { status } = useSession();
  const { view, loading, error, refetch } = useView();
  const [picked, setPicked] = useState<string | null>(null);
  const [choosing, setChoosing] = useState(false);
  const [tab, setTab] = useState<Tab>('all');
  const [showAll, setShowAll] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [upload, setUpload] = useState<{ wanted: { slotKey: string; label: string } | null; resume: VaultDocument | null; title: string } | null>(null);

  const company = view ? (view.companies.find((item) => item.id === (picked ?? view.focus)) ?? view.companies[0] ?? null) : null;
  const companyId = company?.id;
  const vault = useQuery({ queryKey: keys.vault(companyId ?? 'none'), enabled: !!companyId, queryFn: () => api.vault.get({ params: { companyId: companyId ?? '' } }) });
  const issues = useIssues(companyId, 'company');

  const facts = useMemo<Fact[]>(() => {
    const data = vault.data;
    if (!data) return [];
    const list = issues.data?.issues ?? [];
    return data.slots
      .map((slot) => {
        const open = list.filter((issue) => slot.ruleKeys.includes(issue.ruleKey) && isOpenIssue(issue));
        return { slot, kind: kindOf(slot, open), document: data.documents.find((document) => document.id === slot.documentId), open };
      })
      .sort((a, b) => ORDER[a.kind] - ORDER[b.kind]);
  }, [vault.data, issues.data]);

  const count = (kind: Kind) => facts.filter((fact) => fact.kind === kind).length;
  const toDo = facts.filter((fact) => isToDo(fact.slot.state));
  const bar = blocks(
    (['ok', 'problem', 'reading', 'needed', 'missing'] as Kind[]).map((kind) => ({ kind, n: count(kind) })),
    facts.length,
  );
  const blockColour: Record<Kind, string> = { ok: c.good, problem: c.warn, reading: c.link, needed: c.urgent, missing: c.dark ? 'rgba(150,170,255,0.14)' : '#D9DEE9' };
  const canUpload = vault.data?.canUpload ?? false;
  const following = company?.relationship === 'follow';
  const canAct = canUpload && !following;
  const waiting = (vault.data?.documents ?? []).filter((document) => document.status === 'failed' || ((document.status === 'pending' || document.status === 'processing' || document.status === 'needs_confirmation') && !vault.data?.slots.some((slot) => slot.documentId === document.id)));

  const openSlot = (fact: Fact) => {
    if (!canAct) return;
    if (fact.slot.state === 'needs_confirmation' && fact.document) setUpload({ wanted: { slotKey: fact.slot.key, label: fact.slot.label }, resume: fact.document, title: 'Confirm the document' });
    else setUpload({ wanted: { slotKey: fact.slot.key, label: fact.slot.label }, resume: null, title: fact.kind === 'ok' ? 'Add a newer copy' : 'Add the document' });
  };

  const refresh = async () => {
    setPulling(true);
    try {
      await Promise.all([refetch(), queries.invalidateQueries({ queryKey: workspaceKey })]);
    } finally {
      setPulling(false);
    }
  };

  const row = (fact: Fact) => (
    <Row
      key={fact.slot.key}
      title={fact.slot.label}
      sub={lineFor(fact)}
      right={<Status word={statusWord(fact)} tone={KIND_TONE[fact.kind]} />}
      chevron={canAct}
      accessibilityLabel={`${fact.slot.label}, ${statusWord(fact)}`}
      {...(canAct ? { onPress: () => openSlot(fact) } : {})}
    />
  );

  const sections: { title: string; kinds: Kind[] }[] = [
    { title: 'With a problem', kinds: ['problem'] },
    { title: 'Being read', kinds: ['reading'] },
    { title: 'Missing', kinds: ['needed', 'missing'] },
    { title: 'In order', kinds: ['ok'] },
  ];

  const header = (
    <>
      <IconBtn icon="back" label="Back" light onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
      <View style={{ flex: 1 }} />
      {canAct ? <IconBtn icon="plus" label="Add a document" light onPress={() => setUpload({ wanted: null, resume: null, title: 'Add a document' })} /> : null}
    </>
  );

  if (status === 'signedOut') return <Redirect href="/welcome" />;
  return (
    <>
      <LightScreen
        header={header}
        onRefresh={() => void refresh()}
        refreshing={pulling}
        dock={canAct ? <Btn label="Add a document" icon="upload" onPress={() => setUpload({ wanted: null, resume: null, title: 'Add a document' })} testID="add-document" /> : undefined}
      >
        <Rise>
          <T variant="h1" accessibilityRole="header" style={{ marginTop: 4 }}>
            Documents
          </T>
        </Rise>
        <Rise d={1}>
          <T variant="sub" style={{ marginTop: 6 }}>
            From registers, and the ones you share
          </T>
        </Rise>
        {view && view.companies.length > 1 && company ? (
          <Rise d={1}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${company.legalName}. Choose another company`}
              onPress={() => {
                tap();
                setChoosing(true);
              }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, alignSelf: 'flex-start' }}
            >
              <T weight={700} size={14} color={c.link}>
                {company.legalName}
              </T>
              <Icon name="down" size={16} color={c.link} />
            </Pressable>
          </Rise>
        ) : null}

        {loading || vault.isPending ? (
          <View style={{ gap: 16, marginTop: 20 }}>
            <Skeleton h={84} r={24} />
            <Skeleton h={46} r={15} />
            <SkeletonList rows={4} />
          </View>
        ) : (error && !view) || vault.error ? (
          <ErrorCard error={vault.error ?? error} onRetry={() => void refresh()} style={{ marginTop: 20 }} />
        ) : !company ? (
          <Card style={{ marginTop: 20 }}>
            <T weight={700} size={15}>
              No company yet
            </T>
            <T variant="sub" style={{ marginTop: 4 }}>
              Documents show here once Vero knows which company they belong to.
            </T>
          </Card>
        ) : (
          <>
            {view?.overview?.sampleData ? (
              <Rise d={2}>
                <SampleNote style={{ marginTop: 18 }} />
              </Rise>
            ) : null}
            <Rise d={2}>
              <Card padded={false} style={{ marginTop: 20, paddingTop: 18, paddingHorizontal: 18, paddingBottom: 16 }}>
                <View accessible accessibilityLabel={`${count('ok')} in order, ${count('problem')} with a problem, ${count('needed') + count('missing')} missing`} style={{ flexDirection: 'row', gap: 4 }}>
                  {bar.map((kind, index) => (
                    <Block key={`${kind}-${index}`} color={blockColour[kind]} index={index} />
                  ))}
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                  <T variant="small">
                    <T weight={700} size={15} color={c.good}>
                      {count('ok')}
                    </T>{' '}
                    in order
                  </T>
                  <T variant="small">
                    <T weight={700} size={15} color={c.warn}>
                      {count('problem') + count('reading')}
                    </T>{' '}
                    with a problem
                  </T>
                  <T variant="small">
                    <T weight={700} size={15} color={count('needed') > 0 ? c.urgent : c.ink3}>
                      {count('needed') + count('missing')}
                    </T>{' '}
                    missing
                  </T>
                </View>
              </Card>
            </Rise>

            {!canUpload ? (
              <Rise d={3}>
                <Card style={{ marginTop: 14 }}>
                  <T weight={700} size={15} accessibilityRole="header">
                    Adding documents is part of a paid plan
                  </T>
                  <T variant="sub" style={{ marginTop: 4 }}>
                    The first read comes from public records and your answers, so you don&apos;t need any documents to see it. Adding them lets Vero check what registries can&apos;t.
                  </T>
                </Card>
              </Rise>
            ) : following ? (
              <T variant="small" style={{ marginTop: 14 }}>
                You follow {company.legalName}, so you can see what Vero has read, not change it.
              </T>
            ) : null}

            {waiting.length > 0 ? (
              <Rise d={3}>
                <T variant="label" style={{ marginTop: 26, marginBottom: 10, marginHorizontal: 4 }} accessibilityRole="header">
                  Waiting for you
                </T>
                <List>
                  {waiting.map((document) => (
                    <Row
                      key={document.id}
                      title={document.fileName ?? 'A document'}
                      sub={document.status === 'failed' ? (document.rejectionReason ?? "Vero couldn't read this file.") : document.status === 'needs_confirmation' ? 'Read · counts once you confirm where it belongs' : 'Vero is reading it now'}
                      right={<Status word={document.status === 'needs_confirmation' ? 'Confirm' : document.stateWord} tone={document.status === 'failed' ? 'urgent' : document.status === 'needs_confirmation' ? 'warn' : 'muted'} />}
                      {...(document.status === 'needs_confirmation' && canAct ? { onPress: () => setUpload({ wanted: null, resume: document, title: 'Confirm the document' }), chevron: true } : {})}
                    />
                  ))}
                </List>
              </Rise>
            ) : null}

            <Rise d={3}>
              <Seg
                style={{ marginTop: 18 }}
                value={tab}
                onChange={setTab}
                options={[
                  { value: 'all', label: `All ${facts.length}` },
                  { value: 'act', label: `Needs action ${toDo.length}` },
                ]}
              />
            </Rise>

            {tab === 'all' ? (
              <Rise key="all">
                {sections.map((section) => {
                  const items = facts.filter((fact) => section.kinds.includes(fact.kind));
                  if (items.length === 0) return null;
                  const long = section.kinds.includes('ok') && items.length > SHOW && !showAll;
                  return (
                    <View key={section.title}>
                      <T variant="label" style={{ marginTop: 26, marginBottom: 10, marginHorizontal: 4 }} accessibilityRole="header">
                        {section.title} · {items.length}
                      </T>
                      <List>{(long ? items.slice(0, SHOW) : items).map(row)}</List>
                      {long ? <Btn kind="ghost" label={`Show all ${items.length}`} onPress={() => setShowAll(true)} style={{ marginTop: 12 }} /> : null}
                    </View>
                  );
                })}
              </Rise>
            ) : (
              <Rise key="act">
                {toDo.length === 0 ? (
                  <Card style={{ marginTop: 18 }}>
                    <T weight={700} size={14}>
                      Nothing needs action
                    </T>
                    <T variant="small" style={{ marginTop: 2 }}>
                      Everything Vero expects is on file or being read.
                    </T>
                  </Card>
                ) : (
                  <List style={{ marginTop: 18 }}>{toDo.map(row)}</List>
                )}
              </Rise>
            )}
            <T variant="small" style={{ marginTop: 18, marginHorizontal: 4 }}>
              {vault.data ? `${vault.data.filledCount} of ${plural(vault.data.totalCount, 'document', 'documents')} in place. ` : ''}Empty slots never lower the score. Filling them can raise it.
            </T>
          </>
        )}
      </LightScreen>

      {view && company ? (
        <Sheet open={choosing} onClose={() => setChoosing(false)} label="Choose a company">
          <SheetHead title="Whose documents" onClose={() => setChoosing(false)} />
          <View style={{ height: 14 }} />
          <CompanyChoices
            companies={view.companies}
            focus={company.id}
            hasGroup={false}
            onPick={(id) => {
              if (id) setPicked(id);
              setShowAll(false);
              setChoosing(false);
            }}
          />
        </Sheet>
      ) : null}
      {company ? (
        <UploadSheet
          open={upload !== null}
          onClose={() => setUpload(null)}
          companyId={company.id}
          companyName={company.legalName}
          wanted={upload?.wanted ?? null}
          resume={upload?.resume ?? null}
          title={upload?.title ?? 'Add a document'}
        />
      ) : null}
    </>
  );
}
