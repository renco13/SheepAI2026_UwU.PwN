"use client";

import { useEffect, useState } from "react";
import { createReportAction } from "@/features/reports/actions";
import { REPORT_CATEGORIES, SPLIT_CENTER } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type NeighborhoodOption = { id: string; name: string };

export function ReportForm({ neighborhoods, pickedLocation }: { neighborhoods: NeighborhoodOption[]; pickedLocation?: { lat: number; lng: number } | null }) {
  const [lat, setLat] = useState(SPLIT_CENTER.lat);
  const [lng, setLng] = useState(SPLIT_CENTER.lng);

  useEffect(() => {
    if (pickedLocation) {
      setLat(pickedLocation.lat);
      setLng(pickedLocation.lng);
    }
  }, [pickedLocation]);

  function useLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((position) => {
      setLat(Number(position.coords.latitude.toFixed(7)));
      setLng(Number(position.coords.longitude.toFixed(7)));
    });
  }

  return (
    <form action={createReportAction} className="space-y-4 rounded-3xl border bg-card p-5 shadow-sm">
      <div>
        <h2 className="text-xl font-bold">Prijavi problem</h2>
        <p className="text-sm text-muted-foreground">Za demo možeš ručno upisati koordinate ili koristiti gumb lokacije.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Naslov</Label>
        <Input id="title" name="title" required placeholder="Npr. Divlji deponij kraj škole" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Opis</Label>
        <Textarea id="description" name="description" required placeholder="Što se događa, koliko je hitno i što bi trebalo napraviti?" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Kategorija</Label>
          <Select id="category" name="category" defaultValue="trash">
            {Object.entries(REPORT_CATEGORIES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="neighborhoodId">Kvart</Label>
          <Select id="neighborhoodId" name="neighborhoodId">
            <option value="">Nije odabrano</option>
            {neighborhoods.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="locationDescription">Opis lokacije</Label>
        <Input id="locationDescription" name="locationDescription" placeholder="Npr. pokraj ulaza, uz sjeverni zid, blizu autobusne stanice" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input id="latitude" name="latitude" value={lat} onChange={(e) => setLat(Number(e.target.value))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input id="longitude" name="longitude" value={lng} onChange={(e) => setLng(Number(e.target.value))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minPeopleNeeded">Minimalno ljudi</Label>
          <Input id="minPeopleNeeded" name="minPeopleNeeded" type="number" min="1" max="200" defaultValue="5" />
        </div>
      </div>

      <Button type="button" variant="outline" onClick={useLocation}>Koristi moju lokaciju</Button>

      <div className="space-y-2">
        <Label htmlFor="image">Slika</Label>
        <Input id="image" name="image" type="file" accept="image/*" />
      </div>

      <Button type="submit" className="w-full">Objavi prijavu</Button>
    </form>
  );
}
