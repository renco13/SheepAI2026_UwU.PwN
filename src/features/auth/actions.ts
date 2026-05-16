"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const registerSchema = z.object({
  displayName: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8),
  accountType: z.enum(["citizen", "organization"]),
  organizationOib: z.string().optional()
});

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? "").toLowerCase().trim(),
    password: String(formData.get("password") ?? "")
  });

  if (!parsed.success) redirect("/login?error=invalid");

  const user = await db.query.users.findFirst({ where: eq(users.email, parsed.data.email) });
  if (!user) redirect("/login?error=invalid");

  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) redirect("/login?error=invalid");

  await createSession(user.id);
  redirect("/dashboard");
}

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse({
    displayName: String(formData.get("displayName") ?? "").trim(),
    email: String(formData.get("email") ?? "").toLowerCase().trim(),
    password: String(formData.get("password") ?? ""),
    accountType: String(formData.get("accountType") ?? "citizen"),
    organizationOib: String(formData.get("organizationOib") ?? "").trim() || undefined
  });

  if (!parsed.success) redirect("/register?error=invalid");

  if (parsed.data.accountType === "organization") {
    const oib = parsed.data.organizationOib ?? "";
    if (!/^\d{11}$/.test(oib)) redirect("/register?error=oib");
  }

  const existing = await db.query.users.findFirst({ where: eq(users.email, parsed.data.email) });
  if (existing) redirect("/register?error=exists");

  const passwordHash = await hashPassword(parsed.data.password);
  const inserted = await db
    .insert(users)
    .values({
      displayName: parsed.data.displayName,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.accountType,
      organizationOib: parsed.data.accountType === "organization" ? parsed.data.organizationOib : null,
      organizationStatus: parsed.data.accountType === "organization" ? "pending" : null,
      emailVerified: true
    })
    .returning({ id: users.id });

  await createSession(inserted[0].id);
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}
