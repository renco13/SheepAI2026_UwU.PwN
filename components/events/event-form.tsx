import { createEventAction } from "@/features/events/actions";
import { EVENT_CATEGORIES, SPLIT_CENTER } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type EventFormProps = {
  report?: {
    id: string;
    title: string;
    description: string;
    category: keyof typeof EVENT_CATEGORIES;
    latitude: string;
    longitude: string;
    locationDescription: string | null;
  } | null;
};

export function EventForm({ report }: EventFormProps) {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  tomorrow.setHours(10, 0, 0, 0);
  const end = new Date(tomorrow);
  end.setHours(13, 0, 0, 0);

  const toLocalInput = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  return (
    <form action={createEventAction} className="space-y-4 rounded-3xl border bg-card p-5 shadow-sm">
      <input type="hidden" name="reportId" value={report?.id ?? ""} />
      <div>
        <h1 className="text-2xl font-black">{report ? "Organiziraj akciju iz prijave" : "Nova akcija"}</h1>
        <p className="text-sm text-muted-foreground">Akcija može biti povezana s prijavom ili potpuno samostalna.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Naslov</Label>
        <Input id="title" name="title" required defaultValue={report ? `Akcija: ${report.title}` : ""} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Opis</Label>
        <Textarea id="description" name="description" required defaultValue={report?.description ?? ""} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Kategorija</Label>
          <Select id="category" name="category" defaultValue={report?.category ?? "green_area"}>
            {Object.entries(EVENT_CATEGORIES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="locationText">Lokacija</Label>
          <Input id="locationText" name="locationText" required defaultValue={report?.locationDescription ?? "Split"} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startsAt">Početak</Label>
          <Input id="startsAt" name="startsAt" type="datetime-local" required defaultValue={toLocalInput(tomorrow)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endsAt">Kraj</Label>
          <Input id="endsAt" name="endsAt" type="datetime-local" required defaultValue={toLocalInput(end)} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input id="latitude" name="latitude" required defaultValue={report?.latitude ?? SPLIT_CENTER.lat} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input id="longitude" name="longitude" required defaultValue={report?.longitude ?? SPLIT_CENTER.lng} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxParticipants">Max volontera</Label>
          <Input id="maxParticipants" name="maxParticipants" type="number" min="1" placeholder="Bez limita" />
        </div>
      </div>

      <Button type="submit" className="w-full">Objavi akciju</Button>
    </form>
  );
}
