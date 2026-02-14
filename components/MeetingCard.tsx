import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { Colors } from "../constants/Colors";
import {
  Calendar,
  Clock,
  MoreHorizontal,
  Check,
  Trash2,
} from "lucide-react-native";
import { Link } from "expo-router";
import { getApiUrl } from "../constants/Config";

interface MeetingCardProps {
  id: string;
  title: string | null;
  date: string;
  duration: string | number | null;
  status?: "processing" | "ready" | string;
  description?: string | null;
  progress?: number;
  onDelete?: () => void;
}

export function MeetingCard({
  id,
  title,
  date,
  duration,
  status = "ready",
  description,
  progress,
  onDelete,
}: MeetingCardProps) {
  const isProcessing = status === "processing";
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [menuPosition, setMenuPosition] = React.useState({ top: 0, right: 0 });
  const moreButtonRef = React.useRef<View>(null);

  const toggleMenu = () => {
    if (!menuVisible && moreButtonRef.current) {
      moreButtonRef.current.measure(
        (
          _x: number,
          _y: number,
          width: number,
          height: number,
          _pageX: number,
          pageY: number,
        ) => {
          setMenuPosition({
            top: pageY + height + 8,
            right: 24, // Consistent padding from right
          });
          setMenuVisible(true);
        },
      );
    } else {
      setMenuVisible(false);
    }
  };

  const handleDeletePress = () => {
    setMenuVisible(false);
    // Give modal time to close before alert shows up on some iOS versions
    setTimeout(() => {
      Alert.alert(
        "Delete Meeting",
        "Are you sure you want to delete this meeting?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                const response = await fetch(`${getApiUrl()}/meetings/${id}`, {
                  method: "DELETE",
                });
                if (response.ok) {
                  onDelete?.();
                } else {
                  Alert.alert(
                    "Unable to Delete",
                    "Something went wrong. Please try again later.",
                  );
                }
              } catch (error) {
                console.error("Delete error:", error);
                Alert.alert(
                  "Connection Error",
                  "Please check your internet connection.",
                );
              }
            },
          },
        ],
        { cancelable: true },
      );
    }, 100);
  };

  return (
    <>
      <Link href={`/meeting/${id}`} asChild>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.7}
          accessibilityLabel={`Meeting: ${title || "Untitled"}, Date: ${date}`}
          accessibilityHint="Double tap to view meeting details"
        >
          <View style={styles.headerRow}>
            <View
              style={[
                styles.statusBadge,
                isProcessing ? styles.statusProcessing : styles.statusReady,
              ]}
            >
              {isProcessing ? (
                <View style={styles.dot} />
              ) : (
                <Check size={12} color="#00BCD4" style={{ marginRight: 4 }} />
              )}
              <Text
                style={[
                  styles.statusText,
                  isProcessing ? { color: "#FFA000" } : { color: "#00BCD4" },
                ]}
              >
                {isProcessing ? "Processing..." : "Transcript Ready"}
              </Text>
            </View>

            <TouchableOpacity
              ref={moreButtonRef}
              style={styles.moreButton}
              onPress={(e) => {
                e.stopPropagation();
                toggleMenu();
              }}
              accessibilityLabel="More options"
              accessibilityHint="Double tap to open menu."
            >
              <MoreHorizontal size={20} color={Colors.border} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={1}>
              {title || "Untitled Meeting"}
            </Text>

            {description && (
              <Text style={styles.description} numberOfLines={2}>
                {description}
              </Text>
            )}

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                {isProcessing ? (
                  <Clock size={14} color="#757575" style={styles.icon} />
                ) : (
                  <Calendar size={14} color="#757575" style={styles.icon} />
                )}
                <Text style={styles.metaText}>{date}</Text>
              </View>
              <View style={styles.metaItem}>
                <Clock
                  size={14}
                  color="#757575"
                  style={[styles.icon, { marginLeft: 16 }]}
                />
                <Text style={styles.metaText}>
                  {typeof duration === "number"
                    ? `${Math.floor(duration / 60)}m ${Math.floor(duration % 60)}s`
                    : duration || "--"}
                </Text>
              </View>
            </View>
          </View>

          {isProcessing && progress !== undefined && (
            <View style={styles.progressBackground}>
              <View
                style={[styles.progressBar, { width: `${progress * 100}%` }]}
              />
            </View>
          )}
        </TouchableOpacity>
      </Link>

      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={toggleMenu}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={toggleMenu}
        >
          <View
            style={[
              styles.dropdownMenu,
              { top: menuPosition.top, right: menuPosition.right },
            ]}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDeletePress}
              accessibilityLabel="Delete Meeting"
              accessibilityHint="Double tap to delete this meeting."
            >
              <Trash2 size={18} color="#FF5252" style={{ marginRight: 12 }} />
              <Text style={styles.menuItemText}>Delete Meeting</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 8,
  },
  statusProcessing: {
    backgroundColor: "#FFF8E1",
  },
  statusReady: {
    backgroundColor: "#E0F7FA",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFA000",
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Outfit_600SemiBold",
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  locationText: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
    color: "#757575",
  },
  moreButton: {
    marginLeft: "auto",
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: "Outfit_700Bold",
    color: "#1A1C1E",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    color: "#74777F",
    marginBottom: 12,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 6,
  },
  metaText: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    color: "#74777F",
  },
  progressBackground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "#FFF8E1",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FFD54F",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  dropdownMenu: {
    position: "absolute",
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingVertical: 8,
    width: 180,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 14,
    fontFamily: "Outfit_600SemiBold",
    color: "#FF5252",
  },
});
