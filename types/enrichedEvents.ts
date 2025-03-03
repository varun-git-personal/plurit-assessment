import {
  events,
  categories,
  genres,
  tariffs,
  eventInclusions,
  inclusions,
  eventCast,
  cast,
  eventRules,
  rules,
  eventOffers,
  offers,
  languages,
} from "../lib/db/schema";

type BaseEvent = typeof events.$inferSelect;
type Category = typeof categories.$inferSelect;
type Genre = typeof genres.$inferSelect;

type Tariff = typeof tariffs.$inferSelect & {
  eventDetails: BaseEvent;
};

type Inclusion = typeof eventInclusions.$inferSelect & {
  details: typeof inclusions.$inferSelect;
};

type CastMember = typeof eventCast.$inferSelect & {
  details: typeof cast.$inferSelect;
};

type Rule = typeof eventRules.$inferSelect & {
  details: typeof rules.$inferSelect;
};

type Offer = typeof eventOffers.$inferSelect & {
  details: typeof offers.$inferSelect;
};

type Language = typeof languages.$inferSelect;

export type EnrichedEvent = BaseEvent & {
  category: Category | null;
  genre: Genre | null;
  tariffs: Tariff[];
  inclusions: Inclusion[];
  cast: CastMember[];
  rules: Rule[];
  languages: Language[];
  offers: Array<{
    details: typeof offers.$inferSelect;
    coupon?: {
      code: string;
      description: string;
      discountType: string;
      discountValue: number;
      maxDiscount?: number;
      minPurchase: number;
      isActive: boolean;
      validUntil: number;
    } | null;
  }>;
};
