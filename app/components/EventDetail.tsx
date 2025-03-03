import { View, Text, Pressable, ScrollView } from "react-native";
import { showMessage } from "react-native-flash-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { type EnrichedEvent } from "../../types/enrichedEvents";
import {
  ChevronLeft,
  Share2,
  CalendarClock,
  UserCheck,
  Heart,
  CirclePlay,
  Zap,
  Dot,
  Globe,
  CalendarDays,
  ReceiptIndianRupee,
  MapPinCheck,
  Info,
  Map,
  Tags,
} from "lucide-react-native";
import { inclusionIconMap } from "@/lib/constants/icons";
import dayjs from "dayjs";
import { InclusionType } from "@/types/events";
import { useState, useEffect } from "react";
import { useBookingsStore } from "@/lib/state/useBookingsStore";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { observer } from "@legendapp/state/react";
import { useWishlistStore } from "@/lib/state/useWishlistStore";

const EventDetails = observer(({ event }: { event: EnrichedEvent }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"details" | "crew">("details");
  const [selectedTime, setSelectedTime] = useState<Boolean>(false);
  const {
    isEventBookedByUser,
    eventBookingStatus,
    userBookings,
    cancelBooking,
  } = useBookingsStore();
  const {
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    eventWishlistStatus,
  } = useWishlistStore();
  const IconComponent = (inclusion: InclusionType) => {
    const Icon = inclusionIconMap[inclusion as InclusionType];
    return <Icon color="#1e293b" key={inclusion} strokeWidth={2} size={20} />;
  };
  const onCancelBooking = async () => {
    await cancelBooking(event.eventId, "user cancelled booking");
    showMessage({
      message: "Booking cancelled",
      description: "Your booking has been cancelled",
      type: "success",
      icon: "success",
      duration: 3000,
    });
  };

  useEffect(() => {
    isEventBookedByUser(event.eventId);
    isInWishlist(event.eventId);
  }, [event.eventId, userBookings.get(), isInWishlist]);

  const isBooked = eventBookingStatus[event.eventId]?.get() ?? false;
  const isWishlisted = eventWishlistStatus[event.eventId]?.get() ?? false;

  const toggleWishlist = async () => {
    if (isWishlisted) {
      await removeFromWishlist(event.eventId);
    } else {
      await addToWishlist(event.eventId);
    }
  };

  console.log("Current booking status:", isBooked);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["left", "right"]}>
      <View className="flex-1">
        <Animated.Image
          source={{ uri: event.image }}
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
        <View className="w-full relative left-5 top-[-32px] z-10 flex-row">
          <Pressable
            onPress={() => setActiveTab("details")}
            className={`p-2 rounded-tl-lg bg-white border-r border-l px-4 border-t border-purple-200 ${
              activeTab !== "details" ? "border-b" : ""
            }`}
          >
            <Text
              className={`${
                activeTab === "details" ? "text-purple-800" : "text-black/50"
              } text-md`}
            >
              Details
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("crew")}
            className={`p-2 rounded-tr-lg bg-white border-r border-l px-4 border-t border-purple-200 ${
              activeTab !== "crew" ? "border-b" : ""
            }`}
          >
            <Text
              className={`${
                activeTab === "crew" ? "text-purple-800" : "text-black/50"
              } text-md`}
            >
              Crew
            </Text>
          </Pressable>
        </View>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full flex-1/2 mt-[-33px]">
            <Text className="text-black text-2xl font-bold mt-8 pl-5">
              {event.title}
            </Text>
            <View className="flex-row items-center gap-2 px-5 mt-4">
              <View className="flex-row items-center gap-2">
                <Heart
                  color="#6b21a8"
                  fill="#6b21a8"
                  strokeWidth={2}
                  size={20}
                />
                <Text className="text-purple-800 text-md">120 Interested</Text>
              </View>
              <Pressable className="flex-row gap-2 px-2 py-1 rounded-lg bg-purple-50 justify-center items-center">
                <CirclePlay color="#6b21a8" strokeWidth={2} size={20} />
                <Text className="text-purple-800 text-md">Teaser</Text>
              </Pressable>
              <View className="flex-row items-center gap-2">
                <Zap color="#fb923c" strokeWidth={2} size={20} />
                <Text className="text-orange-400 text-sm">Fast Filling</Text>
              </View>
              <Pressable
                className="p-2 ml-6 rounded-full bg-purple-100 justify-center items-center"
                onPress={toggleWishlist}
              >
                <Heart
                  color="#6b21a8"
                  fill={isWishlisted ? "#6b21a8" : "transparent"}
                  strokeWidth={2}
                  size={20}
                />
              </Pressable>
            </View>
            <View className="flex-row items-center gap-8 px-5 mt-3">
              <View className="flex-row items-center gap-3">
                <CalendarClock color="#1e293b" strokeWidth={2} size={20} />
                <Text className="text-slate-800 text-md">
                  {Math.floor(event.duration / 60)}h {event.duration % 60}m
                </Text>
              </View>
              <View className="flex-row items-center gap-3">
                <UserCheck color="#1e293b" strokeWidth={2} size={20} />
                <Text className="text-slate-800 text-md">5 years+</Text>
              </View>
              <View className="flex-row items-center gap-3">
                <Tags color="#1e293b" strokeWidth={2} size={20} />
                <Text className="text-slate-800 text-md">
                  {event.genre?.name}
                </Text>
              </View>
            </View>
            <View className="mt-4 pl-5 flex-row items-center gap-2">
              <Globe color="#1e293b" strokeWidth={2} size={20} />
              <Text className="text-slate-800 text-md">
                {event.languages.map((language) => language.name).join(" / ")}
              </Text>
            </View>
            <View className="mt-4 pl-5 flex-row items-center gap-2">
              <CalendarDays color="#1e293b" strokeWidth={2} size={20} />
              <Text className="text-slate-800 text-md">
                {dayjs(event.date).format("ddd, MMM D, YYYY")}
              </Text>
            </View>
            <View className="mt-4 pl-5 flex-row items-center gap-2">
              <ReceiptIndianRupee color="#1e293b" strokeWidth={2} size={20} />
              <Text className="text-slate-800 text-md">
                {event.tariffs.length === 0
                  ? "Price not available"
                  : event.tariffs.length === 1
                  ? `₹${event.tariffs[0].price}`
                  : `₹${Math.min(
                      ...event.tariffs.map((t) => t.price)
                    )} - ₹${Math.max(...event.tariffs.map((t) => t.price))}`}
              </Text>
            </View>
            <View className="flex-row items-center gap-6 px-5 mt-4">
              <View className="flex-row items-center gap-2">
                {event.inclusions.map((inclusion) => (
                  <View
                    className="flex-row items-center"
                    key={inclusion.details.name}
                  >
                    {IconComponent(inclusion.details.name as InclusionType)}
                  </View>
                ))}
              </View>
              <View className="flex-row items-center gap-2">
                <Map color="#1e293b" strokeWidth={2} size={20} />
                <Text className="text-slate-800 text-md underline">
                  4 km Away
                </Text>
              </View>
            </View>
            <View className="h-[1px] bg-gray-300 mt-4 mx-5" />
            <View className="flex-row mt-4 pl-5 items-center gap-2">
              <MapPinCheck color="#1e293b" strokeWidth={2} size={20} />
              <Text className="text-slate-800 font-semibold text-md mr-2">
                {event.location}, {event.city}
              </Text>
              <Info color="#1e293b" strokeWidth={2} size={20} />
            </View>
            <View className="flex-row mt-4 pl-5 items-center gap-2">
              <Pressable
                className={`flex-row gap-2 p-2 rounded-full bg-purple-50 justify-center items-center ${
                  selectedTime ? "border border-purple-800" : ""
                }`}
                onPress={() => setSelectedTime(!selectedTime)}
              >
                <Text className="text-purple-800 text-md">
                  {dayjs(event.date).add(17, "hours").format("hh:mm a")}
                </Text>
              </Pressable>
              {selectedTime && (
                <Text className="text-orange-500 text-sm">
                  {`${event.tariffs.reduce(
                    (sum, tariff) => sum + tariff.seats,
                    0
                  )} Seats left`}
                </Text>
              )}
            </View>
            <View className="h-[1px] bg-gray-300 mt-4 mx-5" />
            <View className="mt-4 pl-5">
              <Text className="text-black text-lg font-semibold">
                Description
              </Text>
              <Text className="text-black text-md my-1">
                {event.description}
              </Text>
            </View>
            <View className="mt-4 pl-5">
              <Text className="text-black text-lg font-semibold">Policies</Text>
              {event.rules.map((rule) => (
                <View
                  className="mt-2 flex-row items-center gap-2"
                  key={rule.ruleId}
                >
                  <Dot color="#1e293b" strokeWidth={2} size={20} />
                  <Text className="text-black text-md">
                    {rule.details.description}
                  </Text>
                </View>
              ))}
            </View>
            <View className="mt-4 pl-5">
              <Text className="text-black text-lg font-semibold">Offers</Text>
              {event.offers.map((offer) => (
                <View
                  className="mt-2 flex-row items-center gap-2"
                  key={offer.details.offerId}
                >
                  <Dot color="#1e293b" strokeWidth={2} size={20} />
                  <Text className="text-black text-md">
                    {offer.details.description} -{" "}
                    {offer.details.discountPercentage}% off
                  </Text>
                  {offer.coupon?.code && (
                    <Pressable
                      className="flex-row items-center gap-2 bg-purple-50 px-2 py-1 rounded-lg border-gray-300"
                      onPress={() => {
                        Clipboard.setStringAsync(offer.coupon?.code || "");
                        showMessage({
                          message: "Copied to clipboard",
                          description: offer.coupon?.code || "",
                          type: "success",
                          icon: "success",
                          duration: 3000,
                        });
                      }}
                    >
                      <Text className="text-gray-600 text-sm ">
                        {offer.coupon.code}
                      </Text>
                    </Pressable>
                  )}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
      <View className="h-24 absolute bottom-0 left-0 right-0 border-t border-gray-300 bg-white">
        {!isBooked ? (
          <View className="flex-row items-center gap-4 justify-end mt-4 mr-6">
            {!selectedTime && (
              <Text className="text-gray-500 text-sm">
                Select time slot to proceed
              </Text>
            )}
            <Pressable
              disabled={!selectedTime}
              className="bg-purple-800 px-4 py-2 rounded-full disabled:opacity-50"
              onPress={() =>
                router.push({
                  pathname: "/events/[id]/bookSeats",
                  params: {
                    id: event.eventId,
                    event: JSON.stringify(event),
                  },
                })
              }
            >
              <Text className="text-white text-md">Proceed</Text>
            </Pressable>
          </View>
        ) : (
          <View className="flex-row items-center gap-4 justify-end mt-4 mr-6">
            <Text className="text-gray-500 text-sm w-1/2 text-center">
              Your booking details have been{"\n"}sent to your email
            </Text>
            <Pressable
              className="bg-purple-800 px-4 py-2 rounded-full disabled:opacity-50"
              onPress={onCancelBooking}
            >
              <Text className="text-white text-md">Cancel Booking</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
});

export default EventDetails;
