import React from 'react';
import { Stack } from 'expo-router';
export { ErrorBoundary } from 'expo-router';
import { Colors } from '../../../constants/theme';

export default function TimelineLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="memory/[id]"
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="memory/create"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="memory/edit"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack>
  );
}
