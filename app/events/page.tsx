import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";
import { EventCard } from "@/components/events/event-card";
import { Button } from "@/components/ui/button";

export default async function EventsPage() {
  const rows = await db.query.events.findMany({
    with: { organizer: true, participants: true },
    orderBy: [asc(events.startsAt)]
  });

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">Akcije volontiranja</h1>
          <p className="text-muted-foreground">Zelene i kvartovske akcije koje građani mogu podržati dolaskom.</p>
        </div>
        <Button asChild><Link href="/events/new">Predloži akciju</Link></Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rows.map((event) => <EventCard key={event.id} event={event} />)}
      </div>
    </div>
  );
}
