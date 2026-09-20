import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Play, Square } from 'lucide-react-native';
import { Colors } from '../../constants/theme';
import { playAudio, stopAudio } from '../../lib/audio';

interface AudioPlayerWidgetProps {
  audioUrl: string;
  durationSeconds?: number | null;
}

export const AudioPlayerWidget: React.FC<AudioPlayerWidgetProps> = ({
  audioUrl,
  durationSeconds,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSeconds, setCurrentSeconds] = useState(0);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const togglePlayback = async () => {
    if (isPlaying) {
      await stopAudio();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      await playAudio(audioUrl, (status) => {
        setIsPlaying(status.isPlaying);
        setCurrentSeconds(status.positionSeconds);
        if (status.didJustFinish) {
          setIsPlaying(false);
          setCurrentSeconds(0);
        }
      });
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const total = durationSeconds || 30;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={togglePlayback}
        style={styles.playButton}
        accessibilityLabel={isPlaying ? 'Pause voice note' : 'Play voice note'}
      >
        {isPlaying ? (
          <Square size={14} color={Colors.accent} fill={Colors.accent} />
        ) : (
          <Play size={14} color={Colors.accent} fill={Colors.accent} />
        )}
      </Pressable>

      <View style={styles.trackArea}>
        <View style={styles.waveformRow}>
          {/* Subtle soundwave bars */}
          {[40, 70, 30, 90, 60, 45, 80, 50, 65, 35, 75, 40, 60, 90, 40].map((h, i) => (
            <View
              key={i}
              style={[
                styles.waveBar,
                { height: `${h}%` },
                isPlaying && i <= (currentSeconds / total) * 15 ? styles.waveBarActive : null,
              ]}
            />
          ))}
        </View>

        <View style={styles.timeRow}>
          <Text style={styles.timeText}>
            {isPlaying ? formatTime(currentSeconds) : 'Voice note'}
          </Text>
          <Text style={styles.timeText}>{durationSeconds ? formatTime(durationSeconds) : ''}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginVertical: 12,
    borderRadius: 2,
    gap: 12,
  },
  playButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  trackArea: {
    flex: 1,
  },
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 18,
    gap: 3,
    marginBottom: 4,
  },
  waveBar: {
    width: 3,
    backgroundColor: Colors.borderStrong,
    borderRadius: 1,
  },
  waveBarActive: {
    backgroundColor: Colors.accent,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 11,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
});
