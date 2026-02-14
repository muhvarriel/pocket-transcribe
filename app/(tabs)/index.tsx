import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAudioRecorder } from "../../hooks/useAudioRecorder";
import { Colors } from "../../constants/Colors";
import { Waveform } from "../../components/Waveform";
import { Mic, Play, Pause, Upload, X } from "lucide-react-native";
import { ProcessingModal } from "../../components/ProcessingModal";

export default function RecordScreen() {
  const {
    isRecording,
    isPaused,
    duration,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
    formatDuration,
    processRecording,
    processingState,
    processingMessage,
    resetProcessingState,
  } = useAudioRecorder();

  const handleStopAndUpload = async () => {
    const finalDuration = duration;
    const uri = await stopRecording();
    if (uri) {
      processRecording(uri, finalDuration);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {isRecording && (
          <View style={styles.recordingChip}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>RECORDING</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.meetingTitle}>
            Ready to capture{"\n"}your meeting
          </Text>
          <Text style={styles.meetingSubtitle}>
            AI is ready to listen and summarize
          </Text>
          <View style={styles.qualityBadge}>
            <Mic size={12} color={Colors.primary} style={styles.micIcon} />
            <Text style={styles.qualityText}>High Quality</Text>
          </View>
        </View>

        <View style={styles.timerContainer}>
          <Text style={styles.timer}>{formatDuration(duration)}</Text>
        </View>

        <View style={styles.visualizerContainer}>
          <Waveform isRecording={isRecording} isPaused={isPaused} />
        </View>

        <Text style={styles.statusText}>
          {isPaused
            ? "Recording paused"
            : isRecording
              ? "Listening for speech..."
              : "Ready to record"}
        </Text>

        <View
          style={[
            styles.controlsContainer,
            !isRecording && !isPaused && styles.centerContent,
          ]}
        >
          {isRecording || isPaused ? (
            <>
              {/* Left: Pause/Resume */}
              <View style={styles.controlGroup}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={isPaused ? resumeRecording : pauseRecording}
                >
                  {isPaused ? (
                    <Play size={24} color={Colors.text} fill={Colors.text} />
                  ) : (
                    <Pause size={24} color={Colors.text} fill={Colors.text} />
                  )}
                </TouchableOpacity>
                <Text style={styles.controlLabel}>
                  {isPaused ? "Resume" : "Pause"}
                </Text>
              </View>

              {/* Center: Stop/Upload */}
              <View style={styles.controlGroup}>
                <TouchableOpacity
                  style={styles.mainButton}
                  onPress={handleStopAndUpload}
                >
                  <View style={styles.innerStopButton}>
                    <Upload size={32} color={Colors.white} />
                  </View>
                </TouchableOpacity>
                <Text style={styles.controlLabel}>Upload</Text>
              </View>

              {/* Right: Cancel */}
              <View style={styles.controlGroup}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={cancelRecording}
                >
                  <X size={24} color={Colors.error || "#FF5252"} />
                </TouchableOpacity>
                <Text style={styles.controlLabel}>Cancel</Text>
              </View>
            </>
          ) : (
            /* Idle State: Start Button Only */
            <View style={styles.controlGroup}>
              <TouchableOpacity
                style={[styles.mainButton, styles.startButton]}
                onPress={startRecording}
              >
                <View style={styles.innerStopButton}>
                  <Mic size={40} color={Colors.white} />
                </View>
              </TouchableOpacity>
              <Text style={styles.swipeLabel}>Tap to Start</Text>
            </View>
          )}
        </View>
        <ProcessingModal
          visible={processingState !== "idle"}
          state={processingState}
          message={processingMessage}
          onClose={resetProcessingState}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    height: 60,
  },
  recordingChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFE5E5",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF5252",
    marginRight: 8,
  },
  recordingText: {
    color: "#FF5252",
    fontFamily: "Outfit_600SemiBold",
    fontSize: 12,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    marginTop: 8,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  meetingTitle: {
    fontSize: 32,
    fontFamily: "Outfit_700Bold",
    color: "#1A1C1E",
    marginBottom: 6,
    textAlign: "center",
  },
  meetingSubtitle: {
    fontSize: 16,
    fontFamily: "Outfit_500Medium",
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  qualityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0F7FA",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  qualityText: {
    color: Colors.primary,
    fontFamily: "Outfit_500Medium",
    fontSize: 14,
  },
  timerContainer: {
    marginBottom: 16,
  },
  timer: {
    fontSize: 48,
    fontFamily: "Outfit_700Bold",
    color: "#0F172A",
    fontVariant: ["tabular-nums"],
  },
  visualizerContainer: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
    fontFamily: "Outfit_400Regular",
    color: "#94A3B8",
    marginBottom: 16,
  },
  controlsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  controlGroup: {
    alignItems: "center",
    gap: 8,
  },
  secondaryButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  mainButton: {
    width: 150,
    height: 150,
    borderRadius: 64,
    backgroundColor: "#E0F7FA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: "#F1F5F9",
  },
  innerStopButton: {
    width: 120,
    height: 120,
    borderRadius: 48,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  controlLabel: {
    fontSize: 14,
    fontFamily: "Outfit_500Medium",
    color: Colors.textSecondary,
  },
  swipeLabel: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
    color: Colors.textSecondary,
    position: "absolute",
    bottom: -24,
    width: 200,
    textAlign: "center",
  },
  micIcon: {
    marginRight: 4,
  },
  centerContent: {
    justifyContent: "center",
  },
});
