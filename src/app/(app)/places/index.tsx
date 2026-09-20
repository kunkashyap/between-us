import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, Plus, X, ChevronRight } from 'lucide-react-native';
import { useDuo } from '../../../context/duo-context';
import { Colors } from '../../../constants/theme';
import { Place } from '../../../types';
import { BottomNavBar } from '../../../components/navigation/bottom-nav-bar';

export default function PlacesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { places, memories, addPlace } = useDuo();

  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPlaceName, setNewPlaceName] = useState('');
  const [newPlaceNotes, setNewPlaceNotes] = useState('');

  const formatVisited = (dateStr?: string | null) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const handleCreatePlace = async () => {
    if (!newPlaceName.trim()) return;
    await addPlace({
      name: newPlaceName.trim(),
      notes: newPlaceNotes.trim() || null,
      visited_date: new Date().toISOString().split('T')[0],
    });
    setNewPlaceName('');
    setNewPlaceNotes('');
    setIsAddModalOpen(false);
  };

  // Find memories linked to a selected place
  const relatedMemories = selectedPlace
    ? memories.filter(
        (m) =>
          m.location_name &&
          (m.location_name.toLowerCase().includes(selectedPlace.name.toLowerCase()) ||
            selectedPlace.name.toLowerCase().includes(m.location_name.toLowerCase()))
      )
    : [];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.overline}>GEOGRAPHY OF US</Text>
          <Text style={styles.title}>OUR PLACES</Text>
          <Text style={styles.subtitle}>
            {places.length} {places.length === 1 ? 'place' : 'places'} where our story happened
          </Text>
        </View>

        <Pressable
          style={styles.addButton}
          onPress={() => setIsAddModalOpen(true)}
          accessibilityRole="button"
        >
          <Plus size={18} color={Colors.text} />
        </Pressable>
      </View>

      <FlatList
        data={places}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Every place has a story.</Text>
            <Pressable style={styles.emptyButton} onPress={() => setIsAddModalOpen(true)}>
              <Text style={styles.emptyButtonText}>+ ADD A PLACE</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => {
          // Find sample image from linked memories
          const linked = memories.find(
            (m) =>
              m.location_name &&
              m.location_name.toLowerCase().includes(item.name.toLowerCase()) &&
              m.media &&
              m.media.length > 0
          );
          const thumb = item.sample_media?.[0] || linked?.media?.[0]?.storage_path;

          return (
            <Pressable
              style={styles.placeItem}
              onPress={() => setSelectedPlace(item)}
              accessibilityRole="button"
            >
              {thumb ? (
                <Image source={{ uri: thumb }} style={styles.placeThumb} resizeMode="cover" />
              ) : (
                <View style={[styles.placeThumb, styles.placeThumbPlaceholder]}>
                  <MapPin size={20} color={Colors.textMuted} />
                </View>
              )}

              <View style={styles.placeInfo}>
                <Text style={styles.placeName}>{item.name}</Text>
                <Text style={styles.placeDate}>{formatVisited(item.visited_date)}</Text>
                {item.notes ? (
                  <Text style={styles.placeNotes} numberOfLines={1}>
                    {item.notes}
                  </Text>
                ) : null}
              </View>

              <ChevronRight size={18} color={Colors.textMuted} />
            </Pressable>
          );
        }}
      />

      {/* Place Detail Modal */}
      {selectedPlace && (
        <Modal
          visible={Boolean(selectedPlace)}
          animationType="slide"
          onRequestClose={() => setSelectedPlace(null)}
        >
          <View style={[styles.detailContainer, { paddingTop: insets.top + 16 }]}>
            <View style={styles.detailHeader}>
              <Pressable
                hitSlop={12}
                onPress={() => setSelectedPlace(null)}
                style={styles.closeModalButton}
              >
                <X size={22} color={Colors.text} />
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={[styles.detailContent, { paddingBottom: insets.bottom + 32 }]}
            >
              <Text style={styles.detailOverline}>LOCATION</Text>
              <Text style={styles.detailTitle}>{selectedPlace.name}</Text>
              <Text style={styles.detailDate}>{formatVisited(selectedPlace.visited_date)}</Text>

              {selectedPlace.notes && (
                <Text style={styles.detailNotes}>“{selectedPlace.notes}”</Text>
              )}

              {selectedPlace.latitude && selectedPlace.longitude && (
                <View style={styles.coordsBadge}>
                  <MapPin size={12} color={Colors.accent} />
                  <Text style={styles.coordsText}>
                    {selectedPlace.latitude.toFixed(4)}° N, {selectedPlace.longitude.toFixed(4)}° E
                  </Text>
                </View>
              )}

              <View style={styles.detailDivider} />

              <Text style={styles.relatedOverline}>RELATED MEMORIES ({relatedMemories.length})</Text>

              {relatedMemories.length === 0 ? (
                <Text style={styles.noRelatedText}>No memories tagged here yet.</Text>
              ) : (
                relatedMemories.map((m) => (
                  <Pressable
                    key={m.id}
                    style={styles.relatedCard}
                    onPress={() => {
                      setSelectedPlace(null);
                      router.push(`/(app)/(timeline)/memory/${m.id}` as any);
                    }}
                  >
                    <Text style={styles.relatedMemoryDate}>{formatVisited(m.memory_date)}</Text>
                    <Text style={styles.relatedMemoryTitle}>{m.title}</Text>
                    <Text style={styles.relatedMemoryStory} numberOfLines={2}>
                      {m.story}
                    </Text>
                  </Pressable>
                ))
              )}
            </ScrollView>
          </View>
        </Modal>
      )}

      {/* Add Place Modal */}
      <Modal
        visible={isAddModalOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsAddModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.addCard}>
            <View style={styles.addCardHeader}>
              <Text style={styles.addCardTitle}>ADD A PLACE</Text>
              <Pressable hitSlop={10} onPress={() => setIsAddModalOpen(false)}>
                <X size={20} color={Colors.text} />
              </Pressable>
            </View>

            <TextInput
              style={styles.addInput}
              placeholder="Place name (e.g. Hauz Khas Village)"
              placeholderTextColor={Colors.textMuted}
              value={newPlaceName}
              onChangeText={setNewPlaceName}
              autoFocus
            />

            <TextInput
              style={[styles.addInput, styles.addInputNotes]}
              placeholder="Notes or why it matters..."
              placeholderTextColor={Colors.textMuted}
              multiline
              value={newPlaceNotes}
              onChangeText={setNewPlaceNotes}
            />

            <Pressable style={styles.createButton} onPress={handleCreatePlace}>
              <Text style={styles.createButtonText}>SAVE PLACE</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

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
  listContent: {
    paddingHorizontal: 22,
    paddingVertical: 16,
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
    gap: 16,
  },
  placeThumb: {
    width: 60,
    height: 60,
    backgroundColor: Colors.surface,
  },
  placeThumbPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  placeInfo: {
    flex: 1,
    gap: 4,
  },
  placeName: {
    fontSize: 16,
    fontFamily: 'serif',
    color: Colors.text,
  },
  placeDate: {
    fontSize: 12,
    color: Colors.accent,
    letterSpacing: 0.5,
  },
  placeNotes: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    gap: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'serif',
    color: Colors.textSecondary,
  },
  emptyButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.surface,
  },
  emptyButtonText: {
    color: Colors.text,
    fontSize: 11,
    letterSpacing: 1.5,
  },
  detailContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  detailHeader: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  closeModalButton: {
    padding: 6,
    alignSelf: 'flex-start',
  },
  detailContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  detailOverline: {
    fontSize: 10,
    letterSpacing: 2,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  detailTitle: {
    fontSize: 26,
    fontFamily: 'serif',
    color: Colors.text,
    marginBottom: 6,
  },
  detailDate: {
    fontSize: 13,
    color: Colors.accent,
    marginBottom: 16,
  },
  detailNotes: {
    fontSize: 15,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  coordsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: Colors.surface,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  coordsText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  detailDivider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 24,
  },
  relatedOverline: {
    fontSize: 11,
    letterSpacing: 1.5,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 14,
  },
  noRelatedText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  relatedCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 12,
    gap: 6,
  },
  relatedMemoryDate: {
    fontSize: 10,
    letterSpacing: 1.5,
    color: Colors.accent,
    textTransform: 'uppercase',
  },
  relatedMemoryTitle: {
    fontSize: 16,
    fontFamily: 'serif',
    color: Colors.text,
  },
  relatedMemoryStory: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
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
    gap: 16,
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
  addInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    height: 46,
    paddingHorizontal: 12,
    color: Colors.text,
    fontSize: 14,
  },
  addInputNotes: {
    height: 80,
    paddingVertical: 10,
    textAlignVertical: 'top',
  },
  createButton: {
    height: 46,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    color: Colors.text,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '600',
  },
});
