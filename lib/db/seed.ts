import { db } from "@/lib/db/init";
import dayjs from "dayjs";
import {
  categories,
  genres,
  languages,
  tariffs,
  inclusions,
  rules,
  offers,
  cast,
  eventInclusions,
  eventRules,
  eventOffers,
  eventCast,
  events,
  userAuth,
  userProfile,
  coupons,
} from "@/lib/db/schema";
import {
  mockCategories,
  mockGenres,
  mockInclusions,
  mockRules,
  mockOffers,
  mockCast,
  mockCoupons,
} from "@/lib/db/mock";
import { mockUserAuth, mockUserProfiles } from "@/lib/db/mock/mockUsers";
import mockEvents from "@/lib/db/mock/mockData";

export async function seedCategories() {
  try {
    await db.insert(categories).values(
      mockCategories.map((category) => ({
        name: category.categoryName,
        type: category.categoryType || "Entertainment", // You'll need to add type to your mock data
        image: category.image || "default-category-image.jpg", // You'll need to add image to your mock data
        categoryId: category.categoryId,
      }))
    );
    console.log("Successfully seeded categories table");
  } catch (error) {
    console.error("Error seeding categories:", error);
    throw error;
  }
}

export async function seedGenres() {
  try {
    const uniqueGenres = Array.from(
      new Set(mockEvents.map((event) => JSON.stringify(event.genre)))
    ).map((genre) => JSON.parse(genre));
    await db.insert(genres).values(
      uniqueGenres.map((genre) => ({
        name: genre.genreName,
        genreId: genre.genreId,
      }))
    );
    console.log("Successfully seeded genres table");
  } catch (error) {
    console.error("Error seeding genres:", error);
    throw error;
  }
}

export async function seedLanguages() {
  try {
    const uniqueLanguages = Array.from(
      new Set(mockEvents.map((event) => JSON.stringify(event.language)))
    ).map((lang) => JSON.parse(lang));

    await db.insert(languages).values(
      uniqueLanguages.map((lang) => ({
        name: lang.languageName,
        languageId: lang.languageId,
      }))
    );
    console.log("Successfully seeded languages table");
  } catch (error) {
    console.error("Error seeding languages:", error);
    throw error;
  }
}

export async function seedInclusions() {
  try {
    await db.insert(inclusions).values(
      mockInclusions.map((inclusion) => ({
        name: inclusion.inclusionType,
        inclusionId: inclusion.inclusionId,
      }))
    );
    console.log("Successfully seeded inclusions table");
  } catch (error) {
    console.error("Error seeding inclusions:", error);
    throw error;
  }
}

export async function seedRules() {
  try {
    await db.insert(rules).values(
      mockRules.map((rule) => ({
        description: rule.ruleType,
        ruleId: rule.ruleId,
      }))
    );
    console.log("Successfully seeded rules table");
  } catch (error) {
    console.error("Error seeding rules:", error);
    throw error;
  }
}
export async function seedCoupons() {
  try {
    await db.insert(coupons).values(
      mockCoupons.map((coupon) => ({
        couponCode: coupon.couponCode,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscount: coupon.maxDiscount,
        minPurchase: coupon.minPurchase,
        startDate: coupon.startDate,
        endDate: coupon.endDate,
        usageLimit: coupon.usageLimit,
        isActive: coupon.isActive,
      }))
    );
    console.log("Successfully seeded coupons table");
  } catch (error) {
    console.error("Error seeding coupons:", error);
    throw error;
  }
}

export async function seedOffers() {
  try {
    // First get the seeded coupons to get their IDs
    const seededCoupons = await db.select().from(coupons);

    // Create a map of coupon codes to IDs
    const couponCodeToId = new Map(
      seededCoupons.map((coupon) => [coupon.couponCode, coupon.id])
    );

    await db.insert(offers).values(
      mockOffers.map((offer) => ({
        name: offer.offerDescription,
        description: offer.offerDescription || null,
        discountPercentage: offer.discount || null,
        validUntil: dayjs().add(1, "month").toDate().getTime(),
        offerId: offer.offerId,
        // Link to the correct coupon ID based on the coupon code
        couponId: couponCodeToId.get(offer.couponCode) || null,
      }))
    );
    console.log("Successfully seeded offers table");
  } catch (error) {
    console.error("Error seeding offers:", error);
    throw error;
  }
}

export async function seedCast() {
  try {
    await db.insert(cast).values(
      mockCast.map((castMember) => ({
        name: castMember.castName,
        role: castMember.role,
        castId: castMember.castId,
      }))
    );
    console.log("Successfully seeded cast table");
  } catch (error) {
    console.error("Error seeding cast:", error);
    throw error;
  }
}

export function seedIndependentTables() {
  seedCategories();
  seedGenres();
  seedLanguages();
  seedInclusions();
  seedRules();
}

export async function seedEvents() {
  try {
    const eventsData = mockEvents.map((event) => ({
      title: event.title,
      eventId: event.id,
      description: event.description,
      date: event.date.valueOf(), // Convert dayjs to timestamp
      categoryId: event.category.categoryId,
      genreId: event.genre.genreId,
      duration: event.duration,
      location: event.location,
      city: event.city,
      languageId: event.language.languageId,
      image: event.image,
      time: event.time,
      isFeatured: event.isFeatured ? 1 : 0, // Convert boolean to 0/1
      isTrending: event.isTrending ? 1 : 0, // Convert boolean to 0/1
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }));

    // Insert events one at a time to handle type conversion
    for (const event of eventsData) {
      await db.insert(events).values({
        ...event,
        categoryId: event.categoryId,
        genreId: event.genreId,
        languageId: event.languageId,
      });
    }
    console.log("Successfully seeded events table");
  } catch (error) {
    console.error("Error seeding events:", error);
    throw error;
  }
}

export async function seedTariffs() {
  try {
    const allTariffs = mockEvents.flatMap((event) =>
      event.tariffs.map((tariff) => ({
        eventId: event.id,
        type: tariff.tariffType,
        price: tariff.price,
        seats: tariff.seats,
      }))
    );

    // Insert tariffs one at a time to handle type conversion
    for (const tariff of allTariffs) {
      console.log(tariff);
      await db.insert(tariffs).values({
        ...tariff,
        eventId: tariff.eventId,
      });
    }
    console.log("Successfully seeded tariffs table");
  } catch (error) {
    console.error("Error seeding tariffs:", error);
    throw error;
  }
}

export async function seedEventInclusions() {
  try {
    const eventInclusionsData = mockEvents.flatMap((event) =>
      event.inclusions.map((inclusion) => ({
        eventId: event.id,
        inclusionId: inclusion.inclusionId,
      }))
    );

    await db.insert(eventInclusions).values(eventInclusionsData);
    console.log("Successfully seeded event_inclusions table");
  } catch (error) {
    console.error("Error seeding event_inclusions:", error);
    throw error;
  }
}

export async function seedEventRules() {
  try {
    const eventRulesData = mockEvents.flatMap((event) =>
      event.rules.map((rule) => ({
        eventId: event.id,
        ruleId: rule.ruleId,
      }))
    );

    await db.insert(eventRules).values(eventRulesData);
    console.log("Successfully seeded event_rules table");
  } catch (error) {
    console.error("Error seeding event_rules:", error);
    throw error;
  }
}

export async function seedEventOffers() {
  try {
    const eventOffersData = mockEvents.flatMap((event) =>
      event.offers.map((offer) => ({
        eventId: event.id,
        offerId: offer.offerId,
      }))
    );

    await db.insert(eventOffers).values(eventOffersData);
    console.log("Successfully seeded event_offers table");
  } catch (error) {
    console.error("Error seeding event_offers:", error);
    throw error;
  }
}

export async function seedEventCast() {
  try {
    const eventCastData = mockEvents.flatMap((event) =>
      event.cast.map((castMember) => ({
        eventId: event.id,
        castId: castMember.castId,
      }))
    );

    await db.insert(eventCast).values(eventCastData);
    console.log("Successfully seeded event_cast table");
  } catch (error) {
    console.error("Error seeding event_cast:", error);
    throw error;
  }
}

export async function seedUsers() {
  try {
    // Seed user authentication data
    for (const user of mockUserAuth) {
      await db.insert(userAuth).values({
        ...user,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    console.log("Successfully seeded user_auth table");

    // Seed user profile data
    for (const profile of mockUserProfiles) {
      await db.insert(userProfile).values({
        ...profile,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    console.log("Successfully seeded user_profile table");
  } catch (error) {
    console.error("Error seeding users:", error);
    throw error;
  }
}

// Optional: Add a cleanup function to clear all tables before seeding
export async function cleanup() {
  try {
    await db.delete(eventCast);
    await db.delete(eventOffers);
    await db.delete(eventRules);
    await db.delete(eventInclusions);
    await db.delete(tariffs);
    await db.delete(events);
    await db.delete(cast);
    await db.delete(coupons);
    await db.delete(offers);
    await db.delete(rules);
    await db.delete(inclusions);
    await db.delete(languages);
    await db.delete(genres);
    await db.delete(categories);
    await db.delete(userAuth);
    await db.delete(userProfile);
    console.log("Successfully cleaned up all tables");
  } catch (error) {
    console.error("Error cleaning up tables:", error);
    throw error;
  }
}

export async function seedAll() {
  try {
    // Optional: Uncomment if you want to clean up before seeding
    // await cleanup();

    // Seed independent tables first
    await seedCategories();
    await seedGenres();
    await seedLanguages();
    await seedInclusions();
    await seedRules();
    await seedCoupons();
    await seedOffers();
    await seedCast();

    // Seed events
    await seedEvents();

    // Seed dependent and junction tables
    await seedTariffs();
    await seedEventInclusions();
    await seedEventRules();
    await seedEventOffers();
    await seedEventCast();

    // Add user seeding
    await seedUsers();

    console.log("Successfully completed all seed operations");
  } catch (error) {
    console.error("Error during seed operations:", error);
    throw error;
  }
}
