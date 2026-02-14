import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Sharded SecureStore for Android (bypasses 2048-byte limit)
const SecureStoreSharded = {
  getItem: async (key: string): Promise<string | null> => {
    const manifestStr = await SecureStore.getItemAsync(key);
    if (!manifestStr) return null;
    try {
      const manifest = JSON.parse(manifestStr);
      if (manifest && manifest.sharded) {
        const shards = await Promise.all(
          manifest.keys.map((k: string) => SecureStore.getItemAsync(k)),
        );
        return shards.join("");
      }
    } catch {
      /* fallback to normal */
    }
    return manifestStr;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    const SHARD_SIZE = 2000; // Under 2048 byte limit
    if (value.length <= SHARD_SIZE) {
      return SecureStore.setItemAsync(key, value);
    }

    const shards: string[] = [];
    const shardKeys: string[] = [];
    for (let i = 0; i < value.length; i += SHARD_SIZE) {
      const shardKey = `${key}_shard_${i / SHARD_SIZE}`;
      const shardValue = value.substring(i, i + SHARD_SIZE);
      shards.push(shardValue);
      shardKeys.push(shardKey);
      await SecureStore.setItemAsync(shardKey, shardValue);
    }

    const manifest = { sharded: true, keys: shardKeys };
    return SecureStore.setItemAsync(key, JSON.stringify(manifest));
  },
  removeItem: async (key: string): Promise<void> => {
    const manifestStr = await SecureStore.getItemAsync(key);
    if (manifestStr) {
      try {
        const manifest = JSON.parse(manifestStr);
        if (manifest && manifest.sharded) {
          await Promise.all(
            manifest.keys.map((k: string) => SecureStore.deleteItemAsync(k)),
          );
        }
      } catch {
        /* ignore */
      }
    }
    return SecureStore.deleteItemAsync(key);
  },
};

// Use a custom storage adapter for Expo
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStoreSharded.getItem(key),
  setItem: (key: string, value: string) =>
    SecureStoreSharded.setItem(key, value),
  removeItem: (key: string) => SecureStoreSharded.removeItem(key),
};

// For web/other platforms, fallback to AsyncStorage or null
const storage = Platform.OS === "web" ? undefined : ExpoSecureStoreAdapter;

// Update these with your real Supabase credentials
// Since the user said they are "filled", we assume they are available or we provide a place to put them.
// Best practice in Expo is EXPO_PUBLIC_ vars.
const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: storage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
