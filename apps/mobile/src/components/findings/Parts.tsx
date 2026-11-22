import type { Company, IssueSummary } from '@vero/shared';
import { router } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { Pressable, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { asApiError } from '@/lib/api';
import { countryShort, shortName } from '@/lib/format';
import { FINDING_TONE, FINDING_WORDS, findingHref, findingSource, findingStatus, isOpenIssue } from '@/lib/issues';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon } from '@/ui/Icon';
import { Card, List, Row, Status, tap } from '@/ui/Surfaces';
import { Pixel, T } from '@/ui/Text';

/** A finding as a kit `.row`: what it is, where it came from, its status word and the points. */
export function FindingRow({ issue, group, sub }: { issue: IssueSummary; group?: boolean; sub?: string }) {
  const status = findingStatus(issue);
  const title = status === 'cleared' ? (issue.title ?? issue.headline) : issue.headline;
  const line = sub ?? [group ? shortName(issue.companyName) : null, issue.declaredMissing ? "You told us you don't have this" : issue.layerName].filter(Boolean).join(' · ');
  const points = isOpenIssue(issue) && issue.points !== null && issue.points > 0 ? issue.points : null;
  return (
    <Row
      title={title}
      sub={line}
      accessibilityLabel={`${title}, ${FINDING_WORDS[status]}${points ? `, ${points} points` : ''}`}
      onPress={() => router.push(findingHref(issue))}
      right={
        <>
          <Status word={FINDING_WORDS[status]} tone={FINDING_TONE[status]} />
          {points ? <Gain points={points} /> : null}
        </>
      }
    />
  );
}

/** The kit's `.gain`: "+12" in the pixel font, green. */
export function Gain({ points }: { points: number }) {
  const { c } = useTheme();
  return (
    <Pixel size={22} color={c.good} style={{ marginTop: 3 }}>
      +{points}
    </Pixel>
  );
}

/** The source of a finding, for the line under it. */
export function sourceLine(issue: IssueSummary, group?: boolean): string {
  return [group ? shortName(issue.companyName) : null, findingSource(issue).label].filter(Boolean).join(' · ');
}

/** The API marks results built on fixture data. The screen has to say so. */
export function SampleNote({ style }: { style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  return (
    <View accessibilityRole="text" style={[{ flexDirection: 'row', gap: 10, alignItems: 'flex-start', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 16, backgroundColor: c.soft, borderWidth: 1, borderColor: c.line }, style]}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.warn, marginTop: 6 }} />
      <T variant="small" style={{ flex: 1, lineHeight: 18 }}>
        <T variant="small" weight={800} color={c.ink}>
          Sample data.{' '}
        </T>
        This uses made-up records for testing, not a real register.
      </T>
    </View>
  );
}

/** An error in place, with the API's own words and a way to try again. */
export function ErrorCard({ error, onRetry, style }: { error: unknown; onRetry?: () => void; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  return (
    <Card style={style}>
      <T variant="h2" accessibilityRole="header">
        That didn&apos;t load
      </T>
      <T variant="sub" style={{ marginTop: 6 }}>
        {asApiError(error).message}
      </T>
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Try again"
          onPress={() => {
            tap();
            onRetry();
          }}
          hitSlop={8}
          style={{ marginTop: 14, minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' }}
        >
          <T weight={700} size={15} color={c.link}>
            Try again
          </T>
        </Pressable>
      ) : null}
    </Card>
  );
}

/** A calm placeholder block that breathes while data loads. */
export function Skeleton({ w = '100%', h = 16, r = 8, onNavy, style }: { w?: DimensionValue; h?: number; r?: number; onNavy?: boolean; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  const still = useReducedMotion();
  const o = useSharedValue(0.55);
  useEffect(() => {
    if (!still) o.set(withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [still, o]);
  const anim = useAnimatedStyle(() => ({ opacity: o.get() }));
  return <Animated.View accessibilityElementsHidden style={[{ width: w, height: h, borderRadius: r, backgroundColor: onNavy ? 'rgba(255,255,255,0.12)' : c.dark ? 'rgba(150,170,255,0.1)' : '#E6E9F1' }, anim, style]} />;
}

/** Rows of skeleton inside a list, for a list that is loading. */
export function SkeletonList({ rows = 3 }: { rows?: number }) {
  return (
    <List>
      {Array.from({ length: rows }, (_, index) => (
        <View key={index} style={{ paddingVertical: 18, paddingHorizontal: 18, gap: 8 }}>
          <Skeleton w="70%" h={14} />
          <Skeleton w="40%" h={11} />
        </View>
      ))}
    </List>
  );
}

function companyLine(company: Company): string {
  const kind = company.entityType ? company.entityType.charAt(0).toLowerCase() + company.entityType.slice(1) : 'company';
  return `${countryShort(company.incorporationCountry)} ${kind}`;
}

/** What the header says about the company or group in view. */
export function companyWords(company: Company, group: boolean, count: number): { name: string; line: string } {
  return { name: company.legalName, line: group ? `Group of ${count} companies` : companyLine(company) };
}

/** The switcher's list: the whole group, then each company in it. */
export function CompanyChoices({ companies, focus, hasGroup, onPick }: { companies: Company[]; focus: string | null; hasGroup: boolean; onPick: (companyId: string | null) => void }) {
  const { c } = useTheme();
  const root = companies[0];
  const items: { id: string | null; name: string; line: string }[] = [
    ...(hasGroup && root ? [{ id: null, name: 'Whole group', line: `${root.legalName} and ${companies.length - 1} related ${companies.length - 1 === 1 ? 'company' : 'companies'}` }] : []),
    ...companies.map((company) => ({ id: company.id, name: company.legalName, line: companyLine(company) })),
  ];
  return (
    <List>
      {items.map((item) => {
        const on = item.id === (focus ?? (hasGroup ? null : (root?.id ?? null)));
        return (
          <Row
            key={item.id ?? 'group'}
            title={item.name}
            sub={item.line}
            accessibilityLabel={`${item.name}${on ? ', shown now' : ''}`}
            onPress={() => onPick(item.id)}
            right={on ? <Icon name="check" size={20} color={c.good} stroke={2.2} /> : undefined}
          />
        );
      })}
    </List>
  );
}


/** A heading row used inside sheets: title on the left, a small close button on the right. */
export function SheetHead({ title, onClose, right }: { title: string; onClose: () => void; right?: ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <T variant="h2" size={20} accessibilityRole="header" style={{ letterSpacing: -0.3 }}>
        {title}
      </T>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {right}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={6}
          onPress={() => {
            tap();
            onClose();
          }}
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
        >
          <View style={{ width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: c.ibBg, borderWidth: 1, borderColor: c.ibBorder }}>
            <Icon name="x" size={17} color={c.ink} />
          </View>
        </Pressable>
      </View>
    </View>
  );
}
