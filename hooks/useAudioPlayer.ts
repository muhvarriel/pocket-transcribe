import { useEffect, useMemo, useCallback } from "react";
import {
  useAudioPlayer as useExpoAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync,
} from "expo-audio";

export function useAudioPlayer(audioUrl?: string) {
  const player = useExpoAudioPlayer(audioUrl || "");
  const status = useAudioPlayerStatus(player);

  // Derived state from status - Memoized for performance
  const isPlaying = useMemo(() => status.playing, [status.playing]);
  const isBuffering = useMemo(() => status.isBuffering, [status.isBuffering]);
  const position = useMemo(
    () => status.currentTime * 1000,
    [status.currentTime],
  ); // Convert to ms
  const duration = useMemo(() => status.duration * 1000, [status.duration]); // Convert to ms

  useEffect(() => {
    // Configure audio mode for playback
    setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      shouldRouteThroughEarpiece: false,
    }).catch((err) => console.error("Error setting audio mode:", err));
  }, []);

  const togglePlayback = useCallback(async () => {
    if (!player) return;

    try {
      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
    } catch (error) {
      console.error("Playback toggle failed:", error);
    }
  }, [player, isPlaying]);

  const seekAudio = useCallback(
    async (value: number) => {
      if (!player) return;
      try {
        // seekTo takes seconds
        player.seekTo(value / 1000);
      } catch (error) {
        console.error("Seek failed:", error);
      }
    },
    [player],
  );

  const formatTime = useCallback((millis: number) => {
    if (!millis || isNaN(millis)) return "00:00";
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }, []);

  return {
    isPlaying,
    position,
    duration,
    isBuffering,
    togglePlayback,
    seekAudio,
    formatTime,
  };
}
