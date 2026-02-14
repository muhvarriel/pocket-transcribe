import { useLocalSearchParams, useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { useEffect, useState } from "react";
import {
  Check,
  Play,
  Pause,
  Edit2,
  Trash2,
  FileText,
} from "lucide-react-native";
import { format, parseISO } from "date-fns";
import Slider from "@react-native-community/slider";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";
import { useMeetingDetails } from "../../hooks/useMeetings";

export default function MeetingDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { meeting, loading, fetchDetails, updateTitle, deleteMeeting } =
    useMeetingDetails(id as string);
  const {
    isPlaying,
    position,
    duration,
    isBuffering,
    togglePlayback,
    seekAudio,
    formatTime,
  } = useAudioPlayer(meeting?.audio_url || undefined);

  const [activeTab, setActiveTab] = useState<"summary" | "transcript">(
    "summary",
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");

  useEffect(() => {
    if (id) fetchDetails();
  }, [id, fetchDetails]);

  useEffect(() => {
    if (meeting) {
      setEditedTitle(meeting.title || "");
    }
  }, [meeting]);

  const handleDelete = async () => {
    Alert.alert(
      "Delete Meeting",
      "Are you sure you want to delete this meeting?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const success = await deleteMeeting();
            if (success) router.back();
            else Alert.alert("Error", "Failed to delete meeting");
          },
        },
      ],
    );
  };

  const handleSaveTitle = async () => {
    const success = await updateTitle(editedTitle);
    if (success) setIsEditing(false);
    else Alert.alert("Error", "Failed to update meeting title");
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!meeting) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>Meeting not found.</Text>
      </View>
    );
  }

  const renderHeader = () => (
    <View>
      <View style={styles.titleSection}>
        <View style={styles.titleRow}>
          <View style={styles.flex1}>
            {isEditing ? (
              <TextInput
                style={[
                  styles.title,
                  styles.titleInput,
                  styles.titleTextContainer,
                ]}
                value={editedTitle}
                onChangeText={setEditedTitle}
                autoFocus
                multiline
              />
            ) : (
              <Text style={[styles.title, styles.titleTextContainer]}>
                {meeting.title || "Untitled Meeting"}
              </Text>
            )}
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>
                {meeting.created_at
                  ? format(parseISO(meeting.created_at), "MMM d, yyyy • h:mm a")
                  : "Date Unknown"}
              </Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>
                {meeting.duration
                  ? `${Math.floor(Number(meeting.duration) / 60)} min`
                  : "-- min"}
              </Text>
            </View>
          </View>
          <View style={styles.titleActions}>
            {isEditing ? (
              <TouchableOpacity
                onPress={handleSaveTitle}
                style={styles.iconButton}
                accessibilityLabel="Save title"
              >
                <Check size={20} color={Colors.primary} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                style={styles.iconButton}
                accessibilityLabel="Edit title"
              >
                <Edit2 size={20} color={Colors.text} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleDelete}
              style={[styles.iconButton, styles.deleteButton]}
              accessibilityLabel="Delete meeting"
            >
              <Trash2 size={20} color={Colors.error || "#FF5252"} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Audio Player Card - Only show if audio exists */}
      {meeting.audio_url ? (
        <View style={styles.playerCard}>
          <View style={styles.playerRow}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={togglePlayback}
              disabled={isBuffering}
              accessibilityLabel={isPlaying ? "Pause" : "Play"}
            >
              {isBuffering ? (
                <ActivityIndicator color="#FFF" />
              ) : isPlaying ? (
                <Pause size={20} color="#FFF" fill="#FFF" />
              ) : (
                <Play
                  size={20}
                  color="#FFF"
                  fill="#FFF"
                  style={styles.playIcon}
                />
              )}
            </TouchableOpacity>

            <View style={styles.playerInfo}>
              <Text style={styles.playerStatus}>
                {isPlaying ? "PLAYING" : "PAUSED"}
              </Text>
              <Text style={styles.playerTime}>
                {formatTime(position)}{" "}
                <Text style={styles.totalTime}>
                  /{" "}
                  {formatTime(duration || Number(meeting.duration) * 1000 || 0)}
                </Text>
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={duration || Number(meeting.duration) * 1000 || 1}
                value={position}
                onSlidingComplete={seekAudio}
                minimumTrackTintColor="#00BCD4"
                maximumTrackTintColor="#E0E0E0"
                thumbTintColor="#00BCD4"
              />
            </View>
          </View>
        </View>
      ) : null}

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "summary" && styles.activeTab]}
          onPress={() => setActiveTab("summary")}
          accessibilityLabel="Switch to Summary tab"
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "summary" && styles.activeTabText,
            ]}
          >
            Summary
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "transcript" && styles.activeTab]}
          onPress={() => setActiveTab("transcript")}
          accessibilityLabel="Switch to Transcript tab"
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "transcript" && styles.activeTabText,
            ]}
          >
            Transcript
          </Text>
        </TouchableOpacity>
      </View>

      {/* Section Title for Summary */}
      {activeTab === "summary" && meeting.summary && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Summary</Text>
        </View>
      )}
    </View>
  );

  const getListData = () => {
    if (activeTab === "summary") {
      return meeting.summary ? [meeting.summary] : []; // Single item for summary
    }
    return meeting.transcript ? meeting.transcript.split("\n") : [];
  };

  const renderItem = ({ item }: { item: string }) => {
    if (activeTab === "summary") {
      return <Text style={styles.transcriptText}>{item}</Text>;
    }
    // Transcript lines
    if (!item.trim()) return <View style={{ height: 8 }} />; // Spacing for empty lines
    return (
      <Text style={[styles.transcriptText, { marginBottom: 8 }]}>{item}</Text>
    );
  };

  const EmptyComponent = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyStateIcon}>
        <FileText size={32} color={Colors.primary} />
      </View>
      <Text style={styles.emptyStateTitle}>
        {activeTab === "summary" ? "No summary yet" : "No transcript yet"}
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        {activeTab === "summary"
          ? "The summary for this meeting hasn't been generated or is unavailable."
          : "We're still processing the audio or no transcript could be generated."}
      </Text>
    </View>
  );

  return (
    <FlatList
      data={getListData()}
      renderItem={renderItem}
      keyExtractor={(_item: string, index: number) => index.toString()}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={EmptyComponent}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
  },
  content: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  titleSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  titleActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  title: {
    fontSize: 24,
    fontFamily: "Outfit_700Bold",
    color: "#1A1C1E",
    marginBottom: 2,
  },
  titleInput: {
    borderBottomWidth: 1,
    borderBottomColor: "#00BCD4",
    paddingVertical: 0,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    color: "#74777F",
  },
  metaDot: {
    marginHorizontal: 8,
    color: "#74777F",
  },
  playerCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#00BCD4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  playerInfo: {
    flex: 1,
  },
  playerStatus: {
    fontSize: 10,
    fontFamily: "Outfit_700Bold",
    color: "#00BCD4",
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  playerTime: {
    fontSize: 16,
    fontFamily: "Outfit_600SemiBold",
    color: "#1A1C1E",
  },
  totalTime: {
    color: "#9E9E9E",
    fontFamily: "Outfit_400Regular",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#E0E0E0",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    fontFamily: "Outfit_600SemiBold",
    color: "#757575",
  },
  activeTabText: {
    color: "#00BCD4",
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Outfit_700Bold",
    color: "#1A1C1E",
  },
  transcriptCard: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  transcriptText: {
    fontSize: 16,
    fontFamily: "Outfit_400Regular",
    color: "#37474F",
    lineHeight: 24,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyStateIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F0F4F8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontFamily: "Outfit_600SemiBold",
    color: "#1A1C1E",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateSubtitle: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    color: "#74777F",
    textAlign: "center",
    lineHeight: 20,
  },
  flex1: {
    flex: 1,
  },
  titleTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    marginLeft: 4,
  },
  playIcon: {
    marginLeft: 2,
  },
  slider: {
    width: "100%",
    height: 20,
    marginTop: 8,
  },
});
