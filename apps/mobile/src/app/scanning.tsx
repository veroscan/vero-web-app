import type { Company, Scan, ScanSource } from '@vero/shared';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { Glass, ON_NAVY_TONE } from '@/components/onboarding/Glass';
import { Dock } from '@/components/onboarding/Shell';
import { api, asApiError, type ApiError } from '@/lib/api';
import { LEVEL_WORDS, coverageOf, countryShort, plural, registerFor, sentence } from '@/lib/registers';
import { agoWords, sourceStatus, sourceWorking } from '@/lib/scans';
import { useSession } from '@/lib/session';
import { useWorkspace, workspaceKey } from '@/lib/workspace';
import { Rise } from '@/ui/Motion';
import { NavyScreen } from '@/ui/Screen';
import { Btn, IconBtn } from '@/ui/Surfaces';
import { Kicker, Pixel, T } from '@/ui/Text';

const FINISHED = new Set<Scan['status']>(['partial', 'completed', 'failed']);
/** How long a check shows "Reading" before its result lands, and how long the result shows (as on the web). */
const READ_MS = 900;
const LAND_MS = 520;

interface Row extends ScanSource {
  key: string;
  companyName: string;
}

/** Uses the newest full scan for each company, and starts one only if there isn't one (apps/web onboarding/scanning). */
function useScans(companies: Company[]) {
  const [scans, setScans] = useState<Record<string, Scan>>({});
  const [error, setError] = useState<ApiError | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [polls, setPolls] = useState(0);
  const started = useRef<string | null>(null);
  const ids = companies.map((item) => item.id).join(',');

  useEffect(() => {
    const key = `${ids}:${attempt}`;
    if (companies.length === 0 || started.current === key) return;
    started.current = key;
    setError(null);
    void Promise.all(
      companies.map(async (company) => {
        if (attempt === 0) {
          const { scans: list } = await api.scans.list({ params: { companyId: company.id } });
          const latest = list.find((scan) => scan.kind === 'full');
          if (latest && latest.status !== 'failed') return latest;
        }
        return api.scans.create({ params: { companyId: company.id } });
      }),
    ).then(
      (loaded) => setScans(Object.fromEntries(loaded.map((scan) => [scan.id, scan]))),
      (failure: unknown) => setError(asApiError(failure)),
    );
    // Started once per set of companies and attempt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids, attempt]);

  const list = Object.values(scans);
  const moving = list.filter((scan) => !FINISHED.has(scan.status));
  const movingKey = moving.map((scan) => `${scan.id}:${scan.checksDone}:${scan.status}`).join(',');
  useEffect(() => {
    if (moving.length === 0) return;
    const wait = Math.max(500, ...moving.map((scan) => scan.pollAfterMs));
    const timer = setTimeout(() => {
      void Promise.all(moving.map((scan) => api.scans.get({ params: { scanId: scan.id } }))).then(
        (fresh) => {
          setScans((current) => ({ ...current, ...Object.fromEntries(fresh.map((scan) => [scan.id, scan])) }));
          // Ask again even when nothing moved: a source that never answers changes no count.
          setPolls((value) => value + 1);
        },
        (failure: unknown) => setError(asApiError(failure)),
      );
    }, wait);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movingKey, list.length, polls]);

  const retry = () => {
    setScans({});
    setAttempt((value) => value + 1);
  };
  return { scans: list, error, retry };
}

function Head({ onClose }: { onClose: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, height: 54, paddingHorizontal: 16 }}>
      <IconBtn icon="x" label="Close. The scan keeps running" onPress={onClose} />
      <View style={{ flex: 1 }} />
      <Pressable accessibilityRole="button" accessibilityLabel="Run in background" onPress={onClose} hitSlop={8} style={{ minHeight: 44, justifyContent: 'center' }}>
        <T weight={700} size={14} color="rgba(255,255,255,0.72)">
          Run in background
        </T>
      </Pressable>
    </View>
  );
}

/** The Scanning board: each source read live, one after another, then the honest result. */
export default function Scanning() {
  const workspace = useWorkspace();
  const queries = useQueryClient();
  const { me } = useSession();
  const still = useReducedMotion();
  const companies = useMemo(() => (workspace.data?.root ? [workspace.data.root, ...workspace.data.related] : []), [workspace.data]);
  const { scans, error, retry } = useScans(companies);
  const [revealed, setRevealed] = useState(0);
  const [landed, setLanded] = useState(false);
  const refreshed = useRef(false);

  useEffect(() => {
    if (workspace.isSuccess && !workspace.data.root) router.replace('/search');
  }, [workspace.isSuccess, workspace.data]);

  const names = useMemo(() => new Map(companies.map((company) => [company.id, company.legalName])), [companies]);
  const several = companies.length > 1;
  const rows = useMemo<Row[]>(
    () => scans.flatMap((scan) => scan.sources.map((source) => ({ ...source, key: `${scan.id}-${source.connectorId}`, companyName: names.get(scan.companyId) ?? '' }))),
    [scans, names],
  );
  // Answered rows first, so the list fills from the top as they come in.
  const ordered = useMemo(() => [...rows.filter((row) => row.state !== 'waiting'), ...rows.filter((row) => row.state === 'waiting')], [rows]);
  const answered = rows.filter((row) => row.state !== 'waiting').length;

  // Sources can answer faster than anyone can read, so each one is read, then lands, one at a time.
  useEffect(() => {
    if (revealed >= answered) return;
    const timer = setTimeout(
      () => {
        if (!landed) setLanded(true);
        else {
          setLanded(false);
          setRevealed((value) => Math.min(answered, value + 1));
        }
      },
      still ? 0 : landed ? LAND_MS : READ_MS,
    );
    return () => clearTimeout(timer);
  }, [revealed, answered, landed, still]);

  const allFinished = scans.length > 0 && scans.every((scan) => FINISHED.has(scan.status));
  const showDone = allFinished && revealed >= answered;

  // Once the scan ends, the Overview and score are read again.
  useEffect(() => {
    if (!allFinished || refreshed.current) return;
    refreshed.current = true;
    void queries.invalidateQueries({ queryKey: workspaceKey });
  }, [allFinished, queries]);

  const close = () => router.replace('/(tabs)');
  const root = workspace.data?.root ?? null;

  if (error) {
    return (
      <NavyScreen>
        <Head onClose={close} />
        <View style={{ paddingHorizontal: 22, paddingTop: 30, gap: 14 }} accessibilityRole="alert">
          <T variant="h1" onNavy accessibilityRole="header">
            We couldn&apos;t run the scan
          </T>
          <T variant="sub" onNavy>
            {error.message}
          </T>
          <Btn kind="white" label="Try again" onPress={retry} style={{ marginTop: 10 }} />
        </View>
      </NavyScreen>
    );
  }

  if (!root || scans.length === 0) {
    return (
      <NavyScreen>
        <Head onClose={close} />
        <View style={{ paddingTop: 120, alignItems: 'center', gap: 14 }} accessibilityRole="progressbar" accessibilityLabel="Starting the scan">
          <ActivityIndicator color="#fff" />
          <T variant="sub" onNavy>
            Starting the scan
          </T>
        </View>
      </NavyScreen>
    );
  }

  const anyFailed = scans.some((scan) => scan.status === 'failed');
  if (showDone && anyFailed) {
    return (
      <NavyScreen>
        <Head onClose={close} />
        <View style={{ paddingHorizontal: 22, paddingTop: 20, gap: 12 }} testID="scan-failed">
          <Kicker onNavy bold="Stopped">
            Live scan ·
          </Kicker>
          <T variant="h1" onNavy accessibilityRole="header">
            The scan stopped before it finished
          </T>
          <T variant="sub" onNavy>
            Nothing has been scored from it. You can run it again now.
          </T>
          <Btn kind="white" label="Run it again" onPress={retry} style={{ marginTop: 14 }} />
        </View>
      </NavyScreen>
    );
  }

  const partial = showDone && scans.some((scan) => scan.status === 'partial');
  const focus = showDone ? null : (ordered[revealed] ?? null);
  const focusLanded = landed && focus !== null && focus.state !== 'waiting';
  const down = rows.filter((row) => row.down);
  const done = scans.reduce((sum, scan) => sum + scan.checksDone, 0);
  const total = scans.reduce((sum, scan) => sum + scan.checksTotal, 0);
  const left = Math.max(0, rows.length - revealed);
  const count = showDone ? (partial ? done : rows.length) : revealed;
  const sample = rows.some((row) => row.sampleData);
  const role = me?.organisations.find((org) => org.id === me.activeOrganisationId)?.role;
  const emailed = role === 'owner' || role === 'admin';
  const coverage = coverageOf(root.incorporationCountry);
  const register = registerFor(root.incorporationCountry);
  const meta = [countryShort(root.incorporationCountry), root.registrationNumber ? `${register.numberLabel} ${root.registrationNumber}` : null, LEVEL_WORDS[coverage.level], several ? plural(companies.length, 'company', 'companies') : null]
    .filter(Boolean)
    .join(' · ');

  const eta = showDone
    ? partial
      ? `${done} of ${plural(total, 'check', 'checks')} answered. ${down.length === 1 ? "One source isn't" : `${down.length} sources aren't`} answering, so ${down.length === 1 ? 'it' : 'they'} won't count for or against the score. Vero keeps trying.`
      : 'Every source answered. Documents you haven’t shared yet never lower the score.'
    : left === 0
      ? 'Every check is in. Putting the result together.'
      : `${plural(left, 'check', 'checks')} left. You can leave this screen. ${emailed ? "Vero emails you when it's done." : 'The result shows on your Overview.'}`;

  return (
    <NavyScreen scroll={false}>
      <View style={{ flex: 1 }}>
      <View style={StyleSheet.absoluteFill} testID={partial ? 'scan-partial' : 'scanning'}>
        <Head onClose={close} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 190 }}>
          <Rise>
            <Kicker onNavy bold={showDone ? (partial ? (done === 0 ? 'Sources not answering' : 'Mostly done') : 'Finished') : 'Live scan'}>
              Step 3 of 4 ·
            </Kicker>
          </Rise>
          <Rise d={1}>
            <T variant="h1" onNavy accessibilityRole="header" style={{ marginTop: 10 }}>
              {root.legalName}
            </T>
          </Rise>
          <Rise d={2}>
            <T variant="sub" onNavy style={{ marginTop: 6 }}>
              {meta}
            </T>
          </Rise>
          {sample ? (
            <Rise d={2} style={{ alignSelf: 'flex-start', marginTop: 10, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: 'rgba(255,182,72,0.18)' }}>
              <T weight={700} size={12} color="#FFD08A">
                Sample data · example sources, not live registers
              </T>
            </Rise>
          ) : null}
          <Rise d={3} style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 14, marginTop: 22 }}>
            <Pixel size={86} color="#fff" accessibilityLabel={`${count} of ${rows.length} checks read`} testID="scan-count">
              {count}
            </Pixel>
            <T weight={700} size={14} color="rgba(255,255,255,0.62)" style={{ paddingBottom: 6, lineHeight: 18 }}>
              {`of ${rows.length}\n${partial ? 'answered' : 'checks'}`}
            </T>
          </Rise>
          <Rise d={3} style={{ flexDirection: 'row', gap: 4, marginTop: 18 }}>
            {ordered.map((row, at) => (
              <View key={row.key} style={{ flex: 1, height: 6, borderRadius: 2, backgroundColor: at < count ? '#FFFFFF' : at === revealed && !showDone ? '#9DDAF7' : 'rgba(255,255,255,0.16)' }} />
            ))}
          </Rise>
          <Rise d={4}>
            <Glass scanline={!showDone} style={{ marginTop: 18, paddingVertical: 2, paddingHorizontal: 18 }}>
              {ordered.map((row, at) => {
                const now = focus !== null && row.key === focus.key;
                const shown = at < revealed || showDone || (now && focusLanded);
                const status = sourceStatus(row);
                const word = shown ? (row.state === 'error' ? 'Not answering' : status.word) : now ? 'Reading…' : 'Waiting';
                const tone = shown ? ON_NAVY_TONE[status.tone] : '#FFFFFF';
                const source = sentence(row.sourceName.replace(/^the /, ''));
                const ownName = source !== sentence(row.title.replace(/^the /, '')) ? source : null;
                const detail = now && !shown ? sourceWorking(row) : row.state === 'error' && shown ? `Not responding. Vero last tried ${agoWords(row.lastTriedAt)}` : shown && status.tone !== 'none' ? row.summary : ownName;
                const small = [several ? row.companyName : null, detail].filter(Boolean).join(' · ');
                return (
                  <View
                    key={row.key}
                    testID="scan-row"
                    accessible
                    accessibilityLabel={`${row.title}: ${shown ? row.summary : word}`}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: at === 0 ? 0 : 1, borderTopColor: 'rgba(255,255,255,0.1)', opacity: shown || now ? 1 : 0.32 }}
                  >
                    <View style={{ flex: 1 }}>
                      <T weight={700} size={14} onNavy>
                        {sentence(row.title)}
                      </T>
                      {small ? (
                        <T weight={600} size={12} color="rgba(255,255,255,0.55)" numberOfLines={2}>
                          {small}
                        </T>
                      ) : null}
                    </View>
                    <T weight={700} size={12.5} color={tone}>
                      {word}
                    </T>
                  </View>
                );
              })}
            </Glass>
          </Rise>
          {showDone && rows.length > 0 ? (
            <T weight={600} size={13} color="rgba(255,255,255,0.66)" style={{ marginTop: 14, lineHeight: 20 }}>
              {rows.filter((row) => sourceStatus(row).tone === 'good').length} in order ·{' '}
              {rows.filter((row) => sourceStatus(row).tone === 'watch' && !row.down).length} to look at
              {down.length > 0 ? ` · ${plural(down.length, 'source', 'sources')} not answering` : ''}
            </T>
          ) : null}
        </ScrollView>
        <Dock navy style={{ paddingBottom: 6 }}>
          <Btn kind="white" testID="scan-result" label="See the result" icon="arrow" disabled={!showDone} onPress={close} />
          <T weight={600} size={13} color="rgba(255,255,255,0.6)" center style={{ marginTop: 12, lineHeight: 19 }} accessibilityLiveRegion="polite">
            {eta}
          </T>
        </Dock>
      </View>
      </View>
    </NavyScreen>
  );
}
