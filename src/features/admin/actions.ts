"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { reports, users } from "@/db/schema";
import { getCurrentUser, requireAdmin } from "@/lib/auth";

const reportStatusSchema = z.enum([
  "open",
  "in_review",
  "accepted",
  "converted_to_event",
  "forwarded_to_city",
  "resolved",
  "rejected"
]);

export async function updateReportStatusAction(reportId: string, formData: FormData) {
  const user = await getCurrentUser();
  requireAdmin(user);

  const parsed = reportStatusSchema.safeParse(formData.get("status"));
  if (!parsed.success) return;

  await db.update(reports).set({ status: parsed.data, updatedAt: new Date() }).where(eq(reports.id, reportId));
  revalidatePath("/admin");
  revalidatePath("/map");
  revalidatePath(`/reports/${reportId}`);
}

export async function approveOrganizationAction(userId: string) {
  const user = await getCurrentUser();
  requireAdmin(user);

  await db.update(users).set({ organizationStatus: "approved", updatedAt: new Date() }).where(eq(users.id, userId));
  revalidatePath("/admin");
}

export async function rejectOrganizationAction(userId: string) {
  const user = await getCurrentUser();
  requireAdmin(user);

  await db.update(users).set({ organizationStatus: "rejected", updatedAt: new Date() }).where(eq(users.id, userId));
  revalidatePath("/admin");
}
