"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { z } from "zod";
import { db } from "@/db";
import { reportVotes, reports } from "@/db/schema";
import { getCurrentUser, requireUser } from "@/lib/auth";

const createReportSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(1500),
  category: z.enum(["trash", "green_area", "beach", "road_damage", "public_equipment", "other"]),
  neighborhoodId: z.string().uuid().optional().or(z.literal("")),
  locationDescription: z.string().max(180).optional(),
  latitude: z.coerce.number().min(43.45).max(43.57),
  longitude: z.coerce.number().min(16.35).max(16.55),
  minPeopleNeeded: z.coerce.number().int().min(1).max(200)
});

async function saveReportImage(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (!file.type.startsWith("image/")) return null;

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
  const fileName = `${crypto.randomUUID()}.${safeExt}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "reports");
  await mkdir(uploadDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, fileName), buffer);
  return `/uploads/reports/${fileName}`;
}

export async function createReportAction(formData: FormData) {
  const user = await getCurrentUser();
  requireUser(user);

  const parsed = createReportSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    neighborhoodId: formData.get("neighborhoodId"),
    locationDescription: formData.get("locationDescription"),
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
    minPeopleNeeded: formData.get("minPeopleNeeded")
  });

  if (!parsed.success) redirect("/map?error=report-invalid");

  const imageUrl = await saveReportImage(formData.get("image") as File | null);

  const inserted = await db
    .insert(reports)
    .values({
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      neighborhoodId: parsed.data.neighborhoodId || null,
      locationDescription: parsed.data.locationDescription,
      latitude: String(parsed.data.latitude),
      longitude: String(parsed.data.longitude),
      minPeopleNeeded: parsed.data.minPeopleNeeded,
      imageUrl,
      createdById: user.id
    })
    .returning({ id: reports.id });

  revalidatePath("/map");
  revalidatePath("/dashboard");
  redirect(`/reports/${inserted[0].id}`);
}

export async function voteReportAction(reportId: string, value: 1 | -1 | 0) {
  const user = await getCurrentUser();
  requireUser(user);

  const existing = await db.query.reportVotes.findFirst({
    where: and(eq(reportVotes.reportId, reportId), eq(reportVotes.userId, user.id))
  });

  if (value === 0) {
    if (existing) {
      await db.delete(reportVotes).where(eq(reportVotes.id, existing.id));
    }
  } else if (existing) {
    if (existing.value === value) {
      await db.delete(reportVotes).where(eq(reportVotes.id, existing.id));
    } else {
      await db.update(reportVotes).set({ value, updatedAt: new Date() }).where(eq(reportVotes.id, existing.id));
    }
  } else {
    await db.insert(reportVotes).values({ reportId, userId: user.id, value });
  }

  const votes = await db.query.reportVotes.findMany({ where: eq(reportVotes.reportId, reportId) });
  const score = votes.reduce((sum, vote) => sum + vote.value, 0);
  await db.update(reports).set({ voteScore: score, updatedAt: new Date() }).where(eq(reports.id, reportId));

  revalidatePath("/map");
  revalidatePath(`/reports/${reportId}`);
}
