import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react-native";
import { supabase } from "../../lib/supabase";
import { Colors } from "../../constants/Colors";
import { PrimaryButton } from "../../components/PrimaryButton";

import { useRouter } from "expo-router";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    try {
      if (isSignUp) {
        // Validation
        if (!email || !password || !confirmPassword || !fullName) {
          Alert.alert("Validation Error", "Please fill in all fields.");
          setLoading(false);
          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          Alert.alert(
            "Validation Error",
            "Please enter a valid email address.",
          );
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          Alert.alert(
            "Validation Error",
            "Password must be at least 6 characters long.",
          );
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          Alert.alert("Validation Error", "Passwords do not match.");
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) Alert.alert("Sign Up Error", error.message);
        else Alert.alert("Success", "Check your email for confirmation!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) Alert.alert("Login Error", error.message);
      }
    } catch (e: unknown) {
      console.error("Auth error:", e);
      Alert.alert(
        "Error",
        e instanceof Error ? e.message : "An error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push("/(auth)/forgot-password");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* Logo Section */}
          <View style={styles.logoCircle}>
            <Image
              source={require("../../assets/icon.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.brandTitle}>PocketTranscribe</Text>
          <Text style={styles.subtitle}>
            {isSignUp
              ? "Join us to start recording."
              : "Log in to access your recordings."}
          </Text>

          <View style={styles.form}>
            {/* Full Name Input - Only for Sign Up */}
            {isSignUp && (
              <>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputContainer}>
                  <User
                    size={20}
                    color={Colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="John Doe"
                    placeholderTextColor={Colors.textSecondary + "80"}
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                  />
                </View>
              </>
            )}

            {/* Email Input */}
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

            {/* Password Input */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Lock
                size={20}
                color={Colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={Colors.textSecondary + "80"}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color={Colors.textSecondary} />
                ) : (
                  <Eye size={20} color={Colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>

            {/* Confirm Password - Only for Sign Up */}
            {isSignUp && (
              <>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputContainer}>
                  <Lock
                    size={20}
                    color={Colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm your password"
                    placeholderTextColor={Colors.textSecondary + "80"}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />
                </View>
              </>
            )}

            {/* Forgot Password */}
            {!isSignUp && (
              <TouchableOpacity
                onPress={handleForgotPassword}
                style={styles.forgotPassword}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            <PrimaryButton
              title={isSignUp ? "Sign Up" : "Log In"}
              onPress={handleAuth}
              isLoading={loading}
              style={styles.button}
            />

            {/* Switch Link */}
            <TouchableOpacity
              onPress={() => setIsSignUp(!isSignUp)}
              style={styles.switchContainer}
            >
              <Text style={styles.switchBaseText}>
                {isSignUp
                  ? "Already have an account? "
                  : "Don't have an account? "}
                <Text style={styles.switchActionText}>
                  {isSignUp ? "Log In" : "Sign Up"}
                </Text>
              </Text>
            </TouchableOpacity>
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
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0F4F8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  brandTitle: {
    fontSize: 32,
    fontFamily: "Outfit_700Bold",
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Outfit_400Regular",
    color: Colors.textSecondary,
    marginBottom: 40,
    textAlign: "center",
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
    marginBottom: 20,
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
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: Colors.primary,
    fontFamily: "Outfit_600SemiBold",
    fontSize: 14,
  },
  button: {
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  switchContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  switchBaseText: {
    fontFamily: "Outfit_400Regular",
    color: Colors.textSecondary,
    fontSize: 14,
  },
  switchActionText: {
    color: Colors.primary,
    fontFamily: "Outfit_600SemiBold",
  },
});
