import Constants from "expo-constants";

export const getApiUrl = () => {
  // 1. Prioritize Environment Variable (for Prod/Stage or explicit overrides)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Dynamic Fallback for Local Development (Expo Go / Simulator)
  if (__DEV__) {
    const hostUri =
      Constants?.expoConfig?.hostUri || Constants?.manifest?.debuggerHost;
    if (hostUri) {
      const ip = hostUri.split(":")[0];
      return `http://${ip}:8000`;
    }
  }

  // 3. Last Resort Fallback (Localhost)
  return "http://localhost:8000";
};
