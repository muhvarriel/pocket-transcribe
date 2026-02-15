import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  useAudioRecorder as useExpoAudioRecorder,
  useAudioRecorderState,
  setAudioModeAsync,
  requestRecordingPermissionsAsync,
  RecordingPresets,
} from "expo-audio";
import * as Notifications from "expo-notifications";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { ProcessingState } from "../components/ProcessingModal";
import { audioService } from "../services/audioService";

export function useAudioRecorder() {
  const { user } = useAuth();
  const { expoPushToken } = useNotification();

  // Correctly use the hook with options
  const recorder = useExpoAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);

  const [processingState, setProcessingState] =
    useState<ProcessingState>("idle");
  const [processingMessage, setProcessingMessage] = useState<string>("");

  const recordingNotificationId = useRef<string | null>(null);
  const isMounted = useRef(true);

  const resetProcessingState = useCallback(() => {
    setProcessingState("idle");
    setProcessingMessage("");
  }, []);

  useEffect(() => {
    isMounted.current = true;

    // Request permissions on mount
    (async () => {
      const status = await requestRecordingPermissionsAsync();
      if (!status.granted && isMounted.current) {
        alert("Permission to access microphone is required!");
      }
    })();

    // Configure audio mode for background recording
    (async () => {
      try {
        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionMode: "doNotMix",
          shouldRouteThroughEarpiece: false,
          allowsBackgroundRecording: true,
        });
      } catch (error) {
        console.error("Failed to set audio mode", error);
      }
    })();

    return () => {
      isMounted.current = false;
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      if (recorder.isRecording) {
        console.warn("Already recording");
        return;
      }

      // Ensure recording is allowed
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        shouldPlayInBackground: true,
      });

      // Prepare and record
      await recorder.prepareToRecordAsync(RecordingPresets.HIGH_QUALITY);
      recorder.record();

      // Show persistent notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Recording in Progress",
          body: "Tap to return to the app.",
          sticky: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          autoDismiss: false,
          sound: false,
        },
        trigger: null,
      });
      recordingNotificationId.current = notificationId;

      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }, [recorder]);

  const pauseRecording = useCallback(async () => {
    try {
      recorder.pause();
    } catch (error) {
      console.error("Failed to pause recording", error);
    }
  }, [recorder]);

  const resumeRecording = useCallback(async () => {
    try {
      recorder.record();
    } catch (error) {
      console.error("Failed to resume recording", error);
    }
  }, [recorder]);

  const cancelRecording = useCallback(async () => {
    try {
      await recorder.stop();
      if (recordingNotificationId.current) {
        await Notifications.dismissNotificationAsync(
          recordingNotificationId.current,
        );
        recordingNotificationId.current = null;
      }
    } catch (error) {
      console.error("Failed to cancel recording", error);
    }
  }, [recorder]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    try {
      await recorder.stop();
      const uri = recorder.uri;

      // Cancel notification
      if (recordingNotificationId.current) {
        await Notifications.dismissNotificationAsync(
          recordingNotificationId.current,
        );
        recordingNotificationId.current = null;
      }

      console.log("Recording stopped and stored at", uri);
      return uri;
    } catch (error) {
      console.error("Failed to stop recording", error);
      return null;
    }
  }, [recorder]);

  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }, []);

  const processRecording = useCallback(
    async (uri: string, durationInSeconds: number) => {
      try {
        if (!user) {
          if (isMounted.current) {
            setProcessingState("error");
            setProcessingMessage("Please log in to update recordings.");
          }
          return;
        }

        if (isMounted.current) {
          setProcessingState("uploading");
          setProcessingMessage("");
        }

        console.log("Uploading audio...");
        if (!uri) {
          if (isMounted.current) {
            setProcessingState("error");
            setProcessingMessage("No recording found.");
          }
          return;
        }

        let audioUrl;
        try {
          audioUrl = await audioService.uploadAudioToSupabase(uri, user.id);
        } catch (uploadError: unknown) {
          console.error("Upload Failed", uploadError);
          if (isMounted.current) {
            setProcessingState("error");
            setProcessingMessage(
              `Upload Failed: ${uploadError instanceof Error ? uploadError.message : "Unknown error"}`,
            );
          }
          return;
        }

        console.log("Triggering backend processing...");
        const meetingId =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);

        const data = await audioService.notifyBackendToProcess({
          meetingId,
          audioUrl,
          pushToken: expoPushToken || "NO_TOKEN",
          userId: user.id,
          duration: Math.round(durationInSeconds),
        });

        console.log("Backend Response:", data);

        // --- SIMULATED NOTIFICATION FOR DEMO (Free Dev Account) ---
        const hasRealPushSetup =
          expoPushToken &&
          expoPushToken.startsWith("ExponentPushToken[") &&
          expoPushToken !== "ExponentPushToken[MOCK_SIMULATOR_TOKEN]";

        if (!hasRealPushSetup) {
          await audioService.scheduleFallbackNotification(
            data.meeting_id || meetingId,
          );
        }
        // ----------------------------------------------------------

        if (isMounted.current) {
          setProcessingState("success");
          setProcessingMessage("Processing started in background.");
        }
      } catch (e: unknown) {
        console.error("Processing failed", e);
        if (isMounted.current) {
          setProcessingState("error");

          let userMessage = "Something went wrong during processing.";
          if (e instanceof Error) {
            if (
              e.message.includes("Network request failed") ||
              e.message.includes("Load failed")
            ) {
              userMessage =
                "Network error: Please check your internet connection.";
            } else {
              userMessage = e.message;
            }
          }
          setProcessingMessage(userMessage);
        }
      }
    },
    [user, expoPushToken],
  );

  const duration = useMemo(
    () => recorderState.durationMillis / 1000,
    [recorderState.durationMillis],
  );

  return {
    isRecording: recorderState.isRecording,
    isPaused: !recorderState.isRecording && recorderState.durationMillis > 0,
    duration,
    recordingUri: recorder.uri,
    processingState,
    processingMessage,
    resetProcessingState,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
    formatDuration,
    processRecording,
  };
}
