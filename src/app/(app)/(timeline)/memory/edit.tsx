import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Image as ImageIcon, MapPin, Music, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDuo } from '../../../../context/duo-context';
import { Colors } from '../../../../constants/theme';
import { MemoryMedia } from '../../../../types';

export default function EditMemoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { memories, updateMemory } = useDuo();

  const memory = memories.find((m) => m.id === id);

  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [memoryDate, setMemoryDate] = useState('');
  const [locationName, setLocationName] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState('');

  const [existingMedia, setExistingMedia] = useState<MemoryMedia[]>([]);
  const [newPhotos, setNewPhotos] = useState<{ uri: string; caption?: string }[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (memory) {
      setTitle(memory.title);
      setStory(memory.story);
      setMemoryDate(memory.memory_date);
      setLocationName(memory.location_name || '');
      setSongTitle(memory.song_title || '');
      setSongArtist(memory.song_artist || '');
      setExistingMedia(memory.media || []);
    }
  }, [memory]);

  if (!memory) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: Colors.textSecondary }}>Memory not found</Text>
      </View>
    );
  }

  const handlePickNewPhotos = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant photos access.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets) {
        setNewPhotos((prev) => [...prev, ...result.assets.map((a) => ({ uri: a.uri }))]);
      }
    } catch (err) {
      console.warn('Error picking photos:', err);
    }
  };

  const handleRemoveExistingMedia = (idx: number) => {
    setExistingMedia((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleRemoveNewPhoto = (idx: number) => {
    setNewPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setErrorMessage('Please provide a title.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const res = await updateMemory(
      memory.id,
      {
        title: title.trim().toUpperCase(),
        story: story.trim(),
        memory_date: memoryDate,
        location_name: locationName.trim() || null,
        song_title: songTitle.trim() || null,
        song_artist: songArtist.trim() || null,
        media: existingMedia,
      },
      newPhotos
    );

    setIsSaving(false);

    if (res.success) {
      router.back();
    } else {
      setErrorMessage(res.error || 'Failed to update memory.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable hitSlop={12} onPress={() => router.back()} style={styles.closeButton}>
          <ArrowLeft color={Colors.text} size={22} />
        </Pressable>

        <Text style={styles.headerTitle}>EDIT MEMORY</Text>

        <Pressable
          onPress={handleSave}
          disabled={isSaving}
          style={[styles.saveButton, isSaving && { opacity: 0.5 }]}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={Colors.accent} />
          ) : (
            <Text style={styles.saveButtonText}>SAVE</Text>
          )}
        </Pressable>
      </View>

      {errorMessage && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
      >
        {/* Photos Preview & Add */}
        <View style={styles.photoSection}>
          <Text style={styles.fieldLabel}>PHOTOS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewScroll}>
            {existingMedia.map((m, idx) => (
              <View key={`exist-${m.id}`} style={styles.previewWrapper}>
                <Image source={{ uri: m.storage_path }} style={styles.previewImage} resizeMode="cover" />
                <Pressable
                  hitSlop={8}
                  style={styles.removePhotoBadge}
                  onPress={() => handleRemoveExistingMedia(idx)}
                >
                  <X size={14} color="#FFF" />
                </Pressable>
              </View>
            ))}

            {newPhotos.map((item, idx) => (
              <View key={`new-${idx}`} style={styles.previewWrapper}>
                <Image source={{ uri: item.uri }} style={styles.previewImage} resizeMode="cover" />
                <Pressable
                  hitSlop={8}
                  style={styles.removePhotoBadge}
                  onPress={() => handleRemoveNewPhoto(idx)}
                >
                  <X size={14} color="#FFF" />
                </Pressable>
              </View>
            ))}

            <Pressable style={styles.addMorePhotoBox} onPress={handlePickNewPhotos}>
              <ImageIcon size={20} color={Colors.textSecondary} />
              <Text style={styles.addMoreText}>+ Add</Text>
            </Pressable>
          </ScrollView>
        </View>

        {/* Title */}
        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>TITLE</Text>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Story */}
        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>STORY</Text>
          <TextInput
            style={styles.storyInput}
            multiline
            textAlignVertical="top"
            value={story}
            onChangeText={setStory}
          />
        </View>

        {/* Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>DATE (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.singleLineInput}
            value={memoryDate}
            onChangeText={setMemoryDate}
          />
        </View>

        {/* Location */}
        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>LOCATION</Text>
          <View style={styles.inputWithIcon}>
            <MapPin size={16} color={Colors.textMuted} />
            <TextInput
              style={styles.inlineInput}
              value={locationName}
              onChangeText={setLocationName}
            />
          </View>
        </View>

        {/* Song */}
        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>SONG</Text>
          <View style={styles.inputWithIcon}>
            <Music size={16} color={Colors.textMuted} />
            <TextInput
              style={styles.inlineInput}
              placeholder="Track name"
              placeholderTextColor={Colors.textMuted}
              value={songTitle}
              onChangeText={setSongTitle}
            />
          </View>
          <TextInput
            style={[styles.singleLineInput, { marginTop: 8 }]}
            placeholder="Artist name"
            placeholderTextColor={Colors.textMuted}
            value={songArtist}
            onChangeText={setSongArtist}
          />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 12,
    letterSpacing: 2,
    color: Colors.text,
    fontWeight: '600',
  },
  saveButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  saveButtonText: {
    fontSize: 12,
    letterSpacing: 1.5,
    color: Colors.accent,
    fontWeight: '600',
  },
  errorBox: {
    margin: 16,
    backgroundColor: Colors.dangerSubtle,
    borderWidth: 1,
    borderColor: 'rgba(189, 83, 83, 0.4)',
    padding: 12,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 13,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 24,
  },
  photoSection: {
    gap: 8,
  },
  previewScroll: {
    flexDirection: 'row',
  },
  previewWrapper: {
    width: 100,
    height: 120,
    marginRight: 10,
    position: 'relative',
    backgroundColor: Colors.surface,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removePhotoBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 999,
    padding: 4,
  },
  addMorePhotoBox: {
    width: 80,
    height: 120,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.borderStrong,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  addMoreText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  inputGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 10,
    letterSpacing: 1.5,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  titleInput: {
    fontSize: 18,
    fontFamily: 'serif',
    color: Colors.text,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 8,
  },
  storyInput: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.text,
    minHeight: 120,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    padding: 12,
  },
  singleLineInput: {
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    height: 44,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  inlineInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
  },
});
