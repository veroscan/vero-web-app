import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono';
import {
  PlusJakartaSans_300Light,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';

/** Loaded once in the root layout. React Native picks a weight by family name, not fontWeight. */
export const fontMap = {
  PlusJakartaSans_300Light,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  JetBrainsMono_500Medium,
  // Score numbers. Licensed for personal use only: needs a commercial licence before launch.
  LowresPixel: require('../../assets/fonts/LowresPixel-Regular.otf') as number,
};

export type Weight = 300 | 400 | 500 | 600 | 700 | 800;

const sans: Record<Weight, string> = {
  300: 'PlusJakartaSans_300Light',
  400: 'PlusJakartaSans_400Regular',
  500: 'PlusJakartaSans_500Medium',
  600: 'PlusJakartaSans_600SemiBold',
  700: 'PlusJakartaSans_700Bold',
  800: 'PlusJakartaSans_800ExtraBold',
};

export const font = {
  sans: (weight: Weight = 500) => sans[weight],
  mono: 'JetBrainsMono_500Medium',
  pixel: 'LowresPixel',
};
