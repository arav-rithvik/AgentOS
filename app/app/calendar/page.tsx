import { TODAY, seedObjects } from "@/components/data";
import { CalendarApp, type EventItem } from "@/components/apps/CalendarApp";

export const metadata = { title: "Calendar" };

export default function CalendarPage() {
  const seed: EventItem[] = seedObjects.flatMap((o) => (o.type === "event" ? [{ key: o.key, ...o.data }] : []));
  return <CalendarApp seed={seed} today={TODAY} />;
}
