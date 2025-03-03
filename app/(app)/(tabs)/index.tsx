import {
  View,
  FlatList,
  Text,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { useEventsStore } from "../../../lib/state/useEventsStore";
import { use$, observer } from "@legendapp/state/react";
import CategoryCard from "../../components/CategoryCard";
import EventCard from "../../components/EventCard";
import { events } from "../../../lib/db/schema";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { MapPin, CircleDot } from "lucide-react-native";
import { Modal, useModal } from "@/lib/ui";
import { Switch } from "@/lib/ui/switch";
import { useSharedValue } from "react-native-reanimated";
import { useLocationStore } from "@/lib/state/useLocationStore";
import { useEffect } from "react";

type Event = typeof events.$inferSelect;

interface Category {
  id: number;
  categoryId: string;
  name: string;
  type: string;
  image: string;
}

const CATEGORY_TYPES = [
  "All",
  "Entertainment",
  "Academic",
  "Volunteering",
] as const;

const Index = observer(() => {
  const eventsStore = use$(useEventsStore());
  const insets = useSafeAreaInsets();
  const { hasPermission, currentLocation, requestLocationPermission } = use$(
    useLocationStore()
  );
  const TAB_BAR_HEIGHT = 49; // Default tab bar height in iOS/Android
  const { ref, present } = useModal();
  const isOn = useSharedValue(hasPermission.get());

  // Add initialization effect
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        eventsStore.fetchAllEvents(),
        eventsStore.fetchAllCategories(),
        eventsStore.fetchRecentlyViewed(),
      ]);
      eventsStore.setCategoryType("All");
    };

    initializeData();
  }, []); // Run once on mount

  // Location permission effect
  useEffect(() => {
    if (!hasPermission) {
      requestLocationPermission();
    }
  }, [hasPermission, requestLocationPermission]);

  // Show loading state while data is being fetched
  if (eventsStore.isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-purple-50 justify-center items-center">
        <ActivityIndicator size="large" color="#6b21a8" />
      </SafeAreaView>
    );
  }

  const handlePress = () => {
    isOn.value = !isOn.value;
  };

  const renderItem = ({ item: category }: { item: Category }) => (
    <CategoryCard category={category} className="mr-2" />
  );
  const renderPopularEvent = ({ item: event }: { item: Event }) => (
    <Pressable className="mr-2">
      <EventCard event={event} className="w-80 h-48" />
    </Pressable>
  );
  const popularEvents = eventsStore.events
    ?.filter((event) => event.isFeatured === 1)
    .slice(0, 5);
  const recentlyViewedEvents = eventsStore.recentlyViewedEvents;
  // Split categories into two arrays only if more than 4 categories
  const shouldSplit = eventsStore.filteredCategories.length > 4;
  const halfLength = shouldSplit
    ? Math.ceil(eventsStore.filteredCategories.length / 2)
    : eventsStore.filteredCategories.length;
  const firstHalf = eventsStore.filteredCategories.slice(0, halfLength);
  const secondHalf = shouldSplit
    ? eventsStore.filteredCategories.slice(halfLength)
    : [];

  return (
    <SafeAreaView
      className="flex-1 bg-purple-50"
      edges={["left", "right", "top"]}
    >
      <Animated.ScrollView
        className="flex-1 px-4 pt-4 bg-purple-50"
        entering={FadeIn}
        exiting={FadeOut}
        contentContainerStyle={{
          paddingBottom: insets.bottom + TAB_BAR_HEIGHT,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Modal ref={ref} snapPoints={["50%"]}>
          <View className="flex-1 justify-start items-start px-4 py-2">
            <Text className="text-xl font-bold">Select your location</Text>
            <View className="flex-row justify-between items-center mt-4 gap-8">
              <Text>Phone location permission</Text>
              <Switch
                value={isOn}
                onPress={handlePress}
                style={{ width: 30, height: 15 }}
                trackColors={{ on: "#fff", off: "#fff" }}
              />
            </View>
            <View className="mt-6 mb-2">
              <Text className="text-lg font-bold">Current location</Text>
            </View>
            <View className="flex-row justify-between items-center mb-4 bg-purple-100 gap-2 h-30 pl-2 pr-4 py-4 rounded-lg w-full">
              <View className="flex-row justify-start items-center gap-4">
                <MapPin size={20} color="#6b21a8" />
                <View>
                  <Text className="text-purple-800 text-sm font-medium">
                    Bengaluru, India
                  </Text>
                  <Text className="text-gray-600 text-xs">
                    #2 KR Layout, Indiranagar
                  </Text>
                </View>
              </View>
              <CircleDot size={20} color="#6b21a8" />
            </View>
            <View className="mt-6 mb-2 px-3">
              <Text className="text-lg font-bold">Recent Locations</Text>
              <View className="gap-4 mt-2">
                <View className="flex-row justify-between items-center w-full">
                  <View className="flex-row justify-start items-center gap-2">
                    <MapPin size={20} color="#6b7280" />
                    <Text className="text-gray-500">
                      Sheikh Sarai, #14 JL Road, Delhi
                    </Text>
                  </View>
                  <CircleDot size={20} color="#6b7280" />
                </View>
                <View className="flex-row justify-between items-center w-full">
                  <View className="flex-row justify-start items-center gap-2">
                    <MapPin size={20} color="#6b7280" />
                    <Text className="text-gray-500">
                      Saket, 2nd main, Saket main road
                    </Text>
                  </View>
                  <CircleDot size={20} color="#6b7280" />
                </View>
              </View>
            </View>
          </View>
        </Modal>
        <View className="flex-row justify-center items-center mb-4">
          <Image
            source={require("@/assets/images/logo.png")}
            className="w-32 h-14"
            resizeMode="contain"
          />
        </View>
        <View className="flex-row justify-between items-center mb-4 bg-purple-100 gap-2 h-30 pl-2 pr-4 py-4 rounded-lg">
          <View className="flex-row justify-start items-center gap-4">
            <MapPin size={20} color="#6b21a8" />
            <View>
              <Text className="text-purple-800 text-sm font-medium">
                Bengaluru, India
              </Text>
              <Text className="text-gray-600 text-xs">
                #2 KR Layout, Indiranagar
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => present()}
            className="bg-purple-800 rounded-full px-2 py-1"
          >
            <Text className="text-white text-sm font-medium">Change</Text>
          </Pressable>
        </View>
        <View className="flex-row mb-4">
          {CATEGORY_TYPES.map((type, index) => (
            <Pressable
              key={type}
              onPress={() => eventsStore.setCategoryType(type)}
              className={`px-4 py-2 border border-gray-200 -ml-[1px] ${
                eventsStore.categoryTypes === type
                  ? "bg-purple-600 border-purple-600 z-10"
                  : "bg-gray-200"
              } ${index === 0 ? "rounded-l-full" : ""} ${
                index === CATEGORY_TYPES.length - 1 ? "rounded-r-full" : ""
              }`}
            >
              <Text
                className={`font-medium ${
                  eventsStore.categoryTypes === type
                    ? "text-white"
                    : "text-gray-700"
                }`}
              >
                {type}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text className="text-2xl font-bold pb-4">Pick your category</Text>
        <View>
          <FlatList
            data={shouldSplit ? firstHalf : eventsStore.filteredCategories}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
        {shouldSplit && (
          <View className="mt-4">
            <FlatList
              data={secondHalf}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}
        <Text className="text-2xl font-bold my-4">Most Popular</Text>
        <View>
          <FlatList
            data={popularEvents}
            renderItem={renderPopularEvent}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
        {recentlyViewedEvents.length > 0 && (
          <>
            <Text className="text-2xl font-bold my-4">Resume your booking</Text>
            <View>
              <FlatList
                data={recentlyViewedEvents}
                renderItem={renderPopularEvent}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
              />
            </View>
          </>
        )}
      </Animated.ScrollView>
    </SafeAreaView>
  );
});

export default Index;
