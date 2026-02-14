import { Stack, useSegments, useRouter } from "expo-router";
import {
  useFonts,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from "@expo-google-fonts/outfit";
import * as SplashScreen from "expo-splash-screen";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState, useRef } from "react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import {
  NotificationProvider,
  useNotification,
} from "../context/NotificationContext";
import { Colors } from "../constants/Colors";
import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { session, loading } = useAuth();
  const { lastNotificationResponse } = useNotification();
  const segments = useSegments();
  const router = useRouter();
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const handledNotificationId = useRef<string | null>(null);

  useEffect(() => {
    if (
      lastNotificationResponse &&
      lastNotificationResponse.notification.request.content.data.meeting_id &&
      session
    ) {
      const notificationId = lastNotificationResponse.notification.request.identifier;
      if (handledNotificationId.current === notificationId) return;

      const meetingId =
        lastNotificationResponse.notification.request.content.data.meeting_id;

      handledNotificationId.current = notificationId;
      router.push(`/meeting/${meetingId}`);
    }
  }, [lastNotificationResponse, session, router]);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasSeen = await SecureStore.getItemAsync("hasSeenOnboarding");
        setIsFirstLaunch(hasSeen !== "true");
      } catch (e) {
        console.error(e);
        setIsFirstLaunch(false); // Default to not showing if error
      }
    };

    // Check if we need to re-verify (especially if we were in onboarding)
    if (isFirstLaunch !== false) {
      checkFirstLaunch();
    }
  }, [segments, isFirstLaunch]);

  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (loading || isFirstLaunch === null) return;

    const rootSegment = segments[0];
    const isAuthGroup = rootSegment === "(auth)";
    const isOnboarding = rootSegment === "onboarding";

    // Handle Reset Password specifically within Auth
    const isResetPassword =
      isAuthGroup && (segments as string[])[1] === "reset-password";

    if (session) {
      // If logged in, don't allow accessing auth pages (except reset password) or onboarding
      if ((isAuthGroup && !isResetPassword) || isOnboarding) {
        router.replace("/(tabs)");
      }
    } else {
      // If not logged in
      if (isFirstLaunch) {
        // Force onboarding for first time users
        if (!isOnboarding) {
          router.replace("/onboarding");
        }
      } else {
        // Redirect to login if not in auth group
        if (!isAuthGroup) {
          router.replace("/(auth)/login");
        }
      }
    }
  }, [session, loading, isFirstLaunch, segments, router]);

  if (!fontsLoaded || loading) {
    return null; // Or a splash/loading view
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#FFFFFF" },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen
        name="meeting/[id]"
        options={{
          presentation: "card",
          headerShown: true,
          headerTitle: "Meeting Details",
          headerBackTitle: "Back",
          headerTintColor: Colors.primary,
          headerTitleStyle: {
            fontFamily: "Outfit_600SemiBold",
            color: "#1A1C1E",
          },
        }}
      />
      <Stack.Screen
        name="profile/edit"
        options={{
          presentation: "card",
          headerShown: true,
          headerTitle: "Edit Profile",
          headerBackTitle: "Back",
          headerTintColor: Colors.primary,
          headerTitleStyle: {
            fontFamily: "Outfit_600SemiBold",
            color: "#1A1C1E",
          },
        }}
      />
      <Stack.Screen
        name="settings/privacy"
        options={{
          presentation: "card",
          headerShown: true,
          headerTitle: "Privacy Policy",
          headerBackTitle: "Back",
          headerTintColor: Colors.primary,
          headerTitleStyle: {
            fontFamily: "Outfit_600SemiBold",
            color: "#1A1C1E",
          },
        }}
      />
      <Stack.Screen
        name="settings/terms"
        options={{
          presentation: "card",
          headerShown: true,
          headerTitle: "Terms & Conditions",
          headerBackTitle: "Back",
          headerTintColor: Colors.primary,
          headerTitleStyle: {
            fontFamily: "Outfit_600SemiBold",
            color: "#1A1C1E",
          },
        }}
      />
      <Stack.Screen
        name="settings/support"
        options={{
          presentation: "card",
          headerShown: true,
          headerTitle: "Help & Support",
          headerBackTitle: "Back",
          headerTintColor: Colors.primary,
          headerTitleStyle: {
            fontFamily: "Outfit_600SemiBold",
            color: "#1A1C1E",
          },
        }}
      />
      <Stack.Screen
        name="settings/about"
        options={{
          presentation: "card",
          headerShown: true,
          headerTitle: "About",
          headerBackTitle: "Back",
          headerTintColor: Colors.primary,
          headerTitleStyle: {
            fontFamily: "Outfit_600SemiBold",
            color: "#1A1C1E",
          },
        }}
      />
    </Stack>
  );
}

export default function Layout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NotificationProvider>
          <RootLayoutNav />
        </NotificationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
