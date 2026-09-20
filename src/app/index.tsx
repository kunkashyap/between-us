import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/auth-context';
import { Colors } from '../constants/theme';

export default function IndexScreen() {
  const { user, duo, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (user && duo) {
      router.replace('/(app)/(timeline)' as any);
    } else {
      router.replace('/(auth)/landing' as any);
    }
  }, [user, duo, isLoading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color={Colors.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
