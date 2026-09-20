import React, { useState } from 'react';
import {
  Modal,
  View,
  Image,
  StyleSheet,
  Pressable,
  Text,
  Dimensions,
  FlatList,
} from 'react-native';
import { X, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Colors } from '../../constants/theme';

interface PhotoViewerModalProps {
  visible: boolean;
  images: { uri: string; caption?: string | null }[];
  initialIndex?: number;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const PhotoViewerModal: React.FC<PhotoViewerModalProps> = ({
  visible,
  images,
  initialIndex = 0,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (!visible || images.length === 0) return null;

  const currentItem = images[currentIndex] || images[0];

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Top bar with counter and close */}
        <View style={styles.header}>
          <Text style={styles.counter}>
            {currentIndex + 1} of {images.length}
          </Text>
          <Pressable
            hitSlop={15}
            onPress={onClose}
            style={styles.closeButton}
            accessibilityLabel="Close photo viewer"
          >
            <X color={Colors.text} size={24} />
          </Pressable>
        </View>

        {/* Main image viewer */}
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: currentItem.uri }}
            style={styles.image}
            resizeMode="contain"
          />

          {images.length > 1 && currentIndex > 0 && (
            <Pressable style={[styles.navButton, styles.prevButton]} onPress={handlePrev}>
              <ChevronLeft color={Colors.text} size={28} />
            </Pressable>
          )}

          {images.length > 1 && currentIndex < images.length - 1 && (
            <Pressable style={[styles.navButton, styles.nextButton]} onPress={handleNext}>
              <ChevronRight color={Colors.text} size={28} />
            </Pressable>
          )}
        </View>

        {/* Caption at bottom */}
        {Boolean(currentItem.caption) && (
          <View style={styles.footer}>
            <Text style={styles.captionText}>{currentItem.caption}</Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: 24,
    zIndex: 10,
  },
  counter: {
    color: Colors.textSecondary,
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  closeButton: {
    padding: 6,
  },
  imageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.72,
  },
  navButton: {
    position: 'absolute',
    top: '48%',
    padding: 12,
    backgroundColor: 'rgba(20, 20, 24, 0.65)',
    borderRadius: 999,
  },
  prevButton: {
    left: 16,
  },
  nextButton: {
    right: 16,
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 48,
  },
  captionText: {
    color: Colors.text,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
