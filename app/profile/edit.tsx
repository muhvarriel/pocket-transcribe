import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { User, Mail, Lock, Camera } from "lucide-react-native";
import { supabase } from "../../lib/supabase";
import { Colors } from "../../constants/Colors";
import { PrimaryButton } from "../../components/PrimaryButton";
import { useAuth } from "../../context/AuthContext";
import * as ImagePicker from "expo-image-picker";
import { getApiUrl } from "../../constants/Config";
import { getErrorMessage } from "../../utils/errorUtils";

export default function EditProfileScreen() {
  const router = useRouter();
  const { session } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      setFullName(session.user.user_metadata?.full_name || "");
      setEmail(session.user.email || "");
      setAvatarUrl(session.user.user_metadata?.avatar_url || null);

      // Also fetch from backend to match
      fetchProfile(session.user.id);
    }
  }, [session]);

  const fetchProfile = async (userId: string) => {
    try {
      const res = await fetch(`${getApiUrl()}/profile/${userId}`);
      const data = await res.json();
      if (data.avatar_url) setAvatarUrl(data.avatar_url);
    } catch (e: unknown) {
      console.error("Error fetching profile:", getErrorMessage(e));
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.4,
    });

    if (!result.canceled) {
      // Just save locally for preview
      setSelectedImage(result.assets[0].uri);
    }
  };

  const uploadImageToSupabase = async (uri: string): Promise<string> => {
    try {
      setUploading(true);
      if (!session?.user) throw new Error("No user on session!");

      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();

      const fileExt = uri.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${session.user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path);

      return publicUrl;
    } catch (error: unknown) {
      console.error("Upload Error:", error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      let finalAvatarUrl = avatarUrl;

      // 1. If we have a new selected image, upload it first
      if (selectedImage) {
        try {
          finalAvatarUrl = await uploadImageToSupabase(selectedImage);
        } catch (e: unknown) {
          const errorMessage = getErrorMessage(e);
          console.error("Upload failed:", errorMessage);
          throw new Error(`Profile picture upload failed: ${errorMessage}`);
        }
      }

      // 2. Update Supabase Auth (for session syncing)
      const updates: {
        data: { full_name: string; avatar_url: string | null };
        email?: string;
        password?: string;
      } = {
        data: { full_name: fullName, avatar_url: finalAvatarUrl },
      };

      if (email !== session?.user?.email) {
        updates.email = email;
      }
      if (password) {
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters long.");
        }
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        updates.password = password;
      }

      const { error: authError } = await supabase.auth.updateUser(updates);
      if (authError) throw authError;

      // 3. Update Backend Database (profiles table)
      if (session?.user?.id) {
        await fetch(`${getApiUrl()}/profile/${session.user.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: fullName,
            avatar_url: finalAvatarUrl,
          }),
        });
      }

      setAvatarUrl(finalAvatarUrl);
      setSelectedImage(null); // Clear local selection

      let message = "Profile updated successfully!";
      if (updates.email) {
        message += " Please check your new email for confirmation.";
      }

      Alert.alert("Success", message, [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: unknown) {
      console.error("Update Error:", error);
      Alert.alert("Error", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.content}>
          {/* Profile Picture Placeholder */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {selectedImage || avatarUrl ? (
                <Image
                  source={{ uri: (selectedImage || avatarUrl) as string }}
                  style={styles.avatarImage}
                />
              ) : (
                <User size={40} color={Colors.primary} />
              )}
            </View>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={pickImage}
              disabled={uploading}
            >
              {uploading ? (
                <View style={styles.loadingDot} />
              ) : (
                <Camera size={20} color={Colors.white} />
              )}
            </TouchableOpacity>
          </View>

          <View>
            {/* Full Name */}
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
              <User
                size={20}
                color={Colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="John Doe"
                placeholderTextColor={Colors.textSecondary + "80"}
              />
            </View>

            {/* Email */}
            <Text style={styles.label}>Email Address</Text>
            <View style={[styles.inputContainer, styles.inputDisabled]}>
              <Mail
                size={20}
                color={Colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={email}
                onChangeText={setEmail}
                placeholder="email@example.com"
                placeholderTextColor={Colors.textSecondary + "80"}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={false}
              />
            </View>

            {/* Password */}
            <Text style={styles.label}>New Password (Optional)</Text>
            <View style={styles.inputContainer}>
              <Lock
                size={20}
                color={Colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Leave blank to keep current"
                placeholderTextColor={Colors.textSecondary + "80"}
                secureTextEntry
              />
            </View>

            {/* Confirm Password */}
            {password ? (
              <>
                <Text style={styles.label}>Confirm New Password</Text>
                <View style={styles.inputContainer}>
                  <Lock
                    size={20}
                    color={Colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm new password"
                    placeholderTextColor={Colors.textSecondary + "80"}
                    secureTextEntry
                  />
                </View>
              </>
            ) : null}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            title="Save Changes"
            onPress={handleUpdate}
            isLoading={loading}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 32,
    position: "relative",
    alignSelf: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F0F4F8",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: Colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.white,
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
    height: 56,
    marginBottom: 16,
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
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  loadingDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.white,
  },
  inputDisabled: {
    backgroundColor: "#F5F5F5",
    color: "#9E9E9E",
  },
});
