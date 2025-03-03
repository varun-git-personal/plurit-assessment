import { db } from "../db/init";
import { wishlist } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { observable } from "@legendapp/state";
import { useAuthStore } from "./useAuthStore";
import { useEventsStore } from "./useEventsStore";
import { EnrichedEvent } from "@/types/enrichedEvents";

interface WishlistState {
  isLoading: boolean;
  wishlistEvents: EnrichedEvent[];
  eventWishlistStatus: Record<string, boolean>;
}

const _store = observable<WishlistState>({
  isLoading: false,
  wishlistEvents: [],
  eventWishlistStatus: {},
});

export const useWishlistStore = () => {
  const fetchWishlistEvents = async () => {
    const auth = useAuthStore();
    const userId = auth.user.get()?.userId;
    const eventsStore = useEventsStore();

    if (!userId) {
      _store.wishlistEvents.set([]);
      return;
    }

    try {
      _store.isLoading.set(true);
      // Get all wishlist items for the user
      const wishlistItems = await db
        .select()
        .from(wishlist)
        .where(eq(wishlist.userId, userId as string));

      if (wishlistItems.length === 0) {
        _store.wishlistEvents.set([]);
        return;
      }

      // Get the enriched events for all wishlist items
      const eventIds = wishlistItems.map((item) => item.eventId);
      const events = await eventsStore.fetchEventsByIds(eventIds);

      // Update wishlist status for each event
      events.forEach((event) => {
        _store.eventWishlistStatus[event.eventId].set(true);
      });

      _store.wishlistEvents.set(events);
    } catch (error) {
      console.error("Error fetching wishlist events:", error);
      _store.wishlistEvents.set([]);
    } finally {
      _store.isLoading.set(false);
    }
  };

  const addToWishlist = async (eventId: string) => {
    const auth = useAuthStore();
    const userId = auth.user.get()?.userId;

    if (!userId) return false;

    try {
      // Check if already in wishlist
      const existing = await db
        .select()
        .from(wishlist)
        .where(
          and(
            eq(wishlist.userId, userId as string),
            eq(wishlist.eventId, eventId)
          )
        )
        .limit(1);

      if (existing.length > 0) return true;

      // Add to wishlist
      await db.insert(wishlist).values({
        userId: userId as string,
        eventId,
      });

      _store.eventWishlistStatus[eventId].set(true);
      await fetchWishlistEvents();
      return true;
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      return false;
    }
  };

  const removeFromWishlist = async (eventId: string) => {
    const auth = useAuthStore();
    const userId = auth.user.get()?.userId;

    if (!userId) return false;

    try {
      await db
        .delete(wishlist)
        .where(
          and(
            eq(wishlist.userId, userId as string),
            eq(wishlist.eventId, eventId)
          )
        );

      _store.eventWishlistStatus[eventId].set(false);
      await fetchWishlistEvents();
      return true;
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      return false;
    }
  };

  const isInWishlist = async (eventId: string) => {
    const auth = useAuthStore();
    const userId = auth.user.get()?.userId;

    if (!userId) {
      _store.eventWishlistStatus[eventId].set(false);
      return false;
    }

    try {
      const existing = await db
        .select()
        .from(wishlist)
        .where(
          and(
            eq(wishlist.userId, userId as string),
            eq(wishlist.eventId, eventId)
          )
        )
        .limit(1);

      const isWishlisted = existing.length > 0;
      _store.eventWishlistStatus[eventId].set(isWishlisted);
      return isWishlisted;
    } catch (error) {
      console.error("Error checking wishlist status:", error);
      _store.eventWishlistStatus[eventId].set(false);
      return false;
    }
  };

  return {
    isLoading: _store.isLoading,
    wishlistEvents: _store.wishlistEvents,
    eventWishlistStatus: _store.eventWishlistStatus,
    fetchWishlistEvents,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  } as const;
};
