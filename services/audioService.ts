import { supabase } from "../lib/supabase";
import { getApiUrl } from "../constants/Config";
import * as Notifications from "expo-notifications";

export const audioService = {
  /**
   * Uploads an audio file to Supabase storage.
   */
  uploadAudioToSupabase: async (
    uri: string,
    userId: string,
  ): Promise<string> => {
    const ext = uri.split(".").pop();
    const fileName = `${userId}/${Date.now()}.${ext}`;

    const formData = new FormData();
    // @ts-expect-error: React Native FormData extends the spec but lacks compatible TS types for file objects
    formData.append("file", {
      uri,
      name: fileName,
      type: `audio/${ext}`,
    });

    const { error } = await supabase.storage
      .from("recordings")
      .upload(fileName, formData, {
        contentType: `audio/${ext}`,
      });

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from("recordings").getPublicUrl(fileName);

    return publicUrl;
  },

  /**
   * Notifies the backend to process a recorded meeting.
   */
  notifyBackendToProcess: async (payload: {
    meetingId: string;
    audioUrl: string;
    pushToken: string;
    userId: string;
    duration: number;
  }) => {
    const backendUrl = `${getApiUrl()}/process-meeting`;

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        meeting_id: payload.meetingId,
        audio_url: payload.audioUrl,
        push_token: payload.pushToken,
        user_id: payload.userId,
        duration: payload.duration,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Backend Error: ${response.status} - ${errText}`);
    }

    return await response.json();
  },

  /**
   * Schedules a local notification (fallback for non-push environments).
   */
  scheduleFallbackNotification: async (meetingId: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Meeting Ready",
        body: "Your summary is ready! Tap to view the transcript.",
        data: { meeting_id: meetingId },
        sound: "default",
      },
      trigger: {
        seconds: 3,
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      },
    });
  },
};
