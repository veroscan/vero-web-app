import { Redirect, Tabs } from 'expo-router';
import { useSession } from '@/lib/session';
import { TabBar } from '@/ui/TabBar';

/** The four tabs from the boards, under the floating glass tab bar. */
export default function TabsLayout() {
  const { status } = useSession();
  if (status === 'signedOut') return <Redirect href="/welcome" />;
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false, animation: 'shift' }}>
      <Tabs.Screen name="index" options={{ title: 'Overview' }} />
      <Tabs.Screen name="findings" options={{ title: 'Findings' }} />
      <Tabs.Screen name="deadlines" options={{ title: 'Deadlines' }} />
      <Tabs.Screen name="watchlist" options={{ title: 'Watchlist' }} />
    </Tabs>
  );
}
