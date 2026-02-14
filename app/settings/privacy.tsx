import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Colors } from "../../constants/Colors";

export default function PrivacyPolicyScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.lastUpdated}>Last Updated: February 14, 2026</Text>

        <Text style={styles.paragraph}>
          At PocketTranscribe, we take your privacy seriously. This policy
          describes how we collect, use, and handle your data when you use
          nuestro app.
        </Text>

        <Text style={styles.sectionTitle}>1. Data Collection</Text>
        <Text style={styles.paragraph}>
          We collect audio recordings you provide for transcription, as well as
          transcriptions and summaries generated from those recordings.
        </Text>

        <Text style={styles.sectionTitle}>2. Security</Text>
        <Text style={styles.paragraph}>
          Your recordings and transcripts are stored securely using Supabase
          with Row Level Security (RLS) policies, ensuring only you can access
          your data.
        </Text>

        <Text style={styles.sectionTitle}>3. Background Recording</Text>
        <Text style={styles.paragraph}>
          Our app requests microphone and background audio permissions to ensure
          your meetings continue to be recorded even if you put your phone in
          your pocket or background the app.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: "Outfit_700Bold",
    color: Colors.text,
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Outfit_600SemiBold",
    color: Colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    fontFamily: "Outfit_400Regular",
    color: "#37474F",
    lineHeight: 24,
  },
});
