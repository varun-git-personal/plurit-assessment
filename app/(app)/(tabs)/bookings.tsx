import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBookingsStore } from "@/lib/state/useBookingsStore";
import { observer } from "@legendapp/state/react";
import { useEffect } from "react";
import EventCard from "@/app/components/EventCard";

export default observer(function Bookings() {
  const store = useBookingsStore();
  const bookings = store.userBookingsWithEvents.get();
  const isLoading = store.isLoading.get();

  useEffect(() => {
    // Fetch bookings when component mounts
    store.fetchUserBookingsWithEvents();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#6b21a8" />
      </SafeAreaView>
    );
  }

  // Filter out cancelled bookings
  const activeBookings = bookings.filter(
    (booking) => booking.booking.status !== "cancelled"
  );

  if (activeBookings.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-500">No active bookings found</Text>
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
        {activeBookings.map((booking) => (
          <EventCard
            key={booking.event.eventId}
            event={booking.event}
            className="mb-4 h-60"
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
});
