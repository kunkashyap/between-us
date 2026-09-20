import React from 'react';
import { View, Image, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Colors } from '../../constants/theme';
import { MemoryMedia } from '../../types';

interface EditorialPhotoGridProps {
  media: MemoryMedia[] | { uri: string; caption?: string | null }[];
  onPhotoPress?: (index: number) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTENT_WIDTH = SCREEN_WIDTH - 40; // Gutter 20 on each side

export const EditorialPhotoGrid: React.FC<EditorialPhotoGridProps> = ({
  media,
  onPhotoPress,
}) => {
  if (!media || media.length === 0) return null;

  const getUri = (item: any) => item.storage_path || item.uri;

  // Single Photo: Large editorial hero image
  if (media.length === 1) {
    return (
      <View style={styles.container}>
        <Pressable
          onPress={() => onPhotoPress?.(0)}
          style={styles.singleImageWrapper}
          accessibilityRole="imagebutton"
          accessibilityLabel="Open photo full screen"
        >
          <Image
            source={{ uri: getUri(media[0]) }}
            style={styles.singleImage}
            resizeMode="cover"
          />
        </Pressable>
      </View>
    );
  }

  // Two Photos: One large + one smaller
  if (media.length === 2) {
    return (
      <View style={styles.container}>
        <View style={styles.twoPhotosRow}>
          <Pressable
            onPress={() => onPhotoPress?.(0)}
            style={styles.twoPhotoLargeWrapper}
            accessibilityRole="imagebutton"
          >
            <Image
              source={{ uri: getUri(media[0]) }}
              style={styles.twoPhotoLarge}
              resizeMode="cover"
            />
          </Pressable>

          <Pressable
            onPress={() => onPhotoPress?.(1)}
            style={styles.twoPhotoSmallWrapper}
            accessibilityRole="imagebutton"
          >
            <Image
              source={{ uri: getUri(media[1]) }}
              style={styles.twoPhotoSmall}
              resizeMode="cover"
            />
          </Pressable>
        </View>
      </View>
    );
  }

  // Three Photos: One large + two smaller
  if (media.length === 3) {
    return (
      <View style={styles.container}>
        <View style={styles.threePhotosContainer}>
          <Pressable
            onPress={() => onPhotoPress?.(0)}
            style={styles.threePhotoLargeWrapper}
            accessibilityRole="imagebutton"
          >
            <Image
              source={{ uri: getUri(media[0]) }}
              style={styles.threePhotoLarge}
              resizeMode="cover"
            />
          </Pressable>

          <View style={styles.threePhotoSideColumn}>
            <Pressable
              onPress={() => onPhotoPress?.(1)}
              style={styles.threePhotoSubItem}
              accessibilityRole="imagebutton"
            >
              <Image
                source={{ uri: getUri(media[1]) }}
                style={styles.halfImage}
                resizeMode="cover"
              />
            </Pressable>
            <Pressable
              onPress={() => onPhotoPress?.(2)}
              style={styles.threePhotoSubItem}
              accessibilityRole="imagebutton"
            >
              <Image
                source={{ uri: getUri(media[2]) }}
                style={styles.halfImage}
                resizeMode="cover"
              />
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  // Multiple Photos: Editorial balanced gallery
  return (
    <View style={styles.container}>
      <View style={styles.galleryHeroRow}>
        <Pressable
          onPress={() => onPhotoPress?.(0)}
          style={styles.galleryHeroWrapper}
          accessibilityRole="imagebutton"
        >
          <Image
            source={{ uri: getUri(media[0]) }}
            style={styles.galleryHeroImage}
            resizeMode="cover"
          />
        </Pressable>
      </View>

      <View style={styles.galleryGridRow}>
        {media.slice(1, 5).map((item, idx) => (
          <Pressable
            key={idx}
            onPress={() => onPhotoPress?.(idx + 1)}
            style={styles.galleryGridItem}
            accessibilityRole="imagebutton"
          >
            <Image
              source={{ uri: getUri(item) }}
              style={styles.galleryThumb}
              resizeMode="cover"
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 14,
  },
  // Single Photo
  singleImageWrapper: {
    width: '100%',
    height: 380,
    backgroundColor: Colors.surface,
  },
  singleImage: {
    width: '100%',
    height: '100%',
  },

  // Two Photos
  twoPhotosRow: {
    flexDirection: 'row',
    width: '100%',
    height: 320,
    gap: 6,
  },
  twoPhotoLargeWrapper: {
    flex: 1.6,
    height: '100%',
    backgroundColor: Colors.surface,
  },
  twoPhotoLarge: {
    width: '100%',
    height: '100%',
  },
  twoPhotoSmallWrapper: {
    flex: 1,
    height: '100%',
    backgroundColor: Colors.surface,
  },
  twoPhotoSmall: {
    width: '100%',
    height: '100%',
  },

  // Three Photos
  threePhotosContainer: {
    flexDirection: 'row',
    width: '100%',
    height: 340,
    gap: 6,
  },
  threePhotoLargeWrapper: {
    flex: 1.4,
    height: '100%',
    backgroundColor: Colors.surface,
  },
  threePhotoLarge: {
    width: '100%',
    height: '100%',
  },
  threePhotoSideColumn: {
    flex: 1,
    height: '100%',
    gap: 6,
  },
  threePhotoSubItem: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  halfImage: {
    width: '100%',
    height: '100%',
  },

  // Multiple
  galleryHeroRow: {
    width: '100%',
    height: 280,
    marginBottom: 6,
    backgroundColor: Colors.surface,
  },
  galleryHeroWrapper: {
    width: '100%',
    height: '100%',
  },
  galleryHeroImage: {
    width: '100%',
    height: '100%',
  },
  galleryGridRow: {
    flexDirection: 'row',
    gap: 6,
    height: 100,
  },
  galleryGridItem: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  galleryThumb: {
    width: '100%',
    height: '100%',
  },
});
