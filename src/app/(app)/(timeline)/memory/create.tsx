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
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  Camera,
  Image as ImageIcon,
  Mic,
  Square,
  MapPin,
  Music,
  X,
  Play,
  Trash2,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDuo } from '../../../../context/duo-context';
import { Colors } from '../../../../constants/theme';
import { requestCurrentLocation } from '../../../../lib/location';
import {
  startAudioRecording,
  stopAudioRecording,
  playAudio,
  stopAudio,
} from '../../../../lib/audio';
import {
  saveMemoryDraft,
  getMemoryDraft,
  clearMemoryDraft,
} from '../../../../lib/local-drafts';

export default function CreateMemoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ prefillTitle?: string; prefillStory?: string }>();
  const insets = useSafeAreaInsets();
  const { addMemory } = useDuo();

  // Form State
  const [title, setTitle] = useState(params.prefillTitle ? params.prefillTitle.toUpperCase() : '');
  const [story, setStory] = useState(params.prefillStory || '');
  const [memoryDate, setMemoryDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState('');

  // Media
  const [photos, setPhotos] = useState<{ uri: string; caption?: string }[]>([]);

  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Status
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatusText, setSaveStatusText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load draft on mount
  useEffect(() => {
    (async () => {
      const draft = await getMemoryDraft();
      if (draft && (draft.title || draft.story || draft.local_images?.length > 0)) {
        setTitle(draft.title || '');
        setStory(draft.story || '');
        if (draft.memory_date) setMemoryDate(draft.memory_date);
        if (draft.location_name) setLocationName(draft.location_name);
        if (draft.local_images) {
          setPhotos(draft.local_images.map((uri) => ({ uri })));
        }
        if (draft.local_audio) {
          setAudioUri(draft.local_audio);
          setAudioDuration(draft.audio_duration_seconds || 0);
        }
        if (draft.song_title) setSongTitle(draft.song_title);
        if (draft.song_artist) setSongArtist(draft.song_artist);
      }
    })();
  }, []);

  // Autosave draft
  useEffect(() => {
    if (title || story || photos.length > 0) {
      saveMemoryDraft({
        title,
        story,
        memory_date: memoryDate,
        location_name: locationName,
        latitude,
        longitude,
        local_images: photos.map((p) => p.uri),
        local_audio: audioUri,
        audio_duration_seconds: audioDuration,
        song_title: songTitle,
        song_artist: songArtist,
      });
    }
  }, [
    title,
    story,
    memoryDate,
    locationName,
    latitude,
    longitude,
    photos,
    audioUri,
    audioDuration,
    songTitle,
    songArtist,
  ]);

  // Image Picking - Gallery
  const handlePickPhotos = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please grant photo gallery access to select photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets) {
        const newSelected = result.assets.map((a) => ({ uri: a.uri }));
        setPhotos((prev) => [...prev, ...newSelected]);
      }
    } catch (err) {
      console.warn('Image picker error:', err);
    }
  };

  // Image Picking - Camera
  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please grant camera access to take a photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setPhotos((prev) => [...prev, { uri: result.assets[0].uri }]);
      }
    } catch (err) {
      console.warn('Camera error:', err);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Location Fetching
  const handleFetchLocation = async () => {
    setLocationName('Locating...');
    const res = await requestCurrentLocation();
    if (res) {
      setLocationName(res.name);
      setLatitude(res.latitude);
      setLongitude(res.longitude);
    } else {
      setLocationName('');
    }
  };

  // Voice Note Recording
  const handleToggleRecord = async () => {
    if (isRecording) {
      const audioResult = await stopAudioRecording();
      setIsRecording(false);
      if (audioResult) {
        setAudioUri(audioResult.uri);
        setAudioDuration(audioResult.durationSeconds);
      }
    } else {
      const started = await startAudioRecording();
      if (started) {
        setIsRecording(true);
      } else {
        Alert.alert('Microphone needed', 'Please grant microphone access to record voice notes.');
      }
    }
  };

  const handleTogglePlayAudio = async () => {
    if (!audioUri) return;

    if (isPlayingAudio) {
      await stopAudio();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      await playAudio(audioUri, (status) => {
        setIsPlayingAudio(status.isPlaying);
        if (status.didJustFinish) setIsPlayingAudio(false);
      });
    }
  };

  const handleDeleteAudio = async () => {
    await stopAudio();
    setIsPlayingAudio(false);
    setAudioUri(null);
    setAudioDuration(0);
  };

  // Save Memory
  const handleSave = async () => {
    if (!title.trim()) {
      setErrorMessage('Please give this memory a title.');
      return;
    }
    if (!story.trim()) {
      setErrorMessage('Please write a story or note for this memory.');
      return;
    }

    setIsSaving(true);
    setSaveStatusText(photos.length > 0 ? `Preparing ${photos.length} photo(s)...` : 'Saving memory...');
    setErrorMessage(null);

    const result = await addMemory(
      {
        title,
        story,
        memory_date: memoryDate,
        location_name: locationName.trim() || null,
        latitude,
        longitude,
        audio_url: audioUri,
        audio_duration_seconds: audioDuration,
        song_title: songTitle.trim() || null,
        song_artist: songArtist.trim() || null,
      },
      photos
    );

    setIsSaving(false);

    if (result.success) {
      await clearMemoryDraft();
      router.back();
    } else {
      setErrorMessage(result.error || 'Failed to save memory. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable
          hitSlop={12}
          onPress={() => router.back()}
          style={styles.closeButton}
          accessibilityLabel="Cancel"
        >
          <ArrowLeft color={Colors.text} size={22} />
        </Pressable>

        <Text style={styles.headerTitle}>ADD MEMORY</Text>

        <Pressable
          onPress={handleSave}
          disabled={isSaving}
          style={[styles.saveButton, isSaving && { opacity: 0.5 }]}
          accessibilityLabel="Save memory"
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={Colors.accent} />
          ) : (
            <Text style={styles.saveButtonText}>SAVE</Text>
          )}
        </Pressable>
      </View>

      {isSaving && (
        <View style={styles.savingBanner}>
          <Text style={styles.savingText}>{saveStatusText}</Text>
        </View>
      )}

      {errorMessage && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Photo Gallery Picker / Previews */}
        <View style={styles.photoSection}>
          {photos.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewScroll}>
              {photos.map((item, idx) => (
                <View key={idx} style={styles.previewWrapper}>
                  <Image source={{ uri: item.uri }} style={styles.previewImage} resizeMode="cover" />
                  <Pressable
                    hitSlop={8}
                    style={styles.removePhotoBadge}
                    onPress={() => handleRemovePhoto(idx)}
                    accessibilityLabel="Remove photo"
                  >
                    <X size={14} color="#FFF" />
                  </Pressable>
                </View>
              ))}

              <Pressable style={styles.addMorePhotoBox} onPress={handlePickPhotos}>
                <ImageIcon size={20} color={Colors.textSecondary} />
                <Text style={styles.addMoreText}>+ Add</Text>
              </Pressable>
            </ScrollView>
          ) : (
            <View style={styles.photoActionsRow}>
              <Pressable style={styles.mediaActionButton} onPress={handlePickPhotos}>
                <ImageIcon size={18} color={Colors.text} />
                <Text style={styles.mediaActionText}>CHOOSE PHOTOS</Text>
              </Pressable>

              <Pressable style={styles.mediaActionButton} onPress={handleTakePhoto}>
                <Camera size={18} color={Colors.text} />
                <Text style={styles.mediaActionText}>TAKE PHOTO</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Title Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>TITLE</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="THE DAY WE GOT LOST"
            placeholderTextColor={Colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Story Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>STORY</Text>
          <TextInput
            style={styles.storyInput}
            placeholder="Tell the story... what happened, how it felt, or why it matters."
            placeholderTextColor={Colors.textMuted}
            multiline
            textAlignVertical="top"
            value={story}
            onChangeText={setStory}
          />
        </View>

        {/* Date Selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>DATE (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.singleLineInput}
            value={memoryDate}
            onChangeText={setMemoryDate}
            placeholder="2026-09-17"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        {/* Location Section */}
        <View style={styles.inputGroup}>
          <View style={styles.labelWithAction}>
            <Text style={styles.fieldLabel}>LOCATION</Text>
            <Pressable onPress={handleFetchLocation} hitSlop={10}>
              <Text style={styles.actionLinkText}>Use Current GPS</Text>
            </Pressable>
          </View>
          <View style={styles.inputWithIcon}>
            <MapPin size={16} color={Colors.textMuted} />
            <TextInput
              style={styles.inlineInput}
              placeholder="e.g. Hauz Khas Village, Delhi"
              placeholderTextColor={Colors.textMuted}
              value={locationName}
              onChangeText={setLocationName}
            />
          </View>
        </View>

        {/* Voice Note Section */}
        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>VOICE NOTE</Text>

          {audioUri ? (
            <View style={styles.audioPreviewCard}>
              <Pressable style={styles.audioPlayButton} onPress={handleTogglePlayAudio}>
                {isPlayingAudio ? (
                  <Square size={14} color={Colors.accent} fill={Colors.accent} />
                ) : (
                  <Play size={14} color={Colors.accent} fill={Colors.accent} />
                )}
              </Pressable>
              <Text style={styles.audioDurationText}>
                Recorded note ({audioDuration}s)
              </Text>
              <Pressable
                hitSlop={10}
                style={styles.deleteAudioButton}
                onPress={handleDeleteAudio}
              >
                <Trash2 size={16} color={Colors.danger} />
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={[styles.recordButton, isRecording && styles.recordButtonActive]}
              onPress={handleToggleRecord}
            >
              {isRecording ? (
                <>
                  <Square size={16} color="#FFF" fill="#FFF" />
                  <Text style={styles.recordingActiveText}>STOP RECORDING</Text>
                </>
              ) : (
                <>
                  <Mic size={16} color={Colors.text} />
                  <Text style={styles.recordButtonText}>RECORD VOICE NOTE</Text>
                </>
              )}
            </Pressable>
          )}
        </View>

        {/* Optional Song Section */}
        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>SONG (OPTIONAL)</Text>
          <View style={styles.inputWithIcon}>
            <Music size={16} color={Colors.textMuted} />
            <TextInput
              style={styles.inlineInput}
              placeholder="Track name, e.g. Sparks"
              placeholderTextColor={Colors.textMuted}
              value={songTitle}
              onChangeText={setSongTitle}
            />
          </View>
          {Boolean(songTitle) && (
            <TextInput
              style={[styles.singleLineInput, { marginTop: 8 }]}
              placeholder="Artist, e.g. Coldplay"
              placeholderTextColor={Colors.textMuted}
              value={songArtist}
              onChangeText={setSongArtist}
            />
          )}
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
  savingBanner: {
    backgroundColor: Colors.surfaceElevated,
    paddingVertical: 8,
    alignItems: 'center',
  },
  savingText: {
    fontSize: 12,
    color: Colors.accent,
    letterSpacing: 0.5,
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
    marginVertical: 4,
  },
  photoActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  mediaActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mediaActionText: {
    fontSize: 11,
    letterSpacing: 1.5,
    color: Colors.text,
    fontWeight: '500',
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
  labelWithAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 10,
    letterSpacing: 1.5,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  actionLinkText: {
    fontSize: 11,
    color: Colors.accent,
    letterSpacing: 0.5,
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
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recordButtonActive: {
    backgroundColor: Colors.danger,
    borderColor: Colors.danger,
  },
  recordButtonText: {
    fontSize: 11,
    letterSpacing: 1.5,
    color: Colors.text,
    fontWeight: '500',
  },
  recordingActiveText: {
    fontSize: 11,
    letterSpacing: 1.5,
    color: '#FFF',
    fontWeight: '600',
  },
  audioPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 12,
  },
  audioPlayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioDurationText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
  },
  deleteAudioButton: {
    padding: 6,
  },
});
