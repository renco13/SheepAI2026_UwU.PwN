import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { EventForm } from "@/components/events/event-form";
import { db } from "@/db";
import { reports } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export default async function NewEventPage({ searchParams }: { searchParams: { reportId?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const report = searchParams.reportId
    ? await db.query.reports.findFirst({ where: eq(reports.id, searchParams.reportId) })
    : null;

  return (
    <div className="mx-auto max-w-3xl pb-24">
      <EventForm report={report} />
    </div>
  );
}
