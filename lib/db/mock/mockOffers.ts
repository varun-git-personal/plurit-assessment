import { mockCoupons } from "./mockCoupons";

// Map offers to specific coupons
export const mockOffers = [
  {
    offerId: "o1",
    offerDescription: "Early bird registration",
    discount: 20,
    couponCode: mockCoupons[4].couponCode, // EARLYBIRD
  },
  {
    offerId: "o2",
    offerDescription: "Student discount",
    discount: 30,
    couponCode: mockCoupons[0].couponCode, // WELCOME50
  },
  {
    offerId: "o3",
    offerDescription: "Group booking (5+ people)",
    discount: 25,
    couponCode: mockCoupons[2].couponCode, // SUMMER25
  },
  {
    offerId: "o4",
    offerDescription: "Senior citizen special",
    discount: 15,
    couponCode: mockCoupons[3].couponCode, // SPECIAL10
  },
  {
    offerId: "o5",
    offerDescription: "Corporate package",
    discount: 10,
    couponCode: mockCoupons[1].couponCode, // FLAT200
  },
  {
    offerId: "o6",
    offerDescription: "First-time attendee",
    discount: 15,
    couponCode: mockCoupons[0].couponCode, // WELCOME50
  },
  {
    offerId: "o7",
    offerDescription: "Member discount",
    discount: 20,
    couponCode: mockCoupons[2].couponCode, // SUMMER25
  },
  {
    offerId: "o8",
    offerDescription: "Last-minute deal",
    discount: 40,
    couponCode: mockCoupons[3].couponCode, // SPECIAL10
  },
  {
    offerId: "o9",
    offerDescription: "Family package",
    discount: 25,
    couponCode: mockCoupons[1].couponCode, // FLAT200
  },
  {
    offerId: "o10",
    offerDescription: "Loyalty reward",
    discount: 30,
    couponCode: mockCoupons[4].couponCode, // EARLYBIRD
  },
] as const;

// Add type safety
export type MockOffer = (typeof mockOffers)[number];

export default mockOffers;
