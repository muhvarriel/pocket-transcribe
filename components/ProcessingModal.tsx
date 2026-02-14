import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Colors } from "../constants/Colors";
import {
  CheckCircle,
  AlertTriangle,
  UploadCloud,
  X,
} from "lucide-react-native";

export type ProcessingState =
  | "idle"
  | "uploading"
  | "processing"
  | "success"
  | "error";

interface ProcessingModalProps {
  visible: boolean;
  state: ProcessingState;
  message?: string;
  onClose: () => void;
}

export function ProcessingModal({
  visible,
  state,
  message,
  onClose,
}: ProcessingModalProps) {
  if (state === "idle") return null;

  const renderContent = () => {
    switch (state) {
      case "uploading":
        return (
          <>
            <View
              style={[styles.iconContainer, { backgroundColor: "#E3F2FD" }]}
            >
              <UploadCloud size={48} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Uploading Recording...</Text>
            <Text style={styles.message}>
              Please wait while we secure your audio.
            </Text>
            <ActivityIndicator
              size="large"
              color={Colors.primary}
              style={{ marginTop: 24 }}
            />
          </>
        );
      case "processing":
        return (
          <>
            <View
              style={[styles.iconContainer, { backgroundColor: "#FFF3E0" }]}
            >
              <ActivityIndicator size={48} color="#FF9800" />
            </View>
            <Text style={styles.title}>Processing Meeting</Text>
            <Text style={styles.message}>
              Generating transcript and summary...
            </Text>
          </>
        );
      case "success":
        return (
          <>
            <View
              style={[styles.iconContainer, { backgroundColor: "#E8F5E9" }]}
            >
              <CheckCircle size={48} color="#4CAF50" />
            </View>
            <Text style={styles.title}>Success!</Text>
            <Text style={styles.message}>
              {message || "Meeting uploaded and processing started."}
            </Text>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Done</Text>
            </TouchableOpacity>
          </>
        );
      case "error":
        return (
          <>
            <View
              style={[styles.iconContainer, { backgroundColor: "#FFEBEE" }]}
            >
              <AlertTriangle size={48} color="#F44336" />
            </View>
            <Text style={styles.title}>Error</Text>
            <Text style={styles.message}>
              {message || "Something went wrong."}
            </Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#F44336" }]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {state !== "uploading" && state !== "processing" && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#9E9E9E" />
            </TouchableOpacity>
          )}
          {renderContent()}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContainer: {
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: "Outfit_700Bold",
    color: "#1A1C1E",
    marginBottom: 6,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    fontFamily: "Outfit_400Regular",
    color: "#757575",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "Outfit_600SemiBold",
  },
});
