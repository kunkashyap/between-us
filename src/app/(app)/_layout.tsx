import React from 'react';
import { Stack } from 'expo-router';
export { ErrorBoundary } from 'expo-router';
import { Colors } from '../../constants/theme';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="(timeline)" />
      <Stack.Screen name="places/index" />
      <Stack.Screen name="little-things/index" />
      <Stack.Screen name="more/index" />
      <Stack.Screen name="more/capsules" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="more/plans" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="more/questions" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="more/duo-settings" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
