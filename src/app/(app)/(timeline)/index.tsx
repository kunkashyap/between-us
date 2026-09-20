import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, Music, Sparkles, Plus } from 'lucide-react-native';
import { useAuth } from '../../../context/auth-context';
import { useDuo } from '../../../context/duo-context';
import { Colors } from '../../../constants/theme';
import { Memory } from '../../../types';
import { EditorialPhotoGrid } from '../../../components/memory/editorial-photo-grid';
import { AudioPlayerWidget } from '../../../components/memory/audio-player-widget';
import { PhotoViewerModal } from '../../../components/shared/photo-viewer-modal';
import { BottomNavBar } from '../../../components/navigation/bottom-nav-bar';

export default function TimelineScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { duo } = useAuth();
  const { memories, onThisDayMemories, isRefreshing, refreshData } = useDuo();

  // Full-screen photo viewer state
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerImages, setViewerImages] = useState<{ uri: string; caption?: string | null }[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);

  const handleOpenPhoto = (
    mediaList: { uri: string; caption?: string | null }[],
    index: number
  ) => {
    setViewerImages(mediaList);
    setViewerIndex(index);
    setViewerVisible(true);
  };

  // Group memories by year
  const timelineData = useMemo(() => {
    type TimelineItem =
      | { type: 'year'; year: string; key: string }
      | { type: 'memory'; memory: Memory; key: string };

    const items: TimelineItem[] = [];
    let currentYear = '';

    memories.forEach((mem) => {
      const year = mem.memory_date.split('-')[0];
      if (year !== currentYear) {
        currentYear = year;
        items.push({ type: 'year', year, key: `year-${year}` });
      }
      items.push({ type: 'memory', memory: mem, key: `mem-${mem.id}` });
    });

    return items;
  }, [memories]);

  const formatDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }).toUpperCase();
    } catch {
      return dateStr.toUpperCase();
    }
  };

  // Editorial Header
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.appTitle}>BETWEEN US</Text>
      <Text style={styles.duoHeader}>{duo?.name || 'Kunal × Friend'}</Text>
      <Text style={styles.tagline}>some things are worth keeping.</Text>

      <View style={styles.headerDivider} />

      {/* On This Day Module if memories from past years exist */}
      {onThisDayMemories.length > 0 && (
        <View style={styles.onThisDayCard}>
          <View style={styles.otdHeaderRow}>
            <Sparkles size={13} color={Colors.accent} />
            <Text style={styles.otdOverline}>ON THIS DAY</Text>
          </View>

          {onThisDayMemories.map((otd) => (
            <Pressable
              key={otd.id}
              style={styles.otdItem}
              onPress={() => router.push(`/(app)/(timeline)/memory/${otd.id}` as any)}
            >
              <Text style={styles.otdYear}>{otd.memory_date.split('-')[0]}</Text>
              <Text style={styles.otdTitle}>{otd.title}</Text>
              {otd.media && otd.media.length > 0 && (
                <Image
                  source={{ uri: otd.media[0].storage_path }}
                  style={styles.otdImage}
                  resizeMode="cover"
                />
              )}
              <Text style={styles.otdStory} numberOfLines={2}>
                “{otd.story}”
              </Text>
            </Pressable>
          ))}
          <View style={styles.headerDivider} />
        </View>
      )}
    </View>
  );

  // Empty state
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No memories yet.</Text>
      <Text style={styles.emptySubtitle}>Start with something small.</Text>
      <Pressable
        style={styles.emptyAddButton}
        onPress={() => router.push('/(app)/(timeline)/memory/create' as any)}
        accessibilityRole="button"
      >
        <Plus size={16} color={Colors.text} />
        <Text style={styles.emptyAddText}>ADD MEMORY</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <FlatList
        data={timelineData}
        keyExtractor={(item) => item.key}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshData}
            tintColor={Colors.accent}
          />
        }
        renderItem={({ item }) => {
          if (item.type === 'year') {
            return (
              <View style={styles.yearRow}>
                <Text style={styles.yearText}>{item.year}</Text>
                <View style={styles.yearLine} />
              </View>
            );
          }

          const mem = item.memory;
          const formattedMedia = (mem.media || []).map((m) => ({
            uri: m.storage_path,
            caption: m.caption,
          }));

          return (
            <View style={styles.memoryContainer}>
              {/* Date */}
              <Text style={styles.memoryDate}>{formatDate(mem.memory_date)}</Text>

              {/* Title */}
              <Pressable
                onPress={() => router.push(`/(app)/(timeline)/memory/${mem.id}` as any)}
              >
                <Text style={styles.memoryTitle}>{mem.title}</Text>
              </Pressable>

              {/* Editorial Media Grid */}
              {formattedMedia.length > 0 && (
                <EditorialPhotoGrid
                  media={formattedMedia}
                  onPhotoPress={(index) => handleOpenPhoto(formattedMedia, index)}
                />
              )}

              {/* Story */}
              <Pressable
                onPress={() => router.push(`/(app)/(timeline)/memory/${mem.id}` as any)}
              >
                <Text style={styles.storyText}>{mem.story}</Text>
              </Pressable>

              {/* Audio Player if present */}
              {mem.audio_url && (
                <AudioPlayerWidget
                  audioUrl={mem.audio_url}
                  durationSeconds={mem.audio_duration_seconds}
                />
              )}

              {/* Song badge if present */}
              {mem.song_title && (
                <View style={styles.songRow}>
                  <Music size={12} color={Colors.accent} />
                  <Text style={styles.songText}>
                    {mem.song_title}
                    {mem.song_artist ? ` — ${mem.song_artist}` : ''}
                  </Text>
                </View>
              )}

              {/* Location Tag */}
              {mem.location_name && (
                <View style={styles.locationRow}>
                  <MapPin size={12} color={Colors.textMuted} />
                  <Text style={styles.locationText}>{mem.location_name}</Text>
                </View>
              )}

              <View style={styles.memoryDivider} />
            </View>
          );
        }}
      />

      {/* Full-Screen Photo Viewer Modal */}
      <PhotoViewerModal
        visible={viewerVisible}
        images={viewerImages}
        initialIndex={viewerIndex}
        onClose={() => setViewerVisible(false)}
      />

      {/* Bottom Tab Navigation */}
      <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingBottom: 40,
  },
  headerContainer: {
    paddingTop: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 10,
    letterSpacing: 4,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  duoHeader: {
    fontSize: 24,
    fontFamily: 'serif',
    letterSpacing: 1.5,
    color: Colors.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 13,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  headerDivider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
    gap: 12,
  },
  yearText: {
    fontSize: 16,
    fontFamily: 'serif',
    letterSpacing: 2,
    color: Colors.accent,
  },
  yearLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.borderSubtle,
  },
  memoryContainer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  memoryDate: {
    fontSize: 11,
    letterSpacing: 2,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 6,
    fontWeight: '500',
  },
  memoryTitle: {
    fontSize: 21,
    fontFamily: 'serif',
    letterSpacing: 0.8,
    color: Colors.text,
    lineHeight: 28,
    marginBottom: 8,
  },
  storyText: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.text,
    letterSpacing: 0.2,
    marginVertical: 6,
  },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  songText: {
    fontSize: 12,
    color: Colors.accent,
    letterSpacing: 0.5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  locationText: {
    fontSize: 12,
    color: Colors.textMuted,
    letterSpacing: 0.4,
  },
  memoryDivider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.borderSubtle,
    marginTop: 32,
    marginBottom: 12,
  },
  onThisDayCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginVertical: 12,
  },
  otdHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  otdOverline: {
    fontSize: 10,
    letterSpacing: 2,
    color: Colors.accent,
    fontWeight: '600',
  },
  otdItem: {
    gap: 6,
  },
  otdYear: {
    fontSize: 11,
    color: Colors.textSecondary,
    letterSpacing: 1.5,
  },
  otdTitle: {
    fontSize: 16,
    fontFamily: 'serif',
    color: Colors.text,
  },
  otdImage: {
    width: '100%',
    height: 160,
    marginVertical: 6,
  },
  otdStory: {
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
    color: Colors.textSecondary,
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'serif',
    color: Colors.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.surface,
  },
  emptyAddText: {
    color: Colors.text,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '600',
  },
});
