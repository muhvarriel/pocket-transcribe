import Constants from "expo-constants";

export const getApiUrl = () => {
  let baseUrl = "";

  // 1. Prioritize Environment Variable
  if (process.env.EXPO_PUBLIC_API_URL) {
    baseUrl = process.env.EXPO_PUBLIC_API_URL;
  }
  // 2. Dynamic Fallback for Local Development
  else if (__DEV__) {
    const hostUri =
      Constants?.expoConfig?.hostUri || Constants?.manifest?.debuggerHost;
    if (hostUri) {
      const ip = hostUri.split(":")[0];
      baseUrl = `http://${ip}:8000`;
    } else {
      baseUrl = "http://localhost:8000";
    }
  }
  // 3. Last Resort Fallback
  else {
    baseUrl = "http://localhost:8000";
  }

  // Ensure no trailing slash before appending /api/v1
  return `${baseUrl.replace(/\/$/, "")}/api/v1`;
};
