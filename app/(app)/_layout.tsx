import { observer } from "@legendapp/state/react";
import { Stack } from "expo-router";
import { View } from "react-native";
import { useAuthStore } from "@/lib/state/useAuthStore";

export default observer(function AppLayout() {
  const auth = useAuthStore();

  if (!auth.isAuthenticated) {
    return <View />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="categories/[id]"
        options={{
          animation: "fade",
        }}
      />
      <Stack.Screen
        name="events/[id]/index"
        options={{
          animation: "fade",
        }}
      />
      <Stack.Screen
        name="events/[id]/bookSeats"
        options={{
          title: "Book Seats",
          animation: "fade",
          headerShown: true,
          headerBackButtonDisplayMode: "minimal",
          headerTintColor: "#6b21a8",
        }}
      />
    </Stack>
  );
});
