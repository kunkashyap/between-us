import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Copy, Check, RotateCcw, ShieldCheck } from 'lucide-react-native';
import { useAuth } from '../../../context/auth-context';
import { useDuo } from '../../../context/duo-context';
import { Colors } from '../../../constants/theme';
import { ConfirmModal } from '../../../components/shared/confirm-modal';

export default function DuoSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, duo, updateProfile, isDemoMode } = useAuth();
  const { resetToDemoData } = useDuo();

  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const handleCopyCode = () => {
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSaveProfile = async () => {
    if (!displayName.trim()) return;
    await updateProfile(displayName.trim());
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2000);
  };

  const handleResetDemo = async () => {
    setIsResetConfirmOpen(false);
    await resetToDemoData();
    Alert.alert('Reset Complete', 'Development demo data has been restored.');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          hitSlop={12}
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Back"
        >
          <ArrowLeft color={Colors.text} size={22} />
        </Pressable>

        <Text style={styles.headerTitle}>SPACE SETTINGS</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Duo Space Information */}
        <View style={styles.section}>
          <Text style={styles.sectionOverline}>OUR DUO SPACE</Text>
          <View style={styles.card}>
            <Text style={styles.spaceName}>{duo?.name || 'Kunal × Friend'}</Text>
            <Text style={styles.spaceDescription}>
              This private space is exclusive to exactly two people. All memories, photos, and voice notes are restricted to this circle.
            </Text>

            <View style={styles.inviteBox}>
              <View style={styles.codeTextCol}>
                <Text style={styles.codeLabel}>PARTNER INVITE CODE</Text>
                <Text style={styles.codeValue}>{duo?.invite_code || 'BETWEEN2'}</Text>
              </View>

              <Pressable style={styles.copyButton} onPress={handleCopyCode}>
                {copiedCode ? (
                  <>
                    <Check size={14} color={Colors.success} />
                    <Text style={[styles.copyButtonText, { color: Colors.success }]}>COPIED</Text>
                  </>
                ) : (
                  <>
                    <Copy size={14} color={Colors.text} />
                    <Text style={styles.copyButtonText}>COPY</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>

        {/* Your Profile */}
        <View style={styles.section}>
          <Text style={styles.sectionOverline}>YOUR PROFILE</Text>
          <View style={styles.card}>
            <Text style={styles.fieldLabel}>DISPLAY NAME</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your name"
              placeholderTextColor={Colors.textMuted}
            />

            <Pressable style={styles.saveProfileButton} onPress={handleSaveProfile}>
              <Text style={styles.saveProfileText}>
                {isSavedNotice ? 'SAVED' : 'UPDATE NAME'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Privacy & Security Indicator */}
        <View style={styles.privacyCard}>
          <ShieldCheck size={18} color={Colors.accent} />
          <View style={styles.privacyTextCol}>
            <Text style={styles.privacyTitle}>Protected by Row Level Security</Text>
            <Text style={styles.privacyDesc}>
              Data is private to your Duo space. No public feeds, no algorithmic suggestions, no ads.
            </Text>
          </View>
        </View>

        {/* Development Seed Reset */}
        <View style={styles.section}>
          <Text style={styles.sectionOverline}>DEVELOPMENT CONTROLS</Text>
          <View style={styles.card}>
            <Text style={styles.devNotice}>
              Resetting will restore the initial development dataset (Kunal × Friend, “The day we got lost”, Delhi places, inside jokes, and sealed capsules).
            </Text>

            <Pressable
              style={styles.resetButton}
              onPress={() => setIsResetConfirmOpen(true)}
            >
              <RotateCcw size={14} color={Colors.textSecondary} />
              <Text style={styles.resetButtonText}>RESTORE DEMO SEED DATA</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Reset Confirmation */}
      <ConfirmModal
        visible={isResetConfirmOpen}
        title="RESTORE DEMO DATA?"
        message="This will re-populate the development memories and reset custom additions."
        confirmLabel="Restore"
        isDestructive={false}
        onConfirm={handleResetDemo}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 12,
    letterSpacing: 2,
    color: Colors.text,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 28,
  },
  section: {
    gap: 10,
  },
  sectionOverline: {
    fontSize: 10,
    letterSpacing: 2,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    gap: 14,
  },
  spaceName: {
    fontSize: 20,
    fontFamily: 'serif',
    color: Colors.text,
  },
  spaceDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  inviteBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginTop: 4,
  },
  codeTextCol: {
    gap: 2,
  },
  codeLabel: {
    fontSize: 9,
    letterSpacing: 1.2,
    color: Colors.textMuted,
  },
  codeValue: {
    fontSize: 16,
    letterSpacing: 2,
    color: Colors.accent,
    fontWeight: '600',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
  },
  copyButtonText: {
    fontSize: 10,
    letterSpacing: 1.5,
    color: Colors.text,
    fontWeight: '600',
  },
  fieldLabel: {
    fontSize: 10,
    letterSpacing: 1.2,
    color: Colors.textMuted,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    height: 46,
    paddingHorizontal: 12,
    color: Colors.text,
    fontSize: 14,
  },
  saveProfileButton: {
    height: 42,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  saveProfileText: {
    fontSize: 11,
    letterSpacing: 2,
    color: Colors.text,
    fontWeight: '600',
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  privacyTextCol: {
    flex: 1,
    gap: 4,
  },
  privacyTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  privacyDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  devNotice: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.surfaceElevated,
    marginTop: 4,
  },
  resetButtonText: {
    fontSize: 11,
    letterSpacing: 1.5,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
