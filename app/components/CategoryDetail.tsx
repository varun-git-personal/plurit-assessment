import { View, Text, Pressable, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { category } from "../../types/events";
import EventCard from "./EventCard";
import { use$ } from "@legendapp/state/react";
import { useEventsStore } from "../../lib/state/useEventsStore";
import { type EnrichedEvent } from "../../types/enrichedEvents";
import { router } from "expo-router";
import { ChevronLeft, Share2 } from "lucide-react-native";

function CategoryDetails({ category }: { category: category }) {
  const eventsStore = use$(useEventsStore());
  const events: EnrichedEvent[] = use$(
    eventsStore.events.filter(
      (event) => event.categoryId === category.categoryId
    )
  );

  const renderEvent = ({ item: event }: { item: EnrichedEvent }) => (
    <Pressable className="mr-2 w-full">
      <EventCard event={event} className="w-full h-48" />
    </Pressable>
  );
  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={["left", "right", "bottom"]}
    >
      <View className="flex-1">
        <Animated.Image
          source={{ uri: category.image }}
          className="w-full h-[300] aspect-video object-cover bg-purple-500"
          resizeMode="cover"
        />
        <Animated.View
          className="absolute top-10 left-0 w-full"
          entering={FadeIn.springify().delay(500).duration(1000)}
          exiting={FadeOut.springify().delay(500).duration(1000)}
        >
          <View className="relative w-full flex-row justify-between px-4 mt-7">
            <Pressable
              className="p-1 rounded-full bg-white justify-center items-center"
              onPress={() => router.back()}
            >
              <ChevronLeft color="black" strokeWidth={2} size={20} />
            </Pressable>
            <Pressable className="p-1 rounded-full bg-white justify-center items-center">
              <Share2 color="black" strokeWidth={1.5} size={20} />
            </Pressable>
          </View>
        </Animated.View>

        {events.length > 0 ? (
          <FlatList
            data={events}
            renderItem={({ item }) => renderEvent({ item })}
            keyExtractor={(item) => item.eventId}
            className="flex-1"
            contentContainerStyle={{
              paddingTop: 14,
              paddingHorizontal: 16,
              gap: 14,
            }}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500">No events found</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

export default CategoryDetails;
