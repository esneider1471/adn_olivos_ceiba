import { Stack } from 'expo-router';

import { colors } from '@/shared';

export default function AppGroupLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />;
}
