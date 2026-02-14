import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Colors } from "../../constants/Colors";

export default function TermsConditionsScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Terms & Conditions</Text>
        <Text style={styles.lastUpdated}>Last Updated: February 14, 2026</Text>

        <Text style={styles.paragraph}>
          Welcome to PocketTranscribe. By using our app, you agree to these
          terms.
        </Text>

        <Text style={styles.sectionTitle}>1. Use of Service</Text>
        <Text style={styles.paragraph}>
          PocketTranscribe provides AI-powered meeting transcription and
          summarization. You are responsible for ensuring that you have consent
          from all parties before recording any conversation.
        </Text>

        <Text style={styles.sectionTitle}>2. Audio Processing</Text>
        <Text style={styles.paragraph}>
          You acknowledge that your audio files are uploaded to our secure
          servers for processing. While we use advanced encryption, no method of
          transmission over the internet is 100% secure.
        </Text>

        <Text style={styles.sectionTitle}>3. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          PocketTranscribe is provided &quot;as is&quot; without warranties. We
          are not liable for any inaccuracies in AI-generated transcripts or
          summaries.
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
