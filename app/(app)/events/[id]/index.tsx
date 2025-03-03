import { useLocalSearchParams } from "expo-router";
import { useEventsStore } from "@/lib/state/useEventsStore";
import { useEffect } from "react";
import EventDetails from "@/app/components/EventDetail";

export default function EventDetail() {
  const { event } = useLocalSearchParams();
  const eventData = JSON.parse(event as string);
  const store = useEventsStore();
  useEffect(() => {
    store.addToRecentlyViewed(eventData.eventId);
  }, [eventData.eventId]);

  return <EventDetails event={eventData} />;
}
