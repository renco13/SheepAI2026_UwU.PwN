import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { volunteerAction, rescheduleEventAction } from "@/features/events/actions";
import { db } from "@/db";
import { eventParticipants, events } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { EVENT_CATEGORIES, EVENT_STATUSES } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const event = await db.query.events.findFirst({
    where: eq(events.id, params.id),
    with: { organizer: true, participants: true, report: true }
  });

  if (!event) notFound();

  const participation = user
    ? await db.query.eventParticipants.findFirst({ where: and(eq(eventParticipants.eventId, event.id), eq(eventParticipants.userId, user.id)) })
    : null;

  const activeCount = event.participants.filter((item) => item.status === "joined").length;
  const canManage = user && (user.id === event.organizerId || user.role === "admin");
  const reschedule = rescheduleEventAction.bind(null, event.id);
  const volunteer = volunteerAction.bind(null, event.id);

  return (
    <div className="grid gap-6 pb-24 lg:grid-cols-[1fr_360px]">
      <section className="rounded-3xl border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-primary/10 text-primary">{EVENT_CATEGORIES[event.category]}</Badge>
          <Badge>{EVENT_STATUSES[event.status]}</Badge>
        </div>
        <h1 className="mt-4 text-3xl font-black">{event.title}</h1>
        <p className="mt-2 text-muted-foreground">Organizator: {event.organizer.displayName}</p>
        <p className="mt-6 whitespace-pre-wrap text-lg leading-relaxed">{event.description}</p>
      </section>

      <aside className="space-y-4">
        <Card>
          <CardContent className="space-y-3 p-5">
            <h2 className="text-xl font-black">Detalji akcije</h2>
            <p><strong>Početak:</strong> {formatDateTime(event.startsAt)}</p>
            <p><strong>Kraj:</strong> {formatDateTime(event.endsAt)}</p>
            <p><strong>Lokacija:</strong> {event.locationText}</p>
            <p><strong>Volontera:</strong> {activeCount}{event.maxParticipants ? `/${event.maxParticipants}` : ""}</p>
            {user ? (
              <form action={volunteer}>
                <Button type="submit" className="w-full" variant={participation?.status === "joined" ? "outline" : "default"}>
                  {participation?.status === "joined" ? "Odustani od volontiranja" : "Volontiraj"}
                </Button>
              </form>
            ) : <p className="text-sm text-muted-foreground">Prijavi se kako bi volontirao.</p>}
          </CardContent>
        </Card>

        {canManage && (
          <Card>
            <CardContent className="p-5">
              <h2 className="text-xl font-black">Promijeni termin</h2>
              <form action={reschedule} className="mt-4 space-y-3">
                <div className="space-y-2"><Label htmlFor="startsAt">Novi početak</Label><Input id="startsAt" name="startsAt" type="datetime-local" required /></div>
                <div className="space-y-2"><Label htmlFor="endsAt">Novi kraj</Label><Input id="endsAt" name="endsAt" type="datetime-local" required /></div>
                <Button type="submit" variant="secondary" className="w-full">Spremi novi termin</Button>
              </form>
            </CardContent>
          </Card>
        )}
      </aside>
    </div>
  );
}
