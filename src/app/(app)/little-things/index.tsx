import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, X, Trash2 } from 'lucide-react-native';
import { useDuo } from '../../../context/duo-context';
import { Colors } from '../../../constants/theme';
import { LittleThing, LittleThingType } from '../../../types';
import { BottomNavBar } from '../../../components/navigation/bottom-nav-bar';
import { ConfirmModal } from '../../../components/shared/confirm-modal';

const TYPES: { key: LittleThingType | 'all'; label: string }[] = [
  { key: 'all', label: 'ALL' },
  { key: 'inside_joke', label: 'INSIDE JOKES' },
  { key: 'quote', label: 'QUOTES' },
  { key: 'random_moment', label: 'RANDOM MOMENTS' },
  { key: 'song', label: 'SONGS' },
  { key: 'note', label: 'NOTES' },
];

export default function LittleThingsScreen() {
  const insets = useSafeAreaInsets();
  const { littleThings, addLittleThing, deleteLittleThing } = useDuo();

  const [activeFilter, setActiveFilter] = useState<LittleThingType | 'all'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // New Little Thing Form State
  const [selectedType, setSelectedType] = useState<LittleThingType>('inside_joke');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const filteredItems = littleThings.filter((item) =>
    activeFilter === 'all' ? true : item.type === activeFilter
  );

  const handleSave = async () => {
    if (!content.trim()) return;
    await addLittleThing({
      type: selectedType,
      title: title.trim() || selectedType.replace('_', ' ').toUpperCase(),
      content: content.trim(),
      origin_date: new Date().toISOString().split('T')[0],
    });
    setTitle('');
    setContent('');
    setIsAddModalOpen(false);
  };

  const handleDelete = async () => {
    if (deleteTargetId) {
      await deleteLittleThing(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.overline}>EPHEMERA</Text>
          <Text style={styles.title}>LITTLE THINGS</Text>
          <Text style={styles.subtitle}>
            Small things that don’t need an entire memory.
          </Text>
        </View>

        <Pressable
          style={styles.addButton}
          onPress={() => setIsAddModalOpen(true)}
          accessibilityLabel="Add little thing"
        >
          <Plus size={18} color={Colors.text} />
        </Pressable>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {TYPES.map((t) => (
            <Pressable
              key={t.key}
              style={[
                styles.filterChip,
                activeFilter === t.key && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(t.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === t.key && styles.filterChipTextActive,
                ]}
              >
                {t.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Nothing here yet.</Text>
            <Text style={styles.emptySubtitle}>Jokes, quotes, or passing thoughts.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTypeBadge}>
                {item.type.replace('_', ' ').toUpperCase()}
              </Text>
              <Pressable
                hitSlop={8}
                onPress={() => setDeleteTargetId(item.id)}
                style={styles.deleteButton}
              >
                <Trash2 size={14} color={Colors.textMuted} />
              </Pressable>
            </View>

            {item.title ? <Text style={styles.itemTitle}>{item.title}</Text> : null}

            <Text style={styles.itemContent}>“{item.content}”</Text>

            <View style={styles.itemFooter}>
              <Text style={styles.originDate}>Origin: {formatDate(item.origin_date)}</Text>
              {item.author_name && (
                <Text style={styles.authorBadge}>• {item.author_name}</Text>
              )}
            </View>
          </View>
        )}
      />

      {/* Add Little Thing Modal */}
      <Modal
        visible={isAddModalOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsAddModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.addCard}>
            <View style={styles.addCardHeader}>
              <Text style={styles.addCardTitle}>SAVE A LITTLE THING</Text>
              <Pressable hitSlop={10} onPress={() => setIsAddModalOpen(false)}>
                <X size={20} color={Colors.text} />
              </Pressable>
            </View>

            {/* Type selector */}
            <View style={styles.typeSelectorRow}>
              {(['inside_joke', 'quote', 'random_moment', 'song', 'note'] as LittleThingType[]).map(
                (t) => (
                  <Pressable
                    key={t}
                    style={[
                      styles.typeOption,
                      selectedType === t && styles.typeOptionSelected,
                    ]}
                    onPress={() => setSelectedType(t)}
                  >
                    <Text
                      style={[
                        styles.typeOptionText,
                        selectedType === t && styles.typeOptionTextSelected,
                      ]}
                    >
                      {t.replace('_', ' ').toUpperCase()}
                    </Text>
                  </Pressable>
                )
              )}
            </View>

            <TextInput
              style={styles.inputTitle}
              placeholder="Title or context (optional)"
              placeholderTextColor={Colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={styles.inputContent}
              placeholder={
                selectedType === 'quote'
                  ? '“We’ll leave in 10 minutes...”'
                  : 'What was said or what happened?'
              }
              placeholderTextColor={Colors.textMuted}
              multiline
              value={content}
              onChangeText={setContent}
              autoFocus
            />

            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>KEEP THIS</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        visible={Boolean(deleteTargetId)}
        title="DELETE LITTLE THING?"
        message="This item will be removed from your shared space."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  addButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterRow: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  filterScroll: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.surfaceElevated,
  },
  filterChipText: {
    fontSize: 10,
    letterSpacing: 1.2,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: Colors.accent,
  },
  listContent: {
    paddingHorizontal: 22,
    paddingVertical: 16,
    gap: 16,
  },
  itemCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    gap: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTypeBadge: {
    fontSize: 10,
    letterSpacing: 1.5,
    color: Colors.accent,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 4,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  itemContent: {
    fontSize: 16,
    fontFamily: 'serif',
    lineHeight: 24,
    color: Colors.text,
    marginVertical: 4,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  originDate: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  authorBadge: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  emptyContainer: {
    paddingVertical: 80,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  addCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    gap: 14,
  },
  addCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addCardTitle: {
    fontSize: 12,
    letterSpacing: 2,
    color: Colors.text,
    fontWeight: '600',
  },
  typeSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  typeOption: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  typeOptionSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.surfaceElevated,
  },
  typeOptionText: {
    fontSize: 9,
    letterSpacing: 1,
    color: Colors.textSecondary,
  },
  typeOptionTextSelected: {
    color: Colors.accent,
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
  inputContent: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    minHeight: 80,
    padding: 12,
    color: Colors.text,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  saveButton: {
    height: 46,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  saveButtonText: {
    color: Colors.text,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '600',
  },
});
