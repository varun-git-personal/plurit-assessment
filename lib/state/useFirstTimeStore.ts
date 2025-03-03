import { observable } from "@legendapp/state";
import { StorageHelper, Keys } from "../storage/mmkv";

interface FirstTimeState {
  isFirstTime: boolean;
  isLoading: boolean;
  error: string | null;
}

const _store = observable<FirstTimeState>({
  isFirstTime: StorageHelper.getBoolean("IS_FIRST_TIME"),
  isLoading: false,
  error: null,
});

export const useFirstTimeStore = () => {
  const completeOnboarding = async () => {
    try {
      _store.isLoading.set(true);
      StorageHelper.setBoolean("IS_FIRST_TIME", false);
      _store.isFirstTime.set(false);
    } catch (error) {
      _store.error.set(
        error instanceof Error ? error.message : "An error occurred"
      );
    } finally {
      _store.isLoading.set(false);
    }
  };

  return {
    isFirstTime: _store.isFirstTime,
    isLoading: _store.isLoading,
    error: _store.error,
    completeOnboarding,
  } as const;
};
