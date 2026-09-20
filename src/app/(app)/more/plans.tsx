import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Check, Plus, X, ArrowUpRight, Trash2 } from 'lucide-react-native';
import { useDuo } from '../../../context/duo-context';
import { Colors } from '../../../constants/theme';
import { Plan } from '../../../types';

export default function PlansScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { plans, addPlan, togglePlanStatus, deletePlan } = useDuo();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleCreatePlan = async () => {
    if (!title.trim()) return;
    await addPlan({
      title: title.trim(),
      description: description.trim() || undefined,
    });
    setTitle('');
    setDescription('');
    setIsAddModalOpen(false);
  };

  const handleTurnIntoMemory = (plan: Plan) => {
    // Navigate to memory create screen with title prefilled
    router.push({
      pathname: '/(app)/(timeline)/memory/create' as any,
      params: {
        prefillTitle: plan.title,
        prefillStory: plan.description || `Remember when we planned to ${plan.title}? Today we finally did it.`,
      },
    });
  };

  const pendingPlans = plans.filter((p) => p.status === 'pending');
  const completedPlans = plans.filter((p) => p.status === 'completed');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          hitSlop={12}
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Back"
        >
          <ArrowLeft color={Colors.text} size={22} />
        </Pressable>

        <Text style={styles.headerTitle}>FUTURE PLANS</Text>

        <Pressable
          style={styles.addButton}
          onPress={() => setIsAddModalOpen(true)}
          accessibilityLabel="Add plan"
        >
          <Plus size={18} color={Colors.text} />
        </Pressable>
      </View>

      <FlatList
        data={[...pendingPlans, ...completedPlans]}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 32 }]}
        ListHeaderComponent={
          <View style={styles.introBox}>
            <Text style={styles.introTitle}>THINGS WE STILL HAVE TO DO</Text>
            <Text style={styles.introSubtitle}>
              Shared adventures and bucket list items waiting to become memories.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No plans written yet.</Text>
            <Text style={styles.emptySubtitle}>Add a trip, a movie, or a restaurant.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isDone = item.status === 'completed';

          return (
            <View style={[styles.planCard, isDone && styles.planCardDone]}>
              <View style={styles.planMainRow}>
                {/* Custom Checkbox */}
                <Pressable
                  style={[styles.checkbox, isDone && styles.checkboxChecked]}
                  onPress={() => togglePlanStatus(item.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isDone }}
                >
                  {isDone && <Check size={12} color="#FFF" />}
                </Pressable>

                <View style={styles.planTextCol}>
                  <Text style={[styles.planTitle, isDone && styles.planTitleDone]}>
                    {item.title}
                  </Text>
                  {item.description ? (
                    <Text style={styles.planDesc}>{item.description}</Text>
                  ) : null}
                </View>

                <Pressable
                  hitSlop={8}
                  onPress={() => deletePlan(item.id)}
                  style={styles.deleteButton}
                >
                  <Trash2 size={14} color={Colors.textMuted} />
                </Pressable>
              </View>

              {/* Turn into Memory Action when completed */}
              {isDone && (
                <Pressable
                  style={styles.turnIntoMemoryButton}
                  onPress={() => handleTurnIntoMemory(item)}
                >
                  <Text style={styles.turnIntoMemoryText}>TURN INTO MEMORY</Text>
                  <ArrowUpRight size={14} color={Colors.accent} />
                </Pressable>
              )}
            </View>
          );
        }}
      />

      {/* Add Plan Modal */}
      <Modal
        visible={isAddModalOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsAddModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>ADD A PLAN</Text>
              <Pressable hitSlop={10} onPress={() => setIsAddModalOpen(false)}>
                <X size={20} color={Colors.text} />
              </Pressable>
            </View>

            <TextInput
              style={styles.inputTitle}
              placeholder="e.g. Road trip to the hills"
              placeholderTextColor={Colors.textMuted}
              value={title}
              onChangeText={setTitle}
              autoFocus
            />

            <TextInput
              style={styles.inputDesc}
              placeholder="Notes or details (optional)..."
              placeholderTextColor={Colors.textMuted}
              multiline
              value={description}
              onChangeText={setDescription}
            />

            <Pressable style={styles.savePlanButton} onPress={handleCreatePlan}>
              <Text style={styles.savePlanButtonText}>ADD TO LIST</Text>
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
    gap: 12,
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
  planCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 12,
  },
  planCardDone: {
    opacity: 0.75,
    borderColor: Colors.borderSubtle,
  },
  planMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  planTextCol: {
    flex: 1,
    gap: 4,
  },
  planTitle: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 20,
  },
  planTitleDone: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
  },
  planDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  deleteButton: {
    padding: 4,
  },
  turnIntoMemoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
  },
  turnIntoMemoryText: {
    fontSize: 10,
    letterSpacing: 1.5,
    color: Colors.accent,
    fontWeight: '600',
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
  inputDesc: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    minHeight: 80,
    padding: 12,
    color: Colors.text,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  savePlanButton: {
    height: 48,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  savePlanButtonText: {
    color: Colors.text,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '600',
  },
});
