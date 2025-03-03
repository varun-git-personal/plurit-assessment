import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/lib/state/useAuthStore";
import { useRouter } from "expo-router";
import { observer } from "@legendapp/state/react";

export default observer(function Account() {
  const auth = useAuthStore();
  const router = useRouter();

  const displayName = auth.user.get()?.username || "User";

  const handleLogout = () => {
    auth.logout();
    router.replace("/login");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold">Account</Text>
        <Text className="mt-2 text-gray-600">Welcome, {displayName}</Text>

        <Pressable
          onPress={handleLogout}
          className="mt-8 bg-purple-800 p-3 rounded-lg"
        >
          <Text className="text-white text-center font-semibold">Logout</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
});
