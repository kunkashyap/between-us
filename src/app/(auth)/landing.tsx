import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/auth-context';
import { Colors } from '../../constants/theme';

export default function LandingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { enterDemoSpace } = useAuth();

  const handleEnter = async () => {
    await enterDemoSpace();
    router.replace('/(app)/(timeline)' as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.content}>
        {/* Editorial Overline */}
        <Text style={styles.overline}>A PRIVATE DIGITAL SCRAPBOOK</Text>

        {/* Title */}
        <Text style={styles.title}>BETWEEN US</Text>

        {/* Quiet emotional tagline */}
        <Text style={styles.subtitle}>a place for everything worth remembering.</Text>

        {/* Duo mark */}
        <View style={styles.duoBadge}>
          <Text style={styles.duoNames}>Kunal × Friend</Text>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.footer}>
        <Pressable
          style={styles.primaryButton}
          onPress={handleEnter}
          accessibilityRole="button"
          accessibilityLabel="Enter our space"
        >
          <Text style={styles.primaryButtonText}>ENTER OUR SPACE</Text>
        </Pressable>

        <View style={styles.authLinksRow}>
          <Pressable
            hitSlop={10}
            onPress={() => router.push('/(auth)/login' as any)}
            accessibilityRole="button"
          >
            <Text style={styles.linkText}>Sign In</Text>
          </Pressable>

          <Text style={styles.linkDivider}>•</Text>

          <Pressable
            hitSlop={10}
            onPress={() => router.push('/(auth)/signup' as any)}
            accessibilityRole="button"
          >
            <Text style={styles.linkText}>Create Duo</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'space-between',
    paddingHorizontal: 32,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overline: {
    fontSize: 10,
    letterSpacing: 3,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  title: {
    fontSize: 34,
    fontFamily: 'serif',
    letterSpacing: 3,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 15,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 36,
    letterSpacing: 0.3,
  },
  duoBadge: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  duoNames: {
    fontSize: 13,
    letterSpacing: 1.5,
    color: Colors.accent,
    textTransform: 'uppercase',
  },
  footer: {
    gap: 20,
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 18,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: Colors.text,
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  authLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  linkText: {
    color: Colors.textSecondary,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  linkDivider: {
    color: Colors.textMuted,
    fontSize: 10,
  },
});
