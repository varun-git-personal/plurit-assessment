import { View, Text, Pressable, Image } from "react-native";
import { events } from "../../lib/db/schema";
import { MapPin, CircleChevronLeft, Share2 } from "lucide-react-native";
import Animated from "react-native-reanimated";
import { useRouter } from "expo-router";
type Event = typeof events.$inferSelect;

interface EventCardProps {
  event: Event;
  className?: string;
}
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const EventCard = ({ event, className = "" }: EventCardProps) => {
  const router = useRouter();
  return (
    <AnimatedPressable
      className={`rounded-lg overflow-hidden bg-white shadow ${className}`}
      onPress={() => {
        router.push({
          pathname: "/(app)/events/[id]",
          params: {
            id: event.eventId,
            event: JSON.stringify(event),
          },
        });
      }}
    >
      <Animated.Image
        source={{ uri: event.image }}
        className="w-full h-full object-cover"
        resizeMode="cover"
      />
      <View className="absolute bottom-0 left-0 px-2 w-full bg-black/50">
        <Text className="text-white text-lg font-bold ">{event.title}</Text>
        <View className="flex-row items-center pb-2">
          <MapPin size={14} color="white" />
          <Text className="text-white text-sm font-bold pl-2">
            {event.location}, {event.city}
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
};

export default EventCard;
