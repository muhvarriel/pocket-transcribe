import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Colors } from "../constants/Colors";
import {
  Mic,
  FileText,
  ArrowRight,
  Search,
  Folder,
  Shield,
  Lock,
} from "lucide-react-native";

const { width } = Dimensions.get("window");

interface OnboardingItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  slide: {
    width: width,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  visualContainer: {
    flex: 0.6,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: 40,
    position: "relative",
  },
  iconGroup: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
  },
  micIcon: {
    marginRight: 16,
  },
  arrowIcon: {
    marginRight: 16,
  },
  fileIcon: {},
  decorativeCircle: {
    position: "absolute",
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: Colors.primaryLight,
    opacity: 0.1,
    zIndex: 0,
  },
  textContainer: {
    flex: 0.4,
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 28,
    fontFamily: "Outfit_700Bold",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    fontFamily: "Outfit_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: "center",
  },
  paginationContainer: {
    flexDirection: "row",
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: "Outfit_600SemiBold",
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  loginContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    fontFamily: "Outfit_600SemiBold",
    color: Colors.primary,
  },
});

const ONBOARDING_DATA: OnboardingItem[] = [
  {
    id: "1",
    title: "Transcribe with Ease",
    description:
      "Capture every detail. PocketTranscribe uses advanced AI to convert your voice memos and meetings into clear, searchable text in seconds.",
    icon: (
      <View style={styles.iconGroup}>
        <Mic size={64} color={Colors.primary} style={styles.micIcon} />
        <ArrowRight
          size={32}
          color={Colors.primaryLight}
          style={styles.arrowIcon}
        />
        <FileText size={64} color={Colors.primary} style={styles.fileIcon} />
      </View>
    ),
  },
  {
    id: "2",
    title: "Organize & Search",
    description:
      "Keep your recordings organized and find exactly what you need with smart search capabilities across all your transcripts.",
    icon: (
      <View style={styles.iconGroup}>
        <Folder size={64} color={Colors.primary} style={styles.micIcon} />
        <ArrowRight
          size={32}
          color={Colors.primaryLight}
          style={styles.arrowIcon}
        />
        <Search size={64} color={Colors.primary} style={styles.fileIcon} />
      </View>
    ),
  },
  {
    id: "3",
    title: "Secure & Private",
    description:
      "Your data is encrypted and stored securely. You have full control over your transcripts and recordings.",
    icon: (
      <View style={styles.iconGroup}>
        <Lock size={64} color={Colors.primary} style={styles.micIcon} />
        <ArrowRight
          size={32}
          color={Colors.primaryLight}
          style={styles.arrowIcon}
        />
        <Shield size={64} color={Colors.primary} style={styles.fileIcon} />
      </View>
    ),
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const completeOnboarding = async () => {
    setLoading(true);
    try {
      await SecureStore.setItemAsync("hasSeenOnboarding", "true");
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Failed to save onboarding status:", error);
      router.replace("/(auth)/login");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    } else {
      completeOnboarding();
    }
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: any[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = ({ item }: { item: OnboardingItem }) => (
    <View style={styles.slide}>
      <View style={styles.visualContainer}>
        {item.icon}
        <View style={styles.decorativeCircle} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={ONBOARDING_DATA}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          scrollEventThrottle={32}
          bounces={false}
        />

        <View style={styles.bottomContainer}>
          {/* Pagination Dots */}
          <View style={styles.paginationContainer}>
            {ONBOARDING_DATA.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, currentIndex === index && styles.activeDot]}
              />
            ))}
          </View>

          {/* Actions */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleNext}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {currentIndex === ONBOARDING_DATA.length - 1
                ? "Get Started"
                : "Next"}
            </Text>
            <ArrowRight
              size={20}
              color={Colors.white}
              style={styles.buttonIcon}
            />
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={completeOnboarding}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
