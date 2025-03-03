import {
  LucideIcon,
  Utensils,
  Wine,
  Bus,
  Hotel,
  Car,
} from "lucide-react-native";
import { InclusionType } from "@/types/events";

export const inclusionIconMap: Record<InclusionType, LucideIcon> = {
  food: Utensils,
  drink: Wine,
  transportation: Bus,
  accommodation: Hotel,
  parking: Car,
} as const;
