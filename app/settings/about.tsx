import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Colors } from "../../constants/Colors";

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require("../../assets/icon.png")} style={styles.logo} />
        <Text style={styles.appName}>PocketTranscribe</Text>
        <Text style={styles.version}>Version 1.0.0 (Build 52)</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          PocketTranscribe is designed for high-performance meeting recording
          and AI analysis. Our mission is to make meeting notes effortless and
          actionable.
        </Text>

        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Developed by</Text>
          <Text style={styles.infoValue}>AffinityLabs</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>AI Provider</Text>
          <Text style={styles.infoValue}>OpenAI Whisper & GPT</Text>
        </View>
      </View>

      <Text style={styles.copyright}>
        © 2026 AffinityLabs. All rights reserved.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  appName: {
    fontSize: 24,
    fontFamily: "Outfit_700Bold",
    color: Colors.text,
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontFamily: "Outfit_400Regular",
    color: "#37474F",
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 40,
  },
  infoSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  infoLabel: {
    fontSize: 16,
    fontFamily: "Outfit_400Regular",
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: "Outfit_600SemiBold",
    color: Colors.text,
  },
  copyright: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
});
