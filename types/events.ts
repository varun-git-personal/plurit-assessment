import { type Dayjs } from "dayjs";

export type eventTypes = "Entertainment" | "Academic" | "Volunteering";

export type category = {
  categoryId: string;
  categoryName: string;
  categoryType: eventTypes;
  image: string;
};

export type genre = {
  genreId: string;
  genreName: string;
};

export type language = {
  languageId: string;
  languageName: string;
};

export type tariffType = "platinum" | "gold" | "silver";

export type tariff = {
  tariffId: string;
  tariffType: tariffType;
  price: number;
  seats: number;
};

export type InclusionType =
  | "food"
  | "drink"
  | "transportation"
  | "accommodation"
  | "parking";

export type inclusions = {
  inclusionId: string;
  inclusionType: InclusionType;
};

export type rules = {
  ruleId: string;
  ruleType: string;
};

export type offer = {
  offerId: string;
  offerDescription: string;
  discount: number;
};

export type cast = {
  castId: string;
  castName: string;
  role: string;
};

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Dayjs;
  category: category;
  genre: genre;
  duration: number;
  location: string;
  language: language;
  image: string;
  time: string;
  tariffs: tariff[];
  inclusions: inclusions[];
  rules: rules[];
  offers: offer[];
  city: string;
  isFeatured: boolean;
  isTrending: boolean;
  cast: cast[];
}
