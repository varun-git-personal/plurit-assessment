import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { observer } from "@legendapp/state/react";
import { useFirstTimeStore } from "@/lib/state/useFirstTimeStore";
import { cleanup, seedAll } from "@/lib/db/seed";
import { SafeAreaView } from "react-native-safe-area-context";

export default observer(function Onboarding() {
  const router = useRouter();
  const firstTimeStore = useFirstTimeStore();

  const handleGetStarted = async () => {
    try {
      firstTimeStore.isLoading.set(true);

      // Clean and seed data
      await cleanup();
      await seedAll();

      // Mark onboarding as complete
      await firstTimeStore.completeOnboarding();

      // Navigate to login
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Onboarding error:", error);
      Alert.alert(
        "Error",
        "There was a problem setting up the app. Please try again.",
        [
          {
            text: "Retry",
            onPress: handleGetStarted,
          },
        ]
      );
    } finally {
      firstTimeStore.isLoading.set(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 p-4 justify-between">
        <View className="flex-1 justify-center items-center">
          <View className="flex-0.2 p-2 mt-14 justify-center items-center h-24 mb-8">
            <Image
              source={require("@/assets/images/logo.png")}
              className="w-30 h-24 mb-2"
              resizeMode="contain"
            />
          </View>
          <Text className="text-4xl font-bold text-purple-800 text-center">
            Welcome
          </Text>
          <Text className="text-lg text-gray-600 mt-4 text-center px-4">
            Your one-stop destination for discovering and booking amazing events
          </Text>
        </View>

        <Pressable
          onPress={handleGetStarted}
          disabled={firstTimeStore.isLoading.get()}
          className={`rounded-lg p-4 mb-8 ${
            firstTimeStore.isLoading.get() ? "bg-purple-300" : "bg-purple-800"
          }`}
        >
          {firstTimeStore.isLoading.get() ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-semibold text-lg">
              Get Started
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
});
