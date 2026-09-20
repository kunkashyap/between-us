import { Platform } from 'react-native';

export interface RecordedAudio {
  uri: string;
  durationSeconds: number;
}

let activePlayer: any = null;
let activeRecorder: any = null;
let recordingStartTime = 0;

// Dynamically and safely load expo-audio to prevent native module crashes on web or unsupported runtimes
let ExpoAudio: any = null;
try {
  ExpoAudio = require('expo-audio');
} catch (err) {
  console.warn('expo-audio is not available on this platform/runtime:', err);
}

export async function requestMicrophonePermission(): Promise<boolean> {
  if (!ExpoAudio?.requestRecordingPermissionsAsync) {
    return true;
  }
  try {
    const res = await ExpoAudio.requestRecordingPermissionsAsync();
    return res.granted;
  } catch (err) {
    console.warn('Error requesting microphone permission:', err);
    return false;
  }
}

export async function startAudioRecording(): Promise<boolean> {
  try {
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) return false;

    if (ExpoAudio?.setAudioModeAsync) {
      await ExpoAudio.setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
    }

    if (ExpoAudio?.AudioModule?.AudioRecorder) {
      const options = ExpoAudio.RecordingPresets?.HIGH_QUALITY || {};
      activeRecorder = new ExpoAudio.AudioModule.AudioRecorder(options);
      await activeRecorder.prepareToRecordAsync?.();
      activeRecorder.record();
      recordingStartTime = Date.now();
      return true;
    }

    // Web / fallback simulation
    recordingStartTime = Date.now();
    activeRecorder = { isRecording: true, uri: 'demo_voice_note.m4a' };
    return true;
  } catch (err) {
    console.warn('Failed to start audio recording:', err);
    return false;
  }
}

export async function stopAudioRecording(): Promise<RecordedAudio | null> {
  if (!activeRecorder) return null;

  try {
    const durationSeconds = Math.max(1, Math.round((Date.now() - recordingStartTime) / 1000));
    let uri: string | null = null;

    if (activeRecorder.stop) {
      await activeRecorder.stop();
      uri = activeRecorder.uri;
    } else {
      uri = activeRecorder.uri || 'demo_voice_note.m4a';
    }

    activeRecorder = null;

    if (ExpoAudio?.setAudioModeAsync) {
      await ExpoAudio.setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });
    }

    return {
      uri: uri || 'demo_voice_note.m4a',
      durationSeconds,
    };
  } catch (err) {
    console.warn('Failed to stop audio recording:', err);
    activeRecorder = null;
    return null;
  }
}

export async function playAudio(
  uri: string,
  onPlaybackStatusUpdate?: (status: {
    isPlaying: boolean;
    positionSeconds: number;
    durationSeconds: number;
    didJustFinish: boolean;
  }) => void
): Promise<void> {
  try {
    await stopAudio();

    if (ExpoAudio?.createAudioPlayer) {
      const player = ExpoAudio.createAudioPlayer(uri);
      activePlayer = player;

      player.addListener?.('playbackStatusUpdate', (status: any) => {
        const isPlaying = Boolean(status?.playing);
        const positionSeconds = Math.round(status?.currentTime || 0);
        const durationSeconds = Math.round(status?.duration || 0);
        const didJustFinish = Boolean(status?.didJustFinish || (durationSeconds > 0 && positionSeconds >= durationSeconds));

        onPlaybackStatusUpdate?.({
          isPlaying,
          positionSeconds,
          durationSeconds,
          didJustFinish,
        });
      });

      player.play();
    } else {
      // Fallback timer simulation for previewing in environments without native audio
      let current = 0;
      onPlaybackStatusUpdate?.({
        isPlaying: true,
        positionSeconds: 0,
        durationSeconds: 15,
        didJustFinish: false,
      });

      const interval = setInterval(() => {
        current += 1;
        if (current >= 15) {
          clearInterval(interval);
          onPlaybackStatusUpdate?.({
            isPlaying: false,
            positionSeconds: 15,
            durationSeconds: 15,
            didJustFinish: true,
          });
        } else {
          onPlaybackStatusUpdate?.({
            isPlaying: true,
            positionSeconds: current,
            durationSeconds: 15,
            didJustFinish: false,
          });
        }
      }, 1000);

      activePlayer = {
        stop: () => clearInterval(interval),
        remove: () => clearInterval(interval),
      };
    }
  } catch (err) {
    console.warn('Failed to play audio:', err);
  }
}

export async function stopAudio(): Promise<void> {
  if (activePlayer) {
    try {
      activePlayer.pause?.();
      activePlayer.stop?.();
      activePlayer.remove?.();
    } catch {
      // ignore
    }
    activePlayer = null;
  }
}
