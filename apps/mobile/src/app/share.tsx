import type { ShareLink } from '@vero/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { Label, NavyCard, Page, SampleTag } from '@/components/account/Page';
import { Empty, Problem, Skeleton, SmallBtn, useToast } from '@/components/account/States';
import { api, asApiError } from '@/lib/api';
import { entitlementsOf, roleCan } from '@/lib/entitlements';
import { longDate, plural, shortDate, shortName } from '@/lib/format';
import { coverageLevelWords } from '@/lib/score';
import { useSession } from '@/lib/session';
import { copyText, shareText, shareUrl } from '@/lib/share-links';
import { useWorkspace } from '@/lib/workspace';
import { useTheme } from '@/theme/ThemeProvider';
import { Seg, Sheet } from '@/ui/Controls';
import { Icon } from '@/ui/Icon';
import { Rise, useCountUp } from '@/ui/Motion';
import { Btn, List, Row, tap } from '@/ui/Surfaces';
import { Kicker, Pixel, T } from '@/ui/Text';

/** The lengths the web offers; the API takes 1 to 90 days. */
const LINK_DAYS = ['7', '30', '90'] as const;
type Days = (typeof LINK_DAYS)[number];

/** What a viewer of the public page gets. Fixed by the API: a summary and counts, never documents. */
const SECTIONS = [
  { title: 'Score and coverage', note: 'The score, and how many checks it rests on', shared: true },
  { title: 'Open issues, as counts', note: 'How many are urgent, important or worth doing', shared: true },
  { title: 'Areas', note: 'A score for each area that has one', shared: true },
  { title: 'What was checked', note: 'Which countries and registers, and how we know', shared: true },
  { title: 'Issue details and your documents', note: 'Viewers never see what an issue says, or open a file', shared: false },
];

function sharesKey(companyId: string) {
  return ['shares', companyId] as const;
}

/** The link box in the sheet (`.lnk`): the address and a Copy button that turns green when it worked. */
function LinkBox({ url }: { url: string }) {
  const { c } = useTheme();
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [copied]);
  const copy = async () => {
    tap();
    if (await copyText(url)) setCopied(true);
    // On a phone without a clipboard module, the system share sheet has Copy.
    else void shareText(url, url);
  };
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 18, paddingVertical: 8, paddingLeft: 16, paddingRight: 8, borderRadius: 16, borderWidth: 1, borderColor: c.cardBorder, backgroundColor: c.fieldBg }}>
      <T weight={700} size={14} numberOfLines={1} ellipsizeMode="middle" selectable style={{ flex: 1 }} testID="share-url">
        {url.replace(/^https?:\/\//, '')}
      </T>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copied ? 'Copied' : 'Copy link'}
        testID="share-copy"
        onPress={() => void copy()}
        style={({ pressed }) => ({ height: 40, paddingHorizontal: 16, borderRadius: 12, justifyContent: 'center', backgroundColor: copied ? c.good : c.dark ? 'rgba(61,123,255,0.16)' : '#EEF1FB', transform: [{ scale: pressed ? 0.94 : 1 }] })}
      >
        <T weight={700} size={14} color={copied ? '#fff' : c.dark ? '#fff' : c.navy}>
          {copied ? 'Copied' : 'Copy'}
        </T>
      </Pressable>
    </View>
  );
}

export default function ShareReport() {
  const { c } = useTheme();
  const { me } = useSession();
  const workspace = useWorkspace();
  const queries = useQueryClient();
  const { toast, node } = useToast(110);
  const [days, setDays] = useState<Days>('30');
  const [made, setMade] = useState<{ url: string; expiresAt: string } | null>(null);
  const [withdrawing, setWithdrawing] = useState<ShareLink | null>(null);
  const root = workspace.data?.root ?? null;
  const companyId = root?.id ?? '';
  const canManage = roleCan(me, 'sharing.manage');

  // The public page is one company's own summary, so the preview reads that company alone.
  const preview = useQuery({ queryKey: ['overview', companyId, 'company'], enabled: !!companyId, queryFn: () => api.results.overview({ params: { companyId }, query: { scope: 'company' } }) });
  const plan = preview.data?.plan ?? workspace.data?.overview?.plan;
  const sharing = entitlementsOf(plan).publicSharing;
  const links = useQuery({ queryKey: sharesKey(companyId), enabled: !!companyId && sharing && canManage, queryFn: () => api.shares.list({ params: { companyId } }) });

  const create = useMutation({
    mutationFn: () => api.shares.create({ params: { companyId }, body: { expiresInDays: Number(days) } }),
    onSuccess: (link) => {
      setMade({ url: shareUrl(link.token), expiresAt: link.expiresAt });
      void queries.invalidateQueries({ queryKey: sharesKey(companyId) });
    },
  });
  const revoke = useMutation({
    mutationFn: (link: ShareLink) => api.shares.revoke({ params: { shareId: link.id } }),
    onSuccess: () => {
      setWithdrawing(null);
      void queries.invalidateQueries({ queryKey: sharesKey(companyId) });
      toast('Link withdrawn. It no longer opens.');
    },
  });

  const overview = preview.data;
  const score = overview?.score;
  const value = score?.kind === 'exact' ? score.value : 0;
  const shown = useCountUp(value, { delay: 450 });
  // Read the clock once when the screen opens; the dates below are whole days.
  const [now] = useState(() => Date.now());
  const live = (links.data?.links ?? []).filter((link) => link.active);
  const ended = (links.data?.links ?? []).filter((link) => !link.active).slice(0, 3);
  const until = shortDate(new Date(now + Number(days) * 86_400_000).toISOString());
  const name = root ? shortName(root.legalName) : 'your company';
  const loading = workspace.isPending || (!!companyId && preview.isPending);

  const dock = sharing && canManage && root ? (
    <>
      {create.isError ? (
        <T weight={600} size={13.5} color={c.urgent} center style={{ marginBottom: 10 }} accessibilityRole="alert">
          {asApiError(create.error).message}
        </T>
      ) : null}
      <Btn label={create.isPending ? 'Making the link' : 'Create link'} icon="share" busy={create.isPending} onPress={() => create.mutate()} testID="share-create" />
    </>
  ) : undefined;

  return (
    <Page
      back
      dock={dock}
      refreshing={links.isRefetching}
      onRefresh={() => {
        void preview.refetch();
        void links.refetch();
      }}
      testID="share"
      overlay={
        <>
          {node}
          <Sheet open={!!made} onClose={() => setMade(null)} label="Link ready">
            {made ? (
              <>
                <View style={{ alignItems: 'center' }}>
                  <Animated.View entering={ZoomIn.springify().damping(12).delay(200)} style={{ width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: c.dark ? 'rgba(59,224,166,0.12)' : '#E7F7F1', marginBottom: 12 }}>
                    <Icon name="check" size={26} color={c.good} stroke={2.4} />
                  </Animated.View>
                  <T variant="h3" accessibilityRole="header">
                    Link ready
                  </T>
                  <T variant="sub" center style={{ marginTop: 4 }}>{`Anyone with it can view until ${longDate(made.expiresAt)}.`}</T>
                </View>
                <LinkBox url={made.url} />
                <T variant="small" center style={{ marginTop: 10 }}>
                  Copy it now. We only show a link once, because we keep just a scrambled copy of it.
                </T>
                <Btn label="Share link" icon="share" onPress={() => void shareText(`${root?.legalName ?? 'Our'} report on Vero: ${made.url}`, made.url)} style={{ marginTop: 16 }} testID="share-system" />
                <Btn kind="ghost" label="Done" onPress={() => setMade(null)} style={{ marginTop: 10 }} />
              </>
            ) : null}
          </Sheet>
          <Sheet open={!!withdrawing} onClose={() => setWithdrawing(null)} label="Withdraw link">
            <T variant="h3" accessibilityRole="header">
              Withdraw this link?
            </T>
            <T variant="sub" style={{ marginTop: 6 }}>
              It stops opening straight away, for everyone you sent it to.
            </T>
            {revoke.isError ? (
              <T weight={600} size={13.5} color={c.urgent} style={{ marginTop: 12 }} accessibilityRole="alert">
                {asApiError(revoke.error).message}
              </T>
            ) : null}
            <Btn label="Withdraw link" busy={revoke.isPending} onPress={() => withdrawing && revoke.mutate(withdrawing)} style={{ marginTop: 20 }} testID="share-revoke-confirm" />
            <Btn kind="ghost" label="Keep it open" onPress={() => setWithdrawing(null)} style={{ marginTop: 10 }} />
          </Sheet>
        </>
      }
    >
      <Rise>
        <Kicker bold="Report → Link → Reader">Share ·</Kicker>
      </Rise>
      <Rise d={1}>
        <T variant="h1" accessibilityRole="header" style={{ marginTop: 10 }}>{`Share ${name}'s report`}</T>
      </Rise>
      <Rise d={2}>
        <T variant="sub" style={{ marginTop: 6 }}>
          Read only. Your documents are never shared.
        </T>
      </Rise>

      {loading ? (
        <Skeleton blocks={[92, 260, 54]} />
      ) : workspace.isError ? (
        <Problem error={workspace.error} onRetry={() => void workspace.refetch()} />
      ) : !root ? (
        <Empty title="Add your company first" body="Once Vero has scanned your company, you can share its report here as a read-only link." />
      ) : (
        <>
          <Rise d={3}>
            <NavyCard radius={22} style={{ marginTop: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18, paddingHorizontal: 20, gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <T weight={700} size={16} onNavy numberOfLines={1}>
                    {root.legalName}
                  </T>
                  <T variant="small" onNavy style={{ marginTop: 2 }}>
                    {coverageLevelWords(overview?.countryCoverage ?? root.countryCoverage, root.incorporationCountry) ?? ''}
                  </T>
                  {overview?.sampleData ? <SampleTag onNavy style={{ marginTop: 10 }} /> : null}
                </View>
                {score && score.kind !== 'none' ? (
                  <Pixel size={52} color="#fff">
                    {score.kind === 'exact' ? shown : `${score.low}-${score.high}`}
                  </Pixel>
                ) : (
                  <T weight={700} size={14} onNavy>
                    Not scored yet
                  </T>
                )}
              </View>
            </NavyCard>
          </Rise>

          <Label>What viewers see</Label>
          <Rise d={4}>
            <List>
              {SECTIONS.map((section) => (
                <Row
                  key={section.title}
                  title={section.title}
                  sub={
                    <T variant="small" numberOfLines={2} style={{ marginTop: 2 }}>
                      {section.note}
                    </T>
                  }
                  right={
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <Icon name={section.shared ? 'eye' : 'lock'} size={15} color={section.shared ? c.good : c.ink3} />
                      <T weight={700} size={12.5} color={section.shared ? c.good : c.ink3}>
                        {section.shared ? 'Shown' : 'Never'}
                      </T>
                    </View>
                  }
                />
              ))}
            </List>
          </Rise>

          {!sharing ? (
            <Rise d={5}>
              <View style={{ marginTop: 22, padding: 18, borderRadius: 20, backgroundColor: c.soft }}>
                <T weight={700} size={15}>
                  Public links are part of a paid plan
                </T>
                <T variant="small" style={{ marginTop: 4, lineHeight: 18 }}>
                  A paid plan lets you send a read-only link to anyone. Your plan is shown in Settings.
                </T>
                <View style={{ flexDirection: 'row', marginTop: 12 }}>
                  <SmallBtn label="Open Settings" onPress={() => router.push('/settings')} />
                </View>
              </View>
            </Rise>
          ) : !canManage ? (
            <T variant="sub" style={{ marginTop: 22 }} testID="share-no-permission">
              Only an owner or admin can make a public link.
            </T>
          ) : (
            <>
              <Label>Who can view</Label>
              <List>
                <Row title="Anyone with the link" sub="It can't be limited to named people yet" right={<Icon name="globe" size={18} color={c.ink3} />} />
              </List>
              <Label>Link expires after</Label>
              <Seg<Days> options={LINK_DAYS.map((value) => ({ value, label: `${value} days` }))} value={days} onChange={setDays} />
              <T variant="small" style={{ marginTop: 8, marginHorizontal: 4 }}>{`Open until ${until}`}</T>

              <Label>Open links</Label>
              {links.isError ? (
                <Problem error={links.error} onRetry={() => void links.refetch()} style={{ marginTop: 0 }} />
              ) : live.length === 0 && ended.length === 0 ? (
                <T variant="small" style={{ marginHorizontal: 4 }}>
                  {links.isPending ? 'Getting your links' : 'No links are open.'}
                </T>
              ) : (
                <List>
                  {[...live, ...ended].map((link) => (
                    <Row
                      key={link.id}
                      testID={link.active ? 'share-row' : 'share-ended'}
                      title={link.active ? 'Public page' : 'Ended link'}
                      sub={link.active ? `Made ${shortDate(link.createdAt)} · open until ${shortDate(link.expiresAt)} (${plural(Math.max(0, Math.ceil((new Date(link.expiresAt).getTime() - now) / 86_400_000)), 'day', 'days')})` : `${link.revokedAt ? 'Withdrawn' : 'Ended'} ${shortDate(link.revokedAt ?? link.expiresAt)}`}
                      right={link.active ? <SmallBtn testID="share-revoke" tone="danger" label="Withdraw" onPress={() => setWithdrawing(link)} /> : undefined}
                    />
                  ))}
                </List>
              )}
            </>
          )}
        </>
      )}
    </Page>
  );
}
