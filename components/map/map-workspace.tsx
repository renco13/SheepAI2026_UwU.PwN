"use client";

import { useState } from "react";
import { SplitMap } from "@/components/map/split-map";
import { ReportForm } from "@/components/reports/report-form";

type NeighborhoodOption = { id: string; name: string };

export function MapWorkspace({ neighborhoods }: { neighborhoods: NeighborhoodOption[] }) {
  const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number } | null>(null);

  return (
    <div className="space-y-4">
      <SplitMap onPickLocation={setPickedLocation} />
      <ReportForm neighborhoods={neighborhoods} pickedLocation={pickedLocation} />
    </div>
  );
}
