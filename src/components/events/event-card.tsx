import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { EVENT_CATEGORIES, EVENT_STATUSES } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type EventCardProps = {
  event: {
    id: string;
    title: string;
    description: string;
    category: keyof typeof EVENT_CATEGORIES;
    status: keyof typeof EVENT_STATUSES;
    locationText: string;
    startsAt: Date;
    maxParticipants: number | null;
    organizer?: { displayName: string } | null;
    participants?: { id: string }[];
  };
};

export function EventCard({ event }: EventCardProps) {
  const count = event.participants?.length ?? 0;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-primary/10 text-primary">{EVENT_CATEGORIES[event.category]}</Badge>
          <Badge>{EVENT_STATUSES[event.status]}</Badge>
        </div>
        <h3 className="mt-3 text-xl font-bold">{event.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
        <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {formatDateTime(event.startsAt)}</span>
          <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {event.locationText}</span>
          <span className="flex items-center gap-2"><Users className="h-4 w-4" /> {count}{event.maxParticipants ? `/${event.maxParticipants}` : ""} volontera</span>
        </div>
        <Button className="mt-4" asChild><Link href={`/events/${event.id}`}>Otvori akciju</Link></Button>
      </CardContent>
    </Card>
  );
}
