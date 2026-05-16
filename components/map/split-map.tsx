"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { GeoJSONSource, Map } from "maplibre-gl";
import { REPORT_CATEGORIES, SPLIT_CENTER } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type MapNeighborhood = {
  id: string;
  name: string;
  slug: string;
  geojson: GeoJSON.Geometry;
  reportCount: number;
};

type MapReport = {
  id: string;
  title: string;
  category: keyof typeof REPORT_CATEGORIES;
  status: string;
  latitude: number;
  longitude: number;
  voteScore: number;
  minPeopleNeeded: number;
  neighborhoodName: string;
  imageUrl: string | null;
};

type MapPayload = {
  neighborhoods: MapNeighborhood[];
  reports: MapReport[];
};

const styleUrl = process.env.NEXT_PUBLIC_MAP_STYLE_URL ?? "https://demotiles.maplibre.org/style.json";

export function SplitMap({ onPickLocation }: { onPickLocation?: (lat: number, lng: number) => void }) {
  const mapRef = useRef<Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [data, setData] = useState<MapPayload | null>(null);
  const dataRef = useRef<MapPayload | null>(null);
  const [selected, setSelected] = useState<MapReport | null>(null);
  const [picked, setPicked] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    fetch("/api/map", { cache: "no-store" })
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  const neighborhoodFeatureCollection = useMemo(() => {
    if (!data) return null;
    return {
      type: "FeatureCollection" as const,
      features: data.neighborhoods.map((n) => ({
        type: "Feature" as const,
        properties: { id: n.id, name: n.name, reportCount: n.reportCount },
        geometry: n.geojson
      }))
    };
  }, [data]);

  const reportsFeatureCollection = useMemo(() => {
    if (!data) return null;
    return {
      type: "FeatureCollection" as const,
      features: data.reports.map((r) => ({
        type: "Feature" as const,
        properties: { id: r.id, title: r.title, voteScore: r.voteScore, category: r.category },
        geometry: { type: "Point" as const, coordinates: [r.longitude, r.latitude] }
      }))
    };
  }, [data]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleUrl,
      center: [SPLIT_CENTER.lng, SPLIT_CENTER.lat],
      zoom: 12.4,
      pitch: 0
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
    mapRef.current = map;

    map.on("click", (event) => {
      const features = map.queryRenderedFeatures(event.point, { layers: ["report-points"] });
      if (features.length > 0) {
        const reportId = features[0].properties?.id;
        const report = dataRef.current?.reports.find((item) => item.id === reportId);
        if (report) setSelected(report);
        return;
      }

      const next = { lat: Number(event.lngLat.lat.toFixed(7)), lng: Number(event.lngLat.lng.toFixed(7)) };
      setPicked(next);
      onPickLocation?.(next.lat, next.lng);
    });

    return () => map.remove();
  }, [data, onPickLocation]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !neighborhoodFeatureCollection || !reportsFeatureCollection) return;

    const setupLayers = () => {
      if (!map.getSource("neighborhoods")) {
        map.addSource("neighborhoods", { type: "geojson", data: neighborhoodFeatureCollection });
        map.addLayer({
          id: "neighborhood-fill",
          type: "fill",
          source: "neighborhoods",
          paint: {
            "fill-color": [
              "step",
              ["get", "reportCount"],
              "#d8ead7",
              2,
              "#9ed49b",
              4,
              "#4da96b",
              7,
              "#187047"
            ],
            "fill-opacity": 0.55
          }
        });
        map.addLayer({
          id: "neighborhood-outline",
          type: "line",
          source: "neighborhoods",
          paint: { "line-color": "#14532d", "line-width": 1.5, "line-opacity": 0.7 }
        });
        map.addLayer({
          id: "neighborhood-labels",
          type: "symbol",
          source: "neighborhoods",
          layout: {
            "text-field": ["concat", ["get", "name"], " · ", ["to-string", ["get", "reportCount"]]],
            "text-size": 12,
            "text-font": ["Noto Sans Regular"]
          },
          paint: { "text-color": "#0f3d2e", "text-halo-color": "#fff7e6", "text-halo-width": 1.5 }
        });
      } else {
        (map.getSource("neighborhoods") as GeoJSONSource).setData(neighborhoodFeatureCollection);
      }

      if (!map.getSource("reports")) {
        map.addSource("reports", { type: "geojson", data: reportsFeatureCollection });
        map.addLayer({
          id: "report-heat",
          type: "heatmap",
          source: "reports",
          maxzoom: 15,
          paint: {
            "heatmap-weight": ["interpolate", ["linear"], ["get", "voteScore"], -5, 0.1, 0, 0.4, 10, 1],
            "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 11, 0.5, 15, 1.6],
            "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 11, 18, 15, 34],
            "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 12, 0.35, 15, 0]
          }
        });
        map.addLayer({
          id: "report-points",
          type: "circle",
          source: "reports",
          minzoom: 11,
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["get", "voteScore"], -3, 5, 0, 7, 10, 12],
            "circle-color": "#f2b753",
            "circle-stroke-color": "#14532d",
            "circle-stroke-width": 2,
            "circle-opacity": 0.95
          }
        });
      } else {
        (map.getSource("reports") as GeoJSONSource).setData(reportsFeatureCollection);
      }
    };

    if (map.isStyleLoaded()) setupLayers();
    else map.once("load", setupLayers);
  }, [neighborhoodFeatureCollection, reportsFeatureCollection]);

  function useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((position) => {
      const next = {
        lat: Number(position.coords.latitude.toFixed(7)),
        lng: Number(position.coords.longitude.toFixed(7))
      };
      setPicked(next);
      onPickLocation?.(next.lat, next.lng);
      mapRef.current?.flyTo({ center: [next.lng, next.lat], zoom: 15 });
    });
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border bg-card shadow-sm">
      <div ref={containerRef} className="h-[520px] w-full md:h-[660px]" />

      <div className="absolute left-4 top-4 max-w-xs rounded-2xl border bg-background/90 p-3 shadow backdrop-blur">
        <div className="text-sm font-bold">Karta problema po kvartovima</div>
        <p className="mt-1 text-xs text-muted-foreground">Klikni marker za detalje ili klikni kartu da odabereš lokaciju nove prijave.</p>
        <Button onClick={useMyLocation} type="button" size="sm" variant="secondary" className="mt-3">Koristi moju lokaciju</Button>
        {picked && <p className="mt-2 text-xs">Odabrano: {picked.lat}, {picked.lng}</p>}
      </div>

      {selected && (
        <div className="absolute bottom-4 left-4 right-4 rounded-2xl border bg-background/95 p-4 shadow-xl backdrop-blur md:left-auto md:w-96">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Badge className="bg-secondary/30">{REPORT_CATEGORIES[selected.category]}</Badge>
              <h3 className="mt-2 text-lg font-bold">{selected.title}</h3>
              <p className="text-sm text-muted-foreground">{selected.neighborhoodName} · score {selected.voteScore}</p>
            </div>
            <button className="text-muted-foreground" onClick={() => setSelected(null)}>×</button>
          </div>
          <div className="mt-4 flex gap-2">
            <Button asChild><Link href={`/reports/${selected.id}`}>Otvori prijavu</Link></Button>
            <Button variant="outline" asChild><Link href={`/events/new?reportId=${selected.id}`}>Organiziraj akciju</Link></Button>
          </div>
        </div>
      )}
    </div>
  );
}
