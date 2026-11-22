import type { IssueDetail, Scan } from '@vero/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useEffectEvent, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { keys } from '@/components/findings/data';
import { Dock } from '@/components/findings/LightScreen';
import { ErrorCard, SampleNote, Skeleton, SkeletonList } from '@/components/findings/Parts';
import { UploadSheet } from '@/components/findings/UploadSheet';
import { api, asApiError } from '@/lib/api';
import { isInPlace, PROOF_WORDS, slotTone } from '@/lib/documents';
import { countryShort, midSentence, plural, shortDate } from '@/lib/format';
import { FINDING_WORDS, findingSource, findingStatus, withoutReferrals } from '@/lib/issues';
import { useSession } from '@/lib/session';
import { useWorkspace, workspaceKey } from '@/lib/workspace';
import { useTheme } from '@/theme/ThemeProvider';
import { brand } from '@/theme/tokens';
import { Icon } from '@/ui/Icon';
import { Rise, useCountUp } from '@/ui/Motion';
import { Pad, Screen } from '@/ui/Screen';
import { Btn, Card, IconBtn, List, Row, Section, tap } from '@/ui/Surfaces';
import { Pixel, T } from '@/ui/Text';

/** On the navy top the status words use the lighter versions the boards use there. */
const KICK_COLOUR = { urgent: '#FF9EA2', attention: '#FCD34D', cleared: '#5EEAD4', unseen: 'rgba(255,255,255,0.75)', na: 'rgba(255,255,255,0.75)' } as const;

const FINISHED = new Set<Scan['status']>(['partial', 'completed', 'failed']);

/** Scans this one company again and follows it until it finishes (web: useScanAgain). */
function useScanAgain(companyId: string, onDone: () => void) {
  const [scan, setScan] = useState<Scan | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  // Always calls the latest `onDone` without making it a dependency of the polling effect.
  const done = useEffectEvent(onDone);
  const running = scan !== null && !FINISHED.has(scan.status);
  const start = () => {
    if (running) return;
    setProblem(null);
    api.scans.create({ params: { companyId } }).then(setScan, (error: unknown) => setProblem(asApiError(error).message));
  };
  const key = scan ? `${scan.id}:${scan.status}:${scan.checksDone}` : '';
  useEffect(() => {
    if (!scan) return;
    if (FINISHED.has(scan.status)) {
      done();
      return;
    }
    const timer = setTimeout(
      () => {
        api.scans.get({ params: { scanId: scan.id } }).then(setScan, (error: unknown) => {
          setScan(null);
          setProblem(asApiError(error).message);
        });
      },
      Math.max(800, scan.pollAfterMs),
    );
    return () => clearTimeout(timer);
    // `key` stands for the scan's progress.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const checked = scan ? (FINISHED.has(scan.status) ? scan.checksTotal : scan.checksDone + scan.checksDown) : 0;
  return { running, problem, checked, total: scan?.checksTotal ?? 0, finished: scan !== null && FINISHED.has(scan.status), start };
}

/** "We don't have it" and its undo. Saying it turns the document into a gap, so the words say that first. */
function DeclareMissing({ issue }: { issue: IssueDetail }) {
  const { c } = useTheme();
  const queries = useQueryClient();
  const [stage, setStage] = useState<'idle' | 'saving' | 'scoring'>('idle');
  const [problem, setProblem] = useState<string | null>(null);
  const declared = issue.declaredMissing === true;
  const params = { companyId: issue.companyId, ruleKey: issue.ruleKey };

  const change = async (target: boolean) => {
    setStage('saving');
    setProblem(null);
    try {
      const result = target ? await api.results.declareMissing({ params }) : await api.results.undeclareMissing({ params });
      setStage('scoring');
      // The new score comes from a re-score that runs on its own, so wait until it shows.
      let settled = !result.rescoreQueued;
      for (let check = 0; check < 40 && !settled; check += 1) {
        await new Promise((resolve) => setTimeout(resolve, 700));
        const current = await api.results.issue({ params });
        settled = (current.declaredMissing === true) === target;
      }
      await queries.invalidateQueries({ queryKey: workspaceKey });
      if (!settled) setProblem("We've saved that, but your score is still being worked out. Check back in a moment.");
    } catch (error) {
      setProblem(asApiError(error).message);
    } finally {
      setStage('idle');
    }
  };

  const busy = stage !== 'idle';
  return (
    <Card style={{ marginTop: 14 }}>
      <T weight={700} size={15} accessibilityRole="header">
        {declared ? "You told us you don't have this" : "Don't have it?"}
      </T>
      <T variant="sub" style={{ marginTop: 4 }}>
        {declared ? 'It counts as a gap in your score until you add it or undo this.' : "Tell us and it becomes a gap, which may lower your score. You can undo that."}
      </T>
      <Btn kind="ghost" label={stage === 'saving' ? 'Saving that' : stage === 'scoring' ? 'Working out your score again' : declared ? 'Undo this' : "We don't have it"} busy={busy} onPress={() => void change(!declared)} style={{ marginTop: 14 }} testID="declare-missing" />
      {problem ? (
        <T variant="small" color={c.urgent} style={{ marginTop: 10 }} accessibilityRole="alert">
          {problem}
        </T>
      ) : null}
    </Card>
  );
}

/** The kit's `.opt` radio card for one document that clears the finding. */
function ProofOption({ label, sub, tone, on, onPress }: { label: string; sub: string; tone: 'urgent' | 'warn' | 'good' | 'muted'; on: boolean; onPress: () => void }) {
  const { c } = useTheme();
  const colour = tone === 'urgent' ? c.urgent : tone === 'warn' ? c.warn : tone === 'good' ? c.good : c.ink3;
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: on }}
      accessibilityLabel={`${label}, ${sub}`}
      onPress={() => {
        tap();
        onPress();
      }}
      style={{
        flexDirection: 'row',
        gap: 14,
        paddingVertical: 16,
        paddingHorizontal: 18,
        borderRadius: 20,
        marginTop: 10,
        borderWidth: 1,
        borderColor: on ? c.navy : c.cardBorder,
        backgroundColor: c.dark ? c.card : '#fff',
        ...(on && !c.dark ? { shadowColor: '#000066', shadowOpacity: 0.08, shadowRadius: 3, shadowOffset: { width: 0, height: 0 } } : {}),
      }}
    >
      <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 1.6, borderColor: on ? c.navy : c.dark ? 'rgba(150,170,255,0.25)' : '#C9CFDD', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
        {on ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c.navy }} /> : null}
      </View>
      <View style={{ flex: 1 }}>
        <T weight={700} size={14.5}>
          {label}
        </T>
        <T weight={600} size={13} color={colour} style={{ marginTop: 2 }}>
          {sub}
        </T>
      </View>
    </Pressable>
  );
}

function Impact({ issue }: { issue: IssueDetail }) {
  const status = findingStatus(issue);
  const projection = issue.projection;
  const to = useCountUp(projection?.to ?? 0, { from: projection?.from ?? 0, delay: 500 });
  if (status === 'cleared') {
    return (
      <T weight={600} size={14} color={brand.onNavyMuted} style={{ marginTop: 18 }}>
        Counted in the score. Vero checks it again on every scan.
      </T>
    );
  }
  if (!projection) {
    return (
      <T weight={600} size={13} color={brand.onNavyMuted} style={{ marginTop: 18 }}>
        What clearing this does to the score is part of a paid plan.
      </T>
    );
  }
  const gain = projection.to - projection.from;
  const critical = issue.severity === 'critical' && (status === 'urgent' || status === 'attention');
  const words: [string, string] =
    gain > 0
      ? critical
        ? ['Lifts the urgent cap', `and adds ${plural(gain, 'point', 'points')}`]
        : [`Adds ${plural(gain, 'point', 'points')}`, `takes ${issue.companyName} to about ${projection.to}`]
      : issue.pointsHeldByUrgent
        ? ['Held by the urgent cap', 'until the other urgent gaps clear']
        : ['No change on its own', "This won't noticeably move the score"];
  return (
    <View accessible accessibilityLabel={`Score ${projection.from} now, ${projection.to} once cleared. ${words.join(' ')}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 22 }}>
      <Pixel size={52} color="rgba(255,255,255,0.42)">
        {projection.from}
      </Pixel>
      <Icon name="chev" size={18} color="rgba(255,255,255,0.5)" />
      <Pixel size={52} color="#5EEAD4" testID="fix-projection">
        {to}
      </Pixel>
      <T weight={600} size={12.5} color={brand.onNavyMuted} style={{ marginLeft: 8, flexShrink: 1, lineHeight: 17 }}>
        {`${words[0]}\n${words[1]}`}
      </T>
    </View>
  );
}

/** A finding, as on the Finding board: what we found, how we know, what clears it, and the upload. */
export default function FindingScreen() {
  const { c } = useTheme();
  const queries = useQueryClient();
  const params = useLocalSearchParams<{ companyId: string; ruleKey: string }>();
  const companyId = String(params.companyId ?? '');
  const ruleKey = decodeURIComponent(String(params.ruleKey ?? ''));
  const session = useSession();
  const ws = useWorkspace();
  // Waits for the saved session: a call sent before it loads would come back 401 and sign the person out.
  const query = useQuery({ queryKey: keys.issue(companyId, ruleKey), enabled: session.status === 'signedIn' && !!companyId && !!ruleKey, queryFn: () => api.results.issue({ params: { companyId, ruleKey } }) });
  const issue = query.data;
  const company = ws.data?.companies.find((item) => item.id === companyId);
  const following = company?.relationship === 'follow';
  const [choice, setChoice] = useState<string | null>(null);
  // Kept while the sheet is open, so it can show the result after the finding clears.
  const [uploading, setUploading] = useState<{ slotKey: string; label: string } | null>(null);
  const [pulling, setPulling] = useState(false);
  const rescan = useScanAgain(companyId, () => void queries.invalidateQueries({ queryKey: workspaceKey }));

  const proofKey = issue?.proof.map((proof) => proof.slotKey).join(',') ?? '';
  // Picks again only when the documents on offer change (previous-value pattern, during render).
  const [pickedFor, setPickedFor] = useState<string | null>(null);
  if (pickedFor !== proofKey) {
    setPickedFor(proofKey);
    const first = issue?.proof.find((proof) => !isInPlace(proof.state)) ?? issue?.proof[0];
    setChoice(first?.slotKey ?? null);
  }
  const fix = useMemo(() => withoutReferrals(issue?.fix), [issue?.fix]);

  const refresh = async () => {
    setPulling(true);
    try {
      await queries.invalidateQueries({ queryKey: workspaceKey });
    } finally {
      setPulling(false);
    }
  };

  const back = <IconBtn icon="back" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />;
  const head = <View style={{ flexDirection: 'row', alignItems: 'center', height: 54, paddingHorizontal: 16 }}>{back}</View>;

  if (session.status === 'signedOut') return <Redirect href="/welcome" />;
  if (query.isPending) {
    return (
      <Screen
        top={
          <>
            {head}
            <Pad style={{ gap: 14, marginTop: 10 }}>
              <Skeleton onNavy w={150} h={11} />
              <Skeleton onNavy w="90%" h={30} />
              <Skeleton onNavy w="60%" h={30} />
              <Skeleton onNavy w={200} h={52} r={12} />
            </Pad>
          </>
        }
      >
        <Skeleton w={130} h={16} />
        <View style={{ height: 14 }} />
        <SkeletonList rows={2} />
      </Screen>
    );
  }
  if (!issue) {
    return (
      <Screen top={head}>
        <ErrorCard error={query.error} onRetry={() => void query.refetch()} />
      </Screen>
    );
  }

  const status = findingStatus(issue);
  const isOpen = status === 'urgent' || status === 'attention';
  const isPass = status === 'cleared';
  const isVerify = status === 'unseen';
  const source = findingSource(issue);
  const chosen = issue.proof.find((proof) => proof.slotKey === choice) ?? issue.proof[0];
  const canUpload = issue.canAddEvidence && !following && issue.proof.length > 0 && !isPass;
  const canRescan = !isPass && issue.proof.length === 0 && !following && company !== undefined;
  const sample = ws.data?.overview?.sampleData === true || issue.howWeKnow.some((line) => /sample data/i.test(line));
  const kickWord = isOpen ? issue.severityWord : FINDING_WORDS[status];

  return (
    <View style={{ flex: 1 }}>
      <Screen
        onRefresh={() => void refresh()}
        refreshing={pulling}
        top={
          <>
            {head}
            <Pad>
              <Rise>
                <T variant="kick" onNavy style={{ marginTop: 10 }} testID="issue-chip">
                  <T variant="kick" color={KICK_COLOUR[status]}>
                    {kickWord}
                  </T>
                  {` · ${issue.layerName}`}
                  {company && ws.data && ws.data.related.length > 0 ? ` · ${countryShort(issue.country)}` : ''}
                </T>
              </Rise>
              <Rise d={1}>
                <T variant="h1" onNavy accessibilityRole="header" style={{ fontSize: 29, lineHeight: 32, letterSpacing: -1.2, marginTop: 10 }}>
                  {isPass ? (issue.title ?? issue.headline) : issue.headline}
                </T>
              </Rise>
              <Rise d={2}>
                <Impact issue={issue} />
              </Rise>
            </Pad>
          </>
        }
      >
        {sample ? <SampleNote style={{ marginBottom: 18 }} /> : null}
        <Rise d={3} style={{ marginHorizontal: 4 }}>
          <T variant="h2" accessibilityRole="header">
            {isPass ? 'What Vero checked' : 'What we found'}
          </T>
          {isVerify ? (
            <T size={15} color={c.ink2} style={{ marginTop: 10, lineHeight: 24 }}>
              <T size={15} weight={700} color={c.ink}>
                Vero hasn&apos;t seen this yet.{' '}
              </T>
              {issue.reasonWords ? issue.reasonWords.replace(/^We haven't seen this yet\.\s*/, '') : "It doesn't count for or against the score until it can be checked."}
            </T>
          ) : null}
          <T size={15} color={c.ink2} style={{ marginTop: 10, lineHeight: 24 }}>
            {isPass ? `${issue.title ?? issue.layerName}: in order for ${issue.companyName}.` : issue.missing}
          </T>
          {!isPass && issue.ifLeft ? (
            <T size={15} color={c.ink2} style={{ marginTop: 10, lineHeight: 24 }}>
              <T size={15} weight={700} color={c.ink}>
                If it&apos;s left:{' '}
              </T>
              {issue.ifLeft}
            </T>
          ) : null}
        </Rise>

        {!isPass && issue.why ? (
          <>
            <Section title="Why it matters" />
            <T size={15} color={c.ink2} style={{ lineHeight: 24, marginHorizontal: 4 }}>
              {issue.why}
            </T>
          </>
        ) : null}

        <Section title="How we know" />
        <List>
          {issue.howWeKnow.length > 0 ? (
            issue.howWeKnow.map((line) => <Row key={line} title={line.replace(/\s*\(sample data, not a real record\)/i, '')} sub={/sample data/i.test(line) ? 'Sample data, not a real record' : source.label} />)
          ) : (
            <Row title="Nothing seen yet" sub="Vero checks again on every scan." />
          )}
          <Row title={issue.companyName} sub={issue.appliesBecause === 'incorporated' ? `Applies because it is registered in ${issue.countryLabel}` : `Applies because it operates in ${issue.countryLabel}`} />
          {issue.dueOn ? <Row title={`Due ${shortDate(issue.dueOn)}`} sub="The date this has to be done by" /> : null}
        </List>

        {!isPass && fix ? (
          <>
            <Section title="What to do" />
            <Card>
              <T size={15} color={c.ink2} style={{ lineHeight: 23 }}>
                {fix}
              </T>
              {issue.regulator ? (
                <T variant="small" style={{ marginTop: 8 }}>
                  With {issue.regulator}
                </T>
              ) : null}
            </Card>
          </>
        ) : null}

        {!isPass ? (
          <>
            <Section title="What clears it" />
            <T variant="sub" style={{ marginHorizontal: 4 }}>
              {issue.proof.length > 1 ? 'Any of these works. Upload it and Vero checks again.' : issue.proof.length === 1 ? 'Upload it and Vero checks again.' : 'Nothing to upload for this one.'}
            </T>
            <View accessibilityRole="radiogroup">
              {issue.proof.map((proof) => (
                <ProofOption key={proof.slotKey} label={proof.label} sub={PROOF_WORDS[proof.state]} tone={slotTone(proof.state)} on={chosen?.slotKey === proof.slotKey} onPress={() => setChoice(proof.slotKey)} />
              ))}
            </View>
            {issue.evidence.length > 0 && issue.proof.length > 0 ? (
              <Card style={{ marginTop: 14 }}>
                <T weight={700} size={14}>
                  What Vero checks in the document
                </T>
                {issue.evidence.map((line) => (
                  <View key={line} style={{ flexDirection: 'row', gap: 10, marginTop: 10, alignItems: 'flex-start' }}>
                    <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: chosen && isInPlace(chosen.state) ? c.good : c.soft, alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                      <Icon name="check" size={13} color={chosen && isInPlace(chosen.state) ? '#fff' : c.ink3} stroke={2.4} />
                    </View>
                    <T size={14} color={c.ink2} style={{ flex: 1, lineHeight: 21 }}>
                      {line}
                    </T>
                  </View>
                ))}
              </Card>
            ) : null}
            {following ? (
              <T variant="small" style={{ marginTop: 14, marginHorizontal: 4 }}>
                You follow {issue.companyName}, so you can read its findings. Only its own team can add proof.
              </T>
            ) : issue.proof.length > 0 && !issue.canAddEvidence ? (
              <T variant="small" style={{ marginTop: 14, marginHorizontal: 4 }} testID="upload-locked">
                Only the team that owns this company, on a plan with documents, can add the proof.
              </T>
            ) : issue.proof.length === 0 ? (
              <T variant="small" style={{ marginTop: 14, marginHorizontal: 4 }}>
                {source.kind === 'reg' ? `Vero reads ${source.label} on every scan, so this clears on its own once the register shows it.` : 'Vero checks this again on every scan, so it clears on its own once the change is made.'}
              </T>
            ) : null}
            {!following && (issue.canDeclareMissing || issue.declaredMissing) ? <DeclareMissing key={`${issue.ruleKey}-${String(issue.declaredMissing)}`} issue={issue} /> : null}
          </>
        ) : null}

        {issue.law.length > 0 ? (
          <>
            <Section title="Sources" />
            <List>
              {issue.law.map((item) => (
                <Row key={`${item.law}-${item.cite ?? ''}`} title={item.law} sub={item.cite ? `Section ${item.cite.replace(/^s(?=\d)/, '')}` : 'The law behind this check'} />
              ))}
            </List>
          </>
        ) : null}
        <T variant="small" center style={{ marginTop: 20, paddingHorizontal: 12 }}>
          {issue.notLegalAdvice}
        </T>
        {canUpload || canRescan ? <View style={{ height: 110 }} /> : null}
      </Screen>

      {canUpload && chosen ? (
        <Dock note="Vero re-checks it in about a minute">
          <Btn label={chosen.label.length <= 20 ? `Upload the ${midSentence(chosen.label)}` : 'Upload the document'} icon="upload" onPress={() => setUploading({ slotKey: chosen.slotKey, label: chosen.label })} testID="upload-proof" />
        </Dock>
      ) : canRescan ? (
        <Dock note={rescan.problem ?? (rescan.finished ? 'Scan finished. This finding is up to date.' : `Vero asks ${source.kind === 'reg' ? source.label : 'every source'} again.`)}>
          <Btn label={rescan.running ? (rescan.total > 0 ? `Checking ${rescan.checked} of ${rescan.total}` : 'Starting the scan') : 'Scan again'} busy={rescan.running} icon="search" onPress={rescan.start} testID="scan-again" />
        </Dock>
      ) : null}

      {uploading ? <UploadSheet open onClose={() => setUploading(null)} companyId={companyId} companyName={issue.companyName} wanted={uploading} /> : null}
    </View>
  );
}
