import { View, Text, Pressable, ScrollView, TextInput } from "react-native";
import React, { useState, useMemo } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { EnrichedEvent } from "@/types/enrichedEvents";
import { Minus, Plus, Ticket, X } from "lucide-react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { useBookingsStore } from "@/lib/state/useBookingsStore";
import { showMessage } from "react-native-flash-message";
const TAX_RATE = 0.12; // 12% tax rate

interface SeatSelection {
  [tariffId: string]: number;
}

const BookSeats = () => {
  const { event } = useLocalSearchParams();
  const { createBooking } = useBookingsStore();
  const eventData: EnrichedEvent = JSON.parse(event as string);
  const [selectedSeats, setSelectedSeats] = useState<SeatSelection>({});
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    description: string;
    discountType: string;
    discountValue: number;
    maxDiscount?: number;
    minPurchase: number;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const onCreateBooking = async () => {
    try {
      const bookingId = await createBooking({
        eventId: eventData.eventId,
        seats: Object.entries(selectedSeats).map(([tariffId, count]) => ({
          tariffType: tariffId,
          quantity: count,
          pricePerSeat:
            eventData.tariffs.find((t) => t.id === Number(tariffId))?.price ||
            0,
        })),
        totalAmount: subtotal,
        discountAmount: discount,
        taxAmount: tax,
        finalAmount: total,
        couponCode: appliedCoupon?.code,
      });

      if (bookingId) {
        showMessage({
          message: "Booking Successful!",
          description: "Your tickets have been booked successfully.",
          type: "success",
          icon: "success",
          duration: 3000,
        });

        // Wait for the message to be visible before navigating
        setTimeout(() => {
          router.push("/(app)/(tabs)/bookings");
        }, 1000);
      }
    } catch (error) {
      if (error instanceof Error) {
        showMessage({
          message: "Booking Failed",
          description: error.message,
          type: "danger",
          icon: "danger",
        });
      } else {
        showMessage({
          message: "Error",
          description: "Something went wrong. Please try again later.",
          type: "danger",
          icon: "danger",
        });
      }
    }
  };
  type Tariff = "platinum" | "gold" | "silver";

  const tariffColors: Record<Tariff, { colors: string[]; height: number }> = {
    platinum: {
      colors: ["#ABAAD4", "#EEE6F9", "#59586E"],
      height: 40,
    },
    gold: {
      colors: ["#FAC38C", "#EEE6F9", "#947353"],
      height: 60,
    },
    silver: {
      colors: ["#DBDBDB", "#EEE6F9", "#757575"],
      height: 80,
    },
  };

  // Calculate remaining seats for each tariff
  const remainingSeats = useMemo(() => {
    return eventData.tariffs.reduce((acc, tariff) => {
      acc[tariff.id] = tariff.seats - (selectedSeats[tariff.id] || 0);
      return acc;
    }, {} as Record<string, number>);
  }, [selectedSeats, eventData.tariffs]);

  const updateSeatCount = (tariffId: number, increment: boolean) => {
    setSelectedSeats((prev) => {
      const currentCount = prev[tariffId] || 0;
      const tariff = eventData.tariffs.find((t) => t.id === tariffId);

      if (!tariff) return prev;

      if (increment) {
        // Check if we have seats available
        if (currentCount >= tariff.seats) return prev;
        return {
          ...prev,
          [tariffId]: currentCount + 1,
        };
      } else {
        return {
          ...prev,
          [tariffId]: Math.max(0, currentCount - 1),
        };
      }
    });
  };

  // Create a map of valid coupons from event offers
  const validCoupons = useMemo(() => {
    const coupons = new Map();
    eventData.offers.forEach((offer) => {
      if (offer.coupon && offer.coupon.isActive) {
        const now = Date.now();
        // Only add coupons that are still valid
        if (offer.coupon.validUntil > now) {
          coupons.set(offer.coupon.code, offer.coupon);
        }
      }
    });
    return coupons;
  }, [eventData.offers]);

  // Create a separate function for handling coupon click
  const handleCouponClick = (code: string) => {
    // Use the code directly instead of relying on state
    const normalizedCode = code.trim().toUpperCase();
    const coupon = validCoupons.get(normalizedCode);

    if (!coupon) {
      setCouponError("Invalid coupon code");
      return;
    }

    // Check minimum purchase requirement
    if (coupon.minPurchase > subtotal) {
      setCouponError(
        `Minimum purchase amount of ₹${coupon.minPurchase.toLocaleString(
          "en-IN"
        )} required`
      );
      return;
    }

    setAppliedCoupon({
      ...coupon,
      code: normalizedCode,
    });
    setCouponError("");
    setCouponCode(""); // Clear the input
  };

  // Update discount calculation
  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;

    if (appliedCoupon.discountType === "percentage") {
      const discount = (subtotal * appliedCoupon.discountValue) / 100;
      return appliedCoupon.maxDiscount
        ? Math.min(discount, appliedCoupon.maxDiscount)
        : discount;
    }
    return appliedCoupon.discountValue;
  };

  const calculateSubtotal = () => {
    return eventData.tariffs.reduce((total, tariff) => {
      const seatCount = selectedSeats[tariff.id] || 0;
      return total + tariff.price * seatCount;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const discount = calculateDiscount();
  const discountedSubtotal = subtotal - discount;
  const tax = discountedSubtotal * TAX_RATE;
  const total = discountedSubtotal + tax;

  return (
    <SafeAreaView className="flex-1" edges={["right", "left"]}>
      <ScrollView className="flex-1">
        <View className="flex-1 p-4">
          {/* Stage Section */}
          <View className="border border-gray-400 rounded-md mb-6">
            <View className="mb-16 items-center justify-center">
              <View className="items-center justify-center rounded-b-md w-20 bg-gray-400 h-6">
                <Text className="text-sm text-center font-bold text-gray-600">
                  Stage
                </Text>
              </View>
            </View>
            {/* Gradient Sections */}
            {eventData.tariffs?.map((tariff) => (
              <View key={tariff.id}>
                <LinearGradient
                  colors={
                    tariffColors[tariff.type as Tariff].colors as [
                      string,
                      string,
                      ...string[]
                    ]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    width: "100%",
                    height: tariffColors[tariff.type as Tariff].height,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text className="capitalize text-md font-bold text-gray-600">
                    {tariff.type} - ₹{tariff.price.toLocaleString("en-IN")}
                  </Text>
                </LinearGradient>
              </View>
            ))}
          </View>

          {/* Seat Selection Section */}
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-lg font-bold mb-4">Select Seats</Text>
            {eventData.tariffs?.map((tariff) => {
              const seatCount = selectedSeats[tariff.id] || 0;
              const remaining = remainingSeats[tariff.id];
              const isMaxSeats = seatCount >= tariff.seats;
              const isNoSeats = remaining <= 0;

              return (
                <View
                  key={tariff.id}
                  className="flex-row items-center justify-between py-3 border-b border-gray-200"
                >
                  <View className="flex-row items-center justify-start">
                    <MaskedView
                      maskElement={
                        <View className="bg-transparent">
                          <Ticket size={20} color="#4B5563" fill="#4B5563" />
                        </View>
                      }
                    >
                      <LinearGradient
                        colors={
                          tariffColors[tariff.type as Tariff].colors as [
                            string,
                            string,
                            ...string[]
                          ]
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{
                          height: 20,
                          width: 20,
                        }}
                      />
                    </MaskedView>
                    <View className="ml-2">
                      <View className="flex-row items-center">
                        <Text className="capitalize font-medium text-gray-800">
                          {tariff.type}
                        </Text>
                        <Text className="text-gray-600 ml-2">
                          ₹{tariff.price.toLocaleString("en-IN")}
                        </Text>
                      </View>
                      <Text
                        className={`text-sm ${
                          isNoSeats ? "text-red-500" : "text-gray-500"
                        }`}
                      >
                        {remaining} seats remaining
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center">
                    <Pressable
                      onPress={() => updateSeatCount(tariff.id, false)}
                      disabled={seatCount === 0}
                      className={`w-8 h-8 rounded-full items-center justify-center
                        ${seatCount === 0 ? "bg-gray-100" : "bg-purple-200"}`}
                    >
                      <Minus
                        size={20}
                        color={seatCount === 0 ? "#9CA3AF" : "#4B5563"}
                      />
                    </Pressable>

                    <Text className="mx-4 text-lg font-medium w-8 text-center">
                      {seatCount}
                    </Text>

                    <Pressable
                      onPress={() => updateSeatCount(tariff.id, true)}
                      disabled={isMaxSeats}
                      className={`w-8 h-8 rounded-full items-center justify-center
                        ${isMaxSeats ? "bg-gray-100" : "bg-purple-200"}`}
                    >
                      <Plus
                        size={20}
                        color={isMaxSeats ? "#9CA3AF" : "#4B5563"}
                      />
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Coupon Section */}
          <View className="mt-4 p-4 bg-white rounded-lg shadow-sm">
            <Text className="text-lg font-bold mb-2">Apply Coupon</Text>

            {!appliedCoupon ? (
              <View>
                <View className="flex-row items-center">
                  <TextInput
                    className="flex-1 h-10 px-3 border border-gray-300 rounded-l-lg text-base"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChangeText={(text) => {
                      setCouponCode(text);
                      setCouponError("");
                    }}
                    autoCapitalize="characters"
                  />
                  <Pressable
                    onPress={() => handleCouponClick(couponCode)}
                    className="h-10 px-4 bg-purple-800 rounded-r-lg items-center justify-center"
                  >
                    <Text className="text-white font-medium">Apply</Text>
                  </Pressable>
                </View>
                {couponError ? (
                  <Text className="text-red-500 text-sm mt-1">
                    {couponError}
                  </Text>
                ) : null}
                {/* Display available coupons */}
                <View className="mt-4">
                  <Text className="text-sm font-medium text-gray-600 mb-2">
                    Available Coupons:
                  </Text>
                  {Array.from(validCoupons.values()).map((coupon) => (
                    <Pressable
                      key={coupon.code}
                      onPress={() => handleCouponClick(coupon.code)}
                      className="border border-gray-200 rounded-md p-2 mb-2"
                    >
                      <View className="flex-row justify-between items-center">
                        <Text className="font-bold text-purple-600">
                          {coupon.code}
                        </Text>
                        <Text className="text-sm text-gray-500">
                          {coupon.discountType === "percentage"
                            ? `${coupon.discountValue}% off`
                            : `₹${coupon.discountValue} off`}
                        </Text>
                      </View>
                      <Text className="text-xs text-gray-600">
                        {coupon.description}
                      </Text>
                      {coupon.minPurchase > 0 && (
                        <Text className="text-xs text-gray-500 mt-1">
                          Min. purchase: ₹
                          {coupon.minPurchase.toLocaleString("en-IN")}
                        </Text>
                      )}
                      {coupon.maxDiscount > 0 && (
                        <Text className="text-xs text-gray-500 mt-1">
                          Max discount: ₹
                          {coupon.maxDiscount.toLocaleString("en-IN")}
                        </Text>
                      )}
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : (
              <View className="flex-row items-center justify-between bg-green-50 p-3 rounded-lg">
                <View>
                  <View className="flex-row items-center">
                    <Text className="text-green-700 font-bold">
                      {appliedCoupon.code}
                    </Text>
                    <Text className="text-green-700 ml-2">
                      {appliedCoupon.discountType === "percentage"
                        ? `(${appliedCoupon.discountValue}% off)`
                        : `(₹${appliedCoupon.discountValue} off)`}
                    </Text>
                  </View>
                  <Text className="text-green-600 text-sm">
                    {appliedCoupon.description}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setAppliedCoupon(null)}
                  className="p-2"
                >
                  <X size={20} color="#15803d" />
                </Pressable>
              </View>
            )}
          </View>

          {/* Price Summary */}
          <View className="mt-4 p-4 bg-white rounded-lg shadow-sm">
            <Text className="text-lg font-bold mb-2">Price Summary</Text>
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Subtotal</Text>
              <Text className="text-gray-800">
                ₹{subtotal.toLocaleString("en-IN")}
              </Text>
            </View>

            {appliedCoupon && (
              <View className="flex-row justify-between mb-2">
                <Text className="text-green-600">
                  Discount{" "}
                  {appliedCoupon.discountType === "percentage"
                    ? `(${appliedCoupon.discountValue}%)`
                    : `(₹${appliedCoupon.discountValue})`}
                </Text>
                <Text className="text-green-600">
                  -₹{discount.toLocaleString("en-IN")}
                </Text>
              </View>
            )}

            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Tax (12%)</Text>
              <Text className="text-gray-800">
                ₹{tax.toLocaleString("en-IN")}
              </Text>
            </View>

            <View className="h-[1px] bg-gray-200 my-2" />
            <View className="flex-row justify-between">
              <Text className="font-bold text-gray-800">Total</Text>
              <Text className="font-bold text-gray-800">
                ₹{total.toLocaleString("en-IN")}
              </Text>
            </View>
          </View>

          {/* Book Button */}
          <Pressable
            className={`mt-4 rounded-lg p-4 shadow-sm ${
              Object.values(selectedSeats).some((count) => count > 0)
                ? "bg-purple-800"
                : "bg-gray-300"
            }`}
            disabled={!Object.values(selectedSeats).some((count) => count > 0)}
            onPress={onCreateBooking}
          >
            <Text className="text-white text-center font-bold text-lg">
              Book Tickets
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BookSeats;
