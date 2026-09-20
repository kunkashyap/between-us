import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Lock,
  CheckSquare,
  HelpCircle,
  Settings as SettingsIcon,
  LogOut,
  ChevronRight,
} from 'lucide-react-native';
import { useAuth } from '../../../context/auth-context';
import { useDuo } from '../../../context/duo-context';
import { Colors } from '../../../constants/theme';
import { BottomNavBar } from '../../../components/navigation/bottom-nav-bar';

export default function MoreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, duo, signOut } = useAuth();
  const { capsules, plans, questions } = useDuo();

  const sealedCount = capsules.filter((c) => !c.is_unlocked).length;
  const pendingPlansCount = plans.filter((p) => p.status === 'pending').length;

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/landing' as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.overline}>BETWEEN US</Text>
        <Text style={styles.title}>MORE</Text>
        <Text style={styles.subtitle}>
          {duo?.name || 'Kunal × Friend'} • Shared Space
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Navigation Items */}
        <View style={styles.menuGroup}>
          {/* TIME CAPSULES */}
          <Pressable
            style={styles.menuItem}
            onPress={() => router.push('/(app)/more/capsules' as any)}
            accessibilityRole="button"
          >
            <View style={styles.menuIconBox}>
              <Lock size={18} color={Colors.accent} />
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>TIME CAPSULES</Text>
              <Text style={styles.menuDesc}>
                {sealedCount > 0
                  ? `${sealedCount} sealed capsule${sealedCount > 1 ? 's' : ''}`
                  : 'Seal notes for the future'}
              </Text>
            </View>
            <ChevronRight size={18} color={Colors.textMuted} />
          </Pressable>

          {/* THINGS WE STILL HAVE TO DO */}
          <Pressable
            style={styles.menuItem}
            onPress={() => router.push('/(app)/more/plans' as any)}
            accessibilityRole="button"
          >
            <View style={styles.menuIconBox}>
              <CheckSquare size={18} color={Colors.accent} />
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>THINGS TO DO</Text>
              <Text style={styles.menuDesc}>
                {pendingPlansCount > 0
                  ? `${pendingPlansCount} pending plan${pendingPlansCount > 1 ? 's' : ''}`
                  : 'Future memories waiting to happen'}
              </Text>
            </View>
            <ChevronRight size={18} color={Colors.textMuted} />
          </Pressable>

          {/* QUESTIONS */}
          <Pressable
            style={styles.menuItem}
            onPress={() => router.push('/(app)/more/questions' as any)}
            accessibilityRole="button"
          >
            <View style={styles.menuIconBox}>
              <HelpCircle size={18} color={Colors.accent} />
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>QUESTIONS</Text>
              <Text style={styles.menuDesc}>
                {questions.length} prompt{questions.length > 1 ? 's' : ''} • Double-blind answers
              </Text>
            </View>
            <ChevronRight size={18} color={Colors.textMuted} />
          </Pressable>

          {/* SETTINGS & PROFILE */}
          <Pressable
            style={styles.menuItem}
            onPress={() => router.push('/(app)/more/duo-settings' as any)}
            accessibilityRole="button"
          >
            <View style={styles.menuIconBox}>
              <SettingsIcon size={18} color={Colors.accent} />
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>SPACE SETTINGS</Text>
              <Text style={styles.menuDesc}>
                Invite code, partner sync, dev data
              </Text>
            </View>
            <ChevronRight size={18} color={Colors.textMuted} />
          </Pressable>
        </View>

        {/* User Card */}
        <View style={styles.userCard}>
          <Text style={styles.userOverline}>LOGGED IN AS</Text>
          <Text style={styles.userName}>{user?.display_name || 'Kunal'}</Text>
          <Text style={styles.duoCodeBadge}>
            Invite Code: {duo?.invite_code || 'BETWEEN2'}
          </Text>
        </View>

        {/* Sign out */}
        <Pressable
          style={styles.signOutButton}
          onPress={handleSignOut}
          accessibilityRole="button"
        >
          <LogOut size={16} color={Colors.danger} />
          <Text style={styles.signOutText}>SIGN OUT</Text>
        </Pressable>
      </ScrollView>

      <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  overline: {
    fontSize: 10,
    letterSpacing: 2,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontFamily: 'serif',
    letterSpacing: 1,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 22,
    paddingVertical: 20,
    gap: 24,
  },
  menuGroup: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
    gap: 14,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuInfo: {
    flex: 1,
    gap: 2,
  },
  menuTitle: {
    fontSize: 12,
    letterSpacing: 1.5,
    fontWeight: '600',
    color: Colors.text,
  },
  menuDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  userCard: {
    padding: 18,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  userOverline: {
    fontSize: 10,
    letterSpacing: 1.5,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  userName: {
    fontSize: 18,
    fontFamily: 'serif',
    color: Colors.text,
  },
  duoCodeBadge: {
    fontSize: 12,
    color: Colors.accent,
    letterSpacing: 0.5,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(189, 83, 83, 0.3)',
    backgroundColor: Colors.dangerSubtle,
  },
  signOutText: {
    fontSize: 11,
    letterSpacing: 2,
    color: Colors.danger,
    fontWeight: '600',
  },
});
