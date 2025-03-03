import { db } from "../db/init";
import {
  bookings,
  bookingSeats,
  bookingTransactions,
  bookingCancellations,
  tariffs,
  coupons,
  recentlyViewed,
  wishlist,
} from "../db/schema";
import { eq, and, desc, sql, not, lte, gte } from "drizzle-orm";
import { observable, ObservableObject } from "@legendapp/state";
import { useAuthStore } from "./useAuthStore";
import { useEventsStore } from "./useEventsStore";
import { useWishlistStore } from "./useWishlistStore";
import { EnrichedEvent } from "@/types/enrichedEvents";
import { useEffect } from "react";

// Helper function to generate random IDs
const generateId = (prefix: string) => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${randomStr}`.toUpperCase();
};

interface BookingSeat {
  tariffType: string;
  quantity: number;
  pricePerSeat: number;
}

interface CreateBookingParams {
  eventId: string;
  seats: BookingSeat[];
  totalAmount: number;
  discountAmount: number;
  taxAmount: number;
  finalAmount: number;
  couponCode?: string;
  couponDiscount?: number;
}

interface BookingDetails {
  booking: typeof bookings.$inferSelect;
  seats: (typeof bookingSeats.$inferSelect)[];
  transactions: (typeof bookingTransactions.$inferSelect)[];
  cancellation?: typeof bookingCancellations.$inferSelect;
}

interface BookingWithEvent extends BookingDetails {
  event: EnrichedEvent;
}

interface ValidateCouponResult {
  isValid: boolean;
  coupon?: typeof coupons.$inferSelect;
  error?: string;
}

// Define the store state structure
interface StoreState {
  isLoading: boolean;
  currentBooking: typeof bookings.$inferSelect | null;
  userBookings: Array<typeof bookings.$inferSelect>;
  userBookingsWithEvents: Array<BookingWithEvent>;
  eventBookingStatus: Map<string, boolean>;
}

// Define the store methods
interface StoreMethods {
  createBooking: (params: CreateBookingParams) => Promise<string | null>;
  fetchUserBookings: () => Promise<void>;
  cancelBooking: (bookingId: string, reason: string) => Promise<boolean>;
  getBookingDetails: (bookingId: string) => Promise<BookingDetails | null>;
  getBookingWithEvent: (bookingId: string) => Promise<BookingWithEvent | null>;
  fetchUserBookingsWithEvents: () => Promise<void>;
  initialize: () => Promise<void>;
  validateCoupon: (
    code: string,
    totalAmount: number
  ) => Promise<ValidateCouponResult>;
  isEventBookedByUser: (eventId: string) => Promise<boolean>;
}

// Combine for the complete store type
type Store = ObservableObject<StoreState> & StoreMethods;

const _store = observable({
  isLoading: true,
  currentBooking: null,
  userBookings: [] as Array<typeof bookings.$inferSelect>,
  userBookingsWithEvents: [] as Array<BookingWithEvent>,
  eventBookingStatus: new Map() as Map<string, boolean>,

  createBooking: async (params: CreateBookingParams) => {
    const auth = useAuthStore();
    const userId = auth.user.get()?.userId;
    const eventsStore = useEventsStore();
    const wishlistStore = useWishlistStore();

    if (!userId) return null;

    try {
      _store.isLoading.set(true);

      // Check if user already has a booking for this event
      const existingBooking = await db
        .select()
        .from(bookings)
        .where(
          and(
            eq(bookings.userId, userId as string),
            eq(bookings.eventId, params.eventId),
            // Only check non-cancelled bookings
            not(eq(bookings.status, "cancelled"))
          )
        )
        .limit(1);

      if (existingBooking.length > 0) {
        throw new Error("You have already booked this event");
      }

      const bookingId = generateId("BKG");

      await db.transaction(async (tx) => {
        // Create the booking
        await tx.insert(bookings).values({
          bookingId,
          userId: userId as string,
          eventId: params.eventId,
          status: "paid",
          totalAmount: params.totalAmount,
          discountAmount: params.discountAmount,
          taxAmount: params.taxAmount,
          finalAmount: params.finalAmount,
          paymentStatus: "paid",
          couponCode: params.couponCode,
          couponDiscount: params.couponDiscount || 0,
          bookingDate: new Date().getTime(),
        });

        // Create booking seats and update tariff seats
        for (const seat of params.seats) {
          // First check if enough seats are available
          const tariff = await tx
            .select()
            .from(tariffs)
            .where(
              and(
                eq(tariffs.eventId, params.eventId),
                eq(tariffs.id, Number(seat.tariffType))
              )
            )
            .limit(1);

          if (!tariff.length || tariff[0].seats < seat.quantity) {
            throw new Error(`Not enough seats available for ${tariff[0].type}`);
          }

          // Insert booking seats
          await tx.insert(bookingSeats).values({
            bookingId,
            tariffType: seat.tariffType,
            quantity: seat.quantity,
            pricePerSeat: seat.pricePerSeat,
            totalPrice: seat.quantity * seat.pricePerSeat,
          });

          // Update remaining seats in tariffs
          await tx
            .update(tariffs)
            .set({
              seats: sql`${tariffs.seats} - ${seat.quantity}`,
            })
            .where(
              and(
                eq(tariffs.eventId, params.eventId),
                eq(tariffs.id, Number(seat.tariffType))
              )
            );
        }

        // Create transaction record
        await tx.insert(bookingTransactions).values({
          transactionId: generateId("TXN"),
          bookingId,
          amount: params.finalAmount,
          status: "initiated",
          paymentMethod: "pending",
          transactionDate: new Date().getTime(),
        });
      });

      const newBooking = await db
        .select()
        .from(bookings)
        .where(eq(bookings.bookingId, bookingId))
        .limit(1);

      if (newBooking.length > 0) {
        _store.currentBooking.set(newBooking[0]);
        await Promise.all([
          _store.fetchUserBookings(),
          _store.fetchUserBookingsWithEvents(),
        ]);
      }

      // After successful booking, remove from recently viewed and wishlist
      if (bookingId) {
        try {
          // Remove from recently viewed
          await db
            .delete(recentlyViewed)
            .where(
              and(
                eq(recentlyViewed.userId, userId),
                eq(recentlyViewed.eventId, params.eventId)
              )
            );

          // Remove from wishlist
          await db
            .delete(wishlist)
            .where(
              and(
                eq(wishlist.userId, userId),
                eq(wishlist.eventId, params.eventId)
              )
            );

          // Update stores to reflect changes
          eventsStore.fetchRecentlyViewed();
          wishlistStore.fetchWishlistEvents();

          console.log("Event removed from recently viewed and wishlist");
        } catch (error) {
          console.error("Error removing event from lists:", error);
          // Don't fail the booking if this part fails
        }
      }

      return bookingId;
    } catch (error) {
      console.error("Error creating booking:", error);
      if (error instanceof Error) {
        throw error; // Re-throw the error to handle it in the UI
      }
      return null;
    } finally {
      _store.isLoading.set(false);
    }
  },

  fetchUserBookings: async () => {
    const auth = useAuthStore();
    const userId = auth.user.get()?.userId;

    if (!userId) {
      _store.userBookings.set([]);
      return;
    }

    try {
      const userBookings = await db
        .select()
        .from(bookings)
        .where(eq(bookings.userId, userId as string))
        .orderBy(desc(bookings.bookingDate));

      _store.userBookings.set(userBookings);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      _store.userBookings.set([]);
    }
  },

  getBookingDetails: async (bookingId: string) => {
    try {
      const [booking, seats, transactions, cancellation] = await Promise.all([
        db
          .select()
          .from(bookings)
          .where(eq(bookings.bookingId, bookingId))
          .limit(1),
        db
          .select()
          .from(bookingSeats)
          .where(eq(bookingSeats.bookingId, bookingId)),
        db
          .select()
          .from(bookingTransactions)
          .where(eq(bookingTransactions.bookingId, bookingId)),
        db
          .select()
          .from(bookingCancellations)
          .where(eq(bookingCancellations.bookingId, bookingId))
          .limit(1),
      ]);

      if (booking.length === 0) return null;

      return {
        booking: booking[0],
        seats,
        transactions,
        cancellation: cancellation[0],
      };
    } catch (error) {
      console.error("Error fetching booking details:", error);
      return null;
    }
  },

  cancelBooking: async (eventId: string, reason: string) => {
    const auth = useAuthStore();
    const userId = auth.user.get()?.userId;

    if (!userId) return false;

    try {
      const booking = await db
        .select()
        .from(bookings)
        .where(
          and(
            eq(bookings.eventId, eventId),
            eq(bookings.userId, userId as string)
          )
        )
        .limit(1);

      if (booking.length === 0) return false;

      await db.transaction(async (tx) => {
        await tx
          .update(bookings)
          .set({
            status: "cancelled",
            updatedAt: new Date().getTime(),
          })
          .where(eq(bookings.eventId, eventId));

        await tx.insert(bookingCancellations).values({
          bookingId: booking[0].bookingId,
          reason,
          status: "cancelled",
          refundAmount: booking[0].finalAmount,
          refundStatus: "refunded",
          cancelledAt: new Date().getTime(),
        });
      });

      await _store.fetchUserBookings();
      return true;
    } catch (error) {
      console.error("Error cancelling booking:", error);
      return false;
    }
  },

  getBookingWithEvent: async (bookingId: string) => {
    try {
      const bookingDetails = await _store.getBookingDetails(bookingId);
      if (!bookingDetails) return null;

      const eventsStore = useEventsStore();
      const events = await eventsStore.fetchEventsByIds([
        bookingDetails.booking.eventId,
      ]);

      if (!events || events.length === 0) return null;

      return {
        ...bookingDetails,
        event: events[0],
      };
    } catch (error) {
      console.error("Error fetching booking with event:", error);
      return null;
    }
  },

  fetchUserBookingsWithEvents: async () => {
    const auth = useAuthStore();
    const userId = auth.user.get()?.userId;
    console.log("userId", userId);
    if (!userId) {
      _store.userBookingsWithEvents.set([]);
      return;
    }

    try {
      const userBookings = await db
        .select()
        .from(bookings)
        .where(eq(bookings.userId, userId as string))
        .orderBy(desc(bookings.bookingDate));

      const bookingsWithDetails = await Promise.all(
        userBookings.map(async (booking): Promise<BookingDetails> => {
          const [seats, transactions, cancellation] = await Promise.all([
            db
              .select()
              .from(bookingSeats)
              .where(eq(bookingSeats.bookingId, booking.bookingId)),
            db
              .select()
              .from(bookingTransactions)
              .where(eq(bookingTransactions.bookingId, booking.bookingId)),
            db
              .select()
              .from(bookingCancellations)
              .where(eq(bookingCancellations.bookingId, booking.bookingId))
              .limit(1),
          ]);

          return {
            booking,
            seats,
            transactions,
            cancellation: cancellation[0],
          };
        })
      );

      const eventsStore = useEventsStore();
      const eventIds = userBookings.map((booking) => booking.eventId);
      const events = await eventsStore.fetchEventsByIds(eventIds);
      const bookingsWithEvents = bookingsWithDetails
        .map((bookingDetail): BookingWithEvent | null => {
          const event = events.find(
            (event) => event.eventId === bookingDetail.booking.eventId
          );
          console.log("event3", event);
          if (!event) return null;

          return {
            ...bookingDetail,
            event,
          };
        })
        .filter((booking): booking is BookingWithEvent => booking !== null);
      console.log("bookingsWithEvents", bookingsWithEvents);
      _store.userBookingsWithEvents.set(bookingsWithEvents);
      console.log(
        "userBookingsWithEvents",
        _store.userBookingsWithEvents,
        _store.userBookingsWithEvents.get()
      );
    } catch (error) {
      console.error("Error fetching user bookings with events:", error);
      _store.userBookingsWithEvents.set([]);
    }
  },

  initialize: async () => {
    if (_store.isLoading.get()) {
      try {
        await Promise.all([
          _store.fetchUserBookings(),
          _store.fetchUserBookingsWithEvents(),
        ]);
      } catch (error) {
        console.error("Error initializing bookings store:", error);
      } finally {
        _store.isLoading.set(false);
      }
    }
  },

  validateCoupon: async (
    code: string,
    totalAmount: number
  ): Promise<ValidateCouponResult> => {
    try {
      const coupon = await db
        .select()
        .from(coupons)
        .where(
          and(
            eq(coupons.couponCode, code),
            eq(coupons.isActive, true),
            lte(coupons.startDate, new Date().getTime()),
            gte(coupons.endDate, new Date().getTime())
          )
        )
        .limit(1);

      if (coupon.length === 0) {
        return { isValid: false, error: "Invalid coupon code" };
      }

      const couponData = coupon[0];

      if (couponData.minPurchase && totalAmount < couponData.minPurchase) {
        return {
          isValid: false,
          error: `Minimum purchase amount of ₹${couponData.minPurchase} required`,
        };
      }

      if (
        couponData.usageLimit &&
        couponData.usedCount &&
        couponData.usedCount >= couponData.usageLimit
      ) {
        return { isValid: false, error: "Coupon usage limit exceeded" };
      }

      return { isValid: true, coupon: couponData };
    } catch (error) {
      console.error("Error validating coupon:", error);
      return { isValid: false, error: "Error validating coupon" };
    }
  },

  isEventBookedByUser: async (eventId: string) => {
    const auth = useAuthStore();
    const userId = auth.user.get()?.userId;

    if (!userId) {
      _store.eventBookingStatus.set(eventId, false);
      console.log("eventBookingStatus", _store.eventBookingStatus.get(eventId));
      return false;
    }

    try {
      const existingBooking = await db
        .select()
        .from(bookings)
        .where(
          and(
            eq(bookings.userId, userId as string),
            eq(bookings.eventId, eventId),
            not(eq(bookings.status, "cancelled"))
          )
        )
        .limit(1);

      const isBooked = existingBooking.length > 0;
      console.log("isBooked", isBooked);
      _store.eventBookingStatus.set(eventId, isBooked);
      console.log("eventBookingStatus", _store.eventBookingStatus.get(eventId));
      return isBooked;
    } catch (error) {
      console.error("Error checking event booking status:", error);
      _store.eventBookingStatus.set(eventId, false);
      return false;
    }
  },
}) as unknown as Store;

export const useBookingsStore = () => {
  useEffect(() => {
    _store.initialize();
  }, []);

  return _store;
};
