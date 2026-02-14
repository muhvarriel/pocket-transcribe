import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { Mail } from "lucide-react-native";

export default function SupportScreen() {
  const handleEmail = () => {
    Linking.openURL("mailto:support@affinitylabs.com");
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Help & Support</Text>
        <Text style={styles.subtitle}>How can we help you today?</Text>

        <View style={styles.supportBoxes}>
          <TouchableOpacity
            style={styles.supportBox}
            onPress={handleEmail}
            activeOpacity={0.7}
          >
            <Mail size={24} color={Colors.primary} />
            <Text style={styles.supportBoxTitle}>Email Us</Text>
            <Text style={styles.supportBoxText}>support@affinitylabs.com</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>
            Can I record with my phone in my pocket?
          </Text>
          <Text style={styles.faqAnswer}>
            Yes! PocketTranscribe is designed for exactly that. The recording
            will continue reliably even if you background the app or lock your
            screen.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>
            How do I know when my notes are ready?
          </Text>
          <Text style={styles.faqAnswer}>
            Once you stop a recording, it&apos;s uploaded and processed by our
            AI. You&apos;ll receive a push notification the moment your
            transcript and summary are ready to view.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>Is my data secure?</Text>
          <Text style={styles.faqAnswer}>
            Absolutely. We use Supabase with Row Level Security (RLS) to ensure
            that your recordings and transcripts are private and accessible only
            by you.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>What AI models are used?</Text>
          <Text style={styles.faqAnswer}>
            We use OpenAI&apos;s Whisper for high-accuracy transcription and GPT
            models for generating concise summaries and actionable next steps.
          </Text>
        </View>
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Outfit_400Regular",
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  supportBoxes: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 32,
  },
  supportBox: {
    flex: 1,
    backgroundColor: "#F8F9FB",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  supportBoxTitle: {
    fontSize: 16,
    fontFamily: "Outfit_600SemiBold",
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  supportBoxText: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Outfit_700Bold",
    color: Colors.text,
    marginBottom: 16,
  },
  faqItem: {
    marginBottom: 20,
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  faqQuestion: {
    fontSize: 16,
    fontFamily: "Outfit_600SemiBold",
    color: Colors.text,
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    color: "#37474F",
    lineHeight: 20,
  },
});
