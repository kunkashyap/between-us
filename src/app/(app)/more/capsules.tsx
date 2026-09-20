import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
  TextInput,
  Image,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Lock, Unlock, Plus, X } from 'lucide-react-native';
import { useDuo } from '../../../context/duo-context';
import { Colors } from '../../../constants/theme';
import { TimeCapsule } from '../../../types';

export default function CapsulesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { capsules, addCapsule } = useDuo();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [unlockYears, setUnlockYears] = useState(1); // default 1 year

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleCreateCapsule = async () => {
    if (!title.trim() || !message.trim()) return;

    const unlockDate = new Date();
    unlockDate.setFullYear(unlockDate.getFullYear() + unlockYears);

    await addCapsule({
      title: title.trim(),
      message: message.trim(),
      unlock_at: unlockDate.toISOString(),
    });

    setTitle('');
    setMessage('');
    setIsAddModalOpen(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Bar */}
      <View style={styles.header}>
        <Pressable
          hitSlop={12}
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Back"
        >
          <ArrowLeft color={Colors.text} size={22} />
        </Pressable>

        <Text style={styles.headerTitle}>TIME CAPSULES</Text>

        <Pressable
          style={styles.addButton}
          onPress={() => setIsAddModalOpen(true)}
          accessibilityLabel="Seal new capsule"
        >
          <Plus size={18} color={Colors.text} />
        </Pressable>
      </View>

      <FlatList
        data={capsules}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 32 }]}
        ListHeaderComponent={
          <View style={styles.introBox}>
            <Text style={styles.introTitle}>SEALED LETTERS & MEMORIES</Text>
            <Text style={styles.introSubtitle}>
              Notes locked away until a specific date in the future. Once sealed, neither of you can open them early.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>Nothing sealed yet.</Text>
            <Text style={styles.emptySubtitle}>Write a note to be read in the future.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isUnlocked = item.is_unlocked || new Date(item.unlock_at).getTime() <= Date.now();

          return (
            <View style={[styles.capsuleCard, isUnlocked ? styles.capsuleUnsealed : styles.capsuleSealed]}>
              <View style={styles.cardHeader}>
                <View style={styles.statusBadge}>
                  {isUnlocked ? (
                    <>
                      <Unlock size={14} color={Colors.success} />
                      <Text style={[styles.statusText, { color: Colors.success }]}>UNSEALED</Text>
                    </>
                  ) : (
                    <>
                      <Lock size={14} color={Colors.accent} />
                      <Text style={[styles.statusText, { color: Colors.accent }]}>SEALED</Text>
                    </>
                  )}
                </View>
                <Text style={styles.authorText}>By {item.author_name || 'Friend'}</Text>
              </View>

              <Text style={styles.capsuleTitle}>{item.title}</Text>

              {isUnlocked ? (
                // UNSEALED: Show message and media
                <View style={styles.unsealedBody}>
                  <Text style={styles.unsealedDate}>
                    Written {formatDate(item.created_at)} • Opened {formatDate(item.unlock_at)}
                  </Text>
                  <Text style={styles.messageText}>“{item.message}”</Text>

                  {item.media_urls && item.media_urls.length > 0 && (
                    <Image
                      source={{ uri: item.media_urls[0] }}
                      style={styles.capsuleMedia}
                      resizeMode="cover"
                    />
                  )}
                </View>
              ) : (
                // SEALED: Message is hidden
                <View style={styles.sealedBody}>
                  <Text style={styles.sealedNotice}>
                    Written {formatDate(item.created_at)}
                  </Text>
                  <Text style={styles.unlockCountdown}>
                    Opens on {formatDate(item.unlock_at)}
                  </Text>
                  <View style={styles.hiddenParchment}>
                    <Text style={styles.hiddenParchmentText}>
                      [ The message inside remains confidential until the unlock date ]
                    </Text>
                  </View>
                </View>
              )}
            </View>
          );
        }}
      />

      {/* Add Capsule Modal */}
      <Modal
        visible={isAddModalOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsAddModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>SEAL A TIME CAPSULE</Text>
              <Pressable hitSlop={10} onPress={() => setIsAddModalOpen(false)}>
                <X size={20} color={Colors.text} />
              </Pressable>
            </View>

            <TextInput
              style={styles.inputTitle}
              placeholder="Capsule Title (e.g. Open when 2027 arrives)"
              placeholderTextColor={Colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={styles.inputMessage}
              placeholder="Write what you want your future selves to remember..."
              placeholderTextColor={Colors.textMuted}
              multiline
              value={message}
              onChangeText={setMessage}
            />

            {/* Lock Duration Selector */}
            <View style={styles.durationRow}>
              <Text style={styles.durationLabel}>LOCK DURATION:</Text>
              {[1, 2, 5].map((y) => (
                <Pressable
                  key={y}
                  style={[
                    styles.durationChip,
                    unlockYears === y && styles.durationChipActive,
                  ]}
                  onPress={() => setUnlockYears(y)}
                >
                  <Text
                    style={[
                      styles.durationChipText,
                      unlockYears === y && styles.durationChipTextActive,
                    ]}
                  >
                    {y} {y === 1 ? 'Year' : 'Years'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable style={styles.sealButton} onPress={handleCreateCapsule}>
              <Text style={styles.sealButtonText}>SEAL THIS CAPSULE</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  addButton: {
    padding: 6,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  introBox: {
    paddingVertical: 12,
    gap: 6,
    marginBottom: 8,
  },
  introTitle: {
    fontSize: 10,
    letterSpacing: 2,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  introSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  emptyBox: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'serif',
    color: Colors.text,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  capsuleCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    gap: 12,
  },
  capsuleSealed: {
    borderColor: Colors.border,
  },
  capsuleUnsealed: {
    borderColor: 'rgba(91, 147, 114, 0.4)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  authorText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  capsuleTitle: {
    fontSize: 18,
    fontFamily: 'serif',
    color: Colors.text,
  },
  unsealedBody: {
    gap: 10,
  },
  unsealedDate: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.text,
    fontStyle: 'italic',
  },
  capsuleMedia: {
    width: '100%',
    height: 180,
    marginTop: 8,
  },
  sealedBody: {
    gap: 8,
  },
  sealedNotice: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  unlockCountdown: {
    fontSize: 13,
    color: Colors.accent,
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  hiddenParchment: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.borderStrong,
    padding: 16,
    marginTop: 6,
    alignItems: 'center',
  },
  hiddenParchmentText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: Colors.textMuted,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 12,
    letterSpacing: 2,
    color: Colors.text,
    fontWeight: '600',
  },
  inputTitle: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    height: 44,
    paddingHorizontal: 12,
    color: Colors.text,
    fontSize: 14,
  },
  inputMessage: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    minHeight: 100,
    padding: 12,
    color: Colors.text,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  durationLabel: {
    fontSize: 10,
    letterSpacing: 1,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  durationChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  durationChipActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.surfaceElevated,
  },
  durationChipText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  durationChipTextActive: {
    color: Colors.accent,
    fontWeight: '600',
  },
  sealButton: {
    height: 48,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  sealButtonText: {
    color: Colors.text,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '600',
  },
});
