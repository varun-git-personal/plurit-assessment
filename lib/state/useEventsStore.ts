import { db } from "../db/init";
import {
  events,
  categories,
  tariffs,
  eventCast,
  eventRules,
  eventOffers,
  eventInclusions,
  genres,
  inclusions,
  cast,
  rules,
  offers,
  languages,
  recentlyViewed,
  coupons,
} from "../db/schema";
import { eq, inArray, desc, and, sql } from "drizzle-orm";
import { observable } from "@legendapp/state";
import { EnrichedEvent } from "../../types/enrichedEvents";
import { useAuthStore } from "./useAuthStore";

const MAX_RECENT_EVENTS = 10;

interface Store {
  isLoading: boolean;
  events: EnrichedEvent[];
  recentlyViewedEvents: EnrichedEvent[];
  categories: (typeof categories.$inferSelect)[];
  filteredCategories: (typeof categories.$inferSelect)[];
  categoryTypes: "All" | "Entertainment" | "Academic" | "Volunteering";
  fetchEventsByIds: (eventIds: string[]) => Promise<EnrichedEvent[]>;
  fetchAllEvents: () => Promise<void>;
  fetchAllCategories: () => Promise<void>;
  addToRecentlyViewed: (eventId: string) => Promise<void>;
  fetchRecentlyViewed: () => Promise<void>;
  getCategoriesByType: (
    type: "All" | "Entertainment" | "Academic" | "Volunteering"
  ) => (typeof categories.$inferSelect)[];
  setCategoryType: (
    type: "All" | "Entertainment" | "Academic" | "Volunteering"
  ) => void;
  initialize: () => Promise<void>;
}

const _store = observable<Store>({
  isLoading: true,
  events: [],
  recentlyViewedEvents: [],
  categories: [],
  filteredCategories: [],
  categoryTypes: "All",

  // Reusable function to fetch events by IDs
  fetchEventsByIds: async (eventIds: string[]) => {
    // Get base events
    const eventsData = await db
      .select()
      .from(events)
      .leftJoin(categories, eq(events.categoryId, categories.categoryId))
      .leftJoin(genres, eq(events.genreId, genres.genreId))
      .where(inArray(events.eventId, eventIds));

    if (eventsData.length === 0) return [];

    // Get related data with their names/details
    const [
      tariffsData,
      inclusionsData,
      castData,
      rulesData,
      offersData,
      languagesData,
    ] = await Promise.all([
      db
        .select({
          tariff: tariffs,
          event: events,
        })
        .from(tariffs)
        .leftJoin(events, eq(tariffs.eventId, events.eventId))
        .where(inArray(tariffs.eventId, eventIds)),

      db
        .select({
          inclusion: eventInclusions,
          inclusionDetails: inclusions,
        })
        .from(eventInclusions)
        .leftJoin(
          inclusions,
          eq(eventInclusions.inclusionId, inclusions.inclusionId)
        )
        .where(inArray(eventInclusions.eventId, eventIds)),

      db
        .select({
          castMember: eventCast,
          castDetails: cast,
        })
        .from(eventCast)
        .leftJoin(cast, eq(eventCast.castId, cast.castId))
        .where(inArray(eventCast.eventId, eventIds)),

      db
        .select({
          rule: eventRules,
          ruleDetails: rules,
        })
        .from(eventRules)
        .leftJoin(rules, eq(eventRules.ruleId, rules.ruleId))
        .where(inArray(eventRules.eventId, eventIds)),

      db
        .select({
          offer: eventOffers,
          offerDetails: offers,
          coupon: coupons,
        })
        .from(eventOffers)
        .leftJoin(offers, eq(eventOffers.offerId, offers.offerId))
        .leftJoin(coupons, eq(offers.couponId, coupons.id))
        .where(inArray(eventOffers.eventId, eventIds)),

      db
        .select({
          language: languages,
        })
        .from(languages)
        .where(
          inArray(
            languages.languageId,
            eventsData
              .map((e) => e.events.languageId)
              .filter((id): id is string => id !== null)
          )
        ),
    ]);

    // Combine the data
    return eventsData.map((event) => ({
      ...event.events,
      category: event.categories,
      genre: event.genres,
      tariffs: tariffsData
        .filter((t) => t.tariff.eventId === event.events.eventId)
        .map((t) => ({
          ...t.tariff,
          eventDetails: t.event,
        })),
      inclusions: inclusionsData
        .filter((i) => i.inclusion.eventId === event.events.eventId)
        .map((i) => ({
          ...i.inclusion,
          details: i.inclusionDetails,
        })),
      cast: castData
        .filter((c) => c.castMember.eventId === event.events.eventId)
        .map((c) => ({
          ...c.castMember,
          details: c.castDetails,
        })),
      rules: rulesData
        .filter((r) => r.rule.eventId === event.events.eventId)
        .map((r) => ({
          ...r.rule,
          details: r.ruleDetails,
        })),
      offers: offersData
        .filter((o) => o.offer.eventId === event.events.eventId)
        .map((o) => ({
          ...o.offer,
          details: o.offerDetails,
          coupon: o.coupon
            ? {
                code: o.coupon.couponCode,
                description: o.coupon.description,
                discountType: o.coupon.discountType,
                discountValue: o.coupon.discountValue,
                maxDiscount: o.coupon.maxDiscount,
                minPurchase: o.coupon.minPurchase,
                isActive: o.coupon.isActive,
                validUntil: o.coupon.endDate,
              }
            : null,
        })),
      languages: languagesData
        .filter((l) => l.language.languageId === event.events.languageId)
        .map((l) => ({
          ...l.language,
        })),
    })) as EnrichedEvent[];
  },

  // Modified to use fetchEventsByIds
  fetchAllEvents: async () => {
    const allEvents = await db.select({ eventId: events.eventId }).from(events);
    const eventIds = allEvents.map((e) => e.eventId);
    const enrichedEvents = await _store.fetchEventsByIds(eventIds);
    _store.events.set(enrichedEvents);
  },

  // New function to add an event to recently viewed
  addToRecentlyViewed: async (eventId: string) => {
    const auth = useAuthStore();
    const userId = auth.user.get()?.userId as unknown as string;

    if (!userId) return;

    try {
      // Check if this event was already viewed by this user
      const existing = await db
        .select()
        .from(recentlyViewed)
        .where(
          and(
            eq(recentlyViewed.userId, userId),
            eq(recentlyViewed.eventId, eventId)
          )
        );

      if (existing.length > 0) {
        // Update the viewedAt timestamp
        await db
          .update(recentlyViewed)
          .set({ viewedAt: new Date().getTime() })
          .where(eq(recentlyViewed.id, existing[0].id));
      } else {
        // Insert new view
        await db.insert(recentlyViewed).values({
          userId,
          eventId,
          viewedAt: new Date().getTime(),
        });

        // Check if we need to remove old entries
        type CountResult = { value: number }[];
        const count = (await db
          .select({ value: sql`count(*) as value` })
          .from(recentlyViewed)
          .where(eq(recentlyViewed.userId, userId))) as CountResult;

        if (count?.[0]?.value > MAX_RECENT_EVENTS) {
          // Delete oldest entries directly
          await db
            .delete(recentlyViewed)
            .where(
              and(
                eq(recentlyViewed.userId, userId),
                inArray(
                  recentlyViewed.id,
                  db
                    .select({ id: recentlyViewed.id })
                    .from(recentlyViewed)
                    .where(eq(recentlyViewed.userId, userId))
                    .orderBy(desc(recentlyViewed.viewedAt))
                    .offset(MAX_RECENT_EVENTS)
                )
              )
            );
        }
      }

      // Refresh the recently viewed events
      await _store.fetchRecentlyViewed();
    } catch (error) {
      console.error("Error adding to recently viewed:", error);
    }
  },

  // New function to fetch recently viewed events
  fetchRecentlyViewed: async () => {
    const auth = useAuthStore();
    const userId = auth.user.get()?.userId as unknown as string;
    if (!userId) {
      _store.recentlyViewedEvents.set([]);
      return;
    }

    try {
      // Get recently viewed events for the user
      const recentlyViewedData = await db
        .select({
          id: recentlyViewed.id,
          eventId: recentlyViewed.eventId,
          viewedAt: recentlyViewed.viewedAt,
        })
        .from(recentlyViewed)
        .where(eq(recentlyViewed.userId, userId))
        .orderBy(desc(recentlyViewed.viewedAt))
        .limit(MAX_RECENT_EVENTS);

      if (recentlyViewedData.length === 0) {
        _store.recentlyViewedEvents.set([]);
        return;
      }

      // Get the enriched events
      const eventIds = recentlyViewedData.map((rv) => rv.eventId);
      const enrichedEvents = await _store.fetchEventsByIds(eventIds);

      // Sort them according to viewedAt order
      const sortedEvents = enrichedEvents.sort((a, b) => {
        const aViewedAt =
          recentlyViewedData.find((rv) => rv.eventId === a.eventId)?.viewedAt ??
          0;
        const bViewedAt =
          recentlyViewedData.find((rv) => rv.eventId === b.eventId)?.viewedAt ??
          0;
        return bViewedAt - aViewedAt;
      });

      _store.recentlyViewedEvents.set(sortedEvents);
    } catch (error) {
      console.error("Error fetching recently viewed events:", error);
      _store.recentlyViewedEvents.set([]);
    }
  },

  fetchAllCategories: async () => {
    const categoriesData = await db.select().from(categories);
    _store.categories.set(categoriesData);
  },

  getCategoriesByType: (
    type: "All" | "Entertainment" | "Academic" | "Volunteering"
  ): (typeof categories.$inferSelect)[] => {
    if (type === "All") {
      return _store.categories.get();
    }
    return _store.categories.get().filter((category) => category.type === type);
  },

  setCategoryType: (
    type: "All" | "Entertainment" | "Academic" | "Volunteering"
  ) => {
    _store.categoryTypes.set(type);
    const filtered = _store.getCategoriesByType(type);
    _store.filteredCategories.set(filtered);
  },

  initialize: async (userId?: string) => {
    if (_store.isLoading.get()) {
      try {
        await Promise.all([
          _store.fetchAllEvents(),
          _store.fetchAllCategories(),
          _store.fetchRecentlyViewed(),
        ]);
        _store.setCategoryType("All");
      } finally {
        _store.isLoading.set(false);
      }
    }
  },
});

export const useEventsStore = (userId?: string) => {
  // Initialize on first use with the userId if provided
  _store.initialize();
  return _store;
};
