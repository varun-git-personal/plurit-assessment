import { MMKV } from "react-native-mmkv";

export const storage = new MMKV({
  id: "plurit-storage",
  encryptionKey: "plurit-key",
});

export const Keys = {
  IS_FIRST_TIME: "isFirstTime",
  // Add other keys as needed
} as const;

// Helper functions for type safety
export const StorageHelper = {
  getBoolean: (key: keyof typeof Keys): boolean => {
    return storage.getBoolean(Keys[key]) ?? true;
  },
  setBoolean: (key: keyof typeof Keys, value: boolean): void => {
    storage.set(Keys[key], value);
  },
};
