import { sql } from "drizzle-orm";
import {
  text,
  integer,
  sqliteTable,
  real,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// Language table
export const languages = sqliteTable("languages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  languageId: text("language_id").notNull(),
  name: text("name").notNull(),
});

// Categories table
export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  categoryId: text("category_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'Entertainment', 'Academic', 'Volunteering'
  image: text("image").notNull(),
});

// Genres table
export const genres = sqliteTable("genres", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  genreId: text("genre_id").notNull(),
  name: text("name").notNull(),
});

// Cast table
export const cast = sqliteTable("cast", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  castId: text("cast_id").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
});

// Inclusions table
export const inclusions = sqliteTable("inclusions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  inclusionId: text("inclusion_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
});

// Rules table
export const rules = sqliteTable("rules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ruleId: text("rule_id").notNull(),
  description: text("description").notNull(),
});

// Offers table
export const offers = sqliteTable("offers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  offerId: text("offer_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  discountPercentage: real("discount_percentage"),
  validUntil: integer("valid_until"), // SQLite stores timestamps as integers
  createdAt: integer("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at").default(sql`CURRENT_TIMESTAMP`),
  couponId: integer("coupon_id").references(() => coupons.id),
});

// Events table
export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: text("event_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: integer("date").notNull(), // SQLite stores timestamps as integers
  categoryId: text("category_id").references(() => categories.categoryId),
  genreId: text("genre_id").references(() => genres.genreId),
  duration: integer("duration").notNull(), // in minutes
  location: text("location").notNull(),
  city: text("city").notNull(),
  languageId: text("language_id").references(() => languages.languageId),
  image: text("image").notNull(),
  time: text("time").notNull(),
  isFeatured: integer("is_featured").default(0), // Using integer for boolean (0/1)
  isTrending: integer("is_trending").default(0), // Using integer for boolean (0/1)
  createdAt: integer("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Tariffs table
export const tariffs = sqliteTable("tariffs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: text("event_id").references(() => events.eventId),
  type: text("type").notNull(), // 'platinum', 'gold', 'silver'
  price: real("price").notNull(),
  seats: integer("seats").notNull(),
  createdAt: integer("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Junction tables for many-to-many relationships
export const eventInclusions = sqliteTable("event_inclusions", {
  eventId: text("event_id").references(() => events.eventId),
  inclusionId: text("inclusion_id").references(() => inclusions.inclusionId),
});

export const eventRules = sqliteTable("event_rules", {
  eventId: text("event_id").references(() => events.eventId),
  ruleId: text("rule_id").references(() => rules.ruleId),
});

export const eventOffers = sqliteTable("event_offers", {
  eventId: text("event_id").references(() => events.eventId),
  offerId: text("offer_id").references(() => offers.offerId),
});

export const eventCast = sqliteTable("event_cast", {
  eventId: text("event_id").references(() => events.eventId),
  castId: text("cast_id").references(() => cast.castId),
});

// User Authentication table
export const userAuth = sqliteTable(
  "user_auth",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id").notNull().unique(),
    username: text("username").notNull().unique(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    isVerified: integer("is_verified").default(0),
    createdAt: integer("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => {
    return {
      emailIdx: index("email_idx").on(table.email),
      usernameIdx: index("username_idx").on(table.username),
    };
  }
);

export const userProfile = sqliteTable("user_profile", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => userAuth.userId)
    .unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  avatar: text("avatar"),
  dateOfBirth: integer("date_of_birth"),
  gender: text("gender"),
  city: text("city"),
  bio: text("bio"),
  preferences: text("preferences"), // JSON string of user preferences
  lastActive: integer("last_active"),
  createdAt: integer("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Wishlist table
export const wishlist = sqliteTable(
  "wishlist",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => userAuth.userId),
    eventId: text("event_id")
      .notNull()
      .references(() => events.eventId),
    createdAt: integer("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => {
    return {
      userEventUnique: uniqueIndex("user_event_unique_idx").on(
        table.userId,
        table.eventId
      ),
      userIdx: index("user_idx").on(table.userId),
    };
  }
);

// Recently viewed table
export const recentlyViewed = sqliteTable(
  "recently_viewed",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => userAuth.userId),
    eventId: text("event_id")
      .notNull()
      .references(() => events.eventId),
    viewedAt: integer("viewed_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => {
    return {
      userViewedAtIdx: index("user_viewed_at_idx").on(
        table.userId,
        table.viewedAt
      ),
    };
  }
);

// Bookings related tables
export const bookings = sqliteTable(
  "bookings",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    bookingId: text("booking_id").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => userAuth.userId),
    eventId: text("event_id")
      .notNull()
      .references(() => events.eventId),
    status: text("status").notNull(), // 'pending', 'confirmed', 'cancelled', 'completed'
    totalAmount: real("total_amount").notNull(),
    discountAmount: real("discount_amount").default(0),
    taxAmount: real("tax_amount").notNull(),
    finalAmount: real("final_amount").notNull(),
    paymentStatus: text("payment_status").notNull(), // 'pending', 'paid', 'failed', 'refunded'
    paymentMethod: text("payment_method"), // 'card', 'upi', 'netbanking', etc.
    transactionId: text("transaction_id"),
    couponCode: text("coupon_code"),
    couponDiscount: real("coupon_discount").default(0),
    bookingDate: integer("booking_date").default(sql`CURRENT_TIMESTAMP`),
    createdAt: integer("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => {
    return {
      userIdIdx: index("bookings_user_id_idx").on(table.userId),
      eventIdIdx: index("bookings_event_id_idx").on(table.eventId),
      bookingDateIdx: index("bookings_date_idx").on(table.bookingDate),
      statusIdx: index("bookings_status_idx").on(table.status),
    };
  }
);

export const bookingSeats = sqliteTable(
  "booking_seats",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    bookingId: text("booking_id")
      .notNull()
      .references(() => bookings.bookingId),
    tariffType: text("tariff_type").notNull(), // 'platinum', 'gold', 'silver'
    quantity: integer("quantity").notNull(),
    pricePerSeat: real("price_per_seat").notNull(),
    totalPrice: real("total_price").notNull(),
    createdAt: integer("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => {
    return {
      bookingIdIdx: index("booking_seats_booking_id_idx").on(table.bookingId),
    };
  }
);

export const bookingTransactions = sqliteTable(
  "booking_transactions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    transactionId: text("transaction_id").notNull().unique(),
    bookingId: text("booking_id")
      .notNull()
      .references(() => bookings.bookingId),
    amount: real("amount").notNull(),
    status: text("status").notNull(), // 'initiated', 'processing', 'success', 'failed'
    paymentMethod: text("payment_method").notNull(),
    paymentDetails: text("payment_details"), // JSON string with payment gateway response
    errorMessage: text("error_message"),
    transactionDate: integer("transaction_date").default(
      sql`CURRENT_TIMESTAMP`
    ),
    createdAt: integer("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => {
    return {
      bookingIdIdx: index("booking_transactions_booking_id_idx").on(
        table.bookingId
      ),
      transactionDateIdx: index("booking_transactions_date_idx").on(
        table.transactionDate
      ),
      statusIdx: index("booking_transactions_status_idx").on(table.status),
    };
  }
);

export const bookingCancellations = sqliteTable(
  "booking_cancellations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    bookingId: text("booking_id")
      .notNull()
      .references(() => bookings.bookingId),
    reason: text("reason").notNull(),
    status: text("status").notNull(), // 'pending', 'approved', 'rejected'
    refundAmount: real("refund_amount"),
    refundStatus: text("refund_status"), // 'pending', 'processed', 'failed'
    refundTransactionId: text("refund_transaction_id"),
    cancelledAt: integer("cancelled_at").default(sql`CURRENT_TIMESTAMP`),
    createdAt: integer("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => {
    return {
      bookingIdIdx: index("booking_cancellations_booking_id_idx").on(
        table.bookingId
      ),
      statusIdx: index("booking_cancellations_status_idx").on(table.status),
    };
  }
);

export const coupons = sqliteTable(
  "coupons",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    couponCode: text("coupon_code").notNull().unique(),
    description: text("description").notNull(),
    discountType: text("discount_type").notNull(), // 'percentage' or 'fixed'
    discountValue: real("discount_value").notNull(),
    maxDiscount: real("max_discount"), // For percentage discounts
    minPurchase: real("min_purchase").default(0),
    startDate: integer("start_date").notNull(),
    endDate: integer("end_date").notNull(),
    usageLimit: integer("usage_limit"), // null means unlimited
    usedCount: integer("used_count").default(0),
    isActive: integer("is_active", { mode: "boolean" }).default(true),
    createdAt: integer("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => {
    return {
      codeIdx: index("coupons_code_idx").on(table.couponCode),
      activeIdx: index("coupons_active_idx").on(table.isActive),
      dateIdx: index("coupons_date_idx").on(table.endDate),
    };
  }
);
