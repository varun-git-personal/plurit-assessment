import { coupons } from "../schema";

const NOW = new Date().getTime();
const ONE_MONTH = 30 * 24 * 60 * 60 * 1000;
const THREE_MONTHS = 3 * ONE_MONTH;

export const mockCoupons = [
  {
    couponCode: "WELCOME50",
    description: "50% off on your first booking",
    discountType: "percentage",
    discountValue: 50,
    maxDiscount: 1000,
    minPurchase: 500,
    startDate: NOW,
    endDate: NOW + THREE_MONTHS,
    usageLimit: 1,
    isActive: true,
  },
  {
    couponCode: "FLAT200",
    description: "Flat ₹200 off on all bookings",
    discountType: "fixed",
    discountValue: 200,
    minPurchase: 1000,
    startDate: NOW,
    endDate: NOW + ONE_MONTH,
    usageLimit: null,
    isActive: true,
  },
  {
    couponCode: "SUMMER25",
    description: "25% off on summer events",
    discountType: "percentage",
    discountValue: 25,
    maxDiscount: 500,
    minPurchase: 0,
    startDate: NOW,
    endDate: NOW + THREE_MONTHS,
    usageLimit: 100,
    isActive: true,
  },
  {
    couponCode: "SPECIAL10",
    description: "10% off on all events",
    discountType: "percentage",
    discountValue: 10,
    maxDiscount: 200,
    minPurchase: 0,
    startDate: NOW,
    endDate: NOW + ONE_MONTH,
    usageLimit: null,
    isActive: true,
  },
  {
    couponCode: "EARLYBIRD",
    description: "15% off for early bookings",
    discountType: "percentage",
    discountValue: 15,
    maxDiscount: 300,
    minPurchase: 1000,
    startDate: NOW,
    endDate: NOW + ONE_MONTH,
    usageLimit: 50,
    isActive: true,
  },
] satisfies (typeof coupons.$inferInsert)[];
