import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/auth-context';
import { Colors } from '../../constants/theme';

export default function SignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signUp, joinDuoWithCode } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignup = async () => {
    if (!displayName.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Please fill in your name, email, and password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const res = await signUp(email.trim(), password.trim(), displayName.trim());

    if (res.error) {
      setLoading(false);
      setErrorMessage(res.error);
      return;
    }

    if (inviteCode.trim()) {
      await joinDuoWithCode(inviteCode.trim());
    }

    setLoading(false);
    router.replace('/(app)/(timeline)' as any);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            hitSlop={12}
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
          >
            <ArrowLeft color={Colors.text} size={22} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <Text style={styles.overline}>NEW SPACE</Text>
          <Text style={styles.title}>Create your space.</Text>
          <Text style={styles.subtitle}>
            A private scrapbook for you and one other person.
          </Text>

          {errorMessage && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>YOUR FIRST NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Kunal"
                placeholderTextColor={Colors.textMuted}
                value={displayName}
                onChangeText={setDisplayName}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>EMAIL</Text>
              <TextInput
                style={styles.input}
                placeholder="you@betweenus.space"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>PASSWORD</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>FRIEND’S INVITE CODE (OPTIONAL)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. BETWEEN2 (leave blank to create new)"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="characters"
                value={inviteCode}
                onChangeText={setInviteCode}
              />
            </View>

            <Pressable
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSignup}
              disabled={loading}
              accessibilityRole="button"
            >
              {loading ? (
                <ActivityIndicator size="small" color={Colors.text} />
              ) : (
                <Text style={styles.submitButtonText}>CREATE OUR SPACE</Text>
              )}
            </Pressable>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable onPress={() => router.push('/(auth)/login' as any)}>
            <Text style={styles.loginLink}>Sign in</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    padding: 6,
    alignSelf: 'flex-start',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  overline: {
    fontSize: 10,
    letterSpacing: 2,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontFamily: 'serif',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 28,
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: Colors.dangerSubtle,
    borderWidth: 1,
    borderColor: 'rgba(189, 83, 83, 0.4)',
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 13,
  },
  form: {
    gap: 18,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 10,
    letterSpacing: 1.5,
    color: Colors.textSecondary,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    color: Colors.text,
    fontSize: 15,
  },
  submitButton: {
    height: 50,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: Colors.text,
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  loginLink: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
});
