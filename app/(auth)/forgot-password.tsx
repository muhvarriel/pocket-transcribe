import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mail, ArrowLeft } from "lucide-react-native";
import { supabase } from "../../lib/supabase";
import { Colors } from "../../constants/Colors";
import { PrimaryButton } from "../../components/PrimaryButton";
import { useRouter } from "expo-router";

import * as Linking from "expo-linking";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      // Inside component...

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: Linking.createURL("/(auth)/reset-password"),
      });
      if (error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert(
          "Success",
          "Check your email for the password reset link.",
          [{ text: "OK", onPress: () => router.back() }],
        );
      }
    } catch (e: unknown) {
      console.error("Reset password error:", e);
      Alert.alert(
        "Error",
        e instanceof Error ? e.message : "An error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>

          <Text style={styles.subtitle}>
            Enter the email associated with your account and we&apos;ll send an
            email with instructions to reset your password.
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <Mail
                size={20}
                color={Colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="name@example.com"
                placeholderTextColor={Colors.textSecondary + "80"}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <PrimaryButton
              title="Send Reset Link"
              onPress={handleResetPassword}
              isLoading={loading}
              style={styles.button}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontFamily: "Outfit_700Bold",
    color: Colors.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Outfit_400Regular",
    color: Colors.textSecondary,
    marginBottom: 32,
    lineHeight: 24,
  },
  form: {
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontFamily: "Outfit_500Medium",
    color: Colors.text,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Outfit_400Regular",
    color: Colors.text,
    height: "100%",
  },
  button: {
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
});
