import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWishlistStore } from "@/lib/state/useWishlistStore";
import { observer } from "@legendapp/state/react";
import { useEffect } from "react";
import EventCard from "@/app/components/EventCard";

export default observer(function Wishlist() {
  const store = useWishlistStore();
  const wishlistEvents = store.wishlistEvents.get();
  const isLoading = store.isLoading.get();

  useEffect(() => {
    // Fetch wishlist when component mounts
    store.fetchWishlistEvents();
  }, []);

  console.log("wishlistEvents", wishlistEvents);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#6b21a8" />
      </SafeAreaView>
    );
  }

  if (wishlistEvents.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-500">No events in wishlist</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["right", "left"]}>
      <ScrollView
        className="p-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {wishlistEvents.map((event) => (
          <EventCard key={event.eventId} event={event} className="mb-4 h-60" />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
});
