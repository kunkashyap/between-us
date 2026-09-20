import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Edit2, Trash2, MapPin, Music, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDuo } from '../../../../context/duo-context';
import { Colors } from '../../../../constants/theme';
import { EditorialPhotoGrid } from '../../../../components/memory/editorial-photo-grid';
import { AudioPlayerWidget } from '../../../../components/memory/audio-player-widget';
import { PhotoViewerModal } from '../../../../components/shared/photo-viewer-modal';
import { ConfirmModal } from '../../../../components/shared/confirm-modal';

export default function MemoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { memories, deleteMemory } = useDuo();

  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const memory = memories.find((m) => m.id === id);

  if (!memory) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.notFoundText}>Memory not found.</Text>
        <Pressable style={styles.backLink} onPress={() => router.back()}>
          <Text style={styles.backLinkText}>Return to Timeline</Text>
        </Pressable>
      </View>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).toUpperCase();
    } catch {
      return dateStr.toUpperCase();
    }
  };

  const formattedMedia = (memory.media || []).map((m) => ({
    uri: m.storage_path,
    caption: m.caption,
  }));

  const handleOpenPhoto = (index: number) => {
    setViewerIndex(index);
    setViewerVisible(true);
  };

  const handleDelete = async () => {
    setConfirmDeleteVisible(false);
    await deleteMemory(memory.id);
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable
          hitSlop={12}
          onPress={() => router.back()}
          style={styles.iconButton}
          accessibilityLabel="Back to timeline"
        >
          <ArrowLeft color={Colors.text} size={22} />
        </Pressable>

        <View style={styles.headerActions}>
          <Pressable
            hitSlop={10}
            onPress={() =>
              router.push({
                pathname: '/(app)/(timeline)/memory/edit' as any,
                params: { id: memory.id },
              })
            }
            style={styles.iconButton}
            accessibilityLabel="Edit memory"
          >
            <Edit2 color={Colors.textSecondary} size={18} />
          </Pressable>

          <Pressable
            hitSlop={10}
            onPress={() => setConfirmDeleteVisible(true)}
            style={styles.iconButton}
            accessibilityLabel="Delete memory"
          >
            <Trash2 color={Colors.danger} size={18} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 48 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Overline */}
        <Text style={styles.dateText}>{formatDate(memory.memory_date)}</Text>

        {/* Title */}
        <Text style={styles.titleText}>{memory.title}</Text>

        {/* Media Presentation */}
        {formattedMedia.length > 0 && (
          <EditorialPhotoGrid media={formattedMedia} onPhotoPress={handleOpenPhoto} />
        )}

        {/* Full Story text */}
        <Text style={styles.storyText}>{memory.story}</Text>

        {/* Voice note if recorded */}
        {memory.audio_url && (
          <View style={styles.sectionBlock}>
            <AudioPlayerWidget
              audioUrl={memory.audio_url}
              durationSeconds={memory.audio_duration_seconds}
            />
          </View>
        )}

        {/* Song info if added */}
        {memory.song_title && (
          <View style={styles.metadataRow}>
            <Music size={14} color={Colors.accent} />
            <Text style={styles.songText}>
              {memory.song_title}
              {memory.song_artist ? ` • ${memory.song_artist}` : ''}
            </Text>
          </View>
        )}

        {/* Location if added */}
        {memory.location_name && (
          <View style={styles.metadataRow}>
            <MapPin size={14} color={Colors.textMuted} />
            <Text style={styles.locationText}>{memory.location_name}</Text>
          </View>
        )}

        {/* Creator Attribution */}
        <View style={styles.authorRow}>
          <User size={12} color={Colors.textMuted} />
          <Text style={styles.authorText}>
            Preserved by {memory.author_name || 'Friend'}
          </Text>
        </View>
      </ScrollView>

      {/* Full-Screen Photo Viewer */}
      <PhotoViewerModal
        visible={viewerVisible}
        images={formattedMedia}
        initialIndex={viewerIndex}
        onClose={() => setViewerVisible(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={confirmDeleteVisible}
        title="DELETE MEMORY?"
        message="This memory and its media will be permanently removed from your shared space."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notFoundText: {
    color: Colors.textSecondary,
    fontSize: 15,
    marginBottom: 16,
  },
  backLink: {
    padding: 10,
  },
  backLinkText: {
    color: Colors.accent,
    fontSize: 14,
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
  iconButton: {
    padding: 6,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 24,
  },
  dateText: {
    fontSize: 11,
    letterSpacing: 2,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 8,
    fontWeight: '500',
  },
  titleText: {
    fontSize: 26,
    fontFamily: 'serif',
    letterSpacing: 1,
    color: Colors.text,
    lineHeight: 34,
    marginBottom: 14,
  },
  storyText: {
    fontSize: 16,
    lineHeight: 28,
    color: Colors.text,
    letterSpacing: 0.2,
    marginTop: 18,
    marginBottom: 20,
  },
  sectionBlock: {
    marginVertical: 10,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  songText: {
    fontSize: 13,
    color: Colors.accent,
    letterSpacing: 0.5,
  },
  locationText: {
    fontSize: 13,
    color: Colors.textSecondary,
    letterSpacing: 0.4,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
  authorText: {
    fontSize: 11,
    color: Colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
