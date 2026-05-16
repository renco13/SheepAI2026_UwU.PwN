"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { eventParticipants, events, reports } from "@/db/schema";
import { getCurrentUser, requireUser } from "@/lib/auth";

const eventSchema = z.object({
  reportId: z.string().uuid().optional().or(z.literal("")),
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(1500),
  category: z.enum(["trash", "green_area", "beach", "road_damage", "public_equipment", "other"]),
  locationText: z.string().min(3).max(180),
  latitude: z.coerce.number().min(43.45).max(43.57),
  longitude: z.coerce.number().min(16.35).max(16.55),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  maxParticipants: z.coerce.number().int().min(1).max(500).optional().or(z.literal(""))
});

export async function createEventAction(formData: FormData) {
  const user = await getCurrentUser();
  requireUser(user);

  const parsed = eventSchema.safeParse({
    reportId: formData.get("reportId"),
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    locationText: formData.get("locationText"),
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    maxParticipants: formData.get("maxParticipants")
  });

  if (!parsed.success) redirect("/events/new?error=invalid");

  const startsAt = new Date(parsed.data.startsAt);
  const endsAt = new Date(parsed.data.endsAt);
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || endsAt <= startsAt) {
    redirect("/events/new?error=date");
  }

  const inserted = await db
    .insert(events)
    .values({
      reportId: parsed.data.reportId || null,
      organizerId: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      locationText: parsed.data.locationText,
      latitude: String(parsed.data.latitude),
      longitude: String(parsed.data.longitude),
      startsAt,
      endsAt,
      maxParticipants: parsed.data.maxParticipants === "" ? null : parsed.data.maxParticipants
    })
    .returning({ id: events.id });

  if (parsed.data.reportId) {
    await db.update(reports).set({ status: "converted_to_event", updatedAt: new Date() }).where(eq(reports.id, parsed.data.reportId));
  }

  revalidatePath("/events");
  revalidatePath("/map");
  redirect(`/events/${inserted[0].id}`);
}

export async function volunteerAction(eventId: string) {
  const user = await getCurrentUser();
  requireUser(user);

  const existing = await db.query.eventParticipants.findFirst({
    where: and(eq(eventParticipants.eventId, eventId), eq(eventParticipants.userId, user.id))
  });

  if (existing) {
    const nextStatus = existing.status === "joined" ? "cancelled" : "joined";
    await db.update(eventParticipants).set({ status: nextStatus, updatedAt: new Date() }).where(eq(eventParticipants.id, existing.id));
  } else {
    await db.insert(eventParticipants).values({ eventId, userId: user.id, status: "joined" });
  }

  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/dashboard");
}

export async function rescheduleEventAction(eventId: string, formData: FormData) {
  const user = await getCurrentUser();
  requireUser(user);

  const event = await db.query.events.findFirst({ where: eq(events.id, eventId) });
  if (!event || (event.organizerId !== user.id && user.role !== "admin")) {
    throw new Error("Nemaš pravo mijenjati ovu akciju.");
  }

  const startsAt = new Date(String(formData.get("startsAt") ?? ""));
  const endsAt = new Date(String(formData.get("endsAt") ?? ""));
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || endsAt <= startsAt) {
    redirect(`/events/${eventId}?error=date`);
  }

  await db.update(events).set({ startsAt, endsAt, status: "rescheduled", updatedAt: new Date() }).where(eq(events.id, eventId));
  revalidatePath(`/events/${eventId}`);
}
