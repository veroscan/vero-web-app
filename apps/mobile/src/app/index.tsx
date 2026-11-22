import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { useSession } from '@/lib/session';

/** Opens on Welcome when signed out, otherwise on the Overview tab. */
export default function Index() {
  const { status } = useSession();
  if (status === 'loading') return <View style={{ flex: 1, backgroundColor: '#00004A' }} />;
  return <Redirect href={status === 'signedIn' ? '/(tabs)' : '/welcome'} />;
}
