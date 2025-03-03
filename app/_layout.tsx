import "../global.css";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments, Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { useAuthStore } from "@/lib/state/useAuthStore";
import { useFirstTimeStore } from "@/lib/state/useFirstTimeStore";
import { observer } from "@legendapp/state/react";
import { useLocalMigrations } from "@/lib/hooks/useLocalMigrations";
import FlashMessage from "react-native-flash-message";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(app)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const RootLayoutNav = observer(() => {
  const segments = useSegments();
  const router = useRouter();
  const { hydrate, isAuthenticated, isLoading } = useAuthStore();
  const { isFirstTime } = useFirstTimeStore();

  useLocalMigrations();

  useEffect(() => {
    // Hydrate auth state when app starts
    hydrate();
  }, []);

  useEffect(() => {
    if (isLoading.get()) return;

    console.log("Navigation Debug:", {
      isAuthenticated: isAuthenticated.get(),
      isFirstTime: isFirstTime.get(),
      currentSegment: segments[0],
      segments: segments,
    });

    const inAuthGroup = segments[0] === "(auth)";
    const inAppGroup = segments[0] === "(app)";
    const inOnboardingSection = segments[1] === "onboarding";

    // First check if it's first time
    if (isFirstTime.get() && !inOnboardingSection) {
      console.log("Redirecting to onboarding: First time user");
      router.replace("/(auth)/onboarding");
      return;
    }

    // Then handle authentication flow
    if (!isFirstTime.get()) {
      if (!isAuthenticated.get() && inAppGroup) {
        console.log("Redirecting to login: Not authenticated");
        router.replace("/(auth)/login");
      } else if (isAuthenticated.get() && inAuthGroup) {
        console.log("Redirecting to app: Authenticated user");
        router.replace("/(app)/(tabs)");
      }
    }
  }, [segments, isFirstTime.get(), isAuthenticated.get()]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
    </Stack>
  );
});

export default observer(function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <RootLayoutNav />
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
      <FlashMessage position="top" />
    </>
  );
});
