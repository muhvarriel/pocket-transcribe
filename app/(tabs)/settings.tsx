import React from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import {
  ChevronRight,
  User,
  ExternalLink,
  Shield,
  FileText,
  HelpCircle,
  Info,
  Languages,
} from "lucide-react-native";
interface SettingsItemProps {
  label: string;
  value?: string;
  icon?: React.ReactNode;
  onPress: () => void;
  showArrow?: boolean;
  showExternalIcon?: boolean;
  isLast?: boolean;
  isDestructive?: boolean;
}

const SettingsItem = ({
  label,
  value,
  icon,
  onPress,
  showArrow = true,
  showExternalIcon = false,
  isLast = false,
  isDestructive = false,
}: SettingsItemProps) => (
  <TouchableOpacity
    style={[styles.item, isLast && styles.lastItem]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.itemLeft}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={[styles.itemLabel, isDestructive && { color: "#FF5252" }]}>
        {label}
      </Text>
    </View>
    <View style={styles.itemRight}>
      {value && <Text style={styles.itemValue}>{value}</Text>}
      {showArrow && <ChevronRight size={20} color={Colors.border} />}
      {showExternalIcon && <ExternalLink size={20} color={Colors.border} />}
    </View>
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const router = useRouter();
  const { session } = useAuth();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) Alert.alert("Error", error.message);
    } catch (e: unknown) {
      console.error("Sign out error:", e);
      Alert.alert(
        "Error",
        e instanceof Error ? e.message : "An error occurred",
      );
    }
  };

  const dummyAction = (label: string) => {
    // Dummy function for UI demonstration
    Alert.alert(
      "Feature Coming Soon",
      `${label} setting is not yet implemented.`,
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.profileSection}
            onPress={() => router.push("/profile/edit")}
            activeOpacity={0.7}
          >
            <View style={styles.avatarContainer}>
              {session?.user?.user_metadata?.avatar_url ? (
                <Image
                  source={{ uri: session.user.user_metadata.avatar_url }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatar}>
                  <User size={30} color={Colors.primary} />
                </View>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {session?.user?.user_metadata?.full_name || "User"}
              </Text>
              <Text style={styles.profileEmail}>
                {session?.user?.email || "user@example.com"}
              </Text>
            </View>
            <ChevronRight size={20} color={Colors.border} />
          </TouchableOpacity>
        </View>

        {/* Settings Groups */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <SettingsItem
            label="Language"
            value="English (US)"
            icon={
              <View style={[styles.iconBox, styles.iconBoxBlue]}>
                <Languages size={18} color={Colors.primary} />
              </View>
            }
            onPress={() => dummyAction("Language")}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & Legal</Text>
          <SettingsItem
            label="Privacy Policy"
            icon={
              <View style={[styles.iconBox, styles.iconBoxBlue]}>
                <Shield size={18} color={Colors.primary} />
              </View>
            }
            onPress={() => router.push("/settings/privacy")}
          />
          <SettingsItem
            label="Terms & Conditions"
            icon={
              <View style={[styles.iconBox, styles.iconBoxBlue]}>
                <FileText size={18} color={Colors.primary} />
              </View>
            }
            onPress={() => router.push("/settings/terms")}
          />
          <SettingsItem
            label="Help & Support"
            icon={
              <View style={[styles.iconBox, styles.iconBoxBlue]}>
                <HelpCircle size={18} color={Colors.primary} />
              </View>
            }
            onPress={() => router.push("/settings/support")}
          />
          <SettingsItem
            label="About"
            icon={
              <View style={[styles.iconBox, styles.iconBoxBlue]}>
                <Info size={18} color={Colors.primary} />
              </View>
            }
            onPress={() => router.push("/settings/about")}
            isLast={true}
          />
        </View>

        <View style={[styles.section, styles.logoutSection]}>
          <SettingsItem
            label="Sign Out"
            icon={
              <View style={[styles.iconBox, styles.iconBoxRed]}>
                <ExternalLink size={18} color="#FF5252" />
              </View>
            }
            onPress={handleSignOut}
            isDestructive={true}
            showArrow={false}
            isLast={true}
          />
        </View>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0 (Build 52)</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 34,
    fontFamily: "Outfit_700Bold",
    color: "#1A1C1E",
    marginBottom: 4,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F0F4F8",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontFamily: "Outfit_600SemiBold",
    color: "#1A1C1E",
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    color: "#74777F",
  },
  section: {
    marginBottom: 32,
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Outfit_700Bold",
    color: "#74777F",
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 12,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  itemLabel: {
    fontSize: 16,
    fontFamily: "Outfit_500Medium",
    color: "#1A1C1E",
  },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemValue: {
    fontSize: 15,
    fontFamily: "Outfit_400Regular",
    color: "#74777F",
    marginRight: 8,
  },
  versionContainer: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 40,
  },
  versionText: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    color: "#BDBDBD",
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  iconBoxBlue: {
    backgroundColor: "#E0F7FA",
  },
  iconBoxRed: {
    backgroundColor: "#FCE4EC",
  },
  logoutSection: {
    marginTop: 8,
  },
});
